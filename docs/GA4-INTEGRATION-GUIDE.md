# Google Analytics 4 — Audit & Integration Guide (Stage 2, 28 Nov 2026)

**Status:** GA4 is **not running on the live site** (`/api/site-tags` → `ga4MeasurementId: null`, and no `G-` id in the HTML). [Measured]
The tracking code is already in the repository and tested; turning it on needs only a Measurement ID. **Nothing has been turned on.**

## 1. Audit of the existing analytics implementation [Code + Measured]

| Tag / mechanism | Live today | Where | Notes |
|---|---|---|---|
| Google Ads `AW-18024243962` | ✅ loads | `app/layout.tsx:303`, `lib/ads.ts` | gtag.js loads `lazyOnload`; the inline config runs `afterInteractive` |
| GA4 (build-time) | ❌ | `NEXT_PUBLIC_GA4_MEASUREMENT_ID` → inline `gtag('config', G-…)` in `app/layout.tsx:303` | Inlined at build. Takes precedence over runtime |
| GA4 (runtime) | ❌ | Admin → Marketing & Ads → Settings → API keys → `GA4_MEASUREMENT_ID` → `/api/site-tags` → `components/SiteTags.tsx` | No rebuild. Config applied when the browser is idle (a few seconds after load) |
| Meta Pixel | ❌ (`metaPixelId: null`) | `components/MetaPixel.tsx`, `components/SiteTags.tsx` | Out of scope here |
| First-party tracker | ✅ | `components/SiteTracker.tsx` → `/api/track` | Cookie-less, own database. Not a gtag call, so no double page views |
| Lead attribution (UTM, click ids, AI referrers) | ✅ | `lib/marketing/clientAttribution.ts` | Stored with each lead in the CRM |

**Events already coded** (all through `trackEvent()` in `lib/analytics.ts`, which drops PII keys and email/phone-like values):

| Event | Fires when | Recommended GA4 role |
|---|---|---|
| `page_view` | Each page load; client-side navigations via GA4 *Enhanced measurement → Page changes based on browser history events* (on by default) | — |
| `form_start` | First focus in the hero, contact or Apply Now form (once per form per tab) | Funnel step |
| `form_error` | Client validation blocks a submit | Funnel diagnostics |
| `generate_lead` | Server accepted a hero or contact enquiry (2xx) | **Key event** |
| `submit_application` | Server accepted an Apply Now application (201) | **Key event** |
| `calculator_complete` | EMI calculator used (once per visit) | Engagement |

### Findings
1. **Duplicate-event risk on Apply Now [Code].** `app/apply-now/page.tsx:164` also fires a raw
   `gtag('event', 'submit_loan_application', …)` with no `send_to`. A gtag event without `send_to` goes to **every configured
   tag**, so once GA4 is on, every application reaches GA4 as **two** events (`submit_loan_application` and `submit_application`).
   - **Safe handling, no code change:** mark only `generate_lead` and `submit_application` as key events. Leave `submit_loan_application` unmarked.
   - **Optional code change (needs approval, since it touches Ads tracking):** add `send_to: 'AW-18024243962'` to that raw event, so it stops reaching GA4. It is *not* a Google Ads conversion as written: Ads conversions need `send_to: 'AW-…/label'`, which `lib/ads.ts` sends separately. Check in Google Ads → Goals that nothing imports it before changing it.
2. **No double page views.** If both the build-time and admin ids are set, `SiteTags.tsx` skips the runtime config (`if (!GA4_MEASUREMENT_ID && …)`). `SiteTracker` does not call gtag.
3. **Runtime path misses early hits.** With the admin-panel id, GA4 starts a few seconds after load, so bounces in the first seconds are under-counted. **The build-time variable is more accurate**, but it needs a rebuild and deploy, which is a live change needing your approval.
4. **No consent mechanism.** The site has no cookie banner. Google Ads already loads unconditionally, and GA4 would do the same. The privacy policy (§11 *Cookies & Tracking*) already says cookies are used to "analyze usage". Whether India's DPDP Act 2023 requires a consent banner for analytics is a **legal decision**, so no consent code was added.

## 2. Install GA4 (owner steps, ~15 minutes)

