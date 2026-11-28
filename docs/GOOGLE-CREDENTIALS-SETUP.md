# Google Credentials — Secure Setup (Stage 2, 28 Nov 2026)

Two credentials are needed. Both are **read-only** and neither can change the website, Search Console or GA4 data.

| Credential | What it unlocks | Sensitivity | Where it may live |
|---|---|---|---|
| **Service-account JSON key** (`ezyloan-seo-reader`) | Read Search Console and GA4 data | **High**: anyone holding it can read all search and traffic data | One file outside the repo on a trusted machine; a GitHub secret **only if the repo is private** |
| **PageSpeed API key** | Run PageSpeed tests under your quota | Low–medium: misuse burns quota; no data access | Production server env, `.env.local`, GitHub secret |

## ⚠ Read first: two findings from this stage

1. **The GitHub repository `coderpushkargharate/EzyLone` is public** [Measured: anonymous `git ls-remote` succeeds].
   Everything pushed is readable by anyone, including the docs on `origin/feature/marketing-automation` (e.g.
   `SECURITY-AUDIT.md`, `CLAIMS_REVIEW.md`, `COMPLETE-WEBSITE-AUDIT.md`), and for a public repo, Actions logs and artifacts too.
   **Recommendation:** make the repository private (GitHub → Settings → General → Danger zone → Change visibility).
   This is your decision. It changes nothing on the website. Until then, the weekly workflow will not touch Google data (§4),
   and the Stage 2 documents should not be pushed.
2. **A DeepSeek API key was hard-coded in `components/VoiceAssistant.tsx`** from commit `e0e71da` (21 May 2026) until
   `a5d558f` (18 Jun 2026) [Measured: git history]. It's gone from the current code on every branch, but it **remains in
   the public git history**, and while live it was shipped in the browser bundle. **Action: revoke that key in the DeepSeek
   dashboard and create a new one if the service is still used.** I didn't test whether it still works: using a leaked
   credential, even to test it, is not appropriate. Rewriting git history is optional once the key is revoked: revocation is what actually closes the hole.
   A scan of all reachable history found **no other** live-looking secret. The committed `.env.local` versions held only
   public `NEXT_PUBLIC_*` values, and the MongoDB URL in `.env.example` is a `USER:PASSWORD` placeholder.

## 1. Create the service account (Google Cloud)

1. <https://console.cloud.google.com/> → sign in with the Google account that **owns** EzyLoan's Search Console property. Use an account with 2-step verification on.
2. Project picker → **New project** → `ezyloan-seo` (or reuse an existing EzyLoan project).
3. **APIs & Services → Library** → enable **Google Search Console API**, **Google Analytics Data API**, **PageSpeed Insights API**.
4. **IAM & Admin → Service accounts → + Create service account**
   - Name `ezyloan-seo-reader`, description "Read-only SEO reporting (scripts/seo)".
   - **Grant access to project: skip. No project roles.** (Its only access comes from §3 below.)
   - **Grant users access to this service account: skip.**
5. Open the account → **Keys → Add key → Create new key → JSON → Create.** The file downloads **once**. Google keeps no copy.
6. Copy the account email: `ezyloan-seo-reader@<project-id>.iam.gserviceaccount.com`.
7. Optional hardening: **IAM & Admin → Organization policies** (if you have a Google Workspace org): restrict key creation to this project.

## 2. Store the key (Windows machine that runs the reports)

```powershell
# 1. A folder outside any git repository, readable only by you
New-Item -ItemType Directory -Force "$env:USERPROFILE\secrets" | Out-Null
Move-Item "$env:USERPROFILE\Downloads\ezyloan-seo-*.json" "$env:USERPROFILE\secrets\ezyloan-seo-reader.json"
icacls "$env:USERPROFILE\secrets" /inheritance:r /grant:r "$($env:USERNAME):(OI)(CI)F"
# 2. Point the scripts at it (path only; the key itself never goes into .env.local)
Add-Content -Encoding utf8 .env.local "GOOGLE_SA_KEY_FILE=$env:USERPROFILE\secrets\ezyloan-seo-reader.json"
```

