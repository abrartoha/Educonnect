import { verifyAccessToken } from '../utils/tokens.js';
import { ACCESS_COOKIE } from '../utils/cookies.js';
import { prisma } from '../../db/prisma.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Attach req.user if a valid access token is present.
// Bearer header takes precedence over the cookie. If a client explicitly sends
// `Authorization: Bearer <token>`, treat the request as Bearer-authed (which
// is immune to CSRF — browsers can't forge custom headers from a CSRF attack).
// Otherwise fall back to the signed httpOnly cookie used by the web SPA.
const loadUserFromToken = async (token) => {
  try {
    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, status: true, name: true },
    });
    if (user && user.status !== 'SUSPENDED') return user;
  } catch {
    // silent — invalid/expired token, proceed unauthenticated
  }
  return null;
};

export const attachUser = asyncHandler(async (req, _res, next) => {
  // 1) Bearer takes precedence (mobile / programmatic API calls).
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    req.isBearerAuth = true;
    const token = authHeader.slice(7).trim();
    const user = await loadUserFromToken(token);
    if (user) req.user = user;
    return next();
  }

  // 2) Fall back to the signed cookie (web SPA).
  const cookieToken = req.signedCookies?.[ACCESS_COOKIE];
  if (!cookieToken) return next();
  const user = await loadUserFromToken(cookieToken);
  if (user) req.user = user;
  next();
});

// Require authentication.
export const requireAuth = (req, _res, next) => {
  if (!req.user) return next(new UnauthorizedError());
  next();
};

// Require a specific role (or any of several).
export const requireRole = (...roles) => (req, _res, next) => {
  if (!req.user) return next(new UnauthorizedError());
  if (!roles.includes(req.user.role)) return next(new ForbiddenError());
  next();
};
