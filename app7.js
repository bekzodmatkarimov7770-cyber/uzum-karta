/* ---------- v4: AI designs every card itself, by the seller's own rules (no fixed templates) ---------- */
LAYOUTS.free='AI to‘liq dizayni (shablonsiz)';
LIM.free={};

const RULES_KEY='uzum-studio-rules';
const DEFAULT_RULES=`1. Mahsulot aynan haqiqiy suratdagidek bo'lsin: logotip, rang, portlar, klaviatura o'zgarmasin. Logotipni o'zing chizma va o'ylab topma — xaridorda shubha uyg'otmasin.
2. Faqat rasmiy ma'lumotlar va aniq raqamlar: "42 Wh batareya", "1,7 kg", "Intel Core 5 120U". Taxmin, "kunlik foydalanish" kabi umumiy gaplar yo'q.
3. Matn o'zbek tilida (lotin), qisqa va katta — telefonda bir qarashda o'qilsin.
4. 1-rasm asosiy: mahsulot katta, model nomi va 3–4 eng muhim xususiyat. Keyingi rasmlarning har biri bitta mavzuga: ekran, unumdorlik, portlar, batareya va vazn, kimlar uchun.
5. Bir xil gap ikki rasmda takrorlanmasin.
6. Dizayn uslubi va ranglari brendga mos (ASUS — ko'k-oq, Lenovo — qizil-qora, HP — ko'k, Acer — yashil-qora). Hamma kartochka bir xil shablonda bo'lmasin, lekin bitta to'plam ichida uslub bir xil bo'lsin.
7. Narx, chegirma, soxta nishon, sertifikat yoki "eng yaxshi" kabi tasdiqlanmagan da'volar yo'q.
8. Uzum uchun nom shu tartibda: Noutbuk + brend + seriya/model + protsessor + RAM + SSD + ekran. Masalan: "Noutbuk ASUS ExpertBook B1 Intel Core 5 120U DDR5 16GB SSD 512GB 15.6" FHD IPS".`;
function getRules(){try{return localStorage.getItem(RULES_KEY)||DEFAULT_RULES}catch{return DEFAULT_RULES}}
function setRules(v){try{localStorage.setItem(RULES_KEY,v)}catch{}}

(function(){
  const st=document.createElement('style');
  st.textContent='#aiGo,#aiAuto,#aiGenImgs,#aiAllPrompts,#aiPlaceLbl,#aiReview{display:none!important}#aiRules{font-size:13px;line-height:1.45}';
  document.head.appendChild(st);
  $('#aiPanel h2').textContent='AI bilan yaratish — model nomini yozing, kartochkani AI sizning mezonlaringiz bo‘yicha o‘zi yaratadi';
  $('#aiPanel .ai-grid').insertAdjacentHTML('afterend',`<details id="rulesBox"><summary>Mening mezonlarim (AI faqat shularga amal qiladi)</summary>
    <label style="margin-top:8px">Har bir qoidani yangi qatordan yozing. O'zgarishlar shu brauzerda saqlanadi.<textarea id="aiRules" rows="10"></textarea></label>
    <div class="btns"><button class="btn sm ghost" id="rulesReset">Boshlang‘ich mezonlarni tiklash</button></div></details>`);
  $('#aiRules').value=getRules();
  $('#aiRules').addEventListener('input',e=>setRules(e.target.value));
  $('#rulesReset').addEventListener('click',()=>{$('#aiRules').value=DEFAULT_RULES;setRules(DEFAULT_RULES);toast('Tiklandi')});
  $('#aiGo').insertAdjacentHTML('beforebegin','<button class="btn primary" id="aiFree">Kartochkani yaratish</button>');
  $('#aiStop').addEventListener('click',()=>{if(freeCtl)freeCtl.abort()});
})();
let freeCtl=null;

