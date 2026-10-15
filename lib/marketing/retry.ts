// Retry policy for outbound marketing deliveries. Pure — unit-tested.

export const MAX_ATTEMPTS = 8;
const BASE_MS = 30_000;
const CAP_MS = 6 * 60 * 60_000;

/**
 * Exponential backoff with ±20% jitter: 30s, 1m, 2m, 4m … capped at 6h.
 * Rate-limit errors start from a longer base so we back off the platform faster.
 */
export function backoffMs(attempt: number, opts: { rateLimited?: boolean; random?: () => number } = {}): number {
  const rnd = opts.random || Math.random;
  const base = opts.rateLimited ? BASE_MS * 10 : BASE_MS;
  const exp = Math.min(CAP_MS, base * 2 ** Math.max(0, attempt - 1));
  const jitter = exp * 0.2 * (rnd() * 2 - 1);
  return Math.max(1_000, Math.round(exp + jitter));
}

export function shouldDeadLetter(attempts: number): boolean {
  return attempts >= MAX_ATTEMPTS;
}

/** Wrap fetch with a hard timeout so an outage can never hang a worker. */
export async function fetchWithTimeout(url: string, init: RequestInit = {}, ms = 15_000): Promise<Response> {
  return fetch(url, { ...init, signal: AbortSignal.timeout(ms) });
}
