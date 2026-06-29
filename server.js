// ============================================================
//  משחק חברה - שרת רב-חברות (multi-tenant)
//  מאת: Amir Cohen
// ============================================================
const express = require('express');
const multer = require('multer');
const QRCode = require('qrcode');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3007;

const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// --- מנהל-על קבוע ---
const SUPER_USER = 'amirco';
const SUPER_PASS = 'Havefun360';

[DATA_DIR, UPLOADS_DIR].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

// ============================================================
//  גיבוי DB ל-GitHub
// ============================================================
const GH = {
  token: process.env.GH_TOKEN || '',
  owner: process.env.GH_OWNER || '',
  repo: process.env.GH_REPO || '',
  branch: process.env.GH_BRANCH || 'main',
  path: process.env.GH_PATH || 'db.json'
};
const GH_ENABLED = !!(GH.token && GH.owner && GH.repo);
let ghSha = null;

async function ghPull() {
  if (!GH_ENABLED) return null;
  const url = `https://api.github.com/repos/${GH.owner}/${GH.repo}/contents/${encodeURIComponent(GH.path)}?ref=${encodeURIComponent(GH.branch)}`;
  try {
    const r = await fetch(url, { headers: { 'Authorization': `Bearer ${GH.token}`, 'Accept': 'application/vnd.github+json', 'User-Agent': 'family-game' } });
    if (r.status === 404) { ghSha = null; return null; }
    if (!r.ok) { console.warn('ghPull failed:', r.status); return null; }
    const data = await r.json();
    ghSha = data.sha;
    return Buffer.from(data.content || '', 'base64').toString('utf8');
  } catch (e) { console.warn('ghPull error:', e.message); return null; }
}

async function ghPush(retry = true) {
  if (!GH_ENABLED) return;
  const url = `https://api.github.com/repos/${GH.owner}/${GH.repo}/contents/${encodeURIComponent(GH.path)}`;
  const body = {
    message: `update db.json ${new Date().toISOString()}`,
    content: Buffer.from(JSON.stringify(db, null, 2), 'utf8').toString('base64'),
    branch: GH.branch
  };
  if (ghSha) body.sha = ghSha;
  try {
    const r = await fetch(url, { method: 'PUT', headers: { 'Authorization': `Bearer ${GH.token}`, 'Accept': 'application/vnd.github+json', 'User-Agent': 'family-game', 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (r.status === 409 && retry) { await ghPull(); return ghPush(false); }
    if (!r.ok) { console.warn('ghPush failed:', r.status); return; }
    const data = await r.json();
    if (data.content && data.content.sha) ghSha = data.content.sha;
  } catch (e) { console.warn('ghPush error:', e.message); }
}

// ============================================================
//  מודל נתונים רב-חברות
// ============================================================
function makeId(prefix) { return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

function defaultStations() {
  const stations = [];
  for (let i = 1; i <= 10; i++) {
    stations.push({ id: i, title: `תחנה ${i}`, questionType: 'text', questionText: '', imageUrl: '', correctAnswer: '', points: 10 });
  }
  return stations;
}

// קונפיגורציית מפה ברירת מחדל (לא נעולה, אין מיקומים)
function defaultMapConfig() {
  return {
    locked: false,
    center: { lat: 31.8133, lng: 34.7780 }, // גדרה כברירת מחדל
    zoom: 16,
    bounds: null,    // {north,south,east,west} — האזור הגיאוגרפי המדויק שהמנהל מסגר (להדפסה/תצוגה עקבית)
    markerSize: 30,  // קוטר עיגול התחנה בפיקסלים (16-64)
    viewWidth: 0,    // רוחב חלון המפה בעורך בעת השמירה (פיקסלים) — לכיול זום עקבי בהדפסה/מסך
    markers: []  // [{id:1..10, lat, lng}]
  };
}

// חברה חדשה
function newCompany(name, password) {
  return {
    id: makeId('co'),
    name: name || 'חברה חדשה',
    password: password || '',
    enabled: true,
    gameName: name || 'משחק חברה',
    defaultLang: 'he',   // שפת ברירת-מחדל לממשק השחקנים (he|en|it)
    stations: defaultStations(),
    players: {},        // playerId -> {id, name, team, joinedAt, answers:{}}
    submissions: [],
    speedBonus: { enabled: true, maxBonus: 10, windowSec: 60 },
    mapConfig: defaultMapConfig(),
    createdAt: Date.now()
  };
}

function defaultDB() {
  return { companies: {}, library: [] };  // companies: companyId->company · library: [{id, name, lang, style, ageRange, stations[], mapConfig, uses, createdAt, updatedAt}]
}

let db;
async function loadDB() {
  let loaded = false;
  const remote = await ghPull();
  if (remote) {
    try { db = JSON.parse(remote); if (db.companies) { loaded = true; try { fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2)); } catch(e){} console.log('📥 DB נטען מ-GitHub'); } }
    catch (e) { console.warn('GitHub DB parse failed'); }
  }
  if (!loaded) {
    try { db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); } catch (e) { db = defaultDB(); }
  }
  // הגירה מ-DB ישן (חברה אחת) -> חברה ראשונה
  if (!db.companies) {
    if (db.stations) {
      const c = newCompany(db.gameName || 'החברה שלי', 'changeme');
      c.stations = db.stations; c.players = db.players || {}; c.submissions = db.submissions || [];
      if (db.speedBonus) c.speedBonus = db.speedBonus;
      db = defaultDB();
      db.companies[c.id] = c;
      console.log('🔄 הוגרה חברה אחת קיימת למבנה רב-חברות');
    } else {
      db = defaultDB();
    }
  }
  // backfill
  if (!Array.isArray(db.library)) db.library = [];
  Object.values(db.companies).forEach(c => {
    if (c.enabled === undefined) c.enabled = true;
    if (!c.speedBonus) c.speedBonus = { enabled: true, maxBonus: 10, windowSec: 60 };
    if (!c.players) c.players = {};
    if (!c.submissions) c.submissions = [];
    if (!c.mapConfig) c.mapConfig = defaultMapConfig();
    if (!Array.isArray(c.mapConfig.markers)) c.mapConfig.markers = [];
    if (!isFinite(c.mapConfig.markerSize)) c.mapConfig.markerSize = 30;
    if (!['he', 'en', 'it'].includes(c.defaultLang)) c.defaultLang = 'he';
    // מעקב פופולריות חבילות: איזו חבילה נטענה לאחרונה והאם כבר נספרה כ"שוחקה"
    if (c.loadedPackId === undefined) c.loadedPackId = null;
    if (c.loadedPackCounted === undefined) c.loadedPackCounted = false;
  });
}

let saveTimer = null, ghPushTimer = null;
function saveDB() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => { try { fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2)); } catch(e){} }, 200);
  if (GH_ENABLED) { clearTimeout(ghPushTimer); ghPushTimer = setTimeout(() => ghPush(), 4000); }
}

