import type { Version, Asset, Change } from './types.js';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';

export class VersionControl {
  private versions: Map<string, Version[]> = new Map();
  private branches: Map<string, Branch> = new Map();
  private storageDir: string;

  constructor(storageDir?: string) {
    this.storageDir = storageDir || join(process.cwd(), 'assets/metadata/versions');
    this.ensureStorageDir();
  }

  private ensureStorageDir(): void {
    if (!existsSync(this.storageDir)) {
      mkdirSync(this.storageDir, { recursive: true });
    }
  }

  async createVersion(assetId: string, asset: Asset, changelog: string): Promise<Version> {
    const versions = this.versions.get(assetId) || [];
    const previousVersion = versions[versions.length - 1];

    // Calculate changes
    const changes = previousVersion
      ? await this.calculateChanges(previousVersion.snapshot, asset)
      : [];

    const version: Version = {
      id: this.generateId(),
      assetId,
      version: this.calculateNextVersion(versions),
      changelog,
      changes,
      author: asset.author,
      timestamp: new Date(),
      snapshot: { ...asset },
      tags: [],
    };

    versions.push(version);
    this.versions.set(assetId, versions);

    // Persist version
    await this.saveVersion(version);

    return version;
  }

  async getVersions(assetId: string): Promise<Version[]> {
    // Load from storage if not in memory
    if (!this.versions.has(assetId)) {
      await this.loadVersions(assetId);
    }
    return this.versions.get(assetId) || [];
  }

  async getVersion(assetId: string, versionId: string): Promise<Version | undefined> {
    const versions = await this.getVersions(assetId);
    return versions.find(v => v.id === versionId || v.version === versionId);
  }

  async getLatestVersion(assetId: string): Promise<Version | undefined> {
    const versions = await this.getVersions(assetId);
    return versions[versions.length - 1];
  }

  async rollback(assetId: string, versionId: string): Promise<Asset> {
    const version = await this.getVersion(assetId, versionId);
    if (!version) throw new Error(`Version ${versionId} not found`);

    return { ...version.snapshot };
  }

  async diff(versionAId: string, versionBId: string): Promise<Change[]> {
    const versionA = await this.findVersionById(versionAId);
    const versionB = await this.findVersionById(versionBId);

    if (!versionA || !versionB) {
      throw new Error('One or both versions not found');
    }

    return await this.calculateChanges(versionA.snapshot, versionB.snapshot);
  }

  async createBranch(assetId: string, branchName: string, author: string): Promise<Branch> {
    const versions = await this.getVersions(assetId);
    const latestVersion = versions[versions.length - 1];

    if (!latestVersion) {
      throw new Error(`No versions found for asset ${assetId}`);
    }

    const branch: Branch = {
      id: this.generateId(),
      name: branchName,
      assetId,
      baseVersion: latestVersion.id,
      head: latestVersion.id,
      author,
      created: new Date(),
      status: 'active',
    };

    this.branches.set(branch.id, branch);
    await this.saveBranch(branch);

    return branch;
  }

  async mergeBranch(branchId: string): Promise<void> {
    const branch = this.branches.get(branchId);
    if (!branch) throw new Error(`Branch ${branchId} not found`);

    branch.status = 'merged';
    await this.saveBranch(branch);
  }

  async tagVersion(assetId: string, versionId: string, tag: string): Promise<void> {
    const version = await this.getVersion(assetId, versionId);
    if (!version) throw new Error(`Version ${versionId} not found`);

    if (!version.tags.includes(tag)) {
      version.tags.push(tag);
      await this.saveVersion(version);
    }
  }

