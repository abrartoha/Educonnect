import { rateLimiter } from '../../shared/middleware/ratelimiter/limiterFactory.js';
import { env } from '../../config/env.js';
import { minutes, hours } from '../../shared/utils/time.js';

export const directoryListLimiter = rateLimiter({
  window: env.RL_DIR_LIST_WINDOW ?? minutes(1),
  limit: env.RL_DIR_LIST_LIMIT ?? 10,
  scope: 'user',
  routeSpecificLimit: true,
  blockDuration: env.RL_DIR_LIST_BLOCK ?? minutes(5),
});

export const directoryReadLimiter = rateLimiter({
  window: env.RL_DIR_READ_WINDOW ?? minutes(1),
  limit: env.RL_DIR_READ_LIMIT ?? 20,
  scope: 'user',
  routeSpecificLimit: true,
  blockDuration: env.RL_DIR_READ_BLOCK ?? minutes(5),
});

export const directoryCompareLimiter = rateLimiter({
  window: env.RL_DIR_COMPARE_WINDOW ?? minutes(1),
  limit: env.RL_DIR_COMPARE_LIMIT ?? 5,
  scope: 'user',
  routeSpecificLimit: true,
  blockDuration: env.RL_DIR_COMPARE_BLOCK ?? minutes(5),
});

export const directoryWriteLimiter = rateLimiter({
  window: env.RL_DIR_WRITE_WINDOW ?? hours(1),
  limit: env.RL_DIR_WRITE_LIMIT ?? 5,
  scope: 'user',
  blockDuration: env.RL_DIR_WRITE_BLOCK ?? hours(1),
});
