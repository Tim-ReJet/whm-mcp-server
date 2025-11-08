import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  calculateBundleSizes,
  checkBudgets,
  generateMetrics,
  DEFAULT_BUDGETS,
} from '../../packages/scripts/src/build-metrics';
import { createTestEnv, createTestFile } from './utils';

describe('Build Metrics', () => {
  let testEnv: ReturnType<typeof createTestEnv>;

  beforeEach(() => {
    testEnv = createTestEnv();
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('calculateBundleSizes', () => {
    it('should calculate bundle sizes correctly', () => {
      // Create test bundle files
      const jsFile = testEnv.createFile('bundle.js', 'console.log("test");'.repeat(100));
      const cssFile = testEnv.createFile('styles.css', '.test { color: red; }'.repeat(50));

      const bundles = calculateBundleSizes(testEnv.tempDir);

      expect(bundles.length).toBeGreaterThan(0);
      expect(bundles.some(b => b.name.includes('bundle.js'))).toBe(true);
      expect(bundles.some(b => b.name.includes('styles.css'))).toBe(true);
    });

    it('should calculate gzipped sizes', () => {
      const jsFile = testEnv.createFile('test.js', 'test content');
      const bundles = calculateBundleSizes(testEnv.tempDir);

      const bundle = bundles.find(b => b.name.includes('test.js'));
      expect(bundle).toBeDefined();
      expect(bundle!.gzipped).toBeGreaterThan(0);
      expect(bundle!.gzipped).toBeLessThan(bundle!.size);
    });

    it('should ignore non-bundle files', () => {
      testEnv.createFile('readme.txt', 'This is a readme');
      testEnv.createFile('bundle.js', 'console.log("test");');

      const bundles = calculateBundleSizes(testEnv.tempDir);
      expect(bundles.every(b => b.name.endsWith('.js') || b.name.endsWith('.css'))).toBe(true);
    });
  });

  describe('checkBudgets', () => {
    it('should pass when bundles are within budget', () => {
      const bundles = [
        { name: 'index.js', size: 100 * 1024, gzipped: 50 * 1024, path: '/index.js' },
        { name: 'vendor.js', size: 150 * 1024, gzipped: 75 * 1024, path: '/vendor.js' },
      ];

      const status = checkBudgets(bundles, DEFAULT_BUDGETS);
      expect(status.passed).toBe(true);
      expect(status.violations.length).toBe(0);
    });

    it('should fail when initial bundle exceeds budget', () => {
      const bundles = [
        { name: 'index.js', size: 300 * 1024, gzipped: 150 * 1024, path: '/index.js' }, // Exceeds 200KB
      ];

      const status = checkBudgets(bundles, DEFAULT_BUDGETS);
      expect(status.passed).toBe(false);
      expect(status.violations.length).toBeGreaterThan(0);
      expect(status.violations.some(v => v.type === 'initial')).toBe(true);
    });

    it('should fail when total size exceeds budget', () => {
      const bundles = [
        { name: 'file1.js', size: 300 * 1024, gzipped: 150 * 1024, path: '/file1.js' },
        { name: 'file2.js', size: 300 * 1024, gzipped: 150 * 1024, path: '/file2.js' },
      ];

      const status = checkBudgets(bundles, { ...DEFAULT_BUDGETS, total: 500 });
      expect(status.passed).toBe(false);
      expect(status.violations.some(v => v.type === 'total')).toBe(true);
    });

    it('should fail when chunk exceeds max chunk size', () => {
      const bundles = [
        { name: 'large-chunk.js', size: 400 * 1024, gzipped: 200 * 1024, path: '/large-chunk.js' },
      ];

      const status = checkBudgets(bundles, DEFAULT_BUDGETS);
      expect(status.passed).toBe(false);
      expect(status.violations.some(v => v.type === 'chunk')).toBe(true);
    });
  });

  describe('generateMetrics', () => {
    it('should generate metrics with correct structure', () => {
      testEnv.createFile('bundle.js', 'console.log("test");');

      const metrics = generateMetrics(testEnv.tempDir, 1000, DEFAULT_BUDGETS);

      expect(metrics).toHaveProperty('timestamp');
      expect(metrics).toHaveProperty('buildTime', 1000);
      expect(metrics).toHaveProperty('bundleSizes');
      expect(metrics).toHaveProperty('totalSize');
      expect(metrics).toHaveProperty('totalGzipped');
      expect(metrics).toHaveProperty('budgetStatus');
    });

    it('should calculate total sizes correctly', () => {
      testEnv.createFile('file1.js', 'a'.repeat(1000));
      testEnv.createFile('file2.js', 'b'.repeat(2000));

      const metrics = generateMetrics(testEnv.tempDir, 0, DEFAULT_BUDGETS);

      expect(metrics.totalSize).toBeGreaterThan(0);
      expect(metrics.totalGzipped).toBeGreaterThan(0);
      expect(metrics.totalGzipped).toBeLessThan(metrics.totalSize);
    });
  });
});

