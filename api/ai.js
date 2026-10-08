// Uzum Kartochka Studiyasi — OpenAI proxy.
// OPENAI_API_KEY and STUDIO_PASS live only in Vercel environment variables.
const OA = 'https://api.openai.com/v1/';
const IMG_RE = /^(gpt-image|chatgpt-image)/;
const CHAT_RE = /^(gpt-|o\d|chatgpt-)/;
const CHAT_BAD = /(image|audio|realtime|tts|transcribe|search|embedding|moderation|instruct|codex)/;
const SIZES = new Set(['1024x1024', '1024x1536', '1536x1024', 'auto']);
const QUALITY = new Set(['low', 'medium', 'high', 'auto']);

function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') { try { return JSON.parse(req.body); } catch { return {}; } }
  return {};
}
function errMsg(j, status) {
  return (j && j.error && (j.error.message || j.error)) || `OpenAI xatosi (${status})`;
}
function fail(status, error) { const e = new Error(error); e.status = status; return e; }
async function oa(path, H, payload) {
  const r = await fetch(OA + path, payload ? { method: 'POST', headers: H, body: JSON.stringify(payload) } : { headers: H });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw fail(r.status, errMsg(j, r.status));
  return j;
}
function outputText(j) {
  if (typeof j.output_text === 'string' && j.output_text) return j.output_text;
  const parts = [];
  for (const item of j.output || []) {
    if (item.type === 'message') for (const c of item.content || []) if (c.type === 'output_text' && c.text) parts.push(c.text);
  }
  return parts.join('\n');
}
// ---- Quyidagi qism qayta tiklangan: Vercel MCP fayl matnini 2000 belgidan keyin kesib qo'yadi.
// Frontend (app4.js, app6.js) kutgan javob formatlariga mos yozildi.
function dataUrlToBlob(u) {
  const m = /^data:([^;,]+);base64,(.+)$/.exec(String(u || ''));
  if (!m) throw fail(400, "Rasm formati noto'g'ri");
  return new Blob([Buffer.from(m[2], 'base64')], { type: m[1] });
}
function userContent(prompt, images) {
  const content = [{ type: 'input_text', text: String(prompt || '') }];
  for (const u of (Array.isArray(images) ? images : []).slice(0, 8)) {
    if (typeof u === 'string' && u.startsWith('data:image/')) content.push({ type: 'input_image', image_url: u });
  }
  return [{ role: 'user', content }];
}
function checkModel(model, re, bad) {
  const m = String(model || '');
  if (!re.test(m) || (bad && bad.test(m))) throw fail(400, `Model mos emas: ${m || '(bo\'sh)'}`);
  return m;
}

async function listModels(H) {
  const j = await oa('models', H);
  const ids = (j.data || []).map(x => x.id).sort();
  return {
    image: ids.filter(id => IMG_RE.test(id)),
    chat: ids.filter(id => CHAT_RE.test(id) && !CHAT_BAD.test(id)),
  };
}

async function chat(H, b) {
  const model = checkModel(b.model, CHAT_RE, CHAT_BAD);
  const j = await oa('responses', H, { model, input: userContent(b.prompt, b.images) });
  return { text: outputText(j) };
}

async function research(H, b) {
  const model = checkModel(b.model, CHAT_RE, CHAT_BAD);
  const j = await oa('responses', H, {
    model,
    tools: [{ type: 'web_search' }],
    input: String(b.prompt || ''),
  });
  return { text: outputText(j) };
}

async function image(H, b) {
  const model = checkModel(b.model, IMG_RE);
  const size = SIZES.has(b.size) ? b.size : 'auto';
  const quality = QUALITY.has(b.quality) ? b.quality : 'auto';
  const prompt = String(b.prompt || '').slice(0, 30000);
  const refs = (Array.isArray(b.refs) ? b.refs : []).filter(Boolean).slice(0, 4);
  let j;
  if (refs.length) {
    const fd = new FormData();
    fd.append('model', model);
    fd.append('prompt', prompt);
    fd.append('size', size);
    fd.append('quality', quality);
    refs.forEach((u, i) => {
      const blob = dataUrlToBlob(u);
      fd.append('image[]', blob, `ref${i}.${(blob.type.split('/')[1] || 'png')}`);
    });
    const r = await fetch(OA + 'images/edits', { method: 'POST', headers: { Authorization: H.Authorization }, body: fd });
    j = await r.json().catch(() => ({}));
    if (!r.ok) throw fail(r.status, errMsg(j, r.status));
  } else {
    j = await oa('images/generations', H, { model, prompt, size, quality, n: 1 });
  }
  const b64 = j.data && j.data[0] && j.data[0].b64_json;
  if (!b64) throw fail(502, 'OpenAI rasm qaytarmadi');
  return { dataUrl: 'data:image/png;base64,' + b64 };
}

const MAX_IMG = 8 * 1024 * 1024;
async function fetchImg(b) {
  let url;
  try { url = new URL(String(b.url || '')); } catch { throw fail(400, "URL noto'g'ri"); }
  if (url.protocol !== 'https:') throw fail(400, 'Faqat https havolalar');
  if (/^(localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|\[)/i.test(url.hostname)) throw fail(400, 'Ichki manzil taqiqlangan');
  const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36', Accept: 'image/*' }, redirect: 'follow' });
  if (!r.ok) throw fail(502, `Rasm yuklanmadi (${r.status})`);
  const type = (r.headers.get('content-type') || '').split(';')[0].trim();
  if (!/^image\/(jpeg|png|webp|gif|avif|svg\+xml)$/.test(type)) throw fail(415, 'Bu rasm emas');
  const buf = Buffer.from(await r.arrayBuffer());
  if (buf.length > MAX_IMG) throw fail(413, 'Rasm juda katta');
  return { dataUrl: `data:${type};base64,${buf.toString('base64')}` };
}

function passOk(req) {
  const want = process.env.STUDIO_PASS || '';
  const got = String(req.headers['x-studio-pass'] || '');
  if (!want || got.length !== want.length) return false;
  let d = 0;
  for (let i = 0; i < want.length; i++) d |= want.charCodeAt(i) ^ got.charCodeAt(i);
  return d === 0;
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST kerak' });
  const b = readBody(req);
  const key = process.env.OPENAI_API_KEY || '';
  const ok = passOk(req);
  if (b.action === 'ping') {
    return res.status(200).json({ ok: true, hasKey: !!key, hasPass: !!process.env.STUDIO_PASS, passOk: ok });
  }
  if (!key) return res.status(500).json({ error: "Vercel'da OPENAI_API_KEY qo'shilmagan" });
  if (!ok) return res.status(401).json({ error: "Parol noto'g'ri" });
  const H = { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
  try {
    switch (b.action) {
      case 'models': return res.status(200).json(await listModels(H));
      case 'chat': return res.status(200).json(await chat(H, b));
      case 'research': return res.status(200).json(await research(H, b));
      case 'image': return res.status(200).json(await image(H, b));
      case 'fetchimg': return res.status(200).json(await fetchImg(b));
      default: return res.status(400).json({ error: "Noma'lum amal" });
    }
  } catch (e) {
    return res.status(e.status || 500).json({ error: e.message || 'Server xatosi' });
  }
};
