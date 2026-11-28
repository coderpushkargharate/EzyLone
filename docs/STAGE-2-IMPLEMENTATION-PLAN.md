# Stage 2 — Implementation Plan, Access & Priorities (28 Nov 2026)

**Nothing in this stage touched the live website, the production database, Search Console, GA4 or any URL.**
No deploy, no merge, no blog published, no claim changed. Work is uncommitted on branch `feature/marketing-automation`.

## 1. What was prepared in this stage

| Deliverable | File | Status |
|---|---|---|
| Search Console integration guide | `docs/GSC-INTEGRATION-GUIDE.md` | ✅ Ready, waits on owner access |
| GA4 audit + integration guide | `docs/GA4-INTEGRATION-GUIDE.md` | ✅ Ready, waits on owner (property + ID) |
| Old URL redirect map | `docs/OLD-URL-REDIRECT-MAP.md` + `scripts/seo/legacy-urls.json` | ✅ For approval; **not implemented** |
| City blog cannibalisation report | `docs/CITY-BLOG-CANNIBALIZATION-REPORT.md` | ✅ Provisional; final decisions need GSC |
| Claims decision table | `docs/CLAIMS-MANAGEMENT-REVIEW.md` | ✅ 16 rows for management |
| Keyword map | `docs/SEO-KEYWORD-MAPPING.md` | ✅ Volumes blank until data |
| 105-blog strategy | `docs/BLOG-105-CONTENT-STRATEGY.md` | ✅ All 105 topics mapped; Batches 1–3 defined |
| This plan | `docs/STAGE-2-IMPLEMENTATION-PLAN.md` | ✅ |
| **Read-only SEO tooling** | `scripts/seo/` (`gsc-report`, `ga4-report`, `weekly-report`, `lib/`), `scripts/test-seo-tools.mjs`, `.github/workflows/weekly-seo-report.yml` | ✅ Built and tested; inert until credentials and merge |
| Crawler improvement | `scripts/seo-crawl.mjs`: new `contentLinks` field (links inside `<main>`, excluding the header/footer navigation) | ✅ Additive; existing output unchanged |
| Housekeeping | `.gitignore` (`/reports/`), `package.json` scripts `test:seo`, `seo:weekly`, `seo:gsc`, `seo:ga4` | ✅ |
| Correction to Stage 1 | `docs/SEO-RECOVERY-STRATEGY.md`: the PageSpeed key is **empty**, not quota-blocked | ✅ |
| *Stage 2 review additions* | `docs/GOOGLE-CREDENTIALS-SETUP.md` (secure credentials), `docs/CLAIMS-APPROVAL-CHECKLIST.md` (sign-off form), `docs/STAGE-2-APPROVAL-REPORT.md` | ✅ |
| Redirect safety tooling | `scripts/seo/lib/redirects.mjs` (validator: loops, chains, shadowed pages, duplicates; 301 generator; hop follower), `scripts/seo/verify-redirect-map.mjs` (live + archive evidence), `scripts/seo/test-redirects.mjs` (runtime regression A–D) | ✅ Built and tested; no redirect active (`approved: false` on all 48 rows) |

### Test results [Measured]
| Check | Result |
|---|---|
| `npm run test:seo` (new): periods, CSV parsing, compare-mode exports, movers, health score, key handling incl. API-key redaction, CSV end-to-end, setup errors, redirect validator/generator/follower, `next.config.mjs` parity | **54 passed, 0 failed** (Stage 2 review) |
| `scripts/seo/test-redirects.mjs` against the **live** site (baseline) | **116 passed, 0 failed**: 48 legacy URLs plain 404, 63 sitemap URLs 200 with no redirect, existing redirects intact |
| `scripts/seo/verify-redirect-map.mjs` | **0 errors, 0 warnings**; evidence collected for 41 rows |
| Weekly report, technical-only mode (as the public-repo workflow runs it), with a dummy Google key present | Google sections reported *"disabled — repository is public"*; no Google call made |
| Workflow YAML | Parses (js-yaml); the Google secret is referenced only in the private-repo step |
| `npm run test:unit` (existing) | passed |
| `node --check` on every new/changed script | ok |
| `weekly-report.mjs` against the live site, no credentials | Ran end-to-end. Crawl 69 URLs; GSC, GA4 and PageSpeed correctly listed as *Not measured*; score computed only from the 75% of checks that were measured |
| **Not yet tested:** GSC API, URL Inspection and GA4 API calls against Google | ⏳ Needs the service account. The first run after setup is the test, and it will be reported as such |

