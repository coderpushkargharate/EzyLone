# EzyLoan — SEO, Keyword & AI-Visibility Plan (24 Nov 2026)

What is implemented is marked ✅ with evidence; everything else is a plan with the owner or access it needs.
No search volume, difficulty or ranking number appears here: no keyword tool or Search Console export was
available in this session, and none has been estimated. Nothing here guarantees rankings or AI mentions.

## 1. Technical baseline (verified)

| Check | Live (before) | Local build (after) |
|---|---|---|
| robots.txt | `User-agent: * Allow: / Disallow: /api/`, sitemap + host lines | unchanged |
| Googlebot / Bingbot / OAI-SearchBot / GPTBot | all allowed (no bot-specific groups) | unchanged — see §5 |
| sitemap.xml | 62 URLs, published blogs only, real `lastmod` | 63 (+ `/used-car-loan`) |
| Status codes | all sitemap URLs 200; 404 for unknown paths; 308 for `/blog`, `/terms`, `/privacy`; apex → www | same |
| Canonicals | self-referencing on every indexable page | same (+ new page) |
| Rendering | server HTML for all public content | same |
| Broken internal links | 0 | 0 |
| Duplicate titles / descriptions | 0 / 0 | 0 / 0 |
| BreadcrumbList | missing on 5 pages | ✅ every indexable page except `/` |
| Heading skips | 3 pages | ✅ 0 |
| Titles > 60 / descriptions > 160 (static pages) | 8 pages | ✅ 0 |

Re-run any time: `node scripts/seo-crawl.mjs https://www.ezyloan.co.in out.json`.

## 2. Service pages (Phase 2)

| Service | URL | Status |
|---|---|---|
| Used car loan | `/used-car-loan` | ✅ **new** — see `COMPLETE-WEBSITE-AUDIT.md` §3 #1 |
| New car loan | `/car-loan` | ✅ metadata; 🟠 claims (7.99%, 48 h, 4.9 rating) |
| Car loan top-up | `/car-loan-topup` | ✅ metadata; 🟠 claims N4 |
| Car loan balance transfer | `/car-loan-balance-transfer` | ✅ metadata (no longer promises a lower rate) |
| Commercial vehicle loan | `/commercial-vehicle-loan` | ✅ metadata + heading fix; 🟠 claims N5 |

Existing URLs were kept (no renames, so no redirects needed). `/car-loan` stays the new-car page rather than
moving to `/new-car-loan`, because it already ranks/has links; the menu and copy label it "New Car Loan".

**Next content step (after claims sign-off):** give Top-Up, Balance Transfer and Commercial Vehicle the same
structure as `/used-car-loan` (what lenders check → eligibility → documents → process → FAQs in HTML `<details>`),
replacing the benefit cards that carry claims.

## 3. Keyword map

Volumes/difficulty: **not available** (connect Search Console data via the admin "SEO & Traffic" tab, or a keyword
tool such as Ahrefs/Semrush, and fill the two empty columns — do not guess them).

| Keyword (and natural variants) | Intent | Target URL | Priority | Content action |
|---|---|---|---|---|
| used car loan, second hand car loan, pre-owned car loan | Transactional | `/used-car-loan` | P1 | ✅ page live in build |
| used car loan Odisha / Bhubaneswar / Cuttack | Local transactional | `/used-car-loan` | P1 | Odisha in title/H1 ✅; city mentions only where true |
| new car loan, car loan, auto loan | Transactional | `/car-loan` | P1 | Re-structure after claims sign-off |
| car loan in Odisha / Bhubaneswar / Cuttack / Puri | Local | `/car-loan`, `/used-car-loan` | P1 | No city doorway pages (§6) |
| car loan top up, top up on existing car loan | Transactional | `/car-loan-topup` | P1 | FAQ block (brief item 5) after N4 decision |
| car loan balance transfer, transfer car loan to another bank, reduce car loan EMI | Transactional | `/car-loan-balance-transfer` | P1 | FAQ block; explain *when* BT does/doesn't reduce EMI |
| commercial vehicle loan, truck loan, tipper/bus/taxi loan | Transactional | `/commercial-vehicle-loan` | P1 | FAQ block after N5 |
| documents required for car loan | Informational | `/blog/car-loan-documents-checklist` (+ linked from service pages ✅) | P2 | — |
| car loan eligibility (by salary) | Informational | `/blog/car-loan-eligibility-by-salary` | P2 | Link from `/car-loan` |
| car loan EMI calculation / EMI calculator | Tool | `/emi-calculator` | P2 | — |
| how to reduce existing car loan EMI | Informational | `/car-loan-balance-transfer` + `/blog/car-loan-balance-transfer-lower-emi` | P2 | — |
| new vs used car loan | Informational | `/used-car-loan` (section ✅) | P3 | Optional dedicated blog |
| remove hypothecation from RC | Informational | existing blog | P3 | — |
| "where can I apply for a car loan", "how can I get a used car loan", "can I transfer my car loan", "how does a top-up work" | Conversational (AI/voice) | service pages | P1 | Answer each in one plain sentence near the top of the FAQ — ✅ done on `/used-car-loan` |
| Misspellings: car lon, car laon, carloan, vehical loan, commersial vehicle loan, balence transfer | Same as correct term | same URLs | — | **No pages, no stuffing.** Google/Bing map these to the correct spelling. Track them in Search Console queries only |

