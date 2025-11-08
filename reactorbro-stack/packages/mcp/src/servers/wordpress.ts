/**
 * WordPress MCP Server
 * Provides WordPress-related tools (WP-CLI integration, content management)
 */

import { BaseMCPServer, MCPTool } from '../server.js';
import { logger } from '../../../observability/src/logging/logger.js';
import { execSync } from 'child_process';

export class WordPressMCPServer extends BaseMCPServer {
  private wpCliPath: string;
  private sitePath?: string;

  constructor(wpCliPath: string = 'wp', sitePath?: string) {
    super('wordpress', '1.0.0', 'WordPress MCP server for WP-CLI integration and content management');

    this.wpCliPath = wpCliPath;
    this.sitePath = sitePath;
    this.capabilities = ['wp-cli', 'content-management', 'database', 'plugins', 'themes'];

    // Register WordPress tools
    this.registerTool({
      name: 'wp_cli_execute',
      description: 'Execute a WP-CLI command',
      category: 'wordpress',
      inputSchema: {
        type: 'object',
        properties: {
          command: { type: 'string', description: 'WP-CLI command (e.g., "post list")' },
          args: {
            type: 'object',
            description: 'Command arguments',
            additionalProperties: true,
          },
        },
        required: ['command'],
      },
      execute: async (params) => {
        return this.executeWPCLI(params.command, params.args);
      },
      cost: 50,
    });

    this.registerTool({
      name: 'create_post',
      description: 'Create a new WordPress post',
      category: 'wordpress',
      inputSchema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Post title' },
          content: { type: 'string', description: 'Post content' },
          status: {
            type: 'string',
            description: 'Post status',
            enum: ['draft', 'publish', 'pending', 'private'],
            default: 'draft',
          },
          postType: { type: 'string', description: 'Post type', default: 'post' },
        },
        required: ['title', 'content'],
      },
      execute: async (params) => {
        return this.createPost(params);
      },
      cost: 100,
    });

    this.registerTool({
      name: 'update_post',
      description: 'Update an existing WordPress post',
      category: 'wordpress',
      inputSchema: {
        type: 'object',
        properties: {
          postId: { type: 'number', description: 'Post ID' },
          title: { type: 'string', description: 'Post title' },
          content: { type: 'string', description: 'Post content' },
          status: { type: 'string', description: 'Post status' },
        },
        required: ['postId'],
      },
      execute: async (params) => {
        return this.updatePost(params);
      },
      cost: 100,
    });

    this.registerTool({
      name: 'get_post',
      description: 'Get a WordPress post by ID',
      category: 'wordpress',
      inputSchema: {
        type: 'object',
        properties: {
          postId: { type: 'number', description: 'Post ID' },
          fields: {
            type: 'array',
            description: 'Fields to return',
            items: { type: 'string' },
          },
        },
        required: ['postId'],
      },
      execute: async (params) => {
        return this.getPost(params.postId, params.fields);
      },
      cost: 50,
    });

    this.registerTool({
      name: 'list_posts',
      description: 'List WordPress posts',
      category: 'wordpress',
      inputSchema: {
        type: 'object',
        properties: {
          postType: { type: 'string', description: 'Post type', default: 'post' },
          status: { type: 'string', description: 'Post status' },
          limit: { type: 'number', description: 'Number of posts', default: 10 },
        },
      },
      execute: async (params) => {
        return this.listPosts(params);
      },
      cost: 50,
    });

    this.registerTool({
      name: 'install_plugin',
      description: 'Install a WordPress plugin',
      category: 'wordpress',
      inputSchema: {
        type: 'object',
        properties: {
          plugin: { type: 'string', description: 'Plugin slug or URL' },
          activate: { type: 'boolean', description: 'Activate after install', default: false },
        },
        required: ['plugin'],
      },
      execute: async (params) => {
        return this.installPlugin(params.plugin, params.activate);
      },
      cost: 200,
    });

    this.registerTool({
      name: 'get_site_info',
      description: 'Get WordPress site information',
      category: 'wordpress',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      execute: async () => {
        return this.getSiteInfo();
      },
      cost: 30,
    });
  }

  /**
   * Execute WP-CLI command
   */
  private async executeWPCLI(command: string, args?: Record<string, any>): Promise<any> {
    try {
      const cmd = this.buildWPCLICommand(command, args);
      logger.info('Executing WP-CLI command', { command: cmd });

      const output = execSync(cmd, {
        encoding: 'utf-8',
        cwd: this.sitePath,
      });

      return {
        success: true,
        output: output.trim(),
        command: cmd,
      };
    } catch (error: any) {
      logger.error('WP-CLI command failed', { command, error: error.message });
      return {
        success: false,
        error: error.message,
        command,
      };
    }
  }

  /**
   * Build WP-CLI command string
   */
  private buildWPCLICommand(command: string, args?: Record<string, any>): string {
    let cmd = `${this.wpCliPath} ${command}`;

    if (args) {
      for (const [key, value] of Object.entries(args)) {
        if (value === true) {
          cmd += ` --${key}`;
        } else if (value !== false && value !== null && value !== undefined) {
          cmd += ` --${key}="${value}"`;
        }
      }
    }

    if (this.sitePath) {
      cmd += ` --path="${this.sitePath}"`;
    }

    return cmd;
  }

  /**
   * Create a post
   */
  private async createPost(params: {
    title: string;
    content: string;
    status?: string;
    postType?: string;
  }): Promise<any> {
    return this.executeWPCLI(`post create`, {
      'post_title': params.title,
      'post_content': params.content,
      'post_status': params.status || 'draft',
      'post_type': params.postType || 'post',
      'porcelain': true,
    });
  }

  /**
   * Update a post
   */
  private async updatePost(params: {
    postId: number;
    title?: string;
    content?: string;
    status?: string;
  }): Promise<any> {
    const updateArgs: Record<string, any> = {};

    if (params.title) updateArgs['post_title'] = params.title;
    if (params.content) updateArgs['post_content'] = params.content;
    if (params.status) updateArgs['post_status'] = params.status;

    return this.executeWPCLI(`post update ${params.postId}`, updateArgs);
  }

  /**
   * Get a post
   */
  private async getPost(postId: number, fields?: string[]): Promise<any> {
    const args: Record<string, any> = {
      format: 'json',
    };

    if (fields && fields.length > 0) {
      args.fields = fields.join(',');
    }

    return this.executeWPCLI(`post get ${postId}`, args);
  }

  /**
   * List posts
   */
  private async listPosts(params: {
    postType?: string;
    status?: string;
    limit?: number;
  }): Promise<any> {
    const args: Record<string, any> = {
      format: 'json',
      'posts_per_page': params.limit || 10,
    };

    if (params.postType) args['post_type'] = params.postType;
    if (params.status) args['post_status'] = params.status;

    return this.executeWPCLI('post list', args);
  }

  /**
   * Install a plugin
   */
  private async installPlugin(plugin: string, activate: boolean = false): Promise<any> {
    const result = await this.executeWPCLI(`plugin install ${plugin}`, {
      activate: activate,
    });

    return {
      ...result,
      plugin,
      activated: activate,
    };
  }

  /**
   * Get site info
   */
  private async getSiteInfo(): Promise<any> {
    const info = await this.executeWPCLI('core version');
    const url = await this.executeWPCLI('option get siteurl');
    const name = await this.executeWPCLI('option get blogname');

    return {
      version: info.output,
      url: url.output,
      name: name.output,
    };
  }
}

export default WordPressMCPServer;

