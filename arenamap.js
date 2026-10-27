/*
 * arenamap.js – arenų žemėlapis, nupieštas pačios svetainės dizainu (D3, be plytelių ir API raktų).
 *   ArenaMap.mount(elementas, { D, T, esc, norm, same, logo, club, season })
 * Žemėlapio kontūrai kraunami iš jsDelivr (world-atlas), arenų nuotraukos – iš Wikipedia.
 */
(function () {
  'use strict';

  var CDN_D3 = 'https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js';
  var CDN_TOPO = 'https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/dist/topojson-client.min.js';
  var CDN_GEO = 'https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json';

  var baseNorm = function (s) { return String(s == null ? '' : s).toLowerCase().normalize('NFD').replace(/[^a-z0-9]/g, ''); };

  /* ------------------------------------------------------------------ */
  /*  Arenų sąrašas: raktai | arena | miestas | lat | lon | ! (tikslios koordinatės)   */
  /*  Raktai lyginami su klubo pavadinimu (be tarpų ir diakritikos).       */
  /* ------------------------------------------------------------------ */
  var RAW = [
    // Lietuva
    'zalgiris|Žalgirio Arena|Kaunas|54.8904|23.9148|!',
    'rytas,wolves,twinsbet|Twinsbet Arena|Vilnius|54.7162|25.2799|!',
    'neptunas|Švyturio Arena|Klaipėda|55.6881|21.1579|!',
    'lietkabelis|Cido Arena|Panevėžys|55.7314|24.3572|!',
    'siauliai|Šiaulių Arena|Šiauliai|55.9206|23.3039|!',
    'juventus|Utenos Arena|Utena|55.5036|25.6192|!',
    'nevezis|Kėdainių Arena|Kėdainiai|55.2845|23.9872|!',
    'jonavoscbet,cbet|Jonavos Arena|Jonava|55.0745|24.2641|!',
    'labasgas,prienai|Prienų Arena|Prienai|54.6391|23.9542|!',
    'mbasket,mazeikiai|Mažeikių sporto salė|Mažeikiai|56.3042|22.3314|!',
    'pienozvaigzdes,pasvalys|Pasvalio sporto arena|Pasvalys|56.0613|24.3996',
    // Ispanija
    'realmadrid|WiZink Center|Madrid|40.4241|-3.6717|!',
    'barcelona|Palau Blaugrana|Barcelona|41.3809|2.1228',
    'baskonia|Fernando Buesa Arena|Vitoria-Gasteiz|42.8467|-2.6716',
    'valencia|Roig Arena|Valencia|39.4699|-0.3763',
    'unicaja|Palacio de Deportes Martín Carpena|Málaga|36.7213|-4.4214',
    'grancanaria|Gran Canaria Arena|Las Palmas|28.0931|-15.4572|!',
    'joventut,badalona|Pavelló Olímpic de Badalona|Badalona|41.4500|2.2474',
    'tenerife|Pabellón Santiago Martín|San Cristóbal de La Laguna|28.4739|-16.3160',
    'manresa|Nou Congost|Manresa|41.7280|1.8260',
    'bilbao|Bilbao Arena|Bilbao|43.2630|-2.9350',
    'ucam,murcia|Palacio de los Deportes de Murcia|Murcia|37.9922|-1.1307',
    'casademont,zaragoza|Pabellón Príncipe Felipe|Zaragoza|41.6488|-0.8891',
    'breogan|Pazo dos Deportes|Lugo|43.0121|-7.5560',
    'coruna|Coliseum A Coruña|A Coruña|43.3623|-8.4115',
    'girona|Pavelló de Fontajau|Girona|41.9794|2.8214',
    'andorra|Poliesportiu d\'Andorra|Andorra la Vella|42.5078|1.5211',
    'obradoiro|Multiusos Fontes do Sar|Santiago de Compostela|42.8782|-8.5448',
    'granada|Palacio de Deportes de Granada|Granada|37.1773|-3.5986',
    'burgos|Coliseum Burgos|Burgos|42.3441|-3.6969',
    'fuenlabrada|Pabellón Fernando Martín|Fuenlabrada|40.2842|-3.7942',
    'gipuzkoa,gbc|Donostia Arena|San Sebastián|43.3183|-1.9812',
    // Graikija
    'panathinaikos|OAKA Olympic Indoor Hall|Athens|38.0366|23.7889',
    'olympiacos|Peace and Friendship Stadium|Piraeus|37.9435|23.6657',
    'aekathens,aek|Telekom Center Athens|Athens|38.0420|23.7580',
    'paok|PAOK Sports Arena|Thessaloniki|40.6000|22.9740',
    'aris|Alexandreio Melathron|Thessaloniki|40.6290|22.9560',
    'peristeri|Peristeri Arena|Athens|38.0186|23.6819',
    'promitheas|Dimitris Tofalos Arena|Patras|38.2466|21.7346',
    'maroussi,marousi|Maroussi Indoor Hall|Athens|38.0540|23.8070',
    // Turkija
    'anadoluefes|Sinan Erdem Dome|Istanbul|40.9882|28.8596|!',
    'fenerbahce|Ülker Sports Arena|Istanbul|40.9934|29.1017|!',
    'besiktas|BJK Akatlar Arena|Istanbul|41.0851|29.0202|!',
    'turktelekom|Ankara Arena|Ankara|39.9419|32.8422|!',
    'tofas|Tofaş Spor Salonu|Bursa|40.1885|29.0610',
    'darussafaka|Ayhan Şahenk Arena|Istanbul|41.1128|29.0210',
    'karsiyaka|Karşıyaka Arena|İzmir|38.4623|27.1075',
    // Izraelis
    'maccabitelaviv,maccabi|Menora Mivtachim Arena|Tel Aviv|32.0602|34.7925|!',
    'hapoeltelaviv|Drive in Arena|Tel Aviv|32.0577|34.7962',
    'hapoeljerusalem|Pais Arena Jerusalem|Jerusalem|31.7474|35.1912',
    'holon|Holon Toto Hall|Holon|32.0178|34.7745',
    // Balkanai
    'crvenazvezda,zvezda|Belgrade Arena|Belgrade|44.8139|20.4206|!',
    'partizan|Belgrade Arena|Belgrade|44.8139|20.4206|!',
    'buducnost|Morača Sports Center|Podgorica|42.4521|19.2567',
    'cedevitaolimpija,olimpija|Arena Stožice|Ljubljana|46.0968|14.5221',
    'cibona|Dražen Petrović Basketball Hall|Zagreb|45.8040|15.9550',
    'zadar|Krešimir Ćosić Hall|Zadar|44.1180|15.2310',
    'splitkk,arenagripe|Arena Gripe|Split|43.5006|16.4441',
    'krka|Leon Štukelj Hall|Novo Mesto|45.8040|15.1710',
    'igokea|Laktaši Sports Hall|Laktaši|44.9087|17.3010',
    'dubai|Coca-Cola Arena|Dubai|25.2037|55.2608',
    // Prancūzija
    'parisbasketball,parisbasket|Adidas Arena|Paris|48.8985|2.3597|!',
    'monaco|Salle Gaston Médecin|Monaco|43.7285|7.4155|!',
    'asvel|LDLC Arena|Décines-Charpieu|45.7620|5.0262',
    'limoges|Palais des Sports de Beaublanc|Limoges|45.8312|1.2552',
    'chalon|Le Colisée|Chalon-sur-Saône|46.7806|4.8539',
    'orleans|Palais des Sports d\'Orléans|Orléans|47.9029|1.9093',
    'roanne|Halle André Vacheresse|Roanne|46.0344|4.0687',
    'lemans|Antarès|Le Mans|48.0061|0.1996',
    'strasbourg|Rhénus Sport|Strasbourg|48.5734|7.7521',
    'nanterre|Palais des sports Maurice Thorez|Nanterre|48.8924|2.2066',
    'dijon|Palais des Sports Jean-Michel Geoffroy|Dijon|47.3220|5.0415',
    'gravelines|Sportica|Gravelines|50.9865|2.1280',
    'nancy|Palais des Sports Jean Weille|Nancy|48.6921|6.1844',
    'paulacq,elanbearnais|Palais des Sports de Pau|Pau|43.2951|-0.3708',
    'cholet|La Meilleraie|Cholet|47.0600|-0.8800',
    'bourg|Ekinox|Bourg-en-Bresse|46.2052|5.2255|!',
    'boulazac|Le Palio|Boulazac|45.1850|0.7840',
    'portel|Le Chaudron|Le Portel|50.7090|1.5770',
    'fosprovence|Palais des Sports de Fos|Fos-sur-Mer|43.4376|4.9456',
    // Vokietija
    'albaberlin|Uber Arena|Berlin|52.5064|13.4439|!',
    'bayern|SAP Garden|Munich|48.1767|11.5512',
    'ratiopharm,ulm|ratiopharm arena|Neu-Ulm|48.3920|10.0300|!',
    'telekombaskets|Telekom Dome|Bonn|50.7392|7.1177',
    'bamberg|Brose Arena|Bamberg|49.9065|10.9089',
    'ludwigsburg,riesen|MHPArena|Ludwigsburg|48.9040|9.1844',
    'hamburgtowers,towers|Edel-optics.de Arena|Hamburg|53.5090|10.0130',
    'vechta,rasta|Rasta Dome|Vechta|52.7300|8.2830',
    'wurzburg|tectake Arena|Würzburg|49.7842|9.9328',
    'oldenburg|EWE Arena|Oldenburg|53.1484|8.2070',
    'braunschweig|Volkswagen Halle|Braunschweig|52.2670|10.5260',
    'skyliners,frankfurt|Süwag Energie Arena|Frankfurt|50.0937|8.6470',
    'niners,chemnitz|Chemnitz Arena|Chemnitz|50.8197|12.9130',
    'crailsheim|Arena Hohenlohe|Crailsheim|49.1330|10.0630',
    'heidelberg|SNP Dome|Heidelberg|49.3898|8.6540',
    'rostock|Stadthalle Rostock|Rostock|54.0870|12.1150',
    'giessen|Sporthalle Gießen-Ost|Gießen|50.5870|8.6920',
    // Italija
    'virtusbologna,virtus|Segafredo Arena|Bologna|44.4949|11.3426',
    'olimpiamilano,armani,milano|Unipol Forum|Milan|45.4010|9.1575',
    'reggiana,reggioemilia|PalaBigi|Reggio Emilia|44.7000|10.6300',
    'brescia|PalaLeonessa|Brescia|45.5416|10.2118',
    'trento,dolomiti|BLM Group Arena|Trento|46.0748|11.1217',
    'venezia,reyer|Palasport Taliercio|Venice|45.4850|12.2420',
    'trieste|Allianz Dome|Trieste|45.6495|13.7768',
    'napoli|PalaBarbuto|Naples|40.8518|14.2681',
    'sassari|PalaSerradimigni|Sassari|40.7259|8.5557',
    'pesaro,vuelle|Vitrifrigo Arena|Pesaro|43.9100|12.9100',
    'cantu|Pianella|Cantù|45.7380|9.1296',
    'varese|Itelyum Arena|Varese|45.8206|8.8251',
    'treviso|Palaverde|Villorba|45.7270|12.2740',
    'cremona|PalaRadi|Cremona|45.1330|10.0230',
    'tortona,derthona|PalaCima|Tortona|44.8950|8.8650',
    // Lenkija, Čekija, Baltija, Šiaurė
    'anwil|Hala Mistrzów|Włocławek|52.6483|19.0677',
    'slaskwroclaw,wroclaw|Hala Orbita|Wrocław|51.1079|17.0385',
    'legiawarszawa,legia|Arena Ursynów|Warsaw|52.1500|21.0500',
    'stalostrow,ostrow|Hala Sportowa Ostrów|Ostrów Wielkopolski|51.6500|17.8060',
    'kingszczecin,szczecin|Netto Arena|Szczecin|53.4285|14.5528',
    'treflsopot,sopot|Ergo Arena|Sopot|54.4490|18.5580',
    'zastal|CRS Zielona Góra|Zielona Góra|51.9356|15.5062',
    'arkagdynia,gdynia|Hala Gdynia|Gdynia|54.4905|18.5430',
    'slupsk|Hala Gryfia|Słupsk|54.4641|17.0285',
    'startlublin,lublin|Hala Globus|Lublin|51.2465|22.5684',
    'nymburk|Hala Komenského|Nymburk|50.1860|15.0420',
    'basketbrno,brno|Hala Rondo|Brno|49.1951|16.6068',
    'ventspils|Ventspils Olimpiskais centrs|Ventspils|57.3929|21.5617',
    'kalev,cramo,tallinn|Saku Suurhall|Tallinn|59.3750|24.7150',
    'tartu|Tartu Ülikooli spordihoone|Tartu|58.3735|26.7115',
    'parnu|Pärnu Spordihall|Pärnu|58.3860|24.5050',
    'seagulls,helsinki|Töölö Sports Hall|Helsinki|60.1856|24.9212',
    'pyrinto|Pyynikin Palloiluhalli|Tampere|61.4939|23.7268',
    // Beniliuksas, kiti
    'oostende,ostend|Sportpaleis Alfa|Ostend|51.2249|2.9276',
    'antwerp|Lotto Arena|Antwerp|51.2328|4.4399',
    'spirou,charleroi|Spiroudome|Charleroi|50.4137|4.4443',
    'heroes,denbosch|Maaspoort|\'s-Hertogenbosch|51.6998|5.2928',
    'donar|MartiniPlaza|Groningen|53.1970|6.5750',
    'leiden|Vijf Meihal|Leiden|52.1604|4.4936',
    'landstede,zwolle|Landstede Sportcentrum|Zwolle|52.5060|6.1040',
    'falco|Arena Savaria|Szombathely|47.2300|16.6200',
    'szolnok|Tiszaligeti Sportcsarnok|Szolnok|47.1768|20.1814',
    'cluj,ubt|BTarena|Cluj-Napoca|46.7674|23.5714|!',
    'oradea|Arena Antonio Alexe|Oradea|47.0580|21.9390',
    'keravnos|Eleftheria Indoor Hall|Nicosia|35.1560|33.3560',
    'fribourg|Salle Saint-Léonard|Fribourg|46.8150|7.1650',
    'geneve,lionsgeneve|Salle des Vernets|Geneva|46.1960|6.1360',
    'oberwart|Sporthalle Oberwart|Oberwart|47.2890|16.2090',
    'londonlions|Copper Box Arena|London|51.5470|-0.0100'
  ];
  var ARENAS = RAW.map(function (l) {
    var p = l.split('|');
    return { keys: p[0].split(',').map(baseNorm), arena: p[1], city: p[2], lat: +p[3], lon: +p[4], ok: p[5] === '!' };
  });

  function findArena(clubName, N) {
    N = N || baseNorm;
    var k = N(clubName), best = null, score = 0;
    ARENAS.forEach(function (e) {
      e.keys.forEach(function (key) {
        var s = 0;
        if (k === key) s = 1000 + key.length;
        else if (key.length >= 5 && k.indexOf(key) >= 0) s = key.length;
        else if (k.length >= 6 && key.length > k.length && key.indexOf(k) >= 0) s = k.length - 1;
        if (s > score) { score = s; best = e; }
      });
    });
    return best;
  }

  // Spindulių-taškų atstumas (km)
  function km(a, b) {
    var R = 6371, dLa = (b[0] - a[0]) * Math.PI / 180, dLo = (b[1] - a[1]) * Math.PI / 180;
    var x = Math.sin(dLa / 2) * Math.sin(dLa / 2) + Math.cos(a[0] * Math.PI / 180) * Math.cos(b[0] * Math.PI / 180) * Math.sin(dLo / 2) * Math.sin(dLo / 2);
    return 2 * R * Math.asin(Math.sqrt(x));
  }

  // Pinų išdėstymas: svarbiausi pirmi, persidengiantys paslepiami (artinant atsiranda daugiau)
  function layoutPins(items, t, w, h, selected) {
    var placed = [], order = selected ? [selected].concat(items.filter(function (x) { return x !== selected; })) : items;
    order.forEach(function (it) {
      var x = t.k * it.p[0] + t.x + (it.gi - (it.gn - 1) / 2) * it.s * 0.98, y = t.k * it.p[1] + t.y;
      var vis = x > -30 && x < w + 30 && y > -30 && y < h + 30, ok = vis, r = it.s / 2 + 3, i;
      if (ok && it !== selected) {
        for (i = 0; i < placed.length; i++) {
          var q = placed[i];
          if (q.g === it.g) continue;
          var dx = q.x - x, dy = q.y - y, rr = r + q.r;
          if (dx * dx + dy * dy < rr * rr) { ok = false; break; }
        }
      }
      if (ok) placed.push({ x: x, y: y, r: r, g: it.g });
      it.on = ok; it.sx = x; it.sy = y; it.vis = vis;
    });
  }

  /* ------------------------------------------------------------------ */
  /*  Naršyklės dalis                                                     */
  /* ------------------------------------------------------------------ */
  var GEN = { arena: 1, center: 1, centre: 1, sports: 1, sport: 1, hall: 1, palace: 1, palais: 1, palacio: 1, pabellon: 1, pavello: 1, forum: 1, dome: 1, stadium: 1, sala: 1, salle: 1, dvorana: 1, hala: 1, spor: 1, salonu: 1, indoor: 1, olympic: 1, sporthalle: 1, stadthalle: 1 };
  var NAMEFIX = { 'Czech Republic': 'Czechia', 'Bosnia and Herzegovina': 'Bosnia and Herz.', 'North Macedonia': 'N. Macedonia', UK: 'United Kingdom', England: 'United Kingdom' };
  var scripts = {}, topoP = null, cur = null, wcache = {};

  var API = { findArena: findArena, ARENAS: ARENAS, layoutPins: layoutPins, km: km };
  (typeof window !== 'undefined' ? window : globalThis).ArenaMap = API;
  if (typeof document === 'undefined') return;

  function loadScript(src) {
    if (!scripts[src]) scripts[src] = new Promise(function (res, rej) {
      var s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s);
    });
    return scripts[src];
  }
  function ensureLibs() {
    return Promise.all([loadScript(CDN_D3), loadScript(CDN_TOPO)]).then(function () {
      if (!topoP) topoP = fetch(CDN_GEO).then(function (r) { return r.json(); });
      return topoP;
    });
  }
  function preload(u) {
    return new Promise(function (res) {
      var i = new Image(); i.onload = function () { res(true); }; i.onerror = function () { res(false); };
      setTimeout(function () { res(false); }, 12000); i.src = u;
    });
  }
  function roofImg(c) {
    var R = 6378137, x = R * c[1] * Math.PI / 180, y = R * Math.log(Math.tan(Math.PI / 4 + c[0] * Math.PI / 360));
    var hw = 150 / Math.cos(c[0] * Math.PI / 180), hh = hw * 0.56;
    return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?bbox=' +
      (x - hw) + ',' + (y - hh) + ',' + (x + hw) + ',' + (y + hh) + '&bboxSR=3857&imageSR=3857&size=640,358&format=jpg&f=image';
  }
  // Arenos nuotrauka ir tikslios koordinatės iš Wikipedia
  function wiki(e) {
    var key = e.arena + '|' + e.city;
    if (wcache[key]) return wcache[key];
    wcache[key] = (function () {
      var ctl = window.AbortController ? new AbortController() : null, to = setTimeout(function () { if (ctl) ctl.abort(); }, 7000);
      var u = 'https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrsearch=' +
        encodeURIComponent(e.arena + ' ' + e.city) + '&gsrlimit=4&prop=coordinates|pageimages&piprop=thumbnail&pithumbsize=900&colimit=4';
      return fetch(u, ctl ? { signal: ctl.signal } : {}).then(function (r) { return r.json(); }).then(function (j) {
        clearTimeout(to);
        var pages = Object.keys((j.query && j.query.pages) || {}).map(function (k) { return j.query.pages[k]; }).sort(function (a, b) { return a.index - b.index; });
        var toks = e.arena.split(/\s+/).map(baseNorm).filter(function (t) { return t.length >= 4 && !GEN[t]; }).map(function (t) { return t.slice(0, 5); });
        var good = pages.filter(function (pg) { var n = baseNorm(pg.title); return toks.some(function (t) { return n.indexOf(t) >= 0; }); })[0];
        if (!good) return null;
        var c = good.coordinates && good.coordinates[0], co = c ? [c.lat, c.lon] : null;
        if (co && km(co, [e.lat, e.lon]) > 25) co = null;
        return { photo: good.thumbnail ? good.thumbnail.source : null, coords: co };
      }).catch(function () { return null; });
    })();
    return wcache[key];
  }

  function css() {
    if (document.getElementById('am-css')) return;
    var s = document.createElement('style'); s.id = 'am-css';
    s.textContent = [
      '.am-wrap{position:relative;height:clamp(500px,76vh,760px);margin-top:14px;border-radius:18px;overflow:hidden;border:1px solid var(--line);background:radial-gradient(120% 90% at 50% 0%,color-mix(in srgb,var(--card) 70%,var(--bg)),var(--bg));box-shadow:var(--sh);touch-action:none;-webkit-user-select:none;user-select:none}',
      '.am-load{padding:60px 0;text-align:center;color:var(--mute)}',
      '.am-svg{position:absolute;inset:0;width:100%;height:100%}',
      '.am-land{fill:color-mix(in srgb,var(--card) 84%,var(--ink) 5%);stroke:var(--line);stroke-width:.7;vector-effect:non-scaling-stroke}',
      '.am-land.has{fill:color-mix(in srgb,var(--card) 72%,var(--a) 9%)}',
      '.am-grat{fill:none;stroke:var(--line);stroke-width:.5;opacity:.3;vector-effect:non-scaling-stroke}',
      '.am-cl{fill:var(--mute);font:600 11px var(--mono,monospace);letter-spacing:.14em;text-transform:uppercase;text-anchor:middle;pointer-events:none;paint-order:stroke;stroke:var(--card);stroke-width:3px;opacity:.85}',
      '.am-pins{position:absolute;inset:0;pointer-events:none}',
      '.am-pin{position:absolute;left:0;top:0;width:var(--s);height:var(--s);margin:calc(var(--s)/-2) 0 0 calc(var(--s)/-2);padding:0;border:0;background:none;pointer-events:auto;cursor:pointer;will-change:transform}',
      '.am-pin .in{display:grid;place-items:center;width:100%;height:100%;border-radius:50%;background:#fff;border:2px solid var(--a);box-shadow:0 4px 14px rgba(0,0,0,.45);overflow:hidden;transition:transform .25s,opacity .25s,box-shadow .25s}',
      '.am-pin img{width:78%;height:78%;object-fit:contain;pointer-events:none}',
      '.am-pin .in b{font:700 11px var(--hd,sans-serif);color:#111}',
      '.am-pin:hover .in,.am-pin:focus-visible .in{transform:scale(1.18);box-shadow:0 0 0 4px color-mix(in srgb,var(--a) 35%,transparent),0 6px 18px rgba(0,0,0,.5)}',
      '.am-pin.off{pointer-events:none}.am-pin.off .in{opacity:0;transform:scale(.4)}',
      '.am-pin.sel .in{animation:am-pulse 1.8s ease-out infinite}',
      '@keyframes am-pulse{0%{box-shadow:0 0 0 0 color-mix(in srgb,var(--a) 70%,transparent)}100%{box-shadow:0 0 0 18px transparent}}',
      '.am-pin .lb{position:absolute;left:50%;top:100%;transform:translate(-50%,4px);white-space:nowrap;font:600 11px var(--hd,sans-serif);color:var(--ink);text-shadow:0 1px 3px var(--bg),0 0 6px var(--bg);opacity:0;transition:opacity .25s;pointer-events:none}',
      '.am-lab .am-pin:not(.off) .lb,.am-pin:not(.off):hover .lb{opacity:1}',
      '.am-ui{position:absolute;left:12px;top:12px;display:flex;flex-direction:column;gap:8px;z-index:5;align-items:flex-start}',
      '.am-search{width:min(230px,56vw);padding:9px 14px;border-radius:99px;border:1px solid var(--line);background:color-mix(in srgb,var(--card) 90%,transparent);color:var(--ink);font:inherit;font-size:14px;-webkit-user-select:text;user-select:text}',
      '.am-zoom{display:flex;flex-direction:column;border:1px solid var(--line);border-radius:12px;overflow:hidden;background:var(--card)}',
      '.am-zoom button{width:36px;height:36px;border:0;border-bottom:1px solid var(--line);background:none;color:var(--ink);font-size:18px;cursor:pointer}',
      '.am-zoom button:last-child{border-bottom:0}.am-zoom button:hover{background:var(--line)}',
      '.am-hint{position:absolute;left:50%;bottom:12px;transform:translateX(-50%);padding:6px 14px;border-radius:99px;background:color-mix(in srgb,var(--card) 88%,transparent);border:1px solid var(--line);color:var(--mute);font-size:12px;pointer-events:none;transition:opacity .6s;z-index:4;white-space:nowrap;max-width:92%;overflow:hidden;text-overflow:ellipsis}',
      '.am-hint.hide{opacity:0}',
      '.am-card{position:absolute;z-index:6;right:12px;top:12px;bottom:12px;width:min(360px,calc(100% - 24px));display:flex;flex-direction:column;border-radius:16px;background:var(--card);border:1px solid var(--line);box-shadow:0 18px 50px rgba(0,0,0,.5);overflow:hidden;transform:translateX(24px);opacity:0;transition:transform .45s cubic-bezier(.2,.8,.2,1),opacity .35s;cursor:default;-webkit-user-select:text;user-select:text}',
      '.am-card.on{transform:none;opacity:1}',
      '.am-x{position:absolute;right:8px;top:8px;z-index:3;width:32px;height:32px;border-radius:50%;border:0;background:rgba(0,0,0,.55);color:#fff;font-size:20px;line-height:1;cursor:pointer}',
      '.am-media{position:relative;flex:none;height:200px;overflow:hidden;perspective:760px;background:linear-gradient(110deg,var(--card) 30%,var(--line) 50%,var(--card) 70%);background-size:200% 100%;animation:am-sh 1.4s linear infinite}',
      '.am-media.done{animation:none;background:var(--bg)}',
      '@keyframes am-sh{to{background-position:-200% 0}}',
      '.am-media .l{position:absolute;inset:0;background-size:cover;background-position:center;opacity:0;transition:transform 1.2s cubic-bezier(.55,0,.2,1),opacity 1.1s}',
      '.am-media .sat{transform-origin:50% 100%}',
      '.am-media.has-sat .sat,.am-media.has-photo .photo{opacity:1}',
      '.am-media[data-v="photo"] .sat{transform:rotateX(64deg) translateY(12%) scale(1.3);opacity:0}',
      '.am-media[data-v="sat"] .photo{opacity:0;transform:scale(1.22) translateY(-7%)}',
      '.am-media .photo{animation:am-kb 16s ease-in-out infinite alternate}',
      '@keyframes am-kb{from{filter:none}to{filter:saturate(1.1)}}',
      '.am-none{position:absolute;inset:0;display:none;place-items:center;color:var(--mute);font-size:13px;text-align:center;padding:20px}',
      '.am-media.nomedia .am-none{display:grid}',
      '.am-sw{position:absolute;left:10px;bottom:10px;display:flex;gap:6px;z-index:2}',
      '.am-sw button{border:0;border-radius:99px;padding:5px 11px;font:600 11px var(--mono,monospace);background:rgba(0,0,0,.55);color:#fff;cursor:pointer;opacity:.75}',
      '.am-sw button.on{opacity:1;background:var(--a);color:#1a1200}',
      '.am-cr{position:absolute;right:10px;bottom:10px;z-index:2;font-size:10px;color:#fff;text-shadow:0 1px 3px #000;opacity:.8}',
      '.am-body{padding:14px 16px 16px;overflow:auto}',
      '.am-head{display:flex;align-items:center;gap:12px;margin-bottom:12px}',
      '.am-head img{width:46px;height:46px;border-radius:50%;background:#fff;object-fit:contain;padding:3px;flex:none}',
      '.am-head h3{margin:0;font:700 21px/1.1 var(--hd,sans-serif);color:var(--ink)}',
      '.am-head p{margin:3px 0 0;font:12px var(--mono,monospace);color:var(--mute)}',
      '.am-kpis{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px}',
      '.am-kpis div{padding:9px 11px;border:1px solid var(--line);border-radius:12px;background:color-mix(in srgb,var(--bg) 45%,var(--card))}',
      '.am-kpis small{display:block;color:var(--mute);font-size:11px;margin-bottom:3px}',
      '.am-kpis b{font:700 17px var(--hd,sans-serif);color:var(--ink)}',
      '.am-act{display:flex;flex-wrap:wrap;gap:8px;align-items:center}',
      '.am-act button{border:0;border-radius:10px;padding:10px 14px;font:700 13px var(--tx,inherit);cursor:pointer}',
      '.am-pri{background:var(--a);color:#1a1200;flex:1 1 150px}',
      '.am-sec{background:none;border:1px solid var(--line)!important;color:var(--ink)}',
      '.am-sv{color:var(--mute);font-size:12px;text-decoration:none;margin-left:auto}.am-sv:hover{color:var(--a)}',
      '.am-miss{margin-top:8px;font-size:13px;color:var(--mute)}',
      '@media(max-width:819px){.am-card{top:auto;left:10px;right:10px;bottom:10px;width:auto;max-height:64%}.am-media{height:150px}.am-search{width:min(200px,50vw)}}',
      '@media(prefers-reduced-motion:reduce){.am-card,.am-media .l,.am-pin .in{transition:none}.am-pin.sel .in,.am-media .photo{animation:none}}'
    ].join('\n');
    document.head.appendChild(s);
  }

  function mainCentroid(d3, f) {
    var g = f.geometry;
    if (g.type !== 'MultiPolygon') return { c: d3.geoCentroid(f), poly: f };
    var best = null, ba = -1;
    g.coordinates.forEach(function (c) {
      var p = { type: 'Polygon', coordinates: c }, a = d3.geoArea(p);
      if (a > ba) { ba = a; best = p; }
    });
    return { c: d3.geoCentroid(best), poly: best };
  }

  function mount(el, deps) {
    if (cur) { cur.destroy(); cur = null; }
    css();
    var D = deps.D, T = deps.T || function (a) { return a; }, esc = deps.esc || String, N = deps.norm || baseNorm;
    var same = deps.same || function (a, b) { return N(a) === N(b); }, season = deps.season || '26/27';
    el.innerHTML = '<div class="am-load">' + esc(T('Kraunamas žemėlapis…', 'Loading map…')) + '</div>';
    ensureLibs().then(function (topo) { if (el.isConnected) build(topo); }).catch(function () {
      el.innerHTML = '<div class="am-load">' + esc(T('Nepavyko įkelti žemėlapio. Patikrinkite ryšį.', 'Could not load the map. Check your connection.')) + '</div>';
    });

    function build(topo) {
      var d3 = window.d3, topojson = window.topojson;
      // --- klubai ---
      var seen = {}, items = [], missing = [];
      D.bud.filter(function (r) { return r.season === season && r.club; }).forEach(function (r) {
        var k = N(r.club); if (seen[k]) return; seen[k] = 1;
        var e = findArena(r.club, N);
        if (!e) { missing.push(r.club); return; }
        items.push({ name: r.club, nation: r.nation, e: e, total: +r.total || 0, logo: deps.logo ? deps.logo(r.club) : null });
      });
      items.sort(function (a, b) { return b.total - a.total; });
      var maxT = Math.max.apply(null, items.map(function (i) { return i.total; }).concat([1]));
      var groups = {};
      items.forEach(function (it) {
        it.s = Math.round(28 + 18 * Math.sqrt(it.total / maxT));
        it.g = it.e.lat + ',' + it.e.lon; (groups[it.g] = groups[it.g] || []).push(it);
      });
      items.forEach(function (it) { it.gi = groups[it.g].indexOf(it); it.gn = groups[it.g].length; });

      // --- DOM ---
      var wrap = document.createElement('div'); wrap.className = 'am-wrap';
      wrap.innerHTML = '<svg class="am-svg"><g class="am-g"><path class="am-grat"></path><g class="am-lands"></g><g class="am-labs"></g></g></svg><div class="am-pins"></div>' +
        '<div class="am-ui"><input class="am-search" type="search" list="am-dl" placeholder="' + esc(T('Ieškoti klubo…', 'Find a club…')) + '" aria-label="' + esc(T('Ieškoti klubo', 'Find a club')) + '">' +
        '<datalist id="am-dl">' + items.map(function (i) { return '<option value="' + esc(i.name) + '">'; }).join('') + '</datalist>' +
        '<div class="am-zoom"><button type="button" data-z="in" aria-label="+">+</button><button type="button" data-z="out" aria-label="−">−</button><button type="button" data-z="home" aria-label="' + esc(T('Visi klubai', 'All clubs')) + '">⌂</button></div></div>' +
        '<div class="am-hint">' + esc(T('Burbulo dydis – 26/27 biudžetas · artinkite, kad atsirastų daugiau klubų', 'Bubble size – 26/27 budget · zoom in to reveal more clubs')) + '</div>' +
        '<aside class="am-card" hidden></aside>';
      el.innerHTML = ''; el.appendChild(wrap);
      if (missing.length) {
        var det = document.createElement('details'); det.className = 'am-miss';
        det.innerHTML = '<summary>' + esc(T('Klubai be arenos koordinačių', 'Clubs without arena coordinates')) + ' (' + missing.length + ')</summary><p>' + missing.map(esc).join(', ') + '</p>';
        el.appendChild(det);
      }
      var note = document.createElement('p'); note.className = 'sum';
      note.style.cssText = 'font-size:13px;margin-top:8px';
      note.textContent = items.length + ' ' + T('klubų žemėlapyje', 'clubs on the map') + ' · ' + T('sezonas', 'season') + ' ' + season;
      el.appendChild(note);

      var W = function () { return wrap.clientWidth || 800; }, H = function () { return wrap.clientHeight || 520; };
      var svg = d3.select(wrap.querySelector('.am-svg')), g = svg.select('.am-g');
      var features = topojson.feature(topo, topo.objects.countries).features.filter(function (f) {
        if (f.properties.name === 'Russia') return true;
        var b = d3.geoBounds(f); return b[1][0] > -35 && b[0][0] < 75 && b[1][1] > 10 && b[0][1] < 75;
      });
      var nations = {}; items.forEach(function (i) { nations[NAMEFIX[i.nation] || i.nation] = 1; });
      var proj, path, ext, cT = d3.zoomIdentity, sel = null, raf = 0, mtoken = 0, openedAt = 0;
      var labels = features.filter(function (f) { return nations[f.properties.name]; }).map(function (f) { var m = mainCentroid(d3, f); return { f: f, c: m.c, poly: m.poly, n: f.properties.name }; });

      var lands = g.select('.am-lands').selectAll('path').data(features).join('path').attr('class', function (f) { return 'am-land' + (nations[f.properties.name] ? ' has' : ''); });
      var labSel = g.select('.am-labs').selectAll('text').data(labels).join('text').attr('class', 'am-cl').text(function (d) { return d.n; });

      function project() {
        var w = W(), h = H();
        proj = d3.geoMercator().fitExtent([[12, 12], [w - 12, h - 12]], { type: 'MultiPoint', coordinates: [[-11, 31], [40, 31], [40, 62], [-11, 62]] });
        path = d3.geoPath(proj);
        var a = proj([-30, 72]), b = proj([70, 18]); ext = [[a[0], a[1]], [b[0], b[1]]];
        g.select('.am-grat').datum(d3.geoGraticule10()).attr('d', path);
        lands.attr('d', path);
        labels.forEach(function (l) { var p = proj(l.c), bb = path.bounds(l.poly); l.x = p[0]; l.y = p[1]; l.w = bb[1][0] - bb[0][0]; });
        items.forEach(function (it) { it.p = proj([it.e.lon, it.e.lat]); });
      }
      project();

      // --- piniai ---
      var pinsEl = wrap.querySelector('.am-pins');
      items.forEach(function (it) {
        var b = document.createElement('button'); b.type = 'button'; b.className = 'am-pin'; b.title = it.name; b.setAttribute('aria-label', it.name);
        b.style.setProperty('--s', it.s + 'px');
        var ini = String(it.name).split(/\s+/).slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase();
        b.innerHTML = '<span class="in">' + (it.logo ? '<img src="' + esc(it.logo) + '" alt="" draggable="false" loading="lazy">' : '<b>' + esc(ini) + '</b>') + '</span><span class="lb">' + esc(it.name) + '</span>';
        b.addEventListener('click', function () { select(it); });
        pinsEl.appendChild(b); it.el = b;
      });

      function layout() {
        raf = 0;
        layoutPins(items, cT, W(), H(), sel);
        items.forEach(function (it) {
          it.el.classList.toggle('off', !it.on);
          if (it.vis) it.el.style.transform = 'translate(' + it.sx.toFixed(1) + 'px,' + it.sy.toFixed(1) + 'px)';
        });
        wrap.classList.toggle('am-lab', cT.k >= 6);
        labSel.attr('transform', function (d) { return 'translate(' + d.x + ',' + d.y + ')'; })
          .style('font-size', (11 / cT.k) + 'px').style('stroke-width', (3 / cT.k) + 'px')
          .style('display', function (d) { return d.w * cT.k > d.n.length * 8.5 ? null : 'none'; });
      }
      function apply(t) {
        cT = t; g.attr('transform', t.toString());
        if (!raf) raf = requestAnimationFrame(layout);
        wrap.querySelector('.am-hint').classList.add('hide');
      }

      var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
      var zoom = d3.zoom().scaleExtent([1, 32])
        .extent(function () { return [[0, 0], [W(), H()]]; })
        .translateExtent(ext)
        .filter(function (ev) { return !(ev.target.closest && ev.target.closest('.am-card,.am-ui')) && (!ev.ctrlKey || ev.type === 'wheel') && !ev.button; })
        .on('zoom', function (ev) { apply(ev.transform); });
      var wsel = d3.select(wrap);
      wsel.call(zoom);
      function setExt() { zoom.translateExtent(ext); }
      wsel.call(zoom.transform, d3.zoomIdentity);
      layout();

      function fly(it) {
        var w = W(), h = H(), wide = w >= 820, k = Math.max(cT.k, 11);
        var tx = wide ? (w - 390) / 2 : w / 2, ty = wide ? h / 2 : h * 0.3;
        var tr = d3.zoomIdentity.translate(tx - it.p[0] * k, ty - it.p[1] * k).scale(k);
        wsel.transition().duration(reduced ? 0 : 1300).ease(d3.easeCubicInOut).call(zoom.transform, tr);
      }

      // --- kortelė ---
      var card = wrap.querySelector('.am-card');
      function fmtM(v) { return (v / 1e6).toFixed(1).replace('.', ',') + ' M €'; }
      function openCard(it) {
        var e = it.e, bud = D.bud.filter(function (r) { return r.season === season && same(r.club, it.name); })[0];
        var att = (D.att || []).filter(function (r) { return same(r.club, it.name) && r.avg != null; }).sort(function (a, b) { return String(b.season).localeCompare(String(a.season)); })[0];
        var attTxt = att ? Math.round(att.avg).toLocaleString('lt-LT') + (att.fill ? ' · ' + Math.round(att.fill * 100) + '%' : '') : '—';
        card.hidden = false;
        card.innerHTML =
          '<button type="button" class="am-x" aria-label="' + esc(T('Uždaryti', 'Close')) + '">×</button>' +
          '<div class="am-media" data-v="sat"><div class="l sat"></div><div class="l photo"></div>' +
          '<div class="am-none">' + esc(e.arena) + ' · ' + esc(e.city) + '</div>' +
          '<div class="am-sw" hidden><button type="button" data-v="sat">🛰 ' + esc(T('Iš viršaus', 'Top')) + '</button><button type="button" data-v="photo">📷 ' + esc(T('Iš šono', 'Side')) + '</button></div>' +
          '<small class="am-cr"></small></div>' +
          '<div class="am-body"><div class="am-head">' + (it.logo ? '<img src="' + esc(it.logo) + '" alt="">' : '') +
          '<div><h3>' + esc(it.name) + '</h3><p>' + esc(e.arena) + ' · ' + esc(e.city) + '</p></div></div>' +
          '<div class="am-kpis"><div><small>' + esc(T('Biudžetas', 'Budget')) + ' ' + season + '</small><b>' + (bud && bud.total != null ? fmtM(bud.total) : '—') + '</b></div>' +
          '<div><small>' + esc(T('Vid. lankomumas', 'Avg. attendance')) + '</small><b>' + attTxt + '</b></div></div>' +
          '<div class="am-act">' +
          '<button type="button" class="am-pri" data-a="' + (att ? 'att' : 'bud') + '">' + esc(att ? T('Žiūrėti lankomumą', 'View attendance') : T('Žiūrėti biudžetą', 'View budget')) + '</button>' +
          (att ? '<button type="button" class="am-sec" data-a="bud">' + esc(T('Biudžetas', 'Budget')) + '</button>' : '') +
          '<a class="am-sv" target="_blank" rel="noopener" href="https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=' + e.lat + ',' + e.lon + '">' + esc(T('Gatvės vaizdas ↗', 'Street View ↗')) + '</a>' +
          '</div></div>';
        requestAnimationFrame(function () { card.classList.add('on'); });
        openedAt = performance.now();
        loadMedia(it);
      }
      function loadMedia(it) {
        var my = ++mtoken, box = card.querySelector('.am-media'), sat = box.querySelector('.sat'), ph = box.querySelector('.photo'), e = it.e;
        wiki(e).then(function (info) {
          if (my !== mtoken) return;
          var c = info && info.coords ? info.coords : (e.ok ? [e.lat, e.lon] : null);
          var sUrl = c ? roofImg(c) : null, pUrl = info && info.photo;
          var hasS = false, hasP = false;
          var ps = sUrl ? preload(sUrl).then(function (ok) { if (ok && my === mtoken) { sat.style.backgroundImage = 'url("' + sUrl + '")'; box.classList.add('has-sat'); hasS = true; } }) : Promise.resolve();
          var pp = pUrl ? preload(pUrl).then(function (ok) { if (ok && my === mtoken) { ph.style.backgroundImage = 'url("' + pUrl + '")'; box.classList.add('has-photo'); hasP = true; } }) : Promise.resolve();
          return Promise.all([ps, pp]).then(function () {
            if (my !== mtoken) return;
            box.classList.add('done');
            if (!hasS && !hasP) { box.classList.add('nomedia'); return; }
            if (hasP) box.querySelector('.am-cr').textContent = T('Foto: Wikipedia', 'Photo: Wikipedia');
            if (hasS && hasP) {
              box.querySelector('.am-sw').hidden = false;
              var wait = Math.max(0, 1800 - (performance.now() - openedAt));
              setTimeout(function () { if (my === mtoken) setView('photo'); }, reduced ? 0 : wait);
            } else box.dataset.v = hasP ? 'photo' : 'sat';
          });
        });
        function setView(v) {
          box.dataset.v = v;
          [].forEach.call(box.querySelectorAll('.am-sw button'), function (b) { b.classList.toggle('on', b.dataset.v === v); });
        }
        box.addEventListener('click', function (ev) { var b = ev.target.closest && ev.target.closest('.am-sw button'); if (b) setView(b.dataset.v); });
      }
      function closeCard() {
        mtoken++; sel = null; card.classList.remove('on');
        setTimeout(function () { if (!card.classList.contains('on')) card.hidden = true; }, 400);
        items.forEach(function (i) { i.el.classList.remove('sel'); });
        layout();
      }
      function select(it) {
        items.forEach(function (i) { i.el.classList.toggle('sel', i === it); });
        sel = it; openCard(it); fly(it); layout();
      }
      card.addEventListener('click', function (ev) {
        if (ev.target.closest('.am-x')) return closeCard();
        var b = ev.target.closest('[data-a]');
        if (b && sel && typeof deps.club === 'function') deps.club(sel.name, sel.nation, season, 0, b.dataset.a === 'att' ? 'att' : undefined);
      });
      wrap.querySelector('.am-zoom').addEventListener('click', function (ev) {
        var b = ev.target.closest('button'); if (!b) return;
        var tr = wsel.transition().duration(reduced ? 0 : 450);
        if (b.dataset.z === 'in') tr.call(zoom.scaleBy, 1.8);
        else if (b.dataset.z === 'out') tr.call(zoom.scaleBy, 1 / 1.8);
        else { closeCard(); wsel.transition().duration(reduced ? 0 : 900).ease(d3.easeCubicInOut).call(zoom.transform, d3.zoomIdentity); }
      });
      var search = wrap.querySelector('.am-search');
      search.addEventListener('change', function () {
        var q = N(search.value); if (!q) return;
        var it = items.filter(function (i) { return N(i.name) === q; })[0] || items.filter(function (i) { return N(i.name).indexOf(q) >= 0; })[0];
        if (it) { select(it); search.value = ''; search.blur(); }
      });
      function onKey(ev) { if (ev.key === 'Escape' && sel) closeCard(); }
      document.addEventListener('keydown', onKey);

      var lastW = W(), lastH = H();
      var ro = window.ResizeObserver ? new ResizeObserver(function () {
        if (Math.abs(W() - lastW) < 8 && Math.abs(H() - lastH) < 8) return;
        lastW = W(); lastH = H(); project(); setExt(); wsel.call(zoom.transform, d3.zoomIdentity); layout();
      }) : null;
      if (ro) ro.observe(wrap);

      cur = { destroy: function () { document.removeEventListener('keydown', onKey); if (ro) ro.disconnect(); if (raf) cancelAnimationFrame(raf); mtoken++; } };
    }
  }

  API.mount = mount;
})();
