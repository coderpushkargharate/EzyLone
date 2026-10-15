// Next.js server start hook. Starts the marketing background worker (lead
// ingestion retries, conversion delivery, Google status checks, token health,
// spend sync) inside the long-running `next start` process. Disable with
// MARKETING_WORKER_ENABLED=false and drive POST /api/marketing/worker from a
// cron job instead.
//
// The Node-only code is imported inside the NEXT_RUNTIME check (Next's
// documented pattern) so it is never bundled for the Edge runtime.

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./lib/marketing/instrumentation-node');
  }
}
