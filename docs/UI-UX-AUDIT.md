# EzyLoan — UI/UX & Accessibility Audit (24 Nov 2026)

## What was checked

| Check | Method | Result |
|---|---|---|
| Horizontal scrolling / overflowing elements | `scripts/layout-check.mjs`: 22 page templates (all static routes + a blog post) at 320, 375, 768, 1024, 1440 px in headless Chrome | **0 of 110** overflow |
| Console errors / failed requests | same run | 0 console errors; only the hot-linked Google avatar 429s on `/` (handled by fallback) |
| Accessibility | Lighthouse accessibility category (this category works; only performance failed) on `/`, `/used-car-loan`, `/apply-now`, `/blogs`, mobile + desktop | 96–100 before fixes → **100** on `/apply-now` and `/used-car-loan` after; the `/blogs` failure was the same footer contrast issue, fixed by the same change |
| Heading structure | crawl of all 69 URLs | one H1 per page; 0 skipped levels after fixes |
| Reduced motion | screenshots with `prefers-reduced-motion: reduce` emulated | found and fixed nav spacing bug |
| Visual review | full-page screenshots of `/used-car-loan`, `/`, `/apply-now`, `/about`, `/blogs` at 5 widths | see below |

Widths 390/430/1280/1920 from the brief were not run individually; 375/1440 bracket them. Run them with
`WIDTHS=320,375,390,430,768,1024,1280,1440,1920 node scripts/layout-check.mjs <base> out.json shots/`.

## Fixed

| Issue | Fix |
|---|---|
| Desktop menu items touching each other when the visitor uses reduced motion | `components/Header.tsx`: link padding moved out of the motion media query |
| Mobile bottom bar "WhatsApp 1/2" labels: white 10 px text on 90 % green-500 (≈ 2.3 : 1, WCAG needs 4.5 : 1) | `components/FixedFooter.tsx`: green-700 / green-800 (≈ 5 : 1 / 7 : 1). Buttons are a darker green |
| Apply Now progress bar had no accessible name | `aria-label="Application progress"` |
| FAQ questions were not headings (h1 → h3 jump) | `components/FAQSection.tsx`: each question button wrapped in `<h2>` (accessible accordion pattern) |
| `/about` "We specialize in" was an h4 under the h1; CV highlights had no section heading | h2 / visually hidden h2 |
| Car products split across two menu entries; used car loan missing | one "Car Loans" menu |

## New page as the reference pattern

`/used-car-loan` was built as the proposed standard for service pages: one container width (`max-w-[85rem]`), the
site's spacing tokens (`page-top`, `section-py`, `section-mb`), brand blue `#2064c8` with a single dark accent band,
white cards with `slate-200` borders and `rounded-2xl`, one primary + one secondary button style, 16–18 px body,
no gradients on text, no hover motion beyond colour/shadow. Screenshots: mobile and desktop render without overlap.

## Not done — proposal for the full redesign (Phase 8)

A visual redesign of every route was **not** carried out in this round. The current pages mix several visual
languages (glass-prism cards, gradient text headings, animated shimmer buttons, emoji in headings, orange/green
accent cards) which is the main reason the site does not yet read as a restrained financial brand. Suggested order,
each step reviewable on its own:

1. **Tokens**: write the colours/type scale/radii/shadows above into `tailwind.config.ts` (`brand`, `ink`, `surface`), H1 36/48, H2 24/30, body 16/18.
2. **Shared components**: `Button`, `Card`, `SectionHeading`, `FaqList` (the `<details>` version from `/used-car-loan`), `Breadcrumbs`.
3. **Service pages**: move Top-Up, Balance Transfer, Commercial Vehicle, New Car, Personal, Property to the `/used-car-loan` structure — this also removes most claim-carrying benefit cards, so do it **after** the claims decisions.
4. **Homepage**: hero + five service cards + how it works + documents + FAQs + blog links (brief Phase 7), after claims decisions (the H1 and card highlights are the claims).
5. **Header/footer**: drop shimmer/ripple effects, keep one CTA style; the footer currently repeats the "10,000+ customers / 4.9 rating" claims.

Also noted: the floating chat button overlaps the right edge of content cards at ~1440 px (fixed position, existing).
