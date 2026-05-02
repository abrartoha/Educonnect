import { doubleCsrf } from 'csrf-csrf';
import { env, isProd } from '../../config/env.js';

const { doubleCsrfProtection, generateToken, invalidCsrfTokenError } = doubleCsrf({
  getSecret: () => env.CSRF_SECRET,
  getSessionIdentifier: (req) => req.signedCookies?.em_access || req.ip,
  cookieName: isProd ? '__Host-em.csrf' : 'em.csrf',
  cookieOptions: {
    sameSite: isProd ? 'strict' : 'lax',
    secure: isProd,
    httpOnly: true,
    path: '/',
  },
  size: 64,
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
  getTokenFromRequest: (req) => req.headers['x-csrf-token'],
});

// Wrap the raw CSRF middleware so that requests carrying a Bearer token
// skip the check — CSRF only protects cookie/ambient-credential flows.
export const csrfProtection = (req, res, next) => {
  if (req.isBearerAuth) return next();
  return doubleCsrfProtection(req, res, next);
};

export const generateCsrfToken = generateToken;
export const invalidCsrfError = invalidCsrfTokenError;