Weekly report on the live site today, technical checks only: **100/100 on the 75% of checks measured.** That is a narrow
technical score: indexing and Core Web Vitals aren't measured yet, and it says nothing about content quality or rankings.
Its actions: 8 posts linked only from `/blogs`, 3 titles over 65 characters. Commercial Vehicle Loan has the weakest blog
support (5 in-content links from posts, vs 18–26 for the car pages).

## 2. Access needed from you (in order)

| # | Access | Time | Unlocks | Guide |
|---|---|---|---|---|
| **A0** | **Revoke the DeepSeek API key** that is in the public git history; **decide repository visibility** (private recommended) | 10 min | Closes a live credential exposure; lets the weekly job include GSC/GA4 | `GOOGLE-CREDENTIALS-SETUP.md` ("Read first") |
| A1 | **Check Admin → Marketing & Ads → Connections** for Google. Is it connected? (I could not check: the database read was blocked) | 2 min | Possibly live GSC data in the admin today | GSC guide §1 |
| A2 | **Search Console 16-month export + 2 compare exports** (CSV) | 10 min | Baseline and decline timing **today** | GSC guide §4 |
| A3 | **Service account** + add it to Search Console (Restricted) | 20 min | Automated performance + URL-level indexing | GSC guide §2 |
| A4 | **Domain property** `ezyloan.co.in` (DNS TXT) | 15 min + DNS | Visibility of the legacy URLs and their backlinks | GSC guide §2.2 |
| A5 | **GA4 property** + Measurement ID + add the service account as Viewer | 15 min | Organic traffic and lead measurement from day 1 | GA4 guide §2, §5 |
| A6 | **PageSpeed API key** | 10 min | Field Core Web Vitals | GSC guide §6 |
| A7 | Bing Webmaster: import from GSC | 5 min | Bing/Copilot indexing data | GSC guide §7 |

## 3. Approvals needed (nothing proceeds without them)

| # | Decision | Document | Unblocks |
|---|---|---|---|
| D1 | Redirect map: approve §1 (30), §2 (6), decide §3 (5) | `OLD-URL-REDIRECT-MAP.md` | P1-a |
| D2 | Claims R1–R16 | `CLAIMS-MANAGEMENT-REVIEW.md` | Service-page copy, blog figures, homepage H1 |
| D3 | Products: business loan? home loan? construction equipment? LAP/PL balance transfer? | Keyword map #14, #17; blog Cat 6 | `/business-loan` page, conditional blogs, 4 redirects |
| D4 | Cities actually served + any local facts | Keyword map §3 | Local articles, `areaServed` |
| D5 | Bylines for the 12 "EzySEO" posts | Claims R16 / `CLAIMS-APPROVAL-CHECKLIST.md` | Accurate author schema |
| D6 | Batch 1 topic list (15) | Blog strategy §4 | Drafting |
| D7 | GA4 install path (admin panel vs build-time) and consent position | GA4 guide §1, §2 | GA4 live |
| D8 | Merge of the weekly workflow to `main` | §5 below | Weekly automation |
| D9 | Repository visibility (public today) | `GOOGLE-CREDENTIALS-SETUP.md` | Whether the weekly job may fetch GSC/GA4; whether Stage 2 docs may be pushed |

## 4. Prioritised implementation (after approvals)

