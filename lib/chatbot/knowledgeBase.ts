// Ezy AI — self-trained knowledge base (the bot's DB brain).
//
// Ties the matching algorithm (./nlp) to the database (KnowledgeEntry, ChatLog).
// It answers a free-form question from the ADMIN-CURATED knowledge base only —
// no external API. It also logs every question so admins can teach the bot new
// answers for anything it couldn't confidently handle.
//
// Flow used by /api/chat and the WhatsApp webhook:
//   1. matchKnowledge(message) → best entry + score (in-memory, cached KB).
//   2. If score ≥ HIGH_CONFIDENCE → serve that answer, bump its hit counter.
//   3. logChat(...) records the turn (matched or not) for training.

import { connectDB } from '@/lib/db';
import { KnowledgeEntry } from '@/lib/models/KnowledgeEntry';
import { ChatLog, ChatLogSource } from '@/lib/models/ChatLog';
import { COMPANY, PRODUCTS, FAQS } from './knowledge';
import {
  tokenize,
  buildIdf,
  tfidfVector,
  combinedScore,
} from './nlp';

// Confidence thresholds for the combined score (0..1). Tuned conservatively so a
// loan bot never confidently serves a loosely-related answer. HIGH → answer;
// between LOW and HIGH → treated as unmatched (logged for training) but the
// caller may still show it as a soft suggestion if it wants.
export const HIGH_CONFIDENCE = 0.42;
export const LOW_CONFIDENCE = 0.28;

interface CompiledEntry {
  id: string;
  answer: string;
  question: string;
  tokens: string[];
  vec: Map<string, number>;
}

interface Brain {
  entries: CompiledEntry[];
  idf: Map<string, number>;
  loadedAt: number;
}

// The compiled KB is cached in memory so we don't re-read Mongo and re-run the
// maths on every message. TTL is short; writes call invalidateBrain() to force a
// rebuild on the next query so a freshly-taught answer takes effect immediately.
let brainCache: Brain | null = null;
const BRAIN_TTL_MS = 60 * 1000;

export function invalidateBrain(): void {
  brainCache = null;
}

async function getBrain(): Promise<Brain> {
  if (brainCache && Date.now() - brainCache.loadedAt < BRAIN_TTL_MS) {
    return brainCache;
  }
  await connectDB();
  let docs = await KnowledgeEntry.find({ enabled: true }).lean();

  // First-ever use: seed from the built-in FAQ/product knowledge so the bot is
  // useful immediately, then re-read. Idempotent (seedKnowledgeBase no-ops once
  // anything exists), so this branch runs at most once in the lifetime of the DB.
  if (docs.length === 0) {
    await seedKnowledgeBase();
    docs = await KnowledgeEntry.find({ enabled: true }).lean();
  }

  // Each entry's "document" = its question + variants + keywords, tokenized.
  const perEntryTokens: string[][] = docs.map((d) =>
    tokenize([d.question, ...(d.variants || []), ...(d.keywords || [])].join(' ')),
  );
  const idf = buildIdf(perEntryTokens);

  const entries: CompiledEntry[] = docs.map((d, i) => ({
    id: String(d._id),
    answer: d.answer,
    question: d.question,
    tokens: perEntryTokens[i],
    vec: tfidfVector(perEntryTokens[i], idf),
  }));

  brainCache = { entries, idf, loadedAt: Date.now() };
  return brainCache;
}

export interface MatchResult {
  entryId: string;
  question: string;
  answer: string;
  score: number;
}

// Score a message against every enabled entry and return the best. Returns null
// only when the KB is empty. Callers compare `.score` against HIGH_CONFIDENCE.
export async function matchKnowledge(message: string): Promise<MatchResult | null> {
  const brain = await getBrain();
  if (brain.entries.length === 0) return null;

  const queryTokens = tokenize(message);
  if (queryTokens.length === 0) return null;
  const queryVec = tfidfVector(queryTokens, brain.idf);

  let best: CompiledEntry | null = null;
  let bestScore = 0;
  for (const entry of brain.entries) {
    const score = combinedScore(queryTokens, queryVec, entry.tokens, entry.vec);
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }
  if (!best) return null;
  return { entryId: best.id, question: best.question, answer: best.answer, score: bestScore };
}

// Persist one conversation turn. Fire-and-forget: never throws, so a logging
// failure can never break a chat reply.
export async function logChat(entry: {
  question: string;
  answer: string;
  source: ChatLogSource;
  matched: boolean;
  score: number;
  matchedEntry?: string;
  channel?: string;
}): Promise<void> {
  try {
    await connectDB();
    await ChatLog.create({
      question: entry.question.slice(0, 1000),
      answer: entry.answer.slice(0, 4000),
      source: entry.source,
      matched: entry.matched,
      score: entry.score,
      matchedEntry: entry.matchedEntry,
      channel: entry.channel || 'web',
    });
  } catch (err) {
    console.error('Ezy AI chat log failed (non-fatal):', err);
  }
}

// Bump the usage counter on the entry that answered (best-effort).
export async function bumpHits(entryId: string): Promise<void> {
  try {
    await connectDB();
    await KnowledgeEntry.updateOne({ _id: entryId }, { $inc: { hits: 1 } });
  } catch {
    /* non-fatal */
  }
}

// Seed the knowledge base from the built-in FAQ + product knowledge the FIRST
// time it's empty, so the bot starts out already knowing the basics instead of
// answering nothing until an admin adds entries. Idempotent: does nothing once
// any entry exists. Returns how many were inserted.
export async function seedKnowledgeBase(): Promise<number> {
  await connectDB();
  const count = await KnowledgeEntry.estimatedDocumentCount();
  if (count > 0) return 0;

  const seed: Array<{ question: string; variants?: string[]; keywords?: string[]; answer: string; category: string }> = [];

  // FAQs → entries (the FAQ keywords become variants/keywords for matching).
  for (const faq of FAQS) {
    seed.push({
      question: faq.keywords[0] || 'FAQ',
      variants: faq.keywords,
      keywords: faq.keywords,
      answer: faq.answer,
      category: 'FAQ',
    });
  }

  // Products → one entry each ("tell me about <product>").
  for (const p of PRODUCTS) {
    seed.push({
      question: `Tell me about ${p.name}`,
      variants: [p.name, `${p.name} details`, `what is ${p.name}`, ...p.keywords],
      keywords: p.keywords,
      answer:
        `*${p.name}* — ${p.summary}\n\n• ${p.highlights.join('\n• ')}\n\n` +
        `Rates start from ${COMPANY.ratesFrom} (decided by the lending partner). ` +
        `Want me to check eligibility, calculate an EMI, or have our team call you?`,
      category: 'Products',
    });
  }

  // A few generic company facts.
  seed.push({
    question: 'What are your working hours?',
    variants: ['timing', 'office hours', 'kab khula hai', 'when are you open'],
    keywords: ['hours', 'timing', 'open'],
    answer: `Our team is available ${COMPANY.hours}. You can reach us on ${COMPANY.phone} or email ${COMPANY.email}.`,
    category: 'General',
  });

  if (seed.length === 0) return 0;
  await KnowledgeEntry.insertMany(seed);
  invalidateBrain();
  return seed.length;
}
