// Single source of truth for the board's real-world print size.
//
// Both boards/board-print-a4.html (the two-page A4 split) and
// components/print-sheet.html (the Clazgreb/Brenchilli ability templates)
// need to agree on exactly how big one board room is on paper, or the
// templates silently stop lining up with the printed board — which is
// exactly what happened before this file existed (the templates were
// hardcoded to 16mm cells while the board was printed with ~34.6mm rooms).
// Both files load this instead of hardcoding the numbers themselves.
const BOARD_PRINT_MM = 277; // fills a full A4 page height within 10mm margins
const BOARD_GRID_SIZE = 8;
const ROOM_MM = BOARD_PRINT_MM / BOARD_GRID_SIZE;
const OVERLAP_MM = 8; // shared inner-edge overlap on the A4 split, for alignment

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BOARD_PRINT_MM, BOARD_GRID_SIZE, ROOM_MM, OVERLAP_MM };
}
