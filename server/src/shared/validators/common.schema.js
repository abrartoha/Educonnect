import { z } from 'zod';

export const idParam = z.object({ id: z.string().min(1).max(40) });

export const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Allow empty strings to become undefined (common form pattern).
export const emptyToUndef = (schema) =>
  z.preprocess((v) => (v === '' ? undefined : v), schema.optional());
