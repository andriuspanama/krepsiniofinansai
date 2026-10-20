/* Krepšinio finansai – tema + papildymai. Į index.html įkelkite TIK šią eilutę prieš </body>:
   <script src="redesign.js" defer></script>   (CSS įsikelia pats, visada po esamų stilių) */
(function(){
  // 1) CSS visada įkeliamas paskutinis, todėl perrašo senus stilius
  const cs=document.currentScript,base=cs?cs.src.replace(/[^/]*$/,""):"";
  const l=document.createElement("link");l.rel="stylesheet";l.href=base+"redesign.css";document.head.appendChild(l);

  const M=n=>(n/1e6).toFixed(1)+"M",e=s=>String(s).replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));
  const ok=()=>typeof D!=="undefined"&&D.bud&&D.bud.length;

  // 2) Biržos juosta
  function ticker(){
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
  function gauge(p){const r=24,c=2*Math.PI*r;
    return`<svg class="kg" width="64" height="64" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="${r}" fill="none" stroke="var(--line)" stroke-width="7"/><circle cx="32" cy="32" r="${r}" fill="none" stroke="var(--a)" stroke-width="7" stroke-linecap="round" stroke-dasharray="${c*Math.min(p,100)/100} ${c}" transform="rotate(-90 32 32)"/></svg>`}
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
  }

  let raf=0;new MutationObserver(()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(enhance)}).observe(document.body,{childList:true,subtree:true});
  const t=setInterval(()=>{if(!ok())return;clearInterval(t);try{ticker()}catch(x){}enhance()},400);
})();
