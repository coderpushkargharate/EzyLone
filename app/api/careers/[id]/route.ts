import { NextRequest, NextResponse } from 'next/server';
import { isValidObjectId } from 'mongoose';
import { connectDB } from '@/lib/db';
import { JobApplication } from '@/lib/models/JobApplication';
import { destroyRaw } from '@/lib/cloudinary';
import { requireAuth } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// DELETE /api/careers/:id — admin only
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const gate = await requireAuth(req, { adminOnly: true });
  if ('error' in gate) return gate.error;
  if (!isValidObjectId(params.id)) return NextResponse.json({ message: 'Not found' }, { status: 404 });

  try {
    await connectDB();
    const application = await JobApplication.findById(params.id);
    if (!application) return NextResponse.json({ message: 'Application not found' }, { status: 404 });

    if (application.resumePublicId) {
      try {
        await destroyRaw(application.resumePublicId);
      } catch (err: any) {
        console.warn('⚠️ Cloudinary resume delete failed:', err.message);
      }
    }

    await JobApplication.findByIdAndDelete(params.id);
    return NextResponse.json({ message: 'Application deleted' });
  } catch (error: any) {
    console.error('Error deleting application', error);

    return NextResponse.json({ message: 'Error deleting application' }, { status: 500 });
  }
}
