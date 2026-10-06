import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { JobApplication } from '@/lib/models/JobApplication';
import { uploadBuffer } from '@/lib/cloudinary';
import { requireAuth } from '@/lib/auth';
import { formRateLimit, getClientIp } from '@/lib/rateLimit';
import { isBlocked, blockIp, noteBlockedHit, recordStrike } from '@/lib/blocklist';
import { inspectFormGuard } from '@/lib/formGuard';
import { HONEYPOT_FIELD, FORM_TOKEN_FIELD } from '@/lib/formGuardFields';
import { str, isEmail } from '@/lib/validate';
import { sendCareerApplicationEmail } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_RESUME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const MAX_RESUME_BYTES = 10 * 1024 * 1024;

// The declared MIME type is client-controlled, so also check the file's magic
// bytes: PDF (%PDF), legacy DOC (OLE2 container) or DOCX (ZIP container).
function looksLikeResume(buf: Buffer): boolean {
  const hex = buf.subarray(0, 8).toString('hex');
  return hex.startsWith('25504446') || hex.startsWith('d0cf11e0a1b11ae1') || hex.startsWith('504b0304');
}

// GET /api/careers — admin only
export async function GET(req: NextRequest) {
  const gate = await requireAuth(req, { adminOnly: true });
  if ('error' in gate) return gate.error;
  try {
    await connectDB();
    const applications = await JobApplication.find().sort({ createdAt: -1 });
    return NextResponse.json(applications);
  } catch (error: any) {
    console.error('Error fetching applications', error);

    return NextResponse.json({ message: 'Error fetching applications' }, { status: 500 });
  }
}

// POST /api/careers — public (rate-limited), resume upload
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (await isBlocked(ip)) {
    await noteBlockedHit(ip);
    return NextResponse.json({ message: 'Request blocked.' }, { status: 403 });
  }
  const limited = formRateLimit(req);
  if (limited) {
    await recordStrike(ip, 'rate-limit-abuse');
    return limited;
  }

  try {
    const formData = await req.formData();
    const guard = inspectFormGuard({
      [HONEYPOT_FIELD]: formData.get(HONEYPOT_FIELD),
      [FORM_TOKEN_FIELD]: formData.get(FORM_TOKEN_FIELD),
    });
    if (guard.honeypot) {
      await blockIp(ip, 'honeypot', 'auto');
      return NextResponse.json({ message: 'Application submitted successfully!' }, { status: 201 });
    }
    if (guard.tokenProblem) {
      if (guard.tokenProblem !== 'expired') await recordStrike(ip, `form-token-${guard.tokenProblem}`);
      return NextResponse.json({ message: 'Your session expired. Please refresh the page and submit again.' }, { status: 400 });
    }

    const fullName = str(formData.get('fullName'), 100);
    const email = str(formData.get('email'), 254).toLowerCase();
    const phoneNumber = str(formData.get('phoneNumber'), 20);
    const jobTitle = str(formData.get('jobTitle'), 120);
    const experience = str(formData.get('experience'), 60);
    const currentCTC = str(formData.get('currentCTC'), 60);
    const whyHire = str(formData.get('whyHire'), 3000);
    const resumeEntry = formData.get('resume');
    const resume = resumeEntry instanceof File ? resumeEntry : null;

    if (!fullName || !email || !phoneNumber || !jobTitle || !isEmail(email)) {
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
      if (resume.size > MAX_RESUME_BYTES) {
        return NextResponse.json({ message: 'Resume file size must be under 10MB' }, { status: 400 });
      }
      const buffer = Buffer.from(await resume.arrayBuffer());
      if (!looksLikeResume(buffer)) {
        return NextResponse.json({ message: 'Only PDF, DOC, or DOCX files allowed' }, { status: 400 });
      }
      const baseName = resume.name.split('.')[0].replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 60) || 'resume';
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
    console.error('Error submitting application', error);

    return NextResponse.json({ message: 'Error submitting application' }, { status: 500 });
  }
}
