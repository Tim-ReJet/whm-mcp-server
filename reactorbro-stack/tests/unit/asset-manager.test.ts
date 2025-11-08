import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AssetManager } from '../../../assets/core/asset-manager';
import { createTestEnv } from '../unit/utils';
import type { Asset } from '../../../assets/core/types';

describe('Asset Manager', () => {
  let assetManager: AssetManager;
  let testEnv: ReturnType<typeof createTestEnv>;

  beforeEach(() => {
    testEnv = createTestEnv();
    assetManager = new AssetManager(testEnv.tempDir);
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('Asset Registration', () => {
    it('should register a new asset', async () => {
      const asset: Asset = {
        id: 'test-asset-1',
        name: 'Test Asset',
        description: 'Test description',
        category: 'ui-components',
        type: 'component',
        version: '1.0.0',
        author: 'Test Author',
        tags: ['test', 'component'],
        keywords: ['test'],
        content: { code: 'console.log("test");' },
        metadata: {
          created: new Date(),
          updated: new Date(),
          downloads: 0,
          views: 0,
          rating: 0,
          ratingCount: 0,
          size: 100,
          tested: false,
          license: 'MIT',
        },
        dependencies: [],
        dependents: [],
        files: [],
        status: 'draft',
        visibility: 'public',
      };

      await assetManager.registerAsset(asset);

      const retrieved = await assetManager.getAsset('test-asset-1');
      expect(retrieved).toBeDefined();
      expect(retrieved.name).toBe('Test Asset');
    });

    it('should throw error for duplicate asset', async () => {
      const asset: Asset = {
        id: 'duplicate-asset',
        name: 'Duplicate',
        description: 'Test',
        category: 'ui-components',
        type: 'component',
        version: '1.0.0',
        author: 'Test',
        tags: [],
        keywords: [],
        content: {},
        metadata: {
          created: new Date(),
          updated: new Date(),
          downloads: 0,
          views: 0,
          rating: 0,
          ratingCount: 0,
          size: 0,
          tested: false,
          license: 'MIT',
        },
        dependencies: [],
        dependents: [],
        files: [],
        status: 'draft',
        visibility: 'public',
      };

      await assetManager.registerAsset(asset);

      await expect(assetManager.registerAsset(asset)).rejects.toThrow();
    });
  });

  describe('Asset Search', () => {
    it('should search assets by query', async () => {
      const asset: Asset = {
        id: 'searchable-asset',
        name: 'Searchable Asset',
        description: 'This is a searchable asset',
        category: 'ui-components',
        type: 'component',
        version: '1.0.0',
        author: 'Test',
        tags: ['searchable'],
        keywords: ['search'],
        content: {},
        metadata: {
          created: new Date(),
          updated: new Date(),
          downloads: 0,
          views: 0,
          rating: 0,
          ratingCount: 0,
          size: 0,
          tested: false,
          license: 'MIT',
        },
        dependencies: [],
        dependents: [],
        files: [],
        status: 'draft',
        visibility: 'public',
      };

      await assetManager.registerAsset(asset);

      const results = await assetManager.searchAssets({ q: 'searchable' });
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('Dependency Management', () => {
    it('should add dependency', async () => {
      const asset1: Asset = {
        id: 'asset-1',
        name: 'Asset 1',
        description: 'Test',
        category: 'ui-components',
        type: 'component',
        version: '1.0.0',
        author: 'Test',
        tags: [],
        keywords: [],
        content: {},
        metadata: {
          created: new Date(),
          updated: new Date(),
          downloads: 0,
          views: 0,
          rating: 0,
          ratingCount: 0,
          size: 0,
          tested: false,
          license: 'MIT',
        },
        dependencies: [],
        dependents: [],
        files: [],
        status: 'draft',
        visibility: 'public',
      };

      const asset2: Asset = {
        id: 'asset-2',
        name: 'Asset 2',
        description: 'Test',
        category: 'ui-components',
        type: 'component',
        version: '1.0.0',
        author: 'Test',
        tags: [],
        keywords: [],
        content: {},
        metadata: {
          created: new Date(),
          updated: new Date(),
          downloads: 0,
          views: 0,
          rating: 0,
          ratingCount: 0,
          size: 0,
          tested: false,
          license: 'MIT',
        },
        dependencies: [],
        dependents: [],
        files: [],
        status: 'draft',
        visibility: 'public',
      };

      await assetManager.registerAsset(asset1);
      await assetManager.registerAsset(asset2);
      await assetManager.addDependency('asset-1', 'asset-2', '1.0.0');

      const graph = await assetManager.getDependencyGraph('asset-1');
      expect(graph.edges.length).toBeGreaterThan(0);
    });
  });

  describe('Version Control', () => {
    it('should create versions', async () => {
      const asset: Asset = {
        id: 'versioned-asset',
        name: 'Versioned Asset',
        description: 'Test',
        category: 'ui-components',
        type: 'component',
        version: '1.0.0',
        author: 'Test',
        tags: [],
        keywords: [],
        content: {},
        metadata: {
          created: new Date(),
          updated: new Date(),
          downloads: 0,
          views: 0,
          rating: 0,
          ratingCount: 0,
          size: 0,
          tested: false,
          license: 'MIT',
        },
        dependencies: [],
        dependents: [],
        files: [],
        status: 'draft',
        visibility: 'public',
      };

      await assetManager.registerAsset(asset);

      const versions = await assetManager.getVersions('versioned-asset');
      expect(versions.length).toBeGreaterThan(0);
    });
  });
});

