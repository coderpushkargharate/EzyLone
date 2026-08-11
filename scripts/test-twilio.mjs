// Twilio WhatsApp diagnostic — shows the FULL status of your Twilio setup in the
// terminal so you can see whether the API is working and, if not, exactly what's
// wrong.
//
//   Check config + validate credentials only:
//     node --env-file=.env.local scripts/test-twilio.mjs
//
//   Also send a real test WhatsApp message to a number:
//     node --env-file=.env.local scripts/test-twilio.mjs +919876543210
//
// It NEVER changes anything — read-only checks, plus an optional test send if you
// pass a phone number. Every step prints ✅ / ❌ / ⚠️ with the real Twilio response.

const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_WHATSAPP_FROM,
  TWILIO_MESSAGING_SERVICE_SID,
  TWILIO_WHATSAPP_TEMPLATE_SID,
  WHATSAPP_DEFAULT_COUNTRY_CODE,
  WHATSAPP_PROVIDER,
  META_WHATSAPP_TOKEN,
  META_WHATSAPP_PHONE_NUMBER_ID,
} = process.env;

const SANDBOX_FROM = 'whatsapp:+14155238886';
const line = () => console.log('─'.repeat(64));

// Mask a secret so it can be printed safely (shows first 6 + last 4 chars).
function mask(v) {
  if (!v) return '(empty)';
  if (v.length <= 12) return v.slice(0, 2) + '****';
  return `${v.slice(0, 6)}…${v.slice(-4)} (${v.length} chars)`;
}

// Turn a raw phone into Twilio's whatsapp:+E164 form (same logic as lib/whatsapp.ts).
function toWhatsAppAddress(raw) {
  if (!raw) return null;
  const cc = (WHATSAPP_DEFAULT_COUNTRY_CODE || '91').replace(/\D/g, '');
  const hadPlus = raw.trim().startsWith('+');
  let digits = raw.replace(/\D/g, '');
  if (!digits) return null;
  if (!hadPlus && digits.length === 10) digits = cc + digits;
  if (digits.length < 8 || digits.length > 15) return null;
  return `whatsapp:+${digits}`;
}

