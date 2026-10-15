# EzyLoan — Marketing, CRM attribution & analytics: audit and readiness report (15 Oct 2026)

Branch `feature/marketing-automation` (from `audit/hardening-seo` @ `9d19801`). **Nothing has been deployed or
committed.** No live database, credential, DNS or ad account was touched. Every test ran on this machine against a
disposable MongoDB and mocked Meta/Google endpoints. This work builds on `docs/EZYLOAN_AUDIT_REPORT.md` (security,
SEO and performance audit, Next 15 upgrade), which remains valid. That report's route inventory, SEO and security
findings are not repeated here.

**Correction to the brief:** the project uses **MongoDB/Mongoose**, not Prisma/PostgreSQL. It was kept as-is.

## 1. Inventory and status

| Item | Status | Evidence / note |
|---|---|---|
| Public site, 21 indexable routes, metadata, canonicals, sitemap, robots, JSON-LD | **Working, verified earlier** | `EZYLOAN_AUDIT_REPORT.md` §1, §5 |
| Blog CMS: draft → pending → published/rejected/archived, SEO checklist gate, `publishedAt` set once, ISR + revalidation on status change, sitemap = published only, old-slug 301 | **Working, re-reviewed** | `app/api/blogs/[id]/status/route.ts`, `lib/blog.ts`, `app/sitemap.ts`. Only addition: audit log entry on status change. |
| Lead capture (Contact, Apply Now, hero form, `/api/webhook/lead`, chatbot/WhatsApp) | **Working; extended** | Attribution + consent added without changing validation, spam guard or responses. Runtime test: forms → 201. |
| Facebook Lead Ads webhook | **Was broken on Graph failures → fixed** | A Graph API error saved a permanent empty "Unknown Lead". Now a receipt is kept and retried; no lead is created until real data is fetched (test: "Graph outage…"). |
| Meta Pixel | **Double-counted Lead → fixed** | Apply Now and Thank-you both fired `Lead`. Both now share one `eventID`. |
| Meta OAuth / assets / CAPI / insights | **New — code complete, unverified live** | Mocked tests; blocked on credentials and App Review. |
| Google Ads: OAuth / accounts / conversion actions / Data Manager uploads / verification / retraction / spend | **New — code complete, unverified live** | Mocked tests; blocked on credentials and developer token. Retraction of Data-Manager-ingested conversions is unverified. |
| Search Console (performance, URL inspection, sitemaps) | **New — code complete, unverified live** | Mocked tests. |
| GA4 Data API reports + optional GA4 web tag/events | **New — code complete, unverified live** | Tag inert until `NEXT_PUBLIC_GA4_MEASUREMENT_ID` is set. |
| CRM attribution, lifecycle timestamps, conversion ledger, worker | **New — verified** | 217 integration/unit checks + production-build runtime test. |
| Audit log | **New — verified** | Tests confirm entries and that no secrets are stored. |
| Lead scoring, rule-based assignment, stale-lead alerts, follow-up tasks | **Missing — not implemented** | See §8 (P2). `assignedTo` and `followUpDate` already exist on leads; the external EzyLoanCrm writes the same collection, so rules need agreement with that app. |
| UI typography/design-system pass, Lighthouse | **Not done in this round** | Lighthouse is blocked on this machine (`NO_NAVSTART`, earlier report). The new admin screens reuse the existing Tailwind classes, cards and colours. |
| Authenticated admin workflows in a real browser | **Blocked** | No staging DB/accounts. API-level authorization is tested. |

## 2. Bugs found and fixed in this round

| Sev | Bug | Root cause | Fix | Verification |
|---|---|---|---|---|
| P1 | Lead Ads lead lost or empty when the Graph API failed | Lead created with empty fields; retries de-duplicated against it | Receipt queue (`meta_lead_receipts`) with backoff; lead only created after a successful fetch | test "Graph outage… NO empty lead", then "worker retry fetched the lead" |
| P2 | Meta `Lead` counted twice per application | Pixel fired on the form and again on `/ThankYouPage` without an event id | Shared `eventID` via sessionStorage (`lib/marketing/clientAttribution.ts`) | code review; dedup verified in mocked CAPI payload. Browser-level Pixel dedup needs Events Manager on staging |
| P2 | (found during this work) GCLID lost when a lead returned via another channel | Last-touch overwrite | `lastAdClick`, merged per platform | test "later non-Google touch does not erase the Google click id" |
| P2 | (found during this work) acquisition channel overwritten by a later visit | `channel` re-derived from last touch | `channel` = first touch, `lastChannel` separate | test "acquisition channel kept…" |
| P2 | (found during this work) hero form would always send consent = false | `useCallback` missing the `adConsent` dependency (lint warning) | dependency added | lint clean for that rule; runtime HTML check |
| P3 | Meta Graph default version `v21.0` near end of availability | hard-coded default | Default `v25.0` (Graph changelog: available until Jul 2028), still overridable | — |

