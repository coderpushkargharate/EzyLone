import { NextRequest, NextResponse } from 'next/server';
import { isValidObjectId } from 'mongoose';
import { connectDB } from '@/lib/db';
import { Content } from '@/lib/models/Content';
import { requireAuth } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const gate = await requireAuth(req, { permission: 'content' });
  if ('error' in gate) return gate.error;
  if (!isValidObjectId(params.id)) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  const user = gate.auth;

  await connectDB();
  await Content.findByIdAndDelete(params.id);
  return NextResponse.json({ success: true });
}
