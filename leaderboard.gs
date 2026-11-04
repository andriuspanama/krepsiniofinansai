/**
 * Krepšinio klubų finansai – žaidimų lyderių lentelė (Google Apps Script).
 *
 * Kaip įdiegti (vieną kartą):
 *  1. Sukurkite naują Google lentelę (pvz. „Krepšinio finansai – lyderiai“).
 *  2. Meniu „Plėtiniai“ → „Apps Script“ (Extensions → Apps Script).
 *  3. Ištrinkite tai, kas ten parašyta, ir įklijuokite visą šį failą. Išsaugokite (Ctrl+S).
 *  4. „Diegti“ → „Naujas diegimas“ (Deploy → New deployment) → tipas „Žiniatinklio programa“ (Web app):
 *       Vykdyti kaip (Execute as): Aš (Me)
 *       Kas turi prieigą (Who has access): Bet kas (Anyone)
 *     → „Diegti“ → leiskite prieigą (Google gali įspėti „nepatikrinta programa“ → Advanced → Go to … → Allow).
 *  5. Nukopijuokite žiniatinklio programos nuorodą (baigiasi /exec) – ji įrašoma svetainės faile redesign.js (LB_URL).
 *
 * Rezultatai saugomi šios lentelės lape „Leaderboard“ (sukuriamas automatiškai). Netinkamą įrašą galima tiesiog ištrinti.
 */
var SHEET = 'Leaderboard';
var GAMES = { mapday: 10000, mapfree: 10000, bud: 1000, att: 1000, sal: 1000 };   // didžiausias galimas rezultatas
var TOP = 20, TZ = 'Europe/Vilnius';

function today_(d) { return Utilities.formatDate(d || new Date(), TZ, 'yyyy-MM-dd'); }
function sheet_() {
  var ss = SpreadsheetApp.getActive(), sh = ss.getSheetByName(SHEET);
  if (!sh) {
    sh = ss.insertSheet(SHEET);
    sh.appendRow(['Time', 'Game', 'Day', 'Name', 'Score', 'Km']);
    sh.setFrozenRows(1);
    sh.getRange('C:D').setNumberFormat('@');   // diena ir vardas – tekstas
  }
  return sh;
}
function dayOf_(v) { return v instanceof Date ? Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd') : String(v); }
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

// GET – geriausi rezultatai: kiekvienam vardui – jo geriausias; dienos iššūkis – tik šiandienos
function doGet() {
  var day = today_(), rows = sheet_().getDataRange().getValues().slice(1), boards = {};
  Object.keys(GAMES).forEach(function (g) {
    var best = {};
    rows.forEach(function (r) {
      if (r[1] !== g || (g === 'mapday' && dayOf_(r[2]) !== day)) return;
      var name = String(r[3]), k = name.toLowerCase(), sc = Number(r[4]);
      if (!isFinite(sc)) return;
      if (!best[k] || sc > best[k].score) best[k] = { name: name, score: sc, km: r[5] === '' ? null : Number(r[5]) };
    });
    boards[g] = Object.keys(best).map(function (k) { return best[k]; }).sort(function (a, b) { return b.score - a.score; }).slice(0, TOP);
  });
  return out_({ ok: true, day: day, boards: boards });
}

// POST – naujas rezultatas { game, name, score, km?, day? }
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var d = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var g = String(d.game || ''), max = GAMES[g];
    if (!max) return out_({ ok: false, error: 'game' });
    var name = String(d.name || '').replace(/[<>"]/g, '').replace(/\s+/g, ' ').trim().replace(/^[=+\-@]+/, '').slice(0, 20);
    if (!name) return out_({ ok: false, error: 'name' });
    var score = Math.round(Number(d.score));
    if (!isFinite(score) || score < 0 || score > max) return out_({ ok: false, error: 'score' });
    var day = today_();
    if (g === 'mapday') {   // dienos iššūkis: šiandienos arba (ką tik po vidurnakčio baigtas) vakarykštis
      var y = today_(new Date(Date.now() - 864e5));
      if (d.day !== day && d.day !== y) return out_({ ok: false, error: 'day' });
      day = d.day;
    }
    var km = d.km == null || !isFinite(Number(d.km)) ? '' : Math.round(Number(d.km));
    // tas pats vardas toje pačioje lentelėje (dienos iššūkyje – tą pačią dieną) – tik viena eilutė:
    // geresnis rezultatas perrašo senąjį, prastesnis neįrašomas
    var sh = sheet_(), rows = sh.getDataRange().getValues(), key = name.toLowerCase();
    for (var i = rows.length - 1; i >= 1; i--) {
      var r = rows[i];
      if (r[1] !== g || String(r[3]).toLowerCase() !== key || (g === 'mapday' && dayOf_(r[2]) !== day)) continue;
      var old = Number(r[4]);
      if (isFinite(old) && old >= score) return out_({ ok: true, kept: true, best: old });
      sh.getRange(i + 1, 1, 1, 6).setValues([[new Date(), g, day, name, score, km]]);
      return out_({ ok: true, updated: true, prev: old });
    }
    sh.appendRow([new Date(), g, day, name, score, km]);
    return out_({ ok: true });
  } finally {
    lock.releaseLock();
  }
}
