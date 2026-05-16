import {
  registerUser,
  authenticateUser,
  issueTokensForUser,
  rotateRefreshToken,
  revokeRefreshToken,
} from './auth.service.js';
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  accessCookieOptions,
  refreshCookieOptions,
  clearAuthCookies,
} from '../../shared/utils/cookies.js';
import { prisma } from '../../db/prisma.js';
import { generateCsrfToken } from '../../shared/middleware/csrf.js';
import { UnauthorizedError, ForbiddenError } from '../../shared/utils/errors.js';

const setAuthCookies = (res, { accessToken, refreshToken }) => {
  res.cookie(ACCESS_COOKIE, accessToken, accessCookieOptions());
  res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions());
};

const publicUser = (user) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
  status: user.status,
  avatarUrl: user.avatarUrl ?? null,
});

// Web clients use cookies; mobile clients read tokens from the response body.
// We include both on every auth response — cookies are ignored by mobile,
// body tokens are ignored by web.
export const signup = async (req, res) => {
  const user = await registerUser(req.body);
  const tokens = await issueTokensForUser(user, {
    userAgent: req.get('user-agent'),
    ip: req.ip,
  });
  setAuthCookies(res, tokens);
  res.status(201).json({ user: publicUser(user), tokens });
};

export const login = async (req, res) => {
  const user = await authenticateUser(req.body.email, req.body.password);
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });
  const tokens = await issueTokensForUser(user, {
    userAgent: req.get('user-agent'),
    ip: req.ip,
  });
  setAuthCookies(res, tokens);
  res.json({ user: publicUser(user), tokens });
};

// Refresh accepts the token from either the signed cookie (web) or the
// request body (mobile, since mobile has no cookies).
export const refresh = async (req, res) => {
  const token = req.signedCookies?.[REFRESH_COOKIE] || req.body?.refreshToken;
  if (!token) throw new UnauthorizedError('Missing refresh token');
  const { accessToken, refreshToken, user } = await rotateRefreshToken(token, {
    userAgent: req.get('user-agent'),
    ip: req.ip,
  });
  setAuthCookies(res, { accessToken, refreshToken });
  res.json({
    user: publicUser(user),
    tokens: { accessToken, refreshToken },
  });
};

export const logout = async (req, res) => {
  const token = req.signedCookies?.[REFRESH_COOKIE] || req.body?.refreshToken;
  await revokeRefreshToken(token);
  clearAuthCookies(res);
  res.json({ ok: true });
};

export const me = async (req, res) => {
  const full = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      avatarUrl: true,
    },
  });
  if (!full || full.status !== 'ACTIVE') throw new ForbiddenError();
  res.json({ user: full });
};

// Hand the frontend a CSRF token (double-submit cookie pattern).
// Force overwrite + skip validateOnReuse so a stale cookie (e.g. from a
// previous session whose em_access has since rotated) never blocks issuance.
export const csrfToken = (req, res) => {
  const token = generateCsrfToken(req, res, {
    overwrite: true,
    validateOnReuse: false,
  });
  res.json({ csrfToken: token });
};
