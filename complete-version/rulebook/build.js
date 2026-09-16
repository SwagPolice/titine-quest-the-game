#!/usr/bin/env node
// Regenerates rulebook.html from rulebook.md + rulebook.fr.md.
//
// Pure-JS (markdown-it) on purpose: it behaves identically on every OS, so
// there's nothing extra to install or keep in sync between machines beyond
// `npm install` at the repo root. Run via `npm run build:rulebook`, or
// directly with `node build.js` / build.sh / build.ps1 from this folder.

const fs = require('fs');
const path = require('path');
const { renderBody } = require('./markdown-renderer');

const DIR = __dirname;

function renderFragment(mdFile, lang, hidden) {
  const body = renderBody(mdFile, lang);
  const hiddenAttr = hidden ? ' hidden' : '';
  return `<div class="rulebook-container" data-lang-content="${lang}"${hiddenAttr}>\n${body}</div>\n`;
}

const head = fs.readFileSync(path.join(DIR, 'rulebook-head.html'), 'utf8');
const foot = fs.readFileSync(path.join(DIR, 'rulebook-foot.html'), 'utf8');
const en = renderFragment(path.join(DIR, 'rulebook.md'), 'en', false);
const fr = renderFragment(path.join(DIR, 'rulebook.fr.md'), 'fr', true);

fs.writeFileSync(path.join(DIR, 'rulebook.html'), head + en + fr + foot);
console.log('rulebook.html regenerated (EN + FR) from rulebook.md / rulebook.fr.md');
