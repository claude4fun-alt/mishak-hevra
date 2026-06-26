# סיכום פרויקט "משחק חברה" (Mishak Hevra) — לסשן חדש

## מה זה
מערכת משחק תחנות QR רב-חברתית (multi-tenant) ל-Amir Cohen. Node.js/Express, מתארחת ב-Render (חינמי), גיבוי ל-GitHub. עברית RTL. כל חברה: 10 תחנות QR, שאלות טקסט/תמונה, ניקוד + בונוס מהירות, לוח תוצאות חי, **מפת לוויין עם מיקום תחנות**, בידוד מלא בין חברות.

## מבנה קבצים — קריטי
מבנה שטוח — כל הקבצים בשורש, בלי תיקיית public (כי Amir מעלה ל-GitHub בגרירה שמשטחת תיקיות). server.js מגיש מהשורש.
הקבצים: server.js, package.json, package-lock.json, render.yaml, .gitignore, README.md, poster.png, **map-frame.png** (פוסטר מסגרת המפה ~2.9MB), **leaflet.js**, **leaflet.css** (ספריית מפה מקומית, לא CDN), + HTML: index, company, station, join, board, dashboard, progress, **map**.

⚠️ **אזהרה חוזרת:** Amir נוטה להעלות בטעות קוד ל-repo הנתונים. הקוד הולך ל-`mishak-hevra`, לא ל-`mishak-hevra-data`.
⚠️ **בעיית כפילות שם:** כשמורידים קובץ שכבר קיים בהורדות, הדפדפן מוסיף `(1)` (למשל `server (1).js`). זה גרם פעם להרצת server.js ישן. לוודא שאין כפילויות לפני העלאה.

## GitHub + Render
- קוד: repo `claude4fun-alt/mishak-hevra` (Public) — Render מושך מכאן
- נתונים: repo `mishak-hevra-data` (Private) — גיבוי db.json בלבד
- Render service: mishak-hevra, Node, Build `npm install`, Start `npm start`, Free, Oregon
- משתני סביבה: GH_TOKEN, GH_OWNER, GH_REPO=mishak-hevra-data
- כתובת חיה: https://mishak-hevra.onrender.com
- ⚠️ במסלול החינמי השירות "נרדם" אחרי חוסר פעילות וטוקני sessions (in-memory) מתאפסים בכל deploy/restart — צריך להתחבר מחדש לדשבורד.

## התחברות
- מנהל-על (super): `amirco` / `Havefun360` — יוצר/מנהל חברות, רואה הכל
- מנהל חברה: שם החברה + סיסמה. **שם החברה = שם היוזר של מנהל החברה.** עורך רק את החברה שלו.

## מודל נתונים
`db.companies[companyId] = {id, name, password, enabled, gameName, stations[10], players{}, submissions[], speedBonus{}, mapConfig{}}`.
- `mapConfig = {locked:bool, center:{lat,lng}, zoom, markerSize:16-64, markers:[{id:1-10,lat,lng}]}` — **מבודד לחלוטין פר-חברה.**
- טוקנים in-memory, role:'super'|'company'. middleware: auth + superOnly + resolveCompany.

## עמודים (URLs נושאים companyId)
`/c/:cid` ראשי · `/c/:cid/station/:id` (דורש ?via=app) · `/c/:cid/join` · `/c/:cid/board` (SSE) · `/c/:cid/progress` · **`/c/:cid/map`** (מפת לוויין אינטראקטיבית) · `/dashboard`

## API מפה (חדש)
- `GET /api/admin/company/:cid/map` — שליפת mapConfig לעריכה (מנהל)
- `POST /api/admin/company/:cid/map` — שמירת mapConfig (center, zoom, locked, markerSize, markers). אימות: zoom 1-21, markerSize 16-64, markers 1-10 עם lat/lng תקינים.
- `GET /api/company/:cid/map?player=X` — לשחקן: mapConfig + סטטוס צבע לכל תחנה (none/correct/wrong/pending) + companyName
- mapConfig נכלל גם ב-export/import של חבילות שאלות.

