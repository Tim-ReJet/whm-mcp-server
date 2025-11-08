import { readFileSync } from 'fs';
import { join } from 'path';
import type { Workflow, WorkflowStep } from '../core/types';

/**
 * Workflow Loader
 * Loads workflow definitions from YAML or JSON files
 */

export class WorkflowLoader {
  /**
   * Load workflow from YAML file
   * Note: Requires js-yaml package for full YAML support
   */
  async loadFromYAML(filePath: string): Promise<Workflow> {
    const content = readFileSync(filePath, 'utf-8');

    // For now, parse as JSON (YAML parser would be added later)
    // In production, use: import yaml from 'js-yaml'; return yaml.load(content);
    try {
      return JSON.parse(content) as Workflow;
    } catch {
      // If JSON parsing fails, try basic YAML parsing
      return this.parseBasicYAML(content);
    }
  }

  /**
   * Load workflow from JSON file
   */
  async loadFromJSON(filePath: string): Promise<Workflow> {
    const content = readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as Workflow;
  }

  /**
   * Basic YAML parser (simplified - use js-yaml in production)
   */
  private parseBasicYAML(content: string): Workflow {
    // This is a simplified parser - for production use js-yaml
    const lines = content.split('\n');
    const workflow: Partial<Workflow> = {
      id: '',
      name: '',
      description: '',
      version: '1.0.0',
      steps: [],
      config: {
        maxConcurrent: 3,
        failFast: false,
        saveState: true,
        notifications: false,
      },
      status: 'draft',
    };

    let currentSection = '';
    let stepBuffer: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      if (trimmed.startsWith('name:')) {
        workflow.name = trimmed.split(':')[1].trim();
        workflow.id = workflow.name.toLowerCase().replace(/\s+/g, '-');
      } else if (trimmed.startsWith('version:')) {
        workflow.version = trimmed.split(':')[1].trim();
      } else if (trimmed.startsWith('description:')) {
        workflow.description = trimmed.split(':').slice(1).join(':').trim();
      } else if (trimmed.startsWith('steps:')) {
        currentSection = 'steps';
      } else if (trimmed.startsWith('- id:')) {
        if (stepBuffer.length > 0) {
          workflow.steps!.push(this.parseStep(stepBuffer.join('\n')));
        }
        stepBuffer = [trimmed];
      } else if (currentSection === 'steps' && trimmed.startsWith('-')) {
        stepBuffer.push(trimmed);
      }
    }

    if (stepBuffer.length > 0) {
      workflow.steps!.push(this.parseStep(stepBuffer.join('\n')));
    }

    return workflow as Workflow;
  }

  /**
   * Parse a workflow step from YAML-like format
   */
  private parseStep(stepContent: string): WorkflowStep {
    const lines = stepContent.split('\n');
    const step: Partial<WorkflowStep> = {
      id: '',
      name: '',
      agent: '',
      task: {
        id: '',
        type: 'custom',
        title: '',
        description: '',
        parameters: {},
        context: {} as any,
        priority: 'medium',
        dependencies: [],
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      dependsOn: [],
      parallel: false,
      optional: false,
      retryPolicy: {
        maxAttempts: 3,
        delay: 1000,
        backoff: 'exponential',
      },
      timeout: 300000,
    };

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('- id:')) {
        step.id = trimmed.split(':')[1].trim();
      } else if (trimmed.startsWith('name:')) {
        step.name = trimmed.split(':').slice(1).join(':').trim();
      } else if (trimmed.startsWith('agent:')) {
        step.agent = trimmed.split(':')[1].trim();
      } else if (trimmed.startsWith('dependsOn:')) {
        const deps = trimmed.split(':').slice(1).join(':').trim();
        step.dependsOn = deps ? deps.split(',').map(d => d.trim()) : [];
      } else if (trimmed.startsWith('parallel:')) {
        step.parallel = trimmed.split(':')[1].trim() === 'true';
      }
    }

    return step as WorkflowStep;
  }

  /**
   * Validate workflow structure
   */
  validateWorkflow(workflow: Workflow): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!workflow.id) errors.push('Workflow ID is required');
    if (!workflow.name) errors.push('Workflow name is required');
    if (!workflow.steps || workflow.steps.length === 0) {
      errors.push('Workflow must have at least one step');
    }

    // Validate steps
    for (const step of workflow.steps || []) {
      if (!step.id) errors.push(`Step missing ID`);
      if (!step.agent) errors.push(`Step ${step.id} missing agent`);
      if (!step.task) errors.push(`Step ${step.id} missing task`);
    }

    // Check for circular dependencies
    const circularDeps = this.checkCircularDependencies(workflow.steps || []);
    if (circularDeps.length > 0) {
      errors.push(`Circular dependencies detected: ${circularDeps.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check for circular dependencies in workflow steps
   */
  private checkCircularDependencies(steps: WorkflowStep[]): string[] {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const circular: string[] = [];

    const checkStep = (stepId: string): boolean => {
      if (recursionStack.has(stepId)) {
        circular.push(stepId);
        return true;
      }

      if (visited.has(stepId)) {
        return false;
      }

      visited.add(stepId);
      recursionStack.add(stepId);

      const step = steps.find((s) => s.id === stepId);
      if (step) {
        for (const dep of step.dependsOn || []) {
          if (checkStep(dep)) {
            return true;
          }
        }
      }

      recursionStack.delete(stepId);
      return false;
    };

    for (const step of steps) {
      if (!visited.has(step.id)) {
        checkStep(step.id);
      }
    }

    return circular;
  }
}

export default WorkflowLoader;

