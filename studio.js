// Uzum Kartochka Studiyasi: model nomi + surat -> AI o'zi ma'lumot topadi, matn yozadi va rasmlarni chizadi.
// Har rasm tagida e'tiroz yozib, AI'ga tuzattirish mumkin.
'use strict';
const $ = s => document.querySelector(s);
const W = 1080, H = 1440;
const PASS_KEY = 'uzum-studio-pass';
const BRANDS = ['asus','lenovo','hp','acer','dell','apple','msi','huawei','samsung','xiaomi','honor','gigabyte','microsoft','infinix','tecno','chuwi'];
const BUILTIN_LOGO = { asus: '/logos/asus.png' };

const RULES = `MAQSAD: xaridor qidiruvda kartochkani bossin va 1–2 rasmdan keyin "Savatga" tugmasini bossin.

1-RASM (MUQOVA), eng muhimi, qidiruvda kichkina ko'rinadi:
- Mahsulot katta, kadrning 60–70% ini egallaydi (noutbuk bo'lsa ekran ochiq va yoniq).
- Model nomi + eng kuchli 3 ta foyda, yirik raqam bilan.
- Ko'pi bilan 4 ta qisqa yozuv. Mayda matn, uzun gap yo'q.

KEYINGI RASMLAR, har biri xaridorning bitta savoliga javob beradi:
- Kimga va nima uchun (ish, o'qish, ofis dasturlari: aniq vaziyatlar).
- Tezligi (protsessor + operativ xotira + SSD) foyda tilida.
- Ekrani: o'lcham, Full HD, IPS.
- Portlari: har bir port nomi va soni.
- Batareya, vazn va mustahkamlik.
- Oxirgi rasm: asosiy xususiyatlar qisqa ro'yxatda.

MATN:
- O'zbek tilida, lotin yozuvida, xatosiz. Sarlavha 2–4 so'z.
- Xaridor oddiy odam: sodda, kundalik o'zbek tilida, bozordagi sotuvchi tushuntirgandek.
- Avval FOYDA katta harf bilan, raqam uning tagida kichikroq, isbot sifatida:
  "Kun bo'yi zaryadsiz ishlaydi" / "42 Wh batareya"
  "Yengil, sumkada sezilmaydi" / "1,64 kg"
  "Tushib ketsa ham buzilmaydi" / "harbiy standart MIL-STD-810H"
  "Qotmaydi, tez ishlaydi" / "16 GB operativ xotira"
- Texnik ichki ma'lumot YO'Q: batareya yacheykalari (3S1P), kesh, yadro/oqim soni, GHz, chipset kodlari, "Gen 2" kabi versiyalar, TDP.
- Inglizcha so'z yo'q (Anti-glare, Power Delivery emas). Faqat port nomlari (USB-C, HDMI) va model nomi qolishi mumkin.
- "dan", "gacha" kabi noaniq so'zlar yo'q.
- Bir rasmda bitta asosiy fikr, ko'pi bilan 4 ta blok. Bir gap ikki rasmda takrorlanmasin.
- Raqamlar faqat topilgan rasmiy ma'lumotdan. Topilmagan narsani yozma.

ISHONCH:
- Narx, chegirma, "eng yaxshi", "№1", soxta nishon va sertifikat yo'q.

DIZAYN:
- Ranglar brendga mos (ASUS: ko'k-oq, Lenovo: qizil-qora, HP: ko'k-oq, Acer: yashil-qora, Apple: oq-kulrang).
- Hamma rasmlar bitta uslubda, bitta to'plamdek ko'rinsin.

UZUM NOMI:
Noutbuk + brend + seriya/model + protsessor + operativ xotira + SSD + ekran + rang.
Masalan: Noutbuk ASUS ExpertBook B1 B1503CVA Intel Core 5 120U DDR5 16GB SSD 512GB 15.6" FHD IPS, kulrang`;

