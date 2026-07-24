import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Lead } from '@/lib/models/Lead';
import { Activity } from '@/lib/models/Activity';
import { verifyAuth, unauthorized } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/leads — admin only. Search / filter / paginate the shared leads.
export async function GET(req: NextRequest) {
  const user = verifyAuth(req);
  if (!user) return unauthorized();

  await connectDB();
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const group = searchParams.get('group') || '';
  const tab = searchParams.get('tab') || 'all';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const skip = (page - 1) * limit;

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
  const user = verifyAuth(req);
  if (!user) return unauthorized();

  await connectDB();
  const body = await req.json();

  const lead = await Lead.create({
    ...body,
    source: body.source || 'Manual',
  });

  await Activity.create({
    leadId: lead._id,
    userId: user.userId,
    type: 'created',
    description: 'Lead created manually',
  });

  return NextResponse.json({ lead }, { status: 201 });
}
