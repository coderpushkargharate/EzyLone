# Ezyloan WhatsApp — Sandbox se Production (apne number +91 97772 28844) tak

Yeh guide batati hai ki apne business number se ("Ezyloan" naam se) WhatsApp message
kaise chalu karein. **Code side sab ready hai** — yeh sirf Twilio + Meta ka account
setup hai jo aapko karna hai. Ho jaane par bas `.env.local` me 2 line badalni hain.

---

## ⚠️ Sabse pehle 3 zaroori baatein

1. **Number free hona chahiye:** +91 97772 28844 kisi normal **WhatsApp / WhatsApp
   Business app** par active NAHI hona chahiye. Agar chal raha hai to pehle us app se
   uska account **delete** karo (Settings → Account → Delete my account). Warna Twilio
   me register nahi hoga.
2. **Twilio Trial → Paid:** Trial account se apna business sender register nahi hota.
   Card add karke upgrade karna padega.
3. **Auth token rotate:** Jo token chat me share hua tha use Twilio Console se **rotate**
   karke `.env.local` me update kar lena (security ke liye).

---

## Phase 1 — Twilio account upgrade

1. https://console.twilio.com par login karo (account: **EzyLoan**).
2. Upar banner ya left menu → **Admin → Billing → Upgrade**.
3. Card/UPI add karke account **Upgrade** karo. (Trial hat jayega.)

---

## Phase 2 — Meta (Facebook) Business Manager taiyaar karo

WhatsApp Business number Meta approve karta hai, isliye ek Business Manager chahiye.

1. https://business.facebook.com par jao → **Create Account** (agar pehle se nahi hai).
2. Business ka naam **Ezyloan**, apna naam aur business email daalo.
3. **Business Settings → Business Info** me business verification ke liye details/documents
   ready rakho (GST / company registration / utility bill — Meta maang sakta hai).

> Tip: Display name "Ezyloan" Meta ko approve karna hota hai. Naam aapke business se
> match karna chahiye warna reject ho sakta hai.

---

## Phase 3 — Twilio me WhatsApp Sender register karo

1. Twilio Console → **Messaging → Senders → WhatsApp senders**.
2. **Create new sender** (ya "Sign up for WhatsApp") par click.
3. Embedded signup khulega — yahan:
   - Apna **Meta Business Manager** connect/login karo.
   - **WhatsApp Business Account (WABA)** select ya create karo.
   - Phone number **+91 97772 28844** daalo.
   - Number verify karo: Twilio uspe **OTP** (SMS ya call) bhejega → code daalo.
   - **Display name** = `Ezyloan` set karo.
4. Submit karo. Meta review karega (aam taur par **kuch ghante se 1–3 din**).
5. Status **Online / Approved** hote hi number bhejne ke liye ready hai.

Baad me sender ka status yahin dikhega: Console → Messaging → Senders → WhatsApp senders.

---

## Phase 4 — Message Template banao aur approve karao (on-submit message ke liye)

Business number se **pehla message free-text nahi** ja sakta — ek approved template chahiye.
(Auto-reply ko template nahi chahiye, wo user ke message ke 24h window me free-text jaata hai.)

1. Console → **Messaging → Content Template Builder → Create new**.
2. Type: **Text template**. Category: **Utility** (ya Marketing, jaisa content ho).
3. Language: **English** (ya jo chahiye).
4. Body me variable ke saath likho, `{{1}}` = lead ka first name. Example:

   ```
   Hello {{1}}! 👋 Thank you for reaching out to Ezyloan. Humari team aapse
   jaldi contact karegi. Ezyloan ek loan facilitator hai (lender nahi) aur
   multiple Banks/NBFCs ke saath kaam karta hai.
   📞 +91 6372977626  |  🌐 www.ezyloan.co.in
   ```

5. **Submit for WhatsApp approval**. Approve hone par template ka **Content SID** milega —
   `HX` se shuru hota hai (Content Template Builder me template kholne par dikhega).
6. Wahi `HX…` SID copy karo — Phase 6 me chahiye.

---

## Phase 5 — Inbound auto-reply webhook configure karo

Taaki user message kare to auto-reply jaye:

1. Console → Messaging → Senders → **WhatsApp senders** → apne number **+91 97772 28844**
   par click.
2. **Configuration / Webhook** section me "When a message comes in" set karo:
   - URL: `https://ezyloan.co.in/api/whatsapp/webhook`
   - Method: **HTTP POST**
3. Save.

> Note: Code me signature validation ON hai (`TWILIO_VALIDATE_SIGNATURE=true`), jo
> auth token se verify karta hai. Isliye token rotate karo to `.env.local` update
> karna mat bhulna.

---

## Phase 6 — App me switch karo (sirf yeh, koi code change nahi)

`.env.local` kholo aur badlo:

```env
# sandbox number hatao, apna approved number daalo:
TWILIO_WHATSAPP_FROM=whatsapp:+919777228844

# Phase 4 wala approved template SID daalo:
TWILIO_WHATSAPP_TEMPLATE_SID=HXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Phir dev/prod server **restart** karo. Bas — ho gaya.

- Form submit → Ezyloan number se **template message** jayega.
- User reply kare → **auto-reply** usi number se jayega.

---

## Test karke confirm karna

1. Kisi bhi number se website form bharo → log me `✅ WhatsApp queued …` dikhega aur
   message us number par aa jayega (ab sandbox "join" ki zaroorat nahi).
2. Us number se apne Ezyloan WhatsApp par koi message bhejo → auto-reply aana chahiye.
3. Delivery status kabhi bhi check: Twilio Console → **Monitor → Logs → Messaging**.

---

## Common errors (log me dikhte hain)

| Twilio code | Matlab | Fix |
|-------------|--------|-----|
| `63015` | Sandbox opt-in missing | Sirf sandbox me — recipient ne `join <code>` nahi bheja |
| `63016` | Business number se free-text bheja bina template | `TWILIO_WHATSAPP_TEMPLATE_SID` set karo |
| `20003` | Auth fail | SID/token galat — token rotate ke baad `.env.local` update karo |
| `21608` | Sandbox number allow-list me nahi | Sandbox active karo / number join karao |
