/**
 * Core type definitions for the AI Agent system
 */

// ============================================================================
// Agent Types
// ============================================================================

export interface Agent {
  id: string;
  name: string;
  description: string;
  version: string;
  category: AgentCategory;
  capabilities: string[];
  skills: string[];
  subAgents: string[];
  config: AgentConfig;
  status: AgentStatus;
}

export type AgentCategory =
  | "design"
  | "content"
  | "planning"
  | "optimization"
  | "analysis";

export type AgentStatus = "idle" | "running" | "paused" | "error" | "completed";

export interface AgentConfig {
  maxRetries: number;
  timeout: number;
  tokenLimit: number;
  parallel: boolean;
  priority: number;
}

// ============================================================================
// Task Types
// ============================================================================

export interface Task {
  id: string;
  type: TaskType;
  title: string;
  description: string;
  parameters: Record<string, any>;
  context: Context;
  priority: Priority;
  deadline?: Date;
  dependencies: string[];
  status: TaskStatus;
  result?: TaskResult;
  error?: TaskError;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskType =
  | "design"
  | "logo_design"
  | "color_palette_generation"
  | "typography_selection"
  | "brand_identity"
  | "page_layout"
  | "grid_system"
  | "responsive_design"
  | "layout_optimization"
  | "content_generation"
  | "page_content"
  | "blog_post"
  | "copywriting"
  | "cta_creation"
  | "content_optimization"
  | "seo_optimization"
  | "seo_analysis"
  | "keyword_research"
  | "meta_tag_generation"
  | "planning"
  | "research"
  | "analysis"
  | "assembly"
  | "custom";

export type TaskStatus =
  | "pending"
  | "queued"
  | "running"
  | "paused"
  | "completed"
  | "failed"
  | "cancelled";

export type Priority = "low" | "medium" | "high" | "critical";

export interface TaskResult {
  success: boolean;
  data: any;
  metadata: {
    tokensUsed: number;
    duration: number;
    agent: string;
    timestamp: Date;
  };
}

export interface TaskError {
  code: string;
  message: string;
  stack?: string;
  recoverable: boolean;
}

// ============================================================================
// Context Types
// ============================================================================

export interface Context {
  id: string;
  siteId?: string;
  sessionId: string;
  data: Record<string, any>;
  history: ContextEntry[];
  metadata: ContextMetadata;
  compressed?: boolean;
}

export interface ContextEntry {
  timestamp: Date;
  agent: string;
  action: string;
  data: any;
  tokensUsed: number;
}

export interface ContextMetadata {
  created: Date;
  updated: Date;
  totalTokens: number;
  entryCount: number;
  size: number;
}

// ============================================================================
// Workflow Types
// ============================================================================

export interface Workflow {
  id: string;
  name: string;
  description: string;
  version: string;
  steps: WorkflowStep[];
  config: WorkflowConfig;
  status: WorkflowStatus;
}

export interface WorkflowStep {
  id: string;
  name: string;
  agent: string;
  task: Task;
  dependsOn: string[];
  parallel: boolean;
  optional: boolean;
  retryPolicy: RetryPolicy;
  timeout: number;
}

export interface WorkflowConfig {
  maxConcurrent: number;
  failFast: boolean;
  saveState: boolean;
  notifications: boolean;
}

export type WorkflowStatus =
  | "draft"
  | "ready"
  | "running"
  | "paused"
  | "completed"
  | "failed";

export interface RetryPolicy {
  maxAttempts: number;
  delay: number;
  backoff: "linear" | "exponential";
}

// ============================================================================
// Skill Types
// ============================================================================

export interface Skill {
  id: string;
  name: string;
  description: string;
  category: SkillCategory;
  version: string;
  parameters: SkillParameter[];
  execute: (params: any, context: Context) => Promise<any>;
  estimatedTokens: number;
  dependencies: string[];
}

export type SkillCategory =
  | "design"
  | "content"
  | "analysis"
  | "optimization"
  | "utility";

export interface SkillParameter {
  name: string;
  type: "string" | "number" | "boolean" | "object" | "array";
  required: boolean;
  default?: any;
  description: string;
  validation?: ValidationRule;
}

export interface ValidationRule {
  pattern?: string;
  min?: number;
  max?: number;
  enum?: any[];
}

// ============================================================================
// Token Optimization Types
// ============================================================================

export interface TokenUsage {
  agentId: string;
  taskId: string;
  prompt: string;
  completion: string;
  total: number;
  timestamp: Date;
}

export interface TokenBudget {
  limit: number;
  used: number;
  remaining: number;
  period: "hourly" | "daily" | "monthly";
}

export interface OptimizationStrategy {
  caching: boolean;
  compression: boolean;
  incremental: boolean;
  reusePatterns: boolean;
}

// ============================================================================
// Orchestration Types
// ============================================================================

export interface ExecutionPlan {
  workflow: Workflow;
  steps: ExecutionStep[];
  resources: ResourceAllocation;
  estimated: ExecutionEstimate;
}

export interface ExecutionStep {
  stepId: string;
  agent: string;
  parallel: boolean;
  dependencies: string[];
  status: "pending" | "running" | "completed" | "failed";
}

export interface ResourceAllocation {
  tokens: number;
  time: number;
  agents: string[];
}

export interface ExecutionEstimate {
  totalTokens: number;
  duration: number;
  cost: number;
}

// ============================================================================
// Event Types
// ============================================================================

export interface AgentEvent {
  type: AgentEventType;
  agentId: string;
  timestamp: Date;
  data: any;
}

export type AgentEventType =
  | "agent_started"
  | "agent_completed"
  | "agent_failed"
  | "agent_paused"
  | "task_started"
  | "task_completed"
  | "task_failed"
  | "workflow_started"
  | "workflow_completed"
  | "workflow_failed";

// ============================================================================
// Configuration Types
// ============================================================================

export interface SystemConfig {
  agents: {
    maxConcurrent: number;
    defaultTimeout: number;
    retryAttempts: number;
  };
  tokens: {
    globalLimit: number;
    perAgentLimit: number;
    optimization: OptimizationStrategy;
  };
  storage: {
    cacheEnabled: boolean;
    cacheDuration: number;
    maxCacheSize: number;
  };
  logging: {
    level: "debug" | "info" | "warn" | "error";
    enableMetrics: boolean;
  };
}

// ============================================================================
// Error Types
// ============================================================================

export class AgentError extends Error {
  constructor(
    message: string,
    public code: string,
    public agentId?: string,
    public recoverable: boolean = false,
  ) {
    super(message);
    this.name = "AgentError";
  }
}

export class TokenLimitError extends AgentError {
  constructor(agentId: string, limit: number, requested: number) {
    super(
      `Token limit exceeded for agent ${agentId}: ${requested} > ${limit}`,
      "TOKEN_LIMIT_EXCEEDED",
      agentId,
      false,
    );
    this.name = "TokenLimitError";
  }
}

export class WorkflowError extends Error {
  constructor(
    message: string,
    public workflowId: string,
    public step?: string,
  ) {
    super(message);
    this.name = "WorkflowError";
  }
}
