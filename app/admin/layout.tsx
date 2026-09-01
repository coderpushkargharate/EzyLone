import type { Metadata } from 'next';

// The admin area installs its OWN PWA (start_url "/admin", green theme) so the
// admin/WhatsApp app keeps opening straight into the panel. This overrides the
// site-wide customer manifest linked in the root layout. Keep this a server
// component (metadata export) — it only wraps the client admin page.
export const metadata: Metadata = {
  title: 'EzyLoan Admin',
  manifest: '/admin.webmanifest',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
