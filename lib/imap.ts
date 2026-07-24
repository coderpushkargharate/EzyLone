import { ImapFlow } from 'imapflow';
import { simpleParser, type ParsedMail } from 'mailparser';

// Ported from EzyLoanCrm — reads UNSEEN mail from the configured inbox and turns
// each message into a parsed lead. Needs IMAP_USER / IMAP_PASS (Gmail App
// Password) in .env.local, same as the standalone CRM.

export interface ParsedLead {
  name: string;
  email?: string;
  phone?: string;
  message?: string;
  source: string;
  messageId?: string;
  receivedAt?: Date;
}

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
const PHONE_RE = /(\+?\d[\d\s\-()]{7,}\d)/;

/**
 * Find a labelled value in a block of text, e.g. "Name: John Doe" or
 * "Phone\n98765 43210" (table-style emails). Returns the first match.
 */
function findField(text: string, labels: string[]): string | undefined {
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    for (const label of labels) {
      const re = new RegExp(`^\\*?\\s*${label}\\s*[:\\-]\\s*(.+)$`, 'i');
      const m = line.match(re);
      if (m && m[1].trim()) return m[1].trim();
      const bare = new RegExp(`^\\*?\\s*${label}\\s*\\*?:?\\s*$`, 'i');
      if (bare.test(line)) {
        for (let j = i + 1; j < lines.length; j++) {
          if (lines[j].trim()) return lines[j].trim();
        }
      }
    }
  }
  return undefined;
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<\/t[dh]>\s*<t[dh][^>]*>/gi, ': ')
    .replace(/<\/(tr|p|div|li|h\d)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .trim();
}

/**
 * Turn a parsed email into a lead. Handles the common patterns used by
 * Contact Form 7, WPForms, Elementor, Google Forms, Typeform, etc.
 */
export function parseLeadFromEmail(parsed: ParsedMail, inboxAddress: string): ParsedLead {
  const text = (parsed.html ? stripHtml(parsed.html) : parsed.text || '').trim();
  const subject = (parsed.subject || '').trim();

  const fromName = parsed.from?.value?.[0]?.name?.trim();
  const fromAddress = parsed.from?.value?.[0]?.address?.toLowerCase();
  const replyTo = (parsed.replyTo?.value?.[0]?.address || '').toLowerCase();

  const inbox = inboxAddress.toLowerCase();

  let name =
    findField(text, ['Full Name', 'Your Name', 'Name', 'Nom', 'Naam', 'Contact Name']) ||
    fromName ||
    '';

  let email = findField(text, ['E-mail Address', 'Email Address', 'Email', 'E-mail', 'Mail']);
  if (!email) {
    if (replyTo && replyTo !== inbox) email = replyTo;
  }
  if (!email) {
    const found = text.match(EMAIL_RE)?.[0];
    if (found && found.toLowerCase() !== inbox) email = found;
  }
  if (!email && fromAddress && fromAddress !== inbox) email = fromAddress;

  let phone =
    findField(text, ['Phone Number', 'Mobile Number', 'Phone', 'Mobile', 'Contact Number', 'Contact', 'Number', 'Tel', 'WhatsApp']) ||
    undefined;
  if (phone) {
    const cleaned = phone.match(PHONE_RE)?.[0];
    phone = cleaned ? cleaned.trim() : undefined;
  }
  if (!phone) {
    phone = text.match(PHONE_RE)?.[0]?.trim();
  }

  const message =
    findField(text, ['Message', 'Comment', 'Comments', 'Enquiry', 'Inquiry', 'Query', 'Details', 'Requirement', 'How can we help']) ||
    (text.length <= 500 ? text : undefined);

  if (!name && email) name = email.split('@')[0];
  if (!name) name = subject || 'Website Lead';

  let source = 'Email Lead';
  if (subject) {
    source = `Email: ${subject}`.slice(0, 80);
  } else if (fromAddress) {
    source = `Email: ${fromAddress.split('@')[1] || fromAddress}`;
  }

  return {
    name: name.slice(0, 120),
    email: email || undefined,
    phone: phone || undefined,
    message: message || undefined,
    source,
    messageId: parsed.messageId,
    receivedAt: parsed.date || new Date(),
  };
}

/**
 * Connect to the Gmail inbox over IMAP, read all UNSEEN messages, parse each
 * into a lead, and mark them as seen so they are never processed twice.
 */
export async function fetchNewLeadEmails(): Promise<ParsedLead[]> {
  const host = process.env.IMAP_HOST || 'imap.gmail.com';
  const port = Number(process.env.IMAP_PORT) || 993;
  const user = process.env.IMAP_USER || process.env.SMTP_USER;
  const pass = process.env.IMAP_PASS || process.env.SMTP_PASS;

  if (!user || !pass) {
    throw new Error('IMAP_USER / IMAP_PASS (Gmail App Password) are not configured');
  }

  const client = new ImapFlow({
    host,
    port,
    secure: true,
    auth: { user, pass },
    logger: false,
  });

  const leads: ParsedLead[] = [];

  try {
    await client.connect();
  } catch (err) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((err as any)?.authenticationFailed) {
      throw new Error(
        'Gmail login failed. Set a valid Gmail App Password in IMAP_PASS (2-Step Verification must be ON).'
      );
    }
    throw err;
  }
  const lock = await client.getMailboxLock('INBOX');
  try {
    for await (const msg of client.fetch({ seen: false }, { uid: true, source: true })) {
      if (!msg.source) continue;
      try {
        const parsed = await simpleParser(msg.source);
        leads.push(parseLeadFromEmail(parsed, user));
      } catch (err) {
        console.error('Failed to parse email uid', msg.uid, err);
      }
      await client.messageFlagsAdd(msg.uid, ['\\Seen'], { uid: true });
    }
  } finally {
    lock.release();
  }
  await client.logout();

  return leads;
}
