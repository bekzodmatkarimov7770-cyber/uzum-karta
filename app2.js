/* ---------- State ---------- */
const LAYOUTS={spec:'Asosiy: oq kartalar + pastki qator',features:'Xususiyatlar: qora kartalar + rasmli plitkalar',rows:"Bo‘limlar: qatorlar + teglar",gallery:'Galereya: oq kartalar + katta plitkalar',grid:"Rasm to‘ri (to‘liq tavsif uchun)"};
const LIM={spec:{cards:5,bottom:4},features:{cards:6,tiles:4},rows:{rows:5,bottom:4},gallery:{cards:4,tiles:3},grid:{tiles:4}};
const LISTNAME={cards:'Xususiyat kartalari',bottom:'Pastki qator',tiles:'Rasmli plitkalar',rows:"Bo‘limlar"};
const NEWITEM={cards:()=>({i:'star',t:'Sarlavha',s:'Qisqa izoh'}),bottom:()=>({i:'check',t:'Sarlavha',s:'Qisqa izoh'}),tiles:()=>({img:null,t:'Sarlavha',s:'Qisqa izoh'}),rows:()=>({t:"BO'LIM NOMI",s:'Qisqa izoh',chips:'',img:null,bi:'star',bt:'',bs:''})};

function sample(){
  return{brand:{logoText:'acer',logoImg:null,model:'ASPIRE',num:'7',cA:'#3aa52b',cB:'#1d5cff',dark:'#121418',badgeOn:true,badgeIcon:'win',badgeT:'Windows 11',badgeS:'Zamonaviy imkoniyatlar',script:'Kaushan Script',apos:true,productEn:'a black Acer Aspire 7 laptop'},
  slides:[
    {layout:'spec',tagline:'Yuqori unumdorlik',s1:'',s2:'',headline:"Ish, ta'lim va o'yin uchun ideal",bg:null,lighten:true,
     cards:[{i:'cpu',t:'Intel® Core 7-240H',s:'10 yadro / 16 oqim\n5.2 GHz gacha'},{i:'ram',t:'16 GB DDR5',s:'Tezkor xotira'},{i:'ssd',t:'512 GB SSD NVMe',s:'Tezkor yuklanish'},{i:'monitor',t:'15.6" FHD',s:'IPS displey\nAniq va qulay tasvir'}],
     bottom:[{i:'feather',t:'Zamonaviy dizayn',s:'Yengil va qulay'},{i:'shield',t:'Ishonchli samaradorlik',s:'Har kuni ishonch bilan'},{i:'monitor',t:'Katta imkoniyatlar',s:"Ish, ta'lim va o'yin uchun"},{i:'gem',t:'Acer sifati',s:'Uzoq muddat xizmat qiladi'}],tiles:[],rows:[]},
    {layout:'features',tagline:'Ekran & qulaylik',s1:'144 Hz',s2:'Silliq tasvir',bg:null,lighten:true,
     cards:[{i:'monitor',t:'15.6" FHD',s:'Katta va aniq ekran'},{i:'eye',t:'IPS display',s:"Keng ko'rish burchagi\nJonli va tabiiy ranglar"},{i:'expand',t:'1920 × 1080',s:'Full HD aniqlik\nHar bir detal aniq'},{i:'gauge',t:'144 Hz',s:"Silliq va ravon tasvir\nO'yin va ish uchun ideal"},{i:'eye',t:'Anti-glare',s:"Ko'zga qulay\nUzoq muddat foydalanish"},{i:'keyboard',t:'Klaviatura yoritgichi',s:"Qorong'uda ham qulay ishlash"}],
     tiles:[{img:null,t:"Keng ko'rish burchagi",s:'Istalgan rakursdan ajoyib tasvir'},{img:null,t:'144 Hz silliq tasvir',s:'Tez harakatlarda ham ravon'},{img:null,t:'Klaviatura yoritgichi',s:"Qorong'uda ham qulay ishlash"}],bottom:[],rows:[]},
    {layout:'rows',tagline:'Har sohada qulay',s1:'Bitta noutbuk',s2:"ko'p imkoniyat",bg:null,lighten:true,
     rows:[{t:"O'yinlar uchun",s:"Yuqori FPS va silliq o'yin jarayoni",chips:'CS2, Dota 2, PUBG, GTA V, Valorant',img:null,bi:'gamepad',bt:'144 Hz',bs:"Silliq va ravon o'yinlar"},
       {t:'Video montaj uchun',s:'Tez va barqaror ishlash',chips:'Premiere Pro, After Effects, DaVinci Resolve, CapCut',img:null,bi:'film',bt:'Katta loyihalarda',bs:'barqaror ishlash'},
       {t:'Grafik dizayn uchun',s:'Ijodiy loyihalar uchun ideal',chips:'Photoshop, Illustrator, Lightroom, Figma',img:null,bi:'palette',bt:'Yuqori aniqlikda',bs:'dizayn va ishlov berish'},
       {t:'Dasturlash uchun',s:'Qulay va samarali muhit',chips:'VS Code, PyCharm, Python, Git',img:null,bi:'code',bt:'Tez va qulay',bs:'ishlash muhiti'},
       {t:'Ofis va muloqot uchun',s:'Kunlik ishlar uchun barcha imkoniyatlar',chips:'Word, Excel, Telegram, Zoom',img:null,bi:'briefcase',bt:"O'qish, ish va muloqot",bs:'universal yechim'}],
     bottom:[{i:'zap',t:"Ko'p vazifani",s:'bir vaqtda bajarish'},{i:'gauge',t:'Professionallikda',s:'barqaror ishlash'},{i:'gear',t:'Har qanday',s:'sohada qulaylik'},{i:'box',t:"Ish, o'yin va ijod",s:'uchun universal'}],cards:[],tiles:[]},
    {layout:'gallery',tagline:'Ishonchli dizayn\nva sovutish',s1:'Uzoq ishlash',s2:'uchun yaratilgan',bg:null,lighten:true,
     cards:[{i:'shield',t:'Mustahkam korpus',s:'Uzoq muddat foydalanish uchun'},{i:'fan',t:'Samarali sovutish',s:'Barqaror ishlash'},{i:'gem',t:'Zamonaviy dizayn',s:"Sodda va premium ko'rinish"},{i:'mute',t:'Kam shovqin',s:'Sokin va qulay ish muhiti'}],
     tiles:[{img:null,t:'Premium qora korpus',s:'Sodda, zamonaviy va mustahkam'},{img:null,t:'Optimal sovutish tizimi',s:'Uzoq seanslarda ham barqaror ishlash'},{img:null,t:'Yupqa va qulay',s:'Istalgan joyda olib yurish uchun ideal dizayn'}],bottom:[],rows:[]},
    {layout:'features',tagline:'Gaming & grafika uchun',s1:"O'yin, montaj",s2:'dasturlash uchun',bg:null,lighten:true,
     cards:[{i:'gamepad',t:'RTX 3050',s:'NVIDIA GeForce\n6 GB GDDR6'},{i:'sun',t:'Ray Tracing',s:'Realistik yoritish va soyalar'},{i:'gauge',t:'DLSS',s:"Yuqori FPS va silliq o'yin"},{i:'cpu',t:'Intel Core 7',s:'5.2 GHz gacha'}],
     tiles:[{img:null,t:'CS2',s:"Yuqori FPS va silliq o'yin"},{img:null,t:'Video montaj',s:'Premiere Pro, After Effects'},{img:null,t:'Grafik dasturlar',s:'Photoshop, Illustrator'},{img:null,t:'Dasturlash',s:'VS Code, Python, Web'}],bottom:[],rows:[]},
  ]};
}
let P=sample(),CUR=0;
function ensure(s){for(const k of['cards','bottom','tiles','rows'])if(!Array.isArray(s[k]))s[k]=[];return s}
function cur(){return P.slides[CUR]}
function getPath(o,p){return p.split('.').reduce((a,k)=>a==null?a:a[k],o)}
function setPath(o,p,v){const ks=p.split('.');const last=ks.pop();const t=ks.reduce((a,k)=>a[k],o);t[last]=v}

