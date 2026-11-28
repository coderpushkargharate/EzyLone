# Financial & Trust Claims — Management Decision Table (Stage 2, 28 Nov 2026)

**No claim has been changed.** This consolidates `docs/CLAIMS_REVIEW.md` (still the detailed record, with exact
quotes). Every location below was **re-verified in the current code on 28 Nov 2026** (file:line), and items found since are added (R11–R14).

How to read it:
- **Status today** for every row is ⛔ *Unverified*. Nothing here is a finding about whether a claim is **true**; that cannot be determined from code. It records where the site contradicts itself and what evidence would let a statement stay.
- **Recommended safe wording** only *removes* an unsupported promise, or attributes a decision to the lender. Management chooses. If evidence is filed, the original claim can stay.
- Until a row is decided, **new content (including the 105 blogs) will not repeat the claim.** Drafts use only the disclosure-page ranges, marked as subject to lender approval, or no figure at all.

| # | Existing claim (where) | Conflicting claim (where) | Business verification required | Recommended safe wording |
|---|---|---|---|---|
| **R1** | Approval in **24 hours**: homepage H1 "Get Loan Approved in 24 Hours\* in Odisha" (`components/HeroSection.tsx:1308, 1385`); "Get approved in just 24 hours" (`app/car-loan-topup/page.tsx:289`) | "**Instant** Loan Options" (`components/Services.tsx:94`); "within **48 hours**" (`app/car-loan/page.tsx:352`); "**24-48 hours** approval" (`app/personal-loan/page.tsx:257`); "*preliminary response* 24–48 h; final approval subject to lender" (`app/apply-now/page.tsx:276`, `car-loan-balance-transfer:95`, `/faq`, chatbot `lib/chatbot/knowledge.ts:137`) | Written SLA from partner lenders, **or** EzyLoan's own data (% of applications getting a lender decision within N hours, over a stated period) | *"Apply once and compare partner lenders. Many applicants get a preliminary response within 24–48 hours of submitting complete documents; final approval is the lender's decision."* Homepage H1: *"Car, Personal & Property Loans in Odisha"* |
| **R2** | "**10,000+** customers **across Odisha**" (`components/HeroSection.tsx:1489`) | "10,000+ … **across India**" (`components/Footer.tsx:127, 385`, `app/car-loan/page.tsx:364`); "**100K+** Happy Customers" (`app/about/page.tsx:226`); "**Thousands** of satisfied customers" (`app/commercial-vehicle-loan/page.tsx:80`, `app/property-loan/page.tsx:99`) | CRM count of distinct customers, with the definition (enquiries? applications? disbursed loans?), the geography and an "as of" date | One figure everywhere, e.g. *"Over N customers helped since YYYY (as of Mon YYYY)"*, **or** remove the number |
| **R3** | Rating **4.8** (Google, homepage strip `components/HeroSection.tsx`; About `app/about/page.tsx:228`) | **4.9/5** (`components/Footer.tsx:131`, `app/car-loan/page.tsx:364`) | Dated screenshot of the Google Business Profile rating and review count | Show the current Google rating with "(Google, as of Mon YYYY)", or link "Read our Google reviews" with no number. **Never** add `AggregateRating` schema unless reviews are shown on the page |
| **R4** | "Starting from" rates **below** the disclosed range: homepage **8%** (`app/page.tsx:20`); car **7.99%** (`app/car-loan/page.tsx:32, 43, 301, 346`); property **8.5%** (`app/property-loan/page.tsx:97, 141, 204`, repeated in 2 city blog posts); CV **8.75%** (`app/commercial-vehicle-loan/page.tsx:202, 204`); chatbot **8.99%** (`lib/chatbot/knowledge.ts:22`) | Disclosure: "**10% – 28% p.a.**" (`app/loan-disclosure`, repeated on most product pages incl. `about:278`, `apply-now:301`, `car-loan:79`); CV copy says **9.5%** (`app/commercial-vehicle-loan/page.tsx:78`) vs 8.75% in its own table | Current rate card per partner lender per product, dated. A "starting from" rate must be one a partner actually offers for that product | Either (a) widen the disclosure range to cover every advertised rate, with evidence, or (b) remove the per-product "from X%" and say *"Rates are set by the partner lender, typically within 10–28% p.a. (see Loan Disclosure)"*. Choose one CV figure |
| **R5** | Footer badge "**RBI Compliant Partner**" (`components/Footer.tsx:392`); `<meta name="rbi-compliant" content="true">` (`app/layout.tsx:116, 205`); keyword "RBI compliant loans" (`app/layout.tsx:50`); JSON-LD `regulatoryCompliance` (`app/layout.tsx:180`) | "We are **not an RBI-registered NBFC**. All lending … by regulated partner institutions" (`app/loan-disclosure/page.tsx:207`) | **Compliance counsel** sign-off on each RBI statement | Badge: *"Loans from RBI-regulated partner banks & NBFCs"* (if true). Remove the meta tag, keyword and `regulatoryCompliance` (no visible effect). Keep the disclosure sentence |
| **R6** | Homepage cards "Up to **100% Funding**", "**Quick** Approval", "**Low** Rates", "Up to **₹25 Lakh**", "Up to **₹3 Crore**", "**Lowest** EMIs", "**Tax Benefits**", "Lower EMIs", "**Better** Rates" (`components/Services.tsx:46–51`); chatbot "up to 100% funding" (`lib/chatbot/knowledge.ts:74–75, 215`) | Disclosure: amounts, LTV and rates are lender decisions | Partner product sheets for funding %, maximum amounts. "Tax benefits" is tax advice and needs a qualified source | Neutral feature labels: *"Funding as per lender policy"*, *"Loan amount based on eligibility"*, *"Compare partner lenders"*. Remove "Lowest" and "Tax Benefits" unless substantiated |
| **R7** | "Top-Up **up to 200%** of Car Value\*" (`app/apply-now/page.tsx:399`) | No other page states a top-up multiple | Partner-lender top-up product sheet | *"Top-up amount depends on your car's value, repayment track record and lender policy"* |
| **R8** | Top-up "**Same Interest Rate** … **no additional charges**" (`app/car-loan-topup/page.tsx:296`) | Disclosure: processing fee **up to 3% + GST** charged by lenders (`app/loan-disclosure/page.tsx:47, 70`) | Lender confirmation that the top-up carries the same rate and zero fees | *"The rate and any processing fee for a top-up are set by the lender; we show them to you before you accept"* |
| **R9** | "**₹500Cr+** Loans Disbursed" (`app/about/page.tsx:227`) | No other source | Partner-lender disbursal statements (this is the lenders' figure, facilitated by EzyLoan) | Remove, or *"₹X crore in loans facilitated (partner data, as of …)"* |
| **R10** | "**24/7** Customer Support" (`app/about/page.tsx:229`, `app/car-loan/page.tsx:358`, `components/Footer.tsx:394`) | Published hours (R11) | — (contradicted by the business's own hours) | *"Support Mon–Sat, [hours]; WhatsApp messages answered on the next working day"*, or whatever is true |
| **R11** *(new)* | Hours **Mon–Sat 9 AM–7 PM** (`app/contact/page.tsx:83`, `about:665`, `car-loan:429`, `car-loan-balance-transfer:407`) | **9 AM–8 PM** (`components/Footer.tsx:250, 262`; chatbot `lib/chatbot/knowledge.ts:21`); **10 AM–6 PM** (`components/Footer.tsx:313`) | The real office hours (and whether phone/WhatsApp hours differ) | One set of hours, used everywhere including Google Business Profile. Inconsistent NAP/hours weakens local SEO |
| **R12** *(new)* | Public email **care@ezyloan.co.in** (35 code references, incl. schema and legal pages) | **contact@ezyloan.co.in** (16 references, incl. footer/homepage) | Which inbox is monitored for customers | One primary customer email in schema, footer, contact and legal pages (the other can stay as an alias) |
| **R13** *(new)* | Facebook `facebook.com/people/…` (`components/Footer.tsx`) | `facebook.com/ezyloan.co.in` (`components/VoiceAssistant.tsx`); Organization schema `sameAs: []` | The official profile URLs (Facebook, Instagram, LinkedIn, YouTube, Google Business Profile) | Same URLs in footer, voice assistant and `sameAs` |
| **R14** *(new)* | `CIN: [To be added] \| GST: [To be added]` (`app/loan-disclosure/page.tsx:220`, `app/privacy-policy/page.tsx:391`) | — | Registration numbers from the company records | Add the numbers, or remove the empty placeholders. A visible "[To be added]" on a legal page is a trust problem |
| R15 | "Latest Automotive News" — 3 stock-photo cards dated Dec 2024, linking nowhere (`app/about/page.tsx:578–604`) | — | — | Remove, or replace with links to real `/blog` posts |
| R16 | Blog bylines "**EzySEO**" on **12** posts (database content; measured on all 42 live posts: 12 EzySEO, 30 EzyLoan Editorial Team). **The structured data declares it a `Person`**: `app/blog/[slug]/page.tsx:163` types any byline without "team/editorial/ezyloan/staff" as a Person, so Google is told a person named "EzySEO" wrote these posts | Other posts: "EzyLoan Editorial Team" (typed `Organization`) | Who wrote and reviewed them | Change the byline in admin to "EzyLoan Editorial Team" plus a short note on the review process, or to a real, consenting reviewer. Never an invented person. Either way the schema becomes accurate with no code change |

## What will happen after each decision

Each decided row becomes a small, mechanical copy edit, applied everywhere the claim appears (pages, footer, chatbot
knowledge, schema, and any blog post that repeats it). Then `seo-crawl.mjs` plus a text search confirms no old wording is
left. Edits land on a branch for review, never straight to production.

## Sign-off

| Row | Decision: keep with evidence / safe wording / remove / other | Evidence filed at | Approved by | Date |
|---|---|---|---|---|
| R1 Approval time | | | | |
| R2 Customer count | | | | |
| R3 Rating | | | | |
| R4 Interest rates | | | | |
| R5 RBI wording (compliance counsel) | | | | |
| R6 Service-card highlights | | | | |
| R7 Top-up 200% | | | | |
| R8 Top-up same rate / no charges | | | | |
| R9 ₹500 Cr disbursed | | | | |
| R10 24/7 support | | | | |
| R11 Business hours | | | | |
| R12 Email | | | | |
| R13 Social profiles | | | | |
| R14 CIN / GST | | | | |
| R15 About-page news block | | | | |
| R16 Bylines | | | | |