function getCompany(id) { return db.companies[id] || null; }

// נרמול 10 תחנות מתוך נתונים גולמיים (משלים חסרות, מתעלם מעודפות)
function normalizeStations(rawStations) {
  const incoming = {};
  (rawStations || []).forEach(s => { const id = Number(s.id); if (id >= 1 && id <= 10) incoming[id] = s; });
  const out = [];
  for (let i = 1; i <= 10; i++) {
    const s = incoming[i] || {};
    out.push({
      id: i,
      title: (s.title != null ? String(s.title) : `תחנה ${i}`).slice(0, 200),
      questionType: (s.questionType === 'photo') ? 'photo' : 'text',
      questionText: (s.questionText != null ? String(s.questionText) : '').slice(0, 2000),
      correctAnswer: (s.correctAnswer != null ? String(s.correctAnswer) : '').slice(0, 500),
      points: Math.max(0, Number(s.points) || 10),
      imageUrl: (typeof s.imageUrl === 'string' ? s.imageUrl : '').slice(0, 3000000)
    });
  }
  return out;
}

// נרמול mapConfig מתוך נתונים גולמיים (מחזיר null אם לא תקין)
function normalizeMapConfig(m) {
  if (!m || typeof m !== 'object') return null;
  const cfg = defaultMapConfig();
  if (m.center && isFinite(m.center.lat) && isFinite(m.center.lng)) cfg.center = { lat: Number(m.center.lat), lng: Number(m.center.lng) };
  if (isFinite(m.zoom)) cfg.zoom = Math.min(21, Math.max(1, Number(m.zoom)));
  if (isFinite(m.markerSize)) cfg.markerSize = Math.min(64, Math.max(16, Math.round(Number(m.markerSize))));
  if (isFinite(m.viewWidth)) cfg.viewWidth = Math.max(0, Math.round(Number(m.viewWidth)));
  if (m.bounds && isFinite(m.bounds.north) && isFinite(m.bounds.south) && isFinite(m.bounds.east) && isFinite(m.bounds.west)) cfg.bounds = { north: Number(m.bounds.north), south: Number(m.bounds.south), east: Number(m.bounds.east), west: Number(m.bounds.west) };
  cfg.locked = !!m.locked;
  if (Array.isArray(m.markers)) cfg.markers = m.markers.filter(x => x && isFinite(x.lat) && isFinite(x.lng) && Number(x.id) >= 1 && Number(x.id) <= 10).map(x => ({ id: Number(x.id), lat: Number(x.lat), lng: Number(x.lng) })).slice(0, 10);
  return cfg;
}

// מעקב פופולריות: סופר שימוש בחבילה רק אם ≥5 שחקנים שונים כבר ענו בחברה שטענה אותה
const PACK_USE_THRESHOLD = 5;
function maybeCountPackUse(c) {
  if (!c || !c.loadedPackId || c.loadedPackCounted) return;
  const distinctAnswered = Object.values(c.players || {}).filter(p => p.answers && Object.keys(p.answers).length > 0).length;
  if (distinctAnswered >= PACK_USE_THRESHOLD) {
    const pack = (db.library || []).find(p => p.id === c.loadedPackId);
    if (pack) pack.uses = (pack.uses || 0) + 1;
    c.loadedPackCounted = true;   // נספר פעם אחת בלבד לכל טעינה
    saveDB();
  }
}

// ============================================================
//  multer
// ============================================================
const storage = multer.diskStorage({
  destination: (req, f, cb) => cb(null, UPLOADS_DIR),
  filename: (req, f, cb) => cb(null, Date.now() + '_' + Math.random().toString(36).slice(2, 8) + (path.extname(f.originalname) || '.jpg'))
});
const upload = multer({ storage, limits: { fileSize: 12 * 1024 * 1024 } });
const memUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 12 * 1024 * 1024 } });

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(UPLOADS_DIR));
app.get('/i18n.js', (req, res) => res.sendFile(path.join(__dirname, 'i18n.js')));

// פוסטר ומסגרת-מפה לפי שפה: poster-en.png / map-frame-it.png וכו'.
// אם קובץ שפה חסר — נופלים לגרסה העברית (poster.png / map-frame.png).
function langAsset(res, base, lang) {
  const allowed = ['he', 'en', 'it'].includes(lang) ? lang : 'he';
  const heFile = path.join(__dirname, base + '.png');
  if (allowed === 'he') return res.sendFile(heFile);
  const langFile = path.join(__dirname, base + '-' + allowed + '.png');
  fs.access(langFile, fs.constants.R_OK, err => res.sendFile(err ? heFile : langFile));
}
app.get('/poster.png', (req, res) => langAsset(res, 'poster', req.query.lang));
app.get('/map-frame.png', (req, res) => langAsset(res, 'map-frame', req.query.lang));
app.get('/leaflet.js', (req, res) => res.sendFile(path.join(__dirname, 'leaflet.js')));
app.get('/leaflet.css', (req, res) => res.sendFile(path.join(__dirname, 'leaflet.css')));

