import { responseHandler } from '../../shared/utils/responseHandler.js';
import {
  listForTarget as listForTargetService,
  createReview as createReviewService,
} from './reviews.service.js';

export const listForTarget = async (req, res) => {
  const result = await listForTargetService(req.params.id, req.query);
  responseHandler.paginated(res, result.items, result.meta);
};

export const createReview = async (req, res) => {
  const review = await createReviewService(req.user, req.body);
  responseHandler.created(res, review);
};
