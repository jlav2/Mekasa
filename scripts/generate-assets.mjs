// Renders the app icon + splash assets from the design canvas recipe (screen 6d).
// Usage: node scripts/generate-assets.mjs   (re-run after tweaking; outputs to assets/)
import sharp from 'sharp';
import opentype from 'opentype.js';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const out = (f) => path.join(root, 'assets', f);
const fontPath = (p) => path.join(root, 'node_modules', '@expo-google-fonts', p);

const CREAM = '#FFFDF6';
const PETROL = '#0E4F5E';
const PETROL_DEEP = '#093A46';

// Hebrew is RTL; opentype.js draws glyphs in given order LTR. Reversing the
// string yields the correct visual order (safe here: no marks/ligatures).
const rtl = (s) => [...s].reverse().join('');

const loadFont = (p) => {
  const b = fs.readFileSync(p);
  return opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));
};
const karantina = loadFont(fontPath('karantina/700Bold/Karantina_700Bold.ttf'));
const heebo = loadFont(fontPath('heebo/600SemiBold/Heebo_600SemiBold.ttf'));

function textPath(font, text, sizePx, cx, baselineY, fill) {
  const shaped = rtl(text);
  const width = font.getAdvanceWidth(shaped, sizePx);
  const p = font.getPath(shaped, cx - width / 2, baselineY, sizePx);
  return `<path d="${p.toPathData(2)}" fill="${fill}"/>`;
}

// ---- icon glyph (viewBox 0 0 120 120, from the 6d board) ----
const GRADIENT = `
  <linearGradient id="g" x1="0" y1="0" x2="0.35" y2="1">
    <stop offset="0" stop-color="#FFC46B"/>
    <stop offset="0.4" stop-color="#FF9D52"/>
    <stop offset="1" stop-color="#F0862F"/>
  </linearGradient>`;

const WAVE = `<path d="M0 88 Q30 84 60 88 T120 87 V120 H0 Z" fill="${PETROL}"/>`;
const RING = (stroke, dot) => `
  <g transform="rotate(-25 60 56)">
    <circle cx="60" cy="56" r="34" fill="none" stroke="${stroke}" stroke-width="6"
      stroke-dasharray="66 10 50 12 56 9" stroke-linecap="round"/>
  </g>
  <circle cx="60" cy="56" r="10" fill="${dot}"/>`;

const svgDoc = (size, viewBox, body) =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${viewBox}">${body}</svg>`);

const png = (svg, file) => sharp(svg, { density: 300 }).png().toFile(out(file));

// 1) iOS/universal icon — full bleed square (the OS masks its own corners)
await png(
  svgDoc(1024, '0 0 120 120', `<defs>${GRADIENT}</defs>
    <rect width="120" height="120" fill="url(#g)"/>${WAVE}${RING(CREAM, CREAM)}`),
  'icon.png',
);

// 2) Android adaptive: background = gradient only
await png(
  svgDoc(1024, '0 0 120 120', `<defs>${GRADIENT}</defs><rect width="120" height="120" fill="url(#g)"/>`),
  'android-icon-background.png',
);

// 3) Android adaptive: foreground = wave + ring, shrunk to the ~66% safe zone
const fgBody = `<g transform="translate(60 60) scale(0.72) translate(-60 -60)">${WAVE}${RING(CREAM, CREAM)}</g>`;
await sharp(svgDoc(1024, '0 0 120 120', fgBody), { density: 300 }).png().toFile(out('android-icon-foreground.png'));

// 4) Android adaptive: monochrome = ring glyph only, white
await sharp(
  svgDoc(1024, '0 0 120 120', `<g transform="translate(60 60) scale(0.72) translate(-60 -60)">${RING('#fff', '#fff')}</g>`),
  { density: 300 },
).png().toFile(out('android-icon-monochrome.png'));

// 5) favicon
await sharp(await sharp(svgDoc(1024, '0 0 120 120', `<defs>${GRADIENT}</defs>
    <rect width="120" height="120" rx="26" fill="url(#g)"/>${WAVE}${RING(CREAM, CREAM)}`, ), { density: 300 }).png().toBuffer())
  .resize(64, 64)
  .png()
  .toFile(out('favicon.png'));

// 6) Splash — full-bleed 1284x2778 (iPhone 3x), sky→petrol split at 62%
const W = 1284;
const H = 2778;
const split = Math.round(H * 0.62);
const ringCy = Math.round(H * 0.36);
const wordBaseline = ringCy + 570; // ring bottom + gap + Karantina cap height
const tagBaseline = wordBaseline + 112;
const splashRing = `
  <g transform="rotate(-25 ${W / 2} ${ringCy})">
    <circle cx="${W / 2}" cy="${ringCy}" r="240" fill="none" stroke="${CREAM}" stroke-width="29"
      stroke-dasharray="464 70 356 83 398 62" stroke-linecap="round"/>
  </g>
  <circle cx="${W / 2}" cy="${ringCy}" r="66" fill="${CREAM}"/>`;

const splashSvg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FFC46B"/>
      <stop offset="0.55" stop-color="#FF9D52"/>
      <stop offset="1" stop-color="#F0862F"/>
    </linearGradient>
    <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${PETROL}"/>
      <stop offset="1" stop-color="${PETROL_DEEP}"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${split}" fill="url(#sky)"/>
  <rect y="${split}" width="${W}" height="${H - split}" fill="url(#sea)"/>
  ${splashRing}
  ${textPath(karantina, 'מקאסה', 340, W / 2, wordBaseline, CREAM)}
  ${textPath(heebo, 'המעגל הבא שלך כבר על החול', 56, W / 2, tagBaseline, 'rgba(255,253,246,.85)')}
  <g fill="${CREAM}">
    <circle cx="${W / 2 + 30}" cy="${H - 300}" r="12" opacity="0.9"/>
    <circle cx="${W / 2}" cy="${H - 300}" r="12" opacity="0.45"/>
    <circle cx="${W / 2 - 30}" cy="${H - 300}" r="12" opacity="0.45"/>
  </g>
</svg>`);

await sharp(splashSvg, { density: 72 }).png().toFile(out('splash-icon.png'));

console.log('assets written: icon, adaptive fg/bg/mono, favicon, splash-icon');
