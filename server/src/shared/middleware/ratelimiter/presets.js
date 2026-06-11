import { rateLimiter } from './limiterFactory.js';
import { env } from '../../config/env.js';
import { minutes, hours } from '../../shared/utils/time.js';

export const globalLimiter = rateLimiter({
  window: env.RL_GLOBAL_WINDOW ?? minutes(1),
  limit: env.RL_GLOBAL_LIMIT ?? 100,
});

export const apiLimiter = rateLimiter({
  window: env.RL_API_WINDOW ?? minutes(1),
  limit: env.RL_API_LIMIT ?? 5,
  blockDuration: env.RL_API_BLOCK ?? minutes(15),
});

export const loginLimiter = rateLimiter({
  window: env.RL_LOGIN_WINDOW ?? minutes(15),
  limit: env.RL_LOGIN_LIMIT ?? 5,
  scope: 'email',
  routeSpecificLimit: true,
  blockDuration: env.RL_LOGIN_BLOCK ?? minutes(30),
});

export const signupLimiter = rateLimiter({
  window: env.RL_SIGNUP_WINDOW ?? hours(1),
  limit: env.RL_SIGNUP_LIMIT ?? 5,
  scope: 'email',
  routeSpecificLimit: true,
  blockDuration: env.RL_SIGNUP_BLOCK ?? hours(1),
});