// ============================================================
//  SSE - לוח תוצאות חי, פר-חברה
// ============================================================
let sseClients = []; // {res, companyId}
function broadcast(companyId) {
  const payload = `data: ${JSON.stringify(buildLeaderboard(companyId))}\n\n`;
  sseClients.filter(c => c.companyId === companyId).forEach(c => { try { c.res.write(payload); } catch(e){} });
}
// שידור אירוע בעל-שם (למשל הודעת "קבוצה אחרת ענתה נכון")
function broadcastEvent(companyId, eventName, data) {
  const payload = `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.filter(c => c.companyId === companyId).forEach(c => { try { c.res.write(payload); } catch(e){} });
}
app.get('/api/stream', (req, res) => {
  const companyId = req.query.company;
  if (!getCompany(companyId)) { res.status(404).end(); return; }
  res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive', 'X-Accel-Buffering': 'no' });
  res.write(`data: ${JSON.stringify(buildLeaderboard(companyId))}\n\n`);
  const client = { res, companyId };
  sseClients.push(client);
  const ping = setInterval(() => { try { res.write(': ping\n\n'); } catch(e){} }, 25000);
  req.on('close', () => { clearInterval(ping); sseClients = sseClients.filter(c => c !== client); });
});

// ============================================================
//  ניקוד
// ============================================================
function checkAnswer(station, answerText) {
  if (station.questionType === 'photo') return null;
  if (!station.correctAnswer) return null;
  const keys = station.correctAnswer.split(',').map(s => normalize(s)).filter(Boolean);
  const ans = normalize(answerText);
  return keys.some(k => ans.includes(k) || k.includes(ans));
}
function normalize(s) { return (s || '').toString().trim().toLowerCase().replace(/[\s.,!?'"״׳-]/g, ''); }
function speedBonus(company, timeMs) {
  const cfg = company.speedBonus || {};
  if (!cfg.enabled) return 0;
  const sec = (timeMs || 0) / 1000;
  if (sec >= cfg.windowSec) return 0;
  return Math.round(cfg.maxBonus * (1 - sec / cfg.windowSec));
}

function buildLeaderboard(companyId) {
  const company = getCompany(companyId);
  if (!company) return { gameName: '', players: [], awards: {}, stationSpeed: {}, stationCount: 0, teams: [] };
  const stationCount = company.stations.length;
  const players = Object.values(company.players).map(p => {
    const answers = Object.values(p.answers || {});
    const correct = answers.filter(a => a.correct === true).length;
    const pending = answers.filter(a => a.correct === null).length;
    const totalTime = answers.reduce((s, a) => s + (a.timeMs || 0), 0);
    const basePoints = answers.reduce((s, a) => s + (a.correct ? (a.basePoints || 0) : 0), 0);
    const bonusPoints = answers.reduce((s, a) => s + (a.correct ? (a.bonus || 0) : 0), 0);
    const points = basePoints + bonusPoints;
    const avgTime = answers.length ? Math.round(totalTime / answers.length / 1000) : 0;
    return { id: p.id, name: p.name, team: p.team, floor: correct, correct, pending, answered: answers.length, points, basePoints, bonusPoints, totalTimeSec: Math.round(totalTime / 1000), avgTimeSec: avgTime, stationCount };
  });
  players.sort((a, b) => b.points - a.points || a.totalTimeSec - b.totalTimeSec);
  const awards = {};
  if (players.length) {
    const fastest = [...players].filter(p => p.answered > 0).sort((a, b) => a.avgTimeSec - b.avgTimeSec)[0];
    if (fastest) awards.fastest = fastest.name;
    const mostCorrect = [...players].sort((a, b) => b.correct - a.correct)[0];
    if (mostCorrect && mostCorrect.correct > 0) awards.mostCorrect = mostCorrect.name;
  }
  const stationSpeed = {};
  company.stations.forEach(st => {
    let best = null;
    Object.values(company.players).forEach(p => {
      const a = (p.answers || {})[st.id];
      if (a && a.correct === true) { if (!best || a.timeMs < best.timeMs) best = { name: p.name, timeMs: a.timeMs }; }
    });
    if (best) stationSpeed[st.id] = best;
  });
  return { gameName: company.gameName, companyName: company.name, defaultLang: company.defaultLang || 'he', players, awards, stationSpeed, stationCount, teams: groupByTeam(players) };
}
function groupByTeam(players) {
  const map = {};
  players.forEach(p => {
    const t = p.team || 'ללא קבוצה';
    if (!map[t]) map[t] = { team: t, points: 0, correct: 0, members: 0 };
    map[t].points += p.points; map[t].correct += p.correct; map[t].members++;
  });
  return Object.values(map).sort((a, b) => b.points - a.points);
}

// ============================================================
//  API למתחרים (כל הבקשות נושאות companyId)
// ============================================================
// פרטי חברה בסיסיים (לעמוד הראשי של חברה)
app.get('/api/company/:cid', (req, res) => {
  const c = getCompany(req.params.cid);
  if (!c) return res.status(404).json({ error: 'חברה לא קיימת' });
  if (!c.enabled) return res.status(403).json({ error: 'החברה מושבתת כרגע' });
  res.json({ id: c.id, name: c.name, gameName: c.gameName, defaultLang: c.defaultLang || 'he', stationCount: c.stations.length });
});

// קבוצות פעילות בחברה מסוימת
app.get('/api/company/:cid/teams', (req, res) => {
  const c = getCompany(req.params.cid);
  if (!c) return res.status(404).json({ error: 'חברה לא קיימת' });
  const teams = [...new Set(Object.values(c.players).map(p => (p.team || '').trim()).filter(Boolean))].sort();
  res.json({ teams });
});

// הצטרפות שחקן לחברה
app.post('/api/company/:cid/join', (req, res) => {
  const c = getCompany(req.params.cid);
  if (!c) return res.status(404).json({ error: 'חברה לא קיימת' });
  if (!c.enabled) return res.status(403).json({ error: 'החברה מושבתת כרגע' });
  const name = (req.body.name || '').toString().trim();
  const team = (req.body.team || '').toString().trim();
  const resume = req.body.resume === true || req.body.resume === 'true';
  if (!name) return res.status(400).json({ error: 'נדרש שם' });

  // חיפוש שחקן קיים עם אותו שם + קבוצה (ללא תלות באותיות/רווחים)
  const norm = s => (s || '').toString().trim().toLowerCase();
  const existing = Object.values(c.players).find(p => norm(p.name) === norm(name) && norm(p.team) === norm(team));

  if (existing && !resume) {
    // שחקן כבר קיים — לא יוצרים כפילות. מחזירים 409 כדי שהלקוח יציע "המשך משחק".
    return res.status(409).json({
      error: 'שחקן עם שם וקבוצה זהים כבר רשום',
      existingPlayerId: existing.id,
      name: existing.name, team: existing.team, companyId: c.id, companyName: c.name
    });
  }
  if (existing && resume) {
    // המשך משחק עם השחקן הקיים — בלי כפילות
    return res.json({ playerId: existing.id, name: existing.name, team: existing.team, companyId: c.id, companyName: c.name, resumed: true });
  }

  const id = makeId('p');
  c.players[id] = { id, name, team, joinedAt: Date.now(), answers: {} };
  saveDB(); broadcast(c.id);
  res.json({ playerId: id, name, team, companyId: c.id, companyName: c.name });
});

// פרטי תחנה
app.get('/api/company/:cid/station/:id', (req, res) => {
  const c = getCompany(req.params.cid);
  if (!c) return res.status(404).json({ error: 'חברה לא קיימת' });
  if (!c.enabled) return res.status(403).json({ error: 'החברה מושבתת כרגע' });
  const st = c.stations.find(s => s.id == req.params.id);
  if (!st) return res.status(404).json({ error: 'תחנה לא קיימת' });
  const pid = req.query.player;
  const player = pid ? c.players[pid] : null;
  const already = player && player.answers[st.id] ? player.answers[st.id] : null;
  res.json({ id: st.id, title: st.title, questionType: st.questionType, questionText: st.questionText, imageUrl: st.imageUrl, points: st.points, gameName: c.gameName, companyName: c.name, defaultLang: c.defaultLang || 'he', alreadyAnswered: !!already, previousResult: already ? { correct: already.correct, pending: already.correct === null } : null });
});

// הגשת תשובה
app.post('/api/company/:cid/answer', upload.single('photo'), (req, res) => {
  const c = getCompany(req.params.cid);
  if (!c) return res.status(404).json({ error: 'חברה לא קיימת' });
  const { playerId, stationId, answerText, startedAt } = req.body;
  const player = c.players[playerId];
  const station = c.stations.find(s => s.id == stationId);
  if (!player || !station) return res.status(400).json({ error: 'נתונים לא תקינים' });
  const timeMs = startedAt ? Math.max(0, Date.now() - Number(startedAt)) : 0;
  let correct = null, photoUrl = '';
  if (req.file) photoUrl = '/uploads/' + req.file.filename;
  if (station.questionType === 'text') correct = checkAnswer(station, answerText);
  const bonus = correct === true ? speedBonus(c, timeMs) : 0;
  player.answers[station.id] = { stationId: station.id, answerText: answerText || '', photoUrl, correct, basePoints: correct ? station.points : 0, bonus, points: correct ? (station.points + bonus) : 0, timeMs, at: Date.now() };
  c.submissions.push({ playerId, name: player.name, team: player.team, ...player.answers[station.id] });
  maybeCountPackUse(c);
  saveDB(); broadcast(c.id);
  if (correct === true) broadcastEvent(c.id, 'scored', { team: player.team || '', name: player.name, stationId: station.id });
  res.json({ correct, pending: correct === null, points: correct ? station.points : 0, bonus, message: correct === true ? (bonus > 0 ? `תשובה נכונה! +${station.points} נק' ועוד ${bonus} בונוס מהירות! ⚡🎉` : 'תשובה נכונה! 🎉') : correct === false ? 'לא מדויק, אבל ממשיכים! 💪' : 'התקבל! המנהל יבדוק 📸' });
});

