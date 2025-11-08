import type { Workflow, WorkflowStep, Context, ExecutionPlan, ExecutionStep } from './types';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { AgentOrchestrator } from './orchestrator';
import { ConvexWorkflowStorage } from './convex-storage';

export class WorkflowEngine {
  private workflows: Map<string, Workflow> = new Map();
  private executions: Map<string, ExecutionPlan> = new Map();
  private stateDir: string;
  private orchestrator?: AgentOrchestrator;
  private convexStorage?: ConvexWorkflowStorage;

  constructor(stateDir?: string) {
    this.stateDir = stateDir || join(process.cwd(), '.workflow-states');
    this.ensureStateDir();

    // Initialize Convex storage if available
    if (process.env.CONVEX_URL) {
      this.convexStorage = new ConvexWorkflowStorage();
      this.convexStorage.initialize().catch(() => {
        // Silently fail, will use file-based storage
      });
    }
  }

  setOrchestrator(orchestrator: AgentOrchestrator): void {
    this.orchestrator = orchestrator;
  }

  private ensureStateDir(): void {
    if (!existsSync(this.stateDir)) {
      mkdirSync(this.stateDir, { recursive: true });
    }
  }

  async loadWorkflow(workflow: Workflow): Promise<void> {
    this.workflows.set(workflow.id, workflow);

    // Save to Convex if available
    if (this.convexStorage) {
      await this.convexStorage.saveWorkflow(workflow).catch(() => {
        // Silently fail, file-based storage will be used
      });
    }
  }

  async loadWorkflowFromFile(filePath: string): Promise<void> {
    // TODO: Implement YAML parsing
    // For now, assume JSON workflow definition
    const content = readFileSync(filePath, 'utf-8');
    const workflow = JSON.parse(content) as Workflow;
    await this.loadWorkflow(workflow);
  }

