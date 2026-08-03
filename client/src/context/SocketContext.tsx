import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSelector } from 'react-redux';
import type { RootState } from '../core/store/Index';
import api from '@shared/utils/AxiosInstance';
import { store } from '@core/store/Index';
import { clearUser } from '@features/auth/AuthSlice';
import { toast } from 'sonner';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (user) {
      let hasRetriedAuth = false;
      const newSocket = io(import.meta.env.VITE_API_BASE_URL, {
        withCredentials: true,
      });

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        setIsConnected(true);
        newSocket.emit('join');
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      newSocket.on('connect_error', async (error) => {
        console.error('Socket connection failed:', error.message);
        setIsConnected(false);

        if (
          !hasRetriedAuth &&
          error.message.toLowerCase().includes('authentication failed')
        ) {
          hasRetriedAuth = true;

          try {
            await api.get('/auth/refresh-token', { _skipGlobalToast: true });
            newSocket.connect();
          } catch (refreshError) {
            console.error('Socket token refresh failed:', refreshError);
          }
        }
      });

      newSocket.on('account:blocked', async () => {
        toast.error('Your account has been blocked by the administrator.');
        try {
          await api.post('/auth/logout');
        } catch (err) {
          console.error('Logout failed after account blocked', err);
        }
        store.dispatch(clearUser());
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
        setSocket(null);
        setIsConnected(false);
      };
    }
    return undefined;
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
