// Convenience runner for the EzySaathi AI intent test suite.
// Compiles the PURE chatbot modules (no DB) to a temp dir and runs the tests.
//   npm run test:ezysaathi
import { execSync } from 'node:child_process';
import { rmSync } from 'node:fs';

const OUT = '.tmp-test';
const files = [
  'lib/chatbot/knowledge.ts',
  'lib/chatbot/answers.ts',
  'lib/chatbot/intent.ts',
  'scripts/test-ezysaathi.ts',
].join(' ');

try {
  execSync(
    `npx tsc --module commonjs --target es2019 --esModuleInterop --moduleResolution node --skipLibCheck --outDir ${OUT} ${files}`,
    { stdio: 'inherit' },
  );
  execSync(`node ${OUT}/scripts/test-ezysaathi.js`, { stdio: 'inherit' });
} finally {
  try {
    rmSync(OUT, { recursive: true, force: true });
  } catch {
    /* ignore */
  }
}
