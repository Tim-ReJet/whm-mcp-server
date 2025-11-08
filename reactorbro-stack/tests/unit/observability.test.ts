import { describe, it, expect, beforeEach } from 'vitest';
import { Logger, LogLevel } from '../../../packages/observability/src/logging/logger';
import { MetricsRegistry, Counter, Gauge } from '../../../packages/observability/src/metrics/metrics';
import { PerformanceMonitor } from '../../../packages/observability/src/performance/monitor';

describe('Observability System', () => {
  describe('Logger', () => {
    it('should create logger instance', () => {
      const logger = new Logger();
      expect(logger).toBeDefined();
    });

    it('should log at correct level', () => {
      const logger = new Logger({ level: LogLevel.INFO });
      logger.debug('Debug message'); // Should not log
      logger.info('Info message'); // Should log
      logger.warn('Warn message'); // Should log
    });

    it('should create child logger with context', () => {
      const logger = new Logger();
      const child = logger.child({ service: 'test-service' });
      expect(child).toBeDefined();
    });
  });

  describe('Metrics Registry', () => {
    let registry: MetricsRegistry;

    beforeEach(() => {
      registry = new MetricsRegistry();
    });

    it('should create counter', () => {
      const counter = registry.createCounter('test_counter', 'Test counter');
      counter.inc(5);
      expect(counter.get().value).toBe(5);
    });

    it('should create gauge', () => {
      const gauge = registry.createGauge('test_gauge', 'Test gauge');
      gauge.set(10);
      expect(gauge.get().value).toBe(10);
    });

    it('should export Prometheus format', () => {
      registry.createCounter('test_counter', 'Test counter');
      const exportStr = registry.exportPrometheus();
      expect(exportStr).toContain('test_counter');
      expect(exportStr).toContain('counter');
    });
  });

  describe('Performance Monitor', () => {
    let monitor: PerformanceMonitor;

    beforeEach(() => {
      monitor = new PerformanceMonitor();
    });

    it('should record Core Web Vitals', () => {
      monitor.recordCoreWebVitals({
        lcp: 2.0,
        fid: 0.05,
        cls: 0.05,
      });

      const trends = monitor.getTrends();
      expect(trends.lcp.current).toBeGreaterThan(0);
    });

    it('should detect budget violations', () => {
      monitor.setBudgets([
        { type: 'initial', limit: 200 },
      ]);

      monitor.recordBundleMetrics({
        totalSize: 300 * 1024,
        initialSize: 250 * 1024,
        gzippedSize: 100 * 1024,
        chunkCount: 5,
      });

      const alerts = monitor.getAlerts();
      expect(alerts.length).toBeGreaterThan(0);
    });
  });
});

