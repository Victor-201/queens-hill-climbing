import React, { useCallback } from 'react';
import { COLS } from '../constants/boardConstants.js';
import Queen from './Queen.jsx';

/**
 * Chess board component.
 * Renders 8×8 grid with row/column labels, queen pieces, attack hatching, and target rings.
 * The gridRef and flyingQueenRef are forwarded from useHillClimbing for animation.
 */
const ChessBoard = React.memo(function ChessBoard({
  queens,
  phase,
  mode,
  atkSet,
  tgtSet,
  boardRef,
  onCellClick,
}) {
  const isClickable = (phase === 'setup' || phase === 'ready') && mode === 'click';

  const renderCell = useCallback((col, row) => {
    const isLight = (row + col) % 2 === 0;
    const hasQueen = queens[col] === row;
    const isAtk = atkSet.has(`${col},${row}`);
    const isTgt = tgtSet.has(`${col},${row}`);

    let cls = 'cell ' + (isLight ? 'light' : 'dark');
    if (isClickable) cls += ' clickable';
    if (isAtk) cls += ' atk';
    if (isTgt) cls += ' tgt';

    return (
      <div
        key={`${col}-${row}`}
        id={`c-${col}-${row}`}
        className={cls}
        onClick={() => onCellClick(col, row)}
      >
        {isTgt && <div className="tgt-ring" />}
        {hasQueen && <Queen col={col} row={row} />}
      </div>
    );
  }, [queens, phase, mode, atkSet, tgtSet, isClickable, onCellClick]);

  // Render rows from top (row=7) to bottom (row=0)
  const cells = [];
  for (let row = 7; row >= 0; row--) {
    for (let col = 0; col < 8; col++) {
      cells.push(renderCell(col, row));
    }
  }

  return (
    <div className="board-wrap">
      {/* Column labels */}
      <div className="board-clabels">
        {COLS.map(c => (
          <div key={c} className="board-clbl">{c}</div>
        ))}
      </div>

      <div className="board-body">
        {/* Row labels */}
        <div className="board-rlabels">
          {[8, 7, 6, 5, 4, 3, 2, 1].map(r => (
            <div key={r} className="board-rlbl">{r}</div>
          ))}
        </div>

        {/* Grid */}
        <div className="board-grid" ref={boardRef}>
          {cells}
        </div>
      </div>

      {/* Queen position badges */}
      <div className="qbadges">
        {queens.map((r, c) => (
          <div key={c} className="qb">{COLS[c]}{r + 1}</div>
        ))}
      </div>
    </div>
  );
});

export default ChessBoard;
