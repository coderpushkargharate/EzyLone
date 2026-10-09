# EzyLoan — Staging deployment checklist

| | |
|---|---|
| Branch | `audit/hardening-seo` (6 audit commits + `f1f2a4f` staging tooling) on top of `main` = `7b20ef9` |
| Deployed anywhere? | **No.** Nothing has been deployed, no DNS/production setting/credential/DB record changed. |
| Verdict | **Not yet staging-ready → staging is the next step, not production.** All checks that can run without a real staging server PASS on a local, fully isolated staging simulation. The checks that need the real host (nginx headers, HTTPS, Meta/Twilio delivery, Cloudinary, email) are **BLOCKED** until a staging server exists (§6). |

Related: `docs/EZYLOAN_AUDIT_REPORT.md` (what changed and why), `docs/CLAIMS_REVIEW.md` (owner decisions on copy).

---

## 1. Repository state (verified)

- Current branch `audit/hardening-seo`; working tree clean after commit.
- Commits on top of `main` (`7b20ef9`), oldest first:
  `d86adf4` security fixes · `30ac9e4` Next 15.5.27/React 19 upgrade + SEO · `6c28b56` UI/a11y/CLS fixes ·
  `155af10` audit report · `1843053` fail-closed webhooks + trusted client IP · `b0bb941` report corrections ·
  `f1f2a4f` staging tooling (this round) · plus the docs commit that adds this file.
- **No Mongoose model / schema changes** on the branch (`git diff main -- lib/models` is empty) → no data
  migration, and rollback needs no DB step.
- Changes in this round (`f1f2a4f`):
  - `lib/db.ts` + `scripts/{reset-admin,seed-blogs,migrate-blog-status}.mjs`: new **`DATABASE_NAME`** (default
    `mydatabase`, so production behaviour is unchanged). **Why:** the DB name was hard-coded, so a staging
    `DATABASE_URL` pointing at the production cluster with a different DB name in the path *would still have
    written to production data*.
  - `app/api/integrations/route.ts` + `components/admin/AutomationsManager.tsx`: App Secret must be 32 hex chars
    (server 400 + inline error).
  - `scripts/check-env.mjs` (`npm run check:env`), `scripts/test-staging.mjs` (`npm run test:staging`).
  - Comment in `app/api/whatsapp/webhook/route.ts` documenting the nginx `X-Forwarded-Proto` requirement.

## 2. Hosting configuration (what the repo tells us)

The repo contains **no** nginx, PM2 ecosystem, Dockerfile or CI config. The code comments indicate
a **Hostinger VPS, nginx reverse proxy (HTTPS), PM2 running `next start`** (`next.config.mjs:74`, `lib/push.ts`,
`.env.example`). Next.js loads `.env.local` from the app directory at build *and* start. Every item below
marked *verify on server* must be confirmed by whoever has server access.

Requirements found in the code:

| Requirement | Why | Verify |
|---|---|---|
| Node.js ≥ 18.18 (20 LTS recommended) | Next 15.5 | `node -v` |
| `npm ci && npm run build` on the server after every pull | Next 14 → 15 changes `node_modules` and `.next` completely | build output ends with route table |
| nginx `proxy_set_header X-Forwarded-Proto $scheme;` | **Found this round:** Next.js fills `x-forwarded-proto` with `http` when the proxy omits it, so the Twilio signature URL becomes `http://…` and *every* inbound WhatsApp is rejected (403). Verified locally: without the header a correctly signed request → 403; with it → 200. | `test:staging` "valid X-Twilio-Signature" |
| nginx `proxy_set_header Host $host;` | Same signature URL | same |
| Exactly one of: nginx `proxy_set_header X-Real-IP $remote_addr;` + `TRUSTED_IP_HEADER=x-real-ip`, **or** `TRUSTED_PROXY_HOPS=<n>` matching how many proxies append to `X-Forwarded-For` (nginx only → 1; Hostinger CDN + nginx → probably 2, must be measured) | Rate limits, IP blocks, India geo-gate | `test:staging` with `IP_MODE=proxied` |
| HTTPS on staging | `__Host-ezy_session` cookie is `Secure`; Meta/Twilio require https; HSTS `includeSubDomains; preload` is sent | browser login works |
| Staging must not be indexed | `SITE_URL` is hard-coded to production (`lib/seo.ts:3`), so canonicals point to production (good), but staging pages would still be crawlable | nginx `add_header X-Robots-Tag "noindex, nofollow" always;` + HTTP basic auth **excluding** `/api/webhook/` and `/api/whatsapp/webhook` (Meta cannot send basic auth) |

