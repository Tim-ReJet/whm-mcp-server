/**
 * Convex Functions for Deployments
 */

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * List all deployments
 */
export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    let query = ctx.db.query("deployments").order("desc");
    if (args.limit) {
      return await query.take(args.limit);
    }
    return await query.collect();
  },
});

/**
 * Get deployment by ID
 */
export const get = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const deployments = await ctx.db
      .query("deployments")
      .filter((q) => q.eq(q.field("id"), args.id))
      .collect();
    return deployments[0] || null;
  },
});

/**
 * Get deployments by site
 */
export const getBySite = query({
  args: { siteId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("deployments")
      .withIndex("by_site_id", (q) => q.eq("siteId", args.siteId))
      .order("desc");

    if (args.limit) {
      return await query.take(args.limit);
    }
    return await query.collect();
  },
});

/**
 * Get deployments by status
 */
export const getByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("deployments")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

/**
 * Create deployment
 */
export const create = mutation({
  args: {
    id: v.string(),
    siteId: v.string(),
    status: v.string(),
    environment: v.string(),
    commitHash: v.optional(v.string()),
    branch: v.optional(v.string()),
    changes: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const deploymentId = await ctx.db.insert("deployments", {
      id: args.id,
      siteId: args.siteId,
      status: args.status,
      startedAt: Date.now(),
      environment: args.environment,
      commitHash: args.commitHash,
      branch: args.branch,
      changes: args.changes,
    });
    return deploymentId;
  },
});

/**
 * Update deployment
 */
export const update = mutation({
  args: {
    id: v.string(),
    updates: v.object({
      status: v.optional(v.string()),
      buildTime: v.optional(v.number()),
      bundleSize: v.optional(v.number()),
      error: v.optional(v.string()),
      previousDeploymentId: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const deployments = await ctx.db
      .query("deployments")
      .filter((q) => q.eq(q.field("id"), args.id))
      .collect();

    if (deployments.length === 0) {
      throw new Error(`Deployment ${args.id} not found`);
    }

    const deployment = deployments[0];
    const updateData: any = {
      ...args.updates,
    };

    if (
      args.updates.status === "completed" ||
      args.updates.status === "failed" ||
      args.updates.status === "rolled_back"
    ) {
      updateData.completedAt = Date.now();
    }

    await ctx.db.patch(deployment._id, updateData);
    return deployment._id;
  },
});

/**
 * Get latest deployment for site
 */
export const getLatest = query({
  args: { siteId: v.string() },
  handler: async (ctx, args) => {
    const deployments = await ctx.db
      .query("deployments")
      .withIndex("by_site_id", (q) => q.eq("siteId", args.siteId))
      .order("desc")
      .take(1);
    return deployments[0] || null;
  },
});

/**
 * Get deployment history
 */
export const getHistory = query({
  args: {
    siteId: v.string(),
    limit: v.optional(v.number()),
    environment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("deployments")
      .withIndex("by_site_id", (q) => q.eq("siteId", args.siteId))
      .order("desc");

    let results = await query.collect();

    if (args.environment) {
      results = results.filter((d) => d.environment === args.environment);
    }

    if (args.limit) {
      results = results.slice(0, args.limit);
    }

    return results;
  },
});

