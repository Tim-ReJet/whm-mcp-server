/**
 * Convex Schema Definition
 * Defines the database schema for ReactorBro Stack
 */

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Workflows table
  workflows: defineTable({
    id: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    version: v.string(),
    steps: v.array(v.any()),
    config: v.object({
      maxConcurrent: v.number(),
      failFast: v.boolean(),
      saveState: v.boolean(),
      notifications: v.boolean(),
    }),
    status: v.string(), // draft, running, completed, failed
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_name", ["name"]),

  // Workflow executions table
  workflowExecutions: defineTable({
    workflowId: v.string(),
    executionId: v.string(),
    status: v.string(), // pending, running, completed, failed
    startTime: v.number(),
    endTime: v.optional(v.number()),
    context: v.optional(v.any()),
    results: v.optional(v.any()),
    error: v.optional(v.string()),
    stepResults: v.optional(v.any()),
    completedSteps: v.optional(v.array(v.string())),
  })
    .index("by_workflow_id", ["workflowId"])
    .index("by_execution_id", ["executionId"])
    .index("by_status", ["status"]),

  // Assets table
  assets: defineTable({
    id: v.string(),
    name: v.string(),
    category: v.string(),
    type: v.string(),
    tags: v.array(v.string()),
    content: v.any(),
    metadata: v.object({
      author: v.optional(v.string()),
      version: v.string(),
      description: v.optional(v.string()),
      rating: v.optional(v.number()),
      downloads: v.number(),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
    dependencies: v.optional(v.array(v.string())),
    status: v.string(), // draft, published, archived
  })
    .index("by_category", ["category"])
    .index("by_type", ["type"])
    .index("by_status", ["status"])
    .index("by_tags", ["tags"]),

  // Deployments table
  deployments: defineTable({
    id: v.string(),
    siteId: v.string(),
    status: v.string(), // pending, building, deploying, completed, failed, rolled_back
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    buildTime: v.optional(v.number()),
    bundleSize: v.optional(v.number()),
    commitHash: v.optional(v.string()),
    branch: v.optional(v.string()),
    environment: v.string(), // development, staging, production
    changes: v.optional(v.array(v.string())),
    error: v.optional(v.string()),
    previousDeploymentId: v.optional(v.string()),
  })
    .index("by_site_id", ["siteId"])
    .index("by_status", ["status"])
    .index("by_environment", ["environment"]),

  // Sites table
  sites: defineTable({
    id: v.string(),
    name: v.string(),
    domain: v.optional(v.string()),
    config: v.any(),
    active: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_active", ["active"])
    .index("by_name", ["name"]),

  // Performance metrics table
  performanceMetrics: defineTable({
    timestamp: v.number(),
    metricType: v.string(), // workflow, cache, resource, build
    metricName: v.string(),
    value: v.number(),
    metadata: v.optional(v.any()),
  })
    .index("by_timestamp", ["timestamp"])
    .index("by_metric_type", ["metricType"]),

  // Cache entries table (for distributed caching)
  cacheEntries: defineTable({
    key: v.string(),
    value: v.any(),
    expires: v.number(),
    tags: v.optional(v.array(v.string())),
    hits: v.number(),
    createdAt: v.number(),
    accessedAt: v.number(),
  })
    .index("by_key", ["key"])
    .index("by_expires", ["expires"]),
});

