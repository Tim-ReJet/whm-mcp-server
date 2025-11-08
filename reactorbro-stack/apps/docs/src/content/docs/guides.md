---
title: Guides
description: Step-by-step guides and tutorials
category: guides
order: 4
---

# Guides

Step-by-step guides for common tasks.

## Creating Your First Site

1. **Create the site**
   \`\`\`bash
   pnpm site:create my-first-site
   \`\`\`

2. **Configure the site**
   Edit \`sites/my-first-site/site.config.json\`

3. **Activate the site**
   \`\`\`bash
   pnpm site:use my-first-site
   \`\`\`

4. **Start development**
   \`\`\`bash
   pnpm site:dev
   \`\`\`

## Using Assets

### Browse Assets
\`\`\`bash
pnpm asset:browse
\`\`\`

### Search Assets
\`\`\`bash
pnpm asset:search "button"
\`\`\`

### Use an Asset
\`\`\`bash
pnpm asset:use button-primary my-site
\`\`\`

## Working with Agents

### List Available Agents
\`\`\`bash
pnpm agent:list
\`\`\`

### Execute a Workflow
\`\`\`bash
pnpm agent:workflow site-creation
\`\`\`

## Deployment

### Deploy a Site
\`\`\`bash
pnpm deploy:deploy my-site
\`\`\`

### Check Deployment Status
\`\`\`bash
pnpm deploy:status
\`\`\`

### Rollback if Needed
\`\`\`bash
pnpm deploy:rollback deployment-id
\`\`\`

