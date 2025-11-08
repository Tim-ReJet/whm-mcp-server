/**
 * Test Utilities and Helpers
 * Shared utilities for testing across the project
 */

import { afterEach, beforeEach, vi } from 'vitest';
import { existsSync, mkdirSync, rmSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

/**
 * Create a temporary directory for tests
 */
export function createTempDir(prefix = 'test-'): string {
  const tempDir = join(tmpdir(), `${prefix}${Date.now()}-${Math.random().toString(36).substring(7)}`);
  mkdirSync(tempDir, { recursive: true });
  return tempDir;
}

/**
 * Clean up temporary directory
 */
export function cleanupTempDir(dir: string): void {
  if (existsSync(dir)) {
    rmSync(dir, { recursive: true, force: true });
  }
}

/**
 * Create a test file
 */
export function createTestFile(dir: string, filename: string, content: string): string {
  const filePath = join(dir, filename);
  writeFileSync(filePath, content, 'utf-8');
  return filePath;
}

/**
 * Read a test file
 */
export function readTestFile(filePath: string): string {
  return readFileSync(filePath, 'utf-8');
}

/**
 * Mock console methods
 */
export function mockConsole() {
  const originalConsole = { ...console };

  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  return originalConsole;
}

/**
 * Wait for a condition to be true
 */
export async function waitFor(
  condition: () => boolean,
  timeout = 5000,
  interval = 100
): Promise<void> {
  const startTime = Date.now();

  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error(`Condition not met within ${timeout}ms`);
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
}

/**
 * Mock file system operations
 */
export function mockFileSystem() {
  const files = new Map<string, string>();
  const dirs = new Set<string>();

  return {
    files,
    dirs,
    existsSync: (path: string) => files.has(path) || dirs.has(path),
    readFileSync: (path: string) => {
      if (!files.has(path)) {
        throw new Error(`File not found: ${path}`);
      }
      return files.get(path)!;
    },
    writeFileSync: (path: string, content: string) => {
      files.set(path, content);
    },
    mkdirSync: (path: string) => {
      dirs.add(path);
    },
    rmSync: (path: string) => {
      files.delete(path);
      dirs.delete(path);
    },
  };
}

/**
 * Create a mock site config
 */
export function createMockSiteConfig(overrides: Record<string, any> = {}): any {
  return {
    name: 'Test Site',
    id: 'test-site',
    description: 'Test site description',
    domain: {
      production: 'https://test.example.com',
    },
    wordpress: {
      url: 'https://test.wp.example.com',
      restApi: '/wp-json/wp/v2',
    },
    astro: {
      port: 4322,
      output: 'static',
      adapter: 'cloudflare',
    },
    ...overrides,
  };
}

/**
 * Assert that a file exists
 */
export function assertFileExists(filePath: string): void {
  if (!existsSync(filePath)) {
    throw new Error(`Expected file to exist: ${filePath}`);
  }
}

/**
 * Assert that a file contains content
 */
export function assertFileContains(filePath: string, content: string): void {
  if (!existsSync(filePath)) {
    throw new Error(`File does not exist: ${filePath}`);
  }
  const fileContent = readFileSync(filePath, 'utf-8');
  if (!fileContent.includes(content)) {
    throw new Error(`File does not contain expected content: ${content}`);
  }
}

/**
 * Create a test environment
 */
export function createTestEnv() {
  const tempDir = createTempDir();

  return {
    tempDir,
    cleanup: () => cleanupTempDir(tempDir),
    createFile: (filename: string, content: string) => createTestFile(tempDir, filename, content),
    readFile: (filename: string) => readTestFile(join(tempDir, filename)),
    filePath: (filename: string) => join(tempDir, filename),
  };
}

/**
 * Mock process.env
 */
export function mockEnv(env: Record<string, string>) {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    Object.assign(process.env, env);
  });

  afterEach(() => {
    process.env = originalEnv;
  });
}

/**
 * Assert async function throws
 */
export async function assertThrows(
  fn: () => Promise<any>,
  errorMessage?: string
): Promise<void> {
  try {
    await fn();
    throw new Error('Expected function to throw');
  } catch (error: any) {
    if (errorMessage && !error.message.includes(errorMessage)) {
      throw new Error(`Expected error message to include "${errorMessage}", got "${error.message}"`);
    }
  }
}

export default {
  createTempDir,
  cleanupTempDir,
  createTestFile,
  readTestFile,
  mockConsole,
  waitFor,
  mockFileSystem,
  createMockSiteConfig,
  assertFileExists,
  assertFileContains,
  createTestEnv,
  mockEnv,
  assertThrows,
};

