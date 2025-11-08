/**
 * Performance Monitoring Dashboard
 * Tracks and visualizes performance metrics across the system
 */

import type { ExecutionMetrics } from './workflow-optimizer.js';
import { logger } from '@repo/observability';

export interface PerformanceMetrics {
  workflows: {
    total: number;
    running: number;
    completed: number;
    failed: number;
    averageDuration: number;
    averageTokens: number;
  };
  cache: {
    hitRate: number;
    totalHits: number;
    totalMisses: number;
    size: number;
  };
  resources: {
    maxConcurrent: number;
    currentUsage: number;
    utilization: number;
  };
  build: {
    averageBuildTime: number;
    averageBundleSize: number;
    lastBuildTime: number;
  };
}

export interface PerformanceAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  metric: string;
  value: number;
  threshold: number;
  timestamp: Date;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics;
  private alerts: PerformanceAlert[] = [];
  private executionHistory: ExecutionMetrics[] = [];
  private maxHistorySize: number = 1000;

  constructor() {
    this.metrics = {
      workflows: {
        total: 0,
        running: 0,
        completed: 0,
        failed: 0,
        averageDuration: 0,
        averageTokens: 0,
      },
      cache: {
        hitRate: 0,
        totalHits: 0,
        totalMisses: 0,
        size: 0,
      },
      resources: {
        maxConcurrent: 5,
        currentUsage: 0,
        utilization: 0,
      },
      build: {
        averageBuildTime: 0,
        averageBundleSize: 0,
        lastBuildTime: 0,
      },
    };
  }

  /**
   * Record workflow execution metrics
   */
  recordWorkflowExecution(metrics: ExecutionMetrics): void {
    this.executionHistory.push(metrics);

    if (this.executionHistory.length > this.maxHistorySize) {
      this.executionHistory.shift();
    }

    // Update aggregate metrics
    const completed = this.executionHistory.filter((m) => m.endTime);
    if (completed.length > 0) {
      this.metrics.workflows.completed = completed.length;
      this.metrics.workflows.averageDuration =
        completed.reduce((sum, m) => sum + (m.duration || 0), 0) /
        completed.length;
      this.metrics.workflows.averageTokens =
        completed.reduce((sum, m) => sum + m.tokensUsed, 0) /
        completed.length;
    }

    this.metrics.workflows.total = this.executionHistory.length;
    this.metrics.workflows.running = this.executionHistory.filter(
      (m) => !m.endTime
    ).length;

    // Check for alerts
    this.checkWorkflowAlerts(metrics);
  }

  /**
   * Update cache metrics
   */
  updateCacheMetrics(hitRate: number, hits: number, misses: number, size: number): void {
    this.metrics.cache.hitRate = hitRate;
    this.metrics.cache.totalHits = hits;
    this.metrics.cache.totalMisses = misses;
    this.metrics.cache.size = size;

    // Check for alerts
    if (hitRate < 0.5) {
      this.addAlert({
        id: `cache-hitrate-low-${Date.now()}`,
        type: 'warning',
        message: `Cache hit rate is low: ${(hitRate * 100).toFixed(1)}%`,
        metric: 'cache.hitRate',
        value: hitRate,
        threshold: 0.5,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Update resource metrics
   */
  updateResourceMetrics(maxConcurrent: number, currentUsage: number): void {
    this.metrics.resources.maxConcurrent = maxConcurrent;
    this.metrics.resources.currentUsage = currentUsage;
    this.metrics.resources.utilization = currentUsage / maxConcurrent;

    // Check for alerts
    if (this.metrics.resources.utilization > 0.9) {
      this.addAlert({
        id: `resource-utilization-high-${Date.now()}`,
        type: 'warning',
        message: `Resource utilization is high: ${(this.metrics.resources.utilization * 100).toFixed(1)}%`,
        metric: 'resources.utilization',
        value: this.metrics.resources.utilization,
        threshold: 0.9,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Update build metrics
   */
  updateBuildMetrics(buildTime: number, bundleSize: number): void {
    // Update average build time
    const buildTimes = this.executionHistory
      .map((m) => m.duration)
      .filter((d) => d && d > 0);

    if (buildTimes.length > 0) {
      this.metrics.build.averageBuildTime =
        buildTimes.reduce((sum, t) => sum + t, 0) / buildTimes.length;
    }

    this.metrics.build.lastBuildTime = buildTime;
    this.metrics.build.averageBundleSize = bundleSize;

    // Check for alerts
    if (buildTime > 300000) { // 5 minutes
      this.addAlert({
        id: `build-time-high-${Date.now()}`,
        type: 'warning',
        message: `Build time is high: ${(buildTime / 1000).toFixed(1)}s`,
        metric: 'build.time',
        value: buildTime,
        threshold: 300000,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Check workflow alerts
   */
  private checkWorkflowAlerts(metrics: ExecutionMetrics): void {
    // Alert on long execution times
    if (metrics.duration && metrics.duration > 600000) { // 10 minutes
      this.addAlert({
        id: `workflow-duration-high-${Date.now()}`,
        type: 'warning',
        message: `Workflow execution time is high: ${(metrics.duration / 1000).toFixed(1)}s`,
        metric: 'workflow.duration',
        value: metrics.duration,
        threshold: 600000,
        timestamp: new Date(),
      });
    }

    // Alert on high token usage
    if (metrics.tokensUsed > 100000) {
      this.addAlert({
        id: `workflow-tokens-high-${Date.now()}`,
        type: 'warning',
        message: `Workflow token usage is high: ${metrics.tokensUsed}`,
        metric: 'workflow.tokens',
        value: metrics.tokensUsed,
        threshold: 100000,
        timestamp: new Date(),
      });
    }

    // Alert on low cache hit rate
    const totalRequests = metrics.cacheHits + metrics.cacheMisses;
    if (totalRequests > 0) {
      const hitRate = metrics.cacheHits / totalRequests;
      if (hitRate < 0.3) {
        this.addAlert({
          id: `workflow-cache-low-${Date.now()}`,
          type: 'info',
          message: `Workflow cache hit rate is low: ${(hitRate * 100).toFixed(1)}%`,
          metric: 'workflow.cacheHitRate',
          value: hitRate,
          threshold: 0.3,
          timestamp: new Date(),
        });
      }
    }
  }

  /**
   * Add performance alert
   */
  private addAlert(alert: PerformanceAlert): void {
    this.alerts.push(alert);

    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts.shift();
    }

    // Log alert
    logger.warn('Performance alert', {
      type: alert.type,
      message: alert.message,
      metric: alert.metric,
      value: alert.value,
      threshold: alert.threshold,
    });
  }

  /**
   * Get current metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Get alerts
   */
  getAlerts(limit: number = 10): PerformanceAlert[] {
    return this.alerts.slice(-limit).reverse();
  }

  /**
   * Get execution history
   */
  getExecutionHistory(limit: number = 100): ExecutionMetrics[] {
    return this.executionHistory.slice(-limit).reverse();
  }

  /**
   * Get performance trends
   */
  getTrends(timeWindow: number = 3600000): {
    duration: number[];
    tokens: number[];
    cacheHitRate: number[];
    timestamps: number[];
  } {
    const cutoff = Date.now() - timeWindow;
    const recent = this.executionHistory.filter(
      (m) => m.startTime >= cutoff && m.endTime
    );

    return {
      duration: recent.map((m) => m.duration || 0),
      tokens: recent.map((m) => m.tokensUsed),
      cacheHitRate: recent.map((m) => {
        const total = m.cacheHits + m.cacheMisses;
        return total > 0 ? m.cacheHits / total : 0;
      }),
      timestamps: recent.map((m) => m.startTime),
    };
  }

  /**
   * Clear old alerts
   */
  clearOldAlerts(maxAge: number = 86400000): void {
    const cutoff = Date.now() - maxAge;
    this.alerts = this.alerts.filter(
      (alert) => alert.timestamp.getTime() >= cutoff
    );
  }
}

export default PerformanceMonitor;

