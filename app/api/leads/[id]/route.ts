import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Lead } from '@/lib/models/Lead';
import { Activity } from '@/lib/models/Activity';
import { verifyAuth, unauthorized } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/leads/:id — the lead plus its full activity timeline.
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = verifyAuth(req);
  if (!user) return unauthorized();

  await connectDB();
  const lead = await Lead.findById(params.id).lean();
  if (!lead) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const activities = await Activity.find({ leadId: params.id }).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ lead, activities });
}

// PATCH /api/leads/:id — partial update. A status change logs an activity.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = verifyAuth(req);
  if (!user) return unauthorized();

  await connectDB();
  const body = await req.json();
  const existing = await Lead.findById(params.id);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (body.status && body.status !== existing.status) {
    await Activity.create({
      leadId: params.id,
      userId: user.userId,
      type: 'status_change',
      description: `Status changed from "${existing.status}" to "${body.status}"`,
    });
  }

  const lead = await Lead.findByIdAndUpdate(
    params.id,
    { ...body, lastActivity: new Date() },
    { new: true }
  ).lean();

  return NextResponse.json({ lead });
}

// DELETE /api/leads/:id — remove the lead and its activities.
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = verifyAuth(req);
  if (!user) return unauthorized();

  await connectDB();
  await Lead.findByIdAndDelete(params.id);
  await Activity.deleteMany({ leadId: params.id });

  return NextResponse.json({ success: true });
}
