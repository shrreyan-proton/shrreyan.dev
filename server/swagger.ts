import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'License Management API',
    version: '1.0.0',
    description: 'Complete API documentation for bot integration and license management system',
    contact: {
      name: 'Shrreyan Dev Support',
    },
  },
  servers: [
    {
      url: '/api',
      description: 'API Server',
    },
  ],
  components: {
    securitySchemes: {
      BotApiKey: {
        type: 'apiKey',
        in: 'header',
        name: 'x-api-key',
        description: 'Bot API Key for authentication (create in Settings)',
      },
      SessionAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'connect.sid',
        description: 'Session-based authentication (login required)',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          username: { type: 'string' },
          email: { type: 'string' },
          discordId: { type: 'string', nullable: true },
          discordUsername: { type: 'string', nullable: true },
          discordAvatar: { type: 'string', nullable: true },
          isAdmin: { type: 'boolean' },
          role: { type: 'string', enum: ['founder', 'admin', 'user'] },
        },
      },
      License: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          key: { type: 'string' },
          productName: { type: 'string' },
          userId: { type: 'string', nullable: true },
          guildId: { type: 'string', nullable: true },
          status: { type: 'string', enum: ['active', 'suspended', 'expired'] },
          expiresAt: { type: 'string', format: 'date-time' },
          activatedAt: { type: 'string', format: 'date-time', nullable: true },
          lastHeartbeat: { type: 'string', format: 'date-time', nullable: true },
          lastIpAddress: { type: 'string', nullable: true },
          activationCount: { type: 'integer' },
          productDownloadUrl: { type: 'string', nullable: true },
        },
      },
      BotApiKey: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          keyPrefix: { type: 'string' },
          isActive: { type: 'boolean' },
          lastUsedAt: { type: 'string', format: 'date-time', nullable: true },
          lastUsedIp: { type: 'string', nullable: true },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' },
        },
      },
    },
  },
  tags: [
    {
      name: 'Bot Integration',
      description: 'API endpoints for Discord bot license verification and activation',
    },
    {
      name: 'Authentication',
      description: 'User authentication and session management',
    },
    {
      name: 'Users',
      description: 'User management (Admin only)',
    },
    {
      name: 'Licenses',
      description: 'License management and operations',
    },
    {
      name: 'Configuration',
      description: 'System configuration (Admin only)',
    },
    {
      name: 'Bot API Keys',
      description: 'Manage bot API keys for authentication (Admin only)',
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./server/routes.ts', './server/bot-routes.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);
