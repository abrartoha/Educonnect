import cron from 'node-cron';
import { prisma } from '../db/prisma.js';
import { logger } from '../config/logger.js';

// 1) Expire old refresh tokens — run at 02:10 every day.
const cleanupRefreshTokens = cron.schedule(
  '10 2 * * *',
  async () => {
    try {
      const { count } = await prisma.refreshToken.deleteMany({
        where: {
          OR: [
            { expiresAt: { lt: new Date() } },
            {
              revokedAt: {
                lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              },
            },
          ],
        },
      });
      logger.info({ count }, 'Cleaned up expired refresh tokens');
    } catch (err) {
      logger.error({ err }, 'Refresh token cleanup failed');
    }
  },
  { scheduled: false, timezone: 'Australia/Melbourne' }
);

// 2) Auto-end campaigns whose endDate has passed — every hour.
const endExpiredCampaigns = cron.schedule(
  '0 * * * *',
  async () => {
    try {
      const { count } = await prisma.campaign.updateMany({
        where: { status: 'ACTIVE', endDate: { lt: new Date() } },
        data: { status: 'ENDED' },
      });
      if (count > 0) logger.info({ count }, 'Expired campaigns moved to ENDED');
    } catch (err) {
      logger.error({ err }, 'Campaign expiry job failed');
    }
  },
  { scheduled: false, timezone: 'Australia/Melbourne' }
);

// 3) Mark bookings in the past as COMPLETED if they were CONFIRMED — every hour.
const completePastBookings = cron.schedule(
  '30 * * * *',
  async () => {
    try {
      const { count } = await prisma.booking.updateMany({
        where: {
          status: 'CONFIRMED',
          scheduledAt: { lt: new Date(Date.now() - 60 * 60 * 1000) },
        },
        data: { status: 'COMPLETED' },
      });
      if (count > 0) logger.info({ count }, 'Auto-completed past bookings');
    } catch (err) {
      logger.error({ err }, 'Booking completion job failed');
    }
  },
  { scheduled: false, timezone: 'Australia/Melbourne' }
);

export const startCronJobs = () => {
  cleanupRefreshTokens.start();
  endExpiredCampaigns.start();
  completePastBookings.start();
  logger.info('Cron jobs started');
};

export const stopCronJobs = () => {
  cleanupRefreshTokens.stop();
  endExpiredCampaigns.stop();
  completePastBookings.stop();
};
