export const authSchemas = {
  SignupRequestBase: {
    type: 'object',
    required: ['email', 'password', 'name', 'role'],
    properties: {
      email: { type: 'string', format: 'email', maxLength: 254 },
      password: {
        type: 'string',
        minLength: 8,
        maxLength: 128,
        description: 'Must contain uppercase, lowercase, and digit',
      },
      name: { type: 'string', minLength: 2, maxLength: 120 },
      role: {
        type: 'string',
        enum: ['UNIVERSITY', 'AGENT', 'CONSULTANT', 'STUDENT'],
      },
    },
  },
  UniversitySignup: {
    allOf: [
      { $ref: '#/components/schemas/SignupRequestBase' },
      {
        type: 'object',
        properties: {
          shortName: { type: 'string', maxLength: 40 },
          location: { type: 'string', maxLength: 120 },
          type: { type: 'string', maxLength: 60 },
          description: { type: 'string', maxLength: 2000 },
          website: { type: 'string', format: 'uri', maxLength: 200 },
          phone: { type: 'string', maxLength: 40 },
        },
      },
    ],
  },
  AgentSignup: {
    allOf: [
      { $ref: '#/components/schemas/SignupRequestBase' },
      {
        type: 'object',
        properties: {
          contactPerson: { type: 'string', maxLength: 120 },
          phone: { type: 'string', maxLength: 40 },
          location: { type: 'string', maxLength: 120 },
          description: { type: 'string', maxLength: 2000 },
          maraNumber: { type: 'string', maxLength: 20 },
          yearsExperience: { type: 'integer', minimum: 0, maximum: 80 },
        },
      },
    ],
  },
  ConsultantSignup: {
    allOf: [
      { $ref: '#/components/schemas/SignupRequestBase' },
      {
        type: 'object',
        properties: {
          phone: { type: 'string', maxLength: 40 },
          location: { type: 'string', maxLength: 120 },
          description: { type: 'string', maxLength: 2000 },
          yearsExperience: { type: 'integer', minimum: 0, maximum: 80 },
          hourlyRate: { type: 'integer', minimum: 0, maximum: 10000 },
        },
      },
    ],
  },
  StudentSignup: {
    allOf: [
      { $ref: '#/components/schemas/SignupRequestBase' },
      {
        type: 'object',
        properties: {
          phone: { type: 'string', maxLength: 40 },
          nationality: { type: 'string', maxLength: 80 },
          currentEducation: { type: 'string', maxLength: 120 },
          interestedIn: { type: 'array', items: { type: 'string' }, maxItems: 20 },
          preferredLocations: { type: 'array', items: { type: 'string' }, maxItems: 20 },
          budgetMin: { type: 'integer', minimum: 0 },
          budgetMax: { type: 'integer', minimum: 0 },
        },
      },
    ],
  },
  LoginRequest: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email', maxLength: 254 },
      password: { type: 'string', minLength: 1, maxLength: 128 },
    },
  },
  Tokens: {
    type: 'object',
    properties: {
      accessToken: { type: 'string' },
      refreshToken: { type: 'string' },
    },
  },
  PublicUser: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      email: { type: 'string' },
      name: { type: 'string' },
      role: { type: 'string', enum: ['UNIVERSITY', 'AGENT', 'CONSULTANT', 'STUDENT'] },
      status: { type: 'string' },
      avatarUrl: { type: 'string', nullable: true },
    },
  },
  SignupResponse: {
    type: 'object',
    properties: {
      user: { $ref: '#/components/schemas/PublicUser' },
      tokens: { $ref: '#/components/schemas/Tokens' },
    },
  },
  LoginResponse: {
    type: 'object',
    properties: {
      user: { $ref: '#/components/schemas/PublicUser' },
      tokens: { $ref: '#/components/schemas/Tokens' },
    },
  },
  RefreshResponse: {
    type: 'object',
    properties: {
      user: { $ref: '#/components/schemas/PublicUser' },
      tokens: { $ref: '#/components/schemas/Tokens' },
    },
  },
  LogoutResponse: {
    type: 'object',
    properties: {
      ok: { type: 'boolean', example: true },
    },
  },
  MeResponse: {
    type: 'object',
    properties: {
      user: { $ref: '#/components/schemas/PublicUser', nullable: true },
    },
  },
  CsrfResponse: {
    type: 'object',
    properties: {
      csrfToken: { type: 'string' },
    },
  },
};