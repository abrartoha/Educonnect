import { z } from 'zod';

export const roleEnum = z.enum(['UNIVERSITY', 'AGENT', 'CONSULTANT', 'STUDENT']);

const strongPassword = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128)
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[0-9]/, 'Password must contain a digit');

const baseSignup = z.object({
  email: z.string().email().max(254).toLowerCase().trim(),
  password: strongPassword,
  name: z.string().min(2).max(120).trim(),
});

export const signupSchema = z.discriminatedUnion('role', [
  baseSignup.extend({
    role: z.literal('UNIVERSITY'),
    shortName: z.string().max(40).optional(),
    location: z.string().max(120).optional(),
    type: z.string().max(60).optional(),
    description: z.string().max(2000).optional(),
    website: z.string().url().max(200).optional().or(z.literal('').transform(() => undefined)),
    phone: z.string().max(40).optional(),
  }),
  baseSignup.extend({
    role: z.literal('AGENT'),
    contactPerson: z.string().max(120).optional(),
    phone: z.string().max(40).optional(),
    location: z.string().max(120).optional(),
    description: z.string().max(2000).optional(),
    maraNumber: z.string().max(20).optional(),
    yearsExperience: z.coerce.number().int().min(0).max(80).optional(),
  }),
  baseSignup.extend({
    role: z.literal('CONSULTANT'),
    phone: z.string().max(40).optional(),
    location: z.string().max(120).optional(),
    description: z.string().max(2000).optional(),
    yearsExperience: z.coerce.number().int().min(0).max(80).optional(),
    hourlyRate: z.coerce.number().int().min(0).max(10000).optional(),
  }),
  baseSignup.extend({
    role: z.literal('STUDENT'),
    phone: z.string().max(40).optional(),
    nationality: z.string().max(80).optional(),
    currentEducation: z.string().max(120).optional(),
    interestedIn: z.array(z.string().max(80)).max(20).optional(),
    preferredLocations: z.array(z.string().max(80)).max(20).optional(),
    budgetMin: z.coerce.number().int().min(0).optional(),
    budgetMax: z.coerce.number().int().min(0).optional(),
  }),
]);

export const loginSchema = z.object({
  email: z.string().email().max(254).toLowerCase().trim(),
  password: z.string().min(1).max(128),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: strongPassword,
});

export const forgotPasswordSchema = z.object({
  email: z.string().email().max(254).toLowerCase().trim(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  email: z.string().email().max(254).toLowerCase().trim(),
  newPassword: strongPassword,
});