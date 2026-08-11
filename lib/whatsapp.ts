// WhatsApp automation via Twilio. Purely ADDITIVE, same guarantee as lib/crm.ts:
// the website's original flow (DB save + email + CRM) runs untouched. Every
// function here is fire-and-forget and NEVER throws — a Twilio outage, missing
// creds, or a bad number only gets logged; the visitor never sees an error and
// the lead is already saved before this is called.
//
// SANDBOX MODE: TWILIO_WHATSAPP_FROM defaults to the Twilio sandbox number
// (whatsapp:+14155238886). In the sandbox each recipient must first opt in by
// sending the "join <code>" message to that number, otherwise Twilio rejects
// the send with error 63015. Free-text is allowed in the sandbox; a production
// sender would need an approved template for business-initiated messages.

import crypto from 'crypto';
import { metaConfigured, sendMetaText, sendMetaTemplate } from './whatsappMeta';

const TWILIO_SANDBOX_FROM = 'whatsapp:+14155238886';

// Which provider actually sends. 'meta' = official WhatsApp Cloud API (direct,
// cheaper); 'twilio' = the original path. Auto-selects Meta when its keys are
// present, unless WHATSAPP_PROVIDER pins one explicitly. Owner switches by just
// adding the META_* env keys — no code change.
export function whatsappProvider(): 'meta' | 'twilio' {
  const pinned = (process.env.WHATSAPP_PROVIDER || '').toLowerCase();
  if (pinned === 'meta') return 'meta';
  if (pinned === 'twilio') return 'twilio';
  return metaConfigured() ? 'meta' : 'twilio';
}

interface TwilioConfig {
  accountSid: string;
  authToken: string;
  from: string;
  // Optional: when using an approved WhatsApp Business sender via a Messaging
  // Service, Twilio wants MessagingServiceSid instead of From. Sandbox uses From.
  messagingServiceSid?: string;
}

// Returns null (and warns once) when creds are absent, mirroring email.ts —
// the app keeps working, WhatsApp is simply skipped.
function getConfig(): TwilioConfig | null {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!accountSid || !authToken) {
    console.warn('⚠️ Twilio credentials missing — WhatsApp messages skipped');
    return null;
  }
  return {
    accountSid,
    authToken,
    from: process.env.TWILIO_WHATSAPP_FROM || TWILIO_SANDBOX_FROM,
    messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID || undefined,
  };
}

// Whether we're configured for a production WhatsApp Business sender (i.e. a
// non-sandbox FROM number). Business-initiated messages from such a sender must
// use an approved template, not free text.
function isProductionSender(): boolean {
  const from = process.env.TWILIO_WHATSAPP_FROM;
  return !!from && from !== TWILIO_SANDBOX_FROM;
}

// Low-level POST to Twilio's Messages API, shared by free-text and template
// sends. Handles auth, the From-vs-MessagingService choice, and result logging.
// Never throws — fire-and-forget, same contract as the callers.
async function postToTwilio(cfg: TwilioConfig, fields: Record<string, string>): Promise<void> {
  // Prefer a Messaging Service (production) if configured; else the From number.
  if (cfg.messagingServiceSid) {
    fields.MessagingServiceSid = cfg.messagingServiceSid;
  } else {
    fields.From = cfg.from;
  }

  const params = new URLSearchParams(fields);
  const auth = Buffer.from(`${cfg.accountSid}:${cfg.authToken}`).toString('base64');

  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${cfg.accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
        // Bound the call so a slow/unreachable Twilio fails fast instead of hanging.
        signal: AbortSignal.timeout(8000),
      },
    );

    const data: any = await res.json().catch(() => ({}));

    if (!res.ok) {
      // Common errors:
      //   63015 → sandbox: recipient hasn't sent the "join <code>" opt-in.
      //   63016 → production: business-initiated msg outside 24h window without a template.
      //   21608 → number not on the sandbox allow-list / sandbox not active.
      //   20003 → auth failed (wrong SID/token, e.g. after a rotation).
      //   572002 → TRIAL account: the 'to' number isn't a Verified Caller ID yet.
      const hint =
        data?.code === 63015
          ? ' → recipient must first send "join <code>" to +14155238886 (sandbox opt-in).'
          : data?.code === 63016
            ? ' → business-initiated message needs an approved template (set TWILIO_WHATSAPP_TEMPLATE_SID).'
            : data?.code === 572002
              ? ' → TRIAL account: verify this number in Twilio Console → Phone Numbers → Manage → Verified Caller IDs, AND send "join <code>" from it to +14155238886.'
              : '';
      console.error(
        `❌ WhatsApp send failed (HTTP ${res.status}, Twilio ${data?.code}): ${data?.message || ''}${hint} — lead still saved.`,
      );
      return;
    }

    // `status` is usually "queued"/"accepted" here; final delivery happens async.
    console.log(`✅ WhatsApp queued to ${fields.To} (SID ${data?.sid}, status ${data?.status}).`);
  } catch (err) {
    console.error('WhatsApp send error (lead still saved):', err);
  }
}

