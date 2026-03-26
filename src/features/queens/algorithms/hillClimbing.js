/**
 * Pure hill-climbing step computation.
 * Returns a result descriptor — no side effects, no DOM.
 *
 * @param {number[]} q - current queen positions (0-indexed rows)
 * @returns {{ status, hv, T, bestH, moves, bestSet }}
 */
import { h, buildTable } from './heuristic.js';
import { steepest } from './neighborGenerator.js';

export function computeStep(q) {
  const hv = h(q);
  const T = buildTable(q);
  const { h0, bestH, moves } = steepest(q);
  const bestSet = new Set(moves.map(m => `${m.col},${m.row}`));

  let status;
  if (hv === 0) {
    status = 'solved';
  } else if (bestH >= hv) {
    status = 'stuck';
  } else {
    status = 'move';
  }

  return { status, hv, T, bestH, moves, bestSet, h0 };
}
