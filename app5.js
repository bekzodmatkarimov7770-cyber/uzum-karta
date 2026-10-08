/* ---------- v2: text always fits its box, background framing, stricter AI rules ---------- */
function layoutText(ctx,o,parts,f){
  const L=[];let total=0,warn=null;
  for(const p of parts){
    let t=fx(p.text);if(!t.trim())continue;if(p.up)t=t.toUpperCase();
    let size=Math.round(p.size*f);const min=Math.max(10,Math.round((p.min||p.size)*f));
    const font=sz=>`${p.w||500} ${sz}px Montserrat`;const max=p.max||9;let lines,wd=0;
    for(;;){ctx.font=font(size);lines=wrap(ctx,t,o.maxW);wd=Math.max(0,...lines.map(l=>ctx.measureText(l).width));if((lines.length<=max&&wd<=o.maxW)||size<=min)break;size-=1}
    if(lines.length>max||wd>o.maxW*1.02)warn=t;
    if(lines.length>max){lines=lines.slice(0,max);lines[max-1]=lines[max-1]+'…'}
    const lh=size*(p.lh||1.2),gap=L.length?(p.gap??size*0.3):0;total+=gap+lines.length*lh;
    L.push({lines,lh,gap,font:font(size),color:p.color});
  }
  return{L,total,warn};
}
function textBlock(ctx,o,parts){
  let f=1,r=layoutText(ctx,o,parts,f);
  while(o.maxH&&r.total>o.maxH&&f>0.6){f-=0.04;r=layoutText(ctx,o,parts,f)}
  if(WARN&&(r.warn||(o.maxH&&r.total>o.maxH+2)))WARN.push(String(r.warn||parts.map(p=>p.text).join(' ')).replace(/\n/g,' '));
  let y=o.top!=null?o.top:o.bottom!=null?o.bottom-r.total:o.cy-r.total/2;
  ctx.textBaseline='middle';ctx.textAlign=o.align||'left';
  for(const b of r.L){y+=b.gap;ctx.font=b.font;ctx.fillStyle=b.color;for(const l of b.lines){ctx.fillText(l,o.x,y+b.lh/2,o.maxW);y+=b.lh}}
  ctx.textAlign='left';ctx.textBaseline='alphabetic';return r.total;
}
function coverFramed(ctx,img,x,y,w,h,z,ox,oy){
  z=Math.max(1,parseFloat(z)||1);ox=Math.max(-1,Math.min(1,parseFloat(ox)||0));oy=Math.max(-1,Math.min(1,parseFloat(oy)||0));
  const s=Math.max(w/img.width,h/img.height)*z,sw=w/s,sh=h/s,mx=(img.width-sw)/2,my=(img.height-sh)/2;
  ctx.drawImage(img,mx+ox*mx,my+oy*my,sw,sh,x,y,w,h);
}
function background(ctx,s,preview){
  const B=P.brand;
  if(s.bg&&IMG[s.bg]) coverFramed(ctx,IMG[s.bg],0,0,W,H,s.bgZ,s.bgX,s.bgY);
  else{
    const g=ctx.createLinearGradient(0,0,W,H);g.addColorStop(0,'#f5f9f4');g.addColorStop(1,'#e6efe4');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    for(const[x,y,r]of[[40,760,420],[1060,1080,460],[960,300,320]]){const rg=ctx.createRadialGradient(x,y,0,x,y,r);rg.addColorStop(0,rgba(B.cA,.2));rg.addColorStop(1,rgba(B.cA,0));ctx.fillStyle=rg;ctx.fillRect(0,0,W,H)}
    if(preview){ctx.textAlign='center';ctx.fillStyle='rgba(30,55,35,.32)';ctx.font='700 34px Montserrat';ctx.fillText('Fon rasmini yuklang',400,800);ctx.textAlign='left'}
  }
  if(s.lighten!==false){const g=ctx.createLinearGradient(0,0,0,540);g.addColorStop(0,'rgba(255,255,255,.93)');g.addColorStop(.55,'rgba(255,255,255,.72)');g.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,540)}
}
function whiteCards(ctx,cards,x0,y0,h,gap){
  const B=P.brand,R0=1070;
  cards.forEach((c,i)=>{
    const y=y0+i*(h+gap),bs=Math.min(h-14,98);
    ctx.save();ctx.shadowColor='rgba(20,45,22,.16)';ctx.shadowBlur=24;ctx.shadowOffsetY=6;rrect(ctx,x0+bs*.45,y,R0-x0-bs*.45,h,22);ctx.fillStyle='rgba(255,255,255,.93)';ctx.fill();ctx.restore();
    iconBox(ctx,x0,y+(h-bs)/2,bs,c.i);
    const tx=x0+bs+16;
    textBlock(ctx,{x:tx,cy:y+h/2,maxW:R0-tx-14,maxH:h-16},[{text:c.t,size:31,min:20,w:800,color:B.dark,lh:1.08,max:2},{text:c.s,size:20,min:15,w:500,color:'#46524a',lh:1.22,max:2}]);
  });
}
function darkCards(ctx,cards,x0,y0,h,gap){
  const B=P.brand,R0=1070;
  cards.forEach((c,i)=>{
    const y=y0+i*(h+gap),bs=h-24;
    ctx.save();ctx.shadowColor='rgba(0,0,0,.28)';ctx.shadowBlur=20;ctx.shadowOffsetY=6;rrect(ctx,x0,y,R0-x0,h,20);ctx.fillStyle='rgba(7,30,15,.9)';ctx.fill();ctx.restore();
    rrect(ctx,x0,y,R0-x0,h,20);ctx.lineWidth=2;ctx.strokeStyle=rgba(B.cA,.55);ctx.stroke();
    iconBox(ctx,x0+12,y+12,bs,c.i);
    const tx=x0+12+bs+16;
    textBlock(ctx,{x:tx,cy:y+h/2,maxW:R0-tx-14,maxH:h-14},[{text:c.t,size:29,min:19,w:800,color:'#ffffff',lh:1.08,max:2},{text:c.s,size:19,min:14,w:500,color:'rgba(225,242,228,.92)',lh:1.22,max:2}]);
  });
}
function iconBar(ctx,items,y,h,compact){
  if(!items.length)return;const B=P.brand,x=45,w=990,n=items.length,cw=w/n;
  ctx.save();ctx.shadowColor='rgba(20,45,22,.14)';ctx.shadowBlur=26;ctx.shadowOffsetY=6;rrect(ctx,x,y,w,h,26);ctx.fillStyle='rgba(255,255,255,.9)';ctx.fill();ctx.restore();
  const is=compact?44:52;
  items.forEach((it,i)=>{
    const cx=x+i*cw;
    if(i){ctx.fillStyle='rgba(0,0,0,.1)';ctx.fillRect(cx,y+22,1.5,h-44)}
    drawIcon(ctx,it.i,cx+18,y+(h-is)/2,is,B.cA,2.1);
    const tx=cx+18+is+12;
    textBlock(ctx,{x:tx,cy:y+h/2,maxW:cw-(tx-cx)-10,maxH:h-24},[{text:it.t,size:compact?22:24,min:15,w:700,color:B.dark,lh:1.1,max:2},{text:it.s,size:compact?18:19,min:13,w:500,color:'#4b5750',lh:1.2,max:3}]);
  });
}
function photoTile(ctx,x,y,w,h,it,style){
  const B=P.brand,img=it.img&&IMG[it.img];
  ctx.save();rrect(ctx,x,y,w,h,22);ctx.clip();
  if(style==='dark'){
    const ih=h*.6;img?cover(ctx,img,x,y,w,ih+10):tilePlaceholder(ctx,x,y,w,ih+10);
    ctx.fillStyle='#07150c';ctx.fillRect(x,y+ih,w,h-ih);
    const g=ctx.createLinearGradient(0,y+ih-40,0,y+ih);g.addColorStop(0,'rgba(7,21,12,0)');g.addColorStop(1,'#07150c');ctx.fillStyle=g;ctx.fillRect(x,y+ih-40,w,40);
  }else{
    img?cover(ctx,img,x,y,w,h):tilePlaceholder(ctx,x,y,w,h);
    const g=ctx.createLinearGradient(0,y+h*.38,0,y+h);g.addColorStop(0,rgba(B.cA,0));const dk=hex2rgb(B.cA).map(v=>Math.round(v*.35));g.addColorStop(1,`rgba(${dk.join(',')},.95)`);ctx.fillStyle=g;ctx.fillRect(x,y,w,h);
  }
  ctx.restore();
  ctx.save();if(style==='dark'){ctx.shadowColor=rgba(B.cA,.7);ctx.shadowBlur=16;ctx.strokeStyle=mix(B.cA,'#ffffff',.15)}else{ctx.strokeStyle='rgba(255,255,255,.8)'}
  rrect(ctx,x,y,w,h,22);ctx.lineWidth=3;ctx.stroke();ctx.restore();
  if(style==='dark'){
    textBlock(ctx,{x:x+w/2,cy:y+h*.6+(h*.4)/2,maxW:w-28,maxH:h*.4-16,align:'center'},[{text:it.t,size:27,min:17,w:800,color:'#fff',lh:1.1,max:2},{text:it.s,size:19,min:13,w:500,color:'#cfe2d3',lh:1.2,max:2}]);
  }else{
    const big=w>600;
    textBlock(ctx,{x:x+26,bottom:y+h-24,maxW:w-52,maxH:h*.55},[{text:it.t,size:big?44:32,min:18,w:800,color:'#fff',lh:1.06,max:2,up:true},{text:it.s,size:big?25:21,min:14,w:500,color:'rgba(255,255,255,.92)',lh:1.2,max:2}]);
  }
}
function render(ctx,s,preview){
  ctx.clearRect(0,0,W,H);ctx.textAlign='left';ctx.textBaseline='alphabetic';
  const L=s.layout,B=P.brand;
  background(ctx,s,preview);
  const hb=header(ctx,s,L==='rows');
  if(L==='spec'){
    if((s.headline||'').trim()){ctx.fillStyle=B.cA;ctx.fillRect(100,hb-2,70,4);textBlock(ctx,{x:100,top:hb+22,maxW:540,maxH:110},[{text:s.headline,size:40,min:26,w:700,color:B.dark,lh:1.15,max:2}])}
    whiteCards(ctx,s.cards.slice(0,5),750,460,128,18);
    iconBar(ctx,s.bottom.slice(0,4),1232,165,false);
  }else if(L==='features'){
    darkCards(ctx,s.cards.slice(0,6),740,440,104,10);
    tileRow(ctx,s.tiles.slice(0,4),1128,278,'dark');
  }else if(L==='rows'){
    const hasB=s.bottom.length>0;
    rowsBlock(ctx,s.rows.slice(0,5),hb+12,hasB?1268:1405);
    if(hasB)iconBar(ctx,s.bottom.slice(0,4),1285,120,true);
  }else if(L==='gallery'){
    whiteCards(ctx,s.cards.slice(0,4),750,462,118,16);
    tileRow(ctx,s.tiles.slice(0,3),1050,352,'grad');
  }else if(L==='grid'){
    tileGrid(ctx,s.tiles.slice(0,4),hb+18,1405);
  }
}

