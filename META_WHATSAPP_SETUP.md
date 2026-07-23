# Ezyloan — Meta WhatsApp Cloud API (official, direct) setup

Yeh guide batati hai ki **Meta ka official WhatsApp Cloud API** (Twilio ke bina, seedha
Meta se — isliye **sasta**) kaise chalu karein. **Code side sab ready hai** — aapko sirf
Meta dashboard se 6 keys nikaal ke `.env.local` me daalni hain, phir server restart.
Bas — form submit par message + user reply par auto-reply, dono usi Ezy AI brain se.

> Ek saath ki PDF version: **`META_WHATSAPP_SETUP.pdf`** (isi folder me).

---

## Meta Cloud API vs Twilio — kya farq hai?

| | **Meta Cloud API (yeh)** | Twilio (purana) |
|---|---|---|
| Hosting | Meta free host karta hai | Twilio |
| Extra markup | **Nahi** — sirf Meta ka per-message charge | Twilio ka apna ~$0.005/msg markup + fees |
| Kiske paas account | Meta Business + Developer app | Twilio + Meta dono |
| Best for | Cost-conscious, direct | Jaldi setup, multi-channel |

Code dono ko support karta hai. **Jaise hi `META_WHATSAPP_*` keys `.env.local` me hongi,
app apne aap Meta use karega** (Twilio fallback ban jayega). Chahein to `WHATSAPP_PROVIDER=meta`
ya `=twilio` se force bhi kar sakte hain.

---

## Aapko kya chahiye (prerequisites)

1. **Facebook/Meta account** (personal — isse Business Manager banega).
2. **Ek phone number** jo abhi kisi WhatsApp / WhatsApp Business app par active **NA ho**
   (+91 97772 28844 use karna hai to pehle us app se account **delete** karo).
3. Business ke **documents** (GST / company registration / bank statement / utility bill) —
   business verification me Meta maang sakta hai.

---

## Phase 1 — Meta Business Account banao

1. https://business.facebook.com par jao → **Create account**.
2. Business name **Ezyloan**, apna naam, business email daalo.
3. **Business Settings → Business Info** me details bhar do.

---

## Phase 2 — Developer App banao aur WhatsApp add karo

1. https://developers.facebook.com par login → **My Apps → Create App**.
2. Use case: **Other** → App type: **Business** → app ka naam (e.g. `Ezyloan WhatsApp`) +
   apna Business Account select karo.
3. App dashboard me **"WhatsApp" product** dhoondho → **Set up**.
4. Ab dikhega:
   - Ek **test number** (Meta deta hai) + aapka **WhatsApp Business Account (WABA)**.
   - **Phone number ID** aur **WhatsApp Business Account ID** (yeh note kar lo).
   - Ek temporary **access token** (24h) — testing ke liye. Live ke liye Phase 5 wala
     **permanent token** banana hai.

> Test number se aap apne khud ke number ko (allow-list me add karke) turant message
> bhej ke test kar sakte ho — bina business verification ke.

---

## Phase 3 — Apna number add karo (+91 97772 28844)

1. WhatsApp → **API Setup** → **Add phone number**.
2. Display name **Ezyloan**, category, business details bharo.
3. Number **+91 97772 28844** daalo → OTP (SMS/call) se **verify** karo.
   - ⚠️ Number kisi WhatsApp app par active nahi hona chahiye, warna verify fail hoga.
4. Verify hote hi is number ka naya **Phone number ID** milega — wahi env me jayega.

---

## Phase 4 — Business Verification (live sending ke liye zaroori)

Test number se aage jaake real customers ko bhejne ke liye Meta business verify karta hai.

1. **Business Settings → Security Center** (ya **Business Verification**).
2. Documents upload karo: business registration / GST / utility bill / bank statement
   (business ka naam + address match hona chahiye).
3. Review me **kuch ghante se 2–5 din** lag sakte hain.
4. Verify hone par messaging limits badhti hain (1K → 10K → unlimited/day).

---

## Phase 5 — Permanent access token banao (System User)

Temporary token 24h me expire ho jaata hai. Live ke liye **permanent** chahiye:

1. **Business Settings → Users → System Users → Add** → naam `ezyloan-system`, role **Admin**.
2. Us system user par **Add Assets → Apps** → apni app select → **Full control**.
3. **Generate new token** → app select karo → permissions me tick karo:
   - `whatsapp_business_messaging`
   - `whatsapp_business_management`
4. Token expiry **Never** rakho → **Generate**.
5. Yeh lamba token **copy** karo — ek hi baar dikhega. Yahi `META_WHATSAPP_TOKEN` hai.

---

## Phase 6 — Message Template banao aur approve karao

Form-submit ka **pehla message business-initiated** hota hai → free-text nahi jaa sakta,
ek **approved template** chahiye. (Auto-reply ko template nahi chahiye — wo user ke message
ke 24h window me free-text jaata hai.)

1. **WhatsApp Manager → Account tools → Message templates → Create template**.
   (business.facebook.com/wa/manage/message-templates)
2. Category: **Utility** (ya Marketing). Language: **English** (`en`). Naam: `lead_confirmation`.
3. Body me `{{1}}` = lead ka first name:

   ```
   Hello {{1}}! Thank you for reaching out to Ezyloan. Our team will contact you
   shortly. Ezyloan is a loan facilitator (not a lender) and works with multiple
   Banks/NBFCs. Call +91 6372977626 or visit www.ezyloan.co.in
   ```

