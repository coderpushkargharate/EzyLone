# Stage 2 Approval Report — EzyLoan SEO Recovery (28 Nov 2026)

**Status: ready for your approval. Nothing has been implemented on the live website.**

| Constraint | Kept? | Evidence |
|---|---|---|
| No blog published | ✅ | No database write of any kind in this stage |
| No financial claim changed | ✅ | `app/`, `components/`, `lib/` untouched (`git diff` empty) |
| No city blog merged | ✅ | — |
| No production URL modified | ✅ | `next.config.mjs` unchanged; all 48 redirect rows `approved: false`; live baseline test 116/116 |
| No deploy, no merge, no push | ✅ | Work is uncommitted on `feature/marketing-automation` |
| No secret exposed | ✅ | Secret scan of every changed/new file: 0 hits (the only pattern match is the existing `USER:<PASSWORD>` placeholder in `.env.example`); keys shown only as names or lengths |
| Existing functionality preserved | ✅ | No runtime code changed. `test:unit` passes; `seo-crawl.mjs` gained an additive field only |

## ⚠ Two urgent findings (outside SEO, found during the credentials review)

1. **Leaked DeepSeek API key.** It was hard-coded in `components/VoiceAssistant.tsx` (21 May – 18 Jun 2026), and that commit is on **every** public branch. **Please revoke it in the DeepSeek dashboard today.** I didn't test it.
2. **The GitHub repository is public.** All pushed code and docs are readable by anyone, including `SECURITY-AUDIT.md` and the claims review. **Recommendation: make it private.** Until then: don't push the Stage 2 docs; the weekly workflow automatically refuses to fetch Google data.

A full scan of reachable git history found no other live-looking secret. (`.env.local` was committed four times in May–June 2026, but those versions held only public `NEXT_PUBLIC_*` values.)

## Results of the ten checks

