import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';

// ---- access token ----------------------------------------------------------

export const signAccessToken = (payload) =>
  jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.ACCESS_TOKEN_TTL,
    algorithm: 'HS256',
  });

export const verifyAccessToken = (token) =>
  jwt.verify(token, env.JWT_ACCESS_SECRET, { algorithms: ['HS256'] });

// ---- refresh token ---------------------------------------------------------
// Refresh tokens are opaque random strings, NOT JWTs. We store a SHA-256 hash
// in the DB so a compromised database row still can't be used to forge cookies.

export const generateRefreshToken = () => crypto.randomBytes(64).toString('hex');

export const hashRefreshToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

export const refreshTokenExpiry = () => {
  const d = new Date();
  d.setDate(d.getDate() + env.REFRESH_TOKEN_TTL_DAYS);
  return d;
};
