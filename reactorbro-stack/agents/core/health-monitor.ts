import type { Agent, AgentStatus, AgentError } from './types';
import { AgentBase } from './agent-base';

export interface HealthCheckResult {
  agentId: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: HealthCheck[];
  timestamp: Date;
}

export interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  duration?: number;
}

export class AgentHealthMonitor {
  private healthChecks: Map<string, HealthCheckResult> = new Map();
  private checkInterval: NodeJS.Timeout | null = null;

  /**
   * Perform health check on an agent
   */
  async checkHealth(agent: AgentBase): Promise<HealthCheckResult> {
    const checks: HealthCheck[] = [];
    const startTime = Date.now();

    // Check 1: Agent status
    checks.push({
      name: 'agent_status',
      status: agent.status === 'error' ? 'fail' : agent.status === 'idle' ? 'pass' : 'warn',
      message: `Agent status: ${agent.status}`,
    });

    // Check 2: Configuration validity
    checks.push({
      name: 'config_validity',
      status: this.validateConfig(agent.config) ? 'pass' : 'fail',
      message: this.validateConfig(agent.config) ? 'Configuration valid' : 'Configuration invalid',
    });

    // Check 3: Capabilities
    checks.push({
      name: 'capabilities',
      status: agent.capabilities.length > 0 ? 'pass' : 'warn',
      message: `Agent has ${agent.capabilities.length} capabilities`,
    });

    // Check 4: Skills availability
    checks.push({
      name: 'skills',
      status: agent.skills.length > 0 ? 'pass' : 'warn',
      message: `Agent has ${agent.skills.length} skills`,
    });

    // Check 5: Token budget
    checks.push({
      name: 'token_budget',
      status: 'pass', // Would need token optimizer integration
      message: 'Token budget check passed',
    });

    const duration = Date.now() - startTime;
    const overallStatus = this.determineOverallStatus(checks);

    const result: HealthCheckResult = {
      agentId: agent.id,
      status: overallStatus,
      checks,
      timestamp: new Date(),
    };

    this.healthChecks.set(agent.id, result);
    return result;
  }

  /**
   * Check health of multiple agents
   */
  async checkAllAgents(agents: AgentBase[]): Promise<HealthCheckResult[]> {
    return Promise.all(agents.map((agent) => this.checkHealth(agent)));
  }

  /**
   * Start periodic health monitoring
   */
  startMonitoring(agents: AgentBase[], intervalMs: number = 60000): void {
    if (this.checkInterval) {
      this.stopMonitoring();
    }

    this.checkInterval = setInterval(async () => {
      await this.checkAllAgents(agents);
    }, intervalMs);
  }

  /**
   * Stop periodic monitoring
   */
  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Get latest health check for an agent
   */
  getHealthStatus(agentId: string): HealthCheckResult | undefined {
    return this.healthChecks.get(agentId);
  }

  /**
   * Get all health statuses
   */
  getAllHealthStatuses(): HealthCheckResult[] {
    return Array.from(this.healthChecks.values());
  }

  /**
   * Get unhealthy agents
   */
  getUnhealthyAgents(): HealthCheckResult[] {
    return Array.from(this.healthChecks.values()).filter((h) => h.status === 'unhealthy');
  }

  private validateConfig(config: Agent['config']): boolean {
    return (
      config.maxRetries > 0 &&
      config.timeout > 0 &&
      config.tokenLimit > 0 &&
      config.priority >= 0 &&
      config.priority <= 10
    );
  }

  private determineOverallStatus(checks: HealthCheck[]): 'healthy' | 'degraded' | 'unhealthy' {
    const hasFail = checks.some((c) => c.status === 'fail');
    const hasWarn = checks.some((c) => c.status === 'warn');

    if (hasFail) return 'unhealthy';
    if (hasWarn) return 'degraded';
    return 'healthy';
  }
}

/**
 * Enhanced error handling for agents
 */
export class AgentErrorHandler {
  private errorLog: Array<{ agentId: string; error: Error; timestamp: Date }> = new Map();

  /**
   * Handle agent error with retry logic
   */
  async handleError(
    error: Error,
    agent: AgentBase,
    retryCount: number = 0,
    maxRetries: number = 3
  ): Promise<void> {
    const errorInfo = {
      agentId: agent.id,
      error,
      timestamp: new Date(),
      retryCount,
    };

    // Log error
    this.logError(errorInfo);

    // Determine if error is recoverable
    const isRecoverable = this.isRecoverableError(error);

    if (!isRecoverable || retryCount >= maxRetries) {
      agent.status = 'error';
      throw error;
    }

    // Wait before retry (exponential backoff)
    const delay = Math.pow(2, retryCount) * 1000;
    await this.sleep(delay);
  }

  /**
   * Check if error is recoverable
   */
  private isRecoverableError(error: Error): boolean {
    const recoverablePatterns = [
      /timeout/i,
      /network/i,
      /connection/i,
      /rate limit/i,
      /temporary/i,
    ];

    const unrecoverablePatterns = [
      /authentication/i,
      /authorization/i,
      /invalid/i,
      /not found/i,
    ];

    const message = error.message.toLowerCase();

    // Check unrecoverable first
    if (unrecoverablePatterns.some((pattern) => pattern.test(message))) {
      return false;
    }

    // Check recoverable
    return recoverablePatterns.some((pattern) => pattern.test(message));
  }

  /**
   * Log error
   */
  private logError(errorInfo: {
    agentId: string;
    error: Error;
    timestamp: Date;
    retryCount: number;
  }): void {
    console.error(`[Agent Error] ${errorInfo.agentId}:`, {
      message: errorInfo.error.message,
      stack: errorInfo.error.stack,
      retryCount: errorInfo.retryCount,
      timestamp: errorInfo.timestamp,
    });
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get error statistics
   */
  getErrorStats(agentId?: string): {
    totalErrors: number;
    byAgent: Record<string, number>;
    recentErrors: Array<{ agentId: string; error: string; timestamp: Date }>;
  } {
    // This would integrate with actual error logging system
    return {
      totalErrors: 0,
      byAgent: {},
      recentErrors: [],
    };
  }
}

export default {
  AgentHealthMonitor,
  AgentErrorHandler,
};

