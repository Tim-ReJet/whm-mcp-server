import type { Asset, SearchQuery, SearchResult, RegistryStats } from './types.js';
import { AssetNotFoundError } from './types.js';

export class AssetRegistry {
  private assets: Map<string, Asset> = new Map();

  async register(asset: Asset): Promise<void> {
    if (this.assets.has(asset.id)) {
      throw new Error(`Asset ${asset.id} already exists`);
    }

    this.assets.set(asset.id, asset);
  }

  async get(assetId: string): Promise<Asset> {
    const asset = this.assets.get(assetId);
    if (!asset) throw new AssetNotFoundError(assetId);

    return asset;
  }

  async update(assetId: string, updates: Partial<Asset>): Promise<void> {
    const asset = await this.get(assetId);
    Object.assign(asset, updates);
    asset.metadata.updated = new Date();
  }

  async delete(assetId: string): Promise<void> {
    if (!this.assets.has(assetId)) {
      throw new AssetNotFoundError(assetId);
    }

    this.assets.delete(assetId);
  }

  async search(query: SearchQuery): Promise<Asset[]> {
    const results: Asset[] = [];

    for (const asset of this.assets.values()) {
      if (this.matchesQuery(asset, query)) {
        results.push(asset);
      }
    }

    return results.slice(0, query.limit || 20);
  }

  async getByCategory(category: Asset['category']): Promise<Asset[]> {
    return Array.from(this.assets.values()).filter(
      asset => asset.category === category
    );
  }

  async getStats(): Promise<RegistryStats> {
    const assets = Array.from(this.assets.values());

    return {
      total: assets.length,
      byCategory: this.groupByCategory(assets),
      byStatus: this.groupByStatus(assets),
      storage: {
        used: 0,
        available: 0,
      },
    };
  }

  private matchesQuery(asset: Asset, query: SearchQuery): boolean {
    if (query.category && asset.category !== query.category) {
      return false;
    }

    if (query.tags && query.tags.length > 0) {
      const hasTag = query.tags.some(tag => asset.tags.includes(tag));
      if (!hasTag) return false;
    }

    if (query.q) {
      const searchText = `${asset.name} ${asset.description}`.toLowerCase();
      if (!searchText.includes(query.q.toLowerCase())) {
        return false;
      }
    }

    return true;
  }

  private groupByCategory(assets: Asset[]): Record<string, number> {
    return assets.reduce((acc, asset) => {
      acc[asset.category] = (acc[asset.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private groupByStatus(assets: Asset[]): Record<string, number> {
    return assets.reduce((acc, asset) => {
      acc[asset.status] = (acc[asset.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
}
