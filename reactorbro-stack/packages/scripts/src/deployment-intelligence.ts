/**
 * Deployment Intelligence System
 * Manages deployment queues, change detection, and deployment orchestration
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import { logger } from '../../observability/src/logging/logger.js';
import { metricsRegistry } from '../../observability/src/metrics/metrics.js';
import { ConvexDeploymentStorage } from './deployment/convex-storage.js';

export interface DeploymentConfig {
  siteId: string;
  platform: 'cloudflare-pages' | 'vps' | 'custom';
  projectId?: string;
  branch?: string;
  parallelLimit?: number;
  healthCheckUrl?: string;
  rollbackEnabled?: boolean;
}

export interface Deployment {
  id: string;
  siteId: string;
  status: 'pending' | 'queued' | 'building' | 'deploying' | 'success' | 'failed' | 'rolled-back';
  startedAt: Date;
  completedAt?: Date;
  buildArtifacts?: string[];
  healthCheckStatus?: 'pending' | 'passing' | 'failing';
  error?: string;
  rollbackId?: string;
}

export interface ChangeDetection {
  sites: string[];
  packages: string[];
  apps: string[];
  deployAll: boolean;
}

export class DeploymentIntelligence {
  private deployments: Map<string, Deployment> = new Map();
  private queue: string[] = [];
  private parallelLimit = 3;
  private deploymentsDir: string;
  private convexStorage?: ConvexDeploymentStorage;

  constructor(deploymentsDir = '.deployments') {
    this.deploymentsDir = resolve(deploymentsDir);
    if (!existsSync(this.deploymentsDir)) {
      mkdirSync(this.deploymentsDir, { recursive: true });
    }

    // Initialize Convex storage if available
    if (process.env.CONVEX_URL) {
      this.convexStorage = new ConvexDeploymentStorage();
      this.convexStorage.initialize().catch(() => {
        // Silently fail, will use file-based storage
      });
    }

    this.loadDeployments();
  }

  /**
   * Detect changes from git diff
   */
  detectChanges(baseRef = 'HEAD^', headRef = 'HEAD'): ChangeDetection {
    try {
      const changedFiles = execSync(`git diff --name-only ${baseRef} ${headRef}`, {
        encoding: 'utf-8',
      })
        .trim()
        .split('\n')
        .filter(Boolean);

      const sites = new Set<string>();
      const packages = new Set<string>();
      const apps = new Set<string>();
      let deployAll = false;

      for (const file of changedFiles) {
        if (file.startsWith('sites/')) {
          const siteId = file.split('/')[1];
          if (siteId && !siteId.startsWith('_')) {
            sites.add(siteId);
          }
        } else if (file.startsWith('packages/')) {
          packages.add(file.split('/')[1]);
          deployAll = true; // Package changes affect all sites
        } else if (file.startsWith('apps/')) {
          apps.add(file.split('/')[1]);
          deployAll = true; // App changes affect all sites
        }
      }

      // If deployAll, get all sites
      if (deployAll) {
        const allSites = execSync('ls -d sites/*/ 2>/dev/null | grep -v "_template" | xargs -n1 basename', {
          encoding: 'utf-8',
        })
          .trim()
          .split('\n')
          .filter(Boolean);
        allSites.forEach(site => sites.add(site));
      }

      const result: ChangeDetection = {
        sites: Array.from(sites),
        packages: Array.from(packages),
        apps: Array.from(apps),
        deployAll,
      };

      logger.info('Change detection completed', {
        sites: result.sites.length,
        packages: result.packages.length,
        apps: result.apps.length,
        deployAll: result.deployAll,
      });

      return result;
    } catch (error) {
      logger.error('Change detection failed', {}, error as Error);
      return { sites: [], packages: [], apps: [], deployAll: false };
    }
  }

  /**
   * Create a new deployment
   */
  createDeployment(siteId: string, config: DeploymentConfig): Deployment {
    const deployment: Deployment = {
      id: `deploy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      siteId,
      status: 'pending',
      startedAt: new Date(),
    };

    this.deployments.set(deployment.id, deployment);
    this.queue.push(deployment.id);
    this.saveDeployments();

    // Save to Convex if available
    if (this.convexStorage) {
      await this.convexStorage.saveDeployment(deployment).catch(() => {
        // Silently fail
      });
    }

    logger.info('Deployment created', {
      deploymentId: deployment.id,
      siteId,
      queuePosition: this.queue.length,
    });

    return deployment;
  }

  /**
   * Get next deployment from queue
   */
  getNextDeployment(): Deployment | null {
    if (this.queue.length === 0) {
      return null;
    }

    const activeDeployments = Array.from(this.deployments.values()).filter(
      d => d.status === 'building' || d.status === 'deploying'
    );

    if (activeDeployments.length >= this.parallelLimit) {
      return null; // Queue is full
    }

    const deploymentId = this.queue.shift();
    if (!deploymentId) {
      return null;
    }

    const deployment = this.deployments.get(deploymentId);
    if (!deployment) {
      return null;
    }

    deployment.status = 'queued';
    this.saveDeployments();

    return deployment;
  }

  /**
   * Update deployment status
   */
  updateDeployment(deploymentId: string, updates: Partial<Deployment>): void {
    const deployment = this.deployments.get(deploymentId);
    if (!deployment) {
      throw new Error(`Deployment not found: ${deploymentId}`);
    }

    Object.assign(deployment, updates);

    if (updates.status === 'success' || updates.status === 'failed' || updates.status === 'rolled-back') {
      deployment.completedAt = new Date();
    }

    this.saveDeployments();

    // Update in Convex if available
    if (this.convexStorage) {
      await this.convexStorage.saveDeployment(deployment).catch(() => {
        // Silently fail
      });
    }

    logger.info('Deployment updated', {
      deploymentId,
      status: deployment.status,
    });
  }

  /**
   * Get deployment by ID
   */
  getDeployment(deploymentId: string): Deployment | undefined {
    return this.deployments.get(deploymentId);
  }

  /**
   * Get all deployments
   */
  getAllDeployments(): Deployment[] {
    return Array.from(this.deployments.values()).sort(
      (a, b) => b.startedAt.getTime() - a.startedAt.getTime()
    );
  }

  /**
   * Get deployments for a site
   */
  async getSiteDeployments(siteId: string): Promise<Deployment[]> {
    // Try Convex first if available
    if (this.convexStorage) {
      const convexDeployments = await this.convexStorage.listDeployments(siteId);
      if (convexDeployments.length > 0) {
        // Update in-memory map
        for (const deployment of convexDeployments) {
          this.deployments.set(deployment.id, deployment);
        }
        return convexDeployments;
      }
    }

    // Fallback to in-memory deployments
    return Array.from(this.deployments.values())
      .filter(d => d.siteId === siteId)
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
  }

  /**
   * Get queue status
   */
  getQueueStatus(): { queue: number; active: number; limit: number } {
    const active = Array.from(this.deployments.values()).filter(
      d => d.status === 'building' || d.status === 'deploying'
    ).length;

    return {
      queue: this.queue.length,
      active,
      limit: this.parallelLimit,
    };
  }

  /**
   * Save deployments to disk
   */
  private saveDeployments(): void {
    const data = {
      deployments: Array.from(this.deployments.entries()).map(([id, deployment]) => ({
        ...deployment,
        startedAt: deployment.startedAt.toISOString(),
        completedAt: deployment.completedAt?.toISOString(),
      })),
      queue: this.queue,
    };

    writeFileSync(
      join(this.deploymentsDir, 'deployments.json'),
      JSON.stringify(data, null, 2)
    );
  }

  /**
   * Load deployments from Convex or disk
   */
  private async loadDeployments(): Promise<void> {
    // Try Convex first if available
    if (this.convexStorage) {
      try {
        // Load all deployments from Convex (using list function)
        const allDeployments = await this.convexStorage.listAllDeployments(100);
        if (allDeployments.length > 0) {
          for (const deployment of allDeployments) {
            this.deployments.set(deployment.id, deployment);
          }
          // Queue would need to be managed separately or loaded from Convex
          return;
        }
      } catch (error) {
        // If listDeployments fails with empty siteId, try loading from files
        logger.warn('Failed to load deployments from Convex, using file-based storage', { error });
      }
    }

    // Fallback to file-based storage
    const filePath = join(this.deploymentsDir, 'deployments.json');
    if (!existsSync(filePath)) {
      return;
    }

    try {
      const data = JSON.parse(readFileSync(filePath, 'utf-8'));
      this.queue = data.queue || [];

      for (const deployment of data.deployments || []) {
        this.deployments.set(deployment.id, {
          ...deployment,
          startedAt: new Date(deployment.startedAt),
          completedAt: deployment.completedAt ? new Date(deployment.completedAt) : undefined,
        });
      }
    } catch (error) {
      logger.error('Failed to load deployments', {}, error as Error);
    }
  }
}

export default DeploymentIntelligence;