// Normalise a raw form phone number into Twilio's `whatsapp:+E164` format.
// Handles: "9876543210" (bare 10-digit → +91), "+91 98765 43210", "919876543210".
// Returns null if it can't produce something plausible.
export function toWhatsAppAddress(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const cc = (process.env.WHATSAPP_DEFAULT_COUNTRY_CODE || '91').replace(/\D/g, '');

  const hadPlus = raw.trim().startsWith('+');
  let digits = raw.replace(/\D/g, '');
  if (!digits) return null;

  if (!hadPlus) {
    // Bare local number (e.g. Indian 10-digit) → prepend the default country code.
    if (digits.length === 10) digits = cc + digits;
    // else assume it already includes a country code (e.g. "9198...").
  }

  // Basic sanity: E.164 is 8–15 digits.
  if (digits.length < 8 || digits.length > 15) return null;
  return `whatsapp:+${digits}`;
}

/**
 * Send a WhatsApp message to `toPhone` (a raw form phone number). Fire-and-forget:
 * awaited by callers inside their existing try/catch, but never throws itself.
 */
export async function sendWhatsAppMessage(toPhone: string | undefined | null, body: string): Promise<void> {
  const cfg = getConfig();
  if (!cfg) return;

  const to = toWhatsAppAddress(toPhone);
  if (!to) {
    console.warn(`WhatsApp send skipped — unusable phone number: ${toPhone}`);
    return;
  }

  await postToTwilio(cfg, { To: to, Body: body });
}

/**
 * Provider-aware free-text send, used by the inbound webhook to deliver the
 * bot's auto-reply. On Meta the reply is a normal Graph API POST; on Twilio the
 * webhook returns TwiML instead, so this Twilio branch is only a manual/testing
 * path. Valid because the user just messaged us (24h window is open).
 */
export async function sendWhatsAppFreeText(toPhone: string | undefined | null, body: string): Promise<void> {
  if (whatsappProvider() === 'meta') {
    await sendMetaText(toPhone, body);
    return;
  }
  await sendWhatsAppMessage(toPhone, body);
}

/**
 * Send an approved WhatsApp template (Content API). Required for business-initiated
 * messages from a production sender. `contentSid` is the approved template's
 * HX… SID; `variables` maps the template's numbered placeholders, e.g. { '1': name }.
 * Fire-and-forget, never throws.
 */
export async function sendWhatsAppTemplate(
  toPhone: string | undefined | null,
  contentSid: string,
  variables: Record<string, string>,
): Promise<void> {
  const cfg = getConfig();
  if (!cfg) return;

  const to = toWhatsAppAddress(toPhone);
  if (!to) {
    console.warn(`WhatsApp template send skipped — unusable phone number: ${toPhone}`);
    return;
  }

  await postToTwilio(cfg, {
    To: to,
    ContentSid: contentSid,
    ContentVariables: JSON.stringify(variables),
  });
}

/**
 * The single entry point the form routes call. Switching sandbox → production is
 * ENV-ONLY (no code change).
 *
 * IMPORTANT — why a template is the primary path: a form-submit message is
 * *business-initiated*. WhatsApp only allows free text inside the 24-hour window
 * that opens when the USER messages us first — which a form visitor almost never
 * has. So free text is rejected with error 63016 ("outside allowed window, use a
 * Message Template"). An approved Message Template is the only thing that reliably
 * delivers, and templates work from BOTH the sandbox and a production sender.
 *
 * Therefore: whenever TWILIO_WHATSAPP_TEMPLATE_SID is set we send the template
 * (regardless of sender mode). Free text is only a fallback for quick manual
 * sandbox tests done inside an open 24-hour window.
 */
