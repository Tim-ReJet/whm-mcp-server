#!/usr/bin/env ts-node

/**
 * Enhanced Error Handler
 * Provides better error messages with suggestions
 */

import chalk from 'chalk';

export interface ErrorSuggestion {
  message: string;
  command?: string;
  link?: string;
}

const ERROR_SUGGESTIONS: Record<string, ErrorSuggestion[]> = {
  'Site config not found': [
    {
      message: 'The site configuration file is missing.',
      command: 'pnpm site:list',
    },
    {
      message: 'Create a new site:',
      command: 'pnpm site:create <site-id>',
    },
    {
      message: 'Or use interactive CLI:',
      command: 'pnpm cli',
    },
  ],
  'No site specified': [
    {
      message: 'No active site is set.',
      command: 'pnpm site:use <site-id>',
    },
    {
      message: 'Or specify a site:',
      command: 'pnpm site:dev <site-id>',
    },
    {
      message: 'List available sites:',
      command: 'pnpm site:list',
    },
  ],
  'Site already exists': [
    {
      message: 'A site with this ID already exists.',
      command: 'pnpm site:list',
    },
    {
      message: 'Use a different site ID or delete the existing one.',
    },
    {
      message: 'Check site info:',
      command: 'pnpm site:info <site-id>',
    },
  ],
  'Asset not found': [
    {
      message: 'The asset could not be found.',
      command: 'pnpm asset:search <query>',
    },
    {
      message: 'Browse available assets:',
      command: 'pnpm asset:browse',
    },
    {
      message: 'Or use interactive CLI:',
      command: 'pnpm cli',
    },
  ],
  'Build failed': [
    {
      message: 'Check the build logs for details.',
      command: 'pnpm site:build <site-id>',
    },
    {
      message: 'View build metrics:',
      command: 'pnpm build:metrics',
    },
    {
      message: 'Check for errors:',
      command: 'pnpm build:analyze',
    },
  ],
  'Workflow not found': [
    {
      message: 'The workflow could not be found.',
      command: 'GET /api/workflows',
    },
    {
      message: 'Start workflow API server:',
      command: 'pnpm workflow:api',
    },
    {
      message: 'Use workflow editor:',
      link: 'http://localhost:4322/workflow-editor',
    },
  ],
  'Agent not found': [
    {
      message: 'The agent is not registered.',
      command: 'pnpm agent:list',
    },
    {
      message: 'Check agent status:',
      command: 'pnpm agent:status',
    },
  ],
  'Execution not found': [
    {
      message: 'The execution ID is invalid or expired.',
      command: 'Check execution ID spelling',
    },
    {
      message: 'View execution history in debugger:',
      link: 'http://localhost:4322/workflow-debugger',
    },
  ],
  'Port already in use': [
    {
      message: 'The port is already in use.',
      command: 'lsof -i :<port>',
    },
    {
      message: 'Kill the process or use a different port.',
    },
    {
      message: 'Edit site config to change port:',
      command: 'Edit sites/<site-id>/site.config.json',
    },
  ],
};

export function enhanceError(error: Error): string {
  const errorMessage = error.message;
  let suggestions: ErrorSuggestion[] = [];

  // Find matching suggestions
  for (const [pattern, suggs] of Object.entries(ERROR_SUGGESTIONS)) {
    if (errorMessage.includes(pattern)) {
      suggestions = suggs;
      break;
    }
  }

  let output = chalk.red(`\n❌ Error: ${errorMessage}\n`);

  if (suggestions.length > 0) {
    output += chalk.yellow('\n💡 Suggestions:\n');
    for (const suggestion of suggestions) {
      output += `   • ${suggestion.message}\n`;
      if (suggestion.command) {
        output += chalk.cyan(`     ${suggestion.command}\n`);
      }
      if (suggestion.link) {
        output += chalk.blue(`     ${suggestion.link}\n`);
      }
    }
    output += '\n';
  } else {
    // Generic suggestions
    output += chalk.yellow('\n💡 Try:\n');
    output += chalk.cyan('   • Check the documentation: docs/\n');
    output += chalk.cyan('   • Use interactive CLI: pnpm cli\n');
    output += chalk.cyan('   • Get help: pnpm site --help\n\n');
  }

  return output;
}

export function printError(error: Error): void {
  console.error(enhanceError(error));
}

export default { enhanceError, printError };

