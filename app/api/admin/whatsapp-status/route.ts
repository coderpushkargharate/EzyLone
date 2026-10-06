import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { whatsappDiagnostics } from '@/lib/whatsapp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/admin/whatsapp-status — admin-only WhatsApp/Twilio health check.
// Open it in the browser while logged in to the admin panel.
export async function GET(req: NextRequest) {
  const gate = await requireAuth(req, { adminOnly: true });
  if ('error' in gate) return gate.error;
  return NextResponse.json(await whatsappDiagnostics(), { headers: { 'Cache-Control': 'no-store' } });
}
