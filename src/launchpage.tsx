import React, { useState, useRef } from 'react';
import Checkbox from './checkbox.tsx';
import './launchpage.css';

const LaunchPage = () => {
    const [settings, setSettings] = useState({
        checkCount: true,
        bonks: false,
        chestTurns: false,
        boxes: 1
    });
    
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const queryParams = new URLSearchParams(Object.entries(settings).filter(([_, value]) => value).map(([key, value]) => [key, String(value)])).toString();
        const windowFeatures = "width=600, height=600, menubar=no, toolbar=no, location=no, status=no, resizable=yes, scrollbars=yes";
        window.open(`./index.html?tracker=true&${queryParams}`, '_blank', windowFeatures);
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = event.target;
        setSettings((prev) => ({
            ...prev,
            [name]: checked,
            ['boxes']: Math.min(3, prev.boxes + (checked ? 1 : -1)) 
        }));
    };

    return (
        <>
        <div className="flex justify-center items-center mb-12">
            <h1>Auto Stats v0.0.3</h1>
        </div>
        <div className="flex justify-center items-center mt-8">
            <form onSubmit={handleSubmit} className="space-y-4">
            <Checkbox checked={settings.checkCount} handleChange={handleChange} name="checkCount" label="Check Counts" />
            <Checkbox checked={settings.bonks} handleChange={handleChange} name="bonks" label="Bonks" />
            <Checkbox checked={settings.chestTurns} handleChange={handleChange} name="chestTurns" label="Chest Turns" />
            <button type="submit" className="bg-slate-900 hover:bg-slate-700 active:bg-red-700 text-gray-100 py-2 px-3 beveled-box rounded-md flex items-center justify-center gap-2 transition-all duration-150 ease-in-out text-s active:shadow-inner active:scale-95">
                Launch
            </button>
            </form>
        </div>
        </>
    );
};

export default LaunchPage;
