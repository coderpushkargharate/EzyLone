// Loaded only in the Node.js runtime from instrumentation.ts.
import { startMarketingWorker } from './worker';
import { workerEnabled } from './config';

if (workerEnabled() && process.env.NEXT_PHASE !== 'phase-production-build' && process.env.DATABASE_URL) {
  startMarketingWorker();
}
