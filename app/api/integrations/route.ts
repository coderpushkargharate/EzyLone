import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Integration } from '@/lib/models/Integration';
import { verifyAuth, unauthorized } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Secret fields — we never send their value back to the browser, only whether set.
const SECRET_FIELDS = ['pageAccessToken', 'accessToken', 'appSecret'];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function redact(config: Record<string, any> = {}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(config)) {
    if (SECRET_FIELDS.includes(k)) {
      out[k] = v ? '••••••••' : '';
      out[`${k}_set`] = Boolean(v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

export async function GET(req: NextRequest) {
  const user = verifyAuth(req);
  if (!user) return unauthorized();

  await connectDB();
  const list = await Integration.find({}).lean();
  const items = list.map((i) => ({
    provider: i.provider,
    enabled: i.enabled,
    connectedAt: i.connectedAt,
    config: redact(i.config),
  }));
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const user = verifyAuth(req);
  if (!user) return unauthorized();

  await connectDB();
  const body = await req.json();
  const { provider, enabled, config } = body as {
    provider: string;
    enabled?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    config?: Record<string, any>;
  };

  if (!provider || !['facebook', 'whatsapp'].includes(provider)) {
    return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
  }

  const existing = await Integration.findOne({ provider });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mergedConfig: Record<string, any> = { ...(existing?.config || {}) };

  // Only overwrite a secret when a real (non-masked, non-empty) value is sent,
  // so re-saving the form without re-typing the token keeps the old one.
  for (const [k, v] of Object.entries(config || {})) {
    if (typeof v === 'string' && v.includes('••')) continue;
    if (SECRET_FIELDS.includes(k) && (v === '' || v == null)) continue;
    mergedConfig[k] = v;
  }

  const doc = await Integration.findOneAndUpdate(
    { provider },
    {
      provider,
      enabled: enabled ?? existing?.enabled ?? true,
      config: mergedConfig,
      connectedAt: existing?.connectedAt || new Date(),
    },
    { new: true, upsert: true }
  ).lean();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d = doc as any;
  return NextResponse.json({
    integration: { provider: d.provider, enabled: d.enabled, connectedAt: d.connectedAt, config: redact(d.config) },
  });
}
