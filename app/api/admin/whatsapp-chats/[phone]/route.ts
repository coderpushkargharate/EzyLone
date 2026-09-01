import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { WhatsAppMessage } from '@/lib/models/WhatsAppMessage';
import { WhatsAppContact } from '@/lib/models/WhatsAppContact';
import { WhatsAppSession } from '@/lib/models/WhatsAppSession';
import { sendWhatsAppManual } from '@/lib/whatsapp';
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
    const [messages, contact] = await Promise.all([
      WhatsAppMessage.find({ phone }).sort({ createdAt: 1 }).limit(2000).lean(),
      WhatsAppContact.findOne({ phone }).lean(),
    ]);
    const mode = contact?.mode === 'manual' ? 'manual' : 'auto';
    return NextResponse.json({ phone, mode, messages });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error fetching conversation', error: error.message }, { status: 500 });
  }
}

// PATCH /api/admin/whatsapp-chats/<phone>  { mode: 'auto' | 'manual' }
// Flip a single conversation between the auto-reply bot and human takeover. In
// 'manual' mode the inbound webhook stops auto-replying to this user (see
// getContactMode in whatsappBrain) and the admin answers by hand via POST below.
export async function PATCH(req: NextRequest, { params }: { params: { phone: string } }) {
  if (!verifyAuth(req)) return unauthorized();
  try {
    const body = await req.json().catch(() => ({}));
    const mode = body?.mode === 'manual' ? 'manual' : 'auto';
    await connectDB();
    const phone = decodePhone(params.phone);
    await WhatsAppContact.findOneAndUpdate(
      { phone },
      { $set: { mode } },
      { upsert: true, new: true },
    );
    return NextResponse.json({ phone, mode });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error updating mode', error: error.message }, { status: 500 });
  }
}

// POST /api/admin/whatsapp-chats/<phone>  { message: string }
// Send a manual WhatsApp reply to this user from the admin panel (Twilio free
// text — valid because the user just messaged us, so the 24h window is open).
// On success the message is appended to the durable transcript as an 'admin'
// turn so it shows in the conversation. Also flips the contact to 'manual' so
// the bot doesn't fight the human on the next inbound message.
export async function POST(req: NextRequest, { params }: { params: { phone: string } }) {
  if (!verifyAuth(req)) return unauthorized();
  try {
    const body = await req.json().catch(() => ({}));
    const message = (body?.message || '').toString().trim();
    if (!message) {
      return NextResponse.json({ message: 'Message text is required.' }, { status: 400 });
    }

    await connectDB();
    const phone = decodePhone(params.phone);

    const result = await sendWhatsAppManual(phone, message);
    if (!result.ok) {
      return NextResponse.json(
        { message: result.error || 'WhatsApp send failed.' },
        { status: 502 },
      );
    }

    // Record the sent message + take this conversation off the bot.
    const saved = await WhatsAppMessage.create({
      phone,
      userMessage: '',
      botReply: message,
      source: 'admin',
      matched: true,
      score: 0,
      inFlow: false,
    });
    await WhatsAppContact.findOneAndUpdate(
      { phone },
      { $set: { mode: 'manual' } },
      { upsert: true },
    );
    // Keep conversation memory in sync so a later switch back to auto has context.
    try {
      const session = await WhatsAppSession.findOne({ phone }).lean();
      const history = ((session?.history || []) as { role: string; content: string }[])
        .concat([{ role: 'assistant', content: message }])
        .slice(-10);
      await WhatsAppSession.findOneAndUpdate({ phone }, { $set: { history } }, { upsert: true });
    } catch {
      // Non-fatal: the message already sent and is recorded in the transcript.
    }

    return NextResponse.json({ ok: true, message: saved });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error sending message', error: error.message }, { status: 500 });
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
