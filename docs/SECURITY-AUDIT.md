# EzyLoan — Security Audit (24 Nov 2026)

Scope: this round's code changes, dependencies, public/admin API exposure and HTTP headers. The deeper October
review (IDOR, webhooks, sessions, uploads, client-IP trust) is in `docs/EZYLOAN_AUDIT_REPORT.md` and was not
repeated line-by-line; its regression tests were re-run.

## 1. Results

| Area | Result | Evidence |
|---|---|---|
| Admin APIs refuse anonymous, forged-signature, `alg:none` and legacy-cookie requests | ✅ | `npm run test:security` against the local production build: **91 passed, 0 failed** |
| Middleware bypass (`x-middleware-subrequest`) | ✅ | same suite |
| Webhooks fail closed without secret/signature (Facebook, lead webhook) | ✅ | same suite |
| Cross-origin POST refused | ✅ | same suite |
| Security headers: HSTS (2 y, preload), X-Content-Type-Options, X-Frame-Options DENY + CSP `frame-ancestors 'none'`, Referrer-Policy, Permissions-Policy, COOP, `X-Powered-By` hidden | ✅ | `next.config.mjs`; suite checks |
| Public endpoints leak nothing sensitive | ✅ | `/api/health` (status/time), `/api/site-tags` (public ids), `/api/form-token` (signed token), `/api/blog/[slug]` (published only) |
| Static auth scan of 86 API files | 75 call `requireAuth`, 4 verify a webhook secret, 7 public by design | `docs/ROUTE-INVENTORY.md` |
| Secrets in repo | ✅ none found in tracked files; `.env*` ignored (only `.env.example` tracked) | `git ls-files` |

## 2. Dependencies — fixed (within current major versions)

| Package | Before → After | Advisories closed |
|---|---|---|
| next | 15.5.27 → **15.5.29** | **Critical** unauthenticated RCE in image optimisation with SVG (GHSA-2464-fhr4-w9xw); Server Actions DoS; SVG rejection bypass; HttpOnly cookie exposure on Edge; cross-client response injection (self-hosted) |
| mongoose | 8.x → **8.24.11** | sanitizeFilter not applied at connection level; prototype pollution / inherited-property issues |
| sanitize-html (blog HTML) | 2.13.1 → **2.18.2** | `javascript:` URIs in action/formaction/data/poster; SVG SMIL bypass; mutation-XSS; `meta refresh` URLs |
| follow-redirects (via axios) | 1.16.0 → **1.16.3** | credential headers leaked across origins |

Regression check: all 65 crawled 200-pages have identical text length, heading count, image count and internal
links before and after the upgrade (so the stricter sanitizer did not change any published blog).
`npm audit --omit=dev`: **9 vulnerabilities (1 critical, 5 high) → 5 (0 critical, 3 high, 2 moderate).**

## 3. Remaining — need a decision (major upgrades, not done automatically)

| Package | Why it matters here | Recommendation |
|---|---|---|
| nodemailer 6 → 10 (high: SMTP command injection, unintended-domain delivery) | Sends OTP/lead mail; recipients are server-controlled, not user input, which limits exposure | Upgrade in a separate change; test `lib/email.ts` (SMTP send) on staging |
| sharp 0.34 → 0.35 (high: libvips/libheif/librsvg CVEs) | Used by the Next image optimiser for allow-listed hosts only (own Cloudinary cloud, Unsplash, Google) | Upgrade together with a visual check of `/_next/image` output |
| postcss inside Next (8.4.31) | Build-time processing of our own CSS only | Resolved when Next ships a newer postcss; no action |
| mailparser / ip-address (moderate) | Transitive (IMAP lead sync) | Follow nodemailer upgrade |

## 4. Changes this round with a security angle

- Lead attribution referrer matching now uses the exact host (substring matching mis-classified hosts such as `google.com.evil.io`).
- New `lib/imageUrl.ts` only rewrites URLs whose host is exactly `res.cloudinary.com` / `images.unsplash.com` (tested with look-alike hosts).
- New page and layouts are static server components; no new API, input, cookie or secret.

## 5. Not covered / pending

- Content-Security-Policy still has no `script-src` restriction (documented trade-off in `next.config.mjs`/`SECURITY.md`: Google Ads + Meta Pixel + inline JSON-LD would need nonces and dynamic rendering).
- Login lockout and password flows were not exercised (would touch production lockout counters).
- The credentials pasted into chat on 24 Nov (for another project's `.env`) must be rotated by their owner; nothing from them was used here.
