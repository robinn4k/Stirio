// Rasterize the brand SVGs to PNG. Run manually when `icon_pwa.svg` or
// `og-image.svg` change — NOT part of CI.
//
//   npm run build:icons
//
// Outputs:
//   icon_ios.png      (256×256, opaque square; iOS applies its own mask)
//   og-image.png      (1200×630, Open Graph share card)

import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const rasterize = (svgPath, outPath, { width, stripRoundedCorners = false } = {}) => {
  let svg = readFileSync(resolve(repoRoot, svgPath), 'utf8');
  if (stripRoundedCorners) {
    // iOS applies its own rounded mask on top of apple-touch-icon. Leaving the
    // SVG's own rounded corners produces an ugly double-rounding at the edge.
    svg = svg.replace(/rx="\d+"\s+ry="\d+"/g, 'rx="0" ry="0"');
  }
  const resvg = new Resvg(svg, {
    // Liberation Serif has italic variants installed on most Linux distros;
    // DejaVu Serif does not ship italics, so font-style:italic would fall
    // back to upright. Prefer Liberation first so the OG wordmark italics
    // render as intended.
    font: { loadSystemFonts: true, defaultFontFamily: 'Liberation Serif' },
    fitTo: width ? { mode: 'width', value: width } : undefined,
  });
  const png = resvg.render().asPng();
  writeFileSync(resolve(repoRoot, outPath), png);
  console.log(`  ✓ ${outPath}  (${png.length.toLocaleString()} bytes)`);
};

console.log('Rasterizing Stirio brand assets…');
rasterize('icon_pwa.svg', 'icon_ios.png', { width: 256, stripRoundedCorners: true });
rasterize('og-image.svg', 'og-image.png');
console.log('Done.');
