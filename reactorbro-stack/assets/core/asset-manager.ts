import type { Asset, SearchQuery, SearchResult, RegistryStats, AssetCategory } from './types';
import { AssetRegistry } from './registry';
import { VersionControl } from './version-control';
import { DependencyManager } from './dependency-manager';
import { SearchEngine } from './search-engine';
import { CacheManager } from './cache-manager';
import { ImportExport } from './import-export';
import { SearchHistoryManager } from './search-history';
import { AssetNotFoundError } from './types';
import { ConvexAssetStorage } from './convex-storage';
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';

/**
 * Main Asset Manager
 * Coordinates all asset management operations
 */
export class AssetManager {
  private registry: AssetRegistry;
  private versionControl: VersionControl;
  private dependencyManager: DependencyManager;
  private searchEngine: SearchEngine;
  private cacheManager: CacheManager;
  private importExport: ImportExport;
  private searchHistory: SearchHistoryManager;
  private convexStorage?: ConvexAssetStorage;
  private storageDir: string;

  constructor(storageDir?: string) {
    this.storageDir = storageDir || join(process.cwd(), 'assets');
    this.ensureStorageDir();

    this.registry = new AssetRegistry();
    this.versionControl = new VersionControl(join(this.storageDir, 'metadata/versions'));
    this.dependencyManager = new DependencyManager();
    this.searchEngine = new SearchEngine();
    this.cacheManager = new CacheManager();
    this.importExport = new ImportExport(join(this.storageDir, 'exports'));
    this.searchHistory = new SearchHistoryManager(this.storageDir);

    // Initialize Convex storage if available
    if (process.env.CONVEX_URL) {
      this.convexStorage = new ConvexAssetStorage();
      this.convexStorage.initialize().catch(() => {
        // Silently fail, will use file-based storage
      });
    }

    // Link dependency manager to registry
    this.dependencyManager.setAssetRegistry(this.getAssetMap());

    // Link search engine to asset map
    this.searchEngine.setAssetMap(this.getAssetMap());
  }

  private ensureStorageDir(): void {
    const dirs = [
      this.storageDir,
      join(this.storageDir, 'library'),
      join(this.storageDir, 'metadata'),
      join(this.storageDir, 'cache'),
    ];

    for (const dir of dirs) {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
    }
  }

  private getAssetMap(): Map<string, Asset> {
    // Access private assets map from registry
    return (this.registry as any).assets as Map<string, Asset>;
  }

  /**
   * Register a new asset
   */
  async registerAsset(asset: Asset): Promise<void> {
    await this.registry.register(asset);
    await this.searchEngine.indexAsset(asset);

    // Create initial version
    await this.versionControl.createVersion(asset.id, asset, 'Initial version');

    // Save to Convex if available
    if (this.convexStorage) {
      await this.convexStorage.saveAsset(asset).catch(() => {
        // Silently fail, file-based storage will be used
      });
    }
  }

  /**
   * Get asset by ID
   */
  async getAsset(assetId: string): Promise<Asset> {
    // Check cache first
    const cached = await this.cacheManager.get(`asset:${assetId}`);
    if (cached) {
      return cached;
    }

    // Try Convex first if available
    if (this.convexStorage) {
      const convexAsset = await this.convexStorage.loadAsset(assetId);
      if (convexAsset) {
        // Update registry and cache
        await this.registry.register(convexAsset);
        await this.cacheManager.set(`asset:${assetId}`, convexAsset);
        return convexAsset;
      }
    }

    const asset = await this.registry.get(assetId);

    // Cache asset
    await this.cacheManager.set(`asset:${assetId}`, asset);

    return asset;
  }

  /**
   * Update asset
   */
  async updateAsset(assetId: string, updates: Partial<Asset>, changelog: string = 'Updated'): Promise<void> {
    const currentAsset = await this.getAsset(assetId);
    const updatedAsset = { ...currentAsset, ...updates };

    await this.registry.update(assetId, updates);
    await this.searchEngine.indexAsset(updatedAsset);

    // Create new version
    await this.versionControl.createVersion(assetId, updatedAsset, changelog);

    // Invalidate cache
    await this.cacheManager.invalidate(`asset:${assetId}`);

    // Update in Convex if available
    if (this.convexStorage) {
      await this.convexStorage.saveAsset(updatedAsset).catch(() => {
        // Silently fail
      });
    }
  }

  /**
   * Delete asset
   */
  async deleteAsset(assetId: string): Promise<void> {
    // Check for dependents
    const dependents = await this.dependencyManager.getDependents(assetId);
    if (dependents.length > 0) {
      throw new Error(`Cannot delete asset: ${dependents.length} assets depend on it`);
    }

    await this.registry.delete(assetId);
    await this.cacheManager.invalidate(`asset:${assetId}`);

    // Delete from Convex if available
    if (this.convexStorage) {
      await this.convexStorage.deleteAsset(assetId).catch(() => {
        // Silently fail
      });
    }
  }

