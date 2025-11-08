/**
 * Performance Monitoring System
 * Tracks Core Web Vitals, bundle sizes, and performance budgets
 */

import { metricsRegistry, Gauge, Histogram, Counter } from '../metrics/metrics.js';
import type { PerformanceBudget } from '../../scripts/src/build-metrics.js';

export interface PerformanceMetrics {
  coreWebVitals: {
    lcp: number; // Largest Contentful Paint
    fid: number; // First Input Delay
    cls: number; // Cumulative Layout Shift
    fcp: number; // First Contentful Paint
    ttfb: number; // Time to First Byte
  };
  bundleMetrics: {
    totalSize: number;
    initialSize: number;
    gzippedSize: number;
    chunkCount: number;
  };
  buildMetrics: {
    duration: number;
    success: boolean;
    timestamp: Date;
  };
}

export interface PerformanceAlert {
  type: 'budget_violation' | 'regression' | 'threshold_exceeded';
  severity: 'warning' | 'error';
  message: string;
  metric: string;
  value: number;
  threshold: number;
  timestamp: Date;
}

export class PerformanceMonitor {
  private budgets: PerformanceBudget[] = [];
  private alerts: PerformanceAlert[] = [];
  private metrics: PerformanceMetrics[] = [];
  private maxHistorySize: number = 1000;

  // Metrics
  private lcpGauge: Gauge;
  private fidGauge: Gauge;
  private clsGauge: Gauge;
  private fcpGauge: Gauge;
  private ttfbGauge: Gauge;
  private bundleSizeGauge: Gauge;
  private buildDurationHistogram: Histogram;

  constructor() {
    this.lcpGauge = metricsRegistry.createGauge('performance_lcp_seconds', 'Largest Contentful Paint');
    this.fidGauge = metricsRegistry.createGauge('performance_fid_seconds', 'First Input Delay');
    this.clsGauge = metricsRegistry.createGauge('performance_cls_score', 'Cumulative Layout Shift');
    this.fcpGauge = metricsRegistry.createGauge('performance_fcp_seconds', 'First Contentful Paint');
    this.ttfbGauge = metricsRegistry.createGauge('performance_ttfb_seconds', 'Time to First Byte');
    this.bundleSizeGauge = metricsRegistry.createGauge('performance_bundle_size_bytes', 'Bundle size');
    this.buildDurationHistogram = metricsRegistry.createHistogram(
      'performance_build_duration_seconds',
      'Build duration',
      [1, 5, 10, 30, 60, 120]
    );
  }

  setBudgets(budgets: PerformanceBudget[]): void {
    this.budgets = budgets;
  }

  recordCoreWebVitals(vitals: Partial<PerformanceMetrics['coreWebVitals']>): void {
    if (vitals.lcp !== undefined) {
      this.lcpGauge.set(vitals.lcp);
      this.checkBudget('lcp', vitals.lcp, 2.5); // LCP should be < 2.5s
    }
    if (vitals.fid !== undefined) {
      this.fidGauge.set(vitals.fid);
      this.checkBudget('fid', vitals.fid, 0.1); // FID should be < 100ms
    }
    if (vitals.cls !== undefined) {
      this.clsGauge.set(vitals.cls);
      this.checkBudget('cls', vitals.cls, 0.1); // CLS should be < 0.1
    }
    if (vitals.fcp !== undefined) {
      this.fcpGauge.set(vitals.fcp);
    }
    if (vitals.ttfb !== undefined) {
      this.ttfbGauge.set(vitals.ttfb);
      this.checkBudget('ttfb', vitals.ttfb, 0.6); // TTFB should be < 600ms
    }
  }

  recordBundleMetrics(metrics: PerformanceMetrics['bundleMetrics']): void {
    this.bundleSizeGauge.set(metrics.totalSize);

    // Check bundle size budgets
    const initialBudget = this.budgets.find(b => b.type === 'initial');
    if (initialBudget && metrics.initialSize > initialBudget.limit * 1024) {
      this.addAlert({
        type: 'budget_violation',
        severity: 'error',
        message: `Initial bundle size ${(metrics.initialSize / 1024).toFixed(2)}KB exceeds budget ${initialBudget.limit}KB`,
        metric: 'bundle_size',
        value: metrics.initialSize,
        threshold: initialBudget.limit * 1024,
        timestamp: new Date(),
      });
    }
  }

