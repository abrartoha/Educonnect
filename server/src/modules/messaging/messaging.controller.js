import {
  ensureConversation,
  listMyConversations,
  getConversation,
  listMessages,
  sendMessage,
  markRead,
} from './messaging.service.js';
import { broadcastMessage } from './messaging.gateway.js';

export const startConversation = async (req, res) => {
  const conv = await ensureConversation(req.user.id, req.body.userId);
  const other = conv.userAId === req.user.id ? conv.userB : conv.userA;
  res.status(201).json({
    item: { id: conv.id, otherUser: other, lastMessageAt: conv.lastMessageAt },
  });
};

export const listConversations = async (req, res) => {
  const items = await listMyConversations(req.user.id);
  res.json({ items });
};

export const showConversation = async (req, res) => {
  const item = await getConversation(req.params.id, req.user.id);
  res.json({ item });
};

export const getMessages = async (req, res) => {
  const result = await listMessages(req.params.id, req.user.id, req.query);
  res.json(result);
};

export const postMessage = async (req, res) => {
  const { message, otherUserId } = await sendMessage(
    req.params.id,
    req.user.id,
    req.body.body
  );
  // Fire-and-forget broadcast; never block the HTTP response on socket I/O.
  try {
    broadcastMessage({
      conversationId: req.params.id,
      message,
      otherUserId,
    });
  } catch {
    // Gateway not initialised yet (e.g. test harness) — REST clients still get the message.
  }
  res.status(201).json({ item: message });
};

export const postReadReceipt = async (req, res) => {
  await markRead(req.params.id, req.user.id);
  res.json({ ok: true });
};
