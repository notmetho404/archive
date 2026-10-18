function el(tag,cls,text){let n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n}
function art(image,title){let n=el('div','art');if(image){let img=el('img');img.src=image;img.alt=title;n.append(img)}else n.append(el('span','',title.slice(0,2).toUpperCase()));return n}
function drawCards(type,query=''){const target=document.querySelector('#listing');if(!target)return;target.replaceChildren();let data=db[type].filter(x=>(x.title+' '+x.category+' '+x.description).toLowerCase().includes(query.toLowerCase()));if(!data.length){target.append(el('p','empty','검색 결과가 없습니다.'));return}data.forEach(x=>{let card=el('article','card');card.append(art(x.image,x.title));card.append(el('h3','',x.title),el('p','',x.description),el('span','chip',x.category));target.append(card)})}
function drawUpdates(){let target=document.querySelector('#updates');if(!target)return;target.replaceChildren();db.updates.forEach(x=>{let row=el('div','log');row.append(el('strong','',x.category),el('div','',x.title+' — '+x.description));target.append(row)})}
function drawProfile(){let target=document.querySelector('#profile');if(!target)return;target.replaceChildren();let p=db.profile,box=el('div','about'),right=el('div');right.append(el('h2','',p.name),el('p','',p.intro),el('p','muted','PLATFORM · '+p.platform));if(p.contact)right.append(el('p','muted','CONTACT · '+p.contact));box.append(art(p.image,p.name),right);target.append(box)}
function drawHome(){let target=document.querySelector('#latest');if(!target)return;target.replaceChildren();db.works.slice(0,3).forEach(x=>{let card=el('article','card');card.append(art(x.image,x.title),el('h3','',x.title),el('p','',x.description));target.append(card)})}

async function loadData(){
  const names=['works','characters','updates','profile'];
  const responses=await Promise.all(names.map(async name=>{
    const response=await fetch('./data/'+name+'.json',{cache:'no-store'});
    if(!response.ok) throw new Error(name+' 파일을 불러오지 못했습니다 ('+response.status+')');
    return response.json();
  }));
  const next=Object.fromEntries(names.map((name,i)=>[name,responses[i]]));
  if(!Array.isArray(next.works)||!Array.isArray(next.characters)||!Array.isArray(next.updates)||!next.profile||typeof next.profile!=='object') throw new Error('JSON 데이터 구조를 확인해 주세요.');
  return next;
}
let db={works:[],characters:[],updates:[],profile:{}};
document.addEventListener('DOMContentLoaded',async()=>{
  const type=document.body.dataset.type;
  try{
    db=await loadData();
    if(type==='works'||type==='characters'){
      drawCards(type);
      document.querySelector('#search').addEventListener('input',e=>drawCards(type,e.target.value));
    }
    drawUpdates();drawProfile();drawHome();
  }catch(err){
    console.error(err);
    const target=document.querySelector('#listing')||document.querySelector('#latest')||document.querySelector('#updates')||document.querySelector('#profile');
    if(target)target.append(el('p','empty','데이터를 불러오지 못했습니다. GitHub Pages에서 열었는지, data 폴더와 JSON 파일이 업로드되었는지 확인해 주세요.'));
  }
});