  recordBuildMetrics(metrics: PerformanceMetrics['buildMetrics']): void {
    this.buildDurationHistogram.observe(metrics.duration / 1000); // Convert to seconds

    // Check for build time regression
    const recentBuilds = this.metrics
      .filter(m => m.buildMetrics.success)
      .slice(-10)
      .map(m => m.buildMetrics.duration);

    if (recentBuilds.length > 0) {
      const avgDuration = recentBuilds.reduce((a, b) => a + b, 0) / recentBuilds.length;
      const regressionThreshold = avgDuration * 1.5; // 50% increase

      if (metrics.duration > regressionThreshold) {
        this.addAlert({
          type: 'regression',
          severity: 'warning',
          message: `Build duration ${(metrics.duration / 1000).toFixed(2)}s exceeds average by >50%`,
          metric: 'build_duration',
          value: metrics.duration,
          threshold: regressionThreshold,
          timestamp: new Date(),
        });
      }
    }
  }

  recordMetrics(metrics: PerformanceMetrics): void {
    this.metrics.push(metrics);

    // Keep only recent history
    if (this.metrics.length > this.maxHistorySize) {
      this.metrics.shift();
    }

    // Update individual metrics
    this.recordCoreWebVitals(metrics.coreWebVitals);
    this.recordBundleMetrics(metrics.bundleMetrics);
    this.recordBuildMetrics(metrics.buildMetrics);
  }

  private checkBudget(metric: string, value: number, threshold: number): void {
    if (value > threshold) {
      this.addAlert({
        type: 'threshold_exceeded',
        severity: 'warning',
        message: `${metric.toUpperCase()} ${value.toFixed(2)} exceeds threshold ${threshold}`,
        metric,
        value,
        threshold,
        timestamp: new Date(),
      });
    }
  }

  private addAlert(alert: PerformanceAlert): void {
    this.alerts.push(alert);

    // Keep only recent alerts
    if (this.alerts.length > 100) {
      this.alerts.shift();
    }
  }

  getAlerts(severity?: PerformanceAlert['severity']): PerformanceAlert[] {
    if (severity) {
      return this.alerts.filter(a => a.severity === severity);
    }
    return [...this.alerts];
  }

  getMetrics(limit: number = 100): PerformanceMetrics[] {
    return this.metrics.slice(-limit);
  }

  getCurrentMetrics(): PerformanceMetrics | null {
    return this.metrics[this.metrics.length - 1] || null;
  }

  getTrends(): {
    lcp: { current: number; average: number; trend: 'improving' | 'degrading' | 'stable' };
    bundleSize: { current: number; average: number; trend: 'improving' | 'degrading' | 'stable' };
    buildDuration: { current: number; average: number; trend: 'improving' | 'degrading' | 'stable' };
  } {
    const recent = this.metrics.slice(-20);

    if (recent.length === 0) {
      return {
        lcp: { current: 0, average: 0, trend: 'stable' },
        bundleSize: { current: 0, average: 0, trend: 'stable' },
        buildDuration: { current: 0, average: 0, trend: 'stable' },
      };
    }

    const current = recent[recent.length - 1];
    const avgLcp = recent.reduce((sum, m) => sum + m.coreWebVitals.lcp, 0) / recent.length;
    const avgBundleSize = recent.reduce((sum, m) => sum + m.bundleMetrics.totalSize, 0) / recent.length;
    const avgBuildDuration = recent.reduce((sum, m) => sum + m.buildMetrics.duration, 0) / recent.length;

    const calculateTrend = (current: number, average: number, lowerIsBetter: boolean = true): 'improving' | 'degrading' | 'stable' => {
      const diff = ((current - average) / average) * 100;
      if (Math.abs(diff) < 5) return 'stable';
      return (lowerIsBetter && diff < 0) || (!lowerIsBetter && diff > 0) ? 'improving' : 'degrading';
    };

    return {
      lcp: {
        current: current.coreWebVitals.lcp,
        average: avgLcp,
        trend: calculateTrend(current.coreWebVitals.lcp, avgLcp),
      },
      bundleSize: {
        current: current.bundleMetrics.totalSize,
        average: avgBundleSize,
        trend: calculateTrend(current.bundleMetrics.totalSize, avgBundleSize),
      },
      buildDuration: {
        current: current.buildMetrics.duration,
        average: avgBuildDuration,
        trend: calculateTrend(current.buildMetrics.duration, avgBuildDuration),
      },
    };
  }

  clearAlerts(): void {
    this.alerts = [];
  }
}

/**
 * Default performance monitor instance
 */
export const performanceMonitor = new PerformanceMonitor();

export default performanceMonitor;

