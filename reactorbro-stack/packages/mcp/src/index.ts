/**
 * MCP Package Index
 * Main entry point for MCP package
 */

export * from './server.js';
export * from './servers/design-tools.js';
export * from './servers/wordpress.js';
export * from './servers/filesystem.js';
export * from './agent-integration.js';

import { MCPServerRegistry } from './server.js';
import { DesignToolsMCPServer } from './servers/design-tools.js';
import { WordPressMCPServer } from './servers/wordpress.js';
import { FileSystemMCPServer } from './servers/filesystem.js';
import { AgentMCPIntegration } from './agent-integration.js';
import { logger } from '../observability/src/logging/logger.js';

/**
 * Initialize default MCP servers
 */
export function initializeMCPServers(basePath?: string, wpCliPath?: string, wpSitePath?: string): {
  registry: MCPServerRegistry;
  integration: AgentMCPIntegration;
} {
  const registry = new MCPServerRegistry();

  // Register design tools server
  const designServer = new DesignToolsMCPServer();
  registry.registerServer(designServer);

  // Register WordPress server
  const wpServer = new WordPressMCPServer(wpCliPath, wpSitePath);
  registry.registerServer(wpServer);

  // Register file system server
  const fsServer = new FileSystemMCPServer(basePath);
  registry.registerServer(fsServer);

  // Create agent integration
  const integration = new AgentMCPIntegration(registry);

  logger.info('MCP servers initialized', {
    servers: registry.listServers().map(s => s.name),
    totalTools: registry.discoverTools().length,
  });

  return { registry, integration };
}

export default {
  initializeMCPServers,
};

