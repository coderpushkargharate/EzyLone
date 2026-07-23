import mongoose, { Schema, Document, Model } from 'mongoose';

// Ezy AI — trained knowledge base ("the brain").
//
// This is what makes the chatbot self-trained WITHOUT any external AI API. Each
// entry is one Q&A the bot knows: a canonical `question`, optional alternate
// phrasings (`variants`), extra `keywords`, and the `answer` to give. The
// matching algorithm (lib/chatbot/nlp.ts) scores an incoming user message
// against every enabled entry and returns the best answer above a confidence
// threshold. Admins grow this collection from real questions in the admin panel,
// so the bot gets smarter over time.

export interface IKnowledgeEntry extends Document {
  question: string;          // canonical question, e.g. "What interest rate do you offer?"
  variants: string[];        // alternate phrasings a user might type
  keywords: string[];        // extra matching hints (synonyms, short tokens)
  answer: string;            // the reply to send (Markdown allowed)
  category?: string;         // grouping in the admin panel (e.g. "Rates", "Eligibility")
  channel: string;           // 'both' | 'web' | 'whatsapp' — which brain uses this entry
  enabled: boolean;          // disabled entries are skipped by the matcher
  hits: number;              // how many times this answer has been served (usage)
  createdAt: Date;
  updatedAt: Date;
}

const KnowledgeEntrySchema = new Schema<IKnowledgeEntry>(
  {
    question: { type: String, required: true, trim: true },
    variants: { type: [String], default: [] },
    keywords: { type: [String], default: [] },
    answer: { type: String, required: true },
    category: { type: String, default: 'General', trim: true },
    // 'both' = shared by website + WhatsApp; 'web' / 'whatsapp' = channel-specific.
    // Legacy entries have no channel field → treated as 'both' by the matcher.
    channel: { type: String, enum: ['both', 'web', 'whatsapp'], default: 'both', index: true },
    enabled: { type: Boolean, default: true, index: true },
    hits: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const KnowledgeEntry: Model<IKnowledgeEntry> =
  (mongoose.models.KnowledgeEntry as Model<IKnowledgeEntry>) ||
  mongoose.model<IKnowledgeEntry>('KnowledgeEntry', KnowledgeEntrySchema);
