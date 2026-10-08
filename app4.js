/* ---------- AI: undo, combined prompts, auto-placing photos, review ---------- */
let SNAP=null;
function snapshot(){SNAP=JSON.stringify(P);$('#aiUndo').hidden=false}
$('#aiUndo').addEventListener('click',()=>{if(!SNAP)return;P=JSON.parse(SNAP);P.slides.forEach(ensure);SNAP=null;$('#aiUndo').hidden=true;renderBrand();renderListing();selectSlide(Math.min(CUR,P.slides.length-1));toast('Bekor qilindi')});
function productDesc(){return P.source||(P.listing&&P.listing.titleRu)||[P.brand.logoText,P.brand.model,P.brand.num].join(' ')}
function slideItems(s){return s.layout==='rows'?{key:'rows',arr:s.rows}:LIM[s.layout].tiles?{key:'tiles',arr:s.tiles}:{key:null,arr:[]}}
function allSlots(){
  const out=[];P.slides.forEach((s,i)=>{
    out.push({key:`s${i}.bg`,filled:!!(s.bg&&IMG[s.bg]),desc:`slide ${i+1} BACKGROUND, vertical 3:4, product shown ${s.scene||'in a bright setting'}; slide topic: ${fx(s.tagline).replace(/\n/g,' ')}`});
    const{key,arr}=slideItems(s);if(key)arr.forEach((it,j)=>out.push({key:`s${i}.${key}.${j}`,filled:!!(it.img&&IMG[it.img]),desc:`slide ${i+1} small photo "${fx(it.t)}": ${it.pic||fx(it.s)}`}));
  });return out;
}
function setSlot(key,id){
  const m=/^s(\d+)\.(?:(bg)|(tiles|rows)\.(\d+))$/.exec(String(key));if(!m)return false;
  const s=P.slides[+m[1]];if(!s)return false;
  if(m[2]){s.bg=id;return true}const it=s[m[3]]&&s[m[3]][+m[4]];if(!it)return false;it.img=id;return true;
}
async function smallBlob(src,max=800){const c=document.createElement('canvas');const sc=Math.min(1,max/Math.max(src.width,src.height));c.width=Math.round(src.width*sc);c.height=Math.round(src.height*sc);c.getContext('2d').drawImage(src,0,0,c.width,c.height);return new Promise(r=>c.toBlob(r,'image/jpeg',.85))}
async function aiChunk(){
  const s=await samplePromise;
  if(s){const lim=await s.limits().catch(()=>null);if(lim&&lim.images)return Math.max(1,lim.images.maxCount||1);if(!FAL_OK)throw{code:'images_unavailable'}}
  if(FAL_OK)return 8;
  throw{code:'no_ai'};
}
const blobToDataURL=b=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(b)});
function parseLoose(t){t=String(t||'');try{return JSON.parse(t)}catch{}const f=/```(?:json)?\s*([\s\S]*?)```/.exec(t);if(f){try{return JSON.parse(f[1])}catch{}}const a=t.indexOf('{'),b=t.lastIndexOf('}');if(a>=0&&b>a){try{return JSON.parse(t.slice(a,b+1))}catch{}}throw{code:'invalid_json'}}
async function api(body,signal){
  let r;try{r=await fetch('/api/ai',{method:'POST',headers:{'content-type':'application/json','x-studio-pass':getPass()},body:JSON.stringify(body),signal})}
  catch(e){if(signal&&signal.aborted)throw{code:'cancelled'};throw{code:'api',message:"Serverga ulanib bo'lmadi"}}
  const j=await r.json().catch(()=>({}));
  if(!r.ok)throw{code:'api',status:r.status,message:j.error||`Server xatosi (${r.status})`};
  return j;
}
async function llmJSON(prompt,images,signal,onText){
  const s=await samplePromise;
  if(s){const o={signal,cache:false};if(onText)o.onText=onText;if(images&&images.length)o.images=images;return s.json(prompt,o)}
  if(!FAL_OK)throw{code:'no_ai'};
  const urls=await Promise.all((images||[]).map(blobToDataURL));
  const r=await api({action:'chat',model:P.brand.llm,prompt,images:urls},signal);
  return parseLoose(r.text);
}
function pickModel(list,prefs){for(const p of prefs){if(list.includes(p))return p}for(const p of prefs){const m=list.find(x=>x.startsWith(p));if(m)return m}return list[0]||''}
async function ping(force){
  try{
    const r=await fetch('/api/ai',{method:'POST',headers:{'content-type':'application/json','x-studio-pass':getPass()},body:JSON.stringify({action:'ping'})});
    if(!r.ok)throw 0;const j=await r.json();FAL_ENV=!!j.ok;FAL_OK=!!(j.ok&&j.hasKey&&j.passOk);
    if(FAL_OK){
      MODELS=await api({action:'models'});
      const B=P.brand;
      if(!MODELS.image.includes(B.heroModel))B.heroModel=pickModel(MODELS.image,['gpt-image-2','gpt-image-2.5-flare','gpt-image-1.5','gpt-image-1']);
      if(!MODELS.image.includes(B.smallModel))B.smallModel=pickModel(MODELS.image,['gpt-image-1-mini','gpt-image-2']);
      if(!MODELS.chat.includes(B.llm))B.llm=pickModel(MODELS.chat,['gpt-5.5-mini','gpt-5-mini','gpt-5.5','gpt-5','gpt-4.1-mini','gpt-4o-mini']);
      if(!MODELS.image.length){FAL_OK=false;aiStatus("OpenAI hisobingizda rasm modellari ochilmagan. platform.openai.com → Settings → Organization → Verify qiling.")}
    }else if(force&&j.ok){aiStatus(!j.hasKey?'Vercel’da OPENAI_API_KEY qo‘shilmagan.':!j.hasPass?'Vercel’da STUDIO_PASS qo‘shilmagan.':'Parol noto‘g‘ri.')}
  }catch(e){if(e&&e.code==='api'){aiStatus('OpenAI: '+e.message);FAL_OK=false}else{FAL_ENV=false;FAL_OK=false}}
  $('#aiGenImgs').hidden=!FAL_OK;
  if(force){renderBrand();renderEditor();if(FAL_OK){aiStatus('OpenAI ulandi. Rasmlarni avtomatik yaratish mumkin.');toast('OpenAI ulandi')}}
}

