import reactLogo from './assets/boots.png'
import viteLogo from './assets/android-chrome-192x192.png'
import { useRef } from 'react'
import './App.css'
import useAutoTrackWebSocket from './autotrack.tsx'
import { autotrackingProps } from './autotrack.tsx'
import Timer from './timer.tsx'

function App() {
  const props = useRef<autotrackingProps>({
    status: 'Disconnected',
    checkCount: 0,
    shouldStart: false,
    host: 'ws://localhost',
    port: 8080,
  });
  const data = useAutoTrackWebSocket(props.current);
  const timer = Timer({ shouldStart: data.shouldStart });
  const cph = Math.round(data.checkCount / (timer / 3600));
  const duration = new Date(timer * 1000).toISOString().substr(11, 8);

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Auto Stats</h1>
      <div>
            <div>
                {data.checkCount} checks!<br></br>
                {cph} checks per hour!<br></br>
                {duration} elapsed!<br></br>
            </div>
            
            <div>
              {data.status}<br></br>
            </div>
        </div>
      
    </>
  )
}

export default App