## 3. Security and authorization
- Every new route calls `requireAuth`. Reads need the `marketing` tab permission; every write, connect, retry,
  retract, backfill, export and setting is `adminOnly`. `test:security` (anonymous/forged-cookie) went from 60 to
  **87 checks, all passing**. The in-process tests cover employee-without-tab → 403, marketing employee
  → read-only, cross-origin POST → 403, and OAuth callback anonymous → 401.
- **Secrets:** tokens are AES-256-GCM encrypted at rest with a server-only key, and no route returns them (test
  asserts no `enc:v1:`/token strings in responses). Logs pass through token/email/phone redaction. Meta Graph calls
  carry `appsecret_proof`.
- **OAuth:** 256-bit state, stored server-side, bound to the admin session, single use, 10-minute life. Google uses
  PKCE S256. Redirect URIs come from env only, and post-login redirects go to a fixed admin path (no open redirect).
  Tests cover forged state, a state from another session, replay, and a bad code (no fake "Connected").
- **Webhook:** existing fail-closed HMAC check kept; 1 MB body cap; unique receipt per leadgen_id (replay/duplicate safe).
- **Exports:** admin only, phone/email masked, no click ids or IPs, CSV formula-injection guard, audited.
- **Permissions matrix** (existing model kept: role `admin`, plus `employee` with per-tab permissions):

| Capability | Admin (owner) | Employee with `marketing` | Employee with `leads` only |
|---|---|---|---|
| View marketing dashboard, Search Console, GA4, conversion log, sync history | ✓ | ✓ | ✗ |
| Connect/disconnect Meta & Google, select assets, CAPI token | ✓ | ✗ | ✗ |
| Change mappings, consent policy, test mode | ✓ | ✗ (read-only view) | ✗ |
| Retry / retract conversions, backfill, run worker, sync spend | ✓ | ✗ | ✗ |
| CSV exports (marketing, Search Console, CRM reports) | ✓ | ✗ | ✗ |
| Audit log, employees, blocked IPs | ✓ | ✗ | ✗ |

  The brief's "marketing manager / CRM manager / sales / read-only" roles map onto per-tab grants (`marketing`,
  `leads`, `analytics`, …). No new role type was introduced, so existing accounts are unaffected.

## 4. Performance (local `next build`, first-load JS)
| Route | Before (`EZYLOAN_AUDIT_REPORT.md` §6.1) | After |
|---|---|---|
| `/` | 149 kB | 151 kB (+2: attribution capture + consent box) |
| `/car-loan` | 156 kB | 157 kB |
| `/blog/[slug]` | 107 kB | 107 kB |
| `/ezyadmin` | 185 kB | 186 kB (Marketing and Audit tabs are lazy-loaded) |
| `/apply-now`, `/contact`, `/emi-calculator` | not recorded before | 141 / 155 / 114 kB |

No new third-party script. GA4 reuses the existing lazy gtag loader and adds nothing unless configured. The worker
runs off the request path. Lighthouse/CrUX: still blocked locally; use PageSpeed Insights after deploy.

## 5. Test results (this machine, final run)
| Suite | Result |
|---|---|
| `npx tsc --noEmit` | PASS |
| `npm run lint` | 0 errors, 375 warnings (baseline 377; none of the remaining warnings are in new files) |
| `npm run build` | PASS |
| `npm run test:marketing` (unit + integration on a disposable mongod, mocked platform APIs) | **217 / 217** |
| `npm run test:marketing-runtime` (production build via `next start`, isolated DB, all outbound integrations blanked) incl. `test:security` | **21 / 21**, security **87 / 87** |
| `npm run test:unit` | 28 / 28 |
| `npm run test:ezysaathi` | 60 / 60 |

