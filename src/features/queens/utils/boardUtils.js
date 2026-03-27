import { COLS } from '../constants/boardConstants.js';

/**
 * Generates SVG markup for a queen piece.
 * Colors invert based on light/dark cell.
 */
export function queenSVG(col, row) {
  const light = (col + row) % 2 === 0;
  const fill  = light ? '#2a1a06' : '#f5e8c0';
  const hi    = light ? '#6a3a18' : '#fff8e0';
  const str   = light ? '#1a0e03' : '#c9993a';
  const id    = `g${col}${row}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <radialGradient id="${id}" cx="50%" cy="28%" r="65%">
      <stop offset="0%" stop-color="${hi}"/>
      <stop offset="100%" stop-color="${fill}"/>
    </radialGradient>
    <filter id="ds${col}${row}"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="rgba(0,0,0,.5)"/></filter>
  </defs>
  <g filter="url(#ds${col}${row})">
    <circle cx="50" cy="13" r="8" fill="url(#${id})" stroke="${str}" stroke-width="2.2"/>
    <circle cx="13" cy="26" r="6" fill="url(#${id})" stroke="${str}" stroke-width="2"/>
    <circle cx="87" cy="26" r="6" fill="url(#${id})" stroke="${str}" stroke-width="2"/>
    <polygon points="50,20 87,33 77,68 23,68 13,33" fill="url(#${id})" stroke="${str}" stroke-width="2.5" stroke-linejoin="round"/>
    <rect x="20" y="68" width="60" height="11" rx="3" fill="url(#${id})" stroke="${str}" stroke-width="2"/>
    <rect x="16" y="77" width="68" height="10" rx="3" fill="url(#${id})" stroke="${str}" stroke-width="2"/>
    <circle cx="50" cy="46" r="3.5" fill="${str}" opacity=".55"/>
    <circle cx="33" cy="53" r="2.5" fill="${str}" opacity=".45"/>
    <circle cx="67" cy="53" r="2.5" fill="${str}" opacity=".45"/>
  </g>
</svg>`;
}

/**
 * Returns the CSS heat class for a heuristic value.
 */
export function hcls(v) {
  if (v === 0) return 'h0';
  if (v === 1) return 'h1';
  if (v === 2) return 'h2';
  if (v === 3) return 'h3';
  if (v === 4) return 'h4';
  if (v === 5) return 'h5';
  if (v <= 7)  return 'h6';
  return 'hhi';
}

/**
 * Promise-based delay.
 */
export const sleep = ms => new Promise(r => setTimeout(r, ms));

/**
 * Get pixel center of a board cell.
 * boardEl = reference to the board grid DOM element.
 */
export function cellCenter(boardEl, col, row) {
  const rect = boardEl.getBoundingClientRect();
  const cellW = rect.width / 8;
  const cellH = rect.height / 8;
  return {
    x: rect.left + col * cellW + cellW / 2,
    y: rect.top  + (7 - row) * cellH + cellH / 2,
    w: cellW,
    h: cellH,
  };
}

/**
 * Flying arc animation using requestAnimationFrame.
 * Moves `el` from A to B with a parabolic arc.
 */
export function flyArc(el, A, B, dur) {
  return new Promise(resolve => {
    const t0  = performance.now();
    const dx  = B.x - A.x;
    const dy  = B.y - A.y;
    const arc = Math.max(Math.abs(dy) * 0.6, 48);
    const ease = t => t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2;

    (function frame(now) {
      const raw = Math.min((now - t0) / dur, 1);
      const e   = ease(raw);
      el.style.left      = (A.x + dx * e - A.w / 2) + 'px';
      el.style.top       = (A.y + dy * e - Math.sin(raw * Math.PI) * arc - A.h / 2) + 'px';
      el.style.transform = `scale(${1 + Math.sin(raw * Math.PI) * 0.3})`;
      raw < 1 ? requestAnimationFrame(frame) : resolve();
    })(t0);
  });
}

export { COLS };
