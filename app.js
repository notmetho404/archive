/* ===== 데이터 · 공통 도구 ===== */
function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n}
function pad2(n){return String(n).padStart(2,'0')}
function fmtDate(v){const t=String(v||'');return /^\d{4}-\d{2}-\d{2}$/.test(t)?t.replace(/-/g,'.'):t}
function dateText(v){const t=fmtDate(v).trim();return t&&!/\.$/.test(t)?t+'.':t}
function linkFor(type,x){return 'detail.html?type='+encodeURIComponent(type)+'&id='+encodeURIComponent(x._key)}
function workOf(c){return db.works.find(w=>w.title===c.category)}
function noOf(type,x){return pad2(db[type].indexOf(x)+1)}
function splitTags(v){return (Array.isArray(v)?v.flatMap(s=>String(s).split(',')):String(v||'').split(',')).map(s=>s.trim()).filter(Boolean)}
function tagsOf(x){return splitTags(x.category)}
function genreOf(x){return splitTags(x.genre)}
function labelsOf(type,x){return type==='works'?[...genreOf(x),...tagsOf(x)]:[]}
function filterTagsOf(type,x){return type==='works'?genreOf(x):[]}
function safeExternal(url){try{const u=new URL(url);return ['https:','http:'].includes(u.protocol)?u.href:null}catch{return null}}
function listOf(json){return Array.isArray(json)?json:(json&&Array.isArray(json.items)?json.items:null)}
function withKeys(list){const seen=new Map();return list.map(x=>{const base=String(x.id||x.title||'item').trim()||'item',n=(seen.get(base)||0)+1;seen.set(base,n);return {...x,_key:n>1?base+'-'+n:base}})}
async function loadData(){const names=['works','characters','updates','profile'];const responses=await Promise.all(names.map(async name=>{const response=await fetch('./data/'+name+'.json',{cache:'no-store'});if(!response.ok)throw new Error(name+' HTTP '+response.status);return response.json()}));const next=Object.fromEntries(names.map((name,i)=>[name,responses[i]]));for(const n of ['works','characters','updates']){const list=listOf(next[n]);if(!list)throw new Error('JSON 데이터 구조 오류');next[n]=withKeys(list)}if(!next.profile||typeof next.profile!=='object'||Array.isArray(next.profile))throw new Error('JSON 데이터 구조 오류');return next}
let db={works:[],characters:[],updates:[],profile:{}};

/* ===== 티켓 부품 ===== */
function art(image,title){const n=el('div','art');if(image){const img=el('img');img.src=image;img.alt=title||'';img.loading='lazy';n.append(img)}else n.append(el('span','',String(title||'?').slice(0,2).toUpperCase()));return n}
function barcode(seed,w,h){const box=el('div','barcode');box.setAttribute('aria-hidden','true');box.style.width=w+'px';box.style.height=h+'px';let x=2166136261;for(const ch of String(seed||''))x=Math.imul(x^ch.charCodeAt(0),16777619)>>>0;let sum=0;while(sum<w+2){x=(Math.imul(x,1664525)+1013904223)>>>0;const bw=1+(x>>>24)%4,g=1+(x>>>20)%3,b=el('i');b.style.width=bw+'px';b.style.marginRight=g+'px';box.append(b);sum+=bw+g}return box}
function rule(){const r=el('div','t-rule');r.append(el('i'),el('b'),el('i'));return r}
function tagRow(list){const w=el('div','tags');list.forEach(t=>w.append(el('span','tag','#'+t)));return w}
function stubInfo(label,value){const k=el('div','k');k.append(el('span','',label),el('b','',value));return k}
function sectionHead(kicker,title,linkHref,linkText){const h=el('div','section-head'),l=el('div','l');l.append(el('span','k',kicker),el('h2','',title));h.append(l);if(linkHref){const a=el('a','',linkText);a.href=linkHref;h.append(a)}return h}
function externalButton(url,label){const safe=safeExternal(url);if(!safe)return null;const a=el('a','',label);a.href=safe;a.target='_blank';a.rel='noopener noreferrer';return a}

