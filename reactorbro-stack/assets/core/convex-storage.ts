/**
 * Convex Storage Adapter for Asset Manager
 * Provides Convex-backed storage with file-based fallback
 */

import { DatabaseManager } from '../../../packages/scripts/src/database/database-manager.js';
import type { Asset, SearchQuery } from './types.js';

export class ConvexAssetStorage {
  private db: DatabaseManager;
  private useConvex: boolean = false;

  constructor() {
    this.db = new DatabaseManager();
  }

  async initialize(): Promise<void> {
    try {
      await this.db.connect();
      if (process.env.CONVEX_URL) {
        try {
          await this.db.queryFunction('assets.list', { limit: 1 });
          this.useConvex = true;
        } catch {
          this.useConvex = false;
        }
      }
    } catch {
      this.useConvex = false;
    }
  }

  /**
   * Save asset to Convex
   */
  async saveAsset(asset: Asset): Promise<void> {
    if (this.useConvex) {
      try {
        const existing = await this.db.queryFunction('assets.get', {
          id: asset.id,
        });

        if (existing) {
          await this.db.mutateFunction('assets.update', {
            id: asset.id,
            updates: {
              name: asset.name,
              tags: asset.tags,
              content: asset.content,
              metadata: asset.metadata,
              status: asset.status,
            },
          });
        } else {
          await this.db.mutateFunction('assets.create', {
            id: asset.id,
            name: asset.name,
            category: asset.category,
            type: asset.type,
            tags: asset.tags,
            content: asset.content,
            metadata: asset.metadata,
            dependencies: asset.dependencies,
            status: asset.status,
          });
        }
      } catch (error) {
        console.warn('Failed to save asset to Convex:', error);
      }
    }
  }

  /**
   * Load asset from Convex
   */
  async loadAsset(assetId: string): Promise<Asset | null> {
    if (this.useConvex) {
      try {
        const asset = await this.db.queryFunction('assets.get', {
          id: assetId,
        });
        if (asset) {
          return {
            id: asset.id,
            name: asset.name,
            category: asset.category,
            type: asset.type,
            tags: asset.tags,
            content: asset.content,
            metadata: asset.metadata,
            dependencies: asset.dependencies,
            status: asset.status,
          };
        }
      } catch (error) {
        console.warn('Failed to load asset from Convex:', error);
      }
    }
    return null;
  }

  /**
   * Search assets in Convex
   */
  async searchAssets(query: SearchQuery): Promise<Asset[]> {
    if (this.useConvex) {
      try {
        const results = await this.db.queryFunction('assets.search', {
          query: query.q,
          category: query.category,
          tags: query.tags,
          limit: query.limit,
        });
        return results.map((a: any) => ({
          id: a.id,
          name: a.name,
          category: a.category,
          type: a.type,
          tags: a.tags,
          content: a.content,
          metadata: a.metadata,
          dependencies: a.dependencies,
          status: a.status,
        }));
      } catch (error) {
        console.warn('Failed to search assets in Convex:', error);
      }
    }
    return [];
  }

  /**
   * List assets by category
   */
  async listByCategory(category: string): Promise<Asset[]> {
    if (this.useConvex) {
      try {
        const results = await this.db.queryFunction('assets.getByCategory', {
          category,
        });
        return results.map((a: any) => ({
          id: a.id,
          name: a.name,
          category: a.category,
          type: a.type,
          tags: a.tags,
          content: a.content,
          metadata: a.metadata,
          dependencies: a.dependencies,
          status: a.status,
        }));
      } catch (error) {
        console.warn('Failed to list assets by category in Convex:', error);
      }
    }
    return [];
  }

  /**
   * Increment download count
   */
  async incrementDownloads(assetId: string): Promise<void> {
    if (this.useConvex) {
      try {
        await this.db.mutateFunction('assets.incrementDownloads', {
          id: assetId,
        });
      } catch (error) {
        console.warn('Failed to increment downloads in Convex:', error);
      }
    }
  }

  /**
   * Delete asset from Convex
   */
  async deleteAsset(assetId: string): Promise<void> {
    if (this.useConvex) {
      try {
        await this.db.mutateFunction('assets.deleteAsset', {
          id: assetId,
        });
      } catch (error) {
        console.warn('Failed to delete asset from Convex:', error);
      }
    }
  }
}

