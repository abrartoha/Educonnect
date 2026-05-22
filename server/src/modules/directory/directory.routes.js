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

/**
 * @openapi
 * tags:
 *   name: Directory
 *   description: Directory browsing and profile management
 */

/**
 * @openapi
 * /universities:
 *   get:
 *     summary: List universities
 *     tags: [Directory]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PaginationPage'
 *       - $ref: '#/components/parameters/PaginationLimit'
 *       - $ref: '#/components/parameters/SearchQuery'
 *       - $ref: '#/components/parameters/SortParam'
 *       - name: verified
 *         in: query
 *         schema:
 *           type: boolean
 *         description: Filter by verified status
 *       - name: location
 *         in: query
 *         schema:
 *           type: string
 *         description: Filter by location
 *     responses:
 *       200:
 *         description: List of universities
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: 'boolean' }
 *                 data: { type: 'array', items: { $ref: '#/components/schemas/UniversityProfile' } }
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page: { type: 'integer' }
 *                     limit: { type: 'integer' }
 *                     total: { type: 'integer' }
 *                     pages: { type: 'integer' }
 */
// Universities
router.get('/universities', requireAuth, listLimiter, validate({ query: listQuery }), asyncHandler(listUniversities));
/**
 * @openapi
 * /universities/compare:
 *   get:
 *     summary: Compare up to three universities
 *     tags: [Directory]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - name: ids
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Comma-separated list of 2 or 3 university IDs
 *     responses:
 *       200:
 *         description: List of compared universities
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: 'boolean' }
 *                 data: { type: 'array', items: { $ref: '#/components/schemas/UniversityProfile' } }
 */
// Compare must be declared before the `/:id` route so it isn't captured.
router.get(
  '/universities/compare',
  requireAuth,
  compareLimiter,
  validate({ query: compareQuery }),
  asyncHandler(compareUniversities)
);
/**
 * @openapi
 * /universities/{id}:
 *   get:
 *     summary: Get a specific university profile
 *     tags: [Directory]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: University profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: 'boolean' }
 *                 data: { $ref: '#/components/schemas/UniversityProfile' }
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  '/universities/:id',
  requireAuth,
  idLimiter,
  validate({ params: idParam }),
  asyncHandler(getUniversity)
);
/**
 * @openapi
 * /universities/me:
 *   patch:
 *     summary: Update own university profile
 *     description: Requires UNIVERSITY role.
 *     tags: [Directory]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *         csrfToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UniversityUpdate'
 *     responses:
 *       200:
 *         description: Updated profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: 'boolean' }
 *                 data: { $ref: '#/components/schemas/UniversityProfile' }
 */
router.patch(
  '/universities/me',
  requireAuth,
  requireRole('UNIVERSITY'),
  csrfProtection,
  validate({ body: updateUniversitySchema }),
  writeLimiter,
  asyncHandler(updateOwnProfile)
);

/**
 * @openapi
 * /agents:
 *   get:
 *     summary: List agents
 *     tags: [Directory]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PaginationPage'
 *       - $ref: '#/components/parameters/PaginationLimit'
 *       - $ref: '#/components/parameters/SearchQuery'
 *       - $ref: '#/components/parameters/SortParam'
 *       - name: verified
 *         in: query
 *         schema:
 *           type: boolean
 *         description: Filter by verified status
 *       - name: location
 *         in: query
 *         schema:
 *           type: string
 *         description: Filter by location
 *     responses:
 *       200:
 *         description: List of agents
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: 'boolean' }
 *                 data: { type: 'array', items: { $ref: '#/components/schemas/AgentProfile' } }
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page: { type: 'integer' }
 *                     limit: { type: 'integer' }
 *                     total: { type: 'integer' }
 *                     pages: { type: 'integer' }
 */
