import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { KnowledgeEntry } from '@/lib/models/KnowledgeEntry';
import { verifyAuth, unauthorized } from '@/lib/auth';
import { invalidateBrain } from '@/lib/chatbot/knowledgeBase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function toList(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((s) => String(s).trim()).filter(Boolean);
  if (typeof v === 'string') return v.split(/[\n,]/).map((s) => s.trim()).filter(Boolean);
  return [];
}

// PUT /api/admin/knowledge/[id] — update an entry (admin only).
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!verifyAuth(req)) return unauthorized();
  try {
    const { id } = params;
    const body = await req.json();

    const update: Record<string, any> = {};
    if (body.question !== undefined) update.question = String(body.question).trim();
    if (body.answer !== undefined) update.answer = String(body.answer).trim();
    if (body.variants !== undefined) update.variants = toList(body.variants);
    if (body.keywords !== undefined) update.keywords = toList(body.keywords);
    if (body.category !== undefined) update.category = String(body.category).trim() || 'General';
    if (body.enabled !== undefined) update.enabled = !!body.enabled;

    await connectDB();
    const entry = await KnowledgeEntry.findByIdAndUpdate(id, update, { new: true });
    if (!entry) return NextResponse.json({ message: 'Entry not found' }, { status: 404 });

    invalidateBrain();
    return NextResponse.json({ message: 'Knowledge updated', entry });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error updating knowledge', error: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/knowledge/[id] — remove an entry (admin only).
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!verifyAuth(req)) return unauthorized();
  try {
    const { id } = params;
    await connectDB();
    const entry = await KnowledgeEntry.findByIdAndDelete(id);
    if (!entry) return NextResponse.json({ message: 'Entry not found' }, { status: 404 });

    invalidateBrain();
    return NextResponse.json({ message: 'Knowledge deleted' });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error deleting knowledge', error: error.message }, { status: 500 });
  }
}