// ---------- holat ----------
let S = blank();
function blank() { return { name: '', notes: '', count: 6, quality: 'high', photos: [], logo: null, logoAuto: false, facts: null, style: '', listing: null, cards: [] }; }
let ctrl = null, models = { image: [], chat: [] };

// ---------- yordamchilar ----------
function toast(t) { const el = $('#toast'); el.textContent = t; el.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => el.hidden = true, 3500); }
function status(t, err) { const el = $('#status'); el.textContent = t || ''; el.classList.toggle('err', !!err); }
function esc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function getPass() { try { return localStorage.getItem(PASS_KEY) || ''; } catch { return ''; } }
function setPass(v) { try { localStorage.setItem(PASS_KEY, v); } catch {} }
function uid() { return Math.random().toString(36).slice(2, 10); }
function brandOf(t) { const m = String(t || '').toLowerCase().match(new RegExp('(^|[^a-z])(' + BRANDS.join('|') + ')([^a-z]|$)')); return m ? m[2] : ''; }
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function api(body, signal) {
  let r;
  try { r = await fetch('/api/ai', { method: 'POST', headers: { 'content-type': 'application/json', 'x-studio-pass': getPass() }, body: JSON.stringify(body), signal }); }
  catch (e) { if (e.name === 'AbortError') throw e; throw new Error("Internet aloqasi uzildi, qayta urinib ko'ring"); }
  const j = await r.json().catch(() => ({}));
  if (r.status === 401) throw new Error("Studiya paroli noto'g'ri. Pastdagi parol maydonini tekshiring.");
  if (r.status === 413) throw new Error('Surat juda katta. Kichikroq surat yuklang.');
  if (r.status === 504) throw new Error("AI javobni kechiktirdi, qayta urinib ko'ring");
  if (!r.ok) throw new Error(j.error || `Xato (${r.status})`);
  return j;
}
function parseJSON(t) {
  const s = String(t || '');
  const a = s.indexOf('{'), b = s.lastIndexOf('}');
  if (a < 0 || b < a) throw new Error("AI javobi tushunarsiz bo'ldi, qayta urinib ko'ring");
  return JSON.parse(s.slice(a, b + 1));
}
async function chatJSON(prompt, images, signal) {
  let last;
  for (let i = 0; i < 2; i++) {
    const j = await api({ action: 'chat', model: $('#chatModel').value, prompt, images }, signal);
    try { return parseJSON(j.text); } catch (e) { last = e; }
  }
  throw last;
}
function loadImg(src) { return new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => no(new Error('Rasm ochilmadi')); i.src = src; }); }
function fileToDataURL(f) { return new Promise((ok, no) => { const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = no; r.readAsDataURL(f); }); }
async function shrink(src, max, type) {
  const im = await loadImg(src);
  const k = Math.min(1, max / Math.max(im.naturalWidth, im.naturalHeight));
  const c = document.createElement('canvas');
  c.width = Math.round(im.naturalWidth * k); c.height = Math.round(im.naturalHeight * k);
  const x = c.getContext('2d');
  if (type === 'image/jpeg') { x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); }
  x.drawImage(im, 0, 0, c.width, c.height);
  return c.toDataURL(type, 0.9);
}
// AI rasmi 2:3 (1024x1536) keladi; Uzum uchun 3:4 (1080x1440) ga markazdan kesamiz.
async function toUzum(src) {
  const im = await loadImg(src);
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const k = Math.max(W / im.naturalWidth, H / im.naturalHeight);
  const w = im.naturalWidth * k, h = im.naturalHeight * k;
  const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, W, H);
  x.drawImage(im, (W - w) / 2, (H - h) / 2, w, h);
  return c.toDataURL('image/jpeg', 0.92);
}

