import { NextRequest, NextResponse } from 'next/server';
import { isValidObjectId } from 'mongoose';
import { connectDB } from '@/lib/db';
import { Contact } from '@/lib/models/Contact';
import { requireAuth } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// DELETE /api/contacts/:id — admin only
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const gate = await requireAuth(req, { permission: 'contacts' });
  if ('error' in gate) return gate.error;
  if (!isValidObjectId(params.id)) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  try {
    await connectDB();
    await Contact.findByIdAndDelete(params.id);
    return NextResponse.json({ message: 'Contact deleted' });
  } catch (error: any) {
    console.error('Error deleting contact', error);

    return NextResponse.json({ message: 'Error deleting contact' }, { status: 500 });
  }
}
