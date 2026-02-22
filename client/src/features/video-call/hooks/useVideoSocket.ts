import { useCallback } from 'react';
import { useSocket } from '../../../context/SocketContext';

export const useVideoSocket = () => {
  const { socket, isConnected } = useSocket();

  const emit = useCallback(<T,>(event: string, data: T) => {
    if (socket) {
      socket.emit(event, data);
    } else {
      console.warn('⚠️ Cannot emit event, socket not connected:', event);
    }
  }, [socket]);

  const on = useCallback(<T,>(event: string, callback: (data: T) => void) => {
    if (socket) {
      socket.on(event, callback);
    }
  }, [socket]);

  const off = useCallback((event: string) => {
    if (socket) {
      socket.off(event);
    }
  }, [socket]);

  return { socket, isConnected, emit, on, off };
};
