import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, unauthorized } from '@/lib/auth';
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
  const auth = verifyAuth(req);
  if (!auth) return unauthorized();

  await connectDB();
  const user = await User.findById(auth.userId).select(SELECT).lean();
  if (!user) return unauthorized();

  return NextResponse.json({ user: shape(user) });
}

// PATCH /api/me — update your own profile / notification settings. A user can
// only ever edit these safe fields — never their role or permissions.
export async function PATCH(req: NextRequest) {
  const auth = verifyAuth(req);
  if (!auth) return unauthorized();

  await connectDB();
  const user = await User.findById(auth.userId);
  if (!user) return unauthorized();

  const body = await req.json();
  if (typeof body.name === 'string') user.name = body.name.trim();
  if (typeof body.phone === 'string') user.phone = body.phone.trim();
  if (typeof body.whatsapp === 'string') user.whatsapp = body.whatsapp.trim();
  if (typeof body.company === 'string') user.company = body.company.trim();
  if (typeof body.avatar === 'string') user.avatar = body.avatar;
  if (body.settings && typeof body.settings === 'object') {
    user.settings = { ...(user.settings || {}), ...body.settings };
  }

  await user.save();
  return NextResponse.json({ user: shape(user.toObject()) });
}
