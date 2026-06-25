import { Router } from 'express';
import { validate } from '../../shared/middleware/validate.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { requireAuth, requireRole } from '../../shared/middleware/auth.js';
import { csrfProtection } from '../../shared/middleware/csrf.js';
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
} from './profile.schema.js';

const router = Router();

// Universities
router.get('/universities', validate({ query: listQuery }), asyncHandler(listUniversities));
// Compare must be declared before the `/:id` route so it isn't captured.
router.get('/universities/compare', asyncHandler(compareUniversities));
router.get(
  '/universities/:id',
  validate({ params: idParam }),
  asyncHandler(getUniversity)
);
router.patch(
  '/universities/me',
  requireAuth,
  requireRole('UNIVERSITY'),
  csrfProtection,
  validate({ body: updateUniversitySchema }),
  asyncHandler(updateOwnProfile)
);

// Agents
router.get('/agents', validate({ query: listQuery }), asyncHandler(listAgents));
router.get('/agents/:id', validate({ params: idParam }), asyncHandler(getAgent));
router.patch(
  '/agents/me',
  requireAuth,
  requireRole('AGENT'),
  csrfProtection,
  validate({ body: updateAgentSchema }),
  asyncHandler(updateOwnProfile)
);

// Consultants
router.get('/consultants', validate({ query: listQuery }), asyncHandler(listConsultants));
router.get(
  '/consultants/:id',
  validate({ params: idParam }),
  asyncHandler(getConsultant)
);
router.patch(
  '/consultants/me',
  requireAuth,
  requireRole('CONSULTANT'),
  csrfProtection,
  validate({ body: updateConsultantSchema }),
  asyncHandler(updateOwnProfile)
);

// Students (self only — not a public directory)
router.patch(
  '/students/me',
  requireAuth,
  requireRole('STUDENT'),
  csrfProtection,
  validate({ body: updateStudentSchema }),
  asyncHandler(updateOwnProfile)
);

export default router;
