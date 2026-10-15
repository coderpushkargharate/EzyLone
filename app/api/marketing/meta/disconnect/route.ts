import { NextRequest, NextResponse } from 'next/server';
import { audit } from '@/lib/audit';
import { requireAuth } from '@/lib/auth';
import { disconnectMeta } from '@/lib/marketing/meta/oauth';
import { errorResponse } from '@/lib/marketing/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST /api/marketing/meta/disconnect — admin only. Unsubscribes pages, revokes
// the app's permissions and deletes stored Meta tokens. The legacy manual Page
// token in Automations (if any) is not touched.
export async function POST(req: NextRequest) {
  const gate = await requireAuth(req, { adminOnly: true });
  if ('error' in gate) return gate.error;
  try {
    await disconnectMeta();
    await audit(gate.auth, 'integration_disconnect', 'meta', undefined, req);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
