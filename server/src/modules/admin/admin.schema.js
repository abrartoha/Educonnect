import { z } from 'zod';
export const listUsersQuery = z.object({
  role: z.enum(['ADMIN', 'UNIVERSITY', 'AGENT', 'CONSULTANT', 'STUDENT']).optional(),
  status: z.enum(['PENDING', 'ACTIVE', 'SUSPENDED']).optional(),
  q: z.string().max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const postStatusBody = z.object({
  status: z.enum(['PUBLISHED', 'HIDDEN', 'REMOVED']),
});