import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { LoanApplication } from '@/lib/models/LoanApplication';
import { verifyAuth, unauthorized } from '@/lib/auth';
import { uploadBuffer, destroyImageByUrl } from '@/lib/cloudinary';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB — plenty for KYC PDFs / photos
const ALLOWED = ['image/', 'application/pdf'];

// POST /api/loans/:id/documents — admin only. Upload a KYC document (PDF/image)
// to Cloudinary and attach it to the loan file.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!verifyAuth(req)) return unauthorized();
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const label = (formData.get('name') as string | null)?.trim();

    if (!file) return NextResponse.json({ message: 'File required' }, { status: 400 });
    if (!ALLOWED.some((t) => file.type.startsWith(t))) {
      return NextResponse.json({ message: 'Only images or PDF allowed' }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ message: 'File must be under 10 MB' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const isPdf = file.type === 'application/pdf';
    const result = await uploadBuffer(buffer, {
      folder: 'loan-documents',
      resource_type: isPdf ? 'raw' : 'image',
    });

    await connectDB();
    const doc = {
      name: label || file.name,
      url: result.secure_url,
      type: file.type,
      uploadedAt: new Date(),
    };
    const loan = await LoanApplication.findByIdAndUpdate(
      params.id,
      { $push: { documents: doc } },
      { new: true }
    );
    if (!loan) return NextResponse.json({ message: 'Loan not found' }, { status: 404 });
    return NextResponse.json(loan);
  } catch (error: any) {
    return NextResponse.json({ message: 'Error uploading document', error: error.message }, { status: 500 });
  }
}

// DELETE /api/loans/:id/documents?url=... — admin only. Detach + remove asset.
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!verifyAuth(req)) return unauthorized();
  try {
    const url = req.nextUrl.searchParams.get('url');
    if (!url) return NextResponse.json({ message: 'url required' }, { status: 400 });

    await connectDB();
    const loan = await LoanApplication.findByIdAndUpdate(
      params.id,
      { $pull: { documents: { url } } },
      { new: true }
    );
    // Best-effort remove from Cloudinary — a failure here shouldn't block the DB
    // detach the admin already asked for.
    try { await destroyImageByUrl(url); } catch { /* ignore */ }

    if (!loan) return NextResponse.json({ message: 'Loan not found' }, { status: 404 });
    return NextResponse.json(loan);
  } catch (error: any) {
    return NextResponse.json({ message: 'Error deleting document', error: error.message }, { status: 500 });
  }
}
