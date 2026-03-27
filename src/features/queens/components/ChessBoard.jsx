import React, { useCallback, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { COLS } from "../constants/boardConstants.js";
import Queen from "./Queen.jsx";
import { queenSVG } from "../utils/boardUtils.js";

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
  const isClickable =
    (phase === "setup" || phase === "ready") && mode === "click";

  const [drag, setDrag] = useState(null);
  const [landed, setLanded] = useState(null);
  const [dragHover, setDragHover] = useState(null);

  const dragRef = React.useRef(null);
  const hoverRef = React.useRef(null);
  const ghostRef = React.useRef(null);
  dragRef.current = drag;
  hoverRef.current = dragHover;

  const isDragging = drag !== null;
  const [ghostLifted, setGhostLifted] = useState(false);

  useEffect(() => {
    if (drag) {
      let r1 = requestAnimationFrame(() => {
        requestAnimationFrame(() => setGhostLifted(true));
      });
      return () => setGhostLifted(false);
    }
  }, [drag]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e) => {
      if (ghostRef.current && dragRef.current) {
         ghostRef.current.style.left = (e.clientX - dragRef.current.dx) + 'px';
         ghostRef.current.style.top  = (e.clientY - dragRef.current.dy) + 'px';
      }

      const el = document.elementFromPoint(e.clientX, e.clientY);
      const cell = el?.closest('.cell');
      if (cell && cell.id) {
         const parts = cell.id.split('-');
         const dCol = parseInt(parts[1]);
         const dRow = parseInt(parts[2]);
         if (!isNaN(dCol) && !isNaN(dRow) && dragRef.current) {
            const currentDragCol = dragRef.current.col;
            setDragHover(prev => (prev?.col === currentDragCol && prev?.row === dRow) ? prev : { col: currentDragCol, row: dRow }); 
         } else {
            setDragHover(prev => prev === null ? null : null);
         }
      } else {
         setDragHover(prev => prev === null ? null : null);
      }
    };

    const handleUp = (e) => {
      document.body.style.cursor = '';
      const finalDrag = dragRef.current;
      const finalHover = hoverRef.current;

      if (finalDrag) {
         if (finalHover) {
            if (finalHover.row !== finalDrag.startRow) {
               onCellClick(finalDrag.col, finalHover.row);
            }
            setLanded({ col: finalDrag.col, row: finalHover.row });
         } else {
            setLanded({ col: finalDrag.col, row: finalDrag.startRow });
         }
         setTimeout(() => setLanded(null), 500);
      }
      setDrag(null);
      setDragHover(null);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, [isDragging, onCellClick]);

  const dragCol = drag ? drag.col : null;

  const renderCell = useCallback(
    (col, row) => {
      const isLight = (row + col) % 2 === 0;
      const hasQueen = queens[col] === row;
      const isAtk = atkSet.has(`${col},${row}`);
      const isTgt = tgtSet.has(`${col},${row}`);

      const isHoverTarget = dragHover?.col === col && dragHover?.row === row;
      let cls = "cell " + (isLight ? "light" : "dark");
      if (isClickable) cls += " clickable";
      if (isAtk) cls += " atk";
      if (isTgt) cls += " tgt";
      if (isHoverTarget) cls += " drag-over";

      const getCursor = () => {
        if (!isClickable) return 'default';
        if (isDragging) return 'grabbing';
        return hasQueen ? 'grab' : 'default';
      };

      return (
        <div
          key={`${col}-${row}`}
          id={`c-${col}-${row}`}
          className={cls}
          style={{ cursor: getCursor() }}
          onPointerDown={(e) => {
             if (isClickable && hasQueen) {
                const rect = e.currentTarget.getBoundingClientRect();
                e.currentTarget.setPointerCapture(e.pointerId);
                document.body.style.cursor = 'grabbing';
                
                const t = document.createElement('div');
                t.className = 'trail-fx';
                e.currentTarget.appendChild(t);
                setTimeout(() => t.remove(), 1050);

                const dx = e.clientX - rect.left;
                const dy = e.clientY - rect.top;
                setDrag({ col, startRow: row, x: e.clientX, y: e.clientY, w: rect.width, h: rect.height, dx, dy });
             }
          }}
        >
          {isTgt && <div className="tgt-ring" />}
          {hasQueen && (!isDragging || dragCol !== col) && <Queen col={col} row={row} isLanding={landed?.col === col && landed?.row === row} />}
          {hasQueen && isDragging && dragCol === col && (
            <div style={{ opacity: 0 }}>
              <Queen col={col} row={row} />
            </div>
          )}
          {isHoverTarget && !hasQueen && (
            <div style={{ position: 'absolute', inset: 0, opacity: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={'data:image/svg+xml,' + encodeURIComponent(queenSVG(dragCol, row))} style={{ width: '75%', height: '75%' }} alt="ghost-target" />
            </div>
          )}
        </div>
      );
    },
    [queens, phase, mode, atkSet, tgtSet, isClickable, onCellClick, dragCol, isDragging, landed, dragHover],
  );

  // Render rows from top (row=7) to bottom (row=0)
  const cells = [];
  for (let row = 7; row >= 0; row--) {
    for (let col = 0; col < 8; col++) {
      cells.push(renderCell(col, row));
    }
  }

  return (
    <div className={`board-wrap${drag ? ' is-dragging' : ''}`}>
      {/* Column labels */}
      <div className="board-clabels">
        {COLS.map((c) => (
          <div key={c} className="board-clbl">
            {c}
          </div>
        ))}
      </div>

      <div className="board-body">
        {/* Row labels */}
        <div className="board-rlabels">
          {[8, 7, 6, 5, 4, 3, 2, 1].map((r) => (
            <div key={r} className="board-rlbl">
              {r}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div 
          className="board-grid" ref={boardRef}
          style={{ userSelect: "none", touchAction: "none" }}
        >
          {cells}
        </div>
      </div>

      {/* Queen position badges */}
      <div className="qbadges">
        {queens.map((r, c) => (
          <div key={c} className="qb">
            {COLS[c]}
            {r + 1}
          </div>
        ))}
      </div>

      {/* Ghost Drag Overlay */}
      {drag && typeof document !== 'undefined' && createPortal(
        <div
          ref={ghostRef}
          style={{
            position: 'fixed',
            left: drag.x - drag.dx,
            top: drag.y - drag.dy,
            width: drag.w,
            height: drag.h,
            pointerEvents: 'none',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src={'data:image/svg+xml,' + encodeURIComponent(queenSVG(drag.col, drag.startRow))}
            className={`qsvg${ghostLifted ? ' lifted' : ''}`}
            alt=""
            draggable={false}
          />
        </div>,
        document.body
      )}
    </div>
  );
});

export default ChessBoard;
