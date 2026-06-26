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
    'common.points':          { he: 'נקודות', en: 'points', it: 'punti' },
    'common.pts':             { he: 'נק\'', en: 'pts', it: 'pti' },
    'common.station':         { he: 'תחנה', en: 'Station', it: 'Stazione' },
    'common.seconds':         { he: 'שניות', en: 'seconds', it: 'secondi' },
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
    'join.doneTitle':         { he: 'הצטרפת בהצלחה!', en: 'You\'re in!', it: 'Sei dentro!' },
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
    'dash.qSaveStation':      { he: '💾 שמור תחנה {n}', en: '💾 Save station {n}', it: '💾 Salva stazione {n}' }
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