/* ---- image generation ---- */
let refCache={id:null,url:null};
async function refDataUrl(){const id=P.brand.refImg;if(!id||!IMG[id])return null;if(refCache.id===id)return refCache.url;const b=await smallBlob(IMG[id],1024);refCache={id,url:await blobToDataURL(b)};return refCache.url}
function slotInfo(key){const m=/^s(\d+)\.(?:(bg)|(tiles|rows)\.(\d+))$/.exec(String(key));if(!m)return null;const s=P.slides[+m[1]];if(!s)return null;return m[2]?{s,kind:'bg'}:{s,kind:m[3],it:s[m[3]][+m[4]]}}
async function genSlot(key,override,signal){
  const inf=slotInfo(key);if(!inf||(inf.kind!=='bg'&&!inf.it))throw{code:'api',message:'Joy topilmadi'};
  const{s,kind,it}=inf,blurBg=kind==='bg'&&(s.layout==='rows'||s.layout==='grid'),hero=kind==='bg'&&!blurBg;
  const model=hero?P.brand.heroModel:P.brand.smallModel;
  const size=kind==='bg'||(kind==='tiles'&&s.layout==='gallery')?'1024x1536':'1536x1024';
  const ref=blurBg?null:await refDataUrl();
  let prompt=override||(kind==='bg'?bgPrompt(s):itemPrompt(s,it));
  if(ref)prompt='Use the exact product from the reference photo: keep its shape, colour, logo, keyboard, ports and every detail unchanged; change only the scene, angle and lighting. '+prompt;
  let r,tries=0;
  for(;;){try{r=await api({action:'image',model,prompt,size,quality:'medium',refs:ref?[ref]:[]},signal);break}
    catch(e){if(e.status===429&&tries<3){tries++;await new Promise(z=>setTimeout(z,20000*tries));continue}throw e}}
  const id=await addDataUrl(r.dataUrl);setSlot(key,id);schedule();return id;
}
function emptySlots(){return allSlots().filter(x=>!x.filled).map(x=>x.key)}
function estimate(keys){let c=0;for(const k of keys){const i=slotInfo(k);const hero=i&&i.kind==='bg'&&i.s.layout!=='rows'&&i.s.layout!=='grid';c+=hero?(/mini/.test(P.brand.heroModel)?0.02:0.06):(/mini/.test(P.brand.smallModel)?0.02:0.06)}return c}
$('#aiGenImgs').addEventListener('click',async e=>{
  const b=e.currentTarget;let keys=emptySlots();
  if(!keys.length){toast('Hamma joyda rasm bor. Qayta yaratish uchun rasm yonidagi "AI bilan yaratish"ni bosing.');return}
  if(!b.dataset.sure){b.dataset.sure='1';b.textContent=`${keys.length} ta rasm, ~$${estimate(keys).toFixed(2)} — tasdiqlash`;setTimeout(()=>{if(b.isConnected){delete b.dataset.sure;b.textContent='Rasmlarni AI bilan yaratish'}},6000);return}
  delete b.dataset.sure;b.textContent='Rasmlarni AI bilan yaratish';
  if(!P.brand.refImg)toast('Maslahat: mahsulotning haqiqiy rasmini yuklasangiz, natija aniqroq bo‘ladi');
  busy(true);b.disabled=true;aiCtl=new AbortController();const sig=aiCtl.signal;
  let done=0,fail=0,lastErr='';const queue=[...keys];
  aiStatus(`Rasmlar yaratilmoqda… 0/${keys.length} (har biri 20–60 soniya)`);
  const worker=async()=>{while(queue.length&&!sig.aborted){const k=queue.shift();try{await genSlot(k,null,sig);done++}catch(err){if(err.code==='cancelled')return;fail++;lastErr=aiErr2(err)}aiStatus(`Rasmlar yaratilmoqda… ${done+fail}/${keys.length}`)}};
  try{await Promise.all([worker(),worker()])}
  finally{busy(false);b.disabled=false;aiCtl=null;renderEditor();renderStrip();schedule();saveLocal();
    aiStatus(sig.aborted?`To'xtatildi. Tayyor: ${done}`:fail?`Tayyor: ${done}, xato: ${fail}. ${lastErr}`:`Tayyor: ${done} ta rasm. Endi "AI tekshiruvi"ni bosing.`)}
});
function busy(on,label){
  for(const id of['aiGo','aiReview','aiAllPrompts','aiGenImgs'])$('#'+id).disabled=on;
  $('#aiPlace').disabled=on;$('#aiPlaceLbl').style.opacity=on?.5:1;$('#aiStop').hidden=!on;
  if(on&&label)aiStatus(label);
}
function aiErr2(e){if(e&&e.code==='no_ai')return"AI ulanmagan. Studiya parolini kiriting yoki sahifani claude.ai ichida oching.";if(e&&e.code==='api')return'Xato: '+e.message;if(e&&e.code==='images_unavailable')return"Bu oynada AI'ga rasm yuborib bo'lmaydi. Sahifani qayta ochib, rasmlarga ruxsat bering.";return aiErr(e)}
const escT=t=>esc(t).replace(/\n/g,'<br>');

