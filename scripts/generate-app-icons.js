// Regenerate the PWA/app icons from the isolated EzyLoan logo mark so the
// installed app icon shows the WHOLE logo, never clipped, on a clean opaque
// background — including on Android where the launcher masks icons into a
// circle/squircle.
//
// The problem we fix: the old icon-192/512 had the logo bleeding to the very
// edges on a TRANSPARENT background. When Android masks it, the outer blue shape,
// the top arrow and the bottom-right ₹ coin got sliced off, and the transparent
// corners showed the wallpaper. Proper icons need (a) a solid background and
// (b) the artwork kept inside a safe zone with padding around it.
//
// Run:  node scripts/generate-app-icons.js
//
// Outputs (public/):
//   icon-192.png, icon-512.png            purpose "any"      — logo ~80%, white bg
//   icon-maskable-192.png, -512.png       purpose "maskable" — logo ~64%, white bg
//   apple-icon.png (180)                  iOS home screen    — logo ~80%, white bg

const sharp = require('sharp');
const path = require('path');

const PUB = path.join(__dirname, '..', 'public');
const SOURCE = path.join(PUB, 'icon-512.png'); // the isolated logo mark
const BG = '#ffffff';

// Build one square icon: white square + the trimmed logo centered at `fraction`
// of the icon size (fit: contain preserves the logo's aspect ratio, so nothing
// is ever stretched or cropped).
async function makeIcon(size, fraction, outName) {
  const inner = Math.round(size * fraction);

  // Trim the transparent border off the source so `fraction` controls the real
  // logo size (not its baked-in whitespace), then flatten onto white so any
  // semi-transparent edges composite cleanly.
  const logo = await sharp(SOURCE)
    .trim()
    .resize(inner, inner, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: { width: size, height: size, channels: 4, background: BG },
  })
    .composite([{ input: logo, gravity: 'center' }])
    .flatten({ background: BG }) // guarantee a fully OPAQUE icon (no wallpaper bleed)
    .png()
    .toFile(path.join(PUB, outName));

  console.log('✓', outName, `${size}x${size} (logo ${Math.round(fraction * 100)}%)`);
}

(async () => {
  // "any" icons — a little padding so the logo breathes and never touches edges.
  await makeIcon(512, 0.8, 'icon-512.png');
  await makeIcon(192, 0.8, 'icon-192.png');

  // "maskable" icons — the logo must sit inside the central safe zone (Android
  // may crop everything outside a circle of ~80% diameter), so keep it smaller.
  await makeIcon(512, 0.64, 'icon-maskable-512.png');
  await makeIcon(192, 0.64, 'icon-maskable-192.png');

  // Apple touch icon (iOS rounds the square itself; just needs opaque + padded).
  await makeIcon(180, 0.8, 'apple-icon.png');

  console.log('\nAll app icons regenerated.');
})().catch((e) => {
  console.error('Icon generation failed:', e);
  process.exit(1);
});
