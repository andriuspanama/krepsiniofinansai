/* Krepšinio finansai – tema + papildymai. Į index.html įkelkite TIK šią eilutę prieš </body>:
   <script src="redesign.js" defer></script>   (CSS įsikelia pats, visada po esamų stilių) */
(function(){
  if(window.__rd)return;window.__rd=1; // apsauga, jei skriptas įkeltas du kartus
  // 1) CSS visada įkeliamas paskutinis, todėl perrašo senus stilius
  const cs=document.currentScript,base=cs?cs.src.replace(/[^/]*$/,""):"";
  const l=document.createElement("link");l.rel="stylesheet";l.href=base+"redesign.css";document.head.appendChild(l);

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
  const cls=t=>/strong|stipri/i.test(t)?"s":/in line|atitinka/i.test(t)?"m":/helped|padeda|low|mažas|capacity|talpos/i.test(t)?"w":"";
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

  function enhance(){
    if(!ok())return;
    tape();perFan();
    document.querySelectorAll("td[data-lb] .sh:not([data-e])").forEach(s=>{
      s.dataset.e=1;if(!/Užpildymas|Filling rate|Atlyginimų dalis|Salary share/.test(s.closest("td").dataset.lb||""))return;
      const p=pc(s.textContent);if(p==null)return;const a=Math.max(.2,Math.min(1,(p-50)/50));
      s.classList.add("hm");if(a>.5)s.classList.add("hi");s.style.setProperty("--hm",Math.round(a*100)+"%")});
    document.querySelectorAll("td[data-lb] span[title]:not([data-e]),.sheet .pf:not([data-e])").forEach(s=>{
      s.dataset.e=1;const td=s.closest("td");if(td&&!/Profilis|Profile/.test(td.dataset.lb||""))return;
      const k=cls(s.textContent);if(k){s.classList.add("pill",k);s.style.maxWidth="100%"}});
    if(typeof V!=="undefined")document.querySelectorAll("tr.c:not([data-sp])").forEach(tr=>{
      tr.dataset.sp=1;const td=[...tr.children].find(c=>/Bendras biudžetas|Total budget/.test(c.dataset.lb||""));if(!td)return;
      const r=V[+tr.dataset.i];if(!r||!r.club)return;
      const h=D.bud.filter(x=>x.total!=null&&x.nation===r.nation&&same(x.club,r.club)).sort((a,b)=>a.season.localeCompare(b.season)).map(x=>x.total);
      td.insertAdjacentHTML("afterbegin",spark(h))});
    document.querySelectorAll("#sh .kp div:not([data-e])").forEach(d=>{
      d.dataset.e=1;if(!/Užpildymas|Filling rate/.test(d.querySelector("small")?.textContent||""))return;
      const p=pc(d.querySelector("b")?.textContent);if(p!=null){d.classList.add("hasg");d.insertAdjacentHTML("beforeend",gauge(p))}});
    // Klubų logotipai (naudoja jūsų esamą logos.json ir logo() funkciją)
    if(typeof LOGOS!=="undefined"&&typeof S!=="undefined"&&S.tab!=="sal")document.querySelectorAll("tr.c td.l:first-child:not([data-lg])").forEach(td=>{
      td.dataset.lg=1;const b=td.querySelector("b");if(b)b.insertAdjacentHTML("beforebegin",lgo(b.textContent))});
    if(typeof LOGOS!=="undefined")document.querySelectorAll("#sh .cl h2:not([data-lg])").forEach(h=>{
      h.dataset.lg=1;if(h.previousElementSibling&&h.previousElementSibling.classList.contains("rl"))return;h.insertAdjacentHTML("beforebegin",lgo(h.textContent))});
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
  let MB=false,MBS=null,MBN="";
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
    const ex=[...pts].sort((a,b)=>b.d/b.n-a.d/a.n),lab=new Set([...ex.slice(0,3),...ex.slice(-3)].map(p=>p.r));
    const dots=pts.map(p=>{const h=hs(p.r.club),cx=X(Math.min(1,Math.max(0,p.x+(h-.5)*.03))),cy=Y(Math.min(1,Math.max(0,p.y+(((h*7)%1)-.5)*.03))),
      t=lab.has(p.r)?`<text x="${(cx+(p.x>.7?-8:8)).toFixed(1)}" y="${(cy+3).toFixed(1)}" text-anchor="${p.x>.7?"end":"start"}" font-size="8.5" fill="var(--ink)" pointer-events="none">${esc(p.r.club)}</text>`:"";
      return`<g class="mbd" data-mc="${esc(p.r.club)}" data-mn="${esc(p.r.nation)}"><title>${esc(p.r.club)} · #${p.sr} → #${p.pr}</title><circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="12" fill="transparent"/><circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="5" fill="${col(p)}" fill-opacity=".9" stroke="var(--card)" stroke-width="1.5"/>${t}</g>`}).join("");
    const q=(x,y,a,s)=>`<text x="${x}" y="${y}" text-anchor="${a}" font-size="8.5" fill="var(--mute)">${s}</text>`;
    const svg=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Moneyball"><polygon points="${X(0)},${Y(0)} ${X(1)},${Y(0)} ${X(0)},${Y(1)}" fill="var(--pos)" fill-opacity=".07"/><polygon points="${X(1)},${Y(0)} ${X(1)},${Y(1)} ${X(0)},${Y(1)}" fill="var(--neg)" fill-opacity=".07"/><rect x="${X(0)}" y="${Y(0)}" width="${X(1)-X(0)}" height="${Y(1)-Y(0)}" fill="none" stroke="var(--line)"/><line x1="${X(0)}" y1="${Y(1)}" x2="${X(1)}" y2="${Y(0)}" stroke="var(--mute)" stroke-opacity=".5" stroke-dasharray="3 4"/>`
      +q(X(0)+6,Y(0)+12,"start",T("Mažai išleidžia, bet laimi","Spends little, wins"))+q(X(1)-6,Y(0)+12,"end",T("Daug išleidžia ir laimi","Spends big, wins"))
      +q(X(1)-6,Y(1)-6,"end",T("Daug išleidžia, bet pralaimi","Spends big, loses"))+q(X(0)+6,Y(1)-6,"start",T("Mažai išleidžia ir pralaimi","Spends little, loses"))
      +`<text x="${(L+W-R)/2}" y="${H-10}" text-anchor="middle" font-size="9.5" fill="var(--mute)">${T("Biudžetas savo lygoje →","Budget within own league →")}</text><text transform="translate(10 ${(Tp+H-B)/2}) rotate(-90)" text-anchor="middle" font-size="9.5" fill="var(--mute)">${T("← geresnė vieta","← better finish")}</text>`+dots+`</svg>`;
    const row=p=>`<button class="mb-row" data-mc="${esc(p.r.club)}" data-mn="${esc(p.r.nation)}"><span><b>${flag(p.r.nation)}${esc(p.r.club)}</b><small>${T("biudžetas","budget")} #${p.sr}/${p.n} → ${T("vieta","place")} #${p.pr}</small></span><span class="mb-d ${p.d>0?"pos":"neg"}">${p.d>0?"+":""}${p.d}</span></button>`;
    const over=pts.filter(p=>p.d>0).sort((a,b)=>b.d/b.n-a.d/a.n).slice(0,5),under=pts.filter(p=>p.d<0).sort((a,b)=>a.d/a.n-b.d/b.n).slice(0,5);
    return`<div class="mb-root"><div class="bar n">${seasons.map(s=>`<button class="chip" data-mbs="${s}" aria-pressed="${s===MBS}">${T("Sezonas","Season")} ${s}</button>`).join("")}</div>
<div class="bar n"><button class="chip" data-mbn="" aria-pressed="${!MBN}">${T("Visos","All")}</button>${nations.map(n=>`<button class="chip" data-mbn="${esc(n)}" aria-pressed="${MBN===n}">${flag(n)}${esc(n)}</button>`).join("")}</div>
<p class="sum">${T("Kiekvienas taškas – klubas. Palyginta su savo lygos varžovais: kiek išleidžia ir kurią vietą užėmė. Virš punktyrinės linijos – klubai, pasiekę daugiau nei leidžia jų biudžetas.","Each dot is a club, compared with rivals in its own league: how much it spends versus where it finished. Above the dashed line are clubs that achieved more than their budget suggests.")}</p>
<div class="mb-chart">${svg}</div>
<div class="mb-cols"><div><h3>${T("Pralenkia savo biudžetą","Beating their budget")}</h3><div class="mb-list">${over.map(row).join("")||"–"}</div></div><div><h3>${T("Neatitinka savo biudžeto","Below their budget")}</h3><div class="mb-list">${under.map(row).join("")||"–"}</div></div></div></div>`;
  }
  function renderMb(){const o=document.getElementById("out");if(o&&ok())o.innerHTML=mbView()}
  function fixTabs(){const tb=document.getElementById("tabs");if(!tb||!tb.children.length)return;
    let b=tb.querySelector(".mbt");
    if(!b){b=document.createElement("button");b.className="mbt";b.setAttribute("role","tab");b.textContent="Moneyball";tb.appendChild(b)}
    b.setAttribute("aria-selected",String(MB));
    if(MB)tb.querySelectorAll("button:not(.mbt)").forEach(x=>x.setAttribute("aria-selected","false"))}
  document.addEventListener("click",e=>{
    const t=e.target.closest(".mbt,[data-tab],[data-mc],[data-mbs],[data-mbn]");if(!t)return;
    if(t.classList.contains("mbt")){MB=true;fixTabs();renderMb();return}
    if(t.dataset.tab!==undefined){MB=false;return}
    if(!MB)return;
    if(t.dataset.mc!==undefined&&typeof club==="function"){club(t.dataset.mc,t.dataset.mn,MBS,0);return}
    if(t.dataset.mbs!==undefined){MBS=t.dataset.mbs;renderMb()}
    else if(t.dataset.mbn!==undefined){MBN=t.dataset.mbn;renderMb()}
  },true);
  const mbCheck=()=>{if(MB&&ok()&&!document.querySelector("#out .mb-root"))renderMb()};
  [["tabs",()=>{fixTabs();mbCheck()}],["out",mbCheck]].forEach(([id,f])=>{const el=document.getElementById(id);if(el)new MutationObserver(f).observe(el,{childList:true})});
  // MB-END
  let raf=0;new MutationObserver(()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(enhance)}).observe(document.body,{childList:true,subtree:true});
  const t=setInterval(()=>{if(!ok())return;clearInterval(t);try{ticker()}catch(x){}try{tmpl()}catch(x){}enhance()},400);
})();
