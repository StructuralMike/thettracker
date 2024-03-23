import React, { useState, useEffect, useRef } from 'react'

interface ButtonProps {
    onResetClick: () => void;
    onStopClick: () => void;
}

const Controls: React.FC<ButtonProps> = ({ onResetClick, onStopClick }) => {
    return (
        <div>
            <button onClick={onResetClick}>Reset</button>
            <button onClick={onStopClick}>Stop</button>
        </div>
    )
}

export default Controls;