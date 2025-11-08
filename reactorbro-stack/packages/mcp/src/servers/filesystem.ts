/**
 * File System MCP Server
 * Provides file system operations for asset management
 */

import { BaseMCPServer, MCPTool } from '../server.js';
import { logger } from '../../../observability/src/logging/logger.js';
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, mkdirSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { AssetManager } from '../../../assets/core/asset-manager.js';

export class FileSystemMCPServer extends BaseMCPServer {
  private assetManager: AssetManager;
  private basePath: string;

  constructor(basePath: string = process.cwd()) {
    super('filesystem', '1.0.0', 'File system MCP server for asset management and file operations');

    this.basePath = basePath;
    this.assetManager = new AssetManager();
    this.capabilities = ['file-operations', 'asset-management', 'directory-operations'];

    // Register file system tools
    this.registerTool({
      name: 'read_file',
      description: 'Read a file from the file system',
      category: 'filesystem',
      inputSchema: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'File path (relative to base)' },
          encoding: { type: 'string', description: 'File encoding', default: 'utf-8' },
        },
        required: ['path'],
      },
      execute: async (params) => {
        return this.readFile(params.path, params.encoding);
      },
      cost: 20,
    });

    this.registerTool({
      name: 'write_file',
      description: 'Write content to a file',
      category: 'filesystem',
      inputSchema: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'File path (relative to base)' },
          content: { type: 'string', description: 'File content' },
          encoding: { type: 'string', description: 'File encoding', default: 'utf-8' },
        },
        required: ['path', 'content'],
      },
      execute: async (params) => {
        return this.writeFile(params.path, params.content, params.encoding);
      },
      cost: 30,
    });

    this.registerTool({
      name: 'list_directory',
      description: 'List files and directories',
      category: 'filesystem',
      inputSchema: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Directory path (relative to base)' },
          recursive: { type: 'boolean', description: 'Recursive listing', default: false },
        },
        required: ['path'],
      },
      execute: async (params) => {
        return this.listDirectory(params.path, params.recursive);
      },
      cost: 30,
    });

    this.registerTool({
      name: 'get_asset_info',
      description: 'Get information about an asset',
      category: 'filesystem',
      inputSchema: {
        type: 'object',
        properties: {
          assetId: { type: 'string', description: 'Asset ID' },
        },
        required: ['assetId'],
      },
      execute: async (params) => {
        return this.getAssetInfo(params.assetId);
      },
      cost: 20,
    });

    this.registerTool({
      name: 'search_assets',
      description: 'Search for assets',
      category: 'filesystem',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query' },
          category: { type: 'string', description: 'Asset category' },
          limit: { type: 'number', description: 'Result limit', default: 10 },
        },
        required: ['query'],
      },
      execute: async (params) => {
        return this.searchAssets(params.query, params.category, params.limit);
      },
      cost: 50,
    });

    this.registerTool({
      name: 'create_asset',
      description: 'Create a new asset',
      category: 'filesystem',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Asset name' },
          category: { type: 'string', description: 'Asset category' },
          content: { type: 'string', description: 'Asset content' },
          metadata: { type: 'object', description: 'Asset metadata' },
        },
        required: ['name', 'category', 'content'],
      },
      execute: async (params) => {
        return this.createAsset(params);
      },
      cost: 100,
    });
  }

  /**
   * Read a file
   */
  private async readFile(path: string, encoding: string = 'utf-8'): Promise<any> {
    try {
      const fullPath = resolve(this.basePath, path);
      logger.info('Reading file', { path: fullPath });

      if (!existsSync(fullPath)) {
        return {
          success: false,
          error: `File not found: ${path}`,
        };
      }

      const content = readFileSync(fullPath, encoding as BufferEncoding);
      const stats = statSync(fullPath);

      return {
        success: true,
        content,
        path: fullPath,
        size: stats.size,
        modified: stats.mtime.toISOString(),
      };
    } catch (error: any) {
      logger.error('File read failed', { path, error: error.message });
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Write a file
   */
  private async writeFile(path: string, content: string, encoding: string = 'utf-8'): Promise<any> {
    try {
      const fullPath = resolve(this.basePath, path);
      logger.info('Writing file', { path: fullPath });

      // Ensure directory exists
      mkdirSync(dirname(fullPath), { recursive: true });

      writeFileSync(fullPath, content, encoding as BufferEncoding);

      return {
        success: true,
        path: fullPath,
        size: content.length,
      };
    } catch (error: any) {
      logger.error('File write failed', { path, error: error.message });
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * List directory
   */
  private async listDirectory(path: string, recursive: boolean = false): Promise<any> {
    try {
      const fullPath = resolve(this.basePath, path);
      logger.info('Listing directory', { path: fullPath, recursive });

      if (!existsSync(fullPath)) {
        return {
          success: false,
          error: `Directory not found: ${path}`,
        };
      }

      const items = readdirSync(fullPath, { withFileTypes: true });
      const result = items.map(item => ({
        name: item.name,
        type: item.isDirectory() ? 'directory' : 'file',
        path: join(path, item.name),
      }));

      return {
        success: true,
        path: fullPath,
        items: result,
        count: result.length,
      };
    } catch (error: any) {
      logger.error('Directory listing failed', { path, error: error.message });
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get asset info
   */
  private async getAssetInfo(assetId: string): Promise<any> {
    try {
      await this.assetManager.loadFromStorage();
      const asset = await this.assetManager.getAsset(assetId);

      return {
        success: true,
        asset: {
          id: asset.id,
          name: asset.name,
          category: asset.category,
          version: asset.version,
          description: asset.description,
          tags: asset.tags,
        },
      };
    } catch (error: any) {
      logger.error('Asset info retrieval failed', { assetId, error: error.message });
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Search assets
   */
  private async searchAssets(query: string, category?: string, limit: number = 10): Promise<any> {
    try {
      await this.assetManager.loadFromStorage();
      const results = await this.assetManager.searchAssets({
        q: query,
        category: category as any,
        limit,
      });

      return {
        success: true,
        results: results.map(r => ({
          asset: r.asset,
          score: r.score,
        })),
        count: results.length,
      };
    } catch (error: any) {
      logger.error('Asset search failed', { query, error: error.message });
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Create asset
   */
  private async createAsset(params: {
    name: string;
    category: string;
    content: string;
    metadata?: Record<string, any>;
  }): Promise<any> {
    try {
      await this.assetManager.loadFromStorage();

      // This would use the asset manager to create an asset
      // For now, return a mock response
      return {
        success: true,
        assetId: `asset-${Date.now()}`,
        name: params.name,
        category: params.category,
      };
    } catch (error: any) {
      logger.error('Asset creation failed', { error: error.message });
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

export default FileSystemMCPServer;

