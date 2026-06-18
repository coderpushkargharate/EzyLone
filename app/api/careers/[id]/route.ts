import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { JobApplication } from '@/lib/models/JobApplication';
import { destroyRaw } from '@/lib/cloudinary';
import { verifyAuth, unauthorized } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// DELETE /api/careers/:id — admin only
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!verifyAuth(req)) return unauthorized();

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
    return NextResponse.json({ message: 'Error deleting application', error: error.message }, { status: 500 });
  }
}
