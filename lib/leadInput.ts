import { isValidObjectId } from 'mongoose';

// Fields staff may set on a lead from the admin panel. Server-controlled fields
// (ip, country, sourceMessageId, createdAt, lastActivity…) are never accepted
// from a request body.
const STRING_FIELDS: Record<string, number> = {
  name: 120, displayName: 120, phone: 20, whatsapp: 20, email: 254, notes: 5000,
  opportunitySize: 60, leadStage: 60, status: 40, source: 60,
};

export function pickLeadFields(body: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, max] of Object.entries(STRING_FIELDS)) {
    const v = body[k];
    if (typeof v === 'string') out[k] = v.trim().slice(0, max);
  }
  if ('followUpDate' in body) {
    const d = body.followUpDate ? new Date(String(body.followUpDate)) : null;
    out.followUpDate = d && !isNaN(d.getTime()) ? d : null;
  }
  if ('assignedTo' in body) {
    out.assignedTo = body.assignedTo && isValidObjectId(body.assignedTo) ? body.assignedTo : null;
  }
  if (Array.isArray(body.groups)) {
    out.groups = body.groups
      .filter((g): g is string => typeof g === 'string')
      .map((g) => g.slice(0, 60))
      .slice(0, 30);
  }
  return out;
}

/** Parse page/limit query params into safe, bounded integers. */
export function pageParams(sp: URLSearchParams, defLimit: number, maxLimit = 200) {
  const page = Math.max(1, Math.min(10_000, parseInt(sp.get('page') || '1', 10) || 1));
  const limit = Math.max(1, Math.min(maxLimit, parseInt(sp.get('limit') || String(defLimit), 10) || defLimit));
  return { page, limit, skip: (page - 1) * limit };
}
