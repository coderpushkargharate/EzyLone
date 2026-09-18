// Language handling for the WhatsApp bot (NO LLM path).
//
// We detect whether the user is writing in Odia, Hindi/Hinglish, or English and
// serve every FIXED controller string (state gate, lead form, thank-you,
// cooldown, EMI hand-off…) in that language. Default is English.
//
// NOTE: free-form Q&A answers come from the self-trained knowledge base / rule
// engine and are returned in whatever language they were authored in — without
// an LLM we cannot translate those on the fly. Admins can train Hindi/Odia
// knowledge entries so those match when a user writes in that language.

export type Lang = 'en' | 'hi' | 'or';

// Distinctive Hinglish (Latin-script Hindi) markers — multi-character so they
// don't false-match English words.
const LATIN_HINDI = [
  'hai', 'hain', 'kya', 'kyaa', 'chahiye', 'chahie', 'kaise', 'kaisa', 'kitna', 'kitne',
  'kitni', 'nahi', 'nahin', 'haan', 'mera', 'meri', 'mujhe', 'aap', 'tum', 'karo',
  'karna', 'karenge', 'kyun', 'kyu', 'kab', 'kaha', 'kahan', 'batao', 'bataye', 'bataiye',
  'samajh', 'milega', 'milegi', 'hoga', 'hogi', 'paisa', 'rupaye', 'rupay', 'byaj',
  'kitna', 'loan chahiye', 'dena', 'lena', 'kaam',
];

// Distinctive Latin-script Odia markers.
const LATIN_ODIA = [
  'kemiti', 'kemity', 'kete', 'achhi', 'achi', 'mote', 'mora', 'kana', 'mun',
  'tuma', 'dhanyabad', 'darakara', 'heba', 'kariba', 'paibi', 'bhala',
];

/**
 * Detect the language of a message, or return null when undetermined (caller
 * then keeps the last known language, defaulting to English). Script detection
 * (Odia / Devanagari) is reliable; Latin heuristics are best-effort.
 */
export function detectLang(text: string): Lang | null {
  const raw = text || '';
  if (/[଀-୿]/.test(raw)) return 'or'; // Odia script
  if (/[ऀ-ॿ]/.test(raw)) return 'hi'; // Devanagari
  const t = raw.toLowerCase();
  const wordHit = (list: string[]) =>
    list.some((w) => new RegExp(`(^|[^a-z])${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z]|$)`, 'i').test(t));
  if (wordHit(LATIN_ODIA)) return 'or';
  if (wordHit(LATIN_HINDI)) return 'hi';
  return null;
}

// The loan types offered as a numbered menu on the loan-type question. Product
// names stay in English (proper nouns) across all languages.
export const LOAN_TYPE_OPTIONS = [
  'Car Loan Top-Up',
  'Balance Transfer + Top-Up',
  'New Car Loan',
  'Used Car Loan',
  'Commercial Vehicle Loan',
  'Personal Loan',
  'Loan Against Property',
];

interface Strings {
  askState: string;
  outOfState: string;
  form: {
    name: string;
    city: string;
    email: string;
    phone: string;
    amount: string;
    loanTypeIntro: string;
  };
  pickHint: string;
  thanksPrefix: (name: string) => string;
  err: {
    name: string;
    city: string;
    email: string;
    phone: string;
    amount: string;
    loanType: string;
  };
  thankYou: (firstName: string, phone: string) => string;
  alreadyNoted: string;
  cooldown: string;
  emi: (url: string) => string;
}