| Priority | Item | Effort | Risk | Depends on |
|---|---|---|---|---|
| **P0** | A1–A7 (owner access) | ~1.5 h owner time | none | — |
| **P0** | Run GSC baseline: export analysis → decline timing, top/declining pages, legacy URLs still known | 2–3 h | none (read-only) | A2 or A3 |
| **P1-a** | Implement approved redirects from `legacy-urls.json` (`statusCode: 301`), plus a test script for 301 + destination 200 | 2–3 h | low (only current 404 paths) | D1 |
| P1-b | GA4 live + key events + 14-month retention | 30 min | low | A5, D7 |
| P1-c | Seeder safety fixes: default `--new-as=draft`, add `/used-car-loan` to `SITE_PAGES`, duplicate-`focusKeyword` guard | 1 h | none (script only) | — |
| P1-d | **Blog Batch 1** drafts (15 files) for management review | ~1 batch/week incl. review | none until seeded | D6 (+ D2 for any figure) |
| P1-e | Service-page H1/structure fixes that do **not** touch claims (§6) | 1–1.5 days | low | — |
| P2-a | Claims edits as decided | 0.5 day | low | D2 |
| P2-b | City-post consolidation as decided from GSC data | 1–1.5 days | medium (URL changes → redirects) | GSC data, D1 process |
| P2-c | Weekly automation live | 1 h setup | low | A3, D8 |
| P2-d | `/business-loan` page (only if confirmed) | 1 day | low | D3 |
| P2-e | Blog Batches 2–3 | 2 weeks incl. review | — | Batch 1 accepted |

## 5. Weekly SEO automation — setup (reviewed in Stage 2)

Built: `scripts/seo/weekly-report.mjs` + `.github/workflows/weekly-seo-report.yml`.

### 5.1 Review of the workflow
| Aspect | Setting | Notes |
|---|---|---|
| **Schedule** | `30 3 * * 1`: Mondays 03:30 UTC = 09:00 IST, plus a manual *Run workflow* button | Scheduled runs happen only from the **default branch** (`main`), so the file is inert on this feature branch. Scheduled runs can start late at busy times. GitHub may disable a public repo's scheduled workflows after a long period without repository activity; re-enable in the Actions tab |
| **Permissions** | `contents: read`, `actions: read`, `issues: write` | Least privilege. **Nothing is pushed** (the Stage 2 draft pushed to a `seo-reports` branch: removed, see 5.2). `actions: read` downloads the previous history artifact; `issues: write` is for notifications. Checkout uses `persist-credentials: false` |
| **Secrets** | `GOOGLE_SA_KEY_JSON`, `PAGESPEED_API_KEY` (secrets); `GA4_PROPERTY_ID`, `GSC_SITE` (variables) | The Google key is passed **only** to the private-repo step. Values are masked in logs; scripts never print them and redact them from errors (tested) |
| **Public-repo safety** | Step 1 reads the repository's `private` flag via the API. If not private, the report runs with `SEO_TECHNICAL_ONLY=1` and **no Google secret** | In a public repo, Actions logs, job summaries, artifacts and issues are readable by others, so Search Console and GA4 data are never fetched there. PageSpeed data is public by nature, so its key may still be used |
| **Failure notifications** | GitHub e-mails scheduled-run failures to the user who created the workflow (or last changed its cron), per GitHub's notification settings. **Also:** on failure, the workflow opens or comments on **one** issue labelled `seo-report` (run link only, no data) | Dedup: an open `seo-report` issue gets a comment instead of a new issue |
| **P0 alerts** | If the report finds P0 **technical** issues (broken links, sitemap URLs not 200, robots blocking Googlebot), the same issue gets the list | Only technical text from the public crawl goes into an issue, never GSC/GA4 figures |
| **Artifacts** | `weekly-seo-report` (markdown reports + `summary.json`, kept 90 days) and `seo-history` (weekly JSON, kept 90 days, carried forward each run) | Previous-week comparison uses the last successful run's `seo-history` artifact |
| **Job summary** | Score, previous score, coverage %, action counts, not-measured list | No Google figures |
| **Concurrency / timeout** | One run at a time (`concurrency: weekly-seo-report`), 45-minute timeout | No overlapping jobs. This is the **only** scheduled SEO job; the in-app marketing worker does no SEO work |
| **Dependencies** | `npm ci --ignore-scripts`, Node 22, `actions/checkout@v4`, `setup-node@v4`, `upload-artifact@v4` | Optional hardening: pin actions to commit SHAs |

