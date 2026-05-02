import { Router } from 'express';
import { authLimiter, signupLimiter } from '../../shared/middleware/rateLimits.js';
import { validate } from '../../shared/middleware/validate.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { csrfProtection } from '../../shared/middleware/csrf.js';
import { signupSchema, loginSchema } from './auth.schema.js';
import {
  signup,
  login,
  refresh,
  logout,
  me,
  csrfToken,
} from './auth.controller.js';

const router = Router();

// Public — issue a CSRF token the SPA attaches to mutating requests.
router.get('/csrf', asyncHandler(csrfToken));

// Signup & login are bootstrap endpoints — no session exists yet to protect,
// so CSRF doesn't apply. Mobile clients (no cookies, no CSRF token available)
// and first-time web visitors (CSRF cookie not yet issued) both rely on this.
// The login-CSRF attack is mitigated by SameSite=Strict cookies + rate limits.
router.post(
  '/signup',
  signupLimiter,
  validate({ body: signupSchema }),
  asyncHandler(signup)
);

router.post(
  '/login',
  authLimiter,
  validate({ body: loginSchema }),
  asyncHandler(login)
);

// Refresh doesn't require CSRF (cookie is SameSite=Strict and bound to /api/auth)
// but it's still protected by rate limit.
router.post('/refresh', authLimiter, asyncHandler(refresh));

router.post('/logout', csrfProtection, asyncHandler(logout));

router.get('/me', asyncHandler(me));

export default router;