## 4. Blog SEO system (Phase 4) — verified on all 42 posts

URL `/blog/<slug>` (listing at `/blogs`; `/blog` 308 → `/blogs`). Changing to `/blogs/<slug>` would mean 42 redirects for no SEO gain, so it was not done.

| Requirement | Status |
|---|---|
| Unique URL, HTTP 200, self canonical, unique H1, title, description | ✅ 42/42 |
| Featured image with alt, OG/Twitter image | ✅ 42/42 (0 images without alt) |
| Author, `datePublished`, `dateModified` (from `modifiedAt` only when content changes) | ✅; team bylines now `Organization` |
| BlogPosting + BreadcrumbList JSON-LD | ✅ 42/42 |
| Related posts + links to the matching product page (topic clusters in `lib/seo.ts`) | ✅; product pages link back (`RelatedArticles`) |
| In sitemap only when published; drafts/pending/archived excluded | ✅ `PUBLIC_BLOG_FILTER`, on-publish `revalidatePath` |
| Listing: cards with image, title, excerpt, date, category; crawlable server HTML | ✅; images now resized (`lib/imageUrl.ts`) |
| Pagination | — all 42 posts on one server-rendered page (fine at this size; add `?page=` pagination above ~100 posts) |
| Long titles | 🟠 3 posts (74–86 chars) — shorten in admin |

**Publish checklist (validation system):** after publishing, run
`node scripts/seo-crawl.mjs https://www.ezyloan.co.in after-publish.json` and check the new slug appears with
status 200, `inSitemap: true`, one H1, `BlogPosting` in `jsonLdTypes`, `imagesNoAlt: []`, title ≤ 60 chars and at
least one inbound link. Then URL-inspect it in Search Console. Indexing is Google's decision; the sitemap and
internal links only help discovery.

## 5. AI search visibility (Phase 5)

| Item | Status |
|---|---|
| OAI-SearchBot (ChatGPT search), PerplexityBot, Googlebot, Bingbot | ✅ allowed |
| **GPTBot (model training)** | Allowed today by the wildcard rule. Different purpose from OAI-SearchBot; **not changed** — management decision. To opt out of training only: add `{ userAgent: 'GPTBot', disallow: '/' }` to `app/robots.ts` (keeps OAI-SearchBot) |
| `/llms.txt` | ✅ factual summary + links; now includes Used Car Loan; balance-transfer wording made conditional. It is a convenience file — no AI platform is known to rank by it |
| Server-rendered answers | ✅ FAQs on the new page are plain HTML (`<details>`), readable without JS |
| Consistent entity data (name, address, phone) | ✅ address/phone consistent; 🟠 email and social profiles (`COMPLETE-WEBSITE-AUDIT.md` #20–21) |
| Measuring AI traffic | ✅ `ai_referral` channel on leads; ⏳ GA4 not installed on production, so visit-level AI traffic is not measured yet |

## 6. Local SEO

Only one verified location (Cuttack head office). The task list asks for an Odisha page and 10 city pages; city pages
are worth building **only** with something genuinely local per city (a branch, a local team member, partner lenders
active there, real customer cases). Without that they are near-duplicate doorway pages, which Google demotes.
Needed from management: list of cities actually served, any branch addresses, and per-city facts. Google Business
Profile work (categories, services, photos, posts, review replies) is done in the GBP account — ⏳ access needed.

## 7. Search Console / Bing / GA4 (Phase 14)

| Task | Access needed | Steps |
|---|---|---|
| Resubmit sitemap after deploy | Search Console owner/full user | Sitemaps → `sitemap.xml` → Submit; URL Inspection → `/used-car-loan` → Request indexing |
| Bing | Bing Webmaster account | "Import from Google Search Console" (verifies + imports sitemap), or add the `msvalidate.01` value to `metadata.verification.other` in `app/layout.tsx` |
| GA4 | GA4 property + measurement id | Admin → Site tags → paste `G-…` (no rebuild). Then mark `generate_lead` as a key event |
| Monthly monitoring report | Search Console + GA4 | Admin "SEO & Traffic" tab already reads Search Console (service account) — report: indexed vs excluded pages, clicks, impressions, CTR, position for branded vs non-branded queries, top blog and service pages, leads by channel incl. `ai_referral` |
