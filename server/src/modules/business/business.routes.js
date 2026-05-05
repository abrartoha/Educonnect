import { Router } from 'express';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { validate } from '../../shared/middleware/validate.js';
import { requireAuth, requireRole } from '../../shared/middleware/auth.js';
import { csrfProtection } from '../../shared/middleware/csrf.js';
import { idParam } from '../../shared/validators/common.schema.js';
import {
  createCampaignSchema,
  updateCampaignSchema,
  createLeadSchema,
  updateLeadStatusSchema,
  createReviewBodySchema,
} from './business.schema.js';
import {
  listMyCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign,
} from './campaigns.controller.js';
import {
  createLead,
  listMyLeads,
  updateLeadStatus,
  listMySubmittedLeads,
} from './leads.controller.js';
import {
  listForTarget,
  createReview,
} from './reviews.controller.js';

const router = Router();

// ---- Campaigns (university-scoped) ----------------------------------------
router.get('/campaigns', requireAuth, requireRole('UNIVERSITY'), asyncHandler(listMyCampaigns));
router.post(
  '/campaigns',
  requireAuth,
  requireRole('UNIVERSITY'),
  csrfProtection,
  validate({ body: createCampaignSchema }),
  asyncHandler(createCampaign)
);
router.patch(
  '/campaigns/:id',
  requireAuth,
  requireRole('UNIVERSITY'),
  csrfProtection,
  validate({ params: idParam, body: updateCampaignSchema }),
  asyncHandler(updateCampaign)
);
router.delete(
  '/campaigns/:id',
  requireAuth,
  requireRole('UNIVERSITY'),
  csrfProtection,
  validate({ params: idParam }),
  asyncHandler(deleteCampaign)
);

// ---- Leads (student → uni / agent / consultant) ---------------------------
// `/leads` returns leads received by the caller (uni/agent/consultant).
router.get(
  '/leads',
  requireAuth,
  requireRole('UNIVERSITY', 'AGENT', 'CONSULTANT'),
  asyncHandler(listMyLeads)
);
router.get(
  '/leads/mine',
  requireAuth,
  requireRole('STUDENT'),
  asyncHandler(listMySubmittedLeads)
);
router.post(
  '/leads',
  requireAuth,
  requireRole('STUDENT'),
  csrfProtection,
  validate({ body: createLeadSchema }),
  asyncHandler(createLead)
);
router.patch(
  '/leads/:id/status',
  requireAuth,
  requireRole('UNIVERSITY', 'AGENT', 'CONSULTANT'),
  csrfProtection,
  validate({ params: idParam, body: updateLeadStatusSchema }),
  asyncHandler(updateLeadStatus)
);

// ---- Reviews --------------------------------------------------------------
router.get('/reviews/target/:id', validate({ params: idParam }), asyncHandler(listForTarget));
router.post(
  '/reviews',
  requireAuth,
  requireRole('STUDENT'),
  csrfProtection,
  validate({ body: createReviewBodySchema }),
  asyncHandler(createReview)
);

export default router;
