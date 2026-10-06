// Field names shared by the client hook (components/FormGuard.tsx) and the
// server check (lib/formGuard.ts). Kept separate so the client bundle never
// imports Node crypto.
export const HONEYPOT_FIELD = 'company_website';
export const FORM_TOKEN_FIELD = 'fg_token';
/** A human can't fill a lead form faster than this after it becomes active. */
export const MIN_FILL_MS = 2500;
