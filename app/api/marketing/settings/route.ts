import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { audit } from '@/lib/audit';
import { requireAuth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';
import { MarketingSettings } from '@/lib/models/MarketingSettings';
import { getSettings, invalidateSettingsCache, sanitizeSettingsUpdate } from '@/lib/marketing/settings';
import { syncLog } from '@/lib/marketing/log';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// PUT /api/marketing/settings — admin only. Event mappings, consent policy, test mode.
export async function PUT(req: NextRequest) {
  const gate = await requireAuth(req, { adminOnly: true });
  if ('error' in gate) return gate.error;
  const limited = checkRateLimit(req, 'marketing-settings', { windowMs: 60_000, max: 30, message: 'Too many changes — slow down.' });
  if (limited) return limited;

  const body = await req.json().catch(() => null);
  const clean = sanitizeSettingsUpdate(body);
  if ('error' in clean) return NextResponse.json({ message: clean.error }, { status: 400 });

  await connectDB();
  await getSettings(true); // ensure the row exists
  await MarketingSettings.updateOne({ key: 'default' }, { $set: { ...clean.update, updatedBy: gate.auth.username } });
  invalidateSettingsCache();
  const settings = await getSettings(true);
  await syncLog('system', 'settings', 'info', `Marketing settings updated by ${gate.auth.username}`);
  await audit(gate.auth, 'config_change', 'marketing_settings', { fields: Object.keys(clean.update) }, req);
  return NextResponse.json({ settings });
}
