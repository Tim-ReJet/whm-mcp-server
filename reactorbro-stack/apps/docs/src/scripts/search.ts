/**
 * Documentation Search
 * Client-side search functionality for documentation
 */

export interface SearchResult {
  title: string;
  slug: string;
  description?: string;
  category?: string;
  content?: string;
  score?: number;
}

export class DocSearch {
  private index: SearchResult[] = [];
  private searchInput: HTMLInputElement | null = null;
  private resultsContainer: HTMLElement | null = null;
  private searchHistory: string[] = [];
  private maxHistorySize: number = 10;

  constructor(searchInputId: string, resultsContainerId: string) {
    this.searchInput = document.getElementById(searchInputId) as HTMLInputElement;
    this.resultsContainer = document.getElementById(resultsContainerId);

    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        this.handleSearch((e.target as HTMLInputElement).value);
      });

      // Load search history from localStorage
      this.loadHistory();
    }
  }

  /**
   * Initialize search index
   */
  async initializeIndex(docs: SearchResult[]): Promise<void> {
    this.index = docs;
  }

  /**
   * Handle search input
   */
  private handleSearch(query: string, filters?: { category?: string }): void {
    if (!query || query.trim().length === 0) {
      this.clearResults();
      return;
    }

    // Save to history
    this.addToHistory(query);

    const results = this.search(query, filters);
    this.displayResults(results);
  }

  /**
   * Search the index
   */
  private search(query: string, filters?: { category?: string }): SearchResult[] {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const results: SearchResult[] = [];
    const queryLower = query.toLowerCase();
    const queryTokens = queryLower.split(/\s+/);

    for (const doc of this.index) {
      // Apply category filter if provided
      if (filters?.category && doc.category !== filters.category) {
        continue;
      }

      const score = this.calculateScore(doc, query);
      if (score > 0) {
        results.push({ ...doc, score });
      }
    }

    return results.sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 10);
  }

  /**
   * Calculate search score
   */
  private calculateScore(doc: SearchResult, query: string): number {
    let score = 0;
    const queryLower = query.toLowerCase();
    const queryTokens = queryLower.split(/\s+/);

    // Title match (highest weight)
    if (doc.title.toLowerCase().includes(queryLower)) {
      score += 10;
    } else {
      // Partial title matches
      for (const token of queryTokens) {
        if (doc.title.toLowerCase().includes(token)) {
          score += 5;
        }
      }
    }

    // Description match
    if (doc.description?.toLowerCase().includes(queryLower)) {
      score += 5;
    } else if (doc.description) {
      for (const token of queryTokens) {
        if (doc.description.toLowerCase().includes(token)) {
          score += 2;
        }
      }
    }

    // Content match
    if (doc.content?.toLowerCase().includes(queryLower)) {
      score += 1;
    } else if (doc.content) {
      for (const token of queryTokens) {
        if (doc.content.toLowerCase().includes(token)) {
          score += 0.5;
        }
      }
    }

    // Category match
    if (doc.category?.toLowerCase().includes(queryLower)) {
      score += 3;
    }

    return score;
  }

  /**
   * Get search suggestions
   */
  getSuggestions(partialQuery: string, limit: number = 5): string[] {
    if (!partialQuery || partialQuery.trim().length === 0) {
      return this.searchHistory.slice(0, limit);
    }

    const suggestions = new Set<string>();
    const lowerQuery = partialQuery.toLowerCase();

    // Get matching queries from history
    for (const historyQuery of this.searchHistory) {
      if (historyQuery.toLowerCase().startsWith(lowerQuery)) {
        suggestions.add(historyQuery);
        if (suggestions.size >= limit) break;
      }
    }

    // Get matching titles from index
    for (const doc of this.index) {
      if (doc.title.toLowerCase().includes(lowerQuery)) {
        suggestions.add(doc.title);
        if (suggestions.size >= limit) break;
      }
    }

    return Array.from(suggestions).slice(0, limit);
  }

  /**
   * Add query to history
   */
  private addToHistory(query: string): void {
    // Remove if already exists
    this.searchHistory = this.searchHistory.filter(q => q !== query);

    // Add to beginning
    this.searchHistory.unshift(query);

    // Limit history size
    if (this.searchHistory.length > this.maxHistorySize) {
      this.searchHistory = this.searchHistory.slice(0, this.maxHistorySize);
    }

    // Save to localStorage
    this.saveHistory();
  }

  /**
   * Load history from localStorage
   */
  private loadHistory(): void {
    try {
      const stored = localStorage.getItem('doc-search-history');
      if (stored) {
        this.searchHistory = JSON.parse(stored);
      }
    } catch (error) {
      this.searchHistory = [];
    }
  }

  /**
   * Save history to localStorage
   */
  private saveHistory(): void {
    try {
      localStorage.setItem('doc-search-history', JSON.stringify(this.searchHistory));
    } catch (error) {
      // Silently fail if localStorage is not available
    }
  }

  /**
   * Display search results
   */
  private displayResults(results: SearchResult[]): void {
    if (!this.resultsContainer) {
      return;
    }

    if (results.length === 0) {
      this.resultsContainer.innerHTML = '<p class="text-gray-500">No results found</p>';
      return;
    }

    const html = results
      .map(
        (result) => `
      <a href="/docs/${result.slug}" class="block p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors mb-2">
        <h3 class="text-lg font-semibold mb-1">${result.title}</h3>
        ${result.description ? `<p class="text-sm text-gray-600 dark:text-gray-400">${result.description}</p>` : ''}
      </a>
    `
      )
      .join('');

    this.resultsContainer.innerHTML = html;
  }

  /**
   * Clear search results
   */
  private clearResults(): void {
    if (this.resultsContainer) {
      this.resultsContainer.innerHTML = '';
    }
  }
}

export default DocSearch;