function loadImage(id,src){return new Promise(res=>{const im=new Image();im.onload=()=>{IMG[id]=im;res()};im.onerror=()=>res();im.src=src})}
function newId(){return'i'+Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
function readFile(file){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(file)})}
async function addImage(file){
  let url=await readFile(file);
  // shrink very large photos to keep the project light
  const tmp=new Image();await new Promise(r=>{tmp.onload=r;tmp.onerror=r;tmp.src=url});
  const max=2200;if(tmp.width>max||tmp.height>max){const s=max/Math.max(tmp.width,tmp.height);const cv=document.createElement('canvas');cv.width=Math.round(tmp.width*s);cv.height=Math.round(tmp.height*s);cv.getContext('2d').drawImage(tmp,0,0,cv.width,cv.height);url=cv.toDataURL(file.type==='image/png'?'image/png':'image/jpeg',.92)}
  return addDataUrl(url);
}
async function addDataUrl(url){const id=newId();IMGDATA[id]=url;await loadImage(id,url);idb.set(id,url).catch(()=>{});return id}
const idb=(()=>{let dbp;
  function db(){return dbp||(dbp=new Promise((res,rej)=>{const r=indexedDB.open('uzum-studio',1);r.onupgradeneeded=()=>r.result.createObjectStore('img');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}))}
  async function op(mode,fn){const d=await db();return new Promise((res,rej)=>{const t=d.transaction('img',mode);const rq=fn(t.objectStore('img'));t.oncomplete=()=>res(rq&&rq.result);t.onerror=()=>rej(t.error)})}
  return{set:(k,v)=>op('readwrite',s=>s.put(v,k)),get:k=>op('readonly',s=>s.get(k))};
})();
function usedIds(){const ids=new Set();const add=id=>{if(id)ids.add(id)};add(P.brand.logoImg);add(P.brand.refImg);for(const s of P.slides){add(s.bg);(s.tiles||[]).forEach(t=>add(t.img));(s.rows||[]).forEach(r=>add(r.img))}return[...ids]}