// ---------- saqlash (IndexedDB): pul to'langan rasmlar sahifa yangilansa ham yo'qolmasin ----------
const DB = { db: null };
function dbOpen() {
  if (DB.db) return Promise.resolve(DB.db);
  return new Promise((ok, no) => {
    let r; try { r = indexedDB.open('uzum-studio-2', 1); } catch (e) { return no(e); }
    r.onupgradeneeded = () => r.result.createObjectStore('kv');
    r.onsuccess = () => ok(DB.db = r.result); r.onerror = () => no(r.error);
  });
}
async function dbSet(k, v) { try { const db = await dbOpen(); await new Promise((ok, no) => { const t = db.transaction('kv', 'readwrite'); t.objectStore('kv').put(v, k); t.oncomplete = ok; t.onerror = () => no(t.error); }); } catch {} }
async function dbGet(k) { try { const db = await dbOpen(); return await new Promise((ok, no) => { const r = db.transaction('kv').objectStore('kv').get(k); r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error); }); } catch { return null; } }
let saveT;
function snapshot() { return JSON.parse(JSON.stringify(S, (k, v) => k === 'busy' ? undefined : v)); }
// Yozish paytida kechiktirib, rasm tayyor bo'lganda darhol saqlaymiz.
function save(now) { clearTimeout(saveT); if (now) dbSet('state', snapshot()); else saveT = setTimeout(() => dbSet('state', snapshot()), 300); }

// ---------- modellar ----------
function rankImage(id) {
  let s = 0; const m = id.match(/^(?:gpt|chatgpt)-image-(\d+(?:\.\d+)?)/);
  s += m ? parseFloat(m[1]) * 10 : 5;
  if (/mini|nano/.test(id)) s -= 100;
  if (/\d{4}-\d{2}-\d{2}/.test(id)) s -= 1;
  return s;
}
function rankChat(id) {
  let s = 0; const m = id.match(/^gpt-(\d+(?:\.\d+)?)/);
  s += m ? parseFloat(m[1]) * 10 : 0;
  if (/^o\d/.test(id)) s += 20;
  if (/mini/.test(id)) s -= 15;
  if (/nano/.test(id)) s -= 40;
  if (/chat-latest|chatgpt-/.test(id)) s -= 5;
  if (/pro/.test(id)) s -= 30; // juda qimmat
  if (/\d{4}-\d{2}-\d{2}|preview/.test(id)) s -= 2;
  return s;
}
function fillSelect(sel, ids, rank, keep) {
  const sorted = [...ids].sort((a, b) => rank(b) - rank(a));
  sel.innerHTML = sorted.map(id => `<option>${esc(id)}</option>`).join('');
  if (keep && sorted.includes(keep)) sel.value = keep;
}
async function loadModels() {
  if (!getPass()) return;
  try {
    models = await api({ action: 'models' });
    fillSelect($('#imgModel'), models.image, rankImage, localStorage.getItem('uzum-img-model'));
    fillSelect($('#chatModel'), models.chat, rankChat, localStorage.getItem('uzum-chat-model'));
    if (!models.image.length) status("OpenAI hisobida rasm modeli topilmadi", true);
  } catch (e) { status(e.message, true); }
}

