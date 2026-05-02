import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger.js';
import { isProd } from '../config/env.js';

// Single Prisma client per process. Hot-reload safe.
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.__prisma__ ??
  new PrismaClient({
    log: isProd ? ['warn', 'error'] : ['warn', 'error'],
  });

if (!isProd) globalForPrisma.__prisma__ = prisma;

prisma.$on?.('error', (e) => logger.error({ err: e }, 'Prisma error'));
