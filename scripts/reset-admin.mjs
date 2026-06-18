// One-off admin reset / takeover script.
//
//   node --env-file=.env.local scripts/reset-admin.mjs
//
// Reads ADMIN_USERNAME / ADMIN_PASSWORD from the environment, then upserts that
// admin account in MongoDB with a freshly bcrypt-hashed password. Use this to
// take ownership of the admin login (so the previous developer's credentials no
// longer work) and whenever you rotate the admin password.
//
// It also prints every existing admin username so you can spot — and delete —
// any leftover accounts you don't recognise.

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const { DATABASE_URL, ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;

if (!DATABASE_URL || !ADMIN_USERNAME || !ADMIN_PASSWORD) {
  console.error('❌ DATABASE_URL, ADMIN_USERNAME and ADMIN_PASSWORD must be set.');
  console.error('   Run with: node --env-file=.env.local scripts/reset-admin.mjs');
  process.exit(1);
}

const UserSchema = new mongoose.Schema(
  { username: { type: String, required: true, unique: true }, password: { type: String, required: true } },
  { timestamps: true }
);
const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function main() {
  await mongoose.connect(DATABASE_URL, { dbName: 'mydatabase' });
  console.log('✅ Connected to MongoDB');

  const existing = await User.find({}, 'username').lean();
  console.log(`ℹ️  Existing admin usernames (${existing.length}):`, existing.map((u) => u.username));

  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const res = await User.updateOne(
    { username: ADMIN_USERNAME },
    { $set: { password: hashed } },
    { upsert: true }
  );

  if (res.upsertedCount) console.log(`✅ Created new admin "${ADMIN_USERNAME}".`);
  else console.log(`✅ Reset password for existing admin "${ADMIN_USERNAME}".`);

  // Pass --purge-others to DELETE every admin account except ADMIN_USERNAME.
  // Use this to remove leftover accounts the previous developer may still know.
  if (process.argv.includes('--purge-others')) {
    const del = await User.deleteMany({ username: { $ne: ADMIN_USERNAME } });
    console.log(`🧹 Deleted ${del.deletedCount} other admin account(s).`);
  }

  await mongoose.disconnect();
  console.log('Done.');
}

main().catch((err) => {
  console.error('❌ Reset failed:', err.message);
  process.exit(1);
});
