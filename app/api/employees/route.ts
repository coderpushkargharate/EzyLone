import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { requireAuth } from '@/lib/auth';
import { sanitizePermissions, passwordProblem } from '@/lib/adminTabs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Only admins may manage employees.

// GET /api/employees — list all employee accounts (never returns passwords).
export async function GET(req: NextRequest) {
  const gate = await requireAuth(req, { adminOnly: true });
  if ('error' in gate) return gate.error;

  await connectDB();
  const employees = await User.find({ role: 'employee' })
    .select('name email username permissions disabled lastLoginAt createdAt')
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ employees });
}

// POST /api/employees — create an employee with email + password + tab access.
export async function POST(req: NextRequest) {
  const gate = await requireAuth(req, { adminOnly: true });
  if ('error' in gate) return gate.error;

  await connectDB();
  const body = await req.json().catch(() => ({}));
  const name = String(body.name || '').trim().slice(0, 100);
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  const permissions = sanitizePermissions(body.permissions);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return NextResponse.json({ message: 'A valid email is required' }, { status: 400 });
  }
  const pwErr = passwordProblem(password);
  if (pwErr) return NextResponse.json({ message: pwErr }, { status: 400 });

  const exists = await User.findOne({ $or: [{ email }, { username: email }] });
  if (exists) return NextResponse.json({ message: 'An account with this email already exists' }, { status: 409 });

  // username is required + unique on the model; use the email for employees.
  const employee = await User.create({
    username: email,
    email,
    name: name || email,
    password,
    role: 'employee',
    permissions,
  });

  return NextResponse.json({
    employee: {
      id: employee._id,
      name: employee.name,
      email: employee.email,
      permissions: employee.permissions,
      disabled: false,
    },
  }, { status: 201 });
}
