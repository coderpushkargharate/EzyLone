// Pure helpers for Search Console / GA4 report shaping. Unit-tested.

export interface ScRow {
  keys?: string[];
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
}

export interface ScTotals {
  clicks: number;
  impressions: number;
  ctr: number | null; // 0..1
  position: number | null; // impression-weighted average position
}

/**
 * Totals from Search Console rows. CTR is recomputed from clicks/impressions and
 * position is impression-weighted — averaging per-row CTR/position would be wrong.
 */
export function scTotals(rows: ScRow[]): ScTotals {
  let clicks = 0;
  let impressions = 0;
  let posWeighted = 0;
  for (const r of rows) {
    clicks += r.clicks || 0;
    impressions += r.impressions || 0;
    posWeighted += (r.position || 0) * (r.impressions || 0);
  }
  return {
    clicks,
    impressions,
    ctr: impressions ? clicks / impressions : null,
    position: impressions ? Math.round((posWeighted / impressions) * 10) / 10 : null,
  };
}

/** The equally long period immediately before [from, to] (YYYY-MM-DD, inclusive). */
export function previousPeriod(from: string, to: string): { from: string; to: string } {
  const f = Date.parse(`${from}T00:00:00Z`);
  const t = Date.parse(`${to}T00:00:00Z`);
  const days = Math.round((t - f) / 86_400_000) + 1;
  const pTo = new Date(f - 86_400_000);
  const pFrom = new Date(f - days * 86_400_000);
  return { from: pFrom.toISOString().slice(0, 10), to: pTo.toISOString().slice(0, 10) };
}

export function pctChange(cur: number | null, prev: number | null): number | null {
  if (cur === null || prev === null || prev === 0) return null;
  return Math.round(((cur - prev) / prev) * 1000) / 10;
}

export function isYmd(v: string | null | undefined): v is string {
  return !!v && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(`${v}T00:00:00Z`));
}

/** GA4 runReport → plain objects keyed by header names. */
export function ga4Rows(body: unknown): Record<string, string | number>[] {
  const b = (body || {}) as {
    dimensionHeaders?: { name: string }[];
    metricHeaders?: { name: string; type?: string }[];
    rows?: { dimensionValues?: { value: string }[]; metricValues?: { value: string }[] }[];
  };
  const dh = (b.dimensionHeaders || []).map((h) => h.name);
  const mh = (b.metricHeaders || []).map((h) => h.name);
  return (b.rows || []).map((r) => {
    const o: Record<string, string | number> = {};
    dh.forEach((n, i) => (o[n] = r.dimensionValues?.[i]?.value ?? ''));
    mh.forEach((n, i) => (o[n] = Number(r.metricValues?.[i]?.value ?? 0)));
    return o;
  });
}

/** A URL may only be inspected if it belongs to the selected property. */
export function urlBelongsToSite(url: string, site: string): boolean {
  try {
    const u = new URL(url);
    if (site.startsWith('sc-domain:')) {
      const d = site.slice('sc-domain:'.length).toLowerCase();
      return u.hostname.toLowerCase() === d || u.hostname.toLowerCase().endsWith(`.${d}`);
    }
    return url.startsWith(site);
  } catch {
    return false;
  }
}