  async execute(workflowId: string, context: Context): Promise<any> {
    // Try to load from Convex first if not in memory
    let workflow = this.workflows.get(workflowId);
    if (!workflow && this.convexStorage) {
      const convexWorkflow = await this.convexStorage.loadWorkflow(workflowId);
      if (convexWorkflow) {
        workflow = convexWorkflow;
        this.workflows.set(workflow.id, workflow);
      }
    }

    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    workflow.status = 'running';
    const executionId = `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
      const plan = await this.createExecutionPlan(workflow, context);
      this.executions.set(executionId, plan);

      // Save initial state
      const initialState = {
        workflowId,
        plan,
        context,
        startTime: new Date(),
      };
      await this.saveState(executionId, initialState);

      // Also save to Convex if available
      if (this.convexStorage) {
        await this.convexStorage.saveExecution(executionId, workflowId, {
          ...initialState,
          status: 'running',
        }).catch(() => {
          // Silently fail
        });
      }

      const results = await this.executeSteps(plan, context, executionId);

      workflow.status = 'completed';

      // Save final state
      const finalState = {
        workflowId,
        plan,
        context,
        results,
        endTime: new Date(),
        status: 'completed',
      };
      await this.saveState(executionId, finalState);

      // Also save to Convex if available
      if (this.convexStorage) {
        await this.convexStorage.saveExecution(executionId, workflowId, finalState).catch(() => {
          // Silently fail
        });
      }

      return results;
    } catch (error) {
      workflow.status = 'failed';

      // Save error state
      const errorState = {
        workflowId,
        context,
        error: error instanceof Error ? error.message : String(error),
        endTime: new Date(),
        status: 'failed',
      };
      await this.saveState(executionId, errorState);

      // Also save to Convex if available
      if (this.convexStorage) {
        await this.convexStorage.saveExecution(executionId, workflowId, errorState).catch(() => {
          // Silently fail
        });
      }

      throw error;
    }
  }

  private async createExecutionPlan(
    workflow: Workflow,
    context: Context
  ): Promise<ExecutionPlan> {
    const steps: ExecutionStep[] = workflow.steps.map((step) => ({
      stepId: step.id,
      agent: step.agent,
      parallel: step.parallel || false,
      dependencies: step.dependsOn || [],
      status: 'pending',
    }));

    // Calculate resource estimates
    const estimatedTokens = await this.estimateTokens(workflow);
    const estimatedDuration = await this.estimateDuration(workflow);

    const plan: ExecutionPlan = {
      workflow,
      steps,
      resources: {
        tokens: 0,
        time: 0,
        agents: [...new Set(steps.map((s) => s.agent))],
      },
      estimated: {
        totalTokens: estimatedTokens,
        duration: estimatedDuration,
        cost: estimatedTokens * 0.0001, // Rough cost estimate
      },
    };

    return plan;
  }

  private async executeSteps(
    plan: ExecutionPlan,
    context: Context,
    executionId: string
  ): Promise<any[]> {
    const results: any[] = [];
    const completedSteps = new Set<string>();
    const stepResults = new Map<string, any>();

    // Build dependency graph
    const dependencyGraph = this.buildDependencyGraph(plan.steps);

    // Execute steps respecting dependencies
    while (completedSteps.size < plan.steps.length) {
      const readySteps = plan.steps.filter(
        (step) =>
          step.status === 'pending' &&
          step.dependencies.every((dep) => completedSteps.has(dep))
      );

      if (readySteps.length === 0) {
        throw new Error('Circular dependency or missing dependencies detected');
      }

      // Execute ready steps (in parallel if allowed)
      const parallelSteps = readySteps.filter((s) => s.parallel);
      const sequentialSteps = readySteps.filter((s) => !s.parallel);

      // Execute parallel steps
      if (parallelSteps.length > 0) {
        const parallelResults = await Promise.all(
          parallelSteps.map((step) => this.executeStep(step, context, stepResults))
        );
        parallelSteps.forEach((step, index) => {
          step.status = 'completed';
          completedSteps.add(step.stepId);
          stepResults.set(step.stepId, parallelResults[index]);
          results.push(parallelResults[index]);
        });
      }

      // Execute sequential steps
      for (const step of sequentialSteps) {
        const result = await this.executeStep(step, context, stepResults);
        step.status = 'completed';
        completedSteps.add(step.stepId);
        stepResults.set(step.stepId, result);
        results.push(result);

        // Save intermediate state
        const intermediateState = {
          workflowId: plan.workflow.id,
          plan,
          context,
          stepResults: Object.fromEntries(stepResults),
          completedSteps: Array.from(completedSteps),
        };
        await this.saveState(executionId, intermediateState);

        // Also save to Convex if available
        if (this.convexStorage) {
          await this.convexStorage.saveExecution(executionId, plan.workflow.id, {
            ...intermediateState,
            status: 'running',
          }).catch(() => {
            // Silently fail
          });
        }
      }
    }

    return results;
  }

  private async executeStep(
    step: ExecutionStep,
    context: Context,
    stepResults: Map<string, any>
  ): Promise<any> {
    step.status = 'running';

    try {
      if (!this.orchestrator) {
        throw new Error('Orchestrator not set');
      }

      const agent = await this.orchestrator.getAgent(step.agent);
      if (!agent) {
        throw new Error(`Agent ${step.agent} not found`);
      }

      // Create task from step
      const task = {
        id: `task-${Date.now()}`,
        type: 'custom' as const,
        title: step.stepId,
        description: `Execute step ${step.stepId}`,
        parameters: {},
        context,
        priority: 'medium' as const,
        dependencies: step.dependencies,
        status: 'running' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await agent.executeWithRetry(task, context);
      step.status = 'completed';

      return {
        stepId: step.stepId,
        success: result.success,
        data: result.data,
        metadata: result.metadata,
      };
    } catch (error) {
      step.status = 'failed';
      throw error;
    }
  }

  private buildDependencyGraph(steps: ExecutionStep[]): Map<string, string[]> {
    const graph = new Map<string, string[]>();

    for (const step of steps) {
      graph.set(step.stepId, step.dependencies);
    }

    return graph;
  }

  private async estimateTokens(workflow: Workflow): Promise<number> {
    // Rough estimation based on number of steps
    return workflow.steps.length * 5000; // ~5K tokens per step
  }

  private async estimateDuration(workflow: Workflow): Promise<number> {
    // Rough estimation: 2 minutes per step
    return workflow.steps.length * 120000;
  }

  async saveState(executionId: string, state: any): Promise<void> {
    const statePath = join(this.stateDir, `${executionId}.json`);
    const stateData = {
      ...state,
      savedAt: new Date(),
    };
    writeFileSync(statePath, JSON.stringify(stateData, null, 2), 'utf-8');
  }

  async loadState(executionId: string): Promise<any> {
    // Try Convex first if available
    if (this.convexStorage) {
      const convexState = await this.convexStorage.loadExecution(executionId);
      if (convexState) {
        return convexState;
      }
    }

    // Fallback to file-based storage
    const statePath = join(this.stateDir, `${executionId}.json`);
    if (!existsSync(statePath)) {
      return null;
    }

    const content = readFileSync(statePath, 'utf-8');
    return JSON.parse(content);
  }

  async resumeWorkflow(executionId: string): Promise<any> {
    const state = await this.loadState(executionId);
    if (!state) {
      throw new Error(`Workflow state ${executionId} not found`);
    }

    const workflow = this.workflows.get(state.workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${state.workflowId} not found`);
    }

    // Resume from saved state
    const plan = state.plan as ExecutionPlan;
    const context = state.context as Context;
    const completedSteps = new Set(state.completedSteps || []);
    const stepResults = new Map(Object.entries(state.stepResults || {}));

    // Mark completed steps
    for (const step of plan.steps) {
      if (completedSteps.has(step.stepId)) {
        step.status = 'completed';
      }
    }

    // Continue execution
    return await this.executeSteps(plan, context, executionId);
  }

  async getExecutionStatus(executionId: string): Promise<any> {
    const state = await this.loadState(executionId);
    if (!state) {
      return null;
    }

    return {
      executionId,
      workflowId: state.workflowId,
      status: state.status || 'running',
      startTime: state.startTime,
      endTime: state.endTime,
      completedSteps: state.completedSteps?.length || 0,
      totalSteps: state.plan?.steps.length || 0,
    };
  }

  /**
   * List all workflows (from Convex if available)
   */
  async listWorkflows(): Promise<Workflow[]> {
    if (this.convexStorage) {
      const convexWorkflows = await this.convexStorage.listWorkflows();
      if (convexWorkflows.length > 0) {
        // Update in-memory map
        for (const workflow of convexWorkflows) {
          this.workflows.set(workflow.id, workflow);
        }
        return convexWorkflows;
      }
    }

    // Fallback to in-memory workflows
    return Array.from(this.workflows.values());
  }

  /**
   * List executions for a workflow (from Convex if available)
   */
  async listExecutions(workflowId: string, limit?: number): Promise<any[]> {
    if (this.convexStorage) {
      return await this.convexStorage.listExecutions(workflowId, limit);
    }
    return [];
  }
}
