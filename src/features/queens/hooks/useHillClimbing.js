import { useState, useRef, useCallback, useEffect } from 'react';
import { DEFAULT, COLS } from '../constants/boardConstants.js';
import { h, buildTable } from '../algorithms/heuristic.js';
import { steepest, attackedSet } from '../algorithms/neighborGenerator.js';
import { queenSVG, sleep, cellCenter, flyArc } from '../utils/boardUtils.js';

export function useHillClimbing() {
  // ── Core board state ──
  const [queens, setQueens]   = useState([...DEFAULT]);
  const [setupQ, setSetupQ]   = useState([...DEFAULT]);
  const [phase, setPhase]     = useState('setup'); // setup | ready | running | solved | stuck
  const [stepNum, setStepNum] = useState(0);
  const [speed, setSpeed]     = useState(1200);
  const [mode, setMode]       = useState('manual'); // manual | click

  // ── Derived display state ──
  const [metrics, setMetrics]   = useState({ hv: null, hb: null, nb: null });
  const [hTable, setHTable]     = useState([]);   // 8×8 matrix
  const [bestSet, setBestSet]   = useState(new Set());
  const [atkSet, setAtkSet]     = useState(new Set());
  const [tgtSet, setTgtSet]     = useState(new Set());
  const [logs, setLogs]         = useState([]);   // [{id, html, cls}]
  const [snaps, setSnaps]       = useState([]);   // snapshots
  const [activeSnap, setActiveSnap] = useState(null);
  const [stopBox, setStopBox]   = useState(null); // null | {type, hv, bestH}
  const [inputErrs, setInputErrs] = useState(false);

  // ── Refs (not re-render-triggering) ──
  const busyRef      = useRef(false);
  const autoTmrRef   = useRef(null);
  const boardRef     = useRef(null);    // ref to board grid DOM element
  const flyingQueenRef = useRef(null);  // ref to flying queen DOM element
  const queensRef    = useRef([...DEFAULT]); // always sync with queens state
  const phaseRef     = useRef('setup');
  const speedRef     = useRef(1200);
  const stepNumRef   = useRef(0);
  const logIdRef     = useRef(0);

  // Keep refs in sync
  useEffect(() => { queensRef.current = queens; }, [queens]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { stepNumRef.current = stepNum; }, [stepNum]);

  // ── Helper: add log entry ──
  const addLog = useCallback((html, cls = '') => {
    const id = ++logIdRef.current;
    setLogs(prev => [...prev, { id, html, cls }]);
  }, []);

  const clearLog = useCallback(() => setLogs([]), []);

  // ── Helper: update metrics display ──
  const updateMetrics = useCallback((hv, hb, nb) => {
    setMetrics({ hv, hb, nb });
  }, []);

  // ── SETUP: build column inputs ──
  const onSI = useCallback((col, val) => {
    const v = parseInt(val);
    const newQ = [...setupQ];
    if (v >= 1 && v <= 8) {
      newQ[col] = v - 1;
      setSetupQ(newQ);
      setQueens(newQ);
      queensRef.current = newQ;
      setAtkSet(new Set());
      setTgtSet(new Set());
    }
  }, [setupQ]);

  // ── SETUP: switch mode ──
  const switchMode = useCallback((m) => {
    setMode(m);
  }, []);

  // ── SETUP: cell click ──
  const onCellClick = useCallback((col, row) => {
    if (phaseRef.current !== 'setup' && phaseRef.current !== 'ready') return;
    setSetupQ(prev => {
      const nq = [...prev]; nq[col] = row;
      setQueens(nq);
      queensRef.current = nq;
      setAtkSet(new Set());
      setTgtSet(new Set());
      return nq;
    });
  }, []);

  // ── SETUP: random ──
  const doRandom = useCallback(() => {
    const rq = Array.from({ length: 8 }, () => Math.floor(Math.random() * 8));
    setSetupQ(rq);
    setQueens(rq);
    queensRef.current = rq;
    setAtkSet(new Set());
    setTgtSet(new Set());
  }, []);

  // ── SETUP: confirm ──
  const confirmSetup = useCallback((inputVals) => {
    // inputVals: array of 8 numbers (row values, 1-indexed from inputs)
    let ok = true;
    const newQ = [];
    for (let i = 0; i < 8; i++) {
      const v = parseInt(inputVals[i]);
      if (!v || v < 1 || v > 8) { ok = false; break; }
      newQ[i] = v - 1;
    }
    if (!ok) { setInputErrs(true); return; }
    setInputErrs(false);
    setStopBox(null);

    const hv = h(newQ);
    const T  = buildTable(newQ);
    const { bestH, moves } = steepest(newQ);

    setQueens(newQ);
    queensRef.current = newQ;
    setSetupQ(newQ);
    setStepNum(0);
    stepNumRef.current = 0;
    setSnaps([]);
    setActiveSnap(null);
    setLogs([]);
    setHTable(T);
    setBestSet(new Set());
    setAtkSet(attackedSet(newQ));
    setTgtSet(new Set());
    updateMetrics(hv, bestH, moves.length);
    setPhase('ready');
    phaseRef.current = 'ready';

    const initSnap = { type: 'init', q: [...newQ], T, best: new Set(), hv, hb: bestH, nb: moves.length, step: 0 };
    setSnaps([initSnap]);
    setActiveSnap(0);

    const pos = newQ.map((r, c) => COLS[c] + (r + 1)).join(', ');
    addLog(
      `<div class="lt">── Trạng thái ban đầu ─────────────────────</div>
      <div class="lm">Vị trí: [${pos}]</div>
      <div class="lm">h(n) = <b style="color:var(--gold2)">${hv}</b> cặp hậu tấn công nhau</div>
      <div class="lm hi">Láng giềng tốt nhất: h = ${bestH} | ${moves.length} nước tie</div>
      ${hv === 0 ? '<div class="lm ok">✓ Đây đã là lời giải ngay từ đầu!</div>' : ''}`,
      hv === 0 ? 'ok' : 'step'
    );

    if (hv === 0) {
      setPhase('solved');
      phaseRef.current = 'solved';
      setStopBox({ type: 'solved', hv: 0 });
    }
  }, [addLog, updateMetrics]);

  // ── ANIMATION: move queen with fly arc ──
  const animateMove = useCallback(async (col, fromRow, toRow) => {
    const boardEl = boardRef.current;
    const fqEl    = flyingQueenRef.current;
    if (!boardEl || !fqEl) return;

    // Lift: handled via state — set lifted queen
    // We'll use a ref-based approach for the DOM animation
    const qimgEl = boardEl.querySelector(`#qi-${col}`);
    if (qimgEl) {
      qimgEl.classList.add('lifted');
      await sleep(230);
    }

    const from = cellCenter(boardEl, col, fromRow);
    const to   = cellCenter(boardEl, col, toRow);

    // Show flying queen
    fqEl.style.cssText = `display:block;left:${from.x - 17}px;top:${from.y - 17}px;opacity:1;transform:scale(1)`;
    if (qimgEl) qimgEl.style.opacity = '0';

    // Trail on departure cell
    const srcCell = boardEl.querySelector(`#c-${col}-${fromRow}`);
    if (srcCell) {
      const t = document.createElement('div');
      t.className = 'trail-fx';
      srcCell.appendChild(t);
      setTimeout(() => t.remove(), 1050);
    }

    // Fly arc
    const dur = Math.min(speedRef.current * 0.52, 820);
    await flyArc(fqEl, from, to, dur);

    // Land
    fqEl.style.display = 'none';

    // Update state
    const newQ = [...queensRef.current];
    newQ[col] = toRow;
    setQueens(newQ);
    queensRef.current = newQ;
    setAtkSet(attackedSet(newQ));
    setTgtSet(new Set());
    setBestSet(new Set());

    // Landing animation on the new queen image
    await sleep(80); // brief wait for re-render
    const liEl = boardEl.querySelector(`#qi-${col}`);
    if (liEl) {
      liEl.classList.add('landing');
      liEl.addEventListener('animationend', () => liEl.classList.remove('landing'), { once: true });
    }
    const dstCell = boardEl.querySelector(`#c-${col}-${toRow}`);
    if (dstCell) {
      dstCell.classList.add('land-flash');
      setTimeout(() => dstCell.classList.remove('land-flash'), 700);
    }

    await sleep(400);
  }, []);

  // ── MAIN STEP ──
  const doStep = useCallback(async () => {
    if (busyRef.current || phaseRef.current === 'solved' || phaseRef.current === 'stuck' || phaseRef.current === 'setup') return;
    busyRef.current = true;
    setPhase('running');
    phaseRef.current = 'running';

    const q  = queensRef.current;
    const hv = h(q);
    const T  = buildTable(q);
    const { h0, bestH, moves } = steepest(q);

    const newStep = stepNumRef.current + 1;
    setStepNum(newStep);
    stepNumRef.current = newStep;

    // Already solved guard
    if (hv === 0) {
      setPhase('solved');
      phaseRef.current = 'solved';
      busyRef.current = false;
      return;
    }

    const bs = new Set(moves.map(m => `${m.col},${m.row}`));
    setHTable(T);
    setBestSet(bs);
    setTgtSet(bs);
    setAtkSet(attackedSet(q));
    updateMetrics(hv, bestH, moves.length);
    await sleep(Math.max(speedRef.current * 0.28, 220));

    // Local optimum or plateau
    if (bestH >= hv) {
      const reason = bestH === hv
        ? 'Tất cả láng giềng có h = h hiện tại (plateau)'
        : 'Tất cả láng giềng có h > h hiện tại';
      addLog(
        `<div class="lt">── Bước ${newStep}: Không thể cải thiện ────────</div>
        <div class="lm">h(n) hiện tại = <b style="color:var(--gold2)">${hv}</b></div>
        <div class="lm">h tốt nhất láng giềng = <b style="color:var(--red)">${bestH}</b></div>
        <div class="lm err">⚠ ${reason}</div>
        <div class="lm err">→ Rơi vào <b>local optimum</b> · Dừng thuật toán</div>`,
        'err'
      );
      setPhase('stuck');
      phaseRef.current = 'stuck';
      setStopBox({ type: 'local', hv, bestH });
      setSnaps(prev => {
        const snap = { type: 'stuck', q: [...q], T, best: bs, hv, hb: bestH, nb: moves.length, step: newStep };
        const next = [...prev, snap];
        setActiveSnap(next.length - 1);
        return next;
      });
      // Stop auto
      if (autoTmrRef.current) {
        clearInterval(autoTmrRef.current);
        autoTmrRef.current = null;
      }
      busyRef.current = false;
      return;
    }

    // Move to best neighbor
    const mv = moves[0];
    const fr = q[mv.col];

    addLog(
      `<div class="lt">── Bước ${newStep} ──────────────────────────────</div>
      <div class="lm">h(n) hiện tại = <b style="color:var(--gold2)">${hv}</b></div>
      <div class="lm hi">Duyệt 56 láng giềng → h tốt nhất = <b style="color:var(--green)">${bestH}</b> (${moves.length} nước)</div>
      <div class="lm ok">Điều kiện: ${bestH} &lt; ${hv} → Di chuyển đến best neighbor</div>
      <div class="lm ok">→ Cột <b>${COLS[mv.col]}</b>: hàng ${fr + 1} → hàng ${mv.row + 1}  (Δh = ${hv - bestH})</div>`,
      'step'
    );

    // Animate
    await animateMove(mv.col, fr, mv.row);

    // Post-move state
    const newQ = queensRef.current;
    const hv2  = h(newQ);
    const T2   = buildTable(newQ);
    const { bestH: bh2, moves: mv2 } = steepest(newQ);

    setHTable(T2);
    setBestSet(new Set());
    setTgtSet(new Set());
    setAtkSet(attackedSet(newQ));
    updateMetrics(hv2, bh2, mv2.length);

    setSnaps(prev => {
      const snap = { type: 'step', q: [...newQ], T: T2, best: new Set(), hv: hv2, hb: bh2, nb: mv2.length, step: newStep };
      const next = [...prev, snap];
      setActiveSnap(next.length - 1);
      return next;
    });

    // Check solved
    if (hv2 === 0) {
      setPhase('solved');
      phaseRef.current = 'solved';
      addLog(
        `<div class="lt" style="color:var(--green)">✓ GIẢI XONG SAU ${newStep} BƯỚC ──────────</div>
        <div class="lm ok">h(n) = 0 · Không còn cặp hậu tấn công nhau!</div>
        <div class="lm ok">Vị trí cuối: [${newQ.map((r, c) => COLS[c] + (r + 1)).join(', ')}]</div>`,
        'ok'
      );
      setStopBox({ type: 'solved', hv: 0 });
      if (autoTmrRef.current) {
        clearInterval(autoTmrRef.current);
        autoTmrRef.current = null;
      }
      busyRef.current = false;
      return;
    }

    busyRef.current = false;
    phaseRef.current = 'ready';
    setPhase('ready');
  }, [addLog, updateMetrics, animateMove]);

  // ── AUTO RUN ──
  const [isAuto, setIsAuto] = useState(false);

  const toggleAuto = useCallback(() => {
    if (autoTmrRef.current) {
      clearInterval(autoTmrRef.current);
      autoTmrRef.current = null;
      setIsAuto(false);
    } else {
      setIsAuto(true);
      const tick = () => {
        if (phaseRef.current === 'solved' || phaseRef.current === 'stuck') {
          clearInterval(autoTmrRef.current);
          autoTmrRef.current = null;
          setIsAuto(false);
          return;
        }
        if (!busyRef.current) doStep();
      };
      autoTmrRef.current = setInterval(tick, speedRef.current + 150);
      tick();
    }
  }, [doStep]);

  // ── SPEED ──
  const onSpeed = useCallback((val) => {
    const s = parseInt(val);
    setSpeed(s);
    speedRef.current = s;
  }, []);

  // ── RESTORE SNAPSHOT ──
  const restoreSnap = useCallback((idx) => {
    const s = snaps[idx];
    if (!s) return;
    setActiveSnap(idx);
    setQueens([...s.q]);
    queensRef.current = [...s.q];
    setHTable(s.T);
    setBestSet(s.best);
    setAtkSet(attackedSet(s.q));
    setTgtSet(new Set());
    updateMetrics(s.hv, s.hb, s.nb);
    setStepNum(s.step);
    stepNumRef.current = s.step;
  }, [snaps, updateMetrics]);

  // ── FULL RESET ──
  const fullReset = useCallback(() => {
    if (autoTmrRef.current) { clearInterval(autoTmrRef.current); autoTmrRef.current = null; }
    busyRef.current = false;
    setIsAuto(false);
    setPhase('setup');
    phaseRef.current = 'setup';
    setStepNum(0);
    stepNumRef.current = 0;
    setSnaps([]);
    setActiveSnap(null);
    setLogs([]);
    setHTable([]);
    setBestSet(new Set());
    setAtkSet(new Set());
    setTgtSet(new Set());
    setMetrics({ hv: null, hb: null, nb: null });
    setStopBox(null);
    setInputErrs(false);
    const def = [...DEFAULT];
    setSetupQ(def);
    setQueens(def);
    queensRef.current = def;
  }, []);

  return {
    // State
    queens, setupQ, phase, stepNum, speed, mode,
    metrics, hTable, bestSet, atkSet, tgtSet,
    logs, snaps, activeSnap, stopBox, inputErrs, isAuto,
    // Refs
    boardRef, flyingQueenRef,
    // Actions
    onSI, switchMode, onCellClick, doRandom, confirmSetup,
    doStep, toggleAuto, onSpeed, restoreSnap, fullReset,
    clearLog,
  };
}
