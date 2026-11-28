# Google Search Console — Integration Guide (Stage 2, 28 Nov 2026)

**Status:** tooling built and tested on branch `feature/marketing-automation`, **not deployed, not connected**.
No Search Console data has been read yet, and none appears in any EzyLoan report until one of the options below is set up.

## 1. What exists and which option to use

| Option | What it is | Who sets it up | Use it for |
|---|---|---|---|
| **A. Service account** (new, recommended) | A read-only Google robot account. Scripts in `scripts/seo/` use it | Owner, ~20 min | URL-level indexing report, 7/28/90-day comparisons, declining queries and pages, run locally; weekly in GitHub Actions **only if the repository is made private** (§5) |
| **B. 16-month CSV export** (temporary) | Manual export from the Search Console UI | Owner, ~10 min | Getting the historical baseline **today**, before A is set up. Also the only way to see 16 months at once. The API also serves 16 months, but needs A first |
| **C. Admin "SEO & Traffic" tab** (already built) | Admin → Marketing & Ads → Connect Google (OAuth, `lib/marketing/google/reporting.ts`) | Owner, ~5 min | Day-to-day dashboard in the admin panel. Already coded; it works once a Google account with Search Console access is connected there |
| D. Windsor.ai connector | Connect "Google Search Console" in Windsor.ai | Owner, ~5 min | Lets Claude pull GSC data directly in a session. Optional; adds a third party with read access |

A and C can run side by side: C is the admin UI, A is the automation. I could not check whether C is already connected: a
read-only database query was blocked in this session. **Check Admin → Marketing & Ads → Connections** first. If Google
shows *Connected* with Search Console listed, the admin tab already has live data and it just needs reading.

## 2. Option A — service account (exact steps)

### 2.1 Google Cloud (one-time)
1. Open <https://console.cloud.google.com/> with the Google account that owns EzyLoan's Search Console.
2. Select (or create) a project, e.g. **EzyLoan SEO**.
3. **APIs & Services → Library**. Enable:
   - **Google Search Console API** (performance, sitemaps, URL Inspection)
   - **Google Analytics Data API** (for GA4 reports — `GA4-INTEGRATION-GUIDE.md`)
   - **PageSpeed Insights API** (§6)
4. **IAM & Admin → Service accounts → Create service account**
   - Name: `ezyloan-seo-reader`
   - *Grant this service account access to project*: **skip, no roles needed**. Its access comes only from being added to Search Console and GA4.
5. Open the account → **Keys → Add key → Create new key → JSON**. A file downloads once.
6. Copy the account's email, like `ezyloan-seo-reader@<project>.iam.gserviceaccount.com`.