$('#aiAllPrompts').addEventListener('click',async()=>{
  const prod=(P.brand.productEn||'the product').trim();
  const parts=P.slides.map((s,i)=>`===== ${i+1}-RASM (${fx(s.tagline).replace(/\n/g,' ')}) =====\n${promptFor(s)}`);
  const text=`Generate the images below one by one, each as a separate image. Keep the same product (${prod}) with exactly the same look and colour in every image. Never put any text, letters, numbers or logos into the images. After each image, write its label (for example "1-RASM, 1") so I can tell them apart.\n\n${parts.join('\n\n')}`;
  try{await navigator.clipboard.writeText(text);toast('Barcha promptlar nusxalandi — ChatGPT’ga qo‘ying')}
  catch{showText(text)}
});
function showText(t){$('#modalBody').innerHTML=`<p class="hint">Matnni belgilab, nusxa oling.</p><textarea rows="16" style="width:100%">${esc(t)}</textarea>`;$('#modal').hidden=false;$('#modalBody textarea').select()}

$('#aiPlace').addEventListener('change',async e=>{
  const files=[...e.target.files];e.target.value='';if(!files.length)return;
  busy(true,`${files.length} ta rasm o'qilmoqda…`);aiCtl=new AbortController();
  try{
    const ids=[];for(const f of files){try{ids.push(await addImage(f))}catch{}}
    if(!ids.length){aiStatus("Rasmlarni o'qib bo'lmadi.");return}
    const maxN=await aiChunk();
    let free=allSlots().filter(x=>!x.filled);if(!free.length)free=allSlots();
    const placed=[],warns=[];let left=[...ids];
    for(let start=0;start<ids.length&&free.length;start+=maxN){
      const chunk=ids.slice(start,start+maxN);
      aiStatus(`AI rasmlarni ko'rib, joylashtiryapti… (${Math.min(start+chunk.length,ids.length)}/${ids.length})`);
      const blobs=await Promise.all(chunk.map(id=>smallBlob(IMG[id])));
      const prompt=`You place photos into the image set of an Uzum Market product card.
Product: ${productDesc()}. English description: ${P.brand.productEn||''}.
${chunk.length} photos are attached, numbered 1 to ${chunk.length} in the order attached.
Empty slots:
${free.map(x=>`- ${x.key}: ${x.desc}`).join('\n')}
Assign each photo to the slot it fits best. A BACKGROUND slot needs a vertical photo of the product itself with calm empty areas for text; a small photo slot needs a photo matching its description. Use each photo and each slot at most once; leave a photo out if nothing fits.
Also flag a photo when it shows a different product or colour than described, or has letters, numbers or logos baked into it.
Reply with ONLY JSON: {"assign":[{"photo":1,"slot":"s0.bg"}],"warnings":[{"photo":2,"problem":"short explanation in Uzbek Latin"}]}`;
      const d=await llmJSON(prompt,blobs,aiCtl.signal);
      for(const a of(d&&Array.isArray(d.assign)?d.assign:[])){
        const id=chunk[(+a.photo)-1],slot=free.find(x=>x.key===a.slot);
        if(id&&slot&&left.includes(id)&&setSlot(slot.key,id)){placed.push({id,key:slot.key});free=free.filter(x=>x!==slot);left=left.filter(x=>x!==id)}
      }
      for(const w of(d&&Array.isArray(d.warnings)?d.warnings:[])){const id=chunk[(+w.photo)-1];if(id)warns.push({id,problem:String(w.problem||'').slice(0,300)})}
    }
    renderEditor();renderStrip();schedule();
    const name=k=>{const m=/^s(\d+)\.(?:bg|(tiles|rows)\.(\d+))$/.exec(k);return m?`${+m[1]+1}-rasm, ${m[2]?`${+m[3]+1}-plitka`:'fon'}`:k};
    $('#aiReport').innerHTML=`<h3>Rasmlar joylandi: ${placed.length} ta${left.length?`, joy topilmadi: ${left.length} ta`:''}</h3><ul class="rep">${placed.map(p=>`<li><span><span class="tag">Joylandi</span>${esc(name(p.key))}</span></li>`).join('')}${warns.map(w=>`<li><span><span class="tag warn">Diqqat</span>${esc(w.problem)}</span>${IMG[w.id]?`<img src="${IMG[w.id].src}" alt="" style="width:60px;border-radius:6px">`:''}</li>`).join('')}</ul>`;
    $('#aiReport').hidden=false;
    aiStatus(placed.length?"Rasmlar joylandi. Endi \"AI tekshiruvi\" tugmasini bosing.":"AI mos joy topa olmadi. Rasmlarni qo'lda yuklang.");
  }catch(err){aiStatus(aiErr2(err))}
  finally{busy(false);aiCtl=null;saveLocal()}
});

