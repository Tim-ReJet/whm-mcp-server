---
title: API Reference
description: Complete API documentation
category: api
order: 3
---

# API Reference

Complete API documentation for ReactorBro Stack.

## Site Manager API

### `create(siteId: string)`
Create a new site configuration.

\`\`\`typescript
import { SiteManager } from '@repo/scripts';

const manager = new SiteManager();
manager.create('my-site');
\`\`\`

### `list()`
List all available sites.

\`\`\`typescript
manager.list();
\`\`\`

### `use(siteId: string)`
Activate a site.

\`\`\`typescript
manager.use('my-site');
\`\`\`

## Asset Manager API

### `registerAsset(asset: Asset)`
Register a new asset.

\`\`\`typescript
import { AssetManager } from '@repo/assets';

const assetManager = new AssetManager();
await assetManager.registerAsset(asset);
\`\`\`

### `searchAssets(query: SearchQuery)`
Search for assets.

\`\`\`typescript
const results = await assetManager.searchAssets({
  q: 'button',
  category: 'ui-components',
  limit: 10,
});
\`\`\`

## Agent System API

### `executeWorkflow(workflowId: string, context: Context)`
Execute an agent workflow.

\`\`\`typescript
import { AgentOrchestrator } from '@repo/agents';

const orchestrator = new AgentOrchestrator();
const result = await orchestrator.executeWorkflow('site-creation', context);
\`\`\`

