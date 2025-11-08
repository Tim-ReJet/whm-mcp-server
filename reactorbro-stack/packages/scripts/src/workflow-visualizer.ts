/**
 * Workflow Visualization Utilities
 * Converts workflow definitions to visual graph structures
 */

import type { Workflow, WorkflowStep } from '../../agents/core/types.js';

export interface GraphNode {
  id: string;
  label: string;
  type: 'step' | 'start' | 'end';
  status?: 'pending' | 'running' | 'completed' | 'failed';
  agent?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: 'dependency' | 'parallel';
}

export interface WorkflowGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  layout: 'hierarchical' | 'force' | 'circular';
}

export class WorkflowVisualizer {
  /**
   * Convert workflow to graph structure
   */
  static workflowToGraph(workflow: Workflow, executionState?: any): WorkflowGraph {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    // Add start node
    nodes.push({
      id: 'start',
      label: 'Start',
      type: 'start',
      x: 0,
      y: 0,
    });

    // Add step nodes
    workflow.steps.forEach((step, index) => {
      const status = executionState?.steps?.find(
        (s: any) => s.stepId === step.id
      )?.status || 'pending';

      nodes.push({
        id: step.id,
        label: step.name || step.id,
        type: 'step',
        status,
        agent: step.agent,
        x: 0,
        y: (index + 1) * 150,
      });

      // Add edges for dependencies
      if (step.dependsOn && step.dependsOn.length > 0) {
        step.dependsOn.forEach((dep) => {
          edges.push({
            id: `${dep}-${step.id}`,
            source: dep,
            target: step.id,
            type: step.parallel ? 'parallel' : 'dependency',
          });
        });
      } else {
        // Connect to start if no dependencies
        edges.push({
          id: `start-${step.id}`,
          source: 'start',
          target: step.id,
          type: 'dependency',
        });
      }
    });

    // Add end node
    const endNodeId = 'end';
    nodes.push({
      id: endNodeId,
      label: 'End',
      type: 'end',
      x: 0,
      y: (workflow.steps.length + 1) * 150,
    });

    // Connect final steps to end
    const finalSteps = workflow.steps.filter(
      (step) =>
        !workflow.steps.some((s) =>
          s.dependsOn?.includes(step.id)
        )
    );

    finalSteps.forEach((step) => {
      edges.push({
        id: `${step.id}-end`,
        source: step.id,
        target: endNodeId,
        type: 'dependency',
      });
    });

    // Calculate layout
    const layout = this.calculateLayout(nodes, edges);

    return {
      nodes: layout.nodes,
      edges: layout.edges,
      layout: 'hierarchical',
    };
  }

  /**
   * Calculate node positions using hierarchical layout
   */
  private static calculateLayout(
    nodes: GraphNode[],
    edges: GraphEdge[]
  ): { nodes: GraphNode[]; edges: GraphEdge[] } {
    // Simple hierarchical layout algorithm
    const levels = new Map<string, number>();
    const visited = new Set<string>();

    // Find start node
    const startNode = nodes.find((n) => n.type === 'start');
    if (startNode) {
      levels.set(startNode.id, 0);
      visited.add(startNode.id);
    }

    // Calculate levels using BFS
    const queue: string[] = startNode ? [startNode.id] : [];
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const currentLevel = levels.get(currentId) || 0;

      const outgoingEdges = edges.filter((e) => e.source === currentId);
      for (const edge of outgoingEdges) {
        if (!visited.has(edge.target)) {
          levels.set(edge.target, currentLevel + 1);
          visited.add(edge.target);
          queue.push(edge.target);
        }
      }
    }

    // Position nodes by level
    const nodesByLevel = new Map<number, GraphNode[]>();
    nodes.forEach((node) => {
      const level = levels.get(node.id) || 0;
      if (!nodesByLevel.has(level)) {
        nodesByLevel.set(level, []);
      }
      nodesByLevel.get(level)!.push(node);
    });

