# Roadmap

A living list of where KALBLAST could go next, now that the Complete Version is fully printable end-to-end (rulebook, board, cards, and components sheet). Not commitments or a schedule — just tracked ideas.

## Known gaps (before wider release)

- **Replace placeholder character art.** Every character portrait is currently AI-generated placeholder art (flagged directly on the [landing page](index.html)). Original, hand-drawn illustrations for all 10 classes plus the box lid are the most visible thing standing between this and a release-ready look. **In progress:** a full production brief — moodboard references, exact Clip Studio Paint canvas/resolution/bleed setup, safe-zone layout, and the required filename per character — lives in `complete-version/design/kalb-art-direction.html` (§04, "Production brief").
- **Physical playtesting.** Everything renders and prints correctly, which is a different question from whether the game *plays* well at the table. So far, testing has been informal — gathering friend groups to play and talking about it afterward, which is a good start but has real blind spots: testers already know the designers (softens honest criticism), sessions aren't standardized (so feedback isn't comparable across groups), and a designer is always in the room to clarify rules, which hides whether the rulebook alone actually works. Concrete upgrades to layer on, roughly in order of effort:
  - A short, standardized post-game feedback form filled out every session (character played, any rule that caused an argument or a rulebook lookup, any ability/room effect that felt broken or boring, game length, one high point and one low point) — turns vague vibes into comparable data across sessions.
  - Use `complete-version/simulations/simulation-kalblast.py` to flag statistical outliers (win rate per class, average game length, most/least-visited rooms) *before* a session, to know what to specifically watch for, then compare what actually happened afterward — a mismatch usually means the simulator is missing something real about how an ability gets used at a table.
  - A "cold start" test: hand a group the printed materials and rulebook PDF with zero verbal explanation from a designer. The single best test of whether the rulebook and physical components are actually self-sufficient.
  - Separate "mechanics clarity" sessions (sober/low-key, for methodically catching rule confusion and balance issues) from "real experience" sessions (actual drinking, noisier data, but necessary to validate the game is fun *as a drinking game*) — don't conflate the two kinds of feedback.
  - Eventually widen past the current friend circle (a local game night, a con, friends-of-friends) to get feedback from people without a personal stake in being nice about it.

## Content growth

- **New character classes**, beyond the current 10. Each needs a passive trait and an active ability that's mechanically distinct from the existing roster (see `complete-version/classes/class_cards/characters.en.js` / `.fr.js` for the current set) — and if a new class needs its own physical component (a token, a template, an ability-specific rule), it belongs in `complete-version/components/` alongside the existing Advisor/Protective Light/Pride Parade tokens.
- **New room effects / board mechanics**, beyond the current 61 rooms (`complete-version/boards/board-rules.en.js` / `.fr.js`, laid out via `complete-version/boards/spiral-coords.js`). Any new mechanic that needs a physical piece should follow the same pattern established this round: design it, add it to the components print sheet, and account for it in `complete-version/rulebook/rulebook.md`'s "What's in the Box" list.

## Quick Version

Currently just a design concept — `quick-version/README.md` describes a smaller, faster 27-room variant, but the only asset that exists is a single `.xcf` sketch (`quick-version/boards/quick-game.xcf`). Nothing has been built out yet: no digital board, no rules page, no print pipeline. Worth deciding whether/when this becomes a real second product, reusing the same print-and-play conventions established for the Complete Version (build-time PNG/PDF generation via Puppeteer, bilingual `data-lang-content` toggling, a components sheet for any physical pieces).

## Localization

Adding a language is already a documented, repeatable process (see `complete-version/README.md`'s "Languages" section): a sibling data file per language (`rulebook.<lang>.md`, `characters.<lang>.js`, `board-rules.<lang>.js`), wired into the relevant build script and language toggle, checked with `node complete-version/scripts/check-lang-parity.js`. This section just tracks which languages are actually planned beyond English and French — none decided yet.

The engineering side is genuinely easy — most build scripts already loop over a `LANGS` array, the bilingual toggle mechanism (`data-lang-content` + `hidden`) already generalizes to any number of languages with no code change, and the components print sheet is wordless so a new language costs it nothing. The real costs are elsewhere:
- **Translation volume**, not engineering: the rulebook prose, all 10 character kits, and all 61 room effects — a writing workload, not a coding one.
- **`check-lang-parity.js` hardcodes a two-way EN/FR comparison** and would need generalizing to check every language pair (or all languages against one canonical reference) before a third language could be trusted the same way the first two are.
- **Repetitive manual work**: every bilingual span in `index.html` and `components.html` (there are dozens) needs a third `data-lang-content="xx"` copy added by hand — mechanical, not hard, but exactly the kind of tedious edit that's easy to half-finish and leave a stray untranslated string behind, which is what the parity check (once generalized) would catch.

## Tooling / infra ideas

- ~~A CI workflow (GitHub Actions) that runs `check:lang-parity` and `check:print-assets` automatically on every push~~ — done, see `.github/workflows/checks.yml`.
- Consider whether the Quick Version, if built out, should share `complete-version/shared/` helpers (theme, lang-toggle, PNG/PDF export) rather than duplicating them.
