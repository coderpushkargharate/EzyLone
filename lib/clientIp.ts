// Pure client-IP resolution (no Next/DB imports; unit-tested by
// scripts/test-webhook-auth.mjs). Used by lib/rateLimit.ts → getClientIp.
//
// The left-most X-Forwarded-For entry is written by the CLIENT and can be any
// value, so it is only a best-effort guess. An IP is "trusted" only when the
// deployment says how its proxy reports it:
//
//   TRUSTED_IP_HEADER=x-real-ip   the proxy overwrites this header with the
//                                 socket address (nginx: proxy_set_header
//                                 X-Real-IP $remote_addr;) — or cf-connecting-ip
//                                 behind Cloudflare.
//   TRUSTED_PROXY_HOPS=1          number of reverse proxies that APPEND to
//                                 X-Forwarded-For (nginx $proxy_add_x_forwarded_for
//                                 = 1; CDN + nginx = 2). The entry that many
//                                 positions from the right is the client.
//
// Untrusted IPs are still used for rate limiting (better than nothing), but
// never for automatic, persistent IP blocks — otherwise anyone could get an
// innocent visitor's IP banned by sending it in X-Forwarded-For.

export interface ClientIpInfo {
  ip: string;
  trusted: boolean;
}

type HeaderGetter = { get(name: string): string | null };
type Env = Record<string, string | undefined>;

function proxyHops(env: Env): number {
  const n = Number.parseInt(env.TRUSTED_PROXY_HOPS || '', 10);
  return Number.isInteger(n) && n > 0 && n < 10 ? n : 0;
}

/** True when the deployment has declared how to read the real client IP. */
export function ipSourceConfigured(env: Env = process.env): boolean {
  return Boolean(env.TRUSTED_IP_HEADER?.trim()) || proxyHops(env) > 0;
}

export function resolveClientIp(headers: HeaderGetter, env: Env = process.env): ClientIpInfo {
  const trustedHeader = env.TRUSTED_IP_HEADER?.trim().toLowerCase();
  if (trustedHeader) {
    const v = headers.get(trustedHeader)?.split(',')[0].trim();
    return { ip: v || 'unknown', trusted: Boolean(v) };
  }

  const xff = (headers.get('x-forwarded-for') || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const hops = proxyHops(env);
  if (hops) {
    // Fewer entries than proxies means the request skipped a proxy — don't guess.
    const v = xff.length >= hops ? xff[xff.length - hops] : '';
    return { ip: v || 'unknown', trusted: Boolean(v) };
  }

  // Not configured: legacy best-effort (spoofable) behaviour, flagged untrusted.
  return { ip: xff[0] || headers.get('x-real-ip') || 'unknown', trusted: false };
}
