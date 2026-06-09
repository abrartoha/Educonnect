import { z } from 'zod';

const optStr = (max, msg) =>
  z
    .string()
    .max(max, msg ?? `Please keep this under ${max} characters`)
    .optional()
    .or(z.literal('').transform(() => undefined));

const optUrl = (max = 200, msg) =>
  z
    .string()
    .url(msg ?? 'Please enter a valid URL')
    .max(max, `Please keep this under ${max} characters`)
    .optional()
    .or(z.literal('').transform(() => undefined));

export const updateMeSchema = z.object({
  name: z
    .string()
    .min(2, 'Name should be at least 2 characters')
    .max(120, 'Name should be 120 characters or fewer')
    .trim()
    .optional(),
  avatarUrl: optUrl(500),
});

export const updateUniversitySchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name should be at least 2 characters')
      .max(200, 'Name should be 200 characters or fewer')
      .optional(),
    shortName: optStr(40),
    location: optStr(120),
    type: optStr(60),
    description: optStr(2000),
    website: optUrl(),
    phone: optStr(40),
    logoUrl: optUrl(500),
    coverImageUrl: optUrl(500),
    foundedYear: z
      .coerce.number({ invalid_type_error: 'Please enter a valid number' })
      .int('Please enter a whole number')
      .min(1000, 'Year should be between 1000 and 2100')
      .max(2100, 'Year should be between 1000 and 2100')
      .optional(),
    studentCount: z
      .coerce.number({ invalid_type_error: 'Please enter a valid number' })
      .int('Please enter a whole number')
      .min(0, 'Student count should be at least 0')
      .max(1_000_000, "Student count can't exceed 1,000,000")
      .optional(),
    internationalPct: z
      .coerce.number({ invalid_type_error: 'Please enter a valid number' })
      .int('Please enter a whole number')
      .min(0, 'Percentage should be between 0 and 100')
      .max(100, 'Percentage should be between 0 and 100')
      .optional(),
    ranking: z
      .coerce.number({ invalid_type_error: 'Please enter a valid number' })
      .int('Please enter a whole number')
      .min(1, 'Ranking should be at least 1')
      .max(100_000, "Ranking can't exceed 100,000")
      .optional(),
    tuitionMin: z
      .coerce.number({ invalid_type_error: 'Please enter a valid number' })
      .int('Please enter a whole number')
      .min(0, 'Tuition should be at least 0')
      .max(1_000_000, "Tuition can't exceed 1,000,000")
      .optional(),
    tuitionMax: z
      .coerce.number({ invalid_type_error: 'Please enter a valid number' })
      .int('Please enter a whole number')
      .min(0, 'Tuition should be at least 0')
      .max(1_000_000, "Tuition can't exceed 1,000,000")
      .optional(),
    tuitionCurrency: z
      .string()
      .length(
        3,
        'Please enter a valid ISO 4217 currency code (e.g. AUD, USD)',
      )
      .toUpperCase()
      .optional(),
    courses: z
      .array(z.string().max(120, 'Each course should be 120 characters or fewer'))
      .max(200, 'You can add up to 200 courses')
      .optional(),
    scholarships: z
      .array(
        z.string().max(200, 'Each scholarship should be 200 characters or fewer'),
      )
      .max(100, 'You can add up to 100 scholarships')
      .optional(),
    intakes: z
      .array(z.string().max(80, 'Each intake should be 80 characters or fewer'))
      .max(20, 'You can add up to 20 intakes')
      .optional(),
    facilities: z
      .array(
        z.string().max(120, 'Each facility should be 120 characters or fewer'),
      )
      .max(100, 'You can add up to 100 facilities')
      .optional(),
    accreditations: z
      .array(
        z
          .string()
          .max(120, 'Each accreditation should be 120 characters or fewer'),
      )
      .max(50, 'You can add up to 50 accreditations')
      .optional(),
  })
  .refine(
    (v) =>
      v.tuitionMin == null ||
      v.tuitionMax == null ||
      v.tuitionMin <= v.tuitionMax,
    {
      message: "Minimum tuition can't be more than maximum tuition",
      path: ['tuitionMin'],
    },
  );

