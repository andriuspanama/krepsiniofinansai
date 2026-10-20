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
  function enhance(){
    if(!ok())return;
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
    if(typeof logo==="function"&&typeof S!=="undefined"&&S.tab!=="sal")document.querySelectorAll("tr.c td.l:first-child:not([data-lg])").forEach(td=>{
      td.dataset.lg=1;const b=td.querySelector("b");if(b)b.insertAdjacentHTML("beforebegin",logo(b.textContent))});
    if(typeof logo==="function")document.querySelectorAll("#sh .cl h2:not([data-lg])").forEach(h=>{
      h.dataset.lg=1;if(h.previousElementSibling&&h.previousElementSibling.classList.contains("rl"))return;h.insertAdjacentHTML("beforebegin",logo(h.textContent))});
  }


  // #logos režimas: atidarykite puslapį su /#logos ir gausite logos.json šabloną
  function tmpl(){
    if(location.hash!=="#logos"||document.getElementById("lgt")||typeof clubList!=="function")return;
    const o={};clubList().forEach(c=>o[c.name]="logos/");
    const t=document.createElement("textarea");t.id="lgt";t.readOnly=true;t.rows=10;t.value=JSON.stringify(o,null,1);
    t.style.cssText="display:block;width:calc(100% - 24px);margin:12px;font:12px var(--mono);background:var(--card);color:var(--ink);border:1px solid var(--line);border-radius:8px;padding:8px";
    document.body.prepend(t);
  }
  let raf=0;new MutationObserver(()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(enhance)}).observe(document.body,{childList:true,subtree:true});
  const t=setInterval(()=>{if(!ok())return;clearInterval(t);try{ticker()}catch(x){}try{tmpl()}catch(x){}enhance()},400);
})();