/* 작품 티켓 */
function workCard(x){
 const wrap=el('a','ticket-wrap');wrap.href=linkFor('works',x);wrap.setAttribute('aria-label',x.title+' 상세 보기');
 const t=el('div','ticket mask-tb'),inn=el('div','t-in');
 const poster=el('div','t-poster');poster.append(art(x.image,x.title));
 const title=el('div','t-title');title.append(el('div','',x.title));
 inn.append(el('div','t-label','ARCHIVE CINEMA · NO. '+noOf('works',x)),poster,title,rule(),el('div','t-desc',x.description||''),tagRow(labelsOf('works',x)));
 const stub=el('div','t-stub');stub.append(stubInfo('DATE.',dateText(x.releaseDate)||'—'),barcode(x.title,128,34));
 t.append(inn,el('div','t-tear inset'),stub);wrap.append(t);return wrap
}
/* 캐릭터 티켓 */
function charCard(x){
 const wrap=el('a','ticket-wrap');wrap.href=linkFor('characters',x);wrap.setAttribute('aria-label',x.title+' 상세 보기');
 const t=el('div','ticket bordered mask-tb'),ca=el('div','c-art');
 const nm=el('div','c-name');nm.append(el('span','',x.title));
 ca.append(art(x.image,x.title),el('div','badge','NO. '+noOf('characters',x)),nm);
 const stub=el('div','t-stub');stub.append(el('div','c-intro',x.description||x.category||''),barcode(x.title,64,24));
 t.append(ca,el('div','t-tear'),stub);wrap.append(t);return wrap
}

/* ===== 목록 ===== */
const listState={query:'',tag:''};
function drawFilters(type){
 const box=document.querySelector('#filters');if(!box)return;box.replaceChildren();
 const tags=[...new Set(db[type].flatMap(x=>filterTagsOf(type,x)))];if(tags.length<2){box.hidden=true;return}
 ['',...tags].forEach(t=>{const b=el('button','filter',t||'전체');b.type='button';b.dataset.tag=t;b.setAttribute('aria-pressed',String(listState.tag===t));
  b.addEventListener('click',()=>{listState.tag=t;box.querySelectorAll('.filter').forEach(n=>n.setAttribute('aria-pressed',String(n.dataset.tag===t)));drawCards(type)});box.append(b)})
}
function drawCards(type,query){
 const target=document.querySelector('#listing');if(!target)return;
 if(query!==undefined)listState.query=query;
 target.replaceChildren();
 const q=listState.query.toLowerCase();
 const match=x=>(!listState.tag||filterTagsOf(type,x).includes(listState.tag))&&([x.title,x.category,genreOf(x).join(' '),x.description].join(' ')).toLowerCase().includes(q);
 const empty=()=>target.append(el('p','empty','조건에 맞는 항목이 없어요. 검색어를 지우거나 "전체"를 눌러 보세요.'));
 if(type==='works'){
  const data=db.works.filter(match);if(!data.length)return empty();
  const grid=el('div','cards works');data.forEach(x=>grid.append(workCard(x)));target.append(grid);return
 }
 const data=db.characters.filter(match);if(!data.length)return empty();
 const order=db.works.map(w=>w.title);
 const groups=[...order.filter(t=>data.some(c=>c.category===t)),...[...new Set(data.map(c=>c.category))].filter(t=>!order.includes(t))];
 groups.forEach(title=>{
  const items=data.filter(c=>c.category===title),w=db.works.find(x=>x.title===title);
  const g=el('section','group');g.append(sectionHead('FROM',title||'소속 없음',w?linkFor('works',w):'','작품 보러가기 →'));
  const grid=el('div','cards chars');items.forEach(c=>grid.append(charCard(c)));g.append(grid);target.append(g)
 })
}

