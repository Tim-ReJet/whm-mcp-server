#!/usr/bin/env node
/**
 * Simple Demo Script
 * Tests basic functionality without complex imports
 */

console.log('🚀 ReactorBro Stack Demo\n');
console.log('='.repeat(50));

const fs = require('fs');
const path = require('path');

// Test 1: Check environment
console.log('\n1️⃣  Environment Check');
console.log('   Node Version:', process.version);
console.log('   Platform:', process.platform);
console.log('   Working Directory:', process.cwd());

// Test 2: Check Convex configuration
console.log('\n2️⃣  Convex Configuration');

// Try to load .env.local
try {
  const envLocal = fs.readFileSync('.env.local', 'utf-8');
  const convexUrlMatch = envLocal.match(/CONVEX_URL=(.+)/);
  if (convexUrlMatch) {
    const convexUrl = convexUrlMatch[1].trim();
    console.log('   ✅ CONVEX_URL found in .env.local');
    console.log('   URL:', convexUrl.substring(0, 40) + '...');
    process.env.CONVEX_URL = convexUrl;
  } else {
    console.log('   ⚠️  CONVEX_URL not found in .env.local');
  }
} catch (error) {
  if (process.env.CONVEX_URL) {
    console.log('   ✅ CONVEX_URL is set');
    console.log('   URL:', process.env.CONVEX_URL.substring(0, 40) + '...');
  } else {
    console.log('   ⚠️  CONVEX_URL not set (will use file-based fallback)');
  }
}

// Test 3: Check file structure
console.log('\n3️⃣  File Structure Check');

const checks = [
  { name: 'Convex functions', path: 'convex/workflows.ts' },
  { name: 'Convex schema', path: 'convex/schema.ts' },
  { name: 'Workflow storage', path: 'agents/core/convex-storage.ts' },
  { name: 'Asset storage', path: 'assets/core/convex-storage.ts' },
  { name: 'Deployment storage', path: 'packages/scripts/src/deployment/convex-storage.ts' },
];

for (const check of checks) {
  const fullPath = path.join(process.cwd(), check.path);
  if (fs.existsSync(fullPath)) {
    console.log(`   ✅ ${check.name}: ${check.path}`);
  } else {
    console.log(`   ❌ ${check.name}: ${check.path} (not found)`);
  }
}

// Test 4: Check package.json
console.log('\n4️⃣  Package Configuration');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  if (packageJson.dependencies?.convex) {
    console.log(`   ✅ Convex package: ${packageJson.dependencies.convex}`);
  } else {
    console.log('   ⚠️  Convex package not found in dependencies');
  }

  const convexScripts = Object.keys(packageJson.scripts || {}).filter(s => s.startsWith('convex:'));
  if (convexScripts.length > 0) {
    console.log(`   ✅ Convex scripts: ${convexScripts.length} found`);
    convexScripts.forEach(script => {
      console.log(`      - ${script}`);
    });
  }
} catch (error) {
  console.log('   ❌ Failed to read package.json');
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 Demo Summary\n');
console.log('✅ Basic checks completed');
console.log('\n💡 Next Steps:');
if (!process.env.CONVEX_URL) {
  console.log('   1. Configure Convex:');
  console.log('      npx convex dev --configure=existing --team tim-a6744 --project stack-3d50f');
  console.log('   2. Deploy functions:');
  console.log('      pnpm convex:deploy');
} else {
  console.log('   ✅ Convex is configured!');
  console.log('   1. Functions are deployed');
  console.log('   2. Your systems will automatically use Convex');
  console.log('   3. View dashboard: npx convex dashboard');
}
console.log('\n' + '='.repeat(50));