    const maxLevel = Math.max(...Array.from(nodesByLevel.keys()));
    const nodeWidth = 200;
    const nodeHeight = 100;
    const levelSpacing = 300;
    const nodeSpacing = 150;

    nodes.forEach((node) => {
      const level = levels.get(node.id) || 0;
      const nodesInLevel = nodesByLevel.get(level) || [];
      const indexInLevel = nodesInLevel.indexOf(node);

      node.x = level * levelSpacing + 100;
      node.y =
        (indexInLevel - (nodesInLevel.length - 1) / 2) * nodeSpacing + 200;
      node.width = nodeWidth;
      node.height = nodeHeight;
    });

    return { nodes, edges };
  }

  /**
   * Get workflow statistics
   */
  static getWorkflowStats(workflow: Workflow): {
    totalSteps: number;
    parallelSteps: number;
    sequentialSteps: number;
    maxDepth: number;
    estimatedDuration: number;
    estimatedTokens: number;
  } {
    const parallelSteps = workflow.steps.filter((s) => s.parallel).length;
    const sequentialSteps = workflow.steps.length - parallelSteps;

    // Calculate max depth
    const depths = new Map<string, number>();
    const calculateDepth = (stepId: string): number => {
      if (depths.has(stepId)) {
        return depths.get(stepId)!;
      }

      const step = workflow.steps.find((s) => s.id === stepId);
      if (!step || !step.dependsOn || step.dependsOn.length === 0) {
        depths.set(stepId, 1);
        return 1;
      }

      const maxDepDepth = Math.max(
        ...step.dependsOn.map((dep) => calculateDepth(dep))
      );
      depths.set(stepId, maxDepDepth + 1);
      return maxDepDepth + 1;
    };

    workflow.steps.forEach((step) => calculateDepth(step.id));
    const maxDepth = Math.max(...Array.from(depths.values()));

    // Rough estimates
    const estimatedDuration = workflow.steps.length * 120000; // 2 min per step
    const estimatedTokens = workflow.steps.length * 5000; // 5K tokens per step

    return {
      totalSteps: workflow.steps.length,
      parallelSteps,
      sequentialSteps,
      maxDepth,
      estimatedDuration,
      estimatedTokens,
    };
  }

  /**
   * Validate workflow for visualization
   */
  static validateWorkflow(workflow: Workflow): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!workflow.id) errors.push('Workflow ID is required');
    if (!workflow.name) errors.push('Workflow name is required');
    if (!workflow.steps || workflow.steps.length === 0) {
      errors.push('Workflow must have at least one step');
    }

    // Check for circular dependencies
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const checkCircular = (stepId: string): boolean => {
      if (recursionStack.has(stepId)) {
        errors.push(`Circular dependency detected involving step: ${stepId}`);
        return true;
      }

      if (visited.has(stepId)) {
        return false;
      }

      visited.add(stepId);
      recursionStack.add(stepId);

      const step = workflow.steps.find((s) => s.id === stepId);
      if (step?.dependsOn) {
        for (const dep of step.dependsOn) {
          if (checkCircular(dep)) {
            return true;
          }
        }
      }

      recursionStack.delete(stepId);
      return false;
    };

    workflow.steps.forEach((step) => {
      if (!visited.has(step.id)) {
        checkCircular(step.id);
      }
    });

    // Check for orphaned steps
    const allStepIds = new Set(workflow.steps.map((s) => s.id));
    workflow.steps.forEach((step) => {
      step.dependsOn?.forEach((dep) => {
        if (!allStepIds.has(dep)) {
          errors.push(`Step ${step.id} depends on non-existent step: ${dep}`);
        }
      });
    });

    // Warnings
    if (workflow.steps.length > 20) {
      warnings.push('Large workflow (>20 steps) may be difficult to visualize');
    }

    const parallelSteps = workflow.steps.filter((s) => s.parallel).length;
    if (parallelSteps === workflow.steps.length) {
      warnings.push('All steps are parallel - consider sequential dependencies');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

export default WorkflowVisualizer;

