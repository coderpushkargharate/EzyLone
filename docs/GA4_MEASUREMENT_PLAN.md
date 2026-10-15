# GA4 measurement plan — ezyloan.co.in

GA4 is **optional** and turns on in one of two ways:
- **Runtime (no rebuild):** save the Measurement ID in Admin → Marketing & Ads → Settings → API keys, or set
  `GA4_MEASUREMENT_ID` in the server env. `components/SiteTags.tsx` fetches `/api/site-tags` (cached 5 min) after the
  page is idle and calls `gtag('config', id)` on the existing gtag.js loader.
- **Build time:** `NEXT_PUBLIC_GA4_MEASUREMENT_ID` is inlined into the layout by `npm run build`. When it is set, it
  takes precedence and the panel value is not used for the tag.

Without either, the site loads only the existing Google Ads tag, exactly as before. Non-production builds send
`debug_mode: true`, so test traffic shows in GA4 DebugView instead of the reports.

**Limitation of the runtime path:** the GA4 config is applied a few seconds after load (when the browser is idle).
Events fired before that, which is rare because forms take longer to fill, reach Google Ads but not GA4. Page views
are sent when the config runs. Use the build-time variable if every early hit matters.

All events go through `trackEvent()` in `lib/analytics.ts`, which:
- drops any parameter whose **key** looks like contact or identity data (name, email, phone, address, PAN, Aadhaar,
  DOB, income, CIBIL, salary, account);
- drops any **value** that looks like an email address or phone number;
- is a no-op when gtag isn't loaded;
- de-duplicates one-per-visit events with a `once` key.

No PII is placed in URLs. The forms POST JSON and redirect to `/ThankYouPage` without query strings.

## Events

| Event | Fires when (actual condition) | Parameters | Where |
|---|---|---|---|
| `page_view` | Every page load (gtag default) | GA4 defaults | `app/layout.tsx` |
| `form_start` | First focus inside a lead form; once per form per tab | `form_id` = `hero` \| `contact` \| `apply_now` | `onFocusCapture` on each `<form>` |
| `form_error` | Client-side validation blocks a submit | `form_id` | Hero, contact, apply-now `validateForm` failure |
| `generate_lead` | Server returned success (2xx) for a hero or contact submission | `form_id`, `loan_type`, `page_type` (hero) | `components/HeroSection.tsx`, `app/contact/page.tsx` |
| `submit_application` | Server returned 201 for an Apply Now application | `form_id`, `loan_type` | `app/apply-now/page.tsx` |
| `calculator_complete` | User changed an EMI input and then paused 2 s; once per visit | `calculator`, `tenure_months` | `app/emi-calculator/page.tsx` |

**Not sent from the browser, on purpose:** qualified lead, approval and disbursal. These happen in the CRM, not on
the website. They are counted from the CRM database (Admin → Marketing & Ads → Dashboard), and when consented they
can be reported to Meta and Google Ads as conversions through the server-side conversion ledger. Sending them to GA4
would require the Measurement Protocol and a stored GA client id. That isn't implemented, because CRM-confirmed
counts are already available without it.

The existing `submit_loan_application` gtag event on Apply Now is unchanged. Only `generate_lead` and
`submit_application` are recommended for marking as **key events** in GA4.

## Consent
The site has no cookie-consent banner today, and the existing Pixel and Google Ads tags already load
unconditionally. GA4 follows the same behaviour. If the business adopts Google Consent Mode or a banner, set the
consent defaults before the `gtag('config', …)` calls in `app/layout.tsx`. That is a legal/business decision and
was left unchanged.

## Validation
1. Save a test property's Measurement ID in the panel (or set it at build time), load the site, then open GA4 → Admin → DebugView.
2. Focus a form → `form_start` once. Submit it empty → `form_error`. Submit it validly on staging →
   `generate_lead` / `submit_application`.
3. On `/emi-calculator`, move a slider and wait 2 s → `calculator_complete`, once.
4. In DevTools → Network, filter `collect?`: no parameter contains an email address, a phone number or a name.
5. After 24–48 h, Admin → Marketing & Ads → **Analytics (GA4)** → "Website funnel events" shows these counts. Zero
   means the event isn't firing yet, or GA4 isn't configured on the site.
