import type { ImportData, ExportData, Asset, Package } from './types.js';
import { readFileSync, writeFileSync, existsSync, mkdirSync, createReadStream, createWriteStream } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';
import { createGzip, createGunzip } from 'zlib';
import { pipeline } from 'stream/promises';

export class ImportExport {
  private storageDir: string;

  constructor(storageDir?: string) {
    this.storageDir = storageDir || join(process.cwd(), 'assets/exports');
    this.ensureStorageDir();
  }

  private ensureStorageDir(): void {
    if (!existsSync(this.storageDir)) {
      mkdirSync(this.storageDir, { recursive: true });
    }
  }

  async exportAsset(asset: Asset, format: 'json' | 'zip' = 'json', includeDependencies: boolean = false): Promise<string> {
    const assets: Asset[] = [asset];

    if (includeDependencies) {
      // Would fetch dependencies from registry
      // For now, just export the asset
    }

    const exportData: ExportData = {
      format,
      assets,
      dependencies: includeDependencies,
      metadata: {
        exported: new Date(),
        exporter: 'system',
        version: '1.0.0',
        checksum: this.calculateChecksum(assets),
      },
    };

    const filename = `${asset.id}-${asset.version}.${format === 'zip' ? 'zip' : 'json'}`;
    const filepath = join(this.storageDir, filename);

    if (format === 'json') {
      writeFileSync(filepath, JSON.stringify(exportData, null, 2), 'utf-8');
    } else {
      await this.createZip(filepath, exportData);
    }

    return filepath;
  }

  async exportAssets(assets: Asset[], format: 'json' | 'zip' = 'json'): Promise<string> {
    const exportData: ExportData = {
      format,
      assets,
      dependencies: false,
      metadata: {
        exported: new Date(),
        exporter: 'system',
        version: '1.0.0',
        checksum: this.calculateChecksum(assets),
      },
    };

    const filename = `assets-${Date.now()}.${format === 'zip' ? 'zip' : 'json'}`;
    const filepath = join(this.storageDir, filename);

    if (format === 'json') {
      writeFileSync(filepath, JSON.stringify(exportData, null, 2), 'utf-8');
    } else {
      await this.createZip(filepath, exportData);
    }

    return filepath;
  }

  async importAsset(filepath: string): Promise<Asset[]> {
    if (!existsSync(filepath)) {
      throw new Error(`File not found: ${filepath}`);
    }

    let importData: ImportData;

    if (filepath.endsWith('.zip')) {
      importData = await this.extractZip(filepath);
    } else {
      const content = readFileSync(filepath, 'utf-8');
      importData = JSON.parse(content) as ImportData;
    }

    // Validate format
    if (!importData.assets || !Array.isArray(importData.assets)) {
      throw new Error('Invalid import format: missing assets array');
    }

    // Validate checksum
    const calculatedChecksum = this.calculateChecksum(importData.assets);
    if (importData.metadata && importData.metadata.checksum !== calculatedChecksum) {
      console.warn('Checksum mismatch - file may be corrupted');
    }

    return importData.assets;
  }

  async createPackage(assets: Asset[], metadata: Partial<Package>): Promise<Package> {
    // Build dependency map
    const dependencies: Record<string, string> = {};
    for (const asset of assets) {
      for (const dep of asset.dependencies) {
        const depAsset = assets.find(a => a.id === dep);
        if (depAsset) {
          dependencies[dep] = depAsset.version;
        }
      }
    }

    const pkg: Package = {
      id: this.generateId(),
      name: metadata.name || 'Unnamed Package',
      version: metadata.version || '1.0.0',
      description: metadata.description || '',
      author: metadata.author || 'Unknown',
      assets: assets.map(a => a.id),
      dependencies,
      metadata: {
        created: new Date(),
        updated: new Date(),
        downloads: 0,
        rating: 0,
        license: metadata.metadata?.license || 'MIT',
        homepage: metadata.metadata?.homepage,
        repository: metadata.metadata?.repository,
      },
    };

    // Save package manifest
    const packageFile = join(this.storageDir, `packages/${pkg.id}.json`);
    const packageDir = join(this.storageDir, 'packages');
    if (!existsSync(packageDir)) {
      mkdirSync(packageDir, { recursive: true });
    }
    writeFileSync(packageFile, JSON.stringify(pkg, null, 2), 'utf-8');

    return pkg;
  }

  async exportPackage(packageId: string, format: 'json' | 'zip' = 'zip'): Promise<string> {
    const packageFile = join(this.storageDir, `packages/${packageId}.json`);
    if (!existsSync(packageFile)) {
      throw new Error(`Package not found: ${packageId}`);
    }

    const pkg = JSON.parse(readFileSync(packageFile, 'utf-8')) as Package;

    // Would fetch assets from registry
    // For now, return package file path
    return packageFile;
  }

  private async createZip(filepath: string, data: ExportData): Promise<void> {
    // Simplified zip creation - in production, use archiver or similar
    const content = JSON.stringify(data, null, 2);
    const gzip = createGzip();
    const writeStream = createWriteStream(filepath);

    await pipeline(
      require('stream').Readable.from([content]),
      gzip,
      writeStream
    );
  }

  private async extractZip(filepath: string): Promise<ImportData> {
    // Simplified zip extraction - in production, use extract-zip or similar
    const readStream = createReadStream(filepath);
    const gunzip = createGunzip();
    const chunks: Buffer[] = [];

    await pipeline(
      readStream,
      gunzip,
      async function* (source) {
        for await (const chunk of source) {
          chunks.push(chunk);
        }
      }
    );

    const content = Buffer.concat(chunks).toString('utf-8');
    return JSON.parse(content) as ImportData;
  }

  private calculateChecksum(assets: Asset[]): string {
    const content = JSON.stringify(assets.map(a => ({
      id: a.id,
      version: a.version,
      content: a.content,
    })));
    return createHash('sha256').update(content).digest('hex');
  }

  private generateId(): string {
    return `pkg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
