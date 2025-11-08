import type { Workflow, Context, Agent } from './types';
import { AgentBase } from './agent-base';
import { ContextManager } from './context-manager';
import { TokenOptimizer } from './token-optimizer';
import { WorkflowEngine } from './workflow-engine';
import { AgentHealthMonitor } from './health-monitor';
import { logger } from '../../../packages/observability/src/logging/logger.js';
import { agentMetrics } from '../../../packages/observability/src/metrics/metrics.js';
import { traceRequest, traceAsync, endTrace } from '../../../packages/observability/src/tracing/utils.js';

export class AgentOrchestrator {
  private agents: Map<string, AgentBase> = new Map();
  private contextManager: ContextManager;
  private tokenOptimizer: TokenOptimizer;
  private workflowEngine: WorkflowEngine;
  private healthMonitor: AgentHealthMonitor;

  constructor() {
    this.contextManager = new ContextManager();
    this.tokenOptimizer = new TokenOptimizer();
    this.workflowEngine = new WorkflowEngine();
    this.workflowEngine.setOrchestrator(this);
    this.healthMonitor = new AgentHealthMonitor();
  }

  async registerAgent(agent: AgentBase): Promise<void> {
    logger.info('Registering agent', { agentId: agent.id, name: agent.name });
    this.agents.set(agent.id, agent);
    // Perform initial health check
    const health = await this.healthMonitor.checkHealth(agent);
    if (health.status === 'unhealthy') {
      logger.warn('Agent registered but unhealthy', {
        agentId: agent.id,
        checks: health.checks.filter(c => c.status === 'fail').map(c => c.name),
      });
    } else {
      logger.info('Agent registered successfully', { agentId: agent.id, status: health.status });
    }
  }

  async getAgent(agentId: string): Promise<AgentBase | undefined> {
    return this.agents.get(agentId);
  }

  async startAgent(agentId: string): Promise<AgentBase> {
    const agent = this.agents.get(agentId);
    if (!agent) throw new Error(`Agent ${agentId} not found`);

    // Check health before starting
    const health = await this.healthMonitor.checkHealth(agent);
    if (health.status === 'unhealthy') {
      throw new Error(`Agent ${agentId} is unhealthy: ${health.checks.find(c => c.status === 'fail')?.message}`);
    }

    agent.resume();
    return agent;
  }

  async stopAgent(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.stop();
    }
  }

  async executeWorkflow(workflowId: string, context: Context): Promise<any> {
    const startTime = Date.now();

    // Start trace for workflow execution
    const traceContext = traceRequest(`workflow-${workflowId}`, {
      workflowId,
      contextId: context.id,
    });

    logger.info('Executing workflow', { workflowId, contextId: context.id });

    try {
      const result = await traceAsync('workflow-execution', async () => {
        return await this.workflowEngine.execute(workflowId, context);
      });

      const duration = (Date.now() - startTime) / 1000;

      agentMetrics.workflowSuccess.inc();
      agentMetrics.workflowDuration.observe(duration);

      endTrace(traceContext.traceId, 'success');

      logger.info('Workflow executed successfully', {
        workflowId,
        duration,
        contextId: context.id,
        traceId: traceContext.traceId,
      });

      return result;
    } catch (error) {
      const duration = (Date.now() - startTime) / 1000;

      agentMetrics.workflowFailure.inc();
      agentMetrics.workflowDuration.observe(duration);

      endTrace(traceContext.traceId, 'error');

      logger.error('Workflow execution failed', {
        workflowId,
        duration,
        contextId: context.id,
        traceId: traceContext.traceId,
      }, error as Error);

      throw error;
    }
  }

  async createContext(siteId?: string): Promise<Context> {
    return await this.contextManager.createContext(siteId);
  }

  async optimizeContext(context: Context): Promise<Context> {
    return await this.contextManager.compressContext(context.id);
  }

  listAgents(): Agent[] {
    return Array.from(this.agents.values()).map(agent => agent.getInfo());
  }

  async getUsageReport(): Promise<any> {
    return await this.tokenOptimizer.generateUsageReport('daily');
  }

  async checkAllAgentsHealth(): Promise<any> {
    const agents = Array.from(this.agents.values());
    return await this.healthMonitor.checkAllAgents(agents);
  }

  async getHealthStatus(agentId: string): Promise<any> {
    return this.healthMonitor.getHealthStatus(agentId);
  }

  startHealthMonitoring(intervalMs: number = 60000): void {
    const agents = Array.from(this.agents.values());
    this.healthMonitor.startMonitoring(agents, intervalMs);
  }

  stopHealthMonitoring(): void {
    this.healthMonitor.stopMonitoring();
  }
}