export const updateAgentSchema = z.object({
  name: z
    .string()
    .min(2, 'Name should be at least 2 characters')
    .max(120, 'Name should be 120 characters or fewer')
    .optional(),
  contactPerson: optStr(120),
  phone: optStr(40),
  location: optStr(120),
  description: optStr(2000),
  website: optUrl(),
  logoUrl: optUrl(500),
  yearsExperience: z
    .coerce.number({ invalid_type_error: 'Please enter a valid number' })
    .int('Please enter a whole number')
    .min(0, 'Experience should be at least 0')
    .max(80, "Experience can't exceed 80")
    .optional(),
  certifications: z
    .array(
      z
        .string()
        .max(120, 'Each certification should be 120 characters or fewer'),
    )
    .max(30, 'You can add up to 30 certifications')
    .optional(),
  services: z
    .array(z.string().max(120, 'Each service should be 120 characters or fewer'))
    .max(30, 'You can add up to 30 services')
    .optional(),
  languages: z
    .array(z.string().max(60, 'Each language should be 60 characters or fewer'))
    .max(20, 'You can add up to 20 languages')
    .optional(),
  specialisations: z
    .array(
      z
        .string()
        .max(120, 'Each specialisation should be 120 characters or fewer'),
    )
    .max(30, 'You can add up to 30 specialisations')
    .optional(),
  maraNumber: optStr(20),
});

export const updateConsultantSchema = z.object({
  name: z
    .string()
    .min(2, 'Name should be at least 2 characters')
    .max(120, 'Name should be 120 characters or fewer')
    .optional(),
  phone: optStr(40),
  location: optStr(120),
  description: optStr(2000),
  website: optUrl(),
  yearsExperience: z
    .coerce.number({ invalid_type_error: 'Please enter a valid number' })
    .int('Please enter a whole number')
    .min(0, 'Experience should be at least 0')
    .max(80, "Experience can't exceed 80")
    .optional(),
  qualifications: z
    .array(
      z
        .string()
        .max(120, 'Each qualification should be 120 characters or fewer'),
    )
    .max(30, 'You can add up to 30 qualifications')
    .optional(),
  services: z
    .array(z.string().max(120, 'Each service should be 120 characters or fewer'))
    .max(30, 'You can add up to 30 services')
    .optional(),
  languages: z
    .array(z.string().max(60, 'Each language should be 60 characters or fewer'))
    .max(20, 'You can add up to 20 languages')
    .optional(),
  specialisations: z
    .array(
      z
        .string()
        .max(120, 'Each specialisation should be 120 characters or fewer'),
    )
    .max(30, 'You can add up to 30 specialisations')
    .optional(),
  hourlyRate: z
    .coerce.number({ invalid_type_error: 'Please enter a valid number' })
    .int('Please enter a whole number')
    .min(0, 'Hourly rate should be at least 0')
    .max(10000, "Hourly rate can't exceed 10,000")
    .optional(),
});

export const updateStudentSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name should be at least 2 characters')
      .max(120, 'Name should be 120 characters or fewer')
      .optional(),
    phone: optStr(40),
    nationality: optStr(80),
    currentEducation: optStr(120),
    interestedIn: z
      .array(
        z.string().max(80, 'Each interest should be 80 characters or fewer'),
      )
      .max(20, 'You can add up to 20 interests')
      .optional(),
    preferredLocations: z
      .array(
        z.string().max(80, 'Each location should be 80 characters or fewer'),
      )
      .max(20, 'You can add up to 20 locations')
      .optional(),
    budgetMin: z
      .coerce.number({ invalid_type_error: 'Please enter a valid number' })
      .int('Please enter a whole number')
      .min(0, 'Budget should be at least 0')
      .optional(),
    budgetMax: z
      .coerce.number({ invalid_type_error: 'Please enter a valid number' })
      .int('Please enter a whole number')
      .min(0, 'Budget should be at least 0')
      .optional(),
    bio: optStr(1000),
    intakeTarget: optStr(80),
  })
  .refine(
    (v) =>
      v.budgetMin == null ||
      v.budgetMax == null ||
      v.budgetMin <= v.budgetMax,
    {
      message: "Minimum budget can't be more than maximum budget",
      path: ['budgetMin'],
    },
  );

export const listQuery = z.object({
  page: z
    .coerce.number({ invalid_type_error: 'Please enter a valid number' })
    .int('Please enter a whole number')
    .min(1, 'Page should be at least 1')
    .default(1),
  limit: z
    .coerce.number({ invalid_type_error: 'Please enter a valid number' })
    .int('Please enter a whole number')
    .min(1, 'Limit should be at least 1')
    .max(60, "Limit can't exceed 60")
    .default(20),
  q: z
    .string()
    .max(120, 'Please keep this under 120 characters')
    .optional(),
  verified: z
    .enum(['true', 'false'], { message: 'Please enter "true" or "false"' })
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
  location: z
    .string()
    .max(120, 'Please keep this under 120 characters')
    .optional(),
  sort: z
    .enum(['rating', 'name', 'newest'], {
      message: 'Please choose one of: rating, name, newest',
    })
    .default('rating'),
});

export const compareQuery = z.object({
  ids: z
    .string()
    .transform((value) =>
      value
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    )
    .pipe(
      z
        .array(z.string().cuid())
        .min(2, 'Please select at least two universities to compare')
        .max(3, 'You can compare up to three universities at a time'),
    ),
});
