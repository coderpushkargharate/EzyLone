import crypto from 'crypto';
import { connectDB } from './db';
import { AppCredential } from './models/AppCredential';
import { decryptSecret, encryptSecret } from './marketing/secrets';
import { ensureEncryptionKey } from './marketing/keyManager';

// Central registry of the API keys the integrations need, with "where to get
// it" help. Resolution order for every key:
//   1. server environment variable (name or legacy alias) — always wins
//   2. value saved by an admin in the panel (secrets encrypted at rest)
// Values are cached per process for 30 s; saving in the panel clears the cache.

export type CredGroup = 'meta' | 'google' | 'webhooks';

export interface CredDef {
  name: string;
  label: string;
  group: CredGroup;
  secret: boolean;
  required: boolean;
  pattern: RegExp;
  formatHint: string;
  help: string;
  link?: string;
  envAliases?: string[];
  generate?: boolean; // the panel can generate a random value
}

export const CRED_DEFS: CredDef[] = [
  {
    name: 'META_APP_ID', label: 'Meta App ID', group: 'meta', secret: false, required: true,
    pattern: /^\d{5,20}$/, formatHint: 'numbers only',
    help: 'Meta for Developers → My Apps → your Business app → App settings → Basic → App ID.',
    link: 'https://developers.facebook.com/apps/',
  },
  {
    name: 'META_APP_SECRET', label: 'Meta App Secret', group: 'meta', secret: true, required: true,
    pattern: /^[0-9a-f]{32}$/i, formatHint: '32 hex characters',
    help: 'Same page → App Secret → Show. Also verifies the Lead Ads webhook signature.',
    link: 'https://developers.facebook.com/apps/', envAliases: ['FACEBOOK_APP_SECRET'],
  },
  {
    name: 'FACEBOOK_VERIFY_TOKEN', label: 'Webhook verify token', group: 'meta', secret: true, required: true,
    pattern: /^[A-Za-z0-9_\-.]{8,100}$/, formatHint: '8–100 letters, numbers, - _ .',
    help: 'Any random text you choose. Enter the SAME value in Meta app → Webhooks → Page → Verify token.',
    generate: true,
  },
  {
    name: 'META_PIXEL_ID', label: 'Meta Pixel / Dataset ID', group: 'meta', secret: false, required: false,
    pattern: /^\d{5,20}$/, formatHint: 'numbers only',
    help: 'Events Manager → Data sources → your Pixel → ID. Turns on the browser Pixel (if not already set at build time).',
    link: 'https://business.facebook.com/events_manager2/', envAliases: ['NEXT_PUBLIC_META_PIXEL_ID'],
  },
  {
    name: 'META_LOGIN_CONFIG_ID', label: 'Facebook Login for Business configuration ID (optional)', group: 'meta', secret: false, required: false,
    pattern: /^\d{5,25}$/, formatHint: 'numbers only',
    help: 'Only if you created a Login for Business configuration: Meta app → Facebook Login for Business → Configurations.',
    link: 'https://developers.facebook.com/apps/',
  },
  {
    name: 'GOOGLE_OAUTH_CLIENT_ID', label: 'Google OAuth Client ID', group: 'google', secret: false, required: true,
    pattern: /^[0-9A-Za-z\-_.]+\.apps\.googleusercontent\.com$/, formatHint: 'ends with .apps.googleusercontent.com',
    help: 'Google Cloud Console → APIs & Services → Credentials → Create credentials → OAuth client ID → Web application.',
    link: 'https://console.cloud.google.com/apis/credentials',
  },
  {
    name: 'GOOGLE_OAUTH_CLIENT_SECRET', label: 'Google OAuth Client Secret', group: 'google', secret: true, required: true,
    pattern: /^[A-Za-z0-9_\-]{10,100}$/, formatHint: 'shown next to the Client ID (often starts with GOCSPX-)',
    help: 'Same OAuth client → Client secret.',
    link: 'https://console.cloud.google.com/apis/credentials',
  },
  {
    name: 'GOOGLE_ADS_DEVELOPER_TOKEN', label: 'Google Ads developer token', group: 'google', secret: true, required: false,
    pattern: /^[A-Za-z0-9_\-]{10,60}$/, formatHint: '~22 characters',
    help: 'Google Ads (manager account) → Tools → API Center. Needed for campaign/spend reports and account lists, not for conversion uploads. Production accounts need Basic access.',
    link: 'https://ads.google.com/aw/apicenter',
  },
  {
    name: 'GA4_MEASUREMENT_ID', label: 'GA4 Measurement ID', group: 'google', secret: false, required: false,
    pattern: /^G-[A-Z0-9]{4,20}$/, formatHint: 'G-XXXXXXXXXX',
    help: 'Google Analytics → Admin → Data streams → your web stream → Measurement ID. Turns on website GA4 tracking (city reports come from GA4).',
    link: 'https://analytics.google.com/analytics/web/', envAliases: ['NEXT_PUBLIC_GA4_MEASUREMENT_ID'],
  },
  {
    name: 'WEBHOOK_LEAD_SECRET', label: 'Lead webhook secret', group: 'webhooks', secret: true, required: false,
    pattern: /^\S{16,200}$/, formatHint: '16+ characters, no spaces',
    help: 'Only if a form tool (Zapier, Make, another website) posts leads to /api/webhook/lead. Send it as the x-webhook-secret header.',
    generate: true,
  },
];

