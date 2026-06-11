import { Router } from 'express';
import { validate } from '../../shared/middleware/validate.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { requireAuth, requireRole } from '../../shared/middleware/auth.js';
import { csrfProtection } from '../../shared/middleware/csrf.js';
import {
  directoryListLimiter,
  directoryReadLimiter,
  directoryCompareLimiter,
  directoryWriteLimiter,
} from './directory.rate-limits.js';
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

// Universities
router.get('/universities', requireAuth, directoryListLimiter, validate({ query: listQuery }), asyncHandler(listUniversities));

// Compare must be declared before the `/:id` route so it isn't captured.
router.get(
  '/universities/compare',
  requireAuth,
  directoryCompareLimiter,
  validate({ query: compareQuery }),
  asyncHandler(compareUniversities)
);

router.get(
  '/universities/:id',
  requireAuth,
  directoryReadLimiter,
  validate({ params: idParam }),
  asyncHandler(getUniversity)
);

router.patch(
  '/universities/me',
  requireAuth,
  requireRole('UNIVERSITY'),
  csrfProtection,
  validate({ body: updateUniversitySchema }),
  directoryWriteLimiter,
  asyncHandler(updateOwnProfile)
);

// Agents
router.get('/agents', requireAuth, directoryListLimiter, validate({ query: listQuery }), asyncHandler(listAgents));

router.get('/agents/:id', requireAuth, directoryReadLimiter, validate({ params: idParam }), asyncHandler(getAgent));

router.patch(
  '/agents/me',
  requireAuth,
  requireRole('AGENT'),
  csrfProtection,
  validate({ body: updateAgentSchema }),
  directoryWriteLimiter,
  asyncHandler(updateOwnProfile)
);

// Consultants
router.get('/consultants', requireAuth, directoryListLimiter, validate({ query: listQuery }), asyncHandler(listConsultants));

router.get(
  '/consultants/:id',
  requireAuth,
  directoryReadLimiter,
  validate({ params: idParam }),
  asyncHandler(getConsultant)
);

router.patch(
  '/consultants/me',
  requireAuth,
  requireRole('CONSULTANT'),
  csrfProtection,
  validate({ body: updateConsultantSchema }),
  directoryWriteLimiter,
  asyncHandler(updateOwnProfile)
);

// Students (self only — not a public directory)
router.patch(
  '/students/me',
  requireAuth,
  requireRole('STUDENT'),
  csrfProtection,
  validate({ body: updateStudentSchema }),
  directoryWriteLimiter,
  asyncHandler(updateOwnProfile)
);

export default router;
