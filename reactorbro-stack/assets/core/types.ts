/**
 * Core type definitions for the Asset Management system
 */

// ============================================================================
// Asset Types
// ============================================================================

export interface Asset {
  id: string;
  name: string;
  description: string;
  category: AssetCategory;
  type: string;
  version: string;
  author: string;
  tags: string[];
  keywords: string[];
  
  // Content
  content: AssetContent;
  
  // Metadata
  metadata: AssetMetadata;
  
  // Relations
  dependencies: string[];
  dependents: string[];
  
  // Files
  files: AssetFile[];
  
  // Status
  status: AssetStatus;
  visibility: 'public' | 'private' | 'team';
}

export type AssetCategory =
  | 'design-tokens'
  | 'style-prompts'
  | 'templates'
  | 'ui-components'
  | 'workflows'
  | 'modules'
  | 'tools'
  | 'configs'
  | 'ai-prompts'
  | 'agent-workflows'
  | 'sub-agents'
  | 'agent-skills';

export type AssetStatus =
  | 'draft'
  | 'review'
  | 'published'
  | 'deprecated'
  | 'archived';

export interface AssetContent {
  code?: string;
  config?: Record<string, any>;
  data?: any;
  documentation?: string;
  examples?: AssetExample[];
}

export interface AssetExample {
  title: string;
  description: string;
  code: string;
  preview?: string;
}

export interface AssetMetadata {
  created: Date;
  updated: Date;
  downloads: number;
  views: number;
  rating: number;
  ratingCount: number;
  
  // Performance
  size: number;
  loadTime?: number;
  tokenCost?: number;
  
  // Quality
  tested: boolean;
  testCoverage?: number;
  accessibilityScore?: number;
  performanceScore?: number;
  
  // Licensing
  license: string;
  attribution?: string;
}

export interface AssetFile {
  path: string;
  content: string;
  type: string;
  size: number;
  hash: string;
}

// ============================================================================
// Version Control Types
// ============================================================================

export interface Version {
  id: string;
  assetId: string;
  version: string;
  changelog: string;
  changes: Change[];
  author: string;
  timestamp: Date;
  snapshot: Asset;
  tags: string[];
}

export interface Change {
  type: 'added' | 'modified' | 'removed';
  path: string;
  description: string;
  diff?: string;
}

export interface Branch {
  id: string;
  name: string;
  assetId: string;
  baseVersion: string;
  head: string;
  author: string;
  created: Date;
  status: 'active' | 'merged' | 'abandoned';
}

// ============================================================================
// Dependency Types
// ============================================================================

export interface Dependency {
  id: string;
  assetId: string;
  dependsOn: string;
  version: string;
  required: boolean;
  type: DependencyType;
}

export type DependencyType =
  | 'required'
  | 'optional'
  | 'peer'
  | 'dev';

export interface DependencyGraph {
  root: string;
  nodes: DependencyNode[];
  edges: DependencyEdge[];
}

export interface DependencyNode {
  id: string;
  asset: Asset;
  depth: number;
}

export interface DependencyEdge {
  from: string;
  to: string;
  type: DependencyType;
}

export interface Conflict {
  assetIds: string[];
  reason: string;
  severity: 'error' | 'warning';
  resolution?: string;
}

// ============================================================================
// Search Types
// ============================================================================

export interface SearchQuery {
  q: string;
  category?: AssetCategory;
  tags?: string[];
  author?: string;
  minRating?: number;
  sortBy?: SortField;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export type SortField =
  | 'relevance'
  | 'created'
  | 'updated'
  | 'rating'
  | 'downloads'
  | 'name';

export interface SearchResult {
  asset: Asset;
  score: number;
  highlights: string[];
}

export interface SearchIndex {
  assetId: string;
  content: string;
  tokens: string[];
  metadata: Record<string, any>;
}

export interface FilterCriteria {
  category?: AssetCategory[];
  tags?: string[];
  status?: AssetStatus[];
  author?: string[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  ratings?: {
    min: number;
    max: number;
  };
}

// ============================================================================
// Cache Types
// ============================================================================

export interface CacheEntry {
  key: string;
  value: any;
  size: number;
  hits: number;
  created: Date;
  accessed: Date;
  expires: Date;
  tags: string[];
}

export interface CacheStats {
  total: number;
  used: number;
  available: number;
  hitRate: number;
  entries: number;
}

export interface CachePolicy {
  maxSize: number;
  maxAge: number;
  strategy: 'lru' | 'lfu' | 'fifo';
  compression: boolean;
}

// ============================================================================
// Import/Export Types
// ============================================================================

export interface ImportData {
  format: 'json' | 'zip' | 'git';
  version: string;
  assets: Asset[];
  metadata: ImportMetadata;
}

export interface ImportMetadata {
  source: string;
  timestamp: Date;
  author: string;
  description: string;
}

export interface ExportData {
  format: 'json' | 'zip';
  assets: Asset[];
  dependencies: boolean;
  metadata: ExportMetadata;
}

export interface ExportMetadata {
  exported: Date;
  exporter: string;
  version: string;
  checksum: string;
}

export interface Package {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  assets: string[];
  dependencies: Record<string, string>;
  metadata: PackageMetadata;
}

export interface PackageMetadata {
  created: Date;
  updated: Date;
  downloads: number;
  rating: number;
  homepage?: string;
  repository?: string;
  license: string;
}

// ============================================================================
// Registry Types
// ============================================================================

export interface RegistryConfig {
  storage: {
    backend: 'filesystem' | 'database';
    path: string;
  };
  search: {
    engine: 'simple' | 'elasticsearch';
    indexPath: string;
  };
  cache: {
    enabled: boolean;
    policy: CachePolicy;
  };
  versioning: {
    enabled: boolean;
    maxVersions: number;
  };
}

export interface RegistryStats {
  total: number;
  byCategory: Record<AssetCategory, number>;
  byStatus: Record<AssetStatus, number>;
  storage: {
    used: number;
    available: number;
  };
}

// ============================================================================
// Marketplace Types
// ============================================================================

export interface MarketplaceListing {
  assetId: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  featured: boolean;
  verified: boolean;
  stats: {
    downloads: number;
    rating: number;
    reviews: number;
  };
}

export interface Review {
  id: string;
  assetId: string;
  author: string;
  rating: number;
  comment: string;
  timestamp: Date;
  helpful: number;
}

// ============================================================================
// Error Types
// ============================================================================

export class AssetError extends Error {
  constructor(
    message: string,
    public code: string,
    public assetId?: string
  ) {
    super(message);
    this.name = 'AssetError';
  }
}

export class AssetNotFoundError extends AssetError {
  constructor(assetId: string) {
    super(
      `Asset not found: ${assetId}`,
      'ASSET_NOT_FOUND',
      assetId
    );
    this.name = 'AssetNotFoundError';
  }
}

export class DependencyError extends AssetError {
  constructor(message: string, assetId: string) {
    super(message, 'DEPENDENCY_ERROR', assetId);
    this.name = 'DependencyError';
  }
}

export class VersionError extends AssetError {
  constructor(message: string, assetId: string) {
    super(message, 'VERSION_ERROR', assetId);
    this.name = 'VersionError';
  }
}
