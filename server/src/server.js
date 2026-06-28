import { buildApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { prisma } from './db/prisma.js';
import redisClient from './db/redis.js';
import { startCronJobs, stopCronJobs } from './jobs/cron.js';

const app = buildApp();

const server = app.listen(env.PORT, async () => {
  logger.info(`🚀 Server listening on http://localhost:${env.PORT}`);
  await redisClient.connect();
  startCronJobs();
});

// Graceful shutdown — drain connections, close DB, stop crons.
const shutdown = async (signal) => {
  logger.info(`${signal} received — shutting down gracefully`);
  stopCronJobs();
  server.close(async () => {
    await prisma.$disconnect().catch(() => {});
    await redisClient.disconnect().catch(() => {});
    process.exit(0);
  });
  // Forcible exit if it takes too long.
  setTimeout(() => process.exit(1), 10_000).unref();
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Crash loudly on unexpected failures — don't leave the process in a bad state.
process.on('unhandledRejection', (reason) => {
  logger.fatal({ reason }, 'Unhandled rejection — exiting');
  process.exit(1);
});
process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught exception — exiting');
  process.exit(1);
});
// Feature update Sat Jun 27 16:15:07 UTC 2026
// Feature update Sat Jun 27 16:15:14 UTC 2026
