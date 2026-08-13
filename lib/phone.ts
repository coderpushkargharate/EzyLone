// Indian-mobile validation so ONLY India leads are accepted (owner wanted to stop
// out-of-country form submissions). Used server-side in the lead APIs (the real
// gate — a client can bypass the form) and mirrored client-side for a friendly UX.
//
// Accepts the shapes users actually type:
//   "9876543210", "98765 43210", "+91 98765 43210", "919876543210",
//   "09876543210" (leading trunk 0), "00919876543210" (intl access code).
// Returns the bare 10-digit number if it is a valid Indian mobile, else null.
// Indian mobiles are exactly 10 digits and start with 6, 7, 8 or 9.
export function normalizeIndianMobile(raw: string | undefined | null): string | null {
  if (!raw) return null;
  let digits = String(raw).replace(/\D/g, '');

  if (digits.startsWith('00')) digits = digits.slice(2); // 00 + country code
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2); // 91XXXXXXXXXX
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1); // 0XXXXXXXXXX

  return /^[6-9]\d{9}$/.test(digits) ? digits : null;
}

export function isIndianMobile(raw: string | undefined | null): boolean {
  return normalizeIndianMobile(raw) !== null;
}
