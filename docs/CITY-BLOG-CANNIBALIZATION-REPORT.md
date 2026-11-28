# City Blog Cannibalisation Report (Stage 2, 28 Nov 2026)

**No article has been merged, redirected, edited or deleted.** Final decisions wait for Search Console page-level data
(`GSC-INTEGRATION-GUIDE.md`). This report shows what is competing with what, and which data will settle each case.

## How this was measured [Measured, 28 Nov 2026, live site]

- Titles, H1s, inbound links: `scripts/seo-crawl.mjs` (69 URLs). *Inbound* = pages linking to the post, including the `/blogs` listing.
- Word counts and overlap: article text (`<article>`), 5-word shingles with city names masked. **Overlap = share of the shorter post's phrases that also appear in the other.**
- Publish date and byline: the post's own BlogPosting JSON-LD.
- **Performance evidence: [Not available]** for every row. No GSC or GA4 data exists yet, so **no row below is decided**.

## The competing groups

### Group 1 — Car loan top-up (7 posts vs 1 service page)

Service page: **`/car-loan-topup`**. Title "Car Loan Top-Up in Odisha – Extra Funds on Your Loan", H1 "Car Loan Top-Up". Linked site-wide.

| Post | Title (H1 prefix) | Words | Published · byline | Inbound | Max overlap with sibling | Primary keyword | Intent | Competes with |
|---|---|---|---|---|---|---|---|---|
| `/blog/car-loan-top-up` | Car Loan Top-Up: How It Works, Eligibility and Top-Up vs Personal Loan | 1,168 | 2026-06-13 · EzyLoan Editorial Team | 9 | 12% | car loan top up (how it works) | **Informational** | Mildly with the service page; this is the legitimate guide |
| `…-in-bhubaneswar-odisha-…` | Car Loan Top-Up Loan in Bhubaneswar, Odisha | 3,229 | 2026-10-23 · EzySEO | 4 | 16% | car loan top up Bhubaneswar | Commercial / local | `/car-loan-topup` + the 5 siblings |
| `…-in-cuttack-odisha-…` | … in Cuttack, Odisha | 2,733 | 2026-10-23 · EzySEO | **1** | 12% | car loan top up Cuttack | Commercial / local | same |
| `…-in-puri-odisha-…` | … in Puri, Odisha | 2,253 | 2026-09-22 · EzySEO | **1** | 13% | car loan top up Puri | Commercial / local | same |
| `…-in-rourkela-odisha-…` | … in Rourkela, Odisha | 3,227 | 2026-11-23 · EzySEO | 12 | 12% | car loan top up Rourkela | Commercial / local | same |
| `…-in-berhampur-odisha-…` | … in Berhampur, Odisha | 3,296 | 2026-11-03 · EzySEO | 12 | 16% | car loan top up Berhampur | Commercial / local | same |
| `…-in-jeypore-odisha-…` | … in Jeypore, Odisha (84-char title) | 3,613 | 2026-11-05 · EzySEO | 12 | 13% | car loan top up Jeypore | Commercial / local | same |

The three newest posts have 12 inbound links because a "latest posts" block on the car product pages links to them. Older ones drop to 1 link as newer posts replace them in that block.

### Group 2 — Property loan (4 city posts + 2 guides vs 1 service page)

Service page: **`/property-loan`**. Title "Loan Against Property in Odisha – LAP Eligibility", H1 "Property Loans & Loan Against Property".

| Post | Words | Published · byline | Inbound | Max overlap | Primary keyword | Intent | Competes with |
|---|---|---|---|---|---|---|---|
| `/blog/property-loan-in-cuttack-odisha-…` (92-char title) | 1,974 | 2026-10-19 · EzySEO | **1** | 14% | property loan Cuttack | Commercial / local | `/property-loan` + siblings |
| `/blog/property-loan-in-rourkela-odisha-complete-guide` | 964 | 2026-10-19 · EzySEO | **1** | 14% | property loan Rourkela | Commercial / local | same |
| `/blog/property-loans-in-puri-odisha-…` | 2,895 | 2026-09-29 · EzySEO | **1** | 13% | property loan Puri | Commercial / local | same |
| `/blog/property-loans-in-sambalpur-odisha-…` | 3,066 | 2026-10-05 · EzySEO | **1** | 13% | property loan Sambalpur | Commercial / local | same |
| `/blog/loan-against-property-guide` | — | 2026-07-20 · Editorial | 6 | — | loan against property (how it works) | Informational | Legitimate guide |
| `/blog/property-documents-for-loan-odisha` | — | 2026-10-27 · Editorial | 13 | — | property documents for loan Odisha | Informational | **Distinct**: genuinely Odisha-specific (RoR, EC, mutation). Keep |

