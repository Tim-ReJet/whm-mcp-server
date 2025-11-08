#!/usr/bin/env ts-node

/**
 * Enhanced Interactive CLI
 * Provides guided, interactive command-line interfaces for ReactorBro Stack
 */

import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { SiteManager } from './site-manager.js';
import { AssetManager } from '../../../assets/core/asset-manager.js';
import { printError, enhanceError } from './error-handler.js';
import { resolve } from 'path';

const siteManager = new SiteManager();
let assetManager: AssetManager | null = null;

/**
 * Initialize asset manager with error handling
 */
async function initAssetManager() {
  if (!assetManager) {
    try {
      assetManager = new AssetManager();
      await assetManager.loadFromStorage();
    } catch (error: any) {
      console.log(chalk.yellow('\n⚠️  Asset manager initialization failed'));
      printError(error);
      console.log(chalk.cyan('   Tip: Run "pnpm populate-assets" to initialize asset library\n'));
      throw error;
    }
  }
  return assetManager;
}

/**
 * Show progress indicator with estimated time
 */
function createProgressIndicator(message: string, estimatedSeconds?: number) {
  const spinner = ora(message).start();
  let elapsed = 0;

  const interval = estimatedSeconds
    ? setInterval(() => {
        elapsed++;
        const remaining = estimatedSeconds - elapsed;
        if (remaining > 0) {
          spinner.text = `${message} (${remaining}s remaining)`;
        }
      }, 1000)
    : null;

  return {
    succeed: (text: string) => {
      if (interval) clearInterval(interval);
      spinner.succeed(text);
    },
    fail: (text: string) => {
      if (interval) clearInterval(interval);
      spinner.fail(text);
    },
    stop: () => {
      if (interval) clearInterval(interval);
      spinner.stop();
    },
    update: (text: string) => {
      spinner.text = text;
    },
  };
}

/**
 * Suggest commands based on error
 */
function suggestCommands(error: Error): string[] {
  const message = error.message.toLowerCase();
  const suggestions: string[] = [];

  if (message.includes('site')) {
    suggestions.push('pnpm site:list');
    suggestions.push('pnpm site:create <site-id>');
  }
  if (message.includes('asset')) {
    suggestions.push('pnpm asset:search <query>');
    suggestions.push('pnpm asset:browse');
  }
  if (message.includes('workflow')) {
    suggestions.push('pnpm workflow:api');
    suggestions.push('Visit http://localhost:4322/workflow-editor');
  }
  if (message.includes('build')) {
    suggestions.push('pnpm build:metrics');
    suggestions.push('pnpm site:build <site-id>');
  }

  return suggestions;
}

/**
 * Main interactive CLI entry point
 */
export async function interactiveCLI() {
  console.log(chalk.bold.cyan('\n🚀 ReactorBro Stack - Interactive CLI\n'));

  const { command } = await inquirer.prompt([
    {
      type: 'list',
      name: 'command',
      message: 'What would you like to do?',
      choices: [
        { name: '📋 Manage Sites', value: 'sites' },
        { name: '📦 Manage Assets', value: 'assets' },
        { name: '🤖 Manage Agents', value: 'agents' },
        { name: '📊 View Dashboard', value: 'dashboard' },
        { name: '❓ Help & Documentation', value: 'help' },
        { name: '🚪 Exit', value: 'exit' },
      ],
    },
  ]);

  switch (command) {
    case 'sites':
      await handleSites();
      break;
    case 'assets':
      await handleAssets();
      break;
    case 'agents':
      await handleAgents();
      break;
    case 'dashboard':
      await handleDashboard();
      break;
    case 'help':
      await handleHelp();
      break;
    case 'exit':
      console.log(chalk.green('\n👋 Goodbye!\n'));
      process.exit(0);
  }

  // Recursive call to show menu again
  await interactiveCLI();
}

/**
 * Site management menu
 */
async function handleSites() {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'Site Management',
      choices: [
        { name: '📝 Create New Site', value: 'create' },
        { name: '📋 List All Sites', value: 'list' },
        { name: 'ℹ️  Site Information', value: 'info' },
        { name: '🎯 Switch Active Site', value: 'switch' },
        { name: '🚀 Start Development Server', value: 'dev' },
        { name: '🔨 Build Site', value: 'build' },
        { name: '⬅️  Back to Main Menu', value: 'back' },
      ],
    },
  ]);

  if (action === 'back') return;

  switch (action) {
    case 'create':
      await createSiteInteractive();
      break;
    case 'list':
      siteManager.list();
      break;
    case 'info':
      await showSiteInfoInteractive();
      break;
    case 'switch':
      await switchSiteInteractive();
      break;
    case 'dev':
      await startDevServerInteractive();
      break;
    case 'build':
      await buildSiteInteractive();
      break;
  }
}

