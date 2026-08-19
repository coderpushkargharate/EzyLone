import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { WhatsAppMessage } from '@/lib/models/WhatsAppMessage';
import { verifyAuth, unauthorized } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/admin/whatsapp-chats?search=<text>
// One row per WhatsApp user, newest activity first: their address, last message
// preview, when it happened, total turns, and how many questions the bot could
// NOT confidently answer (a training signal). Powers the conversation list in the
// admin "WhatsApp Chats" panel; click a row to load that user's full transcript.
export async function GET(req: NextRequest) {
  if (!verifyAuth(req)) return unauthorized();
  try {
    await connectDB();
    const search = (req.nextUrl.searchParams.get('search') || '').trim();

    const match: Record<string, unknown> = {};
    if (search) {
      // Match on the phone/address or anything the user has said.
      const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      match.$or = [{ phone: rx }, { userMessage: rx }];
    }

    const convos = await WhatsAppMessage.aggregate([
      { $match: match },
      { $sort: { createdAt: 1 } },
      {
        $group: {
          _id: '$phone',
          count: { $sum: 1 },
          unanswered: { $sum: { $cond: [{ $eq: ['$matched', false] }, 1, 0] } },
          lastMessage: { $last: '$userMessage' },
          lastReply: { $last: '$botReply' },
          lastAt: { $last: '$createdAt' },
          firstAt: { $first: '$createdAt' },
        },
      },
      { $sort: { lastAt: -1 } },
      { $limit: 500 },
    ]);

    const rows = convos.map((c: any) => ({
      phone: c._id,
      count: c.count,
      unanswered: c.unanswered,
      lastMessage: c.lastMessage,
      lastReply: c.lastReply,
      lastAt: c.lastAt,
      firstAt: c.firstAt,
    }));

    return NextResponse.json(rows);
  } catch (error: any) {
    return NextResponse.json({ message: 'Error fetching WhatsApp chats', error: error.message }, { status: 500 });
  }
}
