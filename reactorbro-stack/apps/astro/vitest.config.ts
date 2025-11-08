import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    // Test environment
    environment: "happy-dom",

    // Global test setup
    globals: true,

    // Test file patterns
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: ["node_modules", "dist", ".astro", "build"],

    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      exclude: [
        "node_modules/",
        "dist/",
        ".astro/",
        "**/*.config.*",
        "**/*.d.ts",
        "**/test/**",
        "**/*.test.*",
        "**/*.spec.*",
      ],
      all: true,
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
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
      "@": resolve(__dirname, "./src"),
      "@components": resolve(__dirname, "./src/components"),
      "@layouts": resolve(__dirname, "./src/layouts"),
      "@pages": resolve(__dirname, "./src/pages"),
    },
  },
});
