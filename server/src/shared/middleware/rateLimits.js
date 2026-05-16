import rateLimit from 'express-rate-limit';
import { env } from '../../config/env.js';

const baseOptions = {
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests, please slow down.' },
};

// General API limiter (applied to the /api prefix).
export const apiLimiter = rateLimit({
  ...baseOptions,
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.RATE_LIMIT_MAX,
  keyGenerator: (req) => req.user?.id || req.ip,
});

// Stricter limit for auth endpoints — login/signup/refresh/password-reset.
export const authLimiter = rateLimit({
  ...baseOptions,
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.AUTH_RATE_LIMIT_MAX,
  skipSuccessfulRequests: true, // only count failed attempts
});

// Very strict limit for account creation — prevent spam registrations.
export const signupLimiter = rateLimit({
  ...baseOptions,
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 5,
});