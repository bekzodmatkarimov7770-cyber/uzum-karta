/* ---------- v5: AI designs every card by the seller's rules; the real product photo is cut out and placed on top, so the logo is never redrawn ---------- */
LAYOUTS.free='AI to‘liq dizayni (shablonsiz)';
LIM.free={};

const RULES_KEY='uzum-studio-rules-v2';
const DEFAULT_RULES=`MAQSAD: xaridor qidiruvda kartochkani bossin va 1–2 rasmdan keyin "Savatga" tugmasini bossin.

1-RASM (MUQOVA) — eng muhimi, qidiruvda kichkina ko'rinadi:
- Noutbuk katta, kadrning 60–70% ini egallaydi, ekran ochiq va yoniq.
- Model nomi + 3 ta eng kuchli xususiyat yirik raqam bilan: "16 GB DDR5", "512 GB SSD", "15.6" Full HD IPS".
- Ko'pi bilan 4 ta qisqa yozuv. Mayda matn, uzun gap, ko'p ikonka yo'q.
- Fon toza va yorqin, noutbuk fondan aniq ajralib tursin.

KEYINGI RASMLAR — har biri xaridorning bitta savoliga javob beradi:
- 2: Kimga va nima uchun? (ish, o'qish, ofis dasturlari — aniq vaziyatlar)
- 3: Tezligi: protsessor + RAM + SSD, foyda tilida ("Excel va 20 ta oyna qotmaydi").
- 4: Ekran: o'lcham, Full HD, IPS, yorqinlik (nit) bo'lsa.
- 5: Portlar: har bir port nomi va soni (USB-C, USB-A, HDMI, RJ45...).
- 6: Batareya (Wh) va vazn (kg), mustahkamlik standarti bo'lsa.
- Oxirgi rasm: barcha asosiy xususiyatlar qisqa ro'yxatda.

MATN:
- O'zbek tilida, lotin yozuvida, xatosiz. Sarlavha 2–4 so'z.
- Har bir xususiyat + foyda: "42 Wh — butun dars kuniga yetadi". Raqamlar faqat rasmiy ma'lumotdan.
- Bir rasmda bitta asosiy fikr, ko'pi bilan 4 ta blok. Bir gap ikki rasmda takrorlanmasin.
- Telefon ekranida 1 soniyada o'qilsin: yozuv katta, fon bilan kuchli kontrast.

ISHONCH:
- Mahsulot va logotip faqat haqiqiy suratdan. Logotipni chizma, o'ylab topma, boshqa brend belgisini qo'yma.
- Narx, chegirma, "eng yaxshi", "№1", soxta nishon va sertifikat yo'q.

DIZAYN:
- Ranglar brendga mos (ASUS — ko'k-oq, Lenovo — qizil-qora, HP — ko'k-oq, Acer — yashil-qora, Apple — oq-kulrang).
- Hamma rasmlar bitta uslubda, bitta to'plamdek ko'rinsin.

UZUM NOMI:
Noutbuk + brend + seriya/model + protsessor + RAM + SSD + ekran + rang.
Masalan: "Noutbuk ASUS ExpertBook B1 B1503CVA Intel Core 5 120U DDR5 16GB SSD 512GB 15.6" FHD IPS, kulrang"`;
function getRules(){try{return localStorage.getItem(RULES_KEY)||DEFAULT_RULES}catch{return DEFAULT_RULES}}
function setRules(v){try{localStorage.setItem(RULES_KEY,v)}catch{}}

(function(){
  const st=document.createElement('style');
  st.textContent='#aiGo,#aiAuto,#aiGenImgs,#aiAllPrompts,#aiPlaceLbl,#aiReview{display:none!important}#aiRules{font-size:13px;line-height:1.45}';
  document.head.appendChild(st);
  $('#aiPanel h2').textContent='AI bilan yaratish — model nomini yozing, kartochkani AI sizning mezonlaringiz bo‘yicha o‘zi yaratadi';
  $('#aiPanel .ai-grid').insertAdjacentHTML('afterend',`<details id="rulesBox"><summary>Mening mezonlarim (AI faqat shularga amal qiladi)</summary>
    <label style="margin-top:8px">O'zgarishlar shu brauzerda saqlanadi.<textarea id="aiRules" rows="16"></textarea></label>
    <div class="btns"><button class="btn sm ghost" id="rulesReset">Boshlang‘ich mezonlarni tiklash</button></div></details>`);
  $('#aiRules').value=getRules();
  $('#aiRules').addEventListener('input',e=>setRules(e.target.value));
  $('#rulesReset').addEventListener('click',()=>{$('#aiRules').value=DEFAULT_RULES;setRules(DEFAULT_RULES);toast('Tiklandi')});
  $('#aiGo').insertAdjacentHTML('beforebegin','<button class="btn primary" id="aiFree">Kartochkani yaratish</button>');
  $('#aiStop').addEventListener('click',()=>{if(freeCtl)freeCtl.abort()});
})();
let freeCtl=null;