export async function sendLeadConfirmationWhatsApp(
  toPhone: string | undefined | null,
  name: string,
): Promise<void> {
  const firstName = (name || '').trim().split(/\s+/)[0] || 'there';
  const provider = whatsappProvider();
  console.log(
    `📤 WhatsApp confirmation → provider=${provider}, to=${toPhone || '(none)'}, name=${firstName}`,
  );

  // ── Meta Cloud API path ───────────────────────────────────────────────────
  // A form-submit message is business-initiated → needs an approved template.
  if (provider === 'meta') {
    const tplName = process.env.META_WHATSAPP_TEMPLATE_NAME;
    const tplLang = process.env.META_WHATSAPP_TEMPLATE_LANG || 'en';
    if (tplName) {
      await sendMetaTemplate(toPhone, tplName, tplLang, [firstName]);
    } else {
      console.warn(
        '⚠️ Meta WhatsApp active but META_WHATSAPP_TEMPLATE_NAME is unset — a form-submit ' +
          'message is business-initiated and needs an approved template. Skipping send.',
      );
    }
    return;
  }

  const templateSid = process.env.TWILIO_WHATSAPP_TEMPLATE_SID;

  // Preferred path: an approved template. Works in sandbox AND production, and is
  // the ONLY thing that delivers outside the 24-hour window (the normal case).
  if (templateSid) {
    console.log(`   ↳ Twilio path: approved template (${templateSid})`);
    await sendWhatsAppTemplate(toPhone, templateSid, { '1': firstName });
    return;
  }

  if (isProductionSender()) {
    // Production sender + no template → free-text business-initiated message is
    // rejected (63016). Warn loudly instead of silently failing.
    console.warn(
      '⚠️ Production WhatsApp sender configured but TWILIO_WHATSAPP_TEMPLATE_SID is unset — ' +
        'business-initiated message needs an approved template. Skipping send.',
    );
    return;
  }

  // Sandbox, no template: free text only reaches recipients who messaged us in
  // the last 24h (open window). Fine for a quick manual test, NOT for real leads.
  console.warn(
    '⚠️ No TWILIO_WHATSAPP_TEMPLATE_SID set — sending sandbox free text, which ONLY ' +
      'delivers inside a 24h window (real form leads will fail with 63016). Configure ' +
      'a template to fix this.',
  );
  console.log('   ↳ Twilio path: sandbox free text');
  await sendWhatsAppMessage(toPhone, buildLeadConfirmationMessage(name));
}

// The confirmation message a lead receives right after submitting a form.
export function buildLeadConfirmationMessage(name: string): string {
  const firstName = (name || '').trim().split(/\s+/)[0] || 'there';
  return (
    `Hello ${firstName}! 👋\n\n` +
    `Thank you for reaching out to *Ezyloan*. We've received your request and our team ` +
    `will contact you shortly.\n\n` +
    `Please note: Ezyloan is a loan *facilitator* (not a lender) and works with multiple ` +
    `Banks/NBFCs to find suitable options for you.\n\n` +
    `📞 +91 6372977626 (Mon–Sat, 9 AM – 8 PM)\n` +
    `🌐 www.ezyloan.co.in`
  );
}

/**
 * Validate the X-Twilio-Signature on an inbound webhook request so strangers
 * can't POST fake WhatsApp messages to us. Algorithm per Twilio docs: HMAC-SHA1
 * of (full URL + each POST param appended as key+value, sorted by key), keyed by
 * the auth token, base64-encoded. Set TWILIO_VALIDATE_SIGNATURE=false to bypass
 * (e.g. while testing through a tunnel that rewrites the URL).
 */
export function validateTwilioSignature(url: string, params: Record<string, string>, signature: string | null): boolean {
  if (process.env.TWILIO_VALIDATE_SIGNATURE === 'false') return true;

  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken || !signature) return false;

  const data =
    url +
    Object.keys(params)
      .sort()
      .map((k) => k + params[k])
      .join('');

  const expected = crypto.createHmac('sha1', authToken).update(Buffer.from(data, 'utf-8')).digest('base64');

  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

// The automated reply sent when a user messages our WhatsApp number.
export function buildAutoReplyMessage(): string {
  return (
    `Thanks for messaging *Ezyloan*! 🙏\n\n` +
    `We've received your message and a team member will respond during business hours ` +
    `(Mon–Sat, 9 AM – 8 PM).\n\n` +
    `For a faster response you can call 📞 +91 6372977626 or visit 🌐 www.ezyloan.co.in`
  );
}
