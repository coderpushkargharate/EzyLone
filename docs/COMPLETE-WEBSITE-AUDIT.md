# EzyLoan — Website Audit, Implementation & Master Checklist (24 Nov 2026)

Branch `feature/marketing-automation`. **Nothing has been deployed, committed or pushed in this round.**
No production database record, Search Console / Bing setting, DNS or hosting setting was changed.
Every number below comes from a tool run recorded in the section it appears in; nothing is estimated.

Companion documents (each has findings, evidence and pending items):

| Topic | Document |
|---|---|
| Every route, API endpoint and its auth | `docs/ROUTE-INVENTORY.md` |
| SEO, keywords, blog system, AI visibility, Search Console/Bing | `docs/SEO-IMPLEMENTATION-PLAN.md` |
| Security | `docs/SECURITY-AUDIT.md` |
| Performance (measured) | `docs/PERFORMANCE-AUDIT.md` |
| UI/UX & accessibility | `docs/UI-UX-AUDIT.md` |
| Claims needing management decisions | `docs/CLAIMS_REVIEW.md` (§7 added this round) |
| Earlier engineering/security audit (Oct 2026) | `docs/EZYLOAN_AUDIT_REPORT.md`, `docs/STAGING_CHECKLIST.md` |

The brief's twelve "final" report names are covered by the documents above (one topic per document instead of
twelve partly-empty files). Lead/CRM, QA and deployment are sections 5–7 of this file.

---

## 1. Summary

