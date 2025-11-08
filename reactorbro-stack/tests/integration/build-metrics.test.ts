import { describe, it, expect } from 'vitest';
import {
  calculateBundleSizes,
  checkBudgets,
  generateMetrics,
  formatMetricsReport,
  DEFAULT_BUDGETS,
} from '../../packages/scripts/src/build-metrics';
import { createTestEnv } from '../unit/utils';

/**
 * Integration tests for build metrics
 */
describe('Build Metrics Integration', () => {
  describe('Full Metrics Generation', () => {
    it('should generate complete metrics report', () => {
      const testEnv = createTestEnv();

      try {
        // Create mock bundle files
        testEnv.createFile('index.js', 'console.log("test");'.repeat(100));
        testEnv.createFile('styles.css', '.test { color: red; }'.repeat(50));
        testEnv.createFile('vendor.js', 'vendor code'.repeat(200));

        const metrics = generateMetrics(testEnv.tempDir, 5000, DEFAULT_BUDGETS);

        expect(metrics.timestamp).toBeInstanceOf(Date);
        expect(metrics.buildTime).toBe(5000);
        expect(metrics.bundleSizes.length).toBeGreaterThan(0);
        expect(metrics.totalSize).toBeGreaterThan(0);
        expect(metrics.totalGzipped).toBeGreaterThan(0);
        expect(metrics.budgetStatus).toBeDefined();
        expect(metrics.budgetStatus.passed).toBeDefined();

        // Test report formatting
        const report = formatMetricsReport(metrics);
        expect(report).toContain('Build Metrics Report');
        expect(report).toContain('Build Time');
        expect(report).toContain('Bundle Sizes');
        expect(report).toContain('Budget Status');
      } finally {
        testEnv.cleanup();
      }
    });

    it('should detect budget violations', () => {
      const testEnv = createTestEnv();

      try {
        // Create a large bundle that exceeds budget
        const largeContent = 'x'.repeat(300 * 1024); // 300KB
        testEnv.createFile('large-bundle.js', largeContent);

        const metrics = generateMetrics(testEnv.tempDir, 0, DEFAULT_BUDGETS);

        // Should detect violations
        expect(metrics.budgetStatus.violations.length).toBeGreaterThan(0);
        expect(metrics.budgetStatus.passed).toBe(false);
      } finally {
        testEnv.cleanup();
      }
    });
  });
});