/* ---- cut the product out of the real photo (pixels are never redrawn, so the logo stays real) ---- */
let CUT={id:null,img:null,ok:false};
function cutout(){
  const id=P.brand.refImg,src=id&&IMG[id];
  if(!src)return null;
  if(CUT.id===id)return CUT;
  const sc=Math.min(1,1400/Math.max(src.width,src.height)),w=Math.round(src.width*sc),h=Math.round(src.height*sc);
  const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(src,0,0,w,h);
  const d=x.getImageData(0,0,w,h),a=d.data,N=w*h;
  const border=[];for(let i=0;i<w;i++){border.push(i,(h-1)*w+i)}for(let j=0;j<h;j++){border.push(j*w,j*w+w-1)}
  const transparent=border.filter(p=>a[p*4+3]<20).length>border.length*.5;
  const mask=new Uint8Array(N);
  if(!transparent){
    let r=0,g=0,b=0;for(const p of border){r+=a[p*4];g+=a[p*4+1];b+=a[p*4+2]}r/=border.length;g/=border.length;b/=border.length;
    const near=p=>{const dr=a[p*4]-r,dg=a[p*4+1]-g,db=a[p*4+2]-b;return dr*dr+dg*dg+db*db<44*44};
    const uniform=border.filter(near).length/border.length;
    const q=[];for(const p of border)if(!mask[p]&&near(p)){mask[p]=1;q.push(p)}
    while(q.length){const p=q.pop(),px=p%w,py=(p-px)/w;
      for(const n of[px>0?p-1:-1,px<w-1?p+1:-1,py>0?p-w:-1,py<h-1?p+w:-1])if(n>=0&&!mask[n]&&near(n)){mask[n]=1;q.push(n)}}
    let removed=0;for(let p=0;p<N;p++)if(mask[p]){a[p*4+3]=0;removed++}
    for(let p=0;p<N;p++)if(!mask[p]){const px=p%w;let k=0;
      if(px>0&&mask[p-1])k++;if(px<w-1&&mask[p+1])k++;if(p>=w&&mask[p-w])k++;if(p<N-w&&mask[p+w])k++;
      if(k)a[p*4+3]=Math.min(a[p*4+3],255-k*50)}
    x.putImageData(d,0,0);
    CUT.ok=uniform>.85&&removed>N*.08;
  }else CUT.ok=true;
  let x0=w,y0=h,x1=0,y1=0;for(let j=0;j<h;j++)for(let i=0;i<w;i++)if(a[(j*w+i)*4+3]>30){if(i<x0)x0=i;if(i>x1)x1=i;if(j<y0)y0=j;if(j>y1)y1=j}
  if(x1<=x0||y1<=y0){CUT={id,img:null,ok:false};return CUT}
  const t=document.createElement('canvas');t.width=x1-x0+1;t.height=y1-y0+1;t.getContext('2d').drawImage(c,x0,y0,t.width,t.height,0,0,t.width,t.height);
  CUT={id,img:t,ok:CUT.ok};return CUT;
}
function productRect(s,img){
  const b=s.pbox;if(!b||!img)return null;
  const sc=Math.max(.4,Math.min(1.6,parseFloat(s.pS)||1));
  const bw=b.w*W*sc,bh=b.h*H*sc,k=Math.min(bw/img.width,bh/img.height),dw=img.width*k,dh=img.height*k;
  const cx=(b.x+b.w/2)*W+(parseFloat(s.pX)||0)*W,bottom=(b.y+b.h)*H+(parseFloat(s.pY)||0)*H;
  return{x:cx-dw/2,y:bottom-dh,w:dw,h:dh};
}

