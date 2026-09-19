/**
 * One-time migration: normalize existing blogs for the new approval workflow.
 *
 * Existing records were created before the `status` field existed and were all
 * publicly visible. This backfills them as PUBLISHED so nothing that was live
 * disappears, and sets publishedAt = createdAt so dates/sitemap stay correct.
 *
 * Run:  node --env-file=.env.local scripts/migrate-blog-status.mjs
 * Safe to run multiple times (only touches docs missing a status).
 */
import mongoose from 'mongoose';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set. Add it to .env.local');
  process.exit(1);
}

const run = async () => {
  await mongoose.connect(DATABASE_URL, { dbName: 'mydatabase' });
  const coll = mongoose.connection.collection('blogs');

  const missing = await coll.countDocuments({ status: { $exists: false } });
  console.log(`Found ${missing} blog(s) without a status. Backfilling as "published"…`);

  const res = await coll.updateMany(
    { status: { $exists: false } },
    [
      {
        $set: {
          status: 'published',
          publishedAt: { $ifNull: ['$publishedAt', '$createdAt'] },
          previousSlugs: { $ifNull: ['$previousSlugs', []] },
          tags: { $ifNull: ['$tags', []] },
          secondaryKeywords: { $ifNull: ['$secondaryKeywords', []] },
        },
      },
    ]
  );

  console.log(`Updated ${res.modifiedCount} blog(s).`);
  await mongoose.disconnect();
  console.log('Migration complete.');
};

run().catch(async (err) => {
  console.error('Migration failed:', err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
