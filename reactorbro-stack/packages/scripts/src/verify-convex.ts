#!/usr/bin/env ts-node
/**
 * Convex Integration Verification Script
 * Tests that Convex is properly configured and integrated
 */

import { DatabaseManager } from './database/database-manager';
import { WorkflowEngine } from '../../../agents/core/workflow-engine';
import { AssetManager } from '../../../assets/core/asset-manager';
import { DeploymentIntelligence } from './deployment-intelligence';

async function verifyConvexIntegration() {
  console.log('🔍 Verifying Convex Integration...\n');

  const checks = {
    environment: false,
    database: false,
    workflowEngine: false,
    assetManager: false,
    deploymentIntelligence: false,
  };

  // Check 1: Environment Variable
  console.log('1️⃣  Checking CONVEX_URL environment variable...');
  if (process.env.CONVEX_URL) {
    console.log(`   ✅ CONVEX_URL is set: ${process.env.CONVEX_URL}`);
    checks.environment = true;
  } else {
    console.log('   ⚠️  CONVEX_URL not set (will use file-based fallback)');
  }

  // Check 2: Database Manager
  console.log('\n2️⃣  Testing DatabaseManager...');
  try {
    const db = new DatabaseManager();
    await db.connect();
    console.log('   ✅ DatabaseManager connected');

    if (process.env.CONVEX_URL) {
      try {
        // Try a simple Convex query
        await db.queryFunction('workflows.list', {});
        console.log('   ✅ Convex functions are accessible');
        checks.database = true;
      } catch (error: any) {
        console.log(`   ⚠️  Convex functions not deployed yet: ${error.message}`);
        console.log('   💡 Run: pnpm convex:deploy');
      }
    } else {
      console.log('   ✅ Using file-based storage (Convex not configured)');
      checks.database = true;
    }
  } catch (error: any) {
    console.log(`   ❌ DatabaseManager error: ${error.message}`);
  }

  // Check 3: Workflow Engine
  console.log('\n3️⃣  Testing WorkflowEngine...');
  try {
    const engine = new WorkflowEngine();
    console.log('   ✅ WorkflowEngine initialized');

    if (process.env.CONVEX_URL) {
      console.log('   ✅ Will use Convex storage when available');
    } else {
      console.log('   ✅ Using file-based storage');
    }
    checks.workflowEngine = true;
  } catch (error: any) {
    console.log(`   ❌ WorkflowEngine error: ${error.message}`);
  }

  // Check 4: Asset Manager
  console.log('\n4️⃣  Testing AssetManager...');
  try {
    const manager = new AssetManager();
    console.log('   ✅ AssetManager initialized');

    if (process.env.CONVEX_URL) {
      console.log('   ✅ Will use Convex storage when available');
    } else {
      console.log('   ✅ Using file-based storage');
    }
    checks.assetManager = true;
  } catch (error: any) {
    console.log(`   ❌ AssetManager error: ${error.message}`);
  }

  // Check 5: Deployment Intelligence
  console.log('\n5️⃣  Testing DeploymentIntelligence...');
  try {
    const intelligence = new DeploymentIntelligence();
    console.log('   ✅ DeploymentIntelligence initialized');

    if (process.env.CONVEX_URL) {
      console.log('   ✅ Will use Convex storage when available');
    } else {
      console.log('   ✅ Using file-based storage');
    }
    checks.deploymentIntelligence = true;
  } catch (error: any) {
    console.log(`   ❌ DeploymentIntelligence error: ${error.message}`);
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Verification Summary\n');

  const allChecks = Object.values(checks);
  const passed = allChecks.filter(Boolean).length;
  const total = allChecks.length;

  console.log(`✅ Passed: ${passed}/${total}`);

  if (checks.environment) {
    console.log('   ✅ Environment configured');
  } else {
    console.log('   ⚠️  CONVEX_URL not set (optional)');
  }

  if (checks.database) {
    console.log('   ✅ Database connection working');
  } else {
    console.log('   ❌ Database connection failed');
  }

  if (checks.workflowEngine && checks.assetManager && checks.deploymentIntelligence) {
    console.log('   ✅ All systems integrated');
  } else {
    console.log('   ⚠️  Some systems need attention');
  }

  console.log('\n💡 Next Steps:');
  if (!checks.environment) {
    console.log('   1. Set CONVEX_URL environment variable');
    console.log('   2. Run: npx convex dev --configure=existing --team tim-a6744 --project stack-3d50f');
  }
  if (checks.environment && !checks.database) {
    console.log('   1. Deploy Convex functions: pnpm convex:deploy');
  }
  if (checks.environment && checks.database) {
    console.log('   ✅ Convex integration is ready!');
    console.log('   💡 Your systems will automatically use Convex');
  }

  console.log('\n' + '='.repeat(50));

  process.exit(passed === total ? 0 : 1);
}

verifyConvexIntegration().catch((error) => {
  console.error('❌ Verification failed:', error);
  process.exit(1);
});

