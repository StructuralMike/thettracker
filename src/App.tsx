import reactLogo from './assets/boots.png'
import viteLogo from './assets/android-chrome-192x192.png'
import './App.css'
import useAutoTrackWebSocket from './autotrack.tsx'

function App() {
  const trackerHUD = useAutoTrackWebSocket({host: 'ws://localhost', port: 8080});
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
      {trackerHUD}
    </>
  )
}

export default App
