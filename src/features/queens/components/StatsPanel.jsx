import React, { useEffect, useRef } from "react";
import { colLabels } from "../constants/boardConstants.js";
import { hcls } from "../utils/boardUtils.js";
import { BarChart2, Map, ClipboardList } from "lucide-react";
import { useLang } from "../../../context/LanguageContext.jsx";

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
  const { t } = useLang();
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
          <span className="ph-ttl">{t('metrics.step').toUpperCase()}S / h(n)</span>
        </div>
        <div className="pb">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "7px" }}>
            <div className="metric">
              <div className="ml">{t('metrics.step')}</div>
              <div className="mv" id="m-step">{stepNum}</div>
            </div>
            <div className="metric">
              <div className="ml">{t('metrics.currentH')}</div>
              <div className={hvCls} id="m-h">
                {hv !== null && hv !== undefined ? hv : "—"}
              </div>
            </div>
            <div className="metric">
              <div className="ml">{t('metrics.bestH')}</div>
              <div className="mv" id="m-hb">
                {hb !== null && hb !== undefined ? hb : "—"}
              </div>
            </div>
            <div className="metric">
              <div className="ml">{t('metrics.bestMoves')}</div>
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
          <span className="ph-ttl">
            {t('heuristicTable')} — {neighborCount} {t('neighbors')}
          </span>
          {hTable.length > 0 && (
            <button
              className={`btn${copied ? " success" : ""}`}
              style={{ marginLeft: "auto", padding: "2px 9px", fontSize: ".58rem" }}
              onClick={handleCopyTable}
            >
              {copied ? t('buttons.copied') : t('buttons.copy')}
            </button>
          )}
        </div>
        <div className="pb">
          <div style={{ overflowX: "auto" }}>
            {hTable.length > 0 ? (
              <table
                className="htbl"
                id="htbl"
                style={{
                  gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
                  gridTemplateRows: `repeat(${boardSize}, 1fr)`,
                  aspectRatio: "1 / 1",
                }}
              >
                <tbody>
                  {Array.from(
                    { length: boardSize },
                    (_, i) => boardSize - 1 - i,
                  ).map((row) => (
                    <tr key={row}>
                      {Array.from({ length: boardSize }, (_, col) => {
                        const v = hTable[row]?.[col];
                        const isCur = queens[col] === row;
                        const isBest = bestSet.has(`${col},${row}`);
                        const cls = isCur
                          ? "cur"
                          : isBest
                            ? "best"
                            : hcls(v ?? 0);
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
                {t('tableHint')}
              </div>
            )}
          </div>
          <div style={{ marginTop: "8px", display: "flex", justifyContent: "space-evenly", flexWrap: "wrap", fontSize: ".58rem" }}>
            <span style={{ color: "var(--gold)" }}>❑ {t('legend.current')}</span>
            <span style={{ color: "var(--green)" }}>❑ {t('legend.best')}</span>
            <span style={{ color: "#45e87a" }}>❑ {t('legend.h0')}</span>
            <span style={{ color: "#85c858" }}>❑ {t('legend.low')}</span>
            <span style={{ color: "#c03030" }}>❑ {t('legend.high')}</span>
          </div>
          <div style={{ textAlign: "center", marginTop: "3px", fontSize: ".58rem", color: "var(--muted)" }}>
            {t('tableCaption')}
          </div>
        </div>
      </div>

      {/* ── LOG ── */}
      <div className="panel">
        <div className="ph">
          <ClipboardList size={15} className="ph-ico" />
          <span className="ph-ttl">{t('algorithmLog')}</span>
          <button
            className="btn"
            style={{ marginLeft: "auto", padding: "2px 9px", fontSize: ".58rem" }}
            onClick={clearLog}
          >
            {t('buttons.clear')}
          </button>
        </div>
        <div className="pb">
          <div className="log-area" ref={logRef} id="log">
            {logs.map((entry) => {
              const { id, data, cls } = entry;
              const className = `le${cls ? " " + cls : ""}`;
              if (!data) return null;

              if (data.type === 'initial') {
                return (
                  <div key={id} className={className}>
                    <div className="lt">{t('log.initialState')}</div>
                    <div className="lm">{t('log.position')}: [{data.pos}]</div>
                    <div className="lm">h(n) = <b style={{color:'var(--gold2)'}}>{data.hv}</b> {t('log.attackingPairs')}</div>
                    <div className="lm hi">{t('log.bestNeighbor')}: {t('log.hValue')} = {data.bestH} | {data.ties} {t('log.ties')}</div>
                    {data.hv === 0 && <div className="lm ok">{t('log.alreadySolved')}</div>}
                  </div>
                );
              }
              if (data.type === 'stuck') {
                return (
                  <div key={id} className={className}>
                    <div className="lt">{t('log.cannotImprove', { step: data.step })}</div>
                    <div className="lm">{t('log.currentH')} = <b style={{color:'var(--gold2)'}}>{data.hv}</b></div>
                    <div className="lm">{t('log.bestNeighborH')} = <b style={{color:'var(--red)'}}>{data.bestH}</b></div>
                    <div className="lm err">⚠ {data.reason === 'plateau' ? t('log.plateau') : t('log.worse')}</div>
                    <div className="lm err">{t('log.localOptimumReached')}</div>
                  </div>
                );
              }
              if (data.type === 'step') {
                return (
                  <div key={id} className={className}>
                    <div className="lt">{t('log.stepHeader', { step: data.step })}</div>
                    <div className="lm">{t('log.currentH')} = <b style={{color:'var(--gold2)'}}>{data.hv}</b></div>
                    <div className="lm hi">{t('log.scanned', { n: data.n })} = <b style={{color:'var(--green)'}}>{data.bestH}</b> ({data.ties} {t('log.ties')})</div>
                    <div className="lm ok">{t('log.condition')}: {data.bestH} &lt; {data.hv} → {t('log.moveTo')}</div>
                    <div className="lm ok">→ {t('log.col')} <b>{data.col}</b>: {t('log.row')} {data.frRow} → {t('log.row')} {data.toRow}  ({t('log.deltaH')} = {data.deltaH})</div>
                  </div>
                );
              }
              if (data.type === 'solved') {
                return (
                  <div key={id} className={className}>
                    <div className="lt" style={{color:'var(--green)'}}>{t('log.solvedHeader', { step: data.step })}</div>
                    <div className="lm ok">{t('log.solvedH')}</div>
                    <div className="lm ok">{t('log.finalPosition')}: [{data.pos}]</div>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      </div>
    </>
  );
});

export default StatsPanel;
