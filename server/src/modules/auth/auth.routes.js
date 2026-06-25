import { Router } from 'express';
import { authLimiter, signupLimiter } from '../../shared/middleware/rateLimits.js';
import { validate } from '../../shared/middleware/validate.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import { csrfProtection } from '../../shared/middleware/csrf.js';
import { signupSchema, loginSchema, changePasswordSchema, forgotPasswordSchema, resetPasswordSchema } from './auth.schema.js';
import {
  signup,
  login,
  refresh,
  logout,
  me,
  csrfToken,
  getFormToken,
  changePassword,
  forgotPassword,
  resetPassword,
} from './auth.controller.js';
import { emailValidator } from '../../shared/middleware/emailValidator.js';
import { requireAuth } from '../../shared/middleware/auth.js';
// import { timeCheck } from '../../shared/middleware/timeCheck.js';

const router = Router();

router.get('/csrf', asyncHandler(csrfToken));

router.post(
  '/signup',
  signupLimiter,
  validate({ body: signupSchema }),
  asyncHandler(signup)
);

router.post(
  '/login',
  authLimiter,
  validate({ body: loginSchema }),
  asyncHandler(login)
);

router.post('/refresh', authLimiter, asyncHandler(refresh));

router.post('/logout', csrfProtection, asyncHandler(logout));

router.get('/me', asyncHandler(me));

router.get('/form-token', asyncHandler(getFormToken));

// Time check route for testing. Not for production use.
// router.post('/time-check', timeCheck, (req, res) => {
//   res.json({ message: 'Form submission accepted' });
// });

router.post('/check-email', emailValidator, (req, res) => {
  res.json({ message: 'Email is valid and can receive emails' });
});

router.post(
  '/change-password',
  requireAuth,
  csrfProtection,
  validate({ body: changePasswordSchema }),
  asyncHandler(changePassword)
);

router.post(
  '/forgot-password',
  // signupLimiter,
  validate({ body: forgotPasswordSchema }),
  asyncHandler(forgotPassword)
);

router.post(
  '/reset-password',
  // signupLimiter,
  validate({ body: resetPasswordSchema }),
  asyncHandler(resetPassword)
);

export default router;
