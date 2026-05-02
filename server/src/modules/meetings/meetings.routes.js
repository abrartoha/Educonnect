import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { validate } from '../../shared/middleware/validate.js';
import { requireAuth } from '../../shared/middleware/auth.js';
import { csrfProtection } from '../../shared/middleware/csrf.js';
import { idParam } from '../../shared/validators/common.schema.js';
import { createJoinToken } from './meetings.controller.js';

const router = Router();

// Stricter rate limit for token minting — a leaked session can't spray tokens.
const tokenLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many token requests' },
  keyGenerator: (req) => req.user?.id || req.ip,
});

router.post(
  '/bookings/:id/meeting/token',
  requireAuth,
  csrfProtection,
  tokenLimiter,
  validate({ params: idParam }),
  asyncHandler(createJoinToken)
);

export default router;
