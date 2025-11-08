/**
 * Workflow Execution Optimizer
 * Optimizes workflow execution with parallel processing, resource pooling, and caching
 */

import type { Workflow, WorkflowStep, ExecutionPlan, ExecutionStep } from '../../agents/core/types.js';
import { EnhancedCacheManager } from '../cache/enhanced-cache.js';

export interface ExecutionMetrics {
  startTime: number;
  endTime?: number;
  duration?: number;
  stepsCompleted: number;
  stepsTotal: number;
  tokensUsed: number;
  cacheHits: number;
  cacheMisses: number;
  parallelExecutions: number;
  sequentialExecutions: number;
}

export interface ResourcePool {
  maxConcurrent: number;
  currentUsage: number;
  available: number;
}

export class WorkflowExecutionOptimizer {
  private cacheManager: EnhancedCacheManager;
  private resourcePool: ResourcePool;
  private executionQueue: Array<{ workflowId: string; priority: number }> = [];
  private activeExecutions: Map<string, ExecutionMetrics> = new Map();

  constructor(cacheManager?: EnhancedCacheManager, maxConcurrent: number = 5) {
    this.cacheManager = cacheManager || new EnhancedCacheManager();
    this.resourcePool = {
      maxConcurrent,
      currentUsage: 0,
      available: maxConcurrent,
    };
  }

  /**
   * Optimize execution plan with caching and resource estimation
   */
  async optimizeExecutionPlan(
    workflow: Workflow,
    context: any
  ): Promise<ExecutionPlan> {
    const cacheKey = `workflow:plan:${workflow.id}:${this.hashContext(context)}`;

    // Check cache for execution plan
    const cachedPlan = await this.cacheManager.get(cacheKey);
    if (cachedPlan) {
      return cachedPlan;
    }

    // Build optimized execution plan
    const plan = await this.buildOptimizedPlan(workflow, context);

    // Cache the plan
    await this.cacheManager.set(cacheKey, plan, 3600000); // 1 hour

    return plan;
  }

  /**
   * Build optimized execution plan with dependency analysis
   */
  private async buildOptimizedPlan(
    workflow: Workflow,
    context: any
  ): Promise<ExecutionPlan> {
    const steps: ExecutionStep[] = workflow.steps.map((step) => ({
      stepId: step.id,
      agent: step.agent,
      parallel: step.parallel || false,
      dependencies: step.dependsOn || [],
      status: 'pending',
    }));

    // Analyze dependencies and optimize parallel execution
    const optimizedSteps = this.optimizeStepOrder(steps);

    // Estimate resources
    const estimatedTokens = await this.estimateTokens(workflow);
    const estimatedDuration = await this.estimateDuration(workflow, optimizedSteps);

    return {
      workflow,
      steps: optimizedSteps,
      resources: {
        tokens: 0,
        time: 0,
        agents: [...new Set(steps.map((s) => s.agent))],
      },
      estimated: {
        totalTokens: estimatedTokens,
        duration: estimatedDuration,
        cost: estimatedTokens * 0.0001,
      },
    };
  }

  /**
   * Optimize step order for maximum parallelization
   */
  private optimizeStepOrder(steps: ExecutionStep[]): ExecutionStep[] {
    // Group steps by dependency level
    const levels: ExecutionStep[][] = [];
    const processed = new Set<string>();

    while (processed.size < steps.length) {
      const currentLevel: ExecutionStep[] = [];

      for (const step of steps) {
        if (processed.has(step.stepId)) continue;

        const allDepsProcessed = step.dependencies.every((dep) =>
          processed.has(dep)
        );

        if (allDepsProcessed) {
          currentLevel.push(step);
          processed.add(step.stepId);
        }
      }

      if (currentLevel.length === 0) {
        // Circular dependency or missing dependency
        break;
      }

      levels.push(currentLevel);
    }

    // Flatten levels, marking steps as parallel if in same level
    const optimized: ExecutionStep[] = [];
    for (const level of levels) {
      if (level.length > 1) {
        // Mark all steps in level as parallel
        level.forEach((step) => {
          step.parallel = true;
        });
      }
      optimized.push(...level);
    }

    return optimized;
  }

