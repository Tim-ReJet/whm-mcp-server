/**
 * Development Dashboard Server
 * Provides a web interface for monitoring and managing the ReactorBro Stack
 */

import { createServer, IncomingMessage, ServerResponse } from 'http';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../observability/src/logging/logger.js';
import { metricsRegistry } from '../observability/src/metrics/metrics.js';
import { performanceMonitor } from '../observability/src/performance/monitor.js';
import { SiteManager } from './site-manager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface DashboardConfig {
  port?: number;
  host?: string;
}

export class DashboardServer {
  private server: ReturnType<typeof createServer> | null = null;
  private port: number;
  private host: string;
  private siteManager: SiteManager;

  constructor(config: DashboardConfig = {}) {
    this.port = config.port || 3000;
    this.host = config.host || 'localhost';
    this.siteManager = new SiteManager();
  }

  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = createServer((req, res) => this.handleRequest(req, res));

      this.server.listen(this.port, this.host, () => {
        logger.info('Development dashboard started', {
          port: this.port,
          host: this.host,
          url: `http://${this.host}:${this.port}`,
        });
        resolve();
      });

      this.server.on('error', (error) => {
        logger.error('Dashboard server error', {}, error);
        reject(error);
      });
    });
  }

  stop(): void {
    if (this.server) {
      this.server.close();
      logger.info('Development dashboard stopped');
    }
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
      // API endpoints
      if (path.startsWith('/api/')) {
        await this.handleAPI(req, res, path);
        return;
      }

      // Static files
      if (path === '/' || path === '/index.html') {
        this.serveHTML(res);
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
    } catch (error) {
      logger.error('Dashboard request error', { path }, error as Error);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Internal Server Error' }));
    }
  }

  private getSitesList(): any[] {
    try {
      // Access private method via reflection or make it public
      const sites = (this.siteManager as any).listSites();
      const activeSite = (this.siteManager as any).getActiveSite();

      return sites.map((siteId: string) => {
        try {
          const config = (this.siteManager as any).loadSiteConfig(siteId);
          return {
            id: siteId,
            name: config.name,
            status: config.status || 'development',
            domain: config.domain.production,
            isActive: siteId === activeSite,
          };
        } catch {
          return {
            id: siteId,
            name: siteId,
            status: 'unknown',
            isActive: false,
          };
        }
      });
    } catch {
      return [];
    }
  }

  private getActiveSite(): string | null {
    try {
      return (this.siteManager as any).getActiveSite();
    } catch {
      return null;
    }
  }

  private async handleAPI(req: IncomingMessage, res: ServerResponse, path: string): Promise<void> {
    res.setHeader('Content-Type', 'application/json');

    if (path === '/api/metrics') {
      const metrics = metricsRegistry.getAllMetrics();
      res.writeHead(200);
      res.end(JSON.stringify(metrics));
      return;
    }

    if (path === '/api/metrics/prometheus') {
      const prometheus = metricsRegistry.exportPrometheus();
      res.setHeader('Content-Type', 'text/plain');
      res.writeHead(200);
      res.end(prometheus);
      return;
    }

    if (path === '/api/performance') {
      const trends = performanceMonitor.getTrends();
      const alerts = performanceMonitor.getAlerts();
      const current = performanceMonitor.getCurrentMetrics();
      res.writeHead(200);
      res.end(JSON.stringify({ trends, alerts, current }));
      return;
    }

    if (path === '/api/sites') {
      const sites = this.getSitesList();
      res.writeHead(200);
      res.end(JSON.stringify({ sites }));
      return;
    }

    if (path === '/api/sites/active') {
      const active = this.getActiveSite();
      res.writeHead(200);
      res.end(JSON.stringify({ active }));
      return;
    }

    if (path === '/api/health') {
      res.writeHead(200);
      res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
      return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not Found' }));
  }

  private serveHTML(res: ServerResponse): void {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ReactorBro Stack - Development Dashboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: #0a0a0a;
      color: #e0e0e0;
      line-height: 1.6;
    }
    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
    }
    header {
      border-bottom: 1px solid #333;
      padding-bottom: 1rem;
      margin-bottom: 2rem;
    }
    h1 {
      font-size: 2rem;
      color: #fff;
      margin-bottom: 0.5rem;
    }
    .subtitle {
      color: #888;
      font-size: 0.9rem;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    .card {
      background: #1a1a1a;
      border: 1px solid #333;
      border-radius: 8px;
      padding: 1.5rem;
    }
    .card h2 {
      font-size: 1.2rem;
      margin-bottom: 1rem;
      color: #fff;
      border-bottom: 1px solid #333;
      padding-bottom: 0.5rem;
    }
    .metric {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      border-bottom: 1px solid #222;
    }
    .metric:last-child {
      border-bottom: none;
    }
    .metric-label {
      color: #aaa;
    }
    .metric-value {
      color: #fff;
      font-weight: 600;
    }
    .status {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
      font-size: 0.85rem;
      font-weight: 600;
    }
    .status.success { background: #22c55e; color: #000; }
    .status.warning { background: #eab308; color: #000; }
    .status.error { background: #ef4444; color: #fff; }
    .alert {
      padding: 0.75rem;
      margin: 0.5rem 0;
      border-radius: 4px;
      border-left: 3px solid;
    }
    .alert.error {
      background: #2a1a1a;
      border-color: #ef4444;
      color: #ff6b6b;
    }
    .alert.warning {
      background: #2a2a1a;
      border-color: #eab308;
      color: #ffd93d;
    }
    .refresh-btn {
      background: #3b82f6;
      color: #fff;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
      margin-top: 1rem;
    }
    .refresh-btn:hover {
      background: #2563eb;
    }
    .loading {
      color: #888;
      font-style: italic;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🚀 ReactorBro Stack</h1>
      <p class="subtitle">Development Dashboard</p>
    </header>

    <div class="grid">
      <div class="card">
        <h2>📊 Build Metrics</h2>
        <div id="build-metrics" class="loading">Loading...</div>
      </div>

      <div class="card">
        <h2>🤖 Agent Metrics</h2>
        <div id="agent-metrics" class="loading">Loading...</div>
      </div>

      <div class="card">
        <h2>⚡ Performance</h2>
        <div id="performance" class="loading">Loading...</div>
      </div>

      <div class="card">
        <h2>🚨 Alerts</h2>
        <div id="alerts" class="loading">Loading...</div>
      </div>

      <div class="card">
        <h2>🌐 Sites</h2>
        <div id="sites" class="loading">Loading...</div>
      </div>

      <div class="card">
        <h2>💚 System Health</h2>
        <div id="health" class="loading">Loading...</div>
      </div>
    </div>

    <button class="refresh-btn" onclick="refreshAll()">🔄 Refresh All</button>
  </div>

  <script>
    async function fetchAPI(endpoint) {
      const res = await fetch(endpoint);
      return res.json();
    }

    async function updateBuildMetrics() {
      try {
        const metrics = await fetchAPI('/api/metrics');
        const buildMetrics = metrics.gauges.find(m => m.name === 'build_size_bytes') || {};
        const buildDuration = metrics.histograms.find(m => m.name === 'build_duration_seconds') || {};
        const buildSuccess = metrics.counters.find(m => m.name === 'build_success_total') || {};
        const buildFailure = metrics.counters.find(m => m.name === 'build_failure_total') || {};

        const html = \`
          <div class="metric">
            <span class="metric-label">Build Size</span>
            <span class="metric-value">\${(buildMetrics.value / 1024).toFixed(2)} KB</span>
          </div>
          <div class="metric">
            <span class="metric-label">Build Duration</span>
            <span class="metric-value">\${buildDuration.count > 0 ? (buildDuration.sum / buildDuration.count).toFixed(2) : '0'}s</span>
          </div>
          <div class="metric">
            <span class="metric-label">Success</span>
            <span class="metric-value">\${buildSuccess.value || 0}</span>
          </div>
          <div class="metric">
            <span class="metric-label">Failures</span>
            <span class="metric-value">\${buildFailure.value || 0}</span>
          </div>
        \`;
        document.getElementById('build-metrics').innerHTML = html;
      } catch (error) {
        document.getElementById('build-metrics').innerHTML = '<div class="alert error">Failed to load</div>';
      }
    }

    async function updateAgentMetrics() {
      try {
        const metrics = await fetchAPI('/api/metrics');
        const tokenUsage = metrics.counters.find(m => m.name === 'agent_tokens_total') || {};
        const workflowSuccess = metrics.counters.find(m => m.name === 'agent_workflow_success_total') || {};
        const workflowFailure = metrics.counters.find(m => m.name === 'agent_workflow_failure_total') || {};
        const workflowDuration = metrics.histograms.find(m => m.name === 'agent_workflow_duration_seconds') || {};

        const html = \`
          <div class="metric">
            <span class="metric-label">Tokens Used</span>
            <span class="metric-value">\${tokenUsage.value || 0}</span>
          </div>
          <div class="metric">
            <span class="metric-label">Workflows Success</span>
            <span class="metric-value">\${workflowSuccess.value || 0}</span>
          </div>
          <div class="metric">
            <span class="metric-label">Workflows Failed</span>
            <span class="metric-value">\${workflowFailure.value || 0}</span>
          </div>
          <div class="metric">
            <span class="metric-label">Avg Duration</span>
            <span class="metric-value">\${workflowDuration.count > 0 ? (workflowDuration.sum / workflowDuration.count).toFixed(2) : '0'}s</span>
          </div>
        \`;
        document.getElementById('agent-metrics').innerHTML = html;
      } catch (error) {
        document.getElementById('agent-metrics').innerHTML = '<div class="alert error">Failed to load</div>';
      }
    }

    async function updatePerformance() {
      try {
        const perf = await fetchAPI('/api/performance');
        const trends = perf.trends || {};
        const current = perf.current || { coreWebVitals: {}, bundleMetrics: {}, buildMetrics: {} };

        const html = \`
          <div class="metric">
            <span class="metric-label">LCP</span>
            <span class="metric-value">\${current.coreWebVitals.lcp?.toFixed(2) || '0'}s</span>
          </div>
          <div class="metric">
            <span class="metric-label">Bundle Size</span>
            <span class="metric-value">\${current.bundleMetrics.totalSize ? (current.bundleMetrics.totalSize / 1024).toFixed(2) : '0'} KB</span>
          </div>
          <div class="metric">
            <span class="metric-label">Build Duration</span>
            <span class="metric-value">\${current.buildMetrics.duration ? (current.buildMetrics.duration / 1000).toFixed(2) : '0'}s</span>
          </div>
        \`;
        document.getElementById('performance').innerHTML = html;
      } catch (error) {
        document.getElementById('performance').innerHTML = '<div class="alert error">Failed to load</div>';
      }
    }

    async function updateAlerts() {
      try {
        const perf = await fetchAPI('/api/performance');
        const alerts = perf.alerts || [];

        if (alerts.length === 0) {
          document.getElementById('alerts').innerHTML = '<div style="color: #22c55e;">✅ No alerts</div>';
          return;
        }

        const html = alerts.slice(-5).map(alert => \`
          <div class="alert \${alert.severity}">
            <strong>\${alert.type}</strong>: \${alert.message}
          </div>
        \`).join('');
        document.getElementById('alerts').innerHTML = html;
      } catch (error) {
        document.getElementById('alerts').innerHTML = '<div class="alert error">Failed to load</div>';
      }
    }

    async function updateSites() {
      try {
        const data = await fetchAPI('/api/sites');
        const sites = data.sites || [];

        if (sites.length === 0) {
          document.getElementById('sites').innerHTML = '<div style="color: #888;">No sites found</div>';
          return;
        }

        const html = sites.map(site => \`
          <div class="metric">
            <span class="metric-label">\${site.name || site.id}</span>
            <span class="metric-value">\${site.status || 'development'}</span>
          </div>
        \`).join('');
        document.getElementById('sites').innerHTML = html;
      } catch (error) {
        document.getElementById('sites').innerHTML = '<div class="alert error">Failed to load</div>';
      }
    }

    async function updateHealth() {
      try {
        const health = await fetchAPI('/api/health');
        const html = \`
          <div class="metric">
            <span class="metric-label">Status</span>
            <span class="status success">\${health.status}</span>
          </div>
          <div class="metric">
            <span class="metric-label">Uptime</span>
            <span class="metric-value">Running</span>
          </div>
        \`;
        document.getElementById('health').innerHTML = html;
      } catch (error) {
        document.getElementById('health').innerHTML = '<div class="alert error">Failed to load</div>';
      }
    }

    async function refreshAll() {
      await Promise.all([
        updateBuildMetrics(),
        updateAgentMetrics(),
        updatePerformance(),
        updateAlerts(),
        updateSites(),
        updateHealth(),
      ]);
    }

    // Initial load
    refreshAll();

    // Auto-refresh every 5 seconds
    setInterval(refreshAll, 5000);
  </script>
</body>
</html>`;

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }
}

/**
 * Start dashboard server
 */
export async function startDashboard(config: DashboardConfig = {}): Promise<void> {
  const dashboard = new DashboardServer(config);
  await dashboard.start();
  return dashboard as any;
}

export default DashboardServer;

