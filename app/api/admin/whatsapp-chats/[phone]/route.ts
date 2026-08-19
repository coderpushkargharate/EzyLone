import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { WhatsAppMessage } from '@/lib/models/WhatsAppMessage';
import { verifyAuth, unauthorized } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// The phone/address is passed URL-encoded (it contains '+' and ':' for WhatsApp
// addresses like "whatsapp:+9198..."). Decode defensively either way.
function decodePhone(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

// GET /api/admin/whatsapp-chats/<phone> — full conversation transcript for one
// user, oldest→newest, so an admin can read exactly what they asked the Ezy AI
// WhatsApp bot and how it replied.
export async function GET(req: NextRequest, { params }: { params: { phone: string } }) {
  if (!verifyAuth(req)) return unauthorized();
  try {
    await connectDB();
    const phone = decodePhone(params.phone);
    const messages = await WhatsAppMessage.find({ phone }).sort({ createdAt: 1 }).limit(2000).lean();
    return NextResponse.json({ phone, messages });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error fetching conversation', error: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/whatsapp-chats/<phone> — remove one user's whole transcript.
export async function DELETE(req: NextRequest, { params }: { params: { phone: string } }) {
  if (!verifyAuth(req)) return unauthorized();
  try {
    await connectDB();
    const phone = decodePhone(params.phone);
    const res = await WhatsAppMessage.deleteMany({ phone });
    return NextResponse.json({ message: 'Conversation deleted', deleted: res.deletedCount });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error deleting conversation', error: error.message }, { status: 500 });
  }
}