/**
 * Interactive site creation
 */
async function createSiteInteractive() {
  console.log(chalk.bold('\n📝 Create New Site\n'));

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'siteId',
      message: 'Site ID (lowercase, numbers, hyphens only):',
      validate: (input: string) => {
        if (!/^[a-z0-9-]+$/.test(input)) {
          return 'Site ID must contain only lowercase letters, numbers, and hyphens';
        }
        return true;
      },
    },
    {
      type: 'input',
      name: 'name',
      message: 'Site Name:',
      default: (answers: any) => {
        return answers.siteId
          .split('-')
          .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
      },
    },
    {
      type: 'input',
      name: 'description',
      message: 'Description (optional):',
    },
    {
      type: 'input',
      name: 'domain',
      message: 'Production Domain:',
      validate: (input: string) => {
        if (!input || input.length === 0) {
          return 'Domain is required';
        }
        return true;
      },
    },
    {
      type: 'list',
      name: 'output',
      message: 'Astro Output Mode:',
      choices: [
        { name: 'Static (SSG)', value: 'static' },
        { name: 'Server (SSR)', value: 'server' },
        { name: 'Hybrid', value: 'hybrid' },
      ],
      default: 'static',
    },
    {
      type: 'number',
      name: 'port',
      message: 'Development Port:',
      default: 4321,
      validate: (input: number) => {
        if (input < 1024 || input > 65535) {
          return 'Port must be between 1024 and 65535';
        }
        return true;
      },
    },
    {
      type: 'confirm',
      name: 'activate',
      message: 'Activate this site immediately?',
      default: true,
    },
  ]);

  const spinner = createProgressIndicator('Creating site...', 5);

  try {
    siteManager.create(answers.siteId);

    // Update config with provided values
    const configPath = siteManager.getSiteConfigPath(answers.siteId);
    const fs = await import('fs');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    config.name = answers.name;
    config.description = answers.description;
    config.domain.production = answers.domain;
    config.astro.output = answers.output;
    config.astro.port = answers.port;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    if (answers.activate) {
      siteManager.use(answers.siteId);
    }

    spinner.succeed(chalk.green('Site created successfully!'));

    console.log(chalk.bold('\n✅ Site Created:\n'));
    console.log(`   ID:          ${answers.siteId}`);
    console.log(`   Name:        ${answers.name}`);
    console.log(`   Domain:      ${answers.domain}`);
    console.log(`   Port:        ${answers.port}`);
    console.log(`   Output:      ${answers.output}`);
    console.log(`   Active:      ${answers.activate ? 'Yes' : 'No'}\n`);

    if (answers.activate) {
      const { startDev } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'startDev',
          message: 'Start development server now?',
          default: true,
        },
      ]);

      if (startDev) {
        siteManager.dev(answers.siteId);
      }
    }
  } catch (error: any) {
    spinner.fail(chalk.red(`Failed to create site: ${error.message}`));
    printError(error);

    // Show command suggestions
    const suggestions = suggestCommands(error);
    if (suggestions.length > 0) {
      console.log(chalk.yellow('\n💡 Suggested commands:\n'));
      suggestions.forEach(cmd => {
        console.log(chalk.cyan(`   ${cmd}`));
      });
      console.log('');
    }

    // Offer recovery options
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: '🔄 Try again', value: 'retry' },
          { name: '📋 List existing sites', value: 'list' },
          { name: '❓ Get help', value: 'help' },
          { name: '⬅️  Go back', value: 'back' },
        ],
      },
    ]);

    switch (action) {
      case 'retry':
        await createSiteInteractive();
        break;
      case 'list':
        siteManager.list();
        await createSiteInteractive();
        break;
      case 'help':
        await handleHelp();
        await createSiteInteractive();
        break;
    }
  }
}

/**
 * Interactive site info
 */
async function showSiteInfoInteractive() {
  const sites = siteManager.listSites();
  const activeSite = siteManager.getActiveSite();

  if (sites.length === 0) {
    console.log(chalk.yellow('\n⚠️  No sites found. Create one first.\n'));
    return;
  }

  const { siteId } = await inquirer.prompt([
    {
      type: 'list',
      name: 'siteId',
      message: 'Select site:',
      choices: sites.map((id: string) => ({
        name: `${id}${id === activeSite ? ' (active)' : ''}`,
        value: id,
      })),
    },
  ]);

  siteManager.info(siteId);
}

