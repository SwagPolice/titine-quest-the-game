#!/usr/bin/env node
// Cross-checks every non-English language's content data files for
// structural drift against English, the canonical reference language.
//
// Text (flavor, descriptions, names, titles) is expected to differ between
// languages — that's the point. What must NOT differ are the mechanical bits:
// array length/order, non-text fields (image/color/difficulty/abilityCost),
// and the count of game-meaningful markup (bold/italic/line-break tags, the
// "Š" shot symbol) per corresponding field, since a translator dropping a
// <b> around a keyword or an Š changes the printed rules, not just the prose.
//
// Languages are detected automatically from which board-rules.<lang>.js /
// characters.<lang>.js / rulebook.<lang>.md files exist on disk — adding a
// new language's files is enough to bring it under this check, no edit to
// this script required. Each file must export its data under a
// language-suffixed name (roomTexts_<lang>, characters_<lang>), matching the
// convention every existing language file already follows.
//
// Run: node complete-version/scripts/check-lang-parity.js

const fs = require('fs');
const path = require('path');
const { detectLanguages } = require('../shared/detect-languages');

const BOARDS_DIR = path.join(__dirname, '../boards');
const CHARACTERS_DIR = path.join(__dirname, '../classes/class_cards');
const RULEBOOK_DIR = path.join(__dirname, '../rulebook');

const errors = [];

const { board: boardLangs, characters: charLangs, rulebook: rulebookLangs, incomplete } = detectLanguages();
const allLangs = [...new Set([...boardLangs, ...charLangs, ...rulebookLangs])].sort();

// A language should have all three files, or none — a partial translation
// silently missing one data type is worth flagging just as loudly as a
// structural drift within a file that does exist. Whatever files DO exist
// still get deep-checked below (via boardLangs/charLangs/rulebookLangs).
for (const { lang, missing } of incomplete) {
  missing.forEach((rel) => errors.push(`Language "${lang}": missing complete-version/${rel}`));
}

function countOccurrences(text, token) {
  return text.split(token).length - 1;
}

const MARKUP_TOKENS = ['<b>', '</b>', '<i>', '</i>', '<br>', 'Š'];

function checkMarkupParity(label, enText, otherText, langLabel) {
  for (const token of MARKUP_TOKENS) {
    const enCount = countOccurrences(enText, token);
    const otherCount = countOccurrences(otherText, token);
    if (enCount !== otherCount) {
      errors.push(
        `${label}: "${token}" count differs (EN: ${enCount}, ${langLabel}: ${otherCount})\n` +
        `    EN: ${enText}\n    ${langLabel}: ${otherText}`
      );
    }
  }
}

// ---- Board room texts --------------------------------------------------

const { roomTexts_en } = require(path.join(BOARDS_DIR, 'board-rules.en.js'));

for (const lang of boardLangs) {
  const upper = lang.toUpperCase();
  const mod = require(path.join(BOARDS_DIR, `board-rules.${lang}.js`));
  const roomTexts_lang = mod[`roomTexts_${lang}`];
  if (!roomTexts_lang) {
    errors.push(`board-rules.${lang}.js: expected export "roomTexts_${lang}" not found`);
    continue;
  }
  if (roomTexts_en.length !== roomTexts_lang.length) {
    errors.push(`Room text array length mismatch: EN has ${roomTexts_en.length}, ${upper} has ${roomTexts_lang.length}`);
    continue;
  }
  roomTexts_en.forEach((en, i) => {
    const other = roomTexts_lang[i];
    const enEmpty = !en || en.trim() === '';
    const otherEmpty = !other || other.trim() === '';
    if (enEmpty !== otherEmpty) {
      errors.push(`Room ${i} (${upper}): one language is empty and the other isn't (EN: "${en}", ${upper}: "${other}")`);
      return;
    }
    if (!enEmpty) {
      checkMarkupParity(`Room ${i} (${upper})`, en, other, upper);
    }
  });
}

// ---- Character cards ----------------------------------------------------

const { characters_en } = require(path.join(CHARACTERS_DIR, 'characters.en.js'));

