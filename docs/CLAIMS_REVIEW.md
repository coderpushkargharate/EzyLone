# EzyLoan — Review of financial, marketing & regulatory claims

**Status: awaiting owner / compliance decisions. No claim text was changed in this round.**
Prepared on branch `audit/hardening-seo`. Every quote below was re-read from the code at commit `f1f2a4f`
(file:line). Nothing here is a finding about whether a claim is *true* — that cannot be determined from the code.
It records where the site contradicts itself and what evidence would be needed to keep each statement.

Rules used: no figures, ratings, timelines or regulatory statuses have been invented or "corrected". Where a
replacement wording is offered it only *removes* an unsupported promise or attributes a decision to the lender;
the owner chooses.

---

## 1. Approval timelines — five different promises

| # | Exact text (visible unless noted) | Location |
|---|---|---|
| A1 | "Instant Loan Options for Every Need" / "Choose the best loan for your needs and get instant approval" | `components/Services.tsx:92` (homepage) |
| A2 | H1 "Get Loan Approved in **24 Hours\*** in Odisha", footnote "\*Subject to eligibility & document verification" | `components/HeroSection.tsx:1297` (mobile H1), `:1374` (desktop) |
| A3 | Image alt "Car Loan - Get approved in 24 hours in Odisha" | `components/HeroSection.tsx:1285` |
| A4 | "Get approved in as little as 24 hours\* with our streamlined digital process." | `components/Services.tsx:101` |
| A5 | "Faster processing since you're already our customer. Get approved in just 24 hours." (no asterisk) | `app/car-loan-topup/page.tsx:283` |
| A6 | "Get approved within 48 hours with minimal documentation and digital verification" | `app/car-loan/page.tsx:350` |
| A6b | "Quick Processing\*" — "24-48 hours\* approval" | `app/personal-loan/page.tsx:256` |
| A7 | "\*Preliminary response within 24-48 hours; final approval subject to lender verification." | `app/apply-now/page.tsx:234` (similar 24–48 h wording: `car-loan-balance-transfer:94`, `components/FAQSection.tsx:34`, `lib/chatbot/knowledge.ts:137`) |
| A8 | "Many applications receive a preliminary response within 24–48 hours after all documents are submitted…" | `app/faq/page.tsx:44` |

**Conflict:** "instant" (A1), "24 hours" (A2–A5), "48 hours" / "24-48 hours approval" (A6, A6b), and "*preliminary response* 24–48 hours" (A7–A8).
A1, A5 and A6 promise an *approval* with no qualifier, while the site's own disclosure says that
lenders decide approval.

**Evidence that would support keeping a time-bound approval claim:** written SLA from the partner lenders for the
product, *or* the company's own historical data (e.g. % of applications approved within N hours over a stated
period), retained on file.

**Decision options (owner picks one per row):**
- [ ] Keep, with evidence filed: ______________________ (document / date)
- [ ] Align everything to the FAQ wording (A8): *"preliminary response within 24–48 hours; final approval is the lender's decision"*
- [ ] Remove the time promise entirely

---

## 2. Customer count

| Exact text | Location |
|---|---|
| "Trusted by 10,000+ Customers **Across Odisha**" | `components/HeroSection.tsx:1478` |
| "10,000+ trusted customers **across India**." | `components/Footer.tsx:126` |
| "Trusted by 10,000+ customers **across India**" | `components/Footer.tsx:384` |
| "Over 10,000+ satisfied customers **across India** with 4.9/5 average rating" | `app/car-loan/page.tsx:362` |
| "…10,000+ satisfied customers across India." | `components/Services.tsx:101` |

**Conflict:** same number, two geographies. Also "satisfied"/"trusted" implies something about the customers beyond
a count.
**Evidence:** count of distinct customers (served / loans disbursed — define which) from the CRM, with the date.
- [ ] Number confirmed: ______ as of ______ ; definition: ______ ; geography: Odisha / India

---

## 3. Ratings

| Exact text | Location | Context |
|---|---|---|
| "Google" … "4.8" with 5 stars, linked to the Google review page | `components/HeroSection.tsx:1467–1490` | Homepage review strip |
| `{ number: '4.8/5', label: 'Customer Rating' }` | `app/about/page.tsx:227` | About page |
| "4.9/5 Rating" | `components/Footer.tsx:130` | Every page |
| "…with 4.9/5 average rating" | `app/car-loan/page.tsx:362` | Car loan page |

**Conflict:** 4.8 vs 4.9. The homepage attributes 4.8 to Google; the source of 4.9 is not stated anywhere.
No `AggregateRating`/`Review` structured data exists. Keep it that way unless real, visible reviews back it.
**Evidence:** screenshot of the Google Business Profile rating and review count, dated. Ratings change, so
either show a figure with an "as of" date, or update it on a schedule.
- [ ] Current Google rating: ____ (date ____). Use this one figure everywhere, or remove the number.

