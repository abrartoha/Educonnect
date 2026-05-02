import { env, isProd } from '../../config/env.js';

export const ACCESS_COOKIE = 'em_access';
export const REFRESH_COOKIE = 'em_refresh';

const baseCookie = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'strict' : 'lax',
  path: '/',
  signed: true,
};

export const accessCookieOptions = () => ({
  ...baseCookie,
  maxAge: 15 * 60 * 1000, // mirror ACCESS_TOKEN_TTL — recomputed if you change it
});

export const refreshCookieOptions = () => ({
  ...baseCookie,
  maxAge: env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
  path: '/api/auth', // refresh cookie only sent to auth endpoints
});

export const clearAuthCookies = (res) => {
  res.clearCookie(ACCESS_COOKIE, { path: '/' });
  res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
};
