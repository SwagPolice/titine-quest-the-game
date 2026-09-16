// Shared Puppeteer boilerplate for the print-asset build scripts
// (classes/class_cards/build-card-pngs.js, boards/build-board-pngs.js).
//
// Why this exists: the in-browser "Download PNG" buttons run entirely in
// whoever's browser happens to open the file, which makes the result depend
// on things nobody controls — headless-vs-headed rendering differences,
// file:// CORS behavior, font-loading timing inside html-to-image's SVG
// rasterization step, browser extensions, etc. (one such issue took an
// extensive investigation to track down and was ultimately fixed at the CSS
// layout level, but nothing guarantees the next environment-specific quirk
// won't surface the same way). Generating the authoritative PNGs once, here,
// through a pinned local Chrome removes that dependency entirely — the
// interactive pages remain for live previewing, but this is the source of
// truth for what actually gets printed.

const fs = require('fs');
const puppeteer = require('puppeteer-core');

const CHROME_CANDIDATES = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', // macOS
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', // Windows
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe', // Windows (x86)
  '/usr/bin/google-chrome', // Linux
  '/usr/bin/google-chrome-stable', // Linux
  '/usr/bin/chromium-browser', // Linux (Chromium)
];

function findChrome() {
  if (process.env.CHROME_PATH) {
    if (!fs.existsSync(process.env.CHROME_PATH)) {
      throw new Error(`CHROME_PATH is set to "${process.env.CHROME_PATH}", but nothing exists there.`);
    }
    return process.env.CHROME_PATH;
  }
  const found = CHROME_CANDIDATES.find((p) => fs.existsSync(p));
  if (!found) {
    throw new Error(
      'Could not find a local Chrome install in any of the usual locations.\n' +
      'Set the CHROME_PATH environment variable to your Chrome executable and try again, e.g.:\n' +
      '  CHROME_PATH="/path/to/chrome" npm run build:card-pngs'
    );
  }
  return found;
}

// Launches Chrome headed (not headless) on purpose: this session confirmed
// headless and headed Chrome can rasterize html-to-image's SVG output
// differently, and headed is what an actual user's browser is — so it's the
// correct ground truth to generate the shipped assets from.
async function launchAndOpen(filePath) {
  const browser = await puppeteer.launch({
    executablePath: findChrome(),
    headless: false,
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 1000 });
  await page.goto(`file://${filePath}`, { waitUntil: 'networkidle0' });
  return { browser, page };
}

// Captures `nodeId` to a PNG buffer via the exact same htmlToImage call the
// in-page "Download PNG" buttons use, called directly through page.evaluate
// instead of going through the <a download> click/browser-download-dialog
// flow (which needs no extra CDP wiring here and is what every debugging
// script this session used successfully).
async function capturePng(page, nodeId) {
  const dataUrl = await page.evaluate(async (id) => {
    const node = document.getElementById(id);
    return htmlToImage.toPng(node, { quality: 1.0, pixelRatio: 2 });
  }, nodeId);
  const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');
  return Buffer.from(base64, 'base64');
}

module.exports = { findChrome, launchAndOpen, capturePng };
