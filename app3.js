/* ---------- AI generation ---------- */
let samplePromise=(async()=>{try{return window.claude&&window.claude.use?await window.claude.use('sample'):null}catch{return null}})();
samplePromise.then(x=>{HAS_SAMPLE=!!x;if(FAL_OK)renderBrand()});
let aiCtl=null;
function aiStatus(t){$('#aiStatus').textContent=t}
function buildPrompt(input,notes,n){
  return `You create the image set and listing text for a product card on Uzum Market (Uzbekistan's marketplace).

Product as written by the seller:
"""${input}"""
Seller notes: """${notes||'none'}"""

STEP 1 — Understand the product: what it is, its class, who buys it and why (for laptops: business/office, student, home/everyday, creator, gaming, premium ultrabook…). Everything in the set must fit that buyer. A business or everyday laptop gets work, reliability, security, battery, ports, light weight, comfort, study and office scenarios — never gaming, RTX, FPS or esports claims unless the product truly is a gaming device. Usage scenarios and chips must match the device's real class (an Intel Core 5 U-series laptop is for office apps, browsing, video calls and study, not 3D rendering or AAA games).

STEP 2 — Facts: use the specs the seller gave. You may add specs of this exact model only when you are confident they are the manufacturer's official specs (ports, weight, battery capacity, display type, keyboard features, security features, durability standards). Never invent numbers or features; when unsure, describe the benefit without a number.

LANGUAGE: all on-image text in Uzbek Latin script, written naturally like a good Uzbek marketplace seller, using a plain apostrophe for o' and g'. Keep it short: card and tile titles at most 22 characters, subtitles at most 45 characters (use \\n for a second line), taglines at most 26 characters, slogan lines at most 16 characters each.

Reply with ONLY one JSON object of this shape:
{
 "brand": {
  "logoText": brand name in the case the brand writes it (e.g. "ASUS", "acer", "Lenovo"),
  "model": product series in UPPERCASE, short (e.g. "EXPERTBOOK"),
  "num": short model code shown big next to it (e.g. "B1"), may be "",
  "cA": main colour hex that suits the brand and the product colour and reads well on white,
  "cB": second accent hex for the model code,
  "dark": dark text colour hex,
  "badgeOn": true/false,
  "badgeIcon": "win" when the badge is a Windows edition, otherwise one icon key or "none",
  "badgeT": badge text (e.g. "Windows 11 Pro"), "badgeS": short Uzbek line under it,
  "productEn": English description of the product for image prompts, including its colour (e.g. "a gentle grey ASUS ExpertBook B1 15.6-inch business laptop")
 },
 "slides": [exactly ${n} slide objects],
 "listing": {
  "titleUz","titleRu": Uzum product title — product type + brand + model + key specs + colour, max 110 characters,
  "shortUz","shortRu": 1–2 sentence summary,
  "descUz","descRu": full description, 6–9 short lines, each starting with "• " and stating one benefit with its spec,
  "specs": [{"uz": "Protsessor", "ru": "Процессор", "v": "Intel Core 5 120U"}] — 8 to 14 rows
 }
}

Slide shapes (the first slide must be "spec"; use the other layouts where they fit; stay within the counts):
- spec: {"layout":"spec","tagline","s1","s2","headline","scene","cards":[{"i","t","s"}] 3–5,"bottom":[{"i","t","s"}] exactly 4}
- features: {"layout":"features","tagline","s1","s2","scene","cards" 4–6,"tiles":[{"t","s","pic"}] 3}
- rows: {"layout":"rows","tagline","s1","s2","scene","rows":[{"t","s","chips","pic","bi","bt","bs"}] 3–5,"bottom" 0 or 4} — chips: comma-separated short tags (apps, ports, use cases); bt/bs: a short highlight badge, may be ""
- gallery: {"layout":"gallery","tagline","s1","s2","scene","cards" 3–4,"tiles" 3}
- grid: {"layout":"grid","tagline","s1","s2","scene","tiles" 2–4}
Each slide has one clear topic. For a laptop, good topics are: main specs; display and eye comfort; who it is for and everyday scenarios; design, build quality and portability; ports and connectivity; battery, security and reliability. Adapt the topics for other product types.
s1/s2: a short handwritten slogan in two lines; use it on about half the slides, otherwise "". headline: only on spec slides, one short benefit sentence.
scene: English, one sentence for the background photo of that slide — where and how the product is shown, matching the slide topic and the buyer (e.g. "open on a light wooden desk in a bright modern office, soft daylight").
pic: English, one sentence for that tile or row photo (e.g. "close-up of the laptop's left side showing USB-C and HDMI ports").
Icon keys for "i" and "bi" (use only these): ${Object.keys(ICONS).filter(k=>k!=='image').join(', ')}`;
}
function applyAI(d){
  if(!d||typeof d!=='object'||!Array.isArray(d.slides))throw{code:'invalid_json'};
  const hex=(v,f)=>/^#[0-9a-f]{6}$/i.test(String(v||''))?v:f;
  const str=(v,max)=>String(v??'').slice(0,max);
  const ic=v=>ICONS[v]&&v!=='image'?v:'check';
  const b=d.brand||{},old=P.brand;
  const sameBrand=String(b.logoText||'').toLowerCase()===String(old.logoText||'').toLowerCase();
  P.brand={...old,logoText:str(b.logoText,30)||old.logoText,logoImg:sameBrand?old.logoImg:null,model:str(b.model,24),num:str(b.num,12),
    cA:hex(b.cA,old.cA),cB:hex(b.cB,old.cB),dark:hex(b.dark,'#121418'),badgeOn:!!b.badgeOn,
    badgeIcon:(b.badgeIcon==='win'||b.badgeIcon==='none'||ICONS[b.badgeIcon])?b.badgeIcon:'none',
    badgeT:str(b.badgeT,24),badgeS:str(b.badgeS,40),productEn:str(b.productEn,200)||old.productEn};
  const it3=(c)=>({i:ic(c&&c.i),t:str(c&&c.t,40),s:str(c&&c.s,100)});
  const slides=d.slides.filter(s=>s&&typeof s==='object').map(s=>{
    const L=LAYOUTS[s.layout]?s.layout:'spec',lim=LIM[L];
    const o=ensure({layout:L,tagline:str(s.tagline,60),s1:str(s.s1,30),s2:str(s.s2,30),headline:L==='spec'?str(s.headline,100):'',scene:str(s.scene,300),bg:null,lighten:true});
    if(lim.cards)o.cards=(s.cards||[]).slice(0,lim.cards).map(it3);
    if(lim.bottom)o.bottom=(s.bottom||[]).slice(0,lim.bottom).map(it3);
    if(lim.tiles)o.tiles=(s.tiles||[]).slice(0,lim.tiles).map(c=>({img:null,t:str(c&&c.t,40),s:str(c&&c.s,100),pic:str(c&&c.pic,300)}));
    if(lim.rows)o.rows=(s.rows||[]).slice(0,lim.rows).map(r=>({t:str(r&&r.t,40),s:str(r&&r.s,100),chips:str(r&&r.chips,160),img:null,pic:str(r&&r.pic,300),bi:ic(r&&r.bi),bt:str(r&&r.bt,30),bs:str(r&&r.bs,40)}));
    return o;
  });
  if(!slides.length)throw{code:'invalid_json'};
  P.slides=slides;
  const l=d.listing&&typeof d.listing==='object'?d.listing:null;
  if(l){const sp=Array.isArray(l.specs)?l.specs.filter(x=>x&&x.v):[];
    P.listing={titleUz:str(l.titleUz,200),titleRu:str(l.titleRu,200),shortUz:str(l.shortUz,600),shortRu:str(l.shortRu,600),descUz:str(l.descUz,4000),descRu:str(l.descRu,4000),
      specsUz:sp.map(x=>`${x.uz||x.ru||''}: ${x.v}`).join('\n'),specsRu:sp.map(x=>`${x.ru||x.uz||''}: ${x.v}`).join('\n')};
  }else P.listing=null;
  renderBrand();renderListing();selectSlide(0);
}
function renderListing(){
  const L=P.listing,box=$('#listing');if(!L){box.hidden=true;return}box.hidden=false;
  const F=[['Nomi','title',2],['Qisqa tavsif','short',3],["To'liq tavsif",'desc',9],['Xususiyatlar','specs',8]];
  const col=(lang,head)=>`<div class="lcol"><h3>${head}</h3>${F.map(([lab,k,rows])=>{const id=k+lang;return`<div class="lf"><div class="lf-h"><span>${lab}</span><button class="btn sm" data-copy="lx-${id}">Nusxa</button></div><textarea id="lx-${id}" data-l="${id}" rows="${rows}">${esc(L[id]||'')}</textarea></div>`}).join('')}</div>`;
  $('#listingBody').innerHTML=`<div class="lgrid">${col('Uz',"O'zbekcha")}${col('Ru','Русский')}</div>`;
}
function aiErr(e){
  const c=e&&e.code;
  return{cancelled:"To'xtatildi.",not_granted:"AI'ga ruxsat berilmadi. Sahifani qayta ochib, so'ralganda ruxsat bering.",sampling_disabled:"Bu akkauntda AI o'chirilgan.",
    rate_limited:"Limitga yetildi. Birozdan keyin qayta bosing.",invalid_json:"Javob to'liq kelmadi. Qayta bosib ko'ring.",refused:"Bu so'rovni bajarib bo'lmadi. Matnni o'zgartirib ko'ring.",
    session_expired:"Qaytadan tizimga kiring.",empty_completion:"Javob bo'sh keldi. Qayta bosib ko'ring."}[c]||"Xatolik yuz berdi. Qayta bosib ko'ring.";
}
$('#aiGo').addEventListener('click',async()=>{
  const input=$('#aiInput').value.trim();if(!input){toast('Mahsulot nomini yozing');$('#aiInput').focus();return}
  const go=$('#aiGo'),stop=$('#aiStop');go.disabled=true;go.textContent='Yaratilmoqda…';stop.hidden=false;
  aiStatus("Tayyorlanmoqda… (odatda 30–90 soniya)");
  try{
    aiCtl=new AbortController();
    aiStatus("O'ylanmoqda… mahsulot turi va xaridorini aniqlayapti (30–90 soniya)");
    const d=await llmJSON(buildPrompt(input,$('#aiNotes').value.trim(),+$('#aiCount').value),[],aiCtl.signal,({text})=>aiStatus(`Yozilmoqda… ${text.length} belgi`));
    snapshot();applyAI(d);P.source=input;saveLocal();$('#aiReport').hidden=true;
    aiStatus("Tayyor. Har bir rasm uchun ChatGPT promptlari o'ng tomonda — fon rasmlarini yuklang. Uzum matni pastdagi bo'limda.");
  }catch(e){aiStatus(aiErr2(e))}
  finally{go.disabled=false;go.textContent='Kartochkani yaratish';stop.hidden=true;aiCtl=null}
});
$('#aiStop').addEventListener('click',()=>aiCtl&&aiCtl.abort());
$('#aiPanel').addEventListener('input',e=>{const k=e.target.dataset.l;if(k&&P.listing){P.listing[k]=e.target.value;saveLocal()}});
let REGEN=[];
$('#aiPanel').addEventListener('click',async e=>{
  const rg=e.target.closest('[data-regen]');
  if(rg){const x=REGEN[+rg.dataset.regen];if(!x)return;rg.disabled=true;rg.textContent='Yaratilmoqda…';
    try{await genSlot(x.slot,x.prompt);rg.textContent='Tayyor';renderEditor();renderStrip();saveLocal()}catch(err){rg.disabled=false;rg.textContent='Qayta urinish';aiStatus(aiErr2(err))}return}
  const b=e.target.closest('[data-copy]');if(!b)return;const t=document.getElementById(b.dataset.copy);try{await navigator.clipboard.writeText(t.value);toast('Nusxalandi')}catch{t.select();toast('Belgilandi — nusxa oling')}});

