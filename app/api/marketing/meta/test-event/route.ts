import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';
import { getCapiCredentials, recordConnectionSuccess } from '@/lib/marketing/connections';
import { getSettings } from '@/lib/marketing/settings';
import { graph } from '@/lib/marketing/meta/graph';
import { buildMetaEvent, parseMetaResponse } from '@/lib/marketing/meta/payload';
import { errorResponse } from '@/lib/marketing/http';
import { syncLog } from '@/lib/marketing/log';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST /api/marketing/meta/test-event — admin only. Sends ONE synthetic event
// with the configured test_event_code so the dataset + token can be verified in
// Events Manager → Test events. Contains no customer data (random external_id).
// Refuses to run without a test code, so it can never pollute production data.
export async function POST(req: NextRequest) {
  const gate = await requireAuth(req, { adminOnly: true });
  if ('error' in gate) return gate.error;
  const limited = checkRateLimit(req, 'marketing-test-event', { windowMs: 60_000, max: 5, message: 'Too many test events.' });
  if (limited) return limited;

  const settings = await getSettings(true);
  const code = settings.testMode?.metaTestEventCode;
  if (!code) return NextResponse.json({ message: 'Set a Meta test event code in Settings first (Events Manager → Test events).' }, { status: 412 });
  const creds = await getCapiCredentials();
  if (!creds) return NextResponse.json({ message: 'Dataset ID and Conversions API token are not configured.' }, { status: 412 });

  const built = buildMetaEvent({
    eventName: 'Lead',
    eventTime: Math.floor(Date.now() / 1000),
    eventId: `ezy_test_${crypto.randomBytes(6).toString('hex')}`,
    actionSource: 'other',
    mode: 'full',
    customer: { externalId: `ezyloan-test-${crypto.randomBytes(8).toString('hex')}` },
  });
  if (!built.ok) return NextResponse.json({ message: built.reason }, { status: 500 });
  try {
    const body = await graph.postNoProof(`/${creds.datasetId}/events`, creds.token, { data: JSON.stringify([built.event]), test_event_code: code });
    const parsed = parseMetaResponse(body, 1);
    await syncLog('meta', 'capi', parsed.ok ? 'ok' : 'error', `TEST event ${parsed.ok ? 'received' : 'not confirmed'} by Meta (fbtrace ${parsed.fbtraceId || 'n/a'})`);
    if (parsed.ok) await recordConnectionSuccess('meta');
    return NextResponse.json({ ok: parsed.ok, eventsReceived: parsed.eventsReceived, fbtraceId: parsed.fbtraceId, messages: parsed.messages, reason: parsed.reason });
  } catch (e) {
    await syncLog('meta', 'capi', 'error', `TEST event failed: ${e instanceof Error ? e.message : String(e)}`);
    return errorResponse(e);
  }
}
