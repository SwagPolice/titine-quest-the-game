#!/usr/bin/env node
// Regenerates the two-page, A4-printable board split (one PDF per language)
// by cropping the already-authoritative board PNGs — never re-rendering
// board.html itself. See board-print-a4.html for why, and
// ../rulebook/build-pdf.js / ../components/build-print-sheet-pdf.js for the
// page.pdf() pattern this follows.
//
// The existing single-sheet A3 PNG export (build-board-pngs.js) is
// untouched by this script and stays available as a fallback.
//
// Run: npm run build:board-a4-pdf
// (needs a local Chrome install; set CHROME_PATH if it's not found automatically)

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
const { findChrome } = require('../shared/export-pngs');

const DIR = __dirname;
const OUT_DIR = path.join(DIR, 'print-assets');
const LANGS = ['en', 'fr'];

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await puppeteer.launch({ executablePath: findChrome(), headless: true });
  const page = await browser.newPage();
  await page.goto(`file://${path.join(DIR, 'board-print-a4.html')}`, { waitUntil: 'networkidle0' });

  for (const lang of LANGS) {
    if (lang !== 'en') {
      await page.evaluate((l) => {
        const src = `print-assets/kalblast_perfected_board_${l}.png`;
        document.getElementById('board-img-left').src = src;
        document.getElementById('board-img-right').src = src;
      }, lang);
      await page.evaluate(() => document.fonts.ready);
      await new Promise((r) => setTimeout(r, 200)); // let the swapped image settle
    }

    const outFile = path.join(OUT_DIR, `kalblast_board_a4_${lang}.pdf`);
    await page.pdf({
      path: outFile,
      format: 'A4',
      printBackground: true,
      margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' },
    });
    console.log(`  ${path.relative(process.cwd(), outFile)}`);
  }

  await browser.close();
  console.log(`Done: board A4 split written to ${path.relative(process.cwd(), OUT_DIR)}/`);
})().catch((err) => {
  console.error('Board A4 split build failed:', err.message);
  process.exit(1);
});
