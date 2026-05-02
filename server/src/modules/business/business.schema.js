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

export const updateCampaignSchema = z.object({
  name: z.string().min(3).max(200).trim().optional(),
  audience: z.string().min(2).max(200).optional(),
  startDate: dateFromString.optional(),
  endDate: dateFromString.optional(),
  status: campaignStatusEnum.optional(),
});

// --- Bookings ---------------------------------------------------------------

export const bookingStatusEnum = z.enum([
  'PENDING',
  'CONFIRMED',
  'COMPLETED',
  'CANCELLED',
]);

export const createBookingSchema = z.object({
  providerId: z.string().min(1).max(40),
  subject: z.string().min(3).max(200),
  notes: z.string().max(2000).optional(),
  scheduledAt: dateFromString,
  durationMinutes: z.coerce.number().int().min(10).max(240).default(30),
  mode: z.enum(['video', 'phone', 'in-person']).default('video'),
});

export const updateBookingStatusSchema = z.object({
  status: bookingStatusEnum,
});

// --- Leads ------------------------------------------------------------------

export const createLeadSchema = z.object({
  universityId: z.string().min(1).max(40),
  programme: z.string().max(200).optional(),
  message: z.string().min(10).max(2000),
});

export const updateLeadStatusSchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'CONVERTED', 'CLOSED']),
});

// --- Reviews ----------------------------------------------------------------

export const createReviewBodySchema = z.object({
  targetId: z.string().min(1).max(40),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().max(120).optional(),
  body: z.string().min(5).max(2000).trim(),
});
