# @repo/observability

Unified observability system for logging, metrics, and performance monitoring in the ReactorBro Stack.

## Features

- **Structured Logging** - JSON-formatted logs with multiple transports
- **Metrics Collection** - Prometheus-compatible metrics
- **Performance Monitoring** - Core Web Vitals and performance budgets
- **Alerts** - Automatic performance regression detection

## Installation

```bash
pnpm add @repo/observability
```

## Usage

### Logging

```typescript
import { logger } from '@repo/observability';

// Basic logging
logger.info('Application started');
logger.error('Something went wrong', { userId: 123 }, error);

// Create child logger with context
const requestLogger = logger.child({ requestId: 'req-123' });
requestLogger.info('Processing request');

// Set log level
logger.setLevel(LogLevel.DEBUG);
```

### Metrics

```typescript
import { metricsRegistry, buildMetrics, agentMetrics } from '@repo/observability';

// Use pre-registered metrics
buildMetrics.duration.observe(5.2); // Build took 5.2 seconds
buildMetrics.success.inc();

// Create custom metrics
const customCounter = metricsRegistry.createCounter(
  'custom_events_total',
  'Total custom events'
);
customCounter.inc();

// Export Prometheus format
const prometheusExport = metricsRegistry.exportPrometheus();
```

### Performance Monitoring

```typescript
import { performanceMonitor } from '@repo/observability';

// Record Core Web Vitals
performanceMonitor.recordCoreWebVitals({
  lcp: 2.1,  // Largest Contentful Paint
  fid: 0.08, // First Input Delay
  cls: 0.05, // Cumulative Layout Shift
  fcp: 1.2,  // First Contentful Paint
  ttfb: 0.4, // Time to First Byte
});

// Record bundle metrics
performanceMonitor.recordBundleMetrics({
  totalSize: 500 * 1024,
  initialSize: 200 * 1024,
  gzippedSize: 100 * 1024,
  chunkCount: 10,
});

// Record build metrics
performanceMonitor.recordBuildMetrics({
  duration: 45000,
  success: true,
  timestamp: new Date(),
});

// Get alerts
const alerts = performanceMonitor.getAlerts('error');
```

## CLI

```bash
# Show metrics
pnpm observability metrics

# Export Prometheus format
pnpm observability metrics prometheus

# Show performance dashboard
pnpm observability performance

# Show alerts
pnpm observability alerts

# Set log level
pnpm observability logs DEBUG
```

## Pre-registered Metrics

### Build Metrics
- `build_duration_seconds` - Build duration histogram
- `build_success_total` - Successful builds counter
- `build_failure_total` - Failed builds counter
- `build_size_bytes` - Build output size gauge

### Agent Metrics
- `agent_tokens_total` - Total tokens used
- `agent_workflow_duration_seconds` - Workflow execution duration
- `agent_workflow_success_total` - Successful workflows
- `agent_workflow_failure_total` - Failed workflows

### Site Metrics
- `site_requests_total` - Total site requests
- `site_errors_total` - Total site errors
- `site_response_time_seconds` - Response time histogram

### Performance Metrics
- `performance_lcp_seconds` - Largest Contentful Paint
- `performance_fid_seconds` - First Input Delay
- `performance_cls_score` - Cumulative Layout Shift
- `performance_fcp_seconds` - First Contentful Paint
- `performance_ttfb_seconds` - Time to First Byte
- `performance_bundle_size_bytes` - Bundle size
- `performance_build_duration_seconds` - Build duration

## Transports

### File Transport

```typescript
import { createFileTransport } from '@repo/observability/logging';

logger.addTransport(createFileTransport('./logs/app.log'));
```

### HTTP Transport

```typescript
import { createHTTPTransport } from '@repo/observability/logging';

logger.addTransport(createHTTPTransport('https://logs.example.com/api/logs', {
  headers: { 'Authorization': 'Bearer token' },
  batchSize: 100,
  flushInterval: 5000,
}));
```

## Performance Budgets

```typescript
performanceMonitor.setBudgets([
  { type: 'initial', limit: 200 }, // 200KB initial bundle
  { type: 'total', limit: 500 },   // 500KB total bundle
  { type: 'chunk', limit: 300 },   // 300KB max chunk
]);

// Budget violations are automatically detected and alerts created
```

## Integration

### With Build System

```typescript
import { buildMetrics, performanceMonitor } from '@repo/observability';

// In build script
const startTime = Date.now();
try {
  await build();
  buildMetrics.success.inc();
  performanceMonitor.recordBuildMetrics({
    duration: Date.now() - startTime,
    success: true,
    timestamp: new Date(),
  });
} catch (error) {
  buildMetrics.failure.inc();
}
```

### With Agent System

```typescript
import { agentMetrics } from '@repo/observability';

// Track token usage
agentMetrics.tokenUsage.inc(tokensUsed);

// Track workflow execution
const startTime = Date.now();
try {
  await executeWorkflow();
  agentMetrics.workflowSuccess.inc();
} catch (error) {
  agentMetrics.workflowFailure.inc();
} finally {
  agentMetrics.workflowDuration.observe((Date.now() - startTime) / 1000);
}
```

## Environment Variables

- `LOG_LEVEL` - Set log level (DEBUG, INFO, WARN, ERROR, FATAL)
- `NODE_ENV` - Environment name (development, production)

## License

MIT

