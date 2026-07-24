import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Lead } from '@/lib/models/Lead';
import { Activity } from '@/lib/models/Activity';
import { verifyAuth, unauthorized } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/activities — global recent activity feed (used by the Activities tab
// in a later phase). Paginated, newest first, with the lead name/phone joined.
export async function GET(req: NextRequest) {
  const user = verifyAuth(req);
  if (!user) return unauthorized();

  await connectDB();
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '30');
  const skip = (page - 1) * limit;

  const [activities, total] = await Promise.all([
    Activity.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('leadId', 'name phone')
      .lean(),
    Activity.countDocuments(),
  ]);

  return NextResponse.json({ activities, total });
}

// POST /api/activities — log a note/call/meeting against a lead + bump its
// lastActivity so it sorts to the top of the list.
export async function POST(req: NextRequest) {
  const user = verifyAuth(req);
  if (!user) return unauthorized();

  await connectDB();
  const body = await req.json();

  const activity = await Activity.create({
    ...body,
    userId: user.userId,
  });

  await Lead.findByIdAndUpdate(body.leadId, { lastActivity: new Date() });

  return NextResponse.json({ activity }, { status: 201 });
}
