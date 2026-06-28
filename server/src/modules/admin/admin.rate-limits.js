import { rateLimiter } from '../../shared/middleware/ratelimiter/limiterFactory.js';
import { env } from '../../config/env.js';
import { minutes, hours } from '../../shared/utils/time.js';

/**
 * Overview read limiter - retrieves dashboard statistics
 * Read operation with moderate frequency limit
 */
export const adminOverviewLimiter = rateLimiter({
  window: env.RL_ADMIN_OVERVIEW_WINDOW ?? minutes(5),
  limit: env.RL_ADMIN_OVERVIEW_LIMIT ?? 30,
  scope: 'user',
  routeSpecificLimit: true,
  blockDuration: env.RL_ADMIN_OVERVIEW_BLOCK ?? minutes(5),
});

/**
 * Users list limiter - retrieves paginated user list with filtering
 * Read operation with moderate frequency limit
 */
export const adminListUsersLimiter = rateLimiter({
  window: env.RL_ADMIN_LIST_USERS_WINDOW ?? minutes(5),
  limit: env.RL_ADMIN_LIST_USERS_LIMIT ?? 20,
  scope: 'user',
  routeSpecificLimit: true,
  blockDuration: env.RL_ADMIN_LIST_USERS_BLOCK ?? minutes(5),
});

/**
 * User approval limiter - approves pending user accounts
 * Write operation with strict frequency limit
 * Limits approvals per hour to prevent bulk processing abuse
 */
export const adminApproveUserLimiter = rateLimiter({
  window: env.RL_ADMIN_APPROVE_USER_WINDOW ?? minutes(1),
  limit: env.RL_ADMIN_APPROVE_USER_LIMIT ?? 50,
  scope: 'user',
  routeSpecificLimit: true,
  blockDuration: env.RL_ADMIN_APPROVE_USER_BLOCK ?? hours(1),
});

/**
 * User suspension limiter - suspends active user accounts
 * Write operation with strict frequency limit
 * Limits suspensions per hour to prevent accidental mass suspensions
 */
export const adminSuspendUserLimiter = rateLimiter({
  window: env.RL_ADMIN_SUSPEND_USER_WINDOW ?? minutes(1),
  limit: env.RL_ADMIN_SUSPEND_USER_LIMIT ?? 30,
  scope: 'user',
  routeSpecificLimit: true,
  blockDuration: env.RL_ADMIN_SUSPEND_USER_BLOCK ?? hours(1),
});

/**
 * User reactivation limiter - reactivates suspended accounts
 * Write operation with moderate frequency limit
 */
export const adminReactivateUserLimiter = rateLimiter({
  window: env.RL_ADMIN_REACTIVATE_USER_WINDOW ?? minutes(1),
  limit: env.RL_ADMIN_REACTIVATE_USER_LIMIT ?? 40,
  scope: 'user',
  routeSpecificLimit: true,
  blockDuration: env.RL_ADMIN_REACTIVATE_USER_BLOCK ?? hours(1),
});

/**
 * Post pin limiter - pins/unpins posts for visibility
 * Write operation with moderate frequency limit
 */
export const adminPinPostLimiter = rateLimiter({
  window: env.RL_ADMIN_PIN_POST_WINDOW ?? minutes(5),
  limit: env.RL_ADMIN_PIN_POST_LIMIT ?? 60,
  scope: 'user',
  routeSpecificLimit: true,
  blockDuration: env.RL_ADMIN_PIN_POST_BLOCK ?? minutes(10),
});

/**
 * Post status update limiter - changes post status (publish/hide/remove)
 * Write operation with strict frequency limit
 * Limits status changes to prevent spam/abuse content moderation
 */
export const adminPostStatusLimiter = rateLimiter({
  window: env.RL_ADMIN_POST_STATUS_WINDOW ?? minutes(5),
  limit: env.RL_ADMIN_POST_STATUS_LIMIT ?? 30,
  scope: 'user',
  routeSpecificLimit: true,
  blockDuration: env.RL_ADMIN_POST_STATUS_BLOCK ?? minutes(10),
});
