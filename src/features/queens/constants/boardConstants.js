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

// Generate the default (diagonal) position for any board size.
// Queen at column i is placed at row i → main diagonal.
export function defaultPosition(n = N) {
  return Array.from({ length: n }, (_, i) => i);
}
