# Convex Functions Reference

## Overview

This directory contains Convex functions for ReactorBro Stack. These functions provide a type-safe, real-time database interface for workflows, assets, deployments, and performance metrics.

## Setup

1. **Install Convex:**
   ```bash
   pnpm add convex
   ```

2. **Initialize Convex:**
   ```bash
   npx convex dev
   ```

3. **Set Environment Variable:**
   ```bash
   CONVEX_URL=https://your-deployment.convex.cloud
   ```

## Available Functions

### Workflows (`convex/workflows.ts`)

- `workflows.list` - List all workflows
- `workflows.get` - Get workflow by ID
- `workflows.getByStatus` - Get workflows by status
- `workflows.create` - Create new workflow
- `workflows.update` - Update workflow
- `workflows.deleteWorkflow` - Delete workflow
- `workflows.createExecution` - Create workflow execution
- `workflows.updateExecution` - Update execution status
- `workflows.getExecution` - Get execution by ID
- `workflows.listExecutions` - List executions for workflow

### Assets (`convex/assets.ts`)

- `assets.list` - List all assets
- `assets.get` - Get asset by ID
- `assets.search` - Search assets
- `assets.create` - Create asset
- `assets.update` - Update asset
- `assets.deleteAsset` - Delete asset
- `assets.incrementDownloads` - Increment download count
- `assets.getByCategory` - Get assets by category
- `assets.getByTags` - Get assets by tags

### Deployments (`convex/deployments.ts`)

- `deployments.list` - List all deployments
- `deployments.get` - Get deployment by ID
- `deployments.getBySite` - Get deployments by site
- `deployments.getByStatus` - Get deployments by status
- `deployments.create` - Create deployment
- `deployments.update` - Update deployment
- `deployments.getLatest` - Get latest deployment for site
- `deployments.getHistory` - Get deployment history

### Performance Metrics (`convex/metrics.ts`)

- `metrics.record` - Record performance metric
- `metrics.getByType` - Get metrics by type
- `metrics.getByName` - Get metrics by name
- `metrics.getRecent` - Get recent metrics
- `metrics.getAggregated` - Get aggregated metrics

## Usage Examples

### Using with DatabaseManager

```typescript
import { DatabaseManager } from '@repo/scripts/database/database-manager';

const db = new DatabaseManager();
await db.connect();

// Query workflows
const workflows = await db.queryFunction('workflows.list');

// Create workflow
const workflowId = await db.mutateFunction('workflows.create', {
  id: 'workflow-1',
  name: 'My Workflow',
  version: '1.0.0',
  steps: [],
  config: {
    maxConcurrent: 3,
    failFast: false,
    saveState: true,
    notifications: false,
  },
  status: 'draft',
});

// Search assets
const assets = await db.queryFunction('assets.search', {
  query: 'button',
  category: 'ui-components',
  limit: 10,
});

// Record metric
await db.mutateFunction('metrics.record', {
  metricType: 'workflow',
  metricName: 'execution_time',
  value: 1234,
});
```

### Direct Convex Client Usage

```typescript
import { ConvexHttpClient } from 'convex/browser';
import { api } from './convex/_generated/api';

const client = new ConvexHttpClient(process.env.CONVEX_URL);

// Query
const workflows = await client.query(api.workflows.list);

// Mutation
const id = await client.mutation(api.workflows.create, {
  id: 'workflow-1',
  name: 'My Workflow',
  // ...
});
```

## Schema

The schema is defined in `convex/schema.ts` and includes:

- `workflows` - Workflow definitions
- `workflowExecutions` - Workflow execution records
- `assets` - Asset library entries
- `deployments` - Deployment records
- `sites` - Site configurations
- `performanceMetrics` - Performance tracking data
- `cacheEntries` - Distributed cache entries

## Real-Time Subscriptions

Convex supports real-time subscriptions. Example:

```typescript
import { useQuery } from 'convex/react';
import { api } from './convex/_generated/api';

// In a React component
const workflows = useQuery(api.workflows.list);
// Automatically updates when workflows change!
```

## Type Safety

Convex generates TypeScript types automatically. Import them:

```typescript
import { api } from './convex/_generated/api';
import type { Id } from './convex/_generated/dataModel';

// Types are automatically inferred
const workflowId: Id<"workflows"> = await client.mutation(
  api.workflows.create,
  { /* ... */ }
);
```

## Next Steps

1. Run `npx convex dev` to start development
2. Functions will be automatically deployed
3. Use the generated API in your code
4. Set up real-time subscriptions for live updates

For more information, see:
- [Convex Documentation](https://docs.convex.dev)
- `docs/CONVEX_INTEGRATION.md`
- `CONVEX_SETUP.md`

