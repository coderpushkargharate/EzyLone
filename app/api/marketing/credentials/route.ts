import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';
import { audit } from '@/lib/audit';
import { CRED_DEFS, credentialStatus, generateSecretValue, saveCredential, validateCredential } from '@/lib/credentials';
import { syncLog } from '@/lib/marketing/log';
import { ensureEncryptionKey } from '@/lib/marketing/keyManager';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// API keys entered in Admin → Marketing & Ads → Settings. Admin only.
// GET  → which keys are set and from where (public IDs shown; secrets never returned)
// PUT  { values: { NAME: 'value' | '' } }  → save / clear ('' clears the panel value)
// POST { action: 'generate', name }        → create a random secret (verify token /
//      lead webhook secret), save it, and return it ONCE so it can be pasted into Meta / the form tool.

export async function GET(req: NextRequest) {
  const gate = await requireAuth(req, { adminOnly: true });
  if ('error' in gate) return gate.error;
  return NextResponse.json({ credentials: await credentialStatus() }, { headers: { 'Cache-Control': 'private, no-store' } });
}

export async function PUT(req: NextRequest) {
  const gate = await requireAuth(req, { adminOnly: true });
  if ('error' in gate) return gate.error;
  const limited = checkRateLimit(req, 'marketing-credentials', { windowMs: 60_000, max: 20, message: 'Too many changes — slow down.' });
  if (limited) return limited;
  const body = (await req.json().catch(() => ({}))) as { values?: Record<string, unknown> };
  const values = body.values && typeof body.values === 'object' ? body.values : null;
  if (!values) return NextResponse.json({ message: 'Send { values: { NAME: value } }.' }, { status: 400 });

  // Validate everything first, so a bad value never leaves a half-saved set.
  for (const [name, value] of Object.entries(values)) {
    const invalid = validateCredential(name, value);
    if (invalid) return NextResponse.json({ message: invalid, saved: [] }, { status: 400 });
  }
  // Secrets need a usable key that matches existing data — check before saving anything.
  if (Object.entries(values).some(([n, v]) => CRED_DEFS.find((d) => d.name === n)?.secret && String(v ?? '').trim())) {
    try {
      await ensureEncryptionKey();
    } catch (e) {
      return NextResponse.json({ message: e instanceof Error ? e.message : 'Encryption key problem.', saved: [] }, { status: 409 });
    }
  }
  const changed: string[] = [];
  for (const [name, value] of Object.entries(values)) {
    const err = await saveCredential(name, value, gate.auth.username);
    if (err) return NextResponse.json({ message: err, saved: changed }, { status: 400 });
    changed.push(name);
  }
  if (changed.length) {
    await audit(gate.auth, 'credentials_change', changed.join(','), { cleared: changed.filter((n) => values[n] === '') }, req);
    await syncLog('system', 'settings', 'info', `API keys updated by ${gate.auth.username}: ${changed.join(', ')}`);
  }
  return NextResponse.json({ credentials: await credentialStatus(), saved: changed });
}

export async function POST(req: NextRequest) {
  const gate = await requireAuth(req, { adminOnly: true });
  if ('error' in gate) return gate.error;
  const limited = checkRateLimit(req, 'marketing-credentials', { windowMs: 60_000, max: 20, message: 'Too many changes — slow down.' });
  if (limited) return limited;
  const { action, name } = (await req.json().catch(() => ({}))) as { action?: string; name?: string };
  const def = CRED_DEFS.find((d) => d.name === name);
  if (action !== 'generate' || !def?.generate) return NextResponse.json({ message: 'Only the verify token and lead webhook secret can be generated.' }, { status: 400 });
  const value = generateSecretValue();
  const err = await saveCredential(def.name, value, gate.auth.username);
  if (err) return NextResponse.json({ message: err }, { status: 400 });
  await audit(gate.auth, 'credentials_change', def.name, { generated: true }, req);
  return NextResponse.json({ name: def.name, value, note: 'Copy it now — it will not be shown again.', credentials: await credentialStatus() }, { headers: { 'Cache-Control': 'no-store' } });
}
