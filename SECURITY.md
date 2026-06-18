# EzyLoan — Security & Secret Rotation Guide

The backend is now **inside the Next.js app** (`app/api/*`). There is no separate
Express/Node server anymore. All admin APIs require a JWT held in an **httpOnly
cookie**; public form endpoints are rate-limited.

## ⚠️ Rotate these secrets before going live

The previous developer knows the old secrets. Changing code does **not** lock
them out — you must rotate every secret. After changing each one, update
`.env.local` on the VPS and restart the app (`npm run build && npm run start`,
or `pm2 restart`).

| Secret | Where to rotate | `.env.local` key |
|---|---|---|
| **MongoDB password** | MongoDB Atlas → Database Access → edit user → new password → update connection string | `DATABASE_URL` |
| **JWT secret** | Generate: `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"` | `JWT_SECRET` *(already replaced with a strong value)* |
| **Cloudinary keys** | Cloudinary dashboard → Settings → Security → rotate API key/secret | `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` |
| **Email (SMTP) password** | Hostinger email account → change password | `SMTP_PASS` |
| **Admin login** | Set `ADMIN_USERNAME` / `ADMIN_PASSWORD`, then run the reset script (below) | `ADMIN_USERNAME`, `ADMIN_PASSWORD` |

Also:
- **GitHub** — remove the old developer's collaborator access; rotate any deploy
  keys / personal access tokens / CI secrets.
- **Old exposed keys** — the DeepSeek key and a Google Gemini key were committed
  in the past. Revoke them in their dashboards (they live in git history).

## Admin accounts — IMPORTANT

The database currently has **4 admin accounts**: `ezyloan`, `EzyLoan`,
`undefined`, and `admin`. Any of these can log in if its password is known.
Keep only the one you control and delete the rest.

```bash
# Reset (or create) the admin in .env.local:
node --env-file=.env.local scripts/reset-admin.mjs

# Reset AND delete every other admin account (recommended for full lockout):
node --env-file=.env.local scripts/reset-admin.mjs --purge-others
```

## What protects the app now

- **httpOnly + Secure + SameSite=lax cookie** for the JWT — not readable by
  JavaScript, so XSS can't steal the token. (`lib/auth.ts`)
- **Every admin API** (`GET /api/contacts`, `/api/loans`, all writes, banner/blog
  uploads) returns **401** without a valid cookie.
- **`/admin` page** redirects to `/login` without a valid token (`middleware.ts`).
- **Rate limiting**: 5 login attempts / 15 min, 20 form submissions / 10 min per
  IP (`lib/rateLimit.ts`).
- Passwords are **bcrypt**-hashed; tokens expire in 24h.

## Local run / deploy

```bash
npm install
npm run build
npm run start        # serves the whole app (frontend + API) on one port
```

`.env.local` holds all server secrets and is gitignored — never commit it.
See `.env.example` for the required keys.