async function main() {
  line();
  console.log('  TWILIO WHATSAPP DIAGNOSTIC');
  line();

  // ── 1. Which provider is active ───────────────────────────────────────────
  const pinned = (WHATSAPP_PROVIDER || '').toLowerCase();
  const metaOn = !!(META_WHATSAPP_TOKEN && META_WHATSAPP_PHONE_NUMBER_ID);
  const provider = pinned === 'meta' ? 'meta' : pinned === 'twilio' ? 'twilio' : metaOn ? 'meta' : 'twilio';
  console.log('1) Active provider:');
  console.log(`   WHATSAPP_PROVIDER = ${WHATSAPP_PROVIDER || '(unset → auto-detect)'}`);
  console.log(`   Meta configured?  = ${metaOn ? 'yes' : 'no'}`);
  if (provider === 'twilio') {
    console.log('   ✅ App will send via TWILIO.');
  } else {
    console.log('   ⚠️ App is set to send via META, not Twilio. Set WHATSAPP_PROVIDER=twilio');
    console.log('      and clear the META_WHATSAPP_* keys to force Twilio.');
  }
  line();

  // ── 2. Env vars present ───────────────────────────────────────────────────
  console.log('2) Twilio credentials in env:');
  console.log(`   TWILIO_ACCOUNT_SID          = ${TWILIO_ACCOUNT_SID || '❌ MISSING'}`);
  console.log(`   TWILIO_AUTH_TOKEN           = ${mask(TWILIO_AUTH_TOKEN)}`);
  console.log(`   TWILIO_WHATSAPP_FROM        = ${TWILIO_WHATSAPP_FROM || '(unset → sandbox)'}`);
  console.log(`   TWILIO_MESSAGING_SERVICE_SID= ${TWILIO_MESSAGING_SERVICE_SID || '(unset)'}`);
  console.log(`   TWILIO_WHATSAPP_TEMPLATE_SID= ${TWILIO_WHATSAPP_TEMPLATE_SID || '(unset)'}`);
  console.log(`   WHATSAPP_DEFAULT_COUNTRY_CODE = ${WHATSAPP_DEFAULT_COUNTRY_CODE || '91 (default)'}`);
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    console.log('   ❌ SID or Auth Token missing — nothing can be sent. Stop here.');
    process.exit(1);
  }
  line();

  // ── 3. Validate credentials against the live Twilio API ───────────────────
  console.log('3) Validating credentials with Twilio API…');
  const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');
  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}.json`,
      { headers: { Authorization: `Basic ${auth}` } },
    );
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      console.log(`   ✅ Credentials VALID. Account "${data.friendly_name}" — status: ${data.status}.`);
      if (data.type) console.log(`      Account type: ${data.type} (trial accounts have limits).`);
    } else {
      console.log(`   ❌ Credentials REJECTED (HTTP ${res.status}, code ${data.code}): ${data.message}`);
      if (data.code === 20003) console.log('      → Wrong SID/Auth Token. Copy them fresh from the Twilio Console.');
      process.exit(1);
    }
  } catch (e) {
    console.log(`   ❌ Could not reach Twilio API: ${e.message}`);
    process.exit(1);
  }
  line();

  // ── 4. Sender mode & template sanity ──────────────────────────────────────
  const from = TWILIO_WHATSAPP_FROM || SANDBOX_FROM;
  const isSandbox = from === SANDBOX_FROM;
  console.log('4) Sender mode:');
  if (isSandbox) {
    console.log('   ℹ️ SANDBOX sender (+14155238886).');
    console.log('      Recipients must first send "join <code>" to that number.');
    console.log('      Free text works only inside the 24h window after they message you.');
  } else {
    console.log(`   ℹ️ PRODUCTION sender (${from}).`);
    if (TWILIO_WHATSAPP_TEMPLATE_SID) {
      console.log('   ✅ Template SID set — real form leads (business-initiated) will deliver.');
    } else {
      console.log('   ⚠️ NO TWILIO_WHATSAPP_TEMPLATE_SID set. Real form leads are business-');
      console.log('      initiated and will be REJECTED by Twilio with error 63016.');
      console.log('      Fix: create + get an approved WhatsApp template on THIS account,');
      console.log('      then paste its HX… SID into TWILIO_WHATSAPP_TEMPLATE_SID.');
    }
  }
  line();

  // ── 5. Optional test send ─────────────────────────────────────────────────
  const target = process.argv[2];
  if (!target) {
    console.log('5) Test send: skipped (no phone number passed).');
    console.log('   To actually send a test message, run:');
    console.log('     node --env-file=.env.local scripts/test-twilio.mjs +91XXXXXXXXXX');
    line();
    console.log('Done. ✅ Config checks finished.');
    return;
  }

  const to = toWhatsAppAddress(target);
  if (!to) {
    console.log(`5) ❌ "${target}" is not a usable phone number.`);
    process.exit(1);
  }
  console.log(`5) Sending a test WhatsApp message to ${to} …`);

  const fields = { To: to, Body: '✅ Ezyloan Twilio test — if you see this, the WhatsApp API is working.' };
  if (TWILIO_MESSAGING_SERVICE_SID) fields.MessagingServiceSid = TWILIO_MESSAGING_SERVICE_SID;
  else fields.From = from;

  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(fields).toString(),
      },
    );
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      console.log(`   ✅ Accepted by Twilio. SID ${data.sid}, status "${data.status}".`);
      console.log('      (Final delivery is async — check the recipient\'s WhatsApp.)');
    } else {
      console.log(`   ❌ Send FAILED (HTTP ${res.status}, Twilio code ${data.code}): ${data.message}`);
      if (data.code === 63015) console.log('      → Recipient must send "join <code>" to the sandbox first.');
      if (data.code === 63016) console.log('      → Business-initiated message outside 24h window: use an approved template.');
      if (data.code === 21608) console.log('      → Number not on the sandbox allow-list / sandbox inactive.');
      if (data.more_info) console.log(`      More info: ${data.more_info}`);
    }
  } catch (e) {
    console.log(`   ❌ Request error: ${e.message}`);
  }
  line();
  console.log('Done.');
}

main().catch((e) => {
  console.error('❌ Diagnostic crashed:', e);
  process.exit(1);
});