const DEF = new Map(CRED_DEFS.map((d) => [d.name, d]));
const TTL_MS = 30_000;
let cache: { at: number; values: Map<string, string>; unreadable: Set<string> } | null = null;

function fromEnv(def: CredDef): string | undefined {
  for (const k of [def.name, ...(def.envAliases || [])]) {
    const v = process.env[k];
    if (v && v.trim()) return v.trim();
  }
  return undefined;
}

async function loadAll(): Promise<{ values: Map<string, string>; unreadable: Set<string> }> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache;
  const values = new Map<string, string>();
  const unreadable = new Set<string>();
  try {
    await connectDB();
    const rows = await AppCredential.find({}).lean();
    for (const r of rows) {
      try {
        const v = r.enc ? decryptSecret(r.enc) : r.value;
        if (v) values.set(r.name, v);
      } catch {
        unreadable.add(r.name); // key missing or different — surfaced in the panel, never silently replaced
      }
    }
  } catch {
    /* DB unavailable — env values still work */
  }
  cache = { at: Date.now(), values, unreadable };
  return cache;
}

async function load(): Promise<Map<string, string>> {
  return (await loadAll()).values;
}

export function clearCredentialCache(): void {
  cache = null;
}

export async function getCredential(name: string): Promise<string | undefined> {
  const def = DEF.get(name);
  if (!def) return process.env[name]?.trim() || undefined;
  return fromEnv(def) || (await load()).get(name);
}

export async function credentialStatus() {
  const { values, unreadable } = await loadAll();
  return CRED_DEFS.map((d) => {
    const env = fromEnv(d);
    const saved = values.get(d.name);
    const value = env || saved;
    return {
      name: d.name,
      label: d.label,
      group: d.group,
      secret: d.secret,
      required: d.required,
      formatHint: d.formatHint,
      help: d.help,
      link: d.link,
      generate: !!d.generate,
      set: !!value,
      source: env ? 'env' : saved ? 'panel' : null,
      unreadable: !env && unreadable.has(d.name),
      // Public IDs are shown; secrets never leave the server (only whether they are set).
      value: d.secret ? undefined : value,
    };
  });
}

/** Validate without saving. Returns an error string, or null when the value is acceptable ('' = clear). */
export function validateCredential(name: string, raw: unknown): string | null {
  const def = DEF.get(name);
  if (!def) return `Unknown key ${name}`;
  if (raw !== '' && typeof raw !== 'string') return `${def.label}: expected text.`;
  const value = String(raw).trim();
  if (value && !def.pattern.test(value)) return `${def.label}: expected ${def.formatHint}.`;
  return null;
}

/** Save (or clear with '') one key. Returns an error string on invalid input. */
export async function saveCredential(name: string, raw: unknown, user: string): Promise<string | null> {
  const def = DEF.get(name);
  if (!def) return `Unknown key ${name}`;
  const value = typeof raw === 'string' ? raw.trim() : '';
  await connectDB();
  if (!value) {
    await AppCredential.deleteOne({ name });
  } else {
    if (!def.pattern.test(value)) return `${def.label}: expected ${def.formatHint}.`;
    if (def.secret) {
      try {
        await ensureEncryptionKey();
      } catch (e) {
        return e instanceof Error ? e.message : 'Encryption key problem.';
      }
    }
    await AppCredential.updateOne(
      { name },
      { $set: def.secret ? { enc: encryptSecret(value), updatedBy: user } : { value, updatedBy: user }, $unset: def.secret ? { value: '' } : { enc: '' } },
      { upsert: true }
    );
  }
  clearCredentialCache();
  return null;
}

export function generateSecretValue(): string {
  return crypto.randomBytes(24).toString('base64url');
}
