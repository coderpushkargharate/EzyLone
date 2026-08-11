// Official Meta WhatsApp Cloud API integration (the DIRECT, no-middleman path).
//
// This is the cheaper alternative to Twilio: messages go straight to Meta's
// Graph API, so you only pay Meta's per-message rate (no Twilio markup). It is
// selected automatically whenever the META_WHATSAPP_* keys are present (see
// lib/whatsapp.ts → whatsappProvider()). Twilio stays as a fallback.
//
// Same guarantee as lib/whatsapp.ts: every send is fire-and-forget and NEVER
// throws — a missing key, bad number, or Meta outage is only logged; the lead
// is already saved before any of this runs.
//
// Only these env vars are needed (the owner fills them from the Meta dashboard —
// see META_WHATSAPP_SETUP.pdf):
//   META_WHATSAPP_TOKEN            permanent System-User access token
//   META_WHATSAPP_PHONE_NUMBER_ID  the sending number's Phone Number ID
//   META_WHATSAPP_VERIFY_TOKEN     any secret string you choose (webhook GET verify)
//   META_WHATSAPP_APP_SECRET       App Secret (validates inbound webhook signature)
//   META_WHATSAPP_TEMPLATE_NAME    approved template name for form-submit messages
//   META_WHATSAPP_TEMPLATE_LANG    template language code (default 'en')
//   META_GRAPH_VERSION             Graph API version (default 'v21.0')

import crypto from 'crypto';

export interface MetaConfig {
  token: string;
  phoneNumberId: string;
  version: string;
}

// Returns null (and warns once) when the core send creds are absent — mirrors
// getConfig() in lib/whatsapp.ts, so the app keeps working and Meta is skipped.
export function getMetaConfig(): MetaConfig | null {
  const token = process.env.META_WHATSAPP_TOKEN;
  const phoneNumberId = process.env.META_WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) {
    console.warn('⚠️ Meta WhatsApp creds missing (META_WHATSAPP_TOKEN / META_WHATSAPP_PHONE_NUMBER_ID) — Meta send skipped');
    return null;
  }
  return {
    token,
    phoneNumberId,
    version: process.env.META_GRAPH_VERSION || 'v21.0',
  };
}

// True when the app is configured to use Meta Cloud API at all.
export function metaConfigured(): boolean {
  return !!(process.env.META_WHATSAPP_TOKEN && process.env.META_WHATSAPP_PHONE_NUMBER_ID);
}

// Normalise a raw form phone number into Meta's wire format: bare E.164 digits,
// NO leading '+' and NO 'whatsapp:' prefix. Handles "9876543210" (→ +91),
// "+91 98765 43210", "919876543210". Returns null if implausible.
export function toMetaNumber(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const cc = (process.env.WHATSAPP_DEFAULT_COUNTRY_CODE || '91').replace(/\D/g, '');

  // Accept Twilio-style "whatsapp:+91..." too, so callers can pass either form.
  const hadPlus = raw.trim().replace(/^whatsapp:/i, '').startsWith('+');
  let digits = raw.replace(/\D/g, '');
  if (!digits) return null;

  if (!hadPlus && digits.length === 10) digits = cc + digits;

  if (digits.length < 8 || digits.length > 15) return null;
  return digits;
}

// Low-level POST to the Graph API messages endpoint, shared by text + template
// sends. Never throws — fire-and-forget, same contract as the Twilio helpers.
async function postToMeta(cfg: MetaConfig, payload: Record<string, unknown>): Promise<void> {
  const url = `https://graph.facebook.com/${cfg.version}/${cfg.phoneNumberId}/messages`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cfg.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      // Bound the call so a slow/unreachable Graph API fails fast instead of hanging.
      signal: AbortSignal.timeout(8000),
    });

    const data: any = await res.json().catch(() => ({}));

    if (!res.ok) {
      // Common Meta errors:
      //   131030 → recipient number not in allowed list (test number restriction).
      //   131047 → 24h window closed; a business-initiated message needs a template.
      //   132000/132001 → template name/params mismatch or not approved.
      //   190     → access token expired/invalid.
      const err = data?.error || {};
      const hint =
        err.code === 131047
          ? ' → outside 24h window: use an approved template (set META_WHATSAPP_TEMPLATE_NAME).'
          : err.code === 190
            ? ' → access token invalid/expired: regenerate a permanent System-User token.'
            : err.code === 131030
              ? ' → recipient not on the test-number allow-list (add them or use a live number).'
              : '';
      console.error(
        `❌ Meta WhatsApp send failed (HTTP ${res.status}, code ${err.code}): ${err.message || ''}${hint} — lead still saved.`,
      );
      return;
    }

    const id = data?.messages?.[0]?.id;
    console.log(`✅ Meta WhatsApp sent to ${(payload as any).to} (message id ${id}).`);
  } catch (e) {
    console.error('Meta WhatsApp send error (lead still saved):', e);
  }
}

