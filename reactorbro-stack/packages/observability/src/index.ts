// Logging
export { Logger, LogLevel, logger, createFileTransport, createJSONTransport, createHTTPTransport } from './logging/logger.js';
export type { LogEntry, LogContext, LogTransport } from './logging/logger.js';

// Metrics
export {
  MetricsRegistry,
  Counter,
  Gauge,
  Histogram,
  Summary,
  metricsRegistry,
  buildMetrics,
  agentMetrics,
  siteMetrics,
} from './metrics/metrics.js';
export type { CounterMetric, GaugeMetric, HistogramMetric, SummaryMetric, MetricLabels } from './metrics/metrics.js';

// Performance Monitoring
export { PerformanceMonitor, performanceMonitor } from './performance/monitor.js';
export type { PerformanceMetrics, PerformanceAlert } from './performance/monitor.js';

// Tracing
export { Tracer, tracer } from './tracing/tracer.js';
export { TraceContextManager, traceContextManager } from './tracing/context.js';
export { traceFunction, traceAsync, traceRequest, endTrace } from './tracing/utils.js';
export type { TraceContext, Span, Trace, SpanEvent } from './tracing/tracer.js';

