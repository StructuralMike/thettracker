import React, { useRef, useState } from 'react'
import './App.css'
import useAutoTrackWebSocket from './autotrack.tsx'
import { autotrackingProps } from './autotrack.tsx'
import { TimerProps } from './timer.tsx'
import Timer from './timer.tsx'
import Box from './statbox.tsx'
import { useShouldStart } from './timerContext.tsx'


function App() {
  const timerProps = useRef<TimerProps>({
    timeStarted: 0,
    startAt: 0,
    duration: 0
  });
  const props = useRef<autotrackingProps>({
    status: 'Disconnected',
    host: 'ws://localhost',
    port: 23074,
    maxChecks: 216,
    checkCount: 0,
    chestTurns: 0,
    bonks: 0
  });
  const { shouldStart, setShouldStart, timerOn, setTimerOn } = useShouldStart();
  const data = useAutoTrackWebSocket(props.current);
  const timer = Timer(timerProps.current);
  const [manualCheckCount, setManualCheckCount] = useState<number>(0);
  const seconds = Math.floor(timer.duration / 1000);
  const cph = Math.round((data.checkCount + manualCheckCount) / (seconds / 3600));
  const duration = new Date(seconds * 1000).toISOString().substr(11, 8);
  const mBpm = Math.round(data.bonks / (seconds / 60) * 1000);
  const ctph = Math.round(data.chestTurns / (seconds / 3600));
  const SPEED_MAP = useRef({
    'cph': {'buckets': [60, 70, 85, 95, 110], 'colors': [[58,134,255], [131,56,236], [255,0,110], [251,86,7], [255,190,11]]},
    'mBpm': {'buckets': [0, 250, 750, 1500, 3000], 'colors': [[255,190,11], [251,86,7], [255,0,110], [131,56,236], [58,134,255]]},
    'ctph': {'buckets': [0, 2, 10], 'colors': [[58,134,255], [251,86,7], [255,190,11]]}
  });
  if (data.maxChecks > 400) {
    SPEED_MAP.current['cph'].buckets = [100, 200, 250, 300, 450]
  };
  
  const handleRightClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setManualCheckCount((prev) => prev - 1)
  };

  const throttleRef = useRef(false);
  const handleScroll = (event: React.WheelEvent<HTMLButtonElement>) => {
    if (!throttleRef.current) {
      throttleRef.current = true;
      setTimeout(() => {
        throttleRef.current = false;
      }, 175);

      if (event.deltaY > 0) {
        setManualCheckCount((prev) => prev - 1)
      } else if (event.deltaY < 0) {
        setManualCheckCount((prev) => prev + 1)
      }
    }
  };

  return (
    <>
      <h1>Auto Stats v0.0.3</h1><br></br>
      <div>
        <span className="inline-grid grid-cols-3 gap-4">
        <button onClick={() => setManualCheckCount((prev) => prev + 1)} onContextMenu={handleRightClick} onWheel={handleScroll}>
          <Box title="Check Count" count={data.checkCount + manualCheckCount} speed={cph} unit="cph" buckets={SPEED_MAP.current['cph'].buckets} colors={SPEED_MAP.current['cph'].colors}/>
        </button>
        <Box title="Bonks" count={data.bonks} speed={mBpm} unit="mBpm" buckets={SPEED_MAP.current['mBpm'].buckets} colors={SPEED_MAP.current['mBpm'].colors} />
        <Box title="Chest Turns" count={data.chestTurns} speed={ctph} unit="ctph" buckets={SPEED_MAP.current['ctph'].buckets} colors={SPEED_MAP.current['ctph'].colors} />
        </span>
        <div className="flex justify-center items-center space-x-4 mb-8">
          <div className="p-4">
              <h2 className="text-4xl font-bold text-blue-500" style={{ textShadow: '2px 2px 3px rgba(0,0,0,0.5)' }}>
                  {duration}
              </h2>
          </div>
      </div>


      <div className="flex justify-center items-center space-x-4 mb-4">
        <button
            className="bg-blue-500 hover:bg-blue-700 text-white beveled-box font-bold py-1 px-3 rounded flex items-center justify-center gap-2 w-10 h-10 transition-all duration-150 ease-in-out"
            onClick={() => setTimerOn(!timerOn)}
        >
            {timerOn ? (
            <>
                {/* Pause icon: Two divs for the vertical bars, slightly adjusted for new button size */}
                <div className="w-1.5 h-5 bg-white"></div>
                <div className="w-1.5 h-5 bg-white"></div>
            </>
            ) : (
            <>
                {/* Play (Start) icon: Adjusted triangle for a balanced look within the new button size */}
                <div className="w-0 h-0 border-t-[7.5px] border-b-[7.5px] border-l-[15px] border-transparent border-l-white"></div>
            </>
            )}
        </button>
        <button
          className="bg-purple-900 hover:bg-purple-800 active:bg-red-700 text-gray-100 strong-button-font py-2 px-3 beveled-box rounded-md flex items-center justify-center gap-2 transition-all duration-150 ease-in-out text-s active:shadow-inner active:scale-95"
          onClick={() => setManualCheckCount((prev) => 0)}
        >
          DE-FLUFF
        </button>
      </div>

      <div className="flex justify-center items-center space-x-4">
        <small className="hover:text-orange-400">{data.status}</small>
      </div>


    </div>

    </>
  )
}

export default App
