import { Router } from 'express';
import authRoutes from './auth/auth.routes.js';
import directoryRoutes from './directory/directory.routes.js';
import postsRoutes from './posts/posts.routes.js';
import businessRoutes from './business/business.routes.js';
import meetingsRoutes from './meetings/meetings.routes.js';
import messagingRoutes from './messaging/messaging.routes.js';
import adminRoutes from './admin/admin.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use(directoryRoutes); // /universities, /agents, /consultants, /students
router.use('/posts', postsRoutes);
router.use(businessRoutes); // /campaigns, /bookings, /leads, /reviews
router.use(meetingsRoutes); // /bookings/:id/meeting/token
router.use('/messages', messagingRoutes); // /conversations*
router.use('/admin', adminRoutes);

export default router;
