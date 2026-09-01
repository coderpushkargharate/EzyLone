'use client';
import { useEffect, useState } from 'react';
import { Download, Smartphone, Copy, Check, Share2, CheckCircle } from 'lucide-react';

// Customer-facing "Get the App" section on the home page. Lets a visitor install
// the WEBSITE as an app (opens "/", form-fillable, NO admin panel) three ways:
//   • an Install button (fires the browser's PWA install prompt),
//   • a QR code to scan with a phone, and
//   • a copyable / shareable link.
// The installed app uses /manifest.webmanifest (start_url "/"), so it is fully
// separate from the admin app.

const SITE_URL = 'https://www.ezyloan.co.in/';

export default function InstallAppBanner() {
  const [bip, setBip] = useState<any>(null);
  const [installed, setInstalled] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Register the service worker so the site is installable.
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});

    // The root layout stashes the install prompt as window.__bip the moment it
    // fires, so pick that up first, then keep listening for later ones.
    const existing = (window as any).__bip;
    if (existing) setBip(existing);
    const onPrompt = (e: any) => { e.preventDefault(); (window as any).__bip = e; setBip(e); };
    const onInstalled = () => { setInstalled(true); (window as any).__bip = null; setBip(null); };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    if (window.matchMedia?.('(display-mode: standalone)').matches) setInstalled(true);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const install = async () => {
    const p = bip || (typeof window !== 'undefined' && (window as any).__bip) || null;
    if (!p) {
      const isIOS = typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent);
      alert(
        isIOS
          ? 'On iPhone: tap the Share button in Safari, then "Add to Home Screen".'
          : 'Open your browser menu (⋮) and tap "Add to Home screen" / "Install app". Make sure you are not in private/incognito mode.',
      );
      return;
    }
    p.prompt();
    try { await p.userChoice; } catch {}
    (window as any).__bip = null;
    setBip(null);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(SITE_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — the link is shown as text anyway */
    }
  };

  const share = async () => {
    if (typeof navigator !== 'undefined' && (navigator as any).share) {
      try {
        await (navigator as any).share({ title: 'EzyLoan', text: 'Apply for a loan with EzyLoan', url: SITE_URL });
        return;
      } catch {
        /* user cancelled — fall through to copy */
      }
    }
    copyLink();
  };

  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=0&data=${encodeURIComponent(SITE_URL)}`;

  return (
    <section className="px-4 sm:px-6 lg:px-8 mt-4" aria-labelledby="get-app-heading">
      <div className="max-w-[85rem] mx-auto">
        <div className="glass-prism bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-5 sm:p-7 text-white overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Left: pitch + actions */}
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold mb-3">
                <Smartphone className="w-4 h-4" /> Install our app
              </div>
              <h2 id="get-app-heading" className="text-2xl sm:text-3xl font-bold leading-tight">
                Get the EzyLoan App
              </h2>
              <p className="text-sm sm:text-base text-white/90 mt-2">
                Add EzyLoan to your phone's home screen and apply for a loan in a few taps — no store, no download wait.
              </p>

              <ul className="mt-3 space-y-1.5 text-sm text-white/90">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 flex-shrink-0" /> One-tap access to the loan form</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 flex-shrink-0" /> Works offline, opens like a real app</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 flex-shrink-0" /> Free &amp; secure</li>
              </ul>

              <div className="flex flex-wrap items-center gap-2.5 mt-5">
                {installed ? (
                  <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 text-white text-sm font-semibold">
                    <CheckCircle className="w-4 h-4" /> App installed
                  </span>
                ) : (
                  <button
                    onClick={install}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-blue-700 text-sm font-bold hover:bg-blue-50 transition shadow"
                  >
                    <Download className="w-4 h-4" /> Install app
                  </button>
                )}
                <button
                  onClick={share}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 text-white text-sm font-semibold hover:bg-white/25 transition"
                >
                  <Share2 className="w-4 h-4" /> Share link
                </button>
                <button
                  onClick={copyLink}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 text-white text-sm font-semibold hover:bg-white/25 transition"
                >
                  {copied ? <><Check className="w-4 h-4" /> Copied</> : <><Copy className="w-4 h-4" /> Copy link</>}
                </button>
              </div>
            </div>

            {/* Right: QR to scan */}
            <div className="flex items-center justify-center md:justify-end">
              <div className="bg-white rounded-2xl p-4 text-center shadow-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrSrc}
                  alt="Scan this QR code to open EzyLoan on your phone"
                  width={200}
                  height={200}
                  className="w-40 h-40 sm:w-48 sm:h-48 mx-auto"
                  loading="lazy"
                />
                <p className="text-xs font-semibold text-gray-700 mt-2">Scan to open on your phone</p>
                <p className="text-[11px] text-gray-400 break-all mt-0.5">{SITE_URL}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
