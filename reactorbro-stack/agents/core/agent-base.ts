/**
 * Base Agent Class
 * All agents extend this base class
 */

import type {
  Agent,
  AgentConfig,
  AgentStatus,
  Task,
  TaskResult,
  Context,
  Skill,
  AgentError,
} from './types';

export abstract class AgentBase implements Agent {
  public id: string;
  public name: string;
  public description: string;
  public version: string;
  public category: Agent['category'];
  public capabilities: string[];
  public skills: string[];
  public subAgents: string[];
  public config: AgentConfig;
  public status: AgentStatus = 'idle';

  private skillRegistry: Map<string, Skill> = new Map();
  private subAgentRegistry: Map<string, AgentBase> = new Map();

  constructor(config: Partial<Agent>) {
    this.id = config.id || this.generateId();
    this.name = config.name || 'UnnamedAgent';
    this.description = config.description || '';
    this.version = config.version || '1.0.0';
    this.category = config.category || 'design';
    this.capabilities = config.capabilities || [];
    this.skills = config.skills || [];
    this.subAgents = config.subAgents || [];
    this.config = {
      maxRetries: 3,
      timeout: 300000, // 5 minutes
      tokenLimit: 10000,
      parallel: false,
      priority: 5,
      ...config.config,
    };
  }

  /**
   * Main execution method - must be implemented by subclasses
   */
  abstract execute(task: Task, context: Context): Promise<TaskResult>;

  /**
   * Validate task before execution
   */
  protected async validateTask(task: Task): Promise<boolean> {
    // Check if agent can handle this task type
    if (!this.capabilities.includes(task.type)) {
      throw new Error(
        `Agent ${this.id} cannot handle task type: ${task.type}`
      );
    }

    // Validate required parameters
    if (!task.parameters) {
      throw new Error('Task parameters are required');
    }

    return true;
  }

  /**
   * Execute task with error handling and retries
   */
  public async executeWithRetry(
    task: Task,
    context: Context
  ): Promise<TaskResult> {
    let attempts = 0;
    let lastError: Error | null = null;

    while (attempts < this.config.maxRetries) {
      try {
        this.status = 'running';
        
        // Validate task
        await this.validateTask(task);

        // Execute
        const startTime = Date.now();
        const result = await this.execute(task, context);
        const duration = Date.now() - startTime;

        // Add metadata
        result.metadata = {
          ...result.metadata,
          duration,
          agent: this.id,
          timestamp: new Date(),
        };

        this.status = 'completed';
        return result;

      } catch (error) {
        attempts++;
        lastError = error as Error;
        
        console.error(
          `Agent ${this.id} failed (attempt ${attempts}/${this.config.maxRetries}):`,
          error
        );

        if (attempts < this.config.maxRetries) {
          // Wait before retry (exponential backoff)
          await this.sleep(Math.pow(2, attempts) * 1000);
        }
      }
    }

    // All retries failed
    this.status = 'error';
    throw lastError || new Error('Task execution failed');
  }

  /**
   * Delegate task to a sub-agent
   */
  protected async delegateToSubAgent(
    subAgentId: string,
    task: Task,
    context: Context
  ): Promise<TaskResult> {
    const subAgent = this.subAgentRegistry.get(subAgentId);
    
    if (!subAgent) {
      throw new Error(`Sub-agent ${subAgentId} not found`);
    }

    return await subAgent.executeWithRetry(task, context);
  }

  /**
   * Use a skill
   */
  protected async useSkill(
    skillId: string,
    params: any,
    context: Context
  ): Promise<any> {
    const skill = this.skillRegistry.get(skillId);
    
    if (!skill) {
      throw new Error(`Skill ${skillId} not found`);
    }

    return await skill.execute(params, context);
  }

  /**
   * Register a skill
   */
  public registerSkill(skill: Skill): void {
    this.skillRegistry.set(skill.id, skill);
    if (!this.skills.includes(skill.id)) {
      this.skills.push(skill.id);
    }
  }

  /**
   * Register a sub-agent
   */
  public registerSubAgent(subAgent: AgentBase): void {
    this.subAgentRegistry.set(subAgent.id, subAgent);
    if (!this.subAgents.includes(subAgent.id)) {
      this.subAgents.push(subAgent.id);
    }
  }

  /**
   * Optimize prompt for token efficiency
   */
  protected async optimizePrompt(prompt: string): Promise<string> {
    // Simple optimization - remove extra whitespace
    return prompt
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');
  }

  /**
   * Estimate token usage
   */
  protected estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  /**
   * Check if within token budget
   */
  protected checkTokenBudget(estimated: number): void {
    if (estimated > this.config.tokenLimit) {
      throw new Error(
        `Estimated tokens (${estimated}) exceeds limit (${this.config.tokenLimit})`
      );
    }
  }

  /**
   * Log agent activity
   */
  protected log(level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level.toUpperCase()}] [${this.id}] ${message}`, data || '');
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get agent info
   */
  public getInfo(): Agent {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      version: this.version,
      category: this.category,
      capabilities: this.capabilities,
      skills: this.skills,
      subAgents: this.subAgents,
      config: this.config,
      status: this.status,
    };
  }

  /**
   * Pause agent
   */
  public pause(): void {
    this.status = 'paused';
  }

  /**
   * Resume agent
   */
  public resume(): void {
    this.status = 'idle';
  }

  /**
   * Stop agent
   */
  public stop(): void {
    this.status = 'idle';
  }
}
