import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { signToken, setAuthCookie, ensureAdmin } from '@/lib/auth';
import { loginRateLimit } from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const limited = loginRateLimit(req);
  if (limited) return limited;

  try {
    const { username, password } = await req.json();

    await connectDB();
    // Bootstrap the first admin from env on demand if it isn't there yet.
    await ensureAdmin();

    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const token = signToken({ userId: String(user._id), username: user.username });
    const res = NextResponse.json({ user: { id: user._id, username: user.username } });
    setAuthCookie(res, token);
    return res;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
