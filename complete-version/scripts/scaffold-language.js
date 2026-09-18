#!/usr/bin/env node
// Scaffolds a new language: copies the three data files (still in English,
// structurally ready to translate in place), adds a language button to
// every page that needs one, wires the new language into board.html's and
// baseline.html's internal per-language lookups, and duplicates every
// bilingual content block in index.html / components.html for the new
// language (seeded with English text).
//
// This does NOT translate anything — it only removes the tedious, easy-to-
// half-finish parts of wiring a new language in. Actual translation is a
// manual step afterward: edit the three scaffolded data files, and replace
// the English text in every newly-added data-lang-content block.
//
// Usage:
//   node complete-version/scripts/scaffold-language.js <lang-code> "<Display Name>" [--apply]
// Defaults to a dry run (prints the plan without writing); pass --apply to
// actually write the changes — this touches ~8 files, so preview first.

const fs = require('fs');
const path = require('path');

const [, , langArg, nameArg, ...rest] = process.argv;
const APPLY = rest.includes('--apply');

if (!langArg || !nameArg) {
  console.error('Usage: node scaffold-language.js <lang-code> "<Display Name>" [--apply]');
  process.exit(1);
}
const lang = langArg.toLowerCase();
if (!/^[a-z]{2,5}$/.test(lang)) {
  console.error(`Invalid language code "${lang}" — expected 2-5 lowercase letters (e.g. "de").`);
  process.exit(1);
}
if (lang === 'en') {
  console.error('English is the reference language — nothing to scaffold.');
  process.exit(1);
}
const displayName = nameArg;

const ROOT = path.join(__dirname, '..'); // complete-version/
const REPO_ROOT = path.join(ROOT, '..');

const actions = [];

function planCopy(srcRel, destRel, transform) {
  const src = path.join(ROOT, srcRel);
  const dest = path.join(ROOT, destRel);
  if (fs.existsSync(dest)) {
    actions.push({ description: `SKIP (already exists): complete-version/${destRel}`, apply: () => {} });
    return;
  }
  const content = fs.readFileSync(src, 'utf8');
  const out = transform ? transform(content) : content;
  actions.push({
    description: `CREATE complete-version/${destRel} (copied from ${srcRel})`,
    apply: () => fs.writeFileSync(dest, out),
  });
}

// Multiple edits can target the same file (e.g. board.html gets both a
// button and a script-tag/object-literal edit) — each must see the OTHER's
// changes, not a fresh read from disk, or the second write silently clobbers
// the first. This cache holds each file's progressively-updated content
// across all planEditFile calls, so every apply() for that file writes the
// same final, fully-composed result.
const fileCache = new Map();

function planEditFile(absPath, relLabel, editFn) {
  if (!fileCache.has(absPath)) {
    fileCache.set(absPath, fs.readFileSync(absPath, 'utf8'));
  }
  const before = fileCache.get(absPath);
  const { updated, notes } = editFn(before);
  fileCache.set(absPath, updated);
  if (updated === before) {
    actions.push({ description: `SKIP (no change${notes.length ? ': ' + notes.join('; ') : ''}): ${relLabel}`, apply: () => {} });
    return;
  }
  actions.push({
    description: `EDIT ${relLabel}${notes.length ? ' (' + notes.join('; ') + ')' : ''}`,
    apply: () => fs.writeFileSync(absPath, fileCache.get(absPath)),
  });
}

// ---- 1. Data files --------------------------------------------------------

planCopy('classes/class_cards/characters.en.js', `classes/class_cards/characters.${lang}.js`,
  (c) => c.replace(/characters_en/g, `characters_${lang}`));

planCopy('boards/board-rules.en.js', `boards/board-rules.${lang}.js`,
  (c) => c.replace(/roomTexts_en/g, `roomTexts_${lang}`));

planCopy('rulebook/rulebook.md', `rulebook/rulebook.${lang}.md`);

// ---- 2. Language buttons (same pattern across 5 pages) --------------------

