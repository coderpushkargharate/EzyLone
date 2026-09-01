import mongoose, { Schema, Document, Model } from 'mongoose';

// Per-user WhatsApp control record — one document per sender, PERMANENT (unlike
// WhatsAppSession which TTL-expires after 3 days).
//
// Its only job today is to remember whether the admin has taken this specific
// conversation OFF the auto-reply bot ("manual" mode) so a human can chat with
// the user directly from the admin panel, or left it on the Ezy AI automation
// ("auto" mode, the default). The inbound webhook checks this before deciding to
// generate an automated reply; the admin "WhatsApp Chats" panel flips it.
//
// Keyed by the sender's WhatsApp address exactly as received (e.g.
// "whatsapp:+9198...") so it lines up with WhatsAppMessage.phone / WhatsAppSession.phone.

export type WhatsAppMode = 'auto' | 'manual';

export interface IWhatsAppContact extends Document {
  phone: string;
  mode: WhatsAppMode;
  createdAt: Date;
  updatedAt: Date;
}

const WhatsAppContactSchema = new Schema<IWhatsAppContact>(
  {
    phone: { type: String, required: true, unique: true, index: true },
    mode: { type: String, enum: ['auto', 'manual'], default: 'auto' },
  },
  { timestamps: true }
);

export const WhatsAppContact: Model<IWhatsAppContact> =
  (mongoose.models.WhatsAppContact as Model<IWhatsAppContact>) ||
  mongoose.model<IWhatsAppContact>('WhatsAppContact', WhatsAppContactSchema);
