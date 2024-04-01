import App from './App.tsx'
import './tracker.css'
import { ShouldStartProvider } from './timerContext.tsx'
import { userSettingsProps } from './App.tsx'
import { useRef } from 'react';

function Tracker() {
        
    const params = new URLSearchParams(window.location.search);
    const parseUrlBoxes = () => {
        const boxes = params.get('boxes');
        if (boxes === null) {
            return '3';
        }
        return boxes;
    };
    const userSettingsProps = useRef<userSettingsProps>({
      checkCount: params.get('checkCount') === 'true',
      bonks: params.get('bonks') === 'true',
      chestTurns: params.get('chestTurns') === 'true',
      boxes: parseUrlBoxes()
    });


    return (
        <ShouldStartProvider>
            <App checkCount={userSettingsProps.current.checkCount} bonks={userSettingsProps.current.bonks} chestTurns={userSettingsProps.current.chestTurns} boxes={userSettingsProps.current.boxes}/>
        </ShouldStartProvider>
    )
}

export default Tracker