// Classes tabs 5..11, no search/filters
const classesList=[["5 класс","5"],["6 класс","6"],["7 класс","7"],["8 класс","8"],["9 класс","9"],["10 класс","10"],["11 класс","11"]];
let allData={}, activeKey=getClassFromUrl()||classesList[0][1];
document.addEventListener('DOMContentLoaded', ()=>{ loadData(); });
async function loadData(){
  try{
    const res=await fetch('classes.json',{cache:'no-store'});
    allData=await res.json();
    renderTabs(); showClass(activeKey);
  }catch(e){
    document.getElementById('classContent').textContent='Ошибка загрузки материалов.';
    console.error(e);
  }
}
function renderTabs(){
  const tabs=document.getElementById('tabs'); tabs.innerHTML='';
  classesList.forEach(([label,key])=>{
    const b=document.createElement('button');
    b.textContent=label; b.className='tab-btn'+(key===activeKey?' active':'');
    b.addEventListener('click', ()=>{
      activeKey=key; document.querySelectorAll('.tab-btn').forEach(x=>x.classList.remove('active'));
      b.classList.add('active'); showClass(activeKey); window.scrollTo({top:0,behavior:'smooth'});
      const params=new URLSearchParams(location.search); params.set('class', key);
      history.replaceState(null,'', location.pathname + '?' + params.toString());
    });
    tabs.appendChild(b);
  });
}
function showClass(key){
  const box=document.getElementById('classContent'); box.innerHTML='';
  const topics=allData[key]||[];
  if(topics.length===0){ const p=document.createElement('p'); p.textContent='Материалы появятся скоро.'; box.appendChild(p); return; }
  topics.forEach(t=>{
    const card=document.createElement('article'); card.className='card';
    const h=document.createElement('h3'); h.textContent=t.title; card.appendChild(h);
    const list=document.createElement('div'); list.className='list';
    (t.items||[]).forEach(it=>{ const a=document.createElement('a'); a.href=it.url; a.target='_blank'; a.rel='noopener'; a.innerHTML=`${it.label} &rarr;`; list.appendChild(a); });
    card.appendChild(list);
    const meta=document.createElement('span'); meta.className='tag';
    const tags=(t.tags&&t.tags.length)?` • ${t.tags.join(', ')}`:'';
    meta.textContent=`обновлено: ${t.updated||'—'}${tags}`; card.appendChild(meta);
    box.appendChild(card);
  });
}
function getParam(n){ const p=new URLSearchParams(location.search); return p.get(n); }
function getClassFromUrl(){ const v=getParam('class'); const A=new Set(['5','6','7','8','9','10','11']); return (v&&A.has(v))?v:null; }
