# Convex Database Integration ✅

## Summary

Successfully integrated Convex database support into the database abstraction layer, providing a modern, real-time database solution with automatic fallback to PostgreSQL or file-based storage.

---

## ✅ Implementation

### Convex Database Adapter

**Features:**
- ✅ **ConvexHttpClient Integration:**
  - Uses Convex HTTP client for Node.js
  - Supports query and mutation functions
  - Automatic API generation support

- ✅ **SQL-like Query Support:**
  - Translates SQL queries to Convex operations
  - Supports SELECT, INSERT, UPDATE, DELETE
  - Parameterized queries

- ✅ **Convex Function Support:**
  - Direct query function calls
  - Direct mutation function calls
  - Nested function path support

- ✅ **Transaction Support:**
  - Simulated transactions via operations tracking
  - Commit/rollback support
  - Convex-native transaction handling

- ✅ **Automatic Fallback:**
  - Convex → PostgreSQL → File-based
  - Graceful degradation
  - No breaking changes

**Files:**
- `packages/scripts/src/database/database-manager.ts` (updated)

---

## 🚀 Setup

### 1. Install Convex

```bash
npm install convex
# or
pnpm add convex
```

### 2. Initialize Convex Project

```bash
npx convex dev
```

This will:
- Create a `convex/` directory
- Generate API files in `convex/_generated/api.js`
- Set up your Convex deployment

### 3. Set Environment Variable

```bash
# .env or .env.local
CONVEX_URL=https://your-deployment.convex.cloud
```

Or get it from your Convex dashboard after running `npx convex dev`.

### 4. Create Convex Functions

Create functions in `convex/` directory:

**Example: `convex/workflows.ts`**
```typescript
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Query: List all workflows
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("workflows").collect();
  },
});

// Query: Get workflow by ID
export const get = query({
  args: { id: v.id("workflows") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Mutation: Create workflow
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    steps: v.array(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("workflows", {
      name: args.name,
      description: args.description,
      steps: args.steps,
      createdAt: Date.now(),
    });
  },
});

// Mutation: Update workflow
export const update = mutation({
  args: {
    id: v.id("workflows"),
    updates: v.any(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, args.updates);
    return args.id;
  },
});

// Mutation: Delete workflow
export const deleteWorkflow = mutation({
  args: { id: v.id("workflows") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
```

### 5. Define Schema (Optional)

**`convex/schema.ts`**
```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  workflows: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    steps: v.array(v.any()),
    status: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
  deployments: defineTable({
    siteId: v.string(),
    status: v.string(),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
  }),
});
```

---

## 📖 Usage

### Using SQL-like Queries

```typescript
import { DatabaseManager } from '@repo/scripts/database/database-manager';

const db = new DatabaseManager();
await db.connect();

// SELECT query
const result = await db.query('SELECT * FROM workflows');
console.log(result.rows);

// INSERT query
await db.query('INSERT INTO workflows (name, description) VALUES ($1, $2)', [
  'My Workflow',
  'Workflow description'
]);

// UPDATE query
await db.query('UPDATE workflows SET status = $1 WHERE id = $2', [
  'completed',
  workflowId
]);

// DELETE query
await db.query('DELETE FROM workflows WHERE id = $1', [workflowId]);
```

### Using Convex Functions (Recommended)

```typescript
import { DatabaseManager } from '@repo/scripts/database/database-manager';

const db = new DatabaseManager();
await db.connect();

// Query function
const workflows = await db.queryFunction('workflows.list');

// Mutation function
const workflowId = await db.mutateFunction('workflows.create', {
  name: 'My Workflow',
  description: 'Workflow description',
  steps: [],
});

// Update workflow
await db.mutateFunction('workflows.update', {
  id: workflowId,
  updates: { status: 'completed' }
});
```

### Using Transactions

```typescript
await db.transaction(async (tx) => {
  // Multiple operations
  await tx.query('INSERT INTO workflows ...');
  await tx.query('INSERT INTO deployments ...');
  await tx.commit(); // All or nothing
});
```

---

## 🔄 Fallback Chain

The database manager automatically falls back through this chain:

1. **Convex** (if `CONVEX_URL` is set)
2. **PostgreSQL** (if `DATABASE_URL` is set)
3. **File-based** (always available)

This ensures your application works even without external databases.

---

## ✨ Benefits

### Real-Time Updates
- Convex provides real-time synchronization
- Changes propagate automatically to all clients
- No polling needed

### Type Safety
- Generated TypeScript types from schema
- Compile-time type checking
- Better developer experience

### Serverless
- No database management
- Automatic scaling
- Built-in authentication (optional)

### Modern API
- Function-based queries
- No SQL knowledge required
- Better abstraction

---

## 📊 Comparison

| Feature | Convex | PostgreSQL | File-based |
|---------|--------|------------|------------|
| Real-time | ✅ | ❌ | ❌ |
| Type-safe | ✅ | ⚠️ | ❌ |
| Serverless | ✅ | ❌ | ✅ |
| SQL Support | ⚠️ | ✅ | ⚠️ |
| Transactions | ✅ | ✅ | ⚠️ |
| Scalability | ✅ | ⚠️ | ❌ |

---

## 🔧 Configuration

### Environment Variables

```bash
# Convex (primary)
CONVEX_URL=https://your-deployment.convex.cloud

# PostgreSQL (fallback)
DATABASE_URL=postgresql://user:pass@localhost/dbname
```

### Priority Order

The database manager checks in this order:
1. `CONVEX_URL` → Convex adapter
2. `DATABASE_URL` → PostgreSQL adapter
3. No env vars → File-based adapter

---

## 📝 Example Integration

### Workflow Storage with Convex

```typescript
import { DatabaseManager } from '@repo/scripts/database/database-manager';

class WorkflowStorage {
  private db: DatabaseManager;

  constructor() {
    this.db = new DatabaseManager();
  }

  async saveWorkflow(workflow: Workflow): Promise<string> {
    await this.db.connect();

    // Using Convex function (recommended)
    const id = await this.db.mutateFunction('workflows.create', {
      name: workflow.name,
      description: workflow.description,
      steps: workflow.steps,
      status: workflow.status,
    });

    return id;
  }

  async getWorkflow(id: string): Promise<Workflow | null> {
    await this.db.connect();

    // Using Convex function
    return await this.db.queryFunction('workflows.get', { id });
  }

  async listWorkflows(): Promise<Workflow[]> {
    await this.db.connect();

    // Using Convex function
    return await this.db.queryFunction('workflows.list');
  }
}
```

---

## ✅ Status

**Convex Database Integration** - ✅ **COMPLETE**

Features delivered:
- ✅ Convex adapter implementation
- ✅ SQL-like query translation
- ✅ Convex function support
- ✅ Transaction support
- ✅ Automatic fallback chain
- ✅ Zero breaking changes

---

**Last Updated:** December 2024
**Documentation:** See Convex docs at https://docs.convex.dev
**Setup:** Run `npx convex dev` to initialize

