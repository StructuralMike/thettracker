import { useRef } from 'react'
import './App.css'
import useAutoTrackWebSocket from './autotrack.tsx'
import { autotrackingProps } from './autotrack.tsx'
import Timer from './timer.tsx'
import Box from './statbox.tsx'

function App() {
  const props = useRef<autotrackingProps>({
    status: 'Disconnected',
    host: 'ws://localhost',
    port: 23074,
    shouldStart: false,
    maxChecks: 216,
    checkCount: 0,
    chestTurns: 0,
    bonks: 0
  });
  const data = useAutoTrackWebSocket(props.current);
  const timer = Timer({ shouldStart: data.shouldStart });
  const cph = Math.round(data.checkCount / (timer / 3600));
  const duration = new Date(timer * 1000).toISOString().substr(11, 8);
  const mBpm = Math.round(data.bonks / (timer / 60) * 1000);
  const ctph = Math.round(data.chestTurns / (timer / 3600));
  const SPEED_MAP = useRef({
    'cph': {'buckets': [60, 70, 85, 95, 110], 'colors': [[58,134,255], [131,56,236], [255,0,110], [251,86,7], [255,190,11]]},
    'mBpm': {'buckets': [0, 250, 750, 1500, 3000], 'colors': [[255,190,11], [251,86,7], [255,0,110], [131,56,236], [58,134,255]]},
    'ctph': {'buckets': [0, 2, 10], 'colors': [[58,134,255], [251,86,7], [255,190,11]]}
  });
  if (data.maxChecks > 400) {
    SPEED_MAP.current['cph'].buckets = [100, 200, 250, 300, 400]
  }
  
  return (
    <>
      <h1>Auto Stats 0.0.2</h1><br></br>
      <div>
        <span className="inline-grid grid-cols-3 gap-4">
        <Box title="Check Count" count={data.checkCount} speed={cph} unit="cph" buckets={SPEED_MAP.current['cph'].buckets} colors={SPEED_MAP.current['cph'].colors} />
        <Box title="Bonks" count={data.bonks} speed={mBpm} unit="mBpm" buckets={SPEED_MAP.current['mBpm'].buckets} colors={SPEED_MAP.current['mBpm'].colors} />
        <Box title="Chest Turns" count={data.chestTurns} speed={ctph} unit="ctph" buckets={SPEED_MAP.current['ctph'].buckets} colors={SPEED_MAP.current['ctph'].colors} />
        </span>
        {/* Duration */}
        <div className="flex justify-center items-center">
            <div className="p-6">
                <h2 className="text-5xl font-bold text-blue-500" style={{ textShadow: '2px 4px 4px rgba(0,0,0,0.8)',  }}>
                    {duration}
                </h2>
            </div>
        </div>
      </div>
      <div>
        <small className="hover:text-orange-400">{data.status}</small>
      </div>

    </>
  )
}

export default App
