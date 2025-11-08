#!/usr/bin/env ts-node
/**
 * Production Environment Validator
 * Validates the production environment before deployment
 *
 * Usage: pnpm so validate-prod
 */

import { execSync } from "node:child_process";
import * as https from "node:https";
import * as http from "node:http";
import * as dns from "node:dns";
import { promisify } from "node:util";

const resolveDns = promisify(dns.resolve);

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

interface CheckResult {
  name: string;
  passed: boolean;
  message: string;
  critical: boolean;
}

const results: CheckResult[] = [];

// Helper functions
function log(message: string, color: keyof typeof colors = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title: string) {
  console.log("\n");
  log(`${"=".repeat(60)}`, "cyan");
  log(`  ${title}`, "bold");
  log(`${"=".repeat(60)}`, "cyan");
  console.log();
}

function addResult(name: string, passed: boolean, message: string, critical = false) {
  results.push({ name, passed, message, critical });
  const icon = passed ? "✓" : "✗";
  const color = passed ? "green" : critical ? "red" : "yellow";
  log(`${icon} ${name}: ${message}`, color);
}

function fetchUrl(url: string): Promise<{ statusCode: number; headers: http.IncomingHttpHeaders; body: string }> {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https") ? https : http;
    const req = lib.get(url, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        resolve({
          statusCode: res.statusCode || 0,
          headers: res.headers,
          body,
        });
      });
    });
    req.on("error", reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });
  });
}

// Validation checks
async function checkEnvironmentVariables() {
  logSection("Environment Variables");

  const requiredVars = [
    "SITE_URL",
    "WP_GRAPHQL_URL",
    "CF_API_TOKEN",
    "CF_ACCOUNT_ID",
    "CF_PROJECT_NAME",
  ];

  const optionalVars = [
    "WP_DEPLOY_HOST",
    "WP_DEPLOY_USER",
    "WP_DEPLOY_SSH_KEY",
    "R2_BUCKET_NAME",
    "R2_ACCESS_KEY_ID",
  ];

  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (value && value !== "your-value-here" && value !== "") {
      addResult(varName, true, "Set and looks valid");
    } else {
      addResult(varName, false, "Missing or not configured", true);
    }
  }

  for (const varName of optionalVars) {
    const value = process.env[varName];
    if (value && value !== "your-value-here" && value !== "") {
      addResult(varName, true, "Set (optional)");
    } else {
      addResult(varName, false, "Not set (optional - may be needed)", false);
    }
  }
}

async function checkWordPressEndpoint() {
  logSection("WordPress GraphQL Endpoint");

  const wpUrl = process.env.WP_GRAPHQL_URL || process.env.SITE_URL;
  if (!wpUrl) {
    addResult("WordPress URL", false, "WP_GRAPHQL_URL not set", true);
    return;
  }

  try {
    const response = await fetchUrl(wpUrl);
    if (response.statusCode === 200 || response.statusCode === 400) {
      addResult("GraphQL Endpoint", true, `Accessible (${response.statusCode})`);

      // Check if it's actually GraphQL
      if (response.body.includes("GraphQL") || response.body.includes("graphql")) {
        addResult("GraphQL Response", true, "Valid GraphQL endpoint detected");
      } else {
        addResult("GraphQL Response", false, "Endpoint accessible but may not be GraphQL", false);
      }
    } else {
      addResult("GraphQL Endpoint", false, `Unexpected status: ${response.statusCode}`, true);
    }
  } catch (error) {
    addResult("GraphQL Endpoint", false, `Cannot reach: ${(error as Error).message}`, true);
  }
}

async function checkSSLConfiguration() {
  logSection("SSL/HTTPS Configuration");

  const siteUrl = process.env.SITE_URL;
  if (!siteUrl) {
    addResult("Site URL", false, "SITE_URL not set", true);
    return;
  }

  if (!siteUrl.startsWith("https://")) {
    addResult("HTTPS Protocol", false, "Site URL does not use HTTPS", true);
    return;
  }

  try {
    const response = await fetchUrl(siteUrl);
    addResult("HTTPS Accessible", true, `Site accessible via HTTPS (${response.statusCode})`);

    // Check for HSTS header
    const hsts = response.headers["strict-transport-security"];
    if (hsts) {
      addResult("HSTS Header", true, "HSTS configured");
    } else {
      addResult("HSTS Header", false, "HSTS not configured (recommended)", false);
    }

    // Check for security headers
    const securityHeaders = [
      "x-frame-options",
      "x-content-type-options",
      "content-security-policy",
      "referrer-policy",
    ];

    for (const header of securityHeaders) {
      if (response.headers[header]) {
        addResult(`Security: ${header}`, true, "Present");
      } else {
        addResult(`Security: ${header}`, false, "Missing (recommended)", false);
      }
    }
  } catch (error) {
    addResult("HTTPS Check", false, `Cannot reach site: ${(error as Error).message}`, true);
  }
}

async function checkDNSConfiguration() {
  logSection("DNS Configuration");

  const siteUrl = process.env.SITE_URL;
  if (!siteUrl) {
    addResult("DNS Check", false, "SITE_URL not set", true);
    return;
  }

  try {
    const domain = new URL(siteUrl).hostname;
    const addresses = await resolveDns(domain, "A");
    if (addresses && addresses.length > 0) {
      addResult("DNS A Record", true, `Resolves to: ${addresses.join(", ")}`);
    } else {
      addResult("DNS A Record", false, "No A records found", true);
    }
  } catch (error) {
    addResult("DNS Resolution", false, `Cannot resolve: ${(error as Error).message}`, true);
  }
}

