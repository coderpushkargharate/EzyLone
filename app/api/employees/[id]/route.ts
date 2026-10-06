import { NextRequest, NextResponse } from 'next/server';
import { isValidObjectId } from 'mongoose';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { PushSubscription } from '@/lib/models/PushSubscription';
import { requireAuth, revokeUserSessions } from '@/lib/auth';
import { sanitizePermissions, passwordProblem } from '@/lib/adminTabs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Only admins may manage employees. Any change to access (permissions, password,
// disabled) revokes the employee's existing sessions so it applies immediately.

// PATCH /api/employees/:id — update name, permissions, disabled and (optionally) password.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const gate = await requireAuth(req, { adminOnly: true });
  if ('error' in gate) return gate.error;
  if (!isValidObjectId(params.id)) return NextResponse.json({ message: 'Employee not found' }, { status: 404 });

  await connectDB();
  const employee = await User.findOne({ _id: params.id, role: 'employee' });
  if (!employee) return NextResponse.json({ message: 'Employee not found' }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  let accessChanged = false;
  if (typeof body.name === 'string') employee.name = body.name.trim().slice(0, 100);
  if (Array.isArray(body.permissions)) {
    employee.permissions = sanitizePermissions(body.permissions);
    accessChanged = true;
  }
  if (typeof body.disabled === 'boolean') {
    employee.disabled = body.disabled;
    accessChanged = true;
  }
  // Only reset the password when a new, non-empty one is provided. Assigning to
  // the field triggers the pre-save hash hook (findByIdAndUpdate would skip it).
  if (body.password) {
    const pwErr = passwordProblem(String(body.password));
    if (pwErr) return NextResponse.json({ message: pwErr }, { status: 400 });
    employee.password = String(body.password);
    accessChanged = true;
  }

  await employee.save();
  if (accessChanged) {
    await revokeUserSessions(String(employee._id));
    if (employee.disabled) await PushSubscription.deleteMany({ userId: employee._id });
  }

  return NextResponse.json({
    employee: {
      id: employee._id,
      name: employee.name,
      email: employee.email,
      permissions: employee.permissions,
      disabled: !!employee.disabled,
    },
  });
}

// DELETE /api/employees/:id — remove an employee account and everything tied to its login.
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const gate = await requireAuth(req, { adminOnly: true });
  if ('error' in gate) return gate.error;
  if (!isValidObjectId(params.id)) return NextResponse.json({ message: 'Employee not found' }, { status: 404 });

  await connectDB();
  const result = await User.findOneAndDelete({ _id: params.id, role: 'employee' });
  if (!result) return NextResponse.json({ message: 'Employee not found' }, { status: 404 });

  await revokeUserSessions(String(result._id));
  await PushSubscription.deleteMany({ userId: result._id });
  return NextResponse.json({ success: true });
}
