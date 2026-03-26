/**
 * Low-level conflict detection helper.
 * Returns true if queens at columns i and j conflict.
 */
export function isConflict(q, i, j) {
  if (q[i] === q[j]) return true;
  if (Math.abs(q[i] - q[j]) === Math.abs(i - j)) return true;
  return false;
}