  /**
   * Execute workflow with optimization
   */
  async executeOptimized(
    workflow: Workflow,
    context: any,
    executor: (step: ExecutionStep, context: any) => Promise<any>
  ): Promise<any[]> {
    const executionId = `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const metrics: ExecutionMetrics = {
      startTime: Date.now(),
      stepsCompleted: 0,
      stepsTotal: workflow.steps.length,
      tokensUsed: 0,
      cacheHits: 0,
      cacheMisses: 0,
      parallelExecutions: 0,
      sequentialExecutions: 0,
    };

    this.activeExecutions.set(executionId, metrics);

    try {
      // Get optimized plan
      const plan = await this.optimizeExecutionPlan(workflow, context);

      // Execute with resource pooling
      const results = await this.executeWithPooling(plan, context, executor, metrics);

      metrics.endTime = Date.now();
      metrics.duration = metrics.endTime - metrics.startTime;

      return results;
    } finally {
      this.activeExecutions.delete(executionId);
      this.resourcePool.currentUsage--;
      this.resourcePool.available++;
    }
  }

  /**
   * Execute with resource pooling and concurrency limits
   */
  private async executeWithPooling(
    plan: ExecutionPlan,
    context: any,
    executor: (step: ExecutionStep, context: any) => Promise<any>,
    metrics: ExecutionMetrics
  ): Promise<any[]> {
    const results: any[] = [];
    const completedSteps = new Set<string>();
    const stepResults = new Map<string, any>();

    // Build dependency graph
    const dependencyGraph = this.buildDependencyGraph(plan.steps);

    while (completedSteps.size < plan.steps.length) {
      const readySteps = plan.steps.filter(
        (step) =>
          step.status === 'pending' &&
          step.dependencies.every((dep) => completedSteps.has(dep))
      );

      if (readySteps.length === 0) {
        throw new Error('Circular dependency or missing dependencies detected');
      }

      // Check resource pool availability
      const availableSlots = this.resourcePool.available;
      const stepsToExecute = readySteps.slice(0, availableSlots);

      // Execute parallel steps
      const parallelSteps = stepsToExecute.filter((s) => s.parallel);
      const sequentialSteps = stepsToExecute.filter((s) => !s.parallel);

      // Execute parallel steps with concurrency limit
      if (parallelSteps.length > 0) {
        this.resourcePool.currentUsage += parallelSteps.length;
        this.resourcePool.available -= parallelSteps.length;

        const parallelResults = await Promise.all(
          parallelSteps.map((step) =>
            this.executeStepWithCache(step, context, stepResults, executor, metrics)
          )
        );

        parallelSteps.forEach((step, index) => {
          step.status = 'completed';
          completedSteps.add(step.stepId);
          stepResults.set(step.stepId, parallelResults[index]);
          results.push(parallelResults[index]);
          metrics.stepsCompleted++;
          metrics.parallelExecutions++;
        });

        this.resourcePool.currentUsage -= parallelSteps.length;
        this.resourcePool.available += parallelSteps.length;
      }

      // Execute sequential steps
      for (const step of sequentialSteps) {
        this.resourcePool.currentUsage++;
        this.resourcePool.available--;

        const result = await this.executeStepWithCache(
          step,
          context,
          stepResults,
          executor,
          metrics
        );

        step.status = 'completed';
        completedSteps.add(step.stepId);
        stepResults.set(step.stepId, result);
        results.push(result);
        metrics.stepsCompleted++;
        metrics.sequentialExecutions++;

        this.resourcePool.currentUsage--;
        this.resourcePool.available++;
      }
    }

    return results;
  }

  /**
   * Execute step with caching
   */
  private async executeStepWithCache(
    step: ExecutionStep,
    context: any,
    stepResults: Map<string, any>,
    executor: (step: ExecutionStep, context: any) => Promise<any>,
    metrics: ExecutionMetrics
  ): Promise<any> {
    // Check cache for step result
    const cacheKey = `workflow:step:${step.stepId}:${this.hashContext(context)}`;
    const cached = await this.cacheManager.get(cacheKey);

    if (cached) {
      metrics.cacheHits++;
      return cached;
    }

    metrics.cacheMisses++;

    // Execute step
    const result = await executor(step, context);

    // Cache result
    await this.cacheManager.set(cacheKey, result, 1800000); // 30 minutes

    return result;
  }

  private buildDependencyGraph(steps: ExecutionStep[]): Map<string, string[]> {
    const graph = new Map<string, string[]>();
    for (const step of steps) {
      graph.set(step.stepId, step.dependencies);
    }
    return graph;
  }

  private async estimateTokens(workflow: Workflow): Promise<number> {
    return workflow.steps.length * 5000; // ~5K tokens per step
  }

  private async estimateDuration(
    workflow: Workflow,
    optimizedSteps: ExecutionStep[]
  ): Promise<number> {
    // Calculate based on dependency levels
    const levels = this.calculateLevels(optimizedSteps);
    const maxParallelInLevel = Math.max(...levels.map((l) => l.length));
    const sequentialTime = levels.length * 120000; // 2 min per level
    const parallelTime = sequentialTime / maxParallelInLevel;

    return Math.max(sequentialTime, parallelTime);
  }

  private calculateLevels(steps: ExecutionStep[]): ExecutionStep[][] {
    const levels: ExecutionStep[][] = [];
    const processed = new Set<string>();

    while (processed.size < steps.length) {
      const currentLevel: ExecutionStep[] = [];

      for (const step of steps) {
        if (processed.has(step.stepId)) continue;

        const allDepsProcessed = step.dependencies.every((dep) =>
          processed.has(dep)
        );

        if (allDepsProcessed) {
          currentLevel.push(step);
          processed.add(step.stepId);
        }
      }

      if (currentLevel.length === 0) break;
      levels.push(currentLevel);
    }

    return levels;
  }

  private hashContext(context: any): string {
    return JSON.stringify(context)
      .split('')
      .reduce((acc, char) => {
        const hash = ((acc << 5) - acc) + char.charCodeAt(0);
        return hash & hash;
      }, 0)
      .toString(36);
  }

  /**
   * Get execution metrics
   */
  getMetrics(executionId: string): ExecutionMetrics | undefined {
    return this.activeExecutions.get(executionId);
  }

  /**
   * Get resource pool status
   */
  getResourcePool(): ResourcePool {
    return { ...this.resourcePool };
  }

  /**
   * Clear execution cache
   */
  async clearCache(): Promise<void> {
    await this.cacheManager.invalidate('workflow:*');
  }
}

export default WorkflowExecutionOptimizer;

