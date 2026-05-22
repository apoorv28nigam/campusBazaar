import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user) {
      socketRef.current = io('/', { withCredentials: true, transports: ['websocket', 'polling'] });
      const socket = socketRef.current;

      socket.emit('join', user._id);

      socket.on('onlineUsers', (users) => setOnlineUsers(users));

      socket.on('notification', (notification) => {
        setNotifications(prev => [notification, ...prev]);
      });

      socket.on('messageNotification', (data) => {
        // Handled in Messages page
      });

      return () => {
        socket.disconnect();
        socketRef.current = null;
      };
    }
  }, [user]);

  const getSocket = () => socketRef.current;

  const isOnline = (userId) => onlineUsers.includes(userId);

  return (
    <SocketContext.Provider value={{ getSocket, onlineUsers, isOnline, notifications, setNotifications }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be inside SocketProvider');
  return ctx;
};
