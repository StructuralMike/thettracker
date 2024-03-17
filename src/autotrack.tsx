import { useState, useEffect, useRef } from 'react';
import Timer from './timer.tsx';

const RECONNECT_TIMEOUT = 5000;
const AUTOTRACK_TIMEOUT = 1000;
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

function useAutoTrackWebSocket({host = 'ws://localhost', port = 8080}) {
    const [status, setStatus] = useState<string>('Disconnected');
    const [checkCount, setCheckCount] = useState<number>(0);
    const [shouldStart, setShouldStart] = useState<boolean>(false);
    const ws = useRef<WebSocket | null>();
    const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const autotrackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const cleanup = () => {
        console.log("cleanup");
        clearTimeout(autotrackTimer.current!);
        clearTimeout(reconnectTimer.current!);
        autotrackTimer.current = null;
        reconnectTimer.current = null;
        ws.current = null;
    };

    const attemptReconnect = (trigger: string) => {
        console.log("attemptReconnect: " + trigger);
        clearTimeout(reconnectTimer.current!);
        reconnectTimer.current = setTimeout(connect, RECONNECT_TIMEOUT);
    };

    const startAutotrackTimer = () => {
        console.log("startAutotrackTimer");
        clearTimeout(autotrackTimer.current!);
        autotrackTimer.current = setTimeout(autotrackReadMem, AUTOTRACK_TIMEOUT);
    };

    const connect = () => {
        console.log("connect");
        reconnectTimer.current = null;
        if (ws.current) {
            console.log("Already connected or connecting");
            return;
        }

        setStatus('Connecting');
        ws.current = new WebSocket(host + ':' + port.toString());
        ws.current.binaryType = 'arraybuffer';

        ws.current.onopen = (event: Event) => {
            console.log("onopen");
            setStatus('Connected, requesting devices list');
            sendJSON({ Opcode: 'DeviceList', Space: 'SNES' });
            ws.current!.onmessage = handleDeviceList;
        };

        ws.current.onclose = (event: CloseEvent) => {
            console.log("onclose");
            cleanup();
            setStatus('Disconnected: ' + event.reason);
            attemptReconnect("onclose");
        };

        ws.current.onerror = (event: Event) => {
            console.log("onerror: " + event.type);
            cleanup();
            setStatus('Error');
        };
    };

    const disconnect = () => {
        console.log("disconnect");
        if (ws.current) {
            ws.current.close();
        } else {
            cleanup();
            setStatus('Disconnected');
            attemptReconnect("disconnect");
        }
        setStatus('Disconnected');
    };

    // Send JSON data through the WebSocket
    const sendJSON = (data: object) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(data));
        }
    };

    const handleDeviceList = (event: MessageEvent) => {
        console.log("onDeviceList");
        let results = JSON.parse(event.data).Results;
        if (results.length < 1) {
            setStatus('No devices found');
            disconnect();
            return;
        }
        const deviceName = results[0];
        sendJSON({ Opcode: 'Attach', Space: 'SNES', Operands: [deviceName] });
        setStatus('Connected to ' + deviceName);
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
        console.log("autotrackReadMem");
        if (reconnectTimer.current) clearTimeout(reconnectTimer.current!); 
        attemptReconnect("autotrackReadMem");
        snesread(GAME_MODE, 1, function (event: MessageEvent) {
            let gamemode = new Uint8Array(event.data)[0];
            if (![0x07, 0x09, 0x0b].includes(gamemode)) {
                startAutotrackTimer();
                return;
            }
            console.log("Autotracking: " + gamemode);
            if (!shouldStart) {
                setShouldStart(true);
            }
            readCheckCount();
            startAutotrackTimer();
        });
    };

    const readCheckCount = () => {
        console.log("readCheckCount");
        snesread(SRAM_START + 0x423, 1, function (event: MessageEvent) {
            setCheckCount(new Uint8Array(event.data)[0]);
            console.log("ReadCheckCount: " + checkCount);
        });
        return checkCount;
    }

    useEffect(() => {
        connect();
        return () => {
            console.log("useEffect");
            disconnect();
        };
    }, [host]);

    const time = Timer({ shouldStart });
    const cph = Math.round(checkCount / (time / 3600));
    const duration = new Date(time * 1000).toISOString().substr(11, 8);

    return (
        <div>
            <div>
                {checkCount} checks!<br></br>
                {cph} checks per hour!<br></br>
                <h2>{(duration)}</h2>
            </div>
            <div>
              {status}<br></br>
            </div>
        </div>
    );
}

export default useAutoTrackWebSocket;