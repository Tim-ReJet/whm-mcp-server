/**
 * Convex Storage Adapter for Deployment Intelligence
 * Provides Convex-backed storage with file-based fallback
 */

import { DatabaseManager } from "../database/database-manager.js";
import type { Deployment } from "../deployment-intelligence.js";

export class ConvexDeploymentStorage {
  private db: DatabaseManager;
  private useConvex = false;

  constructor() {
    this.db = new DatabaseManager();
  }

  async initialize(): Promise<void> {
    try {
      await this.db.connect();
      if (process.env.CONVEX_URL) {
        try {
          await this.db.queryFunction("deployments.list", { limit: 1 });
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
   * Save deployment to Convex
   */
  async saveDeployment(deployment: Deployment): Promise<void> {
    if (this.useConvex) {
      try {
        const existing = await this.db.queryFunction("deployments.get", {
          id: deployment.id,
        });

        const deploymentData = {
          siteId: deployment.siteId,
          status: deployment.status,
          buildArtifacts: deployment.buildArtifacts,
          healthCheckStatus: deployment.healthCheckStatus,
          error: deployment.error,
          rollbackId: deployment.rollbackId,
          buildTime:
            deployment.completedAt && deployment.startedAt
              ? deployment.completedAt.getTime() - deployment.startedAt.getTime()
              : undefined,
        };

        if (existing) {
          await this.db.mutateFunction("deployments.update", {
            id: deployment.id,
            updates: {
              ...deploymentData,
              completedAt: deployment.completedAt?.getTime(),
            },
          });
        } else {
          await this.db.mutateFunction("deployments.create", {
            id: deployment.id,
            siteId: deployment.siteId,
            status: deployment.status,
            environment: "production", // Could be passed as parameter
            commitHash: undefined, // Could be extracted from deployment
            branch: undefined,
            changes: undefined,
          });
          await this.db.mutateFunction("deployments.update", {
            id: deployment.id,
            updates: deploymentData,
          });
        }
      } catch (error) {
        console.warn("Failed to save deployment to Convex:", error);
      }
    }
  }

  /**
   * Load deployment from Convex
   */
  async loadDeployment(deploymentId: string): Promise<Deployment | null> {
    if (this.useConvex) {
      try {
        const deployment = await this.db.queryFunction("deployments.get", {
          id: deploymentId,
        });
        if (deployment) {
          return {
            id: deployment.id,
            siteId: deployment.siteId,
            status: deployment.status as Deployment["status"],
            startedAt: new Date(deployment.startedAt),
            completedAt: deployment.completedAt ? new Date(deployment.completedAt) : undefined,
            buildArtifacts: deployment.buildArtifacts,
            healthCheckStatus: deployment.healthCheckStatus,
            error: deployment.error,
            rollbackId: deployment.rollbackId,
          };
        }
      } catch (error) {
        console.warn("Failed to load deployment from Convex:", error);
      }
    }
    return null;
  }

  /**
   * List all deployments (optional siteId filter)
   */
  async listAllDeployments(limit?: number): Promise<Deployment[]> {
    if (this.useConvex) {
      try {
        // Use the list function which doesn't require siteId
        const deployments = await this.db.queryFunction("deployments.list", { limit });
        return deployments.map((d: any) => ({
          id: d.id,
          siteId: d.siteId,
          status: d.status as Deployment["status"],
          startedAt: new Date(d.startedAt),
          completedAt: d.completedAt ? new Date(d.completedAt) : undefined,
          buildArtifacts: d.buildArtifacts,
          healthCheckStatus: d.healthCheckStatus,
          error: d.error,
          rollbackId: d.rollbackId,
        }));
      } catch (error) {
        console.warn("Failed to list all deployments from Convex:", error);
      }
    }
    return [];
  }

  /**
   * List deployments for a site
   */
  async listDeployments(siteId: string, limit?: number): Promise<Deployment[]> {
    if (this.useConvex) {
      try {
        const deployments = await this.db.queryFunction("deployments.getBySite", {
          siteId,
          limit,
        });
        return deployments.map((d: any) => ({
          id: d.id,
          siteId: d.siteId,
          status: d.status as Deployment["status"],
          startedAt: new Date(d.startedAt),
          completedAt: d.completedAt ? new Date(d.completedAt) : undefined,
          buildArtifacts: d.buildArtifacts,
          healthCheckStatus: d.healthCheckStatus,
          error: d.error,
          rollbackId: d.rollbackId,
        }));
      } catch (error) {
        console.warn("Failed to list deployments from Convex:", error);
      }
    }
    return [];
  }

  /**
   * Get latest deployment for a site
   */
  async getLatestDeployment(siteId: string): Promise<Deployment | null> {
    if (this.useConvex) {
      try {
        const deployment = await this.db.queryFunction("deployments.getLatest", {
          siteId,
        });
        if (deployment) {
          return {
            id: deployment.id,
            siteId: deployment.siteId,
            status: deployment.status as Deployment["status"],
            startedAt: new Date(deployment.startedAt),
            completedAt: deployment.completedAt ? new Date(deployment.completedAt) : undefined,
            buildArtifacts: deployment.buildArtifacts,
            healthCheckStatus: deployment.healthCheckStatus,
            error: deployment.error,
            rollbackId: deployment.rollbackId,
          };
        }
      } catch (error) {
        console.warn("Failed to get latest deployment from Convex:", error);
      }
    }
    return null;
  }

  /**
   * Get deployments by status
   */
  async getDeploymentsByStatus(status: Deployment["status"]): Promise<Deployment[]> {
    if (this.useConvex) {
      try {
        const deployments = await this.db.queryFunction("deployments.getByStatus", {
          status,
        });
        return deployments.map((d: any) => ({
          id: d.id,
          siteId: d.siteId,
          status: d.status as Deployment["status"],
          startedAt: new Date(d.startedAt),
          completedAt: d.completedAt ? new Date(d.completedAt) : undefined,
          buildArtifacts: d.buildArtifacts,
          healthCheckStatus: d.healthCheckStatus,
          error: d.error,
          rollbackId: d.rollbackId,
        }));
      } catch (error) {
        console.warn("Failed to get deployments by status from Convex:", error);
      }
    }
    return [];
  }
}
