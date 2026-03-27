import React, { useRef, useState, useEffect } from "react";
import { COLS } from "../constants/boardConstants.js";
import {
  Pencil,
  Settings,
  Check,
  AlertTriangle,
  Play,
  Square,
  StepForward,
  RotateCcw,
  Zap,
} from "lucide-react";

/**
 * Control Panel — left column, lower section.
 * Contains:
 *  - Setup panel (tabs, inputs, random, confirm)
 *  - Controls (step, auto, reset, speed, history chips, stop box)
 */
function ControlPanel({
  setupQ,
  phase,
  mode,
  speed,
  isAuto,
  snaps,
  activeSnap,
  stopBox,
  inputErrs,
  // callbacks
  switchMode,
  doRandom,
  confirmSetup,
  doStep,
  toggleAuto,
  fullReset,
  onSpeed,
  restoreSnap,
  onSIChange, // (col, val)
}) {
  // Track local input values for the confirm button
  const [inputVals, setInputVals] = useState(() =>
    setupQ.map((r) => String(r + 1)),
  );

  // Sync when setupQ changes externally (random / reset)
  useEffect(() => {
    setInputVals(setupQ.map((r) => String(r + 1)));
  }, [setupQ]);

  const handleConfirm = () => {
    confirmSetup(inputVals);
  };

  const handleInput = (col, val) => {
    setInputVals((prev) => {
      const nv = [...prev];
      nv[col] = val;
      return nv;
    });
    onSIChange(col, val);
  };

  const isReady = phase === "ready";
  const isRunning = phase === "running";
  const isSolved = phase === "solved";
  const isStuck = phase === "stuck";
  const isSetup = phase === "setup";

  const stepDisabled = isSetup || isSolved || isStuck || isRunning || isAuto;
  const autoDisabled = isSetup || isSolved || isStuck;

  const statusMap = {
    setup: ["init", "Chờ xác nhận"],
    ready: ["init", "Sẵn sàng"],
    running: ["run", "Đang chạy"],
    solved: [
      "ok",
      <>
        <Check size={12} style={{ display: "inline", marginBottom: "-2px" }} />{" "}
        Giải xong
      </>,
    ],
    stuck: [
      "bad",
      <>
        <AlertTriangle
          size={12}
          style={{ display: "inline", marginBottom: "-2px" }}
        />{" "}
        Local Optimum
      </>,
    ],
  };
  const [statusCls, statusLbl] = statusMap[phase] || ["init", phase];

  return (
    <>
      {/* ── SETUP PANEL ── */}
      <div className="panel">
        <div className="ph">
          <Pencil size={15} className="ph-ico" />
          <span className="ph-ttl">VỊ TRÍ KHỞI TẠO</span>
          <span style={{ marginLeft: "auto" }}>
            <span className={`spill ${statusCls}`}>
              <span className="sdot" />
              {statusLbl}
            </span>
          </span>
        </div>
        <div className="pb">
          {/* Row 1: Mode tabs + Ngẫu nhiên */}
          <div
            className="row mt6"
            style={{ flexWrap: "nowrap", justifyContent: "space-between" }}
          >
            <div className="tabs" style={{ display: "flex", flexShrink: 1 }}>
              <button
                className={`tab${mode === "manual" ? " on" : ""}`}
                onClick={() => switchMode("manual")}
              >
                Nhập tay
              </button>
              <button
                className={`tab${mode === "click" ? " on" : ""}`}
                onClick={() => switchMode("click")}
              >
                Kéo thả
              </button>
            </div>
            <button
              className="btn warn"
              style={{
                padding: "6px 10px",
                flexShrink: 0,
                whiteSpace: "nowrap",
              }}
              onClick={doRandom}
            >
              Ngẫu nhiên
            </button>
          </div>

          {/* Manual input */}
          <div
            id="panel-m"
            className="mt10"
            style={{ display: mode === "manual" ? "block" : "none" }}
          >
            <div
              style={{
                fontSize: ".6rem",
                color: "var(--muted)",
                marginBottom: "6px",
              }}
            >
              Nhập hàng (1–8) cho mỗi cột — bàn cờ cập nhật realtime:
            </div>
            <div className="setup-cols">
              {COLS.map((c, i) => {
                const val = inputVals[i];
                const num = parseInt(val, 10);
                const isValid = !isNaN(num) && num >= 1 && num <= 8;
                return (
                  <div key={c} className="sc-col">
                    <div className="sc-lbl">{c}</div>
                    <input
                      className={`sc-inp ${isValid ? "ok" : "inv"}`}
                      id={`si${i}`}
                      type="number"
                      min="1"
                      max="8"
                      value={val ?? ""}
                      onChange={(e) => handleInput(i, e.target.value)}
                    />
                  </div>
                );
              })}
            </div>
            <div
              style={{
                fontSize: ".58rem",
                color: "var(--muted)",
                marginTop: "4px",
              }}
            >
              <AlertTriangle
                size={10}
                style={{ display: "inline", marginBottom: "-2px" }}
              />{" "}
              Mỗi cột chứa đúng 1 quân hậu — chỉ cần chỉ định hàng
            </div>
          </div>

          {/* Click mode info */}
          <div
            id="panel-c"
            className="mt8"
            style={{ display: mode === "click" ? "block" : "none" }}
          >
            <div
              style={{
                fontSize: ".65rem",
                color: "var(--muted)",
                lineHeight: 1.7,
              }}
            >
              Kéo thả quân hậu trên bàn cờ để đặt hậu. Mỗi cột chỉ 1 quân.
            </div>
          </div>

          {inputErrs && (
            <div className="sc-err">
              <AlertTriangle
                size={12}
                style={{ display: "inline", marginBottom: "-2px" }}
              />{" "}
              Cần điền đủ hàng (1–8) cho tất cả các cột!
            </div>
          )}

          {/* Confirm button — bottom of panel */}
          <div className="mt8">
            <button
              className="btn primary"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={handleConfirm}
            >
              <Check size={14} /> Xác nhận
            </button>
          </div>
        </div>
      </div>

      {/* ── CONTROLS PANEL ── */}
      <div className="panel">
        <div className="ph">
          <Settings size={15} className="ph-ico" />
          <span className="ph-ttl">ĐIỀU KHIỂN</span>
        </div>
        <div
          className="pb"
          style={{ display: "flex", flexDirection: "column", gap: "9px" }}
        >
          <div className="row">
            <button
              className="btn primary"
              id="btn-step"
              onClick={doStep}
              disabled={stepDisabled}
            >
              <StepForward size={14} /> Bước tiếp
            </button>
            <button
              className="btn"
              id="btn-auto"
              onClick={toggleAuto}
              disabled={autoDisabled}
            >
              {isAuto ? (
                <>
                  <Square size={14} /> Dừng
                </>
              ) : (
                <>
                  <Zap size={14} /> Tự động
                </>
              )}
            </button>
            <button className="btn danger" onClick={fullReset}>
              <RotateCcw size={14} /> Reset
            </button>
          </div>

          <div className="speed-row">
            Tốc độ:
            <input
              type="range"
              min="300"
              max="2800"
              value={speed}
              style={{ flex: 1 }}
              onChange={(e) => onSpeed(e.target.value)}
            />
            <span style={{ minWidth: "52px" }}>{speed}ms</span>
          </div>

          <div style={{ fontSize: ".58rem", color: "var(--muted)" }}>
            Lịch sử:
          </div>
          <div className="hist-row">
            {snaps.map((snap, idx) => {
              let label;
              if (idx === 0) label = "Khởi đầu";
              else if (snap.type === "stuck") label = `Kẹt@${snap.step}`;
              else label = `B${snap.step}`;
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

          {/* Stop box */}
          {stopBox && (
            <div
              className={`stop-box ${stopBox.type === "solved" ? "solved" : "local"}`}
            >
              {stopBox.type === "solved" ? (
                <>
                  <Check
                    size={14}
                    style={{ display: "inline", marginBottom: "-2px" }}
                  />{" "}
                  <b>Giải xong!</b> h(n) = 0<br />
                  Không còn cặp hậu nào tấn công nhau.
                </>
              ) : (
                <>
                  <AlertTriangle
                    size={14}
                    style={{ display: "inline", marginBottom: "-2px" }}
                  />{" "}
                  <b>Local Optimum!</b>
                  <br />
                  h(n) hiện tại = {stopBox.hv} | h tốt nhất LG = {stopBox.bestH}
                  <br />
                  Không có láng giềng nào có h nhỏ hơn → Dừng.
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
