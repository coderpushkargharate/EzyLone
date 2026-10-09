# EzyLoan — Engineering, Security & SEO Audit (October 2026)

Branch: `audit/hardening-seo` on top of `main` @ `7b20ef9`. **Nothing was deployed.** No production database
record, DNS setting, hosting setting or secret was changed. This report does not claim the site is fully secure or
bug-free: §5 lists what was tested, what failed and what could not be tested, and §8 lists the remaining risks.

| Commit | Content |
|---|---|
| `d86adf4` | Loan-document IDOR, Cloudinary delete bug, SVG avatars, PII in logs, Next 14.2.35 |
| `30ac9e4` | Next 15.5.27 / React 19, 404/error pages, `/blog` redirect, legal dates, lint gate, tests |
| `6c28b56` | Loan-disclosure links + hydration error, BOI logo, homepage CLS, input labels, image host allowlist |
| `155af10` | First version of this report |
| `1843053` | Fail-closed webhooks, trusted client-IP handling, App Secret field in admin |
| (this commit) | Report corrections, webhook/IP documentation, claims checklist |

## 1. Architecture (verified from the code)

| Area | Finding |
|---|---|
| Framework | Next.js App Router, one app for site + admin + API. **Was 14.2.5 → now 15.5.27 / React 19.** |
| Data | MongoDB via Mongoose (`lib/db.ts`, `DATABASE_URL`; 19 models in `lib/models`) |
| Auth | Server-side sessions (`sessions` collection) + HS256 JWT holding only the session id, `__Host-` HttpOnly/Secure/SameSite=Lax cookie. Roles `admin` / `employee` (+ per-tab permissions), always loaded from DB (`lib/auth.ts → requireAuth`) |
| Admin | `/ezylogin` (login), `/ezyadmin` (client shell; every data call goes through gated APIs). Middleware is only a first gate. |
| Integrations | Cloudinary uploads, SMTP/IMAP email, Twilio WhatsApp webhook, Meta Lead Ads webhook, direct lead webhook, web-push, optional Claude LLM for the chatbot |
| Hosting | Self-hosted Node behind a reverse proxy (Hostinger VPS per code comments), `next start`. The exact proxy chain was **not** verifiable from the repo — see §3.3. |

### Route inventory
**Public, indexable (21):** `/`, `/about`, `/apply-now`, `/blogs`, `/blog/[slug]` (each published post),
`/personal-loan`, `/car-loan`, `/car-loan-balance-transfer`, `/car-loan-refinance`, `/car-loan-topup`,
`/commercial-vehicle-loan`, `/property-loan`, `/emi-calculator`, `/lending-partners`, `/careers`, `/contact`, `/faq`,
`/compliance`, `/loan-disclosure`, `/privacy-policy`, `/terms-and-conditions`.

**Public, noindex:** `/ThankYouPage`, `/ezylogin`, 404 page. **Private:** `/ezyadmin`.
**Redirects (permanent):** apex → `www`, `/terms`, `/privacy`, `/blog` → `/blogs` (new).

**API (58 route files).** Every privileged handler calls `requireAuth` (inventory + HTTP tests). Public by design:
`GET /api/blogs` (published only, trimmed fields), `GET /api/blog/[slug]` (published only), `GET /api/banners`,
`GET /api/testimonials`, `GET /api/health`, `GET /api/form-token`, `POST /api/chat`,
`POST /api/contacts|loans|careers` (honeypot + signed form token + rate limit + IP blocklist),
`POST /api/auth/login|logout`, and the three webhooks in §3.

## 2. Issues found & fixed

### Critical
| Issue | Fix | Files |
|---|---|---|
| `next@14.2.5` had critical advisories, incl. the middleware auth bypass (`x-middleware-subrequest`) and unauthenticated RCE in the Image Optimization API. The 14.x line has no fix for the RCE. | Upgraded to **Next 15.5.27 + React 19**; official async-params codemod (20 files); `lucide-react` pinned to 0.577 (1.x dropped brand icons). | `package.json`, `package-lock.json`, 20 dynamic routes |

