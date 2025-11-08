import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import cloudflare from "@astrojs/cloudflare";

// Conditionally load visualizer plugin for bundle analysis
const plugins = [];
if (process.env.ANALYZE === "true") {
  // Dynamic import for bundle analyzer
  const { visualizer } = await import("rollup-plugin-visualizer");
  plugins.push(
    visualizer({
      open: true,
      filename: "./dist/stats.html",
      gzipSize: true,
      brotliSize: true,
      template: "treemap",
    })
  );
}

// https://astro.build/config
export default defineConfig({
  // Site URL for sitemap and canonical URLs
  site: process.env.SITE_URL || "https://your-domain.com",

  // Output mode
  output: "static", // Use static for SSR + static pages (hybrid is now merged into static)

  // Cloudflare adapter for deployment
  adapter: cloudflare({
    mode: "directory",
    routes: {
      strategy: "auto",
    },
    imageService: "cloudflare",
  }),

  // Integrations
  integrations: [
    tailwind({
      applyBaseStyles: true,
    }),
    sitemap({
      changefreq: "weekly",
      priority: 0.7,
      lastmod: new Date(),
      filter: (page) => !page.includes("/admin"),
    }),
  ],

  // Build configuration
  build: {
    // Inline small stylesheets for better performance
    inlineStylesheets: "auto",
    // Asset prefix for CDN (optional)
    // assetsPrefix: process.env.ASSETS_PREFIX,
  },

  // Image optimization
  image: {
    domains: ["reactorjet.ddev.site", "your-production-domain.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.wp.com",
      },
    ],
  },

  // Vite configuration for build optimization
  vite: {
    build: {
      cssCodeSplit: true,
      // Performance budgets
      chunkSizeWarningLimit: 500, // Warn if chunk exceeds 500KB
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Split vendor chunks for better caching
            if (id.includes("node_modules")) {
              // Motion One (small, keep together)
              if (id.includes("@motionone")) {
                return "vendor-motion";
              }
              // GSAP (large, separate chunk)
              if (id.includes("gsap")) {
                return "vendor-gsap";
              }
              // Other vendor code
              if (id.includes("react") || id.includes("react-dom")) {
                return "vendor-react";
              }
              // Default vendor chunk
              return "vendor";
            }
          },
        },
        plugins,
      },
    },
    ssr: {
      noExternal: ["@repo/ui", "@repo/tokens"],
    },
    optimizeDeps: {
      exclude: ["@repo/ui", "@repo/tokens"],
    },
  },

  // Server configuration
  server: {
    port: 4321,
    host: true,
  },

  // Security and performance headers
  security: {
    checkOrigin: true,
  },

  // Markdown configuration
  markdown: {
    syntaxHighlight: "shiki",
    shikiConfig: {
      theme: "github-dark",
      wrap: true,
    },
  },

  // Prefetch configuration
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "hover",
  },

  // Redirects (add your redirects here)
  redirects: {
    "/old-url": "/new-url",
  },
});