1. <https://analytics.google.com> → **Admin → Create → Property**: *EzyLoan – www.ezyloan.co.in*, time zone **India (GMT+05:30)**, currency **INR**.
2. **Data streams → Add stream → Web**: `https://www.ezyloan.co.in`. Keep **Enhanced measurement** on, but open its settings and turn **off** *Form interactions*. The site sends its own `form_start`, so leaving it on would duplicate it.
3. Copy the **Measurement ID** (`G-XXXXXXXXXX`).
4. Choose one install path (both need your approval, because they change the live site):
   - **Fast (no deploy):** Admin panel → Marketing & Ads → Settings → API keys → *GA4 Measurement ID* → paste → save. Live within 5 minutes.
   - **Accurate (recommended):** add `NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-…` to the production `.env` and rebuild/deploy with the deployment checklist (`COMPLETE-WEBSITE-AUDIT.md` §7).

## 3. Configure the property (do on day 1; some settings are not retroactive)

| Setting | Where | Value | Why |
|---|---|---|---|
| **Data retention** | Admin → Data collection and modification → Data retention | **14 months** | Standard properties can choose only 2 or 14 months (<https://support.google.com/analytics/answer/7667196>). Check what the new property shows and set **14 months** explicitly. At 2 months, 90-day comparisons and year-on-year reports in Explorations become impossible. (Standard reports aren't affected by this setting) |
| Key events | Admin → Events (after the first events arrive, within about 24 h) | Mark `generate_lead`, `submit_application` | Conversion counts by landing page and channel |
| Internal traffic | Admin → Data streams → Configure tag settings → Define internal traffic | Office IP(s) → then Data filters → *Internal Traffic* → **Active** | Keeps staff visits out of the reports |
| Search Console link | Admin → Product links → Search Console | Link the property | Adds *Queries* and *Google organic search traffic* reports inside GA4 |
| Google Ads link | Admin → Product links → Google Ads | Link `AW-18024243962`'s account | Optional: imports GA4 key events into Ads |
| Google signals | Admin → Data collection | **Leave off** until the consent decision is made | Signals uses logged-in Google user data |
| Unwanted referrals | Data stream → Configure tag settings → List unwanted referrals | The domains of any payment/OTP pages the forms redirect through (none today) | Prevents self-referrals |

No IP-anonymisation setting is needed: GA4 does not log or store IP addresses.

## 4. Organic traffic tracking

- **Organic Search** is GA4's default channel for Google, Bing, etc. organic visits. No setup needed.
- Reports to use: *Reports → Acquisition → Traffic acquisition* (session default channel group = Organic Search) and *Engagement → Landing page*, with filter *Session default channel group = Organic Search*.
- AI assistants (ChatGPT, Perplexity, Gemini, Copilot) arrive as **Referral**, or as **Direct** when they strip the referrer. The weekly report lists the measurable part by `sessionSource` (`chatgpt.com`, `perplexity.ai`, …). The CRM's own `ai_referral` channel (`lib/marketing/attribution.ts`) counts AI-referred **leads**, independently of GA4.
- `scripts/seo/ga4-report.mjs` reports: organic sessions, users, engagement rate and key events vs the previous period; top organic landing pages; organic lead events by landing page; **organic pages with ≥ 30 sessions and no lead event**; device; city.

## 5. Read access for the scripts

GA4 → **Admin → Property access management → + → Add users** → the service-account email from `GSC-INTEGRATION-GUIDE.md` §2 → role **Viewer** (read-only).
Then set `GA4_PROPERTY_ID` to the numeric property id (Admin → Property details) in `.env.local` and as a GitHub Actions variable.

```bash
GA4_PROPERTY_ID=123456789 node --env-file=.env.local scripts/seo/ga4-report.mjs --days=28
```

## 6. Verification checklist (after install)

1. **Realtime:** open the site in a private window → Reports → Realtime shows 1 user and `page_view`.
2. **DebugView:** a non-production build sends `debug_mode: true`. Production does not, so use the *Google Tag Assistant* extension → Admin → DebugView.
3. Focus a form → exactly **one** `form_start`. Submit it empty → `form_error`.
4. On **staging only** (never production; see memory note "Local tests must not send email"), submit a test application → `submit_application` **and** `submit_loan_application` both appear (Finding 1). Confirm only `submit_application` is marked as a key event.
5. DevTools → Network → filter `collect?` → no request contains a name, email, phone, PAN or Aadhaar.
6. Navigate between two pages without a reload → one `page_view` per navigation, not two.
7. After 48 h: `npm run seo:ga4` returns non-zero organic sessions. Until then, zero means "not measured yet".

**Do not judge results in the first 2–4 weeks.** GA4 has no history before installation, so the first comparisons are against an empty previous period.