/* ---------- Persistence ---------- */
let saveT;
function saveLocal(){clearTimeout(saveT);saveT=setTimeout(()=>{try{localStorage.setItem(KEY,JSON.stringify({P}))}catch(e){}},600)}
function usedImages(){const used={};for(const id of usedIds())if(IMGDATA[id])used[id]=IMGDATA[id];return used}
async function restore(obj){
  if(!obj||!obj.P||!Array.isArray(obj.P.slides))return false;
  P=obj.P;P.brand={...sample().brand,...P.brand};P.slides.forEach(ensure);if(!P.slides.length)P.slides=sample().slides;
  const imgs=obj.IMGDATA||{};await Promise.all(Object.entries(imgs).map(([id,u])=>{IMGDATA[id]=u;idb.set(id,u).catch(()=>{});return loadImage(id,u)}));
  CUR=0;return true;
}

/* ---------- Rendering schedule ---------- */
const cv=$('#cv'),ctx=cv.getContext('2d');
let raf=0,thumbT;
function schedule(){if(!raf)raf=requestAnimationFrame(()=>{raf=0;render(ctx,cur(),true)});clearTimeout(thumbT);thumbT=setTimeout(drawThumbs,400);saveLocal()}
const off=document.createElement('canvas');off.width=W;off.height=H;const octx=off.getContext('2d');
function drawThumbs(){document.querySelectorAll('.thumb canvas').forEach((c,i)=>{if(!P.slides[i])return;render(octx,P.slides[i],true);const t=c.getContext('2d');t.clearRect(0,0,c.width,c.height);t.drawImage(off,0,0,c.width,c.height)})}

