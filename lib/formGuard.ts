// Server-side spam guard for the public lead forms (contact + loan apply).
// Two cheap, dependency-free checks that together stop the bulk of automated
// junk without adding friction for real users:
//
//  1) Honeypot — a hidden field (`company_website`) that real users never see.
//     Bots that blindly fill every input will set it; a non-empty value is a
//     near-certain bot, so we reject AND flag the IP for blocking.
//
//  2) Math question — the browser form renders "a + b = ?" and sends the two
//     operands plus the user's answer. A real submission has a correct answer;
//     the current spam bot doesn't send these fields at all, so it fails. Kept
//     deliberately simple (verified against the sent operands) — it's a filter,
//     not cryptographic proof, and layers on top of the honeypot + IP block.
//
// Field names are shared with the client hook in components/FormGuard.tsx.

export const HONEYPOT_FIELD = 'company_website';
export const CAPTCHA_A = 'vq_a';
export const CAPTCHA_B = 'vq_b';
export const CAPTCHA_ANS = 'vq_ans';

export interface GuardResult {
  /** Honeypot was filled — treat as a bot (reject silently + block the IP). */
  honeypot: boolean;
  /** Math answer is present and correct. */
  captchaOk: boolean;
}

export function inspectFormGuard(body: Record<string, unknown>): GuardResult {
  const hp = body[HONEYPOT_FIELD];
  const honeypot = typeof hp === 'string' && hp.trim().length > 0;

  const a = Number(body[CAPTCHA_A]);
  const b = Number(body[CAPTCHA_B]);
  const ans = Number(body[CAPTCHA_ANS]);
  const captchaOk =
    Number.isFinite(a) && Number.isFinite(b) && Number.isFinite(ans) && a + b === ans;

  return { honeypot, captchaOk };
}
