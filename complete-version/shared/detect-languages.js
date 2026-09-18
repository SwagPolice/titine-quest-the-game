// Single source of truth for "which languages does this project have content
// for" — auto-detected from which board-rules.<lang>.js / characters.<lang>.js
// / rulebook.<lang>.md files exist on disk (excluding English, the fixed
// reference language every build script and check already treats specially).
//
// Both check-lang-parity.js and every build script that needs a language
// list import this instead of keeping their own copy, so adding a language's
// three data files is enough to make every one of them pick it up
// automatically — no LANGS array to remember to update by hand.

const fs = require('fs');
const path = require('path');

const BOARDS_DIR = path.join(__dirname, '../boards');
const CHARACTERS_DIR = path.join(__dirname, '../classes/class_cards');
const RULEBOOK_DIR = path.join(__dirname, '../rulebook');

function scan(dir, filePattern) {
  return fs.readdirSync(dir)
    .map((f) => f.match(filePattern))
    .filter(Boolean)
    .map((m) => m[1])
    .filter((lang) => lang !== 'en');
}

// Returns:
//   board, characters, rulebook — the raw per-file-type language lists, for
//                callers (like check-lang-parity.js) that want to deep-check
//                whatever files DO exist even when a language isn't complete.
//   complete   — languages with all three file types present, safe to build.
//   incomplete — [{ lang, missing: [...] }] for languages missing at least
//                one file type (a translation in progress).
function detectLanguages() {
  const board = scan(BOARDS_DIR, /^board-rules\.([a-z]{2,5})\.js$/);
  const chars = scan(CHARACTERS_DIR, /^characters\.([a-z]{2,5})\.js$/);
  const rulebook = scan(RULEBOOK_DIR, /^rulebook\.([a-z]{2,5})\.md$/);
  const all = [...new Set([...board, ...chars, ...rulebook])].sort();

  const complete = [];
  const incomplete = [];
  for (const lang of all) {
    const missing = [];
    if (!board.includes(lang)) missing.push('boards/board-rules.' + lang + '.js');
    if (!chars.includes(lang)) missing.push('classes/class_cards/characters.' + lang + '.js');
    if (!rulebook.includes(lang)) missing.push('rulebook/rulebook.' + lang + '.md');
    if (missing.length === 0) complete.push(lang);
    else incomplete.push({ lang, missing });
  }
  return { board, characters: chars, rulebook, complete, incomplete };
}

module.exports = { detectLanguages };
