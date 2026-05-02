import helmet from 'helmet';

// Helmet — sane secure defaults. CSP is tightened for an API-only server.
export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'none'"],
      connectSrc: ["'self'"],
      frameAncestors: ["'none'"],
    },
  },
  crossOriginResourcePolicy: { policy: 'same-site' },
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  crossOriginEmbedderPolicy: false,
  referrerPolicy: { policy: 'no-referrer' },
  strictTransportSecurity: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  hidePoweredBy: true,
  frameguard: { action: 'deny' },
  noSniff: true,
});

// Extra headers helmet doesn't set.
export const extraSecurityHeaders = (_req, res, next) => {
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=()'
  );
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('Cache-Control', 'no-store');
  next();
};
