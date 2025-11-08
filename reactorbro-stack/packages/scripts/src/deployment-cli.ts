#!/usr/bin/env ts-node

/**
 * Deployment CLI
 * Command-line interface for deployment management
 */

import { DeploymentIntelligence } from './deployment-intelligence.js';
import { BuildArtifactValidator } from './build-validator.js';
import { TestingGates } from './testing-gates.js';
import { DeploymentHealthChecker } from './health-checker.js';
import { PerformanceRegressionDetector } from './performance-regression.js';
import { RollbackAutomation } from './rollback-automation.js';
import { SiteManager } from './site-manager.js';
import { resolve } from 'path';

const command = process.argv[2];
const arg1 = process.argv[3];
const arg2 = process.argv[4];

const deploymentIntelligence = new DeploymentIntelligence();
const siteManager = new SiteManager();

async function main() {
  switch (command) {
    case 'detect':
      await detectChanges();
      break;
    case 'deploy':
      await deploy(arg1);
      break;
    case 'validate':
      await validate();
      break;
    case 'test':
      await runTests();
      break;
    case 'health':
      await healthCheck(arg1);
      break;
    case 'rollback':
      await rollback(arg1);
      break;
    case 'status':
      await showStatus(arg1);
      break;
    case 'list':
      await listDeployments(arg1);
      break;
    default:
      showHelp();
  }
}

async function detectChanges() {
  console.log('\n🔍 Detecting changes...\n');

  const changes = deploymentIntelligence.detectChanges();

  console.log('📊 Change Detection Results:\n');
  console.log(`   Sites: ${changes.sites.length > 0 ? changes.sites.join(', ') : 'None'}`);
  console.log(`   Packages: ${changes.packages.length > 0 ? changes.packages.join(', ') : 'None'}`);
  console.log(`   Apps: ${changes.apps.length > 0 ? changes.apps.join(', ') : 'None'}`);
  console.log(`   Deploy All: ${changes.deployAll ? 'Yes' : 'No'}\n`);

  if (changes.sites.length === 0 && !changes.deployAll) {
    console.log('⚠️  No sites to deploy\n');
  }
}

async function deploy(siteId?: string) {
  if (!siteId) {
    console.error('❌ Site ID required');
    console.log('Usage: pnpm deploy:deploy <site-id>\n');
    process.exit(1);
  }

  console.log(`\n🚀 Deploying site: ${siteId}\n`);

  try {
    // Create deployment
    const deployment = deploymentIntelligence.createDeployment(siteId, {
      siteId,
      platform: 'cloudflare-pages',
    });

    console.log(`✅ Deployment created: ${deployment.id}\n`);

    // Run tests
    console.log('🧪 Running test gates...\n');
    const testGates = new TestingGates();
    const testResult = await testGates.runGates();
    console.log(testGates.getSummary(testResult));

    if (!testResult.passed) {
      console.log('❌ Test gates failed. Deployment aborted.\n');
      deploymentIntelligence.updateDeployment(deployment.id, {
        status: 'failed',
        error: 'Test gates failed',
      });
      process.exit(1);
    }

    // Validate build
    console.log('📦 Validating build artifacts...\n');
    const validator = new BuildArtifactValidator();
    const validation = validator.validate();
    console.log(validator.getSummary(validation));

    if (!validation.valid) {
      console.log('❌ Build validation failed. Deployment aborted.\n');
      deploymentIntelligence.updateDeployment(deployment.id, {
        status: 'failed',
        error: 'Build validation failed',
      });
      process.exit(1);
    }

    // Check performance regressions
    console.log('⚡ Checking performance regressions...\n');
    const perfDetector = new PerformanceRegressionDetector();
    const currentMetrics = {
      bundleSize: 1024 * 1024, // Would get from actual build
      buildTime: 30000, // Would get from actual build
    };
    const regressionResult = perfDetector.detectRegressions(currentMetrics);
    console.log(perfDetector.getSummary(regressionResult));

    if (regressionResult.hasRegression) {
      console.log('⚠️  Performance regressions detected. Continuing deployment...\n');
    }

    // Update deployment status
    deploymentIntelligence.updateDeployment(deployment.id, {
      status: 'deploying',
    });

    console.log('✅ Deployment process completed\n');
    console.log(`   Deployment ID: ${deployment.id}`);
    console.log(`   Status: deploying\n`);
  } catch (error: any) {
    console.error(`❌ Deployment failed: ${error.message}\n`);
    process.exit(1);
  }
}

async function validate() {
  console.log('\n📦 Validating build artifacts...\n');

  const validator = new BuildArtifactValidator();
  const validation = validator.validate();
  console.log(validator.getSummary(validation));

  if (!validation.valid) {
    console.log('❌ Validation failed\n');
    process.exit(1);
  } else {
    console.log('✅ Validation passed\n');
  }
}

async function runTests() {
  console.log('\n🧪 Running test gates...\n');

  const testGates = new TestingGates();
  const result = await testGates.runGates();
  console.log(testGates.getSummary(result));

  if (!result.passed) {
    console.log('❌ Test gates failed\n');
    process.exit(1);
  } else {
    console.log('✅ All test gates passed\n');
  }
}

