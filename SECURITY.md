# EzyLoan — Security Notes

The whole app (website + admin + API) is one Next.js app. Hiding the admin URL is
**not** the protection — every privileged API enforces access on the server.

## How access control works

- **Sessions** — login creates a server-side session (`sessions` collection). The
  `HttpOnly`, `Secure`, `SameSite=Lax`, `__Host-` cookie holds a signed token that
  only identifies that session. Logout, password change, disabling/deleting an
  employee or changing their permissions revokes sessions immediately.
- **Authorization** — `lib/auth.ts → requireAuth()` runs in every privileged route.
  Identity, role and permissions are always loaded from the database; nothing the
  browser sends (role, user id, permissions) is trusted. Admins can do everything;
  employees only reach the APIs behind the admin tabs they were granted.
  Admin-only: employees, blocked IPs, careers, report export, integrations config,
  blog publish/reject/unpublish. Unauthenticated → `401`, not allowed → `403`.
- **Login** — generic `Invalid credentials.` for every failure, per-IP and
  per-account rate limits, 15-minute lockout after 5 wrong passwords, timing
  equalisation for unknown usernames, session rotation on login.
- **Public forms** — invisible honeypot, signed form token (no puzzles), per-IP rate
  limit with automatic IP blocking, India geo/phone checks, input validation.
- **Content** — blog HTML is sanitised on save and on render; JSON-LD is escaped;
  visitor input is HTML-escaped in notification emails.

## After any credential leak

1. Pick a new strong admin password (10+ chars, letters + numbers).
2. Put it in `.env.local` on the server as `ADMIN_PASSWORD`, then run:

   ```bash
   node --env-file=.env.local scripts/reset-admin.mjs --purge-others
   ```

   This resets that admin, deletes other **admin** accounts (employees are kept)
   and signs out every session. Or change it in the admin panel:
   Account → Password & Security.
3. Rotate any other secret that may have been exposed: `JWT_SECRET`, MongoDB
   password (`DATABASE_URL`), Cloudinary, SMTP, Twilio, VAPID, AI API keys.

`.env.local` holds all secrets and is gitignored — never commit real values.
See `.env.example` for every supported key.
