// Unit tests for lib/cloudinary.ts → parseCloudinaryUrl (pure, no network).
//   npm run test:unit
import { execSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const OUT = '.tmp-unit';
execSync(
  `npx tsc --module commonjs --target es2019 --esModuleInterop --moduleResolution node --skipLibCheck --outDir ${OUT} lib/cloudinary.ts`,
  { stdio: 'inherit' },
);

let passed = 0;
let failed = 0;
try {
  process.env.CLOUDINARY_CLOUD_NAME = 'democloud';
  const require = createRequire(import.meta.url);
  const { parseCloudinaryUrl } = require(path.resolve(OUT, 'cloudinary.js'));

  const cases = [
    ['image with version + folder', 'https://res.cloudinary.com/democloud/image/upload/v1791281331/banners/abc123.jpg', { publicId: 'banners/abc123', resourceType: 'image' }],
    ['image with transformation', 'https://res.cloudinary.com/democloud/image/upload/c_fill,w_400/v12/blogs/x.webp', { publicId: 'blogs/x', resourceType: 'image' }],
    ['raw keeps extension', 'https://res.cloudinary.com/democloud/raw/upload/v99/loan-documents/kyc.pdf', { publicId: 'loan-documents/kyc.pdf', resourceType: 'raw' }],
    ['no version segment', 'https://res.cloudinary.com/democloud/image/upload/testimonials/a.png', { publicId: 'testimonials/a', resourceType: 'image' }],
    ['other cloud rejected', 'https://res.cloudinary.com/someoneelse/image/upload/v1/x.jpg', null],
    ['non-cloudinary host rejected', 'https://evil.example/democloud/image/upload/v1/x.jpg', null],
    ['garbage rejected', 'not a url', null],
    ['private delivery type rejected', 'https://res.cloudinary.com/democloud/image/private/v1/x.jpg', null],
  ];

  for (const [name, url, want] of cases) {
    const got = parseCloudinaryUrl(url);
    const ok = JSON.stringify(got) === JSON.stringify(want);
    ok ? passed++ : failed++;
    console.log(`  ${ok ? '✓' : '✗'} ${name}${ok ? '' : ` — got ${JSON.stringify(got)}`}`);
  }
} finally {
  rmSync(OUT, { recursive: true, force: true });
}
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