/* ---------- UI builders ---------- */
const esc=s=>String(s??'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
const T=(label,k,v,ph='')=>`<label>${label}<input data-k="${k}" value="${esc(v)}" placeholder="${esc(ph)}"></label>`;
const A=(label,k,v,rows=2,ph='')=>`<label>${label}<textarea data-k="${k}" rows="${rows}" placeholder="${esc(ph)}">${esc(v)}</textarea></label>`;
const ICSEL=(k,v,extra='')=>`<div class="ic-wrap"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONS[v]?.[1]||''}"/></svg><select ${extra||`data-k="${k}"`} aria-label="Ikonka">${Object.entries(ICONS).map(([n,[l]])=>`<option value="${n}"${n===v?' selected':''}>${esc(l)}</option>`).join('')}</select></div>`;
const IMGF=(label,k,id,attr='data-img')=>`<div class="imgf"><span>${label}</span>${id&&IMG[id]?`<img src="${IMG[id].src}" alt=""><button class="lnk" data-clear="${k}">Olib tashlash</button>`:''}<label class="btn sm">${id&&IMG[id]?'Almashtirish':'Rasm yuklash'}<input type="file" accept="image/*" ${attr}="${k}" hidden></label>${FAL_OK&&attr==='data-img'?`<button class="btn sm ghost" data-gen="${k}">AI bilan yaratish</button>`:''}</div>`;

function cardF(it,p){return`<div class="ic-row">${ICSEL(p+'.i',it.i)}<input data-k="${p}.t" value="${esc(it.t)}" aria-label="Sarlavha" placeholder="Sarlavha"></div><textarea data-k="${p}.s" rows="2" aria-label="Izoh" placeholder="Izoh (yangi qator uchun Enter)">${esc(it.s)}</textarea>`}
function tileF(it,p){return IMGF('Rasm',p+'.img',it.img)+`<input data-k="${p}.t" value="${esc(it.t)}" aria-label="Sarlavha" placeholder="Sarlavha"><textarea data-k="${p}.s" rows="2" aria-label="Izoh" placeholder="Izoh">${esc(it.s)}</textarea>`}
function rowF(it,p){return T('Sarlavha',p+'.t',it.t)+T('Izoh',p+'.s',it.s)+T('Teglar (vergul bilan)',p+'.chips',it.chips,'CS2, Dota 2, PUBG')+IMGF("O‘ngdagi rasm",p+'.img',it.img)+`<div class="sub">O'ngdagi belgi (bo'sh qoldirsangiz chiqmaydi)</div><div class="ic-row">${ICSEL(p+'.bi',it.bi)}<input data-k="${p}.bt" value="${esc(it.bt)}" aria-label="Belgi sarlavhasi" placeholder="Masalan: 144 Hz"></div><input data-k="${p}.bs" value="${esc(it.bs)}" aria-label="Belgi izohi" placeholder="Izoh">`}
const FIELDS={cards:cardF,bottom:cardF,tiles:tileF,rows:rowF};
function listEd(key,arr,max){
  return`<fieldset class="list"><legend>${LISTNAME[key]} <small>${arr.length}/${max}</small></legend>${arr.map((it,j)=>`<div class="item"><div class="item-h"><span>${j+1}</span><button class="lnk" data-del="${key}.${j}">O‘chirish</button></div>${FIELDS[key](it,`${key}.${j}`)}</div>`).join('')}${arr.length<max?`<button class="btn sm ghost" data-add="${key}">+ Qo‘shish</button>`:''}</fieldset>`;
}

function promptFor(s){
  const out=[];
  out.push(`1) FON (3:4, 1080x1440):\n${bgPrompt(s)}`);
  const list=s.layout==='rows'?s.rows:s.tiles;
  list.forEach((it,i)=>out.push(`${i+2}) "${fx(it.t)}" uchun rasm:\n${itemPrompt(s,it)}`));
  return out.join('\n\n');
}
const NO_TXT='No text, no letters, no numbers, no logos other than the product’s own, no watermarks, no UI.';
function bgPrompt(s){
  const prod=(P.brand.productEn||'the product').trim(),scene=(s.scene||'').trim();
  const room={spec:'the top 30% and the right 30% of the image, and the bottom 15%',features:'the top 30%, the right 30% and the bottom 22%',gallery:'the top 30%, the right 30% and the bottom 26%'}[s.layout];
  if(room)return`Vertical 3:4 photorealistic e-commerce advertising photo. ${prod} placed in the lower-left and center of the frame, slightly angled, premium studio quality, sharp details. ${scene?scene+'.':'Bright modern office background, soft natural daylight, blurred green plants, clean palette.'} Keep ${room} calm and empty (soft blurred background only) for text overlays. ${NO_TXT}`;
  return`Vertical 3:4 soft background, heavily blurred, nothing in sharp focus: ${scene||'bright modern office, plants bokeh, light clean tones'}. ${NO_TXT}`;
}
function itemPrompt(s,it){
  const prod=(P.brand.productEn||'the product').trim(),pic=(it.pic||'').trim();
  const ar=s.layout==='rows'?'Wide landscape':s.layout==='gallery'?'Vertical 3:4':'Landscape';
  return`${ar} photorealistic image: ${pic||`illustrating ${fx(it.t)}${it.s?' — '+fx(it.s):''}, related to ${prod}`}. Same product look and colour as in the main photo. Premium lighting. ${NO_TXT}`;
}

function renderEditor(){
  const s=cur(),lim=LIM[s.layout];
  let h=`<div class="ed-top"><strong>${CUR+1}-rasm</strong><div class="btns"><button class="btn sm" data-act="up" aria-label="Chapga surish">←</button><button class="btn sm" data-act="down" aria-label="O'ngga surish">→</button><button class="btn sm" data-act="dup">Nusxa</button><button class="btn sm" data-act="del">O‘chirish</button></div></div>`;
  h+=`<label>Maket<select data-k="layout">${Object.entries(LAYOUTS).map(([k,v])=>`<option value="${k}"${k===s.layout?' selected':''}>${esc(v)}</option>`).join('')}</select></label>`;
  h+=IMGF('Fon rasmi','bg',s.bg);
  h+=`<label class="check"><input type="checkbox" data-k="lighten"${s.lighten!==false?' checked':''}> Yuqori qismni oqartirish (yozuv o'qilishi uchun)</label>`;
  h+=A('Fon sahnasi (ChatGPT prompti uchun, inglizcha)','scene',s.scene,2,'on a light wooden desk in a bright modern office');
  h+=A('Kichik yozuv (model ostida)','tagline',s.tagline,2,'YUQORI UNUMDORLIK');
  h+=`<div class="row2">${T('Shior, 1-qator','s1',s.s1,'144 Hz')}${T('Shior, 2-qator','s2',s.s2,'Silliq tasvir')}</div>`;
  if(s.layout==='spec')h+=A('Chapdagi sarlavha','headline',s.headline,2,"Ish, ta'lim va o'yin uchun ideal");
  for(const key of Object.keys(lim))h+=listEd(key,s[key],lim[key]);
  h+=`<div class="sep"></div><div class="prompt"><label>ChatGPT uchun rasm promptlari<textarea id="promptBox" rows="7" readonly>${esc(promptFor(s))}</textarea></label><p class="hint">Har birini ChatGPT'ga alohida bering. Yozuvsiz so'raganimiz uchun birinchi urinishda tayyor chiqadi.</p><button class="btn sm" id="copyPrompt">Promptlarni nusxalash</button></div>`;
  $('#editorPanel').innerHTML=h;
}
function refreshPrompt(){const pb=$('#promptBox');if(pb)pb.value=promptFor(cur())}

function renderBrand(){
  const B=P.brand;
  const badgeOpts=[['win','Windows belgisi'],['none','Belgisiz'],...Object.entries(ICONS).map(([k,[l]])=>[k,l])];
  $('#brandPanel').innerHTML=`<h2>Brend — barcha rasmlar uchun</h2>
  <label>Brend nomi (logotip o'rniga)<input data-b="logoText" value="${esc(B.logoText)}"></label>
  ${IMGF('Logotip PNG','logoImg',B.logoImg,'data-bimg')}
  ${IMGF('Mahsulotning haqiqiy rasmi','refImg',B.refImg,'data-bimg')}
  <p class="hint">Haqiqiy rasm (sayt yoki o'zingiz olgan surat) berilsa, AI aynan shu mahsulotni chizadi.</p>
  ${FAL_OK?`<div class="sep"></div><h2>OpenAI sozlamalari</h2>
  <label>Asosiy rasmlar (mahsulot aniq ko'rinadi)<select data-b="heroModel">${MODELS.image.map(m=>`<option${m===B.heroModel?' selected':''}>${esc(m)}</option>`).join('')}</select></label>
  <label>Kichik rasmlar (plitkalar, fonlar)<select data-b="smallModel">${MODELS.image.map(m=>`<option${m===B.smallModel?' selected':''}>${esc(m)}</option>`).join('')}</select></label>
  ${HAS_SAMPLE?'':`<label>Matn va tekshiruv modeli<select data-b="llm">${MODELS.chat.map(m=>`<option${m===B.llm?' selected':''}>${esc(m)}</option>`).join('')}</select></label>`}
  <p class="hint">Tavsiya: asosiy — gpt-image-2, kichik — gpt-image-1-mini (arzonroq).</p>`:''}
  ${FAL_ENV?`<label>Studiya paroli<input type="password" id="passIn" autocomplete="current-password" value="${esc(getPass())}" placeholder="Vercel'dagi STUDIO_PASS"></label>`:''}
  <div class="row2"><label>Model<input data-b="model" value="${esc(B.model)}"></label><label>Raqam / qo'shimcha<input data-b="num" value="${esc(B.num)}"></label></div>
  <div class="row3"><label>Asosiy rang<input type="color" data-b="cA" value="${esc(B.cA)}"></label><label>Raqam rangi<input type="color" data-b="cB" value="${esc(B.cB)}"></label><label>Matn rangi<input type="color" data-b="dark" value="${esc(B.dark)}"></label></div>
  <div class="sep"></div>
  <label class="check"><input type="checkbox" data-b="badgeOn"${B.badgeOn?' checked':''}> O'ng yuqoridagi belgi</label>
  <label>Belgi ikonkasi<select data-b="badgeIcon">${badgeOpts.map(([k,l])=>`<option value="${k}"${k===B.badgeIcon?' selected':''}>${esc(l)}</option>`).join('')}</select></label>
  <div class="row2"><label>Belgi matni<input data-b="badgeT" value="${esc(B.badgeT)}"></label><label>Belgi izohi<input data-b="badgeS" value="${esc(B.badgeS)}"></label></div>
  <div class="sep"></div>
  <label>Shior shrifti<select data-b="script"><option value="Kaushan Script"${B.script==='Kaushan Script'?' selected':''}>Kaushan (lotin)</option><option value="Caveat"${B.script==='Caveat'?' selected':''}>Caveat (lotin + kirill)</option></select></label>
  <label class="check"><input type="checkbox" data-b="apos"${B.apos?' checked':''}> o' g' ni avtomatik o‘ g‘ ga aylantirish</label>
  <label>Mahsulot inglizcha (prompt uchun)<input data-b="productEn" value="${esc(B.productEn)}" placeholder="a black Acer Aspire 7 laptop"></label>
  <div class="sep"></div>
  <h2>Shablon</h2>
  <p class="hint">Matnlar shu brauzerda avtomatik saqlanadi. Keyingi mahsulot uchun rasmlarni tozalab, faqat matnni o'zgartiring.</p>
  <div class="btns"><button class="btn sm" id="clearImgs">Rasmlarni tozalash</button><button class="btn sm" id="saveJson">Shablonni faylga saqlash</button><button class="btn sm" id="openJson">Shablonni ochish</button><button class="btn sm ghost" id="resetAll">Namunani tiklash</button></div>`;
}

function renderStrip(){
  $('#strip').innerHTML=P.slides.map((s,i)=>`<button class="thumb${i===CUR?' on':''}" data-go="${i}" aria-label="${i+1}-rasm"><canvas width="168" height="224"></canvas><span>${i+1}</span></button>`).join('')+
  `<div class="addbox"><select id="newLayout" aria-label="Yangi rasm maketi">${Object.entries(LAYOUTS).map(([k,v])=>`<option value="${k}">${esc(v)}</option>`).join('')}</select><button class="btn sm" id="addSlide">+ Yangi rasm</button></div>`;
  drawThumbs();
}
function selectSlide(i){CUR=Math.max(0,Math.min(P.slides.length-1,i));renderStrip();renderEditor();schedule()}

/* ---------- Events ---------- */
const ed=$('#editorPanel'),br=$('#brandPanel');
ed.addEventListener('input',e=>{
  const el=e.target,k=el.dataset.k;if(!k)return;
  const v=el.type==='checkbox'?el.checked:el.value;setPath(cur(),k,v);
  if(k==='layout'){ensure(cur());renderEditor()}
  if(/\.(i|bi)$/.test(k)){const p=el.closest('.ic-wrap')?.querySelector('path');if(p)p.setAttribute('d',ICONS[v]?.[1]||'')}
  refreshPrompt();schedule();
});
ed.addEventListener('change',async e=>{
  const el=e.target,k=el.dataset.img;if(!k||!el.files[0])return;
  try{const id=await addImage(el.files[0]);setPath(cur(),k,id);renderEditor();schedule()}catch(err){toast('Rasmni o‘qib bo‘lmadi. Boshqa fayl tanlang.')}
});
ed.addEventListener('click',async e=>{
  const b=e.target.closest('button');if(!b)return;const s=cur();
  if(b.dataset.add){const k=b.dataset.add;s[k].push(NEWITEM[k]());renderEditor();schedule()}
  else if(b.dataset.del){const[k,j]=b.dataset.del.split('.');s[k].splice(+j,1);renderEditor();schedule()}
  else if(b.dataset.clear){setPath(s,b.dataset.clear,null);renderEditor();schedule()}
  else if(b.dataset.gen){
    const k=b.dataset.gen,slot=`s${CUR}.`+(k==='bg'?'bg':k.replace(/\.img$/,''));
    b.disabled=true;b.textContent='Yaratilmoqda… (20–60 soniya)';
    try{await genSlot(slot);renderEditor();renderStrip();saveLocal()}catch(err){b.disabled=false;b.textContent='AI bilan yaratish';toast(aiErr2(err))}
  }
  else if(b.dataset.act){
    const a=b.dataset.act;
    if(a==='up'&&CUR>0){[P.slides[CUR-1],P.slides[CUR]]=[P.slides[CUR],P.slides[CUR-1]];CUR--}
    else if(a==='down'&&CUR<P.slides.length-1){[P.slides[CUR+1],P.slides[CUR]]=[P.slides[CUR],P.slides[CUR+1]];CUR++}
    else if(a==='dup'){P.slides.splice(CUR+1,0,JSON.parse(JSON.stringify(s)));CUR++}
    else if(a==='del'){if(P.slides.length<2){toast('Kamida bitta rasm qolishi kerak');return}if(b.dataset.sure){P.slides.splice(CUR,1);CUR=Math.min(CUR,P.slides.length-1)}else{b.dataset.sure='1';b.textContent='Ishonchingiz komilmi?';setTimeout(()=>{if(b.isConnected){delete b.dataset.sure;b.textContent='O‘chirish'}},3000);return}}
    selectSlide(CUR);
  }
  else if(b.id==='copyPrompt'){const t=$('#promptBox');try{await navigator.clipboard.writeText(t.value);toast('Nusxalandi')}catch{t.select();toast('Belgilandi — nusxa oling')}}
});
let pingT;
br.addEventListener('input',e=>{const el=e.target,k=el.dataset.b;
  if(el.id==='passIn'){setPass(el.value);clearTimeout(pingT);pingT=setTimeout(()=>ping(true),700);return}
  if(!k)return;P.brand[k]=el.type==='checkbox'?el.checked:el.value;refreshPrompt();schedule()});
br.addEventListener('change',async e=>{const el=e.target;if(!el.dataset.bimg||!el.files[0])return;try{P.brand[el.dataset.bimg]=await addImage(el.files[0]);renderBrand();schedule()}catch{toast('Rasmni o‘qib bo‘lmadi')}});
br.addEventListener('click',async e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.clear==='logoImg'||b.dataset.clear==='refImg'){P.brand[b.dataset.clear]=null;renderBrand();schedule()}
  else if(b.id==='clearImgs'){P.brand.refImg=null;renderBrand();P.slides.forEach(s=>{s.bg=null;s.tiles.forEach(t=>t.img=null);s.rows.forEach(r=>r.img=null)});renderEditor();schedule();toast('Rasmlar tozalandi, matnlar qoldi')}
  else if(b.id==='saveJson'){const blob=new Blob([JSON.stringify({v:1,P,IMGDATA:usedImages()})],{type:'application/json'});await saveFile(slug()+'-shablon.json',blob,false)}
  else if(b.id==='openJson'){$('#loadJson').click()}
  else if(b.id==='resetAll'){if(!b.dataset.sure){b.dataset.sure='1';b.textContent='Rostdan tiklansinmi?';return}P=sample();CUR=0;renderBrand();selectSlide(0);toast('Namuna tiklandi')}
});
$('#loadJson').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;try{const ok=await restore(JSON.parse(await f.text()));if(!ok)throw 0;renderBrand();selectSlide(0);toast('Shablon ochildi')}catch{toast('Bu fayl shablon emas')}e.target.value=''});
$('#strip').addEventListener('click',e=>{const t=e.target.closest('[data-go]');if(t){selectSlide(+t.dataset.go);return}if(e.target.id==='addSlide'){const l=$('#newLayout').value;const base=cur();const s=ensure({layout:l,tagline:base.tagline||'',s1:'',s2:'',headline:'',bg:null,lighten:true});for(const k of Object.keys(LIM[l]))s[k]=[NEWITEM[k](),NEWITEM[k](),NEWITEM[k]()];P.slides.push(s);selectSlide(P.slides.length-1)}});