### High
| Issue | Fix | Files |
|---|---|---|
| **IDOR / arbitrary asset deletion:** `DELETE /api/loans/:id/documents?url=` deleted *any* Cloudinary URL passed in (another customer's KYC, a resume, a banner). | Delete matches the document on that loan first (404 otherwise); Cloudinary delete only for a detached file. | `app/api/loans/[id]/documents/route.ts` |
| `extractPublicIdFromUrl` built invalid public_ids, so banner/loan-document deletes **never removed files from Cloudinary**; PDFs (raw) were deleted as images. | `parseCloudinaryUrl` (own cloud only, image/raw aware) + unit tests. | `lib/cloudinary.ts` |
| Image optimizer accepted every Cloudinary tenant plus `upload.wikimedia.org` / `images.pexels.com` (public uploads, unused). | Allowlist of hosts actually used; Cloudinary limited to this account's cloud. | `next.config.mjs` |
| **Facebook Lead Ads webhook accepted unsigned POSTs** when no App Secret was configured, and the admin UI had no field to enter one. A forged `leadgen_id` still created an "Unknown Lead" (the lead is saved even when the Graph API lookup fails). The endpoint has no rate limit. *(The first report wrongly said the impact was limited — corrected.)* | Fails closed — see §3.1. | `app/api/webhook/facebook/route.ts`, `components/admin/AutomationsManager.tsx` |
| **Forged `X-Forwarded-For` could get an innocent visitor permanently banned.** Without a trusted IP header the left-most XFF entry (client-controlled) was used, and honeypot hits / strikes create *permanent* auto-blocks. The same header bypassed per-IP rate limits and the India geo check. | Auto-blocks only on a trusted IP source; `TRUSTED_PROXY_HOPS` added — see §3.3. | `lib/clientIp.ts`, `lib/rateLimit.ts`, `lib/blocklist.ts` |

### Medium
| Issue | Fix | Files |
|---|---|---|
| `/api/webhook/lead` was publicly writable (rate-limited) when `WEBHOOK_LEAD_SECRET` was unset. | Fails closed — see §3.2. | `app/api/webhook/lead/route.ts` |
| Testimonial avatars accepted SVG and unlimited size. | Reject SVG; 5 MB cap. | `app/api/testimonials/route.ts`, `[id]/route.ts` |
| Customer phone numbers + full WhatsApp message text written to server logs. | Log last 4 digits and length only. | `app/api/whatsapp/webhook/route.ts` |
| `/loan-disclosure` imported `Link` from **lucide-react** (an icon): Privacy/Terms links went nowhere; `<li>` inside `<p>` caused React hydration error #418. | Correct import, valid `<nav><ul>`; self-link replaced with Compliance. | `app/loan-disclosure/page.tsx` |
| Terms/Compliance/Disclosure "Last Updated" was `new Date()` — changed on every build, and Terms says changes take effect on that date. | Pinned to 06 Oct 2026 (last commit touching the text). **Owner must confirm** (§7). | 3 legal pages |
| Site-wide default meta description said "Get **instant approval**". | Rewritten as facilitator wording (documented in §7). | `app/layout.tsx` |
| Homepage desktop layout shift (testimonial cards resized after hydration). | Card width via CSS breakpoint instead of state (§6). | `components/HeroSection.tsx` |

### Low
- `/blog` returned 404 → 308 to `/blogs`.
- Added `app/not-found.tsx` (real 404, noindex, links to key pages) and `app/error.tsx` (no error details to visitors).
- `/ezylogin` inherited the homepage title and had no HTML noindex → own layout (`Sign in`, noindex/nofollow).
- Broken logo `/banks/boi.webp` on `/lending-partners` → `boi.jpg`.
- Unlabeled inputs (homepage lead form, EMI calculator, admin login) → `aria-label` / `htmlFor`; `autoComplete` on login.
- Facebook verify-token comparison and lead-webhook secret comparison are constant-time (`lib/webhookAuth.ts`).
- `TWILIO_VALIDATE_SIGNATURE=false` now logs a warning on every request instead of disabling verification silently.
- ESLint config added (`next/core-web-vitals` + `next/typescript`); `no-explicit-any` / `no-unescaped-entities` set to *warn*. Lint gates `next build`.

## 3. Webhook & client-IP security

### Endpoint behaviour (before → after)

| Endpoint | Before | After |
|---|---|---|
| `POST /api/whatsapp/webhook` (Twilio) | **Fail closed**: 403 without valid `X-Twilio-Signature` or without `TWILIO_AUTH_TOKEN`. Opt-out `TWILIO_VALIDATE_SIGNATURE=false` was silent. | Unchanged, plus a warning log while the opt-out is active. |
| `GET /api/webhook/facebook` (verify handshake) | Fail closed (403 unless token matches). Plain `===` compare. | Fail closed; constant-time compare. |
| `POST /api/webhook/facebook` | **Fail open** with no App Secret: unsigned events accepted, junk leads creatable. Fail closed with an App Secret. | **Fail closed** (403) when the App Secret is missing *or* the signature is wrong. |
| `POST /api/webhook/lead` | **Fail open** without `WEBHOOK_LEAD_SECRET` (public, 8 req/10 min per spoofable IP). | **Fail closed**: 503 without `WEBHOOK_LEAD_SECRET`, 401 on a wrong secret. |
| Contact / loan / career forms (IP blocklist) | Permanent auto-blocks keyed on a client-forgeable IP. | Auto-blocks only when `TRUSTED_IP_HEADER` or `TRUSTED_PROXY_HOPS` is set. |

**Observed during testing (read-only):** the local server, which reads Integration settings from the **live** database,
logged "no App Secret configured", and `.env.local` has no `FACEBOOK_APP_SECRET`. If production uses the same
settings, **Facebook Lead Ads is currently running unsigned — and after this deploy it will reject lead events until the
App Secret is saved.** This is intentional (fail closed) but must be done at deploy time (§9).

### 3.1 Facebook Lead Ads — `POST /api/webhook/facebook`
- Secret source: **Admin → Automations → Facebook Lead Ads → Configure → App Secret** (new field; stored in the
  `integrations` collection, masked in API responses) **or** env `FACEBOOK_APP_SECRET`. The admin value wins.
- Valid `X-Hub-Signature-256` (HMAC-SHA256 of the raw body) → processed as before.
- Missing/invalid signature → `403`. Missing App Secret → `403` + error log + throttled security-alert email.
- Escape hatch: `FACEBOOK_ALLOW_UNSIGNED=true` accepts unsigned events with a warning log, and saves a lead **only**
  when the `leadgen_id` resolves through the Graph API with the saved Page Access Token. Use only temporarily.

### 3.2 Direct lead webhook — `POST /api/webhook/lead`
- Requires env `WEBHOOK_LEAD_SECRET`, sent as header `x-webhook-secret` (preferred) or `?secret=` (kept for tools
  that cannot set headers; query strings may be written to proxy logs).
- Not set → `503 {"error":"Lead webhook is not configured."}` + error log + alert email. Wrong secret → `401`.
- Escape hatch: `WEBHOOK_LEAD_ALLOW_OPEN=true` restores the old public, rate-limited behaviour. Not recommended.
- The admin "Direct Webhook" panel now says the secret header is required.

### 3.3 Client IP — `lib/clientIp.ts`
Set **one** of these to match the real proxy chain:

| Variable | Use when | Example |
|---|---|---|
| `TRUSTED_IP_HEADER` | The proxy **overwrites** a header with the socket address | `x-real-ip` (nginx `proxy_set_header X-Real-IP $remote_addr;`), `cf-connecting-ip` (Cloudflare) |
| `TRUSTED_PROXY_HOPS` | The proxies **append** to `X-Forwarded-For` | `1` = nginx with `$proxy_add_x_forwarded_for`; `2` = CDN + nginx |

- Neither set → IP taken from the left-most XFF entry (spoofable), used **only** for rate limiting; automatic blocks
  and strikes are skipped (warning logged). Manual blocks by an admin still work. In production a one-time warning is
  logged on the first request that needs a client IP.
- Trusted header configured but absent on a request → IP `unknown` (no block, no XFF fallback).
- **Trade-off:** until one variable is set, repeat spammers are rate-limited but no longer auto-blocked.
- **Existing auto-blocks** were created under the old, spoofable logic. Review Admin → Blocked IPs and unblock any that
  may be legitimate visitors.
- Choosing the wrong value is itself a risk (e.g. `TRUSTED_PROXY_HOPS=1` behind a CDN *and* nginx makes every visitor
  share the CDN's IP). Confirm the chain on staging first (§9 step 4).

### 3.4 Environment variables (names only — never commit values)

| Variable | Required? | Purpose |
|---|---|---|
| `FACEBOOK_APP_SECRET` | Yes, if Lead Ads is used and the secret is not saved in the admin panel | Meta signature verification |
| `FACEBOOK_ALLOW_UNSIGNED` | No — leave unset | Escape hatch (§3.1) |
| `FACEBOOK_VERIFY_TOKEN` | Optional fallback | Verify handshake if not saved in admin |
| `WEBHOOK_LEAD_SECRET` | Yes, if `/api/webhook/lead` is used | Shared secret (generate 32+ random bytes) |
| `WEBHOOK_LEAD_ALLOW_OPEN` | No — leave unset | Escape hatch (§3.2) |
| `TRUSTED_IP_HEADER` *or* `TRUSTED_PROXY_HOPS` | Yes (one of them) | Trusted client IP (§3.3) |
| `TWILIO_AUTH_TOKEN` | Yes, for WhatsApp | Twilio signature verification |
| `TWILIO_VALIDATE_SIGNATURE` | Keep `true` | `false` disables verification (logged) |
| `CLOUDINARY_CLOUD_NAME` | Yes, **at build time and at runtime** | Uploads + image-optimizer allowlist (§9) |

All are documented in `.env.example`. This report and the test output never print secret values.

### 3.5 Staging verification for webhooks
1. With **no** secrets set: `npm run test:security` → the webhook checks pass (403/503). The payloads are built so that
   they cannot create a lead even on a misconfigured server.
2. Point a Meta test app's Page webhook at staging and save its App Secret in the **staging** admin panel. Submit a
   lead with Meta's **Lead Ads Testing Tool** → it appears in staging Leads. Save a wrong App Secret and repeat → the
   delivery fails with 403 (server log: "invalid signature") and no lead is created.
3. Set `WEBHOOK_LEAD_SECRET` on staging; `curl -X POST <staging>/api/webhook/lead -H "content-type: application/json"
   -H "x-webhook-secret: $WEBHOOK_LEAD_SECRET" -d '{"name":"Staging Test","phone":"9000000000"}'` → `ok:true`; the same
   request without the header → `401`.
4. IP: set `TRUSTED_IP_HEADER`/`TRUSTED_PROXY_HOPS`; submit a staging form with a fake
   `X-Forwarded-For: 203.0.113.50` header → Admin → Blocked IPs / server log must show **your real IP**, not
   203.0.113.50. If it shows the CDN's IP, increase hops.
5. Twilio: send a WhatsApp message to the staging number → reply received; a `curl` POST without a signature → 403.

## 4. Verified as already sound (no change needed)
Server-side session revocation; role/permissions read from DB only; deny-by-default `requireAuth`; Origin check on
state-changing requests; login lockout + per-IP/per-account limits + generic errors; `__Host-` cookie; HSTS, nosniff,
`frame-ancestors 'none'`, Referrer-Policy, Permissions-Policy, `X-Powered-By` off; blog HTML sanitized on save and
render; JSON-LD escaped; drafts excluded from pages, APIs, related lists and sitemap; old slugs 301 to new; Twilio
signature enforced; magic-byte check on resumes; regex input escaped.

## 5. Test results (final run on commit `1843053`)

### PASS
| Check | Command / method | Result |
|---|---|---|
| Type check | `npx tsc --noEmit` | PASS |
| Lint | `npm run lint` | PASS — 0 errors, 377 warnings (stylistic; see §8) |
| Production build | `npm run build` | PASS |
| Security regression | `npm run test:security` vs local production build (SMTP disabled) | **60/60** |
| Unit — Cloudinary URL parser | `npm run test:unit` | **8/8** |
| Unit — webhook signature, constant-time compare, client IP | `npm run test:unit` | **20/20** |
| Chatbot intents (existing) | `npm run test:ezysaathi` | **60/60** |
| Image optimizer allowlist | `curl /_next/image` | Own Cloudinary + Unsplash 200; other Cloudinary account and Wikimedia 400 |

`test:security` covers: 21 protected GETs and 15 writes → 401 anonymously (incl. a body setting `role: admin`); forged
HS256, `alg:none` and legacy-name cookies → 401; `x-middleware-subrequest` bypass; cross-origin POST refused;
Facebook unsigned / forged-signature / wrong verify token → 403; lead webhook without or with a wrong secret → 401/503;
public blog API leaks no `status`/`content`; unknown blog → 404; sitemap has no private URLs; security headers.

**Public route checks (HTTP):** all 21 indexable routes (one sample blog post) returned 200 with one `<h1>`, a
unique title, a self-referencing `https://www.ezyloan.co.in` canonical and index/follow; `/ThankYouPage`,
`/ezylogin` and the 404 page are noindex. Sample blog post: valid `BlogPosting` + `BreadcrumbList` JSON-LD.

**Browser probe (headless Chrome, 360/768/1366 px):** 19 public pages + `/ezylogin` + a 404 URL. No horizontal
overflow, no images without `alt`. `/car-loan-balance-transfer` and `/car-loan-refinance` were **not** in the browser
probe (HTTP checks only). Console errors found in the first run (`/lending-partners` 404 image, `/loan-disclosure`
hydration error) were fixed and absent on re-run.

### FAIL
None of the checks that ran failed on the final commit.

### BLOCKED (not tested — reason and what is needed)
| Item | Why blocked | Needed |
|---|---|---|
| Logged-in admin & employee workflows (every tab, role permissions, logout, password change) | `.env.local` points at the **live** database; logins write lockout counters and sessions | Staging DB + one test account per role |
| Form submissions, lead creation, emails, WhatsApp sends | Would create real leads and send real messages | Staging DB, test SMTP/Twilio credentials |
| Valid-signature Facebook path end to end | Would save a lead in the live DB | Staging + Meta "Test" button (§3.5) |
| Admin "App Secret" field (new UI) | Admin UI needs login | Staging admin login — type-check/lint/build only so far |
| Trusted-IP behaviour behind the real proxy | Proxy chain is not visible from the repo | Staging behind the same proxy (§3.5 step 4) |
| Lighthouse scores | Lighthouse fails with `NO_NAVSTART` on this machine's Chrome (v12 and latest) | PageSpeed Insights after deploy |
| INP / field Core Web Vitals | Needs real-user data | Search Console / CrUX |

## 6. Performance

**All numbers below are local, unthrottled measurements on a developer machine — indicative only, not Core Web Vitals.**

### 6.1 JavaScript bundle (from `next build` output)
| Build | Shared first-load JS | `/` first load | `/car-loan` | `/blog/[slug]` | `/ezyadmin` |
|---|---|---|---|---|---|
| Original site — Next 14.2.5 (historical baseline) | 87.3 kB | 143 kB | 149 kB | 94.3 kB | 174 kB |
| Next 15.5.27 / React 19 (final) | 103 kB | 149 kB | 156 kB | 107 kB | 185 kB |

The increase is the React 19 / Next 15 runtime — the cost of the security upgrade, not a regression in site code.

### 6.2 Browser measurements (Next 15.5 build only)
No browser measurements were taken on the original Next 14.2.5 site. "Before" = Next 15.5 build **before** the layout
fixes; "After" = Next 15.5 build after them. Headless Chrome, PerformanceObserver, no CPU/network throttling.

| Metric | Before (21 URLs × 3 viewports) | After (7 URLs re-measured × 3 viewports) |
|---|---|---|
| Home `/` CLS, desktop 1366 px | 0.135 | 0.014 |
| Highest CLS on any other measured page/viewport | 0.036 (`/car-loan`, 768 px) | 0.027 (`/contact`, 1366 px) |
| LCP range | 108–1776 ms | 124–772 ms |

Re-measured after the fixes: `/`, `/emi-calculator`, `/lending-partners`, `/loan-disclosure`, `/ezylogin`,
`/apply-now`, `/contact`. The LCP ranges exclude `/apply-now` at 360 px, where the probe's scripted scroll made the
footer the LCP element (2.6–3.4 s). Re-measured without the scroll, its LCP was 748 ms.

## 7. Verification checklist — unconfirmed financial & marketing claims

None of these can be verified from the code. Except the default meta description (first item), **none were changed.**
The owner (and compliance, where relevant) should tick each item with evidence, or ask for the copy to be changed.

**Changed in this audit (owner to confirm):**
- [ ] `app/layout.tsx` default meta/OG/Twitter description: "Get instant approval… Low interest rates*" → facilitator
  wording ("…Approval and rates are decided by the lender"). Revert only if instant approval can be substantiated.

**Approval timelines** — the site makes five different promises:

| Claim | Location(s) | Evidence needed |
|---|---|---|
| "Choose the best loan… and get instant approval" (no qualifier; homepage services section) | `components/Services.tsx:92` | Recommend removal — approval is the lender's decision. (Earlier "Instant Approval" buttons on the commercial-vehicle, personal and property pages were already replaced; only code comments remain.) |
| "Get Loan Approved in 24 Hours* in Odisha" (homepage H1) | `components/HeroSection.tsx:1297, 1374` (H1), `:1285` (image alt text) | Lender SLA / historical data; what does `*` point to? |
| "approved in just 24 hours" / "as little as 24 hours*" | `app/car-loan-topup/page.tsx:283`, `components/Services.tsx:101` | Same |
| "approved within 48 hours" | `app/car-loan/page.tsx:350` | Same |
| "24–48 hours" (preliminary response) | `app/apply-now/page.tsx:234`, `app/personal-loan/page.tsx:256`, `app/car-loan-balance-transfer/page.tsx:94`, `app/faq/page.tsx:44`, `components/FAQSection.tsx:34`, `lib/chatbot/knowledge.ts:137` | Pick **one** wording; the FAQ's "preliminary response" phrasing is the most defensible |

**Customer counts & ratings**

| Claim | Location(s) | Evidence needed |
|---|---|---|
| "10,000+ customers" — "across Odisha" vs "across India" | `components/HeroSection.tsx:1478`, `components/Footer.tsx:384`, `app/car-loan/page.tsx:362` | CRM count; one consistent geography |
| Google rating **4.8** | `components/HeroSection.tsx:1486`, `app/about/page.tsx:227` | Live Google Business Profile rating |
| Rating **4.9/5** | `components/Footer.tsx:130`, `app/car-loan/page.tsx:362` | Contradicts 4.8 — source? |

(No `AggregateRating`/`Review` structured data exists — good; do not add any without real, visible reviews.)

**Interest rates — conflict with the site's own disclosure.** `/loan-disclosure` (`:43`, `:68`) and `/compliance`
(`:88`) state an indicative range of **10%–28% p.a.**, and several product pages repeat it (`car-loan:78`,
`car-loan-balance-transfer:24`, `car-loan-topup:24`, `commercial-vehicle-loan:22`, `property-loan:23`,
`personal-loan:85`, `about:277`, `apply-now:155,259`). Lower starting rates appear elsewhere:

| Product | Advertised | Location(s) |
|---|---|---|
| Car loan | from **7.99%** | `app/car-loan/page.tsx:42, 299` |
| Homepage (all products) | from **8%*** p.a. | `app/page.tsx:18, 53` |
| Property loan | from **8.5%** (table 8.5%–12.0%) | `app/property-loan/page.tsx:96, 140, 203–204` |
| Commercial vehicle | from **9.5%** in copy vs **8.75%** (8.75%–15%) in table | `app/commercial-vehicle-loan/page.tsx:76, 200–202` |
| Personal loan | from **10.5%** (table 10.5%–18.0%) | `app/personal-loan/page.tsx:25, 213, 316–317` |
| Services section | from **10%** | `components/Services.tsx:101` |
| Disclosure example | 14% p.a. reducing | `app/loan-disclosure/page.tsx:89` |

- [ ] Confirm each rate against current partner-lender rate cards, with the date checked.
- [ ] Make the disclosure range cover every advertised rate (or fix the advertised rates).
- [ ] Resolve commercial vehicle 8.75% vs 9.5%.

**RBI / regulatory wording**

| Claim | Location | Concern |
|---|---|---|
| `<meta name="rbi-compliant" content="true">` and `other['rbi-compliant']` | `app/layout.tsx:113, 200` | Not a standard tag; asserts compliance status without a source |
| JSON-LD `regulatoryCompliance: ['RBI-DSA-Guidelines', …]`, `additionalType: 'DirectSellingAgent'` | `app/layout.tsx:175`, `:174` | Not schema.org properties; confirm wording with compliance |
| Keyword "RBI compliant loans" | `app/layout.tsx:47` | Same |
| Footer badge "RBI Compliant Partner" | `components/Footer.tsx:391` | Implies an RBI status/endorsement; confirm or reword (e.g. "Partner lenders are RBI-regulated") |
| "We are not an RBI-registered NBFC…" | `app/loan-disclosure/page.tsx:207` | Accurate disclaimer — keep |

**Other**
- [ ] Legal pages "Last Updated" pinned to **06 Oct 2026** (`app/compliance`, `app/terms-and-conditions` incl. JSON-LD `dateModified`, `app/loan-disclosure`). Confirm the real revision date.
- [ ] `sameAs: []` in `app/layout.tsx` — add the real social profile URLs.

## 8. Remaining risks (priority order)
1. **Framework major upgrade not yet exercised in authenticated flows** (§5 BLOCKED). Run the full staging checklist.
2. **Webhook secrets & proxy config must be set at deploy time**, or Facebook leads and the direct lead webhook stop
   (by design) and auto-blocking stays off (§3).
3. **Dependencies still flagged by `npm audit`:** `nodemailer` (fix needs a major upgrade; test SMTP after),
   `sharp`/libvips (mitigated by the host allowlist), Next advisories fixed only after 15.5.27 (take 15.5.x patches
   regularly). `sanitize-html` advisory reviewed: **not exploitable** (vulnerable attributes are not on the allowlist).
4. **Unverified claims** in §7 — regulatory and consumer-protection exposure, not a code defect.
5. Auto-blocks are permanent (no expiry); rate limiter is in-memory (single instance only); CSP doesn't yet restrict
   `script-src` (needs nonces — see SECURITY.md).
6. The Integrations GET is readable by employees with the Automations tab; it returns the Facebook **verify token**
   in clear (secrets are masked). Low risk; mask it if employees shouldn't see it.
7. Code quality (lint warnings only): 88 unused variables, 18 `<img>` that could be `next/image`, `any` types.

## 9. Deployment checklist (reviewed — nothing has been deployed)

**Build requirements (verified):** Node `^18.18 || ^19.8 || >=20` (from `next@15.5.27`'s `engines`; tested locally
on Node 24). `npm ci` from the committed lockfile. `CLOUDINARY_CLOUD_NAME` must be present when `npm run build` runs: the
build bakes `pathname: /<cloud>/**` into `.next/required-server-files.json` (verified). Without it the build still
succeeds but the optimizer allows **any** Cloudinary account (weaker, not broken). It is also needed at runtime for
uploads/deletes. Lint errors now fail the build.

**Staging isolation (required before production):**
- Staging must use its **own** `DATABASE_URL` (separate cluster or database, never the production URI). Today
  `.env.local` on this machine points at the production database — do not use it for staging or tests that log in or submit.
- Restore a recent production backup into staging if realistic data is needed; scrub customer contact details if the
  staging environment is less protected.
- Use test SMTP / Twilio sandbox credentials on staging so no real customers are emailed or messaged.
- Integration settings (Facebook App Secret, Page token) live in the database, so they must be configured
  separately on staging.

**Steps**
1. Back up production (`mongodump`) and record the currently deployed commit (`git rev-parse HEAD` on the server).
2. **Staging:** `git checkout audit/hardening-seo && npm ci && npm run build && npm start`, with env from §3.4.
3. Staging checks: `BASE_URL=<staging> npm run test:security` (expect 60/60); §3.5 webhook steps; log in as admin and
   as an employee and open every tab; submit each public form once; publish/unpublish a draft blog; upload and delete
   a banner and a loan document (confirm removal in the Cloudinary console); send a WhatsApp message.
4. **Production** (only after staging passes): set `FACEBOOK_APP_SECRET` (or save it in the admin panel immediately
   after deploy), `WEBHOOK_LEAD_SECRET` (and update any form tool that posts to `/api/webhook/lead` to send the
   `x-webhook-secret` header), one of `TRUSTED_IP_HEADER` / `TRUSTED_PROXY_HOPS`, `CLOUDINARY_CLOUD_NAME`. Then
   `npm ci && npm run build`, restart.
5. After deploy: `BASE_URL=https://www.ezyloan.co.in npm run test:security` (read-only, sends no lead); send a Meta
   test lead; check server logs for "Rejected Facebook webhook" or "SECURITY:" warnings; review Admin → Blocked IPs.
6. Search Console: resubmit `sitemap.xml`; URL-inspect `/`, one loan page, one blog post. Check PageSpeed Insights.

**Rollback:** `git checkout 7b20ef9` (current `main`, the pre-audit code) `&& npm ci && npm run build`, restart.
No schema or data migrations were made, so no database step is needed. Rolling back **re-introduces** the Next 14.2.5
critical advisories and the fail-open webhooks, so treat it as temporary. Values saved through the new App Secret
field stay in the `integrations` document; the old code reads them and enforces the signature when present.
