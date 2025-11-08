/**
 * Vitest Test Setup
 * Global configuration and utilities for all tests
 */

import { expect, vi } from "vitest";

// ============================================
// Global Test Setup
// ============================================

// Mock console methods in tests to reduce noise
global.console = {
  ...console,
  // Uncomment to suppress console methods during tests
  // log: vi.fn(),
  // debug: vi.fn(),
  // info: vi.fn(),
  // warn: vi.fn(),
  error: console.error, // Keep errors visible
};

// ============================================
// Test Utilities
// ============================================

/**
 * Wait for a specified amount of time
 * Useful for testing async behavior
 */
export const wait = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Wait for a condition to be true
 * Polls until condition is met or timeout
 */
export const waitFor = async (
  condition: () => boolean,
  timeout = 5000,
  interval = 100,
): Promise<void> => {
  const startTime = Date.now();
  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error(`Timeout waiting for condition after ${timeout}ms`);
    }
    await wait(interval);
  }
};

/**
 * Create a mock WordPress GraphQL response
 */
export const createMockWPResponse = <T>(data: T) => {
  return {
    data,
    extensions: {},
  };
};

/**
 * Create a mock WordPress post
 */
export const createMockPost = (overrides = {}) => {
  return {
    id: "1",
    title: "Test Post",
    content: "<p>Test content</p>",
    excerpt: "Test excerpt",
    date: "2024-01-01T00:00:00",
    slug: "test-post",
    status: "publish",
    author: {
      name: "Test Author",
      avatar: { url: "https://example.com/avatar.jpg" },
    },
    featuredImage: {
      node: {
        sourceUrl: "https://example.com/image.jpg",
        altText: "Test image",
      },
    },
    categories: {
      nodes: [{ name: "Test Category", slug: "test-category" }],
    },
    acf: {},
    ...overrides,
  };
};

/**
 * Create a mock WordPress page
 */
export const createMockPage = (overrides = {}) => {
  return {
    id: "1",
    title: "Test Page",
    content: "<p>Test content</p>",
    date: "2024-01-01T00:00:00",
    slug: "test-page",
    ...overrides,
  };
};

/**
 * Create mock ACF fields
 */
export const createMockACF = (fields: Record<string, any> = {}) => {
  return {
    fieldGroupName: "testFields",
    ...fields,
  };
};

// ============================================
// Fetch Mocking Utilities
// ============================================

/**
 * Mock fetch globally
 */
export const mockFetch = (
  response: any,
  options: { status?: number; ok?: boolean } = {},
) => {
  const { status = 200, ok = true } = options;

  global.fetch = vi.fn().mockResolvedValue({
    ok,
    status,
    json: async () => response,
    text: async () => JSON.stringify(response),
    headers: new Headers(),
    statusText: ok ? "OK" : "Error",
  } as Response);

  return global.fetch;
};

/**
 * Mock GraphQL fetch
 */
export const mockGraphQLFetch = (data: any, errors: any[] = []) => {
  return mockFetch({
    data,
    errors: errors.length > 0 ? errors : undefined,
  });
};

/**
 * Reset fetch mock
 */
export const resetFetchMock = () => {
  if (vi.isMockFunction(global.fetch)) {
    (global.fetch as any).mockReset();
  }
};

// ============================================
// localStorage Mock
// ============================================

export const createLocalStorageMock = () => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };
};

// ============================================
// Custom Matchers
// ============================================

// Extend Vitest matchers if needed
// Example:
// expect.extend({
//   toBeValidGraphQLResponse(received) {
//     const pass = received && typeof received.data !== 'undefined';
//     return {
//       pass,
//       message: () => `Expected ${received} to be a valid GraphQL response`,
//     };
//   },
// });

// ============================================
// Test Fixtures
// ============================================

/**
 * Common test data fixtures
 */
export const fixtures = {
  posts: {
    published: createMockPost({ status: "publish" }),
    draft: createMockPost({ status: "draft" }),
    withACF: createMockPost({
      acf: createMockACF({ customField: "value" }),
    }),
  },
  pages: {
    home: createMockPage({ slug: "home", title: "Home" }),
    about: createMockPage({ slug: "about", title: "About" }),
  },
  graphqlError: {
    message: "GraphQL Error",
    locations: [{ line: 1, column: 1 }],
    path: ["field"],
  },
} as const;

// ============================================
// Environment Helpers
// ============================================

/**
 * Set environment variables for tests
 */
export const setEnv = (vars: Record<string, string>) => {
  Object.entries(vars).forEach(([key, value]) => {
    process.env[key] = value;
  });
};

/**
 * Clear environment variables
 */
export const clearEnv = (keys: string[]) => {
  keys.forEach((key) => {
    delete process.env[key];
  });
};

/**
 * Mock import.meta.env for Astro
 */
export const mockAstroEnv = (env: Record<string, any>) => {
  return {
    ...env,
    SSR: false,
    DEV: true,
    PROD: false,
    MODE: "test",
    BASE_URL: "/",
    SITE: "http://localhost:4321",
    ASSETS_PREFIX: undefined,
  };
};

// ============================================
// Snapshot Helpers
// ============================================

/**
 * Serialize HTML for snapshots (remove whitespace variations)
 */
export const normalizeHTML = (html: string): string => {
  return html
    .replace(/\s+/g, " ") // Normalize whitespace
    .replace(/>\s+</g, "><") // Remove space between tags
    .trim();
};

/**
 * Clean object for snapshot (remove dynamic values)
 */
export const cleanSnapshot = (obj: any): any => {
  if (typeof obj !== "object" || obj === null) return obj;

  const cleaned = Array.isArray(obj) ? [] : {};

  for (const key in obj) {
    const value = obj[key];

    // Skip common dynamic fields
    if (["id", "date", "timestamp", "createdAt", "updatedAt"].includes(key)) {
      (cleaned as any)[key] = "[DYNAMIC]";
    } else if (typeof value === "object") {
      (cleaned as any)[key] = cleanSnapshot(value);
    } else {
      (cleaned as any)[key] = value;
    }
  }

  return cleaned;
};

// ============================================
// Export all utilities
// ============================================

export default {
  wait,
  waitFor,
  createMockWPResponse,
  createMockPost,
  createMockPage,
  createMockACF,
  mockFetch,
  mockGraphQLFetch,
  resetFetchMock,
  createLocalStorageMock,
  fixtures,
  setEnv,
  clearEnv,
  mockAstroEnv,
  normalizeHTML,
  cleanSnapshot,
};
