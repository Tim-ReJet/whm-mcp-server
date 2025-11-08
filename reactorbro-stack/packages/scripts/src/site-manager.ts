#!/usr/bin/env ts-node
import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { logger } from "../../observability/src/logging/logger.js";
import { siteMetrics } from "../../observability/src/metrics/metrics.js";

interface SiteConfig {
  name: string;
  id: string;
  description?: string;
  domain: {
    production: string;
    staging?: string;
    preview?: string;
  };
  wordpress: {
    url: string;
    restApi?: string;
    graphql?: string;
    local?: {
      enabled: boolean;
      url: string;
      adminUser?: string;
      adminPassword?: string;
    };
  };
  astro: {
    port: number;
    output: "static" | "server" | "hybrid";
    adapter: string;
    srcDir?: string;
  };
  deployment?: {
    platform?: string;
    projectId?: string;
    branch?: {
      production?: string;
      preview?: string;
    };
    buildCommand?: string;
    outputDir?: string;
  };
  seo?: {
    title?: string;
    description?: string;
    locale?: string;
    twitter?: string;
  };
  features?: {
    blog?: boolean;
    ecommerce?: boolean;
    multilingual?: boolean;
    search?: boolean;
    comments?: boolean;
  };
  contact?: {
    email?: string;
    phone?: string;
    address?: string;
    socialMedia?: Record<string, string>;
  };
  analytics?: {
    googleAnalytics?: string;
    googleTagManager?: string;
    plausible?: string;
    fathom?: string;
  };
  theme?: {
    primaryColor?: string;
    fontFamily?: string;
    logo?: string;
  };
  env?: Record<string, string>;
  status?: "active" | "development" | "staging" | "archived";
  createdAt?: string;
  updatedAt?: string;
}

const ROOT_DIR = resolve(__dirname, "../../..");
const SITES_DIR = join(ROOT_DIR, "sites");
const ASTRO_DIR = join(ROOT_DIR, "apps/astro");
const ACTIVE_SITE_FILE = join(ROOT_DIR, ".active-site");

class SiteManager {
  public getSiteConfigPath(siteId: string): string {
    return join(SITES_DIR, siteId, "site.config.json");
  }

  public loadSiteConfig(siteId: string): SiteConfig {
    const configPath = this.getSiteConfigPath(siteId);

    if (!existsSync(configPath)) {
      logger.error('Site config not found', { siteId, configPath });
      throw new Error(`Site config not found: ${configPath}`);
    }

    try {
      const content = readFileSync(configPath, "utf-8");
      const config = JSON.parse(content);
      logger.debug('Site config loaded', { siteId });
      return config;
    } catch (error) {
      logger.error('Failed to parse site config', { siteId, configPath }, error as Error);
      throw new Error(`Failed to parse site config: ${configPath}`);
    }
  }

  private saveSiteConfig(siteId: string, config: SiteConfig): void {
    const configPath = this.getSiteConfigPath(siteId);
    config.updatedAt = new Date().toISOString();
    writeFileSync(configPath, JSON.stringify(config, null, 2));
  }

  public listSites(): string[] {
    if (!existsSync(SITES_DIR)) {
      return [];
    }

    return readdirSync(SITES_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith("_"))
      .map(dirent => dirent.name);
  }

  public getActiveSite(): string | null {
    if (!existsSync(ACTIVE_SITE_FILE)) {
      return null;
    }
    return readFileSync(ACTIVE_SITE_FILE, "utf-8").trim();
  }

  private setActiveSite(siteId: string): void {
    writeFileSync(ACTIVE_SITE_FILE, siteId);
  }