// Send a plain-text WhatsApp message. Valid only inside the 24-hour customer
// service window (i.e. the user messaged us first) — used for auto-replies.
export async function sendMetaText(toPhone: string | undefined | null, body: string): Promise<void> {
  const cfg = getMetaConfig();
  if (!cfg) return;
  const to = toMetaNumber(toPhone);
  if (!to) {
    console.warn(`Meta WhatsApp send skipped — unusable phone number: ${toPhone}`);
    return;
  }
  await postToMeta(cfg, {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'text',
    text: { preview_url: false, body },
  });
}

// Send an approved template message. Required for business-initiated messages
// (e.g. the confirmation right after a form submit, when no 24h window is open).
// `bodyParams` fills the template's {{1}}, {{2}}… body placeholders in order.
export async function sendMetaTemplate(
  toPhone: string | undefined | null,
  templateName: string,
  langCode: string,
  bodyParams: string[],
): Promise<void> {
  const cfg = getMetaConfig();
  if (!cfg) return;
  const to = toMetaNumber(toPhone);
  if (!to) {
    console.warn(`Meta WhatsApp template send skipped — unusable phone number: ${toPhone}`);
    return;
  }

  const template: Record<string, unknown> = {
    name: templateName,
    language: { code: langCode || 'en' },
  };
  if (bodyParams.length) {
    template.components = [
      { type: 'body', parameters: bodyParams.map((t) => ({ type: 'text', text: t })) },
    ];
  }

  await postToMeta(cfg, {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template,
  });
}

// ── Inbound webhook helpers ────────────────────────────────────────────────

// GET verification handshake. Meta calls the webhook once with a challenge; we
// echo it back only if the verify token matches. Returns the challenge string
// to reply with, or null to reject (403).
export function verifyMetaChallenge(searchParams: URLSearchParams): string | null {
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');
  const expected = process.env.META_WHATSAPP_VERIFY_TOKEN;
  if (mode === 'subscribe' && expected && token === expected) return challenge || '';
  return null;
}

// Validate the X-Hub-Signature-256 header against the RAW request body, keyed by
// the App Secret, so strangers can't POST fake inbound messages. Set
// META_WHATSAPP_VALIDATE_SIGNATURE=false to bypass (e.g. local tunnel testing).
export function validateMetaSignature(rawBody: string, header: string | null): boolean {
  if (process.env.META_WHATSAPP_VALIDATE_SIGNATURE === 'false') return true;
  const appSecret = process.env.META_WHATSAPP_APP_SECRET;
  // If no App Secret is configured we can't verify — allow (so a half-configured
  // setup still works), but warn. Set the secret to enforce verification.
  if (!appSecret) {
    console.warn('⚠️ META_WHATSAPP_APP_SECRET not set — inbound WhatsApp signature NOT verified.');
    return true;
  }
  if (!header) return false;
  const expected = 'sha256=' + crypto.createHmac('sha256', appSecret).update(rawBody, 'utf-8').digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(header));
  } catch {
    return false;
  }
}

export interface MetaInbound {
  from: string;   // sender's number, bare digits (Meta format)
  text: string;   // message text (or a placeholder for non-text messages)
  name?: string;  // sender's WhatsApp profile name, if provided
}

// Pull the first inbound text message out of a Meta webhook payload. Meta also
// posts delivery/read STATUS events (no `messages` array) — those return null so
// the route can 200-ack and ignore them.
export function parseMetaInbound(payload: any): MetaInbound | null {
  try {
    const value = payload?.entry?.[0]?.changes?.[0]?.value;
    const msg = value?.messages?.[0];
    if (!msg || !msg.from) return null;

    let text = '';
    if (msg.type === 'text') text = msg.text?.body || '';
    else if (msg.type === 'button') text = msg.button?.text || '';
    else if (msg.type === 'interactive') {
      text = msg.interactive?.button_reply?.title || msg.interactive?.list_reply?.title || '';
    }
    text = (text || '').trim() || '[non-text message]';

    const name = value?.contacts?.[0]?.profile?.name;
    return { from: msg.from, text, name };
  } catch {
    return null;
  }
}
