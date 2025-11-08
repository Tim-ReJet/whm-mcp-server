/**
 * Convex Functions for Workflows
 */

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * List all workflows
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("workflows").order("desc").collect();
  },
});

/**
 * Get workflow by ID
 */
export const get = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const workflows = await ctx.db
      .query("workflows")
      .filter((q) => q.eq(q.field("id"), args.id))
      .collect();
    return workflows[0] || null;
  },
});

/**
 * Get workflows by status
 */
export const getByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("workflows")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

/**
 * Create a new workflow
 */
export const create = mutation({
  args: {
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
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const workflowId = await ctx.db.insert("workflows", {
      id: args.id,
      name: args.name,
      description: args.description,
      version: args.version,
      steps: args.steps,
      config: args.config,
      status: args.status,
      createdAt: now,
      updatedAt: now,
    });
    return workflowId;
  },
});

/**
 * Update workflow
 */
export const update = mutation({
  args: {
    id: v.string(),
    updates: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      steps: v.optional(v.array(v.any())),
      config: v.optional(v.any()),
      status: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const workflows = await ctx.db
      .query("workflows")
      .filter((q) => q.eq(q.field("id"), args.id))
      .collect();

    if (workflows.length === 0) {
      throw new Error(`Workflow ${args.id} not found`);
    }

    const workflow = workflows[0];
    await ctx.db.patch(workflow._id, {
      ...args.updates,
      updatedAt: Date.now(),
    });

    return workflow._id;
  },
});

/**
 * Delete workflow
 */
export const deleteWorkflow = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const workflows = await ctx.db
      .query("workflows")
      .filter((q) => q.eq(q.field("id"), args.id))
      .collect();

    if (workflows.length > 0) {
      await ctx.db.delete(workflows[0]._id);
    }
  },
});

/**
 * Create workflow execution
 */
export const createExecution = mutation({
  args: {
    workflowId: v.string(),
    executionId: v.string(),
    context: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const executionId = await ctx.db.insert("workflowExecutions", {
      workflowId: args.workflowId,
      executionId: args.executionId,
      status: "pending",
      startTime: Date.now(),
      context: args.context,
    });
    return executionId;
  },
});

/**
 * Update execution status
 */
export const updateExecution = mutation({
  args: {
    executionId: v.string(),
    updates: v.object({
      status: v.optional(v.string()),
      results: v.optional(v.any()),
      error: v.optional(v.string()),
      stepResults: v.optional(v.any()),
      completedSteps: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, args) => {
    const executions = await ctx.db
      .query("workflowExecutions")
      .withIndex("by_execution_id", (q) => q.eq("executionId", args.executionId))
      .collect();

    if (executions.length === 0) {
      throw new Error(`Execution ${args.executionId} not found`);
    }

    const execution = executions[0];
    const updateData: any = {
      ...args.updates,
    };

    if (args.updates.status === "completed" || args.updates.status === "failed") {
      updateData.endTime = Date.now();
    }

    await ctx.db.patch(execution._id, updateData);
    return execution._id;
  },
});

/**
 * Get execution by ID
 */
export const getExecution = query({
  args: { executionId: v.string() },
  handler: async (ctx, args) => {
    const executions = await ctx.db
      .query("workflowExecutions")
      .withIndex("by_execution_id", (q) => q.eq("executionId", args.executionId))
      .collect();
    return executions[0] || null;
  },
});

/**
 * List executions for a workflow
 */
export const listExecutions = query({
  args: { workflowId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("workflowExecutions")
      .withIndex("by_workflow_id", (q) => q.eq("workflowId", args.workflowId))
      .order("desc");

    if (args.limit) {
      return await query.take(args.limit);
    }
    return await query.collect();
  },
});

