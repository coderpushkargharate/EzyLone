import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { JobApplication } from '@/lib/models/JobApplication';
import { uploadBuffer } from '@/lib/cloudinary';
import { verifyAuth, unauthorized } from '@/lib/auth';
import { formRateLimit } from '@/lib/rateLimit';
import { sendCareerApplicationEmail } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_RESUME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

// GET /api/careers — admin only
export async function GET(req: NextRequest) {
  if (!verifyAuth(req)) return unauthorized();
  try {
    await connectDB();
    const applications = await JobApplication.find().sort({ createdAt: -1 });
    return NextResponse.json(applications);
  } catch (error: any) {
    return NextResponse.json({ message: 'Error fetching applications', error: error.message }, { status: 500 });
  }
}

// POST /api/careers — public (rate-limited), resume upload
export async function POST(req: NextRequest) {
  const limited = formRateLimit(req);
  if (limited) return limited;

  try {
    const formData = await req.formData();
    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const phoneNumber = formData.get('phoneNumber') as string;
    const jobTitle = formData.get('jobTitle') as string;
    const experience = (formData.get('experience') as string) || '';
    const currentCTC = (formData.get('currentCTC') as string) || '';
    const whyHire = (formData.get('whyHire') as string) || '';
    const resume = formData.get('resume') as File | null;

    if (!fullName || !email || !phoneNumber || !jobTitle) {
      return NextResponse.json(
        { message: 'Required fields: fullName, email, phoneNumber, jobTitle' },
        { status: 400 }
      );
    }

    let resumeUrl = '';
    let resumePublicId = '';

    if (resume && resume.size > 0) {
      if (!ALLOWED_RESUME_TYPES.includes(resume.type)) {
        return NextResponse.json({ message: 'Only PDF, DOC, or DOCX files allowed' }, { status: 400 });
      }
      const buffer = Buffer.from(await resume.arrayBuffer());
      const baseName = resume.name.split('.')[0];
      const result = await uploadBuffer(buffer, {
        folder: 'career-resumes',
        resource_type: 'raw',
        public_id: `resume_${Date.now()}_${baseName}`,
      });
      resumeUrl = result.secure_url;
      resumePublicId = result.public_id;
    }

    await connectDB();
    const application = await JobApplication.create({
      fullName, email, phoneNumber, jobTitle, experience, currentCTC, whyHire, resumeUrl, resumePublicId,
    });

    // Fire-and-forget email (don't block the response).
    sendCareerApplicationEmail({ ...application.toObject(), resumeUrl }).catch((err) =>
      console.error('Email send failed:', err)
    );

    return NextResponse.json(
      { message: 'Application submitted successfully! Check your email for confirmation.', applicationId: application._id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Career application error:', error);
    return NextResponse.json({ message: 'Error submitting application', error: error.message }, { status: 500 });
  }
}