/* free cards: AI background + the real product on top */
const _renderV2=render;
render=function(ctx,s,preview){
  if(s.layout!=='free')return _renderV2(ctx,s,preview);
  ctx.clearRect(0,0,W,H);
  if(s.bg&&IMG[s.bg])coverFramed(ctx,IMG[s.bg],0,0,W,H,s.bgZ,s.bgX,s.bgY);
  else{ctx.fillStyle='#eef2ee';ctx.fillRect(0,0,W,H);if(preview){ctx.textAlign='center';ctx.fillStyle='rgba(30,55,35,.4)';ctx.font='700 34px Montserrat';ctx.fillText('AI rasmni chizmoqda…',W/2,H/2);ctx.textAlign='left'}}
  const C=cutout(),r=C&&productRect(s,C.img);
  if(r){
    ctx.save();const g=ctx.createRadialGradient(r.x+r.w/2,r.y+r.h,0,r.x+r.w/2,r.y+r.h,r.w*.55);g.addColorStop(0,'rgba(0,0,0,.28)');g.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(r.x+r.w/2,r.y+r.h,r.w*.55,r.h*.07,0,0,Math.PI*2);ctx.fill();ctx.restore();
    ctx.drawImage(C.img,r.x,r.y,r.w,r.h);
  }
};
const _renderEditorV2=renderEditor;
renderEditor=function(){
  const s=cur();
  if(s.layout!=='free')return _renderEditorV2();
  const v=(k,d)=>esc(s[k]??d);
  let h=`<div class="ed-top"><strong>${CUR+1}-rasm</strong><div class="btns"><button class="btn sm" data-act="up" aria-label="Chapga surish">←</button><button class="btn sm" data-act="down" aria-label="O'ngga surish">→</button><button class="btn sm" data-act="del">O‘chirish</button></div></div>`;
  if(s.goal)h+=`<p class="hint"><b>Maqsad:</b> ${esc(s.goal)}</p>`;
  if(s.pbox)h+=`<div class="sub">Mahsulot (haqiqiy surat)</div><div class="row3"><label>Kattaligi<input type="range" data-k="pS" min="0.5" max="1.5" step="0.02" value="${v('pS',1)}"></label><label>Chap ↔ o‘ng<input type="range" data-k="pX" min="-0.4" max="0.4" step="0.01" value="${v('pX',0)}"></label><label>Yuqori ↕ past<input type="range" data-k="pY" min="-0.4" max="0.4" step="0.01" value="${v('pY',0)}"></label></div>`;
  h+=IMGF('Fon (AI)','bg',s.bg,'data-img');
  if(Array.isArray(s.texts)&&s.texts.length)h+=`<p class="hint"><b>Rasmdagi matn:</b> ${s.texts.map(t=>'«'+esc(t)+'»').join(', ')}</p>`;
  h+=`<label>Nimani o‘zgartirish kerak? (ixtiyoriy)<textarea id="freeFix" rows="3" placeholder="Masalan: fon ochroq bo‘lsin, '42 Wh' yozuvi kattaroq"></textarea></label>
  <button class="btn primary" id="freeRedo">AI bilan qayta chizish</button>`;
  $('#editorPanel').innerHTML=h;
  $('#editorPanel').querySelectorAll('[data-gen]').forEach(b=>b.remove());
};
$('#editorPanel').addEventListener('click',async e=>{
  if(!e.target.closest('#freeRedo'))return;
  const s=cur(),note=($('#freeFix')||{}).value||'';
  freeCtl=new AbortController();busy(true);$('#aiFree').disabled=true;
  try{
    aiStatus(`${CUR+1}-rasm qayta chizilmoqda… (20–60 soniya)`);
    await drawCard(s,note.trim()?`Seller's request (translate from Uzbek and follow it): ${note.trim()}`:'',freeCtl.signal);
    const r=await checkCard(s,freeCtl.signal);
    renderEditor();renderStrip();schedule();
    aiStatus(r&&r.problems&&r.problems.length?`Qayta chizildi. AI izohi: ${r.problems.join('; ')}`:'Qayta chizildi.');
  }catch(err){aiStatus(aiErr2(err))}
  finally{busy(false);$('#aiFree').disabled=false;freeCtl=null;saveLocal()}
});

