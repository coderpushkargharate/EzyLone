import { NextRequest, NextResponse } from 'next/server';
import { isValidObjectId } from 'mongoose';
import { connectDB } from '@/lib/db';
import { Lead } from '@/lib/models/Lead';
import { Activity } from '@/lib/models/Activity';
import { requireAuth } from '@/lib/auth';
import { pickLeadFields } from '@/lib/leadInput';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const notFound = () => NextResponse.json({ error: 'Not found' }, { status: 404 });

// GET /api/leads/:id — the lead plus its full activity timeline.
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const gate = await requireAuth(req, { permission: 'leads' });
  if ('error' in gate) return gate.error;
  if (!isValidObjectId(params.id)) return notFound();

  await connectDB();
  const lead = await Lead.findById(params.id).lean();
  if (!lead) return notFound();

  const activities = await Activity.find({ leadId: params.id }).sort({ createdAt: -1 }).limit(500).lean();
  return NextResponse.json({ lead, activities });
}

// PATCH /api/leads/:id — partial update of staff-editable fields. A status change logs an activity.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const gate = await requireAuth(req, { permission: 'leads' });
  if ('error' in gate) return gate.error;
  const user = gate.auth;
  if (!isValidObjectId(params.id)) return notFound();

  await connectDB();
  const body = await req.json().catch(() => ({}));
  const fields = pickLeadFields(body);
  const existing = await Lead.findById(params.id);
  if (!existing) return notFound();

  try {
    if (fields.status && fields.status !== existing.status) {
      await Activity.create({
        leadId: params.id,
        userId: user.userId,
        type: 'status_change',
        description: `Status changed from "${existing.status}" to "${fields.status}"`,
      });
    }

    const lead = await Lead.findByIdAndUpdate(
      params.id,
      { ...fields, lastActivity: new Date() },
      { new: true, runValidators: true }
    ).lean();

    return NextResponse.json({ lead });
  } catch (error) {
    console.error('Update lead error:', error);
    return NextResponse.json({ message: 'Could not update lead. Check the values and try again.' }, { status: 400 });
  }
}

// DELETE /api/leads/:id — remove the lead and its activities.
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const gate = await requireAuth(req, { permission: 'leads' });
  if ('error' in gate) return gate.error;
  if (!isValidObjectId(params.id)) return notFound();

  await connectDB();
  await Lead.findByIdAndDelete(params.id);
  await Activity.deleteMany({ leadId: params.id });

  return NextResponse.json({ success: true });
}
