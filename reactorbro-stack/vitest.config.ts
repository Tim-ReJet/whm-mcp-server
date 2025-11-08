import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    // Test environment
    environment: 'node',

    // Global test setup
    globals: true,

    // Test file patterns
    include: [
      'tests/unit/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'tests/integration/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'packages/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
    exclude: [
      'node_modules',
      'dist',
      '.astro',
      'build',
      'apps/wp',
    ],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        '.astro/',
        '**/*.config.*',
        '**/*.d.ts',
        'tests/',
        '**/*.test.*',
        '**/*.spec.*',
      ],
      all: true,
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },

    // Test timeouts
    testTimeout: 10000,
    hookTimeout: 10000,

    // Watch options
    watch: false,

    // Mock settings
    mockReset: true,
    restoreMocks: true,
    clearMocks: true,
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
      '@packages': resolve(__dirname, './packages'),
      '@tests': resolve(__dirname, './tests'),
    },
  },
});

