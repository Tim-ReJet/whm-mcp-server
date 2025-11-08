#!/usr/bin/env ts-node
import { execSync } from "node:child_process";

const cmd = process.argv[2];
const run = (c: string) => execSync(c, { stdio: "inherit", env: process.env });

switch (cmd) {
  case "wp:init":
    run("make wp-init");
    break;
  case "wp:up":
    run("make wp-up");
    break;
  case "wp:plugins":
    run("make wp-plugins");
    break;
  case "astro:dev":
    run("make astro-dev");
    break;
  case "tokens":
    run("make tokens");
    break;
  case "validate-prod":
    run("ts-node packages/scripts/src/validate-prod.ts");
    break;
  default:
    console.log(`Unknown cmd: ${cmd}
Available commands:
  wp:init        - Initialize WordPress with DDEV
  wp:up          - Start DDEV
  wp:plugins     - Install WordPress plugins
  astro:dev      - Start Astro dev server
  tokens         - Build design tokens
  validate-prod  - Validate production environment
`);
}