const FIX_RE=/^s(\d+)\.(tagline|s1|s2|headline|scene|(cards|bottom|tiles|rows)\.(\d+)\.(t|s|i|pic|chips|bt|bs|bi))$/;
function applyFix(path,value){
  const m=FIX_RE.exec(String(path));if(!m)return false;const s=P.slides[+m[1]];if(!s)return false;
  let v=String(value??'').slice(0,300);
  if(!m[3]){s[m[2]]=v;return true}
  const it=s[m[3]]&&s[m[3]][+m[4]];if(!it)return false;const f=m[5];
  if(f==='i'||f==='bi'){if(!ICONS[v])return false}
  it[f]=v;return true;
}
function slideForReview(s,i){
  const o={slide:i+1,id:`s${i}`,layout:s.layout,hasBackgroundPhoto:!!(s.bg&&IMG[s.bg]),tagline:s.tagline,s1:s.s1,s2:s.s2};
  if(s.layout==='spec')o.headline=s.headline;
  for(const k of Object.keys(LIM[s.layout]))o[k]=s[k].map(it=>{const c={...it};if('img'in c){c.hasPhoto=!!(c.img&&IMG[c.img]);delete c.img}return c});
  return o;
}
$('#aiReview').addEventListener('click',async()=>{
  busy(true,'Rasmlar tayyorlanmoqda…');aiCtl=new AbortController();
  try{
    const maxN=await aiChunk();
    const shots=[],warnBy=[];
    for(let i=0;i<P.slides.length;i++){WARN=[];const c=slideCanvas(i);warnBy.push(WARN);WARN=null;shots.push(await smallBlob(c,900))}
    snapshot();
    const fixes=[],imgIssues=[],notes=[];
    for(let start=0;start<P.slides.length;start+=maxN){
      const end=Math.min(P.slides.length,start+maxN);
      aiStatus(`AI rasmlarni tekshiryapti… (${end}/${P.slides.length}) — 1-2 daqiqa`);
      const data=P.slides.slice(start,end).map((sl,k)=>slideForReview(sl,start+k));
      const det=[];for(let i=start;i<end;i++)if(warnBy[i].length)det.push(`slide ${i+1}: ${warnBy[i].map(t=>`"${t}"`).join(', ')}`);
      const prompt=`You are the final quality check for the image set of an Uzum Market (Uzbekistan) product card, before the seller uploads it.
Product: ${productDesc()}
Product class and buyer must be respected (e.g. a business/office laptop must not be sold with gaming claims).
Attached: the rendered images of slides ${start+1} to ${end}, in order (1080x1440, shown smaller).
The editable text of these slides (paths start with the slide id, zero-based: s0 = slide 1):
${JSON.stringify(data)}
${det.length?`The renderer reports text that did not fit its box and was cut or squeezed:\n${det.join('\n')}`:''}

Check every image carefully:
1. Text: anything cut off ("…"), squeezed, overlapping, unreadable, or covering the product.
2. Facts: specs wrong for this exact product, inconsistent between slides, or claims that don't fit its class. Don't invent specs.
3. Uzbek Latin: spelling, grammar, natural seller wording; short phrasing.
4. Duplicates: the same point repeated across slides.
5. Photos: wrong product, wrong colour, baked-in text/letters/logos, product hidden behind cards or text, photo not matching its caption, missing photo.

Fix text problems yourself with short replacements that fit (titles ≤ 22 characters, subtitles ≤ 45, use \\n for a second line). Change only what is actually wrong.
Reply with ONLY JSON:
{"fixes":[{"path":"s0.cards.1.t","value":"new text","why":"short reason in Uzbek Latin"}],
 "imageIssues":[{"slot":"s1.bg or s1.tiles.0 or s1.rows.2","problem":"in Uzbek Latin","prompt":"English prompt for a replacement image, no text in the image"}],
 "notes":["anything else the seller should know, in Uzbek Latin; empty if all good"]}
Editable fields: tagline, s1, s2, headline, scene, cards.N.t/.s/.i, bottom.N.t/.s/.i, tiles.N.t/.s/.pic, rows.N.t/.s/.chips/.bt/.bs/.bi/.pic. Icon values must be one of: ${Object.keys(ICONS).join(', ')}.`;
      const d=await llmJSON(prompt,shots.slice(start,end),aiCtl.signal);
      for(const f of(d&&Array.isArray(d.fixes)?d.fixes:[])){if(applyFix(f.path,f.value))fixes.push(f)}
      for(const x of(d&&Array.isArray(d.imageIssues)?d.imageIssues:[]))imgIssues.push(x);
      for(const n of(d&&Array.isArray(d.notes)?d.notes:[]))if(String(n).trim())notes.push(String(n));
    }
    renderEditor();renderStrip();schedule();
    const sl=p=>{const m=/^s(\d+)/.exec(String(p));return m?`${+m[1]+1}-rasm`:''};
    const rep=[];
    rep.push(`<h3>${fixes.length?`Tuzatildi: ${fixes.length} ta`:'Matnda xato topilmadi'}${imgIssues.length?` · Rasm almashtirish kerak: ${imgIssues.length} ta`:''}</h3>`);
    rep.push(`<ul class="rep">`);
    fixes.forEach(f=>rep.push(`<li><span><span class="tag">${esc(sl(f.path))}</span><b>${escT(fx(f.value))}</b></span><span class="hint">${esc(f.why||'')}</span></li>`));
    imgIssues.forEach((x,i)=>rep.push(`<li><span><span class="tag warn">${esc(sl(x.slot))}</span>${esc(x.problem||'')}</span>${x.prompt?`<textarea id="rp${i}" rows="3" readonly>${esc(x.prompt+' No text, no letters, no logos.')}</textarea><div class="btns"><button class="btn sm" data-copy="rp${i}">Promptni nusxalash</button>${FAL_OK&&slotInfo(x.slot)?`<button class="btn sm primary" data-regen="${i}">AI bilan qayta yaratish</button>`:''}</div>`:''}</li>`));
    REGEN=imgIssues;
    notes.forEach(n=>rep.push(`<li>${esc(n)}</li>`));
    rep.push(`</ul>`);
    $('#aiReport').innerHTML=rep.join('');$('#aiReport').hidden=false;
    aiStatus(fixes.length||imgIssues.length?"Tekshiruv tugadi. Tuzatishlar qo'llandi — natija yoqmasa, \"bekor qilish\" tugmasini bosing.":"Tekshiruv tugadi — hammasi joyida.");
  }catch(err){WARN=null;aiStatus(aiErr2(err))}
  finally{busy(false);aiCtl=null;saveLocal()}
});

/* ---------- Boot ---------- */
(async()=>{
  try{const raw=localStorage.getItem(KEY);if(raw)await restore(JSON.parse(raw))}catch{}
  P.slides.forEach(ensure);
  try{await Promise.all(usedIds().filter(id=>!IMG[id]).map(async id=>{const u=await idb.get(id);if(u){IMGDATA[id]=u;await loadImage(id,u)}}))}catch{}
  await ping(false);
  renderBrand();renderListing();renderStrip();renderEditor();schedule();
  const specs=['800 50px Montserrat','900 italic 50px Montserrat','500 20px Montserrat','600 20px Montserrat','700 20px Montserrat','700 50px Caveat','50px "Kaushan Script"'];
  try{await Promise.all(specs.map(f=>document.fonts.load(f,'AaOo‘’Яя7')))}catch{}
  schedule();drawThumbs();
  document.fonts.ready.then(()=>{schedule();drawThumbs()});
})();
