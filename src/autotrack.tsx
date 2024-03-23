import { useState, useEffect, useRef, MutableRefObject } from 'react';
import Timer from './timer.tsx';
import Controls from './controls.tsx';

const RECONNECT_TIMEOUT = 5000;
const AUTOTRACK_TIMEOUT = 500;
const WRAM_START = 0xF50000; // $7E0000
const GAME_MODE = WRAM_START + 0x10;
const SRAM_START = 0xF5F000; // $7EF000
const ROOM_DATA_START = SRAM_START;
const ROOM_DATA_END = SRAM_START + 0x24F;
const OVERWORLD_EVENT_START = SRAM_START + 0x280;
const OVERWORLD_EVENT_END = SRAM_START + 0x2FF;
const SHOP_DATA_START = SRAM_START + 0x302;
const SHOP_DATA_END = SRAM_START + 0x33F;
const ITEM_DATA_START = SRAM_START + 0x340;
const ITEM_DATA_END = SRAM_START + 0x3F0;
const RANDOMIZER_DATA_START = SRAM_START + 0x3F1;
const RANDOMIZER_DATA_END = SRAM_START + 0x4FD;

let currentCheckCount = 0;

export interface autotrackingProps {
    status: string;
    checkCount: number;
    prevCheckCount?: number;
    shouldStart: boolean;
    host?: string;
    port?: number;
}

function useAutoTrackWebSocket(props: autotrackingProps){

    const [data, setData] = useState<autotrackingProps>(props);
    const ws = useRef<WebSocket | null>();
    const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const autotrackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const dataRef = useRef(data);
    useEffect(() => {
        dataRef.current = data;
    }, [data]);

    const cleanup = () => {
        console.log("cleanup");
        clearTimeout(autotrackTimer.current!);
        clearTimeout(reconnectTimer.current!);
        autotrackTimer.current = null;
        reconnectTimer.current = null;
        ws.current = null;
    };

    const attemptReconnect = (trigger: string) => {
//        console.log("attemptReconnect: " + trigger);
        clearTimeout(reconnectTimer.current!);
        reconnectTimer.current = setTimeout(connect, RECONNECT_TIMEOUT);
    };

    const startAutotrackTimer = () => {
//        console.log("startAutotrackTimer");
        clearTimeout(autotrackTimer.current!);
        autotrackTimer.current = setTimeout(autotrackReadMem, AUTOTRACK_TIMEOUT);
    };

    const connect = () => {
        if (!data.port) {
            return ('Error: No host provided')
        }
        console.log("connect");
        reconnectTimer.current = null;
        if (ws.current) {
            console.log("Already connected or connecting");
            return;
        }

        setData(prev => ({ ...prev, status: 'Connecting'}));
        ws.current = new WebSocket(data.host + ':' + data.port.toString());
        ws.current.binaryType = 'arraybuffer';

        ws.current.onopen = (event: Event) => {
            console.log("onopen");
            setData(prev => ({ ...prev, status: 'Connected, requesting devices list'}));
            sendJSON({ Opcode: 'DeviceList', Space: 'SNES' });
            ws.current!.onmessage = handleDeviceList;
        };

        ws.current.onclose = (event: CloseEvent) => {
            console.log("onclose");
            cleanup();
            setData(prev => ({ ...prev, status: 'Disconnected: ' + event.reason}));
            attemptReconnect("onclose");
        };

        ws.current.onerror = (event: Event) => {
            console.log("onerror: " + event.type);
            cleanup();
            setData(prev => ({ ...prev, status: 'Error'}));
        };
    };

    const disconnect = () => {
        console.log("disconnect");
        if (ws.current) {
            ws.current.close();
        } else {
            cleanup();
            setData(prev => ({ ...prev, status: 'Disconnected'}));
            attemptReconnect("disconnect");
        }
        setData(prev => ({ ...prev, status: 'Disconnected'}));
    };

    // Send JSON data through the WebSocket
    const sendJSON = (jsondata: object) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(jsondata));
        }
    };

    const handleDeviceList = (event: MessageEvent) => {
        console.log("onDeviceList");
        let results = JSON.parse(event.data).Results;
        if (results.length < 1) {
            setData(prev => ({ ...prev, status: 'No devices found'}))
            disconnect();
            return;
        }
        const deviceName = results[0];
        sendJSON({ Opcode: 'Attach', Space: 'SNES', Operands: [deviceName] });
        setData(prev => ({ ...prev, status: 'Connected to ' + deviceName}))
        startAutotrackTimer();
    };

    const snesread = (address: Number, size: Number, callback: Function) => {
        ws.current!.send(JSON.stringify({
            Opcode: 'GetAddress',
            Space: 'SNES',
            Operands: [address.toString(16), size.toString(16)]
        }));
        ws.current!.onmessage = (event) => callback(event);
    };

    const autotrackReadMem = () => {
//        console.log("autotrackReadMem");
        if (reconnectTimer.current) clearTimeout(reconnectTimer.current!); 
        attemptReconnect("autotrackReadMem");
        snesread(GAME_MODE, 1, function (event: MessageEvent) {
            let gamemode = new Uint8Array(event.data)[0];
            if (![0x07, 0x09, 0x0b].includes(gamemode)) {
                if (dataRef.current.shouldStart && gamemode === 0x19) {
                    setData(prev => ({ ...prev, shouldStart: false}));
                } else if (!dataRef.current.shouldStart && gamemode === 0x1B) {
                    setData(prev => ({ ...prev, shouldStart: true}));
                }
                startAutotrackTimer();
            } else {
//                console.log("Autotracking: " + gamemode);
                if (!dataRef.current.shouldStart) {
                    setData(prev => ({ ...prev, shouldStart: true}));
                }
                readCheckCount();
                startAutotrackTimer();
            }
        });
    };

    const readCheckCount = () => {
//        console.log("readCheckCount");
        snesread(SRAM_START + 0x423, 1, function (event: MessageEvent) {
            currentCheckCount = new Uint8Array(event.data)[0];
        });
        if (currentCheckCount !== dataRef.current.checkCount) {
            setData(prev => ({ ...prev,
                prevCheckCount: prev.checkCount,
                checkCount: currentCheckCount
            }));
            console.log("ReadCheckCount: " + currentCheckCount);
        }
    }

    useEffect(() => {
        connect();
        return () => {
            console.log("useEffect");
            disconnect();
        };
    }, [props.host]);
    
    return data;
}

export default useAutoTrackWebSocket;