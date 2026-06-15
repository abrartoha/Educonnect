import { rateLimiter } from '../../shared/middleware/ratelimiter/limiterFactory.js';
import { env } from '../../config/env.js';
import { minutes, hours } from '../../shared/utils/time.js';

// ---- Reviews ---------------------------------------------------------------

export const reviewsListLimiter = rateLimiter({
  window: env.RL_BIZ_REVIEW_LIST_WINDOW ?? minutes(1),
  limit: env.RL_BIZ_REVIEW_LIST_LIMIT ?? 10,
  scope: 'user',
  routeSpecificLimit: true,
  blockDuration: env.RL_BIZ_REVIEW_LIST_BLOCK ?? minutes(5),
});

export const reviewCreateLimiter = rateLimiter({
  window: env.RL_BIZ_REVIEW_CREATE_WINDOW ?? hours(1),
  limit: env.RL_BIZ_REVIEW_CREATE_LIMIT ?? 3,
  scope: 'user',
  routeSpecificLimit: true,
  blockDuration: env.RL_BIZ_REVIEW_CREATE_BLOCK ?? hours(1),
});

// ---- Campaigns (university-scoped) -----------------------------------------

export const campaignListLimiter = rateLimiter({
  window: env.RL_BIZ_CAMPAIGN_LIST_WINDOW ?? minutes(5),
  limit: env.RL_BIZ_CAMPAIGN_LIST_LIMIT ?? 10,
  scope: 'user',
  routeSpecificLimit: true,
  blockDuration: env.RL_BIZ_CAMPAIGN_LIST_BLOCK ?? minutes(5),
});

export const campaignCreateLimiter = rateLimiter({
  window: env.RL_BIZ_CAMPAIGN_CREATE_WINDOW ?? hours(1),
  limit: env.RL_BIZ_CAMPAIGN_CREATE_LIMIT ?? 3,
  scope: 'user',
  routeSpecificLimit: true,
  blockDuration: env.RL_BIZ_CAMPAIGN_CREATE_BLOCK ?? hours(1),
});

export const campaignUpdateLimiter = rateLimiter({
  window: env.RL_BIZ_CAMPAIGN_UPDATE_WINDOW ?? hours(1),
  limit: env.RL_BIZ_CAMPAIGN_UPDATE_LIMIT ?? 5,
  scope: 'user',
  routeSpecificLimit: true,
  blockDuration: env.RL_BIZ_CAMPAIGN_UPDATE_BLOCK ?? hours(1),
});

export const campaignDeleteLimiter = rateLimiter({
  window: env.RL_BIZ_CAMPAIGN_DELETE_WINDOW ?? hours(1),
  limit: env.RL_BIZ_CAMPAIGN_DELETE_LIMIT ?? 3,
  scope: 'user',
  routeSpecificLimit: true,
  blockDuration: env.RL_BIZ_CAMPAIGN_DELETE_BLOCK ?? hours(1),
});

// ---- Leads -----------------------------------------------------------------

export const leadSubmitLimiter = rateLimiter({
  window: env.RL_BIZ_LEAD_SUBMIT_WINDOW ?? hours(1),
  limit: env.RL_BIZ_LEAD_SUBMIT_LIMIT ?? 5,
  scope: 'user',
  routeSpecificLimit: true,
  blockDuration: env.RL_BIZ_LEAD_SUBMIT_BLOCK ?? hours(1),
});

export const leadListLimiter = rateLimiter({
  window: env.RL_BIZ_LEAD_LIST_WINDOW ?? minutes(5),
  limit: env.RL_BIZ_LEAD_LIST_LIMIT ?? 10,
  scope: 'user',
  routeSpecificLimit: true,
  blockDuration: env.RL_BIZ_LEAD_LIST_BLOCK ?? minutes(5),
});

export const leadMineListLimiter = rateLimiter({
  window: env.RL_BIZ_LEAD_MINE_WINDOW ?? minutes(5),
  limit: env.RL_BIZ_LEAD_MINE_LIMIT ?? 10,
  scope: 'user',
  routeSpecificLimit: true,
  blockDuration: env.RL_BIZ_LEAD_MINE_BLOCK ?? minutes(5),
});

export const leadStatusUpdateLimiter = rateLimiter({
  window: env.RL_BIZ_LEAD_STATUS_WINDOW ?? hours(1),
  limit: env.RL_BIZ_LEAD_STATUS_LIMIT ?? 5,
  scope: 'user',
  routeSpecificLimit: true,
  blockDuration: env.RL_BIZ_LEAD_STATUS_BLOCK ?? hours(1),
});

export const leadStatsLimiter = rateLimiter({
  window: env.RL_BIZ_LEAD_STATS_WINDOW ?? minutes(5),
  limit: env.RL_BIZ_LEAD_STATS_LIMIT ?? 10,
  scope: 'user',
  routeSpecificLimit: true,
  blockDuration: env.RL_BIZ_LEAD_STATS_BLOCK ?? minutes(5),
});

export const campaignStatsLimiter = rateLimiter({
  window: env.RL_BIZ_CAMPAIGN_STATS_WINDOW ?? minutes(5),
  limit: env.RL_BIZ_CAMPAIGN_STATS_LIMIT ?? 10,
  scope: 'user',
  routeSpecificLimit: true,
  blockDuration: env.RL_BIZ_CAMPAIGN_STATS_BLOCK ?? minutes(5),
});