Then delete the copy from Downloads and empty the Recycle Bin. Don't email it, put it in chat, Google Drive, WhatsApp, or a
ticket. If it has to move between machines, create a **second key** on the other machine instead of copying the first.

Check it works without exposing it:
```bash
node --env-file=.env.local scripts/seo/gsc-report.mjs performance   # "Setup needed: …" explains any problem
```

## 3. Grant access (least privilege)

| Where | Steps | Role |
|---|---|---|
| Search Console | Property → Settings → Users and permissions → **Add user** → service-account email | **Restricted**. Raise to *Full* only if URL Inspection returns 403 (GSC guide §2.2) |
| Search Console (Domain property) | Same, on `ezyloan.co.in` once added via DNS | Restricted |
| GA4 | Admin → Property access management → **+** → Add users → service-account email | **Viewer** (no "Marketer/Editor/Admin") |

The scripts request only `webmasters.readonly` and `analytics.readonly` scopes, so even a Full role in Search Console can't be used to change anything through them.

## 4. GitHub Actions secrets

**Only after the repository is private.** The workflow checks visibility on every run, and in a public repo it does not pass
the Google key to any step. Adding the secret to a public repo is still unnecessary risk, so don't.

| Name | Type | Value |
|---|---|---|
| `GOOGLE_SA_KEY_JSON` | Secret | Entire JSON file content (Settings → Secrets and variables → Actions → *New repository secret*) |
| `PAGESPEED_API_KEY` | Secret | The PageSpeed key. Safe in a public repo's workflow: PageSpeed data is public |
| `GA4_PROPERTY_ID` | Variable | Numeric property id |
| `GSC_SITE` | Variable (optional) | e.g. `sc-domain:ezyloan.co.in` |

GitHub masks secret values in logs. The scripts never print them, and they redact any secret that appears in an API error (tested).
Repository secrets are not passed to workflows triggered from forks.

## 5. PageSpeed key

GSC guide §6. Restrict it to the **PageSpeed Insights API** only. The website reads it from the **production server
environment** (`PAGESPEED_API_KEY`), not from the admin panel.

## 6. Rotation and revocation

| Event | Action |
|---|---|
| Yearly, or when someone with access leaves | Cloud console → service account → Keys → **Add key** (new) → update `GOOGLE_SA_KEY_FILE` / the GitHub secret → **delete the old key** |
| Key may have leaked (committed, pasted, laptop lost) | **Delete the key immediately** (Keys → 🗑). Check *Cloud Logging → Logs explorer* for `serviceAccount: ezyloan-seo-reader` activity, then create a new key |
| Stop the integration | Remove the user from Search Console and GA4, delete the key, disable the service account |
| PageSpeed key leaked | Credentials → the key → **Regenerate key** (or delete it); update the server env and the secret |

## 7. Never

- Commit a key, or put it in `.env.example`, docs, issues, PR text, commit messages or screenshots.
- Put a key in client-side code or in a `NEXT_PUBLIC_*` variable. Those are shipped to every browser (the DeepSeek incident above).
- Give the service account a project role, or an Owner/Admin/Editor role in Search Console or GA4.
- Use a personal Google account password or OAuth refresh token in automation, where a revocable service account will do.

## 8. Verification checklist

- [ ] Repository visibility decided (private recommended); Stage 2 docs not pushed while it's public
- [ ] DeepSeek key revoked
- [ ] Service account has **no** project roles (IAM page shows none for it)
- [ ] Search Console: service account is *Restricted* (or *Full* only if inspection needed it)
- [ ] GA4: service account is *Viewer*
- [ ] Key file outside the repo, folder ACL limited to you, Downloads copy deleted
- [ ] `git status` shows no `.json` key; `git log --all -- '*.json'` shows only expected files
- [ ] PageSpeed key restricted to PageSpeed Insights API; set in the production server env
- [ ] First `gsc-report.mjs performance` run succeeds and is labelled *Data status: MEASURED*
