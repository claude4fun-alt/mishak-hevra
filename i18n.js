/* =====================================================================
   i18n.js — ריבוי שפות לממשק "משחק חברה" (he / en / it)
   ---------------------------------------------------------------------
   • מתרגם רק את הממשק (כפתורים, כותרות, הודעות). תוכן השאלות נשאר כפי
     שהמנהל כתב — לא נוגעים בו.
   • טעינה בצד לקוח בלבד. אפס עומס על השרת (השרת רק שומר defaultLang).
   • שימוש ב-HTML:  <span data-i18n="key"></span>
       - data-i18n            -> textContent
       - data-i18n-html       -> innerHTML (כשצריך <b> וכו')
       - data-i18n-ph         -> placeholder
       - data-i18n-title      -> title (tooltip)
       - data-i18n-aria       -> aria-label
   • שימוש ב-JS:  t('key')  או  t('key', {name:'דני'})  עם {placeholders}
   • החלפת שפה:  setLang('en')   |   קריאת שפה:  getLang()
   • בורר דגלים:  renderLangPicker(elementOrId, {compact:true})
   • אירוע:  document.addEventListener('langchange', e => {... e.detail.lang})
   ===================================================================== */
(function (global) {
  'use strict';

  var LANGS = ['he', 'en', 'it'];
  var RTL = { he: true, en: false, it: false };
  var FLAG = { he: '🇮🇱', en: '🇺🇸', it: '🇮🇹' };
  var LANG_NAME = { he: 'עברית', en: 'English', it: 'Italiano' };
  var STORE_KEY = 'fg_lang';

  // שפת ברירת-מחדל של החברה — נקבעת ע"י עמוד שטוען i18n (window.FG_DEFAULT_LANG)
  // קדימויות: localStorage  >  defaultLang של החברה  >  he
  function detectLang() {
    var saved = '';
    try { saved = localStorage.getItem(STORE_KEY) || ''; } catch (e) {}
    if (LANGS.indexOf(saved) > -1) return saved;
    var def = (global.FG_DEFAULT_LANG || '').toString();
    if (LANGS.indexOf(def) > -1) return def;
    return 'he';
  }

  var current = detectLang();

  /* =================================================================
     מילון התרגומים
     מפתחות מקובצים לפי עמוד; מפתחות "common.*" משותפים לכמה עמודים.
     ================================================================= */
  var DICT = {
    /* ---------- משותף ---------- */
    'common.gameName':        { he: 'משחק חברה', en: 'Family Game', it: 'Gioco di Squadra' },
    'common.createdBy':       { he: 'נוצר ע"י Amir Cohen', en: 'Created by Amir Cohen', it: 'Creato da Amir Cohen' },
    'common.moreGames':       { he: 'למשחקים נוספים פנו ל-', en: 'For more games contact ', it: 'Per altri giochi contatta ' },
    'common.scanStation':     { he: '📷 סרוק QR של תחנה', en: '📷 Scan station QR', it: '📷 Scansiona QR stazione' },
    'common.scanNext':        { he: '📷 סרוק QR של התחנה הבאה', en: '📷 Scan next station QR', it: '📷 Scansiona QR prossima stazione' },
    'common.stopScan':        { he: 'עצור סריקה', en: 'Stop scanning', it: 'Ferma scansione' },
    'common.board':           { he: '📊 לוח תוצאות חי', en: '📊 Live leaderboard', it: '📊 Classifica live' },
    'common.boardShort':      { he: '📊 לוח תוצאות', en: '📊 Leaderboard', it: '📊 Classifica' },
    'common.viewBoard':       { he: '📊 צפו בלוח התוצאות', en: '📊 View leaderboard', it: '📊 Vedi classifica' },
    'common.progress':        { he: '🗺️ ההתקדמות שלי', en: '🗺️ My progress', it: '🗺️ I miei progressi' },
    'common.gameMap':         { he: '🧭 מפת המשחק', en: '🧭 Game map', it: '🧭 Mappa del gioco' },
    'common.team':            { he: 'קבוצה', en: 'Team', it: 'Squadra' },
    'common.newTeam':         { he: '➕ קבוצה חדשה...', en: '➕ New team...', it: '➕ Nuova squadra...' },
    'common.newTeamPh':       { he: 'שם הקבוצה החדשה', en: 'New team name', it: 'Nome nuova squadra' },
    'common.yourName':        { he: 'השם שלך', en: 'Your name', it: 'Il tuo nome' },
    'common.pts':             { he: 'נק\'', en: 'pts', it: 'pti' },
    'common.station':         { he: 'תחנה', en: 'Station', it: 'Stazione' },
    'common.loading':         { he: 'טוען...', en: 'Loading...', it: 'Caricamento...' },
    'common.connErr':         { he: 'שגיאת חיבור', en: 'Connection error', it: 'Errore di connessione' },
    'common.camErr':          { he: 'לא ניתן לגשת למצלמה. סרקו עם אפליקציית המצלמה.', en: 'Cannot access camera. Scan with your camera app.', it: 'Impossibile accedere alla fotocamera. Scansiona con l\'app fotocamera.' },
    'common.camErrPerm':      { he: 'לא ניתן לגשת למצלמה. ודאו שאישרתם הרשאה, או סרקו עם אפליקציית המצלמה.', en: 'Cannot access camera. Make sure you granted permission, or scan with your camera app.', it: 'Impossibile accedere alla fotocamera. Verifica i permessi o usa l\'app fotocamera.' },
    'common.enterName':       { he: 'נא להזין שם', en: 'Please enter a name', it: 'Inserisci un nome' },
    'common.enterTeam':       { he: 'נא להזין שם קבוצה או לבחור קבוצה קיימת', en: 'Enter a team name or pick an existing team', it: 'Inserisci una squadra o scegline una esistente' },

    /* ---------- index.html ---------- */
    'index.subtitle':         { he: 'מערכת משחק תחנות רב-חברתית', en: 'Multi-company station game system', it: 'Sistema di gioco a stazioni multi-azienda' },
    'index.adminLogin':       { he: '📝 כניסת מנהל', en: '📝 Admin login', it: '📝 Accesso amministratore' },
    'index.note':             { he: '<strong>שחקנים</strong> מצטרפים על ידי סריקת ה-QR הראשי של החברה שלהם — לא דרך עמוד זה.<br><strong>מנהל ראשי</strong> נכנס לדשבורד ליצירת חברות וניהולן.<br><strong>מנהל חברה</strong> נכנס עם שם החברה והסיסמה שקיבל.',
                                en: '<strong>Players</strong> join by scanning their company\'s main QR — not through this page.<br><strong>Super admin</strong> logs in to create and manage companies.<br><strong>Company manager</strong> logs in with the company name and password.',
                                it: '<strong>I giocatori</strong> si uniscono scansionando il QR principale della loro azienda, non da questa pagina.<br><strong>Super admin</strong> accede per creare e gestire le aziende.<br><strong>Manager aziendale</strong> accede con nome azienda e password.' },

    /* ---------- company.html ---------- */
    'company.start':          { he: 'התחל ▶', en: 'Start ▶', it: 'Inizia ▶' },
    'company.startHint':      { he: 'לחצו כדי להתחיל את ההרפתקה', en: 'Tap to start the adventure', it: 'Tocca per iniziare l\'avventura' },
    'company.join':           { he: '🙋 הצטרף למשחק', en: '🙋 Join the game', it: '🙋 Unisciti al gioco' },
    'company.disabled':       { he: 'המשחק של חברה זו מושבת כרגע', en: 'This company\'s game is currently disabled', it: 'Il gioco di questa azienda è disattivato' },
    'company.notFound':       { he: 'חברה לא נמצאה', en: 'Company not found', it: 'Azienda non trovata' },

    /* ---------- join.html ---------- */
    'join.title':             { he: '🎮 הצטרפות למשחק', en: '🎮 Join the game', it: '🎮 Unisciti al gioco' },
    'join.sub':               { he: 'רשמו את עצמכם, ואז גשו לתחנה הראשונה', en: 'Register, then head to the first station', it: 'Registrati, poi vai alla prima stazione' },
    'join.namePh':            { he: 'הקלידו את שמכם', en: 'Type your name', it: 'Scrivi il tuo nome' },
    'join.submit':            { he: 'הצטרף למשחק! 🚀', en: 'Join the game! 🚀', it: 'Unisciti! 🚀' },
    'join.camNote':           { he: '📷 <b>לפני הסריקות:</b> אם יש בעיה בסריקת ה-QR, ודאו שלדפדפן שבו אתם משתמשים יש <b>הרשאת גישה למצלמה</b> (בהגדרות הדפדפן/הטלפון). בלי הרשאה הסורק לא יעבוד.',
                                en: '📷 <b>Before scanning:</b> if QR scanning fails, make sure your browser has <b>camera permission</b> (in the browser/phone settings). Without it the scanner won\'t work.',
                                it: '📷 <b>Prima di scansionare:</b> se la scansione QR non funziona, verifica che il browser abbia il <b>permesso fotocamera</b> (nelle impostazioni browser/telefono). Senza, lo scanner non funziona.' },
    'join.doneSub':           { he: 'נרשמת בהצלחה! עכשיו גשו לתחנה הראשונה וסרקו את ה-QR שלה כדי להתחיל לענות.', en: 'Registered! Now go to the first station and scan its QR to start answering.', it: 'Registrato! Vai alla prima stazione e scansiona il suo QR per iniziare.' },
    'join.back':              { he: '↩ חזרה לתפריט', en: '↩ Back to menu', it: '↩ Torna al menu' },
    'join.welcomeBack':       { he: 'שמחים שחזרת, ', en: 'Welcome back, ', it: 'Bentornato, ' },
    'join.welcome':           { he: 'ברוכים הבאים, ', en: 'Welcome, ', it: 'Benvenuto, ' },
    'join.exists':            { he: 'שחקן בשם "{name}" בקבוצה "{team}" כבר רשום.\n\nלהמשיך עם השחקן הקיים? (כדי למנוע כפילות בלוח התוצאות)\n\nאישור = המשך משחק קיים · ביטול = שנה שם/קבוצה',
                                en: 'A player named "{name}" in team "{team}" already exists.\n\nContinue as the existing player? (to avoid duplicates on the leaderboard)\n\nOK = continue existing · Cancel = change name/team',
                                it: 'Un giocatore "{name}" nella squadra "{team}" esiste già.\n\nContinuare con il giocatore esistente? (per evitare duplicati in classifica)\n\nOK = continua esistente · Annulla = cambia nome/squadra' },
    'join.joinErr':           { he: 'שגיאה בהצטרפות', en: 'Error joining', it: 'Errore di iscrizione' },

    /* ---------- station.html ---------- */
    'station.gateBadge':      { he: '⚠️ עצרו רגע', en: '⚠️ Hold on', it: '⚠️ Un momento' },
    'station.gateTitle':      { he: 'כדי לשחק, סרקו דרך התוכנה', en: 'To play, scan through the app', it: 'Per giocare, scansiona dall\'app' },
    'station.gateText':       { he: 'נראה שהגעתם לתחנה בלי לסרוק דרך כפתור הסריקה במשחק. כדי לשחק נכון ולצבור נקודות, פתחו את עמוד המשחק וסרקו את ה-QR מתוך התוכנה.', en: 'Looks like you reached this station without scanning via the game\'s scan button. To play properly and earn points, open the game page and scan the QR from within the app.', it: 'Sembra che tu sia arrivato senza scansionare dal pulsante del gioco. Per giocare e guadagnare punti, apri la pagina del gioco e scansiona il QR dall\'app.' },
    'station.gateBtn':        { he: '▶ פתחו את עמוד המשחק', en: '▶ Open the game page', it: '▶ Apri la pagina del gioco' },
    'station.joinWelcome':    { he: 'ברוכים הבאים! הזינו פרטים כדי להתחיל לשחק', en: 'Welcome! Enter your details to start playing', it: 'Benvenuto! Inserisci i dati per iniziare' },
    'station.joinStart':      { he: 'בואו נתחיל! 🚀', en: 'Let\'s start! 🚀', it: 'Iniziamo! 🚀' },
    'station.answerPh':       { he: 'כתבו את התשובה כאן...', en: 'Write your answer here...', it: 'Scrivi la risposta qui...' },
    'station.photoZone':      { he: '📸 לחצו לצילום / העלאת תמונה', en: '📸 Tap to take / upload a photo', it: '📸 Tocca per scattare / caricare foto' },
    'station.captionPh':      { he: 'הוסיפו כיתוב (אופציונלי)', en: 'Add a caption (optional)', it: 'Aggiungi didascalia (opzionale)' },
    'station.submit':         { he: 'שליחת תשובה ✓', en: 'Submit answer ✓', it: 'Invia risposta ✓' },
    'station.submitting':     { he: 'שולח...', en: 'Sending...', it: 'Invio...' },
    'station.timer':          { he: '⏱️ {n} שניות', en: '⏱️ {n} seconds', it: '⏱️ {n} secondi' },
    'station.noQuestion':     { he: '(לא הוגדרה שאלה לתחנה זו)', en: '(no question set for this station)', it: '(nessuna domanda per questa stazione)' },
    'station.alreadyPending': { he: 'כבר שלחת תשובה לתחנה זו (ממתינה לאישור)', en: 'You already submitted an answer here (awaiting approval)', it: 'Hai già inviato una risposta qui (in attesa di approvazione)' },
    'station.alreadyCorrect': { he: 'כבר ענית נכון על תחנה זו ✓', en: 'You already answered this station correctly ✓', it: 'Hai già risposto correttamente ✓' },
    'station.alreadyDone':    { he: 'כבר ענית על תחנה זו', en: 'You already answered this station', it: 'Hai già risposto a questa stazione' },
    'station.needPhoto':      { he: 'נא לצרף תמונה', en: 'Please attach a photo', it: 'Allega una foto' },
    'station.needAnswer':     { he: 'נא להזין תשובה', en: 'Please enter an answer', it: 'Inserisci una risposta' },
    'station.sendErr':        { he: 'שגיאה בשליחה, נסו שוב', en: 'Send error, try again', it: 'Errore di invio, riprova' },
    'station.pointsGained':   { he: '+{n} נקודות', en: '+{n} points', it: '+{n} punti' },
    'station.pendingReview':  { he: 'התשובה שלך תיבדק על ידי המנהל', en: 'Your answer will be reviewed by the manager', it: 'La tua risposta sarà esaminata dal manager' },
    'station.findNext':       { he: 'חפשו את התחנה הבאה!', en: 'Find the next station!', it: 'Cerca la prossima stazione!' },
    'station.resCorrect':     { he: 'תשובה נכונה! 🎉', en: 'Correct answer! 🎉', it: 'Risposta corretta! 🎉' },
    'station.resCorrectBonus':{ he: 'תשובה נכונה! +{points} נק\' ועוד {bonus} בונוס מהירות! ⚡🎉', en: 'Correct! +{points} pts and {bonus} speed bonus! ⚡🎉', it: 'Corretto! +{points} pti e {bonus} bonus velocità! ⚡🎉' },
    'station.resWrong':       { he: 'לא מדויק, אבל ממשיכים! 💪', en: 'Not quite, but keep going! 💪', it: 'Non esatto, ma continua! 💪' },
    'station.resPending':     { he: 'התקבל! המנהל יבדוק 📸', en: 'Received! The manager will review it 📸', it: 'Ricevuto! Il manager esaminerà 📸' },
    'station.switch':         { he: '(החלף שחקן)', en: '(switch player)', it: '(cambia giocatore)' },
    'station.switchConfirm':  { he: 'להחליף שחקן? תצטרכו להזין שם וקבוצה מחדש.', en: 'Switch player? You\'ll need to re-enter name and team.', it: 'Cambiare giocatore? Dovrai reinserire nome e squadra.' },
    'station.teamLabel':      { he: ' · קבוצה: {team}', en: ' · Team: {team}', it: ' · Squadra: {team}' },

    /* ---------- board.html ---------- */
    'board.titleDefault':     { he: 'לוח תוצאות חי', en: 'Live leaderboard', it: 'Classifica live' },
    'board.waiting':          { he: 'ממתינים למתחרים... 🎮', en: 'Waiting for players... 🎮', it: 'In attesa di giocatori... 🎮' },
    'board.rankTable':        { he: '🏆 טבלת דירוג', en: '🏆 Ranking table', it: '🏆 Classifica' },
    'board.colRank':          { he: '#', en: '#', it: '#' },
    'board.colName':          { he: 'שם', en: 'Name', it: 'Nome' },
    'board.colTeam':          { he: 'קבוצה', en: 'Team', it: 'Squadra' },
    'board.colCorrect':       { he: 'נכונות', en: 'Correct', it: 'Corrette' },
    'board.colPoints':        { he: 'נקודות', en: 'Points', it: 'Punti' },
    'board.colBonus':         { he: '⚡ בונוס', en: '⚡ Bonus', it: '⚡ Bonus' },
    'board.colAvgTime':       { he: 'זמן ממוצע', en: 'Avg. time', it: 'Tempo medio' },
    'board.teamsTitle':       { he: '👥 דירוג קבוצות', en: '👥 Team ranking', it: '👥 Classifica squadre' },
    'board.awFastest':        { he: '⚡ הכי מהיר', en: '⚡ Fastest', it: '⚡ Più veloce' },
    'board.awMostCorrect':    { he: '🎯 הכי הרבה נכונות', en: '🎯 Most correct', it: '🎯 Più corrette' },
    'board.awLeader':         { he: '👑 מוביל', en: '👑 Leader', it: '👑 Leader' },
    'board.members':          { he: 'משתתפים', en: 'members', it: 'partecipanti' },
    'board.correctWord':      { he: 'נכונות', en: 'correct', it: 'corrette' },
    'board.noTeam':           { he: 'ללא קבוצה', en: 'No team', it: 'Senza squadra' },

    /* ---------- progress.html ---------- */
    'progress.title':         { he: '🗺️ ההתקדמות שלי', en: '🗺️ My progress', it: '🗺️ I miei progressi' },
    'progress.notJoined':     { he: 'עדיין לא נרשמת למשחק', en: 'You haven\'t joined the game yet', it: 'Non ti sei ancora iscritto al gioco' },
    'progress.summary':       { he: 'סרקת {done} מתוך {total} תחנות · {correct} תשובות נכונות', en: 'Scanned {done} of {total} stations · {correct} correct answers', it: 'Scansionate {done} di {total} stazioni · {correct} risposte corrette' },
    'progress.legendCorrect': { he: 'נכון', en: 'Correct', it: 'Corretto' },
    'progress.legendPending': { he: 'ממתין לאישור', en: 'Awaiting approval', it: 'In attesa' },
    'progress.legendWrong':   { he: 'לא נכון', en: 'Wrong', it: 'Sbagliato' },
    'progress.legendNone':    { he: 'טרם נסרק', en: 'Not scanned yet', it: 'Non scansionato' },
    'progress.scanLink':      { he: '📷 לסריקת תחנה', en: '📷 Scan a station', it: '📷 Scansiona stazione' },
    'progress.otherCorrect':  { he: '🔔 קבוצה אחרת ענתה נכון!', en: '🔔 Another team answered correctly!', it: '🔔 Un\'altra squadra ha risposto bene!' },

    /* ---------- map.html ---------- */
    'map.title':              { he: 'מפת המשחק', en: 'Game map', it: 'Mappa del gioco' },
    'map.loading':            { he: 'טוען מפה…', en: 'Loading map…', it: 'Caricamento mappa…' },
    'map.loadErr':            { he: 'לא ניתן לטעון את המפה', en: 'Could not load the map', it: 'Impossibile caricare la mappa' },
    'map.notSet':             { he: 'המנהל עדיין לא הגדיר את מפת התחנות', en: 'The manager hasn\'t set up the station map yet', it: 'Il manager non ha ancora impostato la mappa' },
    'map.back':               { he: '↩️ חזרה', en: '↩️ Back', it: '↩️ Indietro' },
    'map.navBoard':           { he: '📊 לוח תוצאות', en: '📊 Leaderboard', it: '📊 Classifica' },
    'map.navScan':            { he: '📷 סריקת תחנה', en: '📷 Scan station', it: '📷 Scansiona stazione' },
    'map.legNone':            { he: 'טרם נסרק', en: 'Not scanned', it: 'Non scansionato' },
    'map.legCorrect':         { he: 'נכון', en: 'Correct', it: 'Corretto' },
    'map.legWrong':           { he: 'לא נכון', en: 'Wrong', it: 'Sbagliato' },
    'map.legPending':         { he: 'ממתין', en: 'Pending', it: 'In attesa' },

    /* ---------- dashboard.html ---------- */
    'dash.title':             { he: 'דשבורד ניהול - משחק חברה', en: 'Admin Dashboard - Family Game', it: 'Dashboard Admin - Gioco di Squadra' },
    'dash.loginTitle':        { he: '🔐 כניסת מנהל', en: '🔐 Admin login', it: '🔐 Accesso admin' },
    'dash.userPh':            { he: 'שם משתמש / שם חברה', en: 'Username / company name', it: 'Utente / nome azienda' },
    'dash.passPh':            { he: 'סיסמה', en: 'Password', it: 'Password' },
    'dash.loginBtn':          { he: 'כניסה', en: 'Log in', it: 'Accedi' },
    'dash.loginBad':          { he: 'שם או סיסמה שגויים', en: 'Wrong username or password', it: 'Utente o password errati' },
    'dash.hdrSuper':          { he: '🎮 דשבורד מנהל ראשי', en: '🎮 Super admin dashboard', it: '🎮 Dashboard super admin' },
    'dash.hdrSuperSub':       { he: 'ניהול כל החברות', en: 'Manage all companies', it: 'Gestione di tutte le aziende' },
    'dash.hdrCompany':        { he: '🎮 דשבורד: {name}', en: '🎮 Dashboard: {name}', it: '🎮 Dashboard: {name}' },
    'dash.hdrCompanySub':     { he: 'ניהול השאלות והתוצאות', en: 'Manage questions and scores', it: 'Gestione domande e punteggi' },
    'dash.editingSub':        { he: 'עורך את: {name}', en: 'Editing: {name}', it: 'Modifica: {name}' },
    'dash.tabCompanies':      { he: '🏢 חברות', en: '🏢 Companies', it: '🏢 Aziende' },
    'dash.addCompany':        { he: '➕ הוספת חברה חדשה', en: '➕ Add a new company', it: '➕ Aggiungi azienda' },
    'dash.coName':            { he: 'שם החברה', en: 'Company name', it: 'Nome azienda' },
    'dash.coNamePh':          { he: 'למשל: משפחת כהן', en: 'e.g. The Cohen Family', it: 'es. Famiglia Cohen' },
    'dash.coPass':            { he: 'סיסמה למנהל החברה', en: 'Company manager password', it: 'Password manager azienda' },
    'dash.coPassPh':          { he: 'לפחות 4 תווים', en: 'At least 4 characters', it: 'Almeno 4 caratteri' },
    'dash.createCo':          { he: 'צור חברה', en: 'Create company', it: 'Crea azienda' },
    'dash.created':           { he: 'נוצר ✓', en: 'Created ✓', it: 'Creato ✓' },
    'dash.noCompanies':       { he: 'עדיין אין חברות. צור חברה ראשונה למעלה.', en: 'No companies yet. Create your first one above.', it: 'Nessuna azienda. Creane una sopra.' },
    'dash.active':            { he: 'פעיל', en: 'Active', it: 'Attivo' },
    'dash.inactive':          { he: 'מושבת', en: 'Disabled', it: 'Disattivato' },
    'dash.editQuestions':     { he: '✏️ ערוך שאלות', en: '✏️ Edit questions', it: '✏️ Modifica domande' },
    'dash.disable':           { he: 'השבת', en: 'Disable', it: 'Disattiva' },
    'dash.enable':            { he: 'הפעל', en: 'Enable', it: 'Attiva' },
    'dash.coPassword':        { he: 'סיסמת מנהל:', en: 'Manager password:', it: 'Password manager:' },
    'dash.questionsSet':      { he: '{set}/{total} שאלות הוגדרו', en: '{set}/{total} questions set', it: '{set}/{total} domande impostate' },
    'dash.playersCount':      { he: '{n} שחקנים', en: '{n} players', it: '{n} giocatori' },
    'dash.fillNamePass':      { he: 'נא למלא שם וסיסמה', en: 'Please fill in name and password', it: 'Inserisci nome e password' },
    'dash.deleteCoConfirm':   { he: 'למחוק את החברה "{name}"? כל השאלות, השחקנים והתוצאות יימחקו לצמיתות.', en: 'Delete company "{name}"? All questions, players and scores will be permanently deleted.', it: 'Eliminare l\'azienda "{name}"? Domande, giocatori e punteggi saranno cancellati per sempre.' },
    'dash.backToCompanies':   { he: '↩ חזרה לרשימת החברות', en: '↩ Back to companies list', it: '↩ Torna alle aziende' },
    'dash.signalWarn':        { he: '📡 <b>מנהל, שים לב:</b> לפני האירוע בדוק שיש <b>קליטה טובה לטלפונים (בייחוד לנתונים סלולריים)</b> במקום שבחרת לשחק! בלי קליטה טובה השחקנים לא יוכלו לסרוק תחנות, לראות את המפה או לענות.',
                                en: '📡 <b>Manager, note:</b> before the event, check there is <b>good phone signal (especially cellular data)</b> at your chosen location! Without it, players can\'t scan stations, see the map or answer.',
                                it: '📡 <b>Manager, attenzione:</b> prima dell\'evento verifica che ci sia <b>buon segnale telefonico (specie dati cellulare)</b> nel luogo scelto! Senza, i giocatori non potranno scansionare, vedere la mappa o rispondere.' },
    'dash.tabQuestions':      { he: '📝 שאלות', en: '📝 Questions', it: '📝 Domande' },
    'dash.tabMap':            { he: '🗺️ מפת תחנות', en: '🗺️ Station map', it: '🗺️ Mappa stazioni' },
    'dash.tabBoard':          { he: '📊 לוח תוצאות', en: '📊 Leaderboard', it: '📊 Classifica' },
    'dash.tabQR':             { he: '🔲 קודי QR', en: '🔲 QR codes', it: '🔲 Codici QR' },
    'dash.tabPending':        { he: '📸 אישור תמונות', en: '📸 Photo approval', it: '📸 Approvazione foto' },
    'dash.tabSettings':       { he: '⚙️ הגדרות', en: '⚙️ Settings', it: '⚙️ Impostazioni' },
    /* map editor */
    'dash.mapTitle':          { he: '🗺️ מפת התחנות', en: '🗺️ Station map', it: '🗺️ Mappa delle stazioni' },
    'dash.mapHelp':           { he: '1) הזיזו וזמזמו את מפת הלוויין עד לתצוגה הרצויה. 2) לחצו על מספר תחנה ואז על המפה כדי למקם אותה (גרירה להזזה, לחיצה חוזרת על ✕ למחיקה). 3) "נעלו" את התצוגה כדי שהשחקנים יראו מפה קבועה, ולחצו "שמור".',
                                en: '1) Pan and zoom the satellite map to the view you want. 2) Tap a station number then tap the map to place it (drag to move, ✕ to remove). 3) "Lock" the view so players see a fixed map, then "Save".',
                                it: '1) Sposta e ingrandisci la mappa satellitare. 2) Tocca il numero di una stazione poi tocca la mappa per posizionarla (trascina per spostare, ✕ per rimuovere). 3) "Blocca" la vista così i giocatori vedono una mappa fissa, poi "Salva".' },
    'dash.mapSaveBtn':        { he: '💾 שמור מפה ותחנות', en: '💾 Save map & stations', it: '💾 Salva mappa e stazioni' },
    'dash.mapLock':           { he: '🔒 נעל תצוגה', en: '🔒 Lock view', it: '🔒 Blocca vista' },
    'dash.mapUnlock':         { he: '🔓 בטל נעילה', en: '🔓 Unlock', it: '🔓 Sblocca' },
    'dash.mapLockedBadge':    { he: 'נעול לשחקנים', en: 'Locked for players', it: 'Bloccata per i giocatori' },
    'dash.mapUnlockedBadge':  { he: 'פתוח לעריכה', en: 'Open for editing', it: 'Aperta alla modifica' },
    'dash.mapClear':          { he: '🗑️ נקה תחנות', en: '🗑️ Clear stations', it: '🗑️ Pulisci stazioni' },
    'dash.mapPlayerView':     { he: '↗️ תצוגת שחקן', en: '↗️ Player view', it: '↗️ Vista giocatore' },
    'dash.mapPrint':          { he: '🖨️ הדפס מפה (A4)', en: '🖨️ Print map (A4)', it: '🖨️ Stampa mappa (A4)' },
    'dash.saved':             { he: 'נשמר ✓', en: 'Saved ✓', it: 'Salvato ✓' },
    'dash.markerSize':        { he: '📏 גודל העיגולים:', en: '📏 Pin size:', it: '📏 Dimensione pin:' },
    'dash.myMap':             { he: 'המפה שלך', en: 'Your map', it: 'La tua mappa' },
    'dash.mapMailLabel':      { he: 'למשחקים נוספים: ', en: 'For more games: ', it: 'Per altri giochi: ' },
    'dash.choosePin':         { he: 'בחרו תחנה למיקום:', en: 'Choose a station to place:', it: 'Scegli una stazione da posizionare:' },
    'dash.clearPinsConfirm':  { he: 'למחוק את כל מיקומי התחנות מהמפה?', en: 'Remove all station locations from the map?', it: 'Rimuovere tutte le posizioni dalla mappa?' },
    'dash.mapNotLoaded':      { he: 'המפה לא נטענה', en: 'The map didn\'t load', it: 'La mappa non è stata caricata' },
    'dash.mapNetErr':         { he: 'שגיאת רשת בטעינת המפה', en: 'Network error loading the map', it: 'Errore di rete nel caricamento mappa' },
    'dash.mapSaveNetErr':     { he: 'שגיאת רשת בשמירה. בדוק חיבור ונסה שוב.', en: 'Network error while saving. Check connection and retry.', it: 'Errore di rete durante il salvataggio. Controlla la connessione.' },
    'dash.snapOutside':       { he: 'שים לב: תחנות {list} נמצאות מחוץ לתצוגה שנשמרה — הן לא יופיעו במפת השחקן. הזז/הרחק זום כך שכל התחנות בפנים ושמור שוב.', en: 'Note: stations {list} are outside the saved view — they won\'t appear on the player map. Pan/zoom out so all stations fit and save again.', it: 'Nota: le stazioni {list} sono fuori dalla vista salvata e non appariranno sulla mappa. Regola la vista e salva di nuovo.' },
    'dash.snapFail':          { he: 'צילום תצוגת המפה נכשל — השחקנים יראו בינתיים מפה חיה. נסה לשמור שוב.', en: 'Capturing the map view failed — players will see a live map for now. Try saving again.', it: 'Acquisizione della mappa non riuscita — i giocatori vedranno una mappa live. Riprova a salvare.' },
    'dash.sessionExpired':    { he: 'פג תוקף ההתחברות (השרת כנראה התאתחל). מתחבר מחדש...', en: 'Session expired (server likely restarted). Re-logging in...', it: 'Sessione scaduta (il server si è probabilmente riavviato). Riconnessione...' },
    'dash.sessionExpiredSave':{ he: 'פג תוקף ההתחברות (השרת כנראה התאתחל). התחבר מחדש ונסה לשמור שוב.', en: 'Session expired (server likely restarted). Log in again and retry saving.', it: 'Sessione scaduta. Riaccedi e riprova a salvare.' },
    'dash.saveErr':           { he: 'שגיאה בשמירה', en: 'Save error', it: 'Errore di salvataggio' },
    'dash.stationChip':       { he: 'תחנה {n}', en: 'Station {n}', it: 'Stazione {n}' },
    /* board tab */
    'dash.boardLiveTitle':    { he: '📊 לוח התוצאות החי של החברה', en: '📊 The company\'s live leaderboard', it: '📊 Classifica live dell\'azienda' },
    'dash.openFull':          { he: '↗️ פתח בחלון מלא', en: '↗️ Open full screen', it: '↗️ Apri a tutto schermo' },
    'dash.refresh':           { he: '🔄 רענן', en: '🔄 Refresh', it: '🔄 Aggiorna' },
    /* QR tab */
    'dash.baseUrl':           { he: 'כתובת בסיס (ה-URL של האתר)', en: 'Base URL (the site address)', it: 'URL base (indirizzo del sito)' },
    'dash.qrHelp':            { he: 'השאר ריק לכתובת הנוכחית. ה-QR הראשי (הצהוב) הוא נקודת הכניסה לשחקנים — תלה אותו בכניסה. שאר ה-QR לתחנות.', en: 'Leave empty for the current address. The main (yellow) QR is the players\' entry point — hang it at the entrance. The rest are for stations.', it: 'Lascia vuoto per l\'indirizzo corrente. Il QR principale (giallo) è l\'ingresso per i giocatori. Gli altri sono per le stazioni.' },
    'dash.genAll':            { he: '🔄 צור הכל', en: '🔄 Generate all', it: '🔄 Genera tutti' },
    'dash.print':             { he: '🖨️ הדפס', en: '🖨️ Print', it: '🖨️ Stampa' },
    'dash.qrGenerating':      { he: 'יוצר קודים...', en: 'Generating codes...', it: 'Generazione codici...' },
    'dash.qrMainSub':         { he: '⭐ QR ראשי - כניסה למשחק', en: '⭐ Main QR - game entry', it: '⭐ QR principale - ingresso gioco' },
    /* pending tab */
    'dash.pendingNone':       { he: 'אין תשובות תמונה הממתינות לאישור', en: 'No photo answers awaiting approval', it: 'Nessuna foto in attesa di approvazione' },
    'dash.pendingCaption':    { he: 'כיתוב: ', en: 'Caption: ', it: 'Didascalia: ' },
    'dash.approveYes':        { he: '✓ נכון', en: '✓ Correct', it: '✓ Corretto' },
    'dash.approveNo':         { he: '✗ לא', en: '✗ No', it: '✗ No' },
    /* settings tab */
    'dash.gameNameLabel':     { he: 'שם המשחק (מוצג לשחקנים)', en: 'Game name (shown to players)', it: 'Nome del gioco (mostrato ai giocatori)' },
    'dash.saveName':          { he: 'שמור שם', en: 'Save name', it: 'Salva nome' },
    'dash.gameNameSaved':     { he: 'שם המשחק נשמר', en: 'Game name saved', it: 'Nome del gioco salvato' },
    'dash.defaultLangLabel':  { he: 'שפת ברירת מחדל לשחקנים', en: 'Default language for players', it: 'Lingua predefinita per i giocatori' },
    'dash.defaultLangHint':   { he: 'השפה שבה ייפתח הממשק לשחקנים שלא בחרו שפה. השחקן תמיד יכול לשנות.', en: 'The interface language for players who haven\'t chosen one. Players can always change it.', it: 'La lingua dell\'interfaccia per i giocatori che non ne hanno scelta una. Possono sempre cambiarla.' },
    'dash.saveLang':          { he: 'שמור שפה', en: 'Save language', it: 'Salva lingua' },
    'dash.speedBonus':        { he: '⚡ בונוס מהירות', en: '⚡ Speed bonus', it: '⚡ Bonus velocità' },
    'dash.speedBonusHint':    { he: 'תשובה נכונה מהירה מזכה בבונוס שיורד בהדרגה למשך חלון הזמן.', en: 'A fast correct answer earns a bonus that decays over the time window.', it: 'Una risposta corretta veloce dà un bonus che cala nel tempo.' },
    'dash.sbEnable':          { he: 'הפעל בונוס מהירות', en: 'Enable speed bonus', it: 'Attiva bonus velocità' },
    'dash.sbMax':             { he: 'בונוס מקסימלי', en: 'Max bonus', it: 'Bonus massimo' },
    'dash.sbWindow':          { he: 'חלון זמן (שניות)', en: 'Time window (seconds)', it: 'Finestra (secondi)' },
    'dash.saveBonus':         { he: 'שמור בונוס', en: 'Save bonus', it: 'Salva bonus' },
    'dash.linksTitle':        { he: '🔗 קישורים', en: '🔗 Links', it: '🔗 Collegamenti' },
    'dash.linkBoard':         { he: '📊 לוח תוצאות: ', en: '📊 Leaderboard: ', it: '📊 Classifica: ' },
    'dash.linkCompany':       { he: '🎮 עמוד החברה: ', en: '🎮 Company page: ', it: '🎮 Pagina azienda: ' },
    'dash.linkMap':           { he: '🧭 מפת המשחק: ', en: '🧭 Game map: ', it: '🧭 Mappa del gioco: ' },
    'dash.open':              { he: 'פתח', en: 'Open', it: 'Apri' },
    'dash.moreGamesTitle':    { he: '✉️ משחקים נוספים', en: '✉️ More games', it: '✉️ Altri giochi' },
    'dash.resetTitle':        { he: '⚠️ איפוס משחק', en: '⚠️ Reset game', it: '⚠️ Reset gioco' },
    'dash.resetHint':         { he: 'מוחק שחקנים ותשובות של חברה זו (השאלות נשמרות).', en: 'Deletes this company\'s players and answers (questions are kept).', it: 'Elimina giocatori e risposte di questa azienda (le domande restano).' },
    'dash.resetBtn':          { he: 'אפס משחק', en: 'Reset game', it: 'Reset gioco' },
    'dash.resetConfirm':      { he: 'בטוח? כל השחקנים והתשובות של חברה זו יימחקו', en: 'Are you sure? All this company\'s players and answers will be deleted', it: 'Sicuro? Tutti i giocatori e le risposte saranno eliminati' },
    'dash.resetDone':         { he: 'המשחק אופס', en: 'Game reset', it: 'Gioco azzerato' },
    'dash.logout':            { he: '🚪 יציאה', en: '🚪 Log out', it: '🚪 Esci' },
    /* questions tab */
    'dash.qSetsTitle':        { he: '📁 סטים של שאלות', en: '📁 Question sets', it: '📁 Set di domande' },
    'dash.qSetsHint':         { he: 'גבו את השאלות לקובץ במחשב, טענו סט שמור, או ערכו קובץ חיצונית וטענו אותו. הטעינה מחליפה את כל 10 השאלות.', en: 'Back up questions to a file, load a saved set, or edit a file externally and load it. Loading replaces all 10 questions.', it: 'Salva le domande in un file, carica un set salvato o modifica un file esterno e caricalo. Il caricamento sostituisce tutte le 10 domande.' },
    'dash.exportFile':        { he: '⬇️ ייצוא לקובץ', en: '⬇️ Export to file', it: '⬇️ Esporta su file' },
    'dash.importFile':        { he: '⬆️ טעינה מקובץ', en: '⬆️ Load from file', it: '⬆️ Carica da file' },
    'dash.importConfirm':     { he: 'הטעינה תחליף את כל 10 השאלות הנוכחיות בחברה זו. להמשיך?', en: 'Loading will replace all 10 current questions for this company. Continue?', it: 'Il caricamento sostituirà tutte le 10 domande. Continuare?' },
    'dash.importBadJson':     { he: 'הקובץ אינו JSON תקין', en: 'The file is not valid JSON', it: 'Il file non è un JSON valido' },
    'dash.importNoStations':  { he: 'קובץ לא תקין - חסרה רשימת שאלות (stations)', en: 'Invalid file - missing questions list (stations)', it: 'File non valido - manca l\'elenco domande (stations)' },
    'dash.importErr':         { he: 'שגיאה בטעינה', en: 'Load error', it: 'Errore di caricamento' },
    'dash.importOk':          { he: 'נטען בהצלחה ✓', en: 'Loaded successfully ✓', it: 'Caricato ✓' },
    'dash.exportErr':         { he: 'שגיאה בייצוא', en: 'Export error', it: 'Errore di esportazione' },
    'dash.qType':             { he: 'סוג שאלה', en: 'Question type', it: 'Tipo di domanda' },
    'dash.qTypeText':         { he: 'תשובת טקסט', en: 'Text answer', it: 'Risposta testo' },
    'dash.qTypePhoto':        { he: 'תשובת תמונה (משימה)', en: 'Photo answer (task)', it: 'Risposta foto (missione)' },
    'dash.qPoints':           { he: 'נקודות', en: 'Points', it: 'Punti' },
    'dash.qText':             { he: 'השאלה / המשימה', en: 'Question / task', it: 'Domanda / missione' },
    'dash.qCorrect':          { he: 'תשובה נכונה', en: 'Correct answer', it: 'Risposta corretta' },
    'dash.qCorrectHint':      { he: '(מילות מפתח מופרדות בפסיק)', en: '(keywords separated by commas)', it: '(parole chiave separate da virgole)' },
    'dash.qImage':            { he: 'תמונה לשאלה (אופציונלי)', en: 'Question image (optional)', it: 'Immagine domanda (opzionale)' },
    'dash.qImageLink':        { he: 'או לינק לתמונה', en: 'or image link', it: 'o link immagine' },
    'dash.qRemoveImage':      { he: 'הסר תמונה', en: 'Remove image', it: 'Rimuovi immagine' },
    'dash.qSaveStation':      { he: '💾 שמור תחנה {n}', en: '💾 Save station {n}', it: '💾 Salva stazione {n}' },

    /* ---------- ספריית חבילות (dashboard) ---------- */
    'dash.tabLibrary':        { he: '📚 ספריית חבילות', en: '📚 Pack library', it: '📚 Libreria pacchetti' },
    'lib.browseTitle':        { he: '📚 חבילות שאלות מוכנות', en: '📚 Ready-made question packs', it: '📚 Pacchetti di domande pronti' },
    'lib.browseHint':         { he: 'בחרו חבילה וטענו עותק לחברה שלכם. תוכלו לערוך אותה אחר כך בטאב "שאלות" בלי לשנות את החבילה המקורית.', en: 'Pick a pack and load a copy into your company. You can then edit it in the "Questions" tab without changing the original pack.', it: 'Scegli un pacchetto e caricane una copia nella tua azienda. Potrai modificarlo nella scheda "Domande" senza alterare l\'originale.' },
    'lib.filterLang':         { he: 'שפה', en: 'Language', it: 'Lingua' },
    'lib.filterStyle':        { he: 'סגנון', en: 'Style', it: 'Stile' },
    'lib.filterAge':          { he: 'גילאים', en: 'Ages', it: 'Età' },
    'lib.all':                { he: 'הכל', en: 'All', it: 'Tutti' },
    'lib.empty':              { he: 'אין עדיין חבילות בספרייה.', en: 'No packs in the library yet.', it: 'Nessun pacchetto nella libreria.' },
    'lib.noMatch':            { he: 'אין חבילות שתואמות את הסינון.', en: 'No packs match the filter.', it: 'Nessun pacchetto corrisponde al filtro.' },
    'lib.questions':          { he: 'שאלות', en: 'questions', it: 'domande' },
    'lib.uses':               { he: 'שימושים', en: 'plays', it: 'utilizzi' },
    'lib.load':               { he: '⬇️ טען לחברה שלי', en: '⬇️ Load to my company', it: '⬇️ Carica nella mia azienda' },
    'lib.preview':            { he: '👁️ תצוגה מקדימה', en: '👁️ Preview', it: '👁️ Anteprima' },
    'lib.loadConfirm':        { he: 'לטעון את החבילה "{name}"? הפעולה תחליף את כל 10 השאלות הנוכחיות בחברה שלך (תוכל לערוך אחר כך).', en: 'Load the pack "{name}"? This replaces all 10 current questions in your company (you can edit afterward).', it: 'Caricare il pacchetto "{name}"? Sostituirà tutte le 10 domande attuali (potrai modificarle dopo).' },
    'lib.loaded':             { he: 'החבילה "{name}" נטענה ✓ עברו לטאב "שאלות" כדי לערוך.', en: 'Pack "{name}" loaded ✓ Go to the "Questions" tab to edit.', it: 'Pacchetto "{name}" caricato ✓ Vai alla scheda "Domande" per modificare.' },
    'lib.loadErr':            { he: 'שגיאה בטעינת החבילה', en: 'Error loading the pack', it: 'Errore nel caricamento' },
    'lib.previewTitle':       { he: 'תצוגה מקדימה: {name}', en: 'Preview: {name}', it: 'Anteprima: {name}' },
    'lib.close':              { he: 'סגור', en: 'Close', it: 'Chiudi' },
    /* ניהול ספרייה (מנהל-על) */
    'lib.manageTitle':        { he: '📚 ניהול ספריית החבילות', en: '📚 Manage pack library', it: '📚 Gestione libreria' },
    'lib.manageHint':         { he: 'רק מנהל ראשי יכול ליצור/לערוך/למחוק חבילות. מנהלי החברות טוענים עותק בלבד.', en: 'Only the super admin can create/edit/delete packs. Company managers load copies only.', it: 'Solo il super admin può creare/modificare/eliminare. I manager caricano solo copie.' },
    'lib.uploadPack':         { he: '⬆️ העלאת חבילה מקובץ', en: '⬆️ Upload pack from file', it: '⬆️ Carica da file' },
    'lib.packName':           { he: 'שם החבילה', en: 'Pack name', it: 'Nome pacchetto' },
    'lib.packStyle':          { he: 'סגנון (למשל: צורות, חיות, חשיבה)', en: 'Style (e.g. shapes, animals, logic)', it: 'Stile (es. forme, animali, logica)' },
    'lib.packAge':            { he: 'גילאים (למשל: 13, 10+, 25)', en: 'Ages (e.g. 13, 10+, 25)', it: 'Età (es. 13, 10+, 25)' },
    'lib.packDesc':           { he: 'תיאור קצר (אופציונלי)', en: 'Short description (optional)', it: 'Breve descrizione (opzionale)' },
    'lib.editPack':           { he: '✏️ ערוך', en: '✏️ Edit', it: '✏️ Modifica' },
    'lib.deletePack':         { he: '🗑️ מחק', en: '🗑️ Delete', it: '🗑️ Elimina' },
    'lib.deleteConfirm':      { he: 'למחוק את החבילה "{name}" מהספרייה לצמיתות? חברות שכבר טענו אותה לא יושפעו.', en: 'Permanently delete the pack "{name}" from the library? Companies that already loaded it are unaffected.', it: 'Eliminare definitivamente "{name}"? Le aziende che l\'hanno già caricato non saranno toccate.' },
    'lib.saved':              { he: 'נשמר ✓', en: 'Saved ✓', it: 'Salvato ✓' },
    'lib.created':            { he: 'החבילה נוצרה ✓', en: 'Pack created ✓', it: 'Pacchetto creato ✓' },
    'lib.editingPack':        { he: 'עורך חבילה: {name}', en: 'Editing pack: {name}', it: 'Modifica pacchetto: {name}' },
    'lib.saveAsNew':          { he: '💾 צור חבילה', en: '💾 Create pack', it: '💾 Crea pacchetto' },
    'lib.saveChanges':        { he: '💾 שמור שינויים', en: '💾 Save changes', it: '💾 Salva modifiche' },
    'lib.cancel':             { he: 'ביטול', en: 'Cancel', it: 'Annulla' },
    'lib.langHe':             { he: 'עברית 🇮🇱', en: 'Hebrew 🇮🇱', it: 'Ebraico 🇮🇱' },
    'lib.langEn':             { he: 'אנגלית 🇺🇸', en: 'English 🇺🇸', it: 'Inglese 🇺🇸' },
    'lib.langIt':             { he: 'איטלקית 🇮🇹', en: 'Italian 🇮🇹', it: 'Italiano 🇮🇹' },
    'lib.uploadConfirm':      { he: 'להוסיף את הקובץ כחבילה חדשה לספרייה?', en: 'Add this file as a new pack to the library?', it: 'Aggiungere questo file come nuovo pacchetto?' },
    'lib.saveCurrentBtn':     { he: '📥 שמור את שאלות החברה הנוכחית כחבילה', en: '📥 Save current company questions as a pack', it: '📥 Salva le domande attuali come pacchetto' },
    'lib.saveCurrentHint':    { he: 'בנה תוכן בטאב "שאלות" (כולל תמונות), ואז שמור אותו כחבילה חדשה לספרייה. דרך נוחה ליצור חבילות עם תמונות.', en: 'Build content in the "Questions" tab (with images), then save it as a new library pack. The easy way to create image packs.', it: 'Crea contenuti nella scheda "Domande" (con immagini), poi salvali come nuovo pacchetto.' },
    'lib.saveCurrentTitle':   { he: '📥 שמירת השאלות הנוכחיות כחבילה', en: '📥 Save current questions as a pack', it: '📥 Salva domande come pacchetto' },
    'lib.saveCurrentDone':    { he: 'נשמר כחבילה "{name}" בספרייה ✓', en: 'Saved as pack "{name}" in the library ✓', it: 'Salvato come pacchetto "{name}" ✓' },
    'lib.superManageHint':    { he: 'ערוך מטא-דאטה, מחק או העלה חבילות. כדי לבנות תוכן חדש עם תמונות — היכנס לחברה כלשהי, בנה בטאב "שאלות", ושמור כחבילה.', en: 'Edit metadata, delete or upload packs. To build new content with images — open any company, build it in the "Questions" tab, and save as a pack.', it: 'Modifica metadati, elimina o carica pacchetti. Per creare nuovi contenuti con immagini — apri un\'azienda, crea nella scheda "Domande" e salva come pacchetto.' },
    'lib.superBrowseHint':    { he: 'כל החבילות בספרייה. עיין, צפה בתצוגה מקדימה, ערוך מטא או מחק.', en: 'All packs in the library. Browse, preview, edit metadata or delete.', it: 'Tutti i pacchetti nella libreria. Sfoglia, anteprima, modifica metadati o elimina.' },

    /* ---------- דף הסבר למנהל חברה (dashboard) ---------- */
    'dash.tabHelp':           { he: '❓ מדריך', en: '❓ Guide', it: '❓ Guida' },
    'help.title':             { he: '📖 מדריך למנהל', en: '📖 Manager guide', it: '📖 Guida per il manager' },
    'help.intro':             { he: 'ברוכים הבאים! המדריך הקצר הזה מסביר איך להכין ולנהל את המשחק מתחילתו ועד סופו.', en: 'Welcome! This short guide explains how to set up and run your game from start to finish.', it: 'Benvenuto! Questa breve guida spiega come preparare e gestire il gioco dall\'inizio alla fine.' },
    'help.s1Title':           { he: '1️⃣ בניית השאלות', en: '1️⃣ Building the questions', it: '1️⃣ Creare le domande' },
    'help.s1Body':            { he: 'בטאב "שאלות" יש 10 תחנות. לכל תחנה: כותרת, סוג (תשובת טקסט או משימת תמונה), השאלה, ותשובה נכונה (מילות מפתח מופרדות בפסיק). אפשר להוסיף תמונה לשאלה. לחצו "שמור תחנה" אחרי כל שינוי.', en: 'The "Questions" tab has 10 stations. Each has: a title, a type (text answer or photo mission), the question, and the correct answer (keywords separated by commas). You can add an image. Click "Save station" after each change.', it: 'La scheda "Domande" ha 10 stazioni. Ognuna ha: titolo, tipo (risposta testo o missione foto), domanda e risposta corretta (parole chiave separate da virgole). Puoi aggiungere un\'immagine. Clicca "Salva stazione" dopo ogni modifica.' },
    'help.s2Title':           { he: '2️⃣ חבילות מוכנות', en: '2️⃣ Ready-made packs', it: '2️⃣ Pacchetti pronti' },
    'help.s2Body':            { he: 'בטאב "ספריית חבילות" אפשר לטעון חבילת שאלות מוכנה לחברה שלכם. סננו לפי שפה/סגנון/גילאים, צפו בתצוגה מקדימה, ולחצו "טען לחברה שלי". הטעינה מחליפה את 10 השאלות — ואז אפשר לערוך אותן בטאב "שאלות" בלי לפגוע בחבילה המקורית.', en: 'In the "Pack library" tab you can load a ready-made question pack into your company. Filter by language/style/age, preview, then click "Load to my company". Loading replaces the 10 questions — you can then edit them in the "Questions" tab without affecting the original pack.', it: 'Nella scheda "Libreria pacchetti" puoi caricare un pacchetto pronto nella tua azienda. Filtra per lingua/stile/età, visualizza l\'anteprima e clicca "Carica nella mia azienda". Il caricamento sostituisce le 10 domande — poi puoi modificarle senza alterare l\'originale.' },
    'help.s3Title':           { he: '3️⃣ גיבוי וטעינה מקובץ', en: '3️⃣ Backup & file load', it: '3️⃣ Backup e caricamento file' },
    'help.s3Body':            { he: 'בראש טאב "שאלות": "ייצוא לקובץ" שומר את כל השאלות שלכם כקובץ במחשב (גיבוי). "טעינה מקובץ" מעלה קובץ כזה בחזרה. שימושי לשמור גרסאות או להעביר בין חברות.', en: 'At the top of the "Questions" tab: "Export to file" saves all your questions as a file on your computer (backup). "Load from file" uploads such a file back. Useful for keeping versions or moving between companies.', it: 'In cima alla scheda "Domande": "Esporta su file" salva tutte le domande come file (backup). "Carica da file" ricarica un file. Utile per salvare versioni o spostare tra aziende.' },
    'help.s4Title':           { he: '4️⃣ מפת התחנות', en: '4️⃣ The station map', it: '4️⃣ La mappa delle stazioni' },
    'help.s4Body':            { he: 'בטאב "מפת תחנות": הזיזו וזמזמו את מפת הלוויין, לחצו על מספר תחנה ואז על המפה כדי למקם אותה. "נעלו" את התצוגה כדי שהשחקנים יראו מפה קבועה, ולחצו "שמור". אפשר גם להדפיס את המפה.', en: 'In the "Station map" tab: pan and zoom the satellite map, tap a station number then tap the map to place it. "Lock" the view so players see a fixed map, then "Save". You can also print the map.', it: 'Nella scheda "Mappa stazioni": sposta e ingrandisci la mappa, tocca il numero di una stazione poi la mappa per posizionarla. "Blocca" la vista così i giocatori vedono una mappa fissa, poi "Salva". Puoi anche stampare la mappa.' },
    'help.s5Title':           { he: '5️⃣ קודי QR', en: '5️⃣ QR codes', it: '5️⃣ Codici QR' },
    'help.s5Body':            { he: 'בטאב "קודי QR": לחצו "צור הכל". ה-QR הצהוב הראשי הוא נקודת הכניסה — תלו אותו בכניסה. שאר ה-QR שייכים לתחנות — תלו כל אחד במקום המתאים. אפשר להדפיס הכול.', en: 'In the "QR codes" tab: click "Generate all". The main yellow QR is the entry point — hang it at the entrance. The rest belong to stations — hang each at its spot. You can print everything.', it: 'Nella scheda "Codici QR": clicca "Genera tutti". Il QR giallo principale è l\'ingresso — appendilo all\'entrata. Gli altri sono delle stazioni — appendi ciascuno al suo posto. Puoi stampare tutto.' },
    'help.s6Title':           { he: '6️⃣ במהלך המשחק: תוצאות ואישורים', en: '6️⃣ During the game: scores & approvals', it: '6️⃣ Durante il gioco: punteggi e approvazioni' },
    'help.s6Body':            { he: 'טאב "לוח תוצאות" מציג את הדירוג החי. טאב "אישור תמונות" — כאן מאשרים או דוחים תשובות-תמונה של שחקנים (משימות). אישור מזכה את השחקן בנקודות.', en: 'The "Leaderboard" tab shows the live ranking. The "Photo approval" tab is where you approve or reject players\' photo answers (missions). Approval awards the player points.', it: 'La scheda "Classifica" mostra la graduatoria live. La scheda "Approvazione foto" è dove approvi o rifiuti le risposte-foto (missioni). L\'approvazione assegna i punti.' },
    'help.s7Title':           { he: '7️⃣ הגדרות', en: '7️⃣ Settings', it: '7️⃣ Impostazioni' },
    'help.s7Body':            { he: 'בטאב "הגדרות": שם המשחק, שפת ברירת המחדל לשחקנים, בונוס מהירות (נקודות נוספות לתשובה מהירה), קישורים מהירים, ואיפוס המשחק (מוחק שחקנים ותשובות, השאלות נשמרות).', en: 'In "Settings": game name, default language for players, speed bonus (extra points for fast answers), quick links, and game reset (clears players and answers; questions are kept).', it: 'In "Impostazioni": nome del gioco, lingua predefinita, bonus velocità (punti extra per risposte rapide), link rapidi e reset del gioco (cancella giocatori e risposte; le domande restano).' },
    'help.tipTitle':          { he: '💡 טיפ חשוב', en: '💡 Important tip', it: '💡 Consiglio importante' },
    'help.tipBody':           { he: 'לפני האירוע ודאו שיש קליטה סלולרית טובה במקום המשחק — בלעדיה השחקנים לא יוכלו לסרוק, לראות מפה או לענות.', en: 'Before the event, make sure there is good cellular signal at the venue — without it players can\'t scan, see the map or answer.', it: 'Prima dell\'evento, assicurati che ci sia buon segnale cellulare nel luogo — senza, i giocatori non potranno scansionare, vedere la mappa o rispondere.' },

    /* ---------- דף הסבר לשחקנים ---------- */
    'phelp.btn':              { he: '❓ איך משחקים', en: '❓ How to play', it: '❓ Come si gioca' },
    'phelp.title':            { he: '🎮 איך משחקים', en: '🎮 How to play', it: '🎮 Come si gioca' },
    'phelp.s1':               { he: '1. הצטרפו למשחק עם השם שלכם ובחרו קבוצה.', en: '1. Join the game with your name and pick a team.', it: '1. Unisciti al gioco con il tuo nome e scegli una squadra.' },
    'phelp.s2':               { he: '2. חפשו בשטח את תחנות ה-QR. בכל תחנה — סרקו את הקוד דרך כפתור הסריקה במשחק.', en: '2. Find the QR stations around the area. At each one, scan the code using the scan button in the game.', it: '2. Trova le stazioni QR nell\'area. Ad ognuna, scansiona il codice con il pulsante di scansione del gioco.' },
    'phelp.s3':               { he: '3. ענו על השאלה. בשאלת טקסט — הקלידו תשובה. במשימת תמונה — צלמו ושלחו תמונה.', en: '3. Answer the question. For a text question — type your answer. For a photo mission — take and send a photo.', it: '3. Rispondi alla domanda. Domanda di testo — scrivi la risposta. Missione foto — scatta e invia una foto.' },
    'phelp.s4':               { he: '4. תשובה נכונה מזכה בנקודות. תשובה מהירה יכולה לזכות בבונוס מהירות! ⚡', en: '4. A correct answer earns points. A fast answer can earn a speed bonus! ⚡', it: '4. Una risposta corretta dà punti. Una risposta veloce può dare un bonus velocità! ⚡' },
    'phelp.s5':               { he: '5. עקבו אחרי ההתקדמות שלכם במסך "ההתקדמות שלי", וראו את הדירוג ב"לוח התוצאות".', en: '5. Track your progress on the "My progress" screen, and see the ranking on the "Leaderboard".', it: '5. Segui i tuoi progressi nella schermata "I miei progressi" e guarda la classifica nella "Classifica".' },
    'phelp.s6':               { he: '6. השתמשו ב"מפת המשחק" כדי לראות איפה התחנות.', en: '6. Use the "Game map" to see where the stations are.', it: '6. Usa la "Mappa del gioco" per vedere dove sono le stazioni.' },
    'phelp.goal':             { he: '🏆 המטרה: לסרוק את כל התחנות, לענות נכון, ולצבור הכי הרבה נקודות. בהצלחה!', en: '🏆 The goal: scan all stations, answer correctly, and earn the most points. Good luck!', it: '🏆 L\'obiettivo: scansiona tutte le stazioni, rispondi correttamente e ottieni più punti. Buona fortuna!' },
    'phelp.close':            { he: 'הבנתי, בואו נתחיל!', en: 'Got it, let\'s start!', it: 'Capito, iniziamo!' },

    /* ---------- בילינג: טאב מנהל-על בדשבורד ---------- */
    'dash.tabBilling':        { he: '💳 בילינג', en: '💳 Billing', it: '💳 Fatturazione' },
    'dash.billingCfgTitle':   { he: '⚙️ הגדרות PayPal', en: '⚙️ PayPal settings', it: '⚙️ Impostazioni PayPal' },
    'dash.billingCfgHint':    { he: 'מצב sandbox = בדיקות עם כסף מדומה. החלפה ל-live כשהחשבון האמיתי מוכן — בלי לשנות קוד.', en: 'Sandbox mode = testing with fake money. Switch to live once the real account is ready — no code changes needed.', it: 'Modalità sandbox = test con denaro fittizio. Passa a live quando l\'account reale è pronto — nessuna modifica al codice.' },
    'dash.billingMode':       { he: 'מצב', en: 'Mode', it: 'Modalità' },
    'dash.billingPrice':      { he: 'מחיר שבועי', en: 'Weekly price', it: 'Prezzo settimanale' },
    'dash.billingCurrency':   { he: 'מטבע', en: 'Currency', it: 'Valuta' },
    'dash.billingSecretPh':   { he: 'הזן כדי לעדכן', en: 'Enter to update', it: 'Inserisci per aggiornare' },
    'dash.saveBtn':           { he: '💾 שמור', en: '💾 Save', it: '💾 Salva' },
    'dash.billingSecretSet':  { he: '🔒 Secret מוגדר', en: '🔒 Secret is set', it: '🔒 Secret impostato' },
    'dash.billingSecretMissing': { he: '⚠️ עדיין לא הוזן Secret', en: '⚠️ No secret entered yet', it: '⚠️ Secret non ancora inserito' },
    'dash.billingCompaniesTitle': { he: '📋 חברות במחזור בילינג', en: '📋 Companies under billing cycle', it: '📋 Aziende nel ciclo di fatturazione' },
    'dash.billingNoCompanies': { he: 'אין עדיין חברות שנוצרו דרך תשלום', en: 'No companies created via payment yet', it: 'Nessuna azienda creata tramite pagamento' },
    'dash.billingAdminCtl':   { he: '👤 שליטה ידנית (אדמין)', en: '👤 Manual control (admin)', it: '👤 Controllo manuale (admin)' },
    'dash.billingAuto':       { he: '⚙️ אוטומטי', en: '⚙️ Automatic', it: '⚙️ Automatico' },
    'dash.billingDisablesOn': { he: 'כבוי אוטומטית ב-{date}', en: 'Auto-disables on {date}', it: 'Si disattiva il {date}' },
    'dash.billingDeletesOn':  { he: 'נמחק אוטומטית ב-{date}', en: 'Auto-deletes on {date}', it: 'Si elimina il {date}' },

    /* ---------- עמוד בילינג ציבורי (billing.html) — שיווקי + תשלום ---------- */
    'billing.heroTitle':      { he: 'משחק חברה', en: 'Family Game', it: 'Gioco di Squadra' },
    'billing.heroSubtitle':   { he: 'מערכת תחנות QR לאירועי גיבוש משפחתיים וחברתיים', en: 'A QR-station game system for family and team-building events', it: 'Un sistema di stazioni QR per eventi di famiglia e team building' },
    'billing.heroCta':        { he: '🚀 התחילו עכשיו', en: '🚀 Get started now', it: '🚀 Inizia ora' },
    'billing.featTitle':      { he: 'מה מקבלים', en: "What's included", it: 'Cosa è incluso' },
    'billing.feat1Title':     { he: '🗺️ תחנות מותאמות', en: '🗺️ Custom stations', it: '🗺️ Stazioni personalizzate' },
    'billing.feat1Body':      { he: 'עד 10 תחנות שאלות עם תמונות, מפת לוויין ו-QR להדפסה', en: 'Up to 10 question stations with images, satellite map and printable QR codes', it: 'Fino a 10 stazioni con immagini, mappa satellitare e QR da stampare' },
    'billing.feat2Title':     { he: '📊 לוח תוצאות חי', en: '📊 Live leaderboard', it: '📊 Classifica live' },
    'billing.feat2Body':      { he: 'נקודות, בונוס מהירות וקבוצות מתעדכנים בזמן אמת על כל מכשיר', en: 'Points, speed bonus and teams update live on every device', it: 'Punti, bonus velocità e squadre si aggiornano in tempo reale' },
    'billing.feat3Title':     { he: '🌍 שלוש שפות', en: '🌍 Three languages', it: '🌍 Tre lingue' },
    'billing.feat3Body':      { he: 'ממשק מלא בעברית, אנגלית ואיטלקית — כל שחקן בוחר לעצמו', en: 'Full interface in Hebrew, English and Italian — each player picks their own', it: 'Interfaccia completa in ebraico, inglese e italiano — ognuno scegli la propria' },
    'billing.planTitle':      { he: 'איך זה עובד', en: 'How it works', it: 'Come funziona' },
    'billing.step1Title':     { he: '1. שבוע מלא להכין ולשחק', en: '1. A full week to prepare and play', it: '1. Una settimana piena per preparare e giocare' },
    'billing.step1Body':      { he: 'מרגע התשלום יש לכם 7 ימים עם גישה מלאה — להכין שאלות, להדפיס QR ולשחק עם המשפחה.', en: 'From the moment of payment you get 7 days of full access — prepare questions, print QR codes, and play with your family.', it: 'Dal momento del pagamento avete 7 giorni di accesso completo — preparate le domande, stampate i QR e giocate con la famiglia.' },
    'billing.step2Title':     { he: '2. אחרי שבוע — השבתה זמנית', en: '2. After a week — temporary pause', it: '2. Dopo una settimana — pausa temporanea' },
    'billing.step2Body':      { he: 'בסוף השבוע החשבון נכבה אוטומטית. אפשר לחזור ולשלם בכל רגע כדי להאריך עוד שבוע — בלי לאבד מידע.', en: 'At the end of the week the account is automatically disabled. You can pay again at any time to extend another week — no data is lost.', it: 'Alla fine della settimana l\'account si disattiva automaticamente. Potete pagare di nuovo in qualsiasi momento per un\'altra settimana — nessun dato viene perso.' },
    'billing.step3Title':     { he: '3. אחרי שבועיים ללא תשלום — מחיקה', en: '3. After two weeks unpaid — deletion', it: '3. Dopo due settimane senza pagamento — eliminazione' },
    'billing.step3Body':      { he: 'אם לא מתבצע תשלום נוסף, כל המידע (שאלות, שחקנים, תוצאות) נמחק לצמיתות מהשרת שבוע אחרי ההשבתה.', en: 'If no further payment is made, all data (questions, players, results) is permanently deleted from the server one week after disabling.', it: 'Se non viene effettuato un altro pagamento, tutti i dati (domande, giocatori, risultati) vengono eliminati definitivamente una settimana dopo la disattivazione.' },
    'billing.secureTitle':    { he: '🔒 תשלום מאובטח', en: '🔒 Secure payment', it: '🔒 Pagamento sicuro' },
    'billing.secureBody':     { he: 'הסליקה מתבצעת ישירות באתר PayPal המאובטח. אנחנו לא רואים ולא שומרים את פרטי הכרטיס שלכם בשום שלב — PayPal מטפל בכל התשלום.', en: 'Payment is processed directly on PayPal\'s secure site. We never see or store your card details at any point — PayPal handles the entire transaction.', it: 'Il pagamento avviene direttamente sul sito sicuro di PayPal. Non vediamo né conserviamo i dati della vostra carta in nessun momento — PayPal gestisce l\'intera transazione.' },
    'billing.sandboxNotice':  { he: '🧪 המערכת כרגע במצב בדיקה (Sandbox) — אין חיוב אמיתי.', en: '🧪 The system is currently in test mode (Sandbox) — no real charge will be made.', it: '🧪 Il sistema è attualmente in modalità test (Sandbox) — nessun addebito reale.' },
    'billing.formTitle':      { he: 'פתיחת חברה חדשה', en: 'Open a new company', it: 'Apri una nuova azienda' },
    'billing.formName':       { he: 'שם החברה / המשפחה', en: 'Company / family name', it: 'Nome azienda / famiglia' },
    'billing.formNamePh':     { he: 'למשל: משפחת כהן', en: 'e.g. The Smith Family', it: 'es. Famiglia Rossi' },
    'billing.formPass':       { he: 'סיסמה למנהל', en: 'Manager password', it: 'Password amministratore' },
    'billing.formPassPh':     { he: 'לפחות 4 תווים', en: 'At least 4 characters', it: 'Almeno 4 caratteri' },
    'billing.formEmail':      { he: 'אימייל (לקבלות ועדכונים)', en: 'Email (for receipts and updates)', it: 'Email (per ricevute e aggiornamenti)' },
    'billing.formEmailPh':    { he: 'name@example.com', en: 'name@example.com', it: 'name@example.com' },
    'billing.fillFirst':      { he: 'נא למלא שם וסיסמה לפני התשלום', en: 'Please fill in name and password before paying', it: 'Compila nome e password prima di pagare' },
    'billing.payError':       { he: 'אירעה שגיאה בתשלום, נסו שוב', en: 'A payment error occurred, please try again', it: 'Si è verificato un errore di pagamento, riprova' },
    'billing.successTitle':   { he: '🎉 התשלום הצליח!', en: '🎉 Payment successful!', it: '🎉 Pagamento riuscito!' },
    'billing.successBody':    { he: 'החברה שלכם נוצרה ופעילה לשבוע מלא. שמרו את הפרטים האלה:', en: 'Your company has been created and is active for a full week. Save these details:', it: 'La vostra azienda è stata creata ed è attiva per una settimana intera. Salvate questi dati:' },
    'billing.goToDashboard':  { he: '🎮 כניסה לדשבורד הניהול', en: '🎮 Go to management dashboard', it: '🎮 Vai alla dashboard di gestione' },
    'billing.warningsTitle':  { he: '⚠️ לב הדברים שכדאי לדעת', en: '⚠️ Important things to know', it: '⚠️ Cose importanti da sapere' },
    'billing.perWeek':        { he: 'לשבוע', en: 'per week', it: 'a settimana' },
    'billing.warn1':          { he: 'גישה מלאה לשבוע אחד מרגע התשלום', en: 'Full access for one week from the moment of payment', it: 'Accesso completo per una settimana dal pagamento' },
    'billing.warn2':          { he: 'בסוף השבוע — השבתה אוטומטית (אפשר להאריך בתשלום)', en: 'At the end of the week — automatic disabling (extend by paying again)', it: 'Alla fine della settimana — disattivazione automatica (estendibile pagando di nuovo)' },
    'billing.warn3':          { he: 'שבוע נוסף ללא תשלום = מחיקה סופית של כל המידע', en: 'Another week unpaid = permanent deletion of all data', it: 'Un\'altra settimana senza pagamento = eliminazione definitiva di tutti i dati' }
  };

  /* =================================================================
     מנוע התרגום
     ================================================================= */
  function t(key, vars) {
    var entry = DICT[key];
    var s = entry ? (entry[current] != null ? entry[current] : entry.he) : key;
    if (vars) {
      s = s.replace(/\{(\w+)\}/g, function (m, k) {
        return (vars[k] != null) ? vars[k] : m;
      });
    }
    return s;
  }

  function applyLang() {
    var doc = global.document;
    if (!doc) return;
    // dir + lang על <html>
    doc.documentElement.setAttribute('lang', current);
    doc.documentElement.setAttribute('dir', RTL[current] ? 'rtl' : 'ltr');

    // textContent
    doc.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    // innerHTML (לטקסטים עם <b>/<br> וכו')
    doc.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      el.innerHTML = t(el.getAttribute('data-i18n-html'));
    });
    // placeholder
    doc.querySelectorAll('[data-i18n-ph]').forEach(function (el) {
      el.setAttribute('placeholder', t(el.getAttribute('data-i18n-ph')));
    });
    // title (tooltip)
    doc.querySelectorAll('[data-i18n-title]').forEach(function (el) {
      el.setAttribute('title', t(el.getAttribute('data-i18n-title')));
    });
    // aria-label
    doc.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
    });
    // <title> של העמוד אם סומן
    var titleEl = doc.querySelector('title[data-i18n]');
    if (titleEl) doc.title = t(titleEl.getAttribute('data-i18n'));

    // עדכון מצב פעיל בכל בוררי הדגלים
    doc.querySelectorAll('.fg-lang-picker [data-lang]').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-lang') === current);
    });
  }

  function setLang(lang) {
    if (LANGS.indexOf(lang) === -1) return;
    current = lang;
    try { localStorage.setItem(STORE_KEY, lang); } catch (e) {}
    applyLang();
    // אירוע לכל קוד עמוד שצריך לרנדר מחדש טקסט דינמי (טבלאות, כרטיסים...)
    try {
      global.document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: lang } }));
    } catch (e) {}
  }

  function getLang() { return current; }
  function isRTL() { return !!RTL[current]; }

  /* =================================================================
     בורר דגלים — מזריק CSS פעם אחת, מרנדר כפתורים
     renderLangPicker('elemId')  או  renderLangPicker(element, {compact:true})
     ================================================================= */
  function injectCSS() {
    var doc = global.document;
    if (doc.getElementById('fg-lang-css')) return;
    var css =
      '.fg-lang-picker{display:inline-flex;gap:6px;direction:ltr;}' +
      '.fg-lang-picker button{font-family:inherit;cursor:pointer;border:2px solid rgba(0,0,0,.12);' +
      'background:rgba(255,255,255,.9);border-radius:10px;padding:5px 9px;font-size:15px;line-height:1;' +
      'display:inline-flex;align-items:center;gap:5px;transition:transform .12s,border-color .12s,box-shadow .12s;}' +
      '.fg-lang-picker button .lbl{font-size:12px;font-weight:700;color:#1a2a4a;}' +
      '.fg-lang-picker button:hover{transform:translateY(-1px);}' +
      '.fg-lang-picker button.active{border-color:#f0a500;box-shadow:0 0 0 2px rgba(240,165,0,.35);}' +
      '.fg-lang-picker.compact button .lbl{display:none;}' +
      '.fg-lang-picker.compact button{padding:5px 7px;font-size:17px;}';
    var st = doc.createElement('style');
    st.id = 'fg-lang-css';
    st.textContent = css;
    doc.head.appendChild(st);
  }

  function renderLangPicker(target, opts) {
    var doc = global.document;
    if (!doc) return;
    opts = opts || {};
    var el = (typeof target === 'string') ? doc.getElementById(target) : target;
    if (!el) return;
    injectCSS();
    el.classList.add('fg-lang-picker');
    if (opts.compact) el.classList.add('compact');
    el.innerHTML = LANGS.map(function (l) {
      return '<button type="button" data-lang="' + l + '"' +
        (l === current ? ' class="active"' : '') +
        ' aria-label="' + LANG_NAME[l] + '">' +
        '<span class="flag">' + FLAG[l] + '</span>' +
        '<span class="lbl">' + LANG_NAME[l] + '</span></button>';
    }).join('');
    el.querySelectorAll('button[data-lang]').forEach(function (b) {
      b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); });
    });
  }

  /* אתחול אוטומטי כשה-DOM מוכן (כדי ש-applyLang ירוץ על כל data-i18n) */
  function boot() { applyLang(); }
  if (global.document) {
    if (global.document.readyState === 'loading') {
      global.document.addEventListener('DOMContentLoaded', boot);
    } else {
      boot();
    }
  }

  /* חשיפה גלובלית */
  global.I18N = {
    t: t, setLang: setLang, getLang: getLang, isRTL: isRTL,
    applyLang: applyLang, renderLangPicker: renderLangPicker,
    LANGS: LANGS, FLAG: FLAG, LANG_NAME: LANG_NAME
  };
  // קיצורים נוחים
  global.t = t;
  global.setLang = setLang;
  global.getLang = getLang;
})(window);
