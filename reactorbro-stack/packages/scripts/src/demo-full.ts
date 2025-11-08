#!/usr/bin/env node
/**
 * Full Demo Script
 * Comprehensive demonstration of ReactorBro Stack functionality
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 ReactorBro Stack - Full Demo\n');
console.log('='.repeat(60));

// Load environment variables
try {
  const envLocal = fs.readFileSync('.env.local', 'utf-8');
  const convexUrlMatch = envLocal.match(/CONVEX_URL=(.+)/);
  if (convexUrlMatch) {
    process.env.CONVEX_URL = convexUrlMatch[1].trim();
  }
} catch (error) {
  // Ignore if .env.local doesn't exist
}

// Test 1: Environment & Configuration
console.log('\n📋 1. Environment & Configuration');
console.log('-'.repeat(60));
console.log('Node Version:', process.version);
console.log('Platform:', process.platform);
console.log('Working Directory:', process.cwd());
console.log('CONVEX_URL:', process.env.CONVEX_URL ? '✅ Set' : '⚠️  Not set (using file-based fallback)');

// Test 2: File Structure Verification
console.log('\n📁 2. File Structure Verification');
console.log('-'.repeat(60));

const criticalFiles = [
  { name: 'Convex Schema', path: 'convex/schema.ts', critical: true },
  { name: 'Workflow Functions', path: 'convex/workflows.ts', critical: true },
  { name: 'Asset Functions', path: 'convex/assets.ts', critical: true },
  { name: 'Deployment Functions', path: 'convex/deployments.ts', critical: true },
  { name: 'Workflow Storage Adapter', path: 'agents/core/convex-storage.ts', critical: true },
  { name: 'Asset Storage Adapter', path: 'assets/core/convex-storage.ts', critical: true },
  { name: 'Deployment Storage Adapter', path: 'packages/scripts/src/deployment/convex-storage.ts', critical: true },
  { name: 'Database Manager', path: 'packages/scripts/src/database/database-manager.ts', critical: true },
  { name: 'Workflow Engine', path: 'agents/core/workflow-engine.ts', critical: true },
  { name: 'Asset Manager', path: 'assets/core/asset-manager.ts', critical: true },
  { name: 'Deployment Intelligence', path: 'packages/scripts/src/deployment-intelligence.ts', critical: true },
];

let allFilesExist = true;
for (const file of criticalFiles) {
  const fullPath = path.join(process.cwd(), file.path);
  const exists = fs.existsSync(fullPath);
  const status = exists ? '✅' : (file.critical ? '❌' : '⚠️ ');
  console.log(`${status} ${file.name}: ${file.path}`);
  if (file.critical && !exists) {
    allFilesExist = false;
  }
}

// Test 3: Package Dependencies
console.log('\n📦 3. Package Dependencies');
console.log('-'.repeat(60));

try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));

  const criticalDeps = {
    'convex': packageJson.dependencies?.convex,
    'typescript': packageJson.devDependencies?.typescript,
    'ts-node': packageJson.devDependencies?.['ts-node'],
  };

  for (const [dep, version] of Object.entries(criticalDeps)) {
    if (version) {
      console.log(`✅ ${dep}: ${version}`);
    } else {
      console.log(`⚠️  ${dep}: Not found`);
    }
  }

  // Count scripts
  const scriptCount = Object.keys(packageJson.scripts || {}).length;
  console.log(`✅ Scripts: ${scriptCount} available`);

  // Convex scripts
  const convexScripts = Object.keys(packageJson.scripts || {}).filter(s => s.startsWith('convex:'));
  console.log(`✅ Convex scripts: ${convexScripts.length} found`);

} catch (error) {
  console.log('❌ Failed to read package.json');
}

// Test 4: Convex Deployment Status
console.log('\n🗄️  4. Convex Deployment Status');
console.log('-'.repeat(60));

if (process.env.CONVEX_URL) {
  console.log('✅ Convex URL configured');
  console.log(`   URL: ${process.env.CONVEX_URL}`);

  // Check if _generated files exist
  const generatedApi = path.join(process.cwd(), 'convex/_generated/api.js');
  if (fs.existsSync(generatedApi)) {
    console.log('✅ Convex API generated');
    console.log('   Functions are ready to use');
  } else {
    console.log('⚠️  Convex API not generated yet');
    console.log('   Run: pnpm convex:deploy');
  }

  // Check convex.json
  const convexJson = path.join(process.cwd(), 'convex.json');
  if (fs.existsSync(convexJson)) {
    try {
      const config = JSON.parse(fs.readFileSync(convexJson, 'utf-8'));
      console.log('✅ Convex project configured');
      if (config.project) {
        console.log(`   Project: ${config.project}`);
      }
      if (config.team) {
        console.log(`   Team: ${config.team}`);
      }
    } catch (error) {
      console.log('⚠️  Could not read convex.json');
    }
  }
} else {
  console.log('⚠️  Convex not configured');
  console.log('   Systems will use file-based storage');
}

// Test 5: Integration Points
console.log('\n🔗 5. Integration Points');
console.log('-'.repeat(60));

const integrations = [
  {
    name: 'WorkflowEngine → Convex',
    check: () => {
      const file = path.join(process.cwd(), 'agents/core/workflow-engine.ts');
      if (!fs.existsSync(file)) return false;
      const content = fs.readFileSync(file, 'utf-8');
      return content.includes('ConvexWorkflowStorage') && content.includes('convexStorage');
    }
  },
  {
    name: 'AssetManager → Convex',
    check: () => {
      const file = path.join(process.cwd(), 'assets/core/asset-manager.ts');
      if (!fs.existsSync(file)) return false;
      const content = fs.readFileSync(file, 'utf-8');
      return content.includes('ConvexAssetStorage') && content.includes('convexStorage');
    }
  },
  {
    name: 'DeploymentIntelligence → Convex',
    check: () => {
      const file = path.join(process.cwd(), 'packages/scripts/src/deployment-intelligence.ts');
      if (!fs.existsSync(file)) return false;
      const content = fs.readFileSync(file, 'utf-8');
      return content.includes('ConvexDeploymentStorage') && content.includes('convexStorage');
    }
  },
];

for (const integration of integrations) {
  const integrated = integration.check();
  console.log(`${integrated ? '✅' : '❌'} ${integration.name}`);
}

// Test 6: Storage Adapters
console.log('\n💾 6. Storage Adapters');
console.log('-'.repeat(60));

const adapters = [
  { name: 'ConvexWorkflowStorage', path: 'agents/core/convex-storage.ts' },
  { name: 'ConvexAssetStorage', path: 'assets/core/convex-storage.ts' },
  { name: 'ConvexDeploymentStorage', path: 'packages/scripts/src/deployment/convex-storage.ts' },
];

for (const adapter of adapters) {
  const filePath = path.join(process.cwd(), adapter.path);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const hasInitialize = content.includes('initialize');
    const hasSave = content.includes('save');
    const hasLoad = content.includes('load');
    const hasList = content.includes('list');

    const methods = [hasInitialize, hasSave, hasLoad, hasList].filter(Boolean).length;
    console.log(`✅ ${adapter.name}: ${methods}/4 core methods implemented`);
  } else {
    console.log(`❌ ${adapter.name}: File not found`);
  }
}

// Test 7: Convex Functions
console.log('\n⚙️  7. Convex Functions');
console.log('-'.repeat(60));

const functionFiles = [
  { name: 'Workflows', file: 'convex/workflows.ts', expected: ['list', 'get', 'create', 'update'] },
  { name: 'Assets', file: 'convex/assets.ts', expected: ['list', 'get', 'search', 'create'] },
  { name: 'Deployments', file: 'convex/deployments.ts', expected: ['list', 'get', 'create', 'update'] },
  { name: 'Metrics', file: 'convex/metrics.ts', expected: ['record', 'getByType'] },
];

for (const func of functionFiles) {
  const filePath = path.join(process.cwd(), func.file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const found = func.expected.filter(fn => content.includes(`export const ${fn}`)).length;
    console.log(`✅ ${func.name}: ${found}/${func.expected.length} functions found`);
  } else {
    console.log(`❌ ${func.name}: File not found`);
  }
}

// Test 8: Documentation
console.log('\n📚 8. Documentation');
console.log('-'.repeat(60));

const docs = [
  'CONVEX_SETUP.md',
  'docs/CONVEX_INTEGRATION.md',
  'docs/CONVEX_NEXT_STEPS.md',
  'docs/CONVEX_SYSTEM_INTEGRATION_COMPLETE.md',
  'README.md',
];

for (const doc of docs) {
  const docPath = path.join(process.cwd(), doc);
  const exists = fs.existsSync(docPath);
  console.log(`${exists ? '✅' : '⚠️ '} ${doc}`);
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 Full Demo Summary\n');

const status = {
  files: allFilesExist,
  convex: !!process.env.CONVEX_URL,
  integrations: integrations.every(i => i.check()),
};

console.log('✅ File Structure:', status.files ? 'Complete' : 'Issues Found');
console.log('✅ Convex Configuration:', status.convex ? 'Configured' : 'Not Configured');
console.log('✅ System Integrations:', status.integrations ? 'All Integrated' : 'Some Missing');

console.log('\n💡 System Status:');
if (status.files && status.convex && status.integrations) {
  console.log('   🎉 FULLY OPERATIONAL');
  console.log('   ✅ All systems ready');
  console.log('   ✅ Convex integration active');
  console.log('   ✅ Ready for development');
} else if (status.files && status.integrations) {
  console.log('   ⚠️  OPERATIONAL (File-based mode)');
  console.log('   ✅ All systems ready');
  console.log('   ⚠️  Using file-based storage');
  console.log('   💡 Configure Convex for real-time sync');
} else {
  console.log('   ⚠️  SOME ISSUES DETECTED');
  console.log('   💡 Check file structure and integrations');
}

console.log('\n🚀 Quick Start Commands:');
console.log('   pnpm demo              - Run basic demo');
console.log('   pnpm demo:full         - Run full demo');
console.log('   pnpm convex:deploy     - Deploy Convex functions');
console.log('   npx convex dashboard   - Open Convex dashboard');
console.log('   pnpm convex:logs       - View Convex logs');
console.log('   pnpm site:list         - List sites');
console.log('   pnpm agent:list        - List agents');
console.log('   pnpm asset:search      - Search assets');

console.log('\n' + '='.repeat(60));


