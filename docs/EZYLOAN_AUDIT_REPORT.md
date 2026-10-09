# EzyLoan — Engineering, Security & SEO Audit (October 2026)

Branch: `audit/hardening-seo` (3 commits on top of `main` @ `7b20ef9`). Nothing was deployed;
no database, DNS, hosting or secret was changed.

## 1. Architecture (verified from the code)

| Area | Finding |
|---|---|
| Framework | Next.js App Router, one app for site + admin + API. **Was 14.2.5 → now 15.5.27 / React 19.** |
| Data | MongoDB via Mongoose (`lib/db.ts`, 19 models in `lib/models`) |
| Auth | Server-side sessions (`sessions` collection) + HS256 JWT holding only the session id, `__Host-` HttpOnly/Secure/SameSite=Lax cookie. Roles `admin` / `employee` (+ per-tab permissions), always loaded from DB (`lib/auth.ts → requireAuth`) |
| Admin | `/ezylogin` (login), `/ezyadmin` (client shell; every data call goes through gated APIs). Middleware is only a first gate. |
| Integrations | Cloudinary uploads, SMTP/IMAP email, Twilio WhatsApp webhook, Meta Lead Ads webhook, web-push, optional Claude LLM for the chatbot |
| Hosting | Self-hosted Node behind a proxy (Hostinger VPS per code comments). `next start`. |

### Route inventory

**Public, indexable (20):** `/`, `/about`, `/apply-now`, `/blogs`, `/blog/[slug]`, `/personal-loan`, `/car-loan`,
`/car-loan-balance-transfer`, `/car-loan-refinance`, `/car-loan-topup`, `/commercial-vehicle-loan`, `/property-loan`,
`/emi-calculator`, `/lending-partners`, `/careers`, `/contact`, `/faq`, `/compliance`, `/loan-disclosure`,
`/privacy-policy`, `/terms-and-conditions`

**Public, noindex:** `/ThankYouPage`, `/ezylogin`, 404 page. **Private:** `/ezyadmin`.
**Redirects:** apex → `www`, `/terms`, `/privacy`, and (new) `/blog` → `/blogs` — all permanent.

**API (58 route files).** Every privileged handler calls `requireAuth` (verified by inventory and by HTTP tests).
Public by design: `GET /api/blogs` (published only, trimmed fields), `GET /api/blog/[slug]` (published only),
`GET /api/banners`, `GET /api/testimonials`, `GET /api/health`, `GET /api/form-token`, `POST /api/chat`,
`POST /api/contacts|loans|careers` (honeypot + signed form token + rate limit + IP blocklist),
`POST /api/auth/login|logout`, and webhooks (`/api/whatsapp/webhook` Twilio-signed, `/api/webhook/facebook`,
`/api/webhook/lead` shared secret).

## 2. Issues found & fixed

### Critical
| Issue | Fix | Files |
|---|---|---|
| `next@14.2.5` had critical advisories, incl. the middleware auth bypass (`x-middleware-subrequest`) and unauthenticated RCE in the Image Optimization API. The 14.x line has no fix for the RCE. | Upgraded to **Next 15.5.27 + React 19**. Ran the official async-params codemod (20 files); `lucide-react` pinned to 0.577 (1.x dropped brand icons). | `package.json`, `package-lock.json`, 20 dynamic routes |

