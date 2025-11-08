/**
 * Agent MCP Integration
 * Allows agents to use MCP tools
 */

import { MCPServerRegistry, MCPRequest, MCPResponse } from '../server.js';
import { logger } from '../../observability/src/logging/logger.js';
import { agentMetrics } from '../../observability/src/metrics/metrics.js';

export interface AgentMCPUsage {
  agentId: string;
  tool: string;
  server: string;
  timestamp: Date;
  success: boolean;
  cost?: number;
  duration?: number;
}

export class AgentMCPIntegration {
  private registry: MCPServerRegistry;
  private usageHistory: AgentMCPUsage[] = [];
  private maxHistorySize: number = 1000;

  constructor(registry: MCPServerRegistry) {
    this.registry = registry;
  }

  /**
   * Execute MCP tool for an agent
   */
  async executeToolForAgent(
    agentId: string,
    serverName: string,
    request: MCPRequest
  ): Promise<MCPResponse> {
    const startTime = Date.now();

    logger.info('Agent MCP tool execution', {
      agentId,
      server: serverName,
      tool: request.tool,
    });

    try {
      const response = await this.registry.executeTool(serverName, request);
      const duration = Date.now() - startTime;

      // Track usage
      this.trackUsage({
        agentId,
        tool: request.tool,
        server: serverName,
        timestamp: new Date(),
        success: response.success,
        cost: response.cost,
        duration,
      });

      // Record metrics (using basic counters if MCP-specific metrics don't exist)
      if (response.success) {
        try {
          agentMetrics.workflowSuccess.inc();
        } catch {
          // Metrics may not have MCP-specific counters yet
        }
      } else {
        try {
          agentMetrics.workflowFailure.inc();
        } catch {
          // Metrics may not have MCP-specific counters yet
        }
      }

      return response;
    } catch (error: any) {
      const duration = Date.now() - startTime;

      this.trackUsage({
        agentId,
        tool: request.tool,
        server: serverName,
        timestamp: new Date(),
        success: false,
        duration,
      });

      logger.error('Agent MCP tool execution failed', {
        agentId,
        server: serverName,
        tool: request.tool,
        error: error.message,
      });

      return {
        success: false,
        error: error.message,
        requestId: request.requestId,
      };
    }
  }

  /**
   * Discover available tools for an agent
   */
  discoverToolsForAgent(agentId: string, category?: string): Array<{ server: string; tool: any }> {
    const allTools = this.registry.discoverTools();

    if (category) {
      return allTools.filter(({ tool }) => tool.category === category);
    }

    return allTools;
  }

  /**
   * Search tools for an agent
   */
  searchToolsForAgent(agentId: string, query: string): Array<{ server: string; tool: any }> {
    return this.registry.searchTools(query);
  }

  /**
   * Get tool usage statistics for an agent
   */
  getAgentUsageStats(agentId: string): {
    totalUsage: number;
    successRate: number;
    totalCost: number;
    averageDuration: number;
    toolsUsed: Record<string, number>;
  } {
    const agentUsage = this.usageHistory.filter(u => u.agentId === agentId);

    const totalUsage = agentUsage.length;
    const successful = agentUsage.filter(u => u.success).length;
    const successRate = totalUsage > 0 ? successful / totalUsage : 0;
    const totalCost = agentUsage.reduce((sum, u) => sum + (u.cost || 0), 0);
    const averageDuration =
      agentUsage.length > 0
        ? agentUsage.reduce((sum, u) => sum + (u.duration || 0), 0) / agentUsage.length
        : 0;

    const toolsUsed: Record<string, number> = {};
    for (const usage of agentUsage) {
      toolsUsed[usage.tool] = (toolsUsed[usage.tool] || 0) + 1;
    }

    return {
      totalUsage,
      successRate,
      totalCost,
      averageDuration,
      toolsUsed,
    };
  }

  /**
   * Track tool usage
   */
  private trackUsage(usage: AgentMCPUsage): void {
    this.usageHistory.push(usage);

    // Limit history size
    if (this.usageHistory.length > this.maxHistorySize) {
      this.usageHistory = this.usageHistory.slice(-this.maxHistorySize);
    }
  }

  /**
   * Get usage history
   */
  getUsageHistory(agentId?: string, limit?: number): AgentMCPUsage[] {
    let history = agentId
      ? this.usageHistory.filter(u => u.agentId === agentId)
      : this.usageHistory;

    if (limit) {
      history = history.slice(-limit);
    }

    return history.reverse(); // Most recent first
  }
}

export default AgentMCPIntegration;