**Claim note:** the Puri and Sambalpur posts quote "8.5% p.a. … up to 12.0%" and "₹5 lakh … ₹5 crore+". Those are the
unresolved figures in `CLAIMS-MANAGEMENT-REVIEW.md` (R4), so whatever is decided there applies to these posts too.

### Group 3 — Personal loan and used car (1 post each)

| Post | Words | Published · byline | Inbound | Primary keyword | Intent | Competes with |
|---|---|---|---|---|---|---|
| `/blog/getting-a-personal-loan-in-odisha-…`, titled **"Personal Loan in Odisha \| Apply Online – EzyLoan"** | — | 2026-10-10 · EzySEO | **1** | personal loan Odisha | **Transactional** (the title says "Apply Online") | **`/personal-loan`** (title "Personal Loan in Odisha – …"): a direct head-to-head on the same query |
| `/blog/from-listing-to-driveway-…-ezy-used-car-loan-in-odisha` (96-char title) | — | 2026-10-06 · EzySEO | **1** | used car loan Odisha | Mixed | **`/used-car-loan`** (H1 "Used Car Loan in Odisha") and `/blog/used-car-loan-india-2026` |

## What the evidence already says (without GSC)

1. **One intent, many URLs.** "Car loan top-up in {city}" is the same need in every city: extra funds on an existing car loan. Unless a lender's terms or the process differ by city, the city adds nothing the reader can use. Low text overlap (10–16%) means the posts were written separately, not that they serve different intents.
2. **Local relevance is unsupported.** EzyLoan has one verified office (Cuttack). Nothing in the posts shows a city-specific fact about EzyLoan's service there: branch, partner lender, team or case. This is the pattern Google's spam policies call *doorway* or *scaled content*.
3. **The service page loses internal authority.** Local posts that compete for "top-up Odisha" queries take internal-link weight and query matches away from `/car-loan-topup`.
4. **The byline "EzySEO" is a weak trust signal** on a YMYL topic. It reads as a tool name, not an accountable author. Bylines must not be invented, so the fix is to attribute posts to "EzyLoan Editorial Team" with the real review process, or to a real, consenting staff member. That is a management decision.
5. **Timing:** all 12 "EzySEO" posts (the 10 city-named ones above plus the 2 Odisha-wide ones in Group 3) were published 22 Sep – 23 Nov 2026 [Measured: BlogPosting `datePublished`]. If GSC shows the decline began **before** September, they are not its main cause (the legacy-URL loss is the stronger candidate). If it began **after**, they are prime suspects.

## Recommended action per post — PROVISIONAL, decided by GSC data

Decision rule, applied once 90 days of page-level GSC data exist:

| GSC evidence for the city post | Action |
|---|---|
| Own impressions/clicks for its city query, **and** it ranks better than the service page for that query | **Keep**: retitle to a clearly informational angle, add a real local section only with verified facts, link prominently to the service page, and fix the byline |
| Impressions but ranks below the service page for the same queries | **Merge** its unique useful parts into the service page or the guide, then 301 to the closest page |
| No meaningful impressions in 90 days | **Merge or 301** to the service page. If it has no unique content, set it to *draft* (unpublish) and 301 |
| "Crawled/Discovered – currently not indexed" | Google has already judged it low-value: **merge and 301** |

| Post | Provisional recommendation | What would change it |
|---|---|---|
| `/blog/car-loan-top-up` | **Keep** as the single top-up guide; make it the canonical informational page | — |
| 6 × car-loan-top-up-in-{city} | **Consolidate** into `/car-loan-topup` (an "Across Odisha" section covering only facts that are true everywhere) and `/blog/car-loan-top-up`, with 301s | A city post outranking `/car-loan-topup` with real clicks |
| 4 × property-loan-in-{city} | **Consolidate** into `/property-loan` plus `/blog/loan-against-property-guide`; keep `property-documents-for-loan-odisha` | As above |
| `getting-a-personal-loan-in-odisha-…` | **Retitle** to an informational angle (e.g. documents and checks before applying) **or merge** into `/blog/personal-loan`. Do not keep a second "Personal Loan in Odisha \| Apply Online" | GSC showing it as the better-ranked URL for "personal loan Odisha" |
| `from-listing-to-driveway-…` | **Merge** into `/blog/used-car-loan-india-2026` (the buying-checklist angle) and shorten the title | Distinct ranking queries in GSC |

Every merge or 301 changes a published URL, so each one goes through the redirect sign-off in `OLD-URL-REDIRECT-MAP.md` §5 first.

**Before consolidating, do the safe step:** add contextual links from each city post to its service page, which is
already true via the cluster block, and from the service page to the guide. Leave the city posts in place. This is reversible and needs no URL change.
