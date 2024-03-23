import React, { useState, useRef } from 'react';

type SpeedType = 'cph' | 'mBpm' | 'ctph';

const SPEED_MAP = {
    'cph': {'buckets': [60, 70, 85, 95, 110], 'colors': [[58,134,255], [131,56,236], [255,0,110], [251,86,7], [255,190,11]]},
    'mBpm': {'buckets': [0, 250, 750, 1500, 3000], 'colors': [[255,190,11], [251,86,7], [255,0,110], [131,56,236], [58,134,255]]},
    'ctph': {'buckets': [0, 2, 10], 'colors': [[58,134,255], [251,86,7], [255,190,11]]}
};


interface BoxProps {
    title: string;
    count: number;
    speed: number;
    unit: SpeedType;
}

function interpolateColor(color1: number[], color2: number[], fraction: number) {
    const red = color1[0] + fraction * (color2[0] - color1[0]);
    const green = color1[1] + fraction * (color2[1] - color1[1]);
    const blue = color1[2] + fraction * (color2[2] - color1[2]);
    return `rgb(${red}, ${green}, ${blue})`;
}

function Box({ title, count, speed, unit }: BoxProps) {
    const calculateColor = (value: number, type: SpeedType) => {
        const valueAdjusted = Math.min(Math.max(value, SPEED_MAP[type].buckets[0]), SPEED_MAP[type].buckets[SPEED_MAP[type].buckets.length - 1]);
        let lowerBound = 0;
        let upperBound = 0;
        let lowerIndex = 0;
        let upperIndex = 0;
        for (let i = 0; i < SPEED_MAP[type].buckets.length - 1; i++) {
            if (valueAdjusted >= SPEED_MAP[type].buckets[i] && valueAdjusted <= SPEED_MAP[type].buckets[i + 1]) {
                lowerBound = SPEED_MAP[type].buckets[i];
                upperBound = SPEED_MAP[type].buckets[i + 1];
                lowerIndex = i;
                upperIndex = i + 1;
                break;
            }
        }
        const speedfraction = (valueAdjusted - lowerBound) / (upperBound - lowerBound);
        const color1 = SPEED_MAP[type].colors[lowerIndex];
        const color2 = SPEED_MAP[type].colors[upperIndex];
        return interpolateColor(color1, color2, speedfraction);
    };
    let bgColor = calculateColor(speed, unit);
    return (
        <div className="flex flex-col items-center p-2">
            <p className="text-sm mt-2 text-gray-300 font-semibold tracking-wide uppercase">{title}</p>
            <div className="beveled-box rounded-lg p-4 w-20 h-20 flex items-center justify-center transform transition duration-500 hover:scale-110" style={{ backgroundColor: bgColor }} >
                <span className="font-bold text-slate-100 text-3xl" style={{ textShadow: '4px 4px 6px rgba(0,0,0,1.6)' }}>{count}</span>
            </div>
            <p className="text-sm text-gray-300 font-medium mt-2" style={{ textShadow: '4px 4px 8px rgba(0,0,0,1.2)', color: bgColor }}>{speed} {unit}</p>
        </div>
    );
    


}

export default Box;