// ---------- kirish maydonlari ----------
function renderInputs() {
  $('#photoThumbs').innerHTML = S.photos.map((p, i) => `<div class="thumb" style="background-image:url('${p}')"><button data-del="${i}" aria-label="O'chirish">×</button></div>`).join('');
  $('#logoThumb').innerHTML = S.logo ? `<div class="thumb" style="background-image:url('${S.logo}')"><button data-dellogo aria-label="O'chirish">×</button></div>` : '';
  const b = brandOf(S.name);
  $('#logoHint').textContent = S.logo ? (S.logoAuto ? "Studiyadagi asl logotip olindi" : '') :
    (b && BUILTIN_LOGO[b] ? "Asl logotip avtomatik qo'yiladi" : "Logotip bermasangiz, rasmda logotip bo'lmaydi (AI o'zi chizmasin deb)");
}
async function addPhotos(files) {
  for (const f of [...files].filter(f => f.type.startsWith('image/'))) {
    if (S.photos.length >= 3) { toast('Ko\'pi bilan 3 ta surat'); break; }
    S.photos.push(await shrink(await fileToDataURL(f), 1024, 'image/jpeg'));
  }
  renderInputs(); save();
}
async function setLogo(f) {
  if (!f || !f.type.startsWith('image/')) return;
  S.logo = await shrink(await fileToDataURL(f), 800, 'image/png'); S.logoAuto = false;
  renderInputs(); save();
}
async function ensureLogo() {
  if (S.logo) return;
  const b = brandOf(S.name);
  if (!BUILTIN_LOGO[b]) return;
  try {
    const blob = await (await fetch(BUILTIN_LOGO[b])).blob();
    S.logo = await shrink(await fileToDataURL(blob), 800, 'image/png'); S.logoAuto = true;
    renderInputs();
  } catch {}
}
function bindDrop(label, input, fn) {
  input.addEventListener('change', () => { fn(input.files); input.value = ''; });
  label.addEventListener('dragover', e => { e.preventDefault(); label.classList.add('over'); });
  label.addEventListener('dragleave', () => label.classList.remove('over'));
  label.addEventListener('drop', e => { e.preventDefault(); label.classList.remove('over'); fn(e.dataTransfer.files); });
}

