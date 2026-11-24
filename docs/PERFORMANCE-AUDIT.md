# EzyLoan — Performance Audit (24 Nov 2026)

## How it was measured

Lighthouse 12.8 and 13.6 both failed the performance category on this machine (`NO_NAVSTART` with Chrome 157),
so **no Lighthouse performance score is reported**. Instead `scripts/vitals-lab.mjs` drives Chrome over the
DevTools protocol and reads the browser's own `largest-contentful-paint`, `layout-shift`, `paint` and `longtask`
entries — cold cache, median of 3 runs, local production build (`next start`, no CDN):

- **mobile**: 412 px, DPR 2, 4× CPU slowdown, 150 ms RTT / 1.6 Mbps (≈ Lighthouse "Slow 4G")
- **desktop**: 1350 px, no throttling

"TBT~" sums long-task time over 50 ms from first paint until **5 s after the load event**, so it also counts the
deliberately deferred Google Ads tag and chat widget. It is useful for comparing builds, and it overstates
Lighthouse TBT. These are lab numbers; real-user (field) data comes from PageSpeed Insights / CrUX after deploy.

## Results

| Page | Profile | LCP | CLS | TBT~ | Transfer |
|---|---|---|---|---|---|
| `/blogs` — before image fix | mobile | **5,868 ms** | 0.009 | 1,073 ms | 1,321 KB |
| `/blogs` — after | mobile | **1,924 ms** | 0.010 | 1,101 ms | 841 KB |
| `/blogs` — before | desktop | 596 ms | 0.007 | 103 ms | 2,341 KB |
| `/blogs` — after | desktop | 920 ms | 0.008 | 230 ms | **969 KB** |
| `/` | mobile | 1,640 ms | 0.010 | 1,207 ms | 755 KB |
| `/used-car-loan` (new) | mobile | 1,336 ms | 0.011 | 1,437 ms | 569 KB |
| `/apply-now` | mobile | 1,284 ms | 0.012 | 1,129 ms | 581 KB |
| `/car-loan-topup` | mobile | 1,732 ms | 0.009 | 1,144 ms | 594 KB |
| `/` | desktop | 828 ms | 0.008 | 121 ms | 982 KB |
| `/used-car-loan` | desktop | 552 ms | 0.007 | 107 ms | 660 KB |

Targets: LCP ≤ 2.5 s ✅ on every measured page/profile after the fix; CLS ≤ 0.1 ✅ everywhere. INP cannot be
measured in the lab (needs real interactions) — use field data.

The desktop `/blogs` LCP moved 596 → 920 ms in these runs: the LCP element is now a resized image fetched from
Cloudinary's edge on first request (transformations are generated once, then cached). Re-measure after deploy
with warm Cloudinary caches.

## What changed

- **Blog images** (`lib/imageUrl.ts`): Cloudinary `f_auto,q_auto` + width/crop, `srcSet`/`sizes` on the listing and
  article hero; related-post thumbnails resized. One card image: 192 KB JPEG → 34 KB WebP. Stored images untouched.

## Findings not changed (need field data or a decision)

| Finding | Detail | Next step |
|---|---|---|
| Mobile main-thread time ≈ 1.1–1.4 s on every page, including the new page whose own JS is 166 B | Comes from the shared layout (header/footer hydration, ScrollReveal, attribution/analytics, deferred gtag + chat). Chat already loads on idle, gtag after `load` | Check PageSpeed Insights field INP/TBT after deploy (admin → Site health → PageSpeed). If INP is poor, profile with a DevTools trace before changing anything |
| ScrollReveal hides below-the-fold blocks until scrolled into view | Content is in the HTML (crawlers unaffected), and it is off for reduced-motion users; it adds an IntersectionObserver + class changes | Keep; consider limiting to the homepage |
| Homepage review avatars hot-linked from `lh3.googleusercontent.com` | Google sometimes returns 429 HTML (blocked by the browser); fallback to initials works | Store avatars locally or show initials only |
| First-load JS shared by all pages ≈ 103–107 KB; homepage 151 KB, `/apply-now` 144 KB | From `next build` output | No regression this round |

Re-run: `node scripts/vitals-lab.mjs https://www.ezyloan.co.in vitals.json` (`ROUTES=/,/blogs RUNS=5` to narrow).
