import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getPushDiagnostics, sendAdminPush } from '@/lib/push';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Push diagnostics — the tool for verifying REAL background delivery in prod.
//
//   GET  /api/admin/push/debug   → is VAPID loaded on THIS server? how many
//                                   devices are subscribed? (no secrets exposed)
//   POST /api/admin/push/debug   → send a real test push to every subscribed
//                                   device NOW and report per-device result
//                                   (sent / removed(410) / failed(403…)).
//
// Real closed-app test: install the PWA, allow notifications, open the app once
// (creates the subscription), then FULLY CLOSE it. From another logged-in
// device/browser hit POST here — the notification must appear on the closed
// phone within seconds. That proves the whole background path end to end.

export async function GET(req: NextRequest) {
  const gate = await requireAuth(req, { adminOnly: true });
  if ('error' in gate) return gate.error;
  const diag = await getPushDiagnostics();
  return NextResponse.json(diag);
}

export async function POST(req: NextRequest) {
  const gate = await requireAuth(req, { adminOnly: true });
  if ('error' in gate) return gate.error;
  const result = await sendAdminPush({
    title: '✅ EzyLoan test push',
    body: 'If you see this with the app CLOSED, background push works.',
    url: '/ezyadmin',
    tag: 'ezy-test',
    dedupeId: `test-${Date.now()}`, // unique so it always shows (never deduped)
  });
  return NextResponse.json(result);
}