// ---------- 1. ma'lumot topish ----------
function researchPrompt(name) {
  return `Find the official specifications of this product: "${name}".
Search the manufacturer's official website first, then large trusted stores. Use only facts you actually found for THIS exact model and configuration. If something is not found, leave it out. Never guess.
Return ONLY JSON:
{"model":"full official model name","category":"e.g. laptop","color":"official colour name in Uzbek",
 "specs":[{"uz":"name in simple Uzbek","ru":"name in Russian","v":"value with units"}],
 "sources":["https://..."]}
Include: processor, RAM (size and type), storage, screen (size, resolution, panel type, brightness, refresh rate), graphics, ports (each with count), wireless, battery (Wh), weight (kg), durability standard, operating system, camera, keyboard features, dimensions. Only what you found.`;
}
// ---------- 2. reja ----------
function planPrompt(n) {
  return `You are a top Uzum Market product card designer and seller. Plan a set of ${n} product card images for this product. The attached photo is the REAL product.
PRODUCT: ${S.name}
OFFICIAL FACTS (use only these numbers): ${JSON.stringify(S.facts || {})}
SELLER WISH: ${S.notes || '-'}
LOGO: ${S.logo ? 'a real brand logo image will be provided' : 'no logo available: do not plan any logo'}

RULES FROM THE SELLER (Uzbek, follow strictly):
${RULES}

Return ONLY JSON:
{"style":"English, 2-3 sentences: the common visual style for the whole set (background colours, gradient or scene, typography, icon style, accent colour)",
 "cards":[{"title":"short Uzbek name of the card","texts":["exact Uzbek text lines to print on the image; first line is the headline"],"layout":"English: where the product stands and at what angle, where each text goes, simple icons or arrows if useful, where the logo goes"}],
 "listing":{"titleUz":"Uzum name in Uzbek by the UZUM NOMI rule","titleRu":"same in Russian","shortUz":"1-2 sentence short description","shortRu":"...","descUz":"full description, plain Uzbek, benefits first, 5-8 short paragraphs or bullet lines","descRu":"...","specs":[{"uz":"","ru":"","v":""}]}}
Exactly ${n} cards. Card 1 is the cover. Keep texts short: at most 4 text blocks per card, a text block is a headline or a benefit line with its number. Double-check Uzbek spelling letter by letter (o', g', sh, ch).`;
}
// ---------- 3. rasm ----------
function refsFor(extraFirst) {
  const refs = [], names = [];
  if (extraFirst) { refs.push(extraFirst); names.push('the current card'); }
  S.photos.forEach((p, i) => { refs.push(p); names.push(S.photos.length > 1 ? `real product photo ${i + 1}` : 'the real product photo'); });
  if (S.logo) { refs.push(S.logo); names.push('the real brand logo'); }
  return { refs, legend: names.map((n, i) => `Image ${i + 1} = ${n}.`).join(' ') };
}
function rulesBlock() {
  return `PRODUCT: show exactly the product from the real product photo: same shape, colour, keyboard, ports, screen bezels, hinge, proportions and details. Do not invent a different device, do not add or remove parts. You may change only camera angle, scene and lighting. If the screen is visible, show a clean bright wallpaper with no text and no fake brand logo.
${S.logo ? 'LOGO: copy the brand logo exactly from the real brand logo image (same letterforms and proportions, only recoloured to fit the background if needed). Never type the brand name as plain text instead of the logo. No other logos or brands anywhere.' : 'LOGO: do not draw any brand logo or brand wordmark.'}
TEXT: render only the listed texts, letter by letter exactly as written, in Uzbek Latin script. No other words, no English, no placeholder text. Headline large and bold, other lines smaller. Clean bold sans-serif font, strong contrast, easy to read on a phone.
FORMAT: vertical marketplace product card. Keep the product, the logo and every text inside the central area: leave the top 7% and the bottom 7% free of text and important details, they will be cropped.
FORBIDDEN: prices, discounts, "best", "№1", badges, certificates, watermarks, people, hands, other devices, QR codes.`;
}
function cardPrompt(c) {
  const { legend } = refsFor();
  return `Create one product card image for Uzum Market (a marketplace in Uzbekistan). This is card ${S.cards.indexOf(c) + 1} of ${S.cards.length} in one matching set.
${legend}
SET STYLE: ${S.style}
THIS CARD LAYOUT: ${c.layout}
TEXTS TO PRINT:
${c.texts.map((t, i) => `${i + 1}. "${t}"`).join('\n')}
${rulesBlock()}`;
}
function fixPrompt(c, instruction) {
  const { legend } = refsFor('x');
  return `Edit the current product card (image 1). Make ONLY this change: ${instruction}
Keep everything else as it is: layout, style, colours, product, logo position.
${legend}
The card must contain exactly these texts and no others:
${c.texts.map((t, i) => `${i + 1}. "${t}"`).join('\n')}
${rulesBlock()}`;
}
async function drawImage(prompt, refs, signal) {
  const j = await api({ action: 'image', model: $('#imgModel').value, prompt, refs, size: '1024x1536', quality: $('#quality').value, format: 'jpeg', fidelity: true }, signal);
  return j.dataUrl;
}
async function runCard(c, mode, signal) {
  c.busy = mode === 'fix' ? 'AI tuzatyapti…' : 'AI chizyapti…'; c.err = ''; renderCards();
  try {
    let raw;
    if (mode === 'fix') {
      const cur = c.versions[c.cur];
      const plan = await chatJSON(`A seller in Uzbekistan wrote feedback (in Uzbek) about one product card image (attached). Turn it into a precise edit for an image model.
Current texts on the card: ${JSON.stringify(c.texts)}
Seller feedback: "${c.fb}"
Seller text rules: plain everyday Uzbek Latin, no technical jargon, no English words, correct spelling.
Official facts: ${JSON.stringify(S.facts || {})}
Return ONLY JSON: {"instruction":"English, precise and concrete edit instruction","texts":["the full final list of texts on the card after the change, exact Uzbek"]}`, [cur.raw], signal);
      if (Array.isArray(plan.texts) && plan.texts.length) c.texts = plan.texts.map(String);
      const { refs } = refsFor(await shrink(cur.raw, 1536, 'image/jpeg'));
      raw = await drawImage(fixPrompt(c, plan.instruction || c.fb), refs, signal);
    } else {
      raw = await drawImage(cardPrompt(c), refsFor().refs, signal);
    }
    const img = await toUzum(raw);
    c.versions.push({ raw, img, note: mode === 'fix' ? c.fb : '' });
    c.cur = c.versions.length - 1;
    if (mode === 'fix') c.fb = '';
  } catch (e) {
    if (e.name !== 'AbortError') c.err = e.message;
  } finally { c.busy = ''; renderCards(); save(true); }
}
async function pool(items, n, fn) {
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => { while (i < items.length) await fn(items[i++]); }));
}

