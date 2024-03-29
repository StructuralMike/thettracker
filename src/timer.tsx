import React, { useState, useEffect, useRef } from 'react'
import { useShouldStart } from './timerContext';

export interface TimerProps {
    timeStarted: number;
    startAt: number;
    duration: number;
}

function Timer ( props: TimerProps ) {
    const { shouldStart, setShouldStart, timerOn, setTimerOn } = useShouldStart();
    const [timerData, setTimerData] = useState<TimerProps>(props);
    const interval = useRef<ReturnType<typeof setTimeout> | undefined>();

    useEffect(() => {
        console.log("useEffect: Timer");
        if (shouldStart && !timerOn) {
            console.log("useEffect: Timer: start");
            setTimerOn(true);
        } else if (!shouldStart && timerOn) {
            console.log("useEffect: Timer: stop");
            clearInterval(interval.current);
            interval.current = undefined;
            let time = timerData.startAt + Math.floor(Date.now() - timerData.timeStarted);
            setTimerData(prev => ({ ...prev,
                duration: time,
                startAt: time
            }));
        }
        return () => {
            clearInterval(interval.current);
            interval.current = undefined;
        }
    }, [shouldStart]);

    useEffect(() => {
        console.log("useEffect: Timer: timerOn");
        if (!shouldStart) { return; }
        console.log("useEffect: Timer: timerOn, shouldstart");
        if (timerOn && !interval.current) {
            console.log("useEffect: Timer: timerOn, start");
            setTimerData(prev => ({ ...prev,
                timeStarted: Date.now(),
                duration: prev.startAt
            }));
            interval.current = setInterval(() => {
                setTimerData(prev => ({ ...prev,
                    duration: prev.startAt + Math.floor(Date.now() - prev.timeStarted)
                }));
            }, 1000);
        } else if (!timerOn && interval.current) {
            console.log("useEffect: Timer: timerOn, stop");
            clearInterval(interval.current);
            interval.current = undefined;
            let time = timerData.startAt + Math.floor(Date.now() - timerData.timeStarted);
            setTimerData(prev => ({ ...prev,
                duration: time,
                startAt: time
            }));
        }
    }, [timerOn]);

    return timerData
}

export default Timer;