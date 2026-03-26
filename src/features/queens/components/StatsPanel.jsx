import React, { useEffect, useRef } from 'react';
import { COLS } from '../constants/boardConstants.js';
import { hcls } from '../utils/boardUtils.js';

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
}) {
  const logRef = useRef(null);

  // Auto-scroll log to bottom when new entries arrive
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  const { hv, hb, nb } = metrics;

  const hvCls = hv === 0 ? 'mv good' : hv > 4 ? 'mv bad' : 'mv';

  return (
    <>
      {/* ── METRICS ── */}
      <div className="panel">
        <div className="ph">
          <span className="ph-ico">📊</span>
          <span className="ph-ttl">CHỈ SỐ</span>
        </div>
        <div className="pb">
          <div className="metrics">
            <div className="metric">
              <div className="ml">Bước</div>
              <div className="mv" id="m-step">{stepNum}</div>
            </div>
            <div className="metric">
              <div className="ml">h(n) hiện tại</div>
              <div className={hvCls} id="m-h">{hv !== null && hv !== undefined ? hv : '—'}</div>
            </div>
            <div className="metric">
              <div className="ml">h tốt nhất LG</div>
              <div className="mv" id="m-hb">{hb !== null && hb !== undefined ? hb : '—'}</div>
            </div>
            <div className="metric">
              <div className="ml">Số LG tốt nhất</div>
              <div className="mv" id="m-nb">{nb !== null && nb !== undefined ? nb : '—'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── HEURISTIC TABLE ── */}
      <div className="panel">
        <div className="ph">
          <span className="ph-ico">🗺</span>
          <span className="ph-ttl">BẢNG HEURISTIC h(n) — 56 LÁNG GIỀNG</span>
        </div>
        <div className="pb">
          <div style={{ overflowX: 'auto' }}>
            {hTable.length > 0 ? (
              <table className="htbl" id="htbl">
                <thead>
                  <tr>
                    <th className="rl"></th>
                    {COLS.map(c => <th key={c}>{c}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {[7, 6, 5, 4, 3, 2, 1, 0].map(row => (
                    <tr key={row}>
                      <td className="rl">{row + 1}</td>
                      {Array.from({ length: 8 }, (_, col) => {
                        const v = hTable[row]?.[col];
                        const isCur  = queens[col] === row;
                        const isBest = bestSet.has(`${col},${row}`);
                        const cls = isCur ? 'cur' : isBest ? 'best' : hcls(v ?? 0);
                        return (
                          <td key={col} className={cls}>
                            {isCur ? '♛' : (v !== undefined ? v : '')}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ fontSize: '.64rem', color: 'var(--muted)', padding: '8px 0' }}>
                Xác nhận vị trí khởi đầu để xem bảng heuristic.
              </div>
            )}
          </div>
          <div style={{ marginTop: '8px', display: 'flex', gap: '10px', flexWrap: 'wrap', fontSize: '.58rem' }}>
            <span style={{ color: 'var(--gold)'  }}>■ Vị trí hiện tại ♛</span>
            <span style={{ color: 'var(--green)' }}>■ Nước tốt nhất</span>
            <span style={{ color: '#45e87a'       }}>■ h=0</span>
            <span style={{ color: '#85c858'       }}>■ h thấp</span>
            <span style={{ color: '#c03030'       }}>■ h cao</span>
          </div>
          <div style={{ marginTop: '3px', fontSize: '.58rem', color: 'var(--muted)' }}>
            Giá trị tại ô (col c, row r) = h(n) nếu dời hậu cột <i>c</i> lên hàng <i>r</i>
          </div>
        </div>
      </div>

      {/* ── LOG ── */}
      <div className="panel">
        <div className="ph">
          <span className="ph-ico">📋</span>
          <span className="ph-ttl">NHẬT KÝ THUẬT TOÁN</span>
          <button
            className="btn"
            style={{ marginLeft: 'auto', padding: '2px 9px', fontSize: '.58rem' }}
            onClick={clearLog}
          >Xóa</button>
        </div>
        <div className="pb">
          <div className="log-area" ref={logRef} id="log">
            {logs.map(entry => (
              <div
                key={entry.id}
                className={`le${entry.cls ? ' ' + entry.cls : ''}`}
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
