#!/usr/bin/env ts-node

/**
 * OpenAPI Generator CLI
 * Generates OpenAPI specification from code
 */

import { OpenAPIGenerator } from './openapi-generator.js';
import { resolve } from 'path';
import { writeFileSync } from 'fs';

async function main() {
  console.log('\n📝 Generating OpenAPI Specification...\n');

  const generator = new OpenAPIGenerator();
  const spec = await generator.generate();

  const outputPath = resolve(process.cwd(), 'docs/openapi.json');
  writeFileSync(outputPath, JSON.stringify(spec, null, 2));

  console.log(`✅ OpenAPI spec generated: ${outputPath}\n`);
  console.log(`   Endpoints: ${Object.keys(spec.paths).length}`);
  console.log(`   Schemas: ${Object.keys(spec.components.schemas).length}\n`);
}

main().catch(console.error);