---

## 4. Interest rates — the advertised rates fall below the site's own disclosed range

The disclosure page states: *"Rates range from 10% – 28% p.a. and are determined by partner banks/NBFCs…"*
(`app/loan-disclosure/page.tsx:43`, again at `:68`; `/compliance:88`; repeated on most product pages).

| Product | Exact advertised text | Location | Below 10%? |
|---|---|---|---|
| Homepage (all) | "interest rates starting from 8%\* p.a. Subject to lender approval…" / "Starting from 8%\* p.a." | `app/page.tsx:18, 53` | Yes |
| Car loan | "competitive interest rates starting from 7.99%" | `app/car-loan/page.tsx:31, 42, 299, 344` | Yes |
| Property loan | "starting from 8.5% p.a." (table 8.5%–12.0%) | `app/property-loan/page.tsx:96, 140, 203–204` | Yes |
| Commercial vehicle | "from 9.5% p.a.\*" in copy **vs** "Starting From 8.75% p.a.\*" in table | `app/commercial-vehicle-loan/page.tsx:76` vs `:200–202` | Yes (both), and they contradict each other |
| Personal loan | from 10.5% (table 10.5%–18.0%) | `app/personal-loan/page.tsx:25, 213, 316–317` | No |
| Services section | from 10% | `components/Services.tsx:101` | No |
| Disclosure worked example | 14% p.a. reducing | `app/loan-disclosure/page.tsx:89` | No |

**Why it matters:** the disclosure page is the page a regulator or customer will treat as authoritative. Advertised
rates below its stated range contradict it.
**Evidence:** current rate card from each partner lender for each product, with the date. A "starting from"
rate should be one that a partner actually offers for that product.
- [ ] Rate cards collected (lender / product / date): ____________________
- [ ] Either widen the disclosure range to cover every advertised rate, **or** change the advertised rates to fall within it
- [ ] Commercial vehicle: pick 8.75% or 9.5%
- [ ] Re-check every rate on a schedule (owner: ____, every ____ months)

---

## 5. RBI / regulatory wording

| Exact text | Location | Concern |
|---|---|---|
| Footer badge: "RBI Compliant Partner" (shield icon) | `components/Footer.tsx:391` | Can be read as an RBI status, approval or endorsement of EzyLoan |
| `<meta name="rbi-compliant" content="true">` (`'rbi-compliant': 'true'`) | `app/layout.tsx:113, 200` | Non-standard tag that asserts a compliance status; no consumer reads it, but it is a published claim |
| JSON-LD `regulatoryCompliance: ['RBI-DSA-Guidelines', 'IT-Act-2000', 'PMLA-KYC']`, `additionalType: 'DirectSellingAgent'` | `app/layout.tsx:175`, `:174` | Not schema.org properties; asserts compliance with named frameworks |
| SEO keyword "RBI compliant loans" | `app/layout.tsx:47` | Same claim in metadata |
| "We are not an RBI-registered NBFC. All lending activities are performed by our regulated partner institutions." | `app/loan-disclosure/page.tsx:207` | Accurate-sounding disclaimer — keep |

**What this review does *not* decide:** whether any RBI registration, approval or specific guideline applies to the business.
That is a question for compliance counsel, not for the code.
- [ ] Compliance has reviewed each RBI statement above (name / date): ______
- [ ] Footer badge: keep as is / reword so the regulated status is attributed to the partner lenders (for example *"Partner lenders are RBI-regulated"*, if true) / remove
- [ ] Meta tag, JSON-LD `regulatoryCompliance` and the keyword: keep or remove (removing them has no visible effect)

---

## 6. Other items carried over from the audit

- [ ] Default meta/OG description was **changed** in the audit from "Get instant approval… Low interest rates\*" to
  facilitator wording (`app/layout.tsx`). Confirm, or restore only if instant approval can be substantiated.
- [ ] Legal pages' "Last Updated" is pinned to 06 Oct 2026 (`app/compliance`, `app/terms-and-conditions` incl. JSON-LD
  `dateModified`, `app/loan-disclosure`). Confirm the real revision date.
- [ ] `sameAs: []` in `app/layout.tsx`: add the real social profile URLs.

## Sign-off

| Section | Decision | Evidence filed at | Approved by | Date |
|---|---|---|---|---|
| 1 Approval timelines | | | | |
| 2 Customer count | | | | |
| 3 Ratings | | | | |
| 4 Interest rates | | | | |
| 5 RBI wording | | | | |

Once a decision is recorded here, the copy change is a small, mechanical edit. Ask for it with the chosen wording.