/* image framing controls under the background picker */
const _renderEditorV1=renderEditor;
renderEditor=function(){
  _renderEditorV1();
  const s=cur();if(!(s.bg&&IMG[s.bg]))return;
  const first=document.querySelector('#editorPanel .imgf');if(!first)return;
  const v=(k,d)=>esc(s[k]??d);
  first.insertAdjacentHTML('afterend',`<div class="row3"><label>Kattalashtirish<input type="range" data-k="bgZ" min="1" max="1.8" step="0.02" value="${v('bgZ',1)}"></label><label>Chap ↔ o‘ng<input type="range" data-k="bgX" min="-1" max="1" step="0.02" value="${v('bgX',0)}"></label><label>Yuqori ↕ past<input type="range" data-k="bgY" min="-1" max="1" step="0.02" value="${v('bgY',0)}"></label></div><p class="hint">Mahsulot kartalar ostida qolsa, rasmni surib chapga o‘tkazing.</p>`);
};

/* stricter rules for the card text */
const _buildPromptV1=buildPrompt;
buildPrompt=function(input,notes,n){
  return _buildPromptV1(input,notes,n)+`

STRICT RULES (these override anything above):
- Copy processor, memory, storage, display and model names exactly as the seller wrote them. "Intel Core 5 120U" is NOT "Core i5" or "i5 120U"; never add, drop or change letters or numbers in a spec.
- Every visible word is Uzbek Latin, chips and tags included. Only real names stay as they are (Word, Excel, Zoom, Telegram, Wi-Fi 6, USB-C, HDMI). Never English words such as office, study, notes, home, web, media, docs, video.
- Card and tile titles: one idea, at most 16 characters. Subtitles: at most 32 characters. Headline: at most 38 characters.
- Do not repeat the same spec on several slides; each slide adds something new.
- scene and pic always show THIS product as the main subject. Never other devices, network switches, phones, other laptops or full-face stock models; a person may appear only partly (hands, shoulder, from behind) while using this product.
- In every scene the product stands in the LEFT 55% of the frame; the right 45% and the top 30% are an empty, plain, softly blurred background.`;
};