### 5.2 What changed in the Stage 2 review, and why
The Stage 2 draft committed reports to a `seo-reports` branch. **The repository is public** (anonymous `git ls-remote` succeeds),
so that would have published Search Console queries, pages and GA4 traffic to anyone. The workflow now pushes nothing,
detects visibility on every run, and fetches Google data only in a private repository.

### 5.3 Coverage
| Covers | Source | Public repo | Private repo |
|---|---|---|---|
| Technical SEO, sitemap health, internal links (in-content), crawler/AI-bot access, llms.txt | Live crawl | ✅ | ✅ |
| Core Web Vitals | PageSpeed API | ✅ with key | ✅ with key |
| Search Console 7/28/90 d, declining queries/pages, top pages, blog performance | GSC API | — (disabled) | ✅ |
| Indexing per URL (sitemap + legacy) | URL Inspection API | — (disabled) | ✅ |
| Organic traffic, landing pages, leads, AI-assistant referrals | GA4 Data API | — (disabled) | ✅ |

**Report:** health score (this week vs last, with coverage %), technical errors, indexing problems, top/declining pages,
query gains and losses, organic traffic change, opportunities, prioritised (P0–P3) actions. Every section names its source.
Anything not measured is listed under *Not measured* with the reason, and kept out of the score.
AI-answer citations have **no API**, and the report says so instead of estimating them.

### 5.4 To switch on (after D8 and D9)
1. If going private: GitHub → Settings → General → Change visibility → Private. Then add secrets `GOOGLE_SA_KEY_JSON`, `PAGESPEED_API_KEY` and variables `GA4_PROPERTY_ID` (+ optional `GSC_SITE`). If staying public: add only `PAGESPEED_API_KEY`.
2. Settings → Actions → General → Workflow permissions: the default (*read*) is enough. The workflow declares its own permissions.
3. Merge to `main` (with approval), then **Actions → Weekly SEO report → Run workflow** once.
4. Read the run's job summary and the `weekly-seo-report` artifact. Alerts arrive as the `seo-report` issue.
5. Locally (any visibility): `npm run seo:weekly` with `GOOGLE_SA_KEY_FILE` gives the full report on your machine, in the gitignored `reports/seo/`.

## 6. Existing service pages — improvement plan

Principles: keep every URL, keep the existing design components, use `/used-car-loan` as the structural model (what it
is → who it suits → what lenders check → documents → process → HTML `<details>` FAQs → related articles → disclosure).
Items marked 🟠 wait for the claims decisions. Items without the mark can go first.