// ---------- asosiy oqim ----------
async function start() {
  S.name = $('#name').value.trim(); S.notes = $('#notes').value.trim();
  S.count = +$('#count').value; S.quality = $('#quality').value;
  setPass($('#pass').value.trim());
  if (!S.name) return status('Mahsulot modelini yozing', true);
  if (!S.photos.length) return status('Mahsulot suratini yuklang', true);
  if (!getPass()) return status('Studiya parolini yozing', true);
  if (!$('#imgModel').value) await loadModels();
  if (!$('#imgModel').value) return;
  if (S.cards.some(c => c.versions.length) && !confirm("Oldingi rasmlar o'rniga yangilari chiziladi. Davom etamizmi?")) return;
  await ensureLogo();
  ctrl = new AbortController(); const sig = ctrl.signal;
  busyUI(true);
  try {
    status("1/3. Internetdan rasmiy ma'lumot qidiryapman…");
    try { S.facts = parseJSON((await api({ action: 'research', model: $('#chatModel').value, prompt: researchPrompt(S.name) }, sig)).text); }
    catch (e) { if (e.name === 'AbortError') throw e; S.facts = null; toast("Ma'lumot topilmadi, faqat model nomi bo'yicha davom etaman"); }
    renderFacts();
    status('2/3. Rasmlar rejasi va matnlarni yozyapman…');
    const plan = await chatJSON(planPrompt(S.count), [S.photos[0]], sig);
    S.style = String(plan.style || '');
    S.listing = plan.listing || null;
    S.cards = (plan.cards || []).slice(0, S.count).map(c => ({ id: uid(), title: String(c.title || ''), texts: (c.texts || []).map(String), layout: String(c.layout || ''), versions: [], cur: -1, fb: '', err: '', busy: '' }));
    if (!S.cards.length) throw new Error("AI reja tuza olmadi, qayta urinib ko'ring");
    renderListing(); renderCards(); save(true);
    status(`3/3. ${S.cards.length} ta rasm chizilyapti. Har biri 1–2 daqiqa oladi, tayyor bo'lgani darrov chiqadi.`);
    await pool(S.cards, 3, c => runCard(c, 'new', sig));
    const bad = S.cards.filter(c => c.err).length;
    status(bad ? `${bad} ta rasm chizilmadi. O'sha rasm tagidagi "Qayta chizish" tugmasini bosing.` : "Tayyor. Yoqmagan rasm tagiga e'tirozingizni yozib, \"Tuzatish\"ni bosing.", !!bad);
  } catch (e) {
    status(e.name === 'AbortError' ? "To'xtatildi" : e.message, e.name !== 'AbortError');
  } finally { busyUI(false); ctrl = null; save(); }
}
function busyUI(on) { $('#go').disabled = on; $('#stop').hidden = !on; $('#reset').disabled = on; }

