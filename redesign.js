/* Krepšinio finansai – tema + papildymai. Į index.html įkelkite TIK šią eilutę prieš </body>:
   <script src="redesign.js" defer></script>   (CSS įsikelia pats, visada po esamų stilių) */
(function(){
  if(window.__rd)return;window.__rd=1; // apsauga, jei skriptas įkeltas du kartus
  // 1) CSS visada įkeliamas paskutinis, todėl perrašo senus stilius
  const cs=document.currentScript,base=cs?cs.src.replace(/[^/]*$/,""):"";
  const l=document.createElement("link");l.rel="stylesheet";l.href=base+"redesign.css";document.head.appendChild(l);


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
    const rows=budgetRows().filter(r=>r.total!=null);if(!rows.length)return;
    const col=v=>`var(--${v>=0?"pos":"neg"})`;
    const top=[...rows].sort((a,b)=>b.total-a.total).slice(0,4).map(r=>`<span>${e(r.club)} <b>${M(r.total)}</b>${r.chg!=null?` <b style="color:${col(r.chg)}">${r.chg>=0?"▲":"▼"} ${Math.abs(Math.round(r.chg*100))}%</b>`:""}</span>`);
    const up=rows.filter(r=>r.chg!=null).sort((a,b)=>b.chg-a.chg).slice(0,3).map(r=>`<span>▲ ${e(r.club)} <b style="color:var(--pos)">+${Math.round(r.chg*100)}%</b></span>`);
    const it=[...top,...up].join(""),el=document.createElement("div");
    el.className="tk";el.innerHTML=`<div>${it}${it}</div>`;document.body.prepend(el);
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
  let rzt=0;addEventListener("resize",()=>{clearTimeout(rzt);rzt=setTimeout(()=>{document.querySelectorAll("[data-ft]").forEach(b=>delete b.dataset.ft);fitLed()},150)});
  function leagueFix(){
    const LE="Latvijos–Estijos lyga";
    try{FL[LE]="LVEE";LT2EN[LE]="Latvian–Estonian League";PAIRS.unshift([new RegExp("(?<![\\p{L}])"+LE+"(?![\\p{L}])","gu"),"Latvian–Estonian League"])}catch(e){}
    let ch=0;
    D.att.forEach(r=>{const lv=v=>v==="Latvija"||v==="Estija",real=lv(r.country)?r.country:lv(r.nation)?r.nation:null;if(real&&r.nation!==LE){r.country=real;r.nation=LE;ch++}});
    if(ch&&S.tab==="att")render();
  }
  function enhance(){
    if(!ok())return;
    if(D.att&&!D.att.__le){D.att.__le=1;leagueFix()}
    tape();perFan();
    document.querySelectorAll("#sh .top:not([data-sb])").forEach(tp=>{tp.dataset.sb=1;if(!document.querySelector("#sh .cl h2"))return;
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
      const h=D.bud.filter(x=>x.total!=null&&x.nation===r.nation&&same(x.club,r.club)).sort((a,b)=>a.season.localeCompare(b.season)).map(x=>x.total);
      td.insertAdjacentHTML("afterbegin",spark(h))});
    document.querySelectorAll("#sh .kp div:not([data-e])").forEach(d=>{
      d.dataset.e=1;if(!/Užpildymas|Filling rate/.test(d.querySelector("small")?.textContent||""))return;
      const p=pc(d.querySelector("b")?.textContent);if(p!=null){d.classList.add("hasg");d.insertAdjacentHTML("beforeend",gauge(p))}});
    const she=document.getElementById("sh");if(she)she.classList.toggle("is-ry",!!she.querySelector(".cl.ry"));
    fitLed();
    // Klubų logotipai (naudoja jūsų esamą logos.json ir logo() funkciją)
    if(typeof LOGOS!=="undefined")document.querySelectorAll("#sh .cl h2:not([data-lg])").forEach(h=>{
      h.dataset.lg=1;
      if(/rytas/i.test(h.textContent)){const cl=h.closest(".cl");if(cl){cl.classList.add("ry");cl.insertAdjacentHTML("beforeend",`<img class="ry-logo" src="${base}rytas-logo.png" alt="" onerror="this.parentNode.classList.remove('ry');this.remove()">`)}return}
      if(h.previousElementSibling&&h.previousElementSibling.classList.contains("rl"))return;h.insertAdjacentHTML("beforebegin",lgo(h.textContent))});
    document.querySelectorAll(".kp div b:not([data-l])").forEach(b=>{b.dataset.l=1;if(b.textContent.trim().length>13)b.classList.add("long")});
  }


  // #logos režimas: atidarykite puslapį su /#logos ir gausite logos.json šabloną
  function tmpl(){
    if(location.hash!=="#logos"||document.getElementById("lgt")||typeof clubList!=="function")return;
    const o={};clubList().forEach(c=>o[c.name]="logos/");
    const t=document.createElement("textarea");t.id="lgt";t.readOnly=true;t.rows=10;t.value=JSON.stringify(o,null,1);
    t.style.cssText="display:block;width:calc(100% - 24px);margin:12px;font:12px var(--mono);background:var(--card);color:var(--ink);border:1px solid var(--line);border-radius:8px;padding:8px";
    document.body.prepend(t);
  }

  // MB-START ---- Moneyball skirtukas: biudžeto vieta lygoje prieš galutinę vietą ----
  let MB=false,MBS=null,MBN="",MBQ="";
  const T=(lt,en)=>(typeof LANG!=="undefined"&&LANG==="en")?en:lt;
  function mbData(se){
    const g={};budgetRows(se).filter(r=>r.total!=null&&r.place!=null).forEach(r=>{const k=r.nation+"|"+(r.div==null?"":r.div);(g[k]=g[k]||[]).push(r)});
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
    let all=mbData(MBS);const nations=[...new Set(all.map(p=>p.r.nation))].sort();
    if(MBN&&!nations.includes(MBN))MBN="";
    const pts=MBN?all.filter(p=>p.r.nation===MBN):all;
    const W=340,H=330,L=30,R=14,Tp=16,B=36,X=v=>L+v*(W-L-R),Y=v=>Tp+v*(H-Tp-B),hs=s=>[...s].reduce((a,c)=>(a*31+c.charCodeAt(0))%1000,7)/1000;
    const col=p=>{const k=p.d/(p.n-1);return k>=.2?"var(--pos)":k<=-.2?"var(--neg)":"var(--mute)"};
    const ex=[...pts].sort((a,b)=>b.d/b.n-a.d/a.n),lab=MBN?new Set([...ex.slice(0,3),...ex.slice(-3)].map(p=>p.r)):new Set();
    const dots=pts.map(p=>{const h=hs(p.r.club),cx=X(Math.min(1,Math.max(0,p.x+(h-.5)*.03))),cy=Y(Math.min(1,Math.max(0,p.y+(((h*7)%1)-.5)*.03))),
      t=lab.has(p.r)?`<text x="${(cx+(p.x>.7?-8:8)).toFixed(1)}" y="${(cy+3).toFixed(1)}" text-anchor="${p.x>.7?"end":"start"}" font-size="8.5" fill="var(--ink)" pointer-events="none">${esc(p.r.club)}</text>`:"";
      return`<g class="mbd" data-mc="${esc(p.r.club)}" data-mn="${esc(p.r.nation)}" data-sr="${p.sr}" data-pr="${p.pr}" data-n="${p.n}"><title>${esc(p.r.club)} · #${p.sr} → #${p.pr}</title><circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="12" fill="transparent"/><circle class="dot" cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="5" fill="${col(p)}" fill-opacity=".9" stroke="var(--card)" stroke-width="1.5"/>${t}</g>`}).join("");
    const q=(x,y,a,s)=>`<text x="${x}" y="${y}" text-anchor="${a}" font-size="8.5" fill="var(--mute)">${s}</text>`;
    const svg=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Moneyball"><polygon points="${X(0)},${Y(0)} ${X(1)},${Y(0)} ${X(0)},${Y(1)}" fill="var(--pos)" fill-opacity=".07"/><polygon points="${X(1)},${Y(0)} ${X(1)},${Y(1)} ${X(0)},${Y(1)}" fill="var(--neg)" fill-opacity=".07"/><rect x="${X(0)}" y="${Y(0)}" width="${X(1)-X(0)}" height="${Y(1)-Y(0)}" fill="none" stroke="var(--line)"/><line x1="${X(0)}" y1="${Y(1)}" x2="${X(1)}" y2="${Y(0)}" stroke="var(--mute)" stroke-opacity=".5" stroke-dasharray="3 4"/>`
      +q(X(0)+6,Y(0)+12,"start",T("Mažai išleidžia, bet laimi","Spends little, wins"))+q(X(1)-6,Y(0)+12,"end",T("Daug išleidžia ir laimi","Spends big, wins"))
      +q(X(1)-6,Y(1)-6,"end",T("Daug išleidžia, bet pralaimi","Spends big, loses"))+q(X(0)+6,Y(1)-6,"start",T("Mažai išleidžia ir pralaimi","Spends little, loses"))
      +`<text x="${(L+W-R)/2}" y="${H-10}" text-anchor="middle" font-size="9.5" fill="var(--mute)">${T("Biudžetas savo lygoje →","Budget within own league →")}</text><text transform="translate(10 ${(Tp+H-B)/2}) rotate(-90)" text-anchor="middle" font-size="9.5" fill="var(--mute)">${T("← geresnė vieta","← better finish")}</text>`+dots+`</svg>`;
    const row=(p,i)=>`<button class="mb-row" data-mc="${esc(p.r.club)}" data-mn="${esc(p.r.nation)}"><span class="mb-rk">${i+1}</span><span><b>${flag(p.r.nation)}${esc(p.r.club)}</b><small>${T("biudžetas","budget")} #${p.sr}/${p.n} → ${T("vieta","place")} #${p.pr}</small></span><span class="mb-d ${p.d>0?"pos":"neg"}">${p.d>0?"+":""}${p.d}</span></button>`;
    const over=pts.filter(p=>p.d>0).sort((a,b)=>b.d-a.d||b.d/b.n-a.d/a.n).slice(0,5),under=pts.filter(p=>p.d<0).sort((a,b)=>a.d-b.d||a.d/a.n-b.d/b.n).slice(0,5);
    return`<div class="mb-root"><div class="bar n">${seasons.map(s=>`<button class="chip" data-mbs="${s}" aria-pressed="${s===MBS}">${T("Sezonas","Season")} ${s}</button>`).join("")}</div>
<div class="bar n"><button class="chip" data-mbn="" aria-pressed="${!MBN}">${T("Visos","All")}</button>${nations.map(n=>`<button class="chip" data-mbn="${esc(n)}" aria-pressed="${MBN===n}">${flag(n)}${esc(n)}</button>`).join("")}</div>
<p class="sum">${T("Kiekvienas taškas – klubas. Palyginta su savo lygos varžovais: kiek išleidžia ir kurią vietą užėmė. Virš punktyrinės linijos – klubai, pasiekę daugiau nei leidžia jų biudžetas.","Each dot is a club, compared with rivals in its own league: how much it spends versus where it finished. Above the dashed line are clubs that achieved more than their budget suggests.")}</p>
<div class="mb-find"><input id="mbq" class="mb-q" type="search" list="mbl" autocomplete="off" placeholder="${T("Rasti klubą grafike…","Find a club on the chart…")}" value="${esc(MBQ)}"><datalist id="mbl">${pts.map(p=>`<option value="${esc(p.r.club)}">`).join("")}</datalist><button class="mb-x" type="button" data-mbx aria-label="${T("Išvalyti","Clear")}" ${MBQ?"":"hidden"}>✕</button><span class="mb-hit"></span></div>
<div class="mb-chart">${svg}</div>
<div class="mb-cols"><div><h3>${T("Pralenkia savo biudžetą","Beating their budget")}</h3><div class="mb-list">${over.map(row).join("")||"–"}</div></div><div><h3>${T("Neatitinka savo biudžeto","Below their budget")}</h3><div class="mb-list">${under.map(row).join("")||"–"}</div></div></div></div>`;
  }
  function renderMb(){const o=document.getElementById("out");if(o&&ok()){o.innerHTML=mbView();mbHi()}}
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
    gs.forEach(g=>{g.classList.add("on");g.querySelectorAll("text").forEach(x=>x.remove());svg.appendChild(g);
      const c=g.querySelector(".dot"),cx=+c.getAttribute("cx"),cy=+c.getAttribute("cy"),left=cx>vw*.62;
      const r=document.createElementNS(NS,"circle");r.setAttribute("class","mb-ring");r.setAttribute("cx",cx);r.setAttribute("cy",cy);r.setAttribute("r",5);g.appendChild(r);
      const t=document.createElementNS(NS,"text");t.setAttribute("class","mb-lbl");t.setAttribute("x",cx+(left?-11:11));t.setAttribute("y",cy+3.5);t.setAttribute("text-anchor",left?"end":"start");t.textContent=g.dataset.mc;g.appendChild(t)});
    const f=gs[0];if(hit)hit.textContent=f.dataset.mc+" · "+T("biudžetas","budget")+" #"+f.dataset.sr+"/"+f.dataset.n+" → "+T("vieta","place")+" #"+f.dataset.pr;
  }
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&MB&&MBQ&&document.activeElement&&document.activeElement.id==="mbq")mbClear()});
  document.addEventListener("input",e=>{if(e.target&&e.target.id==="mbq"){e.stopPropagation();MBQ=e.target.value;mbHi()}},true);
  function fixTabs(){const tb=document.getElementById("tabs");if(!tb||!tb.children.length)return;
    [["mbt","Moneyball",MB],["gmt",T("Žaidimas","Game"),GM]].forEach(([c,l,on])=>{let b=tb.querySelector("."+c);
      if(!b){b=document.createElement("button");b.className=c;b.setAttribute("role","tab");b.textContent=l;tb.appendChild(b)}
      b.setAttribute("aria-selected",String(on))});
    if(MB||GM)tb.querySelectorAll("button:not(.mbt):not(.gmt)").forEach(x=>x.setAttribute("aria-selected","false"))}

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
    const P=gPool(GS.mode);GS.pool=P.items;GS.se=P.se;GS.used=new Set();GS.streak=0;GS.phase="ask";GS.rec=false;clearTimeout(GS.tm);
    if(GS.pool.length<6){GS.left=null;GS.right=null;return}
    GS.left=gRand();GS.right=gDraw(GS.left);
  }
  const gv=(m,v)=>m==="bud"?(v/1e6).toFixed(1)+"M €":m==="sal"?nf.format(Math.round(v))+" €":nf.format(Math.round(v));
  function gCard(c,show,cls,side,ask){
    const inner=`${lgo(c.team||c.club)}<div class="gm-n">${flag(c.nation)}${esc(c.club)}</div>${c.sub?`<small class="gm-s">${esc(c.sub)}</small>`:""}<div class="gm-v">${show?gv(GS.mode,c.v):"?"}</div>`;
    return side?`<button class="gm-card gm-pick ${cls||""}" data-gp="${side}" ${ask?"":"disabled"}>${inner}</button>`:`<div class="gm-card ${cls||""}">${inner}</div>`}
  function gmView(){
    if(!GS.left&&!GS.pool.length)gStart();
    const m=GS.mode,sal=m==="sal",lbl=m==="bud"?T("biudžetas","budget"):T("vid. lankomumas","avg. attendance"),best=GBEST[m]||0;
    const mc=(k,a,b)=>`<button class="chip" data-gm="${k}" aria-pressed="${m===k}">${T(a,b)}</button>`;
    const chips=`<div class="gm-top">${mc("bud","Biudžetas","Budget")}${mc("att","Lankomumas","Attendance")}${mc("sal","Algos","Salaries")}<span class="gm-score">${T("Serija","Streak")} <b class="led">${String(GS.streak).padStart(2,"0")}</b> · ${T("Rekordas","Best")} <b class="led">${String(best).padStart(2,"0")}</b></span></div>`;
    if(!GS.left)return`<div class="gm-root">${chips}<p class="sum">${T("Per mažai duomenų žaidimui.","Not enough data to play.")}</p></div>`;
    const ph=GS.phase,L=GS.left,R=GS.right,ask=ph==="ask";let cards;
    if(sal){const cl=s=>ask?"":(GS.pick===s?(ph==="ok"?"ok":"bad"):"");cards=gCard(L,!ask,cl("L"),"L",ask)+gCard(R,!ask,cl("R"),"R",ask)}
    else cards=gCard(L,true)+(ask?gCard(R,false):gCard(R,true,ph==="ok"?"ok":"bad"));
    const q=ph==="over"?`<p class="gm-q"><b>${GS.rec?"🏆 ":""}${T("Neteisingai! ","Wrong! ")}</b>${T("Serija: ","Streak: ")}${GS.streak}</p>`
      :sal?`<p class="gm-q">${T("Kuris krepšininkas uždirba daugiau per mėnesį? Palieskite kortelę.","Who earns more per month? Tap a card.")}</p>`
      :`<p class="gm-q">${T("Ar „"+esc(R.club)+"“ "+lbl+" didesnis, ar mažesnis nei „"+esc(L.club)+"“?","Is the "+lbl+" of "+esc(R.club)+" higher or lower than "+esc(L.club)+"?")}</p>`;
    const btns=ph==="over"?`<div class="gm-btns"><button class="gm-b" data-gr="1">${T("Žaisti dar kartą","Play again")}</button><button class="gm-b" data-gs="1">${T("Dalintis rezultatu","Share score")}</button></div>`
      :sal?"":`<div class="gm-btns"><button class="gm-b" data-gp="hi" ${!ask?"disabled":""}>▲ ${T("Didesnis","Higher")}</button><button class="gm-b" data-gp="lo" ${!ask?"disabled":""}>▼ ${T("Mažesnis","Lower")}</button></div>`;
    return`<div class="gm-root">${chips}${q}<div class="gm-cards">${cards}</div>${btns}<p class="sum" style="margin-top:12px">${sal?T("Duomenys: visi sezonai","Data: all seasons"):T("Duomenys: sezonas","Data: season")+" "+GS.se}</p></div>`;
  }
  function renderGm(){const o=document.getElementById("out");if(o&&ok()){o.innerHTML=gmView();annPreload()}}
  function gAct(t){const d=t.dataset;
    if(d.gm!==undefined){GS.mode=d.gm;gStart();renderGm();return}
    if(d.gr!==undefined){gStart();renderGm();return}
    if(d.gs!==undefined){
      const txt=T("Aukščiau ar žemiau: ","Higher or lower: ")+GS.streak+T(" iš eilės (",", streak (")+(GS.mode==="bud"?T("biudžetai","budgets"):GS.mode==="sal"?T("algos","salaries"):T("lankomumas","attendance"))+") – "+location.href.split("#")[0];
      if(navigator.share)navigator.share({text:txt}).catch(()=>{});else if(navigator.clipboard)navigator.clipboard.writeText(txt).then(()=>{t.textContent=T("Nukopijuota","Copied")}).catch(()=>{});
      return}
    if(d.gp!==undefined&&GS.phase==="ask"){
      const good=GS.mode==="sal"?((d.gp==="L")===(GS.left.v>GS.right.v)):(d.gp==="hi"?GS.right.v>GS.left.v:GS.right.v<GS.left.v);GS.pick=d.gp;
      if(good){const prev=GBEST[GS.mode]||0;GS.streak++;GS.phase="ok";let cel=0;if(GS.streak>prev){GBEST[GS.mode]=GS.streak;gSave();if(!GS.rec&&GS.streak>=3){GS.rec=true;cel=1}}if(cel)celebrate(GS.streak);else if(GS.streak%10===0)celebrate(GS.streak,1);
        renderGm();clearTimeout(GS.tm);
        GS.tm=setTimeout(()=>{if(GM&&GS.phase==="ok"){if(GS.mode==="sal"){GS.left=gRand();GS.right=gDraw(GS.left)}else{GS.left=GS.right;GS.right=gDraw(GS.left)}GS.phase="ask";renderGm()}},1300)}
      else{GS.phase="over";renderGm();stage("fail",GS.streak)}}
  }

  // ---- Pranešėjai: rekordas (fejerverkai) ir nesėkmė (liūdnas lietus) ----
  let PX=true;try{PX=localStorage.getItem("kf_px")!=="0"}catch(e){}
  const ANN={win:["ann-w1.jpg","ann-w2.jpg","ann-w3.jpg","ann-w4.jpg","ann-w5.jpg","ann-w6.jpg","ann-w7.jpg","ann-w8.jpg"],fail:["ann-f1.jpg","ann-f2.jpg"]},ANI={};
  const annImg=f=>{if(!ANI[f]){const i=new Image();i.src=base+f;ANI[f]=i}return ANI[f]};
  const annPreload=()=>ANN.win.concat(ANN.fail).forEach(annImg);
  function annPick(kind){const L=ANN[kind].length;let n=Math.floor(Math.random()*L);try{const p=+localStorage.getItem("kf_l"+kind);if(n===p)n=(n+1)%L;localStorage.setItem("kf_l"+kind,String(n))}catch(e){}return ANN[kind][n]}
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
    const fail=kind==="fail",img=annImg(annPick(fail?"fail":"win")),o=document.createElement("div"),
      still=matchMedia("(prefers-reduced-motion:reduce)").matches,num=String(n).padStart(2,"0");
    o.id="cel";o.className="cel"+(fail?" fail":"");
    const bub=fail?`<small>${T("Žaidimas baigtas","Game over")}</small><b class="led">${T("NEPAVYKO","FAILED")}</b><span class="cel-sub">${T("Serija","Streak")} ${num}</span>`
      :`<small>${ms?T("Jau "+n+" atsakyta!","Already "+n+" answered!"):T("Naujas rekordas!","New record!")}</small><b class="led">${num}</b><span class="cel-sub">${cheer()}</span>`;
    o.innerHTML=`${still?"":'<canvas class="cel-fx"></canvas>'}<div class="cel-box"><button class="cel-ph" type="button" title="${T("Palieskite – LED / nuotrauka","Tap – LED / photo")}"><canvas></canvas></button><div class="cel-bub">${bub}</div></div>`;
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
    const sh=document.getElementById("sh"),h2=sh&&sh.querySelector(".cl h2");if(!h2)return;
    const name=h2.textContent.trim(),sub=((sh.querySelector(".sum")||{}).textContent||"").trim(),
      kp=[...sh.querySelectorAll(".kp div")].slice(0,4).map(d=>[((d.querySelector("small")||{}).textContent||"").trim(),((d.querySelector("b")||{}).textContent||"").trim()]).filter(x=>x[0]&&x[1]);
    const seen=new Set(),uniq=r=>!seen.has(r.season)&&seen.add(r.season);let hist=[];
    if(sh.querySelector(".lc"))hist=D.att.filter(r=>r.avg!=null&&same(r.club,name)).sort((a,b)=>a.season.localeCompare(b.season)).filter(uniq).map(r=>({l:r.season,v:r.avg,t:nf.format(Math.round(r.avg))}));
    else if(sh.querySelector(".tw.ch"))hist=D.bud.filter(r=>r.total!=null&&same(r.club,name)).sort((a,b)=>a.season.localeCompare(b.season)).filter(uniq).map(r=>({l:r.season,v:r.total,t:(r.total/1e6).toFixed(1)+"M"}));
    hist=hist.slice(-6);
    const u=typeof LOGOS!=="undefined"&&LOGOS[norm(name)];let img=null;
    if(u)img=await new Promise(res=>{const i=new Image();i.crossOrigin="anonymous";i.onload=()=>res(i);i.onerror=()=>res(null);setTimeout(()=>res(null),4000);i.src=u});
    try{await document.fonts.load("700 100px 'Barlow Condensed'");await document.fonts.load("600 40px 'JetBrains Mono'")}catch(e){}
    let blob;try{blob=await drawCard(name,sub,kp,hist,img)}catch(e){blob=await drawCard(name,sub,kp,hist,null)}
    showShare(blob,name);
  }
  function drawCard(name,sub,kp,hist,img){return new Promise((res,rej)=>{
    const W=1080,H=1350,c=document.createElement("canvas");c.width=W;c.height=H;const x=c.getContext("2d");
    const RY=/rytas/i.test(name),BG="#07090F",CARD="#0F1420",LINE="#1E2638",INK="#E8ECF4",MU="#7A869E",AM=RY?"#E4262F":"#FFB020",HD="'Barlow Condensed','Arial Narrow',sans-serif",MO="'JetBrains Mono',ui-monospace,monospace",SS="system-ui,-apple-system,'Segoe UI',sans-serif";
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
      fit(p[1],cw-56,MO,"600",60,26);x.fillStyle=i===0?AM:INK;x.fillText(p[1],cx+28,cy+142)});
    if(hist.length>1){const n=hist.length,slot=936/n,bw=Math.min(110,slot*.62),base=1190,mh=200,mx=Math.max(...hist.map(h=>h.v));
      hist.forEach((h,i)=>{const bx=72+slot*i+(slot-bw)/2,bh=Math.max(6,h.v/mx*mh);
        x.fillStyle=i===n-1?AM:(RY?"rgba(228,38,47,.38)":"rgba(255,176,32,.38)");rr(bx,base-bh,bw,bh,10);x.fill();
        x.textAlign="center";x.fillStyle=i===n-1?INK:MU;x.font="600 26px "+MO;x.fillText(h.t,bx+bw/2,base-bh-14);
        x.fillStyle=MU;x.font="400 26px "+SS;x.fillText(h.l,bx+bw/2,base+40);x.textAlign="left"})}
    x.fillStyle=MU;x.font="400 28px "+SS;x.fillText((location.host+location.pathname).replace(/\/$/,""),72,1300);
    c.toBlob(b=>b?res(b):rej(new Error("blob")),"image/png");
  })}
  function showShare(blob,name){
    const url=URL.createObjectURL(blob),fn=norm(name)+".png",file=new File([blob],fn,{type:"image/png"}),o=document.createElement("div");o.className="shov";
    o.innerHTML=`<img src="${url}" alt=""><div class="row"><button class="chip" data-a="s">${T("Dalintis","Share")}</button><a class="chip" href="${url}" download="${fn}">${T("Atsisiųsti","Download")}</a><button class="chip" data-a="x">${T("Uždaryti","Close")}</button></div>`;
    o.addEventListener("click",async e=>{const a=e.target.closest("[data-a]");if(!a)return;
      if(a.dataset.a==="x"){URL.revokeObjectURL(url);o.remove()}
      else if(navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title:name})}catch(x){}}
      else a.textContent=T("Naudokite „Atsisiųsti“","Use “Download”")});
    document.body.appendChild(o);
  }

  document.addEventListener("click",e=>{
    if(MB&&MBQ&&e.target.closest&&e.target.closest("#out .mb-chart")&&!e.target.closest(".mbd")){mbClear();return}
    const t=e.target.closest(".mbt,.gmt,.shb,[data-tab],[data-mc],[data-mbs],[data-mbn],[data-mbx],[data-gp],[data-gm],[data-gr],[data-gs]");if(!t)return;
    if(t.dataset.mbx!==undefined){mbClear();const i=document.getElementById("mbq");if(i)i.focus();return}
    if(t.classList.contains("mbt")){MB=true;GM=false;fixTabs();renderMb();return}
    if(t.classList.contains("gmt")){GM=true;MB=false;fixTabs();renderGm();return}
    if(t.classList.contains("shb")){shareCard().catch(()=>{});return}
    if(t.dataset.tab!==undefined){MB=false;GM=false;return}
    if(GM){gAct(t);return}
    if(!MB)return;
    if(t.dataset.mc!==undefined&&typeof club==="function"){club(t.dataset.mc,t.dataset.mn,MBS,0);return}
    if(t.dataset.mbs!==undefined){MBS=t.dataset.mbs;renderMb()}
    else if(t.dataset.mbn!==undefined){MBN=t.dataset.mbn;renderMb()}
  },true);
  const mbCheck=()=>{if(!ok())return;if(MB&&!document.querySelector("#out .mb-root"))renderMb();else if(GM&&!document.querySelector("#out .gm-root"))renderGm()};
  [["tabs",()=>{fixTabs();mbCheck()}],["out",mbCheck]].forEach(([id,f])=>{const el=document.getElementById(id);if(el)new MutationObserver(f).observe(el,{childList:true})});
  // MB-END

  // ---- Pozicijos pagal medianą (klubo ir žaidėjo lange) ----
  let CTX=null;
  const mF=v=>v>=1e6?(v/1e6).toFixed(1).replace(".",T(",","."))+" M €":nf.format(Math.round(v))+" €";
  const pr=(rows,val,key,minN)=>{const a=rows.map(x=>x[key]).filter(v=>v>0);if(a.length<minN)return null;const md=med(a);return{rank:a.filter(v=>v>val).length+1,n:a.length,md,x:val/md,below:a.filter(v=>v<val).length/(a.length-1)}};
  const pcard=(lab,big,sub,pill,c)=>`<div class="ps-c"><small>${lab}</small><b>${big}</b><span class="ps-s">${sub}</span><i class="ps-p ${c}">${pill}</i></div>`;
  const place=n=>n+" "+T("vieta","place");
  function posSec(title,right,cards){return cards.length?`<div class="ps"><div class="ps-h"><h3>${title}</h3><span class="ps-r">${right}</span></div><div class="ps-g">${cards.join("")}</div></div>`:""}
  function injectPos(html){
    const sm=html.match(/sezonas\s+(\d\d\/\d\d)/);let sec="",at;
    const of=T("iš","of");
    if(CTX.k==="c"){
      if(!sm)return html;const se=sm[1],mt=x=>(!CTX.nation||x.nation===CTX.nation||x.country===CTX.nation)&&same(x.club,CTX.name),me=D.bud.find(x=>x.season===se&&x.total>0&&mt(x));if(!me)return html;
      const S0=D.bud.filter(x=>x.season===se&&x.total>0),L=S0.filter(x=>x.nation===me.nation&&(me.div==null||x.div==null||x.div===me.div)),
        cp=s=>(s||"").split(/\s[-–]\s/)[0].trim().toLowerCase(),comp=(me.eu||"").split(/\s[-–]\s/)[0].trim(),Pp=comp?S0.filter(x=>cp(x.eu)===comp.toLowerCase()):[],
        a=pr(L,me.total,"total",4),b=pr(Pp,me.total,"total",4),c=pr(S0,me.total,"total",20),cs=[];
      if(a)cs.push(pcard(T("Savo lygoje","In the league"),place(a.rank),`${of} ${a.n} · ${a.x.toFixed(1)}× ${T("lygos mediana","league median")} (${mF(a.md)})`,"vs "+esc(me.nation),"g"));
      if(b)cs.push(pcard(T("Tarp panašių","Among peers"),place(b.rank),`${of} ${b.n} · ${b.x.toFixed(2)}× ${T("mediana","median")} (${mF(b.md)})`,"vs "+esc(comp),"v"));
      if(c)cs.push(pcard(T("Tarp visų klubų","Among all clubs"),Math.round(c.below*100)+"%",`${T("klubų išleidžia mažiau nei","of clubs spend less than")} ${esc(me.club)}`,`vs ${c.n} ${T("klubų","clubs")}`,"b"));
      sec=posSec(`${T("Biudžeto pozicija","Budget position")} ${se}`,`${mF(me.total)} · ${me.est&&me.est.total?T("apytikslė","estimated"):T("pranešta","reported")}`,cs);
      at=["<h3>Biudžeto pokytis","<h3>Žaidėjai ir algos"];
    }else{
      const h=D.sal.filter(x=>norm(x.name)===norm(CTX.name)&&x.month>0).sort((x,y)=>(x.season||"").localeCompare(y.season||""));if(!h.length)return html;
      const me=h[h.length-1],se=me.season,isC=x=>/coach|treneris/i.test(x.role||""),S0=D.sal.filter(x=>x.season===se&&x.month>0&&isC(x)===isC(me)),
        a=pr(S0.filter(x=>x.team&&x.team===me.team),me.month,"month",3),b=pr(S0.filter(x=>x.country===me.country&&(me.div==null||x.div==null||x.div===me.div)),me.month,"month",5),c=pr(S0,me.month,"month",20),cs=[];
      if(a)cs.push(pcard(T("Savo komandoje","In the team"),place(a.rank),`${of} ${a.n} · ${a.x.toFixed(1)}× ${T("komandos mediana","team median")} (${mF(a.md)})`,"vs "+esc(me.team),"g"));
      if(b)cs.push(pcard(T("Savo šalies lygoje","In the league"),place(b.rank),`${of} ${b.n} · ${b.x.toFixed(1)}× ${T("mediana","median")} (${mF(b.md)})`,"vs "+esc(me.country),"v"));
      if(c)cs.push(pcard(T("Tarp visų","Among all"),Math.round(c.below*100)+"%",`${T("uždirba mažiau nei","earn less than")} ${esc(me.name)}`,`vs ${c.n}`,"b"));
      sec=posSec(`${T("Algos pozicija","Salary position")} ${se}`,`${mF(me.month)} / ${T("mėn.","mo.")} · ${me.est&&me.est.month?T("apytikslė","estimated"):T("pranešta","reported")}`,cs);
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
})();