### High
| Issue | Fix | Files |
|---|---|---|
| **IDOR / arbitrary asset deletion:** `DELETE /api/loans/:id/documents?url=` deleted *any* Cloudinary URL passed in (another customer's KYC, a resume, a banner), even when it was not attached to that loan. | Delete now matches the document on that loan first; 404 otherwise. Cloudinary delete only runs for a detached file. | `app/api/loans/[id]/documents/route.ts` |
| `extractPublicIdFromUrl` produced invalid public_ids (`/cloud/v123/folder/x`), so banner/loan-document deletes **never removed files from Cloudinary**, and PDFs (raw) were deleted as images. | New `parseCloudinaryUrl` (own cloud only, image vs raw aware) + unit tests. | `lib/cloudinary.ts`, `scripts/test-cloudinary-url.mjs` |
| Image optimizer accepted every Cloudinary tenant plus `upload.wikimedia.org` / `images.pexels.com` (public uploads, never used). | Limited to hosts the site uses; Cloudinary restricted to this account's cloud. Verified: own images 200, foreign 400. | `next.config.mjs` |

### Medium
| Issue | Fix | Files |
|---|---|---|
| Testimonial avatars accepted SVG and unlimited size. | Reject SVG; 5 MB cap (same as other uploads). | `app/api/testimonials/route.ts`, `[id]/route.ts` |
| Customer phone numbers + full WhatsApp message text written to server logs. | Log only last 4 digits and length. | `app/api/whatsapp/webhook/route.ts` |
| `/loan-disclosure` imported `Link` from **lucide-react** (an icon) instead of `next/link`: the Privacy/Terms links rendered as icons that went nowhere, and `<li>` inside `<p>` caused a React hydration error (#418). | Correct import, valid `<nav><ul>`; self-link replaced with Compliance. | `app/loan-disclosure/page.tsx` |
| Terms/Compliance/Disclosure "Last Updated" was `new Date()`: it changed on every build, and Terms says changes take effect on that date. | Pinned to 06 Oct 2026 (last commit touching the text). **Owner to confirm.** | 3 legal pages |
| Site-wide default meta description said "Get **instant approval**": not accurate for a DSA. | Rewritten as facilitator wording. | `app/layout.tsx` |
| Homepage desktop CLS **0.135** (testimonial cards resized after hydration). | Card width via CSS breakpoint instead of state. Now **0.014**. | `components/HeroSection.tsx` |

### Low
- `/blog` returned 404 (articles live at `/blog/<slug>`, listing at `/blogs`) → 308 to `/blogs`.
- No branded 404 / error boundary → added `app/not-found.tsx` (noindex, real 404, links to key pages) and `app/error.tsx` (no error details shown to visitors).
- `/ezylogin` inherited the homepage title and had no HTML noindex → own layout (`Sign in`, noindex/nofollow).
- Broken logo `/banks/boi.webp` on `/lending-partners` → `boi.jpg`.
- Unlabeled inputs (homepage lead form, EMI calculator, admin login) → `aria-label` / `htmlFor` + `autoComplete` on login.
- No ESLint config (`next lint` only prompted) → `.eslintrc.json` (`next/core-web-vitals` + `next/typescript`). `no-explicit-any` and `no-unescaped-entities` set to *warn* (≈270 stylistic hits; not bugs). **0 errors**; lint now gates `next build`.

## 3. Verified as already sound (no change needed)
Server-side session revocation; role/permissions read from DB only; deny-by-default `requireAuth`; Origin check on
state-changing requests; login lockout + per-IP/per-account limits + generic errors; `__Host-` cookie; HSTS,
nosniff, `frame-ancestors 'none'`, Referrer-Policy, Permissions-Policy, `X-Powered-By` off; blog HTML sanitized on
save and render; JSON-LD escaped; blog drafts excluded from pages, APIs, related lists and sitemap; old slugs
301 to new; Twilio signature enforced; magic-byte check on resumes; regex input escaped (no ReDoS).

## 4. Tests executed (real results)

| Suite | Command | Result |
|---|---|---|
| Type check | `npx tsc --noEmit` | PASS |
| Lint | `npm run lint` | PASS — 0 errors (warnings remain) |
| Production build | `npm run build` | PASS (baseline on 14.2.5 also passed) |
| Security regression (new) | `npm run test:security` against local prod build | **55/55 PASS** |
| Cloudinary parser (new) | `npm run test:unit` | **8/8 PASS** |
| Chatbot intents (existing) | `npm run test:ezysaathi` | **60/60 PASS** |
| Browser probe (CDP, 21 pages × 360/768/1366 px) | scratch script | No horizontal overflow on any page; no console errors after fixes |

`test:security` covers: anonymous access to 21 protected GETs and 15 writes → 401 (incl. a body trying to set
`role: admin`); forged HS256, `alg:none` and legacy-name cookies → 401; `x-middleware-subrequest` bypass; cross-origin
POST refused; public blog API leaks no `status`/`content`; unknown blog → 404; sitemap has no private URLs;
security headers present.

### Route checklist (public pages)
All 21 public pages: **PASS** for status 200, one `<h1>`, self-referencing canonical on `https://www.ezyloan.co.in`,
unique title, index/follow, no overflow at 360/768/1366, no images without `alt`. `/ThankYouPage`, `/ezylogin`,
404 → noindex **PASS**. Blog post sample: `BlogPosting` + `BreadcrumbList` JSON-LD valid **PASS**.

### Performance (local, unthrottled — indicative only)
CLS/LCP were measured in headless Chrome via PerformanceObserver; "before" = same build before the layout fixes.
| | Before | After |
|---|---|---|
| Home CLS (desktop) | 0.135 | 0.014 |
| Max CLS any page (mobile) | 0.011 | 0.011 |
| LCP, all pages, local | — | 0.1–1.8 s |
| Shared first-load JS (build output) | 87.3 kB on Next 14.2.5 | 103 kB on Next 15.5 (React 19 runtime; cost of the security upgrade) |

### BLOCKED
- **Lighthouse** — fails with `NO_NAVSTART` on this machine's Chrome (v12 and latest). Use PageSpeed Insights /
  Search Console Core Web Vitals after deploy (the admin Site Health tab already calls PageSpeed).
- **Logged-in admin/employee flows and form submissions** — `.env.local` points at the live database. Logins (lockout
  counters) and submissions (real leads, emails, WhatsApp) were deliberately not exercised. Needs a staging DB and
  test accounts for each role.
- **INP** — needs real-user data (Search Console / CrUX).

## 5. Remaining risks & owner actions (priority order)

1. **Deploy & smoke test** (see §6). The framework major upgrade is the riskiest change; test admin login,
   every admin tab, lead/loan/contact/career forms, blog publish, uploads and the WhatsApp webhook on staging first.
2. **Set `FACEBOOK_APP_SECRET`** (or save it in Automations). Without it the Meta webhook accepts unsigned POSTs
   (impact limited: each lead id is re-fetched from the Graph API with your page token).
3. **Set `WEBHOOK_LEAD_SECRET`** if `/api/webhook/lead` is used; otherwise it is an open, rate-limited lead endpoint.
4. **Set `TRUSTED_IP_HEADER`** (e.g. `x-real-ip` with nginx) so rate limits/IP blocks can't be dodged by spoofing `X-Forwarded-For`.
5. **Dependencies still flagged:** `nodemailer` (fix needs a major upgrade, used for outbound mail; test SMTP after
   upgrading), `sharp`/libvips (mitigated by host allowlist; upgrade when Next supports a fixed sharp), Next
   advisories fixed only after 15.5.27 (re-run `npm audit` and take 15.5.x patches regularly). `sanitize-html`
   advisory reviewed: **not exploitable** here (the vulnerable attributes are not on the allowlist).
6. **Verify business claims** (not changed, cannot be verified from code): hero "Get Loan Approved in 24 Hours*",
   "Trusted by 10,000+ Customers", "Google 4.8" badge, rates that differ between pages (commercial vehicle 8.75% vs
   9.5% p.a.; car loan from 7.99% vs homepage 8%; 28% p.a. upper bound), `rbi-compliant` meta tag and
   `regulatoryCompliance` claims in JSON-LD.
7. **Confirm legal page dates** (pinned to 06 Oct 2026) and update them by hand whenever the text changes.
8. **Add real social profile URLs** to `sameAs` in `app/layout.tsx` (currently empty).
9. Rate limiter is in-memory (fine on one instance; move to Redis if you scale out). CSP does not yet restrict
   `script-src` (needs nonces; see SECURITY.md).
10. Code quality: 88 unused variables, 18 `<img>` that could be `next/image`, `any` types — warnings only.

## 6. Deploy checklist
1. Back up the database (`mongodump`) and note the current deployed commit.
2. On the server: `git fetch && git checkout audit/hardening-seo && npm ci && npm run build`.
   Node must be ≥ 18.18 (Next 15). Make sure `CLOUDINARY_CLOUD_NAME` is set **at build time** (image allowlist uses it).
3. Restart (`next start` / pm2). Then `BASE_URL=https://www.ezyloan.co.in npm run test:security` (read-only).
4. Manually: log in as admin and as an employee; open each tab; submit one test lead; publish/unpublish a draft
   blog; upload and delete a banner and a loan document (check it disappears from Cloudinary); send a WhatsApp
   message to the business number.
5. Search Console: resubmit `sitemap.xml`; URL-inspect `/`, one loan page and one blog post.

**Rollback:** redeploy the previous commit (`git checkout 7b20ef9 && npm ci && npm run build`, then restart).
No schema or data migrations were made, so rollback needs no database step.
