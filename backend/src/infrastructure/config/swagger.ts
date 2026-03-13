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
        // ─── Investment / Asset schemas ───────────────────────────────────
        AddInvestmentBody: {
          type: 'object',
          required: ['type', 'name', 'symbol', 'purchasePrice', 'currentValue', 'quantity'],
          properties: {
            type: { type: 'string', enum: ['STOCK', 'BOND', 'MUTUAL_FUND'], example: 'STOCK' },
            name: { type: 'string', example: 'Bank Central Asia' },
            symbol: { type: 'string', example: 'BBCA' },
            purchasePrice: { type: 'number', example: 9500.00 },
            currentValue: { type: 'number', example: 10250.00 },
            quantity: { type: 'integer', example: 10 },
            currency: { type: 'string', example: 'IDR', default: 'IDR' },
          },
        },
        EditInvestmentBody: {
          type: 'object',
          properties: {
            currentValue: { type: 'number', example: 10500.00 },
            quantity: { type: 'integer', example: 15 },
          },
        },
        AssetData: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            type: { type: 'string', enum: ['STOCK', 'BOND', 'MUTUAL_FUND'] },
            name: { type: 'string', example: 'Bank Central Asia' },
            symbol: { type: 'string', example: 'BBCA' },
            purchasePrice: { type: 'number', example: 9500.00 },
            currentValue: { type: 'number', example: 10250.00 },
            currency: { type: 'string', example: 'IDR' },
            quantity: { type: 'integer', example: 10 },
            gainLossPercent: { type: 'number', example: 17.0 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        PortfolioSummary: {
          type: 'object',
          properties: {
            totalPurchaseValue: { type: 'number', example: 95000000 },
            totalCurrentValue: { type: 'number', example: 102500000 },
            totalGainLoss: { type: 'number', example: 7500000 },
            gainLossPercent: { type: 'number', example: 7.89 },
          },
        },
        // ─── Transaction schemas ──────────────────────────────────────────
        AddTransactionBody: {
          type: 'object',
          required: ['assetId', 'type', 'quantity', 'price'],
          properties: {
            assetId: { type: 'string', format: 'uuid', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
            type: { type: 'string', enum: ['BUY', 'SELL'], example: 'BUY' },
            quantity: { type: 'integer', example: 10 },
            price: { type: 'number', example: 9500.00 },
            currency: { type: 'string', example: 'IDR', default: 'IDR' },
            date: { type: 'string', format: 'date-time', example: '2026-03-13T10:00:00.000Z' },
          },
        },
        TransactionData: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            assetId: { type: 'string', format: 'uuid' },
            type: { type: 'string', enum: ['BUY', 'SELL'] },
            quantity: { type: 'integer', example: 10 },
            price: { type: 'number', example: 9500.00 },
            currency: { type: 'string', example: 'IDR' },
            totalValue: { type: 'number', example: 95000.00 },
            date: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        PortfolioData: {
          type: 'object',
          properties: {
            assets: {
              type: 'object',
              properties: {
                pagination: {
                  type: 'object',
                  properties: {
                    page: { type: 'integer', example: 1 },
                    limit: { type: 'integer', example: 10 },
                    total: { type: 'integer', example: 42 },
                  },
                },
                data: { type: 'array', items: { $ref: '#/components/schemas/AssetData' } },
              },
            },
            summary: { $ref: '#/components/schemas/PortfolioSummary' },
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
      // ─── Portfolio ───────────────────────────────────────────────────────
      '/portfolio': {
        get: {
          tags: ['Portfolio'],
          summary: 'Get portfolio summary + paginated holdings',
          description: 'Summary is always computed from all holdings. Only the assets list is paginated.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1, minimum: 1 }, description: 'Page number' },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10, minimum: 1, maximum: 100 }, description: 'Items per page' },
          ],
          responses: {
            200: {
              description: 'Portfolio fetched successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: { $ref: '#/components/schemas/PortfolioData' },
                      status: { type: 'string', enum: ['ok'], example: 'ok' },
                      code: { type: 'integer', example: 200 },
                    },
                  },
                },
              },
            },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } } },
          },
        },
      },
      // ─── Investments ─────────────────────────────────────────────────────
      '/investments': {
        get: {
          tags: ['Investments'],
          summary: 'List investments with pagination',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'page',
              in: 'query',
              schema: { type: 'integer', default: 1, minimum: 1 },
              description: 'Page number (1-based)',
            },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', default: 10, minimum: 1, maximum: 100 },
              description: 'Items per page',
            },
          ],
          responses: {
            200: {
              description: 'Paginated list of investments',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      pagination: {
                        type: 'object',
                        properties: {
                          page: { type: 'integer', example: 1 },
                          limit: { type: 'integer', example: 10 },
                          total: { type: 'integer', example: 42 },
                        },
                      },
                      data: { type: 'array', items: { $ref: '#/components/schemas/AssetData' } },
                      status: { type: 'string', enum: ['ok'], example: 'ok' },
                      code: { type: 'integer', example: 200 },
                    },
                  },
                },
              },
            },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } } },
          },
        },
        post: {
          tags: ['Investments'],
          summary: 'Add a new investment (asset)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AddInvestmentBody' },
              },
            },
          },
          responses: {
            201: {
              description: 'Investment created',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: { $ref: '#/components/schemas/AssetData' },
                      status: { type: 'string', enum: ['ok'], example: 'ok' },
                      code: { type: 'integer', example: 201 },
                    },
                  },
                },
              },
            },
            400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } } },
          },
        },
      },
      '/investments/{id}': {
        get: {
          tags: ['Investments'],
          summary: 'Get a single investment by ID',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
              description: 'Asset ID',
            },
          ],
          responses: {
            200: {
              description: 'Investment found',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: { $ref: '#/components/schemas/AssetData' },
                      status: { type: 'string', enum: ['ok'], example: 'ok' },
                      code: { type: 'integer', example: 200 },
                    },
                  },
                },
              },
            },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } } },
            404: { description: 'Asset not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } } },
          },
        },
        patch: {
          tags: ['Investments'],
          summary: 'Update current value or quantity of an investment',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
              description: 'Asset ID',
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/EditInvestmentBody' },
              },
            },
          },
          responses: {
            200: {
              description: 'Investment updated',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: { $ref: '#/components/schemas/AssetData' },
                      status: { type: 'string', enum: ['ok'], example: 'ok' },
                      code: { type: 'integer', example: 200 },
                    },
                  },
                },
              },
            },
            400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } } },
            403: { description: 'Ownership violation', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } } },
            404: { description: 'Asset not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } } },
          },
        },
        delete: {
          tags: ['Investments'],
          summary: 'Delete an investment',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
              description: 'Asset ID',
            },
          ],
          responses: {
            204: { description: 'Investment deleted' },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } } },
            403: { description: 'Ownership violation', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } } },
            404: { description: 'Asset not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } } },
          },
        },
      },
      // ─── Transactions ────────────────────────────────────────────────────
      '/transactions': {
        get: {
          tags: ['Transactions'],
          summary: 'List transaction history with pagination',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1, minimum: 1 }, description: 'Page number' },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10, minimum: 1, maximum: 100 }, description: 'Items per page' },
          ],
          responses: {
            200: {
              description: 'Paginated transaction history',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      pagination: {
                        type: 'object',
                        properties: {
                          page: { type: 'integer', example: 1 },
                          limit: { type: 'integer', example: 10 },
                          total: { type: 'integer', example: 25 },
                        },
                      },
                      data: { type: 'array', items: { $ref: '#/components/schemas/TransactionData' } },
                      status: { type: 'string', enum: ['ok'], example: 'ok' },
                      code: { type: 'integer', example: 200 },
                    },
                  },
                },
              },
            },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } } },
          },
        },
        post: {
          tags: ['Transactions'],
          summary: 'Record a new BUY or SELL transaction',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AddTransactionBody' },
              },
            },
          },
          responses: {
            201: {
              description: 'Transaction recorded',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: { $ref: '#/components/schemas/TransactionData' },
                      status: { type: 'string', enum: ['ok'], example: 'ok' },
                      code: { type: 'integer', example: 201 },
                    },
                  },
                },
              },
            },
            400: { description: 'Validation error or insufficient quantity for SELL', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } } },
            404: { description: 'Asset not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } } },
          },
        },
      },
      '/transactions/{id}': {
        delete: {
          tags: ['Transactions'],
          summary: 'Delete a transaction',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Transaction ID' },
          ],
          responses: {
            204: { description: 'Transaction deleted' },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } } },
            403: { description: 'Ownership violation', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } } },
            404: { description: 'Transaction not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } } },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