| Item | Result |
|---|---|
| Stack | Next.js **15.5.29** (was 15.5.27), React 19.3, App Router, MongoDB/Mongoose 8.24, self-hosted `next start` behind a proxy |
| Routes discovered | 21 indexable static pages + 42 published blog posts (63 sitemap URLs) + 3 private/noindex pages + 4 redirects + 86 API route files |
| Routes audited | **All 69 crawled URLs** (every sitemap URL + private pages + redirects + a 404 probe), and 22 page templates × 5 widths in a real browser |
| Issues identified this round | 27 (list in §3; 1 not applicable — #26) |
| Fixed and re-tested | 16 (#1–8, #10–17) |
| Pending management approval | 7 (#9, #18–23: claims, major upgrades, contact details, GST/CIN, blog titles) + menu sign-off |
| Pending external access | 3 (#24 GA4, #25 Bing, #27 field performance data) + Search Console submission and Privyr end-to-end test |
| Production build | ✅ `npm run build` passes (lint + types), 30 routes, all public pages static/ISR |
| Tests | ✅ unit 40/40 · ✅ security (HTTP) 91/91 · ✅ marketing 114/115 (1 = integration suite cannot start its local `mongod` on this machine — environment, see §6) |
| Crawl (local build) | 69 URLs, **0 broken internal links, 0 duplicate titles, 0 duplicate descriptions**, 0 invalid JSON-LD |
| Browser layout check | 110 route×width checks, **0 horizontal overflow, 0 console errors** |

## 2. Architecture (verified from code)

Unchanged from `docs/EZYLOAN_AUDIT_REPORT.md` §1 except the versions above. Key points relevant to this brief:

- **Rendering:** every public page is server-rendered HTML (static or ISR). Blog list revalidates every 10 min, product pages hourly, plus on-publish revalidation. Crawlers and AI bots get full content without running JavaScript (crawl measured 4–13 k characters of text per page in the initial HTML).
- **Auth:** server-side sessions + HS256 JWT in a `__Host-` HttpOnly cookie; middleware gates `/ezyadmin`, and every admin API re-checks the session (`lib/auth.ts → requireAuth`).
- **Leads:** `/apply-now` → `POST /api/loans` (and contact/hero forms → `/api/leads`) → MongoDB, then email to `contact@ezyloan.co.in` **and the Privyr incoming-leads address** (`lib/email.ts:38`), plus optional `CRM_WEBHOOK_URL` (`lib/crm.ts`). First/last-touch UTM + click-id attribution is stored with each lead (`lib/marketing/`).
- **Analytics on the live site (checked 24 Nov):** Google Ads tag `AW-18024243962` loads; **no GA4 measurement id and no Meta Pixel id are configured** (`/api/site-tags` returns `null` for both); Google Search Console is verified by meta tag; **no Bing `msvalidate.01` tag** is present.

## 3. Issues found and what happened to each

Status key: ✅ Completed and verified · 🟡 Implemented, not verified · ⏳ Pending external access · 🟠 Pending management approval · ⛔ Blocked · — Not applicable

| # | Issue (evidence) | Fix / status |
|---|---|---|
| 1 | No dedicated **Used Car Loan** page, although it is the first of the five primary services (`/car-loan` is new-car only) | ✅ New `/used-car-loan`: server-rendered, eligibility, what lenders check, documents, 4-step process, new-vs-used, disclosure block, 6 FAQs, related services, breadcrumbs, `LoanOrCredit` + `BreadcrumbList` JSON-LD, in sitemap, nav, footer, homepage cards, topic clusters, `llms.txt`. No rate/amount/approval claim beyond `/loan-disclosure` |
| 2 | Navigation had no route to the used car loan; car products split across "Car Refinance" menu + a top-level link | ✅ One **"Car Loans"** menu (Used, New, Refinance, Top-Up, Balance Transfer), desktop + mobile. 🟠 Final product categories still need management sign-off (task item 3) |
| 3 | Breadcrumb structured data missing on `/faq`, `/lending-partners`, `/compliance`, `/loan-disclosure`, `/terms-and-conditions` | ✅ Added (`app/*/layout.tsx`); crawl confirms `BreadcrumbList` on every indexable page except the homepage |
| 4 | Heading levels skipped on `/about` (h1→h4), `/commercial-vehicle-loan` (h1→h3), `/faq` (h1→h3) | ✅ Fixed; crawl shows 0 skips site-wide |
| 5 | Titles/descriptions truncated in results: 8 product/apply pages had titles > 60 or descriptions 167–201 chars | ✅ All rewritten to ≤ 62/160; balance-transfer copy no longer promises a lower rate ("may offer better terms") |
| 6 | Homepage social title repeated the brand ("EzyLoan – … \| EzyLoan") | ✅ `pageMeta` no longer appends the brand when the title has it |
| 7 | Desktop menu items run together for visitors with *reduced motion* enabled (padding lived inside a `prefers-reduced-motion: no-preference` block) | ✅ Spacing moved out of the motion query (`components/Header.tsx`); verified in screenshots with reduced motion emulated |
| 8 | **Critical dependency advisory**: Next.js ≤ 15.5.27 unauthenticated RCE in image optimisation + 4 more Next advisories; Mongoose prototype-pollution/sanitizeFilter; sanitize-html XSS bypasses; follow-redirects credential leak | ✅ Patched within current majors: next 15.5.29, mongoose 8.24.11, sanitize-html 2.18.2, follow-redirects 1.16.3. `npm audit` 9 → 5 (0 critical). All 65 pages render byte-for-byte identical text/headings/links before vs after |
| 9 | Remaining advisories need **major** upgrades: nodemailer 6→10, sharp 0.34→0.35; postcss inside Next (build-time only) | 🟠 Not auto-upgraded (brief rule). See `SECURITY-AUDIT.md` §3 |
| 10 | Blog list loaded original full-size Cloudinary JPEGs into 400 px cards; mobile LCP 5.9 s, 1.3 MB | ✅ `lib/imageUrl.ts` adds `f_auto,q_auto` + size; card image 192 KB → 34 KB (WebP). Mobile LCP 5.9 s → 1.9 s, transfer 1,321 → 841 KB (lab, §PERFORMANCE) |
| 11 | Blog article hero + related cards also full-size | ✅ Same helper with `srcSet`/`sizes` |
| 12 | **AI referrals not tracked:** ChatGPT (`utm_source=chatgpt.com`) counted as "campaign", Perplexity as "referral", **Gemini as organic search** | ✅ New `ai_referral` channel (ChatGPT, Perplexity, Gemini, Copilot, Claude, Meta AI, You.com, Phind) + admin filter. Applies to new leads |
| 13 | Referrer matching used substrings: `/t\.co/` classified microsoft.com, reddit.com etc. as *social*; `google.com.evil.io` as search | ✅ Exact host matching; 9 new unit tests |
| 14 | BlogPosting `author` "EzyLoan Editorial Team" typed as `Person` | ✅ Team/brand bylines are `Organization` |
| 15 | Contrast: white 10 px labels on 90 % green-500 in the mobile WhatsApp bar (≈ 2.3 : 1) | ✅ Darkened to green-700/800 (≈ 5 : 1 / 7 : 1); Lighthouse accessibility `/used-car-loan` 96 → **100** |
| 16 | Apply Now progress bar had no accessible name | ✅ `aria-label` added; Lighthouse accessibility `/apply-now` 97 → **100** |
| 17 | About/Apply Now H1s; contact-page map link was a placeholder; footer address spelled differently; GST bracket typo | ✅ (previous round, committed by the owner as `329034f`) |
| 18 | Homepage H1 "Get Loan Approved in 24 Hours\*" — approval-time claim | 🟠 `CLAIMS_REVIEW.md` N1 |
| 19 | Homepage card highlights ("Up to 100% Funding", "Up to ₹3 Crore", "Lowest EMIs", "Tax Benefits"…), Apply Now "Top-Up up to 200%", top-up "approved in 24 hours / same rate, no charges", CV "thousands of customers", About "100K+ customers / ₹500Cr+ disbursed / 24/7" and a stale "Latest Automotive News" block | 🟠 `CLAIMS_REVIEW.md` N2–N7 (plus earlier §1–5: rates below disclosed range, 4.8 vs 4.9 rating, customer count, RBI badge) |
| 20 | Two public emails (`care@` in schema/legal, `contact@` in footer/homepage) | 🟠 Owner to pick one |
| 21 | Two different Facebook URLs (footer vs voice assistant); organisation `sameAs` empty | 🟠 Owner to confirm official profiles; then add to `sameAs` |
| 22 | GST/CIN shown as "[To be added]" on `/loan-disclosure`, `/privacy-policy` | 🟠 Compliance disclosure — needs approval |
| 23 | Three blog titles 74–86 chars (DB content) | 🟠 Editorial: shorten in admin (`from-listing-to-driveway…`, `property-loan-in-cuttack…`, `car-loan-top-up-loan-in-jeypore…`) |
| 24 | GA4 not configured on production | ⏳ Needs the GA4 measurement id (admin → site tags, no rebuild) |
| 25 | Bing Webmaster verification not visible | ⏳ Needs Bing access (import from Search Console is simplest) |
| 26 | Homepage review avatars hot-linked from Google; Google sometimes answers 429 (ORB-blocked) | — Existing fallback (initials) already handles it; recommend storing avatars locally or using initials only |
| 27 | Mobile main-thread time ~1.1–1.4 s (lab, includes deferred gtag/chat after load) | ⏳ Needs field data (PageSpeed Insights / CrUX) after deploy before changing scripts — `PERFORMANCE-AUDIT.md` |

## 4. Files changed this round

New: `app/used-car-loan/{layout,page}.tsx`, `app/{faq,lending-partners,compliance,loan-disclosure,terms-and-conditions}/layout.tsx`,
`lib/imageUrl.ts`, `scripts/seo-crawl.mjs`, `scripts/layout-check.mjs`, `scripts/vitals-lab.mjs`, `scripts/test-image-url.mjs`, `docs/*.md` (this set).

Modified: `components/Header.tsx` (Car Loans menu, reduced-motion spacing), `components/Footer.tsx`, `components/Services.tsx`
(used-car card appended so admin card images keep their slots), `components/FAQSection.tsx` (questions are `<h2>`),
`components/FixedFooter.tsx` (contrast), `app/sitemap.ts`, `lib/seo.ts`, `public/llms.txt`, 8 product `layout.tsx` metadata,
`app/about/page.tsx`, `app/commercial-vehicle-loan/page.tsx`, `app/apply-now/page.tsx`, `app/blogs/page.tsx`,
`app/blog/[slug]/page.tsx`, `lib/marketing/attribution.ts`, `components/admin/MarketingManager.tsx`,
`scripts/test-marketing.mjs`, `package.json` / `package-lock.json`, `docs/CLAIMS_REVIEW.md`.

No URL was removed or renamed; no API, model or database schema changed.

## 5. Lead journey & Privyr CRM

| Check | Status | Evidence |
|---|---|---|
| Form validation (required fields, phone, email, loan type), consent checkbox, disabled + "Submitting…" state against double submit | ✅ code review (`app/apply-now/page.tsx`) | Existing behaviour, unchanged |
| Anti-spam token + honeypot | ✅ | `GET /api/form-token` → signed token; `lib/formGuard.ts` |
| Lead stored, then emailed to `contact@` + Privyr incoming-leads address | 🟡 code path verified | `lib/email.ts:38, 278, 316, 381` |
| **End-to-end test website → Privyr** | ⏳ | Not run: a submission writes to the production database, sends emails and creates a CRM lead. Needs either a staging database + Privyr test inbox, or owner approval for one tagged test lead |
| UTM / click-id capture, first touch never overwritten by later navigation | ✅ code + tests | `lib/marketing/clientAttribution.ts`: first touch written once; last touch only on a new campaign/external referrer |
| Channel for Google / Bing organic, ChatGPT / AI, social, paid, direct | ✅ tests (114 passing) | `deriveChannel`, issues #12–13 |
| No sensitive data to analytics | ✅ test | "GA4 params: PII keys and email/phone-like values dropped" |
| Qualified enquiries / funded cases | ⏳ | Requires Privyr → website status sync (Privyr API/webhook access); lead statuses exist in the admin but are not fed back from Privyr |

## 6. QA evidence

| Run | Command | Result |
|---|---|---|
| Production build | `npm run build` | ✅ exit 0, Next 15.5.29 |
| Type check | `npx tsc --noEmit` | ✅ |
| Lint | `npx next lint` | ✅ 0 errors (365 warnings, almost all pre-existing `no-explicit-any`) |
| Unit | `npm run test:unit` | ✅ 8 + 20 + 12 passed |
| Security (HTTP, against local prod build) | `BASE_URL=http://localhost:3101 npm run test:security` | ✅ 91 passed, 0 failed |
| Marketing | `npm run test:marketing` | 114 passed, 1 failed — the integration part spawns a local `mongod`; the cached `mongod 4.4.29` binary on this PC exits immediately (`ECONNREFUSED`). Not caused by this change; re-run with `MONGOD_BIN` pointing at a working mongod |
| SEO crawl | `node scripts/seo-crawl.mjs http://localhost:3101 out.json` | ✅ 69 URLs, 0 broken, 0 duplicates, every indexable page: 1 H1, self canonical, OG + Twitter, valid JSON-LD |
| Responsive/console | `node scripts/layout-check.mjs http://localhost:3101 out.json shots/` | ✅ 110 checks at 320/375/768/1024/1440: 0 overflow, 0 console errors |
| Lab vitals | `node scripts/vitals-lab.mjs http://localhost:3101 out.json` | see `PERFORMANCE-AUDIT.md` |
| Lighthouse | `npx lighthouse` 12.8 / 13.6 | Accessibility/SEO/best-practice categories ran (SEO 100 on all tested pages). **Performance category failed with `NO_NAVSTART`** on this machine's Chrome 157 — no Lighthouse performance score is claimed |
| Not tested | — | Real form submission, admin login flows (would touch lockout counters), Search Console/Bing, Google Rich Results Test (needs a public URL — run after deploy) |

Found and fixed during QA: a stale dev server writing into `.next` during a production build produced a broken
middleware bundle, and a stale server left an ISR copy of `/blogs` pointing at deleted chunks. Both were local
process artefacts, but the second is a real deployment risk → see §7 step 3.

## 7. Deployment checklist (not executed)

1. Back up: `git tag pre-seo-2026-11` on the deployed commit; export the MongoDB database (Atlas snapshot or `mongodump`).
2. Env: no new variables. Optional: set the GA4 id in admin → Site tags after deploy.
3. **Stop the running `next start` before `npm run build`** (or build in a fresh directory and switch), and remove `.next/server/route-cache` if you reuse the folder — otherwise the old process can write cached pages that reference deleted JS chunks (observed locally on `/blogs`).
4. `npm ci && npm run build && npm run test:unit`, start, then `BASE_URL=https://www.ezyloan.co.in npm run test:security` and `node scripts/seo-crawl.mjs https://www.ezyloan.co.in post-deploy.json`.
5. Check `/used-car-loan`, the Car Loans menu (desktop + mobile), `/blogs` images, `/sitemap.xml` (63 URLs) and `/llms.txt`.
6. Search Console: resubmit `https://www.ezyloan.co.in/sitemap.xml`, URL-inspect `/used-car-loan` and request indexing; run Rich Results Test on `/used-car-loan` and one blog post.
7. Rollback: redeploy the tagged commit (`git checkout pre-seo-2026-11 && npm ci && npm run build`). No data migration to undo.

## 8. Master checklist — every public route

✅ = metadata, single H1, canonical, breadcrumbs, valid JSON-LD, OG/Twitter, no overflow at 5 widths, no console errors — all re-verified on the local production build.

| Route | SEO/tech | Content claims | Notes |
|---|---|---|---|
| `/` | ✅ | 🟠 N1, N2, §1–4 | Homepage redesign (Phase 7) not started — waits on claims decisions |
| `/used-car-loan` | ✅ new | ✅ | |
| `/car-loan` | ✅ | 🟠 rates 7.99% (§4), "48 hours" (A6), 4.9 rating | |
| `/car-loan-topup` | ✅ | 🟠 N4 | |
| `/car-loan-balance-transfer` | ✅ | ✅ meta fixed | |
| `/car-loan-refinance` | ✅ | — | |
| `/commercial-vehicle-loan` | ✅ | 🟠 N5, rate 8.75 vs 9.5% | |
| `/personal-loan` | ✅ | 🟠 "24-48 hours approval" (A6b) | |
| `/property-loan` | ✅ | 🟠 8.5% below disclosed range | |
| `/apply-now` | ✅ | 🟠 N3 | a11y 100 |
| `/about` | ✅ | 🟠 4.8 rating, N6, N7 | |
| `/contact` | ✅ | 🟠 email choice | |
| `/blogs` + 42 × `/blog/*` | ✅ | — | 🟠 3 long titles (editorial) |
| `/emi-calculator`, `/faq`, `/careers`, `/lending-partners` | ✅ | — | |
| `/compliance`, `/loan-disclosure`, `/privacy-policy`, `/terms-and-conditions` | ✅ | 🟠 GST/CIN, RBI wording (§5) | |
| `/ThankYouPage`, `/ezylogin` | ✅ noindex | — | |
| Branch/location pages | — | — | 🟠 Not created: only one verified office (Cuttack). City pages need confirmed service areas/branches first, otherwise they are doorway pages |

## 9. Phase status

| Phase | Status |
|---|---|
| 0 Discovery & baseline | ✅ this file, `ROUTE-INVENTORY.md`, baseline crawl of the live site |
| 1 Per-page SEO audit | ✅ all 69 URLs; fixes #3–6, #14 |
| 2 Five service pages | ✅ Used Car Loan created; New, Top-Up, BT, CV exist and were re-optimised. 🟠 Their benefit copy carries claims (§3 #19) |
| 3 Keyword research | 🟡 Strategy and URL mapping in `SEO-IMPLEMENTATION-PLAN.md`; ⏳ volumes/difficulty need a keyword tool or Search Console data (none fabricated) |
| 4 Blog SEO system | ✅ verified: 42/42 posts 200, unique canonical, BlogPosting + breadcrumbs, OG image, alt text, in sitemap, drafts excluded (`PUBLIC_BLOG_FILTER`), related posts + product links; images now resized. Validation = `seo-crawl.mjs` after each publish |
| 5 Crawlers & AI visibility | ✅ robots/sitemap/llms.txt verified; GPTBot allowed today by `User-agent: *` — 🟠 not changed (policy decision) |
| 6 Structured data | ✅ valid JSON-LD on all pages; ⏳ Rich Results Test after deploy; 🟠 `sameAs`, `regulatoryCompliance` (§5) |
| 7 Homepage & brand authority | 🟠 Blocked on claims decisions (the hero H1 and cards *are* the claims) |
| 8 UI/UX transformation | 🟡 Automated checks + targeted fixes; a full visual redesign of every route was **not** done — see `UI-UX-AUDIT.md` for the proposed design-system work |
| 9 Performance | ✅ blog images; measured in lab; ⏳ field data |
| 10 Leads/Privyr | ✅ attribution fixes; ⏳ end-to-end Privyr test |
| 11 Security | ✅ dependency patching + 91 HTTP checks; 🟠 two major upgrades |
| 12 Accessibility/code quality | ✅ Lighthouse a11y 100 on all tested pages after fixes; lint 0 errors |
| 13 QA | ✅ §6 |
| 14 Search Console/Bing/GA4 | ⏳ access needed |
| 15 Deployment | Not deployed — §7 |