  private async calculateChanges(oldAsset: Asset, newAsset: Asset): Promise<Change[]> {
    const changes: Change[] = [];

    // Compare basic fields
    if (oldAsset.name !== newAsset.name) {
      changes.push({
        type: 'modified',
        path: 'name',
        description: `Name changed from "${oldAsset.name}" to "${newAsset.name}"`,
      });
    }

    if (oldAsset.description !== newAsset.description) {
      changes.push({
        type: 'modified',
        path: 'description',
        description: 'Description updated',
      });
    }

    // Compare tags
    const addedTags = newAsset.tags.filter(t => !oldAsset.tags.includes(t));
    const removedTags = oldAsset.tags.filter(t => !newAsset.tags.includes(t));

    addedTags.forEach(tag => {
      changes.push({
        type: 'added',
        path: `tags.${tag}`,
        description: `Tag "${tag}" added`,
      });
    });

    removedTags.forEach(tag => {
      changes.push({
        type: 'removed',
        path: `tags.${tag}`,
        description: `Tag "${tag}" removed`,
      });
    });

    // Compare dependencies
    const addedDeps = newAsset.dependencies.filter(d => !oldAsset.dependencies.includes(d));
    const removedDeps = oldAsset.dependencies.filter(d => !newAsset.dependencies.includes(d));

    addedDeps.forEach(dep => {
      changes.push({
        type: 'added',
        path: `dependencies.${dep}`,
        description: `Dependency "${dep}" added`,
      });
    });

    removedDeps.forEach(dep => {
      changes.push({
        type: 'removed',
        path: `dependencies.${dep}`,
        description: `Dependency "${dep}" removed`,
      });
    });

    // Compare content hash
    const oldHash = this.hashAsset(oldAsset);
    const newHash = this.hashAsset(newAsset);

    if (oldHash !== newHash) {
      changes.push({
        type: 'modified',
        path: 'content',
        description: 'Content modified',
        diff: await this.generateDiff(oldAsset, newAsset),
      });
    }

    return changes;
  }

  private hashAsset(asset: Asset): string {
    const content = JSON.stringify({
      name: asset.name,
      description: asset.description,
      content: asset.content,
      tags: asset.tags,
    });
    return createHash('sha256').update(content).digest('hex');
  }

  private async generateDiff(oldAsset: Asset, newAsset: Asset): Promise<string> {
    // Simple diff - in production, use a proper diff library
    const oldContent = JSON.stringify(oldAsset.content, null, 2);
    const newContent = JSON.stringify(newAsset.content, null, 2);

    if (oldContent === newContent) {
      return '';
    }

    return `Content changed:\nOld: ${oldContent.substring(0, 100)}...\nNew: ${newContent.substring(0, 100)}...`;
  }

  private calculateNextVersion(versions: Version[]): string {
    if (versions.length === 0) return '1.0.0';

    const latest = versions[versions.length - 1];
    const parts = latest.version.split('.').map(Number);

    // Increment patch version
    parts[2]++;

    // Reset if overflow
    if (parts[2] >= 100) {
      parts[2] = 0;
      parts[1]++;
    }
    if (parts[1] >= 100) {
      parts[1] = 0;
      parts[0]++;
    }

    return parts.join('.');
  }

  private async findVersionById(versionId: string): Promise<Version | undefined> {
    // Search all assets for this version
    for (const [assetId, versions] of this.versions.entries()) {
      const version = versions.find(v => v.id === versionId);
      if (version) return version;
    }

    // Try loading from storage
    const versionFile = join(this.storageDir, `${versionId}.json`);
    if (existsSync(versionFile)) {
      const content = readFileSync(versionFile, 'utf-8');
      return JSON.parse(content) as Version;
    }

    return undefined;
  }

  private async saveVersion(version: Version): Promise<void> {
    const versionFile = join(this.storageDir, `${version.assetId}-${version.id}.json`);
    writeFileSync(versionFile, JSON.stringify(version, null, 2), 'utf-8');
  }

  private async loadVersions(assetId: string): Promise<void> {
    // Load versions from storage
    // This is simplified - in production, would scan directory
    const versions: Version[] = [];
    this.versions.set(assetId, versions);
  }

  private async saveBranch(branch: Branch): Promise<void> {
    const branchFile = join(this.storageDir, `branches/${branch.id}.json`);
    const branchDir = join(this.storageDir, 'branches');
    if (!existsSync(branchDir)) {
      mkdirSync(branchDir, { recursive: true });
    }
    writeFileSync(branchFile, JSON.stringify(branch, null, 2), 'utf-8');
  }

  private generateId(): string {
    return `ver-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

interface Branch {
  id: string;
  name: string;
  assetId: string;
  baseVersion: string;
  head: string;
  author: string;
  created: Date;
  status: 'active' | 'merged' | 'abandoned';
}
