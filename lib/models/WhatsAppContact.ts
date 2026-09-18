import mongoose, { Schema, Document, Model } from 'mongoose';

// Per-user WhatsApp control record — one document per sender, PERMANENT (unlike
// WhatsAppSession which TTL-expires after 3 days).
//
// It remembers, per sender:
//  • whether this conversation is on the auto-reply bot ("auto") or handed to a
//    human ("manual"). Admin takeover is PERMANENT manual (no manualUntil). The
//    bot itself can also drop a sender into a TEMPORARY 2-hour manual cooldown
//    (manualUntil set) — after too many post-lead questions — which auto-reverts.
//  • the geo-gate progress: we only serve Odisha right now, so we ask each new
//    sender their state first (geoStateStatus: new → asked → verified/rejected).
//  • whether we've already created their CRM lead (leadCreated) so we never spam
//    "shall I note your requirement" again, and how many questions they've asked
//    since the lead (questionsSinceLead) to enforce the cooldown.
//
// Keyed by the sender's WhatsApp address exactly as received (e.g.
// "whatsapp:+9198...") so it lines up with WhatsAppMessage.phone / WhatsAppSession.phone.

export type WhatsAppMode = 'auto' | 'manual';

// Geo-gate lifecycle: 'new' = never asked, 'asked' = awaiting their state reply,
// 'verified' = confirmed Odisha (may proceed), 'rejected' = outside Odisha (put on
// permanent manual, bot silent).
export type GeoStateStatus = 'new' | 'asked' | 'verified' | 'rejected';

export interface IWhatsAppContact extends Document {
  phone: string;
  mode: WhatsAppMode;
  // When set (and in the future) the 'manual' mode is a temporary cooldown that
  // auto-reverts to 'auto'. Admin-set manual leaves this unset (permanent).
  manualUntil?: Date | null;
  geoStateStatus: GeoStateStatus;
  geoState?: string;
  leadCreated: boolean;
  leadCreatedAt?: Date | null;
  questionsSinceLead: number;
  createdAt: Date;
  updatedAt: Date;
}

const WhatsAppContactSchema = new Schema<IWhatsAppContact>(
  {
    phone: { type: String, required: true, unique: true, index: true },
    mode: { type: String, enum: ['auto', 'manual'], default: 'auto' },
    manualUntil: { type: Date, default: null },
    geoStateStatus: { type: String, enum: ['new', 'asked', 'verified', 'rejected'], default: 'new' },
    geoState: { type: String, default: '' },
    leadCreated: { type: Boolean, default: false },
    leadCreatedAt: { type: Date, default: null },
    questionsSinceLead: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const WhatsAppContact: Model<IWhatsAppContact> =
  (mongoose.models.WhatsAppContact as Model<IWhatsAppContact>) ||
  mongoose.model<IWhatsAppContact>('WhatsAppContact', WhatsAppContactSchema);
