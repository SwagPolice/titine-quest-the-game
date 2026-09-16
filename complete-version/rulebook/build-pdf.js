#!/usr/bin/env node
// Generates print-ready rulebook PDFs (one per language) via a controlled
// Puppeteer-driven Chrome. Reuses findChrome() from ../shared/export-pngs.js
// (the board/card PNG exports), but NOT its headed-Chrome launch helper:
// this uses Chrome's native page.pdf() print pipeline, not html-to-image's
// SVG-rasterization trick, so it doesn't inherit that script's headless-vs-
// headed font quirks — cross-origin Google Fonts just load normally here.
//
// Run: npm run build:rulebook-pdf
// (needs a local Chrome install; set CHROME_PATH if it's not found automatically)

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
const { findChrome } = require('../shared/export-pngs');
const { renderBody } = require('./markdown-renderer');

const DIR = __dirname;
const OUT_DIR = path.join(DIR, 'print-assets');
const TITLES = { en: 'KALBLAST — Rulebook', fr: 'KALBLAST — Livret de règles' };

const TARGETS = [
  { md: path.join(DIR, 'rulebook.md'), lang: 'en', out: 'kalblast_rulebook_en.pdf' },
  { md: path.join(DIR, 'rulebook.fr.md'), lang: 'fr', out: 'kalblast_rulebook_fr.pdf' },
];

function buildHtml(mdFile, lang) {
  const body = renderBody(mdFile, lang);
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8">
<title>${TITLES[lang]}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Monoton&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="rulebook-print.css">
</head>
<body>
${body}
</body>
</html>
`;
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await puppeteer.launch({ executablePath: findChrome(), headless: true });
  const page = await browser.newPage();

  for (const { md, lang, out } of TARGETS) {
    const tempFile = path.join(DIR, `_pdf-source.${lang}.html`);
    fs.writeFileSync(tempFile, buildHtml(md, lang));
    try {
      await page.goto(`file://${tempFile}`, { waitUntil: 'networkidle0' });
      await page.evaluateHandle('document.fonts.ready');
      await page.pdf({
        path: path.join(OUT_DIR, out),
        format: 'A4',
        printBackground: true,
        margin: { top: '14mm', bottom: '14mm', left: '12mm', right: '12mm' },
      });
      console.log(`  ${out}`);
    } finally {
      fs.unlinkSync(tempFile);
    }
  }

  await browser.close();
  console.log(`Done: rulebook PDFs written to ${path.relative(process.cwd(), OUT_DIR)}/`);
})().catch((err) => {
  console.error('Rulebook PDF build failed:', err.message);
  process.exit(1);
});
