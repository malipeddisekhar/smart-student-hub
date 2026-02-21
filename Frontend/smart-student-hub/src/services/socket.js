import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

let socket = null;

export const connectSocket = (userId) => {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    withCredentials: true
  });

  socket.on('connect', () => {
    console.log('🔌 Socket connected:', socket.id);
    if (userId) {
      socket.emit('join', userId);
    }
  });

  socket.on('disconnect', () => {
    console.log('🔌 Socket disconnected');
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default { connectSocket, getSocket, disconnectSocket };
