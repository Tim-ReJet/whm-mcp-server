/**
 * OpenAPI Specification Generator
 * Generates OpenAPI specs from code annotations
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
import { logger } from '../../observability/src/logging/logger.js';

export interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
  };
  servers: Array<{ url: string; description: string }>;
  paths: Record<string, any>;
  components: {
    schemas: Record<string, any>;
  };
}

export class OpenAPIGenerator {
  private spec: OpenAPISpec;

  constructor() {
    this.spec = {
      openapi: '3.1.0',
      info: {
        title: 'ReactorBro Stack API',
        version: '1.0.0',
        description: 'Complete API documentation for ReactorBro Stack',
      },
      servers: [
        {
          url: 'http://localhost:4321',
          description: 'Development server',
        },
        {
          url: 'https://api.reactorbro.com',
          description: 'Production server',
        },
      ],
      paths: {},
      components: {
        schemas: {},
      },
    };
  }

  /**
   * Generate OpenAPI spec from code
   */
  async generate(): Promise<OpenAPISpec> {
    logger.info('Generating OpenAPI specification');

    // Site Manager API
    this.addSiteManagerAPI();

    // Asset Manager API
    this.addAssetManagerAPI();

    // Agent System API
    this.addAgentSystemAPI();

    // Deployment API
    this.addDeploymentAPI();

    // Observability API
    this.addObservabilityAPI();

    return this.spec;
  }

  /**
   * Add Site Manager API endpoints
   */
  private addSiteManagerAPI(): void {
    this.spec.paths['/api/sites'] = {
      get: {
        summary: 'List all sites',
        description: 'Get a list of all configured sites',
        responses: {
          '200': {
            description: 'List of sites',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Site',
                  },
                },
              },
            },
          },
        },
      },
    };

    this.spec.paths['/api/sites/{siteId}'] = {
      get: {
        summary: 'Get site information',
        description: 'Get detailed information about a specific site',
        parameters: [
          {
            name: 'siteId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Site information',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Site',
                },
              },
            },
          },
        },
      },
    };

    this.spec.components.schemas.Site = {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
        domain: {
          type: 'object',
          properties: {
            production: { type: 'string' },
            staging: { type: 'string' },
          },
        },
        status: {
          type: 'string',
          enum: ['active', 'development', 'staging', 'archived'],
        },
      },
    };
  }

  /**
   * Add Asset Manager API endpoints
   */
  private addAssetManagerAPI(): void {
    this.spec.paths['/api/assets'] = {
      get: {
        summary: 'List assets',
        description: 'Get a list of assets',
        parameters: [
          {
            name: 'category',
            in: 'query',
            schema: { type: 'string' },
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 10 },
          },
        ],
        responses: {
          '200': {
            description: 'List of assets',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Asset',
                  },
                },
              },
            },
          },
        },
      },
    };

    this.spec.paths['/api/assets/search'] = {
      get: {
        summary: 'Search assets',
        description: 'Search for assets by query',
        parameters: [
          {
            name: 'q',
            in: 'query',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Search results',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/SearchResult',
                  },
                },
              },
            },
          },
        },
      },
    };

    this.spec.components.schemas.Asset = {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
        category: { type: 'string' },
        version: { type: 'string' },
        author: { type: 'string' },
        tags: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    };
  }

  /**
   * Add Agent System API endpoints
   */
  private addAgentSystemAPI(): void {
    this.spec.paths['/api/agents'] = {
      get: {
        summary: 'List agents',
        description: 'Get a list of available agents',
        responses: {
          '200': {
            description: 'List of agents',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Agent',
                  },
                },
              },
            },
          },
        },
      },
    };

    this.spec.paths['/api/agents/{agentId}/execute'] = {
      post: {
        summary: 'Execute agent',
        description: 'Execute an agent workflow',
        parameters: [
          {
            name: 'agentId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  context: { type: 'object' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Execution result',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ExecutionResult',
                },
              },
            },
          },
        },
      },
    };
  }

  /**
   * Add Deployment API endpoints
   */
  private addDeploymentAPI(): void {
    this.spec.paths['/api/deployments'] = {
      get: {
        summary: 'List deployments',
        description: 'Get deployment history',
        responses: {
          '200': {
            description: 'List of deployments',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Deployment',
                  },
                },
              },
            },
          },
        },
      },
    };
  }

  /**
   * Add Observability API endpoints
   */
  private addObservabilityAPI(): void {
    this.spec.paths['/api/metrics'] = {
      get: {
        summary: 'Get metrics',
        description: 'Get Prometheus-compatible metrics',
        responses: {
          '200': {
            description: 'Metrics in Prometheus format',
            content: {
              'text/plain': {
                schema: { type: 'string' },
              },
            },
          },
        },
      },
    };
  }

  /**
   * Save spec to file
   */
  async save(outputPath: string): Promise<void> {
    writeFileSync(outputPath, JSON.stringify(this.spec, null, 2));
    logger.info('OpenAPI spec saved', { path: outputPath });
  }
}

export default OpenAPIGenerator;

