const W=1080,H=1440;
let WARN=null,FAL_OK=false,FAL_ENV=false,HAS_SAMPLE=false,MODELS={image:[],chat:[]};
function getPass(){try{return localStorage.getItem('uzum-studio-pass')||''}catch{return''}}
function setPass(v){try{localStorage.setItem('uzum-studio-pass',v)}catch{}}
const PASS_KEY='uzum-studio-pass';
const $=s=>document.querySelector(s);
const IMG={}, IMGDATA={};
const KEY='uzum-karta-studio-v1';

/* ---------- Icons (24px stroke paths) ---------- */
const C=(cx,cy,r)=>`M${cx-r} ${cy}a${r} ${r} 0 1 0 ${2*r} 0a${r} ${r} 0 1 0 ${-2*r} 0`;
const R=(x,y,w,h,r)=>`M${x+r} ${y}h${w-2*r}a${r} ${r} 0 0 1 ${r} ${r}v${h-2*r}a${r} ${r} 0 0 1 ${-r} ${r}h${-(w-2*r)}a${r} ${r} 0 0 1 ${-r} ${-r}v${-(h-2*r)}a${r} ${r} 0 0 1 ${r} ${-r}z`;
const ICONS={
  cpu:['Protsessor',R(5,5,14,14,2)+R(9,9,6,6,1)+'M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3'],
  ram:['Xotira (RAM)',R(2,6,20,10,1.5)+'M6 16v3M10 16v3M14 16v3M18 16v3M6 9.5v3M10 9.5v3M14 9.5v3M18 9.5v3'],
  ssd:['SSD / disk',R(4,2,16,20,2)+'M8 7h8M8 11h8M8 17h3'+C(16,17,0.6)],
  monitor:['Ekran',R(2,4,20,13,2)+'M8 21h8M12 17v4'],
  expand:['Aniqlik',"M3 8V3h5M21 8V3h-5M3 16v5h5M21 16v5h-5"],
  eye:["Ko'z / tasvir",'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z'+C(12,12,3)],
  gauge:['Tezlik','M12 14l4-4M3.3 19a10 10 0 1 1 17.4 0'],
  keyboard:['Klaviatura',R(2,6,20,12,2)+'M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10'],
  gamepad:["O'yin",'M6 11h4M8 9v4M15 12h.01M18 10h.01M17.3 5H6.7a4 4 0 0 0-4 3.6L2 15a3 3 0 0 0 5.2 2.3L9 15h6l1.8 2.3A3 3 0 0 0 22 15l-.7-6.4A4 4 0 0 0 17.3 5z'],
  shield:['Himoya','M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5zM8.5 12l2.5 2.5 4.5-5'],
  fan:['Sovutish',C(12,12,2)+'M12 10c0-4 1-7 4-7 2 0 3 2 2 4-1 2-4 3-6 3zM14 12c4 0 7 1 7 4 0 2-2 3-4 2-2-1-3-4-3-6zM12 14c0 4-1 7-4 7-2 0-3-2-2-4 1-2 4-3 6-3zM10 12c-4 0-7-1-7-4 0-2 2-3 4-2 2 1 3 4 3 6z'],
  gem:['Premium','M6 3h12l4 6-10 12L2 9zM2 9h20M12 21L8 9l4-6 4 6'],
  mute:['Kam shovqin','M11 5L6 9H2v6h4l5 4zM22 9l-6 6M16 9l6 6'],
  speaker:['Ovoz','M11 5L6 9H2v6h4l5 4zM15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14'],
  zap:['Quvvat','M13 2L3 14h9l-1 8 10-12h-9z'],
  battery:['Batareya',R(2,7,17,10,2)+'M22 11v2M6 10v4M10 10v4'],
  plug:['Zaryadlash','M9 2v6M15 2v6M6 8h12v4a6 6 0 0 1-12 0zM12 18v4'],
  wifi:['Wi-Fi','M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M2 9a15 15 0 0 1 20 0M12 20h.01'],
  camera:['Kamera','M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z'+C(12,13,3)],
  film:['Video montaj',R(2,3,20,18,2)+'M7 3v18M17 3v18M2 8h5M2 16h5M17 8h5M17 16h5M2 12h20'],
  code:['Dasturlash','M16 18l6-6-6-6M8 6l-6 6 6 6'],
  palette:['Dizayn','M12 2a10 10 0 1 0 0 20c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1.1.9-2 2-2h2.4A5 5 0 0 0 22 11.2C22 6.1 17.5 2 12 2zM7.5 10.5h.01M10.5 7h.01M15 7.5h.01'],
  briefcase:['Ish / ofis',R(2,7,20,14,2)+'M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2M2 13h20'],
  gear:['Sozlama',C(12,12,3)+'M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9L7 7M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1'],
  sun:['Yorug‘lik',C(12,12,4)+'M12 1v2M12 21v2M1 12h2M21 12h2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4'],
  box:['Komplekt','M21 8l-9-5-9 5v8l9 5 9-5zM3 8l9 5 9-5M12 13v8'],
  feather:['Yengil','M20 4C12 4 6 9 5 19M20 4c0 8-5 13-13 14M5 19l-2 2M9 13h6'],
  weight:["Og'irlik",'M6 7h12l3 14H3zM9 4a3 3 0 1 0 6 0a3 3 0 1 0-6 0'],
  ruler:["O'lcham",'M3 17L17 3l4 4L7 21zM7 13l2 2M10 10l2 2M13 7l2 2'],
  drop:['Suv / namlik','M12 2.7l5.7 5.7a8 8 0 1 1-11.4 0z'],
  flame:['Issiqlik','M12 22c4 0 7-3 7-7 0-4-3-6-4-10-2 2-3 4-3 6-1-1-2-2-2-4-3 3-5 5-5 8 0 4 3 7 7 7z'],
  heart:['Sevimli','M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.8 1-1.1a5.5 5.5 0 0 0 0-7.8z'],
  star:['Yulduz','M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z'],
  check:['Belgi','M20 6L9 17l-5-5'],
  clock:['Vaqt',C(12,12,10)+'M12 6v6l4 2'],
  truck:['Yetkazish','M1 4h14v12H1zM15 9h4l3 3v4h-7z'+C(5.5,18.5,2)+C(18.5,18.5,2)],
  gift:["Sovg'a",R(3,8,18,4,1)+'M5 12v9h14v-9M12 8v13M12 8C10 4 7 4 7 6s3 2 5 2c2 0 5 0 5-2s-3-2-5 2'],
  image:['Rasm',R(3,3,18,18,2)+C(9,9,2)+'M21 15l-5-5L5 21'],
};
const P2={};
function ip(n){return P2[n]||(P2[n]=new Path2D(ICONS[n][1]))}
function drawIcon(ctx,n,x,y,s,col,lw=2){
  if(!ICONS[n])return;
  ctx.save();ctx.translate(x,y);ctx.scale(s/24,s/24);
  ctx.lineWidth=lw;ctx.strokeStyle=col;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke(ip(n));ctx.restore();
}

