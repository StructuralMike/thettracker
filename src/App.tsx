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

  return (
    <>
      <h1>Auto Stats 0.0.2</h1><br></br>
      <div>
        <span className="inline-grid grid-cols-3 gap-4">
        <Box title="Check Count" count={data.checkCount} speed={cph} unit="cph" />
        <Box title="Bonks" count={data.bonks} speed={mBpm} unit="mBpm" />
        <Box title="Chest Turns" count={data.chestTurns} speed={ctph} unit="ctph" />
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
