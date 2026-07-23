// Ezy AI — self-trained matching algorithm (ZERO external API).
//
// This module is the "brain's" maths. It turns a raw message into normalized
// tokens and scores how similar a user question is to a stored knowledge entry,
// using two classic, dependency-free techniques combined:
//
//   1. TF-IDF cosine similarity — rewards shared, *informative* words. IDF is
//      learned from the whole knowledge base, so common words ("loan") weigh
//      less than distinctive ones ("foreclosure"). This is the "training".
//   2. Fuzzy bigram (Dice) overlap — rescues typos and small spelling variants
//      ("eligibilty", "instalment") that exact token matching would miss.
//
// Final score = 0.7 · cosine + 0.3 · fuzzyOverlap, always in [0, 1]. The caller
// (lib/chatbot/knowledgeBase.ts) picks the best-scoring entry above a threshold.

// Words that carry little meaning for matching — dropped before scoring. Covers
// English plus common romanized Hindi/Hinglish so "mujhe loan chahiye" and
// "I want a loan" reduce to the same signal token ("loan").
const STOPWORDS = new Set([
  // English
  'a', 'an', 'the', 'is', 'are', 'am', 'was', 'were', 'be', 'been', 'being',
  'do', 'does', 'did', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'my',
  'your', 'our', 'their', 'this', 'that', 'these', 'those', 'to', 'of', 'in',
  'on', 'for', 'and', 'or', 'but', 'with', 'at', 'by', 'from', 'as', 'so', 'if',
  'can', 'could', 'would', 'should', 'will', 'shall', 'may', 'might', 'have',
  'has', 'had', 'about', 'any', 'some', 'get', 'got', 'give', 'want', 'need',
  'please', 'tell', 'know', 'there', 'here', 'much', 'many', 'more', 'also',
  'what', 'whats', 'which', 'who', 'whom', 'whose', 'how', 'why', 'where', 'when',
  // Romanized Hindi / Hinglish
  'hai', 'hain', 'ho', 'hoga', 'hota', 'hoti', 'ka', 'ke', 'ki', 'ko', 'se',
  'me', 'mein', 'par', 'ya', 'aur', 'ye', 'yeh', 'wo', 'woh', 'na', 'nahi',
  'mujhe', 'mera', 'meri', 'apka', 'aap', 'hum', 'kar', 'karo', 'karna', 'ek',
  'kya', 'kaise', 'kaisa', 'kaun', 'kab', 'kahan', 'kyun', 'kyu', 'hi', 'bhi',
]);

// Domain synonyms → a single canonical token, so different words for the same
// idea collapse together before scoring. Conservative on purpose (a loan bot
// must not blur distinct products together).
const SYNONYMS: Record<string, string> = {
  // interest
  byaj: 'interest', byaaj: 'interest', roi: 'interest', rate: 'interest', rates: 'interest',
  // emi / installment
  installment: 'emi', instalment: 'emi', installments: 'emi', kist: 'emi', kisht: 'emi',
  // eligibility
  eligible: 'eligibility', eligibilty: 'eligibility', qualify: 'eligibility',
  yogya: 'eligibility', patra: 'eligibility',
  // documents
  document: 'documents', kagaz: 'documents', papers: 'documents', paper: 'documents', kyc: 'documents',
  // loan
  loans: 'loan', karz: 'loan', karza: 'loan', rin: 'loan', finance: 'loan', funding: 'loan',
  // vehicles
  gaadi: 'car', gadi: 'car', vehicle: 'car', vehicles: 'car', gaari: 'car',
  // contact
  phone: 'contact', number: 'contact', call: 'contact', sampark: 'contact', reach: 'contact',
  mobile: 'contact', email: 'contact',
  // credit score
  cibil: 'creditscore', score: 'creditscore',
  // prepay
  foreclose: 'prepay', foreclosure: 'prepay', preclose: 'prepay', prepayment: 'prepay',
  // time
  duration: 'time', tenure: 'time', period: 'time',
};

// Very light stemmer — strips a few common English suffixes so "processing",
// "processed", "process" share a stem. Intentionally naive (no external lib);
// good enough for short chat messages and never touches short tokens.
function stem(token: string): string {
  if (token.length <= 4) return token;
  for (const suf of ['ing', 'edly', 'ies', 'ed', 'es', 'ly', 's']) {
    // Keep a stem of at least 4 chars so "timing" isn't butchered to "tim".
    if (token.endsWith(suf) && token.length - suf.length >= 4) {
      return token.slice(0, -suf.length);
    }
  }
  return token;
}