// לוח תוצאות (פולינג גיבוי)
app.get('/api/company/:cid/leaderboard', (req, res) => {
  const c = getCompany(req.params.cid);
  if (!c) return res.status(404).json({ error: 'חברה לא קיימת' });
  res.json(buildLeaderboard(c.id));
});

// התקדמות אישית של שחקן - אילו תחנות סרק ומה התוצאה
app.get('/api/company/:cid/progress', (req, res) => {
  const c = getCompany(req.params.cid);
  if (!c) return res.status(404).json({ error: 'חברה לא קיימת' });
  const player = c.players[req.query.player];
  const stations = c.stations.map(st => {
    const a = player ? (player.answers || {})[st.id] : null;
    let status = 'none';
    if (a) {
      if (a.correct === true) status = 'correct';
      else if (a.correct === false) status = 'wrong';
      else status = 'pending';
    }
    return { id: st.id, status };
  });
  res.json({ stationCount: c.stations.length, stations, defaultLang: c.defaultLang || 'he', name: player ? player.name : '', team: player ? player.team : '' });
});

// מפת התחנות לשחקן - קונפיג + סטטוס צבע לכל תחנה
app.get('/api/company/:cid/map', (req, res) => {
  const c = getCompany(req.params.cid);
  if (!c) return res.status(404).json({ error: 'חברה לא קיימת' });
  if (!c.enabled) return res.status(403).json({ error: 'החברה מושבתת כרגע' });
  const cfg = c.mapConfig || defaultMapConfig();
  const player = c.players[req.query.player];
  const statusById = {};
  c.stations.forEach(st => {
    const a = player ? (player.answers || {})[st.id] : null;
    let status = 'none';
    if (a) {
      if (a.correct === true) status = 'correct';
      else if (a.correct === false) status = 'wrong';
      else status = 'pending';
    }
    statusById[st.id] = { status, title: st.title };
  });
  res.json({
    gameName: c.gameName, companyName: c.name, defaultLang: c.defaultLang || 'he',
    mapConfig: { center: cfg.center, zoom: cfg.zoom, viewWidth: cfg.viewWidth || 0, bounds: cfg.bounds || null, locked: cfg.locked, markerSize: cfg.markerSize || 30, markers: cfg.markers || [] },
    stations: statusById,
    name: player ? player.name : '', team: player ? player.team : ''
  });
});