### 2.2 Search Console permission
1. Search Console → property → **Settings → Users and permissions → Add user**.
2. Email: the service-account email. Permission: **Restricted** (least privilege).
   - *Restricted* users can view performance data, sitemaps and index coverage, and cannot change settings, submit or remove URLs, or add users.
   - **URL Inspection:** Google's permissions table lists it for Restricted users as **"Fetch only"**, and does not say whether that includes the API's inspection result (<https://support.google.com/webmasters/answer/2451999>, checked 28 Nov 2026). So: start with Restricted and run `npm run seo:gsc -- inspect`. If inspection returns **403** while `performance` works, raise the account to **Full**. Full cannot verify ownership or add users. It *can* submit sitemaps and request removals, but these scripts never call those endpoints (they only call `searchAnalytics.query`, `sitemaps.list`, `sites.list` and `urlInspection.index.inspect`), and the token they request is the **read-only** scope `webmasters.readonly`, which Google accepts for inspection.
3. **Which property:** today the site is verified with a meta tag, which is a **URL-prefix property** (`https://www.ezyloan.co.in/`).
   **Also add a Domain property** (`ezyloan.co.in`, verified by a DNS TXT record at the domain registrar):
   - The legacy URLs (`OLD-URL-REDIRECT-MAP.md`) lived on `ezyloan.co.in` without www. A URL-prefix property for `www` **does not show their 404s, clicks or backlinks**. A Domain property covers http/https, www/apex and all paths.
   - The scripts auto-select the Domain property when the service account can see it.

### 2.3 Store the key safely
Full, step-by-step instructions (Windows file permissions, GitHub secrets, rotation, revocation, what never to do) are in
**`docs/GOOGLE-CREDENTIALS-SETUP.md`**. In short:
- The key file lives **outside** the repository (e.g. `C:\Users\<you>\secrets\ezyloan-seo-reader.json`). `.env.local` gets only its path: `GOOGLE_SA_KEY_FILE=…`.
- **The GitHub repository is public** (checked 28 Nov 2026). Do **not** add `GOOGLE_SA_KEY_JSON` as a GitHub secret until the repository is made private: the workflow refuses to fetch Google data in a public repo anyway (§5).
- Leaked or no longer needed → delete the key in Cloud console. Rotate yearly.
- The scripts send the key only to `oauth2.googleapis.com`, never print it, and redact secrets from every error message (tested: `scripts/test-seo-tools.mjs`).

### 2.4 Run it
```bash
node --env-file=.env.local scripts/seo/gsc-report.mjs performance     # 7/28/90-day vs previous period
node --env-file=.env.local scripts/seo/gsc-report.mjs inspect --legacy  # URL-level indexing: 63 sitemap + 48 legacy URLs
```
Output: `reports/seo/gsc-performance-<date>.{json,md}` and `gsc-inspect-<date>.{json,md}` (gitignored).

| Report | Contents |
|---|---|
| **performance** | Clicks, impressions, CTR and impression-weighted position for the last 7, 28 and 90 days vs the previous equal period (uses Google's *final* data, ending 3 days ago); top and declining queries; top and declining pages; device and country (28 d); sitemap status |
| **inspect** | For each sitemap URL: Google's verdict, coverage state (*Submitted and indexed*, *Crawled – currently not indexed*, *Discovered – currently not indexed*, *Duplicate…*, etc.), last crawl, Google-selected vs declared canonical, robots and fetch state. With `--legacy`: whether Google still knows each old URL, which shows which redirects matter most |

**Declining** means fewer clicks, a position at least 1.0 worse, or impressions dropping to zero. Rows with fewer than 20
impressions in both periods are **not ranked**: at that volume a change is noise. Change with `--min-impressions=`.
Quotas used: URL Inspection is 2,000/day and one run uses about 111. Search Analytics quotas are far above what these runs use.

## 3. What the first real run will answer

These are the Stage 1 questions that are still open:
1. **When did the decline start?** Compare the monthly series (export, §4) with the Next.js launch (May 2026) and the city-post publishing (Sep–Nov 2026).
2. **Which pages and queries lost clicks?** `performance` → declining pages/queries per window.
3. **Which URLs are not indexed, and why?** `inspect` → coverage state per URL.
4. **Do the legacy URLs still carry signals?** `inspect --legacy`, plus the Domain property's *Links* report, which lists the top linked pages including old 404 URLs.
5. **Do the city posts get their own impressions?** `performance` → page table; this drives `CITY-BLOG-CANNIBALIZATION-REPORT.md`.

## 4. Option B — 16-month CSV export (works today)

1. Search Console → **Performance → Search results**.
2. **Date → Last 16 months → Apply.** Tick **Total clicks, Total impressions, Average CTR, Average position**.
3. **Export → Download CSV**. A zip downloads. Unzip it into a folder, e.g. `C:\Users\<you>\Downloads\gsc-16m\`. It contains `Queries.csv`, `Pages.csv`, `Countries.csv`, `Devices.csv`, `Dates.csv`, `Search appearance.csv`, `Filters.csv`.
4. For query- and page-level **declines**, export twice more with **Date → Compare**:
   - *Compare last 28 days to previous period* → unzip to `gsc-cmp-28d\`
   - *Compare last 3 months to previous period* → unzip to `gsc-cmp-3m\`
5. Indexing: **Indexing → Pages**. For each row under *Why pages aren't indexed*, open it → **Export → CSV**. Repeat for *View data about indexed pages*.
6. Run:
   ```bash
   node scripts/seo/gsc-report.mjs csv --dir="C:\Users\<you>\Downloads\gsc-16m"     # 7/28/90-day totals + monthly series
   node scripts/seo/gsc-report.mjs csv --dir="C:\Users\<you>\Downloads\gsc-cmp-28d" # declining/improving queries and pages
   ```
   Or send me the folders. The indexing exports from step 5 are analysed by hand: the script does not parse them, because their layout varies by report.

Limits: UI exports hold at most **1,000 rows per table**, and the 16-month table is aggregated over the whole range. That's
fine for a baseline, but it's why option A is the long-term route. A CSV run labels its source as *"Search Console UI export"*,
so it is never confused with API data.

## 5. Weekly automation

`scripts/seo/weekly-report.mjs` uses the same key. The GitHub Actions setup is in `STAGE-2-IMPLEMENTATION-PLAN.md` §5.
**Because the repository is public, the workflow runs in technical-only mode:** it checks visibility at run time, and in a
public repo it gets no Google secret and fetches no Search Console or GA4 data. Two ways to get the Google sections weekly:
(a) make the repository private, then add the secrets; or (b) run `npm run seo:weekly` by hand on a trusted machine that
has `GOOGLE_SA_KEY_FILE`. (Don't also schedule it there: one scheduled job only.)

## 6. PageSpeed Insights key (for Core Web Vitals)

**Correction of Stage 1:** it said the key's project was over quota. In fact `PAGESPEED_API_KEY` is **empty** in `.env.local`,
so the requests went out without a key and hit Google's shared anonymous quota.

**Who reads the key** [Code, verified 28 Nov 2026]:
| Reader | Source of the key | Notes |
|---|---|---|
| Admin → *Site health → PageSpeed* (`app/api/admin/site-health/pagespeed/route.ts:18`) | **Server environment only** (`process.env.PAGESPEED_API_KEY`) | Not the admin "API keys" screen. Without a key it calls PageSpeed keyless and gets 429s at volume. Stage 2's guide wrongly said "admin → API keys"; corrected here |
| `scripts/seo/weekly-report.mjs` | `PAGESPEED_API_KEY` env (local `.env.local` or the GitHub secret) | Key sent as the documented `key=` query parameter. It's **redacted from every error message**, and request URLs are never logged (tested) |

Steps:
1. Same Cloud project → **APIs & Services → Library → PageSpeed Insights API → Enable**.
2. **Credentials → Create credentials → API key.** Then **Edit key → API restrictions → Restrict key → PageSpeed Insights API only.** Application restriction: none for server use. An IP restriction to the production server is possible, but it would block the GitHub runner.
3. Put it in the **production server environment** (where `next start` runs) as `PAGESPEED_API_KEY=…` and restart. For local runs, add it to `.env.local`. For the weekly workflow, add the GitHub secret `PAGESPEED_API_KEY`. PageSpeed results are public data, so using this key in a public repo's workflow exposes no business data. The key itself stays masked as a secret.
4. Quota: shown in Cloud console → *APIs & Services → PageSpeed Insights API → Quotas*. The weekly run uses 6 requests. (I couldn't confirm the free daily limit in Google's PageSpeed docs, so no figure is given here.)
5. Verify: `node --env-file=.env.local scripts/seo/weekly-report.mjs --out=reports/seo`. The *Core Web Vitals* section should appear and *pagespeed* should no longer be listed under *Not measured*.

## 7. Bing Webmaster Tools

<https://www.bing.com/webmasters> → sign in → **Import from Google Search Console**. This verifies the site and imports the sitemap. It takes about 5 minutes and needs no code change.
