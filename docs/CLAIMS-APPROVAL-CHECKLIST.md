# Financial Claims — Final Management Approval Checklist (Stage 2, 28 Nov 2026)

Use this to record decisions. Details and exact quotes with file:line are in `CLAIMS-MANAGEMENT-REVIEW.md` (R1–R16);
the original record is `CLAIMS_REVIEW.md`. **No claim has been changed.** Nothing changes until a row is signed.

## How to decide each row

For every row, tick **one** option:
- **A. Keep as is**: only with evidence filed (standard below).
- **B. Use the safe wording**: the neutral text in `CLAIMS-MANAGEMENT-REVIEW.md`, or your edited version written in the row.
- **C. Remove** the claim.

**Evidence standard for A:** a document (not a recollection), dated within the last 6 months (ratings: within 1 month),
naming its source (lender rate card, CRM export, Google Business Profile screenshot, legal opinion), and saved where the
team can find it again (write the location). A claim kept under A gets a **re-check date**.

**Who signs:** Owner/Director for business facts. **Compliance counsel** for anything regulatory (R5, and R4 if the disclosure range changes). **Chartered accountant** for tax (R6 "Tax Benefits").

**Where every decision is applied** (all of them, in one change, so the site stops contradicting itself): page copy ·
footer/header · homepage cards · chatbot knowledge (`lib/chatbot/knowledge.ts`) · structured data and meta tags (`app/layout.tsx`) ·
any blog post that repeats the claim · `llms.txt`. A text search after the edit must find no old wording.

## Checklist

| # | Claim | A Keep (evidence + location + re-check date) | B Safe wording | C Remove | Signed by (role) | Date |
|---|---|---|---|---|---|---|
| R1 | Approval time ("instant" / "24 hours" / "48 hours" / homepage H1) | ☐ Lender SLA or own approval-time data: ____ | ☐ "preliminary response within 24–48 h of complete documents; approval is the lender's decision" | ☐ | Owner | |
| R2 | Customer count (10,000+ Odisha vs India; 100K+; "thousands") | ☐ CRM count ____ as of ____; definition ____; geography ____ | ☐ one figure with "as of" date | ☐ | Owner | |
| R3 | Rating (4.8 vs 4.9) | ☐ GBP screenshot dated ____ showing ____ | ☐ "Read our Google reviews" link, no number | ☐ | Owner | |
| R4 | "Starting from" rates (8%, 7.99%, 8.5%, 8.75%/9.5%, chatbot 8.99%) vs disclosure 10–28% | ☐ Rate cards per lender/product dated ____ **and** a disclosure-range update approved by compliance | ☐ "Rates set by the lender, typically 10–28% p.a. (see Loan Disclosure)" | ☐ | Owner + Compliance | |
| R4a | Commercial vehicle: 8.75% **or** 9.5% | ☐ 8.75% ☐ 9.5% (evidence ____) | ☐ as R4-B | ☐ | Owner | |
| R5 | RBI wording: footer badge, `rbi-compliant` meta, `regulatoryCompliance` JSON-LD, keyword | ☐ Legal opinion dated ____ | ☐ "Loans from RBI-regulated partner banks & NBFCs" (if true); remove meta/JSON-LD/keyword | ☐ | **Compliance counsel** | |
| R6 | Homepage cards (100% funding, ₹25 L, ₹3 Cr, "Lowest EMIs", "Tax Benefits", "Better Rates") + chatbot "100% funding" | ☐ Partner product sheets ____; tax: CA note ____ | ☐ neutral feature labels | ☐ | Owner (+ CA for tax) | |
| R7 | "Top-up up to 200% of car value" | ☐ Partner product sheet ____ | ☐ "depends on car value, track record and lender policy" | ☐ | Owner | |
| R8 | Top-up "same rate, no additional charges" | ☐ Lender confirmation ____ | ☐ "rate and fee set by the lender, shown before you accept" | ☐ | Owner | |
| R9 | "₹500 Cr+ disbursed" | ☐ Partner disbursal statements ____ | ☐ "₹X crore facilitated (as of ____)" | ☐ | Owner | |
| R10 | "24/7 support" | ☐ (contradicted by published hours: needs a real 24/7 service) | ☐ actual hours | ☐ | Owner | |
| R11 | Business hours (9–7 vs 9–8 vs 10–6) | Correct hours: ____ (phone ____ / WhatsApp ____) | — | — | Owner | |
| R12 | Customer email (care@ vs contact@) | Primary: ☐ care@ ☐ contact@ | — | — | Owner | |
| R13 | Official social profiles (`sameAs`) | Facebook ____ · Instagram ____ · LinkedIn ____ · YouTube ____ · GBP ____ | — | — | Owner | |
| R14 | CIN / GST "[To be added]" on legal pages | CIN ____ · GST ____ | — | ☐ remove placeholders | Owner (+ Compliance) | |
| R15 | About page "Latest Automotive News" (stock photos, Dec 2024) | — | ☐ link real blog posts | ☐ | Owner | |
| R16 | Byline "EzySEO" on 12 posts (declared a Person in schema) | — | ☐ "EzyLoan Editorial Team" ☐ named real reviewer: ____ (with consent) | — | Owner | |

## Rules that apply until a row is signed

1. New content (the blog batches) repeats **none** of these claims. Figures come only from `/loan-disclosure` and are labelled illustrative.
2. No claim is "corrected" on anyone's assumption, including mine.
3. Unsigned rows are re-listed in every weekly report until decided.

## After sign-off

1. I apply all signed rows in one branch, everywhere listed above, and attach a before/after text diff for each row.
2. `seo-crawl.mjs` + a text search confirm no old wording remains. `npm run build` and the test suites pass.
3. You review the PR. Deployment only with your approval.

## Final sign-off

| | Name | Role | Signature / email confirmation | Date |
|---|---|---|---|---|
| Business facts (R1–R4, R6–R16) | | Owner / Director | | |
| Regulatory wording (R5, R4 range) | | Compliance counsel | | |
| Tax wording (R6 "Tax Benefits") | | Chartered accountant | | |
