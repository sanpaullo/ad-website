// Вкладки 5–11, поиск и фильтр по тегам + сохранение выбранной вкладки в URL (?class=9)
const classesList = [
  ["5 класс","5"], ["6 класс","6"], ["7 класс","7"],
  ["8 класс","8"], ["9 класс","9"], ["10 класс","10"], ["11 класс","11"]
];

let allData = {};
let activeKey = getClassFromUrl() || classesList[0][1];
let activeTags = new Set();
let q = getParam('q') || '';

function debounce(fn, wait){ let t; return (...args)=>{ clearTimeout(t); t=setTimeout(()=>fn.apply(this,args), wait); }; }

document.addEventListener('DOMContentLoaded', ()=>{
  const qInput = document.getElementById('q');
  if(q){ qInput.value = q; }
  qInput.addEventListener('input', debounce(()=>{ q = qInput.value.trim().toLowerCase(); showClass(activeKey, {updateUrl:true}); }, 200));
  document.getElementById('clearFilters').addEventListener('click', ()=>{
    q = ''; document.getElementById('q').value = '';
    activeTags.clear();
    document.querySelectorAll('.tag-pill').forEach(p=>p.classList.remove('active'));
    showClass(activeKey, {updateUrl:true});
  });
  loadData();
});

async function loadData(){
  try{
    const res = await fetch('classes.json', {cache:'no-store'});
    allData = await res.json();
    renderTabs();
    buildTagCloud();
    showClass(activeKey, {updateUrl:false});
  }catch(e){
    document.getElementById('classContent').textContent = 'Ошибка загрузки материалов.';
    console.error(e);
  }
}

function renderTabs(){
  const tabs = document.getElementById('tabs');
  tabs.innerHTML = '';
  classesList.forEach(([label,key])=>{
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.className = 'tab-btn' + (key===activeKey ? ' active' : '');
    btn.addEventListener('click', ()=>{
      activeKey = key;
      document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      showClass(activeKey, {updateUrl:true});
    });
    tabs.appendChild(btn);
  });
}

function buildTagCloud(){
  const tags = new Map();
  Object.values(allData).flat().forEach(topic=> (topic.tags||[]).forEach(t=> tags.set(t, (tags.get(t)||0)+1)));
  const tagCloud = document.getElementById('tagCloud');
  tagCloud.innerHTML = '';
  [...tags.keys()].sort((a,b)=>a.localeCompare(b,'ru')).forEach(tag=>{
    const pill = document.createElement('button');
    pill.className = 'tag-pill';
    pill.type = 'button';
    pill.textContent = tag;
    pill.addEventListener('click', ()=>{
      if(activeTags.has(tag)) activeTags.delete(tag); else activeTags.add(tag);
      pill.classList.toggle('active');
      showClass(activeKey, {updateUrl:true});
    });
    tagCloud.appendChild(pill);
  });
}

function matchesSearch(topic){
  if(!q) return true;
  const haystack = [
    topic.title,
    ...(topic.tags||[]),
    ...((topic.items||[]).map(it=> (it.label||'') + ' ' + (it.url||'')))
  ].join(' ').toLowerCase();
  return haystack.includes(q);
}

function matchesTags(topic){
  if(activeTags.size===0) return true;
  const t = new Set(topic.tags||[]);
  for(const tag of activeTags){ if(!t.has(tag)) return false; }
  return true;
}

function updateCount(found, total){
  const el = document.getElementById('resultCount');
  if(!total){ el.textContent = ''; return; }
  el.textContent = `${found} из ${total}`;
}

function showClass(key, {updateUrl} = {updateUrl:false}){
  const container = document.getElementById('classContent');
  container.innerHTML = '';

  const all = allData[key] || [];
  const topics = all.filter(t => matchesSearch(t) && matchesTags(t));
  updateCount(topics.length, all.length);

  if(updateUrl){
    const params = new URLSearchParams(location.search);
    params.set('class', key);
    if(q) params.set('q', q); else params.delete('q');
    history.replaceState(null, '', location.pathname + '?' + params.toString());
  }

  if(topics.length===0){
    const p = document.createElement('p');
    p.textContent = 'Ничего не найдено. Попробуйте изменить запрос или снять фильтры.';
    container.appendChild(p);
    return;
  }

  topics.forEach(t=>{
    const card = document.createElement('article');
    card.className = 'card';

    const title = document.createElement('h3');
    title.textContent = t.title;
    card.appendChild(title);

    const list = document.createElement('div');
    list.className = 'list';
    (t.items||[]).forEach(it=>{
      const a = document.createElement('a');
      a.href = it.url; a.target = '_blank'; a.rel = 'noopener';
      a.textContent = `${it.label} ↗`;
      list.appendChild(a);
    });
    card.appendChild(list);

    const meta = document.createElement('span');
    meta.className = 'tag';
    const tags = (t.tags && t.tags.length) ? ` • ${t.tags.join(', ')}` : '';
    meta.textContent = `обновлено: ${t.updated || '—'}${tags}`;
    card.appendChild(meta);

    container.appendChild(card);
  });
}

function getParam(name){ const params = new URLSearchParams(location.search); return params.get(name); }
function getClassFromUrl(){
  const c = getParam('class');
  if(!c) return null;
  const allowed = new Set(['5','6','7','8','9','10','11']);
  return allowed.has(c) ? c : null;
}