const BUTTON_FILES = [
  { abs: path.join(REPO_ROOT, 'index.html'), label: 'index.html' },
  { abs: path.join(ROOT, 'components/components.html'), label: 'complete-version/components/components.html' },
  { abs: path.join(ROOT, 'rulebook/rulebook-head.html'), label: 'complete-version/rulebook/rulebook-head.html' },
  { abs: path.join(ROOT, 'boards/board.html'), label: 'complete-version/boards/board.html' },
  { abs: path.join(ROOT, 'classes/class_cards/baseline.html'), label: 'complete-version/classes/class_cards/baseline.html' },
];

const BUTTON_RE = /^(\s*)<button class="([^"]*)" data-lang-btn="fr">Français<\/button>[ \t]*$/m;

for (const { abs, label } of BUTTON_FILES) {
  planEditFile(abs, label, (content) => {
    const m = content.match(BUTTON_RE);
    if (!m) return { updated: content, notes: ['no FR lang button found'] };
    const [full, indent, cls] = m;
    const newButton = `${indent}<button class="${cls}" data-lang-btn="${lang}">${displayName}</button>`;
    return { updated: content.replace(full, `${full}\n${newButton}`), notes: [] };
  });
}

// ---- 3. board.html: script tag + roomTextsByLang + roomLabels ------------

planEditFile(path.join(ROOT, 'boards/board.html'), 'complete-version/boards/board.html', (content) => {
  const notes = [];
  let updated = content;

  const scriptRe = /(<script src="board-rules\.fr\.js"><\/script>)/;
  if (scriptRe.test(updated)) {
    updated = updated.replace(scriptRe, `$1\n  <script src="board-rules.${lang}.js"></script>`);
  } else {
    notes.push('board-rules.fr.js script tag not found');
  }

  const byLangRe = /(const roomTextsByLang = \{ en: roomTexts_en, fr: roomTexts_fr)( \};)/;
  if (byLangRe.test(updated)) {
    updated = updated.replace(byLangRe, `$1, ${lang}: roomTexts_${lang}$2`);
  } else {
    notes.push('roomTextsByLang object not found in expected shape');
  }

  const labelsRe = /(const roomLabels = \{[\s\S]*?fr: \{[^}]*\})(\n(\s*)\};)/;
  if (labelsRe.test(updated)) {
    updated = updated.replace(labelsRe, (m0, body, tail, tailIndent) => {
      const indentMatch = body.match(/\n(\s*)fr:/);
      const indent = indentMatch ? indentMatch[1] : '      ';
      return `${body},\n${indent}${lang}: { start: "START", victory: "👑 ROOM 60 👑" }${tail}`;
    });
  } else {
    notes.push('roomLabels object not found in expected shape');
  }

  return { updated, notes };
});

// ---- 4. baseline.html: script tag + charactersByLang + difficultyLabel ---

planEditFile(path.join(ROOT, 'classes/class_cards/baseline.html'), 'complete-version/classes/class_cards/baseline.html', (content) => {
  const notes = [];
  let updated = content;

  const scriptRe = /(<script src="characters\.fr\.js"><\/script>)/;
  if (scriptRe.test(updated)) {
    updated = updated.replace(scriptRe, `$1\n  <script src="characters.${lang}.js"></script>`);
  } else {
    notes.push('characters.fr.js script tag not found');
  }

  const byLangRe = /(const charactersByLang = \{ en: characters_en, fr: characters_fr)( \};)/;
  if (byLangRe.test(updated)) {
    updated = updated.replace(byLangRe, `$1, ${lang}: characters_${lang}$2`);
  } else {
    notes.push('charactersByLang object not found in expected shape');
  }

  const diffRe = /(const difficultyLabel = \{ en: "Difficulty", fr: "Difficulté")( \};)/;
  if (diffRe.test(updated)) {
    updated = updated.replace(diffRe, `$1, ${lang}: "Difficulty"$2`);
  } else {
    notes.push('difficultyLabel object not found in expected shape');
  }

  return { updated, notes };
});

// ---- 5. Bilingual content blocks in index.html / components.html --------
//
// Walks the file line by line. Whenever it finds a line opening a tag with
// data-lang-content="en" (single-line self-closing, like a <span>, or a
// multi-line block like the download tiles that duplicate a whole <a>...</a>
// per language instead of toggling inner spans), it captures that whole
// block, expects the FR sibling block immediately after it, and clones the
// EN block a third time for the new language — swapping the language
// attribute, marking it hidden, and rewriting any "_en."/"​.en." href
// segment to the new language. Anything that doesn't match this shape is
// reported, not guessed at.