export const T: Record<Lang, Strings> = {
  en: {
    askState:
      `Welcome to *EzyLoan* 🙏 I'm *EzySaathi AI*. Currently we serve in *Odisha*. ` +
      `Before we proceed — which *state* are you from?`,
    outOfState:
      `Thank you for reaching out 🙏\n\nRight now we offer our loan services *only in Odisha*, ` +
      `so we can't take your request forward at the moment. We'll surely contact you once we ` +
      `start in your area. Thank you!`,
    form: {
      name: `Great! 😊 Let's begin — what is your *full name*?`,
      city: `Which *city / district* in Odisha are you from?`,
      email: `Please share your *email id*. (type "skip" to skip)`,
      phone: `Best *mobile number* to reach you? (10 digits)`,
      amount: `How much *loan amount* do you need? (e.g. 5 lakh)`,
      loanTypeIntro: `Last question — which *type of loan* do you need?`,
    },
    pickHint: `_Reply with the number (e.g. 1) or type the name._`,
    thanksPrefix: (n) => `Thanks, ${n}! `,
    err: {
      name: `Please type your full name.`,
      city: `Please type your city / district name.`,
      email: `Please type a valid email (e.g. name@gmail.com), or type "skip".`,
      phone: `Please share a valid 10-digit mobile number.`,
      amount: `Please share an amount, e.g. "5 lakh" or 500000.`,
      loanType: `Please pick a number from the list or type the loan type.`,
    },
    thankYou: (f, p) =>
      `Thank you, ${f}! ✅ Our team has received your details. Our loan specialist will contact ` +
      `you soon on *${p}*.\n\nMeanwhile, if you have any question — EMI, interest rate, documents ` +
      `or process — feel free to ask, I'm right here 😊`,
    alreadyNoted:
      `Your details are already with our team ✅ — they'll contact you soon. Meanwhile I can ` +
      `answer any question (EMI, interest rate, documents, process) 😊`,
    cooldown:
      `For your further questions our team will now assist you *personally* — our specialist will ` +
      `connect with you shortly 🙏 Thank you!`,
    emi: (url) =>
      `🧮 You can calculate your EMI instantly here:\n\n${url}\n\nJust enter loan amount, interest ` +
      `rate and tenure. Need any more help? 😊`,
  },

  hi: {
    askState:
      `*EzyLoan* me aapka swagat hai 🙏 Main *EzySaathi AI* hoon. Filhal hum *Odisha* me services ` +
      `de rahe hain. Aage badhne se pehle bataiye — aap *kis state* se hain?`,
    outOfState:
      `Dhanyavaad aapke sampark ke liye 🙏\n\nFilhal hum apni loan services *sirf Odisha* me de ` +
      `rahe hain, isliye abhi aapki request aage nahi le paa rahe. Jaise hi hum aapke area me ` +
      `shuru karenge, aapko zaroor sampark karenge. Dhanyavaad!`,
    form: {
      name: `Bahut badhiya! 😊 Shuru karte hain — aapka *pura naam* kya hai?`,
      city: `Aap Odisha me *kis city / district* se hain?`,
      email: `Aapki *email id* bataiye. (nahi dena ho to "skip" likhein)`,
      phone: `Aapse sampark ke liye best *mobile number* (10 digit)?`,
      amount: `Aapko kitna *loan amount* chahiye? (e.g. 5 lakh)`,
      loanTypeIntro: `Aakhri sawaal — *kis type ka loan* chahiye?`,
    },
    pickHint: `_Number bhejein (e.g. 1) ya naam type karein._`,
    thanksPrefix: (n) => `Shukriya, ${n}! `,
    err: {
      name: `Kripya apna pura naam likhein.`,
      city: `Kripya apni city / district ka naam likhein.`,
      email: `Kripya sahi email likhein (e.g. name@gmail.com), ya "skip" likhein.`,
      phone: `Kripya sahi 10-digit mobile number dein.`,
      amount: `Kripya amount dein, e.g. "5 lakh" ya 500000.`,
      loanType: `Kripya list me se number chunein ya loan type likhein.`,
    },
    thankYou: (f, p) =>
      `Shukriya ${f}! ✅ Aapki details hamari team ko mil gayi hain. Hamara loan specialist jald hi ` +
      `aapse *${p}* par sampark karega.\n\nTab tak agar aapka koi sawaal ho — EMI, interest rate, ` +
      `documents ya process — to beshak poochiye, main yahin hoon 😊`,
    alreadyNoted:
      `Aapki details already hamari team ke paas hain ✅ — woh aapse jald sampark karenge. Tab tak ` +
      `main aapke kisi bhi sawaal (EMI, interest rate, documents, process) ka jawab de sakta hoon 😊`,
    cooldown:
      `Aapke aur sawaalon ke liye ab hamari team aapse *personally* baat karegi — thodi hi der me ` +
      `hamara specialist aapse connect karega 🙏 Dhanyavaad!`,
    emi: (url) =>
      `🧮 Apni EMI aap turant yahaan calculate kar sakte hain:\n\n${url}\n\nBas loan amount, interest ` +
      `rate aur tenure daaliye. Aur koi help chahiye to bataiye 😊`,
  },

  or: {
    askState:
      `*EzyLoan* କୁ ସ୍ୱାଗତ 🙏 ମୁଁ *EzySaathi AI*। ବର୍ତ୍ତମାନ ଆମେ *ଓଡ଼ିଶା* ରେ ସେବା ଦେଉଛୁ। ` +
      `ଆଗକୁ ବଢ଼ିବା ପୂର୍ବରୁ କୁହନ୍ତୁ — ଆପଣ *କେଉଁ ରାଜ୍ୟ* ରୁ?`,
    outOfState:
      `ଆପଣଙ୍କ ଯୋଗାଯୋଗ ପାଇଁ ଧନ୍ୟବାଦ 🙏\n\nବର୍ତ୍ତମାନ ଆମେ *କେବଳ ଓଡ଼ିଶା* ରେ ଲୋନ ସେବା ଦେଉଛୁ, ` +
      `ତେଣୁ ଏବେ ଆପଣଙ୍କ ଅନୁରୋଧ ଆଗକୁ ନେଇପାରୁନାହୁଁ। ଆପଣଙ୍କ ଅଞ୍ଚଳରେ ଆରମ୍ଭ କଲେ ଆମେ ନିଶ୍ଚୟ ଯୋଗାଯୋଗ କରିବୁ। ଧନ୍ୟବାଦ!`,
    form: {
      name: `ବହୁତ ଭଲ! 😊 ଆରମ୍ଭ କରିବା — ଆପଣଙ୍କ *ପୂରା ନାମ* କ'ଣ?`,
      city: `ଆପଣ ଓଡ଼ିଶାର *କେଉଁ ସହର / ଜିଲ୍ଲା* ରୁ?`,
      email: `ଆପଣଙ୍କ *email id* ଦିଅନ୍ତୁ। (ଦେବାକୁ ନ ଚାହିଁଲେ "skip" ଲେଖନ୍ତୁ)`,
      phone: `ଆପଣଙ୍କ ସହ ଯୋଗାଯୋଗ ପାଇଁ best *mobile number* (୧୦ ଅଙ୍କ)?`,
      amount: `ଆପଣଙ୍କୁ କେତେ *loan amount* ଦରକାର? (ଯେମିତି 5 lakh)`,
      loanTypeIntro: `ଶେଷ ପ୍ରଶ୍ନ — *କେଉଁ ପ୍ରକାର loan* ଦରକାର?`,
    },
    pickHint: `_ନମ୍ବର ପଠାନ୍ତୁ (ଯେମିତି 1) କିମ୍ବା ନାମ ଲେଖନ୍ତୁ।_`,
    thanksPrefix: (n) => `ଧନ୍ୟବାଦ, ${n}! `,
    err: {
      name: `ଦୟାକରି ଆପଣଙ୍କ ପୂରା ନାମ ଲେଖନ୍ତୁ।`,
      city: `ଦୟାକରି ଆପଣଙ୍କ ସହର / ଜିଲ୍ଲାର ନାମ ଲେଖନ୍ତୁ।`,
      email: `ଦୟାକରି ସଠିକ email ଲେଖନ୍ତୁ (ଯେମିତି name@gmail.com), କିମ୍ବା "skip" ଲେଖନ୍ତୁ।`,
      phone: `ଦୟାକରି ସଠିକ ୧୦-ଅଙ୍କ mobile number ଦିଅନ୍ତୁ।`,
      amount: `ଦୟାକରି amount ଦିଅନ୍ତୁ, ଯେମିତି "5 lakh" କିମ୍ବା 500000।`,
      loanType: `ଦୟାକରି list ରୁ ଗୋଟିଏ number ବାଛନ୍ତୁ କିମ୍ବା loan type ଲେଖନ୍ତୁ।`,
    },
    thankYou: (f, p) =>
      `ଧନ୍ୟବାଦ ${f}! ✅ ଆପଣଙ୍କ ବିବରଣୀ ଆମ ଟିମ୍ ପାଖରେ ପହଞ୍ଚିଛି। ଆମ loan specialist ଶୀଘ୍ର ଆପଣଙ୍କୁ ` +
      `*${p}* ରେ ଯୋଗାଯୋଗ କରିବେ।\n\nସେ ପର୍ଯ୍ୟନ୍ତ ଆପଣଙ୍କ କୌଣସି ପ୍ରଶ୍ନ ଥିଲେ — EMI, interest rate, ` +
      `କାଗଜପତ୍ର କିମ୍ବା process — ନିଃସଙ୍କୋଚ ପଚାରନ୍ତୁ, ମୁଁ ଏଠାରେ ଅଛି 😊`,
    alreadyNoted:
      `ଆପଣଙ୍କ ବିବରଣୀ ଆଗରୁ ଆମ ଟିମ୍ ପାଖରେ ଅଛି ✅ — ସେମାନେ ଶୀଘ୍ର ଯୋଗାଯୋଗ କରିବେ। ସେ ପର୍ଯ୍ୟନ୍ତ ମୁଁ ` +
      `ଆପଣଙ୍କ ଯେକୌଣସି ପ୍ରଶ୍ନ (EMI, interest rate, କାଗଜପତ୍ର, process) ର ଉତ୍ତର ଦେଇପାରିବି 😊`,
    cooldown:
      `ଆପଣଙ୍କ ଅଧିକ ପ୍ରଶ୍ନ ପାଇଁ ଏବେ ଆମ ଟିମ୍ ଆପଣଙ୍କ ସହ *ବ୍ୟକ୍ତିଗତ* ଭାବେ କଥା ହେବେ — ଅଳ୍ପ ସମୟ ` +
      `ମଧ୍ୟରେ ଆମ specialist ଯୋଗାଯୋଗ କରିବେ 🙏 ଧନ୍ୟବାଦ!`,
    emi: (url) =>
      `🧮 ଆପଣ ଆପଣଙ୍କ EMI ଏଠାରେ ତୁରନ୍ତ ହିସାବ କରିପାରିବେ:\n\n${url}\n\nକେବଳ loan amount, interest ` +
      `rate ଓ tenure ଦିଅନ୍ତୁ। ଆଉ କିଛି ସାହାଯ୍ୟ ଦରକାର? 😊`,
  },
};

// Build the full loan-type question (intro + numbered menu + pick hint).
export function loanTypePrompt(lang: Lang): string {
  const menu = LOAN_TYPE_OPTIONS.map((o, i) => `${i + 1}. ${o}`).join('\n');
  return `${T[lang].form.loanTypeIntro}\n${menu}\n\n${T[lang].pickHint}`;
}

// If `raw` is a bare number that maps to a loan-type option, return that option;
// otherwise return null (caller then treats it as free text).
export function resolveLoanTypePick(raw: string): string | null {
  const m = (raw || '').trim().match(/^#?\s*(\d{1,2})[.):]?$/);
  if (!m) return null;
  const idx = parseInt(m[1], 10) - 1;
  return idx >= 0 && idx < LOAN_TYPE_OPTIONS.length ? LOAN_TYPE_OPTIONS[idx] : null;
}
