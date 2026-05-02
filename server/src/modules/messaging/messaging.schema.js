import { z } from 'zod';

export const startConversationSchema = z.object({
  userId: z.string().min(1).max(40),
});

export const sendMessageSchema = z.object({
  body: z.string().min(1).max(4000).trim(),
});

export const listMessagesQuery = z.object({
  // cursor = ISO timestamp; messages strictly older than this are returned.
  before: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});
