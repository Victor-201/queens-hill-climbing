import React, { useCallback } from 'react';
import { useHillClimbing } from '../features/queens/hooks/useHillClimbing.js';
import { useLang } from '../context/LanguageContext.jsx';
import Navbar from '../components/layout/Navbar.jsx';
import Container from '../components/layout/Container.jsx';
import ChessBoard from '../features/queens/components/ChessBoard.jsx';
import ControlPanel from '../features/queens/components/ControlPanel.jsx';
import StatsPanel from '../features/queens/components/StatsPanel.jsx';
import { Grid3X3 } from 'lucide-react';

export default function Home() {
  const { t } = useLang();

  const {
    boardSize, queens, setupQ, phase, stepNum, speed, mode,
    metrics, hTable, bestSet, atkSet, tgtSet,
    logs, snaps, activeSnap, stopBox, inputErrs, isAuto,
    boardRef, flyingQueenRef,
    changeBoardSize, onSI, switchMode, onCellClick, doRandom, confirmSetup,
    doStep, toggleAuto, onSpeed, restoreSnap, fullReset,
    clearLog,
  } = useHillClimbing(t);

  const handleSIChange = useCallback((col, val) => {
    onSI(col, val);
  }, [onSI]);

  return (
    <Container>
      <div id="fq" ref={flyingQueenRef}></div>
      <Navbar />

      <div className="main">
        <div className="col-l">
          <ControlPanel
            boardSize={boardSize}
            setupQ={setupQ}
            phase={phase}
            mode={mode}
            speed={speed}
            isAuto={isAuto}
            snaps={snaps}
            activeSnap={activeSnap}
            stopBox={stopBox}
            inputErrs={inputErrs}
            changeBoardSize={changeBoardSize}
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
        </div>

        <div className="col-c">
          <div className="panel">
            <div className="ph">
              <Grid3X3 size={15} className="ph-ico" />
              <span className="ph-ttl">{t('boardPanel')}</span>
              <span style={{ marginLeft: 'auto', fontSize: '.62rem', color: 'var(--gold)', letterSpacing: '1px' }}>
                {boardSize}×{boardSize}
              </span>
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
                boardSize={boardSize}
              />
            </div>
          </div>
        </div>

        <div className="col-r">
          <StatsPanel
            queens={queens}
            metrics={metrics}
            hTable={hTable}
            bestSet={bestSet}
            logs={logs}
            stepNum={stepNum}
            clearLog={clearLog}
            boardSize={boardSize}
          />
        </div>
      </div>
    </Container>
  );
}