| # | Check | Result |
|---|---|---|
| 1 | **Nine deliverables consistent** | Reviewed all nine plus three new documents, and corrected **9 inconsistencies**: PageSpeed key "quota" → empty key; "admin → API keys" → the server env is the only source; "11" → **12** EzySEO posts (measured on all 42 posts); 68 → **63** distinct articles; "~25" → 30 + 6 + 5 redirects; "historically indexed" → "historically public"; the `.php` site's end date (Aug 2025 → at least **Feb 2026**); Restricted users' URL Inspection ("Fetch only", unconfirmed); GA4 retention default (not stated by Google: set 14 months explicitly). Final sweep: no stale figure left |
| 2 | **30 exact redirects, evidence each** | `OLD-URL-REDIRECT-MAP.md` §1, generated from measured data. All 30: **404 today** (www); **301 → 301 → 404** from `http://ezyloan.co.in`; destination **200 with 0 hops**; Wayback snapshot link per row. Evidence basis: **18 title/H1-verified**, **11 URL name + verified sibling**, **1 URL-name only** (`/used-car-bt`: you may move it to "probable") |
| 3 | **Safe redirect plan** | Three layers: static validator (self and multi-node **loops**, **chains** incl. into existing `next.config.mjs` rules, live pages as sources, dead destinations, duplicates), **54/54** unit tests, and a runtime regression test (one 301 hop to an exact Location, 200 final; non-approved stay 404; all sitemap URLs 200 unredirected; existing redirects intact). **Live baseline: 116/116.** The redirects are generated from the approved rows only, use `statusCode: 301`, and have absolute www destinations (one hop even from the apex host). Rollback = flip the flags. Known accepted hops documented (trailing slash, http on apex) |
| 4 | **GSC + GA4 instructions complete** | `GSC-INTEGRATION-GUIDE.md` (service account, Domain property, CSV fallback, weekly), `GA4-INTEGRATION-GUIDE.md` (audit, install, configuration, verification). Facts checked against Google's documentation; two unconfirmed points are labelled as such |
| 5 | **Secure credential setup** | New `GOOGLE-CREDENTIALS-SETUP.md`: least-privilege roles (no project roles; GSC Restricted; GA4 Viewer; read-only scopes), Windows key storage with ACL, GitHub secrets **only in a private repo**, rotation and revocation, a "never" list, verification checklist |
| 6 | **PageSpeed config + key handling** | Docs fixed (empty key; server env only; no unverified quota figure). Code: the key is redacted from every error, including keys echoed back by a server (tested); clear setup errors for 400/403/quota; `.env.example` documents all variables |
| 7 | **Weekly workflow review** | Redesigned: **no git push** (the earlier draft would have published GSC data in a public repo); permissions `contents: read`, `actions: read`, `issues: write`; visibility check on every run, with Google secrets passed only in a private repo; failure **and** P0 alerts to one deduplicated `seo-report` issue (no data); report + history artifacts (90 days); job summary; concurrency guard; single scheduled job. YAML parses; technical-only mode tested |
| 8 | **Measured vs unavailable** | Every report states its source and labels itself *Data status: MEASURED*. Missing sections are listed under *Not measured* with the reason and excluded from the score. GA4 warns that pre-installation periods are "not measured", not zero. Test added |
| 9 | **Claims approval checklist** | New `CLAIMS-APPROVAL-CHECKLIST.md`: 17 rows (R1–R16 + R4a), Keep-with-evidence / safe wording / remove, an evidence standard, the required signer (Owner / **Compliance counsel** / **CA**), and every place a decision must be applied (pages, footer, chatbot, schema, blogs, llms.txt) |
| 10 | **Blog topics + keywords** | Checked the 68 candidates against each other: **6 folded** (C2 #4, C7 #1, G13, G18, G30, G24), none dropped. **63 distinct articles**, each with a unique primary keyword and owner page (`BLOG-105-CONTENT-STRATEGY.md` §7). Scope boundaries defined for 6 close clusters. Script checks: 105 brief rows reconcile; 0 duplicate keywords; 0 collisions with the 30 seeded posts' focus keywords or the service head terms; batches 15/15/15/18 |

## What I need from you

**Today (security):**
- [ ] Revoke the DeepSeek key
- [ ] Decide repository visibility (private recommended)

**Google access** (`GOOGLE-CREDENTIALS-SETUP.md`):
- [ ] Search Console: 16-month CSV + two compare exports (fastest), **and/or** service account added as Restricted
- [ ] Domain property `ezyloan.co.in` (DNS TXT)
- [ ] GA4 property + Measurement ID; service account as Viewer; retention 14 months
- [ ] PageSpeed API key in the production server environment
- [ ] Check Admin → Marketing & Ads → Connections (Google connected?)

**Approvals:**
- [ ] Redirect map §1 (30), §2 (6), §3 (5) — `OLD-URL-REDIRECT-MAP.md` sign-off table
- [ ] Claims — `CLAIMS-APPROVAL-CHECKLIST.md`
- [ ] Products (business loan, home loan, construction equipment, PL/LAP balance transfer) and cities served
- [ ] Bylines for the 12 "EzySEO" posts
- [ ] Batch 1 topic list (15) — `BLOG-105-CONTENT-STRATEGY.md` §4
- [ ] GA4 install path (admin panel vs build-time) and consent position
- [ ] Merge of the weekly workflow (after the visibility decision)

## After approval: order of work and effort

| Order | Work | Effort | Touches live site? |
|---|---|---|---|
| 1 | GSC baseline analysis (from CSV or API): decline timing, declining pages and queries, legacy URLs still known | 2–3 h | No |
| 2 | Approved redirects: flip flags → validator → local build → regression → PR | 2–3 h | Only after your deploy approval |
| 3 | Seeder safety fixes (default draft, `/used-car-loan` link, duplicate-keyword guard) | 1 h | No |
| 4 | Blog Batch 1: 15 drafts as files for review | ~1 week incl. review | No (seeding as *draft* writes to the production DB, so it runs only with your go-ahead) |
| 5 | Service-page fixes not tied to claims (H1s, structure, FAQs) | 1–1.5 days | Only after deploy approval |
| 6 | Claims edits, as signed | 0.5 day | Only after deploy approval |
| 7 | City-post decisions | after ~4 weeks of GSC data | — |

No ranking position is promised. Progress will be measured in GSC (index coverage, legacy 404s falling, non-branded
impressions and clicks to the service pages vs the baseline) and GA4 (organic leads).

## Files (all uncommitted)

**Docs:**
- `SEO-RECOVERY-STRATEGY.md` (Stage 1, corrected)
- `GSC-INTEGRATION-GUIDE.md`
- `GA4-INTEGRATION-GUIDE.md`
- `GOOGLE-CREDENTIALS-SETUP.md`
- `OLD-URL-REDIRECT-MAP.md`
- `CITY-BLOG-CANNIBALIZATION-REPORT.md`
- `CLAIMS-MANAGEMENT-REVIEW.md`
- `CLAIMS-APPROVAL-CHECKLIST.md`
- `SEO-KEYWORD-MAPPING.md`
- `BLOG-105-CONTENT-STRATEGY.md`
- `STAGE-2-IMPLEMENTATION-PLAN.md`
- `STAGE-2-APPROVAL-REPORT.md`

**Tooling:**
- `scripts/seo/` (`gsc-report`, `ga4-report`, `weekly-report`, `verify-redirect-map`, `test-redirects`, `legacy-urls.json`, `lib/`)
- `scripts/test-seo-tools.mjs`
- `.github/workflows/weekly-seo-report.yml`

**Edits:**
- `scripts/seo-crawl.mjs` (additive `contentLinks`)
- `.gitignore` (`/reports/`)
- `.env.example` (documented variables)
- `package.json` (4 scripts)