// Raw text → clean, meaningful tokens (lowercased, punctuation stripped,
// stopwords removed, synonyms canonicalised, lightly stemmed). Unicode-aware so
// Devanagari script survives too.
export function tokenize(text: string): string[] {
  // Keep lowercased Latin letters, digits, Devanagari (U+0900–U+097F) and spaces;
  // strip everything else. Avoids the /u regex flag so it compiles under any TS
  // target while still handling Hindi script alongside English/Hinglish.
  const cleaned = (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9ऀ-ॿ\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleaned) return [];
  const out: string[] = [];
  for (let tok of cleaned.split(' ')) {
    if (tok.length < 2) continue;
    if (STOPWORDS.has(tok)) continue;
    tok = SYNONYMS[tok] || tok;
    if (STOPWORDS.has(tok)) continue;
    out.push(stem(tok));
  }
  return out;
}

export type TermFreq = Map<string, number>;

export function termFreq(tokens: string[]): TermFreq {
  const tf: TermFreq = new Map();
  for (const t of tokens) tf.set(t, (tf.get(t) || 0) + 1);
  return tf;
}

// Inverse document frequency learned from the corpus of all entry token-lists.
// A term in few entries gets a high weight; a term in every entry ~0. This is
// the part that "trains" on your knowledge base as it grows.
export function buildIdf(corpusTokens: string[][]): Map<string, number> {
  const df = new Map<string, number>();
  const N = corpusTokens.length || 1;
  for (const tokens of corpusTokens) {
    Array.from(new Set(tokens)).forEach((t) => df.set(t, (df.get(t) || 0) + 1));
  }
  const idf = new Map<string, number>();
  df.forEach((freq, term) => {
    // Smoothed IDF, kept ≥ 0 so a word present everywhere doesn't go negative.
    idf.set(term, Math.log((N + 1) / (freq + 1)) + 1);
  });
  return idf;
}

// Build a sparse TF-IDF vector (term → weight) for a token list.
export function tfidfVector(tokens: string[], idf: Map<string, number>): Map<string, number> {
  const tf = termFreq(tokens);
  const vec = new Map<string, number>();
  const len = tokens.length || 1;
  tf.forEach((count, term) => {
    const weight = (count / len) * (idf.get(term) ?? Math.log((idf.size || 1) + 1) + 1);
    vec.set(term, weight);
  });
  return vec;
}

// Cosine similarity between two sparse vectors, in [0, 1].
export function cosine(a: Map<string, number>, b: Map<string, number>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let dot = 0;
  // Iterate the smaller map for the dot product.
  const [small, large] = a.size < b.size ? [a, b] : [b, a];
  small.forEach((w, term) => {
    const w2 = large.get(term);
    if (w2) dot += w * w2;
  });
  let magA = 0;
  a.forEach((w) => { magA += w * w; });
  let magB = 0;
  b.forEach((w) => { magB += w * w; });
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

// Dice coefficient on character bigrams — a robust 0..1 fuzzy string similarity
// that tolerates typos and small spelling differences.
export function dice(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length < 2 || b.length < 2) return 0;
  const bigrams = (s: string) => {
    const m = new Map<string, number>();
    for (let i = 0; i < s.length - 1; i++) {
      const bg = s.slice(i, i + 2);
      m.set(bg, (m.get(bg) || 0) + 1);
    }
    return m;
  };
  const A = bigrams(a);
  const B = bigrams(b);
  let overlap = 0;
  A.forEach((count, bg) => {
    const c2 = B.get(bg);
    if (c2) overlap += Math.min(count, c2);
  });
  return (2 * overlap) / (a.length - 1 + (b.length - 1));
}

// For each query token, find its best fuzzy match among the entry's tokens and
// average those best scores. Rescues typos the exact TF-IDF path would miss.
export function fuzzyOverlap(queryTokens: string[], entryTokens: string[]): number {
  if (queryTokens.length === 0 || entryTokens.length === 0) return 0;
  const uniqEntry = Array.from(new Set(entryTokens));
  let sum = 0;
  for (const q of queryTokens) {
    let best = 0;
    for (const e of uniqEntry) {
      const d = q === e ? 1 : dice(q, e);
      if (d > best) best = d;
      if (best === 1) break;
    }
    sum += best;
  }
  return sum / queryTokens.length;
}

// Combined similarity used by the matcher, in [0, 1]. Three complementary signals:
//   • cosine      — TF-IDF overlap of informative words (great for longer text).
//   • fuzzy       — typo/spelling tolerance.
//   • containment — fraction of the query's words found verbatim in the entry.
//     This rescues short, single-keyword queries ("timings", "foreclosure")
//     whose cosine is diluted by a longer entry, without helping unrelated ones.
export function combinedScore(
  queryTokens: string[],
  queryVec: Map<string, number>,
  entryTokens: string[],
  entryVec: Map<string, number>,
): number {
  const cos = cosine(queryVec, entryVec);
  const fuzzy = fuzzyOverlap(queryTokens, entryTokens);
  const entrySet = new Set(entryTokens);
  let hits = 0;
  for (const q of queryTokens) if (entrySet.has(q)) hits++;
  const containment = queryTokens.length ? hits / queryTokens.length : 0;
  return 0.45 * cos + 0.2 * fuzzy + 0.35 * containment;
}
