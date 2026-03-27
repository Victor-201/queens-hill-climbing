import React, { useRef, useState, useEffect } from "react";
import { colLabels, BOARD_SIZES } from "../constants/boardConstants.js";
import { useLang } from "../../../context/LanguageContext.jsx";
import {
  Pencil,
  Settings,
  Check,
  AlertTriangle,
  StepForward,
  Square,
  RotateCcw,
  Zap,
  LayoutGrid,
} from "lucide-react";
import LanguageSwitcher from "../../LanguageSwitcher.jsx";

function ControlPanel({
  boardSize = 8,
  setupQ,
  phase,
  mode,
  speed,
  isAuto,
  snaps,
  activeSnap,
  stopBox,
  inputErrs,
  changeBoardSize,
  switchMode,
  doRandom,
  confirmSetup,
  doStep,
  toggleAuto,
  fullReset,
  onSpeed,
  restoreSnap,
  onSIChange,
}) {
  const { t } = useLang();
  const COLS = colLabels(boardSize);

  const [inputVals, setInputVals] = useState(() =>
    setupQ.map((r) => String(r + 1)),
  );

  useEffect(() => {
    setInputVals(setupQ.map((r) => String(r + 1)));
  }, [setupQ]);

  const handleConfirm = () => confirmSetup(inputVals);

  const handleInput = (col, val) => {
    setInputVals((prev) => {
      const nv = [...prev];
      nv[col] = val;
      return nv;
    });
    onSIChange(col, val);
  };

  const isSolved  = phase === "solved";
  const isStuck   = phase === "stuck";
  const isSetup   = phase === "setup";
  const isRunning = phase === "running";

  const stepDisabled = isSetup || isSolved || isStuck || isRunning || isAuto;
  const autoDisabled = isSetup || isSolved || isStuck;

  const statusMap = {
    setup:   ["init", t('status.waiting')],
    ready:   ["init", t('status.ready')],
    running: ["run",  t('status.running')],
    solved:  ["ok",   <><Check size={12} style={{ display:"inline", marginBottom:"-2px" }} /> {t('status.solved')}</>],
    stuck:   ["bad",  <><AlertTriangle size={12} style={{ display:"inline", marginBottom:"-2px" }} /> {t('status.localOptimum')}</>],
  };
  const [statusCls, statusLbl] = statusMap[phase] || ["init", phase];

  return (
    <>
      {/* ── BOARD SIZE ── */}
      <div className="panel">
        <div className="ph">
          <LayoutGrid size={15} className="ph-ico" />
          <span className="ph-ttl">{t('boardSize')}</span>
        </div>
        <div className="pb" style={{ paddingTop: "10px", paddingBottom: "10px" }}>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {BOARD_SIZES.map((n) => (
              <button
                key={n}
                className={`btn${boardSize === n ? " primary" : ""}`}
                style={{ flex: 1, justifyContent: "center", minWidth: "44px", padding: "5px 6px" }}
                onClick={() => changeBoardSize(n)}
              >
                {n}×{n}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── SETUP ── */}
      <div className="panel">
        <div className="ph">
          <Pencil size={15} className="ph-ico" />
          <span className="ph-ttl">{t('initialPosition')}</span>
          <span style={{ marginLeft: "auto" }}>
            <span className={`spill ${statusCls}`}>
              <span className="sdot" />
              {statusLbl}
            </span>
          </span>
        </div>
        <div className="pb">
          {/* Tabs + Random */}
          <div className="row mt6" style={{ flexWrap: "nowrap", justifyContent: "space-between" }}>
            <div className="tabs" style={{ display: "flex", flexShrink: 1 }}>
              <button
                className={`tab${mode === "manual" ? " on" : ""}`}
                onClick={() => switchMode("manual")}
              >
                {t('modes.manual')}
              </button>
              <button
                className={`tab${mode === "click" ? " on" : ""}`}
                onClick={() => switchMode("click")}
              >
                {t('modes.dragdrop')}
              </button>
            </div>
            <button
              className="btn warn"
              style={{ padding: "6px 10px", flexShrink: 0, whiteSpace: "nowrap" }}
              onClick={doRandom}
            >
              {t('buttons.random')}
            </button>
          </div>

          {/* Manual inputs */}
          <div className="mt10" style={{ display: mode === "manual" ? "block" : "none" }}>
            <div style={{ fontSize: ".6rem", color: "var(--muted)", marginBottom: "6px" }}>
              {t('manualHint', { n: boardSize })}
            </div>
            <div className="setup-cols">
              {COLS.map((c, i) => {
                const val = inputVals[i];
                const num = parseInt(val, 10);
                const isValid = !isNaN(num) && num >= 1 && num <= boardSize;
                return (
                  <div key={c} className="sc-col">
                    <div className="sc-lbl">{c}</div>
                    <input
                      className={`sc-inp ${isValid ? "ok" : "inv"}`}
                      id={`si${i}`}
                      type="number"
                      min="1"
                      max={boardSize}
                      value={val ?? ""}
                      onChange={(e) => handleInput(i, e.target.value)}
                    />
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize: ".58rem", color: "var(--muted)", marginTop: "4px" }}>
              <AlertTriangle size={10} style={{ display:"inline", marginBottom:"-2px" }} />{" "}
              {t('manualNote')}
            </div>
          </div>

          {/* Drag mode hint */}
          <div className="mt8" style={{ display: mode === "click" ? "block" : "none" }}>
            <div style={{ fontSize: ".65rem", color: "var(--muted)", lineHeight: 1.7 }}>
              {t('dragHint')}
            </div>
          </div>

          {inputErrs && (
            <div className="sc-err">
              <AlertTriangle size={12} style={{ display:"inline", marginBottom:"-2px" }} />{" "}
              {t('inputError', { n: boardSize })}
            </div>
          )}

          <div className="mt8">
            <button
              className="btn primary"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={handleConfirm}
            >
              <Check size={14} /> {t('buttons.confirm')}
            </button>
          </div>
        </div>
      </div>

      {/* ── CONTROLS ── */}
      <div className="panel">
        <div className="ph">
          <Settings size={15} className="ph-ico" />
          <span className="ph-ttl">{t('controls')}</span>
        </div>
        <div className="pb" style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
          <div className="row">
            <button className="btn primary" id="btn-step" onClick={doStep} disabled={stepDisabled}>
              <StepForward size={14} /> {t('buttons.nextStep')}
            </button>
            <button className="btn" id="btn-auto" onClick={toggleAuto} disabled={autoDisabled}>
              {isAuto
                ? <><Square size={14} /> {t('buttons.stop')}</>
                : <><Zap size={14} /> {t('buttons.auto')}</>}
            </button>
            <button className="btn danger" onClick={fullReset}>
              <RotateCcw size={14} /> {t('buttons.reset')}
            </button>
          </div>

          <div className="speed-row">
            {t('speed')}:
            <input
              type="range" min="300" max="2800" value={speed}
              style={{ flex: 1 }}
              onChange={(e) => onSpeed(e.target.value)}
            />
            <span style={{ minWidth: "52px" }}>{speed}ms</span>
          </div>

          <div className="row" style={{ alignItems: "center", justifyContent: "space-between", fontSize: ".68rem", fontWeight: 600, color: "var(--tx)", background: "var(--sf)", padding: "6px 10px", borderRadius: "6px", border: "1px solid var(--bd)" }}>
            <span>{t('language')}:</span>
            <LanguageSwitcher />
          </div>

          <div style={{ fontSize: ".58rem", color: "var(--muted)" }}>{t('history')}:</div>
          <div className="hist-row">
            {snaps.map((snap, idx) => {
              let label;
              if (idx === 0)            label = t('snapLabels.start');
              else if (snap.type === "stuck") label = t('snapLabels.stuck', { step: snap.step });
              else                       label = t('snapLabels.step', { step: snap.step });
              return (
                <div
                  key={idx}
                  className={`hchip${activeSnap === idx ? " on" : ""}`}
                  onClick={() => restoreSnap(idx)}
                >
                  {label}
                </div>
              );
            })}
          </div>

          {stopBox && (
            <div className={`stop-box ${stopBox.type === "solved" ? "solved" : "local"}`}>
              {stopBox.type === "solved" ? (
                <>
                  <Check size={14} style={{ display:"inline", marginBottom:"-2px" }} />{" "}
                  <b>{t('stopBox.solved')}</b><br />
                  {t('stopBox.solvedDetail')}
                </>
              ) : (
                <>
                  <AlertTriangle size={14} style={{ display:"inline", marginBottom:"-2px" }} />{" "}
                  <b>{t('stopBox.localOptimum')}</b><br />
                  {t('stopBox.localDetail', { hv: stopBox.hv, bestH: stopBox.bestH })}<br />
                  {t('stopBox.localConclusion')}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ControlPanel;
