#!/usr/bin/env node
// Regenerates the authoritative, print-ready character card PNGs (both
// languages) via a controlled Puppeteer-driven Chrome — see
// ../shared/export-pngs.js for why this exists instead of relying on the
// in-browser "Download PNG" buttons.
//
// Run: npm run build:card-pngs
// (needs a local Chrome install; set CHROME_PATH if it's not found automatically)

const fs = require('fs');
const path = require('path');
const { launchAndOpen, capturePng } = require('../../shared/export-pngs');
const { detectLanguages } = require('../../shared/detect-languages');

const DIR = __dirname;
const OUT_DIR = path.join(DIR, 'print-assets');
const LANGS = ['en', ...detectLanguages().complete];

(async () => {
  const { browser, page } = await launchAndOpen(path.join(DIR, 'baseline.html'));

  let total = 0;
  for (const lang of LANGS) {
    if (lang !== 'en') {
      await page.click(`[data-lang-btn="${lang}"]`);
      await new Promise((r) => setTimeout(r, 300)); // let re-render settle
    }

    const outDir = path.join(OUT_DIR, lang);
    fs.mkdirSync(outDir, { recursive: true });

    const cards = await page.evaluate((l) => {
      // charactersByLang/characters_en (defined in baseline.html) are both
      // `const`, so they aren't reachable via window[...] — but page.evaluate
      // runs in the page's own global scope, so referencing them directly by
      // name works fine. Filenames are always slugged from the English name
      // (see cardFilename's comment) so they don't rename every time a
      // translation of the nickname changes.
      const chars = charactersByLang[l];
      return chars.map((c, i) => ({ id: `card-${i}`, filename: cardFilename(characters_en[i].name, l) }));
    }, lang);

    for (const { id, filename } of cards) {
      const buffer = await capturePng(page, id);
      fs.writeFileSync(path.join(outDir, filename), buffer);
      console.log(`  ${lang}/${filename}`);
      total++;
    }
  }

  await browser.close();
  console.log(`Done: ${total} card PNGs written to ${path.relative(process.cwd(), OUT_DIR)}/`);
})().catch((err) => {
  console.error('Card PNG build failed:', err.message);
  process.exit(1);
});
