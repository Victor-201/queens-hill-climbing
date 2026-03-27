// Default board size
export const N = 8;

// All supported board sizes
export const BOARD_SIZES = [4, 5, 6, 7, 8];

// Full 8-column label set — sliced dynamically for smaller boards
const ALL_COLS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

// Column labels for a given board size
export function colLabels(n = N) {
  return ALL_COLS.slice(0, n);
}

// Column labels for default N=8 (backwards compat)
export const COLS = ALL_COLS;

// Default starting position (0-indexed rows) for N=8
// Corresponds to: a7, b6, c4, d8, e2, f3, g5, h1
export const DEFAULT = [6, 5, 3, 7, 1, 2, 4, 0];

// Generate the default position for any board size.
// For 8×8: use the original DEFAULT exactly.
// For smaller boards: slice the first n columns of DEFAULT and wrap row
// values into range [0..n-1] using modulo — preserves the varied pattern,
// avoids a diagonal, and never leaves any queen out of bounds.
export function defaultPosition(n = N) {
  if (n === 8) return [...DEFAULT];
  return DEFAULT.slice(0, n).map(row => row % n);
}
