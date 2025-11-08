#!/usr/bin/env ts-node

/**
 * Asset Library Population Script
 * Populates the asset library with curated assets
 */

import { AssetManager } from '../../assets/core/asset-manager.js';
import { Asset } from '../../assets/core/types.js';

// Simple UUID generator
function generateId(): string {
  return `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

const assetManager = new AssetManager();

/**
 * Curated design token palettes
 */
const designTokenPalettes: Partial<Asset>[] = [
  {
    id: generateId(),
    name: 'Modern Blue',
    description: 'Modern blue color palette for professional websites',
    category: 'design-tokens',
    type: 'color-palette',
    version: '1.0.0',
    author: 'ReactorBro',
    status: 'stable',
    visibility: 'public',
    tags: ['color', 'blue', 'professional', 'modern'],
    keywords: ['blue', 'professional', 'modern', 'color'],
    content: {
      code: JSON.stringify({
        colors: {
          primary: '#3B82F6',
          secondary: '#8B5CF6',
          accent: '#10B981',
          neutral: {
            50: '#F9FAFB',
            100: '#F3F4F6',
            200: '#E5E7EB',
            300: '#D1D5DB',
            400: '#9CA3AF',
            500: '#6B7280',
            600: '#4B5563',
            700: '#374151',
            800: '#1F2937',
            900: '#111827',
          },
        },
      }),
    },
    dependencies: [],
    dependents: [],
    files: [],
    metadata: {
      created: new Date(),
      updated: new Date(),
      downloads: 0,
      views: 0,
      rating: 5.0,
      ratingCount: 0,
      size: 0,
      tested: true,
      license: 'MIT',
    },
  },
  {
    id: generateId(),
    name: 'Warm Sunset',
    description: 'Warm sunset color palette for creative projects',
    category: 'design-tokens',
    type: 'color-palette',
    version: '1.0.0',
    author: 'ReactorBro',
    status: 'stable',
    visibility: 'public',
    tags: ['color', 'warm', 'sunset', 'creative'],
    keywords: ['warm', 'sunset', 'creative', 'color'],
    content: JSON.stringify({
      colors: {
        primary: '#F59E0B',
        secondary: '#EF4444',
        accent: '#EC4899',
        neutral: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
        },
      },
    }),
    dependencies: [],
    dependents: [],
    files: [],
    metadata: {
      downloads: 0,
      rating: 4.8,
      lastUsed: new Date(),
    },
  },
  {
    id: generateId(),
    name: 'Dark Mode',
    description: 'Dark mode color palette for modern applications',
    category: 'design-tokens',
    type: 'color-palette',
    version: '1.0.0',
    author: 'ReactorBro',
    status: 'stable',
    visibility: 'public',
    tags: ['color', 'dark', 'mode', 'modern'],
    keywords: ['dark', 'mode', 'modern', 'color'],
    content: JSON.stringify({
      colors: {
        primary: '#6366F1',
        secondary: '#8B5CF6',
        accent: '#EC4899',
        background: '#0F172A',
        surface: '#1E293B',
        text: {
          primary: '#F1F5F9',
          secondary: '#CBD5E1',
          muted: '#94A3B8',
        },
      },
    }),
    dependencies: [],
    dependents: [],
    files: [],
    metadata: {
      downloads: 0,
      rating: 4.9,
      lastUsed: new Date(),
    },
  },
];

/**
 * UI Component templates
 */
const uiComponents: Partial<Asset>[] = [
  {
    id: generateId(),
    name: 'Button Primary',
    description: 'Primary button component with hover states',
    category: 'ui-components',
    type: 'component',
    version: '1.0.0',
    author: 'ReactorBro',
    status: 'stable',
    visibility: 'public',
    tags: ['button', 'component', 'ui', 'interactive'],
    keywords: ['button', 'component', 'ui', 'interactive'],
    content: {
      code: `
<button class="btn btn-primary">
  <span class="btn-text">Click me</span>
</button>

<style>
.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
}

.btn-primary {
  background: #3B82F6;
  color: white;
}