  private generateEnvFile(siteId: string): void {
    const config = this.loadSiteConfig(siteId);
    const envPath = join(ASTRO_DIR, `.env.${siteId}`);

    const envVars = {
      SITE_ID: siteId,
      SITE_NAME: config.name,
      SITE_URL: config.domain.production,
      WP_URL: config.wordpress.url,
      WP_REST_API: config.wordpress.restApi || `${config.wordpress.url}/wp-json/wp/v2`,
      WP_GRAPHQL: config.wordpress.graphql || `${config.wordpress.url}/graphql`,
      ASTRO_PORT: config.astro.port.toString(),
      ...config.env,
    };

    const envContent = Object.entries(envVars)
      .map(([key, value]) => `${key}="${value}"`)
      .join("\n");

    writeFileSync(envPath, envContent);
    console.log(`✅ Generated ${envPath}`);
  }

  private generateAstroConfig(siteId: string): void {
    const config = this.loadSiteConfig(siteId);
    const configPath = join(ASTRO_DIR, `astro.config.${siteId}.mjs`);

    const astroConfig = `import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import ${config.astro.adapter} from "@astrojs/${config.astro.adapter}";

// Site: ${config.name}
// Generated from: sites/${siteId}/site.config.json

export default defineConfig({
  site: "${config.domain.production}",
  output: "${config.astro.output}",

  adapter: ${config.astro.adapter}({
    mode: "directory",
    ${config.astro.adapter === "cloudflare" ? `routes: { strategy: "auto" },
    imageService: "cloudflare",` : ""}
  }),

  integrations: [
    tailwind({
      applyBaseStyles: true,
    }),
    sitemap({
      changefreq: "weekly",
      priority: 0.7,
      lastmod: new Date(),
    }),
  ],

  build: {
    inlineStylesheets: "auto",
  },

  image: {
    domains: ["${new URL(config.wordpress.url).hostname}"],
  },

  vite: {
    build: {
      cssCodeSplit: true,
    },
    ssr: {
      noExternal: ["@repo/ui", "@repo/tokens"],
    },
  },

  server: {
    port: ${config.astro.port},
    host: true,
  },

  prefetch: {
    prefetchAll: true,
    defaultStrategy: "hover",
  },
});
`;

    writeFileSync(configPath, astroConfig);
    console.log(`✅ Generated ${configPath}`);
  }

  public list(): void {
    const sites = this.listSites();
    const activeSite = this.getActiveSite();

    console.log("\n📋 Available Sites:\n");

    if (sites.length === 0) {
      console.log("  No sites found. Create one with: pnpm site:create <site-id>");
      return;
    }

    for (const siteId of sites) {
      try {
        const config = this.loadSiteConfig(siteId);
        const isActive = siteId === activeSite;
        const statusIcon = isActive ? "✓" : " ";
        const statusColor = config.status === "active" ? "🟢" : config.status === "development" ? "🟡" : "⚪";

        console.log(`  [${statusIcon}] ${statusColor} ${config.name} (${siteId})`);
        console.log(`      ${config.description || "No description"}`);
        console.log(`      ${config.domain.production}`);
        console.log(`      Status: ${config.status || "development"}`);
        console.log("");
      } catch (error) {
        console.log(`  ❌ ${siteId} (invalid config)`);
      }
    }

    if (activeSite) {
      console.log(`\n🎯 Active site: ${activeSite}\n`);
    } else {
      console.log("\n⚠️  No active site set. Use: pnpm site:use <site-id>\n");
    }
  }

