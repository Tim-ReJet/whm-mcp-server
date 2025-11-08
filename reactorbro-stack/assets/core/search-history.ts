/**
 * Search History Manager
 * Tracks and manages search history
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export interface SearchHistoryEntry {
  query: string;
  filters?: {
    category?: string;
    tags?: string[];
    author?: string;
    minRating?: number;
  };
  timestamp: Date;
  resultCount: number;
}

export class SearchHistoryManager {
  private history: SearchHistoryEntry[] = [];
  private maxHistorySize = 50;
  private storagePath: string;

  constructor(storageDir?: string) {
    this.storagePath = join(storageDir || process.cwd(), ".assets", "search-history.json");
    this.loadHistory();
  }

  /**
   * Add a search to history
   */
  addSearch(query: string, filters?: SearchHistoryEntry["filters"], resultCount = 0): void {
    const entry: SearchHistoryEntry = {
      query,
      filters,
      timestamp: new Date(),
      resultCount,
    };

    // Remove duplicate queries (keep most recent)
    this.history = this.history.filter((e) => e.query !== query);

    // Add to beginning
    this.history.unshift(entry);

    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(0, this.maxHistorySize);
    }

    this.saveHistory();
  }

  /**
   * Get recent searches
   */
  getRecent(limit = 10): SearchHistoryEntry[] {
    return this.history.slice(0, limit);
  }

  /**
   * Get popular searches (by frequency)
   */
  getPopular(limit = 10): string[] {
    const queryCounts = new Map<string, number>();

    for (const entry of this.history) {
      queryCounts.set(entry.query, (queryCounts.get(entry.query) || 0) + 1);
    }

    return Array.from(queryCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([query]) => query);
  }

  /**
   * Clear history
   */
  clearHistory(): void {
    this.history = [];
    this.saveHistory();
  }

  /**
   * Get suggestions based on partial query
   */
  getSuggestions(partialQuery: string, limit = 5): string[] {
    const suggestions = new Set<string>();
    const lowerQuery = partialQuery.toLowerCase();

    // Get matching queries from history
    for (const entry of this.history) {
      if (entry.query.toLowerCase().startsWith(lowerQuery)) {
        suggestions.add(entry.query);
        if (suggestions.size >= limit) break;
      }
    }

    // Get popular searches that match
    const popular = this.getPopular(limit * 2);
    for (const query of popular) {
      if (query.toLowerCase().includes(lowerQuery)) {
        suggestions.add(query);
        if (suggestions.size >= limit) break;
      }
    }

    return Array.from(suggestions).slice(0, limit);
  }

  /**
   * Load history from storage
   */
  private loadHistory(): void {
    if (!existsSync(this.storagePath)) {
      return;
    }

    try {
      const data = readFileSync(this.storagePath, "utf-8");
      const parsed = JSON.parse(data);
      this.history = parsed.map((entry: SearchHistoryEntry & { timestamp: string }) => ({
        ...entry,
        timestamp: new Date(entry.timestamp),
      }));
    } catch {
      // If loading fails, start with empty history
      this.history = [];
    }
  }

  /**
   * Save history to storage
   */
  private saveHistory(): void {
    try {
      const dir = join(this.storagePath, "..");
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }

      writeFileSync(this.storagePath, JSON.stringify(this.history, null, 2));
    } catch (error) {
      // Silently fail if saving doesn't work
      console.error("Failed to save search history:", error);
    }
  }
}
