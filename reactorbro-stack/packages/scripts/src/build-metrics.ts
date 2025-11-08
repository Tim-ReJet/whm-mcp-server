/**
 * Build Metrics and Performance Budgets
 * Tracks build performance and enforces size budgets
 */

import { readdirSync, statSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { gzipSync } from 'zlib';
import { logger } from '../../observability/src/logging/logger.js';
import { buildMetrics, performanceMonitor } from '../../observability/src/index.js';

export interface BuildMetrics {
  timestamp: Date;
  buildTime: number;
  bundleSizes: BundleSize[];
  totalSize: number;
  totalGzipped: number;
  budgetStatus: BudgetStatus;
}

export interface BundleSize {
  name: string;
  size: number;
  gzipped: number;
  path: string;
}

export interface BudgetStatus {
  passed: boolean;
  violations: BudgetViolation[];
}

export interface BudgetViolation {
  file: string;
  current: number;
  budget: number;
  type: 'initial' | 'total' | 'chunk';
}

export interface PerformanceBudget {
  initial: number; // Initial bundle size (KB)
  total: number; // Total bundle size (KB)
  chunk: number; // Max chunk size (KB)
  gzipped: number; // Max gzipped size (KB)
}

/**
 * Default performance budgets
 */
export const DEFAULT_BUDGETS: PerformanceBudget = {
  initial: 200, // 200KB initial bundle
  total: 500, // 500KB total
  chunk: 300, // 300KB per chunk
  gzipped: 150, // 150KB gzipped initial
};

/**
 * Calculate bundle sizes from dist directory
 */
export function calculateBundleSizes(distPath: string): BundleSize[] {
  const bundles: BundleSize[] = [];
  const files = getAllFiles(distPath);

  for (const file of files) {
    if (file.endsWith('.js') || file.endsWith('.css')) {
      const stats = statSync(file);
      const content = readFileSync(file);
      const gzipped = gzipSync(content).length;

      bundles.push({
        name: file.replace(distPath, '').replace(/^\//, ''),
        size: stats.size,
        gzipped,
        path: file,
      });
    }
  }

  return bundles.sort((a, b) => b.size - a.size);
}

/**
 * Get all files recursively
 */
function getAllFiles(dir: string, fileList: string[] = []): string[] {
  const files = readdirSync(dir);

  files.forEach((file) => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Check budgets against bundle sizes
 */
export function checkBudgets(
  bundles: BundleSize[],
  budgets: PerformanceBudget = DEFAULT_BUDGETS
): BudgetStatus {
  const violations: BudgetViolation[] = [];

  // Find initial bundle (usually index.js or main entry)
  const initialBundle = bundles.find((b) =>
    b.name.includes('index') || b.name.includes('main')
  );

  if (initialBundle) {
    const initialSizeKB = initialBundle.size / 1024;
    const initialGzippedKB = initialBundle.gzipped / 1024;

    if (initialSizeKB > budgets.initial) {
      violations.push({
        file: initialBundle.name,
        current: initialSizeKB,
        budget: budgets.initial,
        type: 'initial',
      });
    }

    if (initialGzippedKB > budgets.gzipped) {
      violations.push({
        file: initialBundle.name,
        current: initialGzippedKB,
        budget: budgets.gzipped,
        type: 'initial',
      });
    }
  }

  // Check total size
  const totalSize = bundles.reduce((sum, b) => sum + b.size, 0);
  const totalSizeKB = totalSize / 1024;

  if (totalSizeKB > budgets.total) {
    violations.push({
      file: 'total',
      current: totalSizeKB,
      budget: budgets.total,
      type: 'total',
    });
  }

  // Check individual chunks
  for (const bundle of bundles) {
    const chunkSizeKB = bundle.size / 1024;
    if (chunkSizeKB > budgets.chunk) {
      violations.push({
        file: bundle.name,
        current: chunkSizeKB,
        budget: budgets.chunk,
        type: 'chunk',
      });
    }
  }

  return {
    passed: violations.length === 0,
    violations,
  };
}

/**
 * Generate build metrics report
 */
export function generateMetrics(
  distPath: string,
  buildTime: number,
  budgets: PerformanceBudget = DEFAULT_BUDGETS
): BuildMetrics {
  const startTime = Date.now();
  logger.info('Generating build metrics', { distPath, buildTime });

  const bundles = calculateBundleSizes(distPath);
  const totalSize = bundles.reduce((sum, b) => sum + b.size, 0);
  const totalGzipped = bundles.reduce((sum, b) => sum + b.gzipped, 0);
  const budgetStatus = checkBudgets(bundles, budgets);

  // Record metrics
  buildMetrics.duration.observe(buildTime / 1000); // Convert to seconds
  buildMetrics.size.set(totalSize);

  if (budgetStatus.passed) {
    buildMetrics.success.inc();
    logger.info('Build metrics generated successfully', { totalSize, totalGzipped });
  } else {
    buildMetrics.failure.inc();
    logger.warn('Build metrics generated with budget violations', {
      violations: budgetStatus.violations.length,
      totalSize,
      totalGzipped,
    });
  }

  // Record performance metrics
  const initialBundle = bundles.find(b => b.name.includes('index') || b.name.includes('main')) || bundles[0];
  performanceMonitor.recordBundleMetrics({
    totalSize,
    initialSize: initialBundle?.size || 0,
    gzippedSize: totalGzipped,
    chunkCount: bundles.length,
  });

  performanceMonitor.recordBuildMetrics({
    duration: buildTime,
    success: budgetStatus.passed,
    timestamp: new Date(),
  });

  const metrics: BuildMetrics = {
    timestamp: new Date(),
    buildTime,
    bundleSizes: bundles,
    totalSize,
    totalGzipped,
    budgetStatus,
  };

  logger.debug('Build metrics calculation completed', {
    duration: Date.now() - startTime,
    bundleCount: bundles.length,
  });

  return metrics;
}

/**
 * Format metrics as report string
 */
export function formatMetricsReport(metrics: BuildMetrics): string {
  const { bundleSizes, totalSize, totalGzipped, buildTime, budgetStatus } = metrics;

  let report = '\n📊 Build Metrics Report\n';
  report += '='.repeat(50) + '\n\n';

  report += `⏱️  Build Time: ${(buildTime / 1000).toFixed(2)}s\n\n`;

  report += '📦 Bundle Sizes:\n';
  report += '-'.repeat(50) + '\n';
  report += `${'File'.padEnd(30)} ${'Size'.padStart(10)} ${'Gzipped'.padStart(10)}\n`;
  report += '-'.repeat(50) + '\n';

  for (const bundle of bundleSizes.slice(0, 10)) {
    const sizeKB = (bundle.size / 1024).toFixed(2);
    const gzippedKB = (bundle.gzipped / 1024).toFixed(2);
    const name = bundle.name.length > 28 ? bundle.name.slice(0, 25) + '...' : bundle.name;
    report += `${name.padEnd(30)} ${sizeKB.padStart(8)}KB ${gzippedKB.padStart(8)}KB\n`;
  }

  report += '\n';
  report += `Total Size: ${(totalSize / 1024).toFixed(2)}KB\n`;
  report += `Total Gzipped: ${(totalGzipped / 1024).toFixed(2)}KB\n\n`;

  report += '💰 Budget Status:\n';
  report += '-'.repeat(50) + '\n';

  if (budgetStatus.passed) {
    report += '✅ All budgets passed!\n';
  } else {
    report += '❌ Budget violations:\n';
    for (const violation of budgetStatus.violations) {
      report += `  • ${violation.file}: ${violation.current.toFixed(2)}KB > ${violation.budget}KB (${violation.type})\n`;
    }
  }

  report += '\n' + '='.repeat(50) + '\n';

  return report;
}

/**
 * Save metrics to JSON file
 */
export function saveMetrics(metrics: BuildMetrics, outputPath: string): void {
  // Ensure directory exists
  const dir = dirname(outputPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  writeFileSync(outputPath, JSON.stringify(metrics, null, 2));
}

/**
 * Load metrics from JSON file
 */
export function loadMetrics(filePath: string): BuildMetrics | null {
  if (!existsSync(filePath)) {
    return null;
  }

  const content = readFileSync(filePath, 'utf-8');
  const metrics = JSON.parse(content);
  metrics.timestamp = new Date(metrics.timestamp);
  return metrics;
}

/**
 * Compare two metrics
 */
export function compareMetrics(old: BuildMetrics, current: BuildMetrics): string {
  let report = '\n📈 Build Metrics Comparison\n';
  report += '='.repeat(50) + '\n\n';

  const buildTimeDiff = current.buildTime - old.buildTime;
  const buildTimeChange = buildTimeDiff > 0 ? '+' : '';
  report += `⏱️  Build Time: ${buildTimeChange}${(buildTimeDiff / 1000).toFixed(2)}s\n`;

  const totalSizeDiff = current.totalSize - old.totalSize;
  const totalSizeChange = totalSizeDiff > 0 ? '+' : '';
  report += `📦 Total Size: ${totalSizeChange}${(totalSizeDiff / 1024).toFixed(2)}KB\n`;

  const totalGzippedDiff = current.totalGzipped - old.totalGzipped;
  const totalGzippedChange = totalGzippedDiff > 0 ? '+' : '';
  report += `🗜️  Total Gzipped: ${totalGzippedChange}${(totalGzippedDiff / 1024).toFixed(2)}KB\n`;

  report += '\n' + '='.repeat(50) + '\n';

  return report;
}

export default {
  DEFAULT_BUDGETS,
  calculateBundleSizes,
  checkBudgets,
  generateMetrics,
  formatMetricsReport,
  saveMetrics,
  loadMetrics,
  compareMetrics,
};

