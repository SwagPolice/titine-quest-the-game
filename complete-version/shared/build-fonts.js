#!/usr/bin/env node
// Regenerates the self-hosted, base64-embedded Manrope @font-face rules and
// injects them directly into board.html and baseline.html.
//
// Why this exists, and why it's injected rather than linked: board.html and
// baseline.html get captured by html-to-image ("Download PNG"). To embed a
// font in the exported image, html-to-image needs to read the *text* of the
// stylesheet that defines its @font-face — but reading any linked file://
// stylesheet's rules is blocked by the browser ("SecurityError: Failed to
// read the 'cssRules' property"), regardless of whether that stylesheet
// points to a remote font URL or an already-inlined base64 one. The only
// way html-to-image can see the rule at all is if it lives in the page's
// own embedded <style> block. So this script fetches the real Manrope
// files, base64-encodes them, and splices the resulting @font-face rules
// directly between the `/* AUTO-GENERATED-FONTS:START/END */` markers
// inside each target file's <style> block.
//
// Run: node complete-version/shared/build-fonts.js
// (re-run only if the font family/weights below change)

const https = require('https');
const fs = require('fs');
const path = require('path');

const FAMILY = 'Manrope';
const WEIGHTS = [400, 500, 600, 700, 800];
const SUBSETS = ['latin', 'latin-ext']; // covers English + accented French text
const CHROME_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const TARGET_FILES = [
  path.join(__dirname, '..', 'boards', 'board.html'),
  path.join(__dirname, '..', 'classes', 'class_cards', 'baseline.html'),
];

const START_MARKER = '/* AUTO-GENERATED-FONTS:START */';
const END_MARKER = '/* AUTO-GENERATED-FONTS:END */';

function get(url, headers = {}) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(get(res.headers.location, headers));
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

(async () => {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${FAMILY}:wght@${WEIGHTS.join(';')}&display=swap`;
  const cssText = (await get(cssUrl, { 'User-Agent': CHROME_UA })).toString('utf8');

  // Each @font-face block is preceded by a `/* subset-name */` comment.
  const blockRe = /\/\*\s*([\w-]+)\s*\*\/\s*(@font-face\s*{[^}]*})/g;
  const blocks = [...cssText.matchAll(blockRe)]
    .filter(([, subset]) => SUBSETS.includes(subset));

  const rules = [];
  for (const [, subset, block] of blocks) {
    const weight = block.match(/font-weight:\s*(\d+)/)[1];
    const urlMatch = block.match(/url\((https:[^)]+\.woff2)\)/);
    const unicodeRange = block.match(/unicode-range:\s*([^;]+);/)[1];
    const fontBytes = await get(urlMatch[1]);
    const base64 = fontBytes.toString('base64');
    rules.push(
      `    @font-face {\n      font-family: '${FAMILY}';\n      font-style: normal;\n      font-weight: ${weight};\n      font-display: swap;\n      src: url(data:font/woff2;base64,${base64}) format('woff2');\n      unicode-range: ${unicodeRange};\n    }`
    );
    console.log(`  fetched ${FAMILY} ${weight} (${subset})`);
  }

  const injected = `${START_MARKER}\n${rules.join('\n\n')}\n    ${END_MARKER}`;

  for (const file of TARGET_FILES) {
    const html = fs.readFileSync(file, 'utf8');
    const markerRe = new RegExp(
      START_MARKER.replace(/[*]/g, '\\*') + '[\\s\\S]*?' + END_MARKER.replace(/[*]/g, '\\*')
    );
    if (!markerRe.test(html)) {
      throw new Error(`Could not find AUTO-GENERATED-FONTS markers in ${file}`);
    }
    fs.writeFileSync(file, html.replace(markerRe, injected));
    console.log(`  injected fonts into ${path.relative(process.cwd(), file)}`);
  }

  console.log(`Done (${rules.length} font-face rules embedded in ${TARGET_FILES.length} files)`);
})().catch((err) => {
  console.error('Font build failed:', err);
  process.exit(1);
});
