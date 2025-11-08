/**
 * Workflow API Server
 * Provides HTTP API for workflow operations
 */

import { createServer, IncomingMessage, ServerResponse } from 'http';
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../../observability/src/logging/logger.js';
import { WorkflowEngine } from '../../../agents/core/workflow-engine.js';
import { WorkflowLoader } from '../../../agents/core/workflow-loader.js';
import { AgentOrchestrator } from '../../../agents/core/orchestrator.js';
import { traceRequest, endTrace } from '../../observability/src/tracing/utils.js';
import { tracer } from '../../observability/src/tracing/tracer.js';
import type { Workflow, Context } from '../../../agents/core/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

export class WorkflowAPIServer {
  private server: ReturnType<typeof createServer> | null = null;
  private port: number;
  private workflowEngine: WorkflowEngine;
  private workflowLoader: WorkflowLoader;
  private orchestrator: AgentOrchestrator;
  private workflowsDir: string;

  constructor(config: { port?: number; workflowsDir?: string } = {}) {
    this.port = config.port || 3001;
    this.workflowsDir = config.workflowsDir || join(process.cwd(), 'agents/workflows');
    this.workflowEngine = new WorkflowEngine();
    this.workflowLoader = new WorkflowLoader();
    this.orchestrator = new AgentOrchestrator();
    this.workflowEngine.setOrchestrator(this.orchestrator);
  }

  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = createServer((req, res) => this.handleRequest(req, res));

      this.server.listen(this.port, () => {
        logger.info('Workflow API server started', { port: this.port });
        resolve();
      });

