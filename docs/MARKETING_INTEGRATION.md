# Marketing integrations — Meta, Google Ads, Search Console, GA4, CRM attribution

Status: **code complete and tested with mocked platform APIs. Not connected to any real Meta or Google account.**
No credentials were available, so nothing in this document has been verified against live Meta or Google APIs.
Every external call follows the official documentation cited inline in the code. Section 9 gives the exact steps
to verify each one with real accounts.

## 1. What exists (reused) and what was added

| Area | Before | Now |
|---|---|---|
| Lead store | `leads` + `activities`, **shared with the separate EzyLoanCrm app**; de-dup by `sourceMessageId`, then phone/email (`lib/ingest.ts`) | Unchanged. Attribution lives in a **separate** `lead_attributions` collection, so the other app's schema can never drop or clash with it. |
| Lead status / loan pipeline | `Lead.status` (`New … 1. Interested … Converted`); `LoanApplication.status` (`pending/approved/rejected`) + `pipelineStage` (`New/Login/Sanctioned/Disbursed/Rejected/On Hold`) | Unchanged. Hooks *observe* real changes and never modify a lead or loan. |
| Facebook Lead Ads | Webhook with fail-closed signature check and a manual Page token. A Graph API failure saved an **empty "Unknown Lead"** that retries could never repair. | Same webhook and signature policy, plus a unique receipt per `leadgen_id`, a durable retry queue, OAuth page subscription, field mapping, attribution, and backfill. The manual Page token still works as a fallback. |
| Meta Pixel | Browser `Lead` events; Apply Now **and** Thank-you each fired one, double-counting | Both calls share one `eventID` (deduplicated by Meta), and the same id is used by the server-side Conversions API. |
| Google Ads | Browser gtag conversion on the thank-you page (label env-driven) | Unchanged. Added: OAuth, account/conversion-action selection, offline conversion uploads (Data Manager API), status verification, retraction, spend reporting. |
| GA4 / Search Console | None | Search Console performance, URL inspection and sitemaps; GA4 Data API reports; optional GA4 web tag and events (`docs/GA4_MEASUREMENT_PLAN.md`). |
| Jobs / queues | None (PM2 `next start`, no queue service) | MongoDB-backed, lease-based, restart-safe worker started from `instrumentation.ts`, plus a cron-callable endpoint. |
| Audit trail | None | `audit_logs` (admin → Audit Log) for config/credential changes, connect/disconnect, exports, user/permission changes, blog status, and manual conversion actions. |

## 2. How it works

```
website form ─┐ (UTMs, gclid/gbraid/wbraid, fbclid, _fbp/_fbc, Pixel eventID, optional consent box)
Lead Ads ─────┼─► createLeadFromWebhook (existing dedup) ─► lead_attributions (first/last touch, consent)
manual lead ──┘                                         └─► "Lead" conversion queued
Lead status → qualified ──────────────────────────────────► "QualifiedLead"
Loan created / approved|sanctioned / disbursed ───────────► "SubmitApplication" / "ApprovedApplication" / "LoanDisbursed"

conversion_events (UNIQUE idempotencyKey = platform:event:subject[:test])
   └─ worker (every 30 s, lease-based) ─► Meta Conversions API  → sent (events_received matched)
                                      └─► Google Data Manager → submitted → (15 min) requestStatus → accepted / rejected
```

