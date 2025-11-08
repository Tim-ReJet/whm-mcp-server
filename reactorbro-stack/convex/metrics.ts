/**
 * Convex Functions for Performance Metrics
 */

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Record performance metric
 */
export const record = mutation({
  args: {
    metricType: v.string(),
    metricName: v.string(),
    value: v.number(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("performanceMetrics", {
      timestamp: Date.now(),
      metricType: args.metricType,
      metricName: args.metricName,
      value: args.value,
      metadata: args.metadata,
    });
  },
});

/**
 * Get metrics by type
 */
export const getByType = query({
  args: {
    metricType: v.string(),
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("performanceMetrics")
      .withIndex("by_metric_type", (q) => q.eq("metricType", args.metricType))
      .order("desc");

    let results = await query.collect();

    // Filter by time range
    if (args.startTime) {
      results = results.filter((m) => m.timestamp >= args.startTime!);
    }
    if (args.endTime) {
      results = results.filter((m) => m.timestamp <= args.endTime!);
    }

    // Limit results
    if (args.limit) {
      results = results.slice(0, args.limit);
    }

    return results;
  },
});

/**
 * Get metrics by name
 */
export const getByName = query({
  args: {
    metricName: v.string(),
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let results = await ctx.db.query("performanceMetrics").collect();

    // Filter by name
    results = results.filter((m) => m.metricName === args.metricName);

    // Filter by time range
    if (args.startTime) {
      results = results.filter((m) => m.timestamp >= args.startTime!);
    }
    if (args.endTime) {
      results = results.filter((m) => m.timestamp <= args.endTime!);
    }

    // Sort by timestamp descending
    results.sort((a, b) => b.timestamp - a.timestamp);

    // Limit results
    if (args.limit) {
      results = results.slice(0, args.limit);
    }

    return results;
  },
});

/**
 * Get recent metrics
 */
export const getRecent = query({
  args: {
    limit: v.optional(v.number()),
    metricType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("performanceMetrics").order("desc");

    let results = await query.collect();

    // Filter by type if provided
    if (args.metricType) {
      results = results.filter((m) => m.metricType === args.metricType);
    }

    // Limit results
    if (args.limit) {
      results = results.slice(0, args.limit);
    }

    return results;
  },
});

/**
 * Get aggregated metrics
 */
export const getAggregated = query({
  args: {
    metricType: v.string(),
    metricName: v.string(),
    startTime: v.number(),
    endTime: v.number(),
    aggregation: v.union(
      v.literal("avg"),
      v.literal("sum"),
      v.literal("min"),
      v.literal("max"),
      v.literal("count")
    ),
  },
  handler: async (ctx, args) => {
    const metrics = await ctx.db
      .query("performanceMetrics")
      .withIndex("by_metric_type", (q) => q.eq("metricType", args.metricType))
      .collect();

    const filtered = metrics.filter(
      (m) =>
        m.metricName === args.metricName &&
        m.timestamp >= args.startTime &&
        m.timestamp <= args.endTime
    );

    if (filtered.length === 0) {
      return null;
    }

    const values = filtered.map((m) => m.value);

    switch (args.aggregation) {
      case "avg":
        return values.reduce((a, b) => a + b, 0) / values.length;
      case "sum":
        return values.reduce((a, b) => a + b, 0);
      case "min":
        return Math.min(...values);
      case "max":
        return Math.max(...values);
      case "count":
        return values.length;
      default:
        return null;
    }
  },
});