## 3. Environment variables

Where they live: `.env.local` in the staging app directory on the staging server (or the PM2 ecosystem `env`
block if that is how the server is set up — check which). Never in git. **Build-time** variables are inlined
by `npm run build`, so changing them needs a rebuild, not just `pm2 restart`.

**How to verify without displaying any value** (run on the server, in the app directory):

```sh
node --env-file=.env.local scripts/check-env.mjs --target=staging      # on staging
node --env-file=.env.local scripts/check-env.mjs --target=production   # on production (read-only, no connection)
```

It prints names and PASS/FAIL/WARN only, plus a **DB fingerprint** (hash of cluster host + DB name). Run it on
both servers: **the two fingerprints must differ.** Do not use `cat .env.local`, `printenv`, `pm2 env` or
`pm2 show` in shared screens, tickets or chat. They print values.

| Variable | Required? | Build-time? | Staging value | Production | Fail-closed behaviour if wrong |
|---|---|---|---|---|---|
| `DATABASE_URL` | yes | no | **separate** cluster (preferred) or at least separate DB user | existing | app can't start |
| `DATABASE_NAME` | **staging: yes** | no | e.g. `ezyloan_staging` (not `mydatabase`) | leave unset (= `mydatabase`) | check-env FAIL on staging |
| `JWT_SECRET` | yes (≥ 32 chars) | no | new random value, **not** production's | existing | logins fail |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | first boot only | no | staging-only test admin | unchanged | only used when DB has no admin |
| `FORM_GUARD_SECRET` | optional | no | random | optional | defaults to JWT_SECRET |
| `TRUSTED_IP_HEADER` **or** `TRUSTED_PROXY_HOPS` | yes (one) | no | per §2 | per §2 | auto IP-blocking stays **off**, IPs spoofable; logged |
| `WEBHOOK_LEAD_SECRET` | yes (≥ 32 chars) | no | new random | new random, shared with the form tool | `/api/webhook/lead` → 503 |
| `WEBHOOK_LEAD_ALLOW_OPEN` | **must be unset** | no | unset | unset | — |
| `FACEBOOK_APP_SECRET` | yes, *unless* saved in Admin → Automations (DB value wins) | no | the **test** Meta app's secret | the live app's secret | every lead event → 403 + alert |
| `FACEBOOK_ALLOW_UNSIGNED` | **must be unset** | no | unset | unset | — |
| `FACEBOOK_VERIFY_TOKEN` | optional (Admin UI value wins) | no | any | any | handshake 403 |
| `TWILIO_AUTH_TOKEN` | yes if WhatsApp used | no | Twilio **test/sandbox** account | live | inbound webhook → 403 |
| `TWILIO_VALIDATE_SIGNATURE` | must not be `false` | no | `true`/unset | `true`/unset | — |
| `TWILIO_ACCOUNT_SID`, `TWILIO_WHATSAPP_FROM`, `TWILIO_WHATSAPP_TEMPLATE_SID`, `TWILIO_MESSAGING_SERVICE_SID` | if sending | no | sandbox or **unset** (unset = nothing sent) | live | messages skipped |
| `CLOUDINARY_CLOUD_NAME` | yes | **yes** (image optimizer allow-list) | separate Cloudinary account (or at minimum a separate API key + folder) | existing | images from other accounts blocked / uploads fail |
| `CLOUDINARY_API_KEY` / `_SECRET` | yes | no | staging key | existing | uploads/deletes fail |
| `NEXT_PUBLIC_SITE_URL` | yes | **yes** | `https://staging.<domain>` | `https://www.ezyloan.co.in` | wrong links in emails/push |
| `SMTP_HOST/PORT/SECURE/USER/PASS`, `FROM_EMAIL`, `ALERT_EMAIL` | prod yes | no | **unset** (no mail) or a test mailbox; `ALERT_EMAIL` = a test inbox (when unset it defaults to the business Gmail, `lib/email.ts:41`) | existing | mail skipped (logged) |
| `IMAP_*` | optional | no | unset | existing | email-to-lead off |
| `CRM_WEBHOOK_URL` / `CRM_WEBHOOK_SECRET` | optional | no | **unset** or staging CRM — never the production CRM | existing | sync off |
| `VAPID_*`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | optional | public key **yes** | new staging keypair or unset | existing | push off |
| `ANTHROPIC_API_KEY` / `OPENAI_API_KEY`, `CHATBOT_LLM_ENABLED` | optional | no | unset or a capped key | existing | rule-engine only |
| `NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_GOOGLE_ADS_ID`, `NEXT_PUBLIC_GADS_CONVERSION_LABEL` | optional | **yes** | **unset** so test traffic doesn't pollute ads data (note `lib/ads.ts:14` has a hard-coded Google Ads ID fallback) | existing | — |
| `DISABLE_GEO_BLOCK` | optional | no | `false` | `false` | — |
| `PAGESPEED_API_KEY`, `META_GRAPH_VERSION`, `WHATSAPP_DEFAULT_COUNTRY_CODE` | optional | no | as needed | existing | — |

