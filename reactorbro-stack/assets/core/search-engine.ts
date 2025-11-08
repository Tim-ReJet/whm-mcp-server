import type { SearchQuery, SearchResult, Asset, SearchIndex, AssetCategory, SortField } from './types.js';

export class SearchEngine {
  private index: Map<string, SearchIndex> = new Map();
  private assetMap: Map<string, Asset> = new Map();

  setAssetMap(assetMap: Map<string, Asset>): void {
    this.assetMap = assetMap;
  }

  async indexAsset(asset: Asset): Promise<void> {
    const searchIndex: SearchIndex = {
      assetId: asset.id,
      content: this.extractContent(asset),
      tokens: this.tokenize(asset.name + ' ' + asset.description + ' ' + asset.tags.join(' ')),
      metadata: {
        category: asset.category,
        tags: asset.tags,
        rating: asset.metadata.rating,
        author: asset.author,
        status: asset.status,
        createdAt: asset.metadata.created,
        updatedAt: asset.metadata.updated,
        downloads: asset.metadata.downloads,
      },
    };

    this.index.set(asset.id, searchIndex);
    this.assetMap.set(asset.id, asset);
  }

  async search(query: string, options?: Partial<SearchQuery>): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    const queryTokens = this.tokenize(query || '');
    const searchOptions: SearchQuery = {
      q: query || '',
      category: options?.category,
      tags: options?.tags,
      author: options?.author,
      minRating: options?.minRating,
      sortBy: options?.sortBy || 'relevance',
      sortOrder: options?.sortOrder || 'desc',
      limit: options?.limit || 20,
      offset: options?.offset || 0,
    };

    for (const [assetId, searchIndex] of this.index.entries()) {
      const asset = this.assetMap.get(assetId);
      if (!asset) continue;

      // Apply filters
      if (!this.matchesFilters(asset, searchIndex, searchOptions)) {
        continue;
      }

      // Calculate relevance score
      const score = queryTokens.length > 0
        ? this.calculateScore(queryTokens, searchIndex)
        : 1; // If no query, all assets match

      if (score > 0 || queryTokens.length === 0) {
        results.push({
          asset,
          score,
          highlights: this.getHighlights(query, searchIndex.content),
        });
      }
    }

    // Sort results
    const sorted = this.sortResults(results, searchOptions.sortBy!, searchOptions.sortOrder!);

    // Apply pagination
    return sorted.slice(searchOptions.offset, searchOptions.offset! + searchOptions.limit!);
  }

  private matchesFilters(asset: Asset, searchIndex: SearchIndex, options: SearchQuery): boolean {
    // Category filter
    if (options.category && asset.category !== options.category) {
      return false;
    }

    // Tags filter
    if (options.tags && options.tags.length > 0) {
      const hasAllTags = options.tags.every(tag => asset.tags.includes(tag));
      if (!hasAllTags) {
        return false;
      }
    }

    // Author filter
    if (options.author && asset.author !== options.author) {
      return false;
    }

    // Rating filter
    if (options.minRating !== undefined && asset.metadata.rating < options.minRating) {
      return false;
    }

    return true;
  }

  private sortResults(results: SearchResult[], sortBy: SortField, sortOrder: 'asc' | 'desc'): SearchResult[] {
    const sorted = [...results].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'relevance':
          comparison = b.score - a.score;
          break;
        case 'created':
          comparison = a.asset.metadata.created.getTime() - b.asset.metadata.created.getTime();
          break;
        case 'updated':
          comparison = a.asset.metadata.updated.getTime() - b.asset.metadata.updated.getTime();
          break;
        case 'rating':
          comparison = b.asset.metadata.rating - a.asset.metadata.rating;
          break;
        case 'downloads':
          comparison = b.asset.metadata.downloads - a.asset.metadata.downloads;
          break;
        default:
          comparison = b.score - a.score;
      }

      return sortOrder === 'asc' ? -comparison : comparison;
    });

    return sorted;
  }

  async reindex(): Promise<void> {
    this.index.clear();
  }

  private extractContent(asset: Asset): string {
    return `${asset.name} ${asset.description} ${asset.tags.join(' ')}`;
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .split(/\W+/)
      .filter(token => token.length > 2);
  }

  private calculateScore(queryTokens: string[], searchIndex: SearchIndex): number {
    let score = 0;
    const tokenCounts = new Map<string, number>();

    // Count token occurrences
    for (const token of searchIndex.tokens) {
      tokenCounts.set(token, (tokenCounts.get(token) || 0) + 1);
    }

    // Calculate score with weights
    for (const token of queryTokens) {
      const count = tokenCounts.get(token) || 0;
      if (count > 0) {
        // Boost score for exact matches in name
        if (searchIndex.content.toLowerCase().includes(token)) {
          score += count * 2; // Higher weight for content matches
        } else {
          score += count;
        }
      }
    }

    // Boost score for exact phrase matches
    const queryLower = queryTokens.join(' ').toLowerCase();
    if (searchIndex.content.toLowerCase().includes(queryLower)) {
      score += 5; // Significant boost for phrase matches
    }

    // Normalize score
    return score / Math.max(queryTokens.length, 1);
  }

  private getHighlights(query: string, content: string): string[] {
    const highlights: string[] = [];
    const queryLower = query.toLowerCase();
    const contentLower = content.toLowerCase();

    const index = contentLower.indexOf(queryLower);
    if (index !== -1) {
      const start = Math.max(0, index - 20);
      const end = Math.min(content.length, index + query.length + 20);
      highlights.push('...' + content.substring(start, end) + '...');
    }

    return highlights;
  }
}
