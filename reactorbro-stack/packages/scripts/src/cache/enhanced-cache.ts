/**
 * Enhanced Cache Manager
 * Supports both in-memory and Redis caching with automatic fallback
 */

import type { CacheEntry, CacheStats, CachePolicy } from '../assets/core/types.js';

export interface CacheAdapter {
  get(key: string): Promise<any>;
  set(key: string, value: any, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  keys(pattern?: string): Promise<string[]>;
  exists(key: string): Promise<boolean>;
  getStats(): Promise<CacheStats>;
}

/**
 * In-memory cache adapter (fallback)
 */
export class MemoryCacheAdapter implements CacheAdapter {
  private cache: Map<string, CacheEntry> = new Map();
  private policy: CachePolicy;

  constructor(policy?: Partial<CachePolicy>) {
    this.policy = {
      maxSize: policy?.maxSize || 100 * 1024 * 1024, // 100MB
      maxAge: policy?.maxAge || 3600000, // 1 hour
      strategy: policy?.strategy || 'lru',
      compression: policy?.compression || false,
    };
  }

  async get(key: string): Promise<any> {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (entry.expires < new Date()) {
      this.cache.delete(key);
      return null;
    }

    entry.hits++;
    entry.accessed = new Date();
    return entry.value;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const maxAge = ttl || this.policy.maxAge;
    const entry: CacheEntry = {
      key,
      value,
      size: JSON.stringify(value).length,
      hits: 0,
      created: new Date(),
      accessed: new Date(),
      expires: new Date(Date.now() + maxAge),
      tags: [],
    };

    if (this.getTotalSize() + entry.size > this.policy.maxSize) {
      await this.evict();
    }

    this.cache.set(key, entry);
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  async keys(pattern?: string): Promise<string[]> {
    const allKeys = Array.from(this.cache.keys());
    if (!pattern) return allKeys;

    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return allKeys.filter(key => regex.test(key));
  }

  async exists(key: string): Promise<boolean> {
    return this.cache.has(key);
  }

  async getStats(): Promise<CacheStats> {
    const entries = Array.from(this.cache.values());
    const totalSize = this.getTotalSize();
    const hits = entries.reduce((sum, e) => sum + e.hits, 0);
    const hitRate = hits / (hits + entries.length) || 0;

    return {
      total: this.policy.maxSize,
      used: totalSize,
      available: this.policy.maxSize - totalSize,
      hitRate,
      entries: entries.length,
    };
  }

  private getTotalSize(): number {
    return Array.from(this.cache.values()).reduce(
      (sum, entry) => sum + entry.size,
      0
    );
  }

  private async evict(): Promise<void> {
    if (this.policy.strategy === 'lru') {
      let oldest: CacheEntry | null = null;
      let oldestKey: string | null = null;

      for (const [key, entry] of this.cache.entries()) {
        if (!oldest || entry.accessed < oldest.accessed) {
          oldest = entry;
          oldestKey = key;
        }
      }

      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
  }
}

/**
 * Redis cache adapter (optional, requires ioredis)
 */
export class RedisCacheAdapter implements CacheAdapter {
  private redis: any;
  private connected: boolean = false;

  constructor(redisUrl?: string) {
    // Lazy load Redis to avoid requiring it if not used
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Redis = require('ioredis');
      this.redis = new Redis(redisUrl || 'redis://localhost:6379');

      this.redis.on('connect', () => {
        this.connected = true;
      });

      this.redis.on('error', () => {
        this.connected = false;
      });
    } catch (error) {
      // Redis not available, will fallback to memory
      this.connected = false;
    }
  }

  async get(key: string): Promise<any> {
    if (!this.connected) return null;

    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    if (!this.connected) return;

    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await this.redis.setex(key, Math.floor(ttl / 1000), serialized);
      } else {
        await this.redis.set(key, serialized);
      }
    } catch {
      // Silently fail, will fallback to memory
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.connected) return;

    try {
      await this.redis.del(key);
    } catch {
      // Silently fail
    }
  }

  async clear(): Promise<void> {
    if (!this.connected) return;

    try {
      await this.redis.flushdb();
    } catch {
      // Silently fail
    }
  }

  async keys(pattern: string = '*'): Promise<string[]> {
    if (!this.connected) return [];

    try {
      return await this.redis.keys(pattern);
    } catch {
      return [];
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.connected) return false;

    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch {
      return false;
    }
  }

  async getStats(): Promise<CacheStats> {
    if (!this.connected) {
      return {
        total: 0,
        used: 0,
        available: 0,
        hitRate: 0,
        entries: 0,
      };
    }

    try {
      const info = await this.redis.info('memory');
      const dbSize = await this.redis.dbsize();

      // Parse Redis memory info (simplified)
      const usedMatch = info.match(/used_memory:(\d+)/);
      const used = usedMatch ? parseInt(usedMatch[1]) : 0;

      return {
        total: 0, // Redis doesn't expose max memory easily
        used,
        available: 0,
        hitRate: 0, // Would need to track separately
        entries: dbSize,
      };
    } catch {
      return {
        total: 0,
        used: 0,
        available: 0,
        hitRate: 0,
        entries: 0,
      };
    }
  }
}

/**
 * Enhanced Cache Manager with adapter support
 */
export class EnhancedCacheManager {
  private adapter: CacheAdapter;
  private fallbackAdapter: MemoryCacheAdapter;
  private useFallback: boolean = false;

  constructor(adapter?: CacheAdapter, policy?: Partial<CachePolicy>) {
    this.fallbackAdapter = new MemoryCacheAdapter(policy);

    if (adapter) {
      this.adapter = adapter;
    } else {
      // Try Redis first, fallback to memory
      const redisAdapter = new RedisCacheAdapter();
      this.adapter = redisAdapter;
      this.useFallback = true; // Will check connection status
    }
  }

  private async getActiveAdapter(): Promise<CacheAdapter> {
    if (this.adapter instanceof RedisCacheAdapter) {
      // Check if Redis is connected
      const stats = await this.adapter.getStats();
      if (stats.entries === 0 && !(await this.adapter.exists('__health_check__'))) {
        // Try to connect
        try {
          await this.adapter.set('__health_check__', true, 1000);
          await this.adapter.delete('__health_check__');
          return this.adapter;
        } catch {
          return this.fallbackAdapter;
        }
      }
      return this.adapter;
    }
    return this.adapter;
  }

  async get(key: string): Promise<any> {
    const activeAdapter = await this.getActiveAdapter();
    return activeAdapter.get(key);
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const activeAdapter = await this.getActiveAdapter();
    return activeAdapter.set(key, value, ttl);
  }

  async delete(key: string): Promise<void> {
    const activeAdapter = await this.getActiveAdapter();
    return activeAdapter.delete(key);
  }

  async invalidate(pattern: string): Promise<void> {
    const activeAdapter = await this.getActiveAdapter();
    const keys = await activeAdapter.keys(pattern);
    await Promise.all(keys.map(key => activeAdapter.delete(key)));
  }

  async clear(): Promise<void> {
    const activeAdapter = await this.getActiveAdapter();
    return activeAdapter.clear();
  }

  async getStats(): Promise<CacheStats> {
    const activeAdapter = await this.getActiveAdapter();
    return activeAdapter.getStats();
  }

  /**
   * Cache with tags for invalidation
   */
  async cacheWithTags(key: string, value: any, tags: string[], ttl?: number): Promise<void> {
    await this.set(key, value, ttl);

    // Store tag associations
    for (const tag of tags) {
      const tagKey = `tag:${tag}`;
      const taggedKeys = (await this.get(tagKey)) || [];
      if (!taggedKeys.includes(key)) {
        taggedKeys.push(key);
        await this.set(tagKey, taggedKeys, ttl);
      }
    }
  }

  /**
   * Invalidate by tag
   */
  async invalidateByTag(tag: string): Promise<void> {
    const tagKey = `tag:${tag}`;
    const taggedKeys = (await this.get(tagKey)) || [];

    await Promise.all([
      ...taggedKeys.map(key => this.delete(key)),
      this.delete(tagKey),
    ]);
  }
}

export default EnhancedCacheManager;

