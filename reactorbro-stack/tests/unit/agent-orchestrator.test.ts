import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AgentOrchestrator } from '../../../agents/core/orchestrator';
import { AgentBase } from '../../../agents/core/agent-base';
import { createTestEnv } from './utils';
import type { Task, TaskResult, Context } from '../../../agents/core/types';

// Mock agent for testing
class MockAgent extends AgentBase {
  constructor() {
    super({
      id: 'mock-agent',
      name: 'Mock Agent',
      description: 'Test agent',
      category: 'design',
      capabilities: ['test_task'],
    });
  }

  async execute(task: Task, context: Context): Promise<TaskResult> {
    return {
      success: true,
      data: { result: 'test result' },
      metadata: {
        tokensUsed: 100,
        duration: 1000,
        agent: this.id,
        timestamp: new Date(),
      },
    };
  }
}

describe('Agent Orchestrator', () => {
  let orchestrator: AgentOrchestrator;
  let testEnv: ReturnType<typeof createTestEnv>;

  beforeEach(() => {
    orchestrator = new AgentOrchestrator();
    testEnv = createTestEnv();
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('Agent Registration', () => {
    it('should register an agent', async () => {
      const agent = new MockAgent();
      await orchestrator.registerAgent(agent);

      const registered = await orchestrator.getAgent('mock-agent');
      expect(registered).toBeDefined();
      expect(registered?.id).toBe('mock-agent');
    });

    it('should list all registered agents', async () => {
      const agent1 = new MockAgent();
      const agent2 = new MockAgent();
      agent2.id = 'mock-agent-2';

      await orchestrator.registerAgent(agent1);
      await orchestrator.registerAgent(agent2);

      const agents = orchestrator.listAgents();
      expect(agents.length).toBe(2);
    });
  });

  describe('Agent Execution', () => {
    it('should execute agent task', async () => {
      const agent = new MockAgent();
      await orchestrator.registerAgent(agent);

      const context = await orchestrator.createContext('test-site');
      const task: Task = {
        id: 'test-task',
        type: 'test_task',
        title: 'Test Task',
        description: 'Test',
        parameters: {},
        context,
        priority: 'medium',
        dependencies: [],
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await agent.executeWithRetry(task, context);
      expect(result.success).toBe(true);
    });
  });

  describe('Context Management', () => {
    it('should create context', async () => {
      const context = await orchestrator.createContext('test-site');
      expect(context).toBeDefined();
      expect(context.siteId).toBe('test-site');
      expect(context.id).toBeDefined();
    });

    it('should optimize context', async () => {
      const context = await orchestrator.createContext('test-site');
      const optimized = await orchestrator.optimizeContext(context);
      expect(optimized).toBeDefined();
    });
  });

  describe('Health Monitoring', () => {
    it('should check agent health', async () => {
      const agent = new MockAgent();
      await orchestrator.registerAgent(agent);

      const health = await orchestrator.checkAllAgentsHealth();
      expect(health.length).toBeGreaterThan(0);
    });

    it('should get health status for specific agent', async () => {
      const agent = new MockAgent();
      await orchestrator.registerAgent(agent);

      const health = await orchestrator.getHealthStatus('mock-agent');
      expect(health).toBeDefined();
      expect(health?.agentId).toBe('mock-agent');
    });
  });
});

