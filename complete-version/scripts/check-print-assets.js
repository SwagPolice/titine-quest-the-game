#!/usr/bin/env node
// Confirms every local link in index.html (rulebook, board, cards,
// components sheet, live generators, LICENSE, etc.) actually resolves to a
// file that exists on disk. A renamed or deleted print asset silently
// breaking a download link is a real, likely failure mode — this catches
// it without needing to open the page in a browser.
//
// Run: node complete-version/scripts/check-print-assets.js

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.join(__dirname, '../..');
const INDEX_HTML = path.join(REPO_ROOT, 'index.html');

const html = fs.readFileSync(INDEX_HTML, 'utf8');

const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);

const localHrefs = hrefs.filter((href) => {
  return !/^(https?:)?\/\//.test(href) && !href.startsWith('#') && !href.startsWith('mailto:');
});

const missing = [];
for (const href of localHrefs) {
  const filePath = path.join(REPO_ROOT, href);
  if (!fs.existsSync(filePath)) {
    missing.push(href);
  }
}

if (missing.length > 0) {
  console.error(`✗ Print-asset check failed: ${missing.length} local link(s) in index.html point to missing files:\n`);
  missing.forEach((href) => console.error(`  - ${href}`));
  process.exit(1);
} else {
  console.log(`✓ Print-asset check passed: all ${localHrefs.length} local links in index.html resolve to existing files.`);
}
