import { z } from 'zod';

const optStr = (max) => z.string().max(max).optional().or(z.literal('').transform(() => undefined));
const optUrl = (max = 200) =>
  z.string().url().max(max).optional().or(z.literal('').transform(() => undefined));

export const updateMeSchema = z.object({
  name: z.string().min(2).max(120).trim().optional(),
  avatarUrl: optUrl(500),
});

export const updateUniversitySchema = z.object({
  name: z.string().min(2).max(200).optional(),
  shortName: optStr(40),
  location: optStr(120),
  type: optStr(60),
  description: optStr(2000),
  website: optUrl(),
  phone: optStr(40),
  logoUrl: optUrl(500),
  coverImageUrl: optUrl(500),
  foundedYear: z.coerce.number().int().min(1000).max(2100).optional(),
  studentCount: z.coerce.number().int().min(0).max(1_000_000).optional(),
  internationalPct: z.coerce.number().int().min(0).max(100).optional(),
  ranking: z.coerce.number().int().min(1).max(100_000).optional(),
  tuitionMin: z.coerce.number().int().min(0).max(1_000_000).optional(),
  tuitionMax: z.coerce.number().int().min(0).max(1_000_000).optional(),
  tuitionCurrency: z.string().length(3).toUpperCase().optional(),
  courses: z.array(z.string().max(120)).max(200).optional(),
  scholarships: z.array(z.string().max(200)).max(100).optional(),
  intakes: z.array(z.string().max(80)).max(20).optional(),
  facilities: z.array(z.string().max(120)).max(100).optional(),
  accreditations: z.array(z.string().max(120)).max(50).optional(),
});

export const updateAgentSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  contactPerson: optStr(120),
  phone: optStr(40),
  location: optStr(120),
  description: optStr(2000),
  website: optUrl(),
  logoUrl: optUrl(500),
  yearsExperience: z.coerce.number().int().min(0).max(80).optional(),
  certifications: z.array(z.string().max(120)).max(30).optional(),
  services: z.array(z.string().max(120)).max(30).optional(),
  languages: z.array(z.string().max(60)).max(20).optional(),
  specialisations: z.array(z.string().max(120)).max(30).optional(),
  maraNumber: optStr(20),
});

export const updateConsultantSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  phone: optStr(40),
  location: optStr(120),
  description: optStr(2000),
  website: optUrl(),
  yearsExperience: z.coerce.number().int().min(0).max(80).optional(),
  qualifications: z.array(z.string().max(120)).max(30).optional(),
  services: z.array(z.string().max(120)).max(30).optional(),
  languages: z.array(z.string().max(60)).max(20).optional(),
  specialisations: z.array(z.string().max(120)).max(30).optional(),
  hourlyRate: z.coerce.number().int().min(0).max(10000).optional(),
});

export const updateStudentSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  phone: optStr(40),
  nationality: optStr(80),
  currentEducation: optStr(120),
  interestedIn: z.array(z.string().max(80)).max(20).optional(),
  preferredLocations: z.array(z.string().max(80)).max(20).optional(),
  budgetMin: z.coerce.number().int().min(0).optional(),
  budgetMax: z.coerce.number().int().min(0).optional(),
  bio: optStr(1000),
  intakeTarget: optStr(80),
});

export const listQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(60).default(20),
  q: z.string().max(120).optional(),
  verified: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
  location: z.string().max(120).optional(),
  sort: z.enum(['rating', 'name', 'newest']).default('rating'),
});

export const compareQuery = z.object({
  ids: z
    .string()
    .transform((value) =>
      value
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    )
    .pipe(
      z
        .array(z.string().cuid())
        .min(2, 'Provide at least two IDs.')
        .max(4)
    ),
});
