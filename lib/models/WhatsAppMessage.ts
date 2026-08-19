import mongoose, { Schema, Document, Model } from 'mongoose';

// Durable WhatsApp conversation transcript — one document per inbound turn.
//
// Unlike WhatsAppSession (which keeps only the last ~10 turns and TTL-expires
// after 3 days so multi-turn flows work), this collection is a PERMANENT record
// of what each user asked the Ezy AI WhatsApp bot and how it replied. It's the
// raw material the admin "WhatsApp Chats" panel uses to let staff read a
// specific user's full conversation history and understand the questions people
// ask, so the bot can be trained more effectively.
//
// Written fire-and-forget from lib/chatbot/whatsappBrain.ts (never blocks a
// reply). Keyed by the sender's WhatsApp address so every turn groups per user.

export interface IWhatsAppMessage extends Document {
  phone: string;         // sender's WhatsApp address, exactly as received
  userMessage: string;   // what the user sent
  botReply: string;      // what the bot replied (final text delivered)
  source: string;        // 'knowledge' | 'engine' | 'llm' | 'fallback' | 'flow'
  matched: boolean;      // did the knowledge base answer this confidently?
  score: number;         // best knowledge-base match score (0..1)
  inFlow: boolean;       // was the user mid structured flow (lead / EMI / etc)?
  createdAt: Date;
  updatedAt: Date;
}

const WhatsAppMessageSchema = new Schema<IWhatsAppMessage>(
  {
    phone: { type: String, required: true, trim: true },
    userMessage: { type: String, default: '' },
    botReply: { type: String, default: '' },
    source: { type: String, default: 'engine' },
    matched: { type: Boolean, default: false },
    score: { type: Number, default: 0 },
    inFlow: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Fast per-user history lookups and grouped conversation lists.
WhatsAppMessageSchema.index({ phone: 1, createdAt: 1 });
WhatsAppMessageSchema.index({ createdAt: -1 });

export const WhatsAppMessage: Model<IWhatsAppMessage> =
  (mongoose.models.WhatsAppMessage as Model<IWhatsAppMessage>) ||
  mongoose.model<IWhatsAppMessage>('WhatsAppMessage', WhatsAppMessageSchema);
