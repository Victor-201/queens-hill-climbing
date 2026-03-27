import { useState, useRef, useCallback, useEffect } from 'react';
import { DEFAULT, COLS, colLabels, defaultPosition } from '../constants/boardConstants.js';
import { h, buildTable } from '../algorithms/heuristic.js';
import { steepest, attackedSet } from '../algorithms/neighborGenerator.js';
import { queenSVG, sleep, cellCenter, flyArc } from '../utils/boardUtils.js';

export function useHillClimbing(t = (k) => k) {
  // ── Board size state ──
  const [boardSize, setBoardSize] = useState(8);
  const boardSizeRef = useRef(8);

  // ── Core board state ──
  const [queens, setQueens]   = useState([...DEFAULT]);
  const [setupQ, setSetupQ]   = useState([...DEFAULT]);
  const [phase, setPhase]     = useState('setup'); // setup | ready | running | solved | stuck
  const [stepNum, setStepNum] = useState(0);
  const [speed, setSpeed]     = useState(1200);
  const [mode, setMode]       = useState('manual'); // manual | click

  // ── Derived display state ──
  const [metrics, setMetrics]   = useState({ hv: null, hb: null, nb: null });
  const [hTable, setHTable]     = useState([]);
  const [bestSet, setBestSet]   = useState(new Set());
  const [atkSet, setAtkSet]     = useState(new Set());
  const [tgtSet, setTgtSet]     = useState(new Set());
  const [logs, setLogs]         = useState([]);
  const [snaps, setSnaps]       = useState([]);
  const [activeSnap, setActiveSnap] = useState(null);
  const [stopBox, setStopBox]   = useState(null);
  const [inputErrs, setInputErrs] = useState(false);
  const [isAuto, setIsAuto]     = useState(false);

  // ── Refs ──
  const busyRef        = useRef(false);
  const autoTmrRef     = useRef(null);
  const boardRef       = useRef(null);
  const flyingQueenRef = useRef(null);
  const queensRef      = useRef([...DEFAULT]);
  const phaseRef       = useRef('setup');
  const speedRef       = useRef(1200);
  const stepNumRef     = useRef(0);
  const logIdRef       = useRef(0);
  const confirmedQRef  = useRef([...DEFAULT]); // last position user confirmed

  // Keep refs in sync
  useEffect(() => { queensRef.current = queens; }, [queens]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { stepNumRef.current = stepNum; }, [stepNum]);

  // ── Helper: add log entry ──
  const addLog = useCallback((data, cls = '') => {
    const id = ++logIdRef.current;
    setLogs(prev => [...prev, { id, data, cls }]);
  }, []);

  const clearLog = useCallback(() => setLogs([]), []);

  // ── Helper: update metrics ──
  const updateMetrics = useCallback((hv, hb, nb) => {
    setMetrics({ hv, hb, nb });
  }, []);

  // ── BOARD SIZE CHANGE ──
  const changeBoardSize = useCallback((n) => {
    if (autoTmrRef.current) { clearInterval(autoTmrRef.current); autoTmrRef.current = null; }
    busyRef.current = false;

    setBoardSize(n);
    boardSizeRef.current = n;

    const def = defaultPosition(n);
    setSetupQ(def);
    setQueens(def);
    queensRef.current = def;

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
    setIsAuto(false);
  }, []);

  // ── SETUP: column input ──
  const onSI = useCallback((col, val) => {
    const n = boardSizeRef.current;
    const v = parseInt(val);
    const newQ = [...setupQ];
    if (v >= 1 && v <= n) {
      newQ[col] = v - 1;
      setSetupQ(newQ);
      setQueens(newQ);
      queensRef.current = newQ;
      setAtkSet(new Set());
      setTgtSet(new Set());
    }
  }, [setupQ]);

  // ── SETUP: switch mode ──
  const switchMode = useCallback((m) => { setMode(m); }, []);

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
    const n = boardSizeRef.current;
    const rq = Array.from({ length: n }, () => Math.floor(Math.random() * n));
    setSetupQ(rq);
    setQueens(rq);
    queensRef.current = rq;
    setAtkSet(new Set());
    setTgtSet(new Set());
  }, []);

  // ── SETUP: confirm ──
  const confirmSetup = useCallback((inputVals) => {
    const n = boardSizeRef.current;
    const cols = colLabels(n);
    let ok = true;
    const newQ = [];
    for (let i = 0; i < n; i++) {
      const v = parseInt(inputVals[i]);
      if (!v || v < 1 || v > n) { ok = false; break; }
      newQ[i] = v - 1;
    }
    if (!ok) { setInputErrs(true); return; }
    setInputErrs(false);
    setStopBox(null);

    const hv = h(newQ, n);
    const T  = buildTable(newQ, n);
    const { bestH, moves } = steepest(newQ, n);

    setQueens(newQ);
    queensRef.current = newQ;
    setSetupQ(newQ);
    confirmedQRef.current = [...newQ]; // remember for reset
    setStepNum(0);
    stepNumRef.current = 0;
    setSnaps([]);
    setActiveSnap(null);
    setLogs([]);
    setHTable(T);
    setBestSet(new Set());
    setAtkSet(attackedSet(newQ, n));
    setTgtSet(new Set());
    updateMetrics(hv, bestH, moves.length);
    setPhase('ready');
    phaseRef.current = 'ready';

    const initSnap = { type: 'init', q: [...newQ], T, best: new Set(), hv, hb: bestH, nb: moves.length, step: 0 };
    setSnaps([initSnap]);
    setActiveSnap(0);

    const pos = newQ.map((r, c) => cols[c] + (r + 1)).join(', ');
    const neighborCount = n * (n - 1);
    addLog(
      { type: 'initial', pos, hv, bestH, ties: moves.length },
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
    const n = boardSizeRef.current;
    const boardEl = boardRef.current;
    const fqEl    = flyingQueenRef.current;
    if (!boardEl || !fqEl) return;

    const qimgEl = boardEl.querySelector(`#qi-${col}`);
    if (qimgEl) {
      qimgEl.classList.add('lifted');
      await sleep(230);
    }

    const from = cellCenter(boardEl, col, fromRow, n);
    const to   = cellCenter(boardEl, col, toRow, n);

    const svgStr = queenSVG(col, fromRow);
    const src = 'data:image/svg+xml,' + encodeURIComponent(svgStr);
    fqEl.innerHTML = `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;"><img src="${src}" style="width: 75%; height: 75%; display: block;" /></div>`;

    fqEl.style.cssText = `display:block;left:${from.x - from.w / 2}px;top:${from.y - from.h / 2}px;width:${from.w}px;height:${from.h}px;opacity:1;transform:scale(1)`;
    if (qimgEl) qimgEl.style.opacity = '0';

    const srcCell = boardEl.querySelector(`#c-${col}-${fromRow}`);
    if (srcCell) {
      const t = document.createElement('div');
      t.className = 'trail-fx';
      srcCell.appendChild(t);
      setTimeout(() => t.remove(), 1050);
    }

    const dur = Math.min(speedRef.current * 0.52, 820);
    await flyArc(fqEl, from, to, dur);

    fqEl.style.display = 'none';

    const newQ = [...queensRef.current];
    newQ[col] = toRow;
    setQueens(newQ);
    queensRef.current = newQ;
    setAtkSet(attackedSet(newQ, n));
    setTgtSet(new Set());
    setBestSet(new Set());

    await sleep(80);
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

    const n = boardSizeRef.current;
    const cols = colLabels(n);
    const q  = queensRef.current;
    const hv = h(q, n);
    const T  = buildTable(q, n);
    const { h0, bestH, moves } = steepest(q, n);

    const newStep = stepNumRef.current + 1;
    setStepNum(newStep);
    stepNumRef.current = newStep;

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
    setAtkSet(attackedSet(q, n));
    updateMetrics(hv, bestH, moves.length);
    await sleep(Math.max(speedRef.current * 0.28, 220));

    if (bestH >= hv) {
      const reason = bestH === hv ? 'plateau' : 'worse';
      addLog(
        { type: 'stuck', step: newStep, hv, bestH, reason },
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
      if (autoTmrRef.current) { clearInterval(autoTmrRef.current); autoTmrRef.current = null; }
      busyRef.current = false;
      return;
    }

    const mv = moves[0];
    const fr = q[mv.col];
    const neighborCount = n * (n - 1);

    addLog(
      {
        type: 'step', step: newStep, hv, bestH, ties: moves.length, 
        n: neighborCount, col: cols[mv.col], frRow: fr + 1, toRow: mv.row + 1, 
        deltaH: hv - bestH
      },
      'step'
    );

    await animateMove(mv.col, fr, mv.row);

    const newQ = queensRef.current;
    const hv2  = h(newQ, n);
    const T2   = buildTable(newQ, n);
    const { bestH: bh2, moves: mv2 } = steepest(newQ, n);

    setHTable(T2);
    setBestSet(new Set());
    setTgtSet(new Set());
    setAtkSet(attackedSet(newQ, n));
    updateMetrics(hv2, bh2, mv2.length);

    setSnaps(prev => {
      const snap = { type: 'step', q: [...newQ], T: T2, best: new Set(), hv: hv2, hb: bh2, nb: mv2.length, step: newStep };
      const next = [...prev, snap];
      setActiveSnap(next.length - 1);
      return next;
    });

    if (hv2 === 0) {
      setPhase('solved');
      phaseRef.current = 'solved';
      const finalPos = newQ.map((r, c) => cols[c] + (r + 1)).join(', ');
      addLog(
        { type: 'solved', step: newStep, pos: finalPos },
        'ok'
      );
      setStopBox({ type: 'solved', hv: 0 });
      if (autoTmrRef.current) { clearInterval(autoTmrRef.current); autoTmrRef.current = null; }
      busyRef.current = false;
      return;
    }

    busyRef.current = false;
    phaseRef.current = 'ready';
    setPhase('ready');
  }, [addLog, updateMetrics, animateMove]);

  // ── AUTO RUN ──
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
    const n = boardSizeRef.current;
    setActiveSnap(idx);
    setQueens([...s.q]);
    queensRef.current = [...s.q];
    setHTable(s.T);
    setBestSet(s.best);
    setAtkSet(attackedSet(s.q, n));
    setTgtSet(new Set());
    updateMetrics(s.hv, s.hb, s.nb);
    setStepNum(s.step);
    stepNumRef.current = s.step;
  }, [snaps, updateMetrics]);

  // ── FULL RESET — back to last confirmed setup ──
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
    // Restore the position the user last confirmed (not the factory default)
    const restored = [...confirmedQRef.current];
    setSetupQ(restored);
    setQueens(restored);
    queensRef.current = restored;
  }, []);

  return {
    // State
    boardSize, queens, setupQ, phase, stepNum, speed, mode,
    metrics, hTable, bestSet, atkSet, tgtSet,
    logs, snaps, activeSnap, stopBox, inputErrs, isAuto,
    // Refs
    boardRef, flyingQueenRef,
    // Actions
    changeBoardSize, onSI, switchMode, onCellClick, doRandom, confirmSetup,
    doStep, toggleAuto, onSpeed, restoreSnap, fullReset,
    clearLog,
  };
}
