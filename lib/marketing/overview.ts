import { connectDB } from '@/lib/db';
import { ConversionEvent } from '@/lib/models/ConversionEvent';
import { getConnection } from './connections';
import { analyticsReport, searchPerformance } from './google/reporting';

// Compact marketing snapshot for the admin Overview page. Each block either
// carries real numbers or a plain-language reason why it is unavailable — it
// never throws and never fills in a guess.

const ymd = (d: Date) => d.toISOString().slice(0, 10);

async function attempt<T>(fn: () => Promise<T>): Promise<{ ok: true; data: T } | { ok: false; reason: string }> {
  try {
    return { ok: true, data: await fn() };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : String(e) };
  }
}

export async function marketingOverview() {
  await connectDB();
  const [meta, google] = await Promise.all([getConnection('meta'), getConnection('google')]);
  const googleConnected = !!google && google.status !== 'disconnected';

  // Search Console finalises data ~2–3 days late, so the window ends 3 days ago.
  const scTo = ymd(new Date(Date.now() - 3 * 86_400_000));
  const scFrom = ymd(new Date(Date.now() - 30 * 86_400_000));
  const gaTo = ymd(new Date(Date.now() - 86_400_000));
  const gaFrom = ymd(new Date(Date.now() - 28 * 86_400_000));

  const [search, analytics] = await Promise.all([
    googleConnected
      ? attempt(async () => {
          const r = await searchPerformance(scFrom, scTo);
          return { range: r.range, totals: r.totals, change: r.change, topQueries: r.queries.slice(0, 5), topCountries: r.countries.slice(0, 3), fetchedAt: r.fetchedAt };
        })
      : Promise.resolve({ ok: false as const, reason: 'Google is not connected.' }),
    googleConnected
      ? attempt(async () => {
          const r = await analyticsReport(gaFrom, gaTo);
          return { range: r.range, totals: r.totals, change: r.change, topCities: (r.cities || []).filter((c) => c.city !== '(not set)').slice(0, 5), fetchedAt: r.fetchedAt };
        })
      : Promise.resolve({ ok: false as const, reason: 'Google is not connected.' }),
  ]);

  const since = new Date(Date.now() - 30 * 86_400_000);
  const ev = await ConversionEvent.aggregate([
    { $match: { createdAt: { $gte: since }, testMode: false } },
    { $group: { _id: { platform: '$platform', status: '$status' }, count: { $sum: 1 } } },
  ]);
  const conversions = { meta: {} as Record<string, number>, google: {} as Record<string, number> };
  for (const e of ev) conversions[e._id.platform as 'meta' | 'google'][e._id.status] = e.count;

  return {
    connections: { meta: meta?.status || 'disconnected', google: google?.status || 'disconnected', capiConfigured: !!(meta?.meta?.datasetId && meta?.meta?.capiTokenEnc) },
    search,
    analytics,
    conversions,
  };
}
