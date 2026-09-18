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
const { detectLanguages } = require('../shared/detect-languages');

const DIR = __dirname;
const LANGS = ['en', ...detectLanguages().complete];

function renderFragment(mdFile, lang, hidden) {
  const body = renderBody(mdFile, lang);
  const hiddenAttr = hidden ? ' hidden' : '';
  return `<div class="rulebook-container" data-lang-content="${lang}"${hiddenAttr}>\n${body}</div>\n`;
}

const head = fs.readFileSync(path.join(DIR, 'rulebook-head.html'), 'utf8');
const foot = fs.readFileSync(path.join(DIR, 'rulebook-foot.html'), 'utf8');
const fragments = LANGS.map((lang, i) => {
  const mdFile = lang === 'en' ? 'rulebook.md' : `rulebook.${lang}.md`;
  return renderFragment(path.join(DIR, mdFile), lang, i !== 0);
}).join('');

fs.writeFileSync(path.join(DIR, 'rulebook.html'), head + fragments + foot);
console.log(`rulebook.html regenerated (${LANGS.map((l) => l.toUpperCase()).join(' + ')}) from rulebook.md / rulebook.<lang>.md`);
