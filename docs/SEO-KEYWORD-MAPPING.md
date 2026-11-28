# SEO Keyword Mapping — one intent, one URL (Stage 2, 28 Nov 2026)

**Search volume, keyword difficulty and current ranking: [Not available]** for every row. No keyword tool or Search
Console data has been connected, and no figure has been estimated. The `Volume` / `KD` / `GSC position` columns are left
blank on purpose and will be filled from (1) GSC queries (`npm run seo:gsc -- performance`) and (2) a keyword tool
(Google Ads Keyword Planner via the Ads account, or Ahrefs/Semrush). Priority below is set from **business fit and
conversion intent**, not from volume, and will be re-ranked once volumes exist.

Intent: **T** transactional (wants to apply) · **C** commercial (comparing options) · **I** informational (wants to understand) · **L** local modifier.

## 1. Service-level map (the brief's primary keywords)

| # | Primary keyword (+ natural variants) | Intent | Target URL | Status today [Measured] | Priority | Conversion potential | Volume | KD | GSC pos. |
|---|---|---|---|---|---|---|---|---|---|
| 1 | used car loan in Odisha · second hand car loan · pre-owned car loan | T+L | `/used-car-loan` | Title & H1 match ✅ | P1 | High | | | |
| 2 | used car loan Bhubaneswar | T+L | `/used-car-loan` (city mentioned where true) | No city page; L1 blog supports | P1 | High | | | |
| 3 | used car loan Cuttack | T+L | `/used-car-loan` | Head office is in Cuttack: the one city with a verified presence | P1 | High | | | |
| 4 | new car loan in Odisha · car loan · auto loan | T+L | `/car-loan` | Title ✅; **H1 "New Car Loans: Turn Your Dream Into Reality" has no keyword or location** | P1 | High | | | |
| 5 | car loan top up · top up on existing car loan | T | `/car-loan-topup` | Title ✅; H1 "Car Loan Top-Up" ✅; **7 competing posts** (`CITY-BLOG-CANNIBALIZATION-REPORT.md`) | P1 | High | | | |
| 6 | car loan top up in Odisha | T+L | `/car-loan-topup` | as #5 | P1 | High | | | |
| 7 | car loan balance transfer · transfer car loan to another bank | T | `/car-loan-balance-transfer` | Title ✅; H1 promises "Lower Your Monthly EMI" (claim-adjacent, R1/R6) | P1 | High | | | |
| 8 | car loan balance transfer in Odisha | T+L | `/car-loan-balance-transfer` | as #7 | P1 | High | | | |
| 9 | loan against car · car refinance · loan on car | T | `/car-loan-refinance` | Title "Loan Against Car in Odisha" ✅; **H1 "Take control of your finances with EzyLoan's Car Refinance Loan!" doesn't match** | P1 | High | | | |
| 10 | loan against car in Odisha | T+L | `/car-loan-refinance` | as #9 | P1 | High | | | |
| 11 | cash on car · money against car | T | `/car-loan-refinance` | Term absent from the page. Add as a natural variant ("also called cash on car") | P1 | High | | | |
| 12 | commercial vehicle loan in Odisha · truck loan · bus loan · taxi loan | T+L | `/commercial-vehicle-loan` | Title ✅; H1 "…to Accelerate Your Business Growth" has no keyword | P1 | High | | | |
| 13 | personal loan (in Odisha) | T(+L) | `/personal-loan` | Title ✅; **H1 "Fulfill Your Dreams with Personal Loans"**; competing post `getting-a-personal-loan-in-odisha…` | P2 | Medium | | | |
| 14 | business loan · MSME loan | T | **No page** | Appears only as a form option on `/apply-now` and `/contact`. **Management decision:** is it offered through partners? If yes, create `/business-loan`; if no, remove the form option | P2 (blocked) | — | | | |
| 15 | property loan · loan against property · LAP | T | `/property-loan` | Title ✅; H1 ✅; **4 competing city posts** | P2 | High (large tickets) | | | |
| 16 | EMI calculator · car loan EMI calculator | Tool | `/emi-calculator` | ✅ | P2 | Medium | | | |
| 17 | home loan | T | **No page; decision** | Legacy `/home-loan` existed in 2024. Create only if home loans are facilitated | blocked | — | | | |

**Terminology decision (recommended):** on this site, *refinance* = **loan against a car you own** (`/car-loan-refinance`) and
*balance transfer* = **moving an existing car loan** (`/car-loan-balance-transfer`). The two pages and the planned article
"Balance Transfer vs Refinancing" must use these meanings consistently, otherwise they cannibalise each other.

## 2. Informational clusters → supporting URL (existing posts first)

