#!/usr/bin/env ts-node

/**
 * Dashboard CLI
 * Start the development dashboard server
 */

import { startDashboard } from './dashboard-server.js';

const port = process.env.DASHBOARD_PORT ? parseInt(process.env.DASHBOARD_PORT) : 3000;
const host = process.env.DASHBOARD_HOST || 'localhost';

async function main() {
  console.log('\n🚀 Starting ReactorBro Development Dashboard\n');
  console.log(`   URL: http://${host}:${port}`);
  console.log(`   Port: ${port}`);
  console.log(`   Host: ${host}\n`);
  console.log('   Press Ctrl+C to stop\n');

  try {
    await startDashboard({ port, host });
  } catch (error) {
    console.error('❌ Failed to start dashboard:', error);
    process.exit(1);
  }
}

main();

