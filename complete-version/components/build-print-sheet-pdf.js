#!/usr/bin/env node
// Regenerates the print-ready, text-free components sheet (pawns, crown,
// ladders, and every ability token, in the box's actual quantities) via a
// controlled Puppeteer-driven Chrome — see ../shared/export-pngs.js for why
// this exists instead of relying on a manual browser print.
//
// Wordless by design (see print-sheet.html), so unlike the rulebook/board/
// cards there is exactly one PDF, shared by every language.
//
// Run: npm run build:components-pdf
// (needs a local Chrome install; set CHROME_PATH if it's not found automatically)

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
const { findChrome } = require('../shared/export-pngs');

const DIR = __dirname;
const OUT_DIR = path.join(DIR, 'print-assets');

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await puppeteer.launch({ executablePath: findChrome(), headless: true });
  const page = await browser.newPage();
  await page.goto(`file://${path.join(DIR, 'print-sheet.html')}`, { waitUntil: 'networkidle0' });

  const outFile = path.join(OUT_DIR, 'kalblast_components_print_sheet.pdf');
  await page.pdf({
    path: outFile,
    format: 'A4',
    printBackground: true,
    margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' },
  });

  await browser.close();
  console.log(`Done: ${path.relative(process.cwd(), outFile)}`);
})().catch((err) => {
  console.error('Components print sheet build failed:', err.message);
  process.exit(1);
});
