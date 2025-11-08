/**
 * Convex Storage Adapter for Workflow Engine
 * Provides Convex-backed storage with file-based fallback
 */

import { DatabaseManager } from "../../packages/scripts/src/database/database-manager";
import type { ExecutionPlan, Workflow } from "./types";

export class ConvexWorkflowStorage {
  private db: DatabaseManager;
  private useConvex = false;

  constructor() {
    this.db = new DatabaseManager();
  }

  async initialize(): Promise<void> {
    try {
      await this.db.connect();
      // Check if Convex is available
      if (process.env.CONVEX_URL) {
        try {
          await this.db.queryFunction("workflows.list");
          this.useConvex = true;
        } catch {
          // Convex not available, use file-based
          this.useConvex = false;
        }
      }
    } catch {
      this.useConvex = false;
    }
  }

  /**
   * Save workflow to Convex or file system
   */
  async saveWorkflow(workflow: Workflow): Promise<void> {
    if (this.useConvex) {
      try {
        // Check if workflow exists
        const existing = await this.db.queryFunction("workflows.get", {
          id: workflow.id,
        });

        if (existing) {
          await this.db.mutateFunction("workflows.update", {
            id: workflow.id,
            updates: {
              name: workflow.name,
              description: workflow.description,
              steps: workflow.steps,
              config: workflow.config,
              status: workflow.status,
            },
          });
        } else {
          await this.db.mutateFunction("workflows.create", {
            id: workflow.id,
            name: workflow.name,
            description: workflow.description,
            version: workflow.version,
            steps: workflow.steps,
            config: workflow.config,
            status: workflow.status,
          });
        }
      } catch (error) {
        console.warn("Failed to save workflow to Convex, using file-based storage:", error);
        this.useConvex = false;
        // Fallback handled by caller
      }
    }
  }

  /**
   * Load workflow from Convex or file system
   */
  async loadWorkflow(workflowId: string): Promise<Workflow | null> {
    if (this.useConvex) {
      try {
        const workflow = await this.db.queryFunction("workflows.get", {
          id: workflowId,
        });
        if (workflow) {
          // Convert Convex document to Workflow format
          return {
            id: workflow.id,
            name: workflow.name,
            description: workflow.description || "",
            version: workflow.version,
            steps: workflow.steps,
            config: workflow.config,
            status: workflow.status,
          };
        }
      } catch (error) {
        console.warn("Failed to load workflow from Convex:", error);
      }
    }
    return null;
  }

  /**
   * List all workflows
   */
  async listWorkflows(): Promise<Workflow[]> {
    if (this.useConvex) {
      try {
        const workflows = await this.db.queryFunction("workflows.list");
        return workflows.map((w: Record<string, unknown>) => ({
          id: w.id as string,
          name: w.name as string,
          description: (w.description as string) || "",
          version: w.version as string,
          steps: w.steps as Workflow["steps"],
          config: w.config as Workflow["config"],
          status: w.status as Workflow["status"],
        }));
      } catch (error) {
        console.warn("Failed to list workflows from Convex:", error);
      }
    }
    return [];
  }

  /**
   * Save execution state to Convex
   */
  async saveExecution(
    executionId: string,
    workflowId: string,
    state: Record<string, unknown>
  ): Promise<void> {
    if (this.useConvex) {
      try {
        // Check if execution exists
        const existing = await this.db.queryFunction("workflows.getExecution", {
          executionId,
        });

        const executionData = {
          status: state.status || "running",
          results: state.results,
          error: state.error,
          stepResults: state.stepResults,
          completedSteps: state.completedSteps,
        };

        if (existing) {
          await this.db.mutateFunction("workflows.updateExecution", {
            executionId,
            updates: executionData,
          });
        } else {
          await this.db.mutateFunction("workflows.createExecution", {
            workflowId,
            executionId,
            context: state.context,
          });
          await this.db.mutateFunction("workflows.updateExecution", {
            executionId,
            updates: executionData,
          });
        }
      } catch (error) {
        console.warn("Failed to save execution to Convex:", error);
      }
    }
  }

  /**
   * Load execution state from Convex
   */
  async loadExecution(executionId: string): Promise<Record<string, unknown> | null> {
    if (this.useConvex) {
      try {
        const execution = await this.db.queryFunction("workflows.getExecution", {
          executionId,
        });
        if (execution) {
          return {
            workflowId: execution.workflowId,
            executionId: execution.executionId,
            status: execution.status,
            startTime: new Date(execution.startTime),
            endTime: execution.endTime ? new Date(execution.endTime) : undefined,
            context: execution.context,
            results: execution.results,
            error: execution.error,
            stepResults: execution.stepResults,
            completedSteps: execution.completedSteps,
          };
        }
      } catch (error) {
        console.warn("Failed to load execution from Convex:", error);
      }
    }
    return null;
  }

  /**
   * List executions for a workflow
   */
  async listExecutions(workflowId: string, limit?: number): Promise<Record<string, unknown>[]> {
    if (this.useConvex) {
      try {
        return await this.db.queryFunction("workflows.listExecutions", {
          workflowId,
          limit,
        });
      } catch (error) {
        console.warn("Failed to list executions from Convex:", error);
      }
    }
    return [];
  }
}