- **Idempotency.** Each (platform, CRM event, lead/loan) pair can exist only once, enforced by a unique index.
  Repeated status changes, webhook redeliveries, concurrent requests and worker restarts cannot create a second
  upload. Event ids are stable: Meta `event_id = ezy_<Event>_<id>` (or the Pixel's id for website leads), Google
  `transactionId = ezy-<Event>-<id>`. Re-sends after a crash are therefore de-duplicated by the platforms too.
- **Consent (fail closed).** Data is sent only when the lead has a recorded `adMeasurement: granted`. That comes
  from the new **optional, unticked** website checkbox, or from a configured Lead Ads disclaimer checkbox. Consent
  is re-checked at **send** time, so a withdrawal after queueing is honoured. Blocked events are kept with status
  `blocked_consent`, never silently dropped. One optional, off-by-default policy applies to Meta Lead Ads leads only:
  send Meta's own `lead_id` and nothing else.
- **Data minimisation.** Only email, phone, first/last name, city/pincode, the lead id (hashed external_id), click
  ids and browser ids leave the CRM, normalized and SHA-256 hashed per platform spec (Meta: digits with country
  code; Google: E.164, gmail dots removed). Loan amounts, income, CIBIL, employment and documents are never read by
  the delivery code. Conversion values are **configured business values**, not customer amounts.
- **Reliability.** 15–20 s timeouts; exponential backoff (30 s → 6 h, rate limits start 10× higher); dead-letter
  after 8 attempts; per-row history; credential errors mark the connection `expired` / `needs_attention` instead of
  retry-storming; manual and bulk retry from the UI.
- **Truthful statuses.** `sent` means Meta counted the event. `submitted` means Google accepted the request.
  `accepted` means Google processed it. None of these mean "attributed to an ad", and the UI says so.
- **Test mode** is on by default for both platforms. Meta events carry `test_event_code` (or are skipped when no
  code is set). Google uses `validateOnly`. Test events use separate idempotency keys, so they never block the real
  event later.

### Why Google uploads use the Data Manager API
Google's offline-conversion guide (checked 14 Oct 2026) states that from **15 June 2026** `UploadClickConversions`
fails for developer tokens with no prior upload history, and directs new integrations to the Data Manager API
(`POST https://datamanager.googleapis.com/v1/events:ingest`, scope `…/auth/datamanager`). Uploads therefore need
**no developer token**. The Google Ads API (developer token) is used only for account and conversion-action
listing, spend reporting, and retractions (`ConversionAdjustmentUploadService`). Retracting a Data-Manager-ingested
conversion by order id through the Google Ads API **has not been verified against a live account**.

## 3. Admin UI — Admin → Marketing & Ads
Permission id `marketing` (assignable to employees; read-only for them). Settings, connections, retries,
retractions, backfills and exports are **admin-only on the server**.

- **Dashboard:** CRM-confirmed funnel (leads → qualified → applications → approvals → disbursals, with rates), by
  source, acquisition channel and campaign; platform-reported spend, CPL, cost per qualified lead and ROAS
  (configured value ÷ spend). Filters: dates, channel, campaign, loan type, lead status. CSV export (admin, contact
  details masked).
- **Search Console / Analytics (GA4):** totals vs previous period, trends, top queries/pages/landing pages,
  countries, devices, search appearance, channel groups, funnel events, URL inspection, sitemap status and submit.
  Cached for 6 h; "Refresh from Google" bypasses the cache (rate-limited).
- **Integrations:** connection health from real API checks, token expiry, missing permissions, webhook/redirect URLs
  to copy, page subscriptions, ad accounts, dataset id + CAPI token, a test event, Lead Ads backfill, account and
  conversion-action selection, queue state, "Process queue now", and "Sync spend now".
- **Conversion log:** every event with status, consent decision, attempts, error, full history, retry/retract.
- **Sync history:** integration log (90 days) and Lead Ads delivery receipts with retry.
- **Settings:** CRM event → Meta event name / Google conversion action / enhanced conversions / value; qualifying
  statuses; consent policy; test mode.

## 4. Database changes (MongoDB, additive only)
No existing collection, document or field is modified or migrated. New collections are created on first use, and
Mongoose creates their indexes at startup:

| Collection | Purpose | Notable indexes |
|---|---|---|
| `lead_attributions` | one row per lead: first/last touch, last ad click, Meta ids, consent + history, lifecycle timestamps | `leadId` unique |
| `conversion_events` | conversion ledger | `idempotencyKey` **unique**; `(status,nextAttemptAt)` |
| `meta_lead_receipts` | Lead Ads replay guard + fetch queue | `leadgenId` **unique** |
| `marketing_connections` | Meta/Google OAuth connection (tokens AES-256-GCM encrypted) | `provider` unique |
| `marketing_settings` | singleton settings | `key` unique |
| `integration_sync_logs` | sync history | TTL 90 days |
| `oauth_states` | single-use OAuth state, bound to the admin session | `state` unique, TTL 10 min |
| `ad_metrics_daily` | platform spend per campaign per day | unique `(provider,accountId,date,campaignId)` |
| `report_cache` | Search Console / GA4 response cache | TTL 6 h |
| `job_leases` | cross-process periodic-job lock | — |
| `audit_logs` | sensitive-action audit trail | TTL ~13 months |

**Rollback of data:** none needed for the old code, which ignores these collections. To remove the feature
completely, drop the collections above. That is optional and destructive, so do it only with explicit approval.

## 5. Environment variables (placeholders only; see `.env.example`)
```
MARKETING_ENCRYPTION_KEY=<32 random bytes, base64>   # REQUIRED before connecting anything; keep stable
MARKETING_PUBLIC_BASE_URL=https://www.ezyloan.co.in   # OAuth redirect origin (defaults to NEXT_PUBLIC_SITE_URL)
MARKETING_WORKER_ENABLED=                              # "false" → use cron + MARKETING_CRON_SECRET
MARKETING_CRON_SECRET=<random>
META_APP_ID=<app id>
META_APP_SECRET=<app secret>                           # or reuse FACEBOOK_APP_SECRET
META_LOGIN_CONFIG_ID=                                  # optional (Facebook Login for Business)
META_GRAPH_VERSION=v25.0
GOOGLE_OAUTH_CLIENT_ID=<client id>
GOOGLE_OAUTH_CLIENT_SECRET=<client secret>
GOOGLE_ADS_DEVELOPER_TOKEN=<token>                     # reporting/account lists only
GOOGLE_ADS_API_VERSION=v25
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX            # optional, build time
```
`node --env-file=.env.local scripts/check-env.mjs --target=production` now reports all of these (names and
status only, never values).

## 6. Meta setup (manual, by the account owner)
1. **App** (developers.facebook.com, type Business) owned by the Business Manager that owns the Page and ad
   account. Add the products **Facebook Login for Business** and **Webhooks**.
2. **Valid OAuth Redirect URI:** `https://www.ezyloan.co.in/api/marketing/meta/callback`.
3. **Permissions** requested: `pages_show_list`, `pages_read_engagement`, `pages_manage_metadata`,
   `pages_manage_ads`, `leads_retrieval`, `ads_read`, `business_management`. Using them with people outside the
   app's roles requires **App Review + Business Verification**. Until then only app admins/developers/testers can
   connect. That is fine here, because the business admin connects their own assets.
4. **Webhooks → Page → `leadgen`**, callback `https://www.ezyloan.co.in/api/webhook/facebook`, with the verify token
   saved in Admin → Automations → Facebook Lead Ads (or `FACEBOOK_VERIFY_TOKEN`). The App Secret must be set
   (already required by the existing webhook).
5. In **Leads Access Manager** (Business Settings → Integrations), allow the app or the connecting user to access
   leads for the Page.
6. **Conversions API:** Events Manager → your dataset (Pixel) → Settings → **Generate access token**. Paste it, and
   the dataset id, in Admin → Marketing & Ads → Integrations. Then set a test event code in Settings → test mode and
   click **Send test event**.
7. If you use Conversion Leads optimisation, map QualifiedLead (etc.) as CRM events. Meta's eligibility guidance
   (≥200 leads/month, stage conversion rate 1–40%, stage within 28 days) is a platform rule, not something the code
   can guarantee.

## 7. Google setup (manual)
1. Google Cloud project → enable **Google Ads API**, **Data Manager API**, **Google Search Console API**, **Google
   Analytics Data API** and **Google Analytics Admin API**.
2. OAuth consent screen (External or Internal), adding the scopes `adwords`, `datamanager`, `webmasters` and
   `analytics.readonly`. Sensitive/restricted scopes need Google verification before non-test users can consent.
3. OAuth client (Web): redirect URI `https://www.ezyloan.co.in/api/marketing/google/callback`.
4. Google Ads **developer token** (API Center). It needs **Basic** access or higher to work on production accounts.
   Test-account-only access cannot read live campaign data.
5. The connecting Google user must have access to the Ads account, a verified Search Console property and the GA4
   property.
6. In Google Ads create **separate "Import → CRM/Other data sources" conversion actions** for QualifiedLead,
   SubmitApplication, ApprovedApplication and LoanDisbursed. Turn on **enhanced conversions for leads** in
   conversion settings if you tick "Enhanced". Don't map "New lead" if the website tag already counts it.
7. Admin → Marketing & Ads → Integrations → Connect Google → List accounts → Use this account. Then Settings → map
   events. Then Search Console / Analytics tabs → load and choose the properties.

## 8. Deployment and rollback
1. Merge to staging first. `npm ci && npm run build`, then `pm2 restart <staging app>`.
2. Set `MARKETING_ENCRYPTION_KEY` (and the Meta/Google vars when ready) **before** connecting. Missing vars only
   disable the new features; existing site, CRM and webhooks behave as before.
3. Run `npm run test:marketing` and `npm run test:marketing-runtime` (needs `MONGOD_BIN`) on a dev machine. On
   staging, run `npm run test:security` against the staging URL.
4. Production: same build/restart. The worker starts with the process. With PM2 **cluster mode**, every instance
   runs it safely, coordinated by DB leases.
5. **Rollback:** point PM2 back at the previous release (or `git checkout <previous> && npm ci && npm run build &&
   pm2 restart`). The old code ignores the new collections. Lead Ads webhooks keep working through the legacy
   manual Page token if one is saved. Before rolling back, process the queue so no events are left pending.

## 9. End-to-end verification with real accounts (not yet done)
| # | Check | Expected evidence |
|---|---|---|
| 1 | Connect Meta | Health pill **Connected**, no missing permissions; Sync history "Connected as …" |
| 2 | Subscribe Page, then Meta **Lead Ads Testing Tool** → create test lead | Sync history "Leadgen webhook: 1 new"; lead appears in Lead Management with source "Facebook Lead Ads"; attribution shows form/ad ids |
| 3 | Re-send the same test lead | "1 duplicate"; still one lead |
| 4 | Dataset + CAPI token + test code → **Send test event** | Events Manager → Test events shows the event |
| 5 | Map Lead to Meta (test mode), submit the website form with the consent box ticked | Conversion log `sent` (TEST); Test events shows a server Lead **deduplicated** with the browser Lead (same event id) |
| 6 | Connect Google → select account → map QualifiedLead (test mode) → mark a consented gclid lead "1. Interested" | Conversion log "TEST (validateOnly): Google validated the request" |
| 7 | Turn test mode off on staging with a real gclid | `submitted` → after ~15 min `accepted`, or `rejected` with Google's reason. Google Ads conversion columns can take up to ~3 h+ and only count attributable clicks. |
| 8 | Search Console / GA4 tabs | Numbers match the Search Console / GA4 UIs for the same dates (allow for data delays) |
| 9 | Revoke the app in Facebook settings → Check now | Status **Expired**, alert email sent; queued events fail as `failed/auth` and can be retried after reconnecting |

## 10. Blockers requiring the business owner
1. **Credentials:** Meta app id/secret, CAPI token, Google OAuth client, developer token, encryption key.
2. **App Review / Business Verification** (Meta) and **OAuth verification** (Google) for production use.
3. **Legal review of the ad-measurement consent text** (`lib/marketing/consentText.ts`, version `ad-measurement-v1`)
   and whether Lead Ads leads may be reported with lead_id only. Both default to the safest option.
4. **Conversion values** per CRM event (Settings): the business value of a qualified lead, disbursal, etc. ROAS
   stays blank until set.
5. **Google conversion actions** must be created in the Ads account. The code cannot create them.