async function checkBuildProcess() {
  logSection("Build Process");

  try {
    // Check if node_modules exists
    const nodeModulesCheck = execSync("ls node_modules", { encoding: "utf-8" });
    addResult("Dependencies", true, "node_modules present");
  } catch (error) {
    addResult("Dependencies", false, "node_modules missing - run pnpm install", true);
  }

  try {
    // Check TypeScript compilation
    log("Running TypeScript type check...", "blue");
    execSync("pnpm -C apps/astro check", { encoding: "utf-8", stdio: "pipe" });
    addResult("TypeScript", true, "No type errors");
  } catch (error) {
    addResult("TypeScript", false, "Type errors found - run pnpm -C apps/astro check", true);
  }

  try {
    // Check if build works
    log("Testing production build (this may take a minute)...", "blue");
    execSync("pnpm -C apps/astro build", { encoding: "utf-8", stdio: "pipe" });
    addResult("Build Process", true, "Production build successful");
  } catch (error) {
    addResult("Build Process", false, "Build failed - check for errors", true);
  }
}

async function checkDependencies() {
  logSection("Dependency Security");

  try {
    log("Running security audit...", "blue");
    const auditOutput = execSync("pnpm audit --prod --audit-level=high", {
      encoding: "utf-8",
      stdio: "pipe",
    });
    addResult("Security Audit", true, "No high/critical vulnerabilities");
  } catch (error) {
    addResult(
      "Security Audit",
      false,
      "Vulnerabilities found - run pnpm audit for details",
      false
    );
  }

  try {
    const outdated = execSync("pnpm outdated --prod", { encoding: "utf-8", stdio: "pipe" });
    if (outdated.trim()) {
      addResult("Outdated Packages", false, "Some packages are outdated - review before deploy", false);
    } else {
      addResult("Outdated Packages", true, "All packages up to date");
    }
  } catch (error) {
    // pnpm outdated exits with code 1 if packages are outdated
    addResult("Outdated Packages", false, "Some packages are outdated - review before deploy", false);
  }
}

async function checkConfiguration() {
  logSection("Configuration Files");

  const files = [
    { path: "apps/astro/astro.config.mjs", critical: true },
    { path: "apps/astro/public/robots.txt", critical: false },
    { path: "apps/astro/public/_headers", critical: false },
    { path: ".env", critical: true },
    { path: "package.json", critical: true },
  ];

  for (const file of files) {
    try {
      execSync(`test -f ${file.path}`, { encoding: "utf-8" });
      addResult(`File: ${file.path}`, true, "Present");
    } catch (error) {
      addResult(`File: ${file.path}`, false, "Missing", file.critical);
    }
  }
}

async function checkGitStatus() {
  logSection("Git Status");

  try {
    const branch = execSync("git branch --show-current", { encoding: "utf-8" }).trim();
    if (branch === "main" || branch === "master") {
      addResult("Git Branch", true, `On ${branch} branch`);
    } else {
      addResult("Git Branch", false, `On ${branch} - should be main/master for production`, false);
    }
  } catch (error) {
    addResult("Git Branch", false, "Cannot determine branch", false);
  }

  try {
    const status = execSync("git status --porcelain", { encoding: "utf-8" });
    if (status.trim() === "") {
      addResult("Git Status", true, "Working directory clean");
    } else {
      addResult("Git Status", false, "Uncommitted changes present", false);
    }
  } catch (error) {
    addResult("Git Status", false, "Cannot check git status", false);
  }

  try {
    execSync("git fetch origin", { encoding: "utf-8", stdio: "pipe" });
    const behind = execSync("git rev-list --count HEAD..origin/main", { encoding: "utf-8" }).trim();
    if (behind === "0") {
      addResult("Git Sync", true, "Up to date with origin");
    } else {
      addResult("Git Sync", false, `${behind} commits behind origin - pull first`, false);
    }
  } catch (error) {
    addResult("Git Sync", false, "Cannot check sync status", false);
  }
}

// Main execution
async function main() {
  log("\n╔════════════════════════════════════════════════════════════╗", "cyan");
  log("║     ReactorJet Stack - Production Environment Validator    ║", "cyan");
  log("╚════════════════════════════════════════════════════════════╝\n", "cyan");

  log("Starting validation checks...\n", "blue");

  await checkEnvironmentVariables();
  await checkConfiguration();
  await checkGitStatus();
  await checkBuildProcess();
  await checkDependencies();
  await checkWordPressEndpoint();
  await checkSSLConfiguration();
  await checkDNSConfiguration();

  // Summary
  logSection("Validation Summary");

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const critical = results.filter((r) => !r.passed && r.critical).length;

  log(`Total Checks: ${results.length}`, "blue");
  log(`Passed: ${passed}`, "green");
  log(`Failed: ${failed}`, failed > 0 ? "yellow" : "green");
  log(`Critical Issues: ${critical}`, critical > 0 ? "red" : "green");

  console.log("\n");

  if (critical > 0) {
    log("❌ CRITICAL ISSUES FOUND - DO NOT DEPLOY TO PRODUCTION", "red");
    log("Fix the critical issues above before proceeding.", "red");
    process.exit(1);
  } else if (failed > 0) {
    log("⚠️  WARNING: Some checks failed", "yellow");
    log("Review the warnings above. You may proceed but address these issues soon.", "yellow");
    process.exit(0);
  } else {
    log("✅ ALL CHECKS PASSED - READY FOR PRODUCTION DEPLOYMENT", "green");
    log("Remember to:", "blue");
    log("  1. Review the production checklist (docs/PRODUCTION_CHECKLIST.md)", "blue");
    log("  2. Notify stakeholders of deployment", "blue");
    log("  3. Monitor closely after deployment", "blue");
    process.exit(0);
  }
}

// Run validation
main().catch((error) => {
  log(`\n❌ Validation failed with error: ${error.message}`, "red");
  process.exit(1);
});
