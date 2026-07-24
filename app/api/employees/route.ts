import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { verifyAuth, unauthorized, isAdmin } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Only admins may manage employees.
function guardAdmin(req: NextRequest) {
  const auth = verifyAuth(req);
  if (!auth) return { error: unauthorized() };
  if (!isAdmin(auth)) return { error: NextResponse.json({ message: 'Admins only' }, { status: 403 }) };
  return { auth };
}

// GET /api/employees — list all employee accounts (never returns passwords).
export async function GET(req: NextRequest) {
  const { error } = guardAdmin(req);
  if (error) return error;

  await connectDB();
  const employees = await User.find({ role: 'employee' })
    .select('name email username permissions createdAt')
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ employees });
}

// POST /api/employees — create an employee with email + password + tab access.
export async function POST(req: NextRequest) {
  const { error } = guardAdmin(req);
  if (error) return error;

  await connectDB();
  const body = await req.json();
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  const permissions: string[] = Array.isArray(body.permissions) ? body.permissions : [];

  if (!email) return NextResponse.json({ message: 'Email is required' }, { status: 400 });
  if (!password || password.length < 6) {
    return NextResponse.json({ message: 'Password must be at least 6 characters' }, { status: 400 });
  }

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
    },
  }, { status: 201 });
}