## פיצ'ר המפה (מאת סשן יוני 2026)
**רקע:** התמונה `map-frame.png` היא פוסטר "המרוץ לפסגה" (ג'ונגל/מצפן/זכוכית מגדלת/אזור קרם מרכזי). המפה יושבת בדיוק באזור הקרם.
**חלון המפה (insets):** left 26.5%, top 24.8%, right 24.8%, bottom 16.2% (מוגדל למקסימום בתוך הקרם בלי לכסות כותרת/QR/מחברת/זכוכית/קרדיט).
**לוויין:** Esri World Imagery חינמי, בלי מפתח API. `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}`, maxZoom:21, maxNativeZoom:19 (מתיחה מעבר ל-19).
**עורך (דשבורד, טאב "🗺️ מפת תחנות"):** מזיז/מזמזם → לוחץ מספר תחנה → לוחץ על המפה למיקום עיגול ממוספר (גרירה להזזה, ✕ למחיקה). כפתורים: שמור / נעל תצוגה / נקה / תצוגת שחקן / **הדפס מפה (A4)**. **בר "📏 גודל העיגולים"** (16-64px) — כל העיגולים משתנים יחד בזמן אמת, נשמר פר-חברה.
**תצוגת שחקן:** אותה מסגרת+מפה, עיגולים משנים צבע לפי סטטוס אישי (אפור=טרם, ירוק=נכון, אדום בהיר=שגוי, צהוב פועם=ממתין), מתרענן כל 5 שניות. נעול = השחקן לא יכול להזיז. מקרא צבעים + מייל ברצועת הקרם מתחת למפה (לא על הלוויין).
**הדפסה A4:** בעורך `printMap()` שומר ואז פותח `/c/:cid/map?print=1` שמדפיס אוטומטית. CSS `@page{size:A4 portrait}` ממרכז את המסגרת על הדף. בתצוגת שחקן יש כפתור 🖨️ ישיר.

## טכני קריטי למפה
- **Leaflet מקומי, לא CDN** — `leaflet.js`+`leaflet.css` בשורש, routes ייעודיים. (unpkg.com נחסם בסביבות מסוימות.)
- **באג CSS שתוקן:** ה-CSS של עורך המפה נכנס בטעות בתוך בלוק `@media print` (חוסר `}`), כך שחל רק בהדפסה. תמיד לוודא שספירת `{` = `}` ב-style.
- **באג גובה-אפס שתוקן:** חלון מפה עם `height:%` על מיכל בלי גובה מפורש → גובה 0 → אריחים לא נראים. הפתרון: position:absolute עם left/top/right/bottom (insets), לא width/height. + קריאות `invalidateSize` חוזרות ([60,200,500,900,1500]ms) אחרי שהטאב גלוי.
- **שמירה נכשלת (401):** טוקן פג אחרי restart של Render. הקוד מציג הודעה ברורה ומבקש התחברות מחדש.

## מייל קשר
`mishak.hevra@gmail.com` — מופיע בעמוד השחקן, על המפה (עורך+שחקן), ובדשבורד-הגדרות, עם כיתוב "למשחקים נוספים פנו ל-".

## פורמט קובץ שאלות (ייצוא/ייבוא)
`{format:'mishak-hevra-questions', version:1, gameName, mapConfig, stations:[{id(1-10),title,questionType('text'|'photo'),questionText,correctAnswer(מילות מפתח בפסיק),points,imageUrl}]}`. תמונות base64. import מחליף כל 10, עד 3MB לתמונה.

## פיצ'רים קודמים שנבנו
רב-חברתי מלא + בידוד · פוסטר רקע · בונוס מהירות פר-חברה · חותם סריקה ?via=app · ייצוא/ייבוא JSON · סקיל mishak-hevra-questions · צלילי Web Audio (סריקה + פאנפרת ניצחון + דינג-דונג "קבוצה אחרת ענתה נכון" דרך SSE event 'scored') · מסך התקדמות אישי (10 עיגולים) · הדפסת QR (קוד אחד בעמוד) · לוח תוצאות בדשבורד (per-company).

## חבילות שאלות שנוצרו
שאלות-חופש-גדול.json, שאלות-חשיבה-עם-תמונות.json

---

## עדכונים נוספים (סשן יוני 2026 — המשך)

### ניווט ושחקנים
- **מפת המשחק נגישה מכל מסכי השחקן:** עמוד החברה, מסך התחנה (station), מסך ההתקדמות (progress), ולוח התוצאות (board) — בכולם יש כפתור/לינק "🧭 מפת המשחק" שמעביר ל-`/c/:cid/map` עם `?player=` כדי שצבעי הסטטוס יוצגו.
- **מהמפה יש סרגל ניווט** (פינה שמאלית-תחתונה, `position:fixed`): חזרה (history.back או עמוד החברה) / לוח תוצאות / סריקת תחנה. לא מסתיר את המפה או טקסט הרקע.
- **מקרא צבעים** = מלבן אנכי, `position:fixed` בפינה ימנית-תחתונה.
- **מייל** = `#topMail`, `position:fixed` בראש העמוד (מעל המסגרת, בשוליים הכהים). לא מסתיר טקסט רקע.
- **המסגרת מיושרת לראש** (`#stage` עם `align-items:flex-start` + `padding-top:var(--mailH)`), ו-`sizeFrame()` מחשב גודל לפי השטח הזמין מתחת למייל — כדי לא לבזבז שטח שחור מעל המפה בטלפון.

### הדפסה (A4) — רק למנהל
- כפתור "🖨️ הדפס מפה (A4)" רק בדשבורד המנהל (`printMap()`), לא לשחקנים.
- `printMap()` שומר את המפה ואז פותח `/c/:cid/map?print=1` שמדפיס אוטומטית.
- **תיקוני הדפסה קריטיים ב-map.html:**
  - `@media print` נכתב **אחרון** ב-style, עם `print-color-adjust:exact !important` על `*` (אחרת דפדפנים לא מדפיסים רקעים/אריחי לוויין).
  - מדיה-קוורי של יחס מסך (aspect-ratio) **הוסרו** — הם דלפו להדפסה וכפו `height:100vh`. הגודל מחושב ב-JS בלבד.
  - `beforeprint` listener מנקה את הגדלים האינליין של `#frameBox` (ש-`sizeFrame` קבע) ומריץ `invalidateSize`+`fitBounds`, אחרת המפה לא מצוירת בגודל הדף.
  - `#legend` מוסתר בהדפסה (`display:none`) — אין סטטוס צבעים בדף מודפס וזה זלג מהפינה.
- **תיקון פרופורציה:** mapConfig שומר `bounds:{north,south,east,west}` (לא רק center+zoom). הן נשמרות בעורך (`editMap.getBounds()`) ומיושמות ב-`fitBounds` גם בתצוגת שחקן וגם בהדפסה — כך אותו אזור גיאוגרפי בדיוק מוצג תמיד, ללא תלות בגודל המיכל.

### מניעת כפילות שחקנים
- ב-`POST /api/company/:cid/join`: חיפוש שחקן קיים עם אותו שם+קבוצה (norm = trim+lowercase). אם נמצא ו-`resume` לא נשלח → 409 עם `existingPlayerId`. אם `resume:true` → מחזיר את השחקן הקיים (בלי כפילות).
- ב-join.html: בקבלת 409 → confirm "שחקן כבר קיים, להמשיך?" → אם כן, שולח שוב עם `resume:true`. מונע שורות כפולות בלוח התוצאות.

### הוראות למשתמשים
- **דשבורד מנהל:** באנר צהוב בראש עמוד החברה — "בדוק קליטה טובה (במיוחד נתונים סלולריים) לפני האירוע".
- **מסך הצטרפות (join):** הערה — "אם יש בעיה בסריקה, ודא שלדפדפן יש הרשאת מצלמה".

### גודל עיגולים
- בר slider בעורך (16-64px), כל העיגולים משתנים יחד בזמן אמת, נשמר ב-`mapConfig.markerSize` **פר-חברה** (מבודד).

### תיקון QR
- `.qr-cell img { max-width:200px }` — כל קוד QR מוצג במלואו בגריד (לא חצי).

---
## ✅ ריבוי שפות (he/en/it) — הושלם (סשן יוני 2026)

**הוחלט ובוצע:** רק **הממשק** מתורגם (כפתורים, כותרות, הודעות). תוכן השאלות נשאר בשפה שהמנהל כתב. אין שינוי במבנה נתוני השאלות.

### i18n.js (קובץ חדש בשורש)
- מילון `{he, en, it}` עם ~230 מפתחות, מקובצים לפי עמוד (`common.*` משותף, `index`, `company`, `join`, `station`, `board`, `progress`, `map`, `dash`).
- מנוע: `t('key')` / `t('key', {n:42})` (החלפת `{placeholders}`), `setLang()`, `getLang()`, `isRTL()`, `applyLang()`, `renderLangPicker(elemId, {compact})`.
- `applyLang()` סורק DOM וממלא: `data-i18n` (textContent), `data-i18n-html` (innerHTML, לטקסטים עם `<b>`/`<br>`), `data-i18n-ph` (placeholder), `data-i18n-title`, `data-i18n-aria`. מזריק `dir=rtl/ltr` + `lang` על `<html>`.
- בורר דגלים מובנה 🇮🇱🇺🇸🇮🇹 (מזריק CSS פעם אחת, מדגיש שפה פעילה). אירוע `langchange` מאפשר רינדור מחדש של טקסט דינמי (טבלאות/כרטיסים).
- **קדימויות שפה:** localStorage (`fg_lang`) ← `window.FG_DEFAULT_LANG` (defaultLang של החברה) ← `he`.

### שינויי server.js
- שדה `defaultLang` (he|en|it) בכל חברה + backfill לחברות קיימות (ברירת מחדל he).
- `POST /api/admin/company/:cid/default-lang` — שמירה, דוחה שפה לא תקינה ב-400.
- `defaultLang` נחשף ב: company API, leaderboard, map, station, admin-data, ונכלל ב-export/import.
- route ל-`/i18n.js`.
- **תמונות לפי שפה:** `poster.png` ו-`map-frame.png` מקבלים `?lang=xx`. פונקציית `langAsset()` מגישה `poster-en.png`/`map-frame-it.png` וכו', עם **נפילה אוטומטית** ל-`poster.png`/`map-frame.png` (עברית) אם קובץ השפה חסר.

### בוררי דגלים — מיקום (כפי שהוחלט)
- **בכניסה:** index, company (מסך פתיחה + תפריט), join.
- **בלוח התוצאות:** board.
- **בדשבורד למנהל:** בורר שפת ממשק (login + header) — נוחות המנהל, לא משפיע על השחקנים.
- station/progress/map יורשים שפה מ-defaultLang + הבחירה השמורה (בלי בורר משלהם).

### הגדרת מנהל
- טאב הגדרות בדשבורד: בורר "שפת ברירת מחדל לשחקנים" (`saveDefaultLang()` קורא ל-`/default-lang`).

### תמונות פר-שפה — קונבנציית שמות
- עברית = **בלי סיומת**: `poster.png`, `map-frame.png`.
- אנגלית/איטלקית = **סיומת שפה**: `poster-en.png`, `poster-it.png`, `map-frame-en.png`, `map-frame-it.png`.
- ✅ **נבדק:** 3 גרסאות ה-map-frame זהות בממדים (1054×1492) ובמיקום חלון הקרם — אותם insets (left 26.5%, top 24.8%, right 24.8%, bottom 16.2%) עובדים על כל השלוש ללא שינוי. הקוד טוען `map-frame.png?lang=xx` ומחיל את אותם insets קבועים.
- בעמודי השחקן הרקע מתעדכן דינמית: `body.style.backgroundImage` עם `/poster.png?lang=`, והמסגרת `frameImg.src` עם `/map-frame.png?lang=`.

### באג שתוקן אגב כך
- בהגדרות הדשבורד היה `</div>` חסר (כרטיס "משחקים נוספים" לא נסגר לפני כרטיס האיפוס) — תוקן.

### נבדק end-to-end
- כל הראוטים (login, create company, set/get defaultLang, דחיית שפה לא תקינה, פרופגציה לכל ה-API) עברו.
- כל 8 העמודים נטענים (200). i18n.js נטען ומתפקד (נבדק ב-jsdom: data-i18n מתמלא, dir מתהפך, 3 שפות עובדות, בורר דגלים מרנדר, אפס שגיאות JS בדשבורד).
- תמונות פר-שפה מגישות קבצים נכונים (he/en/it נפרדים; שפה חסרה נופלת לעברית).

### ⚠️ להעלאה ל-GitHub
- קבצים חדשים/שעודכנו: `i18n.js` (חדש), כל 8 ה-HTML, `server.js`, + 4 תמונות חדשות: `poster-en.png`, `poster-it.png`, `map-frame-en.png`, `map-frame-it.png`.
- העברית נשארת `poster.png` / `map-frame.png` כפי שהן.
- ⚠️ התמונות גדולות (~2.6MB כל אחת) — לוודא העלאה מלאה בגרירה (קבצים גדולים לפעמים נחתכים). ולבדוק שאין כפילויות `(1)` בשמות.

---

## ✅ ספריית חבילות שאלות מרכזית — הושלם (סשן יוני 2026)

**מטרה:** ספרייה מרכזית בשרת של חבילות שאלות מוכנות. מנהל ראשי מנהל אותן; מנהלי חברות טוענים עותק ועורכים בחברה שלהם בלי לפגוע במקור. גיבוי/טעינה אישית (קובץ JSON) נשמרים כפי שהיו.

### אחסון
- `db.library = [{id, name, lang, style, ageRange, description, stations[10], mapConfig, uses, createdAt, updatedAt}]` — **בתוך db.json**, מתגבה ל-GitHub אוטומטית (היציב ביותר ל-Render; תיקייה בדיסק הייתה נמחקת בכל deploy).

### הרשאות
- **מנהל ראשי בלבד:** יצירה (`save-as-pack` / upload), עריכת מטא, מחיקה.
- **כל מנהל מחובר:** רשימה (`GET /api/admin/library` — מטא בלבד), תצוגה מקדימה, טעינה.
- מנהל חברה רואה את הספרייה בטאב "📚 ספריית חבילות" וטוען **עותק עמוק** — עריכה אצלו לא נוגעת במקור.

### API
- `GET /api/admin/library` — רשימת מטא (לכל מנהל) · `GET /api/admin/library/:pid` — תוכן מלא
- `POST /api/admin/library` (super) — יצירה/העלאה · `POST /api/admin/library/:pid` (super) — עדכון מטא (לא מאפס uses; `resetUses:true` לאיפוס יזום) · `DELETE /api/admin/library/:pid` (super)
- `POST /api/admin/company/:cid/save-as-pack` (super) — שומר את שאלות החברה הנוכחית כחבילה (הדרך הנוחה לבנות תוכן עם תמונות)
- `POST /api/admin/company/:cid/load-pack` — טוען עותק לחברה (גם super וגם company). מעתיק stations+mapConfig, מאמץ את שפת החבילה כ-defaultLang.

### מעקב פופולריות (uses) — חכם
- כל חברה זוכרת `loadedPackId` + `loadedPackCounted`.
- `maybeCountPackUse()` נקרא בכל הגשת תשובה. סופר שימוש **רק כש-≥5 שחקנים שונים ענו** בחברה (`PACK_USE_THRESHOLD=5`), ו**פעם אחת בלבד לכל טעינה** (`loadedPackCounted`).
- כך טעינות בדיקה לא נספרות, ורק משחק אמיתי מעלה את המונה. ✅ נבדק: 0 ב-4 שחקנים, 1 בדיוק ב-5, נשאר 1 ב-6.
- ייבוא ידני (import) מנתק `loadedPackId` (אינו חבילת ספרייה).

### דשבורד (טאב "📚 ספריית חבילות")
- **דפדפן חבילות:** רשת כרטיסים מעוצבים, כל כרטיס: שם, דגל שפה, סגנון, גילאים, מספר שאלות, מונה שימושים (▶). כפתורי "טען לחברה שלי" + "תצוגה מקדימה".
- **פילטרים:** שפה / סגנון / גילאים (נבנים דינמית מהחבילות).
- **תצוגה מקדימה:** מודאל עם רשימת השאלות.
- **ניהול (super בלבד):** "שמור שאלות נוכחיות כחבילה" + "העלאת חבילה מקובץ" + עריכת מטא + מחיקה.
- i18n מלא (he/en/it) — ~50 מפתחות `lib.*`.

### 15 חבילות שנוצרו (ב-/mnt/user-data/outputs/packs)
5 נושאים × 3 שפות, כל אחת 10 שאלות:
1. צורות/חשיבה חזותית (גיל 13) · 2. קיץ וטיולים לילדים (גיל 10, כולל משימת photo) · 3. חיות (גיל 15) · 4. שוברי ראש/חשיבה (גיל 25) · 5. משפחה וחברים (גיל 13, כולל משימות photo).
פורמט הקובץ כולל שדות מטא של הספרייה: `name, lang, style, ageRange, description` (בנוסף ל-stations). ✅ כל ה-15 נבדקו — נטענים דרך route ההעלאה ומופיעים עם מטא מלא.

**להעלאה:** server.js, dashboard.html, i18n.js עודכנו. 15 קבצי החבילות הם נפרדים — מנהל ראשי מעלה אותם דרך הדשבורד (טאב ספרייה ← העלאת חבילה מקובץ), הם **לא** חלק מקוד האתר.

---

## ✅ שיפורי ספרייה + דפי הסבר — הושלם (סשן יוני 2026)

1. **תיקון באג:** כפתורי כרטיסי החבילות (נוצרים דינמית ב-renderLibrary) לא תורגמו בהחלפת שפה. תוקן — מאזין `langchange` קורא כעת ל-`renderLibrary()` כשטאב הספרייה פתוח (בחברה ובמסך-העל).
2. **ספרייה במסך הראשי של מנהל-על:** נוסף טאב "📚 ספריית חבילות" ב-superView (`sv_superlib`) — עיון/תצוגה מקדימה/עריכת מטא/מחיקה/העלאה, **בלי** "טען לחברה" (אין חברה פעילה שם). `renderLibrary` עברה פרמטריזציה דרך `libCtx` (grid/filters/canLoad) כדי לשרת שני הקשרים.
3. **דף הסבר למנהל חברה:** טאב "❓ מדריך" בדשבורד — 7 שלבים מעוצבים (שאלות, חבילות, גיבוי, מפה, QR, תוצאות/אישורים, הגדרות) + טיפ קליטה. i18n מלא.
4. **דף הסבר לשחקנים:** כפתור "❓ איך משחקים" בתפריט company.html → מודאל מעוצב עם 6 שלבים + מטרה. i18n מלא.
- ~30 מפתחות i18n חדשים (`help.*`, `phelp.*`, `lib.super*`). סה"כ 305 מפתחות.
- קבצים שעודכנו: server.js (ללא שינוי הפעם), dashboard.html, i18n.js, company.html.
