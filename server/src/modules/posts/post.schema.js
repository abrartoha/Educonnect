import { z } from 'zod';

export const postCategoryEnum = z.enum([
  'SCHOLARSHIPS',
  'VISA_TIPS',
  'COURSES',
  'CAMPUS_LIFE',
  'CAREER',
  'STUDENT_LIFE',
  'EVENTS',
]);

export const mediaTypeEnum = z.enum(['NONE', 'IMAGE', 'VIDEO']);

export const createPostSchema = z.object({
  title: z.string().min(3).max(200).trim(),
  content: z.string().min(10).max(10000).trim(),
  category: postCategoryEnum,
  mediaType: mediaTypeEnum.default('NONE'),
  mediaUrl: z
    .string()
    .url()
    .max(500)
    .optional()
    .or(z.literal('').transform(() => undefined)),
  tags: z.array(z.string().min(1).max(40)).max(5).default([]),
});

export const updatePostSchema = createPostSchema.partial();

export const postListQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  category: postCategoryEnum.optional(),
  authorRole: z.enum(['UNIVERSITY', 'AGENT', 'CONSULTANT', 'STUDENT']).optional(),
  tag: z.string().max(40).optional(),
  q: z.string().max(120).optional(),
  sort: z.enum(['hot', 'new', 'top']).default('hot'),
});

export const createCommentSchema = z.object({
  text: z.string().min(1).max(2000).trim(),
});

export const createReviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().max(120).optional(),
  body: z.string().min(5).max(2000).trim(),
});
