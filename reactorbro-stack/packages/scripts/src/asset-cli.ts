#!/usr/bin/env ts-node

/**
 * Asset CLI - Command-line interface for asset management
 * Updated to use the new AssetManager
 */

import { AssetManager } from '../../../assets/core/asset-manager.js';
import { resolve } from 'path';

const command = process.argv[2];
const arg1 = process.argv[3];
const arg2 = process.argv[4];

// Initialize asset manager
const assetManager = new AssetManager();

async function main() {
  // Load assets from storage
  await assetManager.loadFromStorage();

  switch (command) {
    case 'browse':
      await browseAssets(arg1);
      break;
    case 'search':
      await searchAssets(arg1, args.category, args.tags, args.author, args.minrating);
      break;
    case 'info':
      await showAssetInfo(arg1);
      break;
    case 'use':
      await useAsset(arg1, arg2);
      break;
    case 'create':
      await createAsset(arg1, arg2);
      break;
    case 'export':
      await exportAsset(arg1, arg2);
      break;
    case 'import':
      await importAsset(arg1);
      break;
    case 'stats':
      await showStats();
      break;
    case 'versions':
      await showVersions(arg1);
      break;
    case 'dependencies':
      await showDependencies(arg1);
      break;
    case 'history':
      await showSearchHistory();
      break;
    case 'suggestions':
      await showSuggestions(arg1);
      break;
    default:
      showHelp();
  }
}

async function browseAssets(category?: string) {
  console.log('\n📦 Asset Library:\n');

  if (!category || category === 'all') {
    const stats = await assetManager.getStats();
    console.log(`  Total Assets: ${stats.total}\n`);

    console.log('  Categories:');
    for (const [cat, count] of Object.entries(stats.byCategory)) {
      console.log(`    • ${cat.padEnd(20)} ${count} assets`);
    }
    console.log('');
  } else {
    const assets = await assetManager.getAssetsByCategory(category as any);
    console.log(`  Category: ${category}`);
    console.log(`  Assets: ${assets.length}\n`);

    for (const asset of assets.slice(0, 20)) {
      console.log(`    • ${asset.name} (${asset.version})`);
      console.log(`      ${asset.description.substring(0, 60)}...`);
    }
    console.log('');
  }
}

async function searchAssets(query: string, category?: string, tags?: string, author?: string, minRating?: string) {
  if (!query) {
    console.error('❌ Search query required');
    process.exit(1);
  }

  console.log(`\n🔍 Searching for: "${query}"\n`);

  const searchQuery: any = {
    q: query,
    limit: 20,
  };

  if (category) {
    searchQuery.category = category;
    console.log(`  Category filter: ${category}`);
  }
  if (tags) {
    searchQuery.tags = tags.split(',').map(t => t.trim());
    console.log(`  Tags filter: ${tags}`);
  }
  if (author) {
    searchQuery.author = author;
    console.log(`  Author filter: ${author}`);
  }
  if (minRating) {
    searchQuery.minRating = Number.parseFloat(minRating);
    console.log(`  Min rating: ${minRating}`);
  }
  console.log('');

  const results = await assetManager.searchAssets(searchQuery);

  if (results.length === 0) {
    console.log('  No results found\n');

    // Show suggestions
    const suggestions = assetManager.getSearchSuggestions(query, 5);
    if (suggestions.length > 0) {
      console.log('  💡 Suggestions:');
      for (const suggestion of suggestions) {
        console.log(`    • ${suggestion}`);
      }
      console.log('');
    }
    return;
  }

  console.log(`  Found ${results.length} results:\n`);

  for (const result of results) {
    console.log(`    • ${result.asset.name} (score: ${result.score.toFixed(2)})`);
    console.log(`      ${result.asset.description.substring(0, 60)}...`);
    console.log(`      Category: ${result.asset.category} | Rating: ${result.asset.metadata.rating.toFixed(1)}/5.0`);
    if (result.highlights.length > 0) {
      console.log(`      "${result.highlights[0]}"`);
    }
  }
  console.log('');

  // Show popular searches
  const popular = assetManager.getPopularSearches(5);
  if (popular.length > 0) {
    console.log('  🔥 Popular searches:');
    for (const pop of popular) {
      console.log(`    • ${pop}`);
    }
    console.log('');
  }
}

