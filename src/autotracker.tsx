import { useState, useEffect, useRef } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

export const WebSocketDemo = () => {
    //Public API that will echo messages sent to it back to the client
    const [socketUrl, setSocketUrl] = useState('ws://localhost:8080');
    const [messageHistory, setMessageHistory] = useState<MessageEvent<any>[]>([]);
  
    const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl);
  
    useEffect(() => {
      if (lastMessage !== null) {
        setMessageHistory((prev) => prev.concat(lastMessage));
      }
    }, [lastMessage]);
  
  
    const handleClickSendMessage = () => sendMessage('Hello');
  
    const connectionStatus = {
      [ReadyState.CONNECTING]: 'Connecting',
      [ReadyState.OPEN]: 'Open',
      [ReadyState.CLOSING]: 'Closing',
      [ReadyState.CLOSED]: 'Closed',
      [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    }[readyState];
  
    return (
      <div>
        <button
          onClick={handleClickSendMessage}
          disabled={readyState !== ReadyState.OPEN}
        >
          Click Me to send 'Hello'
        </button><br></br>
        <span>The WebSocket is currently {connectionStatus}</span><br></br>
        {lastMessage ? <span>Last message: {lastMessage.data}</span> : null}
        <ul>
          {messageHistory.map((message, idx) => (
            <span key={idx}>{message ? message.data : null}</span>
          ))}
        </ul>
      </div>
    );
  };