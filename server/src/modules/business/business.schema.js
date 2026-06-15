import { z } from 'zod';

// --- Campaigns --------------------------------------------------------------

export const campaignStatusEnum = z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'ENDED']);

const dateFromString = z
  .union([z.string(), z.date()])
  .transform((v) => (v instanceof Date ? v : new Date(v)))
  .refine((d) => !isNaN(d.getTime()), 'Invalid date');

export const createCampaignSchema = z
  .object({
    name: z.string().min(3).max(200).trim(),
    audience: z.string().min(2).max(200),
    startDate: dateFromString,
    endDate: dateFromString,
    status: campaignStatusEnum.default('DRAFT'),
  })
  .refine((v) => v.endDate >= v.startDate, {
    message: 'End date must be on or after start date',
    path: ['endDate'],
  });

export const updateCampaignSchema = z
  .object({
    name: z.string().min(3).max(200).trim().optional(),
    audience: z.string().min(2).max(200).optional(),
    startDate: dateFromString.optional(),
    endDate: dateFromString.optional(),
    status: campaignStatusEnum.optional(),
  })
  .refine(
    (v) => !(v.startDate && v.endDate) || v.endDate >= v.startDate,
    { message: 'End date must be on or after start date', path: ['endDate'] },
  );

// --- Leads (student → any provider) -----------------------------------------

export const createLeadSchema = z.object({
  targetId: z.string().cuid(),
  programme: z.string().max(200).optional(),
  message: z.string().min(10).max(2000),
});

export const updateLeadStatusSchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'CONVERTED', 'CLOSED']),
});

// --- Stats (shared date-range query) ----------------------------------------

const dateRangeQuery = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const leadStatsQuerySchema = dateRangeQuery.extend({
  granularity: z.enum(['day', 'week', 'month']).default('week'),
});

export const campaignStatsQuerySchema = dateRangeQuery;

// --- Reviews ----------------------------------------------------------------

export const createReviewBodySchema = z.object({
  targetId: z.string().cuid(),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().max(120).optional(),
  body: z.string().min(5).max(2000).trim(),
});
