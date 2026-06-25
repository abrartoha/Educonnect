export const sharedSchemas = {
  ErrorResponse: {
    type: 'object',
    properties: {
      error: {
        type: 'object',
        properties: {
          code: { type: 'string' },
          message: { type: 'string' },
          details: {
            type: 'object',
            properties: {
              issues: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    path: { type: 'string' },
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  RateLimitError: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      message: { type: 'string', example: 'Too many requests, please try again later' },
    },
  },
};

export const sharedParameters = {
  CsrfHeader: {
    name: 'X-CSRF-Token',
    in: 'header',
    required: true,
    schema: {
      type: 'string',
    },
    description: 'CSRF token required for web clients. Get token from GET /auth/csrf',
  },
  AcceptHeader: {
    name: 'Accept',
    in: 'header',
    schema: {
      type: 'string',
      enum: ['application/json'],
    },
    description: 'API accepts application/json only',
    example: 'application/json',
  },
  ContentTypeHeader: {
    name: 'Content-Type',
    in: 'header',
    schema: {
      type: 'string',
      enum: ['application/json'],
    },
    description: 'Content-Type for request body',
    example: 'application/json',
  },
  UserAgentHeader: {
    name: 'User-Agent',
    in: 'header',
    schema: {
      type: 'string',
    },
    description: 'Client application identifier (helps with token tracking)',
    example: 'EduConnect-Web/1.0',
  },
  PaginationPage: {
    name: 'page',
    in: 'query',
    schema: {
      type: 'integer',
      minimum: 1,
      default: 1,
    },
    description: 'Page number for pagination (default: 1)',
    example: 1,
  },
  PaginationLimit: {
    name: 'limit',
    in: 'query',
    schema: {
      type: 'integer',
      minimum: 1,
      maximum: 60,
      default: 20,
    },
    description: 'Items per page, max 60 (default: 20)',
    example: 20,
  },
  SearchQuery: {
    name: 'q',
    in: 'query',
    schema: {
      type: 'string',
      maxLength: 200,
    },
    description: 'Search/filter query string',
    example: 'top-ranked',
  },
  SortParam: {
    name: 'sort',
    in: 'query',
    schema: {
      type: 'string',
      enum: ['rating', 'name', 'newest'],
      default: 'rating',
    },
    description: 'Sort results by field',
    example: 'rating',
  },
};

export const sharedHeaders = {
  RateLimitLimit: {
    schema: {
      type: 'integer',
    },
    description: 'Maximum number of requests allowed in the time window',
    example: 100,
  },
  RateLimitRemaining: {
    schema: {
      type: 'integer',
    },
    description: 'Remaining requests in the current time window',
    example: 95,
  },
  RateLimitReset: {
    schema: {
      type: 'integer',
    },
    description: 'Unix timestamp when the rate limit resets',
    example: 1640000000,
  },
};