/**
 * Interactive site switching
 */
async function switchSiteInteractive() {
  const sites = siteManager.listSites();
  const activeSite = siteManager.getActiveSite();

  if (sites.length === 0) {
    console.log(chalk.yellow('\n⚠️  No sites found. Create one first.\n'));
    return;
  }

  const { siteId } = await inquirer.prompt([
    {
      type: 'list',
      name: 'siteId',
      message: 'Select site to activate:',
      choices: sites.map((id: string) => ({
        name: `${id}${id === activeSite ? ' (current)' : ''}`,
        value: id,
      })),
    },
  ]);

  siteManager.use(siteId);
}

/**
 * Interactive dev server start
 */
async function startDevServerInteractive() {
  const sites = siteManager.listSites();
  const activeSite = siteManager.getActiveSite();

  if (sites.length === 0) {
    console.log(chalk.yellow('\n⚠️  No sites found. Create one first.\n'));
    return;
  }

  const { siteId } = await inquirer.prompt([
    {
      type: 'list',
      name: 'siteId',
      message: 'Select site to start:',
      choices: sites.map((id: string) => ({
        name: `${id}${id === activeSite ? ' (active)' : ''}`,
        value: id,
      })),
    },
  ]);

  siteManager.dev(siteId);
}

/**
 * Interactive build
 */
async function buildSiteInteractive() {
  const sites = siteManager.listSites();
  const activeSite = siteManager.getActiveSite();

  if (sites.length === 0) {
    console.log(chalk.yellow('\n⚠️  No sites found. Create one first.\n'));
    return;
  }

  const { siteId } = await inquirer.prompt([
    {
      type: 'list',
      name: 'siteId',
      message: 'Select site to build:',
      choices: sites.map((id: string) => ({
        name: `${id}${id === activeSite ? ' (active)' : ''}`,
        value: id,
      })),
    },
  ]);

  siteManager.build(siteId);
}

/**
 * Asset management menu
 */
async function handleAssets() {
  await initAssetManager();

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'Asset Management',
      choices: [
        { name: '🔍 Search Assets', value: 'search' },
        { name: '📋 Browse Assets', value: 'browse' },
        { name: '✨ Use Asset', value: 'use' },
        { name: '📝 Create Asset', value: 'create' },
        { name: '📊 Statistics', value: 'stats' },
        { name: '⬅️  Back to Main Menu', value: 'back' },
      ],
    },
  ]);

  if (action === 'back') return;

  switch (action) {
    case 'search':
      await searchAssetsInteractive();
      break;
    case 'browse':
      await browseAssetsInteractive();
      break;
    case 'use':
      await useAssetInteractive();
      break;
    case 'create':
      await createAssetInteractive();
      break;
    case 'stats':
      await showAssetStats();
      break;
  }
}

/**
 * Interactive asset search
 */
async function searchAssetsInteractive() {
  const { query } = await inquirer.prompt([
    {
      type: 'input',
      name: 'query',
      message: 'Search query:',
      validate: (input: string) => {
        if (!input || input.trim().length === 0) {
          return 'Search query is required';
        }
        return true;
      },
    },
  ]);

  const spinner = createProgressIndicator('Searching assets...', 3);

  try {
    const results = await assetManager!.searchAssets({ q: query, limit: 20 });
    spinner.stop();

    if (results.length === 0) {
      console.log(chalk.yellow(`\n⚠️  No results found for "${query}"\n`));

      // Suggest alternatives
      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'What would you like to do?',
          choices: [
            { name: '🔍 Try different search', value: 'search' },
            { name: '📋 Browse all assets', value: 'browse' },
            { name: '💡 View suggestions', value: 'suggestions' },
            { name: '⬅️  Go back', value: 'back' },
          ],
        },
      ]);

      switch (action) {
        case 'search':
          await searchAssetsInteractive();
          break;
        case 'browse':
          await browseAssetsInteractive();
          break;
        case 'suggestions':
          console.log(chalk.cyan('\n💡 Search Tips:\n'));
          console.log('   • Use specific terms: "button", "color", "layout"');
          console.log('   • Try category names: "ui-components", "design-tokens"');
          console.log('   • Use partial matches: "btn" will find "button"\n');
          await searchAssetsInteractive();
          break;
      }
      return;
    }

  console.log(chalk.bold(`\n🔍 Found ${results.length} results:\n`));

  const choices = results.map((result, index) => ({
    name: `${result.asset.name} (${result.asset.category}) - ${result.asset.description.substring(0, 50)}...`,
    value: index,
  }));

  const { selected } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selected',
      message: 'Select asset for details:',
      choices: [...choices, { name: '⬅️  Back', value: -1 }],
    },
  ]);

  if (selected === -1) return;

  const asset = results[selected].asset;
  console.log(chalk.bold(`\n📊 Asset: ${asset.name}\n`));
  console.log(`   Description: ${asset.description}`);
  console.log(`   Category:    ${asset.category}`);
  console.log(`   Version:     ${asset.version}`);
  console.log(`   Author:      ${asset.author}`);
  console.log(`   Status:      ${asset.status}\n`);
  } catch (error: any) {
    spinner.fail(chalk.red('Search failed'));
    printError(error);

    const suggestions = suggestCommands(error);
    if (suggestions.length > 0) {
      console.log(chalk.yellow('\n💡 Suggested commands:\n'));
      suggestions.forEach(cmd => {
        console.log(chalk.cyan(`   ${cmd}`));
      });
      console.log('');
    }

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: '🔄 Try again', value: 'retry' },
          { name: '📋 Browse assets', value: 'browse' },
          { name: '❓ Get help', value: 'help' },
          { name: '⬅️  Go back', value: 'back' },
        ],
      },
    ]);

    switch (action) {
      case 'retry':
        await searchAssetsInteractive();
        break;
      case 'browse':
        await browseAssetsInteractive();
        break;
      case 'help':
        await handleHelp();
        break;
    }
  }
}

