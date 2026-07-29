#!/usr/bin/env node
// Cross-checks the EN/FR content data files for structural drift.
//
// Text (flavor, descriptions, names, titles) is expected to differ between
// languages — that's the point. What must NOT differ are the mechanical bits:
// array length/order, non-text fields (image/color/difficulty/abilityCost),
// and the count of game-meaningful markup (bold/italic/line-break tags, the
// "Š" shot symbol) per corresponding field, since a translator dropping a
// <b> around a keyword or an Š changes the printed rules, not just the prose.
//
// Run: node complete-version/scripts/check-lang-parity.js

const fs = require('fs');
const path = require('path');

const { roomTexts_en } = require(path.join(__dirname, '../boards/board-rules.en.js'));
const { roomTexts_fr } = require(path.join(__dirname, '../boards/board-rules.fr.js'));
const { characters_en } = require(path.join(__dirname, '../classes/class_cards/characters.en.js'));
const { characters_fr } = require(path.join(__dirname, '../classes/class_cards/characters.fr.js'));

const errors = [];

function countOccurrences(text, token) {
  return text.split(token).length - 1;
}

const MARKUP_TOKENS = ['<b>', '</b>', '<i>', '</i>', '<br>', 'Š'];

function checkMarkupParity(label, enText, frText) {
  for (const token of MARKUP_TOKENS) {
    const enCount = countOccurrences(enText, token);
    const frCount = countOccurrences(frText, token);
    if (enCount !== frCount) {
      errors.push(
        `${label}: "${token}" count differs (EN: ${enCount}, FR: ${frCount})\n` +
        `    EN: ${enText}\n    FR: ${frText}`
      );
    }
  }
}

// ---- Board room texts --------------------------------------------------

if (roomTexts_en.length !== roomTexts_fr.length) {
  errors.push(`Room text array length mismatch: EN has ${roomTexts_en.length}, FR has ${roomTexts_fr.length}`);
} else {
  roomTexts_en.forEach((en, i) => {
    const fr = roomTexts_fr[i];
    const enEmpty = !en || en.trim() === '';
    const frEmpty = !fr || fr.trim() === '';
    if (enEmpty !== frEmpty) {
      errors.push(`Room ${i}: one language is empty and the other isn't (EN: "${en}", FR: "${fr}")`);
      return;
    }
    if (!enEmpty) {
      checkMarkupParity(`Room ${i}`, en, fr);
    }
  });
}

// ---- Character cards ----------------------------------------------------

const STRUCTURAL_FIELDS = ['image', 'color', 'difficulty', 'abilityCost'];
const MARKUP_CHECKED_FIELDS = ['traitDesc', 'abilityDesc'];
const REQUIRED_TEXT_FIELDS = ['name', 'title', 'traitName', 'traitDesc', 'abilityName', 'abilityCost', 'abilityDesc', 'flavor'];

if (characters_en.length !== characters_fr.length) {
  errors.push(`Character array length mismatch: EN has ${characters_en.length}, FR has ${characters_fr.length}`);
} else {
  characters_en.forEach((en, i) => {
    const fr = characters_fr[i];
    if (!fr) {
      errors.push(`Character ${i} ("${en.name}"): missing in FR data`);
      return;
    }

    STRUCTURAL_FIELDS.forEach(field => {
      if (en[field] !== fr[field]) {
        errors.push(
          `Character ${i} ("${en.name}"): field "${field}" must be identical across languages ` +
          `(EN: ${JSON.stringify(en[field])}, FR: ${JSON.stringify(fr[field])})`
        );
      }
    });

    REQUIRED_TEXT_FIELDS.forEach(field => {
      if (!fr[field] || String(fr[field]).trim() === '') {
        errors.push(`Character ${i} ("${en.name}"): FR field "${field}" is empty`);
      }
    });

    MARKUP_CHECKED_FIELDS.forEach(field => {
      if (en[field] && fr[field]) {
        checkMarkupParity(`Character ${i} ("${en.name}").${field}`, en[field], fr[field]);
      }
    });
  });
}

// ---- Rulebook (prose, not a data array — check structure, not content) ----

const rulebookEn = fs.readFileSync(path.join(__dirname, '../rulebook/rulebook.md'), 'utf8');
const rulebookFr = fs.readFileSync(path.join(__dirname, '../rulebook/rulebook.fr.md'), 'utf8');

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

RULEBOOK_CHECKS.forEach(({ label, token, regex }) => {
  const enCount = regex ? countRegex(rulebookEn, regex) : countToken(rulebookEn, token);
  const frCount = regex ? countRegex(rulebookFr, regex) : countToken(rulebookFr, token);
  if (enCount !== frCount) {
    errors.push(`Rulebook: "${label}" count differs (EN: ${enCount}, FR: ${frCount})`);
  }
});

// ---- Report --------------------------------------------------------------

if (errors.length > 0) {
  console.error(`✗ Language parity check failed with ${errors.length} issue(s):\n`);
  errors.forEach(e => console.error(`  - ${e}\n`));
  process.exit(1);
} else {
  console.log('✓ Language parity check passed: EN/FR data files are structurally in sync.');
}
