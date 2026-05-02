import { Prisma } from '@prisma/client';
import { logger } from '../../config/logger.js';
import { AppError } from '../utils/errors.js';
import { isProd } from '../../config/env.js';
import { invalidCsrfError } from './csrf.js';

export const notFoundHandler = (_req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, _next) => {
  // CSRF failures
  if (err === invalidCsrfError || err?.code === 'EBADCSRFTOKEN') {
    logger.warn({ ip: req.ip, url: req.originalUrl }, 'CSRF token invalid');
    return res
      .status(403)
      .json({ error: { code: 'CSRF_INVALID', message: 'Invalid CSRF token' } });
  }

  // Our typed errors
  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: { code: err.code, message: err.message, details: err.details },
    });
  }

  // Prisma — unique violation, not-found, etc.
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        error: {
          code: 'CONFLICT',
          message: `Duplicate value for ${err.meta?.target}`,
        },
      });
    }
    if (err.code === 'P2025') {
      return res
        .status(404)
        .json({ error: { code: 'NOT_FOUND', message: 'Resource not found' } });
    }
  }

  // Express CORS rejection
  if (err?.message?.startsWith('Origin ')) {
    return res
      .status(403)
      .json({ error: { code: 'CORS_BLOCKED', message: err.message } });
  }

  // Unknown — log full trace, return opaque message in prod.
  logger.error(
    {
      err,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userId: req.user?.id,
    },
    'Unhandled error'
  );

  res.status(500).json({
    error: {
      code: 'INTERNAL',
      message: isProd ? 'Internal server error' : err.message,
      ...(isProd ? {} : { stack: err.stack?.split('\n').slice(0, 6) }),
    },
  });
};
