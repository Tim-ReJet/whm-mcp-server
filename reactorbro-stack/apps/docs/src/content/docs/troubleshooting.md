---
title: Troubleshooting Guide
description: Common issues and solutions for ReactorBro Stack
category: guides
order: 6
---

# Troubleshooting Guide

Common issues and their solutions when working with ReactorBro Stack.

## Site Management

### Site Not Found

**Error:** `Site config not found`

**Solutions:**
1. List available sites: `pnpm site:list`
2. Check if site exists: `pnpm site:info <site-id>`
3. Create new site: `pnpm site:create <site-id>`
4. Verify site directory exists in `sites/`
5. Use interactive CLI: `pnpm cli` for guided help

### Active Site Not Set

**Error:** `No site specified`

**Solutions:**
1. Set active site: `pnpm site:use <site-id>`
2. Or specify site in command: `pnpm site:dev <site-id>`
3. Check active site: `pnpm site:active`
4. List all sites: `pnpm site:list`

### Site Already Exists

**Error:** `Site already exists`

**Solutions:**
1. Use different site ID
2. Delete existing site (if safe)
3. Check site list: `pnpm site:list`
4. View site info: `pnpm site:info <site-id>`

### Port Already in Use

**Error:** `Port 4321 is already in use`

**Solutions:**
1. Find process using port: `lsof -i :4321`
2. Kill process: `kill -9 <PID>`
3. Or use different port in site config
4. Use interactive CLI to select different port

## Workflow Issues

### Workflow Not Found

**Error:** `Workflow not found`

**Solutions:**
1. List workflows: `GET /api/workflows`
2. Check workflow ID spelling
3. Verify workflow file exists in `agents/workflows/`
4. Check workflow was saved correctly
5. Start workflow API: `pnpm workflow:api`

### Workflow Execution Failed

**Error:** `Workflow execution failed`

**Solutions:**
1. Check workflow validation: Ensure all steps are valid
2. Verify agents are registered: `pnpm agent:list`
3. Check execution logs: View trace dashboard
4. Review step dependencies: Ensure no circular dependencies
5. Check timeout settings: Increase if steps take longer
6. View execution status: `GET /api/workflows/:id/status?executionId=xxx`

### Execution Status Not Found

**Error:** `Execution not found`

**Solutions:**
1. Verify execution ID is correct
2. Check execution completed (may have expired)
3. Review execution history
4. Ensure workflow was actually executed
5. Check workflow debugger: http://localhost:4322/workflow-debugger

## Deployment Issues

### Deployment Failed

**Error:** `Deployment failed`

**Solutions:**
1. Check build logs: `pnpm deploy:status <deployment-id>`
2. Verify site configuration
3. Check deployment platform credentials
4. Review health checks: `pnpm deploy:health <site-id>`
5. Check for rollback: `pnpm deploy:rollback <deployment-id>`
6. View deployment dashboard: http://localhost:4322/deployments

### Build Artifacts Missing

**Error:** `Build artifacts not found`

**Solutions:**
1. Run build: `pnpm site:build <site-id>`
2. Check build output directory
3. Verify build succeeded
4. Review build metrics: `pnpm build:metrics`
5. Analyze bundle: `pnpm build:analyze`

## Asset Management

### Asset Not Found

**Error:** `Asset not found`

**Solutions:**
1. Search assets: `pnpm asset:search <query>`
2. Browse assets: `pnpm asset:browse`
3. Check asset ID spelling
4. Verify asset exists: `pnpm asset:info <asset-id>`
5. Populate assets: `pnpm populate-assets`

### Asset Import Failed

**Error:** `Failed to import asset`

**Solutions:**
1. Verify asset format (JSON/YAML)
2. Check asset structure matches schema
3. Review import logs
4. Validate asset manually before import

## API Issues

### API Server Not Running

**Error:** `Connection refused` or `Failed to fetch`

**Solutions:**
1. Start workflow API: `pnpm workflow:api`
2. Start deployment API: `pnpm deployment:api`
3. Check ports (3001, 3002) are available
4. Verify firewall settings
5. Check API server logs

### CORS Errors

**Error:** `CORS policy blocked`

**Solutions:**
1. Check API server CORS settings
2. Verify request origin
3. Use correct API endpoint
4. Check browser console for details

## Performance Issues

### Slow Workflow Execution

**Symptoms:** Workflows take too long

**Solutions:**
1. Enable parallel execution for independent steps
2. Increase timeout values
3. Optimize step dependencies
4. Check agent performance
5. Review token usage
6. Check traces: http://localhost:4322/traces

### Build Performance

**Symptoms:** Builds are slow

**Solutions:**
1. Check bundle size: `pnpm build:analyze`
2. Review performance budgets
3. Optimize dependencies
4. Enable build caching
5. Check build metrics: `pnpm build:metrics`

## Debugging Tips

### Enable Debug Logging

```bash
# Set debug mode
export DEBUG=*
pnpm site:dev
```

### View Logs

```bash
# View observability logs
pnpm observability logs

# View specific metrics
pnpm observability metrics
```

### Check System Health

```bash
# Check all agents
pnpm agent:status

# Check site health
pnpm deploy:health <site-id>

# View dashboard
pnpm dashboard
```

## Getting Help

1. **Check Documentation**: `docs/` directory or http://localhost:4322
2. **Review Logs**: Check observability logs
3. **Use Interactive CLI**: `pnpm cli` for guided help
4. **Check Examples**: `/docs/workflow-examples`
5. **Review Traces**: Use trace dashboard for execution flow
6. **View Troubleshooting**: `/docs/troubleshooting`