/* free cards: the AI image is the whole card, nothing is drawn on top */
const _renderV2=render;
render=function(ctx,s,preview){
  if(s.layout!=='free')return _renderV2(ctx,s,preview);
  ctx.clearRect(0,0,W,H);
  if(s.bg&&IMG[s.bg])coverFramed(ctx,IMG[s.bg],0,0,W,H,s.bgZ,s.bgX,s.bgY);
  else{ctx.fillStyle='#eef2ee';ctx.fillRect(0,0,W,H);if(preview){ctx.textAlign='center';ctx.fillStyle='rgba(30,55,35,.4)';ctx.font='700 34px Montserrat';ctx.fillText('AI rasmni chizmoqda…',W/2,H/2);ctx.textAlign='left'}}
};
const _renderEditorV2=renderEditor;
renderEditor=function(){
  const s=cur();
  if(s.layout!=='free')return _renderEditorV2();
  const v=(k,d)=>esc(s[k]??d);
  let h=`<div class="ed-top"><strong>${CUR+1}-rasm</strong><div class="btns"><button class="btn sm" data-act="up" aria-label="Chapga surish">←</button><button class="btn sm" data-act="down" aria-label="O'ngga surish">→</button><button class="btn sm" data-act="del">O‘chirish</button></div></div>`;
  if(s.goal)h+=`<p class="hint"><b>Maqsad:</b> ${esc(s.goal)}</p>`;
  h+=IMGF('Rasm','bg',s.bg,'data-img');
  if(s.bg&&IMG[s.bg])h+=`<div class="row3"><label>Kattalashtirish<input type="range" data-k="bgZ" min="1" max="1.8" step="0.02" value="${v('bgZ',1)}"></label><label>Chap ↔ o‘ng<input type="range" data-k="bgX" min="-1" max="1" step="0.02" value="${v('bgX',0)}"></label><label>Yuqori ↕ past<input type="range" data-k="bgY" min="-1" max="1" step="0.02" value="${v('bgY',0)}"></label></div>`;
  if(Array.isArray(s.texts)&&s.texts.length)h+=`<p class="hint"><b>Rasmdagi matn:</b> ${s.texts.map(t=>'«'+esc(t)+'»').join(', ')}</p>`;
  h+=`<label>Nimani o‘zgartirish kerak? (ixtiyoriy)<textarea id="freeFix" rows="3" placeholder="Masalan: noutbuk kattaroq bo‘lsin, fon ochroq, '42 Wh' yozuvi kattaroq"></textarea></label>
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
  return `You are a senior designer and copywriter of product cards for Uzum Market (Uzbekistan's largest marketplace). Plan a set of ${n} images for this product.
Product (seller's words): "${input}"
${facts?`OFFICIAL DATA found on the web (use these exact values; the seller's configuration wins if it differs):\n${facts}\n`:'No official data was found: use only what the seller wrote, never invent numbers.\n'}${notes?`Seller's note: ${notes}\n`:''}
THE SELLER'S RULES. Follow every one of them exactly; they override anything else:
${rules}

You decide the whole design yourself: composition, scene, colours, typography, icons, how many text lines. There is no template. Each image is one finished card generated by an image model that receives the real product photo as reference.
Reply with ONLY one JSON object:
{"style":"English, 1-2 sentences: the shared visual style of the whole set (palette with hex colours, background mood, typography, decoration) chosen for this brand",
 "cards":[{"goal":"Uzbek Latin, what this image must make the buyer understand",
   "texts":["every text that must appear on the image, exactly as it should be printed, Uzbek Latin, short; a model name may stay in English"],
   "design":"English, detailed art direction for this image: where the product stands and how big, camera angle, scene, where each text goes, size hierarchy, icons, colours"}],
 "listing":{"titleUz":"","titleRu":"","shortUz":"","shortRu":"","descUz":"","descRu":"","specs":[{"uz":"","ru":"","v":""}]}}
cards: exactly ${n}. texts: at most 8 items per card, each at most 40 characters. Every number must come from the official data or the seller's words.
listing: titleUz/titleRu follow the seller's naming rule; descriptions 600-1200 characters, natural, no keyword stuffing; specs from the official data.`;
}
function cardPrompt(s){
  return `Create one finished vertical product card image for Uzum Market (marketplace in Uzbekistan).
The attached reference photo shows the real product. Use that exact product: keep its shape, colour, logo, keyboard, ports and every detail unchanged. Do not redraw, restyle or invent a logo; if the logo is not clearly visible in the reference, show no logo at all rather than a made-up one.
Overall style of the set: ${P.freeStyle||'clean, modern, premium marketplace card'}
This card: ${s.design}
Print exactly these texts and no other words, spelled letter by letter exactly as given (Uzbek Latin, keep apostrophes):
${(s.texts||[]).map(t=>`- "${t}"`).join('\n')||'- (no text)'}
Text must be large, crisp and readable on a phone. Keep the top 7% and bottom 7% of the image as plain background with no text and no product (they will be cropped). No price, no discount badges, no watermarks, no extra devices, no people unless the art direction asks for them.`;
}
async function drawCard(s,extra,sig){
  const ref=await refDataUrl();
  if(!ref)throw{code:'api',message:'Mahsulotning haqiqiy surati yo‘q. Chap paneldagi “Mahsulotning haqiqiy rasmi” ga surat yuklang.'};
  const prompt=cardPrompt(s)+(extra?`\n\nFIX THESE PROBLEMS OF THE PREVIOUS VERSION:\n${extra}`:'');
  let r,tries=0;
  for(;;){try{r=await api({action:'image',model:P.brand.heroModel,prompt,size:'1024x1536',quality:'medium',refs:[ref]},sig);break}
    catch(e){if(e.status===429&&tries<3){tries++;await new Promise(z=>setTimeout(z,20000*tries));continue}throw e}}
  s.bg=await addDataUrl(r.dataUrl);s.bgZ=1;s.bgX=0;s.bgY=0;schedule();
}
async function checkCard(s,sig){
  if(!s.bg||!IMG[s.bg])return null;
  const imgs=[await smallBlob(IMG[s.bg],1000)];
  if(P.brand.refImg&&IMG[P.brand.refImg])imgs.push(await smallBlob(IMG[P.brand.refImg],700));
  const d=await llmJSON(`You check one product card image for Uzum Market before it is published. Image 1 is the card. Image 2 is the real product photo.
Product: ${productDesc()}
${P.facts?`Official data:\n${P.facts}\n`:''}The card should show these texts exactly: ${JSON.stringify(s.texts||[])}
Its purpose: ${s.goal||''}
The seller's rules:
${getRules()}
Check: 1) every text is present and spelled exactly, no garbled letters, no extra words; 2) the product is the same as in image 2 and the logo is the real one, not distorted or invented; 3) numbers match the official data; 4) every seller rule is respected; 5) it looks professional and is readable on a phone; text and product are not in the top or bottom 7%.
Reply with ONLY JSON {"score":1-10,"ok":true or false,"problems":["Uzbek Latin, short"],"fix":"English instructions for the image model to fix the problems, empty if ok"}`,imgs,sig);
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
      aiStatus('Mahsulotning rasmiy surati internetdan topilmadi. Chap paneldagi “Mahsulotning haqiqiy rasmi” ga surat yuklab, tugmani qayta bosing — qolganini studiya o‘zi qiladi.');
      return;
    }
    const facts=R?formatFacts(R):'';
    aiStatus('2/5 AI mezonlaringiz bo‘yicha kartochkalarni loyihalayapti…');
    const plan=await llmJSON(planPrompt(input,facts,$('#aiNotes').value.trim(),n,rules),[],sig);
    if(!plan||!Array.isArray(plan.cards)||!plan.cards.length)throw{code:'invalid_json'};
    snapshot();
    const str=(v,m)=>String(v??'').slice(0,m);
    P.freeStyle=str(plan.style,600);P.source=input;P.facts=facts;
    if(R&&R.productEn)P.brand.productEn=str(R.productEn,200);
    P.slides=plan.cards.slice(0,n).map(c=>ensure({layout:'free',goal:str(c&&c.goal,200),texts:(Array.isArray(c&&c.texts)?c.texts:[]).map(t=>str(t,60)).filter(Boolean).slice(0,8),design:str(c&&c.design,1500),bg:null,lighten:false,tagline:'',s1:'',s2:'',scene:''}));
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
    aiStatus('Tayyor! Rasmlarni ko‘rib chiqing. Birortasi yoqmasa, uni tanlab o‘ng tomonda nimani o‘zgartirishni yozing va “AI bilan qayta chizish”ni bosing. Keyin “Hammasini ZIP qilib olish”.');
  }catch(e){aiStatus(aiErr2(e))}
  finally{busy(false);btn.disabled=false;freeCtl=null;saveLocal()}
});
