#!/usr/bin/env ts-node

/**
 * Observability CLI
 * Command-line interface for monitoring and metrics
 */

import { logger, LogLevel } from '../../packages/observability/src/logging/logger.js';
import { metricsRegistry, buildMetrics, agentMetrics, siteMetrics } from '../../packages/observability/src/metrics/metrics.js';
import { performanceMonitor } from '../../packages/observability/src/performance/monitor.js';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const command = process.argv[2];
const arg1 = process.argv[3];

async function main() {
  switch (command) {
    case 'logs':
      await showLogs(arg1);
      break;
    case 'metrics':
      await showMetrics(arg1);
      break;
    case 'performance':
      await showPerformance();
      break;
    case 'alerts':
      await showAlerts(arg1);
      break;
    case 'export':
      await exportMetrics(arg1);
      break;
    default:
      showHelp();
  }
}

async function showLogs(level?: string) {
  console.log('\n📋 Logs\n');

  if (level) {
    const logLevel = LogLevel[level.toUpperCase() as keyof typeof LogLevel];
    if (logLevel !== undefined) {
      logger.setLevel(logLevel);
      console.log(`  Log level set to: ${level.toUpperCase()}\n`);
    } else {
      console.error(`❌ Invalid log level: ${level}`);
      process.exit(1);
    }
  } else {
    console.log('  Current log level:', LogLevel[logger['level']]);
    console.log('');
    console.log('  Usage: pnpm observability logs <level>');
    console.log('  Levels: DEBUG, INFO, WARN, ERROR, FATAL\n');
  }
}

async function showMetrics(format?: string) {
  console.log('\n📊 Metrics\n');

  const allMetrics = metricsRegistry.getAllMetrics();

  if (format === 'prometheus') {
    console.log(metricsRegistry.exportPrometheus());
    return;
  }

  console.log('  Counters:');
  for (const counter of allMetrics.counters) {
    const labelStr = Object.keys(counter.labels).length > 0
      ? ` {${Object.entries(counter.labels).map(([k, v]) => `${k}=${v}`).join(', ')}}`
      : '';
    console.log(`    ${counter.name}${labelStr}: ${counter.value}`);
  }

  console.log('\n  Gauges:');
  for (const gauge of allMetrics.gauges) {
    const labelStr = Object.keys(gauge.labels).length > 0
      ? ` {${Object.entries(gauge.labels).map(([k, v]) => `${k}=${v}`).join(', ')}}`
      : '';
    console.log(`    ${gauge.name}${labelStr}: ${gauge.value}`);
  }

  console.log('\n  Histograms:');
  for (const histogram of allMetrics.histograms) {
    const labelStr = Object.keys(histogram.labels).length > 0
      ? ` {${Object.entries(histogram.labels).map(([k, v]) => `${k}=${v}`).join(', ')}}`
      : '';
    console.log(`    ${histogram.name}${labelStr}:`);
    console.log(`      Count: ${histogram.count}`);
    console.log(`      Sum: ${histogram.sum}`);
    if (histogram.count > 0) {
      console.log(`      Average: ${(histogram.sum / histogram.count).toFixed(2)}`);
    }
  }

  console.log('');
}