function lineOpensLangTag(line, langCode) {
  return line.match(new RegExp(`<(\\w+)\\b[^>]*\\bdata-lang-content="${langCode}"`));
}
function lineClosesTag(line, tag) {
  return new RegExp(`</${tag}>`).test(line);
}
function findClosingLine(lines, start, tag) {
  const closeRe = new RegExp(`</${tag}>\\s*$`);
  for (let k = start; k < lines.length; k++) {
    if (closeRe.test(lines[k])) return k;
  }
  return -1;
}

function duplicateLangBlocks(content) {
  const lines = content.split('\n');
  const outLines = [];
  const notes = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const openMatch = lineOpensLangTag(line, 'en');

    if (!openMatch) {
      outLines.push(line);
      i++;
      continue;
    }

    const tag = openMatch[1];
    let enEnd = i;
    if (!lineClosesTag(line, tag)) {
      enEnd = findClosingLine(lines, i + 1, tag);
      if (enEnd === -1) {
        notes.push(`line ${i + 1}: opened <${tag} data-lang-content="en"> with no matching </${tag}> found — left as-is`);
        outLines.push(line);
        i++;
        continue;
      }
    }
    const enBlock = lines.slice(i, enEnd + 1);

    let j = enEnd + 1;
    while (j < lines.length && lines[j].trim() === '') j++;
    const frLine = lines[j];
    const frOpenMatch = frLine && lineOpensLangTag(frLine, 'fr');

    if (!frOpenMatch || frOpenMatch[1] !== tag) {
      notes.push(`line ${i + 1}: <${tag} data-lang-content="en"> has no matching FR <${tag}> sibling immediately after — left as-is`);
      outLines.push(...enBlock);
      i = enEnd + 1;
      continue;
    }

    let frEnd = j;
    if (!lineClosesTag(frLine, tag)) {
      frEnd = findClosingLine(lines, j + 1, tag);
      if (frEnd === -1) {
        notes.push(`line ${j + 1}: opened <${tag} data-lang-content="fr"> with no matching </${tag}> found — left as-is`);
        outLines.push(...enBlock, ...lines.slice(j, j + 1));
        i = j + 1;
        continue;
      }
    }
    const frBlock = lines.slice(j, frEnd + 1);

    const newBlock = enBlock.map((l) =>
      l
        .replace(/data-lang-content="en"/, `data-lang-content="${lang}" hidden`)
        .replace(/(href="[^"]*?)_en(\.[a-zA-Z0-9]+")/, `$1_${lang}$2`)
        .replace(/(href="[^"]*?)\.en(\.[a-zA-Z0-9]+")/, `$1.${lang}$2`)
    );

    outLines.push(...enBlock, ...frBlock, ...newBlock);
    i = frEnd + 1;
  }

  return { updated: outLines.join('\n'), notes };
}

for (const { abs, label } of [
  { abs: path.join(REPO_ROOT, 'index.html'), label: 'index.html' },
  { abs: path.join(ROOT, 'components/components.html'), label: 'complete-version/components/components.html' },
]) {
  planEditFile(abs, label, (content) => duplicateLangBlocks(content));
}

// ---- Report / apply --------------------------------------------------------

console.log(
  (APPLY ? 'Applying' : 'DRY RUN —') +
  ` scaffold for language "${lang}" (${displayName})${APPLY ? '' : '. Pass --apply to write'}:\n`
);
actions.forEach((a) => console.log('  - ' + a.description));

if (APPLY) {
  actions.forEach((a) => a.apply());
  console.log(
    `\nDone. Next: rebuild affected assets (npm run build:board-pngs / build:card-pngs / ` +
    `build:rulebook / build:rulebook-pdf / build:board-a4-pdf), then translate — edit the ` +
    `three new "${lang}" data files and every newly-added data-lang-content="${lang}" block ` +
    `(currently seeded with English text).`
  );
} else {
  console.log('\n(Dry run — nothing written. Re-run with --apply to write these changes.)');
}
