/**
 * Performance Regression Detector
 * Detects performance regressions before deployment
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { logger } from '../../observability/src/logging/logger.js';
import { performanceMonitor } from '../../observability/src/performance/monitor.js';

export interface PerformanceBaseline {
  bundleSize: number;
  buildTime: number;
  lcp?: number;
  fid?: number;
  cls?: number;
  timestamp: Date;
}

export interface RegressionResult {
  hasRegression: boolean;
  regressions: Regression[];
  warnings: string[];
}

export interface Regression {
  metric: string;
  current: number;
  baseline: number;
  threshold: number;
  percentage: number;
  severity: 'warning' | 'error';
}

export class PerformanceRegressionDetector {
  private baselineFile: string;
  private thresholds = {
    bundleSize: 0.1, // 10% increase
    buildTime: 0.2, // 20% increase
    lcp: 0.1, // 10% increase
    fid: 0.2, // 20% increase
    cls: 0.1, // 10% increase
  };

  constructor(baselineFile: string = '.performance-baseline.json') {
    this.baselineFile = baselineFile;
  }

  /**
   * Load baseline
   */
  loadBaseline(): PerformanceBaseline | null {
    if (!existsSync(this.baselineFile)) {
      return null;
    }

    try {
      const data = JSON.parse(readFileSync(this.baselineFile, 'utf-8'));
      return {
        ...data,
        timestamp: new Date(data.timestamp),
      };
    } catch (error) {
      logger.error('Failed to load baseline', {}, error as Error);
      return null;
    }
  }

  /**
   * Save baseline
   */
  saveBaseline(baseline: PerformanceBaseline): void {
    const { writeFileSync } = require('fs');
    writeFileSync(
      this.baselineFile,
      JSON.stringify(
        {
          ...baseline,
          timestamp: baseline.timestamp.toISOString(),
        },
        null,
        2
      )
    );
  }

  /**
   * Detect regressions
   */
  detectRegressions(current: Partial<PerformanceBaseline>): RegressionResult {
    const baseline = this.loadBaseline();
    const result: RegressionResult = {
      hasRegression: false,
      regressions: [],
      warnings: [],
    };

    if (!baseline) {
      result.warnings.push('No baseline found. This will be used as the new baseline.');
      return result;
    }

    // Check bundle size
    if (current.bundleSize !== undefined && baseline.bundleSize !== undefined) {
      const regression = this.checkRegression(
        'bundleSize',
        current.bundleSize,
        baseline.bundleSize,
        this.thresholds.bundleSize
      );
      if (regression) {
        result.regressions.push(regression);
        result.hasRegression = true;
      }
    }

    // Check build time
    if (current.buildTime !== undefined && baseline.buildTime !== undefined) {
      const regression = this.checkRegression(
        'buildTime',
        current.buildTime,
        baseline.buildTime,
        this.thresholds.buildTime
      );
      if (regression) {
        result.regressions.push(regression);
        result.hasRegression = true;
      }
    }

    // Check Core Web Vitals
    if (current.lcp !== undefined && baseline.lcp !== undefined) {
      const regression = this.checkRegression('lcp', current.lcp, baseline.lcp, this.thresholds.lcp);
      if (regression) {
        result.regressions.push(regression);
        result.hasRegression = true;
      }
    }

    if (current.fid !== undefined && baseline.fid !== undefined) {
      const regression = this.checkRegression('fid', current.fid, baseline.fid, this.thresholds.fid);
      if (regression) {
        result.regressions.push(regression);
        result.hasRegression = true;
      }
    }

    if (current.cls !== undefined && baseline.cls !== undefined) {
      const regression = this.checkRegression('cls', current.cls, baseline.cls, this.thresholds.cls);
      if (regression) {
        result.regressions.push(regression);
        result.hasRegression = true;
      }
    }

    logger.info('Performance regression detection completed', {
      hasRegression: result.hasRegression,
      regressions: result.regressions.length,
      warnings: result.warnings.length,
    });

    return result;
  }

  /**
   * Check for regression in a metric
   */
  private checkRegression(
    metric: string,
    current: number,
    baseline: number,
    threshold: number
  ): Regression | null {
    const increase = (current - baseline) / baseline;
    const percentage = increase * 100;

    if (increase > threshold) {
      return {
        metric,
        current,
        baseline,
        threshold: threshold * 100,
        percentage,
        severity: increase > threshold * 2 ? 'error' : 'warning',
      };
    }

    return null;
  }

  /**
   * Get regression summary
   */
  getSummary(result: RegressionResult): string {
    if (!result.hasRegression) {
      return '✅ No performance regressions detected';
    }

    let summary = '⚠️  Performance Regressions Detected:\n\n';

    for (const regression of result.regressions) {
      const icon = regression.severity === 'error' ? '❌' : '⚠️';
      summary += `${icon} ${regression.metric}: ${regression.percentage.toFixed(1)}% increase\n`;
      summary += `   Current: ${regression.current.toFixed(2)}\n`;
      summary += `   Baseline: ${regression.baseline.toFixed(2)}\n`;
      summary += `   Threshold: ${regression.threshold}%\n\n`;
    }

    return summary;
  }
}

export default PerformanceRegressionDetector;

