import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, unauthorized } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SELECT = 'username name email role permissions phone whatsapp company avatar settings';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function shape(u: any) {
  return {
    id: String(u._id),
    username: u.username,
    name: u.name || u.username,
    email: u.email || '',
    role: u.role || 'admin',
    permissions: u.permissions || [],
    phone: u.phone || '',
    whatsapp: u.whatsapp || '',
    company: u.company || '',
    avatar: u.avatar || '',
    settings: u.settings || {},
  };
}

// GET /api/me — the logged-in user's full profile (admins and employees).
export async function GET(req: NextRequest) {
  const gate = await requireAuth(req);
  if ('error' in gate) return gate.error;
  const auth = gate.auth;

  await connectDB();
  const user = await User.findById(auth.userId).select(SELECT).lean();
  if (!user) return unauthorized();

  return NextResponse.json({ user: shape(user) });
}

// PATCH /api/me — update your own profile / notification settings. A user can
// only ever edit these safe fields — never their role or permissions.
export async function PATCH(req: NextRequest) {
  const gate = await requireAuth(req);
  if ('error' in gate) return gate.error;
  const auth = gate.auth;

  await connectDB();
  const user = await User.findById(auth.userId);
  if (!user) return unauthorized();

  const body = await req.json().catch(() => ({}));
  if (typeof body.name === 'string') user.name = body.name.trim().slice(0, 100);
  if (typeof body.phone === 'string') user.phone = body.phone.trim().slice(0, 20);
  if (typeof body.whatsapp === 'string') user.whatsapp = body.whatsapp.trim().slice(0, 20);
  if (typeof body.company === 'string') user.company = body.company.trim().slice(0, 120);
  if (typeof body.avatar === 'string') {
    const av = body.avatar;
    const ok = av === '' || ((av.startsWith('https://') || av.startsWith('data:image/')) && av.length <= 700_000);
    if (!ok) return NextResponse.json({ message: 'Invalid avatar image' }, { status: 400 });
    user.avatar = av;
  }
  if (body.settings && typeof body.settings === 'object') {
    // Only known notification settings are stored.
    const next = { ...(user.settings || {}) };
    const st = body.settings;
    if (typeof st.leadAlertEmail === 'boolean') next.leadAlertEmail = st.leadAlertEmail;
    if (['always', 'updates', 'never'].includes(st.dailySummary)) next.dailySummary = st.dailySummary;
    if (typeof st.summaryHour === 'string' && /^[0-9]{1,2}:[0-9]{2}( ?[AP]M)?$/i.test(st.summaryHour)) next.summaryHour = st.summaryHour;
    user.settings = next;
  }

  await user.save();
  return NextResponse.json({ user: shape(user.toObject()) });
}
