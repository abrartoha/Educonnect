import swaggerJsdoc from 'swagger-jsdoc';
import { env } from '../config/env.js';

import { authSchemas } from './components/auth.components.js';
import { directorySchemas } from './components/directory.components.js';
import { postsSchemas } from './components/posts.components.js';
import { businessSchemas } from './components/business.components.js';
import { adminSchemas } from './components/admin.components.js';
import { sharedSchemas, sharedParameters, sharedHeaders } from './components/shared.components.js';

const mergedSchemas = {
  ...sharedSchemas,
  ...authSchemas,
  ...directorySchemas,
  ...postsSchemas,
  ...businessSchemas,
  ...adminSchemas,
};

const swaggerDefinition = {
  openapi: '3.1.0',
  tags: [
    { name: 'Auth', description: 'Authentication, session management, and CSRF tokens' },
    { name: 'Directory', description: 'Directory browsing and profile management' },
  ],
  info: {
    title: 'EduConnect API',
    version: '1.0.0',
    description: `API Documentation for EduConnect education marketplace.

## Base Headers
All requests should include these headers:
- \`Content-Type: application/json\` (for POST/PATCH requests)
- \`Accept: application/json\`
- \`User-Agent: <app-name/version>\` (recommended, helps with token tracking)

## Authentication Flow

### Web Clients (Browser)
1. Call \`GET /auth/csrf\` to obtain a CSRF token
2. The token is returned in response body and set as \`csrfToken\` cookie (HTTP-only)
3. For all mutating requests (POST/PATCH/DELETE), include header: \`X-CSRF-Token: <token>\`
4. Tokens are automatically rotated on each auth action

### Mobile / API Clients
- Use \`Authorization: Bearer <access_token>\` header instead
- No CSRF required for mobile clients

### Endpoints Requiring CSRF (Web)
- \`POST /auth/logout\`
- All PATCH and DELETE endpoints in directory, posts, business, admin modules

## Rate Limiting
- Auth endpoints: 5 requests/minute
- General API: 100 requests/minute
- Response headers include: \`X-RateLimit-Limit\`, \`X-RateLimit-Remaining\`, \`X-RateLimit-Reset\`

## Pagination
List endpoints support:
- \`page\`: Page number (default: 1)
- \`limit\`: Items per page, max 60 (default: 20)
- \`sort\`: Sort field (rating, name, newest)

Response includes pagination metadata: \`page\`, \`limit\`, \`total\`, \`pages\``,
  },
  servers: [
    {
      url: `http://localhost:${env.PORT || 5000}/api`,
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token for mobile/API clients',
      },
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'em_access',
        description:
          'HTTP-only signed cookie set automatically by the server on login (web clients). ' +
          'Cannot be used from Swagger UI — the server requires a cryptographically signed cookie ' +
          '(req.signedCookies), which Swagger UI cannot generate. For testing, use bearerAuth or log in via the /auth/login endpoint to automatically set the em_access cookie in the browser.',
      },
      csrfToken: {
        type: 'apiKey',
        in: 'header',
        name: 'X-CSRF-Token',
        description: 'CSRF token required for mutating requests (web only)',
      },
    },
    schemas: mergedSchemas,
    parameters: sharedParameters,
    headers: sharedHeaders,
  },
  security: [
    { bearerAuth: [] },
    { cookieAuth: [] },
    { csrfToken: [] },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./src/modules/**/*.routes.js', './src/modules/**/*.openapi.js'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;