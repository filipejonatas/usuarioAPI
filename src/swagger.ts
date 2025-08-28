import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'User Management API',
      version: '1.0.0',
      description: 'API para gerenciamento de usuários com TypeScript, Express e Prisma',
      contact: {
        name: 'Desenvolvedor',
        email: 'dev@exemplo.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desenvolvimento',
      },
      {
        url: 'https://api.exemplo.com',
        description: 'Servidor de produção',
      }
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          required: ['Id', 'email', 'name', 'role'],
          properties: {
            Id: {
              type: 'integer',
              description: 'ID único do usuário (auto incremento)',
              example: 1
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email único do usuário',
              example: 'usuario@exemplo.com'
            },
            name: {
              type: 'string',
              description: 'Nome completo do usuário',
              example: 'João Silva'
            },
            role: {
              type: 'string',
              description: 'Função/papel do usuário no sistema',
              example: 'admin',
              enum: ['admin', 'user', 'moderator'] // ajuste conforme suas roles
            }
          }
        },
        CreateUser: {
          type: 'object',
          required: ['email', 'name', 'role'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Email único do usuário',
              example: 'novo@exemplo.com'
            },
            name: {
              type: 'string',
              description: 'Nome completo do usuário',
              example: 'Maria Santos'
            },
            role: {
              type: 'string',
              description: 'Função/papel do usuário no sistema',
              example: 'user',
              enum: ['admin', 'user', 'moderator']
            }
          }
        },
        UpdateUser: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Email único do usuário',
              example: 'atualizado@exemplo.com'
            },
            name: {
              type: 'string',
              description: 'Nome completo do usuário',
              example: 'João Silva Atualizado'
            },
            role: {
              type: 'string',
              description: 'Função/papel do usuário no sistema',
              example: 'moderator',
              enum: ['admin', 'user', 'moderator']
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Mensagem de erro',
              example: 'Erro interno do servidor'
            },
            error: {
              type: 'string',
              description: 'Detalhes técnicos do erro',
              example: 'Database connection failed'
            }
          }
        }
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    tags: [
      {
        name: 'Users',
        description: 'Operações relacionadas aos usuários'
      }
    ]
  },
  apis: ['./src/routes/*.ts'], // caminho para seus arquivos de rotas
};

const specs = swaggerJSDoc(options);

export { specs, swaggerUi };