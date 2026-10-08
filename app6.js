/* ---------- v3: one button — model name in, finished card out ---------- */
(function(){
  $('#aiGo').insertAdjacentHTML('beforebegin','<button class="btn primary" id="aiAuto" hidden>Hammasini avtomatik qilish</button>');
  const auto=$('#aiAuto'),gen=$('#aiGenImgs');
  const sync=()=>{auto.hidden=gen.hidden};
  sync();new MutationObserver(sync).observe(gen,{attributes:true,attributeFilter:['hidden']});
})();

function researchPrompt(input){
  return `Find the official specifications and official product photos of this exact product: "${input}".
Search the manufacturer's official website first, then large retailers.
Reply with ONLY one JSON object:
{"verified": true only if you found the official page of this exact model,
 "model": "exact official model name",
 "productEn": "short English description for image prompts with the official colour name, e.g. 'a Gentle Grey ASUS ExpertBook B1 15.6-inch business laptop'",
 "specs": [{"uz":"Protsessor","ru":"Процессор","v":"Intel Core 5 120U"}],
 "images": ["direct https image URLs (.jpg .jpeg .png .webp) of official product photos of THIS model: the open laptop seen from the front or a 3/4 angle on a plain background; best first; 1 to 6 URLs"],
 "sources": ["page URLs you used"],
 "notes": "Uzbek Latin: differences between the seller's text and the official data, empty if none"}
specs: 10 to 16 rows covering processor (exact name), RAM, storage, display (size, resolution, panel, refresh rate, brightness), graphics, ports (list them), wireless, camera, battery (Wh), weight (kg), operating system, colour, keyboard, security, durability standard. Only values you actually found; never guess.
The seller's configuration (RAM, SSD, processor, colour) describes the unit being sold; keep it when it is one of the official configurations.`;
}
function formatFacts(R){
  const lines=[];
  if(R.model)lines.push('Model: '+R.model);
  for(const s of(Array.isArray(R.specs)?R.specs:[]))if(s&&s.v)lines.push(`${s.uz||s.ru||''}: ${s.v}`);
  if(R.notes)lines.push('Notes: '+R.notes);
  return lines.join('\n').slice(0,4000);
}
async function findRefPhoto(input,R,sig){
  const urls=(R&&Array.isArray(R.images)?R.images:[]).map(String).filter(u=>/^https:\/\//.test(u)).slice(0,6);
  for(const u of urls){
    let id;
    try{const r=await api({action:'fetchimg',url:u},sig);id=await addDataUrl(r.dataUrl)}catch(e){if(e.code==='cancelled')throw e;continue}
    try{
      const v=await llmJSON(`Is this photo a clean product photo of "${input}" (same model family and colour), usable as the reference for marketing images? The product must stand on a plain white or light uniform background (it will be cut out automatically). Reject photos with a scene or busy background, collages, photos with large text or price banners, a different product, or tiny/blurry images. Reply with ONLY JSON {"ok":true or false,"why":"short reason"}`,[await smallBlob(IMG[id],800)],sig);
      if(v&&v.ok)return id;
    }catch(e){if(e.code==='cancelled')throw e}
  }
  return null;
}
async function genAll(sig,onProg){
  const keys=emptySlots(),queue=[...keys];let done=0,fail=0,lastErr=null;
  const worker=async()=>{while(queue.length&&!sig.aborted){const k=queue.shift();try{await genSlot(k,null,sig);done++}catch(e){if(e.code==='cancelled')return;fail++;lastErr=e}onProg&&onProg(done+fail,keys.length)}};
  await Promise.all([worker(),worker()]);
  if(sig.aborted)throw{code:'cancelled'};
  if(keys.length&&!done&&lastErr)throw lastErr;
  return{done,fail,total:keys.length};
}
async function reviewOnce(sig){
  const maxN=await aiChunk();
  const shots=[],warnBy=[];
  for(let i=0;i<P.slides.length;i++){WARN=[];const c=slideCanvas(i);warnBy.push(WARN);WARN=null;shots.push(await smallBlob(c,900))}
  const fixes=[],imgIssues=[],notes=[];
  for(let start=0;start<P.slides.length;start+=maxN){
    const end=Math.min(P.slides.length,start+maxN);
    const data=P.slides.slice(start,end).map((sl,k)=>slideForReview(sl,start+k));
    const det=[];for(let i=start;i<end;i++)if(warnBy[i].length)det.push(`slide ${i+1}: ${warnBy[i].map(t=>`"${t}"`).join(', ')}`);
    const prompt=`You are the final quality check for the image set of an Uzum Market (Uzbekistan) product card, before the seller uploads it. Judge it like a demanding buyer and a senior marketplace designer.
Product: ${productDesc()}
${P.facts?`Official data:\n${P.facts}\n`:''}Attached: the rendered images of slides ${start+1} to ${end}, in order.
Editable text of these slides (zero-based ids: s0 = slide 1):
${JSON.stringify(data)}
${det.length?`Text the renderer had to cut or squeeze:\n${det.join('\n')}\n`:''}
Check every image:
1. Text cut off, squeezed, overlapping, unreadable, or covering the product.
2. Specs that differ from the official data or the product name (e.g. "Core i5" when the product has "Core 5"), inconsistent between slides, or claims that don't fit the product class.
3. Uzbek Latin spelling and natural wording; any English word other than real names (Word, Zoom, USB-C) is an error.
4. The same point repeated on several slides.
5. Photos: not this product, wrong colour, garbled or fake logos or text, other devices, posed stock models, product hidden behind cards, photo not matching its caption.
Fix text problems yourself with short replacements (titles at most 16 characters, subtitles at most 32, \\n for a second line). Change only what is wrong.
Reply with ONLY JSON:
{"fixes":[{"path":"s0.cards.1.t","value":"new text","why":"short reason in Uzbek Latin"}],
 "imageIssues":[{"slot":"s1.bg or s1.tiles.0 or s1.rows.2","problem":"in Uzbek Latin","prompt":"English description of what the replacement photo should show"}],
 "notes":["anything else, Uzbek Latin; empty if all good"]}
Editable fields: tagline, s1, s2, headline, scene, cards.N.t/.s/.i, bottom.N.t/.s/.i, tiles.N.t/.s/.pic, rows.N.t/.s/.chips/.bt/.bs/.bi/.pic. Icons must be one of: ${Object.keys(ICONS).join(', ')}.`;
    const d=await llmJSON(prompt,shots.slice(start,end),sig);
    for(const f of(d&&Array.isArray(d.fixes)?d.fixes:[]))if(applyFix(f.path,f.value))fixes.push(f);
    for(const x of(d&&Array.isArray(d.imageIssues)?d.imageIssues:[]))imgIssues.push(x);
    for(const n of(d&&Array.isArray(d.notes)?d.notes:[]))if(String(n).trim())notes.push(String(n));
  }
  return{fixes,imgIssues,notes};
}

$('#aiAuto').addEventListener('click',async()=>{
  const btn=$('#aiAuto'),input=$('#aiInput').value.trim();
  if(!input){toast('Mahsulot nomini yozing');$('#aiInput').focus();return}
  if(!btn.dataset.sure){btn.dataset.sure='1';btn.textContent='Boshlash (~$0.3–0.6) — tasdiqlang';setTimeout(()=>{delete btn.dataset.sure;btn.textContent='Hammasini avtomatik qilish'},6000);return}
  delete btn.dataset.sure;btn.textContent='Hammasini avtomatik qilish';
  busy(true);btn.disabled=true;aiCtl=new AbortController();const sig=aiCtl.signal;
  const sources=[];let regen=0,rv={fixes:[],imgIssues:[],notes:[]};
  try{
    aiStatus('1/5 Internetdan rasmiy xususiyatlar va mahsulot surati qidirilmoqda…');
    let R=null;
    try{const r=await api({action:'research',model:P.brand.llm,prompt:researchPrompt(input)},sig);R=parseLoose(r.text)}catch(e){if(e.code==='cancelled')throw e;R=null}
    if(R&&Array.isArray(R.sources))sources.push(...R.sources.map(String).filter(u=>/^https?:\/\//.test(u)).slice(0,5));
    if(P.brand.refImg&&P.brand.refAuto===P.brand.refImg&&P.source!==input)P.brand.refImg=null;
    if(!P.brand.refImg||!IMG[P.brand.refImg]){
      aiStatus('1/5 Mahsulotning rasmiy surati tekshirilmoqda…');
      const id=await findRefPhoto(input,R,sig);
      if(id){P.brand.refImg=id;P.brand.refAuto=id;renderBrand()}
    }
    if(!P.brand.refImg||!IMG[P.brand.refImg]){
      aiStatus('Mahsulotning rasmiy surati internetdan topilmadi. Chap paneldagi “Mahsulotning haqiqiy rasmi” ga surat yuklab, tugmani qayta bosing — qolganini studiya o‘zi qiladi.');
      return;
    }
    aiStatus('2/5 Kartochka matni va Uzum tavsifi yozilmoqda…');
    const facts=R?formatFacts(R):'';
    const d=await llmJSON(buildPrompt(input+(facts?`\n\nOFFICIAL DATA found on the web (use these exact values; the seller's configuration wins if it differs):\n${facts}`:''),$('#aiNotes').value.trim(),+$('#aiCount').value),[],sig);
    snapshot();applyAI(d);P.source=input;P.facts=facts;
    if(R&&R.productEn)P.brand.productEn=String(R.productEn).slice(0,200);
    saveLocal();
    aiStatus('3/5 Rasmlar yaratilmoqda… (har biri 20–60 soniya)');
    const g=await genAll(sig,(n,t)=>aiStatus(`3/5 Rasmlar yaratilmoqda… ${n}/${t}`));
    renderEditor();renderStrip();schedule();
    aiStatus('4/5 AI tayyor rasmlarni xaridor ko‘zi bilan tekshiryapti…');
    rv=await reviewOnce(sig);
    const redo=rv.imgIssues.filter(x=>slotInfo(x.slot)).slice(0,3);
    for(let i=0;i<redo.length;i++){
      const x=redo[i],inf=slotInfo(x.slot);
      aiStatus(`5/5 Yaroqsiz rasmlar qayta yaratilmoqda… ${i+1}/${redo.length}`);
      const base=inf.kind==='bg'?bgPrompt(inf.s):itemPrompt(inf.s,inf.it);
      try{await genSlot(x.slot,(x.prompt?x.prompt+'. ':'')+base,sig);regen++}catch(e){if(e.code==='cancelled')throw e}
    }
    renderEditor();renderStrip();schedule();
    const rep=[`<h3>Tayyor: ${P.slides.length} ta rasm · ${g.done} ta surat yaratildi · ${rv.fixes.length} ta matn tuzatildi · ${regen} ta surat qayta chizildi</h3><ul class="rep">`];
    rv.fixes.forEach(f=>rep.push(`<li><span><span class="tag">Tuzatildi</span><b>${escT(fx(f.value))}</b></span><span class="hint">${esc(f.why||'')}</span></li>`));
    rv.imgIssues.slice(3).forEach(x=>rep.push(`<li><span><span class="tag warn">Ko‘rib chiqing</span>${esc(x.problem||'')}</span></li>`));
    rv.notes.forEach(n=>rep.push(`<li>${esc(n)}</li>`));
    if(R&&R.notes)rep.push(`<li><span><span class="tag warn">Rasmiy ma’lumot</span>${esc(R.notes)}</span></li>`);
    if(sources.length)rep.push(`<li><span class="hint">Manbalar: ${sources.map(u=>`<a href="${esc(u)}" target="_blank" rel="noopener">${esc(u.replace(/^https?:\/\//,'').slice(0,50))}</a>`).join(', ')}</span></li>`);
    rep.push('</ul>');
    $('#aiReport').innerHTML=rep.join('');$('#aiReport').hidden=false;
    $('#listing').open=true;
    aiStatus('Tayyor! Rasmlarni bir ko‘zdan kechiring, kerak bo‘lsa surgichlar bilan to‘g‘rlang va “Hammasini ZIP qilib olish”ni bosing.');
  }catch(e){aiStatus(aiErr2(e))}
  finally{busy(false);btn.disabled=false;aiCtl=null;saveLocal()}
});
