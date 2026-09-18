// Shared markdown-it setup for rendering rulebook.md / rulebook.fr.md, used
// by both build.js (the interactive rulebook.html) and build-pdf.js (the
// print-ready PDF) so the two don't drift apart on heading ids, typographic
// quotes, or the custom :::-container syntax.

const fs = require('fs');
const MarkdownIt = require('markdown-it');
const container = require('markdown-it-container');

const CONTAINERS = ['logistics-grid', 'logistics-card', 'warning-box'];
// A language without its own registered quote style (i.e. a freshly
// scaffolded language, not yet localized here) falls back to the English
// convention rather than crashing markdown-it's typographer.
const QUOTES = { en: '“”‘’', fr: '«»‹›' };
const DEFAULT_QUOTES = QUOTES.en;

// Mirrors pandoc's auto_identifiers algorithm closely enough to keep stable
// anchor ids: strip everything but letters/digits/whitespace/-_.,
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
  const md = new MarkdownIt({ html: true, xhtmlOut: true, typographer: true, quotes: QUOTES[lang] || DEFAULT_QUOTES });

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

// Renders an .md file to a raw HTML body (no wrapping container).
function renderBody(mdFile, lang) {
  const md = makeMarkdownIt(lang);
  const source = fs.readFileSync(mdFile, 'utf8');
  return md.render(source);
}

module.exports = { slugify, makeMarkdownIt, renderBody };
