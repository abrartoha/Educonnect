import {
  registerUser,
  authenticateUser,
  issueTokensForUser,
  rotateRefreshToken,
  revokeRefreshToken,
  changeUserPassword,
  generatePasswordResetToken,
  resetPasswordWithToken,
} from './auth.service.js';
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  accessCookieOptions,
  refreshCookieOptions,
  clearAuthCookies,
} from '../../shared/utils/cookies.js';
import { UnauthorizedError } from '../../shared/utils/errors.js';
import { prisma } from '../../db/prisma.js';
import { generateCsrfToken } from '../../shared/middleware/csrf.js';
import { env } from '../../config/env.js';
import crypto from 'crypto';
import redisClient from '../../db/redis.js';
import { sendEmail } from '../../shared/services/sendEmail.js';

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
  if (!req.user) return res.json({ user: null });
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

export async function getFormToken(req, res) {
  const timestamp = Date.now()
  const secret    = env.FORM_TOKEN_SECRET || 'default_secret_change_me_in_prod'
  const hmac      = crypto
    .createHmac('sha256', secret)
    .update(String(timestamp))
    .digest('hex')

  const token = `${timestamp}.${hmac}`

  // Store token in Redis, expires in 15 min (900 seconds)
  await redisClient.set(`formtoken:${token}`, '1', {
    EX: 900
  });

  res.json({ token })
}

export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  const result = await changeUserPassword(req.user, currentPassword, newPassword);
  if(!result) throw new Error('Password change failed');
  const email = await sendEmail({
    to: req.user.email,
    subject: 'Password Changed',
    templateName: 'changePasswordEmail',
    templateData: { name: req.user.name, changedAt: new Date().toLocaleString() },
  });
  if(email) res.json({ ok: true });
  else throw new Error('Password changed but failed to send notification email');
}

export async function forgotPassword(req, res) {
  const { email } = req.body;
  
  // Generate reset token (also validates email exists)
  const token = await generatePasswordResetToken(email);
  
  // Create reset link
  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
  
  // Send password reset email
  const result = await sendEmail({
    to: email,
    subject: 'Password Reset Request',
    templateName: 'passwordResetEmail',
    templateData: { 
      resetUrl,
      expiryMinutes: 3,
      name: email.split('@')[0],
    },
  });

  if (result) {
    res.json({ 
      ok: true, 
      message: 'Password reset link has been sent to your email. It will expire in 2 minutes.' 
    });
  } else {
    throw new Error('Failed to send password reset email');
    // Note: We don't want to reveal whether the email exists or not, so we return success even if sending fails.
    // Refactore: In a real implementation, Silently reject and log this failure for internal monitoring but not expose it to the user.
  }
}

export async function resetPassword(req, res) {
  const { token, email, newPassword } = req.body;

  // Reset password using token
  const user = await resetPasswordWithToken(token, email, newPassword);

  res.json({ 
    ok: true, 
    message: 'Password has been reset successfully. You can now login with your new password.',
    user
  });
}