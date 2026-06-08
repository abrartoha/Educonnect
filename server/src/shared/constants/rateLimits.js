import { env } from '../../config/env.js';
import { minutes, hours } from '../utils/time.js';

/**
 * Central rate limit profiles. Each field can be overridden via RL_* env vars.
 * All times are in seconds (matching limiterFactory expectations).
 */
export const RATE_LIMIT_PROFILES = {
  global: {
    window: env.RL_GLOBAL_WINDOW ?? minutes(1),
    limit: env.RL_GLOBAL_LIMIT ?? 100,
  },
  api: {
    window: env.RL_API_WINDOW ?? minutes(1),
    limit: env.RL_API_LIMIT ?? 5,
    blockDuration: env.RL_API_BLOCK ?? minutes(15),
  },
  login: {
    window: env.RL_LOGIN_WINDOW ?? minutes(15),
    limit: env.RL_LOGIN_LIMIT ?? 5,
    scope: 'email',
    blockDuration: env.RL_LOGIN_BLOCK ?? minutes(30),
    routeSpecificLimit: true,
  },
  signup: {
    window: env.RL_SIGNUP_WINDOW ?? hours(1),
    limit: env.RL_SIGNUP_LIMIT ?? 5,
    scope: 'email',
    routeSpecificLimit: true,
    blockDuration: env.RL_SIGNUP_BLOCK ?? hours(1),
  },
  directoryList: {
    window: env.RL_DIR_LIST_WINDOW ?? minutes(1),
    limit: env.RL_DIR_LIST_LIMIT ?? 10,
    scope: 'user',
    routeSpecificLimit: true,
    blockDuration: env.RL_DIR_LIST_BLOCK ?? minutes(5),
  },
  directoryRead: {
    window: env.RL_DIR_READ_WINDOW ?? minutes(1),
    limit: env.RL_DIR_READ_LIMIT ?? 20,
    scope: 'user',
    routeSpecificLimit: true,
    blockDuration: env.RL_DIR_READ_BLOCK ?? minutes(5),
  },
  directoryCompare: {
    window: env.RL_DIR_COMPARE_WINDOW ?? minutes(1),
    limit: env.RL_DIR_COMPARE_LIMIT ?? 5,
    scope: 'user',
    routeSpecificLimit: true,
    blockDuration: env.RL_DIR_COMPARE_BLOCK ?? minutes(5),
  },
  directoryWrite: {
    window: env.RL_DIR_WRITE_WINDOW ?? hours(1),
    limit: env.RL_DIR_WRITE_LIMIT ?? 5,
    scope: 'user',
    blockDuration: env.RL_DIR_WRITE_BLOCK ?? hours(1),
  },
};
