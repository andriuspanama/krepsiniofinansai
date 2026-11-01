/*
 * arenamap.js – arenų žemėlapis, nupieštas pačios svetainės dizainu (D3, be plytelių ir API raktų).
 *   ArenaMap.mount(elementas, { D, T, esc, norm, same, logo, club, season, sheetId })
 * Klubai, arenos, miestai ir koordinatės imami tiesiai iš Google Sheets lapo „Arenas“:
 *   kiekvienas klubas – jo pagrindinėje arenoje („Main arena override“, jei įrašyta, kitaip „Main arena for“).
 *   Naujas klubas lape → naujas klubas žemėlapyje (nieko keisti nereikia).
 * Žemiau esantis RAW sąrašas – tik atsarginis variantas, jei lapo nepavyktų atsisiųsti.
 * Žemėlapio kontūrai kraunami iš jsDelivr (world-atlas), arenų nuotraukos – iš Wikipedia.
 */
(function () {
  'use strict';

  var CDN_D3 = 'https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js';
  var CDN_TOPO = 'https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/dist/topojson-client.min.js';
  var CDN_GEO = 'https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json';

  var baseNorm = function (s) { return String(s == null ? '' : s).toLowerCase().normalize('NFD').replace(/[^a-z0-9]/g, ''); };

  /* Miestų pavadinimai: lape „Arenas“ – vietine kalba; čia – [anglų, lietuvių] (kas nesiskiria, nerašoma – rodoma kaip lape).
     Raktas – pavadinimas be diakritikų, žodžiai sujungti „_“. Naujas miestas be vertimo rodomas taip, kaip įrašytas lape. */
  var cityTok = function (v) { return String(v || '').toLowerCase().replace(/ł/g, 'l').replace(/đ/g, 'd').replace(/ø/g, 'o').replace(/ı/g, 'i').replace(/ß/g, 'ss').normalize('NFD').replace(/[\u0300-\u036f]/g, '').split(/[^a-z0-9]+/).filter(Boolean); };
  var CITY_I18N = {
    istanbul: ['Istanbul', 'Stambulas'], istanbul_buyukcekmece: ['Istanbul (Büyükçekmece)', 'Stambulas (Büyükçekmece)'], izmir: ['Izmir', 'Izmiras'],
    trabzon: ['Trabzon', 'Trabzonas'], beograd: ['Belgrade', 'Belgradas'], riga: ['Riga', 'Ryga'], liepaja: ['Liepāja', 'Liepoja'], ventspils: ['Ventspils', 'Ventspilis'],
    tallinn: ['Tallinn', 'Talinas'], tel_aviv: ['Tel Aviv', 'Tel Avivas'], jerusalem: ['Jerusalem', 'Jeruzalė'], be_er_sheva: ['Beersheba', 'Beer Ševa'],
    madrid: ['Madrid', 'Madridas'], barcelona: ['Barcelona', 'Barselona'], valencia: ['Valencia', 'Valensija'], zaragoza: ['Zaragoza', 'Saragosa'], murcia: ['Murcia', 'Mursija'],
    thessaloniki: ['Thessaloniki', 'Salonikai'], piraeus: ['Piraeus', 'Pirėjas'], rhodes: ['Rhodes', 'Rodas'], patra: ['Patras', 'Patrai'],
    roma: ['Rome', 'Roma'], napoli: ['Naples', 'Neapolis'], venezia: ['Venice', 'Venecija'], bologna: ['Bologna', 'Bolonija'], trieste: ['Trieste', 'Triestas'],
    lisboa: ['Lisbon', 'Lisabona'], porto: ['Porto', 'Portas'], paris: ['Paris', 'Paryžius'], strasbourg: ['Strasbourg', 'Strasbūras'], london: ['London', 'Londonas'],
    berlin: ['Berlin', 'Berlynas'], munchen: ['Munich', 'Miunchenas'], hamburg: ['Hamburg', 'Hamburgas'], frankfurt_am_main: ['Frankfurt', 'Frankfurtas prie Maino'], bonn: ['Bonn', 'Bona'],
    wien: ['Vienna', 'Viena'], praha: ['Prague', 'Praha'], warszawa: ['Warsaw', 'Varšuva'], wroclaw: ['Wrocław', 'Vroclavas'], szczecin: ['Szczecin', 'Ščecinas'],
    lublin: ['Lublin', 'Liublinas'], bydgoszcz: ['Bydgoszcz', 'Bydgoščius'], torun: ['Toruń', 'Torunė'], lodz: ['Łódź', 'Lodzė'], gdynia: ['Gdynia', 'Gdynė'],
    ljubljana: ['Ljubljana', 'Liubliana'], zagreb: ['Zagreb', 'Zagrebas'], split: ['Split', 'Splitas'], zadar: ['Zadar', 'Zadaras'], sarajevo: ['Sarajevo', 'Sarajevas'],
    skopje: ['Skopje', 'Skopjė'], budapest: ['Budapest', 'Budapeštas'], debrecen: ['Debrecen', 'Debrecenas'], szeged: ['Szeged', 'Segedas'], pecs: ['Pécs', 'Pečas'],
    bucharest: ['Bucharest', 'Bukareštas'], antwerpen: ['Antwerp', 'Antverpenas'], oostende: ['Ostend', 'Ostendė'], aarhus: ['Aarhus', 'Orhusas'],
    helsinki: ['Helsinki', 'Helsinkis'], tampere: ['Tampere', 'Tamperė'], dubai: ['Dubai', 'Dubajus'],
    melbourne: ['Melbourne', 'Melburnas'], sydney: ['Sydney', 'Sidnėjus'], adelaide: ['Adelaide', 'Adelaidė'], brisbane: ['Brisbane', 'Brisbenas'], perth: ['Perth', 'Pertas'],
    hobart: ['Hobart', 'Hobartas'], auckland: ['Auckland', 'Oklandas']
  };
  // priemiesčiai – randami ir pagal didmiestį (tik paieškai)
  var CITY_NEAR = {
    marousi: 'athens atenai', ano_liosia: 'athens atenai', peristeri: 'athens atenai', piraeus: 'athens atenai', pylaia: 'thessaloniki salonikai',
    assago: 'milan milano milanas', desio: 'milan milano milanas', villorba: 'treviso', villeurbanne: 'lyon lionas', badalona: 'barcelona barselona',
    nanterre: 'paris paryzius', sopot: 'gdansk', kfar_blum: 'upper galilee galil elyon', gan_ner: 'jezreel haemek', istanbul_buyukcekmece: 'istanbul stambulas'
  };

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
      var x = t.k * it.p[0] + t.x + (it.off || 0), y = t.k * it.p[1] + t.y;
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
  var NAMEFIX = { 'Czech Republic': 'Czechia', 'Bosnia and Herzegovina': 'Bosnia and Herz.', 'North Macedonia': 'Macedonia', UK: 'United Kingdom', England: 'United Kingdom' };
  var SHEET_FALLBACK = '1Qt4ijFGDmvoLLHb-gCbcAF9KGts6ZC-RHwWzQw68cZI';

  // „A; B (occasional); C (2024-25)“ -> ['A', 'B', 'C'] (pastabos skliaustuose nuimamos, kiti skliaustai – pavadinimo dalis)
  function sheetNames(cell) {
    return String(cell == null ? '' : cell).split(';').map(function (x) {
      return x.replace(/\s*\(((?:[^)]*occasional[^)]*)|(?:[^)]*\d{4}[^)]*)|(?:pre-season[^)]*)|(?:listed[^)]*))\)/gi, '').trim();
    }).filter(Boolean);
  }
  // Lapas „Arenas“ per gviz JSON: reikšmės be formatavimo (CSV koordinates suapvalintų iki 3 skaičių po kablelio)
  function loadSheet(id) {
    var u = 'https://docs.google.com/spreadsheets/d/' + id + '/gviz/tq?tqx=out:json&headers=1&sheet=Arenas&t=' + Math.floor(Date.now() / 60000);
    return fetch(u).then(function (r) { return r.text(); }).then(function (t) {
      var j = JSON.parse(t.slice(t.indexOf('(') + 1, t.lastIndexOf(')')));
      var cols = j.table.cols.map(function (c) { return baseNorm(c.label); });
      var ci = function (n) { return cols.indexOf(baseNorm(n)); };
      var I = { league: ci('League'), arena: ci('Arena'), main: ci('Main arena for'), over: ci('Main arena override'), city: ci('City'),
        lat: ci('Latitude'), lon: ci('Longitude'), cap: ci('Capacity'), prec: ci('Coordinates precision'), aka: ci('Also known as'), inner: ci('Interior photo'), side: ci('Side photo') };
      if (I.arena < 0 || I.main < 0 || I.lat < 0 || I.lon < 0) throw new Error('Arenas: nerasti stulpeliai');
      var num = function (v) { if (v == null || v === '') return NaN; return typeof v === 'number' ? v : parseFloat(String(v).replace(/\s/g, '').replace(',', '.')); };
      return j.table.rows.map(function (r) {
        var c = (r.c || []).map(function (x) { return x == null ? null : x.v; }), g = function (k) { return I[k] >= 0 ? c[I[k]] : null; };
        var lat = num(g('lat')), lon = num(g('lon'));
        return { league: String(g('league') || ''), arena: String(g('arena') || '').trim(), city: String(g('city') || '').trim(),
          lat: lat, lon: lon, ok: isFinite(lat) && isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180,
          cap: isFinite(num(g('cap'))) ? Math.round(num(g('cap'))) : null,
          aka: String(g('aka') || '').trim(), inner: String(g('inner') || '').trim(), side: String(g('side') || '').trim(), main: sheetNames(g('main')), over: sheetNames(g('over')) };
      }).filter(function (r) { return r.arena; });
    });
  }
  var scripts = {}, topoP = null, cur = null, wcache = {};

  var API = { findArena: findArena, ARENAS: ARENAS, layoutPins: layoutPins, km: km, sheetNames: sheetNames };
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
  // Arenos nuotrauka (vaizdas „iš šono“): pirmiausia ieškoma Wikipedia straipsnių aplink arenos koordinates,
  // tada Wikidata objektų (jų nuotrauka P18) aplink koordinates, galiausiai – Wikipedia paieška pagal pavadinimą.
  // Tinka tik straipsnis, kurio pavadinime yra arenos (ar „Also known as“) žodis, arba labai arti esanti sporto salė;
  // atmetami miestai, klubai, futbolo stadionai (kai arena – salė), parkai, bažnyčios, tiltai ir pan.
  var PH_GEN = { arena: 1, arene: 1, aren: 1, center: 1, centre: 1, centrum: 1, sports: 1, sport: 1, sportowa: 1, sportova: 1, sportska: 1, hall: 1, palace: 1, palais: 1, palacio: 1,
    pabellon: 1, pavello: 1, forum: 1, dome: 1, stadium: 1, sala: 1, salle: 1, dvorana: 1, hala: 1, spor: 1, salonu: 1, indoor: 1, olympic: 1, sporthalle: 1, stadthalle: 1,
    municipal: 1, municipale: 1, deportes: 1, esports: 1, omnisports: 1, city: 1, nuevo: 1, nouveau: 1, sportcsarnok: 1, varosi: 1, utcai: 1, mala: 1, velika: 1, osir: 1,
    palazzetto: 1, palasport: 1, dello: 1, delle: 1 };
  var PH_VEN = /(hall|halli|halle|hallen|areena|arena|aréna)(?![a-z])|\b(hala|palais|palau|palacio|pabell\S*|pavell\S*|pavilion|pavilh\S*|palasport|pala(?!ce)\S+|palazzetto|sporthal\S*|sportcsarnok|sportovní|salonu|dvorana|sala|salle|dome|dôme|forum|colis\S*|coliseo|gym\S*|centre|center|centar|centrum|complex|kompleks|keskus|centrs|osir|heichal|heihal|spodek|indoor|tervisekeskus|spor)\b/i;
  var PH_STAD = /stadion|stadium|stade\b|stadio|estadio|estádio|stadyum|stadı/i;
  var PH_NOT = /\b(park|cathedral|basilica|church|bridge|station|tram|metro|district|neighbourhood|street|square|university|school|šolski|škola|szkoła|scuola|école|escuela|museum|airport|tower|river|lake|ice|hockey|rink|patinoire|eishalle|eisstadion|jäähalli|lodowisko|palace)\b/i;
  var PH_CLUB = /basket|\bbc\b|\bkk\b|\bbk\b|\bclub\b|\bteam\b|season|f\.c\.|football|baloncesto|pallacanestro|koszyk|basketball/i;
  // JSON užklausa su laiko limitu ir vienu pakartojimu (Wikidata kartais atsako „per daug užklausų“)
  function getJ(u, again) {
    var ctl = window.AbortController ? new AbortController() : null, to = setTimeout(function () { if (ctl) ctl.abort(); }, 8000);
    return fetch(u, ctl ? { signal: ctl.signal } : {}).then(function (r) { clearTimeout(to); return r.json(); }).catch(function () {
      clearTimeout(to);
      return again ? {} : new Promise(function (res) { setTimeout(res, 1500); }).then(function () { return getJ(u, true); });
    });
  }
  var phWords = function (s) { return String(s || '').split(/[^0-9A-Za-zÀ-ɏͰ-ϿЀ-ӿ֐-׿]+/).map(baseNorm).filter(Boolean); };
  function wiki(e) {
    var key = e.arena + '|' + e.city;
    if (wcache[key]) return wcache[key];
    var cityW = {}, ck = cityTok(e.city).join('_');
    [e.city].concat(CITY_I18N[ck] || [], String(CITY_NEAR[ck] || '').split(' ')).forEach(function (c) { phWords(c).forEach(function (w) { cityW[w.slice(0, 5)] = 1; }); });
    var toks = [];
    [e.arena].concat(String(e.aka || '').split(/[;|]/)).forEach(function (n) {
      phWords(n).forEach(function (w) { var t = w.slice(0, 5); if (w.length >= 4 && !PH_GEN[w] && !cityW[t] && toks.indexOf(t) < 0) toks.push(t); });
    });
    var arenaStad = PH_STAD.test(e.arena + ' ' + (e.aka || '')), arenaVen = PH_VEN.test(e.arena), arenaNot = PH_NOT.test(e.arena);
    var hits = function (t) { var W = phWords(t); return toks.filter(function (x) { return W.some(function (w) { return w.indexOf(x) === 0; }); }).length; };
    var isCity = function (t) { var W = phWords(t); return !W.length || W.every(function (w) { return cityW[w.slice(0, 5)] || w.length < 3; }); };
    var score = function (t, d, maxV) {
      var n = hits(t), v = PH_VEN.test(t) || /^pala/i.test(t);
      if (isCity(t) || (PH_CLUB.test(t) && !v) || (PH_NOT.test(t) && !arenaNot) || (PH_STAD.test(t) && !arenaStad)) return 0;
      if (n && (v || !arenaVen || n >= 2)) return 2 + n;
      // arenos pavadinime tik miestas ir bendri žodžiai (pvz. „Kėdainių arena“): tinka toks pat pavadinimas netoliese
      if (!toks.length && v && d != null && d <= 0.4 && phWords(t).every(function (w) { return cityW[w.slice(0, 5)] || PH_GEN[w] || w.length < 3 || PH_VEN.test(w); })) return 2;
      return v && d != null && d <= maxV ? 1 : 0;
    };
    var best = function (ps, maxV) {
      var b = null, bs = 0;
      ps.forEach(function (p) { var sc = score(p.title, p.d, maxV); if (sc > bs || (sc && sc === bs && p.d != null && (b.d == null || p.d < b.d))) { b = p; bs = sc; } });
      return b;
    };
    var J = getJ;
    var ok = e.ok && isFinite(e.lat) && isFinite(e.lon), here = [e.lat, e.lon], W = 'https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&';
    var pagesOf = function (j) {
      return Object.keys((j.query && j.query.pages) || {}).map(function (k) {
        var p = j.query.pages[k], c = p.coordinates && p.coordinates[0]; p.co = c ? [c.lat, c.lon] : null; p.d = ok && p.co ? km(p.co, here) : null;
        p.qid = p.pageprops && p.pageprops.wikibase_item; return p;
      }).filter(function (p) { return p.thumbnail; });
    };
    wcache[key] = (ok ? J(W + 'generator=geosearch&ggscoord=' + e.lat + '|' + e.lon + '&ggsradius=1500&ggslimit=40&prop=pageimages|coordinates|pageprops&ppprop=wikibase_item&piprop=thumbnail&pithumbsize=900&colimit=40')
      .then(function (j) { var g = best(pagesOf(j), 0.1); return g ? { photo: g.thumbnail.source, coords: null, cr: 'Wikipedia', qid: g.qid } : null; }) : Promise.resolve(null))
      .then(function (r) {
        if (r || !ok) return r;
        return J('https://www.wikidata.org/w/api.php?action=query&list=geosearch&format=json&origin=*&gscoord=' + e.lat + '|' + e.lon + '&gsradius=600&gslimit=30').then(function (j) {
          var gs = (j.query && j.query.geosearch) || [], dist = {};
          if (!gs.length) return null;
          gs.forEach(function (x) { dist[x.title] = x.dist / 1000; });
          return J('https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&origin=*&props=labels|claims&ids=' + gs.map(function (x) { return x.title; }).join('|')).then(function (w) {
            var ps = [];
            Object.keys(w.entities || {}).forEach(function (id) {
              var en = w.entities[id], L = en.labels || {}, p18 = en.claims && en.claims.P18 && en.claims.P18[0].mainsnak.datavalue;
              Object.keys(L).forEach(function (k) { ps.push({ title: L[k].value, d: dist[id], img: p18 ? p18.value : null, id: id }); });
            });
            var g = best(ps.filter(function (p) { return p.img; }), 0.1), any = g || best(ps, 0.1);
            // be nuotraukos, bet su Wikidata objektu – jo reikia interjero paieškai (Commons kategorija)
            if (!g) return any ? { photo: null, coords: null, qid: any.id } : null;
            return { photo: 'https://commons.wikimedia.org/wiki/Special:FilePath/' + encodeURIComponent(g.img) + '?width=900', coords: null, cr: 'Wikimedia Commons', qid: g.id };
          });
        });
      })
      .then(function (r) {
        if (r && r.photo) return r;
        return J(W + 'generator=search&gsrsearch=' + encodeURIComponent(e.arena + ' ' + e.city) + '&gsrlimit=5&prop=pageimages|coordinates|pageprops&ppprop=wikibase_item&piprop=thumbnail&pithumbsize=900&colimit=5').then(function (j) {
          var g = best(pagesOf(j).filter(function (p) { return hits(p.title); }), 0);
          if (!g) return r || null;
          return { photo: g.thumbnail.source, coords: !ok && g.co ? g.co : null, cr: 'Wikipedia', qid: g.qid || (r && r.qid) };
        });
      })
      .then(function (r) { return checkSide(e, r); })
      .catch(function () { return null; });
    return wcache[key];
  }

  // „Iš šono“ turi būti išorės vaizdas. Wikipedia / Wikidata nuotrauka kartais būna iš vidaus (pvz. Ülker, OAKA), todėl tikrinama:
  // 1) failo Commons kategorijos ir pavadinimas (rungtynės, interjeras, čempionatai…), 2) ar viršutiniame trečdalyje matosi dangus.
  // Netinkama keičiama kitu arenos Commons kategorijos failu su dangumi; neradus – vaizdo „iš šono“ nėra (lieka „iš vidaus“ ir „iš viršaus“).
  // Lapo „Arenas“ stulpelis „Side photo“ (nuoroda) visada laimi.
  var SIDE_BAD = /interior|innen|inside|\bvs\.?\b| v\.? |match|\bgames?\b|championship|eurobasket|euroleague|eurocup|world cup|supporters|\bfans\b|concert|scoreboard|press conference|retired numbers| at the \d{4}|\bfinal\b|tournament|media day|ceremony|figure skating|crowd|spectator|\bcourt\b|\bbowl\b|tribun|\bplan\b|\bmap\b|logo|construction|baustelle|ticket/i;
  var SIDE_EXT = /exterior|außen|aussen|extérieur|facade|façade|fassade|fasad|buildings in|outside|entrance|eingang/i;
  var CQ = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&prop=categories|imageinfo&clshow=!hidden&cllimit=max&iiprop=url&iiurlwidth=120&';
  var catsTxt = function (p) { return (p.categories || []).map(function (c) { return c.title; }).join(' | '); };
  function fileOfUrl(u) {
    u = String(u || '');
    var m = u.match(/Special:FilePath\/([^?#]+)/) || u.match(/(?:upload|thumb)\.wikimedia\.org\/wikipedia\/commons\/(?:thumb\/)?[0-9a-f]\/[0-9a-f]{2}\/([^/?#]+)/);
    try { return m ? decodeURIComponent(m[1]).replace(/_/g, ' ') : null; } catch (x) { return null; }
  }
  // dangaus dalis viršutiniame nuotraukos trečdalyje (0–1); null – nepavyko patikrinti
  function skyOf(url) {
    return new Promise(function (res) {
      if (!/^https:\/\/(upload|thumb)\.wikimedia\.org\//.test(url || '')) return res(null);
      var im = new Image(), to = setTimeout(function () { res(null); }, 7000);
      im.crossOrigin = 'anonymous';
      im.onload = function () {
        clearTimeout(to);
        try {
          var Wd = 64, Hd = Math.max(8, Math.round(64 * im.naturalHeight / im.naturalWidth)), top = Math.max(2, Math.round(Hd * 0.3));
          var cv = document.createElement('canvas'); cv.width = Wd; cv.height = Hd;
          var x = cv.getContext('2d'); x.drawImage(im, 0, 0, Wd, Hd);
          var d = x.getImageData(0, 0, Wd, top).data, n = 0, sky = 0;
          for (var i = 0; i < d.length; i += 4) {
            var R = d[i], G = d[i + 1], B = d[i + 2], mx = Math.max(R, G, B), mn = Math.min(R, G, B), l = (mx + mn) / 2, sat = mx ? (mx - mn) / mx : 0;
            n++; if ((B >= R && B >= G - 8 && l > 90) || (l > 165 && sat < 0.18)) sky++;
          }
          res(n ? sky / n : null);
        } catch (x) { res(null); }
      };
      im.onerror = function () { clearTimeout(to); res(null); };
      im.src = url;
    });
  }
  function checkSide(e, r) {
    var own = String(e.side || '').trim();
    if (/^https?:\/\//i.test(own)) {
      var m = own.match(/commons\.wikimedia\.org\/wiki\/(File:[^?#]+)/i), host = own.replace(/^https?:\/\/(www\.)?/i, '').split('/')[0];
      r = r || { coords: null };
      r.photo = m ? fileUrl(decodeURIComponent(m[1])) : own; r.cr = m || /wikimedia/.test(host) ? 'Wikimedia Commons' : host;
      return r;
    }
    if (!r || !r.photo) return r;
    var f = fileOfUrl(r.photo);
    var verdict = f ? getJ(CQ + 'titles=' + encodeURIComponent('File:' + f)).then(function (j) {
      var p = j.query && j.query.pages && j.query.pages[Object.keys(j.query.pages)[0]];
      if (p && SIDE_BAD.test(f + ' | ' + catsTxt(p))) return false;
      var th = p && p.imageinfo && p.imageinfo[0] && p.imageinfo[0].thumburl;
      return skyOf(th || r.photo).then(function (k) { return k == null || k >= 0.35; });
    }) : skyOf(r.photo).then(function (k) { return k == null || k >= 0.35; });
    return verdict.then(function (good) {
      if (good) return r;
      var bad = f;
      r.photo = null; r.cr = null;
      // kitas arenos kategorijos failas: pirmiausia su „exterior / facade …“ ženklais, ir būtinai su dangumi
      return catOf(r.qid).then(function (cat) {
        if (!cat) return r;
        return getJ(CQ + 'generator=categorymembers&gcmtype=file&gcmlimit=50&gcmtitle=' + encodeURIComponent('Category:' + cat)).then(function (j) {
          var ps = Object.keys((j.query && j.query.pages) || {}).map(function (k) { return j.query.pages[k]; }).filter(function (p) {
            var t = p.title.replace(/^File:/, '');
            return IN_IMG.test(t) && t !== bad && p.imageinfo && !SIDE_BAD.test(t + ' | ' + catsTxt(p));
          }).sort(function (a, b) { return SIDE_EXT.test(b.title + catsTxt(b)) - SIDE_EXT.test(a.title + catsTxt(a)); }).slice(0, 8);
          var step = function (k) {
            if (k >= ps.length) return Promise.resolve(r);
            return skyOf(ps[k].imageinfo[0].thumburl).then(function (sk) {
              if (sk != null && sk >= 0.5) { r.photo = fileUrl(ps[k].title); r.cr = 'Wikimedia Commons'; return r; }
              return step(k + 1);
            });
          };
          return step(0);
        });
      });
    });
  }

  // Interjero nuotrauka („Iš vidaus“): 1) lapo „Arenas“ stulpelis „Interior photo“ (nuoroda – visada laimi);
  // 2) arenos Wikimedia Commons kategorija (per Wikidata P373): poaplankis „Interior of …“, tada failai su rungtynių / žiūrovų
  // pavadinimais, tada rungtynių poaplankiai. Praleidžiami koncertai, kitos sporto šakos, išorės vaizdai ir pan.
  var IN_EX = /exterior|außen|aussen|extérieur|outside|facade|façade|fasad|aerial|from above|panoram|night|logo|\bmap\b|\bplan\b|construction|baustelle|statyb|\bsign|entrance|ticket|parking|pool|baseinas|swim|skating|hockey|concert|koncert|\btour\b|festival|expo\b|\bfair\b|balsas|eurovision|boxing|\bufc\b|wrestling|gymnastic|volley|handball|futsal|tennis|pentathlon|dance|church|street|\bbus\b|tram|judo|karate|fencing|athlet|darts|davis|padel|esport|wedding|outdoor|alrededores|surroundings|umgebung|parque|parke|tienda|shop|store|museo|alley|glory|museum|statue|memorial|monument|plaque|trophy|jersey|mural|jazz|music|muzik|opera|ballet|circus|cirque|conference|congress|exhibition/i;
  var IN_CAT = /interior|inside|innen|intérieur|interno|interieur|vidus|wnętrz|\biç\b/i;
  // varžybos (tikrai rungtynių nuotrauka) ir bendri krepšinio žodžiai (gali būti ir išorės nuotrauka, pvz. „… Valencia Basket.jpg“)
  var IN_COMP = /euroleague|eurolliga|euroliga|euroligue|eurocup|eurobasket|fiba|\blkl\b|\bacb\b|\bbbl\b|\blba\b|\bplk\b|\bbsl\b|\bnbl\b|\baba\b|playoff|pro a\b|betclic|liga endesa|copa del rey|supercopa|final four/i;
  var IN_BASK = /basket|kosárk|košark|krepš|koszyk|basquet|baloncesto|pallacanestro|koripallo|korvpall|basketbol/i;
  var IN_GAME = /\bvs\.?\b| v |match|game|final|derby|crowd|fans|public|supporter|aficion|tifosi|kibice|sirgal|hinchas|ultras|tribun|parquet|spiel|partido|partita|mecz|maç|rungtyn|innenansicht|league/i;
  var IN_GAMECAT = / - .+ - /;
  var IN_IMG = /\.(jpe?g|png|webp)$/i;
  var icache = {}, p373 = {};
  var fileUrl = function (f) { return 'https://commons.wikimedia.org/wiki/Special:FilePath/' + encodeURIComponent(String(f).replace(/^File:/, '')) + '?width=900'; };
  var fileKey = function (u) { try { u = decodeURIComponent(String(u || '')); } catch (x) { u = String(u || ''); } return u.split(/[\/:]/).pop().replace(/\?.*$/, '').replace(/^\d+px-/, '').replace(/ /g, '_').toLowerCase(); };
  function catOf(qid) {
    if (!qid) return Promise.resolve(null);
    if (qid in p373) return Promise.resolve(p373[qid]);
    return getJ('https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&origin=*&props=claims&ids=' + qid).then(function (w) {
      var en = w.entities && w.entities[qid], c = en && en.claims && en.claims.P373;
      return (p373[qid] = c ? c[0].mainsnak.datavalue.value : null);
    });
  }
  function interior(e, info, clubs) {
    var key = e.arena + '|' + e.city;
    if (icache[key]) return icache[key];
    var own = String(e.inner || '').trim();
    if (/^https?:\/\//i.test(own)) {
      var m = own.match(/commons\.wikimedia\.org\/wiki\/(File:[^?#]+)/i), host = own.replace(/^https?:\/\/(www\.)?/i, '').split('/')[0];
      return (icache[key] = Promise.resolve({ photo: m ? fileUrl(decodeURIComponent(m[1])) : own, cr: m || /wikimedia/.test(host) ? 'Wikimedia Commons' : host, own: true }));
    }
    var C = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&list=categorymembers&cmlimit=500&cmtitle=';
    var side = fileKey(info && info.photo), cityW = {};
    // miesto ir arenos pavadinimo žodžiai klubo žodžiais nelaikomi (pvz. „Žalgirio arena“)
    phWords(e.city + ' ' + e.arena + ' ' + (e.aka || '')).forEach(function (w) { cityW[w.slice(0, 5)] = 1; });
    // klubų žodžiai (pvz. „rytas“, „alba“, „zalgi“) – nuotraukos su jais tinka geriausiai
    var ctok = [];
    (clubs || []).forEach(function (c) { phWords(c).forEach(function (w) { var t = w.slice(0, 5); if (w.length >= 4 && !cityW[t] && !/^(bask|club|klub|kosa|krep|kosz|balo|pall|spor|bc$|kk$)/.test(w) && ctok.indexOf(t) < 0) ctok.push(t); }); });
    // vertinimas: krepšinis / klubas +2, varžybos +2, „interjeras“ +2, rungtynės / žiūrovai +1;
    // pavienė nuotrauka tinka tik su aiškiu ženklu, kad ji iš vidaus (interjeras, rungtynės, žiūrovai ar varžybos) –
    // vien klubo ar „basket“ žodis nepakanka (taip pasitaiko ir išorės nuotraukų)
    var inside = function (t) { return IN_CAT.test(t) || IN_GAME.test(t) || IN_COMP.test(t); };
    var rank = function (t) {
      if (IN_EX.test(t)) return -1;
      var W = phWords(t), r = 0;
      if (IN_BASK.test(t) || ctok.some(function (x) { return W.some(function (w) { return w.indexOf(x) === 0; }); })) r += 2;
      if (IN_COMP.test(t)) r += 2;
      if (IN_CAT.test(t)) r += 2;
      if (IN_GAME.test(t)) r += 1;
      return r;
    };
    var pickFile = function (titles, minRank) {
      var b = null, br = minRank - 1;
      titles.forEach(function (t) {
        if (!/^File:/.test(t) || !IN_IMG.test(t) || fileKey(t) === side) return;
        if (minRank > 0 && !inside(t)) return;
        var r = rank(t); if (r > br) { b = t; br = r; }
      });
      return b;
    };
    var filesIn = function (cat) { return getJ(C + encodeURIComponent(cat) + '&cmtype=file').then(function (j) { return ((j.query && j.query.categorymembers) || []).map(function (x) { return x.title; }); }); };
    icache[key] = catOf(info && info.qid).then(function (cat) {
      if (!cat) return null;
      return getJ(C + encodeURIComponent('Category:' + cat) + '&cmtype=file|subcat').then(function (j) {
        var all = ((j.query && j.query.categorymembers) || []).map(function (x) { return x.title; });
        var subs = all.filter(function (t) { return /^Category:/.test(t) && rank(t) >= 0; });
        var inSub = subs.filter(function (t) { return IN_CAT.test(t); })[0];
        // rungtynių poaplankiai: pirmiausia su klubo / krepšinio žodžiais
        var gameSubs = subs.filter(function (t) { return t !== inSub && (rank(t) >= 1 || IN_GAMECAT.test(t)); })
          .sort(function (a, b) { return rank(b) - rank(a); });
        var order = [];
        if (inSub) order.push([inSub, 0]);
        order.push([all, 1]);
        if (gameSubs[0]) order.push([gameSubs[0], 0]);
        var step = function (k) {   // eilės tvarka bandomi šaltiniai, kol randamas tinkamas failas
          if (k >= order.length) return Promise.resolve(null);
          var src = order[k][0], minR = order[k][1];
          var p = typeof src === 'string' ? filesIn(src).then(function (fs) { return pickFile(fs, minR); }) : Promise.resolve(pickFile(src, minR));
          return p.then(function (f) { return f || step(k + 1); });
        };
        return step(0).then(function (f) { return f ? { photo: fileUrl(f), cr: 'Wikimedia Commons' } : null; });
      });
    }).catch(function () { return null; });
    return icache[key];
  }

  function css() {
    if (document.getElementById('am-css')) return;
    var s = document.createElement('style'); s.id = 'am-css';
    s.textContent = [
      '.am-wrap{position:relative;height:clamp(500px,76vh,760px);margin-top:14px;border-radius:18px;overflow:hidden;border:1px solid var(--line);background:radial-gradient(120% 90% at 50% 0%,color-mix(in srgb,var(--card) 70%,var(--bg)),var(--bg));box-shadow:var(--sh);touch-action:none;-webkit-user-select:none;user-select:none}',
      '.am-load{padding:60px 0;text-align:center;color:var(--mute)}',
      '.am-svg{position:absolute;inset:0;width:100%;height:100%}',
      '.am-land{fill:color-mix(in srgb,var(--card) 84%,var(--ink) 5%);stroke:color-mix(in srgb,var(--ink) 34%,transparent);stroke-width:1.1;stroke-linejoin:round;vector-effect:non-scaling-stroke}',
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
      '.am-pin.up .lb{top:auto;bottom:100%;transform:translate(-50%,-4px)}',
      '.am-ui{position:absolute;left:12px;top:12px;display:flex;flex-direction:column;gap:8px;z-index:5;align-items:flex-start}',
      '.am-search{width:min(230px,56vw);padding:9px 14px;border-radius:99px;border:1px solid var(--line);background:color-mix(in srgb,var(--card) 90%,transparent);color:var(--ink);font:inherit;font-size:14px;-webkit-user-select:text;user-select:text}',
      '.am-zoom{display:flex;flex-direction:column;border:1px solid var(--line);border-radius:12px;overflow:hidden;background:var(--card)}',
      '.am-zoom button{width:36px;height:36px;border:0;border-bottom:1px solid var(--line);background:none;color:var(--ink);font-size:18px;cursor:pointer}',
      '.am-zoom button:last-child{border-bottom:0}.am-zoom button:hover{background:var(--line)}',
      '.am-hint{position:absolute;left:50%;bottom:12px;transform:translateX(-50%);padding:6px 14px;border-radius:99px;background:color-mix(in srgb,var(--card) 88%,transparent);border:1px solid var(--line);color:var(--mute);font-size:12px;pointer-events:none;transition:opacity .6s;z-index:4;white-space:nowrap;max-width:92%;overflow:hidden;text-overflow:ellipsis}',
      '.am-hint.hide{opacity:0}',
      '.am-card{position:absolute;z-index:6;right:12px;top:12px;bottom:12px;width:min(360px,calc(100% - 24px));display:flex;flex-direction:column;border-radius:16px;background:var(--card);border:1px solid var(--line);box-shadow:0 18px 50px rgba(0,0,0,.5);overflow:hidden;transform:translateX(24px);opacity:0;transition:transform .45s cubic-bezier(.2,.8,.2,1),opacity .35s;cursor:default;-webkit-user-select:text;user-select:text}',
      '.am-card.on{transform:none;opacity:1}',
      '.am-card[hidden]{display:none}.am-card:not(.on){pointer-events:none}',
      '.am-head p.cap{margin-top:2px}',
      '.am-ui{pointer-events:none}.am-ui>*{pointer-events:auto}',
      /* paieškos pasiūlymai su logotipais (klubas arba miestas) */
      '.am-sbox{position:relative}',
      '.am-sug{position:absolute;left:0;top:calc(100% + 6px);width:max(100%,280px);max-width:calc(100vw - 48px);max-height:min(340px,52vh);overflow:auto;overscroll-behavior:contain;touch-action:pan-y;background:var(--card);border:1px solid var(--line);border-radius:14px;box-shadow:0 14px 34px rgba(0,0,0,.5);padding:4px;z-index:7}',
      '.am-sug[hidden]{display:none}',
      '.am-sug button{display:flex;align-items:center;gap:10px;width:100%;padding:8px 10px;border:0;border-radius:10px;background:none;color:var(--ink);text-align:left;font:inherit;font-size:14px;cursor:pointer}',
      '.am-sug button.on,.am-sug button:hover{background:color-mix(in srgb,var(--line) 80%,transparent)}',
      '.am-sug .sl{flex:none;display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:#fff;overflow:hidden}',
      '.am-sug .sl img{width:80%;height:80%;object-fit:contain}.am-sug .sl b{font:700 10px var(--hd,sans-serif);color:#111}',
      '.am-sug .st{min-width:0;flex:1}.am-sug .st b{display:block;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '.am-sug .st small{display:block;color:var(--mute);font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '.am-sug mark{background:none;color:var(--a);font-weight:700}',
      '.am-sug .none{padding:10px 12px;color:var(--mute);font-size:13px}',
      '@media(hover:none){.am-sug button{padding:12px 10px;font-size:15px;min-height:52px}.am-sug .sl{width:36px;height:36px}}',
      /* miestų pavadinimai (tik PC; iš lapo „Arenas“ stulpelio City) */
      '.am-cities{position:absolute;inset:0;pointer-events:none}',
      '.am-city{position:absolute;left:0;top:0;white-space:nowrap;font:600 10.5px var(--mono,monospace);letter-spacing:.12em;text-transform:uppercase;color:var(--mute);text-shadow:0 0 4px var(--bg),0 0 8px var(--bg);transition:opacity .25s;will-change:transform}',
      '.am-city.off{opacity:0}',
      '.am-cl{transition:opacity .35s}',
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
      '.am-media .inner{opacity:0;transform:scale(1.12)}',
      '.am-media.has-inner[data-v="inner"] .inner{opacity:1;transform:none}',
      '.am-media[data-v="inner"] .photo,.am-media[data-v="inner"] .sat{opacity:0}',
      '.am-sw button[hidden]{display:none}',
      '@media(max-width:600px){.am-sw button:not(.on) .t{display:none}.am-sw{right:10px;flex-wrap:wrap}}',
      '.am-miss .am-scan{margin:6px 0 0;padding:4px 10px;border-radius:99px;border:1px solid var(--line);background:var(--card);color:var(--ink);font:inherit;font-size:12px;cursor:pointer}',
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
    var sid = deps.sheetId || (typeof SHEET_ID !== 'undefined' ? SHEET_ID : SHEET_FALLBACK);
    var sheetP = loadSheet(sid).catch(function (e) { console.warn('Arenas lapas neatsisiuntė – naudojamas atsarginis sąrašas:', e && e.message); return null; });
    Promise.all([ensureLibs(), sheetP]).then(function (r) { if (el.isConnected) build(r[0], r[1]); }).catch(function () {
      el.innerHTML = '<div class="am-load">' + esc(T('Nepavyko įkelti žemėlapio. Patikrinkite ryšį.', 'Could not load the map. Check your connection.')) + '</div>';
    });

    function build(topo, sheet) {
      var d3 = window.d3, topojson = window.topojson;
      var LT2EN_ = typeof LT2EN !== 'undefined' ? LT2EN : {}, NAT_ = typeof NAT !== 'undefined' ? NAT : {};
      var enName = function (n) { var e = LT2EN_[n] || n; return NAMEFIX[e] || e; };
      // --- klubai ---
      var bud26 = D.bud.filter(function (r) { return r.season === season && r.club; });
      var findBud = function (n) { var k = N(n); return bud26.filter(function (r) { return N(r.club) === k; })[0] || bud26.filter(function (r) { return same(r.club, n); })[0]; };
      var findAtt = function (n) {
        return (D.att || []).filter(function (r) { return r.season === season && r.avg != null && same(r.club, n); })[0];
      };
      var seen = {}, items = [], missing = [], noCoord = [];
      var add = function (name, e) {
        var k = N(name); if (!k || seen[k]) return; seen[k] = 1;
        var b = findBud(name), a = findAtt(name), oldA = b ? null : (D.att || []).filter(function (r) { return same(r.club, name); })[0];
        var nation = b ? b.nation : a ? (a.country || a.nation) : oldA ? (oldA.country || oldA.nation) : '';
        items.push({ name: b ? b.club : name, nation: nation, e: e, total: b && b.total != null ? +b.total : 0, bud: b || null, att: a || null, hasCard: !!(b || a || oldA),
          logo: deps.logo ? (deps.logo(b ? b.club : name) || deps.logo(name)) : null });
      };
      if (sheet && sheet.length) {
        // 1) „Main arena override“ (laimi), 2) „Main arena for“
        var pickRow = {};
        sheet.forEach(function (r) { r.main.forEach(function (c) { if (!pickRow[N(c)]) pickRow[N(c)] = { name: c, row: r }; }); });
        sheet.forEach(function (r) { r.over.forEach(function (c) { pickRow[N(c)] = { name: c, row: r }; }); });
        Object.keys(pickRow).forEach(function (k) {
          var p = pickRow[k], r = p.row;
          if (!r.ok) { noCoord.push(p.name + ' – ' + r.arena); return; }
          add(p.name, { arena: r.arena, city: r.city, lat: r.lat, lon: r.lon, ok: true, cap: r.cap, league: r.league, aka: r.aka, inner: r.inner, side: r.side });
        });
        bud26.forEach(function (r) {
          if (r.nation === 'Japonija' || r.nation === 'Japan') return;
          if (!items.some(function (i) { return same(i.name, r.club); })) missing.push(r.club);
        });
      } else {
        bud26.forEach(function (r) {
          var e = findArena(r.club, N);
          if (!e) { missing.push(r.club); return; }
          add(r.club, e);
        });
      }
      items.sort(function (a, b) { return b.total - a.total; });
      var maxT = Math.max.apply(null, items.map(function (i) { return i.total; }).concat([1]));
      items.forEach(function (it) { it.s = Math.round(28 + 18 * Math.sqrt(it.total / maxT)); });
      var GAP = 10, ZMAX = 64;
      // Ta pati arena ARBA arenos taip arti, kad burbulai persidengtų net maksimaliai priartinus (pvz. Aris ir Iraklis
      // Salonikuose ~600 m): tokie klubai sujungiami į vieną grupę ir rodomi greta (iš vakarų į rytus) su tarpeliu,
      // kas antro klubo pavadinimas – virš burbulo. Kitaip mažesnio biudžeto klubas niekada nepasirodytų.
      function regroup() {
        var n = items.length, par = items.map(function (_, i) { return i; });
        var root = function (i) { while (par[i] !== i) { par[i] = par[par[i]]; i = par[i]; } return i; };
        for (var i = 0; i < n; i++) for (var j = i + 1; j < n; j++) {
          var a = items[i], b = items[j], dx = (a.p0[0] - b.p0[0]) * ZMAX, dy = (a.p0[1] - b.p0[1]) * ZMAX;
          if (dx * dx + dy * dy < Math.pow((a.s + b.s) / 2 + GAP, 2)) { var ra = root(i), rb = root(j); if (ra !== rb) par[rb] = ra; }
        }
        var groups = {};
        items.forEach(function (it, i) { var r = root(i); (groups[r] = groups[r] || []).push(it); it.g = 'g' + r; });
        Object.keys(groups).forEach(function (k) {
          var gr = groups[k].sort(function (a, b) { return a.p0[0] - b.p0[0] || b.total - a.total; });
          var cx = gr.reduce(function (t, i) { return t + i.p0[0]; }, 0) / gr.length, cy = gr.reduce(function (t, i) { return t + i.p0[1]; }, 0) / gr.length;
          var tot = gr.reduce(function (t, i) { return t + i.s; }, 0) + GAP * (gr.length - 1), x = -tot / 2;
          gr.forEach(function (it, i) {
            it.p = gr.length > 1 ? [cx, cy] : it.p0; it.gi = i; it.gn = gr.length;
            it.off = gr.length > 1 ? x + it.s / 2 : 0; x += it.s + GAP; it.up = gr.length > 1 && i % 2 === 1;
          });
        });
      }
      // žemėlapio ribos: Europa + visi klubai (pvz. Australija)
      var bx = [-30, 18, 70, 72];
      items.forEach(function (it) { bx[0] = Math.min(bx[0], it.e.lon - 8); bx[1] = Math.min(bx[1], it.e.lat - 8); bx[2] = Math.max(bx[2], it.e.lon + 8); bx[3] = Math.max(bx[3], it.e.lat + 8); });
      bx[0] = Math.max(bx[0], -180); bx[2] = Math.min(bx[2], 180); bx[1] = Math.max(bx[1], -60); bx[3] = Math.min(bx[3], 78);

      // --- DOM ---
      var wrap = document.createElement('div'); wrap.className = 'am-wrap';
      wrap.innerHTML = '<svg class="am-svg"><g class="am-g"><path class="am-grat"></path><g class="am-lands"></g><g class="am-labs"></g></g></svg><div class="am-cities"></div><div class="am-pins"></div>' +
        '<div class="am-ui"><div class="am-sbox"><input class="am-search" type="search" autocomplete="off" spellcheck="false" placeholder="' + esc(T('Ieškoti klubo ar miesto…', 'Find a club or city…')) + '" aria-label="' + esc(T('Ieškoti klubo ar miesto', 'Find a club or city')) + '" role="combobox" aria-expanded="false" aria-autocomplete="list">' +
        '<div class="am-sug" role="listbox" hidden></div></div>' +
        '<div class="am-zoom"><button type="button" data-z="in" aria-label="+">+</button><button type="button" data-z="out" aria-label="−">−</button><button type="button" data-z="home" aria-label="' + esc(T('Visi klubai', 'All clubs')) + '">⌂</button></div></div>' +
        '<div class="am-hint">' + esc(T('Burbulo dydis – 26/27 biudžetas · artinkite, kad atsirastų daugiau klubų', 'Bubble size – 26/27 budget · zoom in to reveal more clubs')) + '</div>' +
        '<aside class="am-card" hidden></aside>';
      el.innerHTML = ''; el.appendChild(wrap);
      if (missing.length) {
        var det = document.createElement('details'); det.className = 'am-miss';
        det.innerHTML = '<summary>' + esc(T('26/27 klubai be pagrindinės arenos lape „Arenas“', '26/27 clubs without a main arena in the Arenas sheet')) + ' (' + missing.length + ')</summary><p>' + missing.map(esc).join(', ') + '</p>';
        el.appendChild(det);
      }
      if (noCoord.length) {
        var dc = document.createElement('details'); dc.className = 'am-miss';
        dc.innerHTML = '<summary>' + esc(T('Arenos be koordinačių lape „Arenas“', 'Arenas without coordinates in the Arenas sheet')) + ' (' + noCoord.length + ')</summary><p>' + noCoord.map(esc).join(', ') + '</p>';
        el.appendChild(dc);
      }
      (function () {
        var seenA = {}, arenas = [];
        items.forEach(function (it) {
          var k = it.e.arena + '|' + it.e.city;
          if (!seenA[k]) { seenA[k] = { e: it.e, clubs: [], tot: 0 }; arenas.push(seenA[k]); }
          seenA[k].clubs.push(it.name); seenA[k].tot = Math.max(seenA[k].tot, it.total || 0);
        });
        var LS = 'am-inner-miss-v1', cached = null;
        try { cached = JSON.parse(localStorage.getItem(LS) || 'null'); } catch (x) { cached = null; }
        if (cached && (Date.now() - cached.t > 7 * 864e5)) cached = null;
        var di = document.createElement('details'); di.className = 'am-miss';
        var label = function (n) { return esc(T('Arenos be interjero nuotraukos', 'Arenas without an interior photo')) + (n == null ? ' (' + esc(T('spauskite, kad patikrintų', 'click to check')) + ')' : ' (' + n + ')'); };
        var line = function (a) { return esc(a.e.arena) + ' – ' + esc(a.clubs.join(', ')); };
        function show(list) {
          // nuoroda lape „Interior photo“ visada tinka – tokios arenos iš sąrašo išimamos iškart
          var miss = arenas.filter(function (a) { return list.indexOf(a.e.arena + '|' + a.e.city) >= 0 && !/^https?:/i.test(a.e.inner || ''); })
            .sort(function (a, b) { return b.tot - a.tot; });   // didžiausių biudžetų klubai – pirmi
          di.querySelector('summary').innerHTML = label(miss.length);
          di.querySelector('p').innerHTML = (miss.length ? miss.map(line).join('<br>') : esc(T('Visos arenos turi interjero nuotrauką.', 'All arenas have an interior photo.'))) +
            '<br><small>' + esc(T('Įrašykite nuotraukos nuorodą lapo „Arenas“ stulpelyje „Interior photo“.', 'Add a photo link in the "Interior photo" column of the Arenas sheet.')) + '</small>' +
            '<br><button type="button" class="am-scan">' + esc(T('Tikrinti iš naujo', 'Check again')) + '</button>';
        }
        function scan() {
          var p = di.querySelector('p'), miss = [], i = 0, done = 0;
          p.textContent = T('Tikrinama…', 'Checking…');
          function next() {
            if (i >= arenas.length) return Promise.resolve();
            var a = arenas[i++];
            return (/^https?:/i.test(a.e.inner || '') ? Promise.resolve({}) : wiki(a.e).then(function (info) { return interior(a.e, info, a.clubs); }))
              .then(function (r) {
                if (!r) miss.push(a.e.arena + '|' + a.e.city);
                done++; p.textContent = T('Tikrinama ', 'Checking ') + done + ' / ' + arenas.length + '…';
                return new Promise(function (res) { setTimeout(res, 120); });
              }).then(next);
          }
          Promise.all([next(), next(), next()]).then(function () {
            try { localStorage.setItem(LS, JSON.stringify({ t: Date.now(), list: miss })); } catch (x) {}
            show(miss);
          });
        }
        di.innerHTML = '<summary>' + label(null) + '</summary><p></p>';
        if (cached) show(cached.list);
        di.addEventListener('toggle', function () { if (di.open && !di.dataset.go && !cached) { di.dataset.go = 1; scan(); } });
        di.addEventListener('click', function (ev) { if (ev.target.closest && ev.target.closest('.am-scan')) { cached = null; scan(); } });
        el.appendChild(di);

      })();
      var note = document.createElement('p'); note.className = 'sum';
      note.style.cssText = 'font-size:13px;margin-top:8px';
      note.textContent = items.length + ' ' + T('klubų žemėlapyje', 'clubs on the map') + ' · ' + T('sezonas', 'season') + ' ' + season;
      el.appendChild(note);

      var W = function () { return wrap.clientWidth || 800; }, H = function () { return wrap.clientHeight || 520; };
      var svg = d3.select(wrap.querySelector('.am-svg')), g = svg.select('.am-g');
      var features = topojson.feature(topo, topo.objects.countries).features.filter(function (f) {
        if (f.properties.name === 'Russia') return true;
        var b = d3.geoBounds(f); return b[1][0] > bx[0] - 5 && b[0][0] < bx[2] + 5 && b[1][1] > bx[1] - 8 && b[0][1] < bx[3] + 3;
      });
      var nations = {}; items.forEach(function (i) { if (i.nation) nations[enName(i.nation)] = 1; });
      var unfix = { Czechia: 'Czech Republic', 'Bosnia and Herz.': 'Bosnia and Herzegovina', Macedonia: 'North Macedonia' };
      var labName = function (n) { var e = unfix[n] || n; return T(NAT_[e] || e, e); };
      var proj, path, ext, kMin = 1, cT = d3.zoomIdentity, sel = null, raf = 0, mtoken = 0, openedAt = 0;
      var labels = features.filter(function (f) { return nations[f.properties.name]; }).map(function (f) { var m = mainCentroid(d3, f); return { f: f, c: m.c, poly: m.poly, n: f.properties.name }; });

      var lands = g.select('.am-lands').selectAll('path').data(features).join('path').attr('class', function (f) { return 'am-land' + (nations[f.properties.name] ? ' has' : ''); });
      var labSel = g.select('.am-labs').selectAll('text').data(labels).join('text').attr('class', 'am-cl').text(function (d) { return labName(d.n); });

      // miestai (tik PC): kiekvienas lapo „Arenas“ miestas su klubu žemėlapyje; rodomi priartinus, niekada neuždengia burbulų ir pavadinimų
      var cityLabel = function (c) { return c; };   // miestai rodomi taip, kaip įrašyti lapo „Arenas“ stulpelyje „City“ (vertimai naudojami tik paieškai)
      var pcMQ = window.matchMedia ? matchMedia('(hover: hover) and (pointer: fine) and (min-width: 721px)') : null;
      var isPC = function () { return !!(pcMQ && pcMQ.matches); };
      var cityMap = {};
      items.forEach(function (it) {
        var c = String(it.e.city || '').trim(); if (!c) return;
        var k = N(c); (cityMap[k] = cityMap[k] || { name: c, lat: 0, lon: 0, n: 0, its: [] });
        cityMap[k].lat += it.e.lat; cityMap[k].lon += it.e.lon; cityMap[k].n++; cityMap[k].its.push(it);
      });
      var cities = Object.keys(cityMap).map(function (k) { var c = cityMap[k]; c.lat /= c.n; c.lon /= c.n; return c; })
        .sort(function (a, b) { return b.n - a.n || b.its.reduce(function (t, i) { return t + i.total; }, 0) - a.its.reduce(function (t, i) { return t + i.total; }, 0); });
      var citiesEl = wrap.querySelector('.am-cities');
      cities.forEach(function (c) { var d = document.createElement('div'), nm = cityLabel(c.name); d.className = 'am-city off'; d.textContent = nm; citiesEl.appendChild(d); c.el = d; c.w = nm.length * 8 + 6; });
      function layoutCities() {
        var show = isPC() && cT.k >= 3, w = W(), h = H(), boxes = [];
        if (show) {
          items.forEach(function (it) {
            if (!it.on) return;
            boxes.push([it.sx - it.s / 2, it.sy - it.s / 2, it.sx + it.s / 2, it.sy + it.s / 2]);
            if (cT.k >= 6) { var lw = it.name.length * 3.1 + 4, ly = it.up ? it.sy - it.s / 2 - 18 : it.sy + it.s / 2 + 2; boxes.push([it.sx - lw, ly, it.sx + lw, ly + 16]); }
          });
          labels.forEach(function (l) { if (cT.k < 6 && l.w * cT.k > l.len * 8.5) { var lx = cT.k * l.x + cT.x, ly = cT.k * l.y + cT.y, lw = l.len * 8.3 / 2; boxes.push([lx - lw, ly - 11, lx + lw, ly + 4]); } });
        }
        cities.forEach(function (c) {
          var on = false;
          if (show && c.p) {
            var x = cT.k * c.p[0] + cT.x, top = Infinity;
            c.its.forEach(function (it) { if (it.on) top = Math.min(top, it.sy - it.s / 2 - (it.up && cT.k >= 6 ? 18 : 0)); });
            var y = (top === Infinity ? cT.k * c.p[1] + cT.y : top) - 16;
            var bb = [x - c.w / 2, y - 7, x + c.w / 2, y + 7];
            on = bb[2] > 0 && bb[0] < w && bb[3] > 0 && bb[1] < h && !boxes.some(function (o) { return bb[0] < o[2] && bb[2] > o[0] && bb[1] < o[3] && bb[3] > o[1]; });
            if (on) { boxes.push(bb); c.el.style.transform = 'translate(' + (x - c.w / 2).toFixed(1) + 'px,' + (y - 7).toFixed(1) + 'px)'; }
          }
          c.el.classList.toggle('off', !on);
        });
      }

      function project() {
        var w = W(), h = H();
        proj = d3.geoMercator().fitExtent([[12, 12], [w - 12, h - 12]], { type: 'MultiPoint', coordinates: [[-11, 31], [40, 31], [40, 62], [-11, 62]] });
        path = d3.geoPath(proj);
        var a = proj([bx[0], bx[3]]), b = proj([bx[2], bx[1]]); ext = [[Math.min(a[0], 0), Math.min(a[1], 0)], [Math.max(b[0], w), Math.max(b[1], h)]];
        kMin = Math.min(1, w / (ext[1][0] - ext[0][0]), h / (ext[1][1] - ext[0][1]));
        g.select('.am-grat').datum(d3.geoGraticule10()).attr('d', path);
        lands.attr('d', path);
        labels.forEach(function (l) { var p = proj(l.c), bb = path.bounds(l.poly); l.x = p[0]; l.y = p[1]; l.w = bb[1][0] - bb[0][0]; l.len = labName(l.n).length; });
        items.forEach(function (it) { it.p0 = proj([it.e.lon, it.e.lat]); });
        cities.forEach(function (c) { c.p = proj([c.lon, c.lat]); });
        regroup();
      }
      project();

      // --- piniai ---
      var pinsEl = wrap.querySelector('.am-pins');
      items.forEach(function (it) {
        var b = document.createElement('button'); b.type = 'button'; b.className = 'am-pin' + (it.up ? ' up' : ''); b.title = it.name; b.setAttribute('aria-label', it.name);
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
          it.el.classList.toggle('off', !it.on); it.el.classList.toggle('up', !!it.up);
          if (it.vis) it.el.style.transform = 'translate(' + it.sx.toFixed(1) + 'px,' + it.sy.toFixed(1) + 'px)';
        });
        wrap.classList.toggle('am-lab', cT.k >= 6);
        labSel.attr('transform', function (d) { return 'translate(' + d.x + ',' + d.y + ')'; })
          .style('font-size', (11 / cT.k) + 'px').style('stroke-width', (3 / cT.k) + 'px')
          .style('display', function (d) { return d.w * cT.k > d.len * 8.5 ? null : 'none'; })
          .style('opacity', isPC() && cT.k >= 6 ? 0 : null);   // PC: miestų lygyje šalių pavadinimai išblunka
        layoutCities();
      }
      function apply(t) {
        cT = t; g.attr('transform', t.toString());
        if (!raf) raf = requestAnimationFrame(layout);
        wrap.querySelector('.am-hint').classList.add('hide');
      }

      var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
      var zoom = d3.zoom().scaleExtent([kMin, ZMAX])
        .extent(function () { return [[0, 0], [W(), H()]]; })
        .translateExtent(ext)
        .filter(function (ev) { return !(ev.target.closest && ev.target.closest('.am-card,.am-ui')) && (!ev.ctrlKey || ev.type === 'wheel') && !ev.button; })
        .on('zoom', function (ev) { apply(ev.transform); });
      var wsel = d3.select(wrap);
      wsel.call(zoom);
      function setExt() { zoom.translateExtent(ext).scaleExtent([kMin, ZMAX]); }
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
        var e = it.e, bud = it.bud, att = it.att;
        var attTxt = att ? Math.round(att.avg).toLocaleString('lt-LT') + (att.fill != null ? ' · ' + Math.round(att.fill * 100) + '%' : '') : '—';
        var capTxt = e.cap ? '<p class="cap">' + esc(T('Talpa', 'Capacity')) + ': ' + Math.round(e.cap).toLocaleString('lt-LT') + '</p>' : '';
        card.hidden = false;
        card.innerHTML =
          '<button type="button" class="am-x" aria-label="' + esc(T('Uždaryti', 'Close')) + '">×</button>' +
          '<div class="am-media" data-v="sat"><div class="l sat"></div><div class="l photo"></div><div class="l inner"></div>' +
          '<div class="am-none">' + esc(e.arena) + ' · ' + esc(cityLabel(e.city)) + '</div>' +
          '<div class="am-sw" hidden><button type="button" data-v="sat" title="' + esc(T('Iš viršaus', 'Top')) + '">🛰<span class="t"> ' + esc(T('Iš viršaus', 'Top')) + '</span></button><button type="button" data-v="photo" hidden title="' + esc(T('Iš šono', 'Side')) + '">📷<span class="t"> ' + esc(T('Iš šono', 'Side')) + '</span></button><button type="button" data-v="inner" hidden title="' + esc(T('Iš vidaus', 'Interior')) + '">🏟<span class="t"> ' + esc(T('Iš vidaus', 'Interior')) + '</span></button></div>' +
          '<small class="am-cr"></small></div>' +
          '<div class="am-body"><div class="am-head">' + (it.logo ? '<img src="' + esc(it.logo) + '" alt="">' : '') +
          '<div><h3>' + esc(it.name) + '</h3><p>' + esc(e.arena) + ' · ' + esc(cityLabel(e.city)) + '</p>' + capTxt + '</div></div>' +
          '<div class="am-kpis"><div><small>' + esc(T('Biudžetas', 'Budget')) + ' ' + season + '</small><b>' + (bud && bud.total != null ? fmtM(bud.total) : '—') + '</b></div>' +
          '<div><small>' + esc(T('Vid. lankomumas', 'Avg. attendance')) + ' ' + season + '</small><b>' + attTxt + '</b></div></div>' +
          '<div class="am-act">' +
          (it.hasCard ? '<button type="button" class="am-pri" data-a="card">' + esc(T('Atidaryti klubo kortelę', 'Open club card')) + '</button>' : '') +
          '<a class="am-sv" target="_blank" rel="noopener" href="https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=' + e.lat + ',' + e.lon + '">' + esc(T('Gatvės vaizdas ↗', 'Street View ↗')) + '</a>' +
          '</div></div>';
        requestAnimationFrame(function () { card.classList.add('on'); });
        openedAt = performance.now();
        loadMedia(it);
      }
      function loadMedia(it) {
        var my = ++mtoken, box = card.querySelector('.am-media'), e = it.e;
        var L = { sat: box.querySelector('.sat'), photo: box.querySelector('.photo'), inner: box.querySelector('.inner') };
        var CLS = { sat: 'has-sat', photo: 'has-photo', inner: 'has-inner' };
        var cr = { sat: '', photo: '', inner: '' }, have = { sat: false, photo: false, inner: false };
        var ORDER = ['photo', 'inner', 'sat'];   // automatinis keitimas kas 5 s: iš šono → vidus → iš viršaus
        var sw = box.querySelector('.am-sw'), timer = 0, manual = false;
        function refresh() {
          var n = 0;
          ORDER.forEach(function (v) { sw.querySelector('[data-v="' + v + '"]').hidden = !have[v]; if (have[v]) n++; });
          sw.hidden = n < 2;
          if (n >= 2 && !timer && !manual) timer = setInterval(function () {
            if (my !== mtoken) { clearInterval(timer); return; }
            var k = ORDER.indexOf(box.dataset.v);
            for (var s = 1; s <= ORDER.length; s++) { var v = ORDER[(k + s) % ORDER.length]; if (have[v]) { setView(v); break; } }
          }, 5000);
        }
        function put(v, url, credit) {
          return preload(url).then(function (ok) {
            if (!ok || my !== mtoken) return;
            L[v].style.backgroundImage = 'url("' + url + '")'; box.classList.add(CLS[v]); have[v] = true; cr[v] = credit;
            if (box.classList.contains('done')) { box.classList.remove('nomedia'); if (!ORDER.some(function (x) { return x !== v && have[x]; })) setView(v); refresh(); }
          });
        }
        wiki(e).then(function (info) {
          if (my !== mtoken) return;
          var c = e.ok ? [e.lat, e.lon] : (info && info.coords ? info.coords : null);
          var sUrl = c ? roofImg(c) : null, pUrl = info && info.photo;
          var ps = sUrl ? preload(sUrl).then(function (ok) { if (ok && my === mtoken) { L.sat.style.backgroundImage = 'url("' + sUrl + '")'; box.classList.add('has-sat'); have.sat = true; } }) : Promise.resolve();
          var pp = pUrl ? preload(pUrl).then(function (ok) { if (ok && my === mtoken) { L.photo.style.backgroundImage = 'url("' + pUrl + '")'; box.classList.add('has-photo'); have.photo = true; cr.photo = T('Foto: ', 'Photo: ') + (info.cr || 'Wikipedia'); } }) : Promise.resolve();
          // interjeras kraunamas lygiagrečiai ir atsiranda kaip mygtukas, kai tik randamas
          interior(e, info, items.filter(function (o) { return o.e.arena === e.arena && o.e.city === e.city; }).map(function (o) { return o.name; })).then(function (r) {
            if (r && my === mtoken) put('inner', r.photo, T('Foto: ', 'Photo: ') + r.cr);
          });
          return Promise.all([ps, pp]).then(function () {
            if (my !== mtoken) return;
            box.classList.add('done');
            var first = ORDER.filter(function (v) { return have[v]; });
            if (!first.length) { box.classList.add('nomedia'); return; }
            if (have.sat && first[0] !== 'sat') {
              // pirmiausia trumpai – vaizdas iš viršaus, tada pirmas iš eilės (dažniausiai „iš šono“)
              setView('sat');
              var wait = Math.max(0, 1800 - (performance.now() - openedAt));
              setTimeout(function () { if (my === mtoken && box.dataset.v === 'sat' && !manual) setView(ORDER.filter(function (v) { return have[v]; })[0]); }, reduced ? 0 : wait);
            } else setView(first[0]);
            refresh();
          });
        });
        function setView(v) {
          box.dataset.v = v;
          box.querySelector('.am-cr').textContent = cr[v] || '';
          [].forEach.call(box.querySelectorAll('.am-sw button'), function (b) { b.classList.toggle('on', b.dataset.v === v); });
        }
        // paspaudus mygtuką automatinis keitimas sustoja (rodomas pasirinktas vaizdas)
        box.addEventListener('click', function (ev) {
          var b = ev.target.closest && ev.target.closest('.am-sw button'); if (!b) return;
          manual = true; clearInterval(timer); timer = 0; setView(b.dataset.v);
        });
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
        // kortelė atidaroma visada: su 26/27 biudžetu – Biudžetai; be jo, bet su 26/27 lankomumu – Lankomumas;
        // be abiejų – naujausias sezonas, kuriam kortelėje yra duomenų
        if (b && sel && typeof deps.club === 'function') deps.club(sel.name, sel.nation, season, 0, !sel.bud && sel.att ? 'att' : undefined);
      });
      wrap.querySelector('.am-zoom').addEventListener('click', function (ev) {
        var b = ev.target.closest('button'); if (!b) return;
        var tr = wsel.transition().duration(reduced ? 0 : 450);
        if (b.dataset.z === 'in') tr.call(zoom.scaleBy, 1.8);
        else if (b.dataset.z === 'out') tr.call(zoom.scaleBy, 1 / 1.8);
        else { closeCard(); wsel.transition().duration(reduced ? 0 : 900).ease(d3.easeCubicInOut).call(zoom.transform, d3.zoomIdentity); }
      });
      // paieška: klubo pavadinimas arba miestas (ne arenos); sąrašas su logotipais, rodyklės + Enter (PC), dideli eilučių plotai telefone
      var search = wrap.querySelector('.am-search'), sug = wrap.querySelector('.am-sug'), sugIt = [], sugAt = -1;
      var tok = function (v) { return String(v || '').toLowerCase().replace(/ł/g, 'l').replace(/đ/g, 'd').replace(/ø/g, 'o').replace(/ı/g, 'i').replace(/ß/g, 'ss').normalize('NFD').replace(/[\u0300-\u036f]/g, '').split(/[^a-z0-9]+/).filter(Boolean); };
      // miestas randamas vietiniu, angliškuoju ir lietuviškuoju pavadinimu, priemiesčiai – ir pagal didmiestį
      items.forEach(function (it) { var c = tok(it.e.city), k = c.join('_'), v = CITY_I18N[k]; it.tn = tok(it.name); it.tc = c.concat(v ? tok(v[0] + ' ' + v[1]) : [], tok(CITY_NEAR[k] || '')); });
      var hasAll = function (Wd, q) { return q.every(function (x) { return Wd.some(function (w) { return w.indexOf(x) === 0; }); }); };
      function mark(text, q) {
        return esc(text).split(/(\s+)/).map(function (w) { var t = tok(w)[0]; return t && q.some(function (x) { return t.indexOf(x) === 0; }) ? '<mark>' + w + '</mark>' : w; }).join('');
      }
      function suggest() {
        var q = tok(search.value);
        if (!q.length) { closeSug(); return; }
        var scored = [];
        items.forEach(function (it) {
          var sc = hasAll(it.tn, q) ? (it.tn[0] && it.tn[0].indexOf(q[0]) === 0 ? 3 : 2) : hasAll(it.tc, q) ? 1.5 : hasAll(it.tn.concat(it.tc), q) ? 1 : 0;
          if (sc) scored.push([sc, it]);
        });
        scored.sort(function (a, b) { return b[0] - a[0] || b[1].total - a[1].total || a[1].name.localeCompare(b[1].name); });
        sugIt = scored.slice(0, 30).map(function (x) { return x[1]; }); sugAt = sugIt.length ? 0 : -1;
        sug.innerHTML = sugIt.length ? sugIt.map(function (it, i) {
          var ini = String(it.name).split(/\s+/).slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase();
          var sub = [cityLabel(it.e.city), it.nation ? (typeof dn === 'function' ? dn(it.nation) : it.nation) : '', it.e.league && it.e.league !== 'Other' ? it.e.league : ''].filter(Boolean).join(' · ');
          return '<button type="button" role="option" data-i="' + i + '"' + (i === 0 ? ' class="on"' : '') + '><span class="sl">' + (it.logo ? '<img src="' + esc(it.logo) + '" alt="" loading="lazy">' : '<b>' + esc(ini) + '</b>') +
            '</span><span class="st"><b>' + mark(it.name, q) + '</b><small>' + mark(sub, q) + '</small></span></button>';
        }).join('') : '<div class="none">' + esc(T('Nieko nerasta', 'Nothing found')) + '</div>';
        sug.hidden = false; search.setAttribute('aria-expanded', 'true');
      }
      function closeSug() { sug.hidden = true; sug.innerHTML = ''; sugIt = []; sugAt = -1; search.setAttribute('aria-expanded', 'false'); }
      function pick(it) { closeSug(); search.value = ''; search.blur(); select(it); }
      function moveSug(d) {
        if (!sugIt.length) return;
        sugAt = (sugAt + d + sugIt.length) % sugIt.length;
        [].forEach.call(sug.querySelectorAll('button'), function (b, i) { b.classList.toggle('on', i === sugAt); if (i === sugAt) b.scrollIntoView({ block: 'nearest' }); });
      }
      search.addEventListener('input', suggest);
      search.addEventListener('focus', function () { if (search.value) suggest(); });
      search.addEventListener('keydown', function (ev) {
        if (ev.key === 'ArrowDown') { ev.preventDefault(); moveSug(1); }
        else if (ev.key === 'ArrowUp') { ev.preventDefault(); moveSug(-1); }
        else if (ev.key === 'Enter') { ev.preventDefault(); if (sugAt >= 0) pick(sugIt[sugAt]); }
        else if (ev.key === 'Escape') { ev.stopPropagation(); search.value = ''; closeSug(); search.blur(); }
      });
      // pasirinkimas paspaudus (click), kad telefone sąrašą būtų galima slinkti pirštu; kol pirštas ant sąrašo – blur jo neuždaro
      var sugDown = false;
      sug.addEventListener('pointerdown', function (ev) { sugDown = true; if (ev.pointerType === 'mouse') ev.preventDefault(); });
      sug.addEventListener('pointercancel', function () { sugDown = false; });
      sug.addEventListener('pointerup', function () { setTimeout(function () { sugDown = false; }, 450); });
      sug.addEventListener('click', function (ev) { var b = ev.target.closest('button[data-i]'); sugDown = false; if (b) pick(sugIt[+b.dataset.i]); });
      search.addEventListener('blur', function () { setTimeout(function () { if (!sugDown && document.activeElement !== search) closeSug(); }, 200); });
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