4. **Submit** → approve hone me kuch minute se kuch ghante. Template ka **naam** (`lead_confirmation`)
   aur **language** (`en`) env me jayega.

---

## Phase 7 — Webhook configure karo (auto-reply ke liye)

Taaki user message kare to app ko pata chale:

1. App dashboard → **WhatsApp → Configuration**.
2. **Callback URL:** `https://ezyloan.co.in/api/whatsapp/webhook`
3. **Verify token:** koi bhi secret string jo aap chunte ho (yahi `META_WHATSAPP_VERIFY_TOKEN`).
4. **Verify and save** — Meta ek GET check bhejega; code aap se match karke pass kar dega.
5. **Webhook fields → Subscribe → `messages`** (yeh zaroori hai).
6. **App Secret:** App dashboard → **Settings → Basic → App Secret → Show** — copy karo
   (`META_WHATSAPP_APP_SECRET`). Isse inbound message ka signature verify hota hai.

---

## Phase 8 — `.env.local` me 6 keys daalo, restart karo

```env
# --- Meta WhatsApp Cloud API (yeh 6 add karo) ---
META_WHATSAPP_TOKEN=EAAG...            # Phase 5 ka permanent token
META_WHATSAPP_PHONE_NUMBER_ID=1234567890   # Phase 3 ka phone number ID
META_WHATSAPP_VERIFY_TOKEN=meraSecret123   # Phase 7 me jo string chuni
META_WHATSAPP_APP_SECRET=abcd1234...       # Phase 7 App Secret
META_WHATSAPP_TEMPLATE_NAME=lead_confirmation   # Phase 6 template naam
META_WHATSAPP_TEMPLATE_LANG=en                  # template language

# optional: dono config ho to Meta ko force karna ho
# WHATSAPP_PROVIDER=meta

# ANTHROPIC_API_KEY / DATABASE_URL pehle jaise (smart replies + memory ke liye)
```

Server **restart** karo. Bas ho gaya:
- Form submit → Ezyloan number se **template message** user ko jayega.
- User reply kare → **Ezy AI auto-reply** (website jaisa dimaag) usi number se jayega.

> WHATSAPP_DEFAULT_COUNTRY_CODE=91 pehle se set hai (10-digit numbers ko +91 lagata hai).

---

## Plan aur Pricing (Meta) — approx

**Koi monthly "plan"/subscription fee nahi** hoti. Meta **per-message** charge karta hai
(1 July 2025 se conversation-based se per-message model). Cloud API **hosting free** hai.
Bas WABA me ek **payment method** (card) add karna hota hai — **Business Settings →
WhatsApp Accounts → [WABA] → Payment settings**.

Message **categories** (rate isi par depend karta hai):

| Category | Kab | India approx (per message, USD) |
|---|---|---|
| **Service** | User ne pehle message kiya (24h window) — auto-reply | **Free** |
| **Utility** | Order/lead update; open window me | Free ya ~$0.0014 |
| **Authentication** | OTP | ~$0.0014 |
| **Marketing** | Promo / business-initiated | ~$0.0107–0.014 |

**Ezyloan ke liye matlab:**
- **User ke reply par auto-reply = FREE** (service window).
- **Form-submit confirmation (template)** = Utility category → **bahut sasta** (~1 paisa/msg
  ke aas-paas), free window me aksar free.

> ⚠️ Rates time ke saath badalte hain aur India-specific hain. **Official rate card zaroor
> check karein:** https://developers.facebook.com/docs/whatsapp/pricing
> Billing dashboard: WhatsApp Manager → **Insights / Billing**.

**BSP ki zaroorat nahi:** Meta Cloud API seedha use karne par kisi third-party (Twilio,
Gupshup, etc.) ka monthly fee nahi lagta — sirf Meta ka upar wala per-message charge.

---

## Test karke confirm karo

1. Kisi test number se website form bharo → server log me `✅ Meta WhatsApp sent …` +
   us number par template message aana chahiye.
2. Us number se apne Ezyloan WhatsApp par message bhejo → **auto-reply** aana chahiye.
3. Admin → **Ezy AI Brain → Needs Training → WhatsApp** tab me woh sawaal dikhega jise bot
   confidently answer nahi kar paaya — ek click "Teach" se bot ko sikha do.

---

## AI training — website jaisa, WhatsApp ke liye bhi

WhatsApp aur website **ek hi Ezy AI brain** use karte hain. Jo aap **Admin → Ezy AI Brain**
me sikhाते ho, wo dono jagah lagu hota hai. Needs Training tab me ab **Website / WhatsApp**
filter hai — WhatsApp ke un-answered sawaal alag dekh ke train kar sakte ho.

---

## Common errors (log me dikhte hain)

| Meta code | Matlab | Fix |
|---|---|---|
| `190` | Access token invalid/expired | Phase 5 ka permanent token dobara banao |
| `131047` | 24h window band; free-text nahi ja raha | Template use ho raha hai — `META_WHATSAPP_TEMPLATE_NAME` set karo |
| `131030` | Recipient allow-list me nahi (test number) | Number add karo ya live/verified number use karo |
| `132000/132001` | Template naam/params mismatch ya approve nahi | Template approve hone do; naam+lang env se match karao |
| Webhook verify fail | Verify token mismatch | `.env.local` ka `META_WHATSAPP_VERIFY_TOKEN` = dashboard wala token |
