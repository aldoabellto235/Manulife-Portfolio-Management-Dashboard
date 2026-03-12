import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Portfolio Management API',
      version: '1.0.0',
      description: 'REST API for the Portfolio Management Dashboard',
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: 'Local development',
      },
    ],
    components: {
      securitySchemes: {
        basicAuth: {
          type: 'http',
          scheme: 'basic',
          description: 'Required on public endpoints (register, login, health). Credentials: BASIC_AUTH_USER / BASIC_AUTH_PASSWORD from env.',
        },
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Required on protected endpoints. Pass the accessToken returned by login/register.',
        },
      },
      schemas: {
        // ─── Envelope schemas ───────────────────────────────────────────────
        ApiError: {
          type: 'object',
          properties: {
            data: { type: 'object', example: {} },
            status: { type: 'string', enum: ['error'], example: 'error' },
            code: { type: 'integer', example: 401 },
            error: {
              type: 'object',
              properties: {
                message: { type: 'string', example: 'INVALID_CREDENTIALS' },
              },
            },
          },
        },
        // ─── Request bodies ──────────────────────────────────────────────────
        RegisterBody: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            password: { type: 'string', minLength: 8, example: 'Str0ngP@ss' },
          },
        },
        LoginBody: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            password: { type: 'string', example: 'Str0ngP@ss' },
          },
        },
        // ─── Response data shapes ────────────────────────────────────────────
        AuthTokenData: {
          type: 'object',
          properties: {
            accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          },
        },
        MeData: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', example: 'a1b2c3d4-e5f6-...' },
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    paths: {
      '/health': {
        get: {
          tags: ['System'],
          summary: 'Health check',
          security: [{ basicAuth: [] }],
          responses: {
            200: {
              description: 'Server is running',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'ok' },
                      timestamp: { type: 'string', format: 'date-time' },
                    },
                  },
                },
              },
            },
            401: {
              description: 'Missing or invalid Basic Auth credentials',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiError' },
                },
              },
            },
          },
        },
      },
      '/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register a new user',
          security: [{ basicAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RegisterBody' },
              },
            },
          },
          responses: {
            201: {
              description: 'User registered — returns access token',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: { $ref: '#/components/schemas/AuthTokenData' },
                      status: { type: 'string', enum: ['ok'], example: 'ok' },
                      code: { type: 'integer', example: 201 },
                    },
                  },
                },
              },
            },
            400: {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiError' },
                },
              },
            },
            401: {
              description: 'Missing or invalid Basic Auth credentials',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiError' },
                },
              },
            },
            409: {
              description: 'Email already in use',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiError' },
                },
              },
            },
          },
        },
      },
      '/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login with email and password',
          security: [{ basicAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginBody' },
              },
            },
          },
          responses: {
            200: {
              description: 'Login successful — returns access token',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: { $ref: '#/components/schemas/AuthTokenData' },
                      status: { type: 'string', enum: ['ok'], example: 'ok' },
                      code: { type: 'integer', example: 200 },
                    },
                  },
                },
              },
            },
            400: {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiError' },
                },
              },
            },
            401: {
              description: 'Invalid credentials or missing Basic Auth',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiError' },
                },
              },
            },
          },
        },
      },
      '/auth/me': {
        get: {
          tags: ['Auth'],
          summary: 'Get current authenticated user',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Authenticated user info',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: { $ref: '#/components/schemas/MeData' },
                      status: { type: 'string', enum: ['ok'], example: 'ok' },
                      code: { type: 'integer', example: 200 },
                    },
                  },
                },
              },
            },
            401: {
              description: 'Missing or invalid Bearer token',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiError' },
                },
              },
            },
          },
        },
      },
      '/auth/logout': {
        post: {
          tags: ['Auth'],
          summary: 'Logout — client must discard the token',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Logged out successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'object',
                        properties: {
                          message: { type: 'string', example: 'Logged out successfully' },
                        },
                      },
                      status: { type: 'string', enum: ['ok'], example: 'ok' },
                      code: { type: 'integer', example: 200 },
                    },
                  },
                },
              },
            },
            401: {
              description: 'Missing or invalid Bearer token',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiError' },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