/**
 * Interactive asset browsing
 */
async function browseAssetsInteractive() {
  const categories = [
    'design-tokens',
    'ui-components',
    'templates',
    'workflows',
    'ai-prompts',
    'all',
  ];

  const { category } = await inquirer.prompt([
    {
      type: 'list',
      name: 'category',
      message: 'Browse by category:',
      choices: categories,
    },
  ]);

  const spinner = ora('Loading assets...').start();
  const stats = await assetManager!.getStats();
  spinner.stop();

  if (category === 'all') {
    console.log(chalk.bold(`\n📦 All Assets (${stats.total} total)\n`));
    for (const [cat, count] of Object.entries(stats.byCategory)) {
      console.log(`   ${cat.padEnd(25)} ${count} assets`);
    }
    console.log('');
  } else {
    const assets = await assetManager!.getAssetsByCategory(category as any);
    console.log(chalk.bold(`\n📦 ${category} (${assets.length} assets)\n`));

    if (assets.length > 0) {
      const choices = assets.slice(0, 20).map((asset) => ({
        name: `${asset.name} (${asset.version})`,
        value: asset.id,
      }));

      const { assetId } = await inquirer.prompt([
        {
          type: 'list',
          name: 'assetId',
          message: 'Select asset:',
          choices: [...choices, { name: '⬅️  Back', value: null }],
        },
      ]);

      if (assetId) {
        const asset = await assetManager!.getAsset(assetId);
        console.log(chalk.bold(`\n📊 ${asset.name}\n`));
        console.log(`   ${asset.description}\n`);
      }
    }
  }
}

/**
 * Interactive asset usage
 */
