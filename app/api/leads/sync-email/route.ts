import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, unauthorized } from '@/lib/auth';
import { ingestLeadEmails } from '@/lib/ingest';

// IMAP needs the Node runtime and a little headroom to read mail.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Triggered by the "Sync now" button on the Automations tab.
export async function POST(req: NextRequest) {
  const user = verifyAuth(req);
  if (!user) return unauthorized();

  try {
    const result = await ingestLeadEmails();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Email sync error:', error);
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
