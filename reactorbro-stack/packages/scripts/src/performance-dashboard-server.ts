/**
 * Performance Dashboard API Server
 * Serves performance metrics and monitoring data
 */

import { createServer, IncomingMessage, ServerResponse } from 'http';
import { PerformanceMonitor } from './performance-monitor.js';
import { logger } from '@repo/observability';

export class PerformanceDashboardServer {
  private server: any;
  private port: number;
  private monitor: PerformanceMonitor;

  constructor(port: number = 3003, monitor?: PerformanceMonitor) {
    this.port = port;
    this.monitor = monitor || new PerformanceMonitor();
  }

  start(): Promise<void> {
    return new Promise((resolve) => {
      this.server = createServer((req, res) => {
        this.handleRequest(req, res);
      });

      this.server.listen(this.port, () => {
        logger.info('Performance dashboard server started', { port: this.port });
        resolve();
      });
    });
  }

  stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          logger.info('Performance dashboard server stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  private async handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    const path = url.pathname;

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    try {
      if (path === '/api/metrics') {
        await this.handleGetMetrics(req, res);
      } else if (path === '/api/alerts') {
        await this.handleGetAlerts(req, res);
      } else if (path === '/api/history') {
        await this.handleGetHistory(req, res);
      } else if (path === '/api/trends') {
        await this.handleGetTrends(req, res, url);
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
      }
    } catch (error) {
      logger.error('Performance dashboard error', {}, error as Error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }

  private async handleGetMetrics(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const metrics = this.monitor.getMetrics();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(metrics));
  }

  private async handleGetAlerts(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const limit = parseInt(new URL(req.url || '/', `http://${req.headers.host}`).searchParams.get('limit') || '10');
    const alerts = this.monitor.getAlerts(limit);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(alerts));
  }

  private async handleGetHistory(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const limit = parseInt(new URL(req.url || '/', `http://${req.headers.host}`).searchParams.get('limit') || '100');
    const history = this.monitor.getExecutionHistory(limit);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(history));
  }

  private async handleGetTrends(req: IncomingMessage, res: ServerResponse, url: URL): Promise<void> {
    const timeWindow = parseInt(url.searchParams.get('timeWindow') || '3600000');
    const trends = this.monitor.getTrends(timeWindow);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(trends));
  }
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  const port = parseInt(process.argv[2]) || 3003;
  const server = new PerformanceDashboardServer(port);

  server.start().catch((error) => {
    console.error('Failed to start performance dashboard:', error);
    process.exit(1);
  });

  process.on('SIGINT', async () => {
    await server.stop();
    process.exit(0);
  });
}