async function useAssetInteractive() {
  const { query } = await inquirer.prompt([
    {
      type: 'input',
      name: 'query',
      message: 'Search for asset to use:',
      validate: (input: string) => {
        if (!input || input.trim().length === 0) {
          return 'Search query is required';
        }
        return true;
      },
    },
  ]);

  const spinner = ora('Searching...').start();
  const results = await assetManager!.searchAssets({ q: query, limit: 10 });
  spinner.stop();

  if (results.length === 0) {
    console.log(chalk.yellow(`\n⚠️  No results found\n`));
    return;
  }

  const { assetId } = await inquirer.prompt([
    {
      type: 'list',
      name: 'assetId',
      message: 'Select asset:',
      choices: results.map((result) => ({
        name: `${result.asset.name} - ${result.asset.description.substring(0, 50)}...`,
        value: result.asset.id,
      })),
    },
  ]);

  const sites = siteManager.listSites();
  let siteId: string | undefined;

  if (sites.length > 0) {
    const { applyToSite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'applyToSite',
        message: 'Apply to a site?',
        default: false,
      },
    ]);

    if (applyToSite) {
      const { selectedSite } = await inquirer.prompt([
        {
          type: 'list',
          name: 'selectedSite',
          message: 'Select site:',
          choices: sites,
        },
      ]);
      siteId = selectedSite;
    }
  }

  const spinner2 = createProgressIndicator('Applying asset...', 2);
  try {
    const asset = await assetManager!.getAsset(assetId);
    const resolved = await assetManager!.resolveDependencies(assetId);
    spinner2.succeed(chalk.green('Asset ready to use!'));

    console.log(chalk.bold(`\n✨ Using: ${asset.name}\n`));
    console.log(`   Version:      ${asset.version}`);
    console.log(`   Dependencies: ${resolved.length} assets resolved`);
    if (siteId) {
      console.log(`   Applied to:    ${siteId}\n`);
    }
  } catch (error: any) {
    spinner2.fail(chalk.red(`Failed: ${error.message}`));
    printError(error);

    const suggestions = suggestCommands(error);
    if (suggestions.length > 0) {
      console.log(chalk.yellow('\n💡 Suggested commands:\n'));
      suggestions.forEach(cmd => {
        console.log(chalk.cyan(`   ${cmd}`));
      });
      console.log('');
    }

    // Offer to browse instead
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: '📋 Browse available assets', value: 'browse' },
          { name: '🔍 Search again', value: 'search' },
          { name: '❓ Get help', value: 'help' },
          { name: '⬅️  Go back', value: 'back' },
        ],
      },
    ]);

    switch (action) {
      case 'browse':
        await browseAssetsInteractive();
        break;
      case 'search':
        await useAssetInteractive();
        break;
      case 'help':
        await handleHelp();
        break;
    }
  }
}

/**
 * Interactive asset creation
 */
async function createAssetInteractive() {
  console.log(chalk.yellow('\n🚧 Asset creation interface coming soon\n'));
}

/**
 * Show asset statistics
 */
async function showAssetStats() {
  const spinner = ora('Loading statistics...').start();
  const stats = await assetManager!.getStats();
  const cacheStats = await assetManager!.getCacheStats();
  spinner.stop();

  console.log(chalk.bold('\n📊 Asset Statistics\n'));
  console.log(`   Total Assets:     ${stats.total}`);
  console.log(`   Storage Used:     ${(stats.storage.used / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Cache Hit Rate:   ${(cacheStats.hitRate * 100).toFixed(1)}%\n`);

  console.log('   By Category:');
  for (const [category, count] of Object.entries(stats.byCategory)) {
    console.log(`     ${category.padEnd(25)} ${count}`);
  }
  console.log('');
}

/**
 * Agent management menu
 */
async function handleAgents() {
  console.log(chalk.yellow('\n🚧 Agent management interface coming soon\n'));
}

/**
 * Dashboard handler
 */
async function handleDashboard() {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'Dashboard',
      choices: [
        { name: '🚀 Start Dashboard Server', value: 'start' },
        { name: '⬅️  Back', value: 'back' },
      ],
    },
  ]);

  if (action === 'start') {
    console.log(chalk.green('\n🚀 Starting dashboard...\n'));
    console.log(chalk.cyan('   Open http://localhost:3000 in your browser\n'));
    const { execSync } = await import('child_process');
    execSync('pnpm dashboard', { stdio: 'inherit' });
  }
}

/**
 * Help menu
 */
async function handleHelp() {
  console.log(chalk.bold('\n❓ Help & Documentation\n'));
  console.log('   📚 Documentation Site:');
  console.log(chalk.cyan('      pnpm docs'));
  console.log('      Then open http://localhost:4322\n');

  console.log('   📖 Quick Links:');
  console.log('      • Getting Started: /docs/getting-started');
  console.log('      • Guides: /docs/guides');
  console.log('      • API Reference: /docs/api');
  console.log('      • Troubleshooting: /docs/troubleshooting\n');

  console.log('   🚀 Common Commands:');
  console.log(chalk.cyan('      pnpm site:list          List all sites'));
  console.log(chalk.cyan('      pnpm site:create <id>    Create new site'));
  console.log(chalk.cyan('      pnpm site:dev            Start dev server'));
  console.log(chalk.cyan('      pnpm asset:search <q>    Search assets'));
  console.log(chalk.cyan('      pnpm workflow:api        Start workflow API\n'));

  console.log('   💬 Need More Help?');
  console.log('      • Check logs: tail -f logs/app.log');
  console.log('      • View metrics: pnpm obs');
  console.log('      • Interactive mode: pnpm cli\n');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  interactiveCLI().catch((error) => {
    console.error(enhanceError(error));
    console.log(chalk.yellow('\n💡 Tip: Use "pnpm cli" for interactive mode\n'));
    process.exit(1);
  });
}

export default interactiveCLI;

