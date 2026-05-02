import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { validate } from '../../shared/middleware/validate.js';
import { requireAuth } from '../../shared/middleware/auth.js';
import { csrfProtection } from '../../shared/middleware/csrf.js';
import { idParam } from '../../shared/validators/common.schema.js';
import {
  startConversationSchema,
  sendMessageSchema,
  listMessagesQuery,
} from './messaging.schema.js';
import {
  startConversation,
  listConversations,
  showConversation,
  getMessages,
  postMessage,
  postReadReceipt,
} from './messaging.controller.js';

const router = Router();

// Stricter rate limit for sending — 60 messages/min/user.
const sendLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Slow down — too many messages' },
  keyGenerator: (req) => req.user?.id || req.ip,
});

router.use(requireAuth);

router.get('/conversations', asyncHandler(listConversations));

router.post(
  '/conversations',
  csrfProtection,
  validate({ body: startConversationSchema }),
  asyncHandler(startConversation)
);

router.get(
  '/conversations/:id',
  validate({ params: idParam }),
  asyncHandler(showConversation)
);

router.get(
  '/conversations/:id/messages',
  validate({ params: idParam, query: listMessagesQuery }),
  asyncHandler(getMessages)
);

router.post(
  '/conversations/:id/messages',
  csrfProtection,
  sendLimiter,
  validate({ params: idParam, body: sendMessageSchema }),
  asyncHandler(postMessage)
);

router.post(
  '/conversations/:id/read',
  csrfProtection,
  validate({ params: idParam }),
  asyncHandler(postReadReceipt)
);

export default router;
