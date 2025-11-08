import { describe, it, expect, beforeEach } from 'vitest';
import { TokenOptimizer } from '../../../agents/core/token-optimizer';
import { createTestEnv } from './utils';

describe('Token Optimizer', () => {
  let optimizer: TokenOptimizer;
  let testEnv: ReturnType<typeof createTestEnv>;

  beforeEach(() => {
    testEnv = createTestEnv();
    optimizer = new TokenOptimizer(testEnv.tempDir);
  });

  describe('Token Estimation', () => {
    it('should estimate tokens correctly', async () => {
      const text = 'This is a test string with some content.';
      const tokens = await optimizer.estimateTokens(text);
      expect(tokens).toBeGreaterThan(0);
      expect(tokens).toBeLessThan(text.length);
    });

    it('should handle empty string', async () => {
      const tokens = await optimizer.estimateTokens('');
      expect(tokens).toBe(0);
    });
  });

  describe('Prompt Optimization', () => {
    it('should optimize prompt', async () => {
      const prompt = '  This is   a   prompt   with   extra   spaces  ';
      const optimized = await optimizer.optimizePrompt(prompt);
      expect(optimized.length).toBeLessThanOrEqual(prompt.length);
      expect(optimized).not.toContain('  ');
    });

    it('should cache optimized prompts', async () => {
      const prompt = 'Test prompt for caching';
      const optimized1 = await optimizer.optimizePrompt(prompt);
      const optimized2 = await optimizer.optimizePrompt(prompt);

      expect(optimized1).toBe(optimized2);
    });
  });

  describe('Usage Tracking', () => {
    it('should track token usage', async () => {
      await optimizer.trackUsage('agent-1', 'task-1', 'prompt', 'completion', 1000);

      const budget = optimizer.getBudget();
      expect(budget.used).toBe(1000);
      expect(budget.remaining).toBe(budget.limit - 1000);
    });

    it('should throw error when budget exceeded', async () => {
      optimizer.setBudget(100, 'daily');
      await optimizer.trackUsage('agent-1', 'task-1', 'prompt', 'completion', 50);

      await expect(
        optimizer.trackUsage('agent-1', 'task-2', 'prompt', 'completion', 60)
      ).rejects.toThrow();
    });
  });

  describe('Usage Reports', () => {
    it('should generate usage report', async () => {
      await optimizer.trackUsage('agent-1', 'task-1', 'prompt', 'completion', 100);
      await optimizer.trackUsage('agent-2', 'task-2', 'prompt', 'completion', 200);

      const report = await optimizer.generateUsageReport('daily');
      expect(report.totalTokens).toBe(300);
      expect(report.requestCount).toBe(2);
      expect(report.byAgent).toHaveProperty('agent-1');
      expect(report.byAgent).toHaveProperty('agent-2');
    });
  });
});

