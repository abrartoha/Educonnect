import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { validate } from '../../shared/middleware/validate.js';
import { requireAuth, requireRole } from '../../shared/middleware/auth.js';
import { csrfProtection } from '../../shared/middleware/csrf.js';
import { idParam } from '../../shared/validators/common.schema.js';
import {
  listUsers,
  approveEntity,
  suspendEntity,
  reactivateEntity,
  setPostPin,
  setPostStatus,
  overview,
} from './admin.controller.js';
import {
  adminOverviewLimiter,
  adminListUsersLimiter,
  adminApproveUserLimiter,
  adminSuspendUserLimiter,
  adminReactivateUserLimiter,
  adminPinPostLimiter,
  adminPostStatusLimiter,
} from './admin.rate-limits.js';

const router = Router();

// Every admin route demands auth + ADMIN role.
router.use(requireAuth, requireRole('ADMIN'));

const listUsersQuery = z.object({
  role: z.enum(['ADMIN', 'UNIVERSITY', 'AGENT', 'CONSULTANT', 'STUDENT']).optional(),
  status: z.enum(['PENDING', 'ACTIVE', 'SUSPENDED']).optional(),
  q: z.string().max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const postStatusBody = z.object({
  status: z.enum(['PUBLISHED', 'HIDDEN', 'REMOVED']),
});

router.get('/overview', adminOverviewLimiter, asyncHandler(overview));
router.get(
  '/users',
  adminListUsersLimiter,
  validate({ query: listUsersQuery }),
  asyncHandler(listUsers)
);

router.post(
  '/users/:id/approve',
  adminApproveUserLimiter,
  csrfProtection,
  validate({ params: idParam }),
  asyncHandler(approveEntity)
);
router.post(
  '/users/:id/suspend',
  adminSuspendUserLimiter,
  csrfProtection,
  validate({ params: idParam }),
  asyncHandler(suspendEntity)
);
router.post(
  '/users/:id/reactivate',
  adminReactivateUserLimiter,
  csrfProtection,
  validate({ params: idParam }),
  asyncHandler(reactivateEntity)
);

router.post(
  '/posts/:id/pin',
  adminPinPostLimiter,
  csrfProtection,
  validate({ params: idParam }),
  asyncHandler(setPostPin)
);
router.patch(
  '/posts/:id/status',
  adminPostStatusLimiter,
  csrfProtection,
  validate({ params: idParam, body: postStatusBody }),
  asyncHandler(setPostStatus)
);

export default router;