| Page | Current title / H1 [Measured] | Planned changes | Claims dependency |
|---|---|---|---|
| **Used Car Loan** `/used-car-loan` | "Used Car Loan in Odisha – Pre-Owned Car Finance" / "Used Car Loan in Odisha" | Already the model. Add links to the Batch 1 used-car posts once published; mention cities only where D4 confirms | none |
| **New Car Loan** `/car-loan` | "New Car Loan in Odisha – …" / **"New Car Loans: Turn Your Dream Into Reality"** | H1 → "New Car Loan in Odisha"; restructure to the model; FAQs; link the new-car and documents posts | 🟠 7.99% rate, 48 h, 4.9 rating, 10,000+, 24/7 (R1–R4, R10) |
| **Car Loan Top-Up** `/car-loan-topup` | "Car Loan Top-Up in Odisha – …" / "Car Loan Top-Up" | Restructure to the model; add an "Across Odisha" section if the city posts are consolidated; FAQs | 🟠 "24 hours", "same rate, no charges" (R1, R8) |
| **Balance Transfer** `/car-loan-balance-transfer` | "… – Lower Your EMI" / "Car Loan Balance Transfer: Lower Your Monthly EMI" | H1 → "Car Loan Balance Transfer in Odisha"; "when it does / doesn't lower your EMI" section; link the BT posts; FAQs | 🟠 "lower EMI" framing (R6) |
| **Commercial Vehicle** `/commercial-vehicle-loan` | "Commercial Vehicle Loan in Odisha – Truck & Bus" / "Commercial Vehicle Loans to Accelerate Your Business Growth" | H1 → "Commercial Vehicle Loan in Odisha"; vehicle types (as D3 confirms); documents for operators; FAQs; more in-content links (currently the weakest cluster) | 🟠 8.75% vs 9.5%, "Thousands of satisfied", fast-approval (R4, R2, R1) |
| **Personal Loan** `/personal-loan` | "Personal Loan in Odisha – …" / **"Fulfill Your Dreams with Personal Loans"** | H1 → "Personal Loan in Odisha"; resolve the competing post; FAQs exist (FAQPage), so keep them visible | 🟠 "24-48 hours approval" (R1) |
| **Business Loan** | **no page** | Only if D3 = yes: `/business-loan`, built on the model, added to the sitemap, nav and clusters. If no: remove "Business Loan" from the form options | D3 |
| **Property Loan** `/property-loan` | "Loan Against Property in Odisha – LAP Eligibility" / "Property Loans & Loan Against Property" | Keep; link `property-documents-for-loan-odisha` prominently; consolidate city posts per GSC; FAQs | 🟠 8.5%, "Thousands of satisfied", ₹3 Cr card (R4, R2, R6) |
| **Loan Against Car / Cash on Car** `/car-loan-refinance` (URL kept) | "Loan Against Car in Odisha – Used Car Refinance" / **"Take control of your finances with EzyLoan's Car Refinance Loan!"** | H1 → "Loan Against Car in Odisha"; add the "cash on car" term naturally; an explicit "refinance vs balance transfer" note; valuation/LTV section; FAQs. **No new URL**: the title already targets the keyword | 🟠 any funding % (R6) |

Shared: the homepage H1 waits on R1. Organization schema `sameAs` (R13), single email (R12) and hours (R11) follow the decisions. `areaServed` becomes the confirmed Odisha areas (D4).

## 7. Blog progress tracker

| Stage | Batch 1 | Batch 2 | Batch 3 | Batch 4+ | Total |
|---|---|---|---|---|---|
| Planned | 15 | 15 | 15 | 18 (16 conditional) | 63 |
| Research completed | 0 | 0 | 0 | 0 | 0 |
| Draft generated | 0 | 0 | 0 | 0 | 0 |
| SEO validated (`seed-blogs --dry-run`) | 0 | 0 | 0 | 0 | 0 |
| Management approved | 0 | 0 | 0 | 0 | 0 |
| Published | 0 | 0 | 0 | 0 | 0 |
| Indexed by Google (URL Inspection) | 0 | 0 | 0 | 0 | 0 |

Per-article status lives in `BLOG-105-CONTENT-STRATEGY.md`. The *Indexed* row is filled from `gsc-report.mjs inspect`
and never assumed from publishing or sitemap submission.

## 8. Effort summary

| Block | Effort | Calendar (with reviews) |
|---|---|---|
| Owner access A1–A7 | ~1.5 h | this week |
| GSC baseline analysis | 2–3 h | the day data arrives |
| Redirects + test | 2–3 h | after D1 |
| GA4 + seeder fixes | 1.5 h | this week |
| Service pages (non-claim parts) | 1–1.5 days | week 2 |
| Claims edits | 0.5 day | after D2 |
| Blog Batches 1–3 (45 drafts) | ~1 batch/week | weeks 2–4 + review |
| City consolidation | 1–1.5 days | after ~4 weeks of GSC data |
| Weekly automation live | 1 h | after A3 + D8 |

No ranking position is promised. Success is measured by GSC (indexed/submitted ratio, 404 count falling, non-branded
impressions and clicks to the service pages vs the baseline) and GA4 (organic `generate_lead` / `submit_application`).