  public info(siteId?: string): void {
    const targetSite = siteId || this.getActiveSite();

    if (!targetSite) {
      console.error("❌ No site specified and no active site set");
      process.exit(1);
    }

    try {
      const config = this.loadSiteConfig(targetSite);

      console.log("\n" + "=".repeat(60));
      console.log(`  ${config.name} (${config.id})`);
      console.log("=".repeat(60));
      console.log(`\n📝 Description: ${config.description || "N/A"}`);
      console.log(`\n🌐 Domains:`);
      console.log(`   Production:  ${config.domain.production}`);
      if (config.domain.staging) console.log(`   Staging:     ${config.domain.staging}`);
      if (config.domain.preview) console.log(`   Preview:     ${config.domain.preview}`);

      console.log(`\n🔧 WordPress:`);
      console.log(`   URL:         ${config.wordpress.url}`);
      console.log(`   REST API:    ${config.wordpress.restApi || config.wordpress.url + "/wp-json/wp/v2"}`);
      if (config.wordpress.local?.enabled) {
        console.log(`   Local:       ${config.wordpress.local.url}`);
      }

      console.log(`\n🚀 Astro:`);
      console.log(`   Port:        ${config.astro.port}`);
      console.log(`   Output:      ${config.astro.output}`);
      console.log(`   Adapter:     ${config.astro.adapter}`);

      if (config.deployment) {
        console.log(`\n📦 Deployment:`);
        console.log(`   Platform:    ${config.deployment.platform || "N/A"}`);
        console.log(`   Project ID:  ${config.deployment.projectId || "N/A"}`);
      }

      console.log(`\n📊 Status:       ${config.status || "development"}`);
      console.log(`📅 Created:      ${config.createdAt || "N/A"}`);
      console.log(`📅 Updated:      ${config.updatedAt || "N/A"}`);
      console.log("");
    } catch (error) {
      console.error(`❌ Failed to load site info: ${error}`);
      process.exit(1);
    }
  }

  public use(siteId: string): void {
    if (!existsSync(this.getSiteConfigPath(siteId))) {
      console.error(`❌ Site not found: ${siteId}`);
      process.exit(1);
    }

    this.setActiveSite(siteId);
    this.generateEnvFile(siteId);
    this.generateAstroConfig(siteId);

    // Create symlink to active env file
    const envSymlink = join(ASTRO_DIR, ".env");
    const envTarget = join(ASTRO_DIR, `.env.${siteId}`);

    try {
      if (existsSync(envSymlink)) {
        execSync(`rm -f ${envSymlink}`);
      }
      execSync(`ln -s .env.${siteId} ${envSymlink}`, { cwd: ASTRO_DIR });
    } catch (error) {
      // Fallback: just copy the file
      copyFileSync(envTarget, envSymlink);
    }

    console.log(`\n✅ Activated site: ${siteId}`);
    this.info(siteId);
  }

  public create(siteId: string): void {
    if (!/^[a-z0-9-]+$/.test(siteId)) {
      console.error("❌ Site ID must contain only lowercase letters, numbers, and hyphens");
      process.exit(1);
    }

    const sitePath = join(SITES_DIR, siteId);

    if (existsSync(sitePath)) {
      console.error(`❌ Site already exists: ${siteId}`);
      process.exit(1);
    }

    // Create site directory
    mkdirSync(sitePath, { recursive: true });

    // Copy template config
    const templatePath = join(SITES_DIR, "_template", "site.config.json");
    const configPath = this.getSiteConfigPath(siteId);

    const templateConfig = JSON.parse(readFileSync(templatePath, "utf-8"));
    templateConfig.id = siteId;
    templateConfig.name = siteId.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    templateConfig.createdAt = new Date().toISOString();
    templateConfig.updatedAt = new Date().toISOString();

    writeFileSync(configPath, JSON.stringify(templateConfig, null, 2));

    console.log(`\n✅ Created new site: ${siteId}`);
    console.log(`\n📝 Next steps:`);
    console.log(`   1. Edit the configuration: sites/${siteId}/site.config.json`);
    console.log(`   2. Activate the site:      pnpm site:use ${siteId}`);
    console.log(`   3. Start development:      pnpm site:dev ${siteId}\n`);
  }