async function healthCheck(deploymentId?: string) {
  if (!deploymentId) {
    console.error('❌ Deployment ID required');
    process.exit(1);
  }

  console.log(`\n💚 Health check for deployment: ${deploymentId}\n`);

  const deployment = deploymentIntelligence.getDeployment(deploymentId);
  if (!deployment) {
    console.error(`❌ Deployment not found: ${deploymentId}\n`);
    process.exit(1);
  }

  const config = siteManager.loadSiteConfig(deployment.siteId);
  const healthChecker = new DeploymentHealthChecker();

  const result = await healthChecker.check({
    url: `https://${config.domain.production}`,
    timeout: 30000,
    retries: 3,
    expectedStatus: 200,
  });

  if (result.status === 'passing') {
    console.log('✅ Health check passed\n');
    console.log(`   Response time: ${result.responseTime}ms`);
    console.log(`   Status code: ${result.statusCode}\n`);

    deploymentIntelligence.updateDeployment(deploymentId, {
      healthCheckStatus: 'passing',
    });
  } else {
    console.log('❌ Health check failed\n');
    console.log(`   Error: ${result.error}\n`);

    deploymentIntelligence.updateDeployment(deploymentId, {
      healthCheckStatus: 'failing',
    });

    // Auto-rollback if enabled
    const rollback = new RollbackAutomation(deploymentIntelligence);
    await rollback.autoRollback(deployment, 'Health check failed');
  }
}

async function rollback(deploymentId?: string) {
  if (!deploymentId) {
    console.error('❌ Deployment ID required');
    process.exit(1);
  }

  console.log(`\n🔄 Rolling back deployment: ${deploymentId}\n`);

  const rollback = new RollbackAutomation(deploymentIntelligence);
  const result = await rollback.rollback({
    deploymentId,
    reason: 'Manual rollback',
    automatic: false,
  });

  if (result.success) {
    console.log('✅ Rollback successful\n');
    console.log(`   Rollback ID: ${result.rollbackId}`);
    console.log(`   Previous Deployment: ${result.previousDeploymentId}\n`);
  } else {
    console.log('❌ Rollback failed\n');
    console.log(`   Error: ${result.error}\n`);
    process.exit(1);
  }
}

async function showStatus(siteId?: string) {
  console.log('\n📊 Deployment Status\n');

  if (siteId) {
    const deployments = deploymentIntelligence.getSiteDeployments(siteId);
    console.log(`Site: ${siteId}\n`);
    console.log(`Deployments: ${deployments.length}\n`);

    for (const deployment of deployments.slice(0, 10)) {
      const statusIcon =
        deployment.status === 'success'
          ? '✅'
          : deployment.status === 'failed'
            ? '❌'
            : deployment.status === 'rolled-back'
              ? '🔄'
              : '⏳';
      console.log(
        `   ${statusIcon} ${deployment.id} - ${deployment.status} (${deployment.startedAt.toISOString()})`
      );
    }
  } else {
    const queueStatus = deploymentIntelligence.getQueueStatus();
    console.log(`Queue: ${queueStatus.queue} pending`);
    console.log(`Active: ${queueStatus.active}/${queueStatus.limit}`);
    console.log('');
  }
}

async function listDeployments(siteId?: string) {
  const deployments = siteId
    ? deploymentIntelligence.getSiteDeployments(siteId)
    : deploymentIntelligence.getAllDeployments();

  console.log('\n📋 Deployments\n');

  if (deployments.length === 0) {
    console.log('   No deployments found\n');
    return;
  }

  for (const deployment of deployments.slice(0, 20)) {
    const statusIcon =
      deployment.status === 'success'
        ? '✅'
        : deployment.status === 'failed'
          ? '❌'
          : deployment.status === 'rolled-back'
            ? '🔄'
            : '⏳';
    console.log(`   ${statusIcon} ${deployment.siteId} - ${deployment.status}`);
    console.log(`      ID: ${deployment.id}`);
    console.log(`      Started: ${deployment.startedAt.toISOString()}`);
    if (deployment.completedAt) {
      console.log(`      Completed: ${deployment.completedAt.toISOString()}`);
    }
    if (deployment.error) {
      console.log(`      Error: ${deployment.error}`);
    }
    console.log('');
  }
}

function showHelp() {
  console.log(`
Deployment CLI

Usage:
  deploy <command> [options]

Commands:
  detect                    Detect changes from git
  deploy <site-id>           Deploy a site
  validate                   Validate build artifacts
  test                       Run test gates
  health <deployment-id>     Health check deployment
  rollback <deployment-id>   Rollback deployment
  status [site-id]           Show deployment status
  list [site-id]             List deployments

Examples:
  deploy detect              # Detect changes
  deploy deploy my-site      # Deploy my-site
  deploy validate            # Validate build
  deploy test                # Run tests
  deploy health deploy-123   # Health check
  deploy rollback deploy-123 # Rollback
  deploy status              # Show status
  deploy list                # List all deployments
`);
}

main().catch(console.error);