## 4. Staging isolation — required before any test

- [ ] **Database:** separate MongoDB (separate Atlas project/cluster preferred, with its own DB user that has no
  access to the production DB). `DATABASE_NAME` set. `check-env` fingerprints differ between servers.
- [ ] **Never copy production `.env.local` to staging.** Create a fresh file from `.env.example`. Generate new
  `JWT_SECRET`, `WEBHOOK_LEAD_SECRET` and VAPID keys. Use staging-only admin and employee accounts.
- [ ] **Do not run anything from a developer machine whose `.env.local` points at production** (this machine's does).
  The local checks in §6 were run from an isolated copy with a synthetic env and a throwaway database.
- [ ] **Email:** SMTP unset, or a test mailbox. `ALERT_EMAIL` must not be the business inbox, or alerts from
  staging tests will look like real security incidents.
- [ ] **WhatsApp:** Twilio unset or sandbox. Test phone numbers only.
- [ ] **CRM:** `CRM_WEBHOOK_URL` unset or staging CRM.
- [ ] **Meta:** a separate test Meta app/Page (or the Lead Ads Testing Tool against a test Page), with its own App Secret.
- [ ] **Ads/analytics:** pixel and conversion IDs unset.
- [ ] **Search engines:** noindex header + basic auth (§2).

## 5. Step-by-step

**A. Prepare (on the staging server)**
1. `git fetch && git checkout audit/hardening-seo && git rev-parse --short HEAD`. Record the commit.
2. Create `.env.local` per §3/§4. Then `node -v` (≥ 18.18).
3. `node --env-file=.env.local scripts/check-env.mjs --target=staging` → **0 FAIL**. Review each WARN.
   Compare the DB fingerprint with production's (§3).
4. nginx: apply §2 (proto/host headers, client-IP header, TLS, noindex, basic auth with webhook exceptions);
   `nginx -t && systemctl reload nginx`.

**B. Build & start**
5. `npm ci && npm run build`. The build must complete. `CLOUDINARY_CLOUD_NAME` and `NEXT_PUBLIC_*` are read here.
6. `pm2 start npm --name ezyloan-staging -- start -- -p <port>` (or restart the existing staging process).
7. `curl -s https://staging.<domain>/api/health` → `{"status":"OK",…}`.

**C. Automated checks (from any machine, against staging only)**
8. `BASE_URL=https://staging.<domain> npm run test:security` → expect 60/60.
   (Run it **before** saving an App Secret: the "unsigned → 403" cases also prove the missing-secret path.)
9. ```sh
   STAGING_CONFIRM=yes-this-is-staging BASE_URL=https://staging.<domain> IP_MODE=proxied \
   STAGING_ADMIN_USERNAME=… STAGING_ADMIN_PASSWORD=… WEBHOOK_LEAD_SECRET=… TWILIO_AUTH_TOKEN=… \
   npm run test:staging
   ```
   Expect 0 failed. Pass secrets via the shell environment (e.g. `read -s`), not on a logged command line.
   The script refuses `*.ezyloan.co.in` hosts. **It saves a random App Secret**, so re-enter the test app's real
   App Secret afterwards (step 11).
   Because of basic auth, run it from a machine allowed through, or temporarily allow its IP.

**D. Manual checks on staging (browser)**
10. Admin login → each sidebar tab opens with no error. Create/edit/delete a lead, a blog draft (with image
    upload → exercises Cloudinary), a banner, a testimonial with avatar. Upload a loan document to a loan application,
    then delete it. Export leads (CSV). Block and unblock an IP.
11. **Automations → Facebook Lead Ads → Configure:** enter `abc` → inline "App Secret looks wrong" error. Enter the
    test app's 32-char App Secret → Save → card shows Connected. Reload → field shows "(saved — leave blank to keep)".
    Save again with the field blank → still saved. Log in as an employee **without** Automations → no Automations tab.
12. **Meta:** in the test app, set the callback to `https://staging.<domain>/api/webhook/facebook` with the saved
    verify token. Send a lead from the **Lead Ads Testing Tool** → it appears in Lead Management with real field
    data, which requires a valid Page Access Token. Change one character of the saved secret → the next test lead
    is rejected (403 in Meta's delivery log, error in PM2 logs). Restore it.
13. **Twilio sandbox:** point the sandbox "When a message comes in" URL at `https://staging.<domain>/api/whatsapp/webhook`,
    send a WhatsApp message from a test phone → bot reply arrives and the chat appears in WhatsApp Chats.
14. **Client IP:** from a phone on mobile data, submit the contact form. In Lead Management, the lead's IP/country
    must be the phone's public IP and not the proxy's. `curl -H 'X-Forwarded-For: 203.0.113.9'` must not change the
    recorded IP.
15. **Customer flows:** homepage hero form, `/contact`, `/apply-now`, `/careers` application, chatbot, EMI calculator.
    Each submits successfully and shows the thank-you/success state. Test email arrives only in the test mailbox.
16. PM2 logs for 15 minutes: no `SECURITY:` warnings except intended ones, and no unhandled errors.

**E. Sign-off:** fill §6's BLOCKED rows with results. Only when every row is PASS (or consciously waived in
writing) is the branch ready for a production change request.

## 6. Results so far (`f1f2a4f`, 09 Oct 2026)

"Local staging" = the branch exported to a scratch directory, built with `next build`, run with `next start`
against a **throwaway in-memory MongoDB** (`mongodb-memory-server`, nothing persisted) and a **synthetic env**:
random test secrets, SMTP/Twilio sending/CRM/push/LLM unset, `DATABASE_NAME=ezyloan_staging`. The repo's
`.env.local` and production database were **not used** for any test. Outbound side effects observed in the
server logs: none (email, WhatsApp, push and CRM all reported "skipped"). The only external calls were IP-geo
lookups to ipwho.is for documentation-range test IPs (198.51.100.x / 203.0.113.x).

### PASS

| Check | Result | Where |
|---|---|---|
| Branch, commit list, clean tree, full diff reviewed | as in §1 | repo |
| Type-check `tsc --noEmit` | exit 0 | repo |
| Lint `next lint` | 0 errors, 377 warnings (unchanged count, pre-existing style) | repo |
| Unit `npm run test:unit` | 8/8 + 20/20 | repo |
| Chatbot `npm run test:ezysaathi` | 60/60 | repo |
| Production build `next build` | success, shared JS 103 kB | isolated copy, synthetic env |
| `test:security` (unauth/forged cookies/CSRF/webhooks fail closed/headers) | **60/60** | local staging |
| `test:staging`, all 73 checks: admin login/session/logout; App Secret invalid→400 ×3, save, masked reload, masked/blank re-save keeps it; Facebook valid→200, wrong key/tampered/unsigned→403, missing secret→403, verify handshake; employee RBAC (6 × 403, permission change revokes session, automations = read-only, logout); lead webhook none/wrong→401, header/query→200; Twilio missing/forged→403, valid→200; contact/apply-now→201, no token→400, chatbot→200; admin lead/loan/contact/blog/report/analytics APIs incl. `[id]` routes; trusted-IP block/impersonation/prefix-dodge; cleanup | **73/73** | local staging (`IP_MODE=direct`) |
| Browser UI (headless Chrome): App Secret field, inline validation, save, reload state, secret not in page, blank re-save, 360 px no overflow; employee sidebar + `?tab=automations` deep link blocked; contact form typed and submitted → 201 + success message; no JS errors | **22/22** | local staging |
| Env variants (server restarted per config): no `TRUSTED_*` → no auto-block, manual block works, startup warning logged (3/3); `TRUSTED_IP_HEADER=x-real-ip` → honoured, XFF spoof ignored, missing header → no fallback (4/4); no `WEBHOOK_LEAD_SECRET` → 503 even with a header, no `TWILIO_AUTH_TOKEN` → 403 (3/3); `TRUSTED_PROXY_HOPS=1` honeypot auto-block (2/2); `FACEBOOK_APP_SECRET` env-only valid→200 / wrong→403 / unsigned→403 (3/3) | **15/15** | local staging |
| `DATABASE_NAME` isolation: test data landed in `ezyloan_staging`, not `mydatabase` | confirmed by counting documents | local throwaway DB |
| `check-env --target=staging` on the synthetic env | works; reports the expected Cloudinary FAILs (no test account) | local |

### FAIL

| Check | Result | Action |
|---|---|---|
| `check-env --target=production` against **this machine's** `.env.local` (read only, no connection) | **2 FAIL**: neither `TRUSTED_IP_HEADER` nor `TRUSTED_PROXY_HOPS` set; `WEBHOOK_LEAD_SECRET` not set. 1 WARN: `FACEBOOK_APP_SECRET` unset (and the live DB has no saved App Secret, per the earlier round). | Owner sets these on the **server** (§8). The server's real env may differ from this local copy. Re-run there. |

During this round, two real issues were found and fixed. Both now pass: the hard-coded DB name (staging isolation
hazard), and the Twilio `X-Forwarded-Proto` dependency, which is now documented as an nginx requirement. One
first-run Twilio test failure was caused by that header, not by the code.

### BLOCKED — need the real staging server or test accounts

| Check | Blocked because | Unblock by |
|---|---|---|
| nginx forwards `X-Forwarded-Proto`/`Host`; Twilio signature through the real proxy | no staging server | §5 C9 + D13 |
| Trusted client IP through the real proxy chain (`IP_MODE=proxied`), correct `TRUSTED_PROXY_HOPS` value | no staging server; Hostinger CDN layer unknown | §5 C9 + D14 |
| HTTPS, `__Host-` cookie, HSTS, noindex/basic auth on staging | no staging server | §5 D10 |
| Meta delivery (Lead Ads Testing Tool), Graph API fetch of real lead fields | needs public HTTPS URL, test Meta app, Page token | §5 D12 |
| Twilio sandbox round trip | needs public URL + test credentials | §5 D13 |
| Cloudinary uploads/deletes (loan documents, blog images, banners, testimonial avatars) | no test Cloudinary account | §5 D10 |
| Email delivery (welcome, admin notification, security alerts) | deliberately disabled; needs a test mailbox | §5 D15 |
| Careers form, banner/testimonial/content CRUD, lead CSV import/export, email-to-lead IMAP sync, web push, LLM chatbot path | not covered by the automated suites | §5 D10/D15 |
| Login lockout after 5 wrong passwords (only the 10-per-15-min throttle was observed incidentally) | not run deliberately | manual on staging |
| Lighthouse / INP | Lighthouse fails on this machine (NO_NAVSTART) | run PageSpeed against staging |

## 7. Rollback

**Compatibility facts (verified in code):**
- No schema changes, so **no DB rollback is ever needed**. Data written by the new code (saved App Secret,
  blocked IPs, leads) is readable by the old code.
- The code **currently on `main`/production already honours** `FACEBOOK_APP_SECRET`/a saved App Secret and
  `WEBHOOK_LEAD_SECRET`, with the same header names. The new variables (`TRUSTED_*`, `DATABASE_NAME`) are ignored by
  the old code. → **Env changes never need to be rolled back**, and they can be made *before* the deploy.
- Rolling back to `7b20ef9` **reintroduces** the Next 14 critical advisories, the open lead webhook and the spoofable
  IP blocking. Treat rollback as temporary.

**Staging rollback:** `git checkout <previous commit> && npm ci && npm run build && pm2 restart ezyloan-staging`.
The staging DB is disposable. Drop it and recreate it if test data gets in the way.

**Production rollback plan (prepare before the production change, for later approval):**
1. Before deploying: record `git rev-parse HEAD` on the server (expected `7b20ef9`, so verify), `node -v`,
   `pm2 describe <app>` (cwd, script), and back up the nginx site config.
2. Deploy into a **new release directory** (e.g. `…/releases/<commit>`), with its own `npm ci && npm run build`. Then
   point PM2 at it. Next 14 and 15 need different `node_modules`, so keeping only an old `.next` is **not** enough.
3. **Rollback = point PM2 back at the previous release directory and `pm2 restart`** (seconds, no rebuild). If
   the in-place layout is kept instead: `git checkout <recorded commit> && npm ci && npm run build && pm2 restart <app>`
   (several minutes of downtime/risk).
4. Rollback triggers: login or admin tabs broken; public forms not saving; `/api/health` failing; error spike in PM2
   logs; Facebook/Twilio deliveries failing **after** secrets were confirmed correct.
5. Do **not** roll back for "Facebook leads rejected (403)" or "lead webhook 503". Those mean a secret is missing,
   so fix the configuration instead (§8).
6. nginx header changes (§2) are safe for both versions. Keep them on rollback.

## 8. Manual actions before approving production

Only the owner/server admin can do these. None were done by this audit.

1. **Provision staging** (§4): separate DB (and DB user), fresh `.env.local`, test Meta app, Twilio sandbox, test
   Cloudinary account/key, test mailbox, staging subdomain with TLS, noindex and basic auth.
2. **Run §5 end to end on staging** and turn every BLOCKED row in §6 into PASS (or a written waiver).
3. **nginx (staging, then production):** add `X-Forwarded-Proto $scheme`, `Host $host` and either `X-Real-IP $remote_addr`
   (+ `TRUSTED_IP_HEADER=x-real-ip`) or measure the hop count for `TRUSTED_PROXY_HOPS`. Verify with the step 14 test.
4. **Production secrets — can be done before the code deploy, because the current code already uses them:**
   - Set `FACEBOOK_APP_SECRET` (or save it via the new Admin UI after deploy). If set *before* deploying, the
     current code starts verifying signatures immediately. If Facebook leads keep arriving, the secret is proven correct.
   - Generate `WEBHOOK_LEAD_SECRET`, set it on the server **and** in every tool that posts to `/api/webhook/lead`
     (header `x-webhook-secret`). Confirm each tool still delivers.
   - After the deploy, set `TRUSTED_IP_HEADER` or `TRUSTED_PROXY_HOPS`.
   - Then run `check-env --target=production` on the server → 0 FAIL.
5. **Review existing auto-blocks** in Admin → Blocked IPs. Some may be innocent visitors, blocked through spoofed headers before this fix.
6. **Decide the claims** in `docs/CLAIMS_REVIEW.md` (approval times, 10,000+ geography, 4.8 vs 4.9, rates
   below the 10–28% disclosure, RBI wording), with compliance sign-off for the RBI items.
7. **Prepare rollback** (§7 steps 1–2) and schedule the change in a low-traffic window, with someone watching PM2 logs and
   the lead inbox for an hour afterwards.
8. Rotate nothing as part of this deploy unless separately decided. (No secret was exposed by this work.)
9. Approve the production change only after 1–7 are complete. Production deployment itself is a separate,
   explicit decision; this checklist does not authorise it.