async function showAssetInfo(assetId: string) {
  if (!assetId) {
    console.error('❌ Asset ID required');
    process.exit(1);
  }

  try {
    const asset = await assetManager.getAsset(assetId);
    const versions = await assetManager.getVersions(assetId);
    const graph = await assetManager.getDependencyGraph(assetId);

    console.log(`\n📊 Asset Info: ${assetId}\n`);
    console.log(`  Name: ${asset.name}`);
    console.log(`  Description: ${asset.description}`);
    console.log(`  Category: ${asset.category}`);
    console.log(`  Version: ${asset.version}`);
    console.log(`  Author: ${asset.author}`);
    console.log(`  Status: ${asset.status}`);
    console.log(`  Tags: ${asset.tags.join(', ')}`);
    console.log(`  Dependencies: ${asset.dependencies.length}`);
    console.log(`  Dependents: ${asset.dependents.length}`);
    console.log(`  Versions: ${versions.length}`);
    console.log(`  Downloads: ${asset.metadata.downloads}`);
    console.log(`  Rating: ${asset.metadata.rating.toFixed(1)}/5.0`);
    console.log('');
  } catch (error: any) {
    console.error(`❌ Error: ${error.message}\n`);
    process.exit(1);
  }
}

async function useAsset(assetId: string, siteId?: string) {
  if (!assetId) {
    console.error('❌ Asset ID required');
    process.exit(1);
  }

  try {
    const asset = await assetManager.getAsset(assetId);
    const resolved = await assetManager.resolveDependencies(assetId);

    console.log(`\n✨ Using asset: ${assetId}\n`);

    if (siteId) {
      console.log(`  Applying to site: ${siteId}`);
    }

    console.log(`  Asset: ${asset.name} (${asset.version})`);
    console.log(`  Dependencies resolved: ${resolved.length} assets`);
    console.log('');

    // Would apply asset to site here
    console.log('✅ Asset ready to use\n');
  } catch (error: any) {
    console.error(`❌ Error: ${error.message}\n`);
    process.exit(1);
  }
}

async function createAsset(type: string, name?: string) {
  if (!name) {
    console.error('❌ Asset name required');
    process.exit(1);
  }

  console.log(`\n📝 Creating asset: ${type}\n`);
  console.log(`  Name: ${name}`);
  console.log(`  Type: ${type}`);
  console.log('');

  // Would create asset here
  console.log('🚧 Asset creation interface coming soon\n');
}

async function exportAsset(assetId: string, format = 'json') {
  if (!assetId) {
    console.error('❌ Asset ID required');
    process.exit(1);
  }

  try {
    const filepath = await assetManager.exportAsset(assetId, format as 'json' | 'zip', false);
    console.log(`\n📤 Exported asset: ${assetId}\n`);
    console.log(`  Format: ${format}`);
    console.log(`  File: ${filepath}\n`);
  } catch (error: any) {
    console.error(`❌ Error: ${error.message}\n`);
    process.exit(1);
  }
}

async function importAsset(file: string) {
  if (!file) {
    console.error('❌ File path required');
    process.exit(1);
  }

  try {
    const assets = await assetManager.importAsset(file);
    console.log(`\n📥 Imported ${assets.length} asset(s)\n`);

    for (const asset of assets) {
      console.log(`  • ${asset.name} (${asset.version})`);
    }
    console.log('');
  } catch (error: any) {
    console.error(`❌ Error: ${error.message}\n`);
    process.exit(1);
  }
}

async function showStats() {
  const stats = await assetManager.getStats();
  const cacheStats = await assetManager.getCacheStats();

  console.log('\n📊 Asset Statistics\n');
  console.log(`  Total Assets: ${stats.total}`);
  console.log(`  Storage Used: ${(stats.storage.used / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Cache Hit Rate: ${(cacheStats.hitRate * 100).toFixed(1)}%`);
  console.log('');

  console.log('  By Category:');
  for (const [category, count] of Object.entries(stats.byCategory)) {
    console.log(`    ${category.padEnd(20)} ${count}`);
  }
  console.log('');

  console.log('  By Status:');
  for (const [status, count] of Object.entries(stats.byStatus)) {
    console.log(`    ${status.padEnd(20)} ${count}`);
  }
  console.log('');
}

