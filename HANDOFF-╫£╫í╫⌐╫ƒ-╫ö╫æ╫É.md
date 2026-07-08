<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title data-i18n="dash.title">דשבורד ניהול - משחק חברה</title>
<link rel="stylesheet" href="/leaflet.css"/>
<style>
  * { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:'Segoe UI',Arial,sans-serif; background:#eef2f9; color:#1a2a4a; padding:18px; }
  body.login-mode { background:#0e1a14 url('/poster.png') center top / cover no-repeat fixed; padding:18px; min-height:100vh; display:flex; align-items:center; justify-content:center; }
  body.login-mode::before { content:''; position:fixed; inset:0; background:linear-gradient(180deg,rgba(10,20,15,.1),rgba(10,20,15,.3)); z-index:0; }
  .wrap { max-width:1100px; margin:0 auto; }
  header { background:linear-gradient(135deg,#1a2a6c,#3b7dd8); color:#fff; padding:22px; border-radius:18px; margin-bottom:18px; box-shadow:0 10px 30px rgba(26,42,108,.25); }
  header h1 { font-size:24px; } header p { opacity:.85; margin-top:4px; font-size:14px; }
  .login { position:relative; z-index:1; background:#fff; padding:30px; border-radius:18px; max-width:380px; width:100%; box-shadow:0 20px 50px rgba(0,0,0,.4); text-align:center; }
  .tabs { display:flex; gap:8px; margin-bottom:16px; flex-wrap:wrap; }
  .tab { padding:10px 18px; background:#fff; border-radius:12px; cursor:pointer; font-weight:700; border:2px solid transparent; }
  .tab.active { border-color:#3b7dd8; color:#1a2a6c; }
  .panel { display:none; } .panel.active { display:block; }
  .card2 { background:#fff; border-radius:16px; padding:18px; margin-bottom:14px; box-shadow:0 4px 14px rgba(0,0,0,.06); }
  .station-card { background:#fff; border-radius:16px; padding:18px; margin-bottom:14px; box-shadow:0 4px 14px rgba(0,0,0,.06); }
  .station-card h3 { color:#1a2a6c; margin-bottom:12px; display:flex; align-items:center; gap:8px; }
  .num { background:#ffd23f; color:#1a2a4a; width:32px; height:32px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; font-weight:800; }
  label { display:block; font-size:13px; font-weight:700; color:#5a6b8a; margin:10px 0 4px; }
  input, textarea, select { width:100%; padding:11px; border:2px solid #d5deef; border-radius:10px; font-size:15px; font-family:inherit; }
  textarea { min-height:60px; resize:vertical; }
  .row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  .btn { padding:11px 20px; border:none; border-radius:10px; font-weight:700; cursor:pointer; background:#3b7dd8; color:#fff; font-size:15px; }
  .btn.green { background:#22a06b; } .btn.gold { background:#ffd23f; color:#1a2a4a; } .btn.gray{ background:#8a98b5;} .btn.red{ background:#c0392b;}
  .btn:active { transform:scale(.97); }
  .saved { color:#22a06b; font-weight:700; font-size:13px; margin-right:8px; }
  .qr-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:16px; align-items:start; }
  .qr-cell { background:#fff; border-radius:14px; padding:16px; text-align:center; box-shadow:0 4px 14px rgba(0,0,0,.06); overflow:visible; }
  .qr-cell img { display:block; width:100%; max-width:200px; height:auto; margin:8px auto 0; }
  .qr-cell h4 { color:#1a2a6c; margin-bottom:8px; }
  .qr-cell .url { font-size:11px; color:#8a98b5; word-break:break-all; margin-top:6px; }
  .qr-cell.main-qr { border:3px solid #ffd23f; }
  .pending-card { background:#fff; border-radius:14px; padding:16px; margin-bottom:12px; box-shadow:0 4px 14px rgba(0,0,0,.06); display:flex; gap:14px; align-items:center; flex-wrap:wrap; }
  .pending-card img { width:120px; border-radius:10px; }
  .imgprev { max-width:140px; border-radius:10px; margin-top:8px; }
  .hint { font-size:12px; color:#8a98b5; margin-top:3px; }
  .company-row { background:#fff; border-radius:14px; padding:16px; margin-bottom:12px; box-shadow:0 4px 14px rgba(0,0,0,.06); }
  .company-row .top { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; }
  .company-row .cname { font-size:18px; font-weight:800; color:#1a2a6c; }
  .badge-on { background:#22a06b; color:#fff; padding:2px 10px; border-radius:20px; font-size:12px; }
  .badge-off { background:#c0392b; color:#fff; padding:2px 10px; border-radius:20px; font-size:12px; }
  .meta { font-size:13px; color:#5a6b8a; margin-top:6px; }
  .pwbox { font-family:monospace; background:#f0f3fa; padding:4px 10px; border-radius:6px; }
  @media print {
    .noprint { display:none !important; }
    body { background:#fff; padding:0; margin:0; }
    header, .tabs, #superView { display:none !important; }
    .qr-grid { display:block !important; }
    /* קוד אחד בכל עמוד, ממורכז וגדול */
    .qr-cell {
      box-shadow:none !important;
      border:none !important;
      page-break-after:always !important;
      break-after:page !important;
      page-break-inside:avoid !important;
      break-inside:avoid !important;
      display:flex !important;
      flex-direction:column;
      align-items:center;
      justify-content:center;
      width:100% !important;
      min-height:90vh !important;
      margin:0 !important;
      box-sizing:border-box;
      text-align:center;
    }
    .qr-cell:last-child { page-break-after:auto !important; break-after:auto !important; }
    .qr-cell h4 { font-size:34px !important; margin-bottom:6px !important; }
    .qr-cell .print-sub { font-size:22px !important; color:#333 !important; margin-bottom:24px !important; }
    .qr-cell img { width:65% !important; max-width:480px !important; height:auto !important; }
    .qr-cell .url { font-size:13px !important; margin-top:18px !important; }
  }
  /* ===== עורך המפה ===== */
  .map-frame-wrap{position:relative;width:100%;max-width:560px;margin:0 auto;aspect-ratio:1054/1492;}
  .map-frame-wrap img.frame{display:block;width:100%;height:100%;object-fit:contain;pointer-events:none;user-select:none;border-radius:10px;}
  .map-edit-window{position:absolute;left:26.5%;top:24.8%;right:24.8%;bottom:16.2%;
    border-radius:5px;overflow:hidden;box-shadow:inset 0 0 0 2px rgba(120,80,20,.4);}
  #editMap{width:100%;height:100%;background:#1a1a1a;}
  .edit-title{position:absolute;top:6px;left:50%;transform:translateX(-50%);z-index:600;
    background:linear-gradient(135deg,rgba(43,29,14,.92),rgba(80,55,20,.92));color:#fff;
    padding:4px 12px;border-radius:999px;font-weight:800;font-size:13px;white-space:nowrap;
    max-width:90%;overflow:hidden;text-overflow:ellipsis;border:1.5px solid #f0a500;}
  .edit-mail{position:absolute;bottom:6px;left:50%;transform:translateX(-50%);z-index:600;
    background:linear-gradient(135deg,rgba(43,29,14,.92),rgba(80,55,20,.92));color:#f4ecd6;
    padding:3px 12px;border-radius:999px;font-size:11px;font-weight:600;white-space:nowrap;
    max-width:92%;overflow:hidden;text-overflow:ellipsis;border:1px solid #f0a500;}
  .edit-mail a{color:#f0a500;font-weight:800;text-decoration:none;}
  .ed-pin{display:flex;align-items:center;justify-content:center;font-weight:800;color:#fff;
    border-radius:50%;border:2.5px solid #fff;box-shadow:0 3px 8px rgba(0,0,0,.45);
    width:var(--pin,28px);height:var(--pin,28px);font-size:calc(var(--pin,28px)*0.5);background:linear-gradient(135deg,#f0a500,#c47f00);cursor:move;}
  .size-bar{display:flex;align-items:center;gap:10px;margin-bottom:12px;background:#f0f3fa;padding:8px 14px;border-radius:12px;}
  .size-bar input[type=range]{flex:1;max-width:280px;accent-color:#3b7dd8;cursor:pointer;}
  .ed-pin.placing{background:linear-gradient(135deg,#3b7dd8,#1a2a6c);}
  .station-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;}
  .schip{padding:7px 12px;border-radius:10px;font-weight:700;cursor:pointer;border:2px solid #d5deef;
    background:#fff;font-size:14px;display:flex;align-items:center;gap:6px;}
  .schip.placed{border-color:#22a06b;background:#eafaf1;}
  .schip.active{border-color:#3b7dd8;background:#e8f0fc;box-shadow:0 0 0 2px #3b7dd8 inset;}
  .schip .x{color:#c0392b;font-weight:900;}
  .map-toolbar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:12px;}
  .lock-badge{padding:4px 12px;border-radius:999px;font-weight:700;font-size:13px;}
  .lock-badge.locked{background:#22a06b;color:#fff;} .lock-badge.unlocked{background:#ffd23f;color:#1a2a4a;}
  /* ===== ספריית חבילות ===== */
  .pack-card{background:#fff;border:2px solid #e3e9f5;border-radius:16px;padding:16px;box-shadow:0 4px 14px rgba(0,0,0,.06);display:flex;flex-direction:column;gap:8px;}
  .pack-card .pname{font-size:17px;font-weight:800;color:#1a2a6c;}
  .pack-card .ptags{display:flex;gap:6px;flex-wrap:wrap;}
  .pack-card .ptag{font-size:12px;font-weight:700;padding:3px 10px;border-radius:20px;background:#eef2fb;color:#3b5a9e;}
  .pack-card .ptag.lang{background:#fff3cd;color:#8a5a00;}
  .pack-card .ptag.uses{background:#eafaf1;color:#1e7f34;}
  .pack-card .pdesc{font-size:13px;color:#5a6b8a;line-height:1.5;flex:1;}
  .pack-card .pactions{display:flex;gap:8px;flex-wrap:wrap;margin-top:4px;}
  .pack-card .pactions .btn{padding:9px 14px;font-size:14px;}
  .pack-modal{position:fixed;inset:0;background:rgba(10,20,30,.55);z-index:2000;display:flex;align-items:center;justify-content:center;padding:18px;}
  .pack-modal .inner{background:#fff;border-radius:18px;max-width:560px;width:100%;max-height:86vh;overflow:auto;padding:22px;}
  .pack-modal h3{color:#1a2a6c;margin-bottom:12px;}
  .pack-modal .qitem{border-bottom:1px solid #eef2f9;padding:10px 0;}
  .pack-modal .qitem b{color:#1a2a6c;}
  .pack-modal .qitem .qa{font-size:13px;color:#5a6b8a;margin-top:3px;}
  /* ===== מדריך מנהל ===== */
  .help-intro{background:linear-gradient(135deg,#eef3ff,#f7f0ff);border-radius:14px;padding:16px 18px;color:#3a4a6a;font-size:15px;line-height:1.6;margin-bottom:16px;}
  .help-step{display:flex;gap:14px;background:#fff;border:2px solid #eef2f9;border-radius:14px;padding:16px;margin-bottom:12px;box-shadow:0 3px 10px rgba(0,0,0,.04);}
  .help-step .hs-body{flex:1;}
  .help-step h4{color:#1a2a6c;font-size:16px;margin-bottom:5px;}
  .help-step p{color:#5a6b8a;font-size:14px;line-height:1.6;}
  .help-tip{background:linear-gradient(135deg,#fff3cd,#ffe9a8);border:2px solid #f0a500;border-radius:14px;padding:14px 18px;color:#5a3d12;line-height:1.6;margin-top:6px;}
  .help-tip h4{color:#8a5a00;margin-bottom:4px;}
</style>
</head>
<body class="login-mode">

<div id="login" class="login">
  <div style="display:flex;justify-content:center;margin-bottom:14px"><span id="langPicker"></span></div>
  <h2 style="margin-bottom:16px" data-i18n="dash.loginTitle">🔐 כניסת מנהל</h2>
  <input id="user" data-i18n-ph="dash.userPh" placeholder="שם משתמש / שם חברה" autocomplete="username" style="margin-bottom:10px">
  <input id="pass" type="password" data-i18n-ph="dash.passPh" placeholder="סיסמה" autocomplete="current-password" onkeydown="if(event.key==='Enter')doLogin()">
  <button class="btn" style="width:100%;margin-top:12px" onclick="doLogin()" data-i18n="dash.loginBtn">כניסה</button>
  <p class="hint" id="loginErr" style="margin-top:10px;color:#c0392b"></p>
</div>

<div id="app" class="wrap" style="display:none">
  <header>
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap">
      <div><h1 id="hdrTitle">🎮 דשבורד ניהול</h1>
      <p id="hdrSub"></p></div>
      <span id="langPickerApp" class="noprint" style="flex-shrink:0"></span>
    </div>
  </header>

  <!-- ===== מנהל-על: ניהול חברות ===== -->
  <div id="superView" style="display:none">
    <div class="tabs noprint">
      <div class="tab active" onclick="superTab('companies',this)" data-i18n="dash.tabCompanies">🏢 חברות</div>
      <div class="tab" onclick="superTab('superlib',this)" data-i18n="dash.tabLibrary">📚 ספריית חבילות</div>
      <div class="tab" onclick="superTab('billing',this)" data-i18n="dash.tabBilling">💳 בילינג</div>
    </div>
    <div id="sv_companies">
      <div class="card2">
        <h3 style="color:#1a2a6c;margin-bottom:10px" data-i18n="dash.addCompany">➕ הוספת חברה חדשה</h3>
        <div class="row">
          <div><label data-i18n="dash.coName">שם החברה</label><input id="newCoName" data-i18n-ph="dash.coNamePh" placeholder="למשל: משפחת כהן"></div>
          <div><label data-i18n="dash.coPass">סיסמה למנהל החברה</label><input id="newCoPass" data-i18n-ph="dash.coPassPh" placeholder="לפחות 4 תווים"></div>
        </div>
        <button class="btn green" style="margin-top:12px" onclick="createCompany()" data-i18n="dash.createCo">צור חברה</button>
        <span class="saved" id="coCreated" style="display:none" data-i18n="dash.created">נוצר ✓</span>
      </div>
      <div id="companiesList"></div>
    </div>
    <div id="sv_superlib" style="display:none"></div>
    <div id="sv_billing" style="display:none"></div>
  </div>

  <!-- ===== ניהול תוכן חברה (גם מנהל-על וגם מנהל חברה) ===== -->
  <div id="companyView" style="display:none">
    <button class="btn gray noprint" id="backToCompanies" style="margin-bottom:14px;display:none" onclick="backToSuper()" data-i18n="dash.backToCompanies">↩ חזרה לרשימת החברות</button>
    <div class="noprint" style="margin-bottom:14px;padding:12px 16px;background:linear-gradient(135deg,#fff3cd,#ffe9a8);border:2px solid #f0a500;border-radius:12px;color:#5a3d12;font-weight:600;line-height:1.6;font-size:14px" data-i18n-html="dash.signalWarn">
      📡 <b>מנהל, שים לב:</b> לפני האירוע בדוק שיש <b>קליטה טובה לטלפונים (בייחוד לנתונים סלולריים)</b> במקום שבחרת לשחק! בלי קליטה טובה השחקנים לא יוכלו לסרוק תחנות, לראות את המפה או לענות.
    </div>
    <div class="tabs noprint">
      <div class="tab" onclick="coTab('questions',this)" data-i18n="dash.tabQuestions">📝 שאלות</div>
      <div class="tab" onclick="coTab('library',this)" data-i18n="dash.tabLibrary">📚 ספריית חבילות</div>
      <div class="tab" onclick="coTab('mapedit',this)" data-i18n="dash.tabMap">🗺️ מפת תחנות</div>
      <div class="tab" onclick="coTab('board',this)" data-i18n="dash.tabBoard">📊 לוח תוצאות</div>
      <div class="tab" onclick="coTab('qr',this)" data-i18n="dash.tabQR">🔲 קודי QR</div>
      <div class="tab" onclick="coTab('pending',this)" data-i18n="dash.tabPending">📸 אישור תמונות</div>
      <div class="tab" onclick="coTab('settings',this)" data-i18n="dash.tabSettings">⚙️ הגדרות</div>
      <div class="tab" onclick="coTab('help',this)" data-i18n="dash.tabHelp">❓ מדריך</div>
    </div>

    <div id="questions" class="copanel"></div>

    <div id="library" class="copanel" style="display:none">
      <!-- ניהול ספרייה (מנהל-על בלבד) -->
      <div class="card2 noprint" id="libManage" style="display:none">
        <h3 style="color:#1a2a6c;margin-bottom:6px" data-i18n="lib.manageTitle">📚 ניהול ספריית החבילות</h3>
        <p class="hint" style="margin-bottom:6px" data-i18n="lib.manageHint">רק מנהל ראשי יכול ליצור/לערוך/למחוק חבילות.</p>
        <p class="hint" style="margin-bottom:12px" data-i18n="lib.saveCurrentHint">בנה תוכן בטאב "שאלות", ואז שמור אותו כחבילה.</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn green" onclick="openSavePackForm()" data-i18n="lib.saveCurrentBtn">📥 שמור את שאלות החברה הנוכחית כחבילה</button>
          <button class="btn" onclick="document.getElementById('packUploadFile').click()" data-i18n="lib.uploadPack">⬆️ העלאת חבילה מקובץ</button>
          <input type="file" id="packUploadFile" accept="application/json,.json" style="display:none" onchange="uploadPackFile(event)">
        </div>
        <span class="saved" id="libMsg" style="display:none"></span>
      </div>

      <!-- טופס שמירת/עריכת מטא-דאטה של חבילה (מנהל-על) -->
      <div class="card2 noprint" id="packEditor" style="display:none">
        <h3 style="color:#1a2a6c;margin-bottom:10px" id="packEditorTitle"></h3>
        <div class="row">
          <div><label data-i18n="lib.packName">שם החבילה</label><input id="pkName"></div>
          <div><label data-i18n="lib.filterLang">שפה</label>
            <select id="pkLang">
              <option value="he" data-i18n="lib.langHe">עברית 🇮🇱</option>
              <option value="en" data-i18n="lib.langEn">אנגלית 🇺🇸</option>
              <option value="it" data-i18n="lib.langIt">איטלקית 🇮🇹</option>
            </select>
          </div>
        </div>
        <div class="row">
          <div><label data-i18n="lib.packStyle">סגנון</label><input id="pkStyle" data-i18n-ph="lib.packStyle"></div>
          <div><label data-i18n="lib.packAge">גילאים</label><input id="pkAge" data-i18n-ph="lib.packAge"></div>
        </div>
        <label data-i18n="lib.packDesc">תיאור קצר</label>
        <input id="pkDesc" data-i18n-ph="lib.packDesc">
        <div style="margin-top:12px;display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          <button class="btn green" id="pkSaveBtn" onclick="savePack()"></button>
          <button class="btn gray" onclick="closePackEditor()" data-i18n="lib.cancel">ביטול</button>
          <span class="saved" id="pkSaved" style="display:none" data-i18n="lib.saved">נשמר ✓</span>
        </div>
      </div>

      <!-- דפדפן חבילות (כל המנהלים) -->
      <div class="card2">
        <h3 style="color:#1a2a6c;margin-bottom:6px" data-i18n="lib.browseTitle">📚 חבילות שאלות מוכנות</h3>
        <p class="hint" style="margin-bottom:12px" id="libBrowseHint" data-i18n="lib.browseHint">בחרו חבילה וטענו עותק לחברה שלכם.</p>
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px">
          <div><label data-i18n="lib.filterLang">שפה</label>
            <select id="filterLang" onchange="renderLibrary()">
              <option value="" data-i18n="lib.all">הכל</option>
              <option value="he" data-i18n="lib.langHe">עברית 🇮🇱</option>
              <option value="en" data-i18n="lib.langEn">אנגלית 🇺🇸</option>
              <option value="it" data-i18n="lib.langIt">איטלקית 🇮🇹</option>
            </select>
          </div>
          <div><label data-i18n="lib.filterStyle">סגנון</label><select id="filterStyle" onchange="renderLibrary()"><option value="" data-i18n="lib.all">הכל</option></select></div>
          <div><label data-i18n="lib.filterAge">גילאים</label><select id="filterAge" onchange="renderLibrary()"><option value="" data-i18n="lib.all">הכל</option></select></div>
        </div>
        <div class="qr-grid" id="libGrid"></div>
      </div>
    </div>

    <div id="mapedit" class="copanel" style="display:none">
      <div class="card2">
        <h3 style="color:#1a2a6c;margin-bottom:6px" data-i18n="dash.mapTitle">🗺️ מפת התחנות</h3>
        <p class="hint" style="margin-bottom:12px" data-i18n="dash.mapHelp">
          1) הזיזו וזמזמו את מפת הלוויין עד לתצוגה הרצויה.
          2) לחצו על מספר תחנה ואז על המפה כדי למקם אותה (גרירה להזזה, לחיצה חוזרת על ✕ למחיקה).
          3) "נעלו" את התצוגה כדי שהשחקנים יראו מפה קבועה, ולחצו "שמור".
        </p>
        <div class="map-toolbar">
          <button class="btn green" onclick="saveMap()" data-i18n="dash.mapSaveBtn">💾 שמור מפה ותחנות</button>
          <button class="btn gold" id="lockBtn" onclick="toggleLock()" data-i18n="dash.mapLock">🔒 נעל תצוגה</button>
          <span class="lock-badge unlocked" id="lockBadge" data-i18n="dash.mapUnlockedBadge">פתוח לעריכה</span>
          <button class="btn gray" onclick="clearAllPins()" data-i18n="dash.mapClear">🗑️ נקה תחנות</button>
          <button class="btn" onclick="window.open('/c/'+activeCompanyId+'/map','_blank')" data-i18n="dash.mapPlayerView">↗️ תצוגת שחקן</button>
          <button class="btn gold" onclick="printMap()" data-i18n="dash.mapPrint">🖨️ הדפס מפה (A4)</button>
          <span class="saved" id="mapSaved" style="display:none" data-i18n="dash.saved">נשמר ✓</span>
        </div>
        <div class="size-bar">
          <label style="margin:0" data-i18n="dash.markerSize">📏 גודל העיגולים:</label>
          <input type="range" id="markerSizeRange" min="16" max="64" value="30" oninput="onSizeChange(this.value)">
          <span id="markerSizeVal" style="font-weight:800;color:#1a2a6c;min-width:42px">30px</span>
        </div>
        <div class="map-frame-wrap">
          <img class="frame" src="/map-frame.png" alt="">
          <div class="map-edit-window">
            <div id="editMap"></div>
            <div class="edit-title" id="editTitle" data-i18n="dash.myMap">המפה שלך</div>
            <div class="edit-mail"><span data-i18n="dash.mapMailLabel">למשחקים נוספים: </span><a href="mailto:mishak.hevra@gmail.com">mishak.hevra@gmail.com</a></div>
          </div>
        </div>
        <p class="hint" style="margin-top:12px;text-align:center" data-i18n="dash.choosePin">בחרו תחנה למיקום:</p>
        <div class="station-chips" id="stationChips"></div>
      </div>
    </div>

    <div id="board" class="copanel" style="display:none">
      <div class="card2 noprint" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
        <div style="font-weight:700;color:#1a2a6c" data-i18n="dash.boardLiveTitle">📊 לוח התוצאות החי של החברה</div>
        <div style="display:flex;gap:8px">
          <button class="btn" onclick="openBoardTab()" data-i18n="dash.openFull">↗️ פתח בחלון מלא</button>
          <button class="btn gray" onclick="reloadBoard()" data-i18n="dash.refresh">🔄 רענן</button>
        </div>
      </div>
      <iframe id="boardFrame" src="about:blank" style="width:100%;height:70vh;border:none;border-radius:14px;box-shadow:0 4px 14px rgba(0,0,0,.08);background:#0e1a14"></iframe>
    </div>

    <div id="qr" class="copanel" style="display:none">
      <div class="noprint card2">
        <label data-i18n="dash.baseUrl">כתובת בסיס (ה-URL של האתר)</label>
        <input id="baseUrl" placeholder="https://family-game-12r6.onrender.com">
        <p class="hint" data-i18n="dash.qrHelp">השאר ריק לכתובת הנוכחית. ה-QR הראשי (הצהוב) הוא נקודת הכניסה לשחקנים — תלה אותו בכניסה. שאר ה-QR לתחנות.</p>
        <div style="margin-top:10px;display:flex;gap:8px">
          <button class="btn" onclick="generateAllQR()" data-i18n="dash.genAll">🔄 צור הכל</button>
          <button class="btn gold" onclick="window.print()" data-i18n="dash.print">🖨️ הדפס</button>
        </div>
      </div>
      <div class="qr-grid" id="qrGrid"></div>
    </div>

    <div id="pending" class="copanel" style="display:none">
      <button class="btn noprint" onclick="loadPending()" data-i18n="dash.refresh">🔄 רענן</button>
      <div id="pendingList" style="margin-top:14px"></div>
    </div>

    <div id="settings" class="copanel" style="display:none">
      <div class="station-card">
        <label data-i18n="dash.gameNameLabel">שם המשחק (מוצג לשחקנים)</label>
        <input id="gameName">
        <button class="btn" style="margin-top:10px" onclick="saveGameName()" data-i18n="dash.saveName">שמור שם</button>
      </div>
      <div class="station-card">
        <label data-i18n="dash.defaultLangLabel">שפת ברירת מחדל לשחקנים</label>
        <p class="hint" data-i18n="dash.defaultLangHint">השפה שבה ייפתח הממשק לשחקנים שלא בחרו שפה. השחקן תמיד יכול לשנות.</p>
        <select id="defaultLang" style="margin-top:6px">
          <option value="he">🇮🇱 עברית</option>
          <option value="en">🇺🇸 English</option>
          <option value="it">🇮🇹 Italiano</option>
        </select>
        <button class="btn" style="margin-top:10px" onclick="saveDefaultLang()" data-i18n="dash.saveLang">שמור שפה</button>
        <span class="saved" id="langSaved" style="display:none" data-i18n="dash.saved">נשמר ✓</span>
      </div>
      <div class="station-card">
        <h3 data-i18n="dash.speedBonus">⚡ בונוס מהירות</h3>
        <p class="hint" data-i18n="dash.speedBonusHint">תשובה נכונה מהירה מזכה בבונוס שיורד בהדרגה למשך חלון הזמן.</p>
        <div style="display:flex;align-items:center;gap:8px;margin:12px 0">
          <input type="checkbox" id="sbEnabled" style="width:auto"> <label style="margin:0" data-i18n="dash.sbEnable">הפעל בונוס מהירות</label>
        </div>
        <div class="row">
          <div><label data-i18n="dash.sbMax">בונוס מקסימלי</label><input type="number" id="sbMax" min="0" value="10"></div>
          <div><label data-i18n="dash.sbWindow">חלון זמן (שניות)</label><input type="number" id="sbWindow" min="1" value="60"></div>
        </div>
        <button class="btn" style="margin-top:10px" onclick="saveSpeedBonus()" data-i18n="dash.saveBonus">שמור בונוס</button>
        <span class="saved" id="sbSaved" style="display:none" data-i18n="dash.saved">נשמר ✓</span>
      </div>
      <div class="station-card">
        <h3 data-i18n="dash.linksTitle">🔗 קישורים</h3>
        <p><span data-i18n="dash.linkBoard">📊 לוח תוצאות: </span><a id="boardLink" href="#" target="_blank" data-i18n="dash.open">פתח</a></p>
        <p style="margin-top:8px"><span data-i18n="dash.linkCompany">🎮 עמוד החברה: </span><a id="coLink" href="#" target="_blank" data-i18n="dash.open">פתח</a></p>
        <p style="margin-top:8px"><span data-i18n="dash.linkMap">🧭 מפת המשחק: </span><a id="mapLinkS" href="#" target="_blank" data-i18n="dash.open">פתח</a></p>
      </div>
      <div class="station-card">
        <h3 data-i18n="dash.moreGamesTitle">✉️ משחקים נוספים</h3>
        <p><span data-i18n="common.moreGames">למשחקים נוספים פנו ל-</span><a href="mailto:mishak.hevra@gmail.com" style="color:#3b7dd8;font-weight:700;text-decoration:none">mishak.hevra@gmail.com</a></p>
      </div>
      <div class="station-card">
        <h3 style="color:#c0392b" data-i18n="dash.resetTitle">⚠️ איפוס משחק</h3>
        <p class="hint" data-i18n="dash.resetHint">מוחק שחקנים ותשובות של חברה זו (השאלות נשמרות).</p>
        <button class="btn red" style="margin-top:10px" onclick="resetGame()" data-i18n="dash.resetBtn">אפס משחק</button>
      </div>
      <div class="station-card">
        <button class="btn gray" onclick="logout()" data-i18n="dash.logout">🚪 יציאה</button>
      </div>
    </div>

    <div id="help" class="copanel" style="display:none">
      <div class="card2">
        <h3 style="color:#1a2a6c;margin-bottom:10px" data-i18n="help.title">📖 מדריך למנהל</h3>
        <div class="help-intro" data-i18n="help.intro">ברוכים הבאים!</div>
        <div class="help-step"><div class="hs-body"><h4 data-i18n="help.s1Title">1️⃣ בניית השאלות</h4><p data-i18n="help.s1Body"></p></div></div>
        <div class="help-step"><div class="hs-body"><h4 data-i18n="help.s2Title">2️⃣ חבילות מוכנות</h4><p data-i18n="help.s2Body"></p></div></div>
        <div class="help-step"><div class="hs-body"><h4 data-i18n="help.s3Title">3️⃣ גיבוי וטעינה</h4><p data-i18n="help.s3Body"></p></div></div>
        <div class="help-step"><div class="hs-body"><h4 data-i18n="help.s4Title">4️⃣ מפת התחנות</h4><p data-i18n="help.s4Body"></p></div></div>
        <div class="help-step"><div class="hs-body"><h4 data-i18n="help.s5Title">5️⃣ קודי QR</h4><p data-i18n="help.s5Body"></p></div></div>
        <div class="help-step"><div class="hs-body"><h4 data-i18n="help.s6Title">6️⃣ תוצאות ואישורים</h4><p data-i18n="help.s6Body"></p></div></div>
        <div class="help-step"><div class="hs-body"><h4 data-i18n="help.s7Title">7️⃣ הגדרות</h4><p data-i18n="help.s7Body"></p></div></div>
        <div class="help-tip"><h4 data-i18n="help.tipTitle">💡 טיפ חשוב</h4><p data-i18n="help.tipBody"></p></div>
      </div>
    </div>
  </div>
</div>

<script src="/i18n.js"></script>
<script src="/leaflet.js"></script>
<script src="/html2canvas.js"></script>
<script>
let TOKEN='', ROLE='', activeCompanyId=null, activeCompanyName='';
function H() { return { 'x-admin-token': TOKEN }; }

async function doLogin() {
  const user=document.getElementById('user').value.trim();
  const pass=document.getElementById('pass').value;
  const errEl=document.getElementById('loginErr'); errEl.textContent='';
  try {
    const r=await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user,pass})});
    if(!r.ok){ errEl.textContent=t('dash.loginBad'); return; }
    const d=await r.json();
    TOKEN=d.token; ROLE=d.role;
    localStorage.setItem('fg_token',TOKEN);
    enterApp(d);
  } catch(e){ errEl.textContent=t('common.connErr'); }
}

function enterApp(d) {
  document.body.classList.remove('login-mode');
  document.getElementById('login').style.display='none';
  document.getElementById('app').style.display='block';
  if (ROLE==='super') {
    updateHeader();
    document.getElementById('superView').style.display='block';
    document.getElementById('companyView').style.display='none';
    loadCompanies();
  } else {
    activeCompanyId=d.companyId; activeCompanyName=d.companyName;
    updateHeader();
    openCompany(d.companyId, false);
  }
}

function logout() {
  fetch('/api/admin/logout',{method:'POST',headers:H()});
  localStorage.removeItem('fg_token');
  location.reload();
}

// ===== מנהל-על: חברות =====
function superTab(id, el){
  document.querySelectorAll('#superView .tab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('sv_companies').style.display = (id==='companies') ? 'block' : 'none';
  document.getElementById('sv_superlib').style.display = (id==='superlib') ? 'block' : 'none';
  document.getElementById('sv_billing').style.display = (id==='billing') ? 'block' : 'none';
  if(id==='superlib') loadSuperLibrary();
  if(id==='billing') loadBilling();
}

async function loadCompanies() {
  const r=await fetch('/api/admin/companies',{headers:H()});
  const d=await r.json();
  const c=document.getElementById('companiesList');
  if(!d.companies.length){ c.innerHTML='<p class="hint" style="padding:20px;text-align:center">'+t('dash.noCompanies')+'</p>'; return; }
  c.innerHTML=d.companies.map(co=>`
    <div class="company-row">
      <div class="top">
        <div>
          <span class="cname">${esc(co.name)}</span>
          <span class="${co.enabled?'badge-on':'badge-off'}">${co.enabled?t('dash.active'):t('dash.inactive')}</span>
          ${billingBadge(co)}
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <button class="btn" onclick="openCompany('${co.id}',true)">${t('dash.editQuestions')}</button>
          <button class="btn" style="background:#16a085" onclick="window.open('/c/${co.id}/board','_blank')">${t('dash.tabBoard')}</button>
          <button class="btn ${co.enabled?'gray':'green'}" onclick="toggleCompany('${co.id}',${!co.enabled})">${co.enabled?t('dash.disable'):t('dash.enable')}</button>
          <button class="btn red" onclick="deleteCompany('${co.id}','${esc(co.name)}')">🗑️</button>
        </div>
      </div>
      <div class="meta">
        ${t('dash.coPassword')} <span class="pwbox">${esc(co.password)}</span> ·
        ${t('dash.questionsSet',{set:co.questionsSet,total:co.stationCount})} · ${t('dash.playersCount',{n:co.playerCount})}
        ${billingMeta(co)}
      </div>
    </div>`).join('');
}

// תג קטן שמראה אם החברה נוצרה ע"י בילינג, ומי שולט בה כרגע (system/admin)
function billingBadge(co){
  if (co.accountSource !== 'billing') return '';
  const adminCtl = co.controlledBy === 'admin';
  return `<span class="${adminCtl?'badge-off':'badge-on'}" style="margin-right:6px;font-size:11px" data-i18n="${adminCtl?'dash.billingAdminCtl':'dash.billingAuto'}">${adminCtl?t('dash.billingAdminCtl'):t('dash.billingAuto')}</span>`;
}
// שורת מטא נוספת: תאריך כיבוי / מחיקה אוטומטית (רק לחברות בילינג כפופות לאוטומציה)
function billingMeta(co){
  if (co.accountSource !== 'billing') return '';
  const parts=[];
  if (co.controlledBy==='system' && co.enabled && co.enabledUntil) parts.push(t('dash.billingDisablesOn',{date:new Date(co.enabledUntil).toLocaleDateString()}));
  if (co.controlledBy==='system' && !co.enabled && co.deleteAt) parts.push(t('dash.billingDeletesOn',{date:new Date(co.deleteAt).toLocaleDateString()}));
  return parts.length ? ' · '+parts.join(' · ') : '';
}

async function createCompany() {
  const name=document.getElementById('newCoName').value.trim();
  const password=document.getElementById('newCoPass').value.trim();
  if(!name||!password){ alert(t('dash.fillNamePass')); return; }
  const r=await fetch('/api/admin/companies',{method:'POST',headers:{...H(),'Content-Type':'application/json'},body:JSON.stringify({name,password})});
  const d=await r.json();
  if(!r.ok){ alert(d.error||t('dash.saveErr')); return; }
  document.getElementById('newCoName').value=''; document.getElementById('newCoPass').value='';
  const s=document.getElementById('coCreated'); s.style.display='inline'; setTimeout(()=>s.style.display='none',2000);
  loadCompanies();
}

async function toggleCompany(cid, enabled) {
  await fetch('/api/admin/companies/'+cid,{method:'POST',headers:{...H(),'Content-Type':'application/json'},body:JSON.stringify({enabled})});
  loadCompanies();
}
async function deleteCompany(cid, name) {
  if(!confirm(t('dash.deleteCoConfirm',{name}))) return;
  await fetch('/api/admin/companies/'+cid,{method:'DELETE',headers:H()});
  loadCompanies();
}

function backToSuper() {
  document.getElementById('superView').style.display='block';
  document.getElementById('companyView').style.display='none';
  activeCompanyId=null;
  updateHeader();
  loadCompanies();
}

// ===== תוכן חברה =====
function coTab(id, el){
  document.querySelectorAll('.copanel').forEach(p=>p.style.display='none');
  document.querySelectorAll('#companyView .tab').forEach(t=>t.classList.remove('active'));
  document.getElementById(id).style.display='block'; el.classList.add('active');
  if(id==='qr') generateAllQR();
  if(id==='pending') loadPending();
  if(id==='board') loadBoardFrame();
  if(id==='mapedit') loadMapEditor();
  if(id==='library') loadLibrary();
}
function loadBoardFrame(){
  const f=document.getElementById('boardFrame');
  const url='/c/'+activeCompanyId+'/board';
  if(f.getAttribute('data-cid')!==activeCompanyId){ f.src=url; f.setAttribute('data-cid',activeCompanyId); }
}
function reloadBoard(){ const f=document.getElementById('boardFrame'); f.src='/c/'+activeCompanyId+'/board'; f.setAttribute('data-cid',activeCompanyId); }
function openBoardTab(){ window.open('/c/'+activeCompanyId+'/board','_blank'); }

let stations=[];
async function openCompany(cid, fromSuper) {
  activeCompanyId=cid;
  document.getElementById('superView').style.display='none';
  document.getElementById('companyView').style.display='block';
  document.getElementById('backToCompanies').style.display = fromSuper ? 'inline-block' : 'none';
  // reset to questions tab
  document.querySelectorAll('.copanel').forEach(p=>p.style.display='none');
  document.getElementById('questions').style.display='block';
  document.querySelectorAll('#companyView .tab').forEach((t,i)=>t.classList.toggle('active',i===0));
  await loadCompanyData();
}

async function loadCompanyData() {
  const r=await fetch('/api/admin/company/'+activeCompanyId+'/data',{headers:H()});
  const d=await r.json();
  stations=d.stations;
  activeCompanyName=d.name;
  updateHeader();
  document.getElementById('gameName').value=d.gameName||'';
  var dl=document.getElementById('defaultLang'); if(dl) dl.value=d.defaultLang||'he';
  document.getElementById('sbEnabled').checked=!!(d.speedBonus&&d.speedBonus.enabled);
  document.getElementById('sbMax').value=(d.speedBonus&&d.speedBonus.maxBonus)??10;
  document.getElementById('sbWindow').value=(d.speedBonus&&d.speedBonus.windowSec)??60;
  document.getElementById('boardLink').href='/c/'+activeCompanyId+'/board';
  document.getElementById('coLink').href='/c/'+activeCompanyId;
  var mls=document.getElementById('mapLinkS'); if(mls) mls.href='/c/'+activeCompanyId+'/map';
  renderStations();
}

function renderStations() {
  const toolbar = `
    <div class="card2 noprint">
      <h3 style="color:#1a2a6c;margin-bottom:6px">${t('dash.qSetsTitle')}</h3>
      <p class="hint" style="margin-bottom:12px">${t('dash.qSetsHint')}</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn" onclick="exportQuestions()">${t('dash.exportFile')}</button>
        <button class="btn green" onclick="document.getElementById('importFile').click()">${t('dash.importFile')}</button>
        <input type="file" id="importFile" accept="application/json,.json" style="display:none" onchange="importQuestions(event)">
      </div>
      <span class="saved" id="importMsg" style="display:none"></span>
    </div>`;
  document.getElementById('questions').innerHTML = toolbar + stations.map(st=>`
    <div class="station-card">
      <h3><span class="num">${st.id}</span> <input style="font-size:16px;font-weight:700" value="${esc(st.title)}" id="title-${st.id}"></h3>
      <div class="row">
        <div><label>${t('dash.qType')}</label>
          <select id="type-${st.id}" onchange="toggleType(${st.id})">
            <option value="text" ${st.questionType==='text'?'selected':''}>${t('dash.qTypeText')}</option>
            <option value="photo" ${st.questionType==='photo'?'selected':''}>${t('dash.qTypePhoto')}</option>
          </select>
        </div>
        <div><label>${t('dash.qPoints')}</label><input type="number" id="points-${st.id}" value="${st.points}"></div>
      </div>
      <label>${t('dash.qText')}</label>
      <textarea id="qtext-${st.id}">${esc(st.questionText)}</textarea>
      <div id="ans-${st.id}" style="${st.questionType==='photo'?'display:none':''}">
        <label>${t('dash.qCorrect')} <span class="hint">${t('dash.qCorrectHint')}</span></label>
        <input id="correct-${st.id}" value="${esc(st.correctAnswer)}">
      </div>
      <label>${t('dash.qImage')}</label>
      <div class="row">
        <input type="file" id="imgfile-${st.id}" accept="image/*">
        <input id="imglink-${st.id}" placeholder="${t('dash.qImageLink')}">
      </div>
      ${st.imageUrl?`<img class="imgprev" src="${st.imageUrl}"><br><button class="btn gray" style="margin-top:6px" onclick="clearImg(${st.id})">${t('dash.qRemoveImage')}</button>`:''}
      <div style="margin-top:14px;display:flex;align-items:center">
        <button class="btn green" onclick="saveStation(${st.id})">${t('dash.qSaveStation',{n:st.id})}</button>
        <span class="saved" id="saved-${st.id}" style="display:none">${t('dash.saved')}</span>
      </div>
    </div>`).join('');
}
function toggleType(id){ document.getElementById('ans-'+id).style.display=document.getElementById('type-'+id).value==='photo'?'none':'block'; }

async function saveStation(id) {
  const fd=new FormData();
  fd.append('title',document.getElementById('title-'+id).value);
  fd.append('questionType',document.getElementById('type-'+id).value);
  fd.append('questionText',document.getElementById('qtext-'+id).value);
  fd.append('correctAnswer',document.getElementById('correct-'+id)?.value||'');
  fd.append('points',document.getElementById('points-'+id).value);
  const link=document.getElementById('imglink-'+id).value.trim(); if(link) fd.append('imageLink',link);
  const f=document.getElementById('imgfile-'+id).files[0]; if(f) fd.append('image',f);
  const r=await fetch('/api/admin/company/'+activeCompanyId+'/station/'+id,{method:'POST',headers:H(),body:fd});
  const d=await r.json();
  const idx=stations.findIndex(s=>s.id==id); if(idx>=0) stations[idx]=d.station;
  const s=document.getElementById('saved-'+id); s.style.display='inline'; setTimeout(()=>s.style.display='none',2000);
  if(f||link) renderStations();
}
async function clearImg(id) {
  const fd=new FormData(); fd.append('clearImage','true');
  await fetch('/api/admin/company/'+activeCompanyId+'/station/'+id,{method:'POST',headers:H(),body:fd});
  const idx=stations.findIndex(s=>s.id==id); if(idx>=0) stations[idx].imageUrl=''; renderStations();
}

// ייצוא סט שאלות לקובץ (כולל תמונות מוטמעות)
async function exportQuestions() {
  const r=await fetch('/api/admin/company/'+activeCompanyId+'/export',{headers:H()});
  if(!r.ok){ alert(t('dash.exportErr')); return; }
  const data=await r.json();
  const safeName=(data.gameName||'questions').replace(/[^\w\u0590-\u05FF -]/g,'').trim()||'questions';
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url; a.download=safeName+'.json';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// טעינת סט שאלות מקובץ
async function importQuestions(e) {
  const file=e.target.files[0];
  if(!file) return;
  e.target.value=''; // אפשר לטעון אותו קובץ שוב בעתיד
  if(!confirm(t('dash.importConfirm'))) return;
  let data;
  try { data=JSON.parse(await file.text()); }
  catch(err){ alert(t('dash.importBadJson')); return; }
  if(!data.stations || !Array.isArray(data.stations)){ alert(t('dash.importNoStations')); return; }
  const r=await fetch('/api/admin/company/'+activeCompanyId+'/import',{method:'POST',headers:{...H(),'Content-Type':'application/json'},body:JSON.stringify(data)});
  const d=await r.json();
  if(!r.ok){ alert(d.error||t('dash.importErr')); return; }
  // רענן את התצוגה מהשרת
  await loadCompanyData();
  const m=document.getElementById('importMsg');
  if(m){ m.textContent=t('dash.importOk'); m.style.display='inline'; setTimeout(()=>m.style.display='none',2500); }
}

async function generateAllQR() {
  const base=document.getElementById('baseUrl').value.trim();
  const grid=document.getElementById('qrGrid'); grid.innerHTML=t('dash.qrGenerating');
  const q=base?'?base='+encodeURIComponent(base):'';
  let html='';
  // QR ראשי
  const rm=await fetch('/api/admin/company/'+activeCompanyId+'/qr/main'+q,{headers:H()});
  const dm=await rm.json();
  html+=`<div class="qr-cell main-qr"><h4>${esc(activeCompanyName)}</h4><div class="print-sub" style="font-size:13px;color:#5a6b8a;margin-bottom:6px">${t('dash.qrMainSub')}</div><img src="${dm.qr}"><div class="url">${dm.url}</div></div>`;
  // QR לכל תחנה
  for(const st of stations){
    const r=await fetch('/api/admin/company/'+activeCompanyId+'/qr/'+st.id+q,{headers:H()});
    const d=await r.json();
    html+=`<div class="qr-cell"><h4>${esc(activeCompanyName)} - ${t('common.station')} ${st.id}</h4><div class="print-sub" style="font-size:13px;color:#5a6b8a;margin-bottom:6px">${esc(st.title)}</div><img src="${d.qr}"><div class="url">${d.url}</div></div>`;
  }
  grid.innerHTML=html;
}

async function loadPending() {
  const r=await fetch('/api/admin/company/'+activeCompanyId+'/pending',{headers:H()});
  const d=await r.json();
  const c=document.getElementById('pendingList');
  if(!d.pending.length){ c.innerHTML='<p class="hint">'+t('dash.pendingNone')+'</p>'; return; }
  c.innerHTML=d.pending.map(p=>`
    <div class="pending-card">
      <img src="${p.photoUrl}">
      <div style="flex:1"><strong>${esc(p.name)}</strong> ${p.team?('('+esc(p.team)+')'):''} - ${t('common.station')} ${p.stationId}
        ${p.answerText?('<div class="hint">'+t('dash.pendingCaption')+esc(p.answerText)+'</div>'):''}</div>
      <button class="btn green" onclick="review('${p.playerId}',${p.stationId},true)">${t('dash.approveYes')}</button>
      <button class="btn gray" onclick="review('${p.playerId}',${p.stationId},false)">${t('dash.approveNo')}</button>
    </div>`).join('');
}
async function review(playerId, stationId, approve) {
  await fetch('/api/admin/company/'+activeCompanyId+'/review',{method:'POST',headers:{...H(),'Content-Type':'application/json'},body:JSON.stringify({playerId,stationId,approve})});
  loadPending();
}

async function saveGameName() {
  await fetch('/api/admin/company/'+activeCompanyId+'/game-name',{method:'POST',headers:{...H(),'Content-Type':'application/json'},body:JSON.stringify({gameName:document.getElementById('gameName').value})});
  alert(t('dash.gameNameSaved'));
}
async function saveDefaultLang() {
  const lang=document.getElementById('defaultLang').value;
  await fetch('/api/admin/company/'+activeCompanyId+'/default-lang',{method:'POST',headers:{...H(),'Content-Type':'application/json'},body:JSON.stringify({defaultLang:lang})});
  const s=document.getElementById('langSaved'); s.style.display='inline'; setTimeout(()=>s.style.display='none',2000);
}
async function saveSpeedBonus() {
  const body={enabled:document.getElementById('sbEnabled').checked,maxBonus:Number(document.getElementById('sbMax').value),windowSec:Number(document.getElementById('sbWindow').value)};
  await fetch('/api/admin/company/'+activeCompanyId+'/speed-bonus',{method:'POST',headers:{...H(),'Content-Type':'application/json'},body:JSON.stringify(body)});
  const s=document.getElementById('sbSaved'); s.style.display='inline'; setTimeout(()=>s.style.display='none',2000);
}
async function resetGame() {
  if(!confirm(t('dash.resetConfirm'))) return;
  await fetch('/api/admin/company/'+activeCompanyId+'/reset',{method:'POST',headers:H()});
  alert(t('dash.resetDone'));
}

// ===== עורך מפה =====
let editMap=null, edMarkers={}, edLocked=false, edPlacing=null, edMapLoadedFor=null, edMarkerSize=30;
let _edTilesLoading = 0;   // מעקב טעינת אריחים בעורך (לצילום snapshot יציב)

function buildEdPin(id, placing){
  const sz = edMarkerSize, anc = sz/2;
  return L.divIcon({ className:'', html:`<div class="ed-pin ${placing?'placing':''}" style="--pin:${sz}px">${id}</div>`,
    iconSize:[sz,sz], iconAnchor:[anc,anc] });
}

// שינוי גודל חי — כל העיגולים משתנים יחד
function onSizeChange(val){
  edMarkerSize = Number(val);
  document.getElementById('markerSizeVal').textContent = edMarkerSize + 'px';
  Object.keys(edMarkers).forEach(id=>{ edMarkers[id].setIcon(buildEdPin(Number(id), false)); });
}

async function loadMapEditor(){
  // טען קונפיג מהשרת
  let r;
  try { r=await fetch('/api/admin/company/'+activeCompanyId+'/map',{headers:H()}); }
  catch(e){ alert(t('dash.mapNetErr')); return; }
  if(r.status===401){ alert(t('dash.sessionExpired')); localStorage.removeItem('fg_token'); location.reload(); return; }
  const d=await r.json();
  const cfg=d.mapConfig||{center:{lat:31.8133,lng:34.7780},zoom:16,markers:[],locked:false};
  document.getElementById('editTitle').textContent = d.companyName || t('dash.myMap');
  edLocked = !!cfg.locked;
  edMarkerSize = isFinite(cfg.markerSize) ? Number(cfg.markerSize) : 30;
  document.getElementById('markerSizeRange').value = edMarkerSize;
  document.getElementById('markerSizeVal').textContent = edMarkerSize + 'px';

  // אתחל את המפה (פעם אחת לכל חברה)
  if(!editMap){
    editMap = L.map('editMap', { center:[cfg.center.lat,cfg.center.lng], zoom:cfg.zoom, maxZoom:21, zoomControl:true, zoomSnap:0, zoomDelta:0.5 });
    // crossOrigin חיוני כדי ש-html2canvas יוכל "לצלם" אריחים מדומיין חיצוני (Esri תומך CORS)
    const _edTl = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { maxZoom:21, maxNativeZoom:19, attribution:'Esri', crossOrigin:'anonymous', keepBuffer:8 }).addTo(editMap);
    // מעקב טעינת אריחים — כדי לא לצלם snapshot עם אריחים חסרים (שחורים)
    _edTl.on('loading', ()=>{ _edTilesLoading++; });
    _edTl.on('load',    ()=>{ _edTilesLoading = 0; });
    // לחיצה על המפה ממקמת את התחנה שנבחרה
    editMap.on('click', e=>{
      if(edPlacing==null) return;
      placePin(edPlacing, e.latlng.lat, e.latlng.lng);
      edPlacing=null; renderChips();
    });
  }
  // קריאות חוזרות ל-invalidateSize כדי שהמפה תצייר אריחים אחרי שהטאב גלוי
  [60,200,500,900].forEach(ms=>setTimeout(()=>{ try{ editMap.invalidateSize(); }catch(e){} }, ms));

  // נקה סיכות קיימות וצייר מחדש
  Object.values(edMarkers).forEach(m=>editMap.removeLayer(m)); edMarkers={};
  (cfg.markers||[]).forEach(mk=>placePin(mk.id, mk.lat, mk.lng));

  if(edMapLoadedFor!==activeCompanyId){
    // העורך מציג את התצוגה ששמר המנהל (center+zoom). המנהל קובע ידנית את המסגור
    // (זום + גרירה), וזה בדיוק מה שיישמר, יוצג לשחקן ויודפס.
    editMap.setView([cfg.center.lat, cfg.center.lng], cfg.zoom||16);
    edMapLoadedFor=activeCompanyId;
  }
  applyLockUI();
  renderChips();
}

function placePin(id, lat, lng){
  if(edMarkers[id]){ edMarkers[id].setLatLng([lat,lng]); return; }
  const m = L.marker([lat,lng], { icon:buildEdPin(id,false), draggable:true }).addTo(editMap);
  m.on('dragend', ()=>{ /* מיקום מתעדכן אוטומטית; שמירה בלחיצה */ });
  edMarkers[id]=m;
}

function selectStationForPlacing(id){
  if(edMarkers[id]){
    // כבר ממוקמת — מרכז עליה
    editMap.panTo(edMarkers[id].getLatLng());
    edPlacing=null;
  } else {
    edPlacing = (edPlacing===id) ? null : id;
  }
  renderChips();
}

function removePin(id, ev){
  if(ev) ev.stopPropagation();
  if(edMarkers[id]){ editMap.removeLayer(edMarkers[id]); delete edMarkers[id]; }
  if(edPlacing===id) edPlacing=null;
  renderChips();
}

function clearAllPins(){
  if(!confirm(t('dash.clearPinsConfirm'))) return;
  Object.keys(edMarkers).forEach(id=>{ editMap.removeLayer(edMarkers[id]); });
  edMarkers={}; edPlacing=null; renderChips();
}

function renderChips(){
  const box=document.getElementById('stationChips');
  let html='';
  for(let i=1;i<=10;i++){
    const placed=!!edMarkers[i];
    const active=edPlacing===i;
    html+=`<div class="schip ${placed?'placed':''} ${active?'active':''}" onclick="selectStationForPlacing(${i})">
      ${placed?'📍':'➕'} ${t('dash.stationChip',{n:i})}
      ${placed?`<span class="x" onclick="removePin(${i},event)">✕</span>`:''}
    </div>`;
  }
  box.innerHTML=html;
  // הדגשת הסיכה שנבחרת למיקום
  for(let i=1;i<=10;i++){ if(edMarkers[i]) edMarkers[i].setIcon(buildEdPin(i,false)); }
}

function toggleLock(){
  edLocked=!edLocked;
  applyLockUI();
}
function applyLockUI(){
  const btn=document.getElementById('lockBtn'), badge=document.getElementById('lockBadge');
  if(edLocked){
    btn.textContent=t('dash.mapUnlock'); badge.textContent=t('dash.mapLockedBadge'); badge.className='lock-badge locked';
  } else {
    btn.textContent=t('dash.mapLock'); badge.textContent=t('dash.mapUnlockedBadge'); badge.className='lock-badge unlocked';
  }
}

async function saveMap(){
  if(!editMap){ alert(t('dash.mapNotLoaded')); return; }
  const c=editMap.getCenter();
  const markers=Object.keys(edMarkers).map(id=>{
    const ll=edMarkers[id].getLatLng();
    return { id:Number(id), lat:ll.lat, lng:ll.lng };
  });
  const b=editMap.getBounds();
  const bounds={ north:b.getNorth(), south:b.getSouth(), east:b.getEast(), west:b.getWest() };
  const viewWidth = editMap.getSize().x;   // רוחב חלון המפה בעורך (פיקסלים) — לכיול זום בהדפסה/מסך
  const body={ center:{lat:c.lat,lng:c.lng}, zoom:editMap.getZoom(), viewWidth, bounds, locked:edLocked, markerSize:edMarkerSize, markers };
  let r;
  try {
    r=await fetch('/api/admin/company/'+activeCompanyId+'/map',{method:'POST',headers:{...H(),'Content-Type':'application/json'},body:JSON.stringify(body)});
  } catch(e){ alert(t('dash.mapSaveNetErr')); return; }
  if(r.status===401){ alert(t('dash.sessionExpiredSave')); return; }
  if(!r.ok){ let msg=t('dash.saveErr'); try{ const e=await r.json(); if(e.error) msg=e.error; }catch(_){} alert(msg); return; }

  // ===== snapshot: "מצלמים" את תצוגת העורך לתמונה קבועה =====
  // התמונה + מיקומי התחנות באחוזים נשמרים בשרת, והשחקן רואה תמונה סטטית
  // זהה בכל מכשיר/יחס-מסך — במקום מפת Leaflet חיה שנחתכת לפי גודל המסך.
  await captureAndUploadSnapshot();

  const s=document.getElementById('mapSaved'); s.style.display='inline'; setTimeout(()=>s.style.display='none',2500);
}

// המתנה שכל האריחים הנראים בעורך ייטענו (עד maxMs) — כדי לא לצלם רקע שחור
function edWaitTilesIdle(maxMs){
  return new Promise(resolve=>{
    const start=Date.now();
    const check=()=>{ if(_edTilesLoading===0 || Date.now()-start>maxMs){ resolve(); return; } setTimeout(check,80); };
    setTimeout(check,120);
  });
}

async function captureAndUploadSnapshot(){
  const mapEl = document.getElementById('editMap');
  const winEl = mapEl.parentElement;              // .map-edit-window
  const title = winEl.querySelector('.edit-title');
  const mail  = winEl.querySelector('.edit-mail');
  const ctrls = mapEl.querySelector('.leaflet-control-container');
  const panes = ['markerPane','tooltipPane'].map(p=>{ try{ return editMap.getPane(p); }catch(e){ return null; } });
  try{
    await edWaitTilesIdle(3000);
    // מסתירים סיכות/בקרות/כיתובים — מצלמים לוויין נקי בלבד.
    // הסיכות לא "נאפות" לתמונה כי הצבע שלהן משתנה לפי סטטוס השחקן — הן
    // מצוירות אצל השחקן כשכבת HTML מעל התמונה, לפי אחוזים.
    panes.forEach(p=>{ if(p) p.style.visibility='hidden'; });
    if(ctrls) ctrls.style.visibility='hidden';
    if(title) title.style.visibility='hidden';
    if(mail)  mail.style.visibility='hidden';
    await new Promise(r=>setTimeout(r,60));

    const canvas = await html2canvas(mapEl, {
      useCORS:true, allowTaint:false, backgroundColor:null, scale:2, logging:false,
      width: mapEl.clientWidth, height: mapEl.clientHeight
    });

    // מיקום כל תחנה באחוזים על התצוגה המצולמת
    const size = editMap.getSize();
    const markers = []; const outside = [];
    Object.keys(edMarkers).forEach(id=>{
      const pt = editMap.latLngToContainerPoint(edMarkers[id].getLatLng());
      const x = pt.x / size.x * 100, y = pt.y / size.y * 100;
      markers.push({ id:Number(id), x:+x.toFixed(3), y:+y.toFixed(3) });
      if(x < 0 || x > 100 || y < 0 || y > 100) outside.push(id);
    });
    if(outside.length) alert(t('dash.snapOutside',{list: outside.join(', ')}));

    const body = { image: canvas.toDataURL('image/png'), viewW:size.x, viewH:size.y, markers };
    const r = await fetch('/api/admin/company/'+activeCompanyId+'/map-snapshot',
      { method:'POST', headers:{...H(),'Content-Type':'application/json'}, body:JSON.stringify(body) });
    if(!r.ok) throw new Error('snapshot save failed');
  }catch(e){
    // צילום נכשל (למשל CORS) — מוחקים snapshot ישן כדי שהשחקן לא יראה
    // תמונה עם מיקומי תחנות מיושנים; הוא ייפול חזרה למפה החיה.
    try{
      await fetch('/api/admin/company/'+activeCompanyId+'/map-snapshot',
        { method:'POST', headers:{...H(),'Content-Type':'application/json'}, body:JSON.stringify({clear:true}) });
    }catch(_){}
    alert(t('dash.snapFail'));
  }finally{
    panes.forEach(p=>{ if(p) p.style.visibility=''; });
    if(ctrls) ctrls.style.visibility='';
    if(title) title.style.visibility='';
    if(mail)  mail.style.visibility='';
  }
}

// הדפסת המפה על A4 — שומר קודם, ואז פותח את תצוגת השחקן הנקייה להדפסה
async function printMap(){
  if(!editMap){ alert(t('dash.mapNotLoaded')); return; }
  await saveMap();
  const w=window.open('/c/'+activeCompanyId+'/map?print=1','_blank');
  // המפה תיטען בטאב החדש; ההדפסה מופעלת שם אוטומטית כשמוכן
}

function esc(s){ return (s||'').toString().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

// קובע את כותרת הראש לפי המצב הנוכחי (תפקיד + האם בתוך חברה) — קריאה אחת, מקור אמת יחיד
function updateHeader(){
  const inCompany = !!activeCompanyId && document.getElementById('companyView').style.display!=='none';
  if (ROLE==='super') {
    document.getElementById('hdrTitle').textContent = t('dash.hdrSuper');
    document.getElementById('hdrSub').textContent = inCompany ? t('dash.editingSub',{name:activeCompanyName}) : t('dash.hdrSuperSub');
  } else if (ROLE==='company') {
    document.getElementById('hdrTitle').textContent = t('dash.hdrCompany',{name:activeCompanyName});
    document.getElementById('hdrSub').textContent = t('dash.hdrCompanySub');
  }
}

// ===== מנהל-על: בילינג (PayPal + מעקב מחזור-חיים) =====
async function loadBilling(){
  const host = document.getElementById('sv_billing');
  host.innerHTML = `
    <div class="card2">
      <h3 style="color:#1a2a6c;margin-bottom:10px" data-i18n="dash.billingCfgTitle">⚙️ הגדרות PayPal</h3>
      <p class="hint" style="margin-bottom:12px" data-i18n="dash.billingCfgHint">מצב sandbox = בדיקות עם כסף מדומה. החלפה ל-live כשהחשבון האמיתי מוכן — בלי לשנות קוד.</p>
      <div class="row">
        <div><label data-i18n="dash.billingMode">מצב</label>
          <select id="bMode"><option value="sandbox">Sandbox (בדיקות)</option><option value="live">Live (אמיתי)</option></select>
        </div>
        <div><label data-i18n="dash.billingPrice">מחיר שבועי</label><input id="bPrice" type="number" min="0" step="0.10"></div>
        <div><label data-i18n="dash.billingCurrency">מטבע</label><input id="bCurrency" maxlength="3" style="text-transform:uppercase"></div>
      </div>
      <div class="row" style="margin-top:8px">
        <div><label>PayPal Client ID</label><input id="bClientId" placeholder="Axxx..."></div>
        <div><label>PayPal Client Secret</label><input id="bSecret" type="password" placeholder="${t('dash.billingSecretPh')}"></div>
      </div>
      <button class="btn green" style="margin-top:12px" onclick="saveBillingConfig()" data-i18n="dash.saveBtn">💾 שמור</button>
      <span class="saved" id="bSaved" style="display:none" data-i18n="dash.saved">נשמר ✓</span>
      <p class="hint" style="margin-top:10px" id="bSecretStatus"></p>
      <p class="hint" style="margin-top:6px">💳 ${location.origin}/billing</p>
    </div>
    <div class="card2">
      <h3 style="color:#1a2a6c;margin-bottom:10px" data-i18n="dash.billingCompaniesTitle">📋 חברות במחזור בילינג</h3>
      <div id="billingCompaniesList"></div>
    </div>`;
  I18N.applyLang();
  try {
    const r = await fetch('/api/admin/billing-config',{headers:H()});
    const d = await r.json();
    document.getElementById('bMode').value = d.mode || 'sandbox';
    document.getElementById('bPrice').value = d.weeklyPrice || 19.90;
    document.getElementById('bCurrency').value = d.currency || 'USD';
    document.getElementById('bClientId').value = d.paypalClientId || '';
    document.getElementById('bSecretStatus').textContent = d.hasSecret ? t('dash.billingSecretSet') : t('dash.billingSecretMissing');
  } catch(e){}
  loadBillingCompanies();
}
async function saveBillingConfig(){
  const body = {
    mode: document.getElementById('bMode').value,
    weeklyPrice: Number(document.getElementById('bPrice').value)||19.90,
    currency: document.getElementById('bCurrency').value.trim().toUpperCase()||'USD',
    paypalClientId: document.getElementById('bClientId').value.trim(),
    paypalClientSecret: document.getElementById('bSecret').value.trim()
  };
  const r = await fetch('/api/admin/billing-config',{method:'POST',headers:{...H(),'Content-Type':'application/json'},body:JSON.stringify(body)});
  if(!r.ok){ alert(t('dash.saveErr')); return; }
  document.getElementById('bSecret').value='';
  const s=document.getElementById('bSaved'); s.style.display='inline'; setTimeout(()=>s.style.display='none',2000);
  loadBilling();
}
async function loadBillingCompanies(){
  const host = document.getElementById('billingCompaniesList');
  try {
    const r = await fetch('/api/admin/billing-companies',{headers:H()});
    const d = await r.json();
    if(!d.companies.length){ host.innerHTML='<p class="hint" style="padding:14px;text-align:center">'+t('dash.billingNoCompanies')+'</p>'; return; }
    host.innerHTML = d.companies.map(co=>{
      const meta = [co.billingEmail?esc(co.billingEmail):'', billingMeta(co).replace(/^ · /,'')].filter(Boolean).join(' · ');
      return `
      <div class="company-row">
        <div class="top">
          <div>
            <span class="cname">${esc(co.name)}</span>
            <span class="${co.enabled?'badge-on':'badge-off'}">${co.enabled?t('dash.active'):t('dash.inactive')}</span>
            ${billingBadge(co)}
          </div>
        </div>
        <div class="meta">${meta}</div>
      </div>`;
    }).join('');
  } catch(e){ host.innerHTML=''; }
}

// ===== ספריית חבילות =====
let libraryPacks = [];
let editingPackId = null;
// הקשר רינדור: company (בתוך חברה, מותר לטעון) או super (מסך ראשי, ניהול בלבד)
let libCtx = { grid:'libGrid', fLang:'filterLang', fStyle:'filterStyle', fAge:'filterAge', canLoad:true };

async function fetchLibrary(){
  try { const r = await fetch('/api/admin/library',{headers:H()}); const d = await r.json(); libraryPacks = d.packs || []; }
  catch(e){ libraryPacks = []; }
}

// טאב ספרייה בתוך חברה
async function loadLibrary(){
  libCtx = { grid:'libGrid', fLang:'filterLang', fStyle:'filterStyle', fAge:'filterAge', canLoad:true };
  document.getElementById('libManage').style.display = (ROLE==='super') ? 'block' : 'none';
  closePackEditor();
  await fetchLibrary();
  populateLibFilters();
  renderLibrary();
}

// טאב ספרייה במסך הראשי של מנהל-על (ניהול + עיון, בלי טעינה לחברה)
async function loadSuperLibrary(){
  const host = document.getElementById('sv_superlib');
  // בנה את התשתית פעם אחת
  host.innerHTML = `
    <div class="card2 noprint">
      <h3 style="color:#1a2a6c;margin-bottom:6px" data-i18n="lib.manageTitle">📚 ניהול ספריית החבילות</h3>
      <p class="hint" style="margin-bottom:6px" data-i18n="lib.superManageHint">ערוך מטא-דאטה, מחק או העלה חבילות. כדי לבנות תוכן חדש עם תמונות — היכנס לחברה כלשהי, בנה בטאב "שאלות", ושמור כחבילה.</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn" onclick="document.getElementById('packUploadFileSuper').click()" data-i18n="lib.uploadPack">⬆️ העלאת חבילה מקובץ</button>
        <input type="file" id="packUploadFileSuper" accept="application/json,.json" style="display:none" onchange="uploadPackFile(event)">
      </div>
      <span class="saved" id="libMsgSuper" style="display:none"></span>
    </div>
    <div class="card2 noprint" id="packEditorSuper" style="display:none">
      <h3 style="color:#1a2a6c;margin-bottom:10px" id="packEditorTitleSuper"></h3>
      <div class="row">
        <div><label data-i18n="lib.packName">שם החבילה</label><input id="pkNameS"></div>
        <div><label data-i18n="lib.filterLang">שפה</label>
          <select id="pkLangS"><option value="he" data-i18n="lib.langHe">עברית 🇮🇱</option><option value="en" data-i18n="lib.langEn">אנגלית 🇺🇸</option><option value="it" data-i18n="lib.langIt">איטלקית 🇮🇹</option></select>
        </div>
      </div>
      <div class="row">
        <div><label data-i18n="lib.packStyle">סגנון</label><input id="pkStyleS" data-i18n-ph="lib.packStyle"></div>
        <div><label data-i18n="lib.packAge">גילאים</label><input id="pkAgeS" data-i18n-ph="lib.packAge"></div>
      </div>
      <label data-i18n="lib.packDesc">תיאור קצר</label>
      <input id="pkDescS" data-i18n-ph="lib.packDesc">
      <div style="margin-top:12px;display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <button class="btn green" onclick="savePackSuper()" data-i18n="lib.saveChanges">💾 שמור שינויים</button>
        <button class="btn gray" onclick="closePackEditorSuper()" data-i18n="lib.cancel">ביטול</button>
        <span class="saved" id="pkSavedSuper" style="display:none" data-i18n="lib.saved">נשמר ✓</span>
      </div>
    </div>
    <div class="card2">
      <h3 style="color:#1a2a6c;margin-bottom:6px" data-i18n="lib.browseTitle">📚 חבילות שאלות מוכנות</h3>
      <p class="hint" style="margin-bottom:12px" data-i18n="lib.superBrowseHint">כל החבילות בספרייה. עיין, צפה בתצוגה מקדימה, ערוך מטא או מחק.</p>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px">
        <div><label data-i18n="lib.filterLang">שפה</label>
          <select id="filterLangSuper" onchange="renderLibrary()"><option value="" data-i18n="lib.all">הכל</option><option value="he" data-i18n="lib.langHe">עברית 🇮🇱</option><option value="en" data-i18n="lib.langEn">אנגלית 🇺🇸</option><option value="it" data-i18n="lib.langIt">איטלקית 🇮🇹</option></select>
        </div>
        <div><label data-i18n="lib.filterStyle">סגנון</label><select id="filterStyleSuper" onchange="renderLibrary()"><option value="" data-i18n="lib.all">הכל</option></select></div>
        <div><label data-i18n="lib.filterAge">גילאים</label><select id="filterAgeSuper" onchange="renderLibrary()"><option value="" data-i18n="lib.all">הכל</option></select></div>
      </div>
      <div class="qr-grid" id="libGridSuper"></div>
    </div>`;
  I18N.applyLang(); // לתרגם את ה-data-i18n שזה עתה הוזרקו
  libCtx = { grid:'libGridSuper', fLang:'filterLangSuper', fStyle:'filterStyleSuper', fAge:'filterAgeSuper', canLoad:false };
  await fetchLibrary();
  populateLibFilters();
  renderLibrary();
}

function populateLibFilters(){
  const styles = [...new Set(libraryPacks.map(p=>p.style).filter(Boolean))].sort();
  const ages = [...new Set(libraryPacks.map(p=>p.ageRange).filter(Boolean))].sort();
  const fill = (id, vals) => {
    const sel = document.getElementById(id); if(!sel) return;
    const cur = sel.value;
    sel.innerHTML = '<option value="">'+t('lib.all')+'</option>' + vals.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('');
    sel.value = vals.includes(cur) ? cur : '';
  };
  fill(libCtx.fStyle, styles);
  fill(libCtx.fAge, ages);
}

function renderLibrary(){
  const gv = id => { const e=document.getElementById(id); return e?e.value:''; };
  const fl = gv(libCtx.fLang), fs = gv(libCtx.fStyle), fa = gv(libCtx.fAge);
  const grid = document.getElementById(libCtx.grid);
  if(!grid) return;
  if(!libraryPacks.length){ grid.innerHTML = '<p class="hint">'+t('lib.empty')+'</p>'; return; }
  const flag = {he:'🇮🇱', en:'🇺🇸', it:'🇮🇹'};
  const filtered = libraryPacks.filter(p => (!fl || p.lang===fl) && (!fs || p.style===fs) && (!fa || p.ageRange===fa));
  if(!filtered.length){ grid.innerHTML = '<p class="hint">'+t('lib.noMatch')+'</p>'; return; }
  const canLoad = libCtx.canLoad;
  grid.innerHTML = filtered.map(p=>{
    const nameEsc = esc(p.name).replace(/'/g,"\\'");
    return `
    <div class="pack-card">
      <div class="pname">${esc(p.name)}</div>
      <div class="ptags">
        <span class="ptag lang">${flag[p.lang]||''} ${esc(p.lang.toUpperCase())}</span>
        ${p.style?`<span class="ptag">${esc(p.style)}</span>`:''}
        ${p.ageRange?`<span class="ptag">👤 ${esc(p.ageRange)}</span>`:''}
        <span class="ptag">${p.questionCount} ${t('lib.questions')}</span>
        <span class="ptag uses">▶ ${p.uses} ${t('lib.uses')}</span>
      </div>
      ${p.description?`<div class="pdesc">${esc(p.description)}</div>`:'<div class="pdesc"></div>'}
      <div class="pactions">
        ${canLoad?`<button class="btn green" onclick="loadPack('${p.id}','${nameEsc}')">${t('lib.load')}</button>`:''}
        <button class="btn gray" onclick="previewPack('${p.id}')">${t('lib.preview')}</button>
        ${ROLE==='super'?`<button class="btn" onclick="${canLoad?'editPack':'editPackSuper'}('${p.id}')">${t('lib.editPack')}</button>
        <button class="btn red" onclick="deletePack('${p.id}','${nameEsc}')">${t('lib.deletePack')}</button>`:''}
      </div>
    </div>`;
  }).join('');
}

async function loadPack(pid, name){
  if(!confirm(t('lib.loadConfirm',{name}))) return;
  try {
    const r = await fetch('/api/admin/company/'+activeCompanyId+'/load-pack',{method:'POST',headers:{...H(),'Content-Type':'application/json'},body:JSON.stringify({packId:pid})});
    const d = await r.json();
    if(!r.ok){ alert(d.error||t('lib.loadErr')); return; }
    await loadCompanyData();   // רענן את השאלות + שפה
    alert(t('lib.loaded',{name}));
  } catch(e){ alert(t('lib.loadErr')); }
}

// עריכת מטא במסך הראשי (super)
function editPackSuper(pid){
  const meta = libraryPacks.find(p=>p.id===pid); if(!meta) return;
  editingPackId = pid;
  document.getElementById('packEditorTitleSuper').textContent = t('lib.editingPack',{name:meta.name});
  document.getElementById('pkNameS').value=meta.name||'';
  document.getElementById('pkLangS').value=meta.lang||'he';
  document.getElementById('pkStyleS').value=meta.style||'';
  document.getElementById('pkAgeS').value=meta.ageRange||'';
  document.getElementById('pkDescS').value=meta.description||'';
  document.getElementById('packEditorSuper').style.display='block';
  document.getElementById('packEditorSuper').scrollIntoView({behavior:'smooth',block:'nearest'});
}
function closePackEditorSuper(){ const e=document.getElementById('packEditorSuper'); if(e) e.style.display='none'; editingPackId=null; }
async function savePackSuper(){
  if(!editingPackId) return;
  const body = {
    name: document.getElementById('pkNameS').value.trim(),
    lang: document.getElementById('pkLangS').value,
    style: document.getElementById('pkStyleS').value.trim(),
    ageRange: document.getElementById('pkAgeS').value.trim(),
    description: document.getElementById('pkDescS').value.trim()
  };
  if(!body.name){ alert(t('lib.packName')); return; }
  try {
    const r = await fetch('/api/admin/library/'+editingPackId,{method:'POST',headers:{...H(),'Content-Type':'application/json'},body:JSON.stringify(body)});
    const d = await r.json();
    if(!r.ok){ alert(d.error||t('lib.loadErr')); return; }
    const s=document.getElementById('pkSavedSuper'); s.style.display='inline'; setTimeout(()=>s.style.display='none',2000);
    closePackEditorSuper();
    await fetchLibrary(); populateLibFilters(); renderLibrary();
  } catch(e){ alert(t('lib.loadErr')); }
}

async function previewPack(pid){
  let pack;
  try { const r = await fetch('/api/admin/library/'+pid,{headers:H()}); const d = await r.json(); pack = d.pack; }
  catch(e){ return; }
  if(!pack) return;
  const items = (pack.stations||[]).filter(s=>(s.questionText||'').trim()).map((s,i)=>`
    <div class="qitem"><b>${i+1}. ${esc(s.title||'')}</b>
      <div class="qa">${esc(s.questionText||'')}</div>
      ${s.questionType==='text' && s.correctAnswer?`<div class="qa">✓ ${esc(s.correctAnswer)}</div>`:''}
      ${s.questionType==='photo'?`<div class="qa">📸</div>`:''}
    </div>`).join('');
  const m = document.createElement('div');
  m.className='pack-modal';
  m.onclick = (e)=>{ if(e.target===m) m.remove(); };
  m.innerHTML = `<div class="inner"><h3>${t('lib.previewTitle',{name:esc(pack.name)})}</h3>${items||'<p class="hint">—</p>'}
    <div style="margin-top:14px;text-align:center"><button class="btn gray" onclick="this.closest('.pack-modal').remove()">${t('lib.close')}</button></div></div>`;
  document.body.appendChild(m);
}

// --- שמירת/עריכת חבילה (מנהל-על) ---
// editingPackId=null + saveMode='new'  → שמירת שאלות החברה הנוכחית כחבילה חדשה
// editingPackId set + saveMode='edit'  → עריכת מטא-דאטה של חבילה קיימת
let saveMode = 'new';

function openSavePackForm(){
  editingPackId = null; saveMode = 'new';
  document.getElementById('packEditorTitle').textContent = t('lib.saveCurrentTitle');
  document.getElementById('pkName').value = activeCompanyName || '';
  document.getElementById('pkLang').value = document.getElementById('defaultLang') ? document.getElementById('defaultLang').value : 'he';
  document.getElementById('pkStyle').value=''; document.getElementById('pkAge').value=''; document.getElementById('pkDesc').value='';
  document.getElementById('pkSaveBtn').textContent = t('lib.saveAsNew');
  document.getElementById('packEditor').style.display='block';
  document.getElementById('packEditor').scrollIntoView({behavior:'smooth',block:'nearest'});
}
function closePackEditor(){ const e=document.getElementById('packEditor'); if(e) e.style.display='none'; editingPackId=null; }

async function editPack(pid){
  const meta = libraryPacks.find(p=>p.id===pid);
  if(!meta) return;
  editingPackId = pid; saveMode = 'edit';
  document.getElementById('packEditorTitle').textContent = t('lib.editingPack',{name:meta.name});
  document.getElementById('pkName').value=meta.name||'';
  document.getElementById('pkLang').value=meta.lang||'he';
  document.getElementById('pkStyle').value=meta.style||'';
  document.getElementById('pkAge').value=meta.ageRange||'';
  document.getElementById('pkDesc').value=meta.description||'';
  document.getElementById('pkSaveBtn').textContent = t('lib.saveChanges');
  document.getElementById('packEditor').style.display='block';
  document.getElementById('packEditor').scrollIntoView({behavior:'smooth',block:'nearest'});
}

async function savePack(){
  const body = {
    name: document.getElementById('pkName').value.trim(),
    lang: document.getElementById('pkLang').value,
    style: document.getElementById('pkStyle').value.trim(),
    ageRange: document.getElementById('pkAge').value.trim(),
    description: document.getElementById('pkDesc').value.trim()
  };
  if(!body.name){ alert(t('lib.packName')); return; }
  try {
    let url, r, d;
    if(saveMode==='edit' && editingPackId){
      // עדכון מטא בלבד — התוכן נשמר בשרת כפי שהוא
      r = await fetch('/api/admin/library/'+editingPackId,{method:'POST',headers:{...H(),'Content-Type':'application/json'},body:JSON.stringify(body)});
    } else {
      // שמירת שאלות החברה הנוכחית כחבילה חדשה
      r = await fetch('/api/admin/company/'+activeCompanyId+'/save-as-pack',{method:'POST',headers:{...H(),'Content-Type':'application/json'},body:JSON.stringify(body)});
    }
    d = await r.json();
    if(!r.ok){ alert(d.error||t('lib.loadErr')); return; }
    const s=document.getElementById('pkSaved'); s.style.display='inline'; setTimeout(()=>s.style.display='none',2000);
    if(saveMode==='new'){ const m=document.getElementById('libMsg'); m.textContent=t('lib.saveCurrentDone',{name:body.name}); m.style.display='inline'; setTimeout(()=>m.style.display='none',2800); }
    closePackEditor();
    await loadLibrary();
  } catch(e){ alert(t('lib.loadErr')); }
}

// רענון תצוגת הספרייה לפי ההקשר הפעיל (חברה או מסך-על)
async function refreshLibraryView(){
  await fetchLibrary();
  populateLibFilters();
  renderLibrary();
}

async function uploadPackFile(e){
  const file=e.target.files[0]; if(!file) return; e.target.value='';
  if(!confirm(t('lib.uploadConfirm'))) return;
  let data;
  try { data=JSON.parse(await file.text()); }
  catch(err){ alert(t('dash.importBadJson')); return; }
  if(!Array.isArray(data.stations)){ alert(t('dash.importNoStations')); return; }
  const body = {
    name: (data.name || data.gameName || file.name.replace(/\.json$/i,'')).slice(0,120),
    lang: data.lang || data.defaultLang || 'he',
    style: data.style || '',
    ageRange: data.ageRange || '',
    description: data.description || '',
    stations: data.stations,
    mapConfig: data.mapConfig
  };
  try {
    const r = await fetch('/api/admin/library',{method:'POST',headers:{...H(),'Content-Type':'application/json'},body:JSON.stringify(body)});
    const d = await r.json();
    if(!r.ok){ alert(d.error||t('lib.loadErr')); return; }
    const m=document.getElementById('libMsg')||document.getElementById('libMsgSuper');
    if(m){ m.textContent=t('lib.created'); m.style.display='inline'; setTimeout(()=>m.style.display='none',2500); }
    await refreshLibraryView();
  } catch(e){ alert(t('lib.loadErr')); }
}

async function deletePack(pid, name){
  if(!confirm(t('lib.deleteConfirm',{name}))) return;
  try { await fetch('/api/admin/library/'+pid,{method:'DELETE',headers:H()}); await refreshLibraryView(); }
  catch(e){ alert(t('lib.loadErr')); }
}


// ===== בורר שפת ממשק למנהל =====
I18N.renderLangPicker('langPicker', {compact:true});
I18N.renderLangPicker('langPickerApp', {compact:true});
function applyEditorFrame(){
  document.querySelectorAll('.map-frame-wrap img.frame, #frameImg').forEach(img=>{
    img.src = '/map-frame.png?lang=' + getLang();
  });
}
document.addEventListener('langchange', () => {
  applyEditorFrame();
  updateHeader();
  if (ROLE==='super' && document.getElementById('superView').style.display!=='none') {
    if (document.getElementById('sv_superlib') && document.getElementById('sv_superlib').style.display !== 'none') {
      loadSuperLibrary();
    } else if (document.getElementById('sv_billing') && document.getElementById('sv_billing').style.display !== 'none') {
      loadBilling();
    } else {
      loadCompanies();
    }
  } else if (activeCompanyId) {
    if (stations && stations.length) renderStations();
    applyLockUI(); renderChips();
    if (document.getElementById('library') && document.getElementById('library').style.display !== 'none') {
      populateLibFilters(); renderLibrary();
    }
  }
});

// כניסה אוטומטית
(async()=>{
  applyEditorFrame();
  const saved=localStorage.getItem('fg_token');
  if(!saved) return;
  TOKEN=saved;
  const r=await fetch('/api/admin/me',{headers:H()});
  if(r.ok){ const d=await r.json(); ROLE=d.role; enterApp(d); }
  else { localStorage.removeItem('fg_token'); TOKEN=''; }
})();
</script>
</body>
</html>
