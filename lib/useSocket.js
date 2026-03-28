import { useEffect, useRef, useCallback, useState } from 'react';
import io from 'socket.io-client';

export const useSocket = (serverUrl = 'http://localhost:4000') => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    socketRef.current = io(serverUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketRef.current.on('connect', () => {
      console.log('[SOCKET] Connected:', socketRef.current.id);
      setIsConnected(true);
    });

    socketRef.current.on('disconnect', () => {
      console.log('[SOCKET] Disconnected');
      setIsConnected(false);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [serverUrl]);

  return isConnected ? socketRef.current : null;
};
