import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { verifyAuth, unauthorized, isAdmin } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function guardAdmin(req: NextRequest) {
  const auth = verifyAuth(req);
  if (!auth) return { error: unauthorized() };
  if (!isAdmin(auth)) return { error: NextResponse.json({ message: 'Admins only' }, { status: 403 }) };
  return { auth };
}

// PATCH /api/employees/:id — update name, permissions, and (optionally) password.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = guardAdmin(req);
  if (error) return error;

  await connectDB();
  const employee = await User.findOne({ _id: params.id, role: 'employee' });
  if (!employee) return NextResponse.json({ message: 'Employee not found' }, { status: 404 });

  const body = await req.json();
  if (typeof body.name === 'string') employee.name = body.name.trim();
  if (Array.isArray(body.permissions)) employee.permissions = body.permissions;
  // Only reset the password when a new, non-empty one is provided. Assigning to
  // the field triggers the pre-save hash hook (findByIdAndUpdate would skip it).
  if (body.password) {
    if (String(body.password).length < 6) {
      return NextResponse.json({ message: 'Password must be at least 6 characters' }, { status: 400 });
    }
    employee.password = String(body.password);
  }

  await employee.save();

  return NextResponse.json({
    employee: {
      id: employee._id,
      name: employee.name,
      email: employee.email,
      permissions: employee.permissions,
    },
  });
}

// DELETE /api/employees/:id — remove an employee account.
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = guardAdmin(req);
  if (error) return error;

  await connectDB();
  const result = await User.findOneAndDelete({ _id: params.id, role: 'employee' });
  if (!result) return NextResponse.json({ message: 'Employee not found' }, { status: 404 });

  return NextResponse.json({ success: true });
}
