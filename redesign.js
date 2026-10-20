/* Biržos juosta iš jau įkeltų duomenų. Įkelkite: <script src="redesign.js" defer></script> */
(function(){
  const t=setInterval(()=>{
    try{
      if(typeof D==="undefined"||!D.bud||!D.bud.length)return;
      clearInterval(t);
      const rows=budgetRows().filter(r=>r.total!=null);
      if(!rows.length)return;
      const M=n=>(n/1e6).toFixed(1)+"M",e=s=>String(s).replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));
      const top=[...rows].sort((a,b)=>b.total-a.total).slice(0,4);
      const jump=rows.filter(r=>r.chg!=null).sort((a,b)=>b.chg-a.chg).slice(0,3);
      const it=[...top.map(r=>`<span>${e(r.club)} <b>${M(r.total)}</b>${r.chg!=null?` <b style="color:var(--${r.chg>=0?"pos":"neg"})">${r.chg>=0?"▲":"▼"} ${Math.abs(Math.round(r.chg*100))}%</b>`:""}</span>`),
                ...jump.map(r=>`<span>▲ ${e(r.club)} <b style="color:var(--pos)">+${Math.round(r.chg*100)}%</b></span>`)].join("");
      const el=document.createElement("div");el.className="tk";el.innerHTML=`<div>${it}${it}</div>`;
      document.body.prepend(el);
    }catch(x){}
  },400);
})();