## Common Error Codes

- `SITE_NOT_FOUND`: Site configuration missing
- `WORKFLOW_NOT_FOUND`: Workflow doesn't exist
- `AGENT_NOT_FOUND`: Agent not registered
- `EXECUTION_FAILED`: Workflow execution error
- `BUILD_FAILED`: Build process error
- `DEPLOYMENT_FAILED`: Deployment error
- `ASSET_NOT_FOUND`: Asset missing
- `VALIDATION_ERROR`: Configuration invalid

## Prevention

1. **Validate Before Execution**: Check workflows before running
2. **Use Templates**: Start with proven templates
3. **Monitor Regularly**: Check status and metrics
4. **Test Locally**: Test workflows before production
5. **Keep Updated**: Update dependencies regularly
6. **Backup Configs**: Keep backups of important configurations
7. **Use Interactive CLI**: `pnpm cli` for guided workflows
8. **Check Documentation**: Review docs before starting

## Workflow Timeout

**Error:** `Workflow step timed out`

**Solution:**
```typescript
// Increase timeout for specific step
{
  id: 'long-running-step',
  timeout: 900000, // 15 minutes (default is 5 minutes)
}
```

**Or adjust workflow config:**
```typescript
{
  config: {
    maxConcurrent: 2, // Reduce concurrent steps
    failFast: false,   // Don't fail on first error
  }
}
```

## Asset Management Issues

### Asset Not Found

**Error:** `Asset not found`

**Solution:**
```bash
# Search for similar assets
pnpm asset:search "button"

# Browse by category
pnpm asset:browse

# Check asset ID spelling
```

### Asset Dependency Conflict

**Error:** `Dependency conflict detected`

**Solution:**
```typescript
import { AssetManager } from '@repo/assets';

const manager = new AssetManager();

// Check dependencies
const conflicts = await manager.detectConflicts(assetId);

// Resolve conflicts
for (const conflict of conflicts) {
  console.log(`Conflict: ${conflict.type}`);
  // Manually resolve or update versions
}
```

### Asset Cache Issues

**Error:** `Asset cache corrupted`

**Solution:**
```bash
# Clear asset cache
rm -rf .assets/cache

# Rebuild cache
pnpm populate-assets
```

## Build Issues

### Build Fails

**Error:** `Build failed`

**Debug Steps:**

1. **Check build logs:**
   ```bash
   pnpm site:build my-site 2>&1 | tee build.log
   ```

2. **Check bundle size:**
   ```bash
   pnpm build:metrics
   ```

3. **Verify dependencies:**
   ```bash
   pnpm install
   ```

4. **Check for TypeScript errors:**
   ```bash
   pnpm lint
   ```

### Bundle Size Too Large

**Error:** `Bundle size exceeds budget`

**Solution:**
```bash
# Analyze bundle
pnpm build:analyze

# Check large dependencies
# Look for:
# - Unused imports
# - Large libraries
# - Duplicate dependencies
```

**Optimization:**
```typescript
// Use dynamic imports
const heavyModule = await import('./heavy-module');

// Code splitting
// Configure in astro.config.mjs
```

## Deployment Issues

### Deployment Fails

**Error:** `Deployment failed`

**Checklist:**
1. **Verify build succeeds locally:**
   ```bash
   pnpm site:build my-site
   ```

2. **Check deployment config:**
   ```bash
   pnpm deploy:status
   ```

3. **Verify credentials:**
   ```bash
   # Check environment variables
   # Verify API keys
   ```

4. **Check deployment logs:**
   ```bash
   # View in deployment dashboard
   # Or check CI/CD logs
   ```

### Rollback Fails

**Error:** `Rollback failed`

**Solution:**
```bash
# List previous deployments
pnpm deploy:list

# Find successful deployment
# Manually rollback if needed
pnpm deploy:rollback <deployment-id>
```

## Performance Issues

### Slow Build Times

**Symptoms:** Builds take > 5 minutes

**Solutions:**

1. **Enable caching:**
   ```bash
   # Turborepo caching should be enabled
   # Check turbo.json
   ```

2. **Parallel builds:**
   ```bash
   # Use Turborepo parallel execution
   pnpm build --parallel
   ```

3. **Optimize dependencies:**
   ```bash
   # Remove unused dependencies
   pnpm prune
   ```

### Slow Development Server

**Symptoms:** Dev server takes > 10 seconds to start

**Solutions:**

1. **Reduce site count:**
   ```bash
   # Only keep active sites
   # Archive unused sites
   ```

2. **Optimize imports:**
   ```typescript
   // Use tree-shaking friendly imports
   import { specificFunction } from 'library';
   // Instead of
   import * from 'library';
   ```

## Getting Help

### Check Documentation

- [Getting Started](/docs/getting-started)
- [Architecture Guide](/docs/architecture)
- [API Reference](/docs/api)

### Use Interactive CLI

```bash
pnpm cli
# Navigate to "Help & Documentation"
```

### View Logs

```bash
# Application logs
tail -f logs/app.log

# Workflow logs
tail -f logs/workflow-engine.log

# Build logs
tail -f logs/build.log
```

### Common Commands

```bash
# Reset everything
pnpm clean
pnpm install
pnpm bootstrap

# Check system health
pnpm obs health

# View metrics
pnpm obs metrics
```

## Still Stuck?

1. **Check GitHub Issues** - Search for similar problems
2. **Review Logs** - Look for error patterns
3. **Use Debug Mode** - Enable verbose logging
4. **Ask for Help** - Create an issue with:
   - Error message
   - Steps to reproduce
   - System information
   - Relevant logs

