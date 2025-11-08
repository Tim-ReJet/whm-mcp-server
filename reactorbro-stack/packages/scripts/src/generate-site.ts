#!/usr/bin/env node

/**
 * Site Generation CLI
 *
 * Generates a complete Astro site using AI agents and the multi-site architecture
 *
 * Usage:
 *   pnpm generate:site <site-id> [--page <page-type>] [--force]
 *
 * Examples:
 *   pnpm generate:site berg-projects
 *   pnpm generate:site berg-projects --page landing
 *   pnpm generate:site berg-projects --force
 */

import * as fs from "fs/promises";
import * as path from "path";
import { createAstroGenerator } from "../../../agents/core/astro-generator";
import { LayoutAgent } from "../../../agents/registry/design/layout-agent";
import { ContentGenerationAgent } from "../../../agents/registry/content/content-generation-agent";
import type { Context, Task } from "../../../agents/core/types";

const ROOT_DIR = path.resolve(process.cwd());

interface SiteConfig {
  id: string;
  name: string;
  description: string;
  domain: {
    production: string;
    staging?: string;
    preview?: string;
  };
  wordpress?: {
    url: string;
    restApi: string;
    local?: {
      enabled: boolean;
      url: string;
    };
  };
  theme: {
    primaryColor: string;
    fontFamily: string;
    logo?: string;
  };
  contact?: {
    email: string;
    phone: string;
    address?: string;
  };
  seo?: {
    title: string;
    description: string;
  };
}

interface GenerationOptions {
  siteId: string;
  pageType?: "landing" | "about" | "services" | "contact" | "blog";
  force?: boolean;
  outputDir?: string;
}

// ============================================================================
// CLI Colors
// ============================================================================

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",

  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};

function log(message: string, color: keyof typeof colors = "white") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message: string) {
  log(`✅ ${message}`, "green");
}

function logError(message: string) {
  log(`❌ ${message}`, "red");
}

function logInfo(message: string) {
  log(`ℹ️  ${message}`, "cyan");
}

function logWarning(message: string) {
  log(`⚠️  ${message}`, "yellow");
}

function logStep(step: number, total: number, message: string) {
  log(`[${step}/${total}] ${message}`, "magenta");
}

// ============================================================================
// Site Configuration Loading
// ============================================================================

async function loadSiteConfig(siteId: string): Promise<SiteConfig> {
  const configPath = path.join(ROOT_DIR, "sites", siteId, "site.config.json");

  try {
    const configData = await fs.readFile(configPath, "utf-8");
    return JSON.parse(configData);
  } catch (error) {
    const err = error as Error;
    throw new Error(`Failed to load site config for ${siteId}: ${err.message}`);
  }
}

// ============================================================================
// AI Agent Execution
// ============================================================================

