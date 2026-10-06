// Canonical list of admin-panel tabs an employee can be granted access to.
// Kept in sync with the `menuItems` in app/admin/page.tsx (same ids). The
// "employees" tab itself is intentionally NOT assignable — only admins manage staff.

export interface AdminTab {
  id: string;
  name: string;
}

export const ASSIGNABLE_TABS: AdminTab[] = [
  { id: 'dashboard', name: 'Overview' },
  { id: 'banners', name: 'Banners' },
  { id: 'contacts', name: 'Contacts' },
  { id: 'loans', name: 'Loan Applications' },
  { id: 'leads', name: 'Lead Management' },
  { id: 'activities', name: 'Activities' },
  { id: 'content', name: 'Content' },
  { id: 'team', name: 'Team' },
  { id: 'analytics', name: 'CRM Analytics' },
  { id: 'automations', name: 'Automations' },
  { id: 'blogs', name: 'Blog Manager' },
  { id: 'testimonials', name: 'Testimonials' },
  { id: 'ezyBrain', name: 'Ezy AI Brain' },
  { id: 'ezyInsights', name: 'Ezy AI Insights' },
  { id: 'whatsappBrain', name: 'WhatsApp AI Brain' },
  { id: 'whatsappChats', name: 'WhatsApp Chats' },
  { id: 'siteHealth', name: 'Website Health' },
];

const ASSIGNABLE_IDS = new Set(ASSIGNABLE_TABS.map((t) => t.id));

/** Keep only real, assignable tab ids — never trust a client-sent permission list. */
export function sanitizePermissions(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return Array.from(new Set(input.map(String).filter((p) => ASSIGNABLE_IDS.has(p))));
}

/** Returns a human-readable problem with a new password, or null if acceptable. */
export function passwordProblem(password: string): string | null {
  if (password.length < 10) return 'Password must be at least 10 characters';
  if (password.length > 128) return 'Password must be at most 128 characters';
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return 'Password must contain both letters and numbers';
  }
  return null;
}