function planPrompt(input,facts,notes,n,rules){
  return `You are a senior designer and copywriter of product cards for Uzum Market (Uzbekistan's largest marketplace). Your only goal is sales: the buyer must click the card in search and then add it to the cart. Plan a set of ${n} images for this product.
Product (seller's words): "${input}"
${facts?`OFFICIAL DATA found on the web (use these exact values; the seller's configuration wins if it differs):\n${facts}\n`:'No official data was found: use only what the seller wrote, never invent numbers.\n'}${notes?`Seller's note: ${notes}\n`:''}
THE SELLER'S RULES. Follow every one of them exactly; they override anything else:
${rules}

You decide the whole design yourself: composition, colours, typography, icons, text placement. There is no template.
How the image is made: an image model paints the card (background, scene, texts, icons) WITHOUT the product. Then the real product photo (cut out, with its real logo) is placed into the rectangle you give in "product". So never ask the image model to draw the product, and keep that rectangle free of text.
Reply with ONLY one JSON object:
{"style":"English, 1-2 sentences: the shared visual style of the whole set (palette with hex colours, background, typography, decoration) chosen for this brand",
 "cards":[{"goal":"Uzbek Latin, which buyer question this image answers",
   "texts":["every text that must appear on the image, exactly as printed, Uzbek Latin; a model name may stay in English"],
   "product":{"x":0.1,"y":0.3,"w":0.8,"h":0.45},
   "design":"English, detailed art direction for the background and texts only: scene/surface, where each text goes, size hierarchy, icons, colours. Describe the product area as an empty, clean surface where a laptop will stand."}],
 "listing":{"titleUz":"","titleRu":"","shortUz":"","shortRu":"","descUz":"","descRu":"","specs":[{"uz":"","ru":"","v":""}]}}
cards: exactly ${n}. "product" is the rectangle (fractions of a 3:4 portrait canvas, x,y = top-left) where the real laptop stands; the laptop is bottom-aligned in it. Use null only for a card that should show no product. Keep texts outside that rectangle. On the first card the product rectangle is at least 0.75 wide.
texts: at most 6 items per card, each at most 36 characters. Every number must come from the official data or the seller's words.
listing: titleUz/titleRu follow the seller's naming rule; descriptions 600-1200 characters, natural, no keyword stuffing; specs from the official data.`;
}
function cardPrompt(s){
  const b=s.pbox;
  /* canvas 1080x1440 is a centre crop of the 1024x1536 image: 1440 px of 1620 px height */
  const iy=v=>Math.round((v*1440+90)/1620*100);
  const area=b?`Leave the rectangle from ${Math.round(b.x*100)}% to ${Math.round((b.x+b.w)*100)}% of the width and from ${iy(b.y)}% to ${iy(b.y+b.h)}% of the height completely EMPTY: only the plain continuous surface or background there, with no text, icons, objects or shadows. A real product photo will be placed there later, standing on the surface at the bottom of that rectangle.`:'This card has no product.';
  return `Create the background and text layer of one vertical product card for Uzum Market (marketplace in Uzbekistan).
DO NOT draw any laptop, computer, phone, screen device or product anywhere. DO NOT draw any brand logo or brand symbol.
${area}
Overall style of the set: ${P.freeStyle||'clean, modern, premium marketplace card'}
This card: ${s.design}
Print exactly these texts and no other words, spelled letter by letter exactly as given (Uzbek Latin, keep apostrophes), as clean typography, not as logos:
${(s.texts||[]).map(t=>`- "${t}"`).join('\n')||'- (no text)'}
Text must be large, crisp, high-contrast and readable on a phone. Keep the top 7% and bottom 7% of the image as plain background with no text (they will be cropped). No price, no discount badges, no watermarks, no people.`;
}
async function drawCard(s,extra,sig){
  const prompt=cardPrompt(s)+(extra?`\n\nFIX THESE PROBLEMS OF THE PREVIOUS VERSION:\n${extra}`:'');
  let r,tries=0;
  for(;;){try{r=await api({action:'image',model:P.brand.heroModel,prompt,size:'1024x1536',quality:'medium',refs:[]},sig);break}
    catch(e){if(e.status===429&&tries<3){tries++;await new Promise(z=>setTimeout(z,20000*tries));continue}throw e}}
  s.bg=await addDataUrl(r.dataUrl);s.bgZ=1;s.bgX=0;s.bgY=0;schedule();
}
async function checkCard(s,sig){
  const i=P.slides.indexOf(s);if(i<0||!s.bg||!IMG[s.bg])return null;
  const d=await llmJSON(`You check one finished product card for Uzum Market before it is published. Judge it like a demanding buyer scrolling on a phone and like a marketplace sales expert.
Product: ${productDesc()}
${P.facts?`Official data:\n${P.facts}\n`:''}The card should show these texts exactly: ${JSON.stringify(s.texts||[])}
Its purpose: ${s.goal||''}
The seller's rules:
${getRules()}
The laptop in the image is the real product photo placed on top of an AI background, so do not judge the laptop itself. Judge only the background, the texts and how they work together with the product.
Check: 1) every text is present and spelled exactly, no garbled letters, no extra words; 2) no other device, fake logo or brand symbol is painted in the background; 3) texts do not overlap or hide behind the product; 4) numbers match the official data; 5) every seller rule is respected; 6) would it make a buyer click and buy — clear, readable, attractive.
Reply with ONLY JSON {"score":1-10,"ok":true or false,"problems":["Uzbek Latin, short"],"fix":"English instructions for the background/text image model to fix the problems, empty if ok"}`,[await smallBlob(slideCanvas(i),1000)],sig);
  return d&&typeof d==='object'?d:null;
}

$('#aiFree').addEventListener('click',async()=>{
  const btn=$('#aiFree'),input=$('#aiInput').value.trim();
  if(!input){toast('Mahsulot nomini yozing');$('#aiInput').focus();return}
  const n=+$('#aiCount').value||5;
  if(!btn.dataset.sure){btn.dataset.sure='1';btn.textContent=`${n} ta rasm, ~$${(n*0.1+0.1).toFixed(1)}–${(n*0.2+0.1).toFixed(1)} — tasdiqlang`;setTimeout(()=>{if(btn.dataset.sure){delete btn.dataset.sure;btn.textContent='Kartochkani yaratish'}},6000);return}
  delete btn.dataset.sure;btn.textContent='Kartochkani yaratish';
  busy(true);btn.disabled=true;freeCtl=new AbortController();const sig=freeCtl.signal;
  const sources=[],rules=$('#aiRules').value.trim()||DEFAULT_RULES;let R=null,redone=0;
  try{
    aiStatus('1/5 Internetdan rasmiy xususiyatlar va mahsulot surati qidirilmoqda…');
    try{const r=await api({action:'research',model:P.brand.llm,prompt:researchPrompt(input)},sig);R=parseLoose(r.text)}catch(e){if(e.code==='cancelled')throw e;R=null}
    if(R&&Array.isArray(R.sources))sources.push(...R.sources.map(String).filter(u=>/^https?:\/\//.test(u)).slice(0,5));
    if(P.brand.refImg&&P.brand.refAuto===P.brand.refImg&&P.source!==input)P.brand.refImg=null;
    if(!P.brand.refImg||!IMG[P.brand.refImg]){
      aiStatus('1/5 Mahsulotning rasmiy surati tekshirilmoqda…');
      const id=await findRefPhoto(input,R,sig);
      if(id){P.brand.refImg=id;P.brand.refAuto=id;renderBrand()}
    }
    if(!P.brand.refImg||!IMG[P.brand.refImg]){
      aiStatus('Mahsulotning rasmiy surati internetdan topilmadi. Chap paneldagi “Mahsulotning haqiqiy rasmi” ga oq fondagi surat yuklab, tugmani qayta bosing — qolganini studiya o‘zi qiladi.');
      return;
    }
    const C=cutout();
    if(!C||!C.ok){
      aiStatus('Mahsulot suratining foni bir xil emas, noutbukni toza kesib bo‘lmadi. Chap paneldagi “Mahsulotning haqiqiy rasmi” ga oq yoki shaffof fondagi (PNG) surat yuklab, tugmani qayta bosing.');
      return;
    }
    const facts=R?formatFacts(R):'';
    aiStatus('2/5 AI mezonlaringiz bo‘yicha kartochkalarni loyihalayapti…');
    const plan=await llmJSON(planPrompt(input,facts,$('#aiNotes').value.trim(),n,rules),[],sig);
    if(!plan||!Array.isArray(plan.cards)||!plan.cards.length)throw{code:'invalid_json'};
    snapshot();
    const str=(v,m)=>String(v??'').slice(0,m);
    const box=b=>{if(!b||typeof b!=='object')return null;const f=(v,lo,hi)=>Math.max(lo,Math.min(hi,+v||0));const x=f(b.x,0,.9),y=f(b.y,0,.9);const w=f(b.w,.1,1-x),h=f(b.h,.1,1-y);return{x,y,w,h}};
    P.freeStyle=str(plan.style,600);P.source=input;P.facts=facts;
    if(R&&R.productEn)P.brand.productEn=str(R.productEn,200);
    P.slides=plan.cards.slice(0,n).map(c=>ensure({layout:'free',goal:str(c&&c.goal,200),texts:(Array.isArray(c&&c.texts)?c.texts:[]).map(t=>str(t,60)).filter(Boolean).slice(0,8),pbox:box(c&&c.product),pS:1,pX:0,pY:0,design:str(c&&c.design,1500),bg:null,lighten:false,tagline:'',s1:'',s2:'',scene:''}));
    const l=plan.listing&&typeof plan.listing==='object'?plan.listing:null;
    if(l){const sp=Array.isArray(l.specs)?l.specs.filter(x=>x&&x.v):[];
      P.listing={titleUz:str(l.titleUz,200),titleRu:str(l.titleRu,200),shortUz:str(l.shortUz,600),shortRu:str(l.shortRu,600),descUz:str(l.descUz,4000),descRu:str(l.descRu,4000),
        specsUz:sp.map(x=>`${x.uz||x.ru||''}: ${x.v}`).join('\n'),specsRu:sp.map(x=>`${x.ru||x.uz||''}: ${x.v}`).join('\n')}}
    renderListing();selectSlide(0);saveLocal();

    const total=P.slides.length,queue=P.slides.map((s,i)=>i),checks=new Array(total).fill(null);let done=0,lastErr=null;
    aiStatus(`3/5 AI kartochkalarni chizmoqda… 0/${total} (har biri 20–60 soniya)`);
    const worker=async()=>{while(queue.length&&!sig.aborted){const i=queue.shift(),s=P.slides[i];
      try{
        await drawCard(s,'',sig);done++;renderStrip();schedule();
        aiStatus(`3/5 AI kartochkalarni chizmoqda… ${done}/${total}. 4/5 tayyorlarini tekshiryapti`);
        let c=await checkCard(s,sig).catch(e=>{if(e.code==='cancelled')throw e;return null});
        for(let k=0;k<2&&c&&(c.ok===false||+c.score<8)&&!sig.aborted;k++){
          aiStatus(`5/5 ${i+1}-rasm qayta chizilmoqda: ${(c.problems||[]).join('; ')||'sifat past'}`);
          await drawCard(s,c.fix||(c.problems||[]).join('; '),sig);redone++;renderStrip();schedule();
          c=await checkCard(s,sig).catch(e=>{if(e.code==='cancelled')throw e;return null});
        }
        checks[i]=c;
      }catch(e){if(e.code==='cancelled')return;lastErr=e}
    }};
    await Promise.all([worker(),worker()]);
    if(sig.aborted)throw{code:'cancelled'};
    if(!done&&lastErr)throw lastErr;
    renderEditor();renderStrip();schedule();

    const rep=[`<h3>Tayyor: ${done}/${total} ta kartochka · ${redone} marta qayta chizildi</h3><ul class="rep">`];
    checks.forEach((c,i)=>{if(!c)return;const bad=c.ok===false||+c.score<8;
      rep.push(`<li><span><span class="tag${bad?' warn':''}">${i+1}-rasm · ${esc(String(c.score??'?'))}/10</span>${bad?esc((c.problems||[]).join('; ')||'Ko‘rib chiqing'):'Mezonlarga mos'}</span></li>`)});
    if(R&&R.notes)rep.push(`<li><span><span class="tag warn">Rasmiy ma’lumot</span>${esc(R.notes)}</span></li>`);
    if(!facts)rep.push(`<li><span><span class="tag warn">Diqqat</span>Rasmiy xususiyatlar topilmadi, faqat siz yozgan ma’lumot ishlatildi.</span></li>`);
    if(sources.length)rep.push(`<li><span class="hint">Manbalar: ${sources.map(u=>`<a href="${esc(u)}" target="_blank" rel="noopener">${esc(u.replace(/^https?:\/\//,'').slice(0,50))}</a>`).join(', ')}</span></li>`);
    rep.push('</ul>');
    $('#aiReport').innerHTML=rep.join('');$('#aiReport').hidden=false;
    $('#listing').open=true;
    aiStatus('Tayyor! Noutbuk haqiqiy suratdan qo‘yildi. Kerak bo‘lsa o‘ng tomondagi surgichlar bilan kattaligi va joyini to‘g‘rilang yoki fonni izoh bilan qayta chizdiring. Keyin “Hammasini ZIP qilib olish”.');
  }catch(e){aiStatus(aiErr2(e))}
  finally{busy(false);btn.disabled=false;freeCtl=null;saveLocal()}
});