const STRUCTURAL_FIELDS = ['image', 'color', 'difficulty', 'abilityCost'];
const MARKUP_CHECKED_FIELDS = ['traitDesc', 'abilityDesc'];
const REQUIRED_TEXT_FIELDS = ['name', 'title', 'traitName', 'traitDesc', 'abilityName', 'abilityCost', 'abilityDesc', 'flavor'];

for (const lang of charLangs) {
  const upper = lang.toUpperCase();
  const mod = require(path.join(CHARACTERS_DIR, `characters.${lang}.js`));
  const characters_lang = mod[`characters_${lang}`];
  if (!characters_lang) {
    errors.push(`characters.${lang}.js: expected export "characters_${lang}" not found`);
    continue;
  }
  if (characters_en.length !== characters_lang.length) {
    errors.push(`Character array length mismatch: EN has ${characters_en.length}, ${upper} has ${characters_lang.length}`);
    continue;
  }
  characters_en.forEach((en, i) => {
    const other = characters_lang[i];
    if (!other) {
      errors.push(`Character ${i} ("${en.name}"): missing in ${upper} data`);
      return;
    }

    STRUCTURAL_FIELDS.forEach((field) => {
      if (en[field] !== other[field]) {
        errors.push(
          `Character ${i} ("${en.name}"): field "${field}" must be identical across languages ` +
          `(EN: ${JSON.stringify(en[field])}, ${upper}: ${JSON.stringify(other[field])})`
        );
      }
    });

    REQUIRED_TEXT_FIELDS.forEach((field) => {
      if (!other[field] || String(other[field]).trim() === '') {
        errors.push(`Character ${i} ("${en.name}"): ${upper} field "${field}" is empty`);
      }
    });

    MARKUP_CHECKED_FIELDS.forEach((field) => {
      if (en[field] && other[field]) {
        checkMarkupParity(`Character ${i} ("${en.name}").${field} (${upper})`, en[field], other[field], upper);
      }
    });
  });
}

// ---- Rulebook (prose, not a data array — check structure, not content) ----

const rulebookEn = fs.readFileSync(path.join(RULEBOOK_DIR, 'rulebook.md'), 'utf8');

function countToken(text, token) {
  return text.split(token).length - 1;
}

function countRegex(text, regex) {
  const matches = text.match(regex);
  return matches ? matches.length : 0;
}

const RULEBOOK_CHECKS = [
  { label: 'H2 sections (##)', regex: /^##\s/gm },
  { label: 'H3 sections (###)', regex: /^###\s/gm },
  { label: 'Fenced divs (:::)', token: ':::' },
  { label: 'Bold markers (**)', token: '**' },
  { label: 'Inline code (`)', token: '`' },
  { label: 'Shot symbol (Š)', token: 'Š' },
];

for (const lang of rulebookLangs) {
  const upper = lang.toUpperCase();
  const rulebookOther = fs.readFileSync(path.join(RULEBOOK_DIR, `rulebook.${lang}.md`), 'utf8');
  RULEBOOK_CHECKS.forEach(({ label, token, regex }) => {
    const enCount = regex ? countRegex(rulebookEn, regex) : countToken(rulebookEn, token);
    const otherCount = regex ? countRegex(rulebookOther, regex) : countToken(rulebookOther, token);
    if (enCount !== otherCount) {
      errors.push(`Rulebook (${upper}): "${label}" count differs (EN: ${enCount}, ${upper}: ${otherCount})`);
    }
  });
}

// ---- Report --------------------------------------------------------------

if (errors.length > 0) {
  console.error(`✗ Language parity check failed with ${errors.length} issue(s):\n`);
  errors.forEach((e) => console.error(`  - ${e}\n`));
  process.exit(1);
} else if (allLangs.length === 0) {
  console.log('✓ Language parity check passed: no non-English language files found to check.');
} else {
  console.log(`✓ Language parity check passed: ${allLangs.map((l) => l.toUpperCase()).join(', ')} structurally in sync with EN.`);
}
