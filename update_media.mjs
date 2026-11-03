// Kas savaitę: papildo logos.json (klubų ir lygų logotipai) ir players_photos.json (žaidėjų veidai) TRŪKSTAMAIS įrašais.
// Esami įrašai niekada nekeičiami ir netrinami. Veidų šaltiniai iš eilės: EuroLeague, EuroCup, FIBA (BCL, FIBA Europe Cup, rinktinės),
// ACB, LKL, Winner League, GBL, BeBasket, o kurių nerasta – anglų Wikipedia (portretinės nuotraukos, griežtas vardo atitikimas).
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
      const r = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(30000) });
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

// ---------- oficialūs lygų ir turnyrų puslapiai (pirmiausia) ----------
// Kiekvienas šaltinis grąžina [{name, url}] – dabartinio sezono sudėtis su oficialiomis nuotraukomis.
// Skaitomi tik vieši puslapiai (be prisijungimų ir raktų). Pirmas šaltinis sąraše laimi.
// Nuotraukos gale „#pf=S,C“ – kaip priartinti veidą apskritime (S – mastelis, C – galvos centras % nuo viršaus); svetainė tai supranta.
const SEASON = (() => { const d = new Date(); return d.getUTCMonth() >= 7 ? d.getUTCFullYear() : d.getUTCFullYear() - 1; })();   // 2026 = 2026/27
const yy = y => String(y % 100).padStart(2, "0");
const unesc = t => String(t || "").replace(/\\\\"/g, "").replace(/\\"/g, '"').replace(/\\u0026/g, "&");
const ent = s => String(s || "").replace(/&amp;/g, "&").replace(/&#0?39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;/g, " ").replace(/&#(\d+);/g, (m, n) => String.fromCharCode(+n)).replace(/&#x([0-9a-f]+);/gi, (m, h) => String.fromCharCode(parseInt(h, 16)));
const abs = (u, base) => { try { return new URL(ent(u), base).href; } catch (e) { return ""; } };
const uniq = a => [...new Set(a)];
async function page(url) { const t = await get(url, false); await sleep(250); return t || ""; }
async function exists(url) {
  try { const r = await fetch(url, { method: "GET", headers: { "User-Agent": UA, Range: "bytes=0-0" }, signal: AbortSignal.timeout(20000) }); return r.ok || r.status === 206; } catch (e) { return false; }
}
// „SIFTAR, JAKOB“ -> „Jakob Siftar“
const flip = n => { const m = String(n).match(/^([^,]+),\s*(.+)$/); const s = m ? m[2] + " " + m[1] : String(n); return s.toLowerCase().replace(/(^|[\s'-])\p{L}/gu, x => x.toUpperCase()); };

// EuroLeague (E) ir EuroCup (U): viešas duomenų srautas su „headshot“ nuotraukomis
async function srcEuroleague(code) {
  const out = [];
  for (const y of [SEASON, SEASON - 1]) {
    const j = await get(`https://api-live.euroleague.net/v2/competitions/${code}/seasons/${code}${y}/people?personType=J`);
    for (const p of (j && j.data) || []) {
      const u = p.images && p.images.headshot; if (u && p.person && p.person.name) out.push({ name: flip(p.person.name), url: u + "#pf=2.8,21" });
    }
    await sleep(300);
  }
  return out;
}
// FIBA platforma (BCL, FIBA Europe Cup, rinktinių turnyrai): komandų puslapiuose – žaidėjų ir trenerių personId,
// nuotrauka – FIBA „headshot“ pagal personId (apkirpta ties veidu). Neegzistuojanti nuotrauka grąžina 404 – tikrinama.
const fibaFace = id => `https://assets.fiba.basketball/image/upload/c_thumb,g_face,z_0.75,w_240,h_240/q_auto/f_auto/.headshot--person_${id}`;
export function parseFibaPeople(html) {
  const u = unesc(html), out = [], re = /"personId":(\d+),"firstName":"([^"]*)","lastName":"([^"]*)"/g; let m;
  while ((m = re.exec(u))) out.push({ id: m[1], name: (m[2] + " " + m[3]).replace(/\s+/g, " ").trim() });
  return out;
}
async function fibaEvent(listUrl, linkRe) {
  const list = await page(listUrl), base = new URL(listUrl).origin;
  const teams = uniq([...list.matchAll(linkRe)].map(m => abs(m[0], base)));
  const ppl = [];
  for (const t of teams) ppl.push(...parseFibaPeople(await page(t)));
  return ppl;
}
async function srcFiba() {
  const lists = [
    [`https://www.championsleague.basketball/en/teams`, /\/en\/teams\/[a-z0-9-]+/g],
    ...[`fiba-europe-cup-${yy(SEASON)}-${yy(SEASON + 1)}`, `fiba-europe-cup-${yy(SEASON - 1)}-${yy(SEASON)}`, ...FIBA_EVENTS]
      .map(s => [`https://www.fiba.basketball/en/events/${s}/teams`, new RegExp(`/en/events/${s}/teams/[a-z0-9-]+`, "g")])
  ];
  const ppl = [];
  for (const [u, re] of lists) ppl.push(...await fibaEvent(u, re));
  return ppl.map(p => ({ name: p.name, url: fibaFace(p.id), check: true }));
}
// rinktinių turnyrai FIBA svetainėje (papildykite, kai prasideda nauji)
export const FIBA_EVENTS = ["fiba-basketball-world-cup-2027-european-qualifiers", "fiba-eurobasket-2025", "fiba-basketball-world-cup-2027-americas-qualifiers",
  "fiba-basketball-world-cup-2027-asian-qualifiers", "fiba-americup-2025", "fiba-afrobasket-2025"];

// ACB (Ispanija): komandų puslapiuose – sudėtis su „headshotImageUrl“
export function parseAcb(html) {
  const u = unesc(html), out = [], re = /"firstName":"([^"]*)","lastName":"([^"]*)"(?:,"[a-zA-Z]+":(?:"[^"]*"|null|\d+))*?,"headshotImageUrl":"(https?:[^"]+)"/g; let m;
  while ((m = re.exec(u))) {
    const url = m[3], nick = (m[0].match(/"nickname":"([^"]+)"/) || [])[1];
    out.push({ name: (m[1] + " " + m[2]).trim(), url });
    if (nick) out.push({ name: nick, url });
  }
  return out;
}
async function srcAcb() {
  const home = await page("https://www.acb.com/es/liga");
  const teams = uniq([...home.matchAll(/\/es\/liga\/equipos\/[a-z0-9-]+/g)].map(m => "https://www.acb.com" + m[0]));
  const out = []; for (const t of teams) out.push(...parseAcb(await page(t)));
  return out;
}
// LKL (Lietuva): žaidėjų sąraše (lkl.lt/zaidejai) kiekvienoje eilutėje – nuotrauka ir vardas
export function parseLkl(html, base = "https://lkl.lt") {
  const out = [];
  for (const row of String(html).split(/<tr[\s>]/).slice(1)) {
    const img = (row.match(/<img[^>]*src="([^"]*\/media\/players\/[^"]+)"/) || [])[1];
    const nm = (row.match(/class="player-title"[^>]*>([^<]+)</) || [])[1];
    if (img && nm) out.push({ name: ent(nm).trim(), url: abs(img, base) + "#pf=2.8,21" });
  }
  return out;
}
async function srcLkl() { return parseLkl(await page("https://lkl.lt/zaidejai")); }
// Izraelis (Winner League): komandos puslapyje – media day nuotraukos su vardu (alt)
export function parseIsrael(html, base = "https://basket.co.il/") {
  const out = [];
  for (const m of String(html).matchAll(/class="box_role_data"\s*>\s*<img[^>]*src="([^"]+\.(?:jpe?g|png|webp))"[^>]*alt="([^"]+)"/gi)) {
    const n = ent(m[2]).trim(); if (n.split(/\s+/).length >= 2 && !/default|no_?pic|no_?photo/i.test(m[1])) out.push({ name: n, url: abs(m[1], base) + "#pf=2.2,25" });
  }
  return out;
}
async function srcIsrael() {
  const home = await page("https://basket.co.il/?lang=en");
  const ids = uniq([...home.matchAll(/team\.asp\?TeamId=(\d+)/g)].map(m => m[1]));
  const out = []; for (const id of ids) out.push(...parseIsrael(await page(`https://basket.co.il/team.asp?TeamId=${id}&lang=en`)));
  return out;
}
// Graikija (GBL, esake.gr): komandos puslapyje – žaidėjo nuotrauka (fone) ir vardas „PAVARDĖ VARDAS“
export function parseGreece(html, base = "https://www.esake.gr") {
  const out = [];
  for (const m of String(html).matchAll(/url\('(\/dat\/esakeplayer\/[^']+)'\)[\s\S]{0,900}?player-title-name[^>]*>([\s\S]{0,200}?)<div class="player-title-post/g)) {
    const n = ent(m[2].replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
    if (n && /^[A-Z][A-Z' .-]+$/.test(n)) out.push({ name: n, url: abs(m[1], base) + "#pf=2.7,19" });
  }
  return out;
}
async function srcGreece() {
  const home = await page("https://www.esake.gr/en/action/EsakeTeams");
  const ids = uniq([...home.matchAll(/EsaketeamView\?idteam=([0-9A-F]+)/g)].map(m => m[1]));
  const out = []; for (const id of ids) out.push(...parseGreece(await page(`https://www.esake.gr/en/action/EsaketeamView?idteam=${id}&mode=1`)));
  return out;
}

// vardų sutapimas: tie patys žodžiai (be diakritikų, eilės tvarka nesvarbi, „Jr.“ ir pan. ignoruojami)
const toks = n => String(n || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ø/g, "o").replace(/ł/g, "l").replace(/đ/g, "d").replace(/ß/g, "ss")
  .split(/[^a-z]+/).filter(w => w && !/^(jr|sr|ii|iii|iv)$/.test(w));
export const nameKey = n => toks(n).sort().join(" ");
// papildomi raktai rašybos skirtumams („Mc Clung“ = „McClung“, „Lofton Kenneth“ = „Kenneth Lofton“)
const altKeys = n => { const t = toks(n); return t.length ? ["=" + t.join(""), "=" + [t[t.length - 1], ...t.slice(0, -1)].join("")] : []; };
export const SOURCES = [
  ["EuroLeague", () => srcEuroleague("E")], ["EuroCup", () => srcEuroleague("U")], ["FIBA (BCL, FIBA Europe Cup, rinktinės)", srcFiba],
  ["ACB", srcAcb], ["LKL", srcLkl], ["Winner League", srcIsrael], ["GBL", srcGreece]
];
export async function findLeaguePhotos(names) {               // {name: url} – tik tiems, kurių vardas tiksliai sutampa
  const want = new Map();
  for (const n of names) { want.set(nameKey(n), n); for (const k of altKeys(n)) if (!want.has(k)) want.set(k, n); }
  const keyOf = n => [nameKey(n), ...altKeys(n)].find(k => want.has(k));
  const res = {};
  for (const [label, fn] of SOURCES) {
    let items = [];
    try { items = await fn(n => !!keyOf(n)); } catch (e) { console.log(`${label}: klaida – ${e.message}`); continue; }
    const by = new Map();                                       // tas pats žmogus su skirtingomis nuotraukomis -> neaišku, praleidžiama
    for (const it of items) { const k = keyOf(it.name); if (!k) continue; it.nm = want.get(k); const s = by.get(it.nm) || new Set(); s.add(it.url); by.set(it.nm, s); }
    let n = 0;
    for (const it of items) {
      const nm = it.nm; if (!nm || res[nm] || by.get(nm).size > 1) continue;
      if (it.check && !(await exists(it.url))) continue;
      res[nm] = it.url; n++;
    }
    console.log(`${label}: sudėtyse ${items.length}, priskirta ${n}`);
  }
  return res;
}

// BeBasket (bebasket.fr): žaidėjo profilis bebasket.fr/joueur/vardas-pavarde – kvadratinė portretinė nuotrauka (og:image).
// Tinka ir buvusiems Prancūzijos lygų žaidėjams. Imama tik tada, kai puslapio pavadinime – tas pats vardas.
const MAX_BEBASKET = 1500;                                       // profilių per vieną paleidimą (likusieji – kitą savaitę)
const slugs = n => { const b = String(n).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ø/g, "o").replace(/ł/g, "l").replace(/đ/g, "d").replace(/ß/g, "ss");
  return uniq([b.replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-"), b.replace(/[^a-z0-9]+/g, "-")].map(x => x.replace(/^-+|-+$/g, "")).filter(Boolean)); };
export function parseBebasket(html) {
  const og = (String(html).match(/property="og:image"\s+content="([^"]+)"/) || String(html).match(/content="([^"]+)"\s+property="og:image"/) || [])[1] || "";
  const title = ent((String(html).match(/<title>([^<]*)<\/title>/) || [])[1] || "").split(/\s*[:|]\s*/)[0].trim();
  return /cdn\.bebasket\.fr\/resources\/images\/player\//.test(og) ? { name: title, url: ent(og) } : null;
}
export async function findBebasket(names, budget = MAX_BEBASKET) {
  const got = {}, seen = {}; let used = 0;
  for (const n of names) {
    if (used >= budget) break;
    for (const sl of slugs(n)) {
      used++;
      const p = parseBebasket(await page("https://www.bebasket.fr/joueur/" + sl));
      if (p && nameKey(p.name) === nameKey(n)) { got[n] = p.url; (seen[p.url] = seen[p.url] || []).push(n); break; }
    }
  }
  for (const [u, ns] of Object.entries(seen)) if (ns.length > 2) ns.forEach(n => delete got[n]);   // ta pati nuotrauka keliems – tai šablonas
  console.log(`BeBasket: patikrinta ${used} profilių, priskirta ${Object.keys(got).length}`);
  return got;
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
  // pirmiausia oficialūs lygų ir turnyrų puslapiai, likusiems – Wikipedia
  const got = need.length ? await findLeaguePhotos(need) : {};
  const left = need.filter(n => !got[n]);
  Object.assign(got, left.length ? await findBebasket(left) : {});
  const rest = need.filter(n => !got[n]);
  Object.assign(got, rest.length ? await findPhotos(rest) : {});
  for (const n of need) { if (got[n]) { photos[n] = got[n]; addedP++; } else state.tried["p:" + norm(n)] = now; }

  if (addedL) await writeFile("logos.json", JSON.stringify(logos, null, 2) + "\n");
  if (addedP || !Object.keys(photos).length) await writeFile("players_photos.json", JSON.stringify(photos, null, 1) + "\n");
  await writeFile("media_state.json", JSON.stringify(state) + "\n");
  console.log(`Logotipų pridėta: ${addedL}; nuotraukų pridėta: ${addedP}; ieškota žaidėjų: ${need.length}`);
}
if (typeof process !== "undefined" && process.argv[1] && import.meta.url.endsWith(process.argv[1].split("/").pop())) main();
