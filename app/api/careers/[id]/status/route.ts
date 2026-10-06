import { NextRequest, NextResponse } from 'next/server';
import { isValidObjectId } from 'mongoose';
import { connectDB } from '@/lib/db';
import { JobApplication } from '@/lib/models/JobApplication';
import { requireAuth } from '@/lib/auth';
import { sendCareerShortlistEmail } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VALID = ['pending', 'reviewed', 'shortlisted', 'rejected'];

// PUT /api/careers/:id/status — admin only
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const gate = await requireAuth(req, { adminOnly: true });
  if ('error' in gate) return gate.error;
  if (!isValidObjectId(params.id)) return NextResponse.json({ message: 'Not found' }, { status: 404 });

  try {
    const { status } = await req.json();
    if (!VALID.includes(status)) {
      return NextResponse.json({ message: 'Invalid status value' }, { status: 400 });
    }

    await connectDB();
    const application = await JobApplication.findByIdAndUpdate(params.id, { status }, { new: true });
    if (!application) return NextResponse.json({ message: 'Application not found' }, { status: 404 });

    if (status === 'shortlisted') {
      sendCareerShortlistEmail(application).catch((err) => console.error('Shortlist email error:', err));
    }

    return NextResponse.json(application);
  } catch (error: any) {
    console.error('Error updating status', error);

    return NextResponse.json({ message: 'Error updating status' }, { status: 500 });
  }
}
