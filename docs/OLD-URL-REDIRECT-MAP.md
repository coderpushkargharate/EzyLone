# Old URL Redirect Map — FOR APPROVAL (Stage 2 review, 28 Nov 2026)

**Nothing has been implemented.** `next.config.mjs` is unchanged, and every row in `scripts/seo/legacy-urls.json` has
`"approved": false`, so the generator (`nextRedirects()`) produces **zero** redirects until rows are signed off. That file is the
single source of truth: the table below, the validator, the generated Next.js rules and the regression test all read it.

## Evidence sources and their limits

| Evidence | Source | Measured on | Shows | Does not show |
|---|---|---|---|---|
| Current status + redirect chain | `scripts/seo/verify-redirect-map.mjs` (GET, manual redirect following) | 28 Nov 2026 | Every old URL is **404** on www. From `http://ezyloan.co.in` it is **301 → 301 → 404** (nginx http→https, then the app's apex→www rule) | — |
| Destination check | same script | 28 Nov 2026 | Each destination answers **200 with 0 redirects**; its live `<title>` | — |
| Archive history | Wayback Machine CDX (629 captures of `ezyloan.co.in/*`) | 28 Nov 2026 | The URL was public with HTTP 200 between the first and last capture dates | Traffic, rankings, whether Google indexed it |
| Archived page content | Wayback snapshot `<title>`, `<h1>`, meta description (earliest **and** latest capture where available) | 28 Nov 2026 | What the page was about | The Apr 2025–Feb 2026 `.php` site was a client-rendered app: its snapshots show one generic shell title ("EzyLoan - Quick & Easy Loans") for every page |
| **Backlinks** | **[Not available]**: no backlink tool or GSC yet | — | — | Which old URLs have external links. After GSC: Domain property → *Links → Top linked pages* |
| **Indexing / clicks** | **[Not available]** until GSC | — | — | `npm run seo:gsc -- inspect --legacy` will show whether Google still knows each URL |

**Evidence basis** per row: ✅ **Title/H1 verified** = the archived page's own title or H1 names the same page or product ·
🟡 **URL name + verified sibling** = the snapshot is the generic app shell, but the same page under the earlier `.html` or 2023
naming *was* verified, and the 2025 site used parallel names · 🟠 **URL name only** = no sibling to cross-check.

## 1. Exact mappings — 30 URLs (each needs approval)

Totals: **18 ✅ title/H1-verified, 11 🟡 URL + sibling, 1 🟠 URL only.** All 30: status now 404, destination 200 with 0 hops, validator 0 errors.

| # | Old URL | Now: www · http-apex chain | Destination (status, title) | Evidence basis | Archive evidence | Snapshot |
|---|---|---|---|---|---|---|
| 1 | `/index.php` | 404 · 301 → 301 → 404 | `/` (200, 0 hops) — EzyLoan – Car, Personal & Property Loans in Odisha | ✅ Title/H1 verified | 2 capture(s) 2023-02-25 → 2025-04-30; 2023-02-25: "India's Trusted and Fastest Personal Loan / Apply Online Platform" — site root | [archive](https://web.archive.org/web/20250430060455/https://ezyloan.co.in/index.php) |
| 2 | `/index.html` | 404 · 301 → 301 → 404 | `/` (200, 0 hops) — EzyLoan – Car, Personal & Property Loans in Odisha | ✅ Title/H1 verified | 2 capture(s) 2025-01-14 → 2025-03-15; 2025-03-15: "Ezyloan - Fast, Easy, and Affordable Loans", H1 "Apply For Loan Against Car" — site root | [archive](https://web.archive.org/web/20250315161603/https://ezyloan.co.in/index.html) |
| 3 | `/about-us` | 404 · 301 → 301 → 404 | `/about` (200, 0 hops) — About EzyLoan – Loan DSA in Cuttack, Odisha | ✅ Title/H1 verified | 2 capture(s) 2024-03-14 → 2024-06-18; "About Us - Eazy Loan" / H1 "About Us" | [archive](https://web.archive.org/web/20240618054300/https://ezyloan.co.in/about-us/) |
| 4 | `/about.html` | 404 · 301 → 301 → 404 | `/about` (200, 0 hops) — About EzyLoan – Loan DSA in Cuttack, Odisha | ✅ Title/H1 verified | 3 capture(s) 2025-01-14 → 2025-09-06; 2025-01-14: "About Us - Ezyloan / Fast, Easy, and Affordable Loans" / H1 "About Us" | [archive](https://web.archive.org/web/20250906142420/https://ezyloan.co.in/about.html) |
| 5 | `/about.php` | 404 · 301 → 301 → 404 | `/about` (200, 0 hops) — About EzyLoan – Loan DSA in Cuttack, Odisha | ✅ Title/H1 verified | 1 capture(s) 2023-02-25; 2023-02-25: H1/title "About us" | [archive](https://web.archive.org/web/20230225124922/http://ezyloan.co.in/about.php) |
| 6 | `/aboutus.php` | 404 · 301 → 301 → 404 | `/about` (200, 0 hops) — About EzyLoan – Loan DSA in Cuttack, Odisha | 🟡 URL name + verified sibling | 2 capture(s) 2025-04-30 → 2025-06-23; generic SPA shell title; sibling /about.html verified | [archive](https://web.archive.org/web/20250623021425/https://ezyloan.co.in/aboutus.php) |
| 7 | `/apply.php` | 404 · 301 → 301 → 404 | `/apply-now` (200, 0 hops) — Apply Online for a Car, Personal or Property Loan | ✅ Title/H1 verified | 1 capture(s) 2023-02-25; 2023-02-25: "Apply Online" | [archive](https://web.archive.org/web/20230225124922/http://ezyloan.co.in/apply.php) |
| 8 | `/blog.php` | 404 · 301 → 301 → 404 | `/blogs` (200, 0 hops) — Loan Guides, EMI Tips & Finance Articles | 🟡 URL name + verified sibling | 2 capture(s) 2025-05-14 → 2025-08-11; generic SPA shell title; blog index by name | [archive](https://web.archive.org/web/20250811171846/https://ezyloan.co.in/blog.php) |
| 9 | `/car-loan-balance-transfer.html` | 404 · 301 → 301 → 404 | `/car-loan-balance-transfer` (200, 0 hops) — Car Loan Balance Transfer in Odisha – Lower Your EMI | ✅ Title/H1 verified | 2 capture(s) 2025-01-14 → 2025-07-19; 2025-01-14: H1 "Discover the Benefits of Car Loan Balance Transfer" | [archive](https://web.archive.org/web/20250719091047/https://ezyloan.co.in/car-loan-balance-transfer.html) |
| 10 | `/car-loan-balance-transfer.php` | 404 · 301 → 301 → 404 | `/car-loan-balance-transfer` (200, 0 hops) — Car Loan Balance Transfer in Odisha – Lower Your EMI | 🟡 URL name + verified sibling | 2 capture(s) 2025-04-30 → 2025-05-14; generic SPA shell; sibling .html verified | [archive](https://web.archive.org/web/20250514051859/https://ezyloan.co.in/car-loan-balance-transfer.php) |
| 11 | `/used-car-bt` | 404 · 301 → 301 → 404 | `/car-loan-balance-transfer` (200, 0 hops) — Car Loan Balance Transfer in Odisha – Lower Your EMI | 🟠 URL name only | 1 capture(s) 2025-09-06; generic SPA shell, single capture 2025-09-06; "BT" read as balance transfer | [archive](https://web.archive.org/web/20250906123835/https://ezyloan.co.in/used-car-bt) |
| 12 | `/car-loan-refinance.php` | 404 · 301 → 301 → 404 | `/car-loan-refinance` (200, 0 hops) — Loan Against Car in Odisha – Used Car Refinance | 🟡 URL name + verified sibling | 2 capture(s) 2025-04-30 → 2025-05-14; generic SPA shell; sibling /car-refinance.html verified | [archive](https://web.archive.org/web/20250514042142/https://ezyloan.co.in/car-loan-refinance.php) |
| 13 | `/car-refinance.html` | 404 · 301 → 301 → 404 | `/car-loan-refinance` (200, 0 hops) — Loan Against Car in Odisha – Used Car Refinance | ✅ Title/H1 verified | 3 capture(s) 2025-01-14 → 2025-03-15; "Car Loan Refinance - Ezyloan / Save with Lower Interest Rates" | [archive](https://web.archive.org/web/20250315165817/https://ezyloan.co.in/car-refinance.html) |
| 14 | `/car-loan-topup.html` | 404 · 301 → 301 → 404 | `/car-loan-topup` (200, 0 hops) — Car Loan Top-Up in Odisha – Extra Funds on Your Loan | ✅ Title/H1 verified | 3 capture(s) 2025-01-14 → 2025-08-11; 2025-01-14: H1 "Eligibility for Car Loan Top Up" | [archive](https://web.archive.org/web/20250811181307/https://ezyloan.co.in/car-loan-topup.html) |
| 15 | `/car-loan-topup.php` | 404 · 301 → 301 → 404 | `/car-loan-topup` (200, 0 hops) — Car Loan Top-Up in Odisha – Extra Funds on Your Loan | 🟡 URL name + verified sibling | 2 capture(s) 2025-04-30 → 2025-05-14; generic SPA shell; sibling .html verified | [archive](https://web.archive.org/web/20250514055712/https://ezyloan.co.in/car-loan-topup.php) |
| 16 | `/commercial-vehicle-loan.html` | 404 · 301 → 301 → 404 | `/commercial-vehicle-loan` (200, 0 hops) — Commercial Vehicle Loan in Odisha – Truck & Bus | ✅ Title/H1 verified | 3 capture(s) 2025-01-14 → 2025-03-15; "Commercial Vehicle Loan - Ezyloan" / H1 "Commercial Vehicle Loan by EzyLoan" | [archive](https://web.archive.org/web/20250315164006/https://ezyloan.co.in/commercial-vehicle-loan.html) |
| 17 | `/commercial-vehicle-loan.php` | 404 · 301 → 301 → 404 | `/commercial-vehicle-loan` (200, 0 hops) — Commercial Vehicle Loan in Odisha – Truck & Bus | 🟡 URL name + verified sibling | 2 capture(s) 2025-04-30 → 2025-05-14; generic SPA shell; sibling .html verified | [archive](https://web.archive.org/web/20250514060550/https://ezyloan.co.in/commercial-vehicle-loan.php) |
| 18 | `/new-car-loan.html` | 404 · 301 → 301 → 404 | `/car-loan` (200, 0 hops) — New Car Loan in Odisha – Bhubaneswar & Cuttack | ✅ Title/H1 verified | 3 capture(s) 2025-01-14 → 2025-03-15; "New Car Loan - Ezyloan" / H1 "New Car Loan by EzyLoan" | [archive](https://web.archive.org/web/20250315182310/https://ezyloan.co.in/new-car-loan.html) |
| 19 | `/new_car_loan.php` | 404 · 301 → 301 → 404 | `/car-loan` (200, 0 hops) — New Car Loan in Odisha – Bhubaneswar & Cuttack | 🟡 URL name + verified sibling | 2 capture(s) 2025-04-30 → 2025-05-14; generic SPA shell; sibling /new-car-loan.html verified | [archive](https://web.archive.org/web/20250514061048/https://ezyloan.co.in/new_car_loan.php) |
| 20 | `/personal-loan.html` | 404 · 301 → 301 → 404 | `/personal-loan` (200, 0 hops) — Personal Loan in Odisha – Bhubaneswar, Cuttack & More | ✅ Title/H1 verified | 3 capture(s) 2025-01-14 → 2025-03-15; "Personal Loan - Ezyloan" / H1 "Personal Loan by EzyLoan" | [archive](https://web.archive.org/web/20250315174934/https://ezyloan.co.in/personal-loan.html) |
| 21 | `/personal.php` | 404 · 301 → 301 → 404 | `/personal-loan` (200, 0 hops) — Personal Loan in Odisha – Bhubaneswar, Cuttack & More | 🟡 URL name + verified sibling | 2 capture(s) 2025-04-30 → 2025-05-14; generic SPA shell; sibling /personal-loan.html verified | [archive](https://web.archive.org/web/20250514045733/https://ezyloan.co.in/personal.php) |
| 22 | `/property_loan.php` | 404 · 301 → 301 → 404 | `/property-loan` (200, 0 hops) — Loan Against Property in Odisha – LAP Eligibility | 🟡 URL name + verified sibling | 2 capture(s) 2025-04-30 → 2025-05-14; generic SPA shell; same 2025 .php product-page family | [archive](https://web.archive.org/web/20250514035819/https://ezyloan.co.in/property_loan.php) |
| 23 | `/emi-calculator.html` | 404 · 301 → 301 → 404 | `/emi-calculator` (200, 0 hops) — EMI Calculator – Car, Personal & Property Loans | ✅ Title/H1 verified | 3 capture(s) 2025-01-14 → 2025-09-06; 2025-01-14: "EMI Calculator - Ezyloan / Calculate Your Monthly Loan Payments" | [archive](https://web.archive.org/web/20250906133819/https://ezyloan.co.in/emi-calculator.html) |
| 24 | `/contact-us.html` | 404 · 301 → 301 → 404 | `/contact` (200, 0 hops) — Contact EzyLoan – Loan Assistance in Cuttack | ✅ Title/H1 verified | 2 capture(s) 2025-01-14 → 2025-02-15; "Contact Us - Ezyloan" / "Get in Touch with Our Support Team" | [archive](https://web.archive.org/web/20250215024038/https://ezyloan.co.in/contact-us.html) |
| 25 | `/contact.html` | 404 · 301 → 301 → 404 | `/contact` (200, 0 hops) — Contact EzyLoan – Loan Assistance in Cuttack | 🟡 URL name + verified sibling | 1 capture(s) 2025-07-19; generic SPA shell; sibling /contact-us.html verified | [archive](https://web.archive.org/web/20250719074520/https://ezyloan.co.in/contact.html) |
| 26 | `/contact.php` | 404 · 301 → 301 → 404 | `/contact` (200, 0 hops) — Contact EzyLoan – Loan Assistance in Cuttack | 🟡 URL name + verified sibling | 3 capture(s) 2023-02-25 → 2025-05-14; generic SPA shell; H1 "Fill a Form for Loan Application"; sibling /contact-us.html verified | [archive](https://web.archive.org/web/20250514061650/https://ezyloan.co.in/contact.php) |
| 27 | `/faq.php` | 404 · 301 → 301 → 404 | `/faq` (200, 0 hops) — Loan FAQs – Eligibility, Documents & EMI | ✅ Title/H1 verified | 1 capture(s) 2023-02-25; 2023-02-25: "FAQs" | [archive](https://web.archive.org/web/20230225124922/http://ezyloan.co.in/faq.php) |
| 28 | `/privacypolicy.php` | 404 · 301 → 301 → 404 | `/privacy-policy` (200, 0 hops) — Privacy Policy | ✅ Title/H1 verified | 1 capture(s) 2023-02-25; 2023-02-25: "Privacy Policy" | [archive](https://web.archive.org/web/20230225124922/http://ezyloan.co.in/privacypolicy.php) |
| 29 | `/terms-conditions` | 404 · 301 → 301 → 404 | `/terms-and-conditions` (200, 0 hops) — Terms & Conditions | ✅ Title/H1 verified | 2 capture(s) 2024-03-14 → 2024-06-18; "Terms & Conditions - Eazy Loan" | [archive](https://web.archive.org/web/20240618053343/https://ezyloan.co.in/terms-conditions/) |
| 30 | `/termsconditions.php` | 404 · 301 → 301 → 404 | `/terms-and-conditions` (200, 0 hops) — Terms & Conditions | ✅ Title/H1 verified | 1 capture(s) 2023-02-25; 2023-02-25: title/H1 Terms & Conditions page | [archive](https://web.archive.org/web/20230225124922/http://ezyloan.co.in/termsconditions.php) |

Notes on individual rows:
- **#1–2 (`/index.php`, `/index.html`):** the 2023 homepage described the business as a "Bank CSP" provider (a different focus). Redirecting the old homepage URL to today's homepage is still correct: it is the same site root.
- **#9 `/car-loan-balance-transfer.html`:** the archived page's title names "Paisalello" (apparently copied from another site's template), but its H1 is "Discover the Benefits of Car Loan Balance Transfer". The topic matches.
- **`/used-car-bt` (🟠):** a single capture (6 Sep 2025), generic shell. "BT" is read as *balance transfer*. If you'd rather not rely on the URL name alone, move it to §2.

## 2. Probable mappings — 6 URLs (confirm or reject each)

| # | Old URL | Now | Proposed | Reason / alternative | Archive evidence (captures · first → last) |
|---|---|---|---|---|---|
| 31 | `/new-used-car-loan` | 404 · 301 → 301 → 404 | `/used-car-loan` | Archived title "New & Used Car Loan - Eazy Loan". **Alternative:** `/car-loan` | 1 · 2024-06-18 |
| 32 | `/service/new-used-car-loan` | 404 · same | `/used-car-loan` | Same page under the theme's `/service/` prefix | 1 · 2024-06-18 |
| 33 | `/new-and-used-carloan` | 404 · same | `/used-car-loan` | As #31 | 1 · 2024-08-11 |
| 34 | `/personal-loan-approval-tips.php` | 404 · same | `/blog/personal-loan` | Generic shell; topic from the URL only. That post covers eligibility and avoiding rejection | 2 · 2025-06-23 → 2025-11-14 |
| 35 | `/services.php` | 404 · same | `/` | No services index exists; the homepage lists every service. Google may treat it as a soft 404, which is harmless | 1 · 2023-02-25 |
| 36 | `/service` | 404 · same | `/` | As #35 | 1 · 2024-06-18 |

(Wayback rate-limited the re-check of these rows on 28 Nov. Their capture data comes from the earlier bulk CDX download.)

## 3. Needs a business decision — 5 URLs (stay 404 unless you confirm the service)

| Old URL | Possible destination | Redirect only if… | Archive evidence |
|---|---|---|---|
| `/home-loan`, `/service/https-ezyloan-co-in-home-loan` | `/property-loan` | EzyLoan facilitates **home loans** (purchase). A loan against property is a different product, so redirecting there would mislead | 2 · 2024-06-18 → 2024-08-11; 2 · 2024-06-18 → 2025-07-19 |
| `/construction-equipment-loan` | `/commercial-vehicle-loan` | Partners finance construction equipment through EzyLoan | 2 · 2024-06-18 → 2024-08-11 |
| `/check-loan-eligibilty` | `/apply-now` | You accept a weak match (no eligibility checker exists) | 1 · 2024-08-11 |
| `/searching_loans.php` | — | Content unknown. Keep 404 unless GSC shows clicks | 2 · 2025-06-23 → 2025-11-14 |

## 4. Keep as 404 — about 85 URLs

**Theme demo content:** `/team/*` (21), `/gallery`, `/gallery/financial-advice*` (12), `/gallery-category/*`, `/portfolio`, `/portfolio/*` (6),
`/portfolio-category/*` (2), `/testimonial`, `/testimonial/*` (3), `/logo-showcase`, `/logo-showcase/*` (6), `/category/*` (3),
`/what-we-are-capable-to-usually-discovered-8-*` (3), `/service/hr-consalting`, `/service/saving-money-2`, `/team-category/*`.
**No equivalent today:** `/check-status.php`, `/get-free-credit-report`, `/refund-return-policy`, `/fd-details.php`, `/fd-goals.php`, `/fd-vs-sdp.php`, `/cumulative-vs-non-cumulative-fd.php`.
Redirecting these to the homepage would create soft 404s. **What would change a row:** GSC *Links* showing external backlinks, or URL Inspection showing it indexed with clicks.
Option, not proposed by default: **410 Gone** for the demo URLs.

## 5. Safe implementation plan (runs only after sign-off)

### 5.1 Design
- **One source of truth:** approval = changing `"approved": false` → `true` on the signed-off rows in `scripts/seo/legacy-urls.json` (a reviewable diff).
- **Generation:** `nextRedirects()` (`scripts/seo/lib/redirects.mjs`) emits `{ source, destination: 'https://www.ezyloan.co.in<dest>', statusCode: 301 }` for approved rows only. It uses **`statusCode: 301`** because you asked for 301: Next's `permanent: true` sends 308.
- **Placement:** the generated rules go **before** the existing apex→www rule in `next.config.mjs`, with an **absolute www destination**, so `https://ezyloan.co.in/car-loan-topup.php` reaches `/car-loan-topup` in **one hop** instead of two.
- **The change to `next.config.mjs`** is the only code change (shown for review, *not applied*):
  ```js
  import legacy from './scripts/seo/legacy-urls.json' with { type: 'json' };
  import { nextRedirects } from './scripts/seo/lib/redirects.mjs';
  // inside redirects():
  return [
    ...nextRedirects(legacy.urls),        // approved legacy URLs only, 301, one hop
    { source: '/:path*', has: [{ type: 'host', value: 'ezyloan.co.in' }], destination: 'https://www.ezyloan.co.in/:path*', permanent: true },
    // …existing /terms, /privacy, /blog rules unchanged
  ];
  ```
  The JSON import attribute needs Node ≥ 20.10. The project runs Node 24 locally; check the production server's `node -v` before merging. Fallback: read the file with `fs.readFileSync`.

### 5.2 Loop and chain protection (three layers)
| Layer | When | What it checks | Tool |
|---|---|---|---|
| **Static validation** | Before every change and in CI | Source/destination is a path; no duplicates (incl. trailing-slash variants); **no live page is a source** (would remove a working URL); **destination is a live page**; **self-loops and multi-node loops** (graph cycle detection); **chains** (a destination that is itself a source, or is redirected by an existing `next.config.mjs` rule); mixed-case warning | `validateRedirectMap()`, run by `verify-redirect-map.mjs` (exit 1 on any error) and by `npm run test:seo` against the app's routes |
| **Unit tests** | `npm run test:seo` | 10 validator cases (self-loop, 2-node loop, chain, chain into `/terms`, live-page source, trailing-slash duplicate, dead destination, query string…), generator (approved-only, 301, absolute URL), and a check that the code's list of existing redirects **matches `next.config.mjs`** | `scripts/test-seo-tools.mjs`, currently **54/54 pass** |
| **Runtime regression** | Against a local/staging build, then production | **A** each approved URL: exactly **one** hop, **301**, exact `Location`, final **200**. **B** every non-approved row stays a plain 404. **C** all sitemap URLs 200 with 0 redirects. **D** `/blog`, `/terms`, `/privacy` and the 404 page unchanged. Loops are detected by following hops manually | `scripts/seo/test-redirects.mjs <base>`. **Live baseline today: 116/116 pass** (no legacy redirect exists, all 48 legacy rows 404) |

### 5.3 Steps
1. Management signs §1–§3 (below). I flip only the approved rows to `"approved": true`.
2. `node scripts/seo/verify-redirect-map.mjs` → must report **0 errors**. `npm run test:seo` → all pass.
3. Apply the `next.config.mjs` change (5.1) on a branch. `npm run build` (with `SMTP_HOST=smtp.invalid`, because `.env.local` points at live SMTP), then `npm start` locally.
4. `node scripts/seo/test-redirects.mjs http://localhost:3000` → all pass (A–D). Also `npm run test:unit`, `npm run test:security` and `node scripts/seo-crawl.mjs http://localhost:3000` (0 broken links).
5. PR for review. **Deployment only with your approval**, using the deployment checklist (`COMPLETE-WEBSITE-AUDIT.md` §7).
6. After deploy: `node scripts/seo/test-redirects.mjs` (live) → all pass. In Search Console, URL-inspect 3–5 old URLs. The *Not found (404)* count should fall over 4–8 weeks.
7. **Rollback:** set the rows back to `false` (or revert the commit) and redeploy. No data is involved.

### 5.4 Known, accepted hops
| Case | Hops after implementation | Why accepted |
|---|---|---|
| `https://www.ezyloan.co.in/<old>` | 1 (301) | — |
| `https://ezyloan.co.in/<old>` | 1 (301, absolute www destination) | — |
| `http://ezyloan.co.in/<old>` | 2 (nginx http→https, then 301) | The http→https hop is in nginx, outside the repo. Optional separate nginx change: send `http://ezyloan.co.in/*` straight to `https://www.ezyloan.co.in/*` |
| `<old>/` with trailing slash (the 2024 WordPress URLs were archived as `/about-us/`, `/terms-conditions/`) | 2 (Next's built-in 308 trailing-slash strip, then 301) | Next normalises trailing slashes **before** custom redirects, so this can't be collapsed without disabling that behaviour site-wide. Google follows up to 10 hops; 2 is fine |

Effort: ~2–3 hours after sign-off, including the local build and test run. Risk: low. Only URLs that return 404 today are touched, and test C proves no live page is affected.

## Sign-off

| Section | Decision (approve all / approve except # / reject) | Approved by | Date |
|---|---|---|---|
| §1 Exact (30). `/used-car-bt` stays in §1 or moves to §2? | | | |
| §2 Probable (6). #31–33 destination `/used-car-loan` or `/car-loan`? | | | |
| §3 Home loan / construction equipment / eligibility / searching_loans | | | |
| §4 Keep 404 (and the 410 option) | | | |
