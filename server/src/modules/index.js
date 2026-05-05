import { Router } from 'express';
import authRoutes from './auth/auth.routes.js';
import directoryRoutes from './directory/directory.routes.js';
import postsRoutes from './posts/posts.routes.js';
import businessRoutes from './business/business.routes.js';
import adminRoutes from './admin/admin.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use(directoryRoutes); // /universities, /agents, /consultants, /students
router.use('/posts', postsRoutes);
router.use(businessRoutes); // /campaigns, /leads, /reviews
router.use('/admin', adminRoutes);

export default router;
