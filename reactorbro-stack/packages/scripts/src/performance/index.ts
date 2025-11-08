/**
 * Performance Optimization Package
 * Exports all performance-related modules
 */

export {
  EnhancedCacheManager,
  MemoryCacheAdapter,
  RedisCacheAdapter,
} from "../cache/enhanced-cache.js";
export {
  DatabaseManager,
  FileDatabaseAdapter,
  PostgresDatabaseAdapter,
  ConvexDatabaseAdapter,
} from "../database/database-manager.js";
export { WorkflowExecutionOptimizer } from "./workflow-optimizer.js";
export { PerformanceMonitor } from "./performance-monitor.js";
export { BundleSizeOptimizer } from "./bundle-optimizer.js";

export type { CacheAdapter } from "../cache/enhanced-cache.js";
export type { CacheStats } from "../../../../assets/core/types.js";
export type { DatabaseAdapter, Transaction, Migration } from "../database/database-manager.js";
export type { ExecutionMetrics, ResourcePool } from "./workflow-optimizer.js";
export type { PerformanceMetrics, PerformanceAlert } from "./performance-monitor.js";
export type { BundleAnalysis, OptimizationResult } from "./bundle-optimizer.js";
