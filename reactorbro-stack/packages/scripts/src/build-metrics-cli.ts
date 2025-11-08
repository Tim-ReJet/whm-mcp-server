#!/usr/bin/env ts-node
/**
 * Build Metrics Script
 * Analyzes build output and reports metrics
 */

import { generateMetrics, formatMetricsReport, saveMetrics, DEFAULT_BUDGETS } from './build-metrics.js';
import { resolve, join } from 'path';
import { existsSync } from 'fs';

const ROOT_DIR = resolve(__dirname, '../../..');
const ASTRO_DIST = join(ROOT_DIR, 'apps/astro/dist');
const METRICS_OUTPUT = join(ROOT_DIR, 'apps/astro/.metrics');

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'report';

  if (command === 'report') {
    if (!existsSync(ASTRO_DIST)) {
      console.error('❌ Build output not found. Run "pnpm build" first.');
      process.exit(1);
    }

    // Calculate metrics (build time would come from build process)
    const metrics = generateMetrics(ASTRO_DIST, 0, DEFAULT_BUDGETS);
    const report = formatMetricsReport(metrics);

    console.log(report);

    // Save metrics
    saveMetrics(metrics, join(METRICS_OUTPUT, 'latest.json'));

    // Exit with error if budgets failed
    if (!metrics.budgetStatus.passed) {
      console.error('\n❌ Build failed budget checks!');
      process.exit(1);
    }
  } else if (command === 'budgets') {
    console.log('\n💰 Performance Budgets:\n');
    console.log(`Initial Bundle: ${DEFAULT_BUDGETS.initial}KB`);
    console.log(`Total Bundle: ${DEFAULT_BUDGETS.total}KB`);
    console.log(`Max Chunk: ${DEFAULT_BUDGETS.chunk}KB`);
    console.log(`Gzipped Initial: ${DEFAULT_BUDGETS.gzipped}KB\n`);
  } else {
    console.log('Usage:');
    console.log('  pnpm build:metrics report  - Generate metrics report');
    console.log('  pnpm build:metrics budgets - Show budget limits');
  }
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});