/* image prompts: product on the left, nothing written anywhere */
function bgPrompt(s){
  const prod=(P.brand.productEn||'the product').trim(),scene=(s.scene||'').trim();
  const room={spec:'the right 45%, the top 30% and the bottom 15%',features:'the right 45%, the top 30% and the bottom 22%',gallery:'the right 45%, the top 30% and the bottom 26%'}[s.layout];
  if(room)return`Vertical 3:4 photorealistic e-commerce product photo. ${prod}, placed in the LEFT 55% of the frame, slightly angled, sharp, premium commercial lighting. ${scene?scene+'.':'Bright modern office, soft daylight, softly blurred background.'} ${room} of the image must be empty, plain, softly blurred background with no objects, so text can be placed there. The laptop screen shows a simple soft abstract gradient wallpaper. Do not write or draw any text, letters, numbers or extra logos anywhere in the image; keep only the product's own real logo if it is visible in the reference photo.`;
  return`Vertical 3:4 soft background, heavily blurred, nothing in sharp focus: ${scene||'bright modern office, plants bokeh, light clean tones'}. No text, no letters, no logos.`;
}
function itemPrompt(s,it){
  const prod=(P.brand.productEn||'the product').trim(),pic=(it.pic||'').trim();
  const ar=s.layout==='rows'?'Wide landscape':s.layout==='gallery'?'Vertical 3:4':'Landscape';
  return`${ar} photorealistic product photo. Main subject: ${prod}, exactly the same product as in the reference photo. ${pic||`Showing: ${fx(it.t)}${it.s?' — '+fx(it.s):''}`}. No other devices, no other laptops, no network equipment. If a person appears, only hands or a person seen from behind, never a posed stock model face. Premium lighting. Do not write or draw any text, letters, numbers or extra logos.`;
}

/* AI pictures only from the real product photo, otherwise it draws a different laptop */
const _genSlotV1=genSlot;
genSlot=async function(key,override,signal){
  if(!P.brand.refImg||!IMG[P.brand.refImg])throw{code:'api',message:'Avval chap paneldagi “Mahsulotning haqiqiy rasmi” ga mahsulot suratini yuklang. Busiz AI boshqa noutbukni chizadi.'};
  return _genSlotV1(key,override,signal);
};
