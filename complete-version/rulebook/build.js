#!/usr/bin/env node
// Regenerates rulebook.html from rulebook.md + rulebook.fr.md.
//
// Pure-JS (markdown-it) on purpose: it behaves identically on every OS, so
// there's nothing extra to install or keep in sync between machines beyond
// `npm install` at the repo root. Run via `npm run build:rulebook`, or
// directly with `node build.js` / build.sh / build.ps1 from this folder.

const fs = require('fs');
const path = require('path');
const MarkdownIt = require('markdown-it');
const container = require('markdown-it-container');

const DIR = __dirname;
const CONTAINERS = ['logistics-grid', 'logistics-card', 'warning-box'];
const QUOTES = { en: '“”‘’', fr: '«»‹›' };

// Mirrors pandoc's auto_identifiers algorithm closely enough to keep the
// same anchor ids: strip everything but letters/digits/whitespace/-_.,
// collapse whitespace runs to a single hyphen, lowercase, then drop any
// leading run of non-letters.
function slugify(text) {
  const stripped = text
    .replace(/[*_`]/g, '')
    .replace(/[^\p{L}\p{N}\s\-_.]/gu, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .replace(/^[^\p{L}]+/u, '');
  return stripped || 'section';
}

function makeMarkdownIt(lang) {
  const md = new MarkdownIt({ html: true, xhtmlOut: true, typographer: true, quotes: QUOTES[lang] });

  CONTAINERS.forEach(name => {
    md.use(container, name, {
      validate: params => params.trim().split(/\s+/)[0] === name,
      render: (tokens, idx) => (tokens[idx].nesting === 1 ? `<div class="${name}">\n` : `</div>\n`)
    });
  });

  const usedIds = new Map();
  md.renderer.rules.heading_open = (tokens, idx, options, env, self) => {
    const inline = tokens[idx + 1];
    const rawText = inline.children
      .filter(t => t.type === 'text' || t.type === 'code_inline' || t.type === 'softbreak')
      .map(t => (t.type === 'softbreak' ? ' ' : t.content))
      .join('');
    let id = slugify(rawText);
    const seen = usedIds.get(id) || 0;
    usedIds.set(id, seen + 1);
    if (seen > 0) id = `${id}-${seen}`;
    tokens[idx].attrSet('id', id);
    return self.renderToken(tokens, idx, options);
  };

  return md;
}

function renderFragment(mdFile, lang, hidden) {
  const md = makeMarkdownIt(lang);
  const source = fs.readFileSync(mdFile, 'utf8');
  const body = md.render(source);
  const hiddenAttr = hidden ? ' hidden' : '';
  return `<div class="rulebook-container" data-lang-content="${lang}"${hiddenAttr}>\n${body}</div>\n`;
}

const head = fs.readFileSync(path.join(DIR, 'rulebook-head.html'), 'utf8');
const foot = fs.readFileSync(path.join(DIR, 'rulebook-foot.html'), 'utf8');
const en = renderFragment(path.join(DIR, 'rulebook.md'), 'en', false);
const fr = renderFragment(path.join(DIR, 'rulebook.fr.md'), 'fr', true);

fs.writeFileSync(path.join(DIR, 'rulebook.html'), head + en + fr + foot);
console.log('rulebook.html regenerated (EN + FR) from rulebook.md / rulebook.fr.md');
