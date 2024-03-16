import { useState, useEffect, useRef } from 'react';

function useAutoTrackWebSocket(host = 'ws://localhost:8080') {
    const [status, setStatus] = useState<string>('Disconnected');
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
        reconnectTimer.current = setTimeout(connect, 5000);
    };

    const startAutotrackTimer = () => {
        console.log("startAutotrackTimer");
        clearTimeout(autotrackTimer.current!);
        autotrackTimer.current = setTimeout(autotrackReadMem, 1000);
    };

    const connect = () => {
        console.log("connect");
        reconnectTimer.current = null;
        if (ws.current) {
            console.log("Already connected or connecting");
            return;
        }

        setStatus('Connecting');
        ws.current = new WebSocket(host);
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

    const autotrackReadMem = () => {
        console.log("autotrackReadMem");
        if (reconnectTimer.current) clearTimeout(reconnectTimer.current!); 
        reconnectTimer.current = null;
        attemptReconnect("autotrackReadMem");
        snesread(0xF50000 + 0x10, 1, function (event: MessageEvent) {
            let gamemode = new Uint8Array(event.data)[0];
            if (![0x07, 0x09, 0x0b].includes(gamemode)) {
                startAutotrackTimer();
                return;
            }
            console.log("Autotracking: " + gamemode);
            // Future code will go here
            startAutotrackTimer();
        });
    };

    const snesread = (address: Number, size: Number, callback: Function) => {
        ws.current!.send(JSON.stringify({
            Opcode: 'GetAddress',
            Space: 'SNES',
            Operands: [address.toString(16), size.toString(16)]
        }));
        ws.current!.onmessage = (event) => callback(event);
    };

    useEffect(() => {
        connect();
        return () => {
            console.log("useEffect");
            disconnect();
        };
    }, [host]);

    return { status };
}

export default useAutoTrackWebSocket;