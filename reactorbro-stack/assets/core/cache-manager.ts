import type { CacheEntry, CacheStats, CachePolicy } from './types';

export class CacheManager {
  private cache: Map<string, CacheEntry> = new Map();
  private policy: CachePolicy = {
    maxSize: 100 * 1024 * 1024, // 100MB
    maxAge: 3600000, // 1 hour
    strategy: 'lru',
    compression: false,
  };

  async set(key: string, value: any): Promise<void> {
    const entry: CacheEntry = {
      key,
      value,
      size: JSON.stringify(value).length,
      hits: 0,
      created: new Date(),
      accessed: new Date(),
      expires: new Date(Date.now() + this.policy.maxAge),
      tags: [],
    };

    // Check size limit
    if (this.getTotalSize() + entry.size > this.policy.maxSize) {
      await this.evict();
    }

    this.cache.set(key, entry);
  }

  async get(key: string): Promise<any> {
    const entry = this.cache.get(key);

    if (!entry) return null;

    // Check expiration
    if (entry.expires < new Date()) {
      this.cache.delete(key);
      return null;
    }

    entry.hits++;
    entry.accessed = new Date();

    return entry.value;
  }

  async invalidate(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  async getStats(): Promise<CacheStats> {
    const entries = Array.from(this.cache.values());
    const totalSize = this.getTotalSize();

    const hits = entries.reduce((sum, e) => sum + e.hits, 0);
    const hitRate = hits / (hits + entries.length);

    return {
      total: this.policy.maxSize,
      used: totalSize,
      available: this.policy.maxSize - totalSize,
      hitRate: hitRate || 0,
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
      // Evict least recently used
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
