import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { audit } from '@/lib/audit';
import { requireAuth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';
import { MarketingConnection } from '@/lib/models/MarketingConnection';
import { getConnection, publicConnectionView, recordConnectionError } from '@/lib/marketing/connections';
import { describeCustomer, listAccessibleCustomers, listConversionActions } from '@/lib/marketing/google/api';
import { cleanCustomerId } from '@/lib/marketing/google/payload';
import { checkGoogleHealth } from '@/lib/marketing/health';
import { errorResponse } from '@/lib/marketing/http';
import { syncLog } from '@/lib/marketing/log';
import { PlatformError } from '@/lib/marketing/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST /api/marketing/google/assets — admin only.
//   { action: 'refresh' }                                list accessible Google Ads customers
//   { action: 'select', customerId, loginCustomerId? }   choose the account; loads conversion actions
//   { action: 'actions' }                                reload conversion actions
//   { action: 'healthcheck' }
export async function POST(req: NextRequest) {
  const gate = await requireAuth(req, { adminOnly: true });
  if ('error' in gate) return gate.error;
  const limited = checkRateLimit(req, 'marketing-google-assets', { windowMs: 60_000, max: 30, message: 'Too many requests.' });
  if (limited) return limited;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

  try {
    await connectDB();
    const conn = await getConnection('google');
    if (!conn || conn.status === 'disconnected') return NextResponse.json({ message: 'Google Ads is not connected.' }, { status: 412 });

    switch (body.action) {
      case 'refresh': {
        const ids = await listAccessibleCustomers();
        const customers = [];
        for (const id of ids.slice(0, 25)) {
          try {
            customers.push(await describeCustomer(id));
          } catch {
            customers.push({ id }); // listed but not directly queryable (e.g. needs a manager login id)
          }
        }
        await MarketingConnection.updateOne({ provider: 'google' }, { $set: { 'google.accessibleCustomers': customers, lastSuccessAt: new Date() } });
        await syncLog('google', 'oauth', 'ok', `Found ${customers.length} accessible Google Ads account(s)`);
        break;
      }
      case 'select':
      case 'actions': {
        const customerId = body.action === 'select' ? cleanCustomerId(body.customerId) : conn.google?.customerId;
        const loginCustomerId = body.action === 'select' ? (body.loginCustomerId ? cleanCustomerId(body.loginCustomerId) : null) : conn.google?.loginCustomerId;
        if (!customerId) return NextResponse.json({ message: 'Customer ID must be 10 digits.' }, { status: 400 });
        if (body.action === 'select' && body.loginCustomerId && !loginCustomerId) {
          return NextResponse.json({ message: 'Manager (login) customer ID must be 10 digits.' }, { status: 400 });
        }
        const info = await describeCustomer(customerId, loginCustomerId);
        const actions = await listConversionActions(customerId, loginCustomerId);
        await MarketingConnection.updateOne(
          { provider: 'google' },
          {
            $set: {
              'google.customerId': customerId,
              'google.loginCustomerId': loginCustomerId || undefined,
              'google.currency': info.currency,
              'google.conversionActions': actions,
              accountId: customerId,
              accountName: info.name || customerId,
              lastSuccessAt: new Date(),
            },
            ...(customerId !== conn.google?.customerId ? { $unset: { 'google.uploadVerifiedAt': '' } } : {}),
          }
        );
        await audit(gate.auth, 'config_change', 'google_ads_account', { customerId, loginCustomerId }, req);
        await syncLog('google', 'oauth', 'ok', `Using Google Ads account ${customerId} — ${actions.length} enabled conversion action(s)`);
        break;
      }
      case 'healthcheck':
        await checkGoogleHealth();
        break;
      default:
        return NextResponse.json({ message: 'Unknown action.' }, { status: 400 });
    }
    return NextResponse.json({ google: publicConnectionView(await getConnection('google')) });
  } catch (e) {
    if (e instanceof PlatformError && (e.kind === 'auth' || e.kind === 'permission')) await recordConnectionError('google', e.message, e.kind);
    return errorResponse(e);
  }
}
