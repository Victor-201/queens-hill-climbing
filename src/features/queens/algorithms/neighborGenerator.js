/**
 * Steepest-Ascent Hill Climbing neighbor generator.
 * Scans all 56 neighbors (8 cols × 7 non-current rows).
 * Returns { h0, bestH, moves } where moves is array of {col, row, hv}.
 * If bestH >= h0 → local optimum or plateau → stop.
 */
import { h, hMove } from './heuristic.js';

export function steepest(q) {
  const h0 = h(q);
  let bestH = Infinity;
  const moves = [];

  for (let col = 0; col < 8; col++) {
    for (let row = 0; row < 8; row++) {
      if (row === q[col]) continue; // skip current position
      const hv = hMove(q, col, row);
      if (hv < bestH) {
        bestH = hv;
        moves.length = 0;
        moves.push({ col, row, hv });
      } else if (hv === bestH) {
        moves.push({ col, row, hv });
      }
    }
  }

  return { h0, bestH, moves };
}

/**
 * Returns a Set of "col,row" strings for all attacked queen positions.
 */
export function attackedSet(q) {
  const s = new Set();
  for (let i = 0; i < 8; i++) {
    for (let j = i + 1; j < 8; j++) {
      if (q[i] === q[j] || Math.abs(q[i] - q[j]) === Math.abs(i - j)) {
        s.add(`${i},${q[i]}`);
        s.add(`${j},${q[j]}`);
      }
    }
  }
  return s;
}
