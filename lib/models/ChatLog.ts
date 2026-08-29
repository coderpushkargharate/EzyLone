import mongoose, { Schema, Document, Model } from 'mongoose';

// Ezy AI — conversation log & training data.
//
// Every free-form question a visitor asks is stored here with what the bot did
// with it: which source answered (the trained knowledge base, the rule engine,
// the optional LLM backup, or nothing), and the match confidence. This is the
// raw material for training — the admin panel surfaces `matched: false` rows as
// "unanswered questions" so an admin can teach the bot a proper answer, which
// then becomes a KnowledgeEntry and stops the question from being unanswered.

export type ChatLogSource = 'knowledge' | 'engine' | 'llm' | 'fallback';

export interface IChatLog extends Document {
  question: string;          // the raw user message
  answer: string;            // what the bot replied
  source: ChatLogSource;     // who produced the answer
  matched: boolean;          // did the knowledge base answer confidently?
  score: number;             // best knowledge-base match score (0..1)
  matchedEntry?: mongoose.Types.ObjectId; // the KnowledgeEntry that answered, if any
  channel: string;           // 'web' | 'whatsapp'
  via: string;               // how the visitor entered the message: 'text' | 'voice'
  resolved: boolean;         // admin has taught an answer for this (or dismissed it)
  createdAt: Date;
  updatedAt: Date;
}

const ChatLogSchema = new Schema<IChatLog>(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, default: '' },
    source: { type: String, enum: ['knowledge', 'engine', 'llm', 'fallback'], default: 'fallback' },
    matched: { type: Boolean, default: false, index: true },
    score: { type: Number, default: 0 },
    matchedEntry: { type: Schema.Types.ObjectId, ref: 'KnowledgeEntry' },
    channel: { type: String, default: 'web' },
    via: { type: String, enum: ['text', 'voice'], default: 'text', index: true },
    resolved: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export const ChatLog: Model<IChatLog> =
  (mongoose.models.ChatLog as Model<IChatLog>) ||
  mongoose.model<IChatLog>('ChatLog', ChatLogSchema);
