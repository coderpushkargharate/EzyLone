import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { ChatLog } from '@/lib/models/ChatLog';
import { verifyAuth, unauthorized } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/admin/chatlogs?status=unanswered|all — conversation log / training data.
// `unanswered` returns only the questions the knowledge base couldn't confidently
// answer and that haven't been taught/dismissed yet, newest first.
export async function GET(req: NextRequest) {
  if (!verifyAuth(req)) return unauthorized();
  try {
    await connectDB();
    const status = req.nextUrl.searchParams.get('status') || 'all';
    const channel = req.nextUrl.searchParams.get('channel') || 'all'; // 'web' | 'whatsapp' | 'all'
    const filter: Record<string, unknown> = status === 'unanswered' ? { matched: false, resolved: false } : {};
    if (channel === 'web' || channel === 'whatsapp') filter.channel = channel;
    const logs = await ChatLog.find(filter).sort({ createdAt: -1 }).limit(500).lean();
    return NextResponse.json(logs);
  } catch (error: any) {
    return NextResponse.json({ message: 'Error fetching chat logs', error: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/chatlogs?scope=resolved|all — clear logs (admin only).
export async function DELETE(req: NextRequest) {
  if (!verifyAuth(req)) return unauthorized();
  try {
    await connectDB();
    const scope = req.nextUrl.searchParams.get('scope') || 'resolved';
    const filter = scope === 'all' ? {} : { resolved: true };
    const res = await ChatLog.deleteMany(filter);
    return NextResponse.json({ message: 'Logs cleared', deleted: res.deletedCount });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error clearing logs', error: error.message }, { status: 500 });
  }
}
