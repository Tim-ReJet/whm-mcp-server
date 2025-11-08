/**
 * MCP (Model Context Protocol) Server Infrastructure
 * Provides a standardized way for agents to interact with external tools and data sources
 */

import { logger } from '../../observability/src/logging/logger.js';

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
  execute: (params: any) => Promise<any>;
  category?: string;
  cost?: number; // Token cost estimate
}

export interface MCPServer {
  name: string;
  version: string;
  description: string;
  tools: Map<string, MCPTool>;
  capabilities: string[];
}

export interface MCPRequest {
  tool: string;
  params: Record<string, any>;
  requestId?: string;
}

export interface MCPResponse {
  success: boolean;
  result?: any;
  error?: string;
  cost?: number;
  requestId?: string;
}

/**
 * Base MCP Server class
 */
export class BaseMCPServer implements MCPServer {
  name: string;
  version: string;
  description: string;
  tools: Map<string, MCPTool>;
  capabilities: string[];

  constructor(name: string, version: string, description: string) {
    this.name = name;
    this.version = version;
    this.description = description;
    this.tools = new Map();
    this.capabilities = [];
  }

  /**
   * Register a tool
   */
  registerTool(tool: MCPTool): void {
    this.tools.set(tool.name, tool);
    logger.info('MCP tool registered', {
      server: this.name,
      tool: tool.name,
      category: tool.category,
    });
  }

  /**
   * Execute a tool
   */
  async executeTool(request: MCPRequest): Promise<MCPResponse> {
    const tool = this.tools.get(request.tool);
    if (!tool) {
      return {
        success: false,
        error: `Tool not found: ${request.tool}`,
        requestId: request.requestId,
      };
    }

    try {
      logger.info('MCP tool execution started', {
        server: this.name,
        tool: request.tool,
        requestId: request.requestId,
      });

      const startTime = Date.now();
      const result = await tool.execute(request.params);
      const duration = Date.now() - startTime;

      logger.info('MCP tool execution completed', {
        server: this.name,
        tool: request.tool,
        duration,
        requestId: request.requestId,
      });

      return {
        success: true,
        result,
        cost: tool.cost,
        requestId: request.requestId,
      };
    } catch (error: any) {
      logger.error('MCP tool execution failed', {
        server: this.name,
        tool: request.tool,
        error: error.message,
        requestId: request.requestId,
      });

      return {
        success: false,
        error: error.message,
        requestId: request.requestId,
      };
    }
  }

  /**
   * List all tools
   */
  listTools(): MCPTool[] {
    return Array.from(this.tools.values());
  }

  /**
   * Get tool by name
   */
  getTool(name: string): MCPTool | undefined {
    return this.tools.get(name);
  }
}

/**
 * MCP Server Registry
 * Manages all MCP servers
 */
export class MCPServerRegistry {
  private servers: Map<string, MCPServer> = new Map();

  /**
   * Register an MCP server
   */
  registerServer(server: MCPServer): void {
    this.servers.set(server.name, server);
    logger.info('MCP server registered', {
      name: server.name,
      version: server.version,
      tools: server.tools.size,
    });
  }

  /**
   * Get server by name
   */
  getServer(name: string): MCPServer | undefined {
    return this.servers.get(name);
  }

  /**
   * List all servers
   */
  listServers(): MCPServer[] {
    return Array.from(this.servers.values());
  }

  /**
   * Execute tool across all servers
   */
  async executeTool(serverName: string, request: MCPRequest): Promise<MCPResponse> {
    const server = this.getServer(serverName);
    if (!server) {
      return {
        success: false,
        error: `Server not found: ${serverName}`,
      };
    }

    if (server instanceof BaseMCPServer) {
      return server.executeTool(request);
    }

    return {
      success: false,
      error: 'Server does not support tool execution',
    };
  }

  /**
   * Discover all available tools
   */
  discoverTools(): Array<{ server: string; tool: MCPTool }> {
    const tools: Array<{ server: string; tool: MCPTool }> = [];

    for (const [serverName, server] of this.servers.entries()) {
      if (server instanceof BaseMCPServer) {
        for (const tool of server.listTools()) {
          tools.push({ server: serverName, tool });
        }
      }
    }

    return tools;
  }

  /**
   * Search tools by name or description
   */
  searchTools(query: string): Array<{ server: string; tool: MCPTool }> {
    const lowerQuery = query.toLowerCase();
    return this.discoverTools().filter(
      ({ tool }) =>
        tool.name.toLowerCase().includes(lowerQuery) ||
        tool.description.toLowerCase().includes(lowerQuery) ||
        tool.category?.toLowerCase().includes(lowerQuery)
    );
  }
}

// Global registry instance
export const mcpRegistry = new MCPServerRegistry();

export default BaseMCPServer;

