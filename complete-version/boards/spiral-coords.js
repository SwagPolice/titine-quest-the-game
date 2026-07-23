// Exact [row, col] spiral coordinates for the 61-room KALBLAST board
// (index 0 = Start, index 60 = Victory), on the 8x8 grid drawn by board.html.
//
// Single source of truth: boards/board.html loads this via <script src>, and
// simulations/simulation-kalblast.py parses this same file at import time, so
// the board layout and the balance simulator can never drift apart.
const SPIRAL_COORDS = [
  [7,0], [7,1], [7,2], [7,3], [7,4], [7,5], [7,6], [7,7],
  [6,7], [5,7], [4,7], [3,7], [2,7], [1,7], [0,7],
  [0,6], [0,5], [0,4], [0,3], [0,2], [0,1], [0,0],
  [1,0], [2,0], [3,0], [4,0], [5,0], [6,0],
  [6,1], [6,2], [6,3], [6,4], [6,5], [6,6],
  [5,6], [4,6], [3,6], [2,6], [1,6],
  [1,5], [1,4], [1,3], [1,2], [1,1],
  [2,1], [3,1], [4,1], [5,1],
  [5,2], [5,3], [5,4], [5,5],
  [4,5], [3,5], [2,5],
  [2,4], [2,3], [2,2],
  [3,2], [4,2],
  [3,3]
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SPIRAL_COORDS };
}
