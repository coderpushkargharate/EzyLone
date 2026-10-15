import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { audit } from '@/lib/audit';
import { requireAuth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';
import { MarketingConnection } from '@/lib/models/MarketingConnection';
import { getConnection, getMetaUserToken, publicConnectionView } from '@/lib/marketing/connections';
import { listPixels, saveMetaConnection, setPageSubscription } from '@/lib/marketing/meta/oauth';
import { checkMetaHealth } from '@/lib/marketing/health';
import { encryptSecret } from '@/lib/marketing/secrets';
import { ensureEncryptionKey } from '@/lib/marketing/keyManager';
import { errorResponse } from '@/lib/marketing/http';
import { syncLog } from '@/lib/marketing/log';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST /api/marketing/meta/assets — admin only. Manage the authorized Meta assets.
//   { action: 'refresh' }                                  re-read pages / ad accounts
//   { action: 'subscribe', pageId, subscribe: boolean }    leadgen webhook subscription
//   { action: 'pixels' }                                   list pixels/datasets of selected ad accounts
//   { action: 'select', adAccountIds?, datasetId?, capiToken? }
//   { action: 'healthcheck' }                              verify token + permissions now
export async function POST(req: NextRequest) {
  const gate = await requireAuth(req, { adminOnly: true });
  if ('error' in gate) return gate.error;
  const limited = checkRateLimit(req, 'marketing-meta-assets', { windowMs: 60_000, max: 30, message: 'Too many requests.' });
  if (limited) return limited;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

  try {
    await connectDB();
    switch (body.action) {
      case 'refresh': {
        const token = await getMetaUserToken();
        if (!token) return NextResponse.json({ message: 'Meta is not connected.' }, { status: 412 });
        await saveMetaConnection(token, gate.auth.username);
        break;
      }
      case 'subscribe': {
        const pageId = String(body.pageId || '');
        if (!/^\d{5,30}$/.test(pageId)) return NextResponse.json({ message: 'Invalid page id.' }, { status: 400 });
        await setPageSubscription(pageId, body.subscribe === true);
        await audit(gate.auth, 'config_change', `meta_page_subscription:${pageId}`, { subscribed: body.subscribe === true }, req);
        break;
      }
      case 'pixels': {
        const conn = await getConnection('meta');
        const pixels = await listPixels(conn?.meta?.selectedAdAccountIds || []);
        return NextResponse.json({ pixels });
      }
      case 'select': {
        const conn = await getConnection('meta');
        if (!conn || conn.status === 'disconnected') return NextResponse.json({ message: 'Meta is not connected.' }, { status: 412 });
        const set: Record<string, unknown> = {};
        if (Array.isArray(body.adAccountIds)) {
          const allowed = new Set((conn.meta?.adAccounts || []).map((a) => a.id));
          set['meta.selectedAdAccountIds'] = (body.adAccountIds as unknown[]).map(String).filter((id) => allowed.has(id)).slice(0, 10);
        }
        if (body.datasetId !== undefined) {
          const ds = String(body.datasetId || '').trim();
          if (ds && !/^\d{5,30}$/.test(ds)) return NextResponse.json({ message: 'Dataset / Pixel ID must be numeric.' }, { status: 400 });
          set['meta.datasetId'] = ds || undefined;
        }
        if (typeof body.capiToken === 'string' && body.capiToken.trim()) {
          await ensureEncryptionKey();
          const t = body.capiToken.trim();
          if (t.length < 20 || t.length > 1000 || /\s/.test(t)) return NextResponse.json({ message: 'That does not look like an access token.' }, { status: 400 });
          set['meta.capiTokenEnc'] = encryptSecret(t);
        }
        // A new dataset or token must be re-verified (Send test event) before the checklist trusts it.
        const resetVerify = set['meta.capiTokenEnc'] !== undefined || (body.datasetId !== undefined && set['meta.datasetId'] !== conn.meta?.datasetId);
        if (Object.keys(set).length) await MarketingConnection.updateOne({ provider: 'meta' }, { $set: set, ...(resetVerify ? { $unset: { 'meta.capiVerifiedAt': '' } } : {}) });
        await audit(gate.auth, 'config_change', 'meta_assets', { adAccounts: set['meta.selectedAdAccountIds'], datasetId: set['meta.datasetId'], capiTokenReplaced: !!set['meta.capiTokenEnc'] }, req);
        await syncLog('meta', 'oauth', 'info', `Meta asset selection updated by ${gate.auth.username}${set['meta.capiTokenEnc'] ? ' (Conversions API token replaced)' : ''}`);
        break;
      }
      case 'healthcheck':
        await checkMetaHealth();
        break;
      default:
        return NextResponse.json({ message: 'Unknown action.' }, { status: 400 });
    }
    return NextResponse.json({ meta: publicConnectionView(await getConnection('meta')) });
  } catch (e) {
    return errorResponse(e);
  }
}
