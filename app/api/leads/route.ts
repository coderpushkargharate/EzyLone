import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Lead } from '@/lib/models/Lead';
import { Activity } from '@/lib/models/Activity';
import { requireAuth } from '@/lib/auth';
import { pickLeadFields, pageParams } from '@/lib/leadInput';
import { escapeRegex } from '@/lib/validate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/leads — Lead Management (or Automations) access. Search / filter / paginate.
export async function GET(req: NextRequest) {
  const gate = await requireAuth(req, { permission: ['leads', 'automations'] });
  if ('error' in gate) return gate.error;

  await connectDB();
  const { searchParams } = new URL(req.url);
  // User input is escaped before it becomes a regex (no ReDoS / pattern injection).
  const search = escapeRegex((searchParams.get('search') || '').trim().slice(0, 100));
  const status = (searchParams.get('status') || '').slice(0, 40);
  const group = (searchParams.get('group') || '').slice(0, 60);
  const tab = searchParams.get('tab') || 'all';
  const { page, limit, skip } = pageParams(searchParams, 50);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { notes: { $regex: search, $options: 'i' } },
    ];
  }

  if (status) query.status = status;
  if (group) query.groups = group;

  if (tab === 'uncontacted') {
    query.status = 'New';
  } else if (tab === 'followups') {
    query.followUpDate = { $lte: new Date() };
  }

  const [leads, total] = await Promise.all([
    Lead.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Lead.countDocuments(query),
  ]);

  return NextResponse.json({ leads, total, page, pages: Math.ceil(total / limit) });
}

// POST /api/leads — create a lead manually + seed a "created" activity.
export async function POST(req: NextRequest) {
  const gate = await requireAuth(req, { permission: 'leads' });
  if ('error' in gate) return gate.error;
  const user = gate.auth;

  await connectDB();
  const body = await req.json().catch(() => ({}));
  const fields = pickLeadFields(body);
  if (!fields.name) return NextResponse.json({ message: 'Name is required' }, { status: 400 });

  try {
    const lead = await Lead.create({ ...fields, source: fields.source || 'Manual' });
    await Activity.create({
      leadId: lead._id,
      userId: user.userId,
      type: 'created',
      description: 'Lead created manually',
    });
    return NextResponse.json({ lead }, { status: 201 });
  } catch (error) {
    console.error('Create lead error:', error);
    return NextResponse.json({ message: 'Could not create lead. Check the values and try again.' }, { status: 400 });
  }
}
