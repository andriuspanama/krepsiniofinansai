/* Krepšinio finansai – tema + papildymai. Į index.html įkelkite TIK šią eilutę prieš </body>:
   <script src="redesign.js" defer></script>   (CSS įsikelia pats, visada po esamų stilių) */
(function(){
  if(window.__rd)return;window.__rd=1; // apsauga, jei skriptas įkeltas du kartus
  // 1) CSS visada įkeliamas paskutinis, todėl perrašo senus stilius
  const cs=document.currentScript,base=cs?cs.src.replace(/[^/]*$/,""):"";
  const l=document.createElement("link");l.rel="stylesheet";l.href=base+"redesign.css"+(cs&&cs.src.indexOf("?v=")>0?"?v="+cs.src.split("?v=")[1]:"");document.head.appendChild(l);
  // Ryto kortelės foninė foto: išblukinta (beveik be raudonos), tamsi, neutrali
  // Klubo kortelė (PC): didesnis logotipas per dvi eilutes, „vėliava šalis · sezonas“ – lygiai su klubo pavadinimu
  {const st=document.createElement("style");st.id="rd-mblogo";st.textContent=".ps-p.a{background:rgba(255,176,32,.16);color:#ffc46b}.mb-div{margin-top:-2px}.mb-row .lw{margin:0}.mb-row .lg{width:34px;height:34px}.mb-chart .mbd.lgm.on .dot{transform:none}.mb-chart .mbd.lgm image{transition:opacity .35s ease}";document.head.appendChild(st)}
  {const st=document.createElement("style");st.id="rd-clhead";st.textContent="@media(min-width:721px){#sh .cl:has(>.lw){position:relative;padding-left:78px;min-height:40px}#sh .cl:has(>.lw)>.lw{position:absolute;left:0;top:-4px;margin:0}#sh .cl:has(>.lw) .lg{width:64px;height:64px}#sh .cl:has(>.lw)+.sum{padding-left:78px;min-height:26px}}@media(max-width:720px){#sh .cl:has(>.lw){position:relative;padding-left:56px;min-height:38px}#sh .cl:has(>.lw)>.lw{position:absolute;left:0;top:0;margin:0}#sh .cl:has(>.lw)+.sum{padding-left:56px;min-height:14px}}";document.head.appendChild(st)}
  // Klubo kortelė: logotipas be fono, už jo – švytėjimas klubo spalva (spalva paimama iš logotipo; jei svetainė neleidžia jo nuskaityti – iš sąrašo žemiau, kitaip sidabrinė)
  {const st=document.createElement("style");st.id="rd-lgglow";st.textContent="#sh.lgg{--lgk1:28%;--lgk2:10%;background-image:radial-gradient(ellipse 440px 270px at var(--gx,72px) var(--gy,110px),color-mix(in srgb,var(--tc) var(--lgk1),transparent) 0%,color-mix(in srgb,var(--tc) var(--lgk2),transparent) 42%,transparent 72%);background-repeat:no-repeat;background-attachment:local}#sh.lgg .top{transition:background-color .2s}#sh.lgg:not(.lgs) .top{background:transparent}#sh.lgg .cl:has(>.lw)>.lw{display:grid;place-items:center}#sh.lgg .cl:has(>.lw) .lg{width:84px;height:64px;border-radius:0;background:none;object-fit:contain;filter:drop-shadow(0 3px 6px rgba(0,0,0,.35))}@media(min-width:721px){#sh.lgg .cl:has(>.lw){padding-left:96px;margin-top:4px}#sh.lgg .cl:has(>.lw)>.lw{left:0;top:-4px;width:84px;height:64px}#sh.lgg .cl:has(>.lw)+.sum{padding-left:96px;min-height:32px}}@media(max-width:720px){#sh.lgg{background-image:radial-gradient(ellipse 300px 200px at var(--gx,50px) var(--gy,90px),color-mix(in srgb,var(--tc) var(--lgk1),transparent) 0%,color-mix(in srgb,var(--tc) var(--lgk2),transparent) 42%,transparent 72%)}#sh.lgg .cl:has(>.lw){padding-left:66px;margin-top:2px}#sh.lgg .cl:has(>.lw)>.lw{left:0;top:-2px;width:56px;height:44px}#sh.lgg .cl:has(>.lw) .lg{width:56px;height:44px}#sh.lgg .cl:has(>.lw)+.sum{padding-left:66px;min-height:18px}}:root[data-t=light] #sh.lgg{--lgk1:34%;--lgk2:13%}:root[data-t=light] #sh.lgg .cl:has(>.lw) .lg{filter:drop-shadow(0 4px 10px rgba(0,0,0,.18))}@media(prefers-color-scheme:light){:root:not([data-t=dark]) #sh.lgg{--lgk1:34%;--lgk2:13%}:root:not([data-t=dark]) #sh.lgg .cl:has(>.lw) .lg{filter:drop-shadow(0 4px 10px rgba(0,0,0,.18))}}";document.head.appendChild(st)}
  const LGTC={"https://www.bleague.jp/files/user/common/img/logo/2026/m/yb.png":"#2f5fb3","https://www.bleague.jp/files/user/common/img/logo/2026/m/ff.png":"#8a4fbf","https://www.bleague.jp/files/user/common/img/logo/2026/m/sb.png":"#d0202f","https://www.bleague.jp/files/user/common/img/logo/2026/m/ez.png":"#2c6fb7","https://www.ogol.com.br/img/logos/equipas/36/262836_logo_20261001180704_napoli_basket.png":"#1e8fd6","https://estaticos-cdn.prensaiberica.es/epi/public/file/2021/0209/19/ucam-murcia-cf-b328869.png":"#d9a400","https://commons.wikimedia.org/wiki/Special:FilePath/Galatasaray_S.K._Logo_2026.svg?width=300":"#c8102e","https://bckalev.ee/wp-content/uploads/2026/08/bigbank-kalev-logo.svg":"#1f4f9c","https://cdn.athletic-club.eus/imagenes/escudos/Real-madrid.png":"#c9a227","https://images.seeklogo.com/logo-png/29/2/bayern-munich-logo-png_seeklogo-298228.png":"#dc052d","https://r2.thesportsdb.com/images/media/team/logo/ihsyz91623803570.png":"#2a5ca8","https://static.flashscore.com/res/image/data/QXUZ0xDa-Uwn7h7cq.png":"#d9a400","https://commons.wikimedia.org/wiki/Special:FilePath/Galatasaray_S.K._Logo_2026.svg?width=300":"#c8102e","https://i.pinimg.com/originals/ad/ab/21/adab214ae0c812bc07391e19735592c1.png":"#1d5fa8","https://upload.wikimedia.org/wikipedia/fr/thumb/1/1d/JDA_Dijon_Basket.svg/120px-JDA_Dijon_Basket.svg.png?20180623152540":"#1e4fa0","https://r2.thesportsdb.com/images/media/team/badge/1wc9581745087145.png/medium":"#2e9c4a","https://img.wikiwand.com/wikipedia/en/thumb/4/47/FC_Barcelona_(crest).svg/1280px-FC_Barcelona_(crest).svg.png":"#a50044","https://upload.wikimedia.org/wikipedia/en/thumb/e/ed/London_Lions_(2020).png/250px-London_Lions_(2020).png":"#c9a227","https://cbcanarias.net/wp-content/themes/genesis-sample/images/escudo-cbc.png":"#d9a400","https://static.vocento.com/sportsdata/latest/assets/equipos/g/5026.png":"#8a8f99","https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/FC_Bayern_M\u00fcnchen_(Basketball)_Logo.svg/960px-FC_Bayern_M\u00fcnchen_(Basketball)_Logo.svg.png":"#dc052d","https://cdn.freelogovectors.net/wp-content/uploads/2022/01/olimpia-milano-logo-freelogovectors.net_.png":"#e30613","https://www.proballers.com/api/getTeamLogo?id=3036&width=100":"#d2232a","https://res.cloudinary.com/dmixnaxp6/image/upload/v1/logos/maccabi_ashdod_basketball":"#f2c500","https://hirakawa-g.jp/common/img/parts-hannaryz/logo-sp.png":"#2aa7b8","https://www.bleague.jp/files/user/common/img/logo/2026/m/ac.png":"#aab4c3","https://bleague.bl.kuroco-img.app/v=1750662199/files/user/common/img/logo/2025/s/bw.png":"#c9a227","https://volters.bl.kuroco-img.app/v=1719473316/files/user/lp/rebranding/img/logo_markonly.png":"#e60012","https://www.helsinkiseagulls.com/wp-content/uploads/2018/03/logo.png":"#2f6db5","https://pyrinto.fi/wp-content/uploads/kataja_basket_logo.png":"#2449a8","https://files.tips.gg/static/image/teams/energa-czarni-slupsk-basketball.png":"#e8731e","https://img.xscores.com/participant/logo/teamlogo/128873":"#aab4c3","https://static.wikia.nocookie.net/logopedia/images/3/3f/Caen_Basket_Calvados_(logo).png/revision/latest/scale-to-width-down/1200?cb=20241108213114":"#2b5fb3","https://r2.thesportsdb.com/images/media/team/logo/0pufss1765447095.png":"#aab4c3","https://gambarous.jp/files/user/news/2023/20230713_LOGO_B.png":"#1e7fc0","https://assets.fiba.basketball/image/upload/w_200/f_auto/q_auto/.logoflag--light--organisation_254?buster=20545":"#aa133d","https://r2.thesportsdb.com/images/media/team/badge/9eng811621456481.png":"#1c5198","https://storage.googleapis.com/scoutbasketball/teams/images/Besiktas_1750788898.png":"#e73b44","https://jerseypedia.org/wp-content/uploads/2019/09/Scaligera_Basket_Verona_logo.png":"#504d94","https://bctaurage.lt/wp-content/uploads/2026/07/logo-top-300x300.png":"#1f6b45","https://www.mbb.org.tr/images/logo.png":"#4b87b8","https://upload.wikimedia.org/wikipedia/commons/f/f9/Bordobk.png":"#621027","https://www.proballers.com/api/getTeamLogo?id=604&width=300":"#5379af","https://img.sofascore.com/api/v1/team/269768/image":"#0d4da9","https://bleague.bl.kuroco-img.app/v=1688088744/files/user/common/img/logo/2023/m/sn.png":"#bf3f42","https://bleague.bl.kuroco-img.app/v=1688088743/files/user/common/img/logo/2023/m/kb.png":"#a63962","https://bleague.bl.kuroco-img.app/v=1750662182/files/user/common/img/logo/2025/m/ex.png":"#378b64","https://bleague.bl.kuroco-img.app/v=1662708736/files/user/common/img/logo/2022/m/eo.png":"#a84e07","https://images.discovery-prod.axs.com/2022/11/yyyyyyyyyyy_11-18-22_7_6376f0a86be6f.png":"#e60324","https://files.tips.gg/static/image/teams/bambitious-nara-basketball.png":"#9e3746","https://passlab.jp/Academy/wp-content/themes/wyvans_academy/img/logo.png":"#aab4c3","https://bleague.bl.kuroco-img.app/v=1662708754/files/user/common/img/logo/2022/m/to.png":"#557fb3","https://www.albirex.com/files/user/B1_niigata_albirex_bb_bk.png":"#39629b","https://bleague.bl.kuroco-img.app/v=1719393082/files/user/common/img/logo/2024/m/td.png":"#4567a8","https://img.sportbo.live/basketball/team/42a97215019ab03ef4f0cd8166e62904.webp":"#338fb4","https://trains.co.jp/files/user/common/img/logo_bee-trains.png":"#e83541","https://bleague.bl.kuroco-img.app/v=1688088742/files/user/common/img/logo/2023/m/ez.png":"#507da7","https://acobasket.fi/wp-content/uploads/sites/3/2025/09/logo-kipina-basket-4675575.png":"#bb5d27","https://www.olympiakomitea.fi/wp-content/uploads/2024/06/Honka-logo-vihrea-23-300x289.png":"#3c8183","https://www.egiskormend.hu/upload/2022_10/12/166557279554438319/kaposvari_kk_logo.png":"#1f217a","https://www.passportix.eu/uploads/partners/11/bk-liepaja-logo.png":"#b74e7a","https://img.sofascore.com/api/v1/team/310886/image":"#259f55","https://upload.wikimedia.org/wikipedia/fr/thumb/4/44/Logo_Stade_rochelais_2016.svg/langfr-250px-Logo_Stade_rochelais_2016.svg.png":"#c29b00","https://r2.thesportsdb.com/images/media/team/badge/idmc7v1633957683.png":"#d8434c","https://r2.thesportsdb.com/images/media/team/badge/riasis1638032028.png":"#0e1f4d","https://www.raplakk.ee/wp-content/uploads/2025/11/RaplaKK_logo2025-300x252.png":"#5bb9e4","https://www.rookiescale.com/wp-content/uploads/2023/10/Gargzdai.png":"#dbc471","https://www.nkapecs.hu/nkapecs-kepek/csapatok/transzlogo/PHOENIX-Foti-Tigrisek_91.png":"#1e446f","https://total-waterpolo.com/wp-content/uploads/2023/07/honved_-750x750.png":"#d22329","https://vtb-league.com/app/uploads/2018/08/vtb_league_logo2018-2.png":"#3e4b8e","https://cdn3.germanijak.hr/sponsors/kk_split_logo.png":"#f8c139","https://bleague.bl.kuroco-img.app/v=1719393082/files/user/common/img/logo/2024/m/su.png":"#72add8","https://www.myfitness.lv/wp-content/uploads/2026/02/rigas-zelli-logo-768x960.png":"#c02fb3","https://www.bggoettingen.de/wp-content/uploads/2023/06/Logo_BG-Goettingen_2012_RGB-174x300.png":"#713a8a","https://site-1645511.mozfiles.com/files/1645511/medium/ENBL_logo_horizontal_2022.png":"#294e74","https://images.seeklogo.com/logo-png/44/2/fc-bayern-munchen-basketball-new-2022-logo-png_seeklogo-446025.png?v=1957916013618277568":"#e1415b"},LGOV={panathinaikos:"#0a8a46"},LGC={},LGSIL="#aab4c3";
  const lgPick=src=>new Promise(res=>{const im=new Image();im.crossOrigin="anonymous";const t=setTimeout(()=>res({c:LGSIL}),8000);im.onload=()=>{clearTimeout(t);try{const S=48,c=document.createElement("canvas");c.width=c.height=S;const x=c.getContext("2d");x.drawImage(im,0,0,S,S);const d=x.getImageData(0,0,S,S).data,b={};let op=0,cn=0;
    for(let i=0;i<d.length;i+=4){const r=d[i],g=d[i+1],bl=d[i+2];if(d[i+3]<140)continue;op++;const mx=Math.max(r,g,bl),mn=Math.min(r,g,bl),dd=mx-mn;if(mx<40||mn>215||dd<45)continue;cn++;
      let h=mx===r?((g-bl)/dd)%6:mx===g?(bl-r)/dd+2:(r-g)/dd+4;h=(h*60+360)%360;const k=Math.round(h/24)%15;b[k]=b[k]||[0,0,0,0,0];b[k][0]+=r;b[k][1]+=g;b[k][2]+=bl;b[k][3]++;b[k][4]+=h>=14&&h<=42?.3:1}   // oranžinė (kamuolys) sveriama mažiau
    const top=Object.values(b).sort((p,q)=>q[4]-p[4])[0];let x0=S,y0=S,x1=-1,y1=-1;for(let y=0;y<S;y++)for(let X=0;X<S;X++)if(d[(y*S+X)*4+3]>24){if(X<x0)x0=X;if(X>x1)x1=X;if(y<y0)y0=y;if(y>y1)y1=y}   // turinio ribos (be tuščių kraštų)
    let rr=0;if(x1>=0){const ar=im.naturalWidth/im.naturalHeight,cx=(x0+x1+1)/2/S,cy=(y0+y1+1)/2/S,Q=[];for(let y=0;y<S;y++)for(let X=0;X<S;X++)if(d[(y*S+X)*4+3]>140){const u=((X+.5)/S-cx)*ar,v=(y+.5)/S-cy;Q.push(u*u+v*v)}Q.sort((a,b)=>a-b);rr=Q.length?Q[Math.floor(Q.length*.985)]:0}   // be pavienių kraštinių taškų   // toliausias taškas nuo centro (aukščio dalimis) – kad apskritimas nenukirstų kampų
    res({r:Math.sqrt(rr),c:op&&cn/op>=.15&&top?"rgb("+top.slice(0,3).map(v=>Math.round(v/top[3])).join(",")+")":LGSIL,f:lgFill(im),b:x1<0?null:[x0/S,y0/S,(x1+1)/S,(y1+1)/S]})}catch(e){res({c:LGSIL})}};im.onerror=()=>{clearTimeout(t);res({c:LGSIL})};im.src=src});
  // Uždari permatomi plotai herbo viduje (pvz. Široki, Jonava) – baltai, kad tamsiame fone atrodytų kaip originale; maži tarpai (raidžių vidus) nekeičiami
  const lgFill=im=>{try{const k=Math.min(1,320/Math.max(im.naturalWidth,im.naturalHeight)),w=Math.max(1,Math.round(im.naturalWidth*k)),h=Math.max(1,Math.round(im.naturalHeight*k)),c=document.createElement("canvas");c.width=w;c.height=h;const x=c.getContext("2d");x.drawImage(im,0,0,w,h);
    const id=x.getImageData(0,0,w,h),d=id.data,T=p=>d[p*4+3]<60,out=new Uint8Array(w*h),lab=new Uint8Array(w*h),q=[],nb=(p,f)=>{const px=p%w;if(px>0)f(p-1);if(px<w-1)f(p+1);if(p>=w)f(p-w);if(p<w*h-w)f(p+w)};
    for(let i=0;i<w;i++)for(const p of [i,(h-1)*w+i])if(T(p)&&!out[p]){out[p]=1;q.push(p)}for(let j=0;j<h;j++)for(const p of [j*w,j*w+w-1])if(T(p)&&!out[p]){out[p]=1;q.push(p)}
    while(q.length)nb(q.pop(),n=>{if(!out[n]&&T(n)){out[n]=1;q.push(n)}});let hit=0;const R=[];
    for(let p=0;p<w*h;p++)if(T(p)&&!out[p]&&!lab[p]){const r=[p];lab[p]=1;for(let a=0;a<r.length;a++)nb(r[a],n=>{if(!lab[n]&&!out[n]&&T(n)){lab[n]=1;r.push(n)}});R.push(r);if(r.length>=w*h*.04)hit=1}
    if(hit)for(const r of R)if(r.length>=4)for(const a of r){d[a*4]=d[a*4+1]=d[a*4+2]=d[a*4+3]=255}   // didelis baltas plotas viduje → užpildomi ir smulkūs (plonos linijos); be jo – nieko (Dijon)
    if(!hit)return null;x.putImageData(id,0,0);return c.toDataURL()}catch(e){return null}};
  // Tušti kraštai aplink logotipą: jei svetainė leidžia – išmatuojama automatiškai, kitaip – iš sąrašo (išmatuota iš anksto); LGVB – rodoma tik dalis (Panathinaikos: herbas be užrašo)
  const LGBB={"https://images.seeklogo.com/logo-png/29/2/bayern-munich-logo-png_seeklogo-298228.png":[0.05,0.05,0.95,0.95],"https://r2.thesportsdb.com/images/media/team/badge/9eng811621456481.png":[0.06,0.07,0.915,0.935],"https://r2.thesportsdb.com/images/media/team/badge/1wc9581745087145.png/medium":[0.0,0.105,1.0,0.895],"https://jerseypedia.org/wp-content/uploads/2019/09/Scaligera_Basket_Verona_logo.png":[0.095,0.065,0.89,0.96],"https://commons.wikimedia.org/wiki/Special:FilePath/Galatasaray_S.K._Logo_2026.svg?width=300":[0.09,0.07,0.91,0.93],"https://bleague.bl.kuroco-img.app/v=1750662199/files/user/common/img/logo/2025/s/bw.png":[0.005,0.205,1.0,0.79],"https://bleague.bl.kuroco-img.app/v=1688088744/files/user/common/img/logo/2023/m/sn.png":[0.015,0.24,0.98,0.755],"https://bleague.bl.kuroco-img.app/v=1662708736/files/user/common/img/logo/2022/m/eo.png":[0.02,0.285,0.98,0.715],"https://bleague.bl.kuroco-img.app/v=1662708754/files/user/common/img/logo/2022/m/to.png":[0.095,0.16,0.905,0.835],"https://bleague.bl.kuroco-img.app/v=1719393082/files/user/common/img/logo/2024/m/su.png":[0.04,0.15,0.96,0.85],"https://bleague.bl.kuroco-img.app/v=1719393082/files/user/common/img/logo/2024/m/td.png":[0.035,0.325,0.965,0.675],"https://www.passportix.eu/uploads/partners/11/bk-liepaja-logo.png":[0.077,0.08,0.923,0.92],"https://bleague.bl.kuroco-img.app/v=1772176007/files/user/common/img/logo/2026/s/gb.png":[0.055,0.075,0.945,0.925],"https://acobasket.fi/wp-content/uploads/sites/3/2025/09/logo-kipina-basket-4675575.png":[0.055,0.04,0.94,0.92],"https://www.karhubasket.fi/wp-content/uploads/2018/09/logo_karhu_bear_only.png":[0.1,0.125,0.9,0.875],"https://www.bleague.jp/files/user/common/img/logo/2026/m/ac.png":[0.14,0.125,0.86,0.875],"https://www.bleague.jp/files/user/common/img/logo/2026/m/yb.png":[0.06,0.08,0.94,0.92],"https://www.bleague.jp/files/user/common/img/logo/2026/m/ff.png":[0.005,0.145,0.995,0.855],"https://r2.thesportsdb.com/images/media/team/badge/idmc7v1633957683.png":[0.0,0.205,1.0,0.795],"https://www.bleague.jp/files/user/common/img/logo/2026/m/ez.png":[0.015,0.165,0.985,0.835],"https://cdn.bebasket.fr/resources/images/team/hla-alicante-logo-1f03a276-6faa-6b5e-9a6b-b958509f76e8.png":[0.055,0.06,0.94,0.94],"https://www.raplakk.ee/wp-content/uploads/2025/11/RaplaKK_logo2025-300x252.png":[0.015,0.113,0.94,0.798],"https://bleague.bl.kuroco-img.app/v=1772176012/files/user/common/img/logo/2026/s/vm.png":[0.14,0.065,0.86,0.935],"https://www.keflavik.is/assets/images/logo.png":[0.063,0.06,0.937,0.94],"https://api-playerbase.dscore.live/storage/club/691/logos/GdPj3Y3BU4pOwKJc6feJ6xkPJ3NMgyjExm5gFsNX.png":[0.065,0.065,0.935,0.935],"https://api-playerbase.dscore.live/storage/club/401/logos/6hYWur4pTj7Zvm51C8plLvkomDL9X40TuIyo3xyz.png":[0.06,0.08,0.92,0.935],"https://www.albirex.com/files/user/B1_niigata_albirex_bb_bk.png":[0.045,0.3,0.955,0.7]},LGVB={"https://mediacentre.euroleague.net/uploads/euroleaguecore/teams/logos/positive_3365.png":[0.235,0.145,0.765,0.665],"https://mediacentre.euroleague.net/uploads/euroleaguecore/teams/logos/negative_3365.png":[0.235,0.145,0.765,0.665]};
  const lgFit=(img,w,b,clip)=>{const st=img.style;["position","left","top","width","height","max-width","max-height","clip-path","filter"].forEach(p=>st.removeProperty(p));if(!b||!img.naturalWidth)return;
    const BW=w.clientWidth,BH=w.clientHeight,ar=img.naturalWidth/img.naturalHeight,cw=b[2]-b[0],ch=b[3]-b[1];if(!BW||cw<=0||ch<=0)return;
    const IW=Math.min(BW/cw,BH*ar/ch),IH=IW/ar;if(!clip&&IW/Math.min(BW,BH*ar)<1.05)return;
    Object.assign(st,{position:"absolute",left:(BW/2-(b[0]+b[2])/2*IW)+"px",top:(BH/2-(b[1]+b[3])/2*IH)+"px",width:IW+"px",height:IH+"px",maxWidth:"none",maxHeight:"none"});
    if(clip)st.filter="none",st.clipPath="inset("+[b[1],1-b[2],1-b[3],b[0]].map(v=>Math.max(0,v*100-2).toFixed(1)+"%").join(" ")+")"};
  // Labai tamsios klubo spalvos (pvz. tamsiai mėlyna) tamsioje temoje pašviesinamos – kitaip švytėjimas beveik nematomas
  const lgLift=c=>{if(!c||!lgDark())return c;let r,g,b,m=/^#([0-9a-f]{6})$/i.exec(c);if(m){const v=parseInt(m[1],16);r=v>>16;g=v>>8&255;b=v&255}else if(m=/rgb\((\d+),\s*(\d+),\s*(\d+)/.exec(c)){r=+m[1];g=+m[2];b=+m[3]}else return c;
    const L=(.2126*r+.7152*g+.0722*b)/255;if(L>=.2)return c;const k=Math.min(.55,(.2-L)/.2*.6+.15);return"rgb("+[r,g,b].map(v=>Math.round(v+(255-v)*k)).join(",")+")"};
  const lgTc=(el,c)=>el.style.setProperty("--tc",lgLift(c));
  // Tamsiai temai – FIBA ir B.League logotipų versijos tamsiam fonui (balti užrašai); šviesiai – įprastos (tokios ir logos.json)
  const lgDark=()=>{const t=document.documentElement.dataset.t;return t?t!=="light":!matchMedia("(prefers-color-scheme: light)").matches};
  const LGDK={"https://thumb.wikimedia.org/wikipedia/en/thumb/e/ef/Helsinki_Seagulls.svg/330px-Helsinki_Seagulls.svg.png": "https://www.helsinkiseagulls.com/wp-content/uploads/2018/03/logo.png", "https://upload.wikimedia.org/wikipedia/en/e/ed/Basket_Swans_logo.png": "https://r2.thesportsdb.com/images/media/team/logo/0pufss1765447095.png", "https://upload.wikimedia.org/wikipedia/commons/6/6c/KatajaBasketLogo.png": "https://www.katajabasket.fi/favicon.svg", "https://bleague.bl.kuroco-img.app/v=1772176007/files/user/common/img/logo/2026/s/gb.png": "https://gambarous.jp/files/user/news/2023/20230713_LOGO_B.png"};   // klubai, kurių šviesiai ir tamsiai temai skirtingi failai
  const lgVar=u=>lgDark()?LGDK[u]||u.replace("logoflag--light--","logoflag--dark--").replace(/^(https:\/\/www\.bleague\.jp\/files\/user\/common\/img\/logo\/\d{4}\/)(?!bg-black\/)/,"$1bg-black/"):u;
  function lgGlow(){const sh=document.getElementById("sh");if(!sh)return;const cl=sh.querySelector(".cl"),w=cl&&!cl.classList.contains("ry")&&cl.querySelector(":scope>.lw"),img=w&&w.querySelector("img.lg");
    if(!sh.dataset.lgs){sh.dataset.lgs=1;sh.addEventListener("scroll",()=>sh.classList.toggle("lgs",sh.scrollTop>4),{passive:true})}sh.classList.toggle("lgs",sh.scrollTop>4);   // viršutinė juosta permatoma, kol kortelė nenuslinkta
    sh.classList.toggle("lgg",!!img);if(!img){sh.style.removeProperty("--tc");return}
    const s=sh.getBoundingClientRect(),r=w.getBoundingClientRect();sh.style.setProperty("--gx",Math.round(r.left-s.left+r.width/2)+"px");sh.style.setProperty("--gy",Math.round(r.top-s.top+sh.scrollTop+r.height/2)+"px");
    const orig=img.dataset.o||img.getAttribute("src");img.dataset.o=orig;const want=lgVar(orig);img.dataset.w=want;
    const key=norm((cl.querySelector("h2")||{}).textContent||""),ov=Object.keys(LGOV).find(k=>key.indexOf(k)>=0),fx=ov?LGOV[ov]:LGTC[orig]||LGTC[want];
    const pk=u=>LGC[u]?Promise.resolve(LGC[u]):lgPick(u).then(r=>LGC[u]=r);   // spalva – iš įprastos versijos, baltas užpildas – iš rodomos
    const man=LGVB[want]||LGVB[orig],fit=b=>{const go=()=>{if(img.dataset.w===want)lgFit(img,w,man||b,!!man)};img.onload=go;if(img.complete)go()};
    lgTc(sh,fx||(LGC[orig]||{}).c||LGSIL);if(!LGC[want]&&img.getAttribute("src")!==want)img.src=want;
    fit(LGBB[want]||LGBB[orig]);
    Promise.all([pk(orig),want===orig?null:pk(want)]).then(([o,v])=>{if(!img.isConnected||img.dataset.w!==want)return;lgTc(sh,fx||o.c);const s2=((v||o).f)||want;if(img.getAttribute("src")!==s2)img.src=s2;fit((v||o).b||LGBB[want]||LGBB[orig])})}
  new MutationObserver(()=>lgGlow()).observe(document.documentElement,{attributes:true,attributeFilter:["data-t"]});
  try{matchMedia("(prefers-color-scheme: light)").addEventListener("change",()=>lgGlow())}catch(e){}
  // ---- Logotipai už klubo kortelės ribų: burbulai (lentelės, žemėlapis, „Kur arena?“) ir „plaukiojantys“ (žaidimo kortelės, žemėlapio klubo kortelė) ----
  {const st=document.createElement("style");st.id="rd-lgall";st.textContent="/* burbulai (lentel\u0117s, \u017eem\u0117lapis, \u201eKur arena?\u201c): logotipas be tu\u0161\u010di\u0173 kra\u0161t\u0173 u\u017epildo apskritim\u0105 */.tw td .lw.tl .lg{width:32px;height:32px}.phd .fc{width:80px;height:80px}@media(max-width:720px){.phd .fc{width:64px;height:64px}}.lw.lgt{border-radius:50%;overflow:hidden;background:#fff}.lw.lgt>img.lg{background:none}/* \u017eaidimo kortel\u0117s ir \u017eem\u0117lapio klubo kortel\u0117: logotipas be burbulo, \u0161vyt\u0117jimas klubo spalva */.gm-card.lgf{--tc:var(--a);background-image:radial-gradient(ellipse 260px 150px at 50% 52px,color-mix(in srgb,var(--tc) var(--lgk1,26%),transparent) 0%,color-mix(in srgb,var(--tc) var(--lgk2,9%),transparent) 45%,transparent 75%)}.gm-card .lw{width:76px;height:58px;margin:0}.gm-card .lw .in{display:none}.gm-card .lw img.lg{width:76px;height:58px;border-radius:0;background:none;object-fit:contain;filter:drop-shadow(0 3px 6px rgba(0,0,0,.35))}.am-body.lgf{--tc:var(--a);background-image:radial-gradient(ellipse 320px 190px at 58px 46px,color-mix(in srgb,var(--tc) var(--lgk1,26%),transparent) 0%,color-mix(in srgb,var(--tc) var(--lgk2,9%),transparent) 45%,transparent 75%);background-repeat:no-repeat}.am-head img{width:84px!important;height:64px!important;border-radius:0!important;background:none!important;padding:0!important;filter:drop-shadow(0 3px 6px rgba(0,0,0,.35))}@media(max-width:720px){.am-head img{width:64px!important;height:50px!important}}:root[data-t=light] .gm-card.lgf,:root[data-t=light] .am-body.lgf{--lgk1:34%;--lgk2:13%}@media(prefers-color-scheme:light){:root:not([data-t=dark]) .gm-card.lgf,:root:not([data-t=dark]) .am-body.lgf{--lgk1:34%;--lgk2:13%}}";document.head.appendChild(st)}
  const LGM=(()=>{try{return JSON.parse(localStorage.getItem("kf-lgm3")||"{}")}catch(e){return{}}})();let lgmT=0;
  const lgmSave=()=>{clearTimeout(lgmT);lgmT=setTimeout(()=>{try{localStorage.setItem("kf-lgm3",JSON.stringify(LGM))}catch(e){}},1500)};
  const lgQ=[];let lgRun=0;const lgNext=()=>{while(lgRun<4&&lgQ.length){const [u,ok]=lgQ.shift();lgRun++;lgPick(u).then(r=>{LGC[u]=r;LGM[u]={b:r.b||null,c:r.c,r:r.r||0};lgmSave();lgRun--;ok(r);lgNext()})}};
  const lgInfo=u=>LGC[u]?Promise.resolve(LGC[u]):LGM[u]?Promise.resolve(LGM[u]):new Promise(ok=>{lgQ.push([u,ok]);lgNext()});   // ribos + spalva, įsimenama naršyklėje
  const lgFull=u=>LGC[u]?Promise.resolve(LGC[u]):new Promise(ok=>{lgQ.push([u,ok]);lgNext()});   // pilna analizė (su baltu užpildu) – ne iš naršyklės atminties
  const lgBox=(u,r)=>LGVB[u]?{b:LGVB[u],clip:1}:{b:(r&&r.b)||LGBB[u]||null};
  const lgXf=(img,b,k,clip,rad,D,fl)=>{const W=img.clientWidth,H=img.clientHeight,nw=img.naturalWidth,nh=img.naturalHeight;img.style.removeProperty("transform");img.style.removeProperty("clip-path");if(!b||!W||!nw)return 0;
    const ar=nw/nh,w=Math.min(W,H*ar),h=w/ar,cw=(b[2]-b[0])*w,ch=(b[3]-b[1])*h;if(cw<=0||ch<=0)return 0;let s=Math.min(2.6,Math.min(W/cw,H/ch)*k);if(rad&&D)s=Math.min(1.7,D/2/(rad*h));if(fl&&s<1)s=1;if(Math.abs(s-1)<.04&&!clip)return 0;
    img.style.transform="scale("+s.toFixed(3)+") translate("+(-((b[0]+b[2])/2-.5)*w).toFixed(1)+"px,"+(-((b[1]+b[3])/2-.5)*h).toFixed(1)+"px)";
    if(clip&&getComputedStyle(img).backgroundColor.indexOf("0)")>0)img.style.clipPath="inset("+[b[1],1-b[2],1-b[3],b[0]].map(v=>Math.max(0,v*100-2).toFixed(1)+"%").join(" ")+")";return 1};
  const lgWhen=(img,f)=>{if(img.complete&&img.naturalWidth)f();else img.addEventListener("load",f,{once:true})};
  function lgBub(img){if(img.dataset.lb)return;img.dataset.lb=1;const u=img.getAttribute("src");if(!u||u.startsWith("data:"))return;
    let n=0;const go=r=>{if(!img.isConnected)return;if(!img.clientWidth){if(n++<8)setTimeout(()=>go(r),400);return}const x=lgBox(u,r),own=img.classList.contains("lg"),D=own?img.parentNode.clientWidth*.82:img.clientWidth;   // balta paraštė lieka (kaip anksčiau)
    if(lgXf(img,x.b,own?.8:.9,x.clip,x.clip?0:r&&r.r,D,!own)&&own&&img.parentNode.classList.contains("lw"))img.parentNode.classList.add("lgt")};   // paslėptas (dar neišdėstytas) – bandoma vėliau
    lgInfo(u).then(r=>lgWhen(img,()=>go(r)))}
  function lgFloat(img,host){const orig=img.dataset.o||img.getAttribute("src");if(!orig||orig.startsWith("data:"))return;img.dataset.o=orig;const want=lgVar(orig);img.dataset.w=want;host.classList.add("lgf");
    const nk=norm((host.querySelector("h3,.gm-n")||{}).textContent||""),ov=Object.keys(LGOV).find(k=>nk.indexOf(k)>=0),fx=ov?LGOV[ov]:LGTC[orig]||LGTC[want];lgTc(host,fx||(LGC[orig]||LGM[orig]||{}).c||LGSIL);if(img.getAttribute("src")!==want&&!(LGC[want]||{}).f)img.src=want;
    Promise.all([lgInfo(orig),lgFull(want)]).then(([o,v])=>{if(!img.isConnected||img.dataset.w!==want)return;lgTc(host,fx||o.c||LGSIL);const f=v&&v.f;if(f&&img.getAttribute("src")!==f)img.src=f;
      lgWhen(img,()=>{const x=lgBox(want,v||o);const y=x.b?x:lgBox(orig,o);lgXf(img,y.b,1,y.clip)})})}
  // Moneyball grafiko burbulai (SVG): logotipas be tuščių kraštų užpildo baltą apskritimą, kampai nenukerpami; niekada ne mažesnis nei buvo
  function lgSvg(el){if(el.dataset&&el.dataset.lb)return;el.setAttribute("data-lb","1");const u=el.getAttribute("href");if(!u)return;
    const S=+el.getAttribute("width"),x0=+el.getAttribute("x"),y0=+el.getAttribute("y"),cx=x0+S/2,cy=y0+S/2;if(!S)return;
    const im=new Image();im.onload=()=>lgInfo(u).then(r=>{if(!el.isConnected||!im.naturalWidth)return;const ar=im.naturalWidth/im.naturalHeight,w=Math.min(S,S*ar),h=w/ar,x=lgBox(u,r),b=x.b;if(!b)return;
      let sc;if(x.clip||!(r&&r.r))sc=Math.min(S/((b[2]-b[0])*w),S/((b[3]-b[1])*h))*(x.clip?1:.9);else sc=S/2/(r.r*h);sc=Math.min(1.7,sc);if(!x.clip&&sc<1)sc=1;if(Math.abs(sc-1)<.04)return;
      const W=S*sc,ox=((b[0]+b[2])/2-.5)*w*sc,oy=((b[1]+b[3])/2-.5)*h*sc;
      el.setAttribute("width",W.toFixed(1));el.setAttribute("height",W.toFixed(1));el.setAttribute("x",(cx-W/2-ox).toFixed(1));el.setAttribute("y",(cy-W/2-oy).toFixed(1))});im.src=u}
  const LGSEL=".am-pin .in>img,.mg-lg>img,.am-sug .sl>img,.lw>img.lg,.am-head>img";
  function lgScan(root){if(root.querySelectorAll)root.querySelectorAll(".mb-chart image").forEach(lgSvg);(root.matches&&root.matches(LGSEL)?[root]:[]).concat([...(root.querySelectorAll?root.querySelectorAll(LGSEL):[])]).forEach(img=>{
    if(img.closest("#sh .cl")||img.closest(".ry-fx"))return;const gm=img.closest(".gm-card"),am=img.closest(".am-body");if(gm||am)lgFloat(img,gm||am);else lgBub(img)})}
  new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType===1)lgScan(n)}))).observe(document.documentElement,{childList:true,subtree:true});
  lgScan(document);
  new MutationObserver(()=>document.querySelectorAll(".gm-card .lw>img.lg,.am-head>img").forEach(img=>{const h=img.closest(".gm-card,.am-body");if(h)lgFloat(img,h)})).observe(document.documentElement,{attributes:true,attributeFilter:["data-t"]});
  window.addEventListener("resize",()=>lgGlow());
  {const st=document.createElement("style");st.id="rd-bgfix";st.textContent=
   'html #sh.sheet.bg-photo{background:'+
   'radial-gradient(640px 280px at 50% 0%,rgba(200,16,46,.08),transparent 72%),'+
   'linear-gradient(180deg,rgba(6,6,8,calc(.16*(1 - var(--bg-a)))) 0%,rgba(6,6,8,calc(.30*(1 - var(--bg-a)))) 50%,rgba(6,6,8,calc(.86*(1 - var(--bg-a)))) 100%),'+
   'radial-gradient(ellipse 95% 70% at 50% 28%,transparent 45%,rgba(6,6,8,calc(.35*(1 - var(--bg-a)))) 100%),'+
   'linear-gradient(color-mix(in srgb,var(--card) calc(var(--bg-a)*100%),transparent),color-mix(in srgb,var(--card) calc(var(--bg-a)*100%),transparent)),'+
   'linear-gradient(rgba(118,118,118,.28),rgba(118,118,118,.28)),'+
   'var(--bgph) center 30%/cover no-repeat,'+
   'var(--bgph) center 30%/cover no-repeat var(--card) !important;'+
   'background-blend-mode:normal,normal,normal,normal,saturation,soft-light,normal !important}'+
   'html #sh.bg-photo.bg-show .kp div:first-child{background-color:rgba(8,8,10,.62)}';
   document.head.appendChild(st)}



  // ---- Lankomumo profiliai: 9 tipai su aprašymais ir grupėmis (s = geriausi, m = vidurys, w = silpniausi) ----
  try{
    const N=(re,lt,dl,de,g)=>[re,lt,dl,de,g],NEW=[
     N(/^strong in (own league and in europe|europe and own league)\s*$/i,"Stipri savo lygoje ir Europoje","Žiūrovų bazė, išsiskirianti abiem lygmenimis. Klubas pritraukia aiškiai daugiau žiūrovų nei panašaus rinkos dydžio lygos varžovai ir daugiau nei tokio paties gyventojų skaičiaus rinkų Europos klubai.","A fan base that stands out on both levels. The club draws clearly more fans than league rivals with similar market sizes, and more than European clubs with the same market population.","s"),
     N(/^strong in own league,?\s*in line with europe\s*$/i,"Stipri savo lygoje, atitinka Europos lygį","Vienas geriausiai žiūrovus pritraukiančių savo lygos klubų, atsižvelgiant į rinkos dydį. Europos mastu jo žiūrovų bazė atitinka tai, ką paprastai palaiko tokio dydžio rinka.","One of the best crowd-pullers in its league for its market size. By European standards, its fan base is about what a market that size normally supports.","s"),
     N(/^in line with own league,?\s*above europe\s*$/i,"Atitinka savo lygą, aukščiau Europos","Tipiška savo lygos žiūrovų bazė lygoje, kurioje krepšinis labai populiarus. Būti vidutiniu čia jau reiškia daugiau žiūrovų nei dauguma panašios rinkos Europos klubų.","A typical fan base for its league, in a league where basketball is a big draw. Being average there already means more fans than most European clubs with a similar market population.","s"),
     N(/^strong in own league,?\s*below europe\s*$/i,"Stipri savo lygoje, žemiau Europos","Lyderis lygoje, kurioje krepšinis pritraukia mažiau žiūrovų. Klubas iš savo rinkos išspaudžia daugiau nei dauguma šalies varžovų, tačiau žiūrovų vis tiek mažiau nei Europos lygio tokio dydžio rinkai.","A leader in a league where basketball draws smaller crowds. The club gets more out of its market than most domestic rivals, but its crowds are still below the European level for a market that size.","m"),
     N(/^in line with own league (and|and in) europe\s*$/i,"Atitinka savo lygą ir Europą","Žiūrovų bazė, atitinkanti rinkos dydį: maždaug tiek, kiek tikėtumėtės ir savo lygoje, ir visoje Europoje.","A fan base that matches its market size: about what you would expect both in its league and across Europe.","m"),
     N(/^below own league,?\s*above europe\s*$/i,"Žemiau savo lygos, aukščiau Europos","Atsilieka nuo lygos varžovų pagal rinkos dydį, tačiau stipri lygos krepšinio kultūra vis tiek laiko jo žiūrovų skaičių virš Europos lygio tokio dydžio rinkai.","Behind its league rivals for its market size, but the league's strong basketball culture still keeps its crowds above the European level for a market that size.","m"),
     N(/^in line with own league,?\s*below europe\s*$/i,"Atitinka savo lygą, žemiau Europos","Tipiška savo lygos žiūrovų bazė lygoje, kurioje krepšinis pritraukia mažiau žiūrovų. Lankomumą lemia daugiau lygos lygis nei pats klubas.","A typical fan base for its league, in a league where basketball draws smaller crowds. Its attendance reflects the league's level more than the club itself.","w"),
     N(/^below own league,?\s*in line with europe\s*$/i,"Žemiau savo lygos, atitinka Europos lygį","Pritraukia mažiau žiūrovų nei panašaus rinkos dydžio lygos varžovai. Europos mastu jo žiūrovų skaičius atitinka tai, ką paprastai palaiko tokio dydžio rinka.","Draws fewer fans than league rivals with similar market sizes. By European standards, its crowds are about what a market that size normally supports.","w"),
     N(/^below own league (and|and in) europe\s*$/i,"Žemiau savo lygos ir Europos","Klubas pasiekia tik dalį savo potencialios žiūrovų bazės. Lankomumas žemesnis ir nei lygos varžovų, ir nei panašios rinkos Europos klubų, todėl yra aiškios augimo galimybės.","The club reaches only part of its potential fan base. Crowds are below both its league rivals and European clubs with a similar market population, leaving clear room to grow.","w")];
    const old=PROF.slice();PROF.length=0;PROF.push(...NEW,...old);
  }catch(e){}
  const M=n=>(n/1e6).toFixed(1)+"M",e=s=>String(s).replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));
  const ok=()=>typeof D!=="undefined"&&D.bud&&D.bud.length;

  // 2) Biržos juosta
  function ticker(){
    if(document.querySelector(".tk"))return;
    // Visi naujausio sezono klubai, kurių biudžetas žinomas ir pokytį galima apskaičiuoti (pvz. 26/27 vs 25/26)
    const se=[...new Set(D.bud.filter(r=>r.total!=null).map(r=>r.season))].sort().pop();if(!se)return;
    let rows=budgetRows(se).filter(r=>r.total!=null&&r.chg!=null);if(!rows.length)rows=budgetRows(se).filter(r=>r.total!=null);rows.sort((a,b)=>b.total-a.total);if(!rows.length)return;
    const col=v=>`var(--${v>=0?"pos":"neg"})`;
    const it=rows.map(r=>`<span>${e(r.club)} <b>${M(r.total)}</b>${r.chg==null?"":` <b style="color:${col(r.chg)}">${r.chg>=0?"▲":"▼"} ${Math.abs(Math.round(r.chg*100))}%</b>`}</span>`).join(""),el=document.createElement("div");
    el.className="tk";el.innerHTML=`<div style="animation-duration:${Math.max(45,Math.round(rows.length*6.4))}s">${it}${it}</div>`;document.body.prepend(el);
  }

  // 3) Lentelių ir langų papildymai (idempotentiški)
  const pc=t=>{const m=String(t).match(/(\d+)\s*%/);return m?+m[1]:null};
  const legacy=t=>/strong|stipri/i.test(t)?"s":/in line|atitinka/i.test(t)?"m":/helped|padeda|low|mažas|capacity|talpos/i.test(t)?"w":"";
  const cls=t=>{t=String(t).replace(/ⓘ/g,"").trim();const x=typeof PROF!=="undefined"&&PROF.find(x=>x[1]===t||x[0].test(t));return x&&x[4]?x[4]:legacy(t)};
  function spark(v){
    if(v.length<2)return"";const W=70,H=24,mx=Math.max(...v),mn=Math.min(...v),
      p=v.map((y,i)=>[2+i*(W-4)/(v.length-1),H-3-(y-mn)/(mx-mn||1)*(H-6)]),c=v[v.length-1]>=v[0]?"var(--pos)":"var(--neg)";
    return`<svg class="spk" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true"><polyline fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="${p.map(q=>q.map(n=>n.toFixed(1)).join(",")).join(" ")}"/><circle cx="${p[p.length-1][0]}" cy="${p[p.length-1][1]}" r="2.6" fill="${c}"/></svg>`;
  }
  function gauge(p){const r=50,c=2*Math.PI*r;
    return`<svg class="kg" width="132" height="132" viewBox="0 0 132 132" role="img" aria-label="${Math.round(p)}%"><circle cx="66" cy="66" r="${r}" fill="none" stroke="var(--line)" stroke-width="12"/><circle cx="66" cy="66" r="${r}" fill="none" stroke="var(--a)" stroke-width="12" stroke-linecap="round" stroke-dasharray="${c*Math.min(p,100)/100} ${c}" transform="rotate(-90 66 66)"/><text x="66" y="75" text-anchor="middle" font-family="JetBrains Mono,monospace" font-weight="600" font-size="28" fill="var(--ink)">${Math.round(p)}%</text></svg>`}
  // Logotipas rodomas tik jei klubas jį turi (logos.json); be jo – tik vėliavėlė
  const lgo=n=>{const u=typeof LOGOS!=="undefined"&&LOGOS[norm(n)];return u?`<span class="lw"><img class="lg" src="${String(u).replace(/"/g,"&quot;")}" alt="" loading="lazy" onerror="this.parentNode.remove()"></span>`:""};

  // ---- „Tale of the tape": dviejų stulpelių palyginimas kaip dvikova ----
  function tape(){
    document.querySelectorAll("#out .cmpw:not([data-tp])").forEach(w=>{
      w.dataset.tp=1;const t=w.querySelector("table");if(!t)return;
      const ths=[...t.querySelectorAll("thead th")],rows=[...t.querySelectorAll("tbody tr")];
      if(ths.length!==3||!rows.length)return;
      let a=0,b=0;
      const body=rows.map(r=>{const c=r.children,xw=c[1].classList.contains("best"),yw=c[2].classList.contains("best");
        if(xw)a++;if(yw)b++;
        return`<div class="tp-r"><span class="tp-v${xw?" w":""}">${c[1].innerHTML}</span><span class="tp-l">${c[0].innerHTML}</span><span class="tp-v${yw?" w":""}">${c[2].innerHTML}</span></div>`}).join("");
      const el=document.createElement("div");el.className="tape";
      el.innerHTML=`<div class="tp-h"><div>${ths[1].innerHTML}</div><div class="tp-s"><b>${a}</b> : <b>${b}</b></div><div>${ths[2].innerHTML}</div></div>${body}`;
      w.style.display="none";w.after(el)})}

  // ---- Biudžetas vienam žiūrovui (Lankomumo lentelėje) ----
  function perFan(){
    if(typeof S==="undefined"||S.tab!=="att"||typeof V==="undefined")return;
    const hr=document.querySelector("#out thead tr");if(!hr||hr.querySelector(".pf-th"))return;
    const lb=(typeof LANG!=="undefined"&&LANG==="en")?"Budget per fan":"Biudžetas / žiūrovas";
    hr.insertAdjacentHTML("beforeend",`<th class="pf-th" title="${(typeof LANG!=="undefined"&&LANG==="en")?"Total budget divided by average attendance":"Bendras biudžetas, padalintas iš vidutinio lankomumo"}">${lb}</th>`);
    document.querySelectorAll("#out tr.c").forEach(tr=>{
      const r=V[+tr.dataset.i];let v=null;
      if(r&&r.avg){const b=D.bud.find(x=>x.season===r.season&&x.total!=null&&x.nation===(r.country||r.nation)&&same(x.club,r.club));if(b)v=b.total/r.avg}
      tr.insertAdjacentHTML("beforeend",`<td data-lb="${lb}">${v==null?'<span class="na">–</span>':eur(Math.round(v))}</td>`)})}

  // LED šriftas: palaukiame, kol užsikraus, tada sutalpiname skaičius
  let ledOk=false;
  try{(document.fonts?document.fonts.load("800 28px Doto"):Promise.resolve()).catch(()=>{}).then(()=>{ledOk=true;enhance()})}catch(e){ledOk=true}
  function fitLed(){
    if(!ledOk)return;
    document.querySelectorAll(".kp div:first-child b:not(.long),.gm-v").forEach(b=>{
      if(!b.offsetParent||b.dataset.ft===b.textContent)return;
      b.style.fontSize="";let s=parseFloat(getComputedStyle(b).fontSize);
      while(b.scrollWidth>b.clientWidth+1&&s>10){s-=1;b.style.fontSize=s+"px"}
      b.dataset.ft=b.textContent});
  }
  // Klubo kortelė: paskutinė rodiklių eilutė (pvz. 4 indeksų langeliai) ištempiama per visą plotį (PC / planšetė; telefone – kaip buvo)
  function fitKp(){
    document.querySelectorAll("#sh .kp").forEach(k=>{
      k.style.removeProperty("grid-template-columns");[...k.children].forEach(c=>c.style.removeProperty("grid-column"));
      if(innerWidth<721||!k.offsetParent)return;
      const kids=[...k.children];if(kids.length<2)return;
      const N=getComputedStyle(k).gridTemplateColumns.split(" ").filter(Boolean).length;if(N<3)return;
      const top=kids[kids.length-1].offsetTop,last=kids.filter(c=>c.offsetTop===top),n=last.length,g=k.querySelector(".hasg");
      if(n>=N||(g&&g.offsetTop+g.offsetHeight>top))return;
      k.style.gridTemplateColumns=`repeat(${N*n},minmax(0,1fr))`;
      kids.forEach(c=>{c.style.gridColumn=c===g?`${-(2*n+1)}/-1`:last.includes(c)?`span ${N}`:`span ${n}`})})}
  let rzt=0;addEventListener("resize",()=>{clearTimeout(rzt);rzt=setTimeout(()=>{document.querySelectorAll("[data-ft]").forEach(b=>delete b.dataset.ft);fitLed();fitKp()},150)});

  // ---- Lankomumo lentelės skaitymas su pataisomis: sezonai nebesislenka dėl Latvijos–Estijos lygos ----
  try{
    const LEN="Latvijos–Estijos lyga";
    const inf2=rs=>{const cnt={};let tot=0;for(const x of rs){const n=nationOfClub(x.name);if(n){cnt[n]=(cnt[n]||0)+1;tot++}}
      const e=Object.entries(cnt).sort((a,b)=>b[1]-a[1]);if(!e.length)return"";
      if(e[0][1]/tot>=.75)return e[0][0];
      if(((cnt["Latvija"]||0)+(cnt["Estija"]||0))/tot>=.85)return LEN;
      return"ABA"};
    attendance=function(rows,def){
      const dv=rows.some(r=>(r[2]||"").trim()==="Club")?1:0,blks=[];let pend="",cur=null;
      const prev=t=>{const[a,b]=t.split("/").map(Number);return String(a-1).padStart(2,"0")+"/"+String(b-1).padStart(2,"0")};
      const titleOf=r=>r.slice(1,18).map(x=>(x||"").trim()).find(x=>x&&!/^[\d\s.,%\/-]+$/.test(x)&&x!=="Division"&&x!=="Club"&&/league|lyga|\d\d\s*\/\s*\d\d/i.test(x))||"";
      for(const r of rows){
        const first=(r[1]||"").trim(),a=(r[1+dv]||"").trim();
        if(dv&&!a){const t=titleOf(r);if(t){pend=t;cur=null;continue}}
        if(a==="Club"||a==="Klubas"){cur={title:pend,rows:[]};blks.push(cur);pend="";continue}
        if(!a)continue;
        if(num(r[5+dv])==null&&num(r[6+dv])==null){if(!dv){pend=a;cur=null}continue}
        if(!cur){cur={title:pend,rows:[]};blks.push(cur);pend=""}
        cur.rows.push(r)}
      const o=[];let season=def||"",seen=new Set();
      for(const b of blks){if(!b.rows.length)continue;let tS=null,nation;
        if(b.title){const mm=b.title.match(/(\d\d)\s*\/\s*(\d\d)\s*$/);if(mm)tS=mm[1]+"/"+mm[2];
          const t0=b.title.replace(/\s*\d\d\s*\/\s*\d\d\s*$/,""),m=t0.match(/^(\w+) league/i);
          nation=/latvian|estonian|lebl/i.test(t0)?LEN:m&&AD[m[1]]?nat(AD[m[1]]):t0.replace(/\s*\(.*/,"").replace(/ league$/i,"")}
        else nation=inf2(b.rows.map(r=>({name:(r[1+dv]||"").trim()})));
        if(tS){season=tS;seen=new Set([nation])}else{if(nation&&seen.has(nation)){season=prev(season);seen=new Set()}if(nation)seen.add(nation)}
        for(const r of b.rows){
          const a=(r[1+dv]||"").trim(),first=(r[1]||"").trim(),nums=String(r[6+dv]).split("/").map(num).filter(x=>x!=null),avg=num(r[5+dv]),cap=nums.length?nums[nums.length-1]:null;
          o.push({season,nation,div:dv?num(first):null,club:a,city:txt(r[2+dv]),avg,cap,est:{avg:est(r[5+dv]),cap:est(r[6+dv])},fill:fr(r[7+dv])??(avg!=null&&cap?avg/cap:null),expE:num(r[11+dv]),idxE:num(r[12+dv]),expL:num(r[13+dv]),idxL:num(r[14+dv]),profile:txt(r[15+dv]),place:num(r[16+dv])})}}
      return o};
    if(D.att&&D.att.length&&!D.__pa){D.__pa=1;start()}
  }catch(e){}
  function leagueFix(){
    const LE="Latvijos–Estijos lyga";
    try{FL[LE]="LVEE";LT2EN[LE]="Latvian–Estonian League";NAT["Latvian–Estonian League"]=LE;PAIRS.unshift([new RegExp("(?<![\\p{L}])"+LE+"(?![\\p{L}])","gu"),"Latvian–Estonian League"])}catch(e){}
    let ch=0;
    D.att.forEach(r=>{if(r.nation===LE){if(!r.country||r.country===LE)r.country=nationOfClub(r.club)||"Latvija";return}const lv=v=>v==="Latvija"||v==="Estija",real=lv(r.country)?r.country:lv(r.nation)?r.nation:null;if(real&&r.nation!==LE){r.country=real;r.nation=LE;ch++}});
    if(ch&&S.tab==="att")render();
  }
  let SPD=null;const SPC=new Map(),SPN=new Map();
  function enhance(){
    if(!ok())return;
    if(D.att&&!D.att.__le){D.att.__le=1;leagueFix()}
    tape();perFan();try{pickEnhance()}catch(e){}
    document.querySelectorAll("#sh .top:not([data-sb])").forEach(tp=>{tp.dataset.sb=1;if(!document.querySelector("#sh .cl h2,#sh > h2,#sh .phd h2,#sh [data-pkl]"))return;
      const c=tp.querySelector("#cl");if(c)c.insertAdjacentHTML("beforebegin",`<button class="shb">${T("Dalintis","Share")}</button>`)});
    document.querySelectorAll("td[data-lb] .sh:not([data-e])").forEach(s=>{
      s.dataset.e=1;if(!/Užpildymas|Filling rate|Atlyginimų dalis|Salary share/.test(s.closest("td").dataset.lb||""))return;
      const p=pc(s.textContent);if(p==null)return;const a=Math.max(.2,Math.min(1,(p-50)/50));
      s.classList.add("hm");if(a>.5)s.classList.add("hi");s.style.setProperty("--hm",Math.round(a*100)+"%")});
    document.querySelectorAll("td[data-lb] span[title]:not([data-e]),.sheet .pf:not([data-e])").forEach(s=>{
      s.dataset.e=1;const td=s.closest("td");if(td&&!/Profilis|Profile/.test(td.dataset.lb||""))return;
      const k=cls(s.firstChild&&s.firstChild.nodeType===3?s.firstChild.textContent:s.textContent);if(k){s.classList.add("pill",k);s.style.maxWidth="100%"}});
    if(typeof V!=="undefined")document.querySelectorAll("tr.c:not([data-sp])").forEach(tr=>{
      tr.dataset.sp=1;const td=[...tr.children].find(c=>/Bendras biudžetas|Total budget/.test(c.dataset.lb||""));if(!td)return;
      const r=V[+tr.dataset.i];if(!r||!r.club)return;
      // istorija skaičiuojama vieną kartą kiekvienam klubui (anksčiau – kas kartą per visą biudžetų lentelę kiekvienai eilutei)
      if(SPD!==D.bud){SPD=D.bud;SPC.clear();SPN.clear();D.bud.forEach(x=>{if(x.total==null)return;const L=SPN.get(x.nation)||[];L.push(x);SPN.set(x.nation,L)})}
      const sk=r.nation+"|"+norm(r.club);let h=SPC.get(sk);
      if(!h){h=(SPN.get(r.nation)||[]).filter(x=>same(x.club,r.club)).sort((a,b)=>a.season.localeCompare(b.season)).map(x=>x.total);SPC.set(sk,h)}
      td.insertAdjacentHTML("afterbegin",spark(h))});
    document.querySelectorAll("#sh .kp div:not([data-e])").forEach(d=>{
      d.dataset.e=1;if(!/Užpildymas|Filling rate/.test(d.querySelector("small")?.textContent||""))return;
      const p=pc(d.querySelector("b")?.textContent);if(p!=null){d.classList.add("hasg");d.insertAdjacentHTML("beforeend",gauge(p))}});
    const she=document.getElementById("sh");if(she)she.classList.toggle("is-ry",!!she.querySelector(".cl.ry"));
    if(she){const h2=she.querySelector(".cl h2"),isR=!!h2&&/rytas/i.test(h2.textContent);
      if(!isR){she.classList.remove("bg-photo","bg-show");she.style.removeProperty("--bgph")}
      else{const on=she.classList.contains("bg-show");she.querySelectorAll("[data-bg]").forEach(x=>x.classList.toggle("on",on&&x.dataset.bg===she.dataset.bgcur));
        if(!enhance._pre){enhance._pre=1;["bcl-2026-bg.jpg","lkl-bg.jpg"].forEach(f=>{(new Image()).src=new URL(base+f,document.baseURI).href})}}}
    if(she){const h2=she.querySelector("h2"),PBG=[[/marcus\s+foster/i,"foster-bg.jpg","center 10%"],[/arnas\s+veli[čc]ka/i,"velicka-bg.jpg","center 0%"],[/simas\s+jarumbauskas/i,"jarumbauskas-bg.jpg","center 0%"],[/giedrius\s+[žz]ib[ėe]nas/i,"zibenas-bg.jpg","46% 0%"],[/gytis\s+radzevi[čc]ius/i,"radzevicius-bg.jpg","54% 0%"],[/margiris\s+normantas/i,"normantas-bg.jpg","center 0%"],[/speedy\s+smith/i,"smith-bg.jpg","40% 0%"]],hit=h2&&!she.querySelector(".cl")?PBG.find(p=>p[0].test(h2.textContent)):null;
      she.classList.toggle("is-fos",!!hit);if(hit){she.style.setProperty("--pbg","url("+hit[1]+")");she.style.setProperty("--pbgpos",hit[2])}else{she.style.removeProperty("--pbg");she.style.removeProperty("--pbgpos")}}
    fitLed();fitKp();
    // Klubų logotipai (naudoja jūsų esamą logos.json ir logo() funkciją)
    {const h2=document.querySelector("#sh .cl h2");if(!h2||!/rytas/i.test(h2.textContent))RY_LIT=false}
    if(typeof LOGOS!=="undefined")document.querySelectorAll("#sh .cl h2:not([data-lg])").forEach(h=>{
      h.dataset.lg=1;
      if(/rytas/i.test(h.textContent)){const cl=h.closest(".cl");if(cl){cl.classList.add("ry");{const lu=new URL(base+"rytas-logo.png",document.baseURI).href;
        cl.insertAdjacentHTML("beforeend",ryHTML(lu,RY_LIT));window.RYFX&&RYFX.kick()}}return}
      if(h.previousElementSibling&&h.previousElementSibling.classList.contains("rl"))return;h.insertAdjacentHTML("beforebegin",lgo(h.textContent))});
    lgGlow();
    document.querySelectorAll(".kp div b:not([data-l])").forEach(b=>{b.dataset.l=1;if(b.textContent.trim().length>13)b.classList.add("long")});
  }


  // ---- Žaidėjų nuotraukos, kurių dar nėra players_photos.json: ieškoma Wikipedia (portretinė nuotrauka, griežtas vardo atitikimas) ----
  const PFK="kf-faces-v1",PF=(()=>{try{return JSON.parse(localStorage.getItem(PFK)||"{}")}catch(e){return{}}})();
  const pfSave=()=>{try{localStorage.setItem(PFK,JSON.stringify(PF))}catch(e){}};
  const fold=x=>String(x||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z]/g,"");
  const BADF=/\b(vs\.?|versus|dunk|action|game|match|playoff|final|shoot|shot|layup|defen|against|jump)\b|\.svg$/i;
  const WAPI="https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&redirects=1&prop=pageimages|description&piprop=thumbnail|name&pithumbsize=160&";
  const okPage=p=>p&&!p.missing&&/basketball/i.test(p.description||"")&&p.thumbnail&&p.thumbnail.height>=p.thumbnail.width*.8&&!BADF.test(p.pageimage||"");
  let pfBusy=false;
  async function pfLookup(names){
    const res={};const q=names.map(n=>n.replace(/\s+-\s+/g,"-").replace(/\s+/g," ").trim());
    try{const r=await(await fetch(WAPI+"titles="+encodeURIComponent(q.join("|")))).json(),Q=r.query||{},back={};
      (Q.normalized||[]).forEach(x=>back[x.to]=x.from);(Q.redirects||[]).forEach(x=>back[x.to]=back[x.from]||x.from);
      Object.values(Q.pages||{}).forEach(p=>{const src=back[p.title]||p.title,i=q.indexOf(src);if(i>=0&&okPage(p))res[names[i]]=p.thumbnail.source})}catch(e){}
    for(const n of names.filter(n=>!(n in res)).slice(0,8)){                      // rašybos skirtumai (Micič → Micić): paieška + griežtas vardo patikrinimas
      try{const r=await(await fetch(WAPI+"generator=search&gsrlimit=3&gsrsearch="+encodeURIComponent(n+" basketball"))).json();
        const p=Object.values((r.query||{}).pages||{}).sort((a,b)=>a.index-b.index).find(p=>okPage(p)&&fold(p.title.replace(/\s*\(.*\)$/,""))===fold(n));
        if(p)res[n]=p.thumbnail.source}catch(e){}}
    return res}
  async function faces(){
    if(pfBusy)return;const now=Date.now(),els=[...document.querySelectorAll(".fc.nf[data-pn]:not([data-tried])")];if(!els.length)return;
    els.forEach(e=>{const c=PF[norm(e.dataset.pn)];if(c&&c.u)put(e,c.u)});
    const need=[...new Set(els.filter(e=>!e.querySelector("img")).map(e=>e.dataset.pn))].filter(n=>{const c=PF[norm(n)];return!c||(!c.u&&now-c.t>7*864e5)}).slice(0,40);
    els.forEach(e=>e.dataset.tried=1);if(!need.length)return;
    pfBusy=true;try{for(let i=0;i<need.length;i+=20){const part=need.slice(i,i+20),got=await pfLookup(part);
      part.forEach(n=>{PF[norm(n)]={u:got[n]||"",t:now};if(got[n])document.querySelectorAll(`.fc.nf[data-pn="${CSS.escape(n)}"]`).forEach(e=>put(e,got[n]))})}}finally{pfBusy=false;pfSave()}
    function put(e,u){if(e.querySelector("img"))return;const im=new Image();im.alt="";im.loading="lazy";im.onerror=()=>{im.remove();e.classList.add("nf")};im.src=u;e.appendChild(im);e.classList.remove("nf")}
  }
  setInterval(()=>{try{faces()}catch(e){}},1500);

  // #logos režimas: atidarykite puslapį su /#logos ir gausite logos.json šabloną
  function tmpl(){
    if(location.hash!=="#logos"||document.getElementById("lgt")||typeof clubList!=="function")return;
    const o={};clubList().forEach(c=>o[c.name]="logos/");
    const t=document.createElement("textarea");t.id="lgt";t.readOnly=true;t.rows=10;t.value=JSON.stringify(o,null,1);
    t.style.cssText="display:block;width:calc(100% - 24px);margin:12px;font:12px var(--mono);background:var(--card);color:var(--ink);border:1px solid var(--line);border-radius:8px;padding:8px";
    document.body.prepend(t);
  }

  // MB-START ---- Moneyball skirtukas: biudžeto vieta lygoje prieš galutinę vietą ----
  let MB=false,MBS=null,MBN="",MBQ="",MBD="";
  let MAP=false,RY_LIT=false;
  // Ryto logotipo gylio sluoksniai: aura, HUD plokštė (SVG), aidas, logotipas, skanavimas, blizgesys, kibirkštys
  const ryHTML=(lu,lit)=>`<span class="ry-fx${lit?" lit":""}" role="button" tabindex="0" aria-label="Rytas" aria-pressed="${!!lit}" style="--lg:url('${lu}')"><i class="ry-amb"></i><i class="ry-glow"></i><img class="ry-logo" src="${lu}" alt="" onerror="this.closest('.cl').classList.remove('ry');this.closest('.ry-fx').remove()"><i class="ry-shine"></i>${Array.from({length:9},(_,i)=>`<i class="ry-em" style="--x:${8+i*10+(i%2)*4}%;--d:${(2.4+((i*37)%17)/10).toFixed(1)}s;--dl:${(((i*53)%23)/10).toFixed(1)}s;--dx:${(i%2?1:-1)*(6+(i*7)%18)}px"></i>`).join("")}</span>`;

  const T=(lt,en)=>(typeof LANG!=="undefined"&&LANG==="en")?en:lt;
  function mbData(se){
    const g={};budgetRows(se).filter(r=>r.total!=null&&r.place!=null).forEach(r=>{const k=(typeof rlg==="function"&&rlg(r))||(r.nation+"|"+(r.div==null?"":r.div));(g[k]=g[k]||[]).push(r)});
    const out=[];
    Object.values(g).forEach(a=>{const n=a.length;if(n<6)return;
      const bs=[...a].sort((x,y)=>y.total-x.total),ps=[...a].sort((x,y)=>x.place-y.place);
      a.forEach(r=>{const sr=bs.indexOf(r)+1,pr=ps.indexOf(r)+1;out.push({r,n,sr,pr,x:1-(sr-1)/(n-1),y:(pr-1)/(n-1),d:sr-pr})})});
    return out;
  }
  function mbView(){
    const seasons=[...new Set(D.bud.filter(r=>r.place!=null).map(r=>r.season))].sort().reverse().filter(s=>mbData(s).length>=8);
    if(!seasons.length)return`<div class="mb-root"><p class="sum">${T("Per mažai duomenų apie vietas lygose.","Not enough league-position data yet.")}</p></div>`;
    if(!MBS||!seasons.includes(MBS))MBS=seasons[0];
    let all=mbData(MBS);const cN=n=>T(n,(typeof EN!=="undefined"&&EN[n])||n),rg=p=>typeof rlg==="function"?rlg(p.r):"";
    // šalies mygtukas – tik tos šalies lygos klubai; ABA ir Latvijos–Estijos lygų klubai – po savo lygos mygtuku
    const nations=[...new Set(all.filter(p=>!rg(p)).map(p=>p.r.nation))].sort((a,b)=>cN(a).localeCompare(cN(b)));
    const RG=(typeof RLG!=="undefined"?RLG:[]).filter(x=>all.some(p=>rlg(p.r)===x[0])),isR=MBN.startsWith("@");
    if(MBN&&!(isR?RG.some(x=>"@"+x[0]===MBN):nations.includes(MBN)))MBN="";
    const inN=MBN?(MBN.startsWith("@")?all.filter(p=>rg(p)===MBN.slice(1)):all.filter(p=>p.r.nation===MBN&&!rg(p))):all;
    // vienoje šalyje gali būti keli divizionai – galima rodyti vieną
    const divs=MBN&&!MBN.startsWith("@")?[...new Set(inN.map(p=>p.r.div).filter(v=>v!=null))].sort((a,b)=>a-b):[];
    if(MBD!==""&&!divs.includes(+MBD))MBD="";
    const pts=divs.length>1&&MBD!==""?inN.filter(p=>p.r.div===+MBD):inN;
    const rom=n=>["","I","II","III","IV","V"][n]||n;
    const W=340,H=330,L=30,R=14,Tp=16,B=36,X=v=>L+v*(W-L-R),Y=v=>Tp+v*(H-Tp-B),hs=s=>[...s].reduce((a,c)=>(a*31+c.charCodeAt(0))%1000,7)/1000;
    const col=p=>{const k=p.d/(p.n-1);return k>=.2?"var(--pos)":k<=-.2?"var(--neg)":"var(--mute)"};
    const ex=[...pts].sort((a,b)=>b.d/b.n-a.d/a.n),lab=MBN?new Set([...ex.slice(0,3),...ex.slice(-3)].map(p=>p.r)):new Set();
    const LG=typeof LOGOS!=="undefined"?LOGOS:{},RD=MBN?9:6;
    const dots=pts.map((p,i)=>{const h=hs(p.r.club),cx=X(Math.min(1,Math.max(0,p.x+(h-.5)*.03))),cy=Y(Math.min(1,Math.max(0,p.y+(((h*7)%1)-.5)*.03))),
      t=lab.has(p.r)?`<text x="${(cx+(p.x>.7?-(RD+4):RD+4)).toFixed(1)}" y="${(cy+3).toFixed(1)}" text-anchor="${p.x>.7?"end":"start"}" font-size="8.5" fill="var(--ink)" pointer-events="none">${esc(p.r.club)}</text>`:"";
      const u=MBN?LG[norm(p.r.club)]:null,X1=cx.toFixed(1),Y1=cy.toFixed(1);
      // vienos šalies vaizde – klubo logotipas burbule; žiedo spalva išlaiko reikšmę (žalia / raudona / pilka)
      const mark=!MBN?`<circle class="dot" cx="${X1}" cy="${Y1}" r="${RD}" fill="${col(p)}" fill-opacity=".9" stroke="var(--card)" stroke-width="1.5"/>`
        :u?`<circle class="dot" cx="${X1}" cy="${Y1}" r="${RD}" fill="#fff" stroke="${col(p)}" stroke-width="2.2"/><clipPath id="mbc${i}"><circle cx="${X1}" cy="${Y1}" r="${RD-1.6}"/></clipPath><image href="${esc(u)}" x="${(cx-RD+2.2).toFixed(1)}" y="${(cy-RD+2.2).toFixed(1)}" width="${2*RD-4.4}" height="${2*RD-4.4}" preserveAspectRatio="xMidYMid meet" clip-path="url(#mbc${i})" pointer-events="none"/>`
        :`<circle class="dot" cx="${X1}" cy="${Y1}" r="${RD}" fill="${col(p)}" fill-opacity=".9" stroke="var(--card)" stroke-width="1.5"/><text class="mbin" x="${X1}" y="${(cy+2.2).toFixed(1)}" text-anchor="middle" font-size="6" font-weight="700" fill="#fff" pointer-events="none">${esc(p.r.club.split(/\s+/).filter(w=>w.length>2).slice(0,2).map(w=>w[0]).join("").toUpperCase())}</text>`;
      return`<g class="mbd${MBN?" lgm":""}" data-mc="${esc(p.r.club)}" data-mn="${esc(p.r.nation)}" data-sr="${p.sr}" data-pr="${p.pr}" data-n="${p.n}"><title>${esc(p.r.club)} · #${p.sr} → #${p.pr}</title><circle cx="${X1}" cy="${Y1}" r="${RD+6}" fill="transparent"/>${mark}${t}</g>`}).join("");
    const q=(x,y,a,s)=>`<text x="${x}" y="${y}" text-anchor="${a}" font-size="8.5" fill="var(--mute)">${s}</text>`;
    const svg=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Moneyball"><polygon points="${X(0)},${Y(0)} ${X(1)},${Y(0)} ${X(0)},${Y(1)}" fill="var(--pos)" fill-opacity=".07"/><polygon points="${X(1)},${Y(0)} ${X(1)},${Y(1)} ${X(0)},${Y(1)}" fill="var(--neg)" fill-opacity=".07"/><rect x="${X(0)}" y="${Y(0)}" width="${X(1)-X(0)}" height="${Y(1)-Y(0)}" fill="none" stroke="var(--line)"/><line x1="${X(0)}" y1="${Y(1)}" x2="${X(1)}" y2="${Y(0)}" stroke="var(--mute)" stroke-opacity=".5" stroke-dasharray="3 4"/>`
      +q(X(0)+6,Y(0)+12,"start",T("Mažai išleidžia, bet laimi","Spends little, wins"))+q(X(1)-6,Y(0)+12,"end",T("Daug išleidžia ir laimi","Spends big, wins"))
      +q(X(1)-6,Y(1)-6,"end",T("Daug išleidžia, bet pralaimi","Spends big, loses"))+q(X(0)+6,Y(1)-6,"start",T("Mažai išleidžia ir pralaimi","Spends little, loses"))
      +`<text x="${(L+W-R)/2}" y="${H-10}" text-anchor="middle" font-size="9.5" fill="var(--mute)">${T("Biudžetas savo lygoje →","Budget within own league →")}</text><text transform="translate(10 ${(Tp+H-B)/2}) rotate(-90)" text-anchor="middle" font-size="9.5" fill="var(--mute)">${T("← geresnė vieta","← better finish")}</text>`+dots+`</svg>`;
    const row=(p,i)=>`<button class="mb-row" data-mc="${esc(p.r.club)}" data-mn="${esc(p.r.nation)}"><span class="mb-rk">${i+1}</span>${typeof logo==="function"?logo(p.r.club):""}<span><b>${flag(p.r.nation)}${esc(p.r.club)}</b><small>${T("biudžetas","budget")} #${p.sr}/${p.n} → ${T("vieta","place")} #${p.pr}</small></span><span class="mb-d ${p.d>0?"pos":"neg"}">${p.d>0?"+":""}${p.d}</span></button>`;
    const over=pts.filter(p=>p.d>0).sort((a,b)=>b.d-a.d||b.d/b.n-a.d/a.n).slice(0,5),under=pts.filter(p=>p.d<0).sort((a,b)=>a.d-b.d||a.d/a.n-b.d/b.n).slice(0,5);
    return`<div class="mb-root">${sx(T("Sezonas","Season")+" "+MBS,seasons,s=>`<button class="chip" data-mbs="${s}" aria-pressed="${s===MBS}">${T("Sezonas","Season")} ${s}</button>`)}
<div class="bar n"><button class="chip" data-mbn="" aria-pressed="${!MBN}">${T("Visos","All")}</button>${RG.map(([k,l])=>`<button class="chip" data-mbn="@${k}" aria-pressed="${MBN==="@"+k}">${flag(k==="ABA"?"ABA":"Latvijos–Estijos lyga")}${esc(T(l,(typeof EN!=="undefined"&&EN[l])||l))}</button>`).join("")}${nations.map(n=>`<button class="chip" data-mbn="${esc(n)}" aria-pressed="${MBN===n}">${flag(n)}${esc(cN(n))}</button>`).join("")}</div>${divs.length>1?`<div class="bar n mb-div"><button class="chip" data-mbd="" aria-pressed="${MBD===""}">${T("Visi divizionai","All divisions")}</button>${divs.map(v=>`<button class="chip" data-mbd="${v}" aria-pressed="${MBD===String(v)}">${T("Divizionas","Division")} ${rom(v)}</button>`).join("")}</div>`:""}
<p class="sum">${T("Kiekvienas taškas – klubas. Palyginta su savo lygos varžovais: kiek išleidžia ir kurią vietą užėmė. Virš punktyrinės linijos – klubai, pasiekę daugiau nei leidžia jų biudžetas.","Each dot is a club, compared with rivals in its own league: how much it spends versus where it finished. Above the dashed line are clubs that achieved more than their budget suggests.")}</p>
<div class="mb-find"><input id="mbq" class="mb-q" type="search" list="mbl" autocomplete="off" placeholder="${T("Rasti klubą grafike…","Find a club on the chart…")}" value="${esc(MBQ)}"><datalist id="mbl">${pts.map(p=>`<option value="${esc(p.r.club)}">`).join("")}</datalist><button class="mb-x" type="button" data-mbx aria-label="${T("Išvalyti","Clear")}" ${MBQ?"":"hidden"}>✕</button><span class="mb-hit"></span></div>
<div class="mb-chart">${svg}</div>
<div class="mb-cols"><div><h3>${T("Pralenkia savo biudžetą","Beating their budget")}</h3><div class="mb-list">${over.map(row).join("")||"–"}</div></div><div><h3>${T("Neatitinka savo biudžeto","Below their budget")}</h3><div class="mb-list">${under.map(row).join("")||"–"}</div></div></div></div>`;
  }
  function renderMb(){const o=document.getElementById("out");if(o&&ok()){const sl=[...o.querySelectorAll(".bar.n")].map(b=>b.scrollLeft);o.innerHTML=mbView();o.querySelectorAll(".bar.n").forEach((b,i)=>{if(sl[i])b.scrollLeft=sl[i]});mbHi()}}   // šalių juosta neperšoka į pradžią
  function mbClear(){MBQ="";const i=document.getElementById("mbq");if(i)i.value="";mbHi()}
  function mbHi(){
    const xb=document.querySelector("#out .mb-x");if(xb)xb.hidden=!MBQ;
    const box=document.querySelector("#out .mb-chart"),svg=box&&box.querySelector("svg"),hit=document.querySelector("#out .mb-hit");if(!svg)return;
    svg.querySelectorAll(".mb-ring,.mb-lbl").forEach(n=>n.remove());svg.querySelectorAll(".mbd.on").forEach(g=>g.classList.remove("on"));
    const q=norm(MBQ);box.classList.toggle("hl",!!q);if(hit)hit.textContent="";if(!q)return;
    let gs=[...svg.querySelectorAll(".mbd")].filter(g=>norm(g.dataset.mc).includes(q));
    gs.sort((a,b)=>(norm(a.dataset.mc).startsWith(q)?0:1)-(norm(b.dataset.mc).startsWith(q)?0:1));gs=gs.slice(0,6);
    if(!gs.length){box.classList.remove("hl");if(hit)hit.textContent=T("Nerasta"+(MBN?" – pabandykite „Visos“":""),"Not found"+(MBN?" – try “All”":""));return}
    const NS="http://www.w3.org/2000/svg",vw=svg.viewBox.baseVal.width;
    gs.forEach(g=>{g.classList.add("on");g.querySelectorAll("text:not(.mbin)").forEach(x=>x.remove());svg.appendChild(g);
      const c=g.querySelector(".dot"),cx=+c.getAttribute("cx"),cy=+c.getAttribute("cy"),left=cx>vw*.62;
      const r=document.createElementNS(NS,"circle");r.setAttribute("class","mb-ring");r.setAttribute("cx",cx);r.setAttribute("cy",cy);r.setAttribute("r",+c.getAttribute("r")||5);g.appendChild(r);
      const t=document.createElementNS(NS,"text");t.setAttribute("class","mb-lbl");const rr=(+c.getAttribute("r")||5)+6;t.setAttribute("x",cx+(left?-rr:rr));t.setAttribute("y",cy+3.5);t.setAttribute("text-anchor",left?"end":"start");t.textContent=g.dataset.mc;g.appendChild(t)});
    const f=gs[0];if(hit)hit.textContent=f.dataset.mc+" · "+T("biudžetas","budget")+" #"+f.dataset.sr+"/"+f.dataset.n+" → "+T("vieta","place")+" #"+f.dataset.pr;
  }
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&MB&&MBQ&&document.activeElement&&document.activeElement.id==="mbq")mbClear()});
  document.addEventListener("input",e=>{if(e.target&&e.target.id==="mbq"){e.stopPropagation();MBQ=e.target.value;mbHi()}},true);
  const NAVI={bud:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',att:'<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M15 20c0-2.5 1.5-4.5 4-4.5"/>',
    sal:'<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/>',mapt:'<path d="M9 4l-6 2v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14"/>',
    gmt:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18"/>',tools:'<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>'};
  const ico=k=>`<svg class="ni" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">${NAVI[k]}</svg>`;
  function fixTabs(){const tb=document.getElementById("tabs");if(!tb||!tb.children.length)return;
    [["mbt","Moneyball",MB],["gmt",T("Žaidimas","Game"),GM],["mapt",T("Žemėlapis","Map"),MAP]].forEach(([c,l,on])=>{let b=tb.querySelector("."+c);
      if(!b){b=document.createElement("button");b.className=c;b.setAttribute("role","tab");b.textContent=l;tb.appendChild(b)}
      b.setAttribute("aria-selected",String(on))});
    if(MB||GM||MAP)tb.querySelectorAll("button:not(.mbt):not(.gmt):not(.mapt)").forEach(x=>x.setAttribute("aria-selected","false"));
    // pagrindiniai skirtukai, tada „Įrankiai ▾“ (Palyginimas, Mokesčių skaičiuoklė, Moneyball)
    const q=x=>tb.querySelector(x),main=[q('[data-tab="bud"]'),q('[data-tab="att"]'),q('[data-tab="sal"]'),q(".mapt"),q(".gmt")].filter(Boolean),
      tools=[q('[data-tab="cmp"]'),q('[data-tab="tax"]'),q(".mbt")].filter(Boolean);
    let tw=q(".tlw");
    const sel=tools.some(b=>b.getAttribute("aria-selected")==="true");
    if(tw&&tw===tb.lastElementChild&&tools.every(b=>b.parentNode===tw.querySelector(".tlm"))&&main.every((b,i)=>tb.children[i]===b&&b.querySelector(".ni"))){tw.classList.toggle("on",sel);return}  // jau sutvarkyta (apsauga nuo MutationObserver ciklo)
    if(!tw){tw=document.createElement("span");tw.className="tlw";tw.innerHTML=`<button type="button" class="tlb" aria-haspopup="true" aria-expanded="false">${ico("tools")}<span class="tlt">${T("Įrankiai","Tools")}</span> <span class="car">▾</span></button><span class="tlm" role="menu" hidden></span>`}
    const menu=tw.querySelector(".tlm");
    main.forEach(b=>{tb.appendChild(b);if(!b.querySelector(".ni")){const k=b.dataset.tab||b.className.split(" ")[0];
      const sh={sal:T("Algos","Salaries"),att:T("Lankom.","Attend."),mapt:T("Žemėl.","Map")}[k];b.innerHTML=ico(k)+`<span class="tlt">${b.textContent}</span>`+(sh?`<span class="tls">${sh}</span>`:"")}});
    tb.appendChild(tw);tools.forEach(b=>{if(b.parentNode!==menu)menu.appendChild(b)});
    tw.classList.toggle("on",sel)}
  document.addEventListener("click",e=>{const b=e.target.closest(".tlb"),tw=document.querySelector("#tabs .tlw");if(!tw)return;
    const m=tw.querySelector(".tlm");if(b){e.stopPropagation();const o=m.hidden;m.hidden=!o;b.setAttribute("aria-expanded",String(o));return}
    if(!m.hidden){m.hidden=true;tw.querySelector(".tlb").setAttribute("aria-expanded","false")}},true);

  // GM-START ---- Žaidimas „Aukščiau ar žemiau" ----
  let GM=false;
  const GS={mode:"bud",left:null,right:null,streak:0,phase:"ask",used:new Set(),pool:[],se:""};
  let GBEST=(()=>{try{return JSON.parse(localStorage.getItem("kf_best")||"{}")}catch(e){return{}}})();
  const gSave=()=>{try{localStorage.setItem("kf_best",JSON.stringify(GBEST))}catch(e){}};
  const gk=r=>norm(r.key||r.club);
  function gPool(mode){
    if(mode==="sal"){
      const seen=new Set(),items=D.sal.filter(p=>p.month>0&&p.name&&!/coach|treneris/i.test(p.role||"")).map(p=>({club:p.name,team:p.team,nation:p.country,v:p.month,sub:[p.team,p.season].filter(Boolean).join(" · "),key:p.name+"|"+p.team+"|"+p.season}))
        .filter(i=>{const k=gk(i);if(seen.has(k))return false;seen.add(k);return true});
      return{items,se:T("visi sezonai","all seasons")};
    }
    const src=mode==="bud"?D.bud:D.att,key=mode==="bud"?"total":"avg",
      ss=[...new Set(src.filter(r=>r[key]!=null).map(r=>r.season))].sort().reverse(),
      se=ss.find(s=>src.filter(r=>r.season===s&&r[key]!=null).length>=20)||ss[0],seen=new Set();
    const items=src.filter(r=>r.season===se&&r[key]!=null&&r[key]>0).map(r=>({club:r.club,nation:mode==="bud"?r.nation:(r.country||r.nation),v:r[key]}))
      .filter(i=>{const k=gk(i);if(seen.has(k))return false;seen.add(k);return true});
    return{items,se};
  }
  function gRand(){const c=GS.pool.filter(r=>!GS.used.has(gk(r))),a=c.length?c:GS.pool,r=a[Math.floor(Math.random()*a.length)];GS.used.add(gk(r));return r}
  function gDraw(l){
    const okp=(r,strict)=>gk(r)!==gk(l)&&(GS.mode!=="sal"||(r.club!==l.club&&r.team!==l.team))&&(!strict||(!GS.used.has(gk(r))&&Math.max(r.v,l.v)/Math.min(r.v,l.v)>=1.12));
    let c=GS.pool.filter(r=>okp(r,true));
    if(!c.length){GS.used=new Set([gk(l)]);c=GS.pool.filter(r=>okp(r,true))}
    if(!c.length)c=GS.pool.filter(r=>okp(r,false));
    const r=c[Math.floor(Math.random()*c.length)];GS.used.add(gk(r));return r;
  }
  function gStart(){
    GS.saved=false;
    const P=gPool(GS.mode);GS.pool=P.items;GS.se=P.se;GS.used=new Set();GS.streak=0;GS.phase="ask";GS.rec=false;clearTimeout(GS.tm);
    if(GS.pool.length<6){GS.left=null;GS.right=null;return}
    GS.left=gRand();GS.right=gDraw(GS.left);
  }
  const gv=(m,v)=>m==="bud"?(v/1e6).toFixed(1)+"M €":m==="sal"?nf.format(Math.round(v))+" €":nf.format(Math.round(v));
  function gCard(c,show,cls,side,ask){
    const inner=`${lgo(c.team||c.club)}<div class="gm-n">${flag(c.nation)}${esc(c.club)}</div>${c.sub?`<small class="gm-s">${esc(c.sub)}</small>`:""}<div class="gm-v">${show?gv(GS.mode,c.v):"?"}</div>`;
    return side?`<button class="gm-card gm-pick ${cls||""}" data-gp="${side}" ${ask?"":"disabled"}>${inner}</button>`:`<div class="gm-card ${cls||""}">${inner}</div>`}
  // ---- Lyderių lentelė: Google Apps Script (žr. leaderboard.gs), rezultatai – atskiroje Google lentelėje ----
  const LB_URL="https://script.google.com/macros/s/AKfycbw3IbKP8rTlAk1q3Bvrr-vO59kdkNQREsLeM9KOHyHGzi-KPM0bHD2lDIx8CKzhMvKV/exec";   // Apps Script žiniatinklio programos nuoroda (…/exec); tuščia – lentelė nerodoma
  const LBG=[["mapday","Kur arena? – dienos lentelė","Where's the arena? – daily leaderboard"],["mapfree","Kur arena? – bendra lentelė","Where's the arena? – total leaderboard"],["bud","Biudžetas – lentelė","Budget – leaderboard"],["att","Lankomumas – lentelė","Attendance – leaderboard"],["sal","Algos – lentelė","Salaries – leaderboard"]];
  let LBSEL="mapday",LBDATA=null,LBT=0,LBERR=false,LBBUSY=false;
  const lbName=()=>{try{return localStorage.getItem("kf_name")||""}catch(e){return""}};
  function lbLoad(force){
    if(!LB_URL)return Promise.resolve(null);
    if(!force&&LBDATA&&Date.now()-LBT<30000)return Promise.resolve(LBDATA);
    return fetch(LB_URL+"?a=top&t="+Date.now()).then(r=>r.json()).then(j=>{if(!j||!j.boards)throw 0;LBDATA=j;LBT=Date.now();LBERR=false;return j}).catch(()=>{LBERR=true;return null})}
  function lbSave(game,name,score,extra){
    name=String(name||"").replace(/[<>"]/g,"").replace(/\s+/g," ").trim().slice(0,20);
    if(!name)return Promise.reject(new Error("name"));
    try{localStorage.setItem("kf_name",name)}catch(e){}
    return fetch(LB_URL,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(Object.assign({game,name,score},extra||{}))})
      .then(r=>r.json()).then(j=>{if(!j||!j.ok)throw new Error(j&&j.error||"err");LBDATA=null;return j})}
  // lyderių lentelėje atsiranda 3D Brazys: paploja 1 vietai, parodo į paskutinę ir susiima už galvos
  function lbB3(){if(!document.querySelector("#md.o #sh .lb-l li"))return;try{const w=window.Brazys3D&&Brazys3D.walker;if(w&&w.leaderboard)setTimeout(()=>{if(document.querySelector("#md.o #sh .lb-l li"))w.leaderboard()},400)}catch(e){}}
  /* kortelės lango vertikali juosta: matoma slenkant, pelei prie dešinio krašto ir ką tik atidarius, po to išnyksta */
  (function(){const sh=document.getElementById("sh");if(!sh)return;let t=0;const can=()=>sh.scrollHeight>sh.clientHeight+2;
   const on=ms=>{if(!can())return;sh.classList.add("sbv");clearTimeout(t);t=setTimeout(()=>sh.classList.remove("sbv"),ms||1200)};
   sh.addEventListener("scroll",()=>on(),{passive:true});
   sh.addEventListener("mousemove",e=>{const r=sh.getBoundingClientRect();if(r.right-e.clientX<30)on(1500)},{passive:true});
   sh.addEventListener("mousedown",e=>{const r=sh.getBoundingClientRect();if(r.right-e.clientX<16)on(4000)});
   new MutationObserver(()=>requestAnimationFrame(()=>on(1600))).observe(sh,{childList:true})})();
  /* slenkamos mygtukų eilės (.bar.n): klasės mr/ml rodo blyškėjantį kraštą, kai yra daugiau į šoną */
  (function(){const up=b=>{const m=b.scrollWidth-b.clientWidth;b.classList.toggle("ml",m>4&&b.scrollLeft>4);b.classList.toggle("mr",m>4&&b.scrollLeft<m-4)};
   let q=0;const all=()=>{q=0;document.querySelectorAll(".bar.n").forEach(up);const o=document.getElementById("out");if(o&&window.tblInit)tblInit(o)},soon=()=>{if(!q)q=requestAnimationFrame(all)};
   document.addEventListener("scroll",e=>{const t=e.target;if(t&&t.classList&&t.classList.contains("n")&&t.classList.contains("bar"))up(t)},true);
   addEventListener("resize",soon);const st=()=>{const o=document.getElementById("out");if(o)new MutationObserver(soon).observe(o,{childList:true,subtree:true});soon()};
   document.readyState==="loading"?document.addEventListener("DOMContentLoaded",st):st()})();
  // rezultato įrašymas: atskiras langas su vardo laukeliu (atgal / Esc – uždaro)
  const lbBtnHtml=(saved,cls)=>!LB_URL?"":saved?`<button type="button" class="${cls}" disabled>✓ ${T("Įrašyta","Saved")}</button>`:`<button type="button" class="${cls}" data-lbo="1">${T("Išsaugoti","Save")}</button>`;
  function lbAsk(game,score,extra,label){return new Promise(done=>{
    const o=document.createElement("div");o.className="lbm";
    o.innerHTML=`<div class="lbm-box" role="dialog" aria-modal="true"><h3>${T("Įrašyti į lyderių lentelę","Save to the leaderboard")}</h3><div class="lbm-sc"><small>${esc(label)}</small><b class="led">${nf.format(score)}</b></div><input class="lbn" type="text" maxlength="20" autocomplete="nickname" placeholder="${T("Jūsų vardas","Your name")}" value="${esc(lbName())}"><small class="lb-err" hidden></small><div class="lbm-row"><button type="button" class="lbm-b sec" data-x="1">${T("Atšaukti","Cancel")}</button><button type="button" class="lbm-b" data-ok="1">${T("Išsaugoti","Save")}</button></div></div>`;
    const inp=o.querySelector(".lbn"),err=o.querySelector(".lb-err"),ok=o.querySelector("[data-ok]");let saved=false;
    const shut=()=>{o.remove();done(saved)};
    const go=()=>{if(ok.disabled)return;ok.disabled=true;ok.textContent=T("Saugoma…","Saving…");
      lbSave(game,inp.value,score,extra).then(j=>{saved=true;ovlClose(shut);
        pkToast(j&&j.kept?T("Jūsų geresnis rezultatas ("+nf.format(j.best)+") lieka lentelėje","Your better score ("+nf.format(j.best)+") stays on the board"):j&&j.updated?T("Rezultatas pagerintas!","Score improved!"):T("Įrašyta į lyderių lentelę","Saved to the leaderboard"))}).catch(e=>{ok.disabled=false;ok.textContent=T("Išsaugoti","Save");err.hidden=false;
        err.textContent=e&&e.message==="name"?T("Įrašykite vardą.","Enter a name."):e&&e.message==="day"?T("Diena jau pasikeitė – šio iššūkio įrašyti nebegalima.","The day has changed – this challenge can no longer be saved."):T("Nepavyko išsaugoti. Bandykite dar kartą.","Could not save. Try again.")})};
    o.addEventListener("click",e=>{if(e.target===o||e.target.closest("[data-x]"))ovlClose(shut);else if(e.target.closest("[data-ok]"))go()});
    inp.addEventListener("keydown",e=>{if(e.key==="Enter")go()});
    document.body.appendChild(o);ovlOpen(shut);setTimeout(()=>{inp.focus();inp.select()},50);
  })}
  window.KFLB={on:()=>!!LB_URL,save:lbSave,ask:lbAsk,btn:lbBtnHtml,show:k=>lbOpen(k),shareImg:d=>mgShare(d).catch(()=>{})};
  const gName=m=>m==="bud"?T("Biudžetas","Budget"):m==="att"?T("Lankomumas","Attendance"):T("Algos","Salaries");
  const ldImg=u=>u?new Promise(res=>{const i=new Image();i.crossOrigin="anonymous";i.onload=()=>res(i);i.onerror=()=>res(null);setTimeout(()=>res(null),4000);i.src=u}):Promise.resolve(null);
  async function shFonts(){try{await document.fonts.load("700 100px 'Barlow Condensed'");await document.fonts.load("600 40px 'JetBrains Mono'");await document.fonts.load("800 100px Doto")}catch(e){}}
  // bendras paveikslėlio pagrindas: fonas, antraštė, LED švieslentė
  function shBase(x,W,H2,title,sub){
    const BG="#07090F",INK="#E8ECF4",MU="#7A869E",AM="#FFB020",HD="'Barlow Condensed','Arial Narrow',sans-serif",MO="'JetBrains Mono',ui-monospace,monospace";
    x.fillStyle=BG;x.fillRect(0,0,W,H2);
    const g=x.createRadialGradient(W/2,-80,0,W/2,-80,760);g.addColorStop(0,"rgba(255,176,32,.20)");g.addColorStop(1,"rgba(255,176,32,0)");x.fillStyle=g;x.fillRect(0,0,W,H2);
    x.textBaseline="alphabetic";x.textAlign="left";x.fillStyle=AM;x.fillRect(72,72,96,6);
    x.fillStyle=MU;x.font="500 34px "+HD;x.fillText(T("Krepšinio klubų finansai","Basketball Club Finances"),72,128);
    let s=112;do{x.font="700 "+s+"px "+HD;s-=2}while(x.measureText(title).width>W-144&&s>56);x.fillStyle=INK;x.fillText(title,72,238);
    x.fillStyle=MU;x.font="400 34px "+MO;x.fillText(sub,72,294);
    x.fillStyle=MU;x.font="400 28px system-ui,sans-serif";x.fillText((location.host+location.pathname).replace(/\/$/,""),72,H2-56);
  }
  function shRR(x,a,b,w,h,r){x.beginPath();x.moveTo(a+r,b);x.arcTo(a+w,b,a+w,b+h,r);x.arcTo(a+w,b+h,a,b+h,r);x.arcTo(a,b+h,a,b,r);x.arcTo(a,b,a+w,b,r);x.closePath()}
  function shLed(x,bx,by,bw,bh){shRR(x,bx,by,bw,bh,22);x.fillStyle="#05070b";x.fill();x.save();shRR(x,bx,by,bw,bh,22);x.clip();x.fillStyle="rgba(255,176,32,.13)";for(let yy=by+4;yy<by+bh;yy+=10)for(let xx=bx+4;xx<bx+bw;xx+=10){x.beginPath();x.arc(xx,yy,1.6,0,Math.PI*2);x.fill()}x.restore();shRR(x,bx,by,bw,bh,22);x.strokeStyle="rgba(255,176,32,.32)";x.lineWidth=3;x.stroke()}
  const LEDF="Doto,'JetBrains Mono',monospace",AMB="#FFB020";
  const toBlob=c=>new Promise((res,rej)=>c.toBlob(b=>b?res(b):rej(new Error("blob")),"image/png"));
  // „Aukščiau ar žemiau“ rezultatas: serija, rekordas, paskutinė pora
  async function hlShare(){
    const m=GS.mode,L=GS.left,R=GS.right;await shFonts();
    const im=await Promise.all([L,R].map(c=>c?ldImg(typeof LOGOS!=="undefined"&&LOGOS[norm(c.team||c.club)]):null));
    const W=1080,H2=1350,c=document.createElement("canvas");c.width=W;c.height=H2;const x=c.getContext("2d");
    shBase(x,W,H2,T("Aukščiau ar žemiau","Higher or lower"),gName(m)+(m==="sal"?"":" · "+T("sezonas","season")+" "+GS.se));
    shLed(x,72,340,936,250);x.fillStyle="#8a93a8";x.font="600 28px 'JetBrains Mono',monospace";x.fillText(T("SERIJA","STREAK"),110,396);x.textAlign="right";x.fillText(T("REKORDAS","BEST"),970,396);
    x.font="800 150px "+LEDF;x.fillStyle=AMB;x.shadowColor="rgba(255,176,32,.75)";x.shadowBlur=28;x.textAlign="left";x.fillText(String(GS.streak),104,548);
    x.textAlign="right";x.font="800 90px "+LEDF;x.fillText(String(GBEST[m]||GS.streak),970,540);x.shadowBlur=0;x.textAlign="left";
    x.fillStyle="#7A869E";x.font="500 32px 'Barlow Condensed',sans-serif";x.fillText(T("Paskutinis klausimas","Last question"),72,668);
    [L,R].forEach((cd,i)=>{if(!cd)return;const y=700+i*190;shRR(x,72,y,936,166,20);x.fillStyle="#0F1420";x.fill();x.strokeStyle="#1E2638";x.lineWidth=2;x.stroke();
      let nx=110;if(im[i]){x.save();x.beginPath();x.arc(150,y+83,46,0,Math.PI*2);x.fillStyle="#fff";x.fill();x.clip();const k=Math.min(72/im[i].width,72/im[i].height);x.drawImage(im[i],150-im[i].width*k/2,y+83-im[i].height*k/2,im[i].width*k,im[i].height*k);x.restore();nx=220}
      const v=gv(m,cd.v);x.textAlign="right";x.font="800 54px "+LEDF;x.fillStyle=AMB;x.shadowColor="rgba(255,176,32,.6)";x.shadowBlur=14;x.fillText(v,980,y+100);const vw=x.measureText(v).width;x.shadowBlur=0;x.textAlign="left";
      let s=46;do{x.font="700 "+s+"px 'Barlow Condensed',sans-serif";s-=2}while(x.measureText(cd.club).width>980-vw-30-nx&&s>22);x.fillStyle="#E8ECF4";x.fillText(cd.club,nx,y+(cd.sub?82:98));
      if(cd.sub){x.fillStyle="#7A869E";x.font="400 26px system-ui,sans-serif";x.fillText(String(cd.sub).slice(0,48),nx,y+122)}});
    showShare(await toBlob(c),T("Aukščiau ar žemiau","Higher or lower")+" "+gName(m));
  }
  // lyderių lentelė paveikslėliu (LED švieslentė)
  async function lbShare(){
    const L=((LBDATA&&LBDATA.boards)||{})[LBSEL]||[];if(!L.length)return;await shFonts();
    const cur=LBG.find(g=>g[0]===LBSEL)||LBG[0],pts=LBSEL.startsWith("map"),n=L.length,rh=70,top=350,W=1080,H2=Math.max(1100,top+n*rh+190),c=document.createElement("canvas");c.width=W;c.height=H2;const x=c.getContext("2d");
    shBase(x,W,H2,T("Lyderių lentelė","Leaderboard"),T(cur[1],cur[2])+(LBSEL==="mapday"?" · "+(LBDATA.day||""):""));
    shLed(x,72,top-20,936,n*rh+70);
    x.fillStyle="#8a93a8";x.font="600 22px 'JetBrains Mono',monospace";x.fillText(T("VIETA","RANK"),106,top+22);x.fillText(T("VARDAS","NAME"),210,top+22);x.textAlign="right";x.fillText(pts?T("TAŠKAI","SCORE"):T("SERIJA","STREAK"),974,top+22);x.textAlign="left";
    L.forEach((r,i)=>{const y=top+44+i*rh+44;x.shadowColor="rgba(255,176,32,.7)";x.shadowBlur=16;x.fillStyle=i===0?"#ffe08a":AMB;
      x.font="800 40px "+LEDF;x.fillText(String(i+1).padStart(2,"0"),106,y);
      const nm=String(r.name).toUpperCase();let s=40;do{x.font="800 "+s+"px "+LEDF;s-=2}while(x.measureText(nm).width>560&&s>20);x.fillText(nm,210,y);
      x.textAlign="right";x.font="800 "+(i===0?50:44)+"px "+LEDF;x.fillText(nf.format(r.score),974,y);x.textAlign="left";x.shadowBlur=0});
    showShare(await toBlob(c),T("Lyderių lentelė","Leaderboard")+" "+T(cur[1],cur[2]));
  }
  // „Kur arena?“ rezultatų paveikslėlis dalinimuisi (tas pats stilius kaip klubų sąrašų kortelėse; taškai – LED švieslentėje)
  async function mgShare(d){
    const imgs=await Promise.all(d.rows.map(r=>r.logo?new Promise(res=>{const i=new Image();i.crossOrigin="anonymous";i.onload=()=>res(i);i.onerror=()=>res(null);setTimeout(()=>res(null),4000);i.src=r.logo}):null));
    try{await document.fonts.load("700 100px 'Barlow Condensed'");await document.fonts.load("600 40px 'JetBrains Mono'");await document.fonts.load("800 100px Doto")}catch(e){}
    const name=d.day?T("Kur arena? Dienos iššūkis #","Where's the arena? Daily #")+d.no:T("Kur arena?","Where's the arena?");
    let blob;try{blob=await mgDraw(d,imgs)}catch(e){blob=await mgDraw(d,d.rows.map(()=>null))}
    showShare(blob,name);
  }
  function mgDraw(d,imgs){return new Promise((res,rej)=>{
    const W=1080,n=d.rows.length,top=640,rh=84,H2=top+n*rh+130,c=document.createElement("canvas");c.width=W;c.height=H2;const x=c.getContext("2d");
    const BG="#07090F",CARD="#0F1420",LINE="#1E2638",INK="#E8ECF4",MU="#7A869E",AM="#FFB020",HD="'Barlow Condensed','Arial Narrow',sans-serif",MO="'JetBrains Mono',ui-monospace,monospace",LED="Doto,'JetBrains Mono',monospace";
    const SQ=["#3DF5B0","#FFD43B","#FF922B","#FF5C73"];
    const rr=(a,b,w,h,r)=>{x.beginPath();x.moveTo(a+r,b);x.arcTo(a+w,b,a+w,b+h,r);x.arcTo(a+w,b+h,a,b+h,r);x.arcTo(a,b+h,a,b,r);x.arcTo(a,b,a+w,b,r);x.closePath()};
    const fit=(txt,w,fam,wt,start,min)=>{let s=start;do{x.font=wt+" "+s+"px "+fam;s-=2}while(x.measureText(txt).width>w&&s>min);return s};
    x.fillStyle=BG;x.fillRect(0,0,W,H2);
    const g=x.createRadialGradient(W/2,-80,0,W/2,-80,760);g.addColorStop(0,"rgba(255,176,32,.20)");g.addColorStop(1,"rgba(255,176,32,0)");x.fillStyle=g;x.fillRect(0,0,W,H2);
    x.textBaseline="alphabetic";x.textAlign="left";
    x.fillStyle=AM;x.fillRect(72,72,96,6);
    x.fillStyle=MU;x.font="500 34px "+HD;x.fillText(T("Krepšinio klubų finansai","Basketball Club Finances"),72,128);
    const ttl=T("Kur arena?","Where's the arena?");fit(ttl,W-144,HD,"700",112,60);x.fillStyle=INK;x.fillText(ttl,72,238);
    x.fillStyle=MU;x.font="400 34px "+MO;x.fillText(d.day?T("Dienos iššūkis #","Daily challenge #")+d.no+" · "+d.day:T("Laisvas žaidimas","Free play"),72,294);
    // LED švieslentė
    const bx=72,by=330,bw=936,bh=190;rr(bx,by,bw,bh,22);x.fillStyle="#05070b";x.fill();
    x.save();rr(bx,by,bw,bh,22);x.clip();x.fillStyle="rgba(255,176,32,.13)";for(let yy=by+4;yy<by+bh;yy+=10)for(let xx=bx+4;xx<bx+bw;xx+=10){x.beginPath();x.arc(xx,yy,1.6,0,Math.PI*2);x.fill()}x.restore();
    rr(bx,by,bw,bh,22);x.strokeStyle="rgba(255,176,32,.32)";x.lineWidth=3;x.stroke();
    x.fillStyle="#8a93a8";x.font="600 26px "+MO;x.fillText(T("TAŠKAI","POINTS"),bx+34,by+50);
    const sc=nf.format(d.total);x.font="800 118px "+LED;x.fillStyle=AM;x.shadowColor="rgba(255,176,32,.75)";x.shadowBlur=26;x.fillText(sc,bx+30,by+160);const sw=x.measureText(sc).width;x.shadowBlur=0;
    x.font="800 44px "+LED;x.fillStyle="rgba(255,176,32,.55)";x.fillText("/ "+nf.format(d.max),bx+46+sw,by+160);
    x.textAlign="right";x.fillStyle="#8a93a8";x.font="600 26px "+MO;x.fillText(T("NUKLYSTA","DISTANCE OFF"),bx+bw-34,by+50);
    x.font="800 54px "+LED;x.fillStyle=AM;x.shadowColor="rgba(255,176,32,.6)";x.shadowBlur=18;x.fillText(nf.format(d.km)+" km",bx+bw-34,by+150);x.shadowBlur=0;x.textAlign="left";
    // spalvoti kvadratėliai
    const q=64,gap=14,qx=(W-(n*q+(n-1)*gap))/2;d.rows.forEach((r,i)=>{rr(qx+i*(q+gap),552,q,q,12);x.fillStyle=SQ[r.sq];x.fill()});
    // klubai
    d.rows.forEach((r,i)=>{
      const y=top+i*rh,h=rh-12;rr(72,y,936,h,18);x.fillStyle=CARD;x.fill();rr(72,y,936,h,18);x.strokeStyle=LINE;x.lineWidth=2;x.stroke();
      rr(92,y+h/2-14,28,28,7);x.fillStyle=SQ[r.sq];x.fill();
      let nx=140;const im=imgs[i];
      if(im){x.save();x.beginPath();x.arc(166,y+h/2,25,0,Math.PI*2);x.closePath();x.fillStyle="#fff";x.fill();x.clip();const k=Math.min(40/im.width,40/im.height);x.drawImage(im,166-im.width*k/2,y+h/2-im.height*k/2,im.width*k,im.height*k);x.restore();nx=206}
      const pt=nf.format(r.p),kmT=nf.format(r.km)+" km";
      x.textAlign="right";x.font="700 36px "+MO;x.fillStyle=r.p>=700?AM:INK;x.fillText(pt,986,y+h/2+13);const pw=x.measureText(pt).width;
      x.font="400 26px "+MO;x.fillStyle=MU;x.fillText(kmT,986-pw-30,y+h/2+10);const kw=x.measureText(kmT).width;x.textAlign="left";
      fit(r.name,986-pw-30-kw-24-nx,HD,"700",40,22);x.fillStyle=INK;x.fillText(r.name,nx,y+h/2+14);
    });
    x.fillStyle=MU;x.font="400 28px system-ui,sans-serif";x.fillText((location.host+location.pathname).replace(/\/$/,"")+"#kur-arena",72,H2-56);
    c.toBlob(b=>b?res(b):rej(new Error("blob")),"image/png");
  })}
  // lentelė atidaroma kaip langas (kaip klubų ir žaidėjų kortelės); „Dalintis“ – virš lentelės
  function lbBody(){
    const cur=LBG.find(g=>g[0]===LBSEL)||LBG[0];
    if(!LBDATA)return`<p class="sum">${LBERR?T("Nepavyko įkelti lentelės.","Could not load the leaderboard."):T("Kraunama…","Loading…")}</p>`;
    const L=(LBDATA.boards||{})[LBSEL]||[],pts=LBSEL.startsWith("map"),me=lbName().toLowerCase();
    return(L.length?`<div class="lb-acts"><button type="button" class="chip lb-shb" data-lbsh="1">${T("Dalintis lentele","Share table")}</button></div>`:"")+
      (LBSEL==="mapday"?`<p class="lb-day">${T("Šiandienos iššūkis","Today's challenge")} · ${esc(LBDATA.day||"")}</p>`:"")+
      (L.length?`<div class="lb-board"><div class="lb-h"><span>${T("VIETA","RANK")}</span><span>${T("VARDAS","NAME")}</span><span>${pts?T("TAŠKAI","SCORE"):T("SERIJA","STREAK")}</span></div><ol class="lb-l">${L.map((r,i)=>`<li class="${(me&&String(r.name).toLowerCase()===me?"me ":"")+(i<3?"t"+(i+1):"")}"><span class="lb-r">${String(i+1).padStart(2,"0")}</span><span class="lb-n">${esc(r.name)}</span>${pts&&r.km!=null?`<small>${nf.format(r.km)} km</small>`:""}<b>${nf.format(r.score)}</b></li>`).join("")}</ol></div>`
        :`<p class="sum">${T("Kol kas rezultatų nėra – būkite pirmas!","No scores yet – be the first!")}</p>`)+
      `<p class="sum lb-note">${LBSEL==="mapday"?T("Dienos iššūkio lentelė prasideda iš naujo kiekvieną dieną (Vilniaus laiku).","The daily table starts over every day (Vilnius time)."):T("Visų laikų rezultatai.","All-time scores.")} ${T("Rodomas geriausias kiekvieno vardo rezultatas.","Best score per name.")}${pts?"":" "+T("Rezultatas – teisingų atsakymų serija.","Score = streak of correct answers.")}</p>`;
  }
  const lbSheet=()=>{const cur=LBG.find(g=>g[0]===LBSEL)||LBG[0];return`<!--sm--><div class="lb-root lbw"><h2>${T(cur[1],cur[2])}</h2><div class="lb-in">${lbBody()}</div></div>`};
  function lbOpen(k){
    if(!LB_URL||typeof show!=="function")return;
    LBSEL=k;LBDATA=null;show(lbSheet());
    const put=()=>{const box=document.querySelector("#sh .lbw .lb-in");if(!box)return;box.innerHTML=lbBody();try{if(H.length)H[H.length-1]=lbSheet()}catch(e){}lbB3()};
    lbLoad(true).then(put);
  }
  const gmChips=()=>{const mc=(k,a,b)=>`<button class="chip" data-gm="${k}" aria-pressed="${GS.mode===k}">${T(a,b)}</button>`;
    return mc("bud","Biudžetas","Budget")+mc("att","Lankomumas","Attendance")+mc("sal","Algos","Salaries")+mc("map","Kur arena?","Where's the arena?")};
  function gmView(){
    if(GS.mode==="map")return`<div class="gm-root"><div class="gm-top">${gmChips()}</div><div class="mg-host"></div></div>`;   // „Kur arena?“ – žemėlapio žaidimas (arenamap.js)
    if(GS.mode==="lb")GS.mode="bud";
    if(!GS.left&&!GS.pool.length)gStart();
    const m=GS.mode,sal=m==="sal",lbl=m==="bud"?T("biudžetas","budget"):T("vid. lankomumas","avg. attendance"),best=GBEST[m]||0;
    const chips=`<div class="gm-top">${gmChips()}<span class="gm-score">${LB_URL?`<button type="button" class="gm-lbb" data-lbopen="${m}">${T("Lentelė","Leaderboard")}</button> · `:""}${T("Serija","Streak")} <b class="led">${String(GS.streak).padStart(2,"0")}</b> · ${T("Rekordas","Best")} <b class="led">${String(best).padStart(2,"0")}</b></span></div>`;
    if(!GS.left)return`<div class="gm-root">${chips}<p class="sum">${T("Per mažai duomenų žaidimui.","Not enough data to play.")}</p></div>`;
    const ph=GS.phase,L=GS.left,R=GS.right,ask=ph==="ask";let cards;
    if(sal){const cl=s=>ask?"":(GS.pick===s?(ph==="ok"?"ok":"bad"):"");cards=gCard(L,!ask,cl("L"),"L",ask)+gCard(R,!ask,cl("R"),"R",ask)}
    else cards=gCard(L,true)+(ask?gCard(R,false):gCard(R,true,ph==="ok"?"ok":"bad"));
    const q=ph==="over"?`<p class="gm-q"><b>${GS.rec?"🏆 ":""}${T("Neteisingai! ","Wrong! ")}</b>${T("Serija: ","Streak: ")}${GS.streak}</p>`
      :sal?`<p class="gm-q">${T("Kuris krepšininkas uždirba daugiau per mėnesį? Palieskite kortelę.","Who earns more per month? Tap a card.")}</p>`
      :`<p class="gm-q">${T("Ar „"+esc(R.club)+"“ "+lbl+" didesnis, ar mažesnis nei „"+esc(L.club)+"“?","Is the "+lbl+" of "+esc(R.club)+" higher or lower than "+esc(L.club)+"?")}</p>`;
    const btns=ph==="over"?`<div class="gm-btns over"><button class="gm-b" data-gr="1">${T("Žaisti dar kartą","Play again")}</button><button class="gm-b" data-gs="1">${T("Dalintis","Share")}</button>${GS.streak>0?lbBtnHtml(GS.saved,"gm-b"):""}</div>`
      :sal?"":`<div class="gm-btns"><button class="gm-b" data-gp="hi" ${!ask?"disabled":""}>▲ ${T("Didesnis","Higher")}</button><button class="gm-b" data-gp="lo" ${!ask?"disabled":""}>▼ ${T("Mažesnis","Lower")}</button></div>`;
    return`<div class="gm-root">${chips}${q}<div class="gm-cards">${cards}</div>${btns}<p class="sum" style="margin-top:12px">${sal?T("Duomenys: visi sezonai","Data: all seasons"):T("Duomenys: sezonas","Data: season")+" "+GS.se}</p></div>`;
  }
  let B3=null;
  // 3D modelis per vidurį tarp dviejų žaidimo kortelių (vienas egzempliorius, perkeliamas po kiekvieno perpiešimo)
  function b3Game(){
    try{
      const o=document.getElementById("out"),cs=o&&o.querySelector(".gm-cards");
      if(!cs||!window.Brazys3D)return;
      if(!B3)B3=Brazys3D.mountCenter(cs);
      else{cs.style.position="relative";cs.appendChild(B3.el)}
    }catch(e){}
  }
  let MGSTART=null;
  function mgMount(){const h=document.querySelector("#out .mg-host");if(!h)return;
    if(window.ArenaMap&&ArenaMap.game){ArenaMap.game(h,{D,T,esc,norm,same,season:"26/27",logo:n=>LOGOS[norm(n)],sheetId:SHEET_ID,start:MGSTART,lb:window.KFLB});MGSTART=null}
    else setTimeout(()=>{if(GM&&GS.mode==="map"&&document.querySelector("#out .mg-host:empty"))mgMount()},300)}
  function renderGm(){const o=document.getElementById("out");if(o&&ok()){o.innerHTML=gmView();if(GS.mode==="map")return mgMount();
    annPreload();b3Game()}}
  function gAct(t){const d=t.dataset;
    if(d.gm!==undefined){GS.mode=d.gm;if(d.gm!=="map")gStart();renderGm();return}
    if(d.lbopen!==undefined){lbOpen(d.lbopen);return}
    if(d.lbo!==undefined){if(!t.closest(".mg"))lbAsk(GS.mode,GS.streak,null,gName(GS.mode)+" · "+T("serija","streak")).then(ok=>{if(ok){GS.saved=true;renderGm()}});return}
    if(d.lbsh!==undefined){lbShare();return}
    if(d.gr!==undefined){gStart();renderGm();return}
    if(d.gs!==undefined){hlShare().catch(()=>{});return}
    if(d.gp!==undefined&&GS.phase==="ask"){
      const good=GS.mode==="sal"?((d.gp==="L")===(GS.left.v>GS.right.v)):(d.gp==="hi"?GS.right.v>GS.left.v:GS.right.v<GS.left.v);GS.pick=d.gp;
      if(good){const prev=GBEST[GS.mode]||0;GS.streak++;GS.phase="ok";let cel=0;if(GS.streak>prev){GBEST[GS.mode]=GS.streak;gSave();if(!GS.rec&&GS.streak>=3){GS.rec=true;cel=1}}if(cel)celebrate(GS.streak);else if(GS.streak%10===0)celebrate(GS.streak,1);
        renderGm();if(B3)B3.react(cel?"record":"ok");clearTimeout(GS.tm);
        GS.tm=setTimeout(()=>{if(GM&&GS.phase==="ok"){if(GS.mode==="sal"){GS.left=gRand();GS.right=gDraw(GS.left)}else{GS.left=GS.right;GS.right=gDraw(GS.left)}GS.phase="ask";renderGm()}},1300)}
      else{GS.phase="over";renderGm();if(B3)B3.react("bad");stage("fail",GS.streak)}}
  }

  // ---- Pranešėjai: rekordas (fejerverkai) ir nesėkmė (liūdnas lietus) ----
  let PX=true;try{PX=localStorage.getItem("kf_px")!=="0"}catch(e){}
  const ANN={win:["ann-w1.jpg","ann-w2.jpg","ann-w3.jpg","ann-w4.jpg","ann-w5.jpg","ann-w6.jpg","ann-w7.jpg","ann-w8.jpg"],fail:["ann-f1.jpg","ann-f2.jpg"]},ANI={};
  const annImg=f=>{if(!ANI[f]){const i=new Image();i.src=base+f;ANI[f]=i}return ANI[f]};
  const annPreload=()=>ANN.win.concat(ANN.fail).forEach(annImg);
  function annPick(kind,sal){const P=ANN[kind].filter(f=>sal||f!=="ann-w8.jpg"),L=P.length;let n=Math.floor(Math.random()*L);try{const p=+localStorage.getItem("kf_l"+kind);if(n===p)n=(n+1)%L;localStorage.setItem("kf_l"+kind,String(n))}catch(e){}return P[n]}
  function ledPortrait(cv,img,sad){
    const c=cv.getContext("2d"),W=cv.width,H=cv.height;c.fillStyle="#05070b";c.fillRect(0,0,W,H);
    if(!img||!img.naturalWidth){c.fillStyle=sad?"#7b8cb8":"#FFB020";c.font=(H*.45)+"px system-ui";c.textAlign="center";c.textBaseline="middle";c.fillText(sad?"😢":"🏆",W/2,H/2);return}
    if(!PX){c.drawImage(img,0,0,W,H);return}
    const N=46,M=Math.max(8,Math.round(N*H/W)),t=document.createElement("canvas");t.width=N;t.height=M;const x=t.getContext("2d",{willReadFrequently:true});
    x.drawImage(img,0,0,N,M);let d;try{d=x.getImageData(0,0,N,M).data}catch(e){c.drawImage(img,0,0,W,H);return}
    const k=W/N;
    for(let y=0;y<M;y++)for(let X=0;X<N;X++){
      const i=(y*N+X)*4;let r=d[i],g=d[i+1],b=d[i+2];const l=(.299*r+.587*g+.114*b)/255;
      if(sad){const L=l*255;r=r*.35+L*.5;g=g*.4+L*.6;b=b*.35+L*.9}
      const dx=(X+.5)/N-.5,dy=(y+.5)/M-.5,vig=Math.max(0,1-Math.pow(Math.hypot(dx,dy)/.72,2.6)),m=(.22+.95*Math.pow(l,.8))*vig,
        f=v=>Math.min(255,Math.round(v*1.35*m+6));
      c.fillStyle=`rgb(${f(r)},${f(g)},${f(b)})`;c.beginPath();c.arc(X*k+k/2,y*k+k/2,k*.43,0,6.3);c.fill()}
  }
  function fireworks(cv,px){
    const W=cv.width=innerWidth,H=cv.height=innerHeight,c=cv.getContext("2d"),P=[],cols=["#FFB020","#FF5C73","#3DF5B0","#E8ECF4","#4DA3FF"],t0=performance.now();
    let next=0,n=0,raf=0,stop=false;
    const burst=(x,y)=>{const col=cols[Math.random()*cols.length|0],k=46+(Math.random()*20|0);
      for(let i=0;i<k;i++){const a=Math.PI*2*i/k+Math.random()*.2,v=2+Math.random()*3.2;P.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:1,c:col,s:px?5:3.5})}};
    (function f(t){
      if(stop)return;const dt=t-t0;c.clearRect(0,0,W,H);
      if(dt>next&&n<7){burst(W*(.15+Math.random()*.7),H*(.12+Math.random()*.35));n++;next+=380}
      for(let i=P.length-1;i>=0;i--){const p=P[i];p.x+=p.vx;p.y+=p.vy;p.vy+=.045;p.vx*=.985;p.l-=.012;
        if(p.l<=0){P.splice(i,1);continue}
        c.globalAlpha=p.l;c.fillStyle=p.c;if(px)c.fillRect(p.x|0,p.y|0,p.s,p.s);else{c.beginPath();c.arc(p.x,p.y,p.s/1.6,0,6.3);c.fill()}}
      c.globalAlpha=1;if(dt<4200||P.length)raf=requestAnimationFrame(f)})(t0);
    return()=>{stop=true;cancelAnimationFrame(raf)};
  }
  function rain(cv){
    const W=cv.width=innerWidth,H=cv.height=innerHeight,c=cv.getContext("2d"),D=[];let raf=0,stop=false;
    for(let i=0;i<150;i++)D.push({x:Math.random()*W,y:Math.random()*H,v:3+Math.random()*3.5,l:8+Math.random()*10});
    (function f(){if(stop)return;c.clearRect(0,0,W,H);c.fillStyle="rgba(130,165,235,.5)";
      for(const p of D){p.y+=p.v;p.x-=p.v*.18;if(p.y>H){p.y=-20;p.x=Math.random()*W}c.fillRect(p.x|0,p.y|0,2,p.l)}
      raf=requestAnimationFrame(f)})();
    return()=>{stop=true;cancelAnimationFrame(raf)};
  }
  function stage(kind,n,ms){
    const old=document.getElementById("cel");if(old)old.remove();
    const fail=kind==="fail",af=annPick(fail?"fail":"win",GS.mode==="sal"),img=annImg(af),cap=af==="ann-w8.jpg"?T("Gerai išmanai kainas, judam toliau!","You know your prices – let's move on!"):"",o=document.createElement("div"),
      still=matchMedia("(prefers-reduced-motion:reduce)").matches,num=String(n).padStart(2,"0");
    o.id="cel";o.className="cel"+(fail?" fail":"");
    const bub=fail?`<small>${T("Žaidimas baigtas","Game over")}</small><b class="led">${T("NEPAVYKO","FAILED")}</b><span class="cel-sub">${T("Serija","Streak")} ${num}</span>`
      :`<small>${ms?T("Jau "+n+" atsakyta!","Already "+n+" answered!"):T("Naujas rekordas!","New record!")}</small><b class="led">${num}</b><span class="cel-sub">${cheer()}</span>`;
    o.innerHTML=`${still?"":'<canvas class="cel-fx"></canvas>'}<div class="cel-box"><div class="cel-phw"><button class="cel-ph" type="button" title="${T("Palieskite – LED / nuotrauka","Tap – LED / photo")}"><canvas></canvas></button>${cap?`<div class="cel-cap">${cap}</div>`:""}</div><div class="cel-bub">${bub}</div></div>`;
    document.body.appendChild(o);
    const pc=o.querySelector(".cel-ph canvas"),draw=()=>{pc.width=480;pc.height=img.naturalWidth?Math.round(480*img.naturalHeight/img.naturalWidth):360;ledPortrait(pc,img,fail)};
    draw();img.addEventListener("load",draw);
    const stopFx=still?()=>{}:(fail?rain(o.querySelector(".cel-fx")):fireworks(o.querySelector(".cel-fx"),PX));
    o.querySelector(".cel-ph").addEventListener("click",()=>{PX=!PX;try{localStorage.setItem("kf_px",PX?"1":"0")}catch(e){}draw()});
    setTimeout(()=>o.classList.add("out"),5200);
    setTimeout(()=>{stopFx();o.remove()},5800);
  }
  const celebrate=(n,ms)=>stage("win",n,ms);
  const CHEERS=[["Judam toliau!","Keep going!"],["Pirmyn!","Onward!"],["Nesustok!","Don't stop!"],["Puiki serija!","Great streak!"]],cheer=()=>{const c=CHEERS[Math.random()*CHEERS.length|0];return T(c[0],c[1])};
  // GM-END

  // ---- Dalijimosi kortelė (klubo lange) ----
  async function shareCard(){
    const sh=document.getElementById("sh");if(!sh)return;
    const lk=sh.querySelector("[data-pkl]");if(lk)return shareList(PKK[lk.dataset.pkl]);
    const h2=sh.querySelector(".cl h2")||sh.querySelector("h2");if(!h2)return;
    const isP=!sh.querySelector(".cl"),name=h2.textContent.trim();
    let sub=((sh.querySelector(".sum")||{}).textContent||"").trim(),
      kp=[...sh.querySelectorAll(".kp div")].slice(0,4).map(d=>[((d.querySelector("small")||{}).textContent||"").trim(),((d.querySelector("b")||{}).textContent||"").trim()]).filter(x=>x[0]&&x[1]);
    const seen=new Set(),uniq=r=>!seen.has(r.season)&&seen.add(r.season);let hist=[],opts={},logoName=name;
    if(isP){
      const rows=D.sal.filter(p=>norm(p.name)===norm(name)).sort((a,b)=>(a.season||"").localeCompare(b.season||"")),last=rows[rows.length-1]||{};
      sub=[last.team,last.role,last.season].filter(Boolean).join(" · ");logoName=last.team||"";
      hist=rows.filter(p=>p.month!=null).reverse().filter(uniq).reverse().slice(-6).map(p=>({l:p.season,v:p.month,t:p.month>=1e6?(p.month/1e6).toFixed(2)+"M":Math.round(p.month/1000)+"k"}));
      opts={hi:2,ry:/rytas/i.test(last.team||""),cap:T("Mėnesio algos pokytis (€)","Monthly salary change (€)")};
    }else{
      if(sh.querySelector(".lc"))hist=D.att.filter(r=>r.avg!=null&&same(r.club,name)).sort((a,b)=>a.season.localeCompare(b.season)).filter(uniq).map(r=>({l:r.season,v:r.avg,t:nf.format(Math.round(r.avg))}));
      else if(sh.querySelector(".tw.ch"))hist=D.bud.filter(r=>r.total!=null&&same(r.club,name)).sort((a,b)=>a.season.localeCompare(b.season)).filter(uniq).map(r=>({l:r.season,v:r.total,t:(r.total/1e6).toFixed(1)+"M"}));
      hist=hist.slice(-6);
    }
    const u=typeof LOGOS!=="undefined"&&LOGOS[norm(logoName)];let img=null;
    if(u)img=await new Promise(res=>{const i=new Image();i.crossOrigin="anonymous";i.onload=()=>res(i);i.onerror=()=>res(null);setTimeout(()=>res(null),4000);i.src=u});
    try{await document.fonts.load("700 100px 'Barlow Condensed'");await document.fonts.load("600 40px 'JetBrains Mono'")}catch(e){}
    let blob;try{blob=await drawCard(name,sub,kp,hist,img,opts)}catch(e){blob=await drawCard(name,sub,kp,hist,null,opts)}
    showShare(blob,name);
  }
  function drawCard(name,sub,kp,hist,img,opts){opts=opts||{};return new Promise((res,rej)=>{
    const W=1080,H=1350,c=document.createElement("canvas");c.width=W;c.height=H;const x=c.getContext("2d");
    const RY=opts.ry!=null?opts.ry:/rytas/i.test(name),BG="#07090F",CARD="#0F1420",LINE="#1E2638",INK="#E8ECF4",MU="#7A869E",AM=RY?"#E4262F":"#FFB020",HD="'Barlow Condensed','Arial Narrow',sans-serif",MO="'JetBrains Mono',ui-monospace,monospace",SS="system-ui,-apple-system,'Segoe UI',sans-serif";
    const fit=(txt,w,fam,wt,start,min)=>{let s=start;do{x.font=wt+" "+s+"px "+fam;s-=2}while(x.measureText(txt).width>w&&s>min);return s};
    const rr=(a,b,w,h,r)=>{x.beginPath();x.moveTo(a+r,b);x.arcTo(a+w,b,a+w,b+h,r);x.arcTo(a+w,b+h,a,b+h,r);x.arcTo(a,b+h,a,b,r);x.arcTo(a,b,a+w,b,r);x.closePath()};
    x.fillStyle=BG;x.fillRect(0,0,W,H);
    const g=x.createRadialGradient(W/2,-80,0,W/2,-80,760);g.addColorStop(0,RY?"rgba(228,38,47,.26)":"rgba(255,176,32,.20)");g.addColorStop(1,RY?"rgba(228,38,47,0)":"rgba(255,176,32,0)");x.fillStyle=g;x.fillRect(0,0,W,H);
    x.strokeStyle="rgba(122,134,158,.22)";x.lineWidth=3;[520,300].forEach(r=>{x.beginPath();x.arc(W,H,r,0,Math.PI*2);x.stroke()});
    x.fillStyle=AM;x.fillRect(72,72,96,6);
    x.fillStyle=MU;x.font="500 34px "+HD;x.textBaseline="alphabetic";x.fillText(T("Krepšinio klubų finansai","Basketball Club Finances"),72,128);
    let nx=72;
    if(img){x.save();x.beginPath();x.arc(152,262,80,0,Math.PI*2);x.closePath();x.fillStyle="#fff";x.fill();x.clip();
      const k=Math.min(124/img.width,124/img.height);x.drawImage(img,152-img.width*k/2,262-img.height*k/2,img.width*k,img.height*k);x.restore();nx=262}
    const ns=fit(name,W-72-nx,HD,"700",124,56);x.fillStyle=INK;x.fillText(name,nx,img?285:300);
    x.fillStyle=MU;x.font="400 38px "+SS;x.fillText(sub.slice(0,60),72,372);
    const cw=468,ch=190,gap=24,y0=430;
    kp.slice(0,4).forEach((p,i)=>{const cx=72+(i%2)*(cw+gap),cy=y0+Math.floor(i/2)*(ch+gap);
      rr(cx,cy,cw,ch,24);x.fillStyle=CARD;x.fill();x.strokeStyle=LINE;x.lineWidth=2;x.stroke();
      fit(p[0],cw-56,SS,"400",28,18);x.fillStyle=MU;x.fillText(p[0],cx+28,cy+56);
      fit(p[1],cw-56,MO,"600",60,26);x.fillStyle=i===(opts.hi||0)?AM:INK;x.fillText(p[1],cx+28,cy+142)});
    if(opts.cap&&kp.length){x.fillStyle=MU;x.font="500 30px "+HD;x.fillText(opts.cap,72,y0+Math.ceil(kp.length/2)*(ch+gap)+56)}
    if(hist.length>1){const n=hist.length,slot=936/n,bw=Math.min(110,slot*.62),base=1190,mh=200,mx=Math.max(...hist.map(h=>h.v));
      hist.forEach((h,i)=>{const bx=72+slot*i+(slot-bw)/2,bh=Math.max(6,h.v/mx*mh);
        x.fillStyle=i===n-1?AM:(RY?"rgba(228,38,47,.38)":"rgba(255,176,32,.38)");rr(bx,base-bh,bw,bh,10);x.fill();
        x.textAlign="center";x.fillStyle=i===n-1?INK:MU;x.font="600 26px "+MO;x.fillText(h.t,bx+bw/2,base-bh-14);
        x.fillStyle=MU;x.font="400 26px "+SS;x.fillText(h.l,bx+bw/2,base+40);x.textAlign="left"})}
    x.fillStyle=MU;x.font="400 28px "+SS;x.textAlign="left";x.fillText((location.host+location.pathname).replace(/\/$/,""),72,H-50);
    c.toBlob(b=>b?res(b):rej(new Error("blob")),"image/png");
  })}
  // Iššokantys langai (paveikslėlis dalinimuisi, vardo įvedimas): telefono „atgal“ ir Esc uždaro viršutinį
  const OVL=[];let OSKIP=0;
  function ovlOpen(close){OVL.push(close);history.pushState({ovl:1},"")}
  function ovlClose(close){const i=OVL.lastIndexOf(close);if(i<0)return;OVL.splice(i,1);close();if(history.state&&history.state.ovl){OSKIP++;history.back()}}
  window.KFPOP=()=>{if(OSKIP>0){OSKIP--;return true}if(OVL.length){OVL.pop()();return true}return false};
  addEventListener("keydown",e=>{if(e.key==="Escape"&&OVL.length){e.preventDefault();e.stopImmediatePropagation();ovlClose(OVL[OVL.length-1])}},true);
  function showShare(blob,name){
    const fn=norm(name)+".png",o=document.createElement("div");o.className="shov";let url,file;
    const set=b=>{if(url)URL.revokeObjectURL(url);url=URL.createObjectURL(b);file=new File([b],fn,{type:"image/png"});const im=o.querySelector(":scope>img"),dl=o.querySelector("a.chip");if(im)im.src=url;if(dl)dl.href=url};
    o.innerHTML=`<img alt=""><div class="row"><button class="chip" data-a="s">${T("Dalintis","Share")}</button><a class="chip" download="${fn}">${T("Atsisiųsti","Download")}</a><button class="chip" data-a="x">${T("Uždaryti","Close")}</button></div>`;
    set(blob);
    const shut=()=>{URL.revokeObjectURL(url);o.remove()};ovlOpen(shut);
    o.addEventListener("click",async e=>{const a=e.target.closest("[data-a]");if(!a)return;
      if(a.dataset.a==="x")ovlClose(shut)
      else if(navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title:name})}catch(x){}}
      else a.textContent=T("Naudokite „Atsisiųsti“","Use “Download”")});
    document.body.appendChild(o);
  }


  // ---- Pasirinkimas (iki 15): biudžetai / lankomumas / žaidėjų algos → sąrašas + dalijimosi kortelė ----
  const PKMAX=15,PK={bud:[],att:[],sal:[]},PKK={b:"bud",a:"att",s:"sal"},PKM={};let PKU=0,PKCUR="bud";
  const pkM={
    bud:[{k:"total",l:["Bendras biudžetas","Total budget"],v:r=>r.total,f:eur},{k:"sal",l:["Atlyginimų biudžetas","Salary budget"],v:r=>r.sal,f:eur},{k:"share",l:["Atlyginimų dalis","Salary share"],v:r=>r.share,f:pct},{k:"chg",l:["Biudžeto pokytis","Budget change"],v:r=>r.chg,f:sg}],
    att:[{k:"avg",l:["Vid. lankomumas","Avg. attendance"],v:r=>r.avg,f:n0},{k:"fill",l:["Užpildymas","Filling rate"],v:r=>r.fill,f:pct},{k:"max",l:["Didžiausias","Highest"],v:r=>r.max,f:n0}],
    sal:[{k:"month",l:["Mėnesio alga","Monthly salary"],v:r=>r.month,f:eur},{k:"value",l:["Sutarties vertė","Contract value"],v:r=>r.value,f:eur}]};
  const pkTitle=k=>k==="bud"?T("Klubų biudžetai","Club budgets"):k==="att"?T("Klubų lankomumas","Club attendance"):T("Žaidėjų algos","Player salaries");
  const pkName=(k,r)=>k==="sal"?r.name:r.club;
  const pkSub=(k,p)=>k==="sal"?[p.row.team,p.season,p.row.role].filter(Boolean).join(" · "):[p.row.country||p.row.nation,p.season].filter(Boolean).join(" · ");
  const pkId=(k,r)=>k==="sal"?norm(r.name)+"|"+r.season+"|"+norm(r.team||""):norm(r.club)+"|"+(r.season||S.season)+"|"+norm(r.country||r.nation||"");
  const pkLogoUrl=(k,r)=>typeof LOGOS!=="undefined"&&LOGOS[norm(k==="sal"?(r.team||""):r.club)];
  const pkMetric=k=>{const M=pkM[k];if(PKM[k]&&M.some(m=>m.k===PKM[k]))return PKM[k];const sk=S.sort&&S.sort[k]&&S.sort[k][0];return(M.find(m=>m.k===sk)||M[0]).k};
  const pkSorted=k=>{const m=pkM[k].find(x=>x.k===pkMetric(k));return[...PK[k]].sort((a,b)=>{const x=m.v(a.row),y=m.v(b.row),nx=x==null,ny=y==null;if(nx||ny)return nx-ny;return y-x})};
  function pkToast(t){let e=document.getElementById("pktoast");if(!e){e=document.createElement("div");e.id="pktoast";e.setAttribute("role","status");document.body.appendChild(e)}e.textContent=t;e.classList.add("on");clearTimeout(pkToast.t);pkToast.t=setTimeout(()=>e.classList.remove("on"),1900)}
  function pkBar(){
    let b=document.getElementById("pkbar");const k=S.tab,L=PK[k];
    if(!L||!L.length||document.body.classList.contains("lk")){if(b&&!b.hidden)b.hidden=true;return}
    const h=`<span class="pk-n"><b>${L.length}</b>/${PKMAX}</span><button type="button" class="pk-go" data-pka="open">${T("Rodyti sąrašą","Show list")}</button><button type="button" class="pk-cl" data-pka="clear" aria-label="${T("Išvalyti","Clear")}">✕</button>`;
    if(!b){b=document.createElement("div");b.id="pkbar";document.body.appendChild(b)}
    if(b.dataset.s!==h){b.dataset.s=h;b.innerHTML=h}
    if(b.hidden)b.hidden=false;
  }
  function pickEnhance(){
    const k=S.tab;
    if(PK[k]){
      // be getComputedStyle – „position:relative“ nustato CSS (#out tr.c>td:first-child), todėl puslapio stilius neperskaičiuojamas papildomai
      const rows=[...document.querySelectorAll("#out tr.c:not([data-pk])")].map(tr=>({tr,td:tr.querySelector("td"),r:V[+tr.dataset.i]}));
      const sel=new Set(PK[k].map(p=>p.id)),lab=T("Pasirinkti palyginimui","Select");
      rows.forEach(({tr,td,r})=>{tr.dataset.pk=1;if(!td||!r)return;
        td.insertAdjacentHTML("beforeend",`<button type="button" class="pk" data-pk="${tr.dataset.i}" aria-pressed="${sel.has(pkId(k,r))}" aria-label="${lab}"></button>`)});
    }
    pkBar();
  }
  function pkToggle(btn){
    const k=S.tab,r=V[+btn.dataset.pk];if(!r||!PK[k])return;
    const id=pkId(k,r),L=PK[k],i=L.findIndex(p=>p.id===id);
    if(i>=0)L.splice(i,1);
    else{if(L.length>=PKMAX){pkToast(T("Daugiausia "+PKMAX+" pasirinkimų","Maximum "+PKMAX+" selections"));return}L.push({u:++PKU,id,row:r,season:r.season||S.season})}
    btn.setAttribute("aria-pressed",String(i<0));pkBar();
  }
  function pkListHTML(k){
    const M=pkM[k],mk=pkMetric(k),m=M.find(x=>x.k===mk),rows=pkSorted(k),mx=Math.max(1e-9,...rows.map(p=>Math.abs(m.v(p.row)||0)));
    return `<h2>${esc(pkTitle(k))}</h2><p class="sum">${rows.length}/${PKMAX} · ${esc(T(m.l[0],m.l[1]))}</p><div class="bar n">${M.map(x=>`<button type="button" class="chip" data-pkm="${x.k}" aria-pressed="${x.k===mk}">${esc(T(x.l[0],x.l[1]))}</button>`).join("")}</div>`
      +`<ol class="pkl" data-pkl="${k[0]}">${rows.map((p,i)=>{const v=m.v(p.row),w=v==null?0:Math.max(3,Math.abs(v)/mx*100);
        return `<li><i class="pkb" style="--w:${w.toFixed(1)}%"></i><span class="pkr">${i+1}</span><span class="pkn"><b>${esc(pkName(k,p.row))}</b><small>${esc(pkSub(k,p))}</small></span><span class="pkv">${m.f(v)}</span><button type="button" class="pkx" data-pkx="${p.u}" aria-label="${T("Pašalinti","Remove")}">×</button></li>`}).join("")}</ol>`
      +`<p class="sum">${T("Grįžkite atgal ir pasirinkite dar (iki "+PKMAX+"). Paspaudę „Dalintis“ gausite kortelę su visu sąrašu.","Go back to add more (up to "+PKMAX+"). Press “Share” to get a card with the whole list.")}</p>`;
  }
  function pkOpen(){const k=S.tab;if(!PK[k]||!PK[k].length)return;PKCUR=k;show(pkListHTML(k))}
  function pkRefresh(){
    const sh=document.getElementById("sh"),st=sh?sh.scrollTop:0,k=PKCUR;
    if(!PK[k].length){closeAll();return}
    H[H.length-1]=pkListHTML(k);draw();requestAnimationFrame(()=>{if(sh)sh.scrollTop=st});
  }
  async function shareList(k){
    const m=pkM[k].find(x=>x.k===pkMetric(k)),rows=pkSorted(k);if(!rows.length)return;
    const imgs=await Promise.all(rows.map(p=>{const u=pkLogoUrl(k,p.row);return u?new Promise(res=>{const i=new Image();i.crossOrigin="anonymous";i.onload=()=>res(i);i.onerror=()=>res(null);setTimeout(()=>res(null),4000);i.src=u}):null}));
    try{await document.fonts.load("700 100px 'Barlow Condensed'");await document.fonts.load("600 40px 'JetBrains Mono'")}catch(e){}
    let blob;try{blob=await drawList(k,rows,m,imgs)}catch(e){blob=await drawList(k,rows,m,rows.map(()=>null))}
    showShare(blob,pkTitle(k));
  }
  function drawList(k,rows,m,imgs){return new Promise((res,rej)=>{
    const W=1080,n=rows.length,top=372,rh=88,H2=Math.max(1350,top+n*rh+170),c=document.createElement("canvas");c.width=W;c.height=H2;const x=c.getContext("2d");
    const RY=k!=="sal"&&rows.every(p=>/rytas/i.test(p.row.club||""))||(k==="sal"&&rows.every(p=>/rytas/i.test(p.row.team||""))),BG="#07090F",CARD="#0F1420",LINE="#1E2638",INK="#E8ECF4",MU="#7A869E",AM=RY?"#E4262F":"#FFB020",HD="'Barlow Condensed','Arial Narrow',sans-serif",MO="'JetBrains Mono',ui-monospace,monospace",SS="system-ui,-apple-system,'Segoe UI',sans-serif";
    const fit=(txt,w,fam,wt,start,min)=>{let s=start;do{x.font=wt+" "+s+"px "+fam;s-=2}while(x.measureText(txt).width>w&&s>min);return s};
    const rr=(a,b,w,h,r)=>{x.beginPath();x.moveTo(a+r,b);x.arcTo(a+w,b,a+w,b+h,r);x.arcTo(a+w,b+h,a,b+h,r);x.arcTo(a,b+h,a,b,r);x.arcTo(a,b,a+w,b,r);x.closePath()};
    x.fillStyle=BG;x.fillRect(0,0,W,H2);
    const g=x.createRadialGradient(W/2,-80,0,W/2,-80,760);g.addColorStop(0,"rgba(255,176,32,.20)");g.addColorStop(1,"rgba(255,176,32,0)");x.fillStyle=g;x.fillRect(0,0,W,H2);
    x.strokeStyle="rgba(122,134,158,.22)";x.lineWidth=3;[520,300].forEach(r=>{x.beginPath();x.arc(W,H2,r,0,Math.PI*2);x.stroke()});
    x.textBaseline="alphabetic";x.textAlign="left";
    x.fillStyle=AM;x.fillRect(72,72,96,6);
    x.fillStyle=MU;x.font="500 34px "+HD;x.fillText(T("Krepšinio klubų finansai","Basketball Club Finances"),72,128);
    fit(pkTitle(k),W-144,HD,"700",112,60);x.fillStyle=INK;x.fillText(pkTitle(k),72,250);
    x.fillStyle=MU;x.font="400 36px "+SS;x.fillText(T(m.l[0],m.l[1])+" · "+n+" "+T(n===1?"įrašas":"įrašai","entries"),72,312);
    let nEnd=0,vS=1008;const vals=rows.map(p=>m.v(p.row)),mx=Math.max(1e-9,...vals.map(v=>Math.abs(v||0)));
    rows.forEach((p,i)=>{
      const y=top+i*rh,w=936,v=vals[i];
      rr(72,y,w,rh-12,18);x.fillStyle=CARD;x.fill();
      if(v!=null){x.save();rr(72,y,w,rh-12,18);x.clip();x.fillStyle=i===0?(RY?"rgba(228,38,47,.30)":"rgba(255,176,32,.26)"):(RY?"rgba(228,38,47,.14)":"rgba(255,176,32,.12)");x.fillRect(72,y,Math.max(8,w*Math.abs(v)/mx),rh-12);x.restore()}
      rr(72,y,w,rh-12,18);x.strokeStyle=LINE;x.lineWidth=2;x.stroke();
      x.textAlign="center";x.fillStyle=i===0?AM:MU;x.font="600 30px "+MO;x.fillText(String(i+1),112,y+49);x.textAlign="left";
      let nx=158;const im=imgs[i];
      if(im){x.save();x.beginPath();x.arc(178,y+(rh-12)/2,26,0,Math.PI*2);x.closePath();x.fillStyle="#fff";x.fill();x.clip();const q=Math.min(40/im.width,40/im.height);x.drawImage(im,178-im.width*q/2,y+(rh-12)/2-im.height*q/2,im.width*q,im.height*q);x.restore();nx=222}
      const vt=m.f(v),vs=fit(vt,300,MO,"600",34,20),vw=x.measureText(vt).width;
      x.textAlign="right";x.fillStyle=i===0?AM:INK;x.font="600 "+vs+"px "+MO;x.fillText(vt,1008-22,y+50);x.textAlign="left";
      const nm=pkName(k,p.row),sub=pkSub(k,p),room=1008-22-vw-24-nx;
      fit(nm,room,HD,"700",42,22);x.fillStyle=INK;x.fillText(nm,nx,y+39);nEnd=Math.max(nEnd,nx+x.measureText(nm).width);vS=Math.min(vS,986-vw);
      fit(sub,room,SS,"400",21,14);x.fillStyle=MU;x.fillText(sub,nx,y+62);nEnd=Math.max(nEnd,nx+x.measureText(sub).width);
    });
    x.fillStyle=MU;x.font="400 28px "+SS;x.textAlign="left";x.fillText((location.host+location.pathname).replace(/\/$/,""),72,H2-60);
    c.toBlob(b=>b?res(b):rej(new Error("blob")),"image/png");
  })}
  document.addEventListener("click",e=>{
    const el=e.target.closest&&e.target.closest(".pk,[data-pka],[data-pkm],[data-pkx]");if(!el)return;
    e.stopPropagation();e.preventDefault();
    if(el.classList.contains("pk"))return pkToggle(el);
    const d=el.dataset;
    if(d.pka==="open")pkOpen();
    else if(d.pka==="clear"){PK[S.tab]=[];document.querySelectorAll("#out .pk[aria-pressed=true]").forEach(b=>b.setAttribute("aria-pressed","false"));pkBar()}
    else if(d.pkm){const l=document.querySelector("#sh [data-pkl]");if(l){PKCUR=PKK[l.dataset.pkl];PKM[PKCUR]=d.pkm;pkRefresh()}}
    else if(d.pkx){const l=document.querySelector("#sh [data-pkl]");if(l){PKCUR=PKK[l.dataset.pkl];const L=PK[PKCUR],i=L.findIndex(p=>String(p.u)===d.pkx);if(i>=0)L.splice(i,1);pkRefresh()}}
  },true);
  {const st=document.createElement("style");st.id="rd-pk";st.textContent=
   '#out tr.c>td:first-child{padding-right:56px}'+
   '#out .pk{position:absolute;right:10px;top:50%;translate:0 -50%;width:36px;height:36px;border-radius:50%;border:1.5px solid var(--line);background:color-mix(in srgb,var(--card) 82%,transparent);color:var(--mute);cursor:pointer;display:grid;place-items:center;padding:0;font:700 20px/1 var(--tx,system-ui);-webkit-tap-highlight-color:transparent;transition:background .2s,color .2s,transform .15s}'+
   '#out .pk::before{content:"+"}#out .pk:hover{color:var(--ink,#fff);border-color:var(--mute)}#out .pk:active{transform:scale(.92)}'+
   '#out .pk[aria-pressed=true]{background:var(--a,#ffb020);border-color:transparent;color:#111}#out .pk[aria-pressed=true]::before{content:"✓"}'+
   '@media(max-width:720px),(pointer:coarse){#out .pk{top:10px;translate:none}}'+
   '#pkbar{position:fixed;left:50%;bottom:calc(16px + env(safe-area-inset-bottom,0px));translate:-50% 0;z-index:90;display:flex;align-items:center;gap:6px;padding:6px 6px 6px 16px;border-radius:999px;background:color-mix(in srgb,var(--card,#0f1420) 92%,#000);border:1px solid var(--line,#1e2638);box-shadow:0 10px 34px rgba(0,0,0,.5);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}'+
   '#pkbar[hidden]{display:none}body.lk #pkbar{display:none}'+
   '#pkbar .pk-n{font:600 15px var(--mo,ui-monospace,monospace);color:var(--mute)}#pkbar .pk-n b{color:var(--a,#ffb020);font-size:18px}'+
   '#pkbar button{border:0;cursor:pointer;border-radius:999px;font:700 15px var(--tx,system-ui);padding:10px 16px}'+
   '#pkbar .pk-go{background:var(--a,#ffb020);color:#111}#pkbar .pk-cl{background:transparent;color:var(--mute);padding:10px 12px}'+
   '#pktoast{position:fixed;left:50%;bottom:calc(76px + env(safe-area-inset-bottom,0px));translate:-50% 12px;z-index:95;background:#111;color:#fff;border:1px solid #333;padding:10px 16px;border-radius:12px;font:600 14px var(--tx,system-ui);opacity:0;pointer-events:none;transition:opacity .2s,translate .2s}#pktoast.on{opacity:1;translate:-50% 0}'+
   '#sh .pkl{list-style:none;margin:10px 0 0;padding:0;display:grid;gap:8px}'+
   '#sh .pkl li{position:relative;display:grid;grid-template-columns:34px 1fr auto 34px;align-items:center;gap:10px;min-height:62px;padding:8px 8px 8px 12px;border-radius:14px;background:var(--card);border:1px solid var(--line);overflow:hidden}'+
   '#sh .pkl .pkb{position:absolute;left:0;top:0;bottom:0;width:var(--w);background:color-mix(in srgb,var(--a,#ffb020) 16%,transparent);pointer-events:none;border-radius:0 12px 12px 0}'+
   '#sh .pkl li:first-child .pkb{background:color-mix(in srgb,var(--a,#ffb020) 30%,transparent)}'+
   '#sh .pkl li>*{position:relative}#sh .pkl .pkb{position:absolute}'+
   '#sh .pkl .pkr{font:600 16px var(--mo,ui-monospace,monospace);color:var(--mute);text-align:center}#sh .pkl li:first-child .pkr{color:var(--a,#ffb020)}'+
   '#sh .pkl .pkn{min-width:0;display:flex;flex-direction:column}#sh .pkl .pkn b{font:700 18px/1.15 var(--hd,system-ui);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#sh .pkl .pkn small{color:var(--mute);font-size:12.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'+
   '#sh .pkl .pkv{font:600 17px var(--mo,ui-monospace,monospace);white-space:nowrap}#sh .pkl li:first-child .pkv{color:var(--a,#ffb020)}'+
   '#sh .pkl .pkx{width:34px;height:34px;border-radius:50%;border:0;background:transparent;color:var(--mute);font-size:22px;cursor:pointer;display:grid;place-items:center;padding:0}#sh .pkl .pkx:hover{background:color-mix(in srgb,var(--mute) 20%,transparent)}';
   document.head.appendChild(st)}

  document.addEventListener("click",e=>{
    if(MB&&MBQ&&e.target.closest&&e.target.closest("#out .mb-chart")&&!e.target.closest(".mbd")){mbClear();return}
    const t=e.target.closest(".mbt,.gmt,.mapt,.shb,[data-tab],[data-mc],[data-mbs],[data-mbn],[data-mbd],[data-mbx],[data-gp],[data-gm],[data-gr],[data-gs],[data-lbopen],[data-lbo],[data-lbsh]");if(!t)return;
    if(t.dataset.mbx!==undefined){mbClear();const i=document.getElementById("mbq");if(i)i.focus();return}
    if(t.classList.contains("mapt")){MAP=true;MB=false;GM=false;fixTabs();renderMap();return}
    if(t.classList.contains("mbt")){MAP=false;MB=true;GM=false;fixTabs();renderMb();return}
    if(t.classList.contains("gmt")){MAP=false;GM=true;MB=false;fixTabs();renderGm();return}
    if(t.classList.contains("shb")){shareCard().catch(()=>{});return}
    if(t.dataset.tab!==undefined){MAP=false;MB=false;GM=false;return}
    if(GM){gAct(t);return}
    if(!MB)return;
    if(t.dataset.mc!==undefined&&typeof club==="function"){club(t.dataset.mc,t.dataset.mn,MBS,0);return}
    if(t.dataset.mbs!==undefined){MBS=t.dataset.mbs;renderMb()}
    else if(t.dataset.mbn!==undefined){MBN=t.dataset.mbn;MBD="";renderMb()}
    else if(t.dataset.mbd!==undefined){MBD=t.dataset.mbd;renderMb()}
  },true);
  let MGHASH=location.hash==="#kur-arena";
  const mbCheck=()=>{if(!ok())return;
    if(MGHASH){const b=document.querySelector("#tabs .gmt");if(b){MGHASH=false;GS.mode="map";MGSTART="day";b.click();try{history.replaceState(history.state,"",location.pathname+location.search)}catch(x){}return}}if(MB&&!document.querySelector("#out .mb-root"))renderMb();else if(GM&&!document.querySelector("#out .gm-root"))renderGm();else if(MAP&&!document.querySelector("#out .map-root"))renderMap()};
  [["tabs",()=>{fixTabs();mbCheck()}],["out",mbCheck]].forEach(([id,f])=>{const el=document.getElementById(id);if(el)new MutationObserver(f).observe(el,{childList:true})});
  // MB-END

  // ---- Pozicijos pagal medianą (klubo ir žaidėjo lange) ----
  let CTX=null;
  const mF=v=>v>=1e6?(v/1e6).toFixed(1).replace(".",T(",","."))+" M €":nf.format(Math.round(v))+" €";
  const pr=(rows,val,key,minN)=>{const a=rows.map(x=>x[key]).filter(v=>v>0);if(a.length<minN)return null;const md=med(a);return{rank:a.filter(v=>v>val).length+1,n:a.length,md,x:val/md,below:a.filter(v=>v<val).length/(a.length-1)}};
  const pcard=(lab,big,sub,pill,c)=>`<div class="ps-c"><small>${lab}</small><b>${big}</b><span class="ps-s">${sub}</span><i class="ps-p ${c}">${pill}</i></div>`;
  const place=n=>n+" "+T("vieta","place");
  function posSec(title,right,cards){return cards.length?`<div class="ps"><div class="ps-h"><h3>${title}</h3>${right?`<span class="ps-r">${right}</span>`:""}</div><div class="ps-g">${cards.join("")}</div></div>`:""}
  function injectPos(html){
    const sm=html.match(/data-se="(\d\d\/\d\d)"/)||html.match(/sezonas\s+(\d\d\/\d\d)/);let sec="",at;
    const of=T("iš","of");
    if(CTX.k==="c"){
      if(!sm)return html;const se=sm[1],mt=x=>(!CTX.nation||x.nation===CTX.nation||x.country===CTX.nation)&&same(x.club,CTX.name),me=D.bud.find(x=>x.season===se&&x.total>0&&mt(x));if(!me)return html;
      const BNXT=["Belgija","Nyderlandai"],bx=BNXT.includes(me.nation)&&(me.div==null||me.div===1),   // Belgija ir Nyderlandai žaidžia vienoje BNXT lygoje
        S0=D.bud.filter(x=>x.season===se&&x.total>0),L=S0.filter(x=>(bx?BNXT.includes(x.nation):x.nation===me.nation)&&(me.div==null||x.div==null||x.div===me.div)),
        cp=s=>(s||"").split(/\s[-–]\s/)[0].trim().toLowerCase(),comp=(me.eu||"").split(/\s[-–]\s/)[0].trim(),Pp=comp?S0.filter(x=>cp(x.eu)===comp.toLowerCase()):[],
        a=pr(L,me.total,"total",3),b=pr(Pp,me.total,"total",4),c=pr(S0,me.total,"total",20),cs=[];
      if(a)cs.push(pcard(T("Savo lygoje","In the league"),place(a.rank),`${of} ${a.n} · ${a.x.toFixed(1)}× ${T("lygos mediana","league median")} (${mF(a.md)})`,"vs "+(bx?"BNXT":esc(me.nation)),"g"));
      const rg=typeof rlg==="function"?rlg(me):"",rd=rg?pr(S0.filter(x=>rlg(x)===rg),me.total,"total",4):null;
      if(rd)cs.push(pcard(rg==="ABA"?T("ABA lygoje","In ABA League"):T("Latvijos–Estijos lygoje","In Latvian–Estonian League"),place(rd.rank),`${of} ${rd.n} · ${rd.x.toFixed(1)}× ${T("mediana","median")} (${mF(rd.md)})`,"vs "+(rg==="ABA"?T("ABA lyga","ABA League"):T("Latvijos–Estijos lyga","Latvian–Estonian League")),"a"));
      if(b)cs.push(pcard(T("Tarp panašių","Among peers"),place(b.rank),`${of} ${b.n} · ${b.x.toFixed(2)}× ${T("mediana","median")} (${mF(b.md)})`,"vs "+esc(comp),"v"));
      if(c)cs.push(pcard(T("Tarp visų klubų","Among all clubs"),Math.round(c.below*100)+"%",`${T("klubų išleidžia mažiau nei","of clubs spend less than")} ${esc(me.club)}`,`vs ${c.n} ${T("klubų","clubs")}`,"b"));
      sec=posSec(`${T("Biudžeto pozicija","Budget position")} ${se}`,"",cs);
      at=["<h3>Biudžeto pokytis","<h3>Žaidėjai ir algos"];
    }else{
      const h=D.sal.filter(x=>norm(x.name)===norm(CTX.name)&&x.month>0).sort((x,y)=>(x.season||"").localeCompare(y.season||""));if(!h.length)return html;
      const me=h[h.length-1],se=me.season,isC=x=>/coach|treneris/i.test(x.role||""),S0=D.sal.filter(x=>x.season===se&&x.month>0&&isC(x)===isC(me)),
        a=pr(S0.filter(x=>x.team&&x.team===me.team),me.month,"month",3),b=pr(S0.filter(x=>x.country===me.country&&(me.div==null||x.div==null||x.div===me.div)),me.month,"month",5),c=pr(S0,me.month,"month",20),cs=[];
      if(a)cs.push(pcard(T("Savo komandoje","In the team"),place(a.rank),`${of} ${a.n} · ${a.x.toFixed(1)}× ${T("komandos mediana","team median")} (${mF(a.md)})`,"vs "+esc(me.team),"g"));
      if(b)cs.push(pcard(T("Savo šalies lygoje","In the league"),place(b.rank),`${of} ${b.n} · ${b.x.toFixed(1)}× ${T("mediana","median")} (${mF(b.md)})`,"vs "+esc(me.country),"v"));
      if(c)cs.push(pcard(T("Tarp visų","Among all"),Math.round(c.below*100)+"%",`${T("uždirba mažiau nei","earn less than")} ${esc(me.name)}`,`vs ${c.n}`,"b"));
      sec=posSec(`${T("Algos pozicija","Salary position")} ${se}`,"",cs);
      at=["<h3>Mėnesio algos pokytis","<h3>Algų istorija"];
    }
    if(!sec)return html;
    let i=-1;for(const k of at){i=html.indexOf(k);if(i>=0)break}
    return i<0?html+sec:html.slice(0,i)+sec+html.slice(i);
  }
  try{
    const _club=club,_player=player,_show=show;
    club=function(name,nation){CTX={k:"c",name,nation};try{return _club.apply(this,arguments)}finally{CTX=null}};
    player=function(name){CTX={k:"p",name};try{return _player.apply(this,arguments)}finally{CTX=null}};
    show=function(html){if(CTX){try{html=injectPos(html)}catch(e){}}return _show.call(this,html)};
  }catch(e){}
  let raf=0;new MutationObserver(()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(enhance)}).observe(document.body,{childList:true,subtree:true});
  const t=setInterval(()=>{if(!ok())return;clearInterval(t);try{ticker()}catch(x){}try{tmpl()}catch(x){}enhance()},400);
  // Vadovų „tabletės“: paspaudus paryškėja (aura, apšvietimas, natūralios spalvos); President dar iškviečia 3D personažą
  const ppClear=c=>{["--mx","--my","--tx","--ty"].forEach(v=>c.style.removeProperty(v))};
  const ppPing=c=>{c.classList.remove("ping");void c.offsetWidth;c.classList.add("ping");setTimeout(()=>c.classList.remove("ping"),900)};
  // Ryto kortelė: paspaudus „BCL čempionai 2026“ fone atsiranda čempionų nuotrauka
  const bgToggle=e=>{
    const c=e.target.closest&&e.target.closest("#sh [data-bg]");if(!c)return;
    const sh=document.getElementById("sh");if(!sh)return;
    const src=c.dataset.bg,showOn=sh.classList.contains("bg-show"),same=sh.dataset.bgcur===src;
    const paint=()=>{sh.querySelectorAll("[data-bg]").forEach(x=>x.classList.toggle("on",sh.classList.contains("bg-show")&&x.dataset.bg===sh.dataset.bgcur))};
    clearTimeout(bgToggle.t);
    if(showOn&&same){sh.classList.remove("bg-show");paint();bgToggle.t=setTimeout(()=>{if(!sh.classList.contains("bg-show"))sh.classList.remove("bg-photo")},1050);return}
    const go=()=>{sh.dataset.bgcur=src;sh.style.setProperty("--bgph","url("+new URL(src,document.baseURI).href+")");sh.classList.add("bg-photo");void sh.offsetWidth;sh.classList.add("bg-show");paint()};
    if(showOn){sh.classList.remove("bg-show");paint();bgToggle.t=setTimeout(go,900)}else go();
  };
  document.addEventListener("click",bgToggle);
  document.addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target.matches&&e.target.matches("#sh [data-bg]")){e.preventDefault();bgToggle(e)}});
  const ppToggle=e=>{
    const c=e.target.closest&&e.target.closest(".ppl .pp");if(!c)return;
    const w=window.Brazys3D&&Brazys3D.walker;
    if(c.hasAttribute("data-b3d")&&w){e.preventDefault();const was=w.active&&w.active();w.toggle(c);c.classList.toggle("lit",!was)}
    else c.classList.toggle("lit");
    if(c.classList.contains("lit"))ppPing(c);else ppClear(c);
  };
  document.addEventListener("click",ppToggle);
  // Ryto logotipas: paspaudus „įsijungia“ (blykstelėjimas, aura, apšvietimas, detalumas)
  const ryToggle=e=>{
    const f=e.target.closest&&e.target.closest(".ry-fx");if(!f)return;
    RY_LIT=!f.classList.contains("lit");f.classList.toggle("lit",RY_LIT);f.setAttribute("aria-pressed",String(RY_LIT));
    if(RY_LIT){f.classList.remove("ping","burst");void f.offsetWidth;f.classList.add("ping","burst");clearTimeout(f._rt);f._rt=setTimeout(()=>f.classList.remove("ping","burst"),1300)}
    window.RYFX&&RYFX.kick();
  };
  document.addEventListener("click",ryToggle);
  document.addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target.matches&&e.target.matches(".ry-fx")){e.preventDefault();ryToggle(e)}});
  // Ryto logotipo 3D pasvirimas: pelė ARBA pirštas; tarp prisilietimų – lėtas „kvėpavimas“; viskas glotninama rAF
  window.RYFX=(()=>{
    const rm=window.matchMedia?matchMedia("(prefers-reduced-motion: reduce)"):{matches:false};
    let raf=0,tx=0,ty=0,aX=0,aY=0,hover=false,t0=0;
    const cur=()=>document.querySelector("#sh .ry-fx"),cl=v=>Math.max(-1,Math.min(1,v));
    function loop(now){
      raf=0;const f=cur();if(!f)return;if(!t0)t0=now;
      const lit=f.classList.contains("lit");let X=0,Y=0;
      if(hover){X=aX;Y=aY}else if(lit&&!rm.matches){const t=(now-t0)/1000;X=Math.sin(t*.8)*.3;Y=Math.cos(t*.62)*.22}
      const k=hover?.2:.07;tx+=(X-tx)*k;ty+=(Y-ty)*k;
      if(Math.abs(X-tx)<5e-4)tx=X;if(Math.abs(Y-ty)<5e-4)ty=Y;
      f.style.setProperty("--tx",tx.toFixed(3));f.style.setProperty("--ty",ty.toFixed(3));
      if(hover||lit||tx!==X||ty!==Y)raf=requestAnimationFrame(loop);
    }
    const kick=()=>{if(!raf&&!document.hidden)raf=requestAnimationFrame(loop)};
    const aim=e=>{
      const f=e.target.closest&&e.target.closest(".ry-fx");if(!f)return;
      const q=f.getBoundingClientRect(),x=(e.clientX-q.left)/q.width,y=(e.clientY-q.top)/q.height;
      aX=cl(x*2-1);aY=cl(y*2-1);
      f.style.setProperty("--px",(x*100).toFixed(1)+"%");f.style.setProperty("--py",(y*100).toFixed(1)+"%");
      hover=true;kick();
    };
    const rest=()=>{hover=false;kick()};
    document.addEventListener("pointerdown",aim,{passive:true});
    document.addEventListener("pointermove",aim,{passive:true});
    document.addEventListener("pointerout",e=>{const f=e.target.closest&&e.target.closest(".ry-fx");if(f&&!f.contains(e.relatedTarget))rest()});
    document.addEventListener("pointerup",e=>{if(e.pointerType&&e.pointerType!=="mouse")rest()});
    document.addEventListener("pointercancel",rest);
    document.addEventListener("visibilitychange",kick);
    return{kick};
  })();
  RYFX.kick();
  document.addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target.matches&&e.target.matches(".ppl div.pp")){e.preventDefault();ppToggle(e)}});
  document.addEventListener("pointermove",e=>{const c=e.target.closest&&e.target.closest(".ppl .pp.lit");if(!c)return;const r=c.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;c.style.setProperty("--mx",x+"px");c.style.setProperty("--my",y+"px");c.style.setProperty("--tx",(x/r.width*2-1).toFixed(2));c.style.setProperty("--ty",(y/r.height*2-1).toFixed(2))});
  document.addEventListener("pointerout",e=>{const c=e.target.closest&&e.target.closest(".ppl .pp.lit");if(c&&!c.contains(e.relatedTarget)){c.style.removeProperty("--tx");c.style.removeProperty("--ty")}});
  // MAP-START ---- Arenų žemėlapis (kodas: arenamap.js) ----
  function renderMap(){
    const o=document.getElementById("out");
    if(!o||typeof D==="undefined")return;
    o.innerHTML='<div class="map-root"><p class="sum msum" role="button" tabindex="0" aria-expanded="false">'+T("Interaktyvus arenų žemėlapis – klubai ir jų pagrindinės arenos iš lentelės lapo „Arenas“. Paspauskite ant klubo – žemėlapis priartės, kortelėje matysite 26/27 biudžetą, lankomumą ir areną iš viršaus bei iš šono. Artinant atsiranda daugiau klubų.","Interactive arena map – clubs and their main arenas from the Arenas sheet. Click a club to zoom in and see its 26/27 budget, attendance and the arena from above and from the side. More clubs appear as you zoom.")+'</p><div class="map-host"></div></div>';
    const ms=o.querySelector(".msum");if(ms){const tg=()=>{const on=ms.classList.toggle("op");ms.setAttribute("aria-expanded",on)};ms.addEventListener("click",tg);ms.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();tg()}})}   // telefone paaiškinimas suskleistas, paspaudus išsiskleidžia
    if(window.ArenaMap)ArenaMap.mount(o.querySelector(".map-host"),{D,T,esc,norm,same,club,season:"26/27",logo:n=>LOGOS[norm(n)],sheetId:SHEET_ID});
    else setTimeout(()=>{if(MAP&&document.querySelector("#out .map-host:empty"))renderMap()},300);
  }
  // MAP-END
})();
