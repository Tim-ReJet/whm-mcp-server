/**
 * Deployment API Server
 * Provides HTTP API for deployment operations
 */

import { createServer, IncomingMessage, ServerResponse } from 'http';
import { logger } from '../../observability/src/logging/logger.js';
import { traceRequest, traceAsync, endTrace } from '../../observability/src/tracing/utils.js';
import { DeploymentIntelligence } from './deployment-intelligence.js';
import { RollbackAutomation } from './rollback-automation.js';

export class DeploymentAPIServer {
  private server: ReturnType<typeof createServer> | null = null;
  private port: number;
  private deploymentIntelligence: DeploymentIntelligence;
  private rollbackAutomation: RollbackAutomation;

  constructor(config: { port?: number } = {}) {
    this.port = config.port || 3002;
    this.deploymentIntelligence = new DeploymentIntelligence();
    this.rollbackAutomation = new RollbackAutomation();
  }

  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = createServer((req, res) => this.handleRequest(req, res));

      this.server.listen(this.port, () => {
        logger.info('Deployment API server started', { port: this.port });
        resolve();
      });

      this.server.on('error', (error) => {
        logger.error('Deployment API server error', {}, error);
        reject(error);
      });
    });
  }

  stop(): void {
    if (this.server) {
      this.server.close();
      logger.info('Deployment API server stopped');
    }
  }

  private async handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    const method = req.method || 'GET';
    const pathname = url.pathname;

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    try {
      if (pathname === '/api/deployments' && method === 'GET') {
        await this.handleListDeployments(req, res);
      } else if (pathname === '/api/deployments' && method === 'POST') {
        await this.handleCreateDeployment(req, res);
      } else if (pathname.startsWith('/api/deployments/') && method === 'GET') {
        await this.handleGetDeployment(req, res, pathname);
      } else if (pathname.startsWith('/api/deployments/') && pathname.endsWith('/rollback') && method === 'POST') {
        await this.handleRollbackDeployment(req, res, pathname);
      } else if (pathname === '/api/deployments/queue' && method === 'GET') {
        await this.handleGetQueueStatus(req, res);
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
      }
    } catch (error: any) {
      logger.error('Deployment API error', { pathname, method }, error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  }

  private async handleListDeployments(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    const siteId = url.searchParams.get('siteId');
    const limit = parseInt(url.searchParams.get('limit') || '50');

    const traceContext = traceRequest('list-deployments', { siteId, limit });

    try {
      const deployments = siteId
        ? this.deploymentIntelligence.getSiteDeployments(siteId).slice(0, limit)
        : this.deploymentIntelligence.getAllDeployments().slice(0, limit);

      endTrace(traceContext.traceId, 'success');

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(deployments));
    } catch (error: any) {
      endTrace(traceContext.traceId, 'error');
      throw error;
    }
  }

  private async handleGetDeployment(req: IncomingMessage, res: ServerResponse, pathname: string): Promise<void> {
    const deploymentId = pathname.split('/')[3];

    const traceContext = traceRequest('get-deployment', { deploymentId });

    try {
      const deployment = this.deploymentIntelligence.getDeployment(deploymentId);

      if (!deployment) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Deployment not found' }));
        endTrace(traceContext.traceId, 'error');
        return;
      }

      endTrace(traceContext.traceId, 'success');

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(deployment));
    } catch (error: any) {
      endTrace(traceContext.traceId, 'error');
      throw error;
    }
  }

  private async handleCreateDeployment(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const body = await this.readBody(req);
    const data = JSON.parse(body);

    const traceContext = traceRequest('create-deployment', {
      siteId: data.siteId,
      environment: data.environment,
    });

    try {
      const deployment = await traceAsync('deployment-creation', async () => {
        return this.deploymentIntelligence.createDeployment(
          data.siteId,
          data.environment || 'production',
          data.metadata || {}
        );
      });

      endTrace(traceContext.traceId, 'success');

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(deployment));
    } catch (error: any) {
      endTrace(traceContext.traceId, 'error');
      throw error;
    }
  }

  private async handleRollbackDeployment(req: IncomingMessage, res: ServerResponse, pathname: string): Promise<void> {
    const deploymentId = pathname.split('/')[3];
    const body = await this.readBody(req);
    const data = JSON.parse(body);

    const traceContext = traceRequest('rollback-deployment', { deploymentId });

    try {
      const result = await traceAsync('deployment-rollback', async () => {
        return await this.rollbackAutomation.rollback(deploymentId, data.reason || 'Manual rollback');
      });

      endTrace(traceContext.traceId, 'success');

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    } catch (error: any) {
      endTrace(traceContext.traceId, 'error');
      throw error;
    }
  }

  private async handleGetQueueStatus(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const traceContext = traceRequest('get-queue-status');

    try {
      const status = this.deploymentIntelligence.getQueueStatus();

      endTrace(traceContext.traceId, 'success');

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(status));
    } catch (error: any) {
      endTrace(traceContext.traceId, 'error');
      throw error;
    }
  }

  private async readBody(req: IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
      });
      req.on('end', () => {
        resolve(body);
      });
      req.on('error', reject);
    });
  }
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  async function main() {
    const server = new DeploymentAPIServer({ port: 3002 });

    console.log('\n🚀 Starting Deployment API Server...\n');
    console.log('   Port: 3002');
    console.log('   Endpoints:');
    console.log('   - GET  /api/deployments');
    console.log('   - POST /api/deployments');
    console.log('   - GET  /api/deployments/:id');
    console.log('   - POST /api/deployments/:id/rollback');
    console.log('   - GET  /api/deployments/queue\n');

    await server.start();

    console.log('✅ Deployment API Server running at http://localhost:3002\n');
    console.log('Press Ctrl+C to stop\n');
  }

  main().catch((error) => {
    console.error('Failed to start Deployment API Server:', error);
    process.exit(1);
  });
}

export default DeploymentAPIServer;
