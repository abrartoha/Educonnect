import cors from 'cors';
import { env } from '../../config/env.js';

const allowedOrigins = [env.CLIENT_URL];

export const corsMiddleware = cors({
  origin: (origin, cb) => {
    // Allow same-origin / server-to-server (no Origin header) and whitelist.
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  exposedHeaders: ['X-CSRF-Token'],
  maxAge: 86400,
});
