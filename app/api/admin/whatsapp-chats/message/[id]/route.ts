import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { WhatsAppMessage } from '@/lib/models/WhatsAppMessage';
import { verifyAuth, unauthorized } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// DELETE /api/admin/whatsapp-chats/message/<id>
// Remove a SINGLE transcript row from the admin panel (one bubble in the chat).
// Note: this only clears our stored copy — it does NOT unsend the message from
// the user's WhatsApp (the WhatsApp API doesn't allow that reliably).
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!verifyAuth(req)) return unauthorized();
  try {
    await connectDB();
    const res = await WhatsAppMessage.findByIdAndDelete(params.id);
    if (!res) {
      return NextResponse.json({ message: 'Message not found.' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, deletedId: params.id });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error deleting message', error: error.message }, { status: 500 });
  }
}
