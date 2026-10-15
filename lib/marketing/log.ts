import { connectDB } from '@/lib/db';
import { IntegrationSyncLog } from '@/lib/models/MarketingSupport';
import type { IIntegrationSyncLog } from '@/lib/models/MarketingSupport';
import { redactSecrets } from './secrets';

// Structured, PII-redacted logging for the marketing layer. Messages are passed
// through redaction (tokens, emails, phone numbers) before reaching stdout or
// the sync-history collection. Never throws.

const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const PHONE_RE = /(?<![\w.])\+?\d[\d\s-]{8,14}\d(?![\w.])/g;

export function redactPii(text: string): string {
  return redactSecrets(String(text)).replace(EMAIL_RE, '[email]').replace(PHONE_RE, '[phone]');
}

export function mlog(level: 'info' | 'warn' | 'error', event: string, fields: Record<string, unknown> = {}): void {
  const safe: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(fields)) {
    safe[k] = typeof v === 'string' ? redactPii(v) : v;
  }
  const line = JSON.stringify({ ts: new Date().toISOString(), scope: 'marketing', level, event, ...safe });
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

export async function syncLog(
  provider: IIntegrationSyncLog['provider'],
  kind: string,
  status: IIntegrationSyncLog['status'],
  message: string,
  extra: { counts?: Record<string, number>; durationMs?: number } = {}
): Promise<void> {
  try {
    await connectDB();
    await IntegrationSyncLog.create({ provider, kind, status, message: redactPii(message).slice(0, 1000), ...extra });
  } catch (e) {
    mlog('warn', 'sync_log_write_failed', { error: String(e) });
  }
}