      this.server.on('error', (error) => {
        logger.error('Workflow API server error', {}, error);
        reject(error);
      });
    });
  }

  stop(): void {
    if (this.server) {
      this.server.close();
      logger.info('Workflow API server stopped');
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
      if (pathname === '/api/workflows' && method === 'GET') {
        await this.handleListWorkflows(req, res);
      } else if (pathname === '/api/workflows' && method === 'POST') {
        await this.handleCreateWorkflow(req, res);
      } else if (pathname.startsWith('/api/workflows/') && method === 'GET') {
        await this.handleGetWorkflow(req, res, pathname);
      } else if (pathname.startsWith('/api/workflows/') && method === 'PUT') {
        await this.handleUpdateWorkflow(req, res, pathname);
      } else if (pathname.startsWith('/api/workflows/') && method === 'DELETE') {
        await this.handleDeleteWorkflow(req, res, pathname);
      } else if (pathname.startsWith('/api/workflows/') && pathname.endsWith('/execute') && method === 'POST') {
        await this.handleExecuteWorkflow(req, res, pathname);
      } else if (pathname.startsWith('/api/workflows/') && pathname.endsWith('/status') && method === 'GET') {
        await this.handleGetExecutionStatus(req, res, pathname);
      } else if (pathname.startsWith('/api/workflows/') && pathname.endsWith('/export') && method === 'GET') {
        await this.handleExportWorkflow(req, res, pathname);
      } else if (pathname === '/api/traces' && method === 'GET') {
        await this.handleListTraces(req, res);
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
      }
    } catch (error: any) {
      logger.error('Workflow API error', { pathname, method }, error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: error.message,
        path: pathname,
        method,
        suggestion: 'Check the API documentation or logs for more details'
      }));
    }
  }

  private async handleListWorkflows(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const workflows: Workflow[] = [];

    // Load workflows from directory
    if (existsSync(this.workflowsDir)) {
      const files = readdirSync(this.workflowsDir);
      for (const file of files) {
        if (file.endsWith('.yaml') || file.endsWith('.json')) {
          try {
            const workflow = await this.workflowLoader.loadFromYAML(
              join(this.workflowsDir, file)
            );
            workflows.push(workflow);
          } catch (error) {
            logger.warn('Failed to load workflow', { file }, error);
          }
        }
      }
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(workflows));
  }

  private async handleGetWorkflow(req: IncomingMessage, res: ServerResponse, pathname: string): Promise<void> {
    const workflowId = pathname.split('/')[3];
    const workflowPath = join(this.workflowsDir, `${workflowId}.yaml`);

    if (!existsSync(workflowPath)) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Workflow not found' }));
      return;
    }

    try {
      const workflow = await this.workflowLoader.loadFromYAML(workflowPath);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(workflow));
    } catch (error: any) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  }

  private async handleCreateWorkflow(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const body = await this.readBody(req);
    const workflow = JSON.parse(body) as Workflow;

    // Validate workflow
    const validation = this.workflowLoader.validateWorkflow(workflow);
    if (!validation.valid) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid workflow', details: validation.errors }));
      return;
    }

    // Save workflow
    const workflowPath = join(this.workflowsDir, `${workflow.id}.yaml`);
    writeFileSync(workflowPath, JSON.stringify(workflow, null, 2), 'utf-8');

    // Load into engine
    await this.workflowEngine.loadWorkflow(workflow);

    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(workflow));
  }

  private async handleUpdateWorkflow(req: IncomingMessage, res: ServerResponse, pathname: string): Promise<void> {
    const workflowId = pathname.split('/')[3];
    const body = await this.readBody(req);
    const workflow = JSON.parse(body) as Workflow;

    if (workflow.id !== workflowId) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Workflow ID mismatch' }));
      return;
    }

    // Validate workflow
    const validation = this.workflowLoader.validateWorkflow(workflow);
    if (!validation.valid) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid workflow', details: validation.errors }));
      return;
    }

    // Save workflow
    const workflowPath = join(this.workflowsDir, `${workflow.id}.yaml`);
    writeFileSync(workflowPath, JSON.stringify(workflow, null, 2), 'utf-8');

    // Reload into engine
    await this.workflowEngine.loadWorkflow(workflow);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(workflow));
  }

  private async handleDeleteWorkflow(req: IncomingMessage, res: ServerResponse, pathname: string): Promise<void> {
    const workflowId = pathname.split('/')[3];
    const workflowPath = join(this.workflowsDir, `${workflowId}.yaml`);

    if (!existsSync(workflowPath)) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Workflow not found' }));
      return;
    }

    // Delete file
    const { unlinkSync } = await import('fs');
    unlinkSync(workflowPath);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
  }

  private async handleExecuteWorkflow(req: IncomingMessage, res: ServerResponse, pathname: string): Promise<void> {
    const workflowId = pathname.split('/')[3];
    const body = await this.readBody(req);
    const context = JSON.parse(body) as Context;

    // Start trace
    const traceContext = traceRequest(`workflow-execution-${workflowId}`, {
      workflowId,
      contextKeys: Object.keys(context),
    });

    try {
      // Execute workflow
      const result = await this.workflowEngine.execute(workflowId, context);

      // End trace
      endTrace(traceContext.traceId, 'success');

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        result,
        traceId: traceContext.traceId,
      }));
    } catch (error: any) {
      // End trace with error
      endTrace(traceContext.traceId, 'error');

      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: error.message,
        traceId: traceContext.traceId,
      }));
    }
  }

  private async handleGetExecutionStatus(req: IncomingMessage, res: ServerResponse, pathname: string): Promise<void> {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    const executionId = url.searchParams.get('executionId');

    if (!executionId) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'executionId parameter required',
        suggestion: 'Include ?executionId=<id> in the URL',
        example: '/api/workflows/:id/status?executionId=exec-12345'
      }));
      return;
    }

    try {
      const status = await this.workflowEngine.getExecutionStatus(executionId);
      if (!status) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          error: 'Execution not found',
          executionId,
          suggestion: 'Check that the execution ID is correct and the workflow has been executed'
        }));
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(status));
    } catch (error: any) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: error.message,
        suggestion: 'Check workflow engine logs for details'
      }));
    }
  }

  private async handleExportWorkflow(req: IncomingMessage, res: ServerResponse, pathname: string): Promise<void> {
    const workflowId = pathname.split('/')[3];
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    const format = url.searchParams.get('format') || 'json';

    const workflowPath = join(this.workflowsDir, `${workflowId}.yaml`);

    if (!existsSync(workflowPath)) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Workflow not found',
        workflowId,
        suggestion: 'List available workflows: GET /api/workflows'
      }));
      return;
    }

    try {
      const workflow = await this.workflowLoader.loadFromYAML(workflowPath);

      if (format === 'yaml') {
        // For YAML export, we'll use JSON for now (YAML library can be added later)
        // Convert to YAML-like structure or use JSON
        res.writeHead(200, {
          'Content-Type': 'text/yaml',
          'Content-Disposition': `attachment; filename="${workflowId}.yaml"`
        });
        // Simple YAML-like output (can be enhanced with js-yaml library)
        const yamlString = JSON.stringify(workflow, null, 2)
          .replace(/^(\s+)"([^"]+)":/gm, '$1$2:')
          .replace(/^(\s+)([^":\s]+):/gm, '$1"$2":');
        res.end(yamlString);
      } else {
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${workflowId}.json"`
        });
        res.end(JSON.stringify(workflow, null, 2));
      }
    } catch (error: any) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: error.message,
        suggestion: 'Ensure the workflow file is valid YAML or JSON'
      }));
    }
  }

  private async handleListTraces(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    const limit = parseInt(url.searchParams.get('limit') || '50');

    try {
      const traces = tracer.getAllTraces(limit);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(traces));
    } catch (error: any) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
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
    const server = new WorkflowAPIServer({ port: 3001 });

    console.log('\n🚀 Starting Workflow API Server...\n');
    console.log('   Port: 3001');
    console.log('   Endpoints:');
    console.log('   - GET  /api/workflows');
    console.log('   - POST /api/workflows');
    console.log('   - GET  /api/workflows/:id');
    console.log('   - PUT  /api/workflows/:id');
    console.log('   - DELETE /api/workflows/:id');
    console.log('   - POST /api/workflows/:id/execute');
    console.log('   - GET  /api/workflows/:id/status');
    console.log('   - GET  /api/traces\n');

    await server.start();

    console.log('✅ Workflow API Server running at http://localhost:3001\n');
    console.log('Press Ctrl+C to stop\n');
  }

  main().catch((error) => {
    console.error('Failed to start Workflow API Server:', error);
    process.exit(1);
  });
}

export default WorkflowAPIServer;