// ============================================================
//  אימות - מנהל-על + מנהלי חברות
// ============================================================
const sessions = {}; // token -> { role:'super'|'company', companyId? }
function makeToken() { return 't_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 12); }

// התחברות: מנהל-על (amirco) או מנהל חברה (סיסמת חברה)
app.post('/api/admin/login', (req, res) => {
  const user = (req.body.user || '').trim();
  const pass = (req.body.pass || '').trim();
  // מנהל-על
  if (user === SUPER_USER && pass === SUPER_PASS) {
    const token = makeToken(); sessions[token] = { role: 'super' };
    return res.json({ token, role: 'super' });
  }
  // מנהל חברה: השדה user = שם החברה, pass = סיסמת החברה
  const company = Object.values(db.companies).find(c => c.name === user && c.password === pass);
  if (company) {
    const token = makeToken(); sessions[token] = { role: 'company', companyId: company.id };
    return res.json({ token, role: 'company', companyId: company.id, companyName: company.name });
  }
  res.status(401).json({ error: 'שם או סיסמה שגויים' });
});

app.get('/api/admin/me', (req, res) => {
  const s = sessions[req.headers['x-admin-token']];
  if (!s) return res.status(401).json({ error: 'לא מחובר' });
  if (s.role === 'company') {
    const c = getCompany(s.companyId);
    return res.json({ role: 'company', companyId: s.companyId, companyName: c ? c.name : '' });
  }
  res.json({ role: 'super' });
});

app.post('/api/admin/logout', (req, res) => { delete sessions[req.headers['x-admin-token']]; res.json({ ok: true }); });

function auth(req, res, next) {
  const s = sessions[req.headers['x-admin-token']];
  if (!s) return res.status(401).json({ error: 'לא מחובר' });
  req.session = s;
  next();
}
function superOnly(req, res, next) {
  if (req.session.role !== 'super') return res.status(403).json({ error: 'גישה למנהל-על בלבד' });
  next();
}
// מאתר את החברה שהבקשה פועלת עליה ובודק הרשאה (מנהל-על על כל חברה, מנהל חברה על שלו בלבד)
function resolveCompany(req, res) {
  const cid = req.params.cid || req.body.companyId || req.query.company;
  const c = getCompany(cid);
  if (!c) { res.status(404).json({ error: 'חברה לא קיימת' }); return null; }
  if (req.session.role === 'company' && req.session.companyId !== c.id) { res.status(403).json({ error: 'אין הרשאה לחברה זו' }); return null; }
  return c;
}

// ============================================================
//  API מנהל-על (amirco)
// ============================================================
// רשימת כל החברות
app.get('/api/admin/companies', auth, superOnly, (req, res) => {
  const list = Object.values(db.companies).map(c => ({
    id: c.id, name: c.name, password: c.password, enabled: c.enabled,
    gameName: c.gameName, stationCount: c.stations.length,
    playerCount: Object.keys(c.players).length,
    questionsSet: c.stations.filter(s => s.questionText).length
  }));
  res.json({ companies: list });
});

// יצירת חברה
app.post('/api/admin/companies', auth, superOnly, (req, res) => {
  const name = (req.body.name || '').toString().trim();
  const password = (req.body.password || '').toString().trim();
  if (name.length < 2) return res.status(400).json({ error: 'שם חברה חייב לפחות 2 תווים' });
  if (password.length < 4) return res.status(400).json({ error: 'סיסמה חייבת לפחות 4 תווים' });
  if (Object.values(db.companies).some(c => c.name === name)) return res.status(400).json({ error: 'שם חברה כבר קיים' });
  const c = newCompany(name, password);
  db.companies[c.id] = c;
  saveDB();
  res.json({ ok: true, company: { id: c.id, name: c.name, password: c.password, enabled: c.enabled } });
});

// עדכון חברה (שם/סיסמה/enabled)
app.post('/api/admin/companies/:cid', auth, superOnly, (req, res) => {
  const c = getCompany(req.params.cid);
  if (!c) return res.status(404).json({ error: 'חברה לא קיימת' });
  if (req.body.name !== undefined) {
    const name = req.body.name.toString().trim();
    if (name.length >= 2 && !Object.values(db.companies).some(x => x.name === name && x.id !== c.id)) { c.name = name; if (!c.gameName) c.gameName = name; }
  }
  if (req.body.password !== undefined && req.body.password.trim().length >= 4) c.password = req.body.password.trim();
  if (req.body.enabled !== undefined) c.enabled = !!req.body.enabled;
  if (req.body.gameName !== undefined) c.gameName = req.body.gameName.toString();
  saveDB();
  res.json({ ok: true });
});

// מחיקת חברה
app.delete('/api/admin/companies/:cid', auth, superOnly, (req, res) => {
  if (!db.companies[req.params.cid]) return res.status(404).json({ error: 'חברה לא קיימת' });
  delete db.companies[req.params.cid];
  saveDB();
  res.json({ ok: true });
});

// ============================================================
//  API ניהול תוכן חברה (מנהל-על על כל חברה, מנהל חברה על שלו)
// ============================================================
// פרטי החברה לעריכה (שאלות + הגדרות)
app.get('/api/admin/company/:cid/data', auth, (req, res) => {
  const c = resolveCompany(req, res); if (!c) return;
  res.json({ id: c.id, name: c.name, gameName: c.gameName, defaultLang: c.defaultLang || 'he', enabled: c.enabled, stations: c.stations, speedBonus: c.speedBonus });
});

app.post('/api/admin/company/:cid/game-name', auth, (req, res) => {
  const c = resolveCompany(req, res); if (!c) return;
  c.gameName = (req.body.gameName || c.name).toString();
  saveDB(); broadcast(c.id);
  res.json({ ok: true });
});

// שמירת שפת ברירת-מחדל לחברה
app.post('/api/admin/company/:cid/default-lang', auth, (req, res) => {
  const c = resolveCompany(req, res); if (!c) return;
  const lang = (req.body.defaultLang || '').toString();
  if (!['he', 'en', 'it'].includes(lang)) return res.status(400).json({ error: 'שפה לא תקינה' });
  c.defaultLang = lang;
  saveDB();
  res.json({ ok: true, defaultLang: lang });
});

// עדכון תחנה (כולל תמונה מוטמעת)
app.post('/api/admin/company/:cid/station/:id', auth, memUpload.single('image'), async (req, res) => {
  const c = resolveCompany(req, res); if (!c) return;
  const st = c.stations.find(s => s.id == req.params.id);
  if (!st) return res.status(404).json({ error: 'תחנה לא קיימת' });
  if (req.body.title !== undefined) st.title = req.body.title;
  if (req.body.questionType !== undefined) st.questionType = req.body.questionType;
  if (req.body.questionText !== undefined) st.questionText = req.body.questionText;
  if (req.body.correctAnswer !== undefined) st.correctAnswer = req.body.correctAnswer;
  if (req.body.points !== undefined) st.points = Number(req.body.points) || 10;
  if (req.body.imageLink) st.imageUrl = req.body.imageLink;
  if (req.file) {
    try {
      const buf = await sharp(req.file.buffer).rotate().resize({ width: 1000, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
      st.imageUrl = 'data:image/webp;base64,' + buf.toString('base64');
    } catch (e) { return res.status(400).json({ error: 'עיבוד התמונה נכשל' }); }
  }
  if (req.body.clearImage === 'true') st.imageUrl = '';
  saveDB();
  res.json({ ok: true, station: st });
});

// QR לתחנה (או ראשי) - base מגיע מהלקוח, מזהה חברה מוטמע בלינק
app.get('/api/admin/company/:cid/qr/:id', auth, async (req, res) => {
  const c = resolveCompany(req, res); if (!c) return;
  const base = req.query.base || `${req.protocol}://${req.get('host')}`;
  const id = req.params.id; // מספר תחנה או 'main'
  const url = (id === 'main') ? `${base}/c/${c.id}` : `${base}/c/${c.id}/station/${id}`;
  try { const dataUrl = await QRCode.toDataURL(url, { width: 400, margin: 2 }); res.json({ url, qr: dataUrl }); }
  catch (e) { res.status(500).json({ error: 'שגיאה ביצירת QR' }); }
});

// ייצוא סט שאלות לקובץ (JSON נקי לעריכה/גיבוי)
app.get('/api/admin/company/:cid/export', auth, (req, res) => {
  const c = resolveCompany(req, res); if (!c) return;
  const out = {
    format: 'mishak-hevra-questions',
    version: 1,
    gameName: c.gameName,
    defaultLang: c.defaultLang || 'he',
    exportedAt: new Date().toISOString(),
    mapConfig: c.mapConfig || defaultMapConfig(),
    stations: c.stations.map(s => ({
      id: s.id, title: s.title, questionType: s.questionType,
      questionText: s.questionText, correctAnswer: s.correctAnswer,
      points: s.points, imageUrl: s.imageUrl || ''
    }))
  };
  res.json(out);
});

// ייבוא סט שאלות מקובץ - מחליף את כל השאלות של החברה
app.post('/api/admin/company/:cid/import', auth, (req, res) => {
  const c = resolveCompany(req, res); if (!c) return;
  const data = req.body;
  if (!data || !Array.isArray(data.stations)) return res.status(400).json({ error: 'קובץ לא תקין - חסר שדה stations' });
  c.stations = normalizeStations(data.stations);
  if (data.gameName != null && String(data.gameName).trim()) c.gameName = String(data.gameName).trim().slice(0, 100);
  if (['he', 'en', 'it'].includes(data.defaultLang)) c.defaultLang = data.defaultLang;
  const cfg = normalizeMapConfig(data.mapConfig);
  if (cfg) c.mapConfig = cfg;
  // ייבוא ידני אינו חבילת ספרייה — מנתק קישור לחבילה
  c.loadedPackId = null; c.loadedPackCounted = false;
  saveDB(); broadcast(c.id);
  res.json({ ok: true, gameName: c.gameName, imported: data.stations.length });
});

// שמירת השאלות הנוכחיות של חברה כחבילה חדשה בספרייה (מנהל-על) — דרך נוחה לבנות תוכן
app.post('/api/admin/company/:cid/save-as-pack', auth, superOnly, (req, res) => {
  const c = resolveCompany(req, res); if (!c) return;
  const b = req.body || {};
  const name = String(b.name || c.gameName || '').trim().slice(0, 120);
  if (!name) return res.status(400).json({ error: 'נא להזין שם לחבילה' });
  const pack = {
    id: makeId('pack'),
    name,
    lang: PACK_LANGS.includes(b.lang) ? b.lang : (c.defaultLang || 'he'),
    style: String(b.style || '').trim().slice(0, 80),
    ageRange: String(b.ageRange || '').trim().slice(0, 40),
    description: String(b.description || '').trim().slice(0, 300),
    stations: normalizeStations(c.stations),
    mapConfig: normalizeMapConfig(c.mapConfig) || defaultMapConfig(),
    uses: 0,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  db.library.push(pack);
  saveDB();
  res.json({ ok: true, pack });
});

// ============================================================
//  ספריית חבילות שאלות מרכזית (db.library)
//  - מנהל ראשי: יצירה/עריכה/מחיקה (CRUD מלא)
//  - מנהל חברה: צפייה + טעינת עותק לחברה שלו (בלי לפגוע במקור)
// ============================================================
const PACK_LANGS = ['he', 'en', 'it'];

// פרטי חבילה לרשימה (בלי תוכן השאלות הכבד) — לכל מנהל מחובר
function packMeta(p) {
  return {
    id: p.id, name: p.name, lang: p.lang, style: p.style || '',
    ageRange: p.ageRange || '', description: p.description || '',
    questionCount: Array.isArray(p.stations) ? p.stations.filter(s => (s.questionText || '').trim()).length : 0,
    uses: p.uses || 0, updatedAt: p.updatedAt || p.createdAt || 0
  };
}

// רשימת חבילות (מטא-דאטה בלבד) — נגיש לכל מנהל מחובר (לטעינה)
app.get('/api/admin/library', auth, (req, res) => {
  res.json({ packs: (db.library || []).map(packMeta) });
});

// תוכן מלא של חבילה — מנהל-על לעריכה, או מנהל חברה לתצוגה מקדימה/טעינה
app.get('/api/admin/library/:pid', auth, (req, res) => {
  const p = (db.library || []).find(x => x.id === req.params.pid);
  if (!p) return res.status(404).json({ error: 'חבילה לא נמצאה' });
  res.json({ pack: p });
});

// יצירת חבילה חדשה (מנהל-על)
app.post('/api/admin/library', auth, superOnly, (req, res) => {
  const b = req.body || {};
  const name = String(b.name || '').trim().slice(0, 120);
  if (!name) return res.status(400).json({ error: 'נא להזין שם לחבילה' });
  const lang = PACK_LANGS.includes(b.lang) ? b.lang : 'he';
  const pack = {
    id: makeId('pack'),
    name,
    lang,
    style: String(b.style || '').trim().slice(0, 80),
    ageRange: String(b.ageRange || '').trim().slice(0, 40),
    description: String(b.description || '').trim().slice(0, 300),
    stations: normalizeStations(b.stations),
    mapConfig: normalizeMapConfig(b.mapConfig) || defaultMapConfig(),
    uses: 0,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  db.library.push(pack);
  saveDB();
  res.json({ ok: true, pack });
});

// עדכון חבילה קיימת (מנהל-על) — לא מאפס את מונה השימושים
app.post('/api/admin/library/:pid', auth, superOnly, (req, res) => {
  const p = (db.library || []).find(x => x.id === req.params.pid);
  if (!p) return res.status(404).json({ error: 'חבילה לא נמצאה' });
  const b = req.body || {};
  if (b.name != null) { const n = String(b.name).trim().slice(0, 120); if (n) p.name = n; }
  if (PACK_LANGS.includes(b.lang)) p.lang = b.lang;
  if (b.style != null) p.style = String(b.style).trim().slice(0, 80);
  if (b.ageRange != null) p.ageRange = String(b.ageRange).trim().slice(0, 40);
  if (b.description != null) p.description = String(b.description).trim().slice(0, 300);
  if (Array.isArray(b.stations)) p.stations = normalizeStations(b.stations);
  if (b.mapConfig !== undefined) { const cfg = normalizeMapConfig(b.mapConfig); if (cfg) p.mapConfig = cfg; }
  if (b.resetUses === true) p.uses = 0;   // איפוס יזום בלבד
  p.updatedAt = Date.now();
  saveDB();
  res.json({ ok: true, pack: p });
});

// מחיקת חבילה (מנהל-על)
app.delete('/api/admin/library/:pid', auth, superOnly, (req, res) => {
  const idx = (db.library || []).findIndex(x => x.id === req.params.pid);
  if (idx < 0) return res.status(404).json({ error: 'חבילה לא נמצאה' });
  const removed = db.library.splice(idx, 1)[0];
  // חברות שטענו חבילה זו פשוט מאבדות את הקישור (השאלות שלהן נשארות)
  Object.values(db.companies).forEach(c => { if (c.loadedPackId === removed.id) { c.loadedPackId = null; c.loadedPackCounted = false; } });
  saveDB();
  res.json({ ok: true });
});

// טעינת חבילה מהספרייה לחברה (מנהל חברה או מנהל-על) — מעתיק, לא מקשר לתוכן המקור
app.post('/api/admin/company/:cid/load-pack', auth, (req, res) => {
  const c = resolveCompany(req, res); if (!c) return;
  const p = (db.library || []).find(x => x.id === req.body.packId);
  if (!p) return res.status(404).json({ error: 'חבילה לא נמצאה' });
  // העתק עמוק של התחנות וה-mapConfig — החברה עורכת עותק עצמאי
  c.stations = normalizeStations(p.stations);
  const cfg = normalizeMapConfig(p.mapConfig); if (cfg) c.mapConfig = cfg;
  if (PACK_LANGS.includes(p.lang)) c.defaultLang = p.lang;
  // קישור למעקב פופולריות — ייספר רק כש-≥5 שחקנים יענו
  c.loadedPackId = p.id;
  c.loadedPackCounted = false;
  saveDB(); broadcast(c.id);
  res.json({ ok: true, loaded: p.name, lang: p.lang });
});

// אישור/דחיית תמונה
app.post('/api/admin/company/:cid/review', auth, (req, res) => {
  const c = resolveCompany(req, res); if (!c) return;
  const { playerId, stationId, approve } = req.body;
  const player = c.players[playerId];
  if (!player || !player.answers[stationId]) return res.status(404).json({ error: 'לא נמצא' });
  const st = c.stations.find(s => s.id == stationId);
  const ans = player.answers[stationId];
  const base = st ? st.points : 10;
  ans.correct = !!approve;
  ans.basePoints = approve ? base : 0;
  ans.bonus = approve ? speedBonus(c, ans.timeMs) : 0;
  ans.points = approve ? (base + ans.bonus) : 0;
  saveDB(); broadcast(c.id);
  res.json({ ok: true });
});

// תמונות הממתינות לאישור
app.get('/api/admin/company/:cid/pending', auth, (req, res) => {
  const c = resolveCompany(req, res); if (!c) return;
  const pending = [];
  Object.values(c.players).forEach(p => {
    Object.values(p.answers || {}).forEach(a => {
      if (a.correct === null && a.photoUrl) pending.push({ playerId: p.id, name: p.name, team: p.team, stationId: a.stationId, photoUrl: a.photoUrl, answerText: a.answerText });
    });
  });
  res.json({ pending });
});

// איפוס משחק החברה
app.post('/api/admin/company/:cid/reset', auth, (req, res) => {
  const c = resolveCompany(req, res); if (!c) return;
  c.players = {}; c.submissions = [];
  saveDB(); broadcast(c.id);
  res.json({ ok: true });
});

// הגדרות (בונוס מהירות)
app.post('/api/admin/company/:cid/speed-bonus', auth, (req, res) => {
  const c = resolveCompany(req, res); if (!c) return;
  c.speedBonus = { enabled: req.body.enabled === true || req.body.enabled === 'true', maxBonus: Math.max(0, Number(req.body.maxBonus) || 0), windowSec: Math.max(1, Number(req.body.windowSec) || 60) };
  saveDB();
  res.json({ ok: true, speedBonus: c.speedBonus });
});

// מפת התחנות - שליפה לעריכה (מנהל)
app.get('/api/admin/company/:cid/map', auth, (req, res) => {
  const c = resolveCompany(req, res); if (!c) return;
  if (!c.mapConfig) c.mapConfig = defaultMapConfig();
  res.json({ mapConfig: c.mapConfig, gameName: c.gameName, companyName: c.name });
});

// מפת התחנות - שמירה (מנהל)
app.post('/api/admin/company/:cid/map', auth, (req, res) => {
  const c = resolveCompany(req, res); if (!c) return;
  const m = req.body || {};
  const cfg = defaultMapConfig();
  if (m.center && isFinite(m.center.lat) && isFinite(m.center.lng)) {
    cfg.center = { lat: Number(m.center.lat), lng: Number(m.center.lng) };
  }
  if (isFinite(m.zoom)) cfg.zoom = Math.min(21, Math.max(1, Number(m.zoom)));
  if (isFinite(m.markerSize)) cfg.markerSize = Math.min(64, Math.max(16, Math.round(Number(m.markerSize))));
  if (isFinite(m.viewWidth)) cfg.viewWidth = Math.max(0, Math.round(Number(m.viewWidth)));
  if (m.bounds && isFinite(m.bounds.north) && isFinite(m.bounds.south) && isFinite(m.bounds.east) && isFinite(m.bounds.west)) {
    cfg.bounds = { north: Number(m.bounds.north), south: Number(m.bounds.south), east: Number(m.bounds.east), west: Number(m.bounds.west) };
  }
  cfg.locked = !!m.locked;
  if (Array.isArray(m.markers)) {
    cfg.markers = m.markers
      .filter(x => x && isFinite(x.lat) && isFinite(x.lng) && Number(x.id) >= 1 && Number(x.id) <= 10)
      .map(x => ({ id: Number(x.id), lat: Number(x.lat), lng: Number(x.lng) }))
      .slice(0, 10);
  }
  c.mapConfig = cfg;
  saveDB();
  res.json({ ok: true, mapConfig: c.mapConfig });
});


// ============================================================
//  ניתוב דפים
// ============================================================
// עמוד ראשי של חברה (אחרי סריקת QR ראשי)
app.get('/c/:cid', (req, res) => res.sendFile(path.join(__dirname, 'company.html')));
// תחנה של חברה
app.get('/c/:cid/station/:id', (req, res) => res.sendFile(path.join(__dirname, 'station.html')));
// הצטרפות לחברה
app.get('/c/:cid/join', (req, res) => res.sendFile(path.join(__dirname, 'join.html')));
// לוח תוצאות של חברה
app.get('/c/:cid/board', (req, res) => res.sendFile(path.join(__dirname, 'board.html')));
app.get('/c/:cid/progress', (req, res) => res.sendFile(path.join(__dirname, 'progress.html')));
app.get('/c/:cid/map', (req, res) => res.sendFile(path.join(__dirname, 'map.html')));

app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'dashboard.html')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

loadDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🎮 משחק חברה רץ על פורט ${PORT}`);
    console.log(GH_ENABLED ? '☁️  גיבוי GitHub פעיל' : '💾 אחסון מקומי בלבד');
    console.log(`📊 חברות רשומות: ${Object.keys(db.companies).length}`);
  });
}).catch(err => { console.error('שגיאה בטעינת DB:', err); process.exit(1); });