// Agents
router.get('/agents', requireAuth, listLimiter, validate({ query: listQuery }), asyncHandler(listAgents));
/**
 * @openapi
 * /agents/{id}:
 *   get:
 *     summary: Get a specific agent profile
 *     tags: [Directory]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Agent profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: 'boolean' }
 *                 data: { $ref: '#/components/schemas/AgentProfile' }
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/agents/:id', requireAuth, idLimiter, validate({ params: idParam }), asyncHandler(getAgent));
/**
 * @openapi
 * /agents/me:
 *   patch:
 *     summary: Update own agent profile
 *     description: Requires AGENT role.
 *     tags: [Directory]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *         csrfToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AgentUpdate'
 *     responses:
 *       200:
 *         description: Updated profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: 'boolean' }
 *                 data: { $ref: '#/components/schemas/AgentProfile' }
 */
router.patch(
  '/agents/me',
  requireAuth,
  requireRole('AGENT'),
  csrfProtection,
  validate({ body: updateAgentSchema }),
  writeLimiter,
  asyncHandler(updateOwnProfile)
);

/**
 * @openapi
 * /consultants:
 *   get:
 *     summary: List consultants
 *     tags: [Directory]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PaginationPage'
 *       - $ref: '#/components/parameters/PaginationLimit'
 *       - $ref: '#/components/parameters/SearchQuery'
 *       - $ref: '#/components/parameters/SortParam'
 *       - name: verified
 *         in: query
 *         schema:
 *           type: boolean
 *         description: Filter by verified status
 *       - name: location
 *         in: query
 *         schema:
 *           type: string
 *         description: Filter by location
 *     responses:
 *       200:
 *         description: List of consultants
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: 'boolean' }
 *                 data: { type: 'array', items: { $ref: '#/components/schemas/ConsultantProfile' } }
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page: { type: 'integer' }
 *                     limit: { type: 'integer' }
 *                     total: { type: 'integer' }
 *                     pages: { type: 'integer' }
 */
// Consultants
router.get('/consultants', requireAuth, listLimiter, validate({ query: listQuery }), asyncHandler(listConsultants));
/**
 * @openapi
 * /consultants/{id}:
 *   get:
 *     summary: Get a specific consultant profile
 *     tags: [Directory]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Consultant profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: 'boolean' }
 *                 data: { $ref: '#/components/schemas/ConsultantProfile' }
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  '/consultants/:id',
  requireAuth,
  idLimiter,
  validate({ params: idParam }),
  asyncHandler(getConsultant)
);
/**
 * @openapi
 * /consultants/me:
 *   patch:
 *     summary: Update own consultant profile
 *     description: Requires CONSULTANT role.
 *     tags: [Directory]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *         csrfToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ConsultantUpdate'
 *     responses:
 *       200:
 *         description: Updated profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: 'boolean' }
 *                 data: { $ref: '#/components/schemas/ConsultantProfile' }
 */
router.patch(
  '/consultants/me',
  requireAuth,
  requireRole('CONSULTANT'),
  csrfProtection,
  validate({ body: updateConsultantSchema }),
  writeLimiter,
  asyncHandler(updateOwnProfile)
);

/**
 * @openapi
 * /students/me:
 *   patch:
 *     summary: Update own student profile
 *     description: Requires STUDENT role.
 *     tags: [Directory]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *         csrfToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StudentUpdate'
 *     responses:
 *       200:
 *         description: Updated profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: 'boolean' }
 *                 data:
 *                   type: object
 *                   properties:
 *                     id: { type: 'string' }
 *                     name: { type: 'string' }
 *                     avatarUrl: { type: 'string', nullable: true }
 *                     createdAt: { type: 'string', format: 'date-time' }
 *                     student:
 *                       type: object
 *                       properties:
 *                         nationality: { type: 'string', nullable: true }
 *                         currentEducation: { type: 'string', nullable: true }
 *                         interestedIn: { type: 'array', items: { type: 'string' } }
 *                         preferredLocations: { type: 'array', items: { type: 'string' } }
 *                         budgetMin: { type: 'integer', nullable: true }
 *                         budgetMax: { type: 'integer', nullable: true }
 *                         bio: { type: 'string', nullable: true }
 *                         intakeTarget: { type: 'string', nullable: true }
 */
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
