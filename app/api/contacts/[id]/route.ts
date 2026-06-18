import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Contact } from '@/lib/models/Contact';
import { verifyAuth, unauthorized } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// DELETE /api/contacts/:id — admin only
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!verifyAuth(req)) return unauthorized();
  try {
    await connectDB();
    await Contact.findByIdAndDelete(params.id);
    return NextResponse.json({ message: 'Contact deleted' });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error deleting contact', error: error.message }, { status: 500 });
  }
}
