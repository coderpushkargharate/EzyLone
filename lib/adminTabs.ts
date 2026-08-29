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
