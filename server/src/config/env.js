import 'dotenv/config';
import { z } from 'zod';

// Validate required env vars on boot. Fail fast = fewer surprises in prod.
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  CLIENT_URL: z.string().url(),
  TRUST_PROXY: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),

  DATABASE_URL: z.string().min(10),

  COOKIE_SECRET: z.string().min(32),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  CSRF_SECRET: z.string().min(32),

  ACCESS_TOKEN_TTL: z.string().default('15m'),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(30),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),

  // Rate limit overrides (all optional — use defaults from rateLimits.js)
  RL_GLOBAL_WINDOW: z.coerce.number().int().positive().optional(),
  RL_GLOBAL_LIMIT: z.coerce.number().int().positive().optional(),

  RL_API_WINDOW: z.coerce.number().int().positive().optional(),
  RL_API_LIMIT: z.coerce.number().int().positive().optional(),
  RL_API_BLOCK: z.coerce.number().int().positive().optional(),

  RL_LOGIN_WINDOW: z.coerce.number().int().positive().optional(),
  RL_LOGIN_LIMIT: z.coerce.number().int().positive().optional(),
  RL_LOGIN_BLOCK: z.coerce.number().int().positive().optional(),

  RL_SIGNUP_WINDOW: z.coerce.number().int().positive().optional(),
  RL_SIGNUP_LIMIT: z.coerce.number().int().positive().optional(),
  RL_SIGNUP_BLOCK: z.coerce.number().int().positive().optional(),

  RL_DIR_LIST_WINDOW: z.coerce.number().int().positive().optional(),
  RL_DIR_LIST_LIMIT: z.coerce.number().int().positive().optional(),
  RL_DIR_LIST_BLOCK: z.coerce.number().int().positive().optional(),
  RL_DIR_READ_WINDOW: z.coerce.number().int().positive().optional(),
  RL_DIR_READ_LIMIT: z.coerce.number().int().positive().optional(),
  RL_DIR_READ_BLOCK: z.coerce.number().int().positive().optional(),
  RL_DIR_COMPARE_WINDOW: z.coerce.number().int().positive().optional(),
  RL_DIR_COMPARE_LIMIT: z.coerce.number().int().positive().optional(),
  RL_DIR_COMPARE_BLOCK: z.coerce.number().int().positive().optional(),
  RL_DIR_WRITE_WINDOW: z.coerce.number().int().positive().optional(),
  RL_DIR_WRITE_LIMIT: z.coerce.number().int().positive().optional(),
  RL_DIR_WRITE_BLOCK: z.coerce.number().int().positive().optional(),

  // Admin rate limiters
  RL_ADMIN_OVERVIEW_WINDOW: z.coerce.number().int().positive().optional(),
  RL_ADMIN_OVERVIEW_LIMIT: z.coerce.number().int().positive().optional(),
  RL_ADMIN_OVERVIEW_BLOCK: z.coerce.number().int().positive().optional(),

  RL_ADMIN_LIST_USERS_WINDOW: z.coerce.number().int().positive().optional(),
  RL_ADMIN_LIST_USERS_LIMIT: z.coerce.number().int().positive().optional(),
  RL_ADMIN_LIST_USERS_BLOCK: z.coerce.number().int().positive().optional(),

  RL_ADMIN_APPROVE_USER_WINDOW: z.coerce.number().int().positive().optional(),
  RL_ADMIN_APPROVE_USER_LIMIT: z.coerce.number().int().positive().optional(),
  RL_ADMIN_APPROVE_USER_BLOCK: z.coerce.number().int().positive().optional(),

  RL_ADMIN_SUSPEND_USER_WINDOW: z.coerce.number().int().positive().optional(),
  RL_ADMIN_SUSPEND_USER_LIMIT: z.coerce.number().int().positive().optional(),
  RL_ADMIN_SUSPEND_USER_BLOCK: z.coerce.number().int().positive().optional(),

  RL_ADMIN_REACTIVATE_USER_WINDOW: z.coerce.number().int().positive().optional(),
  RL_ADMIN_REACTIVATE_USER_LIMIT: z.coerce.number().int().positive().optional(),
  RL_ADMIN_REACTIVATE_USER_BLOCK: z.coerce.number().int().positive().optional(),

  RL_ADMIN_PIN_POST_WINDOW: z.coerce.number().int().positive().optional(),
  RL_ADMIN_PIN_POST_LIMIT: z.coerce.number().int().positive().optional(),
  RL_ADMIN_PIN_POST_BLOCK: z.coerce.number().int().positive().optional(),

  RL_ADMIN_POST_STATUS_WINDOW: z.coerce.number().int().positive().optional(),
  RL_ADMIN_POST_STATUS_LIMIT: z.coerce.number().int().positive().optional(),
  RL_ADMIN_POST_STATUS_BLOCK: z.coerce.number().int().positive().optional(),

  // Business module rate limiters — Reviews
  RL_BIZ_REVIEW_LIST_WINDOW: z.coerce.number().int().positive().optional(),
  RL_BIZ_REVIEW_LIST_LIMIT: z.coerce.number().int().positive().optional(),
  RL_BIZ_REVIEW_LIST_BLOCK: z.coerce.number().int().positive().optional(),
  RL_BIZ_REVIEW_CREATE_WINDOW: z.coerce.number().int().positive().optional(),
  RL_BIZ_REVIEW_CREATE_LIMIT: z.coerce.number().int().positive().optional(),
  RL_BIZ_REVIEW_CREATE_BLOCK: z.coerce.number().int().positive().optional(),

  // Business module rate limiters — Campaigns
  RL_BIZ_CAMPAIGN_LIST_WINDOW: z.coerce.number().int().positive().optional(),
  RL_BIZ_CAMPAIGN_LIST_LIMIT: z.coerce.number().int().positive().optional(),
  RL_BIZ_CAMPAIGN_LIST_BLOCK: z.coerce.number().int().positive().optional(),
  RL_BIZ_CAMPAIGN_CREATE_WINDOW: z.coerce.number().int().positive().optional(),
  RL_BIZ_CAMPAIGN_CREATE_LIMIT: z.coerce.number().int().positive().optional(),
  RL_BIZ_CAMPAIGN_CREATE_BLOCK: z.coerce.number().int().positive().optional(),
  RL_BIZ_CAMPAIGN_UPDATE_WINDOW: z.coerce.number().int().positive().optional(),
  RL_BIZ_CAMPAIGN_UPDATE_LIMIT: z.coerce.number().int().positive().optional(),
  RL_BIZ_CAMPAIGN_UPDATE_BLOCK: z.coerce.number().int().positive().optional(),
  RL_BIZ_CAMPAIGN_DELETE_WINDOW: z.coerce.number().int().positive().optional(),
  RL_BIZ_CAMPAIGN_DELETE_LIMIT: z.coerce.number().int().positive().optional(),
  RL_BIZ_CAMPAIGN_DELETE_BLOCK: z.coerce.number().int().positive().optional(),
  RL_BIZ_CAMPAIGN_STATS_WINDOW: z.coerce.number().int().positive().optional(),
  RL_BIZ_CAMPAIGN_STATS_LIMIT: z.coerce.number().int().positive().optional(),
  RL_BIZ_CAMPAIGN_STATS_BLOCK: z.coerce.number().int().positive().optional(),

  // Business module rate limiters — Leads
  RL_BIZ_LEAD_SUBMIT_WINDOW: z.coerce.number().int().positive().optional(),
  RL_BIZ_LEAD_SUBMIT_LIMIT: z.coerce.number().int().positive().optional(),
  RL_BIZ_LEAD_SUBMIT_BLOCK: z.coerce.number().int().positive().optional(),
  RL_BIZ_LEAD_LIST_WINDOW: z.coerce.number().int().positive().optional(),
  RL_BIZ_LEAD_LIST_LIMIT: z.coerce.number().int().positive().optional(),
  RL_BIZ_LEAD_LIST_BLOCK: z.coerce.number().int().positive().optional(),
  RL_BIZ_LEAD_MINE_WINDOW: z.coerce.number().int().positive().optional(),
  RL_BIZ_LEAD_MINE_LIMIT: z.coerce.number().int().positive().optional(),
  RL_BIZ_LEAD_MINE_BLOCK: z.coerce.number().int().positive().optional(),
  RL_BIZ_LEAD_STATUS_WINDOW: z.coerce.number().int().positive().optional(),
  RL_BIZ_LEAD_STATUS_LIMIT: z.coerce.number().int().positive().optional(),
  RL_BIZ_LEAD_STATUS_BLOCK: z.coerce.number().int().positive().optional(),
  RL_BIZ_LEAD_STATS_WINDOW: z.coerce.number().int().positive().optional(),
  RL_BIZ_LEAD_STATS_LIMIT: z.coerce.number().int().positive().optional(),
  RL_BIZ_LEAD_STATS_BLOCK: z.coerce.number().int().positive().optional(),

  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),

  // Email (enquiry notifications). All optional in dev — when blank we
  // fall back to a free Ethereal test inbox so devs can still see the
  // emails without SMTP credentials.
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().default('EduConnect <noreply@educonnect.com.au>'),


  // Redis (session store). Optional in dev — when blank we skip connecting
  REDIS_HOST: z.string().optional(),
  REDIS_PORT: z.coerce.number().int().positive().optional(),
  REDIS_USERNAME: z.string().optional(),
  REDIS_PASSWORD: z.string().optional(),
  FORM_TOKEN_SECRET: z.string().min(32).default('default_secret_change_me_in_prod'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = Object.freeze(parsed.data);
export const isProd = env.NODE_ENV === 'production';
export const isDev = env.NODE_ENV === 'development';
