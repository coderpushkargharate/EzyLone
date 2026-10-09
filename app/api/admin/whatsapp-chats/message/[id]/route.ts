import { NextRequest, NextResponse } from 'next/server';
import { isValidObjectId } from 'mongoose';
import { connectDB } from '@/lib/db';
import { WhatsAppMessage } from '@/lib/models/WhatsAppMessage';
import { requireAuth } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// DELETE /api/admin/whatsapp-chats/message/<id>
// Remove a SINGLE transcript row from the admin panel (one bubble in the chat).
// Note: this only clears our stored copy — it does NOT unsend the message from
// the user's WhatsApp (the WhatsApp API doesn't allow that reliably).
export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const gate = await requireAuth(req, { permission: 'whatsappChats' });
  if ('error' in gate) return gate.error;
  if (!isValidObjectId(params.id)) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  try {
    await connectDB();
    const res = await WhatsAppMessage.findByIdAndDelete(params.id);
    if (!res) {
      return NextResponse.json({ message: 'Message not found.' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, deletedId: params.id });
  } catch (error: any) {
    console.error('Error deleting message', error);

    return NextResponse.json({ message: 'Error deleting message' }, { status: 500 });
  }
}
