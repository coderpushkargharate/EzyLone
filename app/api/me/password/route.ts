import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { requireAuth, revokeUserSessions } from '@/lib/auth';
import { passwordProblem } from '@/lib/adminTabs';
import { loginIdentifierLimit } from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST /api/me/password { currentPassword, newPassword }
// Changing your own password requires re-entering the current one. On success
// every OTHER session of this account is signed out (stolen cookies stop working);
// the current device stays signed in.
export async function POST(req: NextRequest) {
  const gate = await requireAuth(req);
  if ('error' in gate) return gate.error;
  const { auth } = gate;

  // Shares the per-account login throttle, so this can't be used to guess passwords.
  const limited = loginIdentifierLimit(auth.username.toLowerCase());
  if (limited) return limited;

  const body = await req.json().catch(() => ({}));
  const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : '';
  const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';

  const problem = passwordProblem(newPassword);
  if (problem) return NextResponse.json({ message: problem }, { status: 400 });
  if (newPassword === currentPassword) {
    return NextResponse.json({ message: 'Choose a password different from the current one' }, { status: 400 });
  }

  await connectDB();
  const user = await User.findById(auth.userId);
  if (!user || !currentPassword || currentPassword.length > 128 || !(await user.comparePassword(currentPassword))) {
    return NextResponse.json({ message: 'Current password is incorrect.' }, { status: 400 });
  }

  user.password = newPassword; // hashed by the pre-save hook
  await user.save();
  await revokeUserSessions(auth.userId, auth.sid);

  return NextResponse.json({ message: 'Password changed. Other devices have been signed out.' });
}
