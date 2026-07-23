import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { KnowledgeEntry } from '@/lib/models/KnowledgeEntry';
import { verifyAuth, unauthorized } from '@/lib/auth';
import { invalidateBrain, seedKnowledgeBase, channelFilter } from '@/lib/chatbot/knowledgeBase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Accept a comma/newline separated string OR an array → clean string[].
function toList(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((s) => String(s).trim()).filter(Boolean);
  if (typeof v === 'string') return v.split(/[\n,]/).map((s) => s.trim()).filter(Boolean);
  return [];
}

// GET /api/admin/knowledge — list all entries (admin only). Seeds the base with
// the built-in FAQ/product knowledge the first time it's empty.
export async function GET(req: NextRequest) {
  if (!verifyAuth(req)) return unauthorized();
  try {
    await connectDB();
    await seedKnowledgeBase(); // no-op once any entry exists
    // scope=web|whatsapp shows that brain's entries (incl. shared 'both'); all = everything.
    const scope = req.nextUrl.searchParams.get('scope');
    const filter = scope === 'web' || scope === 'whatsapp' ? channelFilter(scope) : {};
    const entries = await KnowledgeEntry.find(filter).sort({ updatedAt: -1 }).lean();
    return NextResponse.json(entries);
  } catch (error: any) {
    return NextResponse.json({ message: 'Error fetching knowledge', error: error.message }, { status: 500 });
  }
}

// POST /api/admin/knowledge — create/teach a new entry (admin only).
export async function POST(req: NextRequest) {
  if (!verifyAuth(req)) return unauthorized();
  try {
    const body = await req.json();
    const question = String(body.question || '').trim();
    const answer = String(body.answer || '').trim();
    if (!question || !answer) {
      return NextResponse.json({ message: 'Question and answer are required' }, { status: 400 });
    }

    await connectDB();
    const channel = ['both', 'web', 'whatsapp'].includes(body.channel) ? body.channel : 'both';
    const entry = await KnowledgeEntry.create({
      question,
      answer,
      variants: toList(body.variants),
      keywords: toList(body.keywords),
      category: String(body.category || 'General').trim() || 'General',
      channel,
      enabled: body.enabled !== false,
    });
    invalidateBrain(); // new answer takes effect on the next question
    return NextResponse.json({ message: 'Knowledge added', entry }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error adding knowledge', error: error.message }, { status: 500 });
  }
}
