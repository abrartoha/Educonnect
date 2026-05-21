import { Router } from 'express';
import { validate } from '../../shared/middleware/validate.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { requireAuth, requireRole } from '../../shared/middleware/auth.js';
import { csrfProtection } from '../../shared/middleware/csrf.js';
import { rateLimiter } from '../../shared/middleware/ratelimiter/limiterFactory.js';
import {
  listUniversities,
  getUniversity,
  compareUniversities,
  listAgents,
  getAgent,
  listConsultants,
  getConsultant,
  updateOwnProfile,
} from './directory.controller.js';
import { idParam } from '../../shared/validators/common.schema.js';
import {
  listQuery,
  updateUniversitySchema,
  updateAgentSchema,
  updateConsultantSchema,
  updateStudentSchema,
  compareQuery,
} from './profile.schema.js';

const router = Router();

const compareLimiter = rateLimiter({ window: 60, limit: 5, scope: 'user', routeSpecificLimit: true, blockDuration: 300 });
const listLimiter = rateLimiter({ window: 60, limit: 10, scope: 'user', routeSpecificLimit: true, blockDuration: 300 });
const idLimiter = rateLimiter({ window: 60, limit: 20, scope: 'user', routeSpecificLimit: true, blockDuration: 300 });
const writeLimiter = rateLimiter({ window: 3600, limit: 5, scope: 'user', blockDuration: 3600 });

// Universities
router.get('/universities', requireAuth, listLimiter, validate({ query: listQuery }), asyncHandler(listUniversities));
// Compare must be declared before the `/:id` route so it isn't captured.
router.get(
  '/universities/compare',
  requireAuth,
  compareLimiter,
  validate({ query: compareQuery }),
  asyncHandler(compareUniversities)
);
router.get(
  '/universities/:id',
  requireAuth,
  idLimiter,
  validate({ params: idParam }),
  asyncHandler(getUniversity)
);
router.patch(
  '/universities/me',
  requireAuth,
  requireRole('UNIVERSITY'),
  csrfProtection,
  validate({ body: updateUniversitySchema }),
  writeLimiter,
  asyncHandler(updateOwnProfile)
);

// Agents
router.get('/agents', requireAuth, listLimiter, validate({ query: listQuery }), asyncHandler(listAgents));
router.get('/agents/:id', requireAuth, idLimiter, validate({ params: idParam }), asyncHandler(getAgent));
router.patch(
  '/agents/me',
  requireAuth,
  requireRole('AGENT'),
  csrfProtection,
  validate({ body: updateAgentSchema }),
  writeLimiter,
  asyncHandler(updateOwnProfile)
);

// Consultants
router.get('/consultants', requireAuth, listLimiter, validate({ query: listQuery }), asyncHandler(listConsultants));
router.get(
  '/consultants/:id',
  requireAuth,
  idLimiter,
  validate({ params: idParam }),
  asyncHandler(getConsultant)
);
router.patch(
  '/consultants/me',
  requireAuth,
  requireRole('CONSULTANT'),
  csrfProtection,
  validate({ body: updateConsultantSchema }),
  writeLimiter,
  asyncHandler(updateOwnProfile)
);

// Students (self only — not a public directory)
router.patch(
  '/students/me',
  requireAuth,
  requireRole('STUDENT'),
  csrfProtection,
  validate({ body: updateStudentSchema }),
  writeLimiter,
  asyncHandler(updateOwnProfile)
);

export default router;