// ---------- chiqarish ----------
function renderCards() {
  $('#cardsBox').hidden = !S.cards.length;
  const box = $('#cards');
  // Foydalanuvchi yozayotgan e'tirozni yo'qotmaslik uchun fokusni saqlaymiz.
  const act = document.activeElement, actId = act && act.dataset && act.dataset.fb, pos = act && act.selectionStart;
  box.innerHTML = S.cards.map((c, i) => {
    const v = c.versions[c.cur];
    return `<article class="c" data-id="${c.id}">
      <div class="pic" style="${v ? `background-image:url('${v.img}')` : ''}">${c.busy ? `<div class="wait"><div class="spin"></div>${esc(c.busy)}</div>` : (!v && !c.err ? `<div class="wait">Navbatda…</div>` : '')}</div>
      <div class="body">
        <div class="ttl"><span>${i + 1}. ${esc(c.title)}</span>${c.versions.length > 1 ? `<span class="ver"><button data-prev aria-label="Oldingi">‹</button>${c.cur + 1}/${c.versions.length}<button data-next aria-label="Keyingi">›</button></span>` : ''}</div>
        <ul class="texts">${c.texts.map(t => `<li>${esc(t)}</li>`).join('')}</ul>
        ${c.err ? `<div class="err">${esc(c.err)}</div>` : ''}
        <textarea rows="2" data-fb="${c.id}" placeholder="E'tiroz: masalan, logotip kichik, yozuvni kattaroq qil, fon to'q ko'k bo'lsin" ${c.busy ? 'disabled' : ''}>${esc(c.fb)}</textarea>
        <div class="row">
          <button class="btn sm primary" data-fix ${c.busy || !v ? 'disabled' : ''}>Tuzatish</button>
          <button class="btn sm" data-redo ${c.busy ? 'disabled' : ''}>Qayta chizish</button>
          <button class="btn sm ghost" data-dl ${v ? '' : 'disabled'}>Yuklab olish</button>
        </div>
      </div></article>`;
  }).join('');
  if (actId) { const t = box.querySelector(`[data-fb="${actId}"]`); if (t && !t.disabled) { t.focus(); try { t.setSelectionRange(pos, pos); } catch {} } }
}
function renderListing() {
  const L = S.listing; $('#listingBox').hidden = !L; if (!L) return;
  const item = (h, t) => t ? `<div class="it"><div class="h">${esc(h)}<button class="btn sm" data-copy>Nusxalash</button></div><pre>${esc(t)}</pre></div>` : '';
  const specs = Array.isArray(L.specs) && L.specs.length ? `<div class="it"><div class="h">Xususiyatlar</div><table><tr><th>O'zbekcha</th><th>Ruscha</th><th>Qiymat</th></tr>${L.specs.map(s => `<tr><td>${esc(s.uz)}</td><td>${esc(s.ru)}</td><td>${esc(s.v)}</td></tr>`).join('')}</table></div>` : '';
  $('#listing').innerHTML = `<div class="lst">${item('Nomi (UZ)', L.titleUz)}${item('Nomi (RU)', L.titleRu)}${item('Qisqa tavsif (UZ)', L.shortUz)}${item('Qisqa tavsif (RU)', L.shortRu)}${item("To'liq tavsif (UZ)", L.descUz)}${item("To'liq tavsif (RU)", L.descRu)}${specs}</div>`;
}
function renderFacts() {
  const F = S.facts; $('#factsBox').hidden = !F; if (!F) return;
  const rows = (F.specs || []).map(s => `<tr><td>${esc(s.uz)}</td><td>${esc(s.v)}</td></tr>`).join('');
  const src = (F.sources || []).filter(u => /^https?:\/\//.test(u)).map(u => `<li><a href="${esc(u)}" target="_blank" rel="noopener">${esc(u)}</a></li>`).join('');
  $('#facts').innerHTML = `<p><b>${esc(F.model || S.name)}</b></p><table>${rows}</table>${src ? `<p>Manbalar:</p><ul>${src}</ul>` : ''}`;
}
function fileName(i) { return `${String(i + 1).padStart(2, '0')}-${(S.name || 'kartochka').replace(/[^a-z0-9]+/gi, '-').slice(0, 40)}.jpg`; }
function download(url, name) { const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); }
async function zipAll() {
  if (typeof JSZip === 'undefined') return toast('ZIP kutubxonasi yuklanmadi');
  const z = new JSZip(); let n = 0;
  S.cards.forEach((c, i) => { const v = c.versions[c.cur]; if (v) { z.file(fileName(i), v.img.split(',')[1], { base64: true }); n++; } });
  if (!n) return toast('Hali tayyor rasm yo\'q');
  if (S.listing) { const L = S.listing; z.file('tavsif.txt', [L.titleUz, L.titleRu, '', L.shortUz, L.shortRu, '', L.descUz, '', L.descRu].filter(x => x != null).join('\n')); }
  download(URL.createObjectURL(await z.generateAsync({ type: 'blob' })), 'uzum-kartochka.zip');
}

