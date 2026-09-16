// Single source of truth for EzyLoan's public contact numbers.
// Use these everywhere (footer, floating buttons, contact page, emails, chatbot)
// so the two numbers stay consistent across the whole site.
//
//  • CALL number  → the primary phone/support line (voice calls).
//  • WA  number   → the WhatsApp Business number (Twilio sender) customers chat on
//                   and that the auto-reply comes from.
// A second WhatsApp option (the call number) is also exposed because the site
// shows a WhatsApp button for BOTH numbers.

// E.164 without spaces — for tel: links.
export const CALL_NUMBER = '+916372977626';
// Pretty display form.
export const CALL_DISPLAY = '+91 63729 77626';

// wa.me / WhatsApp API want digits only, no '+'.
export const WA_NUMBER = '919692429674';
export const WA_DISPLAY = '+91 96924 29674';

// The call number also on WhatsApp (second WhatsApp option).
export const WA_ALT_NUMBER = '916372977626';
export const WA_ALT_DISPLAY = '+91 63729 77626';

// Default prefilled WhatsApp message.
export const WA_MESSAGE = "Hi, I'm interested in getting a loan";

export const waLink = (number: string, text: string = WA_MESSAGE) =>
  `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
