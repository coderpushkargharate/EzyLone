# Route inventory

Generated 2026-11-24 from the source tree (`app/`), the live sitemap and a crawl of every URL
(`scripts/seo-crawl.mjs`). "Live" = https://www.ezyloan.co.in before this round; "Local" = this branch's production build.
Re-generate the data with `node scripts/seo-crawl.mjs <baseUrl> out.json`.

## Totals

| | Count |
|---|---|
| Public indexable page routes (static) | 21 (incl. new `/used-car-loan`) |
| Dynamic route | 1 (`/blog/[slug]`, 42 published posts) |
| URLs in sitemap — live / local | 62 / 63 |
| Private / noindex pages | 3 (`/ezyadmin`, `/ezylogin`, `/ThankYouPage`) |
| Permanent redirects | 4 (apex→www, `/blog`, `/terms`, `/privacy`) |
| API route files | 86 |
| Broken internal links — live / local | 0 / 0 |

## Public pages

H1, title length (with brand suffix), description length and structured-data types are from the **local** build.

| Path | Live HTTP | Local HTTP | Indexable | H1 | Title len | Desc len | JSON-LD | Inbound links |
|---|---|---|---|---|---|---|---|---|
| `/` | 200 | 200 | yes | Get Loan Approved in 24 Hours* in Odisha | 50 | 145 | FinancialProduct | 63 |
| `/about` | 200 | 200 | yes | About EzyLoan – Loan Facilitator in Cuttack, Odisha | 53 | 146 | BreadcrumbList | 63 |
| `/apply-now` | 200 | 200 | yes | Apply for a Car, Personal or Property Loan with EzyLoan | 59 | 159 | BreadcrumbList | 63 |
| `/blogs` | 200 | 200 | yes | EzyLoan Blog | 50 | 155 | BreadcrumbList, ItemList | 63 |
| `/personal-loan` | 200 | 200 | yes | Fulfill Your Dreams with Personal Loans | 63 | 158 | BreadcrumbList, FinancialProduct, FAQPage | 63 |
| `/car-loan` | 200 | 200 | yes | New Car Loans: Turn Your Dream Into Reality | 56 | 157 | BreadcrumbList | 63 |
| `/used-car-loan` | — (new) | 200 | yes | Used Car Loan in Odisha | 57 | 150 | BreadcrumbList, LoanOrCredit | 63 |
| `/car-loan-balance-transfer` | 200 | 200 | yes | Car Loan Balance Transfer: Lower Your Monthly EMI | 62 | 159 | BreadcrumbList, LoanOrCredit | 63 |
| `/car-loan-refinance` | 200 | 200 | yes | Take control of your finances with EzyLoan's Car Refinance Loan! | 57 | 150 | BreadcrumbList, LoanOrCredit | 63 |
| `/car-loan-topup` | 200 | 200 | yes | Car Loan Top-Up | 62 | 157 | BreadcrumbList, LoanOrCredit | 63 |
| `/commercial-vehicle-loan` | 200 | 200 | yes | Commercial Vehicle Loans to Accelerate Your Business Growth | 57 | 158 | BreadcrumbList, LoanOrCredit | 63 |
| `/property-loan` | 200 | 200 | yes | Property Loans & Loan Against Property | 59 | 155 | BreadcrumbList, LoanOrCredit | 63 |
| `/emi-calculator` | 200 | 200 | yes | EMI Calculator | 57 | 147 | BreadcrumbList, FinancialProduct, FAQPage | 63 |
| `/lending-partners` | 200 | 200 | yes | Our Banking Partners | 42 | 141 | BreadcrumbList | 63 |
| `/careers` | 200 | 200 | yes | Build Your Career With EzyLoan | 54 | 150 | BreadcrumbList | 63 |
| `/contact` | 200 | 200 | yes | Contact Us | 54 | 146 | BreadcrumbList | 63 |
| `/faq` | 200 | 200 | yes | Frequently Asked Questions | 50 | 150 | BreadcrumbList, FAQPage | 63 |
| `/compliance` | 200 | 200 | yes | Compliance & Disclosure | 42 | 144 | BreadcrumbList | 63 |
| `/loan-disclosure` | 200 | 200 | yes | Loan Disclosure & Terms | 54 | 150 | BreadcrumbList | 63 |
| `/privacy-policy` | 200 | 200 | yes | Privacy Policy | 24 | 148 | BreadcrumbList, PrivacyPolicy | 63 |
| `/terms-and-conditions` | 200 | 200 | yes | Terms & Conditions | 28 | 148 | BreadcrumbList, TermsOfService | 63 |
| `/blog/used-car-loan-india-2026` | 200 | 200 | yes | Used Car Loan in India 2026: Car Age Rules, Documents and Safe Buying  | 51 | 132 | BlogPosting, BreadcrumbList | 5 |
| `/blog/trusted-loan-facilitator-india` | 200 | 200 | yes | What Is a Loan DSA? How EzyLoan Works and How to Spot Fake Loan Agents | 51 | 142 | BlogPosting, BreadcrumbList | 7 |
| `/blog/best-personal-loan-india-2026` | 200 | 200 | yes | How to Compare Personal Loan Offers in 2026: APR, Fees and Fine Print | 51 | 143 | BlogPosting, BreadcrumbList | 6 |
| `/blog/car-loan-top-up` | 200 | 200 | yes | Car Loan Top-Up: How It Works, Eligibility and Top-Up vs Personal Loan | 57 | 131 | BlogPosting, BreadcrumbList | 9 |
| `/blog/car-loan-balance-transfer-lower-emi` | 200 | 200 | yes | Car Loan Balance Transfer: When It Really Lowers Your EMI (With Exampl | 52 | 132 | BlogPosting, BreadcrumbList | 8 |
| `/blog/loan-against-property-guide` | 200 | 200 | yes | Loan Against Property: Eligibility, LTV, Documents and Risks Explained | 55 | 140 | BlogPosting, BreadcrumbList | 6 |
| `/blog/commercial-vehicle-loan-guide` | 200 | 200 | yes | Commercial Vehicle Loan Guide for Truck, Bus and Taxi Owners | 55 | 149 | BlogPosting, BreadcrumbList | 6 |
| `/blog/new-car-loan` | 200 | 200 | yes | New Car Loan Guide: Down Payment, Tenure, Documents and EMI Planning | 53 | 136 | BlogPosting, BreadcrumbList | 2 |
| `/blog/used-car-refinance` | 200 | 200 | yes | Used Car Refinance (Loan Against Car): How It Works and When It Makes  | 53 | 142 | BlogPosting, BreadcrumbList | 10 |
| `/blog/personal-loan` | 200 | 200 | yes | Personal Loan Guide: Eligibility, Documents and How to Avoid Rejection | 53 | 146 | BlogPosting, BreadcrumbList | 5 |
| `/blog/car-loan-top-up-loan-in-puri-odisha-eligibility-documents-benefits-and-process` | 200 | 200 | yes | Car Loan Top-Up Loan in Puri, Odisha: Eligibility, Documents, Benefits | 46 | 137 | BlogPosting, BreadcrumbList | 1 |
| `/blog/property-loans-in-puri-odisha-eligibility-documents-process-and-benefits` | 200 | 200 | yes | Property Loans in Puri Odisha: Eligibility, Documents, Process & Benef | 62 | 126 | BlogPosting, BreadcrumbList | 1 |
| `/blog/property-loans-in-sambalpur-odisha-a-complete-guide-for-homeowners-and-property-owners` | 200 | 200 | yes | Property Loans in Sambalpur Odisha: A Complete Guide for Homeowners an | 44 | 138 | BlogPosting, BreadcrumbList | 1 |
| `/blog/from-listing-to-driveway-the-ultimate-guide-to-getting-an-ezy-used-car-loan-in-odisha` | 200 | 200 | yes | From Listing to Driveway: The Ultimate Guide to Getting an Ezy Used Ca | 96 | 86 | BlogPosting, BreadcrumbList | 1 |
| `/blog/getting-a-personal-loan-in-odisha-the-ultimate-financial-guide-for-2026` | 200 | 200 | yes | Getting a Personal Loan in Odisha: The Ultimate Financial Guide for 20 | 48 | 149 | BlogPosting, BreadcrumbList | 1 |
| `/blog/property-loan-in-rourkela-odisha-complete-guide` | 200 | 200 | yes | Property Loan in Rourkela, Odisha: Complete Guide | 63 | 160 | BlogPosting, BreadcrumbList | 1 |
| `/blog/property-loan-in-cuttack-odisha-eligibility-documents-interest-rates-and-application-process` | 200 | 200 | yes | Property Loan in Cuttack, Odisha: Eligibility, Documents, Interest Rat | 92 | 155 | BlogPosting, BreadcrumbList | 1 |
| `/blog/car-loan-top-up-loan-in-bhubaneswar-odisha-eligibility-benefits-and-process` | 200 | 200 | yes | Car Loan Top-Up Loan in Bhubaneswar, Odisha: Eligibility, Benefits & P | 53 | 152 | BlogPosting, BreadcrumbList | 4 |
| `/blog/car-loan-top-up-loan-in-cuttack-odisha-eligibility-benefits-and-process` | 200 | 200 | yes | Car Loan Top-Up Loan in Cuttack, Odisha: Eligibility, Benefits & Proce | 49 | 141 | BlogPosting, BreadcrumbList | 1 |
| `/blog/car-loan-top-up-loan-in-rourkela-odisha-eligibility-benefits-documents-and-process` | 200 | 200 | yes | Car Loan Top-Up Loan in Rourkela, Odisha: Eligibility, Benefits, Docum | 50 | 153 | BlogPosting, BreadcrumbList | 12 |
| `/blog/how-to-improve-cibil-score-before-loan` | 200 | 200 | yes | How to Improve Your CIBIL Score Before Applying for a Loan | 55 | 131 | BlogPosting, BreadcrumbList | 8 |
| `/blog/how-to-calculate-loan-emi` | 200 | 200 | yes | How to Calculate Loan EMI: Formula, Example and Amortisation Table | 54 | 142 | BlogPosting, BreadcrumbList | 5 |
| `/blog/car-loan-eligibility-by-salary` | 200 | 200 | yes | How Much Car Loan Can I Get on My Salary? Eligibility Explained | 54 | 144 | BlogPosting, BreadcrumbList | 3 |
| `/blog/car-loan-documents-checklist` | 200 | 200 | yes | Car Loan Documents Checklist for Salaried, Self-Employed and Businesse | 45 | 150 | BlogPosting, BreadcrumbList | 3 |
| `/blog/car-loan-interest-rate-factors` | 200 | 200 | yes | What Decides Your Car Loan Interest Rate (and How to Get a Better One) | 51 | 154 | BlogPosting, BreadcrumbList | 5 |
| `/blog/car-loan-prepayment-foreclosure` | 200 | 200 | yes | Car Loan Prepayment and Foreclosure: Charges, Savings and Process | 49 | 152 | BlogPosting, BreadcrumbList | 10 |
| `/blog/car-loan-for-self-employed` | 200 | 200 | yes | Car Loan for Self-Employed: Eligibility, ITR Rules and Documents | 53 | 153 | BlogPosting, BreadcrumbList | 10 |
| `/blog/remove-hypothecation-from-rc-after-car-loan` | 200 | 200 | yes | How to Remove Hypothecation from RC After Your Car Loan Ends | 53 | 147 | BlogPosting, BreadcrumbList | 9 |
| `/blog/personal-loan-with-low-cibil-score` | 200 | 200 | yes | Personal Loan with a Low CIBIL Score: Real Options and Red Flags | 53 | 153 | BlogPosting, BreadcrumbList | 5 |
| `/blog/personal-loan-vs-credit-card` | 200 | 200 | yes | Personal Loan vs Credit Card: Which Is Cheaper to Borrow From? | 57 | 151 | BlogPosting, BreadcrumbList | 5 |
| `/blog/debt-consolidation-loan` | 200 | 200 | yes | Debt Consolidation Loan: Combine EMIs and Pay Less Interest | 57 | 145 | BlogPosting, BreadcrumbList | 8 |
| `/blog/loan-app-fraud-rbi-digital-lending-rules` | 200 | 200 | yes | Loan App Fraud: RBI Digital Lending Rules and How to Stay Safe | 52 | 152 | BlogPosting, BreadcrumbList | 7 |
| `/blog/personal-loan-for-medical-emergency` | 200 | 200 | yes | Personal Loan for a Medical Emergency: Fast, Safe Options Compared | 54 | 154 | BlogPosting, BreadcrumbList | 7 |
| `/blog/loan-against-property-vs-personal-loan` | 200 | 200 | yes | Loan Against Property vs Personal Loan: Which Should You Choose? | 48 | 151 | BlogPosting, BreadcrumbList | 11 |
| `/blog/loan-against-property-for-business` | 200 | 200 | yes | Loan Against Property for Business: Uses, LTV, Documents and Costs | 50 | 156 | BlogPosting, BreadcrumbList | 12 |
| `/blog/property-documents-for-loan-odisha` | 200 | 200 | yes | Property Documents for a Loan in Odisha: RoR, EC, Mutation and More | 49 | 149 | BlogPosting, BreadcrumbList | 13 |
| `/blog/used-commercial-vehicle-loan` | 200 | 200 | yes | Used Commercial Vehicle Loan: Trucks, Tippers and Buses Explained | 51 | 149 | BlogPosting, BreadcrumbList | 10 |
| `/blog/taxi-loan-commercial-car` | 200 | 200 | yes | Taxi Loan Guide: Commercial Car Loans for Cab Drivers and Owners | 52 | 151 | BlogPosting, BreadcrumbList | 4 |
| `/blog/fixed-vs-floating-interest-rate` | 200 | 200 | yes | Fixed vs Floating Interest Rate: Which Is Better for Your Loan? | 51 | 151 | BlogPosting, BreadcrumbList | 10 |
| `/blog/co-applicant-guarantor-loan-eligibility` | 200 | 200 | yes | Co-Applicant vs Guarantor: How They Affect Your Loan Eligibility | 46 | 149 | BlogPosting, BreadcrumbList | 13 |
| `/blog/car-loan-top-up-loan-in-berhampur-odisha-eligibility-benefits-and-application-process` | 200 | 200 | yes | Car Loan Top-Up Loan in Berhampur, Odisha: Eligibility, Benefits and A | 58 | 136 | BlogPosting, BreadcrumbList | 12 |
| `/blog/car-loan-top-up-loan-in-jeypore-odisha-get-extra-funds-against-your-car` | 200 | 200 | yes | Car Loan Top-Up Loan in Jeypore, Odisha – Get Extra Funds Against Your | 84 | 136 | BlogPosting, BreadcrumbList | 12 |
| `/ThankYouPage` | 200 | 200 | no | Thank You! | 30 | 139 | site-wide only | - |
| `/ezylogin` | 200 | 200 | no | Admin Panel | 17 | 222 | site-wide only | - |

Every page also carries the site-wide `FinancialService` (organisation) and `WebSite` JSON-LD from `app/layout.tsx`.

## Redirects and errors

| Path | Status | Target |
|---|---|---|
| `/blog` | 308 | /blogs |
| `/terms` | 308 | /terms-and-conditions |
| `/privacy` | 308 | /privacy-policy |
| `/this-page-does-not-exist` | 404 | — |
| `ezyloan.co.in/*` | 308 | `https://www.ezyloan.co.in/*` (next.config.mjs) |

## Private routes

| Path | Protection |
|---|---|
| `/ezyadmin` | middleware redirects requests without a valid session JWT to `/ezylogin`; every admin API re-checks the session server-side (`lib/auth.ts → requireAuth`). `X-Robots-Tag: noindex`, `Cache-Control: no-store` |
| `/ezylogin` | public login form, `noindex` |
| `/ThankYouPage` | post-submit page, `noindex, follow` |

## API routes

Auth column is a static scan: **session** = the file calls `requireAuth` (for some routes only certain methods, e.g. public `POST /api/leads` but admin-only `GET`); **webhook-secret** = verifies a shared secret/signature; **public** = no auth by design. The HTTP-level suite `npm run test:security` (91 checks) confirms anonymous/forged requests are refused.

| Route | Methods | Auth |
|---|---|---|
| `/api/activities` | GET,POST | session |
| `/api/admin/audit-log` | GET | session |
| `/api/admin/blocked-ips` | GET,POST,DELETE | session |
| `/api/admin/chat-analytics` | GET | session |
| `/api/admin/chatlogs/[id]` | PATCH,DELETE | session |
| `/api/admin/chatlogs` | GET,DELETE | session |
| `/api/admin/ga4` | GET | session |
| `/api/admin/knowledge/[id]` | PUT,DELETE | session |
| `/api/admin/knowledge` | GET,POST | session |
| `/api/admin/push/debug` | GET,POST | session |
| `/api/admin/push/subscribe` | POST | session |
| `/api/admin/push/unsubscribe` | POST | session |
| `/api/admin/search-console` | GET | session |
| `/api/admin/site-health/pagespeed` | GET | session |
| `/api/admin/site-health` | GET | session |
| `/api/admin/traffic` | GET | session |
| `/api/admin/whatsapp-chats/[phone]` | GET,PATCH,POST,DELETE | session |
| `/api/admin/whatsapp-chats/message/[id]` | DELETE | session |
| `/api/admin/whatsapp-chats` | GET | session |
| `/api/admin/whatsapp-status` | GET | session |
| `/api/analytics` | GET | session |
| `/api/auth/login` | POST | public |
| `/api/auth/logout` | POST | public |
| `/api/auth/verify` | GET | session |
| `/api/banners/[id]/order` | PUT | session |
| `/api/banners/[id]` | DELETE | session |
| `/api/banners` | GET,POST | session |
| `/api/blog/[slug]` | GET | public |
| `/api/blogs/[id]` | PUT,DELETE | session |
| `/api/blogs/[id]/status` | POST | session |
| `/api/blogs` | GET,POST | session |
| `/api/blogs/upload` | POST | session |
| `/api/careers/[id]` | DELETE | session |
| `/api/careers/[id]/status` | PUT | session |
| `/api/careers` | GET,POST | session |
| `/api/chat` | POST | webhook-secret |
| `/api/contacts/[id]` | DELETE | session |
| `/api/contacts` | GET,POST | session |
| `/api/content/[id]` | DELETE | session |
| `/api/content` | GET,POST | session |
| `/api/employees/[id]` | PATCH,DELETE | session |
| `/api/employees` | GET,POST | session |
| `/api/form-token` | GET | public |
| `/api/health` | GET | public |
| `/api/integrations` | GET,POST | session |
| `/api/leads/[id]` | GET,PATCH,DELETE | session |
| `/api/leads` | GET,POST | session |
| `/api/leads/sync-email` | POST | session |
| `/api/loans/[id]/documents` | POST,DELETE | session |
| `/api/loans/[id]` | PATCH,DELETE | session |
| `/api/loans/[id]/status` | PUT | session |
| `/api/loans` | GET,POST | session |
| `/api/marketing/analytics` | GET,POST | session |
| `/api/marketing/credentials` | GET,PUT,POST | session |
| `/api/marketing/dashboard` | GET | session |
| `/api/marketing/events/[id]` | GET,POST | session |
| `/api/marketing/events` | GET,POST | session |
| `/api/marketing/export` | GET | session |
| `/api/marketing/google/assets` | POST | session |
| `/api/marketing/google/callback` | GET | session |
| `/api/marketing/google/connect` | GET | session |
| `/api/marketing/google/disconnect` | POST | session |
| `/api/marketing/insights` | POST | session |
| `/api/marketing/meta/assets` | POST | session |
| `/api/marketing/meta/backfill` | POST | session |
| `/api/marketing/meta/callback` | GET | session |
| `/api/marketing/meta/connect` | GET | session |
| `/api/marketing/meta/disconnect` | POST | session |
| `/api/marketing/meta/test-event` | POST | session |
| `/api/marketing/overview` | GET | session |
| `/api/marketing/search` | GET,POST | session |
| `/api/marketing/settings` | PUT | session |
| `/api/marketing/status` | GET | session |
| `/api/marketing/sync-logs` | GET,POST | session |
| `/api/marketing/worker` | POST | session |
| `/api/me/password` | POST | session |
| `/api/me` | GET,PATCH | session |
| `/api/notifications` | GET | session |
| `/api/reports/export` | GET | session |
| `/api/site-tags` | GET | public |
| `/api/testimonials/[id]` | PUT,DELETE | session |
| `/api/testimonials` | GET,POST | session |
| `/api/track` | POST | public |
| `/api/webhook/facebook` | GET,POST | webhook-secret |
| `/api/webhook/lead` | POST | webhook-secret |
| `/api/whatsapp/webhook` | POST | webhook-secret |

Public-by-design endpoints were checked for data exposure: `/api/health` returns only status/time, `/api/site-tags` only the public pixel/GA4 ids, `/api/form-token` a signed anti-spam token, `/api/blog/[slug]` only published posts.
