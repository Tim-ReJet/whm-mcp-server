/**
 * Convex Functions for Assets
 */

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * List all assets
 */
export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    let query = ctx.db.query("assets").order("desc");
    if (args.limit) {
      return await query.take(args.limit);
    }
    return await query.collect();
  },
});

/**
 * Get asset by ID
 */
export const get = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const assets = await ctx.db
      .query("assets")
      .filter((q) => q.eq(q.field("id"), args.id))
      .collect();
    return assets[0] || null;
  },
});

/**
 * Search assets
 */
export const search = query({
  args: {
    query: v.optional(v.string()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let queryBuilder = ctx.db.query("assets");

    if (args.category) {
      queryBuilder = queryBuilder.withIndex("by_category", (q) =>
        q.eq("category", args.category)
      );
    }

    let results = await queryBuilder.collect();

    // Filter by tags if provided
    if (args.tags && args.tags.length > 0) {
      results = results.filter((asset) =>
        args.tags!.some((tag) => asset.tags.includes(tag))
      );
    }

    // Simple text search
    if (args.query) {
      const queryLower = args.query.toLowerCase();
      results = results.filter(
        (asset) =>
          asset.name.toLowerCase().includes(queryLower) ||
          asset.metadata.description?.toLowerCase().includes(queryLower)
      );
    }

    // Limit results
    if (args.limit) {
      results = results.slice(0, args.limit);
    }

    return results;
  },
});

/**
 * Create asset
 */
export const create = mutation({
  args: {
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
    }),
    dependencies: v.optional(v.array(v.string())),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const assetId = await ctx.db.insert("assets", {
      id: args.id,
      name: args.name,
      category: args.category,
      type: args.type,
      tags: args.tags,
      content: args.content,
      metadata: {
        ...args.metadata,
        downloads: 0,
        createdAt: now,
        updatedAt: now,
      },
      dependencies: args.dependencies,
      status: args.status,
    });
    return assetId;
  },
});

/**
 * Update asset
 */
export const update = mutation({
  args: {
    id: v.string(),
    updates: v.object({
      name: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
      content: v.optional(v.any()),
      metadata: v.optional(v.any()),
      status: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const assets = await ctx.db
      .query("assets")
      .filter((q) => q.eq(q.field("id"), args.id))
      .collect();

    if (assets.length === 0) {
      throw new Error(`Asset ${args.id} not found`);
    }

    const asset = assets[0];
    const updateData: any = {
      ...args.updates,
    };

    if (args.updates.metadata) {
      updateData.metadata = {
        ...asset.metadata,
        ...args.updates.metadata,
        updatedAt: Date.now(),
      };
    } else {
      updateData.metadata = {
        ...asset.metadata,
        updatedAt: Date.now(),
      };
    }

    await ctx.db.patch(asset._id, updateData);
    return asset._id;
  },
});

/**
 * Delete asset
 */
export const deleteAsset = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const assets = await ctx.db
      .query("assets")
      .filter((q) => q.eq(q.field("id"), args.id))
      .collect();

    if (assets.length > 0) {
      await ctx.db.delete(assets[0]._id);
    }
  },
});

/**
 * Increment download count
 */
export const incrementDownloads = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const assets = await ctx.db
      .query("assets")
      .filter((q) => q.eq(q.field("id"), args.id))
      .collect();

    if (assets.length === 0) {
      throw new Error(`Asset ${args.id} not found`);
    }

    const asset = assets[0];
    await ctx.db.patch(asset._id, {
      metadata: {
        ...asset.metadata,
        downloads: (asset.metadata.downloads || 0) + 1,
      },
    });
  },
});

/**
 * Get assets by category
 */
export const getByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("assets")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .collect();
  },
});

/**
 * Get assets by tags
 */
export const getByTags = query({
  args: { tags: v.array(v.string()) },
  handler: async (ctx, args) => {
    const allAssets = await ctx.db.query("assets").collect();
    return allAssets.filter((asset) =>
      args.tags.some((tag) => asset.tags.includes(tag))
    );
  },
});

