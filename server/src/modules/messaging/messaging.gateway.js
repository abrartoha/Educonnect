import { Server } from 'socket.io';
import cookie from 'cookie';
import cookieParser from 'cookie-parser';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { verifyAccessToken } from '../../shared/utils/tokens.js';
import { ACCESS_COOKIE } from '../../shared/utils/cookies.js';
import { prisma } from '../../db/prisma.js';
import { userIsParticipant } from './messaging.service.js';

let io = null;

// Resolve the user behind a socket handshake. Accepts either:
// - signed em_access cookie (web), parsed identically to Express
// - auth.token from socket.io client (mobile / Bearer flows)
const authenticateSocket = async (socket) => {
  let token = null;

  // 1. Bearer-style token from client
  const authToken = socket.handshake.auth?.token;
  if (typeof authToken === 'string' && authToken.length > 0) {
    token = authToken;
  }

  // 2. Cookie-based (web)
  if (!token) {
    const cookieHeader = socket.handshake.headers?.cookie;
    if (cookieHeader) {
      const parsed = cookie.parse(cookieHeader);
      const raw = parsed[ACCESS_COOKIE];
      if (raw) {
        // Express cookie-parser signs cookies as "s:<value>.<sig>" — verify.
        token = cookieParser.signedCookie(raw, env.COOKIE_SECRET);
        if (token === false) token = null;
      }
    }
  }

  if (!token) throw new Error('Missing access token');

  const payload = verifyAccessToken(token);
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, role: true, status: true, name: true },
  });
  if (!user || user.status === 'SUSPENDED') {
    throw new Error('User unavailable');
  }
  return user;
};

// Initialise Socket.io and attach it to the HTTP server.
export const initMessagingGateway = (httpServer) => {
  io = new Server(httpServer, {
    path: '/socket.io',
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
    },
    // Same body cap as REST.
    maxHttpBufferSize: 100_000,
  });

  // Authenticate every connection — invalid sockets are rejected before any rooms.
  io.use(async (socket, next) => {
    try {
      const user = await authenticateSocket(socket);
      socket.data.user = user;
      next();
    } catch (err) {
      logger.warn({ err: err.message }, 'Socket auth rejected');
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.user.id;

    // Personal room — used to deliver "new message in conversation X" pings to
    // every tab/device a user has open, even when they aren't viewing the thread.
    socket.join(`user:${userId}`);

    // Join a conversation room (caller asks; gateway authorises).
    socket.on('conversation:join', async (conversationId, ack) => {
      try {
        if (typeof conversationId !== 'string') {
          throw new Error('Invalid conversation id');
        }
        const ok = await userIsParticipant(conversationId, userId);
        if (!ok) throw new Error('Forbidden');
        socket.join(`conv:${conversationId}`);
        ack?.({ ok: true });
      } catch (err) {
        ack?.({ ok: false, error: err.message });
      }
    });

    socket.on('conversation:leave', (conversationId) => {
      if (typeof conversationId === 'string') {
        socket.leave(`conv:${conversationId}`);
      }
    });
  });

  return io;
};

// Called by the HTTP controller after a message is persisted.
// Two emit targets: anyone currently viewing the thread (conv:<id>) AND the
// recipient's personal room (user:<id>) so other tabs can bump unread counts.
export const broadcastMessage = ({ conversationId, message, otherUserId }) => {
  if (!io) return;
  const payload = { conversationId, message };
  io.to(`conv:${conversationId}`).emit('message:new', payload);
  io.to(`user:${otherUserId}`).emit('message:new', payload);
  io.to(`user:${message.senderId}`).emit('message:new', payload);
};

// Generic per-user emit — used by other modules (meetings, etc.) to ping a
// specific user across all their open tabs/devices.
export const emitToUser = (userId, event, payload) => {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
};

export const closeMessagingGateway = async () => {
  if (!io) return;
  await io.close();
  io = null;
};