What the marketing suite covers: hashing/normalization vs spec; never double-hashing; attribution sanitization; consent
gate incl. withdrawal after queueing; Meta and Google payload validation; response validation; error classification;
ledger idempotency under 12 concurrent writes; repeated status changes; approve → sanction → disburse;
retry/backoff/dead-letter; expired-lease recovery after a worker crash; 3 concurrent workers delivering each event
exactly once; token-expiry handling; test-mode isolation; webhook bad signature, duplicate delivery and Graph outage;
Lead Ads lead_id-only policy; admin authorization; secret non-disclosure; OAuth state CSRF/replay; dashboard counts,
CPL and filters; Search Console/GA4 shaping, caching, property scoping, CSV permissions; audit log contents.

**Not tested:** real Meta/Google APIs (no credentials); real browser interaction with the new admin screens and
forms (HTML render only); emails/WhatsApp (blanked); behaviour behind the production nginx/PM2.

## 6. Files
**New:** `lib/marketing/**` (36 modules), `lib/models/{LeadAttribution,ConversionEvent,MarketingConnection,
MarketingSettings,MetaLeadReceipt,MarketingSupport,AuditLog}.ts`, `lib/audit.ts`, `lib/analytics.ts`,
`app/api/marketing/**` (21 route files), `app/api/admin/audit-log/route.ts`, `components/admin/{MarketingManager,
SearchAnalyticsViews,AuditLogManager}.tsx`, `components/{AttributionCapture,AdConsentCheckbox}.tsx`,
`instrumentation.ts`, `scripts/test-marketing.mjs`, `scripts/test-marketing-runtime.mjs`, `scripts/lib/*`,
`docs/MARKETING_INTEGRATION.md`, `docs/GA4_MEASUREMENT_PLAN.md`, this report.

**Modified (all additive):** `lib/ingest.ts` (lifecycle hook), `app/api/webhook/facebook/route.ts` (receipt queue),
`app/api/{leads,leads/[id],loans,loans/[id],loans/[id]/status,contacts}/route.ts` (hooks / attribution),
`app/api/{employees,employees/[id],blogs/[id]/status,reports/export,integrations}/route.ts` (audit entries),
`app/{apply-now,contact,emi-calculator,ThankYouPage}/page.tsx`, `components/{HeroSection,MetaPixel}.tsx`,
`app/layout.tsx`, `app/ezyadmin/page.tsx`, `lib/{ads,adminTabs}.ts`, `.env.example`, `package.json`,
`scripts/{check-env,test-security}.mjs`. **Removed:** none.

## 7. Database, env, external setup
See `docs/MARKETING_INTEGRATION.md` §4–§7. In short: 11 new collections, all additive, no migration of existing
data, rollback-safe. New env vars are listed with placeholders. Meta App Review/Business Verification, Google OAuth
verification, a Basic developer token, conversion actions, and legal sign-off on the consent text are required.

## 8. Remaining issues (prioritised)
| P | Issue | Next step |
|---|---|---|
| P1 | Integrations unverified against live Meta/Google | Provide credentials on staging; run `MARKETING_INTEGRATION.md` §9 |
| P1 | Consent wording and Lead Ads lead_id policy need legal approval | Legal review of `lib/marketing/consentText.ts`; until then events stay `blocked_consent` (safe) |
| P1 | Authenticated admin flows never exercised in a browser (old and new) | Staging DB + one account per role (carried over from the earlier report) |
| P2 | Lead scoring, rule-based assignment, stale-lead alerts, follow-up reminders not built | Agree rules with the EzyLoanCrm owner (shared `leads` collection), then implement as additive fields/jobs |
| P2 | GA4 has no consent mode; site has no cookie banner (also true for the existing Pixel/Ads tags) | Business decision; hook point documented |
| P2 | Google retraction of Data-Manager uploads unverified | Test on staging with a real conversion |
| P2 | Rate limiter is in-memory (per process), as in the earlier report | Fine for one PM2 instance; move to Mongo/Redis if clustering |
| P3 | Typography/design-system polish, Lighthouse measurement | PageSpeed Insights after deploy; targeted fixes |
| P3 | 375 pre-existing lint warnings | Gradual clean-up |

## 9. Honest summary
The marketing, attribution and reporting layer is implemented end to end inside the existing admin panel and CRM.
It fails closed on consent and credentials, cannot double-upload, never loses a failed event, and passes 217
integration checks plus a production-build runtime test. It is **not production-verified**: no real Meta or Google
account has been connected, and that cannot happen without the owner's credentials and platform approvals. Until
those exist, the panel truthfully shows "Not connected", and no data leaves the CRM.
