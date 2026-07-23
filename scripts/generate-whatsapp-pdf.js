/*
 * Zero-dependency PDF generator for META_WHATSAPP_SETUP.pdf.
 * Renders a multi-page A4 guide with Helvetica base-14 fonts (accurate width
 * tables → proper word wrapping), headings, bullets, code blocks and a table.
 * Run: node scripts/generate-whatsapp-pdf.js
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Helvetica / Helvetica-Bold advance widths (1/1000 em) for ASCII 32..126.
const W_REG = [278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584];
const W_BOLD = [278,333,474,556,556,889,722,238,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,333,333,584,584,584,611,975,722,722,722,722,667,611,778,722,278,556,722,611,833,722,778,667,778,722,667,611,722,667,944,667,667,611,333,278,333,584,556,333,556,611,556,611,556,333,611,611,278,278,556,278,889,611,611,611,611,389,556,333,611,556,778,556,556,500,389,280,389,584];

// Map common non-Latin-1 chars to plain equivalents (base fonts can't draw them).
function sanitize(s) {
  return String(s)
    .replace(/[₹]/g, 'Rs.')
    .replace(/[—–]/g, '-')
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/→/g, '->')
    .replace(/[·•]/g, '-')
    .replace(/[^\x20-\x7E]/g, ''); // drop anything else (emoji, etc.)
}

function charWidth(ch, bold, size) {
  const code = ch.charCodeAt(0);
  const table = bold ? W_BOLD : W_REG;
  const w = code >= 32 && code <= 126 ? table[code - 32] : 556;
  return (w / 1000) * size;
}
function textWidth(str, bold, size) {
  let w = 0;
  for (const ch of str) w += charWidth(ch, bold, size);
  return w;
}
function wrap(str, bold, size, maxWidth) {
  const words = sanitize(str).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const word of words) {
    const trial = line ? line + ' ' + word : word;
    if (textWidth(trial, bold, size) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = trial;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [''];
}
function esc(s) {
  return sanitize(s).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

// ── Page model ──────────────────────────────────────────────────────────────
const PAGE_W = 595.28, PAGE_H = 841.89;
const ML = 50, MR = 50, MT = 800, MB = 55;
const USABLE = PAGE_W - ML - MR;

const pages = [];
let ops = [];   // content operators for current page
let y = MT;

function newPage() { if (ops.length) pages.push(ops); ops = []; y = MT; }
function ensure(h) { if (y - h < MB) newPage(); }
function rgb(r, g, b) { ops.push(`${r} ${g} ${b} rg`); }
function rect(x, yy, w, h, r, g, b) { ops.push(`${r} ${g} ${b} rg`, `${x.toFixed(2)} ${yy.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re f`, `0 0 0 rg`); }

function line(text, { font = 'F1', size = 10.5, bold = false, gap = 3, color = [0, 0, 0], indent = 0 } = {}) {
  ensure(size + gap);
  y -= size;
  rgb(color[0], color[1], color[2]);
  ops.push('BT', `/${font} ${size} Tf`, `${(ML + indent).toFixed(2)} ${y.toFixed(2)} Td`, `(${esc(text)}) Tj`, 'ET');
  rgb(0, 0, 0);
  y -= gap;
}

function para(text, opts = {}) {
  const size = opts.size || 10.5;
  const bold = !!opts.bold;
  const font = bold ? 'F2' : 'F1';
  const indent = opts.indent || 0;
  const lines = wrap(text, bold, size, USABLE - indent);
  for (const ln of lines) line(ln, { font, size, bold, gap: 2.5, color: opts.color || [0, 0, 0], indent });
  y -= 3;
}

function bullet(text, opts = {}) {
  const size = opts.size || 10.5;
  const marker = opts.marker || '-';
  const lines = wrap(text, false, size, USABLE - 16);
  ensure(size + 3);
  y -= size;
  ops.push('BT', `/F1 ${size} Tf`, `${(ML + 4).toFixed(2)} ${y.toFixed(2)} Td`, `(${esc(marker)}) Tj`, 'ET');
  ops.push('BT', `/F1 ${size} Tf`, `${(ML + 16).toFixed(2)} ${y.toFixed(2)} Td`, `(${esc(lines[0])}) Tj`, 'ET');
  y -= 2.5;
  for (let i = 1; i < lines.length; i++) line(lines[i], { size, gap: 2.5, indent: 16 });
  y -= 1;
}

function h1(text) {
  y -= 8; ensure(20);
  rect(ML - 6, y - 15, USABLE + 12, 20, 0.09, 0.42, 0.29); // green band
  y -= 14;
  ops.push('1 1 1 rg', 'BT', `/F2 13 Tf`, `${ML.toFixed(2)} ${y.toFixed(2)} Td`, `(${esc(text)}) Tj`, 'ET', '0 0 0 rg');
  y -= 10;
}
function h2(text) {
  y -= 6; line(text, { font: 'F2', size: 11.5, bold: true, gap: 4, color: [0.09, 0.42, 0.29] });
}

function code(lines) {
  const size = 9;
  const lh = size + 3;
  const h = lines.length * lh + 8;
  ensure(h);
  rect(ML - 4, y - h + 4, USABLE + 8, h, 0.95, 0.96, 0.95);
  y -= 4;
  for (const ln of lines) {
    y -= size;
    ops.push('0.15 0.15 0.15 rg', 'BT', `/F3 ${size} Tf`, `${ML.toFixed(2)} ${y.toFixed(2)} Td`, `(${esc(ln)}) Tj`, 'ET', '0 0 0 rg');
    y -= 3;
  }
  y -= 6;
}

function spacer(h = 4) { y -= h; }

// Simple fixed-column table (single-line cells).
function table(headers, rows, widths) {
  const size = 9.5, pad = 4, rowH = 16;
  const totalW = widths.reduce((a, b) => a + b, 0);
  function row(cells, bold, bg) {
    ensure(rowH);
    if (bg) rect(ML, y - rowH + 4, totalW, rowH, bg[0], bg[1], bg[2]);
    y -= rowH - 5;
    let x = ML + pad;
    const fnt = bold ? 'F2' : 'F1';
    for (let i = 0; i < cells.length; i++) {
      const txt = wrap(cells[i], bold, size, widths[i] - pad * 2)[0];
      ops.push('BT', `/${fnt} ${size} Tf`, `${x.toFixed(2)} ${y.toFixed(2)} Td`, `(${esc(txt)}) Tj`, 'ET');
      x += widths[i];
    }
    y -= 5;
    // bottom rule
    ops.push('0.8 0.8 0.8 RG', `${ML} ${y.toFixed(2)} m ${(ML + totalW).toFixed(2)} ${y.toFixed(2)} l S`, '0 0 0 RG');
  }
  row(headers, true, [0.90, 0.94, 0.91]);
  rows.forEach((r) => row(r, false, null));
  y -= 6;
}

// ── Content ─────────────────────────────────────────────────────────────────
rect(ML - 6, y - 30, USABLE + 12, 42, 0.09, 0.42, 0.29);
y -= 22;
ops.push('1 1 1 rg', 'BT', `/F2 18 Tf`, `${ML.toFixed(2)} ${y.toFixed(2)} Td`, `(Ezyloan - Meta WhatsApp Cloud API Setup) Tj`, 'ET', '0 0 0 rg');
y -= 20;
para('Official, direct WhatsApp integration (no Twilio middleman = cheaper). Code side is fully ready - you only add 6 keys to .env.local and restart. Then: form submit sends a WhatsApp message, and user replies get an auto-reply from the same Ezy AI brain as the website.', { size: 10 });

h1('Meta Cloud API vs Twilio');
para('The app supports both. As soon as the META_WHATSAPP_* keys are in .env.local, the app auto-uses Meta (Twilio becomes fallback). You can force it with WHATSAPP_PROVIDER=meta or =twilio.', {});
bullet('Meta Cloud API: Meta hosts it free; you pay ONLY Meta per-message rate (no markup). Needs a Meta Business + Developer app.');
bullet('Twilio (old): faster to start but adds Twilio markup (~$0.005/msg) on top of Meta fees.');

h1('Prerequisites (what you need)');
bullet('A Facebook/Meta account (personal) - it creates your Business Manager.');
bullet('A phone number NOT active on any WhatsApp / WhatsApp Business app (delete that account first, e.g. for +91 97772 28844).');
bullet('Business documents (GST / company registration / bank statement / utility bill) for verification.');

h1('Phase 1 - Create a Meta Business Account');
bullet('Go to business.facebook.com -> Create account.');
bullet('Business name "Ezyloan", your name, business email.');
bullet('Business Settings -> Business Info: fill in the details.');

h1('Phase 2 - Create a Developer App + add WhatsApp');
para('1. developers.facebook.com -> My Apps -> Create App.', {});
para('2. Use case Other -> type Business -> name it (e.g. "Ezyloan WhatsApp") and pick your Business Account.', {});
para('3. On the app dashboard find the "WhatsApp" product -> Set up.', {});
para('4. You will now see: a Meta-provided test number + your WhatsApp Business Account (WABA), the Phone number ID and WhatsApp Business Account ID (note these), and a temporary 24h access token for testing.', {});

h1('Phase 3 - Add your number (+91 97772 28844)');
bullet('WhatsApp -> API Setup -> Add phone number.');
bullet('Display name "Ezyloan", category, business details.');
bullet('Enter +91 97772 28844 -> verify via OTP (SMS/call). The number must NOT be active on any WhatsApp app.');
bullet('After verifying you get a new Phone number ID - that goes in the env.');

h1('Phase 4 - Business Verification (needed for live sending)');
bullet('Business Settings -> Security Center (Business Verification).');
bullet('Upload documents: business registration / GST / utility bill / bank statement (name + address must match).');
bullet('Review usually takes a few hours to 2-5 days. After it, messaging limits grow (1K -> 10K -> unlimited/day).');

h1('Phase 5 - Create a PERMANENT access token (System User)');
para('The temporary token expires in 24h. For live use create a permanent one:', {});
bullet('Business Settings -> Users -> System Users -> Add -> name "ezyloan-system", role Admin.');
bullet('On that system user: Add Assets -> Apps -> select your app -> Full control.');
bullet('Generate new token -> select the app -> tick permissions: whatsapp_business_messaging AND whatsapp_business_management.');
bullet('Set expiry Never -> Generate. Copy the long token (shown once). This is META_WHATSAPP_TOKEN.');

h1('Phase 6 - Create & approve a Message Template');
para('A form-submit message is business-initiated, so it cannot be free text - it needs an approved template. (Auto-replies do not need a template; they go as free text inside the 24h window.)', {});
bullet('WhatsApp Manager -> Account tools -> Message templates -> Create template.');
bullet('Category Utility (or Marketing). Language English (en). Name: lead_confirmation.');
para('Body uses {{1}} for the first name:', {});
code([
  'Hello {{1}}! Thank you for reaching out to Ezyloan. Our team',
  'will contact you shortly. Ezyloan is a loan facilitator (not a',
  'lender) and works with multiple Banks/NBFCs. Call',
  '+91 6372977626 or visit www.ezyloan.co.in',
]);
bullet('Submit -> approval takes minutes to a few hours. The template NAME (lead_confirmation) and LANGUAGE (en) go in the env.');

h1('Phase 7 - Configure the webhook (for auto-reply)');
bullet('App dashboard -> WhatsApp -> Configuration.');
bullet('Callback URL: https://ezyloan.co.in/api/whatsapp/webhook');
bullet('Verify token: any secret string you choose (this is META_WHATSAPP_VERIFY_TOKEN).');
bullet('Click Verify and save - Meta sends a GET check and the code matches it automatically.');
bullet('Webhook fields -> Subscribe -> "messages" (this is required).');
bullet('App Secret: App dashboard -> Settings -> Basic -> App Secret -> Show -> copy (META_WHATSAPP_APP_SECRET). It verifies inbound message signatures.');

h1('Phase 8 - Add 6 keys to .env.local and restart');
code([
  '# --- Meta WhatsApp Cloud API (add these 6) ---',
  'META_WHATSAPP_TOKEN=EAAG...              # Phase 5 permanent token',
  'META_WHATSAPP_PHONE_NUMBER_ID=1234567890 # Phase 3 phone number ID',
  'META_WHATSAPP_VERIFY_TOKEN=meraSecret123 # Phase 7 chosen string',
  'META_WHATSAPP_APP_SECRET=abcd1234...     # Phase 7 App Secret',
  'META_WHATSAPP_TEMPLATE_NAME=lead_confirmation  # Phase 6 name',
  'META_WHATSAPP_TEMPLATE_LANG=en                 # template language',
  '',
  '# optional force: WHATSAPP_PROVIDER=meta',
]);
para('Restart the server. Done: form submit -> template message to the user; user reply -> Ezy AI auto-reply (same brain as the website) from the same number. WHATSAPP_DEFAULT_COUNTRY_CODE=91 is already set (prepends +91 to 10-digit numbers).', {});

h1('Plan & Pricing (Meta) - approximate');
para('There is NO monthly plan/subscription fee. Meta charges PER MESSAGE (per-message model since 1 July 2025). Cloud API hosting is free. You just add a payment method (card) to the WABA: Business Settings -> WhatsApp Accounts -> [WABA] -> Payment settings.', {});
table(
  ['Category', 'When', 'India approx (USD/msg)'],
  [
    ['Service', 'User messaged first (24h window) - auto-reply', 'Free'],
    ['Utility', 'Order/lead update inside open window', 'Free or ~0.0014'],
    ['Authentication', 'OTP', '~0.0014'],
    ['Marketing', 'Promo / business-initiated', '~0.0107 - 0.014'],
  ],
  [110, 245, 140],
);
bullet('For Ezyloan: user-reply auto-reply = FREE (service window).');
bullet('Form-submit confirmation (template) = Utility -> very cheap (~1 paisa/msg), often free inside the window.');
para('WARNING: rates change over time and are India-specific. Always check the official rate card: https://developers.facebook.com/docs/whatsapp/pricing . Billing: WhatsApp Manager -> Insights / Billing.', { bold: true });
para('No BSP needed: using Meta Cloud API directly means no third-party (Twilio, Gupshup) monthly fee - only Meta per-message charges.', {});

h1('Test & confirm');
bullet('Submit the website form from a test number -> server log shows "Meta WhatsApp sent" and the template arrives.');
bullet('Message your Ezyloan WhatsApp from that number -> an auto-reply should arrive.');
bullet('Admin -> Ezy AI Brain -> Needs Training -> WhatsApp tab shows questions the bot could not answer; click Teach to train it.');

h1('AI training - same as website, for WhatsApp too');
para('WhatsApp and the website share ONE Ezy AI brain. Whatever you teach in Admin -> Ezy AI Brain applies to both. The Needs Training tab now has a Website / WhatsApp filter so you can train WhatsApp questions separately.', {});

h1('Common errors (seen in logs)');
table(
  ['Meta code', 'Meaning', 'Fix'],
  [
    ['190', 'Access token invalid/expired', 'Regenerate permanent token (Phase 5)'],
    ['131047', '24h window closed; free text blocked', 'Set META_WHATSAPP_TEMPLATE_NAME'],
    ['131030', 'Recipient not on test allow-list', 'Add number or use live/verified number'],
    ['132000/1', 'Template mismatch / not approved', 'Match name+lang; wait for approval'],
    ['verify fail', 'Webhook verify token mismatch', 'Env token = dashboard token'],
  ],
  [70, 210, 215],
);

newPage(); // flush last page

// ── Assemble the PDF ─────────────────────────────────────────────────────────
const objects = [];
function addObj(body) { objects.push(body); return objects.length; }

const fontReg = addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
const fontBold = addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
const fontMono = addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Courier /Encoding /WinAnsiEncoding >>');

const kids = [];
const pageObjNums = [];
const contentStreams = [];
for (const page of pages) {
  const stream = page.join('\n');
  const compressed = zlib.deflateSync(Buffer.from(stream, 'latin1'));
  const contentNum = addObj({ dict: `<< /Length ${compressed.length} /Filter /FlateDecode >>`, stream: compressed });
  contentStreams.push(contentNum);
}

// We need the Pages object number before page objects reference it.
const pagesObjNum = objects.length + pages.length + 1; // placeholder position
pages.forEach((_, i) => {
  const num = addObj(
    `<< /Type /Page /Parent ${pagesObjNum} 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] ` +
    `/Resources << /Font << /F1 ${fontReg} 0 R /F2 ${fontBold} 0 R /F3 ${fontMono} 0 R >> >> ` +
    `/Contents ${contentStreams[i]} 0 R >>`
  );
  pageObjNums.push(num);
  kids.push(`${num} 0 R`);
});

const realPagesObj = addObj(`<< /Type /Pages /Kids [${kids.join(' ')}] /Count ${pages.length} >>`);
const catalog = addObj(`<< /Type /Catalog /Pages ${realPagesObj} 0 R >>`);

// Fix the /Parent references (we guessed pagesObjNum; set it to realPagesObj).
for (const n of pageObjNums) {
  objects[n - 1] = objects[n - 1].replace(`/Parent ${pagesObjNum} 0 R`, `/Parent ${realPagesObj} 0 R`);
}

// Serialize with xref.
const header = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
let body = Buffer.from(header, 'latin1');
const offsets = [];
objects.forEach((obj, i) => {
  offsets[i] = body.length;
  let chunk;
  if (typeof obj === 'string') {
    chunk = Buffer.from(`${i + 1} 0 obj\n${obj}\nendobj\n`, 'latin1');
  } else {
    const head = Buffer.from(`${i + 1} 0 obj\n${obj.dict}\nstream\n`, 'latin1');
    const tail = Buffer.from('\nendstream\nendobj\n', 'latin1');
    chunk = Buffer.concat([head, obj.stream, tail]);
  }
  body = Buffer.concat([body, chunk]);
});

const xrefStart = body.length;
let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
offsets.forEach((off) => { xref += String(off).padStart(10, '0') + ' 00000 n \n'; });
const trailer = `trailer\n<< /Size ${objects.length + 1} /Root ${catalog} 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
body = Buffer.concat([body, Buffer.from(xref + trailer, 'latin1')]);

const out = path.join(__dirname, '..', 'META_WHATSAPP_SETUP.pdf');
fs.writeFileSync(out, body);
console.log(`Wrote ${out} (${pages.length} pages, ${body.length} bytes)`);
