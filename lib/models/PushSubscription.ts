import mongoose, { Schema, Document, Model } from 'mongoose';

// One Web Push subscription = one installed admin app / browser on one device.
//
// When a staff member opens the admin PWA and allows notifications, the browser
// hands us a PushSubscription (an endpoint URL + two encryption keys). We store
// it here so the server can push a notification to that device LATER — even when
// the app is completely closed. This is what makes the WhatsApp-style "message
// aane par upar notification + icon badge" work without the app being open.
//
// Subscriptions can silently expire; lib/push.ts prunes any endpoint the push
// service rejects with 404/410 so this collection stays clean.

export interface IPushSubscription extends Document {
  endpoint: string;                 // unique per device/browser
  keys: { p256dh: string; auth: string };
  userAgent?: string;               // handy for debugging which device is which
  createdAt: Date;
  updatedAt: Date;
}

const PushSubscriptionSchema = new Schema<IPushSubscription>(
  {
    endpoint: { type: String, required: true, unique: true },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
    userAgent: { type: String, default: '' },
  },
  { timestamps: true }
);

export const PushSubscription: Model<IPushSubscription> =
  (mongoose.models.PushSubscription as Model<IPushSubscription>) ||
  mongoose.model<IPushSubscription>('PushSubscription', PushSubscriptionSchema);