/* ---------- Export ---------- */
let DL=null;
(async()=>{try{DL=window.claude&&window.claude.use?await window.claude.use('downloads'):null}catch{DL=null}})();
const slug=()=>[P.brand.logoText,P.brand.model,P.brand.num].join('-').toLowerCase().replace(/[^a-z0-9Ѐ-ӿ]+/g,'-').replace(/^-|-$/g,'')||'kartochka';
function toast(m){const t=$('#toast');t.textContent=m;t.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>t.hidden=true,2600)}
function slideCanvas(i){const c=document.createElement('canvas');c.width=W;c.height=H;render(c.getContext('2d'),P.slides[i],false);return c}
const toBlob=c=>new Promise(r=>c.toBlob(r,'image/png'));
function showImages(urls){$('#modalBody').innerHTML=`<p class="hint">Bu oynada to'g'ridan-to'g'ri yuklab olish ishlamadi. Rasmni bosib turing (telefonda) yoki o'ng tugma → "Rasmni saqlash" (kompyuterda).</p><div class="mgrid">${urls.map(u=>`<img src="${u}" alt="Tayyor rasm">`).join('')}</div>`;$('#modal').hidden=false}
async function saveFile(name,blob,imgFallback){
  if(!window.claude){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),20000);toast('Yuklab olindi');return true}
  if(DL){try{await DL.save({filename:name,data:blob});toast('Saqlandi');return true}catch(e){if(e&&e.code==='declined'){toast('Bekor qilindi');return false}if(e&&e.code==='rate_limited'){toast('Bir lahza kuting va qayta bosing');return false}}}
  if(imgFallback){showImages([URL.createObjectURL(blob)])}else toast('Bu oynada faylni saqlab bo‘lmadi');return false;
}
$('#dlOne').addEventListener('click',async()=>{const b=await toBlob(slideCanvas(CUR));await saveFile(`${slug()}-${CUR+1}.png`,b,true)});
$('#dlAll').addEventListener('click',async()=>{
  const btn=$('#dlAll');btn.disabled=true;btn.textContent='Tayyorlanmoqda…';
  try{
    const blobs=[];for(let i=0;i<P.slides.length;i++)blobs.push(await toBlob(slideCanvas(i)));
    if(window.JSZip&&(DL||!window.claude)){const z=new JSZip();blobs.forEach((b,i)=>z.file(`${slug()}-${i+1}.png`,b));const zb=await z.generateAsync({type:'blob'});await saveFile(`${slug()}.zip`,zb,false)}
    else showImages(blobs.map(b=>URL.createObjectURL(b)));
  }finally{btn.disabled=false;btn.textContent='Hammasini ZIP qilib olish'}
});
$('#mClose').addEventListener('click',()=>$('#modal').hidden=true);
$('#modal').addEventListener('click',e=>{if(e.target.id==='modal')$('#modal').hidden=true});

