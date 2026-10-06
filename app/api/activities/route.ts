import { NextRequest, NextResponse } from 'next/server';
import { isValidObjectId } from 'mongoose';
import { connectDB } from '@/lib/db';
import { Lead } from '@/lib/models/Lead';
import { Activity } from '@/lib/models/Activity';
import { requireAuth } from '@/lib/auth';
import { pageParams } from '@/lib/leadInput';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Activity types staff can log by hand. 'created' / 'status_change' are written
// by the server only.
const STAFF_TYPES = ['note', 'call', 'email', 'meeting', 'follow_up'];

// GET /api/activities — global recent activity feed. Paginated, newest first,
// with the lead name/phone joined.
export async function GET(req: NextRequest) {
  const gate = await requireAuth(req, { permission: ['activities', 'leads'] });
  if ('error' in gate) return gate.error;

  await connectDB();
  const { limit, skip } = pageParams(new URL(req.url).searchParams, 30, 100);

  const [activities, total] = await Promise.all([
    Activity.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('leadId', 'name phone')
      .lean(),
    Activity.estimatedDocumentCount(),
  ]);

  return NextResponse.json({ activities, total });
}

// POST /api/activities — log a note/call/meeting against a lead + bump its
// lastActivity so it sorts to the top of the list.
export async function POST(req: NextRequest) {
  const gate = await requireAuth(req, { permission: ['activities', 'leads'] });
  if ('error' in gate) return gate.error;
  const user = gate.auth;

  await connectDB();
  const body = await req.json().catch(() => ({}));
  const leadId = body.leadId;
  const type = STAFF_TYPES.includes(body.type) ? body.type : 'note';
  const description = typeof body.description === 'string' ? body.description.trim().slice(0, 5000) : '';
  if (!isValidObjectId(leadId) || !description) {
    return NextResponse.json({ message: 'leadId and description are required' }, { status: 400 });
  }
  if (!(await Lead.exists({ _id: leadId }))) {
    return NextResponse.json({ message: 'Lead not found' }, { status: 404 });
  }

  const activity = await Activity.create({ leadId, type, description, userId: user.userId });
  await Lead.findByIdAndUpdate(leadId, { lastActivity: new Date() });

  return NextResponse.json({ activity }, { status: 201 });
}
