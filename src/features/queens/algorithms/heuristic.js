/**
 * h(q) — number of attacking queen pairs
 * Two queens attack each other if:
 *   (1) same row:     q[i] === q[j]
 *   (2) same diagonal:|q[i]-q[j]| === |i-j|
 * Same column cannot happen because state guarantees 1 queen per column.
 */
export function h(q) {
  let attacks = 0;
  for (let i = 0; i < 8; i++) {
    for (let j = i + 1; j < 8; j++) {
      if (q[i] === q[j]) { attacks++; continue; }
      if (Math.abs(q[i] - q[j]) === Math.abs(i - j)) attacks++;
    }
  }
  return attacks;
}

/**
 * h for the state where queen in column `col` moves to `row`
 */
export function hMove(q, col, row) {
  const nq = q.slice();
  nq[col] = row;
  return h(nq);
}

/**
 * Build the full 8×8 heuristic table.
 * T[row][col] = h if queen at column col moves to row.
 * Current position cell shows h(q) (the queen is already there).
 */
export function buildTable(q) {
  const T = [];
  for (let row = 0; row < 8; row++) {
    T[row] = [];
    for (let col = 0; col < 8; col++) {
      T[row][col] = (row === q[col]) ? h(q) : hMove(q, col, row);
    }
  }
  return T;
}
