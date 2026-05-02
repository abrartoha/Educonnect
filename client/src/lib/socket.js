import { io } from 'socket.io-client';

// Same-origin connection — Vite proxies /socket.io to the API server in dev,
// and the prod build is served behind the same domain.
let socket = null;

export const getSocket = () => {
  if (socket && socket.connected) return socket;
  if (socket) return socket;

  socket = io('/', {
    path: '/socket.io',
    withCredentials: true,
    autoConnect: true,
    reconnection: true,
    // Keep at most 5s between retries.
    reconnectionDelayMax: 5000,
    transports: ['websocket', 'polling'],
  });
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
