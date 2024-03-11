import { useState, useEffect } from 'react';

function useAutoTrackWebSocket(host = 'ws://localhost:8080') {
    const [status, setStatus] = useState<string>('Disconnected');
    const [autotrackSocket, setAutotrackSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        let socket: WebSocket;
        let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
        let autotrackTimer: ReturnType<typeof setTimeout> | null = null;

        const connect = () => {
            if (autotrackSocket !== null || reconnectTimer !== null) {
                disconnect();
                return;
            }

            socket = new WebSocket(host);
            socket.binaryType = 'arraybuffer';

            socket.onclose = function (event: CloseEvent) {
                cleanup();
                setStatus('Disconnected: ' + event.reason);
                attemptReconnect();
            };

            socket.onerror = function () {
                cleanup();
                setStatus('Error');
            };

            socket.onopen = function () {
                setStatus('Connected, requesting devices list');
                socket.send(JSON.stringify({ Opcode: 'DeviceList', Space: 'SNES' }));
                socket.onmessage = onDeviceList;
            };

            setAutotrackSocket(socket);
            setStatus('Connecting');
        };

        const disconnect = () => {
            if (reconnectTimer) {
                clearTimeout(reconnectTimer);
                reconnectTimer = null;
            }
            if (socket) {
                socket.close();
            }
            cleanup();
        };

        const cleanup = () => {
            setAutotrackSocket(null);
        };

        const attemptReconnect = () => {
            reconnectTimer = setTimeout(() => {
                reconnectTimer = null;
                connect();
            }, 5000);
        };

        const onDeviceList = (event: MessageEvent) => {
            let results = JSON.parse(event.data).Results;
            if (results.length <1) {
                cleanup();
                setStatus('No devices found');
                attemptReconnect();
                return;
            }
            const deviceName = results[0];
            socket.send(JSON.stringify({ Opcode: 'Attach', Space: 'SNES', Operands: [deviceName] }));
            setStatus('Connected to ' + deviceName);
            startAutotrackTimer();
        };

        const startAutotrackTimer = () => {
            autotrackTimer = setTimeout(() => {
                autotrackReadMem();
            }, 1000);
        };

        const autotrackReadMem = () => {
            const snesread = (address: Number, size: Number, callback: Function) => {
                socket.send(JSON.stringify({
                    Opcode: 'GetAddress',
                    Space: 'SNES',
                    Operands: [address.toString(16), size.toString(16)]
                }));
                socket.onmessage = (event) => callback(event);
            };

            if (reconnectTimer !== null) {
                clearTimeout(reconnectTimer);
            }
            reconnectTimer = setTimeout(() => {
                reconnectTimer = null;
                disconnect();
                connect();
            }, 5000);
            snesread(0xF50000 + 0x10, 1, function (event: MessageEvent) {
                let gamemode = new Uint8Array(event.data)[0];
                if (![0x07, 0x09, 0x0b].includes(gamemode)) {
                    console.log("Game mode: " + gamemode);
                    startAutotrackTimer();
                    return;
                }
                console.log("Autotracking: " + gamemode);
                startAutotrackTimer();
            });
        };

        console.log("useEffect");
        connect();

        return () => {
            disconnect();
        };
    }, [host]);

    return { status };
}

export default useAutoTrackWebSocket;