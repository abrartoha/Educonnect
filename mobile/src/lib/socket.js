import { io } from 'socket.io-client';
import { API_BASE_URL } from '../api/config';
import { tokenStorage } from '../auth/storage';

// Mobile uses Bearer auth — pass the access token via socket.io's auth payload.
let socket = null;
let currentToken = null;

export const getSocket = async () => {
  const token = await tokenStorage.getAccess();
  if (!token) return null;

  // Token rotated since the existing connection was opened — drop and reconnect.
  if (socket && currentToken && currentToken !== token) {
    socket.disconnect();
    socket = null;
  }

  if (socket) return socket;

  currentToken = token;
  socket = io(API_BASE_URL, {
    path: '/socket.io',
    transports: ['websocket'],
    auth: { token },
    reconnection: true,
    reconnectionDelayMax: 5000,
  });
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    currentToken = null;
  }
};
