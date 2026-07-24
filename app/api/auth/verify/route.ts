import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, unauthorized } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Verify the cookie AND return the user's *current* role/permissions from the
// DB — so an employee's access reflects the latest admin changes on refresh,
// not whatever was true when their token was issued.
export async function GET(req: NextRequest) {
  const auth = verifyAuth(req);
  if (!auth) return unauthorized('Invalid token');

  await connectDB();
  const user = await User.findById(auth.userId)
    .select('username name email role permissions')
    .lean();

  if (!user) return unauthorized('Invalid token');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const u = user as any;
  return NextResponse.json({
    user: {
      id: String(u._id),
      username: u.username,
      name: u.name || u.username,
      email: u.email || '',
      role: u.role || 'admin',
      permissions: u.permissions || [],
    },
  });
}
