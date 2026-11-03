// Kas savaitę: papildo logos.json (klubų ir lygų logotipai) ir players_photos.json (žaidėjų veidai) TRŪKSTAMAIS įrašais.
// Esami įrašai niekada nekeičiami ir netrinami. Šaltinis – anglų Wikipedia (portretinės nuotraukos, griežtas vardo atitikimas).
// Paleidimas: node update_media.mjs   (GitHub Actions: .github/workflows/media.yml)
import { readFile, writeFile } from "node:fs/promises";

const SHEET_ID = "1Qt4ijFGDmvoLLHb-gCbcAF9KGts6ZC-RHwWzQw68cZI";
const UA = "krepsiniofinansai-media-bot/1.0 (https://github.com/andriuspanama/krepsiniofinansai)";
const RETRY_DAYS = 28;              // nerastus bandoma ieškoti vėl po ~4 savaičių
const MAX_SEARCH = 400;             // kiek paieškų (lėtesnių) daugiausia per vieną paleidimą

// ---------- pagalbinės ----------
export const norm = s => String(s || "").toLowerCase().normalize("NFD").replace(/[^a-z0-9]/g, "");
export const fold = s => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z]/g, "");
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function get(url, json = true) {
  for (let i = 0; i < 4; i++) {
    try {
      const r = await fetch(url, { headers: { "User-Agent": UA } });
      if (r.status === 429 || r.status >= 500) { await sleep(2000 * (i + 1)); continue; }
      if (!r.ok) return null;
      return json ? await r.json() : await r.text();
    } catch (e) { await sleep(1500 * (i + 1)); }
  }
  return null;
}
export function csv(t) {
  const out = []; let row = [], cur = "", q = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (q) { if (c === '"') { if (t[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
    else if (c === '"') q = true;
    else if (c === ",") { row.push(cur); cur = ""; }
    else if (c === "\n") { row.push(cur); out.push(row); row = []; cur = ""; }
    else if (c !== "\r") cur += c;
  }
  if (cur || row.length) { row.push(cur); out.push(row); }
  return out;
}
const sheet = name => get(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&headers=0&sheet=${encodeURIComponent(name)}`, false).then(t => t ? csv(t) : []);

// ---------- duomenys iš lentelės ----------
export function clubsFromBudgets(rows) {          // [{club, nation}] iš lentelių, kurių antraštėje yra „Club“
  const out = []; let ci = -1, ni = 1;
  for (const r of rows) {
    const h = r.map(x => (x || "").trim());
    const k = h.indexOf("Club");
    if (k > 0 && h.some(x => /Nation$/.test(x))) { ci = k; ni = h.findIndex(x => /Nation$/.test(x)); continue; }
    if (ci < 0) continue;
    const c = (r[ci] || "").trim(), n = (r[ni] || "").trim();
    if (!c) { if (!h.some(Boolean)) ci = -1; continue; }
    if (/^(Vidurkis|Average|Club)$/i.test(c)) continue;
    out.push({ club: c, nation: n });
  }
  return out;
}
export function peopleFromSalaries(rows) {        // [{name, role, photo}]
  const out = []; let on = false, pi = -1;
  for (const r of rows) {
    const h = r.map(x => (x || "").trim());
    if (h[1] === "Role") { on = true; pi = h.findIndex(x => /^photo$/i.test(x)); continue; }
    if (!on) continue;
    const name = (r[2] || "").trim();
    if (name) out.push({ name, role: (r[1] || "").trim(), photo: pi >= 0 ? (r[pi] || "").trim() : "" });
  }
  return out;
}

// ---------- Wikipedia ----------
const W = "https://en.wikipedia.org/w/api.php?action=query&format=json&redirects=1&";
const BADF = /\b(vs\.?|versus|dunk|action|game|match|playoff|final|shoot|shot|layup|defen|against|jump)\b|\.svg$/i;
const isPortrait = p => p && !p.missing && /basketball/i.test(p.description || "") && p.thumbnail &&
  p.thumbnail.height >= p.thumbnail.width * 0.8 && !BADF.test(p.pageimage || "");

export async function findPhotos(names, budget = MAX_SEARCH) {      // {name: url}
  const res = {}, title = {}, clean = n => n.replace(/\s+-\s+/g, "-").replace(/\s+/g, " ").trim();
  for (let i = 0; i < names.length; i += 50) {
    const part = names.slice(i, i + 50), q = part.map(clean);
    const r = await get(W + "prop=pageimages|description&piprop=thumbnail|name&pithumbsize=200&titles=" + encodeURIComponent(q.join("|")));
    const Q = (r && r.query) || {}, back = {};
    (Q.normalized || []).forEach(x => back[x.to] = x.from);
    (Q.redirects || []).forEach(x => back[x.to] = back[x.from] || x.from);
    Object.values(Q.pages || {}).forEach(p => { const k = q.indexOf(back[p.title] || p.title); if (k >= 0 && isPortrait(p)) { res[part[k]] = p.thumbnail.source; title[part[k]] = p.title; } });
    await sleep(300);
  }
  let used = 0;
  for (const n of names) {                                     // rašybos skirtumai: paieška + griežtas vardo patikrinimas
    if (res[n] || used >= budget) continue; used++;
    const r = await get(W + "prop=pageimages|description&piprop=thumbnail|name&pithumbsize=200&generator=search&gsrlimit=3&gsrsearch=" + encodeURIComponent(n + " basketball"));
    const ps = Object.values(((r && r.query) || {}).pages || {}).sort((a, b) => a.index - b.index);
    const p = ps.find(p => isPortrait(p) && fold(p.title.replace(/\s*\(.*\)$/, "")) === fold(n));
    if (p) { res[n] = p.thumbnail.source; title[n] = p.title; }
    await sleep(250);
  }
  await newest(res, title);
  return res;
}
// Naujausia portretinė nuotrauka iš straipsnio paveikslėlių (pagal fotografavimo datą arba metus failo pavadinime)
const yearOf = (meta, file) => {
  const d = meta && (meta.DateTimeOriginal || meta.DateTime); const m = String((d && d.value) || "").match(/(19|20)\d\d/);
  if (m) return +m[0];
  const f = String(file).match(/(19|20)\d\d/); return f ? +f[0] : 0;
};
async function newest(res, title) {
  const names = Object.keys(title);
  for (let i = 0; i < names.length; i += 20) {
    const part = names.slice(i, i + 20);
    const r = await get(W + "prop=images&imlimit=max&titles=" + encodeURIComponent(part.map(n => title[n]).join("|")));
    const pages = Object.values(((r && r.query) || {}).pages || {});
    const cand = {};
    for (const n of part) {
      const pg = pages.find(p => p.title === title[n]); if (!pg || !pg.images) continue;
      const sur = fold(n.split(/\s+/).pop());
      cand[n] = pg.images.map(x => x.title).filter(t => /\.(jpe?g|png)$/i.test(t) && fold(t).includes(sur) && !BADF.test(t)).slice(0, 12);
    }
    const files = [...new Set(Object.values(cand).flat())];
    const info = {};
    for (let j = 0; j < files.length; j += 40) {
      const r2 = await get(W + "prop=imageinfo&iiprop=size|url|extmetadata&iiextmetadatafilter=DateTimeOriginal|DateTime&iiurlwidth=200&titles=" + encodeURIComponent(files.slice(j, j + 40).join("|")));
      Object.values(((r2 && r2.query) || {}).pages || {}).forEach(p => { const ii = p.imageinfo && p.imageinfo[0]; if (ii) info[p.title] = ii; });
      await sleep(300);
    }
    for (const n of part) {
      let best = null, by = 0;
      for (const f of cand[n] || []) {
        const ii = info[f]; if (!ii || !ii.thumburl || ii.height < ii.width * 0.8) continue;
        const y = yearOf(ii.extmetadata, f); if (y > by) { by = y; best = ii.thumburl; }
      }
      const cur = yearOf(null, decodeURIComponent(res[n]));
      if (best && by > cur) res[n] = best;                     // tik jei rasta naujesnė už pagrindinę
    }
    await sleep(300);
  }
}

const isLogoFile = f => /logo|crest|emblem|badge|grb|escudo|wappen|herb/i.test(f || "") && !/flag|map|arena|hall|stadium|team photo/i.test(f || "");
async function logoOf(title) {                                // logotipas iš straipsnio (įskaitant ne laisvos licencijos)
  const r = await get(W + "prop=pageimages|description&pilicense=any&piprop=thumbnail|name&pithumbsize=200&titles=" + encodeURIComponent(title));
  const p = Object.values(((r && r.query) || {}).pages || {})[0];
  if (p && !p.missing && p.thumbnail && isLogoFile(p.pageimage)) return { url: p.thumbnail.source, desc: p.description || "", title: p.title };
  // jei pagrindinė nuotrauka ne logotipas – ieškoma tarp straipsnio paveikslėlių
  const r2 = await get(W + "prop=images&imlimit=80&titles=" + encodeURIComponent(title));
  const p2 = Object.values(((r2 && r2.query) || {}).pages || {})[0];
  const f = ((p2 && p2.images) || []).map(x => x.title).find(t => isLogoFile(t) && !/commons|wiki|edit|ambox|question|symbol/i.test(t));
  if (!f) return null;
  const r3 = await get(W + "prop=imageinfo&iiprop=url&iiurlwidth=200&titles=" + encodeURIComponent(f));
  const ii = (Object.values(((r3 && r3.query) || {}).pages || {})[0] || {}).imageinfo;
  return ii && ii[0] ? { url: ii[0].thumburl || ii[0].url, desc: (p && p.description) || "", title } : null;
}
export async function findClubLogo(club, nation) {
  const r = await get(W + "list=search&srlimit=4&srsearch=" + encodeURIComponent(`${club} basketball club ${nation || ""}`));
  const hits = (((r && r.query) || {}).search || []).map(x => x.title);
  const key = fold(club).replace(/(bc|kk|bk|ks|sk|cb|basket|basketball|club|basquet|baloncesto|pallacanestro)/g, "");
  for (const t of hits) {
    const words = fold(t).replace(/(bc|kk|bk|ks|sk|cb|basket|basketball|club|basquet|baloncesto|pallacanestro)/g, "");
    if (!words || !(words.includes(key.slice(0, 5)) || key.includes(words.slice(0, 5)))) continue;   // pavadinimas turi sutapti
    const lg = await logoOf(t);
    if (lg && /basketball|club|team/i.test(lg.desc + " " + t)) return lg.url;
    await sleep(200);
  }
  return null;
}
// nacionalinių lygų ir turnyrų straipsniai (raktas logos.json: „league: Spain“, „league: Euroleague“, „league: ABA“, „league: LEBL“)
export const LEAGUE_PAGES = {
  Australia: "National Basketball League (Australia)", Austria: "Austrian Basketball Superliga", Belgium: "BNXT League", Netherlands: "BNXT League",
  "Bosnia and Herzegovina": "Basketball Championship of Bosnia and Herzegovina", Croatia: "HT Premijer liga", "Czech Republic": "National Basketball League (Czech Republic)",
  Denmark: "Basketligaen", Estonia: "Latvian–Estonian Basketball League", Latvia: "Latvian–Estonian Basketball League", Finland: "Korisliiga", France: "LNB Pro A",
  Germany: "Basketball Bundesliga", Greece: "Greek Basket League", Hungary: "Nemzeti Bajnokság I/A (men's basketball)", Iceland: "Úrvalsdeild karla (basketball)",
  Israel: "Israeli Basketball Premier League", Italy: "Lega Basket Serie A", Japan: "B.League", Lithuania: "Lithuanian Basketball League",
  Montenegro: "Prva A liga (basketball)", "North Macedonia": "Macedonian First League (basketball)", Poland: "Polska Liga Koszykówki", Portugal: "Liga Portuguesa de Basquetebol",
  Romania: "Liga Națională (men's basketball)", Serbia: "Basketball League of Serbia", Slovakia: "Slovak Basketball League", Slovenia: "Slovenian Basketball League",
  Spain: "Liga ACB", Switzerland: "Swiss Basketball League", Turkey: "Basketbol Süper Ligi", "United Kingdom": "Super League Basketball", China: "Chinese Basketball Association",
  Russia: "VTB United League", "South Korea": "Korean Basketball League", Ukraine: "Ukrainian Basketball SuperLeague", USA: "National Basketball Association",
  Venezuela: "Superliga Profesional de Baloncesto", "United Arab Emirates": "ABA League", Norway: "BLNO",
  Euroleague: "EuroLeague", Eurocup: "EuroCup Basketball", BCL: "Basketball Champions League", "Fiba Europe Cup": "FIBA Europe Cup",
  ENBL: "European North Basketball League", "Alpe Adria Cup": "Alpe Adria Cup", ABA: "ABA League", LEBL: "Latvian–Estonian Basketball League"
};

// ---------- pagrindinis ----------
// failo nėra -> tuščias; failas sugadintas -> sustojama (kad nebūtų perrašyti esami logotipai)
async function readJson(f, d) {
  let t; try { t = await readFile(f, "utf8"); } catch (e) { if (e.code === "ENOENT") return d; throw e; }
  if (!t.trim()) return d;
  return JSON.parse(t);
}
async function main() {
  const logos = await readJson("logos.json", {}), photos = await readJson("players_photos.json", {});
  const state = await readJson("media_state.json", { tried: {} });
  const now = Date.now(), recent = k => state.tried[k] && now - state.tried[k] < RETRY_DAYS * 864e5;
  const have = new Set(Object.keys(logos).map(norm));
  let addedL = 0, addedP = 0;

  // 1) klubai
  const bud = [...clubsFromBudgets(await sheet("Budgets 26/27")), ...clubsFromBudgets(await sheet("Budgets 25/26"))];
  const seen = new Set();
  for (const { club, nation } of bud) {
    const k = norm(club); if (have.has(k) || seen.has(k) || recent("c:" + k)) continue; seen.add(k);
    const u = await findClubLogo(club, nation);
    if (u) { logos[club] = u; have.add(k); addedL++; } else state.tried["c:" + k] = now;
  }
  // 2) lygos ir turnyrai
  for (const [key, page] of Object.entries(LEAGUE_PAGES)) {
    const name = "league: " + key, k = norm(name); if (have.has(k) || recent("l:" + k)) continue;
    const lg = await logoOf(page);
    if (lg) { logos[name] = lg.url; have.add(k); addedL++; } else state.tried["l:" + k] = now;
  }
  // 3) žaidėjai (stulpelis „Photo“ lentelėje visada svarbesnis – jų čia neieškome)
  const ppl = peopleFromSalaries(await sheet("Player Salaries"));
  const own = new Set(ppl.filter(p => /^https?:/.test(p.photo)).map(p => norm(p.name)));
  const pk = new Set(Object.keys(photos).map(norm));
  const need = [...new Map(ppl.map(p => [norm(p.name), p.name])).entries()]
    .filter(([k]) => !pk.has(k) && !own.has(k) && !recent("p:" + k)).map(([, n]) => n);
  const got = await findPhotos(need);
  for (const n of need) { if (got[n]) { photos[n] = got[n]; addedP++; } else state.tried["p:" + norm(n)] = now; }

  if (addedL) await writeFile("logos.json", JSON.stringify(logos, null, 2) + "\n");
  if (addedP || !Object.keys(photos).length) await writeFile("players_photos.json", JSON.stringify(photos, null, 1) + "\n");
  await writeFile("media_state.json", JSON.stringify(state) + "\n");
  console.log(`Logotipų pridėta: ${addedL}; nuotraukų pridėta: ${addedP}; ieškota žaidėjų: ${need.length}`);
}
if (typeof process !== "undefined" && process.argv[1] && import.meta.url.endsWith(process.argv[1].split("/").pop())) main();
