#!/usr/bin/env node
/**
 * IMAGE OPTIMIZATION GUIDE — EzyLoan
 * 
 * WHY THIS MATTERS:
 * Lighthouse flagged 1,084 KB of oversized images.
 * The LCP image alone (image1.webp) was 284KB served at 189px display width.
 * After optimization: ~30–40KB → saves ~250KB per mobile visit.
 * 
 * Run: node optimize-images.js
 * Requires: npm install sharp
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const PUBLIC_DIR = path.join(__dirname, 'public');

/**
 * STEP 1: LCP IMAGE — Most critical fix.
 * Original: /homebanner/image1.webp — 1024×1536, 284KB
 * After: serve 280px wide on mobile = ~30KB saved per visit
 * 
 * Generate these variants:
 */
const LCP_VARIANTS = [
  { src: 'homebanner/image1.webp', width: 400,  quality: 75, suffix: '-400w' },
  { src: 'homebanner/image1.webp', width: 800,  quality: 80, suffix: '-800w' },
  // Keep original as 1024w fallback — no rename needed
];

/**
 * STEP 2: Service card images — 6 images, ~150–197KB each, served at 378×252.
 * These are lazy-loaded so less urgent than LCP, but still ~700KB combined waste.
 * 
 * Target display sizes:
 *   Mobile (1 col): ~calc(100vw - 32px) ≈ 360px wide
 *   Tablet (2 col):  ~calc(50vw - 24px)  ≈ 340px wide
 *   Desktop carousel: ~300px wide
 * 
 * So 400w covers all cases. Generate:
 */
const SERVICE_IMAGE_VARIANTS = [
  '2aaab97b-68e4-48f1-b5cb-4c8593864d29.webp',
  '00aa3850-ba76-4749-9c73-7f4edc3ce7cf.webp',
  'usedcarrefrance.webp',
  '618797752_122285828318199270_8453964291894126689_n.webp',
  'image.webp',
  '634044681_122289263786199270_3408391623228588228_n.webp',
].map(name => ({
  src: `homebanners/${name}`,
  width: 400,
  quality: 70,
  suffix: '-400w',
}));

async function generateVariant({ src, width, quality, suffix }) {
  const inputPath = path.join(PUBLIC_DIR, src);
  const ext = path.extname(src);
  const base = src.replace(ext, '');
  const outputPath = path.join(PUBLIC_DIR, `${base}${suffix}${ext}`);
  
  if (!fs.existsSync(inputPath)) {
    console.warn(`⚠️  Not found: ${inputPath}`);
    return;
  }
  
  await sharp(inputPath)
    .resize(width, null, { withoutEnlargement: true })
    .webp({ quality })
    .toFile(outputPath);
  
  const inputSize = Math.round(fs.statSync(inputPath).size / 1024);
  const outputSize = Math.round(fs.statSync(outputPath).size / 1024);
  console.log(`✅ ${src} → ${base}${suffix}${ext}`);
  console.log(`   ${inputSize}KB → ${outputSize}KB (saved ${inputSize - outputSize}KB)`);
}

async function main() {
  console.log('\n🚀 Generating responsive image variants...\n');
  
  const all = [...LCP_VARIANTS, ...SERVICE_IMAGE_VARIANTS];
  
  for (const variant of all) {
    try {
      await generateVariant(variant);
    } catch (err) {
      console.error(`❌ Failed: ${variant.src}`, err.message);
    }
  }
  
  console.log('\n✅ Done! Estimated savings: ~700KB per page load on mobile.\n');
  
  console.log('📋 NEXT STEPS:\n');
  console.log('1. Remove `unoptimized` from the LCP image in HeroSection.tsx');
  console.log('   (already done in the new HeroSection.tsx)\n');
  console.log('2. Ensure next.config.js has image optimization enabled:');
  console.log(`
   // next.config.js
   module.exports = {
     images: {
       formats: ['image/avif', 'image/webp'],
       // ✅ Do NOT set unoptimized: true globally
       deviceSizes: [320, 480, 640, 750, 828, 1080, 1200, 1920],
       imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
     },
   };
  `);
  console.log('3. Run: npm run build && npm run start');
  console.log('4. Re-run Lighthouse — LCP should drop from 6.3s to ~2–3s\n');
}

main().catch(console.error);

/**
 * =============================================================
 * MANUAL ALTERNATIVE (if you don't want to run the script):
 * 
 * Use squoosh.app or imageoptim.com to:
 *   1. homebanner/image1.webp    → resize to 400px wide, quality 75
 *      Save as: homebanner/image1-400w.webp
 *   2. Each homebanners/*.webp   → resize to 400px wide, quality 70
 *      Save as: homebanners/originalname-400w.webp
 * 
 * Or use the Cloudinary free tier to serve images with auto-format + resize:
 *   https://cloudinary.com/documentation/responsive_images
 * =============================================================
 * 
 * EXPECTED LIGHTHOUSE IMPROVEMENTS AFTER ALL CHANGES:
 * 
 * Before → After (estimated):
 *   LCP:         6.3s  → ~2.2–2.8s   (images + preload fix)
 *   TBT:         60ms  → ~30–40ms    (already good, GTM deferral helps)
 *   Speed Index: 4.4s  → ~2.5–3.2s  (images + render-blocking CSS)
 *   FCP:         1.1s  → ~0.8–1.0s  (font chain fix)
 *   Performance: ~55   → ~75–85
 * 
 * The render-blocking CSS (720ms) fix:
 *   The two CSS files (da97c117... and 7cca8e2c...) are Next.js built CSS.
 *   You cannot manually defer these, but you CAN reduce their size:
 *   - Unused CSS: 12.5KB flagged → run: npx @fullhuman/postcss-purgecss
 *   - Or use Tailwind's built-in purging (already configured via content in tailwind.config)
 *   - Check tailwind.config.js has correct content paths so unused classes get purged
 * 
 * TAILWIND PURGE CHECK:
 *   // tailwind.config.js
 *   module.exports = {
 *     content: [
 *       './pages/**\/*.{js,ts,jsx,tsx,mdx}',
 *       './components/**\/*.{js,ts,jsx,tsx,mdx}',
 *       './app/**\/*.{js,ts,jsx,tsx,mdx}',
 *     ],
 *     // ... rest of config
 *   };
 */