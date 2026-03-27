import React, { useEffect, useRef } from "react";
import { colLabels } from "../constants/boardConstants.js";
import { hcls } from "../utils/boardUtils.js";
import { BarChart2, Map, ClipboardList } from "lucide-react";

/**
 * Stats Panel — right column.
 * Contains: metrics cards, heuristic table, algorithm log.
 */
const StatsPanel = React.memo(function StatsPanel({
  queens,
  metrics,
  hTable,
  bestSet,
  logs,
  stepNum,
  clearLog,
  boardSize = 8,
}) {
  const logRef = useRef(null);
  const COLS = colLabels(boardSize);
  const neighborCount = boardSize * (boardSize - 1);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  const { hv, hb, nb } = metrics;
  const hvCls = hv === 0 ? "mv good" : hv > 4 ? "mv bad" : "mv";

  const [copied, setCopied] = React.useState(false);
  const handleCopyTable = () => {
    if (!hTable || hTable.length === 0) return;
    let text = "";
    for (let row = boardSize - 1; row >= 0; row--) {
      const rowData = [];
      for (let col = 0; col < boardSize; col++) {
        const v = hTable[row]?.[col];
        if (queens[col] === row) {
          rowData.push("♛");
        } else {
          rowData.push(v !== undefined && v !== null ? v.toString() : "-");
        }
      }
      text += rowData.join("\t") + "\n";
    }
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <>
      {/* ── METRICS ── */}
      <div className="panel">
        <div className="ph">
          <BarChart2 size={15} className="ph-ico" />
          <span className="ph-ttl">CHỈ SỐ</span>
        </div>
        <div className="pb">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "7px" }}>
            <div className="metric">
              <div className="ml">Bước</div>
              <div className="mv" id="m-step">{stepNum}</div>
            </div>
            <div className="metric">
              <div className="ml">h(n) hiện tại</div>
              <div className={hvCls} id="m-h">
                {hv !== null && hv !== undefined ? hv : "—"}
              </div>
            </div>
            <div className="metric">
              <div className="ml">H tốt nhất</div>
              <div className="mv" id="m-hb">
                {hb !== null && hb !== undefined ? hb : "—"}
              </div>
            </div>
            <div className="metric">
              <div className="ml">Số nước đi tốt nhất</div>
              <div className="mv" id="m-nb">
                {nb !== null && nb !== undefined ? nb : "—"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── HEURISTIC TABLE ── */}
      <div className="panel">
        <div className="ph">
          <Map size={15} className="ph-ico" />
          <span className="ph-ttl">BẢNG HEURISTIC h(n) — {neighborCount} LÁNG GIỀNG</span>
          {hTable.length > 0 && (
            <button
              className={`btn${copied ? " success" : ""}`}
              style={{ marginLeft: "auto", padding: "2px 9px", fontSize: ".58rem" }}
              onClick={handleCopyTable}
            >
              {copied ? "✓ Đã copy" : "Copy"}
            </button>
          )}
        </div>
        <div className="pb">
          <div style={{ overflowX: "auto" }}>
            {hTable.length > 0 ? (
              <table
                className="htbl"
                id="htbl"
                style={{ gridTemplateColumns: `repeat(${boardSize}, 1fr)`, aspectRatio: '1 / 1' }}
              >
                <tbody>
                  {Array.from({ length: boardSize }, (_, i) => boardSize - 1 - i).map((row) => (
                    <tr key={row}>
                      {Array.from({ length: boardSize }, (_, col) => {
                        const v = hTable[row]?.[col];
                        const isCur = queens[col] === row;
                        const isBest = bestSet.has(`${col},${row}`);
                        const cls = isCur ? "cur" : isBest ? "best" : hcls(v ?? 0);
                        return (
                          <td key={col} className={cls}>
                            {isCur ? "♛" : v !== undefined ? v : ""}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ fontSize: ".64rem", color: "var(--muted)", padding: "8px 0" }}>
                Xác nhận vị trí khởi đầu để xem bảng heuristic.
              </div>
            )}
          </div>
          <div style={{ marginTop: "8px", display: "flex", justifyContent: "space-evenly", flexWrap: "wrap", fontSize: ".58rem" }}>
            <span style={{ color: "var(--gold)" }}>❑ Vị trí hiện tại</span>
            <span style={{ color: "var(--green)" }}>❑ Nước tốt nhất</span>
            <span style={{ color: "#45e87a" }}>❑ h=0</span>
            <span style={{ color: "#85c858" }}>❑ h thấp</span>
            <span style={{ color: "#c03030" }}>❑ h cao</span>
          </div>
          <div style={{ textAlign: "center", marginTop: "3px", fontSize: ".58rem", color: "var(--muted)" }}>
            Giá trị tại ô (col c, row r) = h(n) nếu dời hậu cột <i>c</i> lên hàng <i>r</i>
          </div>
        </div>
      </div>

      {/* ── LOG ── */}
      <div className="panel">
        <div className="ph">
          <ClipboardList size={15} className="ph-ico" />
          <span className="ph-ttl">NHẬT KÝ THUẬT TOÁN</span>
          <button
            className="btn"
            style={{ marginLeft: "auto", padding: "2px 9px", fontSize: ".58rem" }}
            onClick={clearLog}
          >
            Xóa
          </button>
        </div>
        <div className="pb">
          <div className="log-area" ref={logRef} id="log">
            {logs.map((entry) => (
              <div
                key={entry.id}
                className={`le${entry.cls ? " " + entry.cls : ""}`}
                dangerouslySetInnerHTML={{ __html: entry.html }}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
});

export default StatsPanel;