/* ===== 업데이트 ===== */
function splitTitle(x){const tm=!x.tag&&String(x.title||'').match(/^\[([^\]]+)\]\s*(.*)$/);return {tag:x.tag||(tm?tm[1]:''),title:tm?tm[2]:x.title}}
function drawUpdates(){
 const target=document.querySelector('#updates');if(!target)return;target.replaceChildren();
 if(!db.updates.length){target.append(el('li','empty','아직 등록된 업데이트가 없어요.'));return}
 db.updates.forEach(x=>{
  const {tag,title}=splitTitle(x),li=el('li','up-row'),d=el('div','up-date');
  d.append(el('span','','DATE.'),el('b','',dateText(x.category)||'—'));
  const main=el('div','up-main'),head=el('div','up-head');if(tag)head.append(el('span','up-tag',tag));head.append(el('h2','',title));main.append(head);
  if(x.description)main.append(el('p','up-desc',x.description));
  if(x.image){const img=el('img','up-img');img.src=x.image;img.alt=title;img.loading='lazy';main.append(img)}
  li.append(d,main);target.append(li)
 })
}

/* ===== 홈 ===== */
function drawHome(){
 const target=document.querySelector('#home');if(!target)return;target.replaceChildren();
 const p=db.profile||{},name=p.name||'무한리필부찌만';
 const hero=el('section','hero'),t=el('div','ticket mask-lr'),inn=el('div','hero-in'),main=el('div','hero-main');
 main.append(el('div','kicker','ARCHIVE CINEMA · NOW SHOWING'),el('h1','',name),el('p','','AI챗 작품과 캐릭터를 한곳에 모아둔 아카이브'),rule());
 const go=el('a','btn','작품 보러가기');go.href='works.html';main.append(go);
 const first=db.updates[0],date=dateText(first?first.category:(db.works[0]||{}).releaseDate)||'—';
 const stub=el('div','hero-stub');stub.append(stubInfo('ADMIT ONE','NO. 01'),stubInfo('DATE.',date),barcode(name,196,54));
 inn.append(main,stub);t.append(inn);hero.append(t);target.append(hero);
 const sec=el('section','home-section');sec.append(sectionHead('UPDATES','업데이트','updates.html','전체 보기 →'));
 const list=el('div','');db.updates.slice(0,3).forEach(x=>{const {tag,title}=splitTitle(x),r=el('div','log-row');r.append(el('span','log-date',dateText(x.category)||'—'));if(tag)r.append(el('span','log-tag',tag));r.append(el('span','log-title',title));list.append(r)});
 if(!db.updates.length)list.append(el('p','empty','아직 등록된 업데이트가 없어요.'));
 sec.append(list);target.append(sec)
}

/* ===== 소개 ===== */
function drawProfile(){
 const target=document.querySelector('#profile');if(!target)return;target.replaceChildren();
 const p=db.profile||{},name=p.name||'—',wrap=el('div','about');
 const card=el('div','ticket-wrap about-card'),t=el('div','ticket bordered mask-tb'),ca=el('div','c-art'),nm=el('div','c-name');nm.append(el('span','',name));
 ca.append(art(p.image,name),el('div','badge','STAFF'),nm);
 const stub=el('div','t-stub');stub.append(stubInfo('ADMIT','ONE'),barcode(name,64,24));
 t.append(ca,el('div','t-tear'),stub);card.append(t);
 const info=el('div','about-info');info.append(el('div','kicker','ABOUT'),el('h1','',name));
 if(p.intro)info.append(el('p','',p.intro));if(p.bio)info.append(el('p','',p.bio));
 info.append(rule());
 const stats=[['활동 플랫폼',p.platform],['작품',db.works.length+'개'],['캐릭터',db.characters.length+'명'],['연락처',p.contact]].filter(([,v])=>v);
 const links=[];if(p.links){splitTags(p.links).forEach((u,i)=>{const b=externalButton(u,(i?'링크 '+(i+1):'활동 페이지')+' ↗');if(b)links.push(b)})}
 if(links.length){const b=el('div','about-block');b.append(el('div','t-mini','LINKS'));const row=el('div','link-row');links.forEach(l=>row.append(l));b.append(row);info.append(b)}
 const b2=el('div','about-block');b2.append(el('div','t-mini','INFO'));const rows=el('div','tags');rows.style.marginTop='12px';stats.forEach(([k,v])=>{const s=el('span','tag',k+' · '+v);s.style.fontSize='13px';s.style.padding='4px 12px';rows.append(s)});b2.append(rows);info.append(b2);
 if(p.notice){const b=el('div','about-block');b.append(el('div','t-mini','NOTICE'));const n=el('div','notice');String(p.notice).split(/\n+/).filter(Boolean).forEach(line=>n.append(el('div','',line.startsWith('·')?line:'· '+line)));b.append(n);info.append(b)}
 wrap.append(card,info);target.append(wrap)
}

