import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { ChatLog } from '@/lib/models/ChatLog';
import { verifyAuth, unauthorized } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// PATCH /api/admin/chatlogs/[id] — mark a logged question resolved/dismissed
// (e.g. after teaching the bot an answer for it, or ignoring spam).
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!verifyAuth(req)) return unauthorized();
  try {
    const { id } = params;
    const body = await req.json().catch(() => ({}));
    await connectDB();
    const log = await ChatLog.findByIdAndUpdate(
      id,
      { resolved: body.resolved !== false },
      { new: true },
    );
    if (!log) return NextResponse.json({ message: 'Log not found' }, { status: 404 });
    return NextResponse.json({ message: 'Updated', log });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error updating log', error: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/chatlogs/[id] — remove a single logged question.
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!verifyAuth(req)) return unauthorized();
  try {
    const { id } = params;
    await connectDB();
    const log = await ChatLog.findByIdAndDelete(id);
    if (!log) return NextResponse.json({ message: 'Log not found' }, { status: 404 });
    return NextResponse.json({ message: 'Log deleted' });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error deleting log', error: error.message }, { status: 500 });
  }
}
