import express from 'express';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import hpp from 'hpp';
import morgan from 'morgan';
import pinoHttp from 'pino-http';

import { env, isProd } from './config/env.js';
import { logger } from './config/logger.js';
import { prisma } from './db/prisma.js';

import { helmetMiddleware, extraSecurityHeaders } from './shared/middleware/securityHeaders.js';
import { corsMiddleware } from './shared/middleware/cors.js';
import { apiLimiter } from './shared/middleware/rateLimits.js';
import { attachUser } from './shared/middleware/auth.js';
import { errorHandler, notFoundHandler } from './shared/middleware/errorHandler.js';

import apiRoutes from './modules/index.js';
import swaggerSpec from './docs/swagger.js';
import swaggerUi from 'swagger-ui-express';

export const buildApp = () => {
  const app = express();

  // Needed when behind a reverse proxy (nginx, ALB) so req.ip works.
  if (env.TRUST_PROXY) app.set('trust proxy', 1);

  // Disable the X-Powered-By header (helmet also does this).
  app.disable('x-powered-by');

  // --- Security / headers --------------------------------------------------
  app.use(helmetMiddleware);
  app.use(extraSecurityHeaders);
  app.use(corsMiddleware);

  // --- Logging -------------------------------------------------------------
  app.use(
    pinoHttp({
      logger,
      autoLogging: { ignore: (req) => req.url === '/api/health' },
      customLogLevel: (_req, res, err) => {
        if (err || res.statusCode >= 500) return 'error';
        if (res.statusCode >= 400) return 'warn';
        return 'info';
      },
    })
  );
  if (!isProd) app.use(morgan('dev', { skip: (req) => req.url === '/api/health' }));

  // --- Parsers -------------------------------------------------------------
  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: true, limit: '100kb' }));
  app.use(cookieParser(env.COOKIE_SECRET));
  app.use(hpp()); // HTTP parameter pollution
  app.use(compression());

  // --- Identity ------------------------------------------------------------
  app.use(attachUser);

  // --- Health check (unrated, no auth) -------------------------------------
  app.get('/api/health', async (_req, res) => {
    const checks = {
      server: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      memory: {
        used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
      },
    };
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.database = 'healthy';
    } catch (err) {
      checks.database = 'unhealthy';
      checks.error = err.message;
    }
    const healthy = checks.database === 'healthy';
    res.status(healthy ? 200 : 503).json(checks);
  });

  // --- API -----------------------------------------------------------------
  app.use('/api', apiLimiter, apiRoutes);

  // --- Swagger (dev only) --------------------------------------------------
  if (!isProd) {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec));
  }

  // --- 404 + error handler -------------------------------------------------
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
