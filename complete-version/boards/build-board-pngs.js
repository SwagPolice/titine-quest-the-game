#!/usr/bin/env node
// Regenerates the authoritative, print-ready board PNGs (both languages) via
// a controlled Puppeteer-driven Chrome — see ../shared/export-pngs.js for
// why this exists instead of relying on the in-browser "Download PNG" button.
//
// Run: npm run build:board-pngs
// (needs a local Chrome install; set CHROME_PATH if it's not found automatically)

const fs = require('fs');
const path = require('path');
const { launchAndOpen, capturePng } = require('../shared/export-pngs');

const DIR = __dirname;
const OUT_DIR = path.join(DIR, 'print-assets');
const LANGS = ['en', 'fr'];

(async () => {
  const { browser, page } = await launchAndOpen(path.join(DIR, 'board.html'));
  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (const lang of LANGS) {
    if (lang !== 'en') {
      await page.click(`[data-lang-btn="${lang}"]`);
      await new Promise((r) => setTimeout(r, 300)); // let re-render settle
    }

    const filename = `kalblast_perfected_board_${lang}.png`;
    const buffer = await capturePng(page, 'board-capture-wrapper');
    fs.writeFileSync(path.join(OUT_DIR, filename), buffer);
    console.log(`  ${filename}`);
  }

  await browser.close();
  console.log(`Done: board PNGs written to ${path.relative(process.cwd(), OUT_DIR)}/`);
})().catch((err) => {
  console.error('Board PNG build failed:', err.message);
  process.exit(1);
});