.btn-primary:hover {
  background: #2563EB;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}
</style>
`,
    },
    dependencies: [],
    dependents: [],
    files: [],
    metadata: {
      downloads: 0,
      rating: 4.7,
      lastUsed: new Date(),
    },
  },
  {
    id: generateId(),
    name: 'Card Component',
    description: 'Reusable card component with header and footer',
    category: 'ui-components',
    type: 'component',
    version: '1.0.0',
    author: 'ReactorBro',
    status: 'stable',
    visibility: 'public',
    tags: ['card', 'component', 'ui', 'layout'],
    keywords: ['card', 'component', 'ui', 'layout'],
    content: {
      code: `
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Card Title</h3>
  </div>
  <div class="card-body">
    <p>Card content goes here</p>
  </div>
  <div class="card-footer">
    <button class="btn btn-primary">Action</button>
  </div>
</div>

<style>
.card {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  padding: 1rem;
  border-bottom: 1px solid #E5E7EB;
}

.card-body {
  padding: 1rem;
}

.card-footer {
  padding: 1rem;
  border-top: 1px solid #E5E7EB;
  background: #F9FAFB;
}
</style>
`,
    },
    dependencies: [],
    dependents: [],
    files: [],
    metadata: {
      downloads: 0,
      rating: 4.6,
      lastUsed: new Date(),
    },
  },
];

/**
 * Workflow templates
 */
const workflowTemplates: Partial<Asset>[] = [
  {
    id: generateId(),
    name: 'Site Creation Workflow',
    description: 'Complete workflow for creating a new site',
    category: 'agent-workflows',
    type: 'workflow',
    version: '1.0.0',
    author: 'ReactorBro',
    status: 'stable',
    visibility: 'public',
    tags: ['workflow', 'site', 'creation', 'automation'],
    keywords: ['workflow', 'site', 'creation', 'automation'],
    content: {
      config: {
        name: 'Site Creation',
        steps: [
          { agent: 'planning-agent', action: 'create-site-plan' },
          { agent: 'design-agent', action: 'create-brand-identity' },
          { agent: 'content-agent', action: 'generate-initial-content' },
          { agent: 'development-agent', action: 'setup-site-structure' },
          { agent: 'qa-agent', action: 'validate-site' },
        ],
      },
    },
    dependencies: [],
    dependents: [],
    files: [],
    metadata: {
      created: new Date(),
      updated: new Date(),
      downloads: 0,
      views: 0,
      rating: 5.0,
      ratingCount: 0,
      size: 0,
      tested: true,
      license: 'MIT',
    },
  },
];

async function populateAssets() {
  console.log('\n📦 Populating Asset Library...\n');

  await assetManager.loadFromStorage();

  let count = 0;

  // Add design token palettes
  for (const palette of designTokenPalettes) {
    try {
      await assetManager.registerAsset(palette as Asset);
      count++;
      console.log(`✅ Added: ${palette.name}`);
    } catch (error: any) {
      console.log(`⚠️  Skipped: ${palette.name} - ${error.message}`);
    }
  }

  // Add UI components
  for (const component of uiComponents) {
    try {
      await assetManager.registerAsset(component as Asset);
      count++;
      console.log(`✅ Added: ${component.name}`);
    } catch (error: any) {
      console.log(`⚠️  Skipped: ${component.name} - ${error.message}`);
    }
  }

  // Add workflow templates
  for (const workflow of workflowTemplates) {
    try {
      await assetManager.registerAsset(workflow as Asset);
      count++;
      console.log(`✅ Added: ${workflow.name}`);
    } catch (error: any) {
      console.log(`⚠️  Skipped: ${workflow.name} - ${error.message}`);
    }
  }

  console.log(`\n✅ Populated ${count} assets\n`);

  const stats = await assetManager.getStats();
  console.log('📊 Asset Library Statistics:');
  console.log(`   Total Assets: ${stats.total}`);
  console.log(`   By Category:`);
  for (const [category, count] of Object.entries(stats.byCategory)) {
    console.log(`     ${category}: ${count}`);
  }
  console.log('');
}

populateAssets().catch(console.error);