  public dev(siteId?: string): void {
    const targetSite = siteId || this.getActiveSite();

    if (!targetSite) {
      logger.error('No site specified and no active site set');
      console.error("❌ No site specified and no active site set");
      process.exit(1);
    }

    logger.info('Starting development server', { siteId: targetSite });

    // Ensure site is activated
    if (targetSite !== this.getActiveSite()) {
      this.use(targetSite);
    }

    const config = this.loadSiteConfig(targetSite);

    console.log(`\n🚀 Starting development server for: ${config.name}`);
    console.log(`   Site ID:  ${targetSite}`);
    console.log(`   Port:     ${config.astro.port}`);
    console.log(`   URL:      http://localhost:${config.astro.port}\n`);

    try {
      execSync(`pnpm -C apps/astro dev --port ${config.astro.port}`, {
        stdio: "inherit",
        env: { ...process.env, SITE_ID: targetSite },
      });
    } catch (error) {
      logger.error('Development server failed', { siteId: targetSite }, error as Error);
      process.exit(1);
    }
  }

  public build(siteId?: string): void {
    const targetSite = siteId || this.getActiveSite();

    if (!targetSite) {
      logger.error('No site specified and no active site set');
      console.error("❌ No site specified and no active site set");
      process.exit(1);
    }

    logger.info('Starting build', { siteId: targetSite });

    // Ensure site is activated
    if (targetSite !== this.getActiveSite()) {
      this.use(targetSite);
    }

    const config = this.loadSiteConfig(targetSite);

    console.log(`\n🔨 Building site: ${config.name}`);
    console.log(`   Site ID:  ${targetSite}`);
    console.log(`   Output:   ${config.astro.output}\n`);

    const startTime = Date.now();
    try {
      execSync(`pnpm -C apps/astro build`, {
        stdio: "inherit",
        env: { ...process.env, SITE_ID: targetSite },
      });
      const duration = Date.now() - startTime;
      logger.info('Build completed successfully', { siteId: targetSite, duration });
      console.log(`\n✅ Build complete for: ${targetSite}\n`);
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Build failed', { siteId: targetSite, duration }, error as Error);
      console.error(`\n❌ Build failed for: ${targetSite}\n`);
      process.exit(1);
    }
  }

  public active(): void {
    const activeSite = this.getActiveSite();

    if (!activeSite) {
      console.log("\n⚠️  No active site set\n");
      return;
    }

    try {
      const config = this.loadSiteConfig(activeSite);
      console.log(`\n🎯 Active Site: ${config.name} (${activeSite})\n`);
    } catch (error) {
      console.log(`\n🎯 Active Site: ${activeSite} (config not found)\n`);
    }
  }
}

// CLI Interface
const manager = new SiteManager();
const command = process.argv[2];
const arg = process.argv[3];

switch (command) {
  case "list":
  case "ls":
    manager.list();
    break;

  case "info":
    manager.info(arg);
    break;

  case "use":
  case "switch":
  case "activate":
    if (!arg) {
      console.error("❌ Please specify a site ID");
      process.exit(1);
    }
    manager.use(arg);
    break;

  case "create":
  case "new":
    if (!arg) {
      console.error("❌ Please specify a site ID");
      process.exit(1);
    }
    manager.create(arg);
    break;

  case "dev":
  case "start":
    manager.dev(arg);
    break;

  case "build":
    manager.build(arg);
    break;

  case "active":
  case "current":
    manager.active();
    break;

  default:
    console.log(`
ReactorBro Stack - Site Manager
================================

Usage: pnpm site <command> [options]

Commands:
  list, ls                    List all sites
  info [site-id]              Show detailed site information
  use <site-id>               Switch to a site (generates configs)
  create <site-id>            Create a new site from template
  dev [site-id]               Start development server
  build [site-id]             Build site for production
  active                      Show currently active site

Examples:
  pnpm site list              # List all sites
  pnpm site create acme-corp  # Create new site
  pnpm site use acme-corp     # Switch to acme-corp
  pnpm site dev               # Start dev server for active site
  pnpm site build             # Build active site
  pnpm site info berg-projects # Show berg-projects info

Environment:
  Sites are configured in: sites/<site-id>/site.config.json
  Active site is tracked in: .active-site
`);
}
