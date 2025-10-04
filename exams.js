// Exams tabs: EGE, OGE
const examTabs=[["ЕГЭ","ege"],["ОГЭ","oge"]];
let examData={}, activeExam=getExamFromUrl()||examTabs[0][1];
document.addEventListener('DOMContentLoaded', ()=>{ loadExams(); });
async function loadExams(){
  try{
    const res=await fetch('exams.json',{cache:'no-store'});
    examData=await res.json();
    renderExamTabs(); showExam(activeExam);
  }catch(e){
    document.getElementById('examContent').textContent='Ошибка загрузки материалов.';
    console.error(e);
  }
}
function renderExamTabs(){
  const tabs=document.getElementById('examTabs'); tabs.innerHTML='';
  examTabs.forEach(([label,key])=>{
    const b=document.createElement('button');
    b.textContent=label; b.className='tab-btn'+(key===activeExam?' active':'');
    b.addEventListener('click', ()=>{
      activeExam=key; document.querySelectorAll('#examTabs .tab-btn').forEach(x=>x.classList.remove('active'));
      b.classList.add('active'); showExam(activeExam); window.scrollTo({top:0,behavior:'smooth'});
      const params=new URLSearchParams(location.search); params.set('exam', key);
      history.replaceState(null,'', location.pathname + '?' + params.toString());
    });
    tabs.appendChild(b);
  });
}
function showExam(key){
  const box=document.getElementById('examContent'); box.innerHTML='';
  const topics=examData[key]||[];
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
function getExamFromUrl(){ const v=getParam('exam'); const A=new Set(['ege','oge']); return (v&&A.has(v))?v:null; }
