import { buildApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { prisma } from './db/prisma.js';
import { startCronJobs, stopCronJobs } from './jobs/cron.js';
import {
  initMessagingGateway,
  closeMessagingGateway,
} from './modules/messaging/messaging.gateway.js';

const app = buildApp();

const server = app.listen(env.PORT, () => {
  logger.info(`🚀 Server listening on http://localhost:${env.PORT}`);
  startCronJobs();
});

// Attach Socket.io to the same HTTP server.
initMessagingGateway(server);

// Graceful shutdown — drain connections, close DB, stop crons.
const shutdown = async (signal) => {
  logger.info(`${signal} received — shutting down gracefully`);
  stopCronJobs();
  await closeMessagingGateway().catch(() => {});
  server.close(async () => {
    await prisma.$disconnect().catch(() => {});
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
