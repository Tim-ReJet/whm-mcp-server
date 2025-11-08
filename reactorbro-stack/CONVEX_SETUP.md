# Convex Database Setup Guide

## Quick Start

### 1. Install Convex

```bash
pnpm add convex
```

### 2. Configure Existing Project

If you have an existing Convex project:

```bash
npx convex dev --configure=existing --team tim-a6744 --project stack-3d50f
```

Or initialize a new project:

```bash
npx convex dev
```

This will:

- Create a `convex/` directory
- Set up your Convex project
- Generate API files
- Provide your `CONVEX_URL`

### 3. Set Environment Variable

Add to `.env` or `.env.local` (created automatically by Convex):

```bash
CONVEX_URL=https://your-deployment.convex.cloud
```

### 4. Deploy Functions

```bash
# Watch mode (auto-deploy on changes)
npx convex dev

# Or deploy once
npx convex deploy
```

### 5. Create Your First Function

Functions are already created in `convex/`:

- `convex/workflows.ts` - Workflow functions
- `convex/assets.ts` - Asset functions
- `convex/deployments.ts` - Deployment functions
- `convex/metrics.ts` - Performance metrics functions

Just deploy them:

```bash
npx convex deploy
```

### 6. Use in Your Code

```typescript
import { DatabaseManager } from "@repo/scripts/database/database-manager";

const db = new DatabaseManager();
await db.connect();

// Using Convex functions (recommended)
const workflows = await db.queryFunction("workflows.list");
const id = await db.mutateFunction("workflows.create", {
  id: "workflow-1",
  name: "My Workflow",
  steps: [],
});
```

## Benefits

- ✅ **Real-time** - Automatic synchronization
- ✅ **Type-safe** - Generated TypeScript types
- ✅ **Serverless** - No database management
- ✅ **Modern** - Function-based API

## Fallback

If Convex is not available, the system automatically falls back to:

1. PostgreSQL (if `DATABASE_URL` is set)
2. File-based storage (always available)

See `docs/CONVEX_INTEGRATION.md` for complete documentation.