async function showPerformance() {
  console.log('\n⚡ Performance Metrics\n');

  const trends = performanceMonitor.getTrends();
  const alerts = performanceMonitor.getAlerts();
  const current = performanceMonitor.getCurrentMetrics();

  if (current) {
    console.log('  Core Web Vitals:');
    console.log(`    LCP: ${current.coreWebVitals.lcp.toFixed(2)}s (${trends.lcp.trend})`);
    console.log(`    FID: ${current.coreWebVitals.fid.toFixed(3)}s`);
    console.log(`    CLS: ${current.coreWebVitals.cls.toFixed(3)}`);
    console.log(`    FCP: ${current.coreWebVitals.fcp.toFixed(2)}s`);
    console.log(`    TTFB: ${current.coreWebVitals.ttfb.toFixed(2)}s`);

    console.log('\n  Bundle Metrics:');
    console.log(`    Total Size: ${(current.bundleMetrics.totalSize / 1024).toFixed(2)}KB`);
    console.log(`    Initial Size: ${(current.bundleMetrics.initialSize / 1024).toFixed(2)}KB`);
    console.log(`    Gzipped: ${(current.bundleMetrics.gzippedSize / 1024).toFixed(2)}KB`);
    console.log(`    Chunks: ${current.bundleMetrics.chunkCount}`);

    console.log('\n  Build Metrics:');
    console.log(`    Duration: ${(current.buildMetrics.duration / 1000).toFixed(2)}s`);
    console.log(`    Status: ${current.buildMetrics.success ? '✅ Success' : '❌ Failed'}`);
  } else {
    console.log('  No performance metrics recorded yet\n');
  }

  if (alerts.length > 0) {
    console.log(`\n  ⚠️  ${alerts.length} Alert(s):\n`);
    for (const alert of alerts.slice(-5)) {
      const icon = alert.severity === 'error' ? '❌' : '⚠️';
      console.log(`    ${icon} [${alert.severity.toUpperCase()}] ${alert.message}`);
      console.log(`      Metric: ${alert.metric}, Value: ${alert.value}, Threshold: ${alert.threshold}`);
    }
  } else {
    console.log('\n  ✅ No alerts\n');
  }
}

async function showAlerts(severity?: string) {
  console.log('\n🚨 Performance Alerts\n');

  const alerts = severity
    ? performanceMonitor.getAlerts(severity as 'warning' | 'error')
    : performanceMonitor.getAlerts();

  if (alerts.length === 0) {
    console.log('  ✅ No alerts\n');
    return;
  }

  console.log(`  Total Alerts: ${alerts.length}\n`);

  const errors = alerts.filter(a => a.severity === 'error');
  const warnings = alerts.filter(a => a.severity === 'warning');

  if (errors.length > 0) {
    console.log(`  ❌ Errors (${errors.length}):\n`);
    for (const alert of errors.slice(-10)) {
      console.log(`    ${alert.message}`);
      console.log(`      Metric: ${alert.metric}`);
      console.log(`      Value: ${alert.value}, Threshold: ${alert.threshold}`);
      console.log(`      Time: ${alert.timestamp.toISOString()}\n`);
    }
  }

  if (warnings.length > 0) {
    console.log(`  ⚠️  Warnings (${warnings.length}):\n`);
    for (const alert of warnings.slice(-10)) {
      console.log(`    ${alert.message}`);
      console.log(`      Metric: ${alert.metric}`);
      console.log(`      Value: ${alert.value}, Threshold: ${alert.threshold}`);
      console.log(`      Time: ${alert.timestamp.toISOString()}\n`);
    }
  }
}

async function exportMetrics(format: string = 'prometheus') {
  if (format === 'prometheus') {
    console.log(metricsRegistry.exportPrometheus());
  } else if (format === 'json') {
    const metrics = metricsRegistry.getAllMetrics();
    console.log(JSON.stringify(metrics, null, 2));
  } else {
    console.error(`❌ Unsupported format: ${format}`);
    console.log('  Supported formats: prometheus, json\n');
    process.exit(1);
  }
}

function showHelp() {
  console.log(`
Observability CLI

Usage:
  pnpm observability <command> [options]

Commands:
  logs [level]              Show/set log level (DEBUG, INFO, WARN, ERROR, FATAL)
  metrics [format]          Show metrics (prometheus, json)
  performance               Show performance metrics and trends
  alerts [severity]         Show performance alerts (warning, error)
  export [format]           Export metrics (prometheus, json)

Examples:
  pnpm observability logs DEBUG        # Set log level to DEBUG
  pnpm observability metrics           # Show all metrics
  pnpm observability metrics prometheus # Export Prometheus format
  pnpm observability performance       # Show performance dashboard
  pnpm observability alerts            # Show all alerts
  pnpm observability alerts error      # Show only errors

Metrics Available:
  • Build metrics (duration, success, size)
  • Agent metrics (tokens, workflows)
  • Site metrics (requests, errors, response time)
  • Performance metrics (Core Web Vitals)
`);
}

main().catch(console.error);

