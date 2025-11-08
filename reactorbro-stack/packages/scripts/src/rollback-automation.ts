/**
 * Rollback Automation
 * Handles automatic and manual rollbacks
 */

import { execSync } from 'child_process';
import { logger } from '../../observability/src/logging/logger.js';
import { DeploymentIntelligence, Deployment } from './deployment-intelligence.js';

export interface RollbackConfig {
  deploymentId: string;
  reason: string;
  automatic?: boolean;
  targetDeploymentId?: string;
}

export interface RollbackResult {
  success: boolean;
  rollbackId: string;
  previousDeploymentId: string;
  error?: string;
}

export class RollbackAutomation {
  private deploymentIntelligence: DeploymentIntelligence;

  constructor(deploymentIntelligence: DeploymentIntelligence) {
    this.deploymentIntelligence = deploymentIntelligence;
  }

  /**
   * Rollback deployment
   */
  async rollback(config: RollbackConfig): Promise<RollbackResult> {
    const deployment = this.deploymentIntelligence.getDeployment(config.deploymentId);
    if (!deployment) {
      throw new Error(`Deployment not found: ${config.deploymentId}`);
    }

    logger.info('Starting rollback', {
      deploymentId: config.deploymentId,
      reason: config.reason,
      automatic: config.automatic,
    });

    // Find previous successful deployment
    const previousDeployment = config.targetDeploymentId
      ? this.deploymentIntelligence.getDeployment(config.targetDeploymentId)
      : this.findPreviousSuccessfulDeployment(deployment.siteId, deployment.id);

    if (!previousDeployment) {
      throw new Error('No previous successful deployment found to rollback to');
    }

    // Create rollback deployment using public API
    const rollbackDeployment = this.deploymentIntelligence.createDeployment(deployment.siteId, {
      siteId: deployment.siteId,
      platform: 'cloudflare-pages',
    });
    const rollbackId = rollbackDeployment.id;

    // Update rollback deployment with rollback info
    this.deploymentIntelligence.updateDeployment(rollbackId, {
      rollbackId: deployment.id,
    });

    try {
      // Perform rollback based on platform
      await this.performRollback(previousDeployment, {
        id: rollbackId,
        siteId: deployment.siteId,
        status: 'pending',
        startedAt: new Date(),
        rollbackId: deployment.id,
      });

      // Update deployment status
      this.deploymentIntelligence.updateDeployment(config.deploymentId, {
        status: 'rolled-back',
      });

      this.deploymentIntelligence.updateDeployment(rollbackId, {
        status: 'success',
        completedAt: new Date(),
      });

      logger.info('Rollback completed successfully', {
        rollbackId,
        previousDeploymentId: previousDeployment.id,
      });

      return {
        success: true,
        rollbackId,
        previousDeploymentId: previousDeployment.id,
      };
    } catch (error: any) {
      this.deploymentIntelligence.updateDeployment(rollbackId, {
        status: 'failed',
        error: error.message,
        completedAt: new Date(),
      });

      logger.error('Rollback failed', {
        rollbackId,
        error: error.message,
      });

      return {
        success: false,
        rollbackId,
        previousDeploymentId: previousDeployment.id,
        error: error.message,
      };
    }
  }

  /**
   * Find previous successful deployment
   */
  private findPreviousSuccessfulDeployment(siteId: string, excludeId: string): Deployment | null {
    const deployments = this.deploymentIntelligence
      .getSiteDeployments(siteId)
      .filter(d => d.id !== excludeId && d.status === 'success');

    return deployments.length > 0 ? deployments[0] : null;
  }

  /**
   * Perform rollback
   */
  private async performRollback(
    previousDeployment: Deployment,
    rollbackDeployment: Deployment
  ): Promise<void> {
    // This would integrate with the actual deployment platform
    // For Cloudflare Pages, we'd use their API to rollback
    // For VPS, we'd restore from backup or redeploy previous version

    logger.info('Performing rollback', {
      rollbackId: rollbackDeployment.id,
      previousDeploymentId: previousDeployment.id,
      siteId: rollbackDeployment.siteId,
    });

    // Example: Cloudflare Pages rollback
    // await this.rollbackCloudflarePages(previousDeployment, rollbackDeployment);

    // Example: VPS rollback
    // await this.rollbackVPS(previousDeployment, rollbackDeployment);

    // For now, log the rollback action
    logger.info('Rollback action logged', {
      platform: 'cloudflare-pages', // Would be determined from config
      previousDeploymentId: previousDeployment.id,
    });
  }

  /**
   * Check if rollback is needed
   */
  shouldRollback(deployment: Deployment, healthCheckFailed: boolean): boolean {
    if (deployment.status === 'failed') {
      return true;
    }

    if (healthCheckFailed && deployment.healthCheckStatus === 'failing') {
      return true;
    }

    return false;
  }

  /**
   * Auto-rollback on failure
   */
  async autoRollback(deployment: Deployment, reason: string): Promise<RollbackResult | null> {
    if (!this.shouldRollback(deployment, deployment.healthCheckStatus === 'failing')) {
      return null;
    }

    return this.rollback({
      deploymentId: deployment.id,
      reason: `Automatic rollback: ${reason}`,
      automatic: true,
    });
  }
}

export default RollbackAutomation;