  /**
   * Search assets
   */
  async searchAssets(query: SearchQuery): Promise<SearchResult[]> {
    // Try Convex search first if available
    if (this.convexStorage) {
      const convexAssets = await this.convexStorage.searchAssets(query);
      if (convexAssets.length > 0) {
        // Update registry with results
        for (const asset of convexAssets) {
          await this.registry.register(asset);
        }

        // Record search in history
        this.searchHistory.addSearch(
          query.q || '',
          {
            category: query.category,
            tags: query.tags,
            author: query.author,
            minRating: query.minRating,
          },
          convexAssets.length
        );

        // Convert to SearchResult format
        return convexAssets.map(asset => ({
          asset,
          score: 1.0,
          highlights: [],
        }));
      }
    }

    // Fallback to local search
    const results = await this.searchEngine.search(query.q || '', query);

    // Record search in history
    this.searchHistory.addSearch(
      query.q || '',
      {
        category: query.category,
        tags: query.tags,
        author: query.author,
        minRating: query.minRating,
      },
      results.length
    );

    return results;
  }

  /**
   * Get search suggestions
   */
  getSearchSuggestions(partialQuery: string, limit: number = 5): string[] {
    return this.searchHistory.getSuggestions(partialQuery, limit);
  }

  /**
   * Get search history
   */
  getSearchHistory(limit: number = 10) {
    return this.searchHistory.getRecent(limit);
  }

  /**
   * Get popular searches
   */
  getPopularSearches(limit: number = 10): string[] {
    return this.searchHistory.getPopular(limit);
  }

  /**
   * Clear search history
   */
  clearSearchHistory(): void {
    this.searchHistory.clearHistory();
  }

  /**
   * Get assets by category
   */
  async getAssetsByCategory(category: AssetCategory): Promise<Asset[]> {
    // Try Convex first if available
    if (this.convexStorage) {
      const convexAssets = await this.convexStorage.listByCategory(category);
      if (convexAssets.length > 0) {
        // Update registry with results
        for (const asset of convexAssets) {
          await this.registry.register(asset);
        }
        return convexAssets;
      }
    }

    return await this.registry.getByCategory(category);
  }

  /**
   * Add dependency
   */
  async addDependency(assetId: string, dependsOn: string, version: string): Promise<void> {
    await this.dependencyManager.addDependency(assetId, dependsOn, version);

    // Update asset
    const asset = await this.getAsset(assetId);
    if (!asset.dependencies.includes(dependsOn)) {
      asset.dependencies.push(dependsOn);
      await this.updateAsset(assetId, { dependencies: asset.dependencies }, `Added dependency: ${dependsOn}`);
    }
  }

  /**
   * Get dependency graph
   */
  async getDependencyGraph(assetId: string): Promise<any> {
    return await this.dependencyManager.buildGraph(assetId);
  }

  /**
   * Detect conflicts
   */
  async detectConflicts(assetIds: string[]): Promise<any[]> {
    return await this.dependencyManager.detectConflicts(assetIds);
  }

  /**
   * Resolve dependencies
   */
  async resolveDependencies(assetId: string): Promise<Asset[]> {
    return await this.dependencyManager.resolve(assetId);
  }

  /**
   * Export asset
   */
  async exportAsset(assetId: string, format: 'json' | 'zip' = 'json', includeDependencies: boolean = false): Promise<string> {
    const asset = await this.getAsset(assetId);
    return await this.importExport.exportAsset(asset, format, includeDependencies);
  }

  /**
   * Import asset
   */
  async importAsset(filepath: string): Promise<Asset[]> {
    const assets = await this.importExport.importAsset(filepath);

    for (const asset of assets) {
      try {
        await this.registerAsset(asset);
      } catch (error: any) {
        if (error.message.includes('already exists')) {
          // Update existing asset
          await this.updateAsset(asset.id, asset, 'Imported update');
        } else {
          throw error;
        }
      }
    }

    return assets;
  }

  /**
   * Create package
   */
  async createPackage(assetIds: string[], metadata: Partial<any>): Promise<any> {
    const assets: Asset[] = [];
    for (const id of assetIds) {
      assets.push(await this.getAsset(id));
    }

    return await this.importExport.createPackage(assets, metadata);
  }

  /**
   * Get versions
   */
  async getVersions(assetId: string): Promise<any[]> {
    return await this.versionControl.getVersions(assetId);
  }

  /**
   * Rollback to version
   */
  async rollbackToVersion(assetId: string, versionId: string): Promise<void> {
    const snapshot = await this.versionControl.rollback(assetId, versionId);
    await this.updateAsset(assetId, snapshot, `Rolled back to version ${versionId}`);
  }

  /**
   * Get statistics
   */
  async getStats(): Promise<RegistryStats> {
    return await this.registry.getStats();
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<any> {
    return await this.cacheManager.getStats();
  }

  /**
   * Load assets from storage
   */
  async loadFromStorage(): Promise<void> {
    const libraryDir = join(this.storageDir, 'library');
    if (!existsSync(libraryDir)) {
      return;
    }

    // Load assets from library directories
    const categories = readdirSync(libraryDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const category of categories) {
      const categoryDir = join(libraryDir, category);
      await this.loadCategory(categoryDir, category as AssetCategory);
    }
  }

  private async loadCategory(dir: string, category: AssetCategory): Promise<void> {
    const files = readdirSync(dir, { recursive: true })
      .filter((f): f is string => typeof f === 'string' && f.endsWith('.json'));

    for (const file of files) {
      const filepath = join(dir, file);
      try {
        const content = readFileSync(filepath, 'utf-8');
        const asset = JSON.parse(content) as Asset;
        asset.category = category;

        try {
          await this.registerAsset(asset);
        } catch (error: any) {
          if (!error.message.includes('already exists')) {
            console.warn(`Failed to load asset from ${filepath}:`, error.message);
          }
        }
      } catch (error) {
        console.warn(`Failed to parse asset file ${filepath}:`, error);
      }
    }
  }
}

