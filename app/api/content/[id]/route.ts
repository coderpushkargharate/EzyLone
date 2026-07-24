import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Content } from '@/lib/models/Content';
import { verifyAuth, unauthorized } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = verifyAuth(req);
  if (!user) return unauthorized();

  await connectDB();
  await Content.findByIdAndDelete(params.id);
  return NextResponse.json({ success: true });
}