async function showVersions(assetId: string) {
  if (!assetId) {
    console.error('❌ Asset ID required');
    process.exit(1);
  }

  try {
    const versions = await assetManager.getVersions(assetId);
    console.log(`\n📋 Versions for: ${assetId}\n`);

    if (versions.length === 0) {
      console.log('  No versions found\n');
      return;
    }

    for (const version of versions.reverse()) {
      console.log(`  • ${version.version} - ${version.changelog}`);
      console.log(`    ${version.timestamp.toISOString()} by ${version.author}`);
      console.log(`    Changes: ${version.changes.length}`);
      console.log('');
    }
  } catch (error: any) {
    console.error(`❌ Error: ${error.message}\n`);
    process.exit(1);
  }
}

async function showDependencies(assetId: string) {
  if (!assetId) {
    console.error('❌ Asset ID required');
    process.exit(1);
  }

  try {
    const graph = await assetManager.getDependencyGraph(assetId);
    console.log(`\n🔗 Dependencies for: ${assetId}\n`);

    if (graph.nodes.length === 0) {
      console.log('  No dependencies\n');
      return;
    }

    console.log('  Dependency Graph:');
    for (const node of graph.nodes) {
      const indent = '  '.repeat(node.depth + 1);
      console.log(`${indent}• ${node.id}`);
    }
    console.log('');
  } catch (error: any) {
    console.error(`❌ Error: ${error.message}\n`);
    process.exit(1);
  }
}

async function showSearchHistory() {
  const history = assetManager.getSearchHistory(20);

  console.log('\n📜 Search History:\n');

  if (history.length === 0) {
    console.log('  No search history\n');
    return;
  }

  for (const entry of history) {
    const date = entry.timestamp.toLocaleString();
    const filters = [];
    if (entry.filters?.category) filters.push(`category:${entry.filters.category}`);
    if (entry.filters?.tags) filters.push(`tags:${entry.filters.tags.join(',')}`);
    if (entry.filters?.author) filters.push(`author:${entry.filters.author}`);
    if (entry.filters?.minRating) filters.push(`rating>=${entry.filters.minRating}`);

    console.log(`  • "${entry.query}"`);
    if (filters.length > 0) {
      console.log(`    Filters: ${filters.join(', ')}`);
    }
    console.log(`    Results: ${entry.resultCount} | ${date}`);
    console.log('');
  }
}

async function showSuggestions(partialQuery: string) {
  if (!partialQuery) {
    console.error('❌ Partial query required');
    process.exit(1);
  }

  console.log(`\n💡 Suggestions for: "${partialQuery}"\n`);

  const suggestions = assetManager.getSearchSuggestions(partialQuery, 10);

  if (suggestions.length === 0) {
    console.log('  No suggestions found\n');
    return;
  }

  for (const suggestion of suggestions) {
    console.log(`  • ${suggestion}`);
  }
  console.log('');
}

function showHelp() {
  console.log(`
Asset Management CLI

Usage:
  asset <command> [options]

Commands:
  browse [category]              Browse assets by category
  search <query> [options]       Search assets with filters
  info <asset-id>                Show asset information
  use <asset-id> [site]          Use asset (apply to site)
  create <type> <name>           Create new asset
  export <asset-id> [fmt]        Export asset (json|zip)
  import <file>                  Import asset from file
  stats                          Show statistics
  versions <asset-id>            Show version history
  dependencies <asset-id>        Show dependency graph
  history                        Show search history
  suggestions <query>            Get search suggestions

Search Options:
  --category <cat>               Filter by category
  --tags <tag1,tag2>             Filter by tags
  --author <author>              Filter by author
  --min-rating <rating>          Filter by minimum rating (0-5)
  --sort <field>                 Sort by: relevance|created|updated|rating|downloads
  --order <asc|desc>             Sort order (default: desc)

Examples:
  asset browse                              # Browse all assets
  asset search "button"                     # Search for "button"
  asset search "button" --category ui-components  # Search with filter
  asset search "design" --tags color,theme --min-rating 4.0
  asset info button-001                     # Show button-001 info
  asset use button-001                      # Use button-001
  asset export button-001                   # Export button-001
  asset import ./asset.json                 # Import asset
  asset history                             # Show search history
  asset suggestions "but"                   # Get suggestions

Categories:
  design-tokens, style-prompts, templates, ui-components,
  workflows, modules, tools, configs, ai-prompts,
  agent-workflows, sub-agents, agent-skills
`);
}

main().catch(console.error);
