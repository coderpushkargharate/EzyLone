# EzyLoan — Current-State Assessment & SEO Recovery Plan (28 Nov 2026)

**Stage 1–3 deliverable. No code, content, database, crawler rule or production setting was changed to produce it.**
Every finding is labelled with how it was obtained:

- **[Measured]** — a tool run against the live site `https://www.ezyloan.co.in` on 28 Nov 2026 (commands in §10)
- **[Code]** — read from this repository (branch `feature/marketing-automation`)
- **[Inference]** — a reasoned conclusion from measured evidence; not proven without Search Console data
- **[Not available]** — the data needed does not exist in this session; nothing has been estimated

This builds on the 24 Nov round (`docs/COMPLETE-WEBSITE-AUDIT.md`), which **is now live** (`/used-car-loan` returns 200,
63-URL sitemap). Its findings were re-checked against production rather than assumed correct.

---

## 0. What could not be measured, and why

| Data | Status | What is needed |
|---|---|---|
| Google Search Console (clicks, impressions, queries, positions, index coverage) | **[Not available]** — no service-account key in `.env.local`; Windsor.ai has no Search Console account connected (only Meta + 3 unrelated Google Ads accounts) | Owner adds a service account as a *Restricted* user in GSC, **or** connects GSC in Windsor.ai, **or** exports *Performance* (16 months, Queries + Pages) and *Pages* (indexing) reports as CSV |
| GA4 | **[Not available]** — **GA4 is not installed on production** (`/api/site-tags` → `ga4MeasurementId: null`) [Measured]. There is no historical organic-traffic data to analyse at all | Create/locate the GA4 property and paste the `G-…` id in admin → Site tags |
| PageSpeed Insights / CrUX field data | **[Not available]** — `PAGESPEED_API_KEY` is **empty** in `.env.local` (corrected 28 Nov, Stage 2: Stage 1 wrongly said the key's project was over quota), so requests went out keyless and hit Google's shared anonymous daily quota [Measured]. The website reads the key only from the production **server environment** (`app/api/admin/site-health/pagespeed/route.ts:18`), which is not visible from here | Create a PageSpeed Insights API key restricted to that API and set it in the server env (`docs/GSC-INTEGRATION-GUIDE.md` §6) |
| Keyword volumes / difficulty | **[Not available]** — no keyword tool connected | Ahrefs/Semrush/Google Ads Keyword Planner access (Ahrefs MCP is available to authenticate) |
| Bing Webmaster | **[Not available]** — no `msvalidate.01` tag on the live site [Measured] | Import the site from GSC in Bing Webmaster |

**Consequence:** questions 2, 3 and 4 below can only be answered from crawl/archive/code evidence. They are clearly marked
as inference. The first action in §8 is to get the data that confirms or rejects them.

---

## 1. What is the current technical health of the website?

**Good on the fundamentals that a crawler sees today.** [Measured — full crawl of 69 URLs]

| Check | Result |
|---|---|
| Status codes | All 63 sitemap URLs 200; unknown paths 404; `/blog`, `/terms`, `/privacy` 308 |
| Broken internal links | 0 |
| Duplicate titles / descriptions | 0 / 0 |
| H1 | exactly one on every indexable page |
| Canonical | self-referencing on every indexable page |
| Structured data | valid JSON-LD everywhere; BlogPosting + BreadcrumbList on all 42 posts |
| Images without alt | 0 |
| Rendering | full server HTML (Next.js 15.5.29 SSG/ISR) — no JS needed for crawlers or AI bots |
| robots.txt | `Allow: /`, `Disallow: /api/` only; sitemap declared; history shows no accidental sitewide block [Code: git log of `app/robots.ts`] |
| Private pages | `/ezyadmin`, `/ezylogin` send `X-Robots-Tag: noindex` |
| HTTPS / security headers | HSTS, CSP (partial), nosniff, frame-deny all present |
| TTFB (server) | 55–170 ms from this location [Measured, curl] |

**Technical defects that remain** [Measured unless noted]:

| # | Defect | Severity |
|---|---|---|
| T1 | **113 historically public URLs (archived as 200) now 404 with no redirect** (see §2). Whether Google indexed them is unknown until GSC | **Critical** |
| T2 | `http://ezyloan.co.in` → `https://ezyloan.co.in` → `https://www.` — a 2-hop redirect chain (nginx, then app) | Low |
| T3 | Blog `lastmod` falls back to `updatedAt`; a bulk DB update stamped **30 of 42 posts with the same two timestamps on 27 Oct** — teaches Google to ignore lastmod [Code: `app/sitemap.ts:61`] | Low |
| T4 | 8 Odisha/city blog posts receive **only one internal link** (from `/blogs`); not part of the topic-cluster related-links system | Medium |
| T5 | Organisation schema: `sameAs: []`, `areaServed: "IN"` (business targets Odisha), no `telephone` | Medium |
| T6 | Homepage emits `<meta name="rbi-compliant" content="true">` and keyword "RBI compliant loans" — a regulatory claim in markup | **Compliance — management** |
| T7 | No GA4 on production → conversions and organic traffic are unmeasured | High |
| T8 | 3 blog titles 84–96 chars (truncated in results) | Low |

---

## 2. Why has the Google ranking decreased?

Without Search Console the cause cannot be *proven*. The evidence points to four causes, in order of likely impact.

### Cause 1 — Repeated site rebuilds discarded every old URL without redirects **[Measured + Inference]**

The Wayback Machine has 124 historical URLs on `ezyloan.co.in` that returned 200. Re-checked today:

| Now | Count |
|---|---|
| 200 (same URL still exists) | 10 |
| 308 redirect | 1 (`/blog`) |
| **404, no redirect** | **113** |

The domain has been rebuilt at least **four times**, each time with a new URL scheme:

| Era (archive dates) | URL style | Examples now 404 |
|---|---|---|
| 2023 | `.php` (homepage then described the site as a "Bank CSP" provider, a different business focus) | `/index.php`, `/apply.php`, `/faq.php`, `/services.php`, `/privacypolicy.php` |
| 2024 (WordPress-style theme) | slugs | `/home-loan`, `/new-used-car-loan`, `/service/new-used-car-loan`, `/about-us`, `/terms-conditions`, `/check-loan-eligibilty`, `/construction-equipment-loan` |
| Jan 2025 | `.html` | `/car-loan-topup.html`, `/car-loan-balance-transfer.html`, `/new-car-loan.html`, `/personal-loan.html`, `/emi-calculator.html`, `/contact.html` |
| Apr 2025 – at least Feb 2026 (last capture 10 Feb 2026, found in Stage 2) | `.php` again (client-rendered app) | `/car-loan-topup.php`, `/new_car_loan.php`, `/personal.php`, `/property_loan.php`, `/blog.php`, `/personal-loan-approval-tips.php`, `/used-car-bt` |
| May 2026 → now | Next.js (this repo, first commit 21 May 2026) | — |

Every rebuild threw away the ranking signals and backlinks attached to the previous URLs. Google treats a 404 as
"page gone" and drops it; links pointing to it stop passing value. For a small site whose authority comes mostly from a
handful of service URLs, this alone can explain a large drop, **especially if the decline started around the
mid-2026 Next.js launch**. *Confirm in GSC:* Pages → "Not found (404)" list and the date the decline began.

About 25 of those URLs are real service/content pages with obvious successors and should get 301s (§8, P0-2). *Stage 2 refined this to 30 exact + 6 probable + 5 needing a decision (`OLD-URL-REDIRECT-MAP.md`).* The
remaining ~85 are theme demo pages (`/team/gerry-3-2-2`, `/gallery/financial-advice-7`, `/portfolio/...`) and must
**not** be redirected to the homepage. Google treats that as a soft 404. They should stay 404 or return 410.

### Cause 2 — Unresolved, contradictory financial claims on a YMYL site **[Measured + Code]**

Loans are "Your Money or Your Life" content, where Google weighs trust most heavily. The live site still contradicts itself:

- Approval time: "instant", "24 hours", "48 hours", "24–48 hours approval", and "preliminary response 24–48 h" on different pages
- Customer count "10,000+ across Odisha" vs "across India"; About page "100K+ customers / ₹500Cr+ disbursed"
- Ratings 4.8 vs 4.9; rates on product pages below the range on `/loan-disclosure`
- `rbi-compliant=true` meta tag (T6) while the disclosure correctly says EzyLoan is a facilitator, not a lender
- Property-loan blog posts **repeat the 8.5% rate** that `CLAIMS_REVIEW.md` already flags as unverified, so the
  unresolved claim is spreading into new content

All of these are documented with file:line in `docs/CLAIMS_REVIEW.md` and still await management decisions. They
weigh on trust in Google's quality systems and in AI answer engines, which avoid citing sources that contradict themselves.

### Cause 3 — Scaled city-swap blog content and keyword cannibalisation **[Measured]**

- **6 posts titled "Car Loan Top-Up Loan in {Puri | Bhubaneswar | Cuttack | Rourkela | Berhampur | Jeypore}, Odisha"**
  plus `/blog/car-loan-top-up`, all competing with the service page `/car-loan-topup` ("Car Loan Top-Up in Odisha").
- **4 "Property Loan in {Puri | Sambalpur | Rourkela | Cuttack}"** posts competing with `/property-loan`.
- `/blog/getting-a-personal-loan-in-odisha…` is titled *"Personal Loan in Odisha | Apply Online"*, the same transactional
  intent as `/personal-loan`.
- Text overlap between the city posts is only 10–16% (5-word shingles), so they are not copy-paste duplicates. But the
  only thing that varies is the city, and EzyLoan has one verified office (Cuttack). That fits the pattern Google's
  *scaled content abuse* and helpful-content systems demote. These are the site's **longest posts (2,250–3,600 words)**
  and the **least linked** (one inbound link each).

### Cause 4 — Thin authority signals **[Measured]**

- No `sameAs` social profiles, two public emails, two Facebook URLs, two phone numbers
- No Google Business Profile linkage verifiable from the site
- No measured backlinks (needs Ahrefs/GSC *Links* report)
- Young domain history: the last four rebuilds reset the site each time

**What did *not* cause it** [Measured]: robots.txt, sitemap, noindex, canonicals, server errors, rendering, and
duplicate titles are all clean today, and git history shows no period of sitewide noindex or blocking.

---

## 3. Which pages are not properly indexed?

**[Not available]** — indexing status can only come from GSC (*Pages* report or URL Inspection API). A sitemap
submission does not mean pages are indexed. What can be said from evidence:

- All 63 sitemap URLs are **indexable** (200, self-canonical, no noindex) [Measured]
- The **8 one-link posts** (T4) and the **6 + 4 city-swap posts** are the likeliest *"Crawled — currently not indexed"*
  candidates [Inference]
- The **113 old URLs** will show as *"Not found (404)"* [Inference from Measured]
- `/used-car-loan` went live recently; it should be URL-inspected and submitted

Once GSC access exists, the URL Inspection API (2,000 calls/day) can produce the URL-level report you asked for. The
admin route `app/api/admin/search-console/route.ts` already exists and can be extended.

---

## 4. Which keywords are losing rankings?

**[Not available]** — this needs GSC *Performance* data (query × date). No ranking or keyword data has been estimated.
The admin "SEO & Traffic" tab reads GSC once credentials exist; the comparison you asked for (7/28/90 days vs previous
period, by query, page, device and country) is a direct query once access is granted.

---

## 5. Which pages have missing or weak SEO?

Metadata is complete on every page [Measured]. The weakness is **content and intent**, not tags:

| Page(s) | Weakness |
|---|---|
| `/` | H1 is an unapproved claim ("Get Loan Approved in 24 Hours\*"); `rbi-compliant` meta; `areaServed: IN` |
| `/car-loan`, `/car-loan-topup`, `/commercial-vehicle-loan`, `/personal-loan`, `/property-loan` | Benefit copy carries unverified claims (CLAIMS_REVIEW §1–5, N2–N5); top-up/CV/BT lack the eligibility → documents → process → FAQ structure `/used-car-loan` already has |
| `/car-loan-topup` vs 7 top-up blogs; `/property-loan` vs 4 city posts; `/personal-loan` vs 1 post | Cannibalisation (Cause 3) |
| 8 Odisha/city posts | 1 inbound link each; no link to/from service pages |
| No page for **Loan Against Car / Cash on Car** | A primary keyword in your brief. Today it is covered only by `/car-loan-refinance` and `/blog/used-car-refinance`. Needs a decision: dedicated page vs. reposition `/car-loan-refinance` |
| `/lending-partners` (3.2 k chars), `/contact`, `/apply-now` | Thinnest pages; lending-partners content depends on approved partner names |

---

## 6. Are there any serious technical bugs?

**No serious functional or crawl bugs were found on the live site** [Measured: crawl, status codes, `/api/health` OK].
The 24 Nov round ran 110 browser checks (5 widths), with 0 horizontal overflow and 0 console errors, plus 91 HTTP security
checks; those changes are what is now live.

Real issues:
1. **No analytics** (GA4 null). This is the most serious "bug" for SEO: you cannot see organic traffic or leads by landing page.
2. **No PageSpeed API key locally** (`PAGESPEED_API_KEY` empty). The admin *Site health* PageSpeed tab works only if a key is saved in production.
3. **Lead → Privyr end-to-end never tested** (it would write to the production DB and send real email; needs staging or one approved tagged lead).
4. Pending major upgrades (nodemailer 6→10, sharp 0.34→0.35) carry known advisories (`SECURITY-AUDIT.md`).

Not tested this round (by design): form submissions, admin login, and anything that writes to the production database or sends email.

---

## 7. What is slowing down the website?

**[Measured — lab, live site, median of 3 cold loads; mobile = 4× CPU slowdown + slow-4G]** These are lab values,
not Google's field data.

| Page | Mobile LCP | Mobile CLS | Mobile TBT~ | Mobile transfer | Desktop LCP |
|---|---|---|---|---|---|
| `/` | 1.55 s | 0.010 | **1,456 ms** | 742 KB | 0.81 s |
| `/used-car-loan` | 1.23 s | 0.009 | 1,002 ms | 560 KB | 0.43 s |
| `/car-loan` | **2.66 s** ⚠ | 0.010 | 1,266 ms | 724 KB | 1.34 s |
| `/car-loan-topup` | 1.45 s | 0.010 | 1,442 ms | 584 KB | 1.14 s |
| `/blogs` | 1.93 s | 0.010 | 869 ms | 831 KB | 0.53 s |
| `/blog/car-loan-top-up` | 1.82 s | 0.009 | 1,158 ms | 628 KB | 0.58 s |
| `/apply-now` | 1.73 s | 0.012 | 866 ms | 573 KB | 0.46 s |

- **CLS is fine everywhere** (≤ 0.018). **LCP meets 2.5 s everywhere except `/car-loan` on mobile (2.66 s)**: its LCP
  arrives about 1.3 s after first paint, which points to a late hero image.
- **Main-thread blocking on mobile (0.9–1.5 s) is the real weakness** and the likeliest INP risk. TBT~ counts long
  tasks until 5 s after load, so it includes the deliberately deferred Google Ads tag and chat widget and overstates Lighthouse TBT.
- Speed is **not** a plausible main cause of the ranking decline. The site is fast on server response and layout.

Known contributors [Code/previous lab runs]: about 1.1–1.4 s of mobile main-thread work from the shared layout (header/footer
hydration, ScrollReveal, attribution script, deferred Google Ads tag and chat widget), and hot-linked Google review
avatars that sometimes get HTTP 429. Server response is fast (TTFB 55–170 ms). **Real-user INP and LCP are unknown until the PSI/CrUX key works.**

---

## 8. What is preventing more organic traffic — and the prioritised recovery plan

In one line: **lost URL equity from repeated rebuilds, unresolved trust/claims problems, cannibalising city-swap content,
and no measurement.** Content volume is not the bottleneck. Publishing 105 posts on top of this would add to the
cannibalisation (Cause 3) unless the plan below goes first.

**No plan can guarantee Top-10 positions.** The plan targets the things Google and AI engines measurably reward:
indexable, consolidated, trustworthy, non-contradictory pages, one per intent.

### P0 — this week (prerequisites)

| # | Action | Owner | Effort | Needs approval? |
|---|---|---|---|---|
| P0-1 | Grant GSC access (service account) **or** connect GSC in Windsor.ai; export 16-month Performance + Pages reports | Owner | 30 min | — |
| P0-2 | **301 map for legacy URLs** with clear successors. *Stage 2 update: 30 exact + 6 probable + 5 needing a decision, each with evidence in `OLD-URL-REDIRECT-MAP.md`; the examples here are indicative only* (e.g. `/car-loan-topup.php`, `/car-loan-topup.html` → `/car-loan-topup`; `/new_car_loan.php`, `/new-car-loan.html` → `/car-loan`; `/new-used-car-loan`, `/service/new-used-car-loan`, `/used-car-bt` → `/used-car-loan` or `/car-loan-balance-transfer`; `/personal.php`, `/personal-loan.html` → `/personal-loan`; `/property_loan.php`, `/home-loan` → `/property-loan`; `/about-us`, `/contact-us.html`, `/terms-conditions`, `/privacypolicy.php`, `/index.php`, `/index.html`, `/blog.php` → their equivalents). Theme-demo URLs stay 404/410 | Dev | 2–3 h incl. test | Yes — redirect map sign-off (rule 9) |
| P0-3 | Install GA4 (admin → Site tags, no rebuild); mark `generate_lead` as key event | Owner | 15 min | — |
| P0-4 | Create a PageSpeed Insights API key (the local one is empty) | Owner | 10 min | — |
| P0-5 | Bing Webmaster: import from GSC | Owner | 10 min | — |

### P1 — next 2 weeks (trust and consolidation)

| # | Action | Effort | Needs approval? |
|---|---|---|---|
| P1-1 | Decide every row of `CLAIMS_REVIEW.md` (approval time, customer count, ratings, rates, RBI wording incl. the `rbi-compliant` meta) | Mgmt 1–2 h; dev 0.5 day to apply | **Yes** |
| P1-2 | **Consolidate city-swap posts:** merge the 6 top-up city posts into `/car-loan-topup` (local section on Odisha cities served, only facts that are true) + one top-up guide; 301 the rest. Same for the 4 property city posts → `/property-loan`; retitle the personal-loan Odisha post to an informational angle or merge it. Decide with GSC data first: keep any post that has its own real impressions | 1–1.5 days | Yes (URL changes + editorial) |
| P1-3 | One email, one phone (or clearly labelled two), official social URLs → `sameAs`; `areaServed` = Odisha cities actually served | 1 h | Yes (contact data) |
| P1-4 | Give `/car-loan-topup`, `/car-loan-balance-transfer`, `/commercial-vehicle-loan` the `/used-car-loan` structure (eligibility, documents, process, HTML FAQs) | 2 days | Copy needs claims sign-off |
| P1-5 | Decide Loan Against Car / Cash on Car: new page or reposition `/car-loan-refinance` | Mgmt decision; 1 day build | Yes |
| P1-6 | Sitemap `lastmod`: use `modifiedAt` only (drop `updatedAt` fallback); add internal links to the posts that survive P1-2 | 1 h | — |

### P2 — weeks 3–8 (growth)

| # | Action | Effort |
|---|---|---|
| P2-1 | Keyword research with real volumes (GSC queries + keyword tool) → final one-intent-one-URL map | 1 day once data exists |
| P2-2 | **Blog programme in batches of 15 drafts**, *after* the map exists, skipping topics already covered by the 42 posts or by service pages. Many of the 105 topics in the brief overlap each other (e.g. "Used Car Loan Application Process" / "How to Apply" / "Approval Process"; three "FAQs" posts per product that duplicate on-page FAQs; 10 local posts after the city consolidation). A realistic non-cannibalising set is likely **55–70 distinct articles**; the rest should become sections of existing pages. This will be shown topic by topic in `BLOG-PLAN-105.md` for approval, not decided silently | ~1 batch/week incl. review |
| P2-3 | Draft → management review → publish workflow: the model already has draft/pending/published states (`PUBLIC_BLOG_FILTER`); add a review checklist per post (claims, links, schema) | 1 day |
| P2-4 | Weekly SEO report (GitHub Actions cron: crawl + GSC + PSI → `WEEKLY-SEO-REPORT.md` / admin), once credentials are stored as Actions secrets | 1–2 days |
| P2-5 | Google Business Profile: categories, services, photos, posts, genuine review replies | Owner, ongoing |
| P2-6 | Performance: profile INP with field data before touching scripts | After P0-4 |

### Measurable targets (not ranking promises)

- GSC: 404 count from legacy URLs falls as 301s are recrawled (4–8 weeks)
- Indexed / submitted sitemap ratio, tracked weekly
- Non-branded impressions and clicks for the 5 service pages vs. the 28-day baseline taken at P0-1
- Organic `generate_lead` events per week (GA4, from P0-3)

---

## 9. Effort summary

| Phase | Dev effort | Blocked on |
|---|---|---|
| P0 | ~0.5 day | GSC/GA4/PSI/Bing access; redirect-map approval |
| P1 | ~4–5 days | Claims decisions; consolidation approval |
| P2 blogs | ~1 batch of 15 per week + review | Keyword data; P1-2 done first |
| Weekly automation | 1–2 days | Credentials as GitHub secrets |

---

## 10. How this was measured (reproducible)

| Evidence | Command / source |
|---|---|
| Full crawl, 69 URLs | `node scripts/seo-crawl.mjs https://www.ezyloan.co.in out.json` |
| Legacy URLs | Wayback CDX API `url=ezyloan.co.in/*`, collapse by URL key → 132 paths; each re-requested live with `curl` |
| City-post overlap | 5-word shingle overlap of `<article>` text with city names masked |
| Claims in posts | regex over article text for %, ₹, hours, "guarantee", "RBI" — context checked manually ("guarantee" appears only in disclaimers) |
| Live tags / schema | `curl /api/site-tags`, homepage JSON-LD and meta |
| Lab vitals | `node scripts/vitals-lab.mjs https://www.ezyloan.co.in out.json` (CDP, mobile = 4× CPU + slow 4G) |
| PSI | `pagespeedonline/v5` → quota errors. *Corrected in Stage 2: the "project key" was empty, so both calls were effectively keyless* |
