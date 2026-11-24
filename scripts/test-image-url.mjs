// Unit tests for lib/imageUrl.ts (pure, no network). Part of `npm run test:unit`.
const { resizedImage, resizedSrcSet } = await import('../lib/imageUrl.ts');

let passed = 0;
let failed = 0;
const check = (name, actual, expected) => {
  const ok = actual === expected;
  ok ? passed++ : failed++;
  console.log(`  ${ok ? '✓' : '✗'} ${name}${ok ? '' : `\n      got:      ${actual}\n      expected: ${expected}`}`);
};

const C = 'https://res.cloudinary.com/demo/image/upload/v1792988969/blogs/abc.jpg';
check('cloudinary: crop transform inserted after /upload/', resizedImage(C, 400, 225),
  'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_fill,g_auto,w_400,h_225/v1792988969/blogs/abc.jpg');
check('cloudinary: width-only uses c_limit', resizedImage(C, 800),
  'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_limit,w_800/v1792988969/blogs/abc.jpg');
const T = 'https://res.cloudinary.com/demo/image/upload/c_fill,w_300/v1/blogs/abc.jpg';
check('cloudinary: existing transformation left alone', resizedImage(T, 400), T);
check('cloudinary: no version segment', resizedImage('https://res.cloudinary.com/demo/image/upload/blogs/x.png', 200),
  'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_limit,w_200/blogs/x.png');
check('cloudinary raw (PDF) untouched', resizedImage('https://res.cloudinary.com/demo/raw/upload/v1/x.pdf', 400), 'https://res.cloudinary.com/demo/raw/upload/v1/x.pdf');
check('unsplash: w replaced, crop added', resizedImage('https://images.unsplash.com/photo-1?auto=format&fit=crop&w=1200&q=70', 400, 225),
  'https://images.unsplash.com/photo-1?auto=format&fit=crop&w=400&q=70&h=225');
check('local path untouched', resizedImage('/car_image.webp', 400), '/car_image.webp');
check('other host untouched', resizedImage('https://example.com/a.jpg', 400), 'https://example.com/a.jpg');
check('lookalike host untouched', resizedImage('https://res.cloudinary.com.evil.io/demo/image/upload/a.jpg', 400), 'https://res.cloudinary.com.evil.io/demo/image/upload/a.jpg');
check('empty → empty string', resizedImage(undefined, 400), '');
check('srcSet for cloudinary', resizedSrcSet(C, [400, 800], 0.5625),
  'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_fill,g_auto,w_400,h_225/v1792988969/blogs/abc.jpg 400w, https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_fill,g_auto,w_800,h_450/v1792988969/blogs/abc.jpg 800w');
check('srcSet undefined for non-resizable host', resizedSrcSet('/a.webp', [400, 800]), undefined);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