// ---------- hodisalar ----------
function bind() {
  bindDrop($('#photoDrop'), $('#photos'), addPhotos);
  bindDrop($('#logoDrop'), $('#logo'), fs => setLogo(fs[0]));
  $('#photoThumbs').addEventListener('click', e => { const i = e.target.dataset.del; if (i != null) { S.photos.splice(+i, 1); renderInputs(); save(); } });
  $('#logoThumb').addEventListener('click', e => { if ('dellogo' in e.target.dataset) { S.logo = null; S.logoAuto = false; renderInputs(); save(); } });
  $('#name').addEventListener('input', () => { S.name = $('#name').value.trim(); if (S.logoAuto) { S.logo = null; S.logoAuto = false; } renderInputs(); save(); });
  $('#notes').addEventListener('input', () => { S.notes = $('#notes').value; save(); });
  $('#count').addEventListener('change', () => { S.count = +$('#count').value; save(); });
  $('#quality').addEventListener('change', () => { S.quality = $('#quality').value; save(); });
  $('#pass').addEventListener('change', () => { setPass($('#pass').value.trim()); status(''); loadModels(); });
  $('#imgModel').addEventListener('change', e => { try { localStorage.setItem('uzum-img-model', e.target.value); } catch {} });
  $('#chatModel').addEventListener('change', e => { try { localStorage.setItem('uzum-chat-model', e.target.value); } catch {} });
  $('#go').addEventListener('click', start);
  $('#stop').addEventListener('click', () => ctrl && ctrl.abort());
  $('#reset').addEventListener('click', () => {
    if (S.cards.length && !confirm("Joriy rasmlar o'chadi. Avval kerakligini yuklab oling. Davom etamizmi?")) return;
    S = blank(); S.quality = $('#quality').value; $('#name').value = ''; $('#notes').value = '';
    renderInputs(); renderCards(); renderListing(); renderFacts(); status(''); save();
  });
  $('#zip').addEventListener('click', zipAll);
  $('#cards').addEventListener('input', e => { const id = e.target.dataset.fb; if (id) { const c = S.cards.find(c => c.id === id); if (c) { c.fb = e.target.value; save(); } } });
  $('#cards').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const el = b.closest('.c'); const c = S.cards.find(x => x.id === el.dataset.id); if (!c) return;
    const i = S.cards.indexOf(c);
    if ('prev' in b.dataset && c.cur > 0) { c.cur--; renderCards(); save(true); }
    else if ('next' in b.dataset && c.cur < c.versions.length - 1) { c.cur++; renderCards(); save(true); }
    else if ('dl' in b.dataset) { const v = c.versions[c.cur]; if (v) download(v.img, fileName(i)); }
    else if ('fix' in b.dataset) {
      if (!c.fb.trim()) { toast("Avval nimani o'zgartirish kerakligini yozing"); el.querySelector('textarea').focus(); return; }
      runCard(c, 'fix');
    } else if ('redo' in b.dataset) {
      if (c.fb.trim()) c.layout += `\nSeller wish (Uzbek): ${c.fb.trim()}`;
      c.fb = ''; runCard(c, 'new');
    }
  });
  $('#listing').addEventListener('click', async e => {
    if (!('copy' in e.target.dataset)) return;
    const t = e.target.closest('.it').querySelector('pre').textContent;
    try { await navigator.clipboard.writeText(t); toast('Nusxalandi'); } catch { toast('Nusxalab bo\'lmadi'); }
  });
}

(async function init() {
  bind();
  $('#pass').value = getPass();
  const saved = await dbGet('state');
  if (saved && typeof saved === 'object') {
    S = Object.assign(blank(), saved);
    S.cards.forEach(c => { c.busy = ''; });
    $('#name').value = S.name; $('#notes').value = S.notes; $('#count').value = String(S.count); $('#quality').value = S.quality;
  }
  renderInputs(); renderCards(); renderListing(); renderFacts();
  loadModels();
})();
