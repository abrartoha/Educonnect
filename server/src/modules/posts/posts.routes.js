import { Router } from 'express';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { validate } from '../../shared/middleware/validate.js';
import { requireAuth } from '../../shared/middleware/auth.js';
import { csrfProtection } from '../../shared/middleware/csrf.js';
import {
  createPostSchema,
  updatePostSchema,
  postListQuery,
  createCommentSchema,
} from './post.schema.js';
import { idParam } from '../../shared/validators/common.schema.js';
import {
  listPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  toggleUpvote,
  toggleBookmark,
  listMyBookmarks,
  listComments,
  addComment,
  deleteComment,
  listMyPosts,
} from './posts.controller.js';

const router = Router();

router.get('/', validate({ query: postListQuery }), asyncHandler(listPosts));
router.get('/me', requireAuth, asyncHandler(listMyPosts));
router.get('/bookmarks', requireAuth, asyncHandler(listMyBookmarks));

router.get('/:id', validate({ params: idParam }), asyncHandler(getPost));

router.post(
  '/',
  requireAuth,
  csrfProtection,
  validate({ body: createPostSchema }),
  asyncHandler(createPost)
);

router.patch(
  '/:id',
  requireAuth,
  csrfProtection,
  validate({ params: idParam, body: updatePostSchema }),
  asyncHandler(updatePost)
);

router.delete(
  '/:id',
  requireAuth,
  csrfProtection,
  validate({ params: idParam }),
  asyncHandler(deletePost)
);

router.post(
  '/:id/upvote',
  requireAuth,
  csrfProtection,
  validate({ params: idParam }),
  asyncHandler(toggleUpvote)
);

router.post(
  '/:id/bookmark',
  requireAuth,
  csrfProtection,
  validate({ params: idParam }),
  asyncHandler(toggleBookmark)
);

router.get(
  '/:id/comments',
  validate({ params: idParam }),
  asyncHandler(listComments)
);

router.post(
  '/:id/comments',
  requireAuth,
  csrfProtection,
  validate({ params: idParam, body: createCommentSchema }),
  asyncHandler(addComment)
);

router.delete(
  '/comments/:id',
  requireAuth,
  csrfProtection,
  validate({ params: idParam }),
  asyncHandler(deleteComment)
);

export default router;
