import React, { useState, useEffect, useRef } from 'react'

function Timer ({ shouldStart = false }) {
    const [time, setTime] = useState(0);
    const [timerOn, setTimerOn] = useState(false);
    const interval = useRef<ReturnType<typeof setTimeout> | undefined>();

    useEffect(() => {
        console.log("useEffect: Timer");
        if (shouldStart && !timerOn) {
            console.log("useEffect: Timer: start");
            setTimerOn(true);
            interval.current = setInterval(() => {
                setTime((prevTime) => prevTime + 1);
            }, 1000);
        } else if (!shouldStart && timerOn) {
            console.log("useEffect: Timer: stop");
            clearInterval(interval.current);
            setTimerOn(false);
        }
        return () => clearInterval(interval.current);
    }, [shouldStart]);

    return time
}

export default Timer;