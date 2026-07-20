import mongoose, { Schema, Document, Model } from 'mongoose';

// Per-phone conversation memory for the WhatsApp auto-reply bot. WhatsApp (unlike
// the website chat) sends each message independently with no client-side state,
// so we persist the Ezy AI engine's flow state + recent history here, keyed by the
// sender's WhatsApp address (e.g. "whatsapp:+9198...").
//
// A TTL index expires idle sessions after 3 days so the collection stays small and
// a stale half-finished flow doesn't linger forever.

export interface IWhatsAppSession extends Document {
  phone: string;
  state: Record<string, any>;
  history: { role: 'user' | 'assistant'; content: string }[];
  updatedAt: Date;
  createdAt: Date;
}

const WhatsAppSessionSchema = new Schema<IWhatsAppSession>(
  {
    phone: { type: String, required: true, unique: true, index: true },
    // ChatState from the rule engine (flow / step / data). Mixed = free-form.
    state: { type: Schema.Types.Mixed, default: {} },
    history: {
      type: [
        {
          role: { type: String, enum: ['user', 'assistant'], required: true },
          content: { type: String, required: true },
          _id: false,
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

// Auto-delete a session 3 days after its last update (72h * 3600s).
WhatsAppSessionSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 259200 });

export const WhatsAppSession: Model<IWhatsAppSession> =
  (mongoose.models.WhatsAppSession as Model<IWhatsAppSession>) ||
  mongoose.model<IWhatsAppSession>('WhatsAppSession', WhatsAppSessionSchema);
