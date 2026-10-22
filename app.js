function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n}
function art(image,title){const n=el('div','art');if(image){const img=el('img');img.src=image;img.alt=title;n.append(img)}else n.append(el('span','',String(title||'?').slice(0,2).toUpperCase()));return n}
function linkFor(type,x){return 'detail.html?type='+encodeURIComponent(type)+'&id='+encodeURIComponent(x.id)}
function chips(value){const wrap=el('div','tag-list');const tags=(Array.isArray(value)?value.flatMap(v=>String(v).split(',')):String(value||'').split(',')).map(v=>v.trim()).filter(Boolean);tags.forEach(tag=>wrap.append(el('span','chip',tag)));return wrap}
function themeFor(type,x){const w=type==='works'?x:db.works.find(w=>sameId(w.id,x.workId)||(!x.workId&&w.title===x.category));return w&&w.theme&&w.theme!=='default'?String(w.theme):''}
function winButtons(){const b=el('span','win-btns');['─','□','×'].forEach(s=>b.append(el('span','win-btn',s)));return b}
function cardFor(type,x){const card=el('a','card card-link');const th=themeFor(type,x);if(th)card.dataset.theme=th;card.href=linkFor(type,x);card.append(art(x.image,x.title),el('h3','',x.title),el('p','',x.description),chips(x.category));card.setAttribute('aria-label',x.title+' 상세 보기');return card}
const listState={query:'',tag:''};
function tagsOf(x){return (Array.isArray(x.category)?x.category.flatMap(v=>String(v).split(',')):String(x.category||'').split(',')).map(v=>v.trim()).filter(Boolean)}
function drawFilters(type){
 const box=document.querySelector('#filters');if(!box)return;box.replaceChildren();
 const tags=[...new Set(db[type].flatMap(tagsOf))];if(tags.length<2){box.hidden=true;return}
 ['',...tags].forEach(t=>{const b=el('button','filter',t||'전체');b.type='button';b.dataset.tag=t;b.setAttribute('aria-pressed',String(listState.tag===t));
  b.addEventListener('click',()=>{listState.tag=t;box.querySelectorAll('.filter').forEach(n=>n.setAttribute('aria-pressed',String(n.dataset.tag===t)));drawCards(type)});box.append(b)})
}
function drawCards(type,query){
 const target=document.querySelector('#listing');if(!target)return;
 if(query!==undefined)listState.query=query;
 target.replaceChildren();
 const q=listState.query.toLowerCase(),all=[...db[type]];
 const data=all.filter(x=>(!listState.tag||tagsOf(x).includes(listState.tag))&&([x.title,x.category,x.description].join(' ')).toLowerCase().includes(q));
 const unit=type==='works'?'개':'명',count=document.querySelector('#count'),status=document.querySelector('#list-status');
 if(count)count.textContent=all.length;
 if(status)status.textContent=data.length===all.length?'전체 '+all.length+unit:'전체 '+all.length+unit+' 중 '+data.length+unit+' 표시';
 if(!data.length){target.append(el('p','empty','조건에 맞는 항목이 없어요. 검색어를 지우거나 "전체"를 눌러 보세요.'));return}
 data.forEach(x=>target.append(cardFor(type,x)))
}
function fmtDate(v){const t=String(v||'');return /^\d{4}-\d{2}-\d{2}$/.test(t)?t.replace(/-/g,'.'):t}
function drawUpdates(){
 const target=document.querySelector('#updates');if(!target)return;target.replaceChildren();
 const items=[...db.updates];
 const status=document.querySelector('#list-status');if(status)status.textContent='기록 '+items.length+'건';
 if(!items.length){target.append(el('li','empty','아직 등록된 업데이트가 없어요.'));return}
 items.forEach((x,i)=>{
  const li=el('li','tl-item'),date=el('time','tl-date',fmtDate(x.category));if(/^\d{4}-\d{2}-\d{2}$/.test(String(x.category||'')))date.dateTime=x.category;
  const body=el('div','tl-body'),head=el('div','tl-head');head.append(el('h2','',x.title));if(i===0)head.append(el('span','chip','최신'));body.append(head);
  if(x.description)body.append(el('p','',x.description));
  if(x.image){const img=el('img','tl-img');img.src=x.image;img.alt=x.title;img.loading='lazy';body.append(img)}
  li.append(date,body);target.append(li)
 })
}
function safeExternal(url){try{const u=new URL(url);return ['https:','http:'].includes(u.protocol)?u.href:null}catch{return null}}
function externalButton(url,label){const safe=safeExternal(url);if(!safe)return null;const a=el('a','detail-button',label);a.href=safe;a.target='_blank';a.rel='noopener noreferrer';return a}
function drawProfile(){
 const target=document.querySelector('#profile');if(!target)return;target.replaceChildren();
 const p=db.profile||{},wrap=el('div','profile-wrap'),card=el('div','id-card'),photo=el('div','id-photo');
 if(p.image){const img=el('img');img.src=p.image;img.alt=p.name||'프로필';photo.append(img)}else photo.append(el('span','','✳'));
 card.append(el('span','id-slot'),photo,el('strong','id-name',p.name||'—'),el('span','id-stripe'));
 const info=el('div','profile-info');if(p.intro)info.append(el('p','profile-lead',p.intro));
 const meta=el('dl','detail-meta profile-meta');
 [['활동 플랫폼',p.platform],['작품',db.works.length+'개'],['캐릭터',db.characters.length+'명'],['연락처',p.contact]].forEach(([k,v])=>{if(!v)return;const r=el('div','detail-meta-row');r.append(el('dt','',k),el('dd','',String(v)));meta.append(r)});
 info.append(meta);
 textSection(info,'자세한 소개',p.bio);
 if(p.links){const b=externalButton(p.links,'활동 페이지 ↗');if(b){const row=el('div','platform-links');row.append(b);info.append(row)}}
 wrap.append(card,info);target.append(wrap);
 const status=document.querySelector('#list-status');if(status)status.textContent='작품 '+db.works.length+'개 · 캐릭터 '+db.characters.length+'명';
}
function drawHome(){
 const target=document.querySelector('#latest');if(!target)return;target.replaceChildren();
 const works=[...db.works];
 const setText=(sel,text)=>{const n=document.querySelector(sel);if(n)n.textContent=text};
 setText('[data-count="works"]',db.works.length+'개의 작품');
 setText('[data-count="characters"]',db.characters.length+'명');
 setText('[data-count="updates"]',db.updates.length+'건의 기록');
 setText('#home-status','작품 '+db.works.length+'개 · 캐릭터 '+db.characters.length+'명');
 const feature=document.querySelector('#feature'),top=works[0];
 if(feature&&top){
  feature.replaceChildren();
  const a=el('a','feature'),th=themeFor('works',top);if(th)a.dataset.theme=th;
  a.href=linkFor('works',top);a.setAttribute('aria-label',top.title+' 작품 열기');
  const bar=el('div','feature-bar');bar.append(el('span','feature-name','▣ '+top.title+'.EXE'),winButtons());
  const body=el('div','feature-body'),info=el('div','feature-info');
  info.append(chips(top.category),el('h2','',top.title),el('p','',top.description||''));
  if(top.releaseDate){const d=el('p','feature-date');d.append(el('span','','출시'),document.createTextNode(' '+top.releaseDate));info.append(d)}
  info.append(el('span','feature-open','작품 열기 →'));
  body.append(art(top.image,top.title),info);
  a.append(bar,body,el('span','feature-sticker','★ NEW'));feature.append(a);
 }
 const others=works.slice(1,4);others.forEach(x=>target.append(cardFor('works',x)));
 const more=document.querySelector('#more-title');if(more)more.hidden=!others.length;
}
function sameId(a,b){return String(a||'').trim().toLowerCase()===String(b||'').trim().toLowerCase()}
function applyTheme(item,theme){
 document.body.dataset.theme=theme;
 const win=document.querySelector('.window'),bar=win&&win.querySelector('.bar');if(!win||!bar)return;
 const btns=el('span','win-btns');['─','□','×'].forEach(s=>btns.append(el('span','win-btn',s)));
 bar.replaceChildren(el('span','bar-title','▣ '+item.title+'.EXE'),btns);
 if(!win.querySelector('.statusbar')){const sb=el('div','statusbar');sb.append(el('span','',''),el('span','',''));sb.firstChild.append(el('span','blink','●'),document.createTextNode(' ONLINE'));sb.lastChild.textContent='OBJECT · '+String(item.id).toUpperCase();win.append(sb)}
}
function textSection(target,heading,value){if(!value)return;target.append(el('h2','detail-subtitle',heading),el('p','detail-paragraph',value))}
function drawDetail(){const target=document.querySelector('#detail');if(!target)return;target.replaceChildren();const params=new URLSearchParams(location.search),type=params.get('type'),id=params.get('id');if(!['works','characters'].includes(type)||!id){target.append(el('p','empty','잘못된 상세 페이지 주소입니다.'));return}const item=db[type].find(x=>String(x.id)===id);if(!item){target.append(el('p','empty','해당 항목을 찾을 수 없습니다.'));return}document.title=item.title+' — WORLD.EXE';const back=el('a','detail-back','← '+(type==='works'?'작품 목록':'캐릭터 목록'));back.href=type+'.html';target.append(back);document.querySelectorAll('nav a').forEach(a=>a.classList.toggle('active',a.getAttribute('href')===type+'.html'));const themeWork=type==='works'?item:db.works.find(w=>sameId(w.id,item.workId)||(!item.workId&&w.title===item.category)),theme=themeWork&&themeWork.theme&&themeWork.theme!=='default'?String(themeWork.theme):'';if(theme)applyTheme(item,theme);const header=el('div','detail-hero portrait-hero'),info=el('div','detail-info');info.append(chips(item.category),el('h1','',item.title),el('p','detail-paragraph',item.description||''));header.append(art(item.image,item.title),info);target.append(header);if(type!=='works')textSection(target,'상세 소개',item.detail);if(type==='works'){
 if(item.releaseDate){const meta=el('dl','detail-meta'),row=el('div','detail-meta-row');row.append(el('dt','','출시일'),el('dd','',String(item.releaseDate)));meta.append(row);info.append(meta)}
 const related=db.characters.filter(c=>sameId(c.workId,item.id)||(!c.workId&&c.category===item.title));
 if(related.length){info.append(el('h2','detail-subtitle','등장 캐릭터'));const charBox=el('div','platform-links character-links');related.forEach(c=>{const a=el('a','detail-button character-button',c.title+' →');a.href=linkFor('characters',c);charBox.append(a)});info.append(charBox)}
 const platformLinks=Array.isArray(item.platforms)?item.platforms:[];
 const validPlatforms=platformLinks.map(p=>({name:String(p?.name||'').trim(),url:p?.url})).filter(p=>p.name&&safeExternal(p.url));
 const platformsBox=el('div','platform-links');
 if(validPlatforms.length){info.append(el('h2','detail-subtitle','PLATFORMS'));validPlatforms.forEach(p=>{const b=externalButton(p.url,p.name+' ↗');if(b)platformsBox.append(b)})}
 const legacy=safeExternal(item.link);
 if(legacy&&!validPlatforms.some(p=>safeExternal(p.url)===legacy)){const b=externalButton(legacy,'기존 플레이 링크 ↗');if(b)platformsBox.append(b)}
 if(platformsBox.childElementCount)info.append(platformsBox);
 textSection(info,'상세 소개',item.detail);
}else{
 if(item.role)textSection(target,'소속 / 역할',item.role);
 if(item.personality)textSection(target,'성격',item.personality);
 if(item.appearance)textSection(target,'외형',item.appearance);
 const parent=db.works.find(w=>String(w.id).toLowerCase()===String(item.workId||'').trim().toLowerCase()||(!item.workId&&w.title===item.category));
 const actions=el('div','platform-links');
 if(parent){const a=el('a','detail-button','📁 '+parent.title+' 작품 보기 →');a.href=linkFor('works',parent);actions.append(a)}
 const b=externalButton(item.link,'캐릭터 페이지 열기 ↗');if(b)actions.append(b);
 if(actions.childElementCount)info.append(actions)
}}
async function loadData(){const names=['works','characters','updates','profile'];const responses=await Promise.all(names.map(async name=>{const response=await fetch('./data/'+name+'.json',{cache:'no-store'});if(!response.ok)throw new Error(name+' HTTP '+response.status);return response.json()}));const next=Object.fromEntries(names.map((name,i)=>[name,responses[i]]));if(!Array.isArray(next.works)||!Array.isArray(next.characters)||!Array.isArray(next.updates)||!next.profile||typeof next.profile!=='object')throw new Error('JSON 데이터 구조 오류');return next}
let db={works:[],characters:[],updates:[],profile:{}};
document.addEventListener('DOMContentLoaded',async()=>{const type=document.body.dataset.type;try{db=await loadData();if(type==='works'||type==='characters'){drawFilters(type);drawCards(type);const search=document.querySelector('#search');if(search)search.addEventListener('input',e=>drawCards(type,e.target.value))}drawUpdates();drawProfile();drawHome();if(type==='detail')drawDetail()}catch(err){console.error(err);const target=document.querySelector('#detail')||document.querySelector('#listing')||document.querySelector('#latest')||document.querySelector('#updates')||document.querySelector('#profile');if(target)target.append(el('p','empty','데이터를 불러오지 못했습니다. 잠시 후 새로고침해 주세요.'))}});
