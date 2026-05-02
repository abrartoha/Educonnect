import { prisma } from '../../db/prisma.js';
import {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} from '../../shared/utils/errors.js';

const userMini = {
  select: { id: true, name: true, avatarUrl: true, role: true },
};

// Canonical pair ordering — guarantees one Conversation row per unordered pair.
const sortIds = (a, b) => (a < b ? [a, b] : [b, a]);

const isParticipant = (conv, userId) =>
  conv.userAId === userId || conv.userBId === userId;

const otherUserId = (conv, userId) =>
  conv.userAId === userId ? conv.userBId : conv.userAId;

// Find or create the conversation between two users.
export const ensureConversation = async (callerId, otherId) => {
  if (callerId === otherId) {
    throw new BadRequestError('Cannot message yourself');
  }
  const other = await prisma.user.findUnique({
    where: { id: otherId },
    select: { id: true, status: true },
  });
  if (!other || other.status === 'SUSPENDED') {
    throw new NotFoundError('User not found');
  }

  const [userAId, userBId] = sortIds(callerId, otherId);

  // Upsert pattern via unique constraint.
  const conv = await prisma.conversation.upsert({
    where: { userAId_userBId: { userAId, userBId } },
    create: { userAId, userBId },
    update: {},
    include: { userA: userMini, userB: userMini },
  });
  return conv;
};

// Conversation list for the current user, with last message + unread count.
export const listMyConversations = async (userId) => {
  const convs = await prisma.conversation.findMany({
    where: {
      OR: [{ userAId: userId }, { userBId: userId }],
    },
    orderBy: [{ lastMessageAt: 'desc' }, { createdAt: 'desc' }],
    include: {
      userA: userMini,
      userB: userMini,
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      reads: {
        where: { userId },
        select: { lastReadAt: true },
      },
    },
  });

  // Compute unread count per conversation in parallel.
  const withUnread = await Promise.all(
    convs.map(async (c) => {
      const lastReadAt = c.reads[0]?.lastReadAt ?? new Date(0);
      const unreadCount = await prisma.message.count({
        where: {
          conversationId: c.id,
          senderId: { not: userId },
          createdAt: { gt: lastReadAt },
        },
      });
      const other = c.userAId === userId ? c.userB : c.userA;
      const lastMessage = c.messages[0] || null;
      return {
        id: c.id,
        otherUser: other,
        lastMessage: lastMessage
          ? {
              id: lastMessage.id,
              senderId: lastMessage.senderId,
              body: lastMessage.body,
              createdAt: lastMessage.createdAt,
            }
          : null,
        lastMessageAt: c.lastMessageAt,
        unreadCount,
      };
    })
  );

  return withUnread;
};

// Load one conversation (with auth check).
const loadAuthorizedConversation = async (conversationId, userId) => {
  const conv = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { userA: userMini, userB: userMini },
  });
  if (!conv) throw new NotFoundError('Conversation not found');
  if (!isParticipant(conv, userId)) throw new ForbiddenError();
  return conv;
};

export const getConversation = async (conversationId, userId) => {
  const conv = await loadAuthorizedConversation(conversationId, userId);
  const other = conv.userAId === userId ? conv.userB : conv.userA;
  return {
    id: conv.id,
    otherUser: other,
    lastMessageAt: conv.lastMessageAt,
  };
};

// Cursor-paginated message history (newest-first; client reverses for display).
export const listMessages = async (conversationId, userId, { before, limit }) => {
  await loadAuthorizedConversation(conversationId, userId);

  const items = await prisma.message.findMany({
    where: {
      conversationId,
      ...(before ? { createdAt: { lt: new Date(before) } } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: { sender: userMini },
  });

  return {
    items,
    nextBefore:
      items.length === limit ? items[items.length - 1].createdAt.toISOString() : null,
  };
};

export const sendMessage = async (conversationId, userId, body) => {
  const conv = await loadAuthorizedConversation(conversationId, userId);

  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: { conversationId: conv.id, senderId: userId, body },
      include: { sender: userMini },
    }),
    prisma.conversation.update({
      where: { id: conv.id },
      data: { lastMessageAt: new Date() },
    }),
  ]);

  return { message, otherUserId: otherUserId(conv, userId) };
};

// Mark all messages up to now as read for this user.
export const markRead = async (conversationId, userId) => {
  await loadAuthorizedConversation(conversationId, userId);
  await prisma.conversationRead.upsert({
    where: { conversationId_userId: { conversationId, userId } },
    create: { conversationId, userId, lastReadAt: new Date() },
    update: { lastReadAt: new Date() },
  });
};

// Used by the gateway to authorise a socket joining a room.
export const userIsParticipant = async (conversationId, userId) => {
  const conv = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { userAId: true, userBId: true },
  });
  return !!conv && isParticipant(conv, userId);
};