/* ---------- Color + text helpers ---------- */
function hex2rgb(h){h=(h||'#000').replace('#','');if(h.length===3)h=h.split('').map(x=>x+x).join('');const n=parseInt(h,16)||0;return[n>>16&255,n>>8&255,n&255]}
function mix(a,b,t){const A=hex2rgb(a),B=hex2rgb(b);return`rgb(${A.map((v,i)=>Math.round(v+(B[i]-v)*t)).join(',')})`}
function rgba(h,a){const[r,g,b]=hex2rgb(h);return`rgba(${r},${g},${b},${a})`}
function fx(t){t=String(t??'');if(!P.brand.apos)return t;return t.replace(/([OoGg])['`´ʻ’]/g,'$1‘').replace(/['`´]/g,'’')}
function rrect(ctx,x,y,w,h,r){r=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}
function cover(ctx,img,x,y,w,h){const s=Math.max(w/img.width,h/img.height);const sw=w/s,sh=h/s;ctx.drawImage(img,(img.width-sw)/2,(img.height-sh)/2,sw,sh,x,y,w,h)}
function wrap(ctx,t,maxW){const out=[];for(const para of t.split('\n')){const ws=para.split(/\s+/).filter(Boolean);if(!ws.length){continue}let line=ws[0];for(let i=1;i<ws.length;i++){const tt=line+' '+ws[i];if(ctx.measureText(tt).width<=maxW)line=tt;else{out.push(line);line=ws[i]}}out.push(line)}return out}
function textBlock(ctx,o,parts){
  const L=[];let total=0;
  for(const p of parts){
    let t=fx(p.text);if(!t.trim())continue;if(p.up)t=t.toUpperCase();
    let size=p.size;const font=sz=>`${p.w||500} ${sz}px Montserrat`;let lines;const max=p.max||9;
    let wd=0;
    for(;;){ctx.font=font(size);lines=wrap(ctx,t,o.maxW);wd=Math.max(...lines.map(l=>ctx.measureText(l).width));if((lines.length<=max&&wd<=o.maxW)||size<=(p.min||size))break;size-=1}
    if(WARN&&(lines.length>max||wd>o.maxW*1.02))WARN.push(t.replace(/\n/g,' '));
    if(lines.length>max){lines=lines.slice(0,max);lines[max-1]=lines[max-1]+'…'}
    const lh=size*(p.lh||1.2);const gap=L.length?(p.gap??size*0.3):0;total+=gap+lines.length*lh;
    L.push({lines,lh,gap,font:font(size),color:p.color});
  }
  let y=o.top!=null?o.top:o.bottom!=null?o.bottom-total:o.cy-total/2;
  ctx.textBaseline='middle';ctx.textAlign=o.align||'left';
  for(const b of L){y+=b.gap;ctx.font=b.font;ctx.fillStyle=b.color;for(const l of b.lines){ctx.fillText(l,o.x,y+b.lh/2,o.maxW);y+=b.lh}}
  ctx.textAlign='left';ctx.textBaseline='alphabetic';return total;
}
function spaced(ctx,t,x,y,sp){for(const ch of t){ctx.fillText(ch,x,y);x+=ctx.measureText(ch).width+sp}return x}

/* ---------- Drawing ---------- */
function background(ctx,s,preview){
  const B=P.brand;
  if(s.bg&&IMG[s.bg]) cover(ctx,IMG[s.bg],0,0,W,H);
  else{
    const g=ctx.createLinearGradient(0,0,W,H);g.addColorStop(0,'#f5f9f4');g.addColorStop(1,'#e6efe4');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    for(const[x,y,r]of[[40,760,420],[1060,1080,460],[960,300,320]]){const rg=ctx.createRadialGradient(x,y,0,x,y,r);rg.addColorStop(0,rgba(B.cA,.2));rg.addColorStop(1,rgba(B.cA,0));ctx.fillStyle=rg;ctx.fillRect(0,0,W,H)}
    if(preview){ctx.textAlign='center';ctx.fillStyle='rgba(30,55,35,.32)';ctx.font='700 34px Montserrat';ctx.fillText('Fon rasmini yuklang',400,800);ctx.font='500 24px Montserrat';ctx.fillText('ChatGPT’dan yozuvsiz rasm',400,842);ctx.textAlign='left'}
  }
  if(s.lighten!==false){const g=ctx.createLinearGradient(0,0,0,540);g.addColorStop(0,'rgba(255,255,255,.93)');g.addColorStop(.55,'rgba(255,255,255,.72)');g.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,540)}
}

function header(ctx,s,compact){
  const B=P.brand,k=compact?0.84:1,hasSlogan=!!((s.s1||'').trim()||(s.s2||'').trim());
  const logoBase=compact?140:168;
  if(B.logoImg&&IMG[B.logoImg]){
    const im=IMG[B.logoImg],bw=420*k,bh=125*k,sc=Math.min(bw/im.width,bh/im.height);
    ctx.drawImage(im,92,40+(bh-im.height*sc)/2,im.width*sc,im.height*sc);
  }else if((B.logoText||'').trim()){
    ctx.font=`800 ${Math.round(150*k)}px Montserrat`;
    const g=ctx.createLinearGradient(0,40,0,logoBase);g.addColorStop(0,mix(B.cA,'#ffffff',.22));g.addColorStop(1,B.cA);
    ctx.fillStyle=g;ctx.textBaseline='alphabetic';ctx.fillText(fx(B.logoText),88,logoBase,hasSlogan?640:900);
  }
  const mBase=compact?276:332,model=fx(B.model||''),num=fx(B.num||'');
  let ms=175*k,ns=270*k;
  ctx.font=`900 italic ${ms}px Montserrat`;let mw=model?ctx.measureText(model).width:0;
  ctx.font=`900 italic ${ns}px Montserrat`;let nw=num?ctx.measureText(num).width:0;
  const maxW=hasSlogan?640:930,sc=Math.min(1,maxW/Math.max(1,mw+nw+(num&&model?14:0)));
  ms*=sc;ns*=sc;mw*=sc;nw*=sc;
  if(model){ctx.save();ctx.font=`900 italic ${ms}px Montserrat`;ctx.fillStyle=B.dark;ctx.shadowColor='rgba(0,0,0,.16)';ctx.shadowBlur=14;ctx.shadowOffsetY=5;ctx.fillText(model,84,mBase);ctx.restore()}
  if(num){const nx=84+mw+(model?14:0);ctx.font=`900 italic ${ns}px Montserrat`;const g=ctx.createLinearGradient(nx,mBase-ns*.75,nx+nw,mBase);g.addColorStop(0,mix(B.cB,'#ffffff',.35));g.addColorStop(1,mix(B.cB,'#000000',.12));ctx.fillStyle=g;ctx.fillText(num,nx,mBase+ns*.07)}
  const tl=fx(s.tagline||'').toUpperCase().split('\n').filter(x=>x.trim());
  ctx.font=`500 ${Math.round(30*k)}px Montserrat`;ctx.fillStyle=mix(B.dark,'#ffffff',.12);
  const tY=mBase+60*k;tl.forEach((t,i)=>spaced(ctx,t,100,tY+i*40*k,15*k));
  const hb=tY+Math.max(0,tl.length-1)*40*k+22;
  if(B.badgeOn&&(B.badgeT||'').trim()){
    ctx.font='600 52px Montserrat';const t=fx(B.badgeT),tw=ctx.measureText(t).width;
    ctx.font='500 24px Montserrat';const sw=ctx.measureText(fx(B.badgeS||'')).width;
    const tx=1045-Math.max(tw,sw);
    if(B.badgeIcon==='win'){const q=25,gp=4,sx=tx-2*q-gp-16,sy=44;ctx.fillStyle=B.cB;ctx.fillRect(sx,sy,q,q);ctx.fillRect(sx+q+gp,sy,q,q);ctx.fillRect(sx,sy+q+gp,q,q);ctx.fillRect(sx+q+gp,sy+q+gp,q,q)}
    else if(ICONS[B.badgeIcon])drawIcon(ctx,B.badgeIcon,tx-70,42,56,B.cB,2.2);
    ctx.fillStyle=B.cB;ctx.font='600 52px Montserrat';ctx.fillText(t,tx,92);
    ctx.font='500 24px Montserrat';ctx.fillStyle=mix(B.cB,B.dark,.35);ctx.fillText(fx(B.badgeS||''),tx,126);
  }
  if(hasSlogan){
    ctx.save();ctx.translate(900,B.badgeOn?232:176);ctx.rotate(-0.17);
    const kau=B.script==='Kaushan Script',f=kau?'74px "Kaushan Script"':'700 96px Caveat';ctx.font=f;ctx.textAlign='center';
    const l1=fx(s.s1||''),l2=fx(s.s2||'');const w=Math.max(ctx.measureText(l1).width,ctx.measureText(l2).width+50);
    if(w>320){const f2=320/w;ctx.scale(f2,f2)}
    ctx.fillStyle=B.cA;ctx.fillText(l1,0,0);
    if(l2){ctx.fillStyle=B.dark;ctx.fillText(l2,25,78)}
    const yb=(l2?78:0)+30;ctx.beginPath();ctx.moveTo(-150,yb+22);ctx.quadraticCurveTo(30,yb-2,190,yb-14);ctx.quadraticCurveTo(30,yb+12,-150,yb+22);ctx.fillStyle=B.cA;ctx.fill();
    ctx.restore();
  }
  return hb;
}

function iconBox(ctx,x,y,s,icon){
  const B=P.brand;rrect(ctx,x,y,s,s,s*.2);
  const g=ctx.createLinearGradient(x,y,x+s,y+s);g.addColorStop(0,mix(B.cA,'#ffffff',.18));g.addColorStop(1,mix(B.cA,'#000000',.22));ctx.fillStyle=g;ctx.fill();
  drawIcon(ctx,icon,x+s*.21,y+s*.21,s*.58,'#ffffff',2);
}
function whiteCards(ctx,cards,x0,y0,h,gap){
  const B=P.brand,R0=1070;
  cards.forEach((c,i)=>{
    const y=y0+i*(h+gap),bs=Math.min(h-14,98);
    ctx.save();ctx.shadowColor='rgba(20,45,22,.16)';ctx.shadowBlur=24;ctx.shadowOffsetY=6;rrect(ctx,x0+bs*.45,y,R0-x0-bs*.45,h,22);ctx.fillStyle='rgba(255,255,255,.9)';ctx.fill();ctx.restore();
    iconBox(ctx,x0,y+(h-bs)/2,bs,c.i);
    const tx=x0+bs+16;
    textBlock(ctx,{x:tx,cy:y+h/2,maxW:R0-tx-14},[{text:c.t,size:33,min:21,w:800,color:B.dark,lh:1.1,max:2},{text:c.s,size:21,min:16,w:500,color:'#46524a',lh:1.25,max:3}]);
  });
}
function darkCards(ctx,cards,x0,y0,h,gap){
  const B=P.brand,R0=1070;
  cards.forEach((c,i)=>{
    const y=y0+i*(h+gap),bs=h-24;
    ctx.save();ctx.shadowColor='rgba(0,0,0,.28)';ctx.shadowBlur=20;ctx.shadowOffsetY=6;rrect(ctx,x0,y,R0-x0,h,20);ctx.fillStyle='rgba(7,30,15,.88)';ctx.fill();ctx.restore();
    rrect(ctx,x0,y,R0-x0,h,20);ctx.lineWidth=2;ctx.strokeStyle=rgba(B.cA,.55);ctx.stroke();
    iconBox(ctx,x0+12,y+12,bs,c.i);
    const tx=x0+12+bs+16;
    textBlock(ctx,{x:tx,cy:y+h/2,maxW:R0-tx-14},[{text:c.t,size:31,min:20,w:800,color:'#ffffff',lh:1.1,max:2},{text:c.s,size:20,min:15,w:500,color:'rgba(225,242,228,.92)',lh:1.25,max:3}]);
  });
}
function iconBar(ctx,items,y,h,compact){
  if(!items.length)return;const B=P.brand,x=45,w=990,n=items.length,cw=w/n;
  ctx.save();ctx.shadowColor='rgba(20,45,22,.14)';ctx.shadowBlur=26;ctx.shadowOffsetY=6;rrect(ctx,x,y,w,h,26);ctx.fillStyle='rgba(255,255,255,.88)';ctx.fill();ctx.restore();
  const is=compact?44:56;
  items.forEach((it,i)=>{
    const cx=x+i*cw;
    if(i){ctx.fillStyle='rgba(0,0,0,.1)';ctx.fillRect(cx,y+22,1.5,h-44)}
    drawIcon(ctx,it.i,cx+20,y+(h-is)/2,is,B.cA,2.1);
    const tx=cx+20+is+14;
    textBlock(ctx,{x:tx,cy:y+h/2,maxW:cw-(tx-cx)-12},[{text:it.t,size:compact?22:25,min:16,w:700,color:B.dark,lh:1.12,max:2},{text:it.s,size:compact?18:20,min:14,w:500,color:'#4b5750',lh:1.22,max:3}]);
  });
}
function tilePlaceholder(ctx,x,y,w,h){
  const g=ctx.createLinearGradient(x,y,x,y+h);g.addColorStop(0,'#1d3324');g.addColorStop(1,'#0c1a11');ctx.fillStyle=g;ctx.fillRect(x,y,w,h);
  const s=Math.min(64,h*.35);drawIcon(ctx,'image',x+w/2-s/2,y+h/2-s/2,s,'rgba(255,255,255,.3)',1.6);
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
    textBlock(ctx,{x:x+w/2,cy:y+h*.6+(h*.4)/2,maxW:w-28,align:'center'},[{text:it.t,size:28,min:18,w:800,color:'#fff',lh:1.12,max:2},{text:it.s,size:20,min:14,w:500,color:'#cfe2d3',lh:1.22,max:2}]);
  }else{
    const big=w>600;
    textBlock(ctx,{x:x+26,bottom:y+h-24,maxW:w-52},[{text:it.t,size:big?46:34,min:20,w:800,color:'#fff',lh:1.08,max:2,up:true},{text:it.s,size:big?26:22,min:15,w:500,color:'rgba(255,255,255,.92)',lh:1.22,max:3}]);
  }
}
function tileRow(ctx,tiles,y,h,style){
  const n=tiles.length;if(!n)return;const gap=18,w=(1000-gap*(n-1))/n;
  tiles.forEach((t,i)=>photoTile(ctx,40+i*(w+gap),y,w,h,t,style));
}
function tileGrid(ctx,tiles,top,bottom){
  const n=tiles.length;if(!n)return;const g=18,x=40,w=1000,h=bottom-top;
  if(n===1)photoTile(ctx,x,top,w,h,tiles[0],'grad');
  else if(n===2){const hh=(h-g)/2;tiles.forEach((t,i)=>photoTile(ctx,x,top+i*(hh+g),w,hh,t,'grad'))}
  else if(n===3){const hh=(h-g)/2,ww=(w-g)/2;photoTile(ctx,x,top,w,hh,tiles[0],'grad');photoTile(ctx,x,top+hh+g,ww,hh,tiles[1],'grad');photoTile(ctx,x+ww+g,top+hh+g,ww,hh,tiles[2],'grad')}
  else{const hh=(h-g)/2,ww=(w-g)/2;tiles.slice(0,4).forEach((t,i)=>photoTile(ctx,x+(i%2)*(ww+g),top+Math.floor(i/2)*(hh+g),ww,hh,t,'grad'))}
}
function rowsBlock(ctx,rows,top,bottom){
  const B=P.brand,n=rows.length;if(!n)return;const gap=14,rh=(bottom-top-gap*(n-1))/n,k=Math.max(.72,Math.min(1.1,rh/200));
  const base='#0b1510';
  rows.forEach((r,i)=>{
    const y=top+i*(rh+gap),img=r.img&&IMG[r.img];
    ctx.save();rrect(ctx,40,y,1000,rh,24);ctx.clip();ctx.fillStyle=base;ctx.fillRect(40,y,1000,rh);
    if(img){cover(ctx,img,430,y,610,rh);const g=ctx.createLinearGradient(430,0,700,0);g.addColorStop(0,base);g.addColorStop(1,'rgba(11,21,16,0)');ctx.fillStyle=g;ctx.fillRect(430,y,270,rh)}
    else{const rg=ctx.createRadialGradient(900,y+rh/2,0,900,y+rh/2,420);rg.addColorStop(0,rgba(B.cA,.28));rg.addColorStop(1,rgba(B.cA,0));ctx.fillStyle=rg;ctx.fillRect(40,y,1000,rh)}
    ctx.restore();
    ctx.save();ctx.shadowColor=rgba(B.cA,.55);ctx.shadowBlur=16;rrect(ctx,40,y,1000,rh,24);ctx.lineWidth=3;ctx.strokeStyle=mix(B.cA,'#ffffff',.12);ctx.stroke();ctx.restore();
    // text
    let ty=y+20*k;
    ctx.textBaseline='alphabetic';
    const tsz=Math.round(42*k);ctx.font=`800 ${tsz}px Montserrat`;ctx.fillStyle='#fff';ty+=tsz*.85;ctx.fillText(fx(r.t||'').toUpperCase(),68,ty,600);
    if((r.s||'').trim()){const ss=Math.round(26*k);ctx.font=`500 ${ss}px Montserrat`;ctx.fillStyle='rgba(222,236,225,.95)';ty+=ss*1.35;ctx.fillText(fx(r.s),68,ty,600)}
    const chips=(r.chips||'').split(',').map(c=>c.trim()).filter(Boolean);const ch=Math.round(46*k);
    if(chips.length&&ty+14*k+ch<=y+rh-12){
      let cx=68;const cy=ty+16*k;ctx.font=`700 ${Math.round(21*k)}px Montserrat`;
      for(const c of chips){const t=fx(c),cw=ctx.measureText(t).width+28*k;if(cx+cw>(r.bt?760:1010))break;rrect(ctx,cx,cy,cw,ch,12*k);ctx.fillStyle='rgba(255,255,255,.09)';ctx.fill();ctx.lineWidth=1.5;ctx.strokeStyle='rgba(255,255,255,.24)';ctx.stroke();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(t,cx+cw/2,cy+ch/2);ctx.textAlign='left';ctx.textBaseline='alphabetic';cx+=cw+10*k}
    }
    if((r.bt||'').trim()){
      const bw=250,bh=Math.min(108,rh-28),bx=1040-22-bw,by=y+(rh-bh)/2;
      ctx.save();ctx.shadowColor='rgba(0,0,0,.4)';ctx.shadowBlur=14;rrect(ctx,bx,by,bw,bh,16);ctx.fillStyle='rgba(4,16,8,.92)';ctx.fill();ctx.restore();
      rrect(ctx,bx,by,bw,bh,16);ctx.lineWidth=2.5;ctx.strokeStyle=mix(B.cA,'#ffffff',.1);ctx.stroke();
      const is=Math.min(46,bh-30);drawIcon(ctx,r.bi,bx+16,by+(bh-is)/2,is,'#ffffff',2);
      textBlock(ctx,{x:bx+28+is,cy:by+bh/2,maxW:bw-is-42},[{text:r.bt,size:25,min:16,w:800,color:'#fff',lh:1.1,max:2},{text:r.bs,size:18,min:13,w:500,color:'#cfe0d2',lh:1.2,max:2}]);
    }
  });
}

function render(ctx,s,preview){
  ctx.clearRect(0,0,W,H);ctx.textAlign='left';ctx.textBaseline='alphabetic';
  const L=s.layout,B=P.brand;
  background(ctx,s,preview);
  const hb=header(ctx,s,L==='rows');
  if(L==='spec'){
    if((s.headline||'').trim()){ctx.fillStyle=B.cA;ctx.fillRect(100,hb-2,70,4);textBlock(ctx,{x:100,top:hb+26,maxW:560},[{text:s.headline,size:52,min:34,w:600,color:B.dark,lh:1.18,max:3}])}
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

