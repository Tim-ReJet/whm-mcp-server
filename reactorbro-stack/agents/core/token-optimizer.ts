import type { TokenUsage, TokenBudget, OptimizationStrategy } from './types';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';
import { logger } from '../../../packages/observability/src/logging/logger.js';
import { agentMetrics } from '../../../packages/observability/src/metrics/metrics.js';

interface PromptCache {
  hash: string;
  prompt: string;
  optimized: string;
  tokensSaved: number;
  createdAt: Date;
  accessCount: number;
  lastAccessed: Date;
}

export class TokenOptimizer {
  private usageLog: TokenUsage[] = [];
  private budget: TokenBudget = {
    limit: 1000000,
    used: 0,
    remaining: 1000000,
    period: 'daily',
  };

  private strategy: OptimizationStrategy = {
    caching: true,
    compression: true,
    incremental: true,
    reusePatterns: true,
  };

  private promptCache: Map<string, PromptCache> = new Map();
  private cacheDir: string;
  private maxCacheSize = 1000; // Max cached prompts

  constructor(cacheDir?: string) {
    this.cacheDir = cacheDir || join(process.cwd(), '.token-cache');
    this.ensureCacheDir();
    this.loadCache();
  }

  private ensureCacheDir(): void {
    if (!existsSync(this.cacheDir)) {
      mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  private loadCache(): void {
    const cacheFile = join(this.cacheDir, 'prompt-cache.json');
    if (existsSync(cacheFile)) {
      try {
        const content = readFileSync(cacheFile, 'utf-8');
        const cache = JSON.parse(content);
        for (const [key, value] of Object.entries(cache)) {
          this.promptCache.set(key, value as PromptCache);
        }
      } catch (error) {
        // Cache file corrupted, start fresh
        console.warn('Failed to load prompt cache, starting fresh');
      }
    }
  }

  private saveCache(): void {
    const cacheFile = join(this.cacheDir, 'prompt-cache.json');
    const cache: Record<string, PromptCache> = {};
    for (const [key, value] of this.promptCache.entries()) {
      cache[key] = value;
    }
    writeFileSync(cacheFile, JSON.stringify(cache, null, 2), 'utf-8');
  }

  private hashPrompt(prompt: string): string {
    return createHash('sha256').update(prompt).digest('hex').substring(0, 16);
  }

  async estimateTokens(text: string): Promise<number> {
    // Improved estimation: ~4 characters per token for English
    // Adjust for code/structured content
    const codeRatio = (text.match(/[{}[\]();]/g) || []).length / text.length;
    const avgCharsPerToken = codeRatio > 0.1 ? 3.5 : 4;
    return Math.ceil(text.length / avgCharsPerToken);
  }

  async optimizePrompt(prompt: string): Promise<string> {
    // Check cache first
    if (this.strategy.caching) {
      const hash = this.hashPrompt(prompt);
      const cached = this.promptCache.get(hash);

      if (cached) {
        cached.accessCount++;
        cached.lastAccessed = new Date();
        this.saveCache();
        return cached.optimized;
      }
    }

    let optimized = prompt;

    if (this.strategy.compression) {
      optimized = this.compressPrompt(optimized);
    }

    if (this.strategy.reusePatterns) {
      optimized = this.reusePatterns(optimized);
    }

    // Cache optimized prompt
    if (this.strategy.caching) {
      const hash = this.hashPrompt(prompt);
      const originalTokens = await this.estimateTokens(prompt);
      const optimizedTokens = await this.estimateTokens(optimized);
      const tokensSaved = originalTokens - optimizedTokens;

      // Evict least recently used if cache is full
      if (this.promptCache.size >= this.maxCacheSize) {
        const lru = Array.from(this.promptCache.entries())
          .sort((a, b) => a[1].lastAccessed.getTime() - b[1].lastAccessed.getTime())[0];
        this.promptCache.delete(lru[0]);
      }

      this.promptCache.set(hash, {
        hash,
        prompt,
        optimized,
        tokensSaved,
        createdAt: new Date(),
        accessCount: 1,
        lastAccessed: new Date(),
      });

      this.saveCache();
    }

    return optimized;
  }

  private compressPrompt(prompt: string): string {
    return prompt
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .join('\n')
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n{3,}/g, '\n\n'); // Replace multiple newlines with double newline
  }

  private reusePatterns(prompt: string): string {
    // Identify common patterns and replace with shorter references
    // This is a simplified version - could be enhanced with ML
    const patterns = [
      { pattern: /please\s+/gi, replacement: '' },
      { pattern: /\bvery\s+/gi, replacement: '' },
      { pattern: /\breally\s+/gi, replacement: '' },
    ];

    let optimized = prompt;
    for (const { pattern, replacement } of patterns) {
      optimized = optimized.replace(pattern, replacement);
    }

    return optimized;
  }

  async trackUsage(
    agentId: string,
    taskId: string,
    prompt: string,
    completion: string,
    tokens: number
  ): Promise<void> {
    const usage: TokenUsage = {
      agentId,
      taskId,
      prompt,
      completion,
      total: tokens,
      timestamp: new Date(),
    };

    this.usageLog.push(usage);
    this.budget.used += tokens;
    this.budget.remaining = Math.max(0, this.budget.limit - this.budget.used);

    // Record metrics
    agentMetrics.tokenUsage.inc(tokens);
    logger.debug('Token usage tracked', {
      agentId,
      taskId,
      tokens,
      remaining: this.budget.remaining,
    });

    // Check budget
    if (this.budget.remaining <= 0) {
      logger.error('Token budget exceeded', {
        agentId,
        used: this.budget.used,
        limit: this.budget.limit,
      });
      throw new Error(`Token budget exceeded: ${this.budget.used} / ${this.budget.limit}`);
    }
  }

  async generateUsageReport(period: 'hourly' | 'daily' | 'monthly'): Promise<any> {
    const now = new Date();
    let periodStart: Date;

    switch (period) {
      case 'hourly':
        periodStart = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case 'daily':
        periodStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        periodStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    const relevantUsage = this.usageLog.filter((u) => u.timestamp >= periodStart);

    const totalTokens = relevantUsage.reduce((sum, u) => sum + u.total, 0);
    const byAgent = this.groupByAgent(relevantUsage);
    const cacheStats = this.getCacheStats();

    return {
      period,
      startTime: periodStart,
      endTime: now,
      totalTokens,
      requestCount: relevantUsage.length,
      averageTokensPerRequest: relevantUsage.length > 0 ? totalTokens / relevantUsage.length : 0,
      byAgent,
      budget: { ...this.budget },
      cacheStats,
      topAgents: this.getTopAgents(byAgent, 5),
    };
  }

  private groupByAgent(usage: TokenUsage[]): Record<string, number> {
    return usage.reduce(
      (acc, u) => {
        acc[u.agentId] = (acc[u.agentId] || 0) + u.total;
        return acc;
      },
      {} as Record<string, number>
    );
  }

  private getTopAgents(byAgent: Record<string, number>, limit: number): Array<{ agent: string; tokens: number }> {
    return Object.entries(byAgent)
      .map(([agent, tokens]) => ({ agent, tokens }))
      .sort((a, b) => b.tokens - a.tokens)
      .slice(0, limit);
  }

  private getCacheStats(): {
    size: number;
    totalSaved: number;
    hitRate: number;
  } {
    const totalSaved = Array.from(this.promptCache.values()).reduce(
      (sum, cache) => sum + cache.tokensSaved * cache.accessCount,
      0
    );

    const totalAccesses = Array.from(this.promptCache.values()).reduce(
      (sum, cache) => sum + cache.accessCount,
      0
    );

    return {
      size: this.promptCache.size,
      totalSaved,
      hitRate: totalAccesses > 0 ? totalAccesses / (totalAccesses + this.usageLog.length) : 0,
    };
  }

  async clearCache(): Promise<void> {
    this.promptCache.clear();
    const cacheFile = join(this.cacheDir, 'prompt-cache.json');
    if (existsSync(cacheFile)) {
      writeFileSync(cacheFile, '{}', 'utf-8');
    }
  }

  async setBudget(limit: number, period: TokenBudget['period']): Promise<void> {
    this.budget = {
      limit,
      used: this.budget.used,
      remaining: limit - this.budget.used,
      period,
    };
  }

  getBudget(): TokenBudget {
    return { ...this.budget };
  }
}