| Cluster (query examples) | Intent | Owner URL | Supports | Notes |
|---|---|---|---|---|
| documents required for car loan | I | `/blog/car-loan-documents-checklist` | `/car-loan`, `/used-car-loan` | Exists |
| used car loan documents (RC, Form 29/30, valuation) | I | **new** (Batch 1) | `/used-car-loan` | Distinct from the generic checklist |
| car loan eligibility by salary · how much car loan can I get | I | `/blog/car-loan-eligibility-by-salary` | `/car-loan` | Exists |
| car loan for self-employed | I | `/blog/car-loan-for-self-employed` | `/car-loan`, `/used-car-loan` | Exists; refresh with used-car points |
| used car loan eligibility · car age limit | I | **new** + `/blog/used-car-loan-india-2026` | `/used-car-loan` | Refresh the existing post's age rules |
| how to apply for used car loan · approval process | I/T | **new** (Batch 1) | `/used-car-loan` | One article for apply + approval + process |
| used car loan vs personal loan | C | **new** (Batch 1) | `/used-car-loan`, `/personal-loan` | |
| used car loan interest rate · used car EMI | I | **new** (Batch 1) | `/used-car-loan`, `/emi-calculator` | Illustrative figures only (R4) |
| car loan interest rate factors | I | `/blog/car-loan-interest-rate-factors` | `/car-loan` | Exists |
| flat vs reducing interest rate | I | **new** (Batch 1) | all car pages, `/emi-calculator` | Not covered anywhere; dealers often quote flat rates |
| how car loan top-up works · top-up vs personal loan | I/C | `/blog/car-loan-top-up` | `/car-loan-topup` | Exists; the single top-up guide |
| when to take a top-up (is it a good idea) | I/C | `/blog/car-loan-top-up` (refresh: add a "when it makes sense" section) | `/car-loan-topup` | Stage 2 review: same intent as the existing post |
| car loan top-up EMI | I | **new** (Batch 1) | `/car-loan-topup` | |
| car loan credit score needed | I | `/blog/how-to-improve-cibil-score-before-loan` (refresh: car-loan section) | car pages | Stage 2 review: folded, not a new post |
| when balance transfer lowers EMI · BT savings | I | `/blog/car-loan-balance-transfer-lower-emi` | `/car-loan-balance-transfer` | Exists |
| BT process / documents / eligibility | I | **new** (Batch 1) | `/car-loan-balance-transfer` | |
| balance transfer vs refinance | I | **new** (Batch 1) | both pages | Fixes terminology overlap |
| car loan foreclosure statement · outstanding amount letter | I | **new** (Batch 1) | `/car-loan-balance-transfer` | |
| car loan prepayment / foreclosure charges | I | `/blog/car-loan-prepayment-foreclosure` | `/car-loan` | Exists |
| loan against car how it works | I | `/blog/used-car-refinance` | `/car-loan-refinance` | Exists; add the "cash on car" term |
| car valuation for loan · loan to value car | I | **new** (Batch 1) | `/car-loan-refinance`, `/used-car-loan` | |
| loan against car vs personal loan | C | **new** (Batch 1) | `/car-loan-refinance` | |
| remove hypothecation from RC | I | `/blog/remove-hypothecation-from-rc-after-car-loan` | car pages | Exists |
| check hypothecation before buying a used car (Vahan) | I | **new** (Batch 3) | `/used-car-loan` | |
| commercial vehicle loan guide / used CV / taxi loan | I | existing 3 posts | `/commercial-vehicle-loan` | Exist |
| CV eligibility & documents · CV EMI planning · fleet expansion | I | **new** (Batches 2–3) | `/commercial-vehicle-loan` | |
| personal loan eligibility/documents · low CIBIL · vs credit card · medical · debt consolidation · compare offers | I/C | existing 6 posts | `/personal-loan` | Exist |
| loan against property guide / vs personal loan / for business / Odisha property documents | I/C | existing 4 posts | `/property-loan` | Exist |
| EMI formula · how to calculate EMI | I | `/blog/how-to-calculate-loan-emi` | `/emi-calculator` | Exists |
| CIBIL score before applying | I | `/blog/how-to-improve-cibil-score-before-loan` | all | Exists |
| loan DSA · fake loan agent · loan app fraud | I | 2 existing posts | `/about`, `/lending-partners` | Exist; strong trust content |
| key fact statement (KFS) · compare loan offers APR | I/C | **new** (Batch 1) | all | General comparison article; the product "compare" posts link to it |

## 3. Location map — rules (no doorway pages)

| Location | Verified EzyLoan presence [Code: address in schema/footer] | Allowed treatment now | Needs (from management) before more |
|---|---|---|---|
| **Cuttack** | ✅ head office (Pir Bazar, Bhanpur) | Name it on service pages and Contact; Google Business Profile | — |
| Bhubaneswar | ❓ none verified | Mention on service pages only as an area served, **if true** | Confirmation that applications from here are handled (and how: visit, doorstep, online) |
| Puri, Rourkela, Sambalpur, Berhampur, Jeypore | ❓ none verified | Same as Bhubaneswar | Same, per city |
| Odisha (state) | ✅ business targets Odisha | "in Odisha" in titles/H1s ✅; Odisha-specific *process* content (RTO, Vahan, Odisha property records) | — |

The full article-level list (63 distinct articles, each with a unique primary keyword and owner page) is
`BLOG-105-CONTENT-STRATEGY.md` §7. That list is the source of truth for blog keywords. This file maps intents to URLs.

**Rule:** a city-specific URL is justified only when it carries a fact that is true and useful **only for that city**: a
branch, a named local team, partner lenders active there, the RTO code and process for that district, or real local cases.
Swapping the city name in the same text is the doorway pattern (`CITY-BLOG-CANNIBALIZATION-REPORT.md`).

## 4. Cannibalisation guardrails for every new article

1. Before drafting, search this map plus the 42 existing titles. If a URL already owns the intent, **refresh it** instead.
2. Blog titles never start with the service page's head term in transactional form ("Car Loan Top-Up in Odisha | Apply…"). Blogs answer a question; service pages sell.
3. Every blog links to its owner service page with descriptive anchor text, and to at most 2–3 related posts.
4. Each new article carries `focusKeyword` + `secondaryKeywords` in `scripts/seed-blogs.mjs`, and the seeder rejects a `focusKeyword` already used by another post. (That check is proposed in Stage 2 plan §4: the seeder doesn't have it yet.)
