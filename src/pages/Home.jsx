import React, { useCallback } from 'react';
import { useHillClimbing } from '../features/queens/hooks/useHillClimbing.js';
import Navbar from '../components/layout/Navbar.jsx';
import Container from '../components/layout/Container.jsx';
import ChessBoard from '../features/queens/components/ChessBoard.jsx';
import ControlPanel from '../features/queens/components/ControlPanel.jsx';
import StatsPanel from '../features/queens/components/StatsPanel.jsx';

export default function Home() {
  const {
    queens, setupQ, phase, stepNum, speed, mode,
    metrics, hTable, bestSet, atkSet, tgtSet,
    logs, snaps, activeSnap, stopBox, inputErrs, isAuto,
    boardRef, flyingQueenRef,
    onSI, switchMode, onCellClick, doRandom, confirmSetup,
    doStep, toggleAuto, onSpeed, restoreSnap, fullReset,
    clearLog,
  } = useHillClimbing();

  // onSI wrapper: read input value and pass to hook
  const handleSIChange = useCallback((col, val) => {
    onSI(col, val);
  }, [onSI]);

  return (
    <Container>
      {/* Flying queen overlay (fixed, used for arc animation) */}
      <div id="fq" ref={flyingQueenRef}>♛</div>

      <Navbar />

      <div className="main">
        {/* ── LEFT COLUMN ── */}
        <div className="col-l">
          <ControlPanel
            setupQ={setupQ}
            phase={phase}
            mode={mode}
            speed={speed}
            isAuto={isAuto}
            snaps={snaps}
            activeSnap={activeSnap}
            stopBox={stopBox}
            inputErrs={inputErrs}
            switchMode={switchMode}
            doRandom={doRandom}
            confirmSetup={confirmSetup}
            doStep={doStep}
            toggleAuto={toggleAuto}
            fullReset={fullReset}
            onSpeed={onSpeed}
            restoreSnap={restoreSnap}
            onSIChange={handleSIChange}
          />

          {/* Board panel */}
          <div className="panel">
            <div className="ph">
              <span className="ph-ico">♟</span>
              <span className="ph-ttl">BÀN CỜ</span>
            </div>
            <div className="pb">
              <ChessBoard
                queens={queens}
                phase={phase}
                mode={mode}
                atkSet={atkSet}
                tgtSet={tgtSet}
                boardRef={boardRef}
                onCellClick={onCellClick}
              />
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="col-r">
          <StatsPanel
            queens={queens}
            metrics={metrics}
            hTable={hTable}
            bestSet={bestSet}
            logs={logs}
            stepNum={stepNum}
            clearLog={clearLog}
          />
        </div>
      </div>
    </Container>
  );
}