/* ===== 상세 ===== */
function posterTicket(item,type){
 const wrap=el('div','ticket-wrap dt-poster'),t=el('div','ticket bordered mask-tb'),fill=el('div','dt-fill');
 fill.append(art(item.image,item.title),el('div','badge','NO. '+noOf(type,item)));t.append(fill);wrap.append(t);return wrap
}
function infoTicket(o){
 const wrap=el('div','ticket-wrap dt-info'),t=el('div','ticket mask-tb');
 const head=el('div','dt-head t-label');head.append(el('span','','ARCHIVE CINEMA'),el('span','','NO. '+o.no));
 const box=el('div','dt-box'),mini=el('div','t-mini');mini.append(el('span','',o.kicker),el('span','',o.right));
 const title=el('div','dt-title');title.append(el('h1','',o.title));if(o.sub)title.append(el('div','',o.sub));
 box.append(mini,title);
 if(o.rows&&o.rows.length){const rows=el('div','dt-rows');o.rows.forEach(([k,v])=>{const r=el('div','');r.append(el('span','k',k));if(v instanceof Node)r.append(v);else r.append(el('b','',v));rows.append(r)});box.append(rows)}
 const body=el('div','dt-flex');
 (o.blocks||[]).forEach(([label,text])=>{if(!text)return;const b=el('div','dt-block');b.append(el('span','t-mini',label),el('p','',String(text)));body.append(b)});
 box.append(body);
 if(o.actions&&o.actions.length){const acts=el('div','dt-actions');o.actions.forEach(a=>acts.append(a));box.append(acts)}
 const foot=el('div','dt-foot');foot.append(el('span','','PLEASE KEEP YOUR STUB'));box.append(foot);
 t.append(head,box);wrap.append(t);return wrap
}
function actionLink(label,text,href,external){const a=el('a','');const m=el('span','t-mini',label),s=el('strong','',text);a.append(m,s);a.href=href;if(external){a.target='_blank';a.rel='noopener noreferrer'}return a}
function castCard(c){
 const wrap=el('a','ticket-wrap cast-card');wrap.href=linkFor('characters',c);wrap.setAttribute('aria-label',c.title+' 상세 보기');
 const t=el('div','ticket mask-lr'),img=el('div','cast-img');img.append(art(c.image,c.title),el('div','badge','NO. '+noOf('characters',c)));
 const stub=el('div','cast-stub');stub.append(el('strong','',c.title),barcode(c.title,80,30));t.append(img,stub);wrap.append(t);return wrap
}
function drawDetail(){
 const target=document.querySelector('#detail');if(!target)return;target.replaceChildren();
 const params=new URLSearchParams(location.search),type=params.get('type'),id=params.get('id');
 if(!['works','characters'].includes(type)||!id){target.append(el('p','empty','잘못된 상세 페이지 주소입니다.'));return}
 const item=db[type].find(x=>x._key===id);if(!item){target.append(el('p','empty','해당 항목을 찾을 수 없습니다.'));return}
 document.title=item.title+' — notmetho.exe';
 document.querySelectorAll('.topbar nav a').forEach(a=>a.classList.toggle('active',a.getAttribute('href')===type+'.html'));
 const back=el('a','back','← '+(type==='works'?'작품 목록으로':'캐릭터 목록으로'));back.href=type+'.html';target.append(back);
 const row=el('div','dt-row');
 if(type==='works'){
  const related=db.characters.filter(c=>c.category===item.title);
  const plats=(Array.isArray(item.platforms)?item.platforms:[]).map(p=>({name:String(p&&p.name||'').trim(),url:p&&p.url})).filter(p=>p.name&&safeExternal(p.url));
  const year=String(item.releaseDate||'').match(/\d{4}/);
  const rows=[];if(related.length)rows.push(['캐릭터',related.length+'명']);if(plats.length)rows.push(['플랫폼',plats.map(p=>p.name).join(' · ')]);
  const syn=[item.description,item.detail].filter(Boolean).join('\n\n');
  row.append(posterTicket(item,type),infoTicket({no:noOf(type,item),kicker:'TITLE',right:year?'['+year[0]+']':'',title:item.title,sub:item.releaseDate?'공개 '+dateText(item.releaseDate):'',rows,blocks:[['SYNOPSIS',syn]],actions:[...plats.map(p=>actionLink('WATCH ON',p.name+' ↗',safeExternal(p.url),true)),...(safeExternal(item.homepage)?[actionLink('HOMEPAGE',String(item.homepageLabel||'홈페이지').trim()+' ↗',safeExternal(item.homepage),true)]:[])]}));
  target.append(row);
  const lab=labelsOf('works',item);
  if(lab.length||item.releaseDate){const meta=el('div','dt-meta');meta.append(tagRow(lab));const d=el('div','d');d.append(el('span','','DATE.'),document.createTextNode(dateText(item.releaseDate)||'—'));meta.append(d);target.append(meta)}
  if(related.length){const cast=el('section','cast');cast.append(sectionHead('CAST','이 작품의 캐릭터','characters.html','캐릭터 전체 →'));const list=el('div','cast-list');related.forEach(c=>list.append(castCard(c)));cast.append(list);target.append(cast)}
 }else{
  const parent=workOf(item),rows=[];
  if(parent){const a=el('a','',parent.title);a.href=linkFor('works',parent);a.style.fontWeight='700';rows.push(['소속',a])}
  if(item.role)rows.push(['역할',item.role]);
  const acts=parent?[actionLink('FROM',parent.title+' 보기 →',linkFor('works',parent),false)]:[];
  row.append(posterTicket(item,type),infoTicket({no:noOf(type,item),kicker:'CHARACTER',right:parent?'FROM':'',title:item.title,sub:'',rows,blocks:[['PROFILE',[item.description,item.detail].filter(Boolean).join('\n\n')],['PERSONALITY',item.personality],['APPEARANCE',item.appearance]],actions:acts}));
  target.append(row)
 }
}

document.addEventListener('DOMContentLoaded',async()=>{const type=document.body.dataset.type;try{db=await loadData();if(type==='works'||type==='characters'){drawFilters(type);drawCards(type);const search=document.querySelector('#search');if(search)search.addEventListener('input',e=>drawCards(type,e.target.value))}drawUpdates();drawProfile();drawHome();if(type==='detail')drawDetail()}catch(err){console.error(err);const target=document.querySelector('#detail')||document.querySelector('#listing')||document.querySelector('#home')||document.querySelector('#updates')||document.querySelector('#profile');if(target)target.append(el('p','empty','데이터를 불러오지 못했습니다. 잠시 후 새로고침해 주세요.'))}});