async function generateLayout(
  pageType: string,
  siteConfig: SiteConfig,
  context: Context,
): Promise<any> {
  logInfo(`Generating layout for ${pageType} page...`);

  const layoutAgent = new LayoutAgent();

  const task: Task = {
    id: `layout-${Date.now()}`,
    type: "page_layout",
    title: `Generate ${pageType} page layout`,
    description: `Create a professional ${pageType} page layout`,
    parameters: {
      pageType,
      requirements: {
        pageType,
        contentComplexity: "moderate",
        deviceTargets: ["mobile", "tablet", "desktop"],
        designStyle: "modern",
      },
    },
    context,
    priority: "high",
    dependencies: [],
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await layoutAgent.execute(task, context);

  if (!result.success) {
    throw new Error("Layout generation failed");
  }

  return result.data;
}

async function generateContent(
  pageType: string,
  siteConfig: SiteConfig,
  context: Context,
): Promise<any> {
  logInfo(`Generating content for ${pageType} page...`);

  const contentAgent = new ContentGenerationAgent();

  const task: Task = {
    id: `content-${Date.now()}`,
    type: "page_content",
    title: `Generate ${pageType} page content`,
    description: `Create compelling content for ${pageType} page`,
    parameters: {
      pageType,
      brand: {
        name: siteConfig.name,
        description: siteConfig.description,
        industry: "Construction & Project Management",
      },
      tone: "professional",
      length: "medium",
    },
    context,
    priority: "high",
    dependencies: [],
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await contentAgent.execute(task, context);

  if (!result.success) {
    throw new Error("Content generation failed");
  }

  return result.data;
}

// ============================================================================
// Content Templates
// ============================================================================

function getDefaultContent(pageType: string, siteConfig: SiteConfig): any {
  const templates = {
    landing: {
      title: siteConfig.name,
      description: siteConfig.description,
      hero: {
        title: `${siteConfig.name}\nBuild Your Vision With Confidence`,
        subtitle: "15+ years of construction excellence across South Africa",
        primaryCta: { text: "Get Free Consultation", link: "/contact" },
        secondaryCta: { text: "View Services", link: "/services" },
      },
      features: [
        {
          icon: "🏗️",
          title: "Construction Management",
          description:
            "Expert oversight of every aspect of your construction project from start to finish.",
          link: "/services",
        },
        {
          icon: "📋",
          title: "Project Management",
          description:
            "Strategic planning and execution to keep your project on time and on budget.",
          link: "/services",
        },
        {
          icon: "🏢",
          title: "Property Development",
          description:
            "End-to-end development services from concept to completion.",
          link: "/services",
        },
      ],
      cta: {
        title: "Ready to Start Your Project?",
        description:
          "Let's discuss how we can help bring your construction vision to life",
        primaryText: "Contact Us Today",
        primaryLink: "/contact",
      },
    },
    about: {
      title: `About ${siteConfig.name}`,
      description: `Learn more about ${siteConfig.name}`,
      hero: {
        title: "15 Years of Excellence",
        subtitle:
          "Building South Africa's future with innovation and integrity",
      },
    },
    services: {
      title: "Our Services",
      description:
        "Comprehensive construction and project management solutions",
      featuresTitle: "What We Offer",
      features: [
        {
          icon: "🏗️",
          title: "Construction Management",
          description:
            "Full-service construction management for commercial, residential, and industrial projects.",
        },
        {
          icon: "📋",
          title: "Project Management",
          description:
            "Expert project management to ensure your development stays on track.",
        },
        {
          icon: "🏢",
          title: "Development Management",
          description:
            "Comprehensive development services from feasibility to completion.",
        },
        {
          icon: "🔧",
          title: "Turnkey Solutions",
          description:
            "Complete design-build solutions with single-point accountability.",
        },
      ],
    },
    contact: {
      title: "Contact Us",
      description: "Get in touch with our team",
      hero: {
        title: "Let's Start Your Project",
        subtitle: "Get a free consultation and discover how we can help",
      },
      contactInfo: {
        email: siteConfig.contact?.email || "",
        phone: siteConfig.contact?.phone || "",
        address: siteConfig.contact?.address || "",
      },
    },
    blog: {
      title: "Blog",
      description: "Latest news and insights",
      hero: {
        title: "Insights & News",
        subtitle:
          "Stay updated with the latest in construction and project management",
      },
    },
  };

  return templates[pageType as keyof typeof templates] || templates.landing;
}

// ============================================================================
// Site Generation
// ============================================================================

async function generateSite(options: GenerationOptions): Promise<void> {
  const startTime = Date.now();

  log(
    "\n╔══════════════════════════════════════════════════════════════╗",
    "cyan",
  );
  log(
    "║          ReactorBro Stack - AI Site Generator               ║",
    "cyan",
  );
  log(
    "╚══════════════════════════════════════════════════════════════╝\n",
    "cyan",
  );

  try {
    // Step 1: Load site configuration
    logStep(1, 5, "Loading site configuration...");
    const siteConfig = await loadSiteConfig(options.siteId);
    logSuccess(`Loaded config for: ${siteConfig.name}`);

    // Step 2: Initialize output directory
    logStep(2, 5, "Setting up output directory...");
    const outputDir = options.outputDir || path.join(ROOT_DIR, "apps/astro");
    const pagesDir = path.join(outputDir, "src/pages");

    // Check if page already exists
    const pageType = options.pageType || "landing";
    const pagePath = pageType === "landing" ? "index" : pageType;
    const targetFile = path.join(pagesDir, `${pagePath}.astro`);

    const exists = await fs
      .access(targetFile)
      .then(() => true)
      .catch(() => false);
    if (exists && !options.force) {
      logWarning(`Page already exists: ${pagePath}.astro`);
      logInfo("Use --force to overwrite");
      process.exit(0);
    }

    logSuccess(`Output directory: ${outputDir}`);

    // Step 3: Create context
    logStep(3, 5, "Initializing AI context...");
    const context: Context = {
      id: `ctx-${Date.now()}`,
      siteId: options.siteId,
      sessionId: `session-${Date.now()}`,
      data: {
        siteConfig,
        pageType,
      },
      history: [],
      metadata: {
        created: new Date(),
        updated: new Date(),
        totalTokens: 0,
        entryCount: 0,
        size: 0,
      },
    };
    logSuccess("Context initialized");

    // Step 4: Generate layout and content with AI agents
    logStep(4, 5, "Running AI agents...");

    const layout = await generateLayout(pageType, siteConfig, context);
    logSuccess("Layout generated");

    const content = getDefaultContent(pageType, siteConfig);
    logSuccess("Content prepared");

    // Step 5: Generate Astro page
    logStep(5, 5, "Generating Astro page...");

    const generator = createAstroGenerator(outputDir, {
      id: siteConfig.id,
      name: siteConfig.name,
      domain: siteConfig.domain,
      wordpress: siteConfig.wordpress,
      theme: siteConfig.theme,
      contact: siteConfig.contact,
    });

    const generatedFile = await generator.generatePage(
      pagePath,
      layout,
      content,
      context,
    );

    logSuccess(`Generated: ${path.relative(ROOT_DIR, generatedFile)}`);

    // Summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    log(
      "\n╔══════════════════════════════════════════════════════════════╗",
      "green",
    );
    log(
      "║                   Generation Complete! 🎉                    ║",
      "green",
    );
    log(
      "╚══════════════════════════════════════════════════════════════╝\n",
      "green",
    );

    log(`📄 Page Type:     ${pageType}`, "white");
    log(`🏗️  Site:          ${siteConfig.name}`, "white");
    log(`📁 Output:        ${path.relative(ROOT_DIR, generatedFile)}`, "white");
    log(`⏱️  Duration:      ${duration}s\n`, "white");

    log("Next Steps:", "cyan");
    log("  1. Review the generated page:", "white");
    log(
      `     ${colors.dim}code ${path.relative(process.cwd(), generatedFile)}${colors.reset}\n`,
      "white",
    );
    log("  2. Start the dev server:", "white");
    log(
      `     ${colors.dim}cd apps/astro && pnpm dev${colors.reset}\n`,
      "white",
    );
    log("  3. View in browser:", "white");
    log(
      `     ${colors.dim}http://localhost:4321/${pagePath === "index" ? "" : pagePath}${colors.reset}\n`,
      "white",
    );
  } catch (error) {
    const err = error as Error;
    log(
      "\n╔══════════════════════════════════════════════════════════════╗",
      "red",
    );
    log(
      "║                   Generation Failed ❌                       ║",
      "red",
    );
    log(
      "╚══════════════════════════════════════════════════════════════╝\n",
      "red",
    );

    logError(err.message);

    if (err.stack) {
      log("\nStack trace:", "dim");
      log(err.stack, "dim");
    }

    process.exit(1);
  }
}

// ============================================================================
// CLI Argument Parsing
// ============================================================================

function parseArgs(): GenerationOptions {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    printHelp();
    process.exit(0);
  }

  const siteId = args[0];

  if (!siteId) {
    logError("Site ID is required");
    printHelp();
    process.exit(1);
  }

  const options: GenerationOptions = {
    siteId,
  };

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--page" || arg === "-p") {
      options.pageType = args[++i] as any;
    } else if (arg === "--force" || arg === "-f") {
      options.force = true;
    } else if (arg === "--output" || arg === "-o") {
      options.outputDir = args[++i];
    }
  }

  return options;
}

function printHelp() {
  log("\nReactorBro Stack - AI Site Generator\n", "cyan");
  log("Usage:", "white");
  log("  pnpm generate:site <site-id> [options]\n", "white");

  log("Options:", "white");
  log(
    "  --page, -p <type>     Page type to generate (landing, about, services, contact, blog)",
    "white",
  );
  log("  --force, -f           Overwrite existing files", "white");
  log("  --output, -o <dir>    Custom output directory", "white");
  log("  --help, -h            Show this help message\n", "white");

  log("Examples:", "white");
  log("  pnpm generate:site berg-projects", "dim");
  log("  pnpm generate:site berg-projects --page about", "dim");
  log("  pnpm generate:site berg-projects --page services --force\n", "dim");
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  const options = parseArgs();
  await generateSite(options);
}

// Run if executed directly
main().catch((error: Error) => {
  logError(`Unexpected error: ${error.message}`);
  process.exit(1);
});

export { generateSite, type GenerationOptions };
