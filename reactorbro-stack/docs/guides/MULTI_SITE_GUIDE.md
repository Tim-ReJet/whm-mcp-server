# Multi-Site Management Guide

**ReactorBro Stack - Managing Multiple Website Builds Concurrently**

---

## 🎯 Overview

The ReactorBro Stack now supports managing multiple website builds concurrently, allowing you to work on different client sites (like Berg Projects) simultaneously within a single monorepo. Each site has its own configuration, WordPress backend connection, and deployment settings while sharing common packages and infrastructure.

---

## 🏗️ Architecture

### Directory Structure

```
reactorbro-stack/
├── sites/                      # Site configurations
│   ├── berg-projects/          # Berg Projects site config
│   │   └── site.config.json
│   ├── acme-corp/              # Another site config
│   │   └── site.config.json
│   ├── _template/              # Template for new sites
│   │   └── site.config.json
│   └── site-config.schema.json # JSON schema for validation
├── apps/
│   ├── astro/                  # Shared Astro app
│   │   ├── .env.berg-projects  # Site-specific env
│   │   ├── .env.acme-corp      # Site-specific env
│   │   ├── astro.config.berg-projects.mjs
│   │   └── astro.config.acme-corp.mjs
│   └── wp/                     # WordPress (if using local)
├── packages/
│   ├── scripts/
│   │   └── src/
│   │       └── site-manager.ts # Site management CLI
│   ├── tokens/                 # Shared design tokens
│   └── ui/                     # Shared UI components
└── .active-site                # Currently active site
```

### How It Works

1. **Site Configurations**: Each site has a JSON config file in `sites/<site-id>/`
2. **Shared Astro App**: One Astro app serves all sites with site-specific configs
3. **Environment Management**: Each site gets its own `.env` file
4. **Active Site**: One site is "active" at a time for development
5. **Concurrent Builds**: Different sites can be built independently

---

## 🚀 Quick Start

### List Available Sites

```bash
pnpm site:list
```

### Create a New Site

```bash
# Create a new site from template
pnpm site:create my-new-site

# This creates: sites/my-new-site/site.config.json
```

### Edit Site Configuration

Edit `sites/my-new-site/site.config.json`:

```json
{
  "name": "My New Site",
  "id": "my-new-site",
  "description": "Description of the site",
  "domain": {
    "production": "https://mynewsite.com"
  },
  "wordpress": {
    "url": "https://mynewsite.com",
    "restApi": "https://mynewsite.com/wp-json/wp/v2"
  },
  "astro": {
    "port": 4323,
    "output": "static",
    "adapter": "cloudflare"
  }
}
```

### Activate a Site

```bash
# Switch to a site for development
pnpm site:use my-new-site

# This generates:
# - apps/astro/.env.my-new-site
# - apps/astro/astro.config.my-new-site.mjs
# - apps/astro/.env (symlink to active site)
```

### Start Development

```bash
# Start dev server for active site
pnpm site:dev

# Or specify a site directly
pnpm site:dev my-new-site
```

### Build for Production

```bash
# Build active site
pnpm site:build

# Or specify a site
pnpm site:build my-new-site
```

---

## 📋 CLI Commands

### Site Management

| Command | Description | Example |
|---------|-------------|---------|
| `pnpm site:list` | List all sites | `pnpm site:list` |
| `pnpm site:info [site-id]` | Show site details | `pnpm site:info berg-projects` |
| `pnpm site:create <site-id>` | Create new site | `pnpm site:create acme-corp` |
| `pnpm site:use <site-id>` | Switch active site | `pnpm site:use berg-projects` |
| `pnpm site:dev [site-id]` | Start dev server | `pnpm site:dev` |
| `pnpm site:build [site-id]` | Build for production | `pnpm site:build` |
| `pnpm site:active` | Show active site | `pnpm site:active` |

### Aliases

```bash
# Create
pnpm site create my-site
pnpm site new my-site

# Use
pnpm site use my-site
pnpm site switch my-site
pnpm site activate my-site

# List
pnpm site list
pnpm site ls

# Dev
pnpm site dev
pnpm site start

# Active
pnpm site active
pnpm site current
```

---

## 🔧 Site Configuration

### Configuration File Structure

Each site has a `site.config.json` file with the following structure:

```json
{
  "$schema": "../site-config.schema.json",
  "name": "Site Name",
  "id": "site-id",
  "description": "Site description",
  "domain": {
    "production": "https://example.com",
    "staging": "https://staging.example.com",
    "preview": "https://preview.example.com"
  },
  "wordpress": {
    "url": "https://example.com",
    "restApi": "https://example.com/wp-json/wp/v2",
    "graphql": "https://example.com/graphql",
    "local": {
      "enabled": true,
      "url": "https://reactorjet.ddev.site",
      "adminUser": "admin",
      "adminPassword": "admin"
    }
  },
  "astro": {
    "port": 4321,
    "output": "static",
    "adapter": "cloudflare",
    "srcDir": "src"
  },
  "deployment": {
    "platform": "cloudflare-pages",
    "projectId": "my-project",
    "branch": {
      "production": "main",
      "preview": "dev/*"
    },
    "buildCommand": "pnpm site:build site-id",
    "outputDir": "dist"
  },
  "seo": {
    "title": "Site Title",
    "description": "Site description for SEO",
    "locale": "en-US",
    "twitter": "@handle"
  },
  "features": {
    "blog": true,
    "ecommerce": false,
    "multilingual": false,
    "search": false,
    "comments": false
  },
  "contact": {
    "email": "contact@example.com",
    "phone": "+1 234 567 8900",
    "address": "City, State, Country",
    "socialMedia": {
      "facebook": "https://facebook.com/handle",
      "linkedin": "https://linkedin.com/company/handle"
    }
  },
  "analytics": {
    "googleAnalytics": "G-XXXXXXXXXX",
    "googleTagManager": "GTM-XXXXXXX"
  },
  "theme": {
    "primaryColor": "#3b82f6",
    "fontFamily": "system-ui, sans-serif",
    "logo": "/assets/logo.svg"
  },
  "env": {
    "CUSTOM_VAR": "value"
  },
  "status": "active"
}
```

### Configuration Properties

#### Required Properties

- **name**: Human-readable site name
- **id**: Unique site identifier (lowercase, hyphens only)
- **domain.production**: Production URL
- **wordpress.url**: WordPress backend URL
- **astro.port**: Development server port (must be unique)
- **astro.output**: Output mode (static/server/hybrid)
- **astro.adapter**: Deployment adapter

#### Optional Properties

- **description**: Site description
- **domain.staging**: Staging environment URL
- **domain.preview**: Preview environment URL
- **wordpress.restApi**: Custom REST API endpoint
- **wordpress.graphql**: GraphQL endpoint
- **wordpress.local**: Local WordPress settings
- **deployment**: Deployment configuration
- **seo**: SEO metadata
- **features**: Feature flags
- **contact**: Contact information
- **analytics**: Analytics tracking IDs
- **theme**: Theming options
- **env**: Custom environment variables
- **status**: Site status (active/development/staging/archived)

---

## 🔄 Workflows

### Workflow 1: Creating a New Client Site

```bash
# 1. Create the site
pnpm site:create acme-corp

# 2. Edit configuration
vim sites/acme-corp/site.config.json

# 3. Set unique port and WordPress URL
{
  "name": "ACME Corporation",
  "id": "acme-corp",
  "domain": {
    "production": "https://acmecorp.com"
  },
  "wordpress": {
    "url": "https://acmecorp.com"
  },
  "astro": {
    "port": 4324  // Unique port
  }
}

# 4. Activate the site
pnpm site:use acme-corp

# 5. Start development
pnpm site:dev

# 6. Build for production
pnpm site:build
```

### Workflow 2: Working on Multiple Sites Concurrently

```bash
# Terminal 1: Work on Berg Projects
pnpm site:use berg-projects
pnpm site:dev
# Running on http://localhost:4322

# Terminal 2: Work on ACME Corp
pnpm site:use acme-corp
pnpm site:dev
# Running on http://localhost:4324

# Both sites run simultaneously on different ports!
```

### Workflow 3: Building All Sites for Production

```bash
# Build all sites
for site in $(ls sites | grep -v _template); do
  pnpm site:build $site
done
```

### Workflow 4: Switching Between Sites

```bash
# Check current site
pnpm site:active

# List all sites
pnpm site:list

# Switch to another site
pnpm site:use other-site

# View site details
pnpm site:info other-site

# Start working
pnpm site:dev
```

---

## 🎨 Sharing Components & Styles

### Using Shared UI Components

All sites can use components from `packages/ui`:

```astro
---
// apps/astro/src/pages/index.astro
import { Button } from '@repo/ui';
---

<Button>Shared Component</Button>
```

### Using Design Tokens

All sites share design tokens from `packages/tokens`:

```css
/* Automatically available via Tailwind */
.custom-class {
  color: var(--color-primary-600);
}
```

### Site-Specific Overrides

Each site can override tokens in their config:

```json
{
  "theme": {
    "primaryColor": "#1d4ed8"
  }
}
```

---

## 🌍 Environment Variables

### Generated Environment Files

When you activate a site with `pnpm site:use <site-id>`, it generates:

**apps/astro/.env.{site-id}**
```env
SITE_ID=site-id
SITE_NAME=Site Name
SITE_URL=https://example.com
WP_URL=https://example.com
WP_REST_API=https://example.com/wp-json/wp/v2
WP_GRAPHQL=https://example.com/graphql
ASTRO_PORT=4321
# ... custom env vars from config
```

### Using in Astro

```typescript
// Access environment variables
const siteId = import.meta.env.SITE_ID;
const wpUrl = import.meta.env.WP_URL;
```

### Secrets Management

**DO NOT** commit secrets to `site.config.json`!

For secrets, use:
1. `.env.local` files (gitignored)
2. Deployment platform secrets (Cloudflare, Vercel, etc.)
3. Environment variable injection in CI/CD

---

## 🚢 Deployment

### Cloudflare Pages

**Per-Site Deployment:**

1. Create a Cloudflare Pages project per site
2. Configure build settings:
   ```
   Build command: pnpm site:build site-id
   Build output: apps/astro/dist
   Root directory: /
   ```

3. Add environment variables in Cloudflare dashboard:
   ```
   SITE_ID=site-id
   ```

4. Deploy!

### GitHub Actions (Multi-Site)

Create workflows per site:

```yaml
# .github/workflows/deploy-berg-projects.yml
name: Deploy Berg Projects

on:
  push:
    branches: [main]
    paths:
      - 'apps/astro/**'
      - 'sites/berg-projects/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Build site
        run: pnpm site:build berg-projects
      
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: berg-projects
          directory: apps/astro/dist
```

### Deployment Checklist

- [ ] Create deployment project (Cloudflare/Vercel/Netlify)
- [ ] Configure build command: `pnpm site:build site-id`
- [ ] Set output directory: `apps/astro/dist`
- [ ] Add environment variables
- [ ] Configure custom domain
- [ ] Set up SSL certificate
- [ ] Test deployment
- [ ] Update site.config.json with production URL

---

## 📊 Example Sites

### Berg Projects (Reference Implementation)

```json
{
  "name": "Berg Projects",
  "id": "berg-projects",
  "domain": {
    "production": "https://bergprojects.co.za"
  },
  "wordpress": {
    "url": "https://bergprojects.co.za"
  },
  "astro": {
    "port": 4322,
    "output": "static",
    "adapter": "cloudflare"
  },
  "status": "active"
}
```

**Features:**
- 5 pages (Home, About, Services, Projects, Contact)
- WordPress REST API integration
- Cloudflare Pages deployment
- Custom design system

### Creating Similar Sites

Use Berg Projects as a template for construction/business sites:

```bash
# Create new site
pnpm site:create new-construction-co

# Copy pages from Berg Projects
cp -r apps/astro/src/pages/* apps/astro/src/pages-new/

# Update site config
# Update content
# Deploy!
```

---

## 🔍 Troubleshooting

### Site Not Found

```bash
❌ Site not found: my-site

# Solution: Check if site exists
pnpm site:list

# Or create it
pnpm site:create my-site
```

### Port Already in Use

```bash
# Error: Port 4321 is already in use

# Solution: Change port in site.config.json
{
  "astro": {
    "port": 4325  // Use different port
  }
}
```

### Environment Variables Not Loading

```bash
# Solution: Re-activate the site
pnpm site:use site-id

# This regenerates .env files
```

### Build Fails

```bash
# Check active site
pnpm site:active

# Ensure you're building the right site
pnpm site:use correct-site
pnpm site:build
```

### WordPress API Connection Issues

```bash
# Check WordPress URL in config
pnpm site:info

# Test API endpoint
curl https://example.com/wp-json/wp/v2/posts

# Verify CORS settings in WordPress
```

---

## 🎯 Best Practices

### 1. Unique Ports

Assign unique ports to each site to run them concurrently:

```json
{
  "berg-projects": { "port": 4322 },
  "acme-corp": { "port": 4323 },
  "xyz-company": { "port": 4324 }
}
```

### 2. Consistent Naming

Use lowercase with hyphens for site IDs:
- ✅ `my-company`, `berg-projects`, `acme-corp`
- ❌ `MyCompany`, `Berg_Projects`, `AcmeCorp`

### 3. Separate WordPress Instances

Each site should have its own WordPress backend:
- Different domains
- Different databases
- Independent content

### 4. Environment Management

- Keep secrets out of `site.config.json`
- Use `.env.local` for local secrets
- Use platform secrets for production

### 5. Shared Components

- Create reusable components in `packages/ui`
- Use design tokens for consistency
- Override per site when needed

### 6. Documentation

Document each site in:
- `sites/<site-id>/README.md`
- Deployment notes
- Custom configurations
- Client contacts

### 7. Version Control

Commit structure:
```
git add sites/new-site/
git commit -m "feat(sites): add new-site configuration"
```

### 8. Testing

Test each site independently:
```bash
pnpm site:use site-id
pnpm site:dev
# Manual testing
pnpm site:build
# Test build output
```

---

## 🧪 Advanced Usage

### Custom Build Scripts

Add site-specific build scripts:

```json
// package.json
{
  "scripts": {
    "build:berg": "pnpm site:build berg-projects",
    "build:acme": "pnpm site:build acme-corp",
    "build:all": "pnpm site:build berg-projects && pnpm site:build acme-corp"
  }
}
```

### Site-Specific Pages

Organize pages per site:

```
apps/astro/src/
├── pages/              # Shared pages
├── pages-berg/         # Berg Projects specific
└── pages-acme/         # ACME Corp specific
```

### Conditional Features

Use environment variables for feature flags:

```astro
---
const siteId = import.meta.env.SITE_ID;
const showBlog = siteId === 'berg-projects';
---

{showBlog && <BlogSection />}
```

### Automated Deployments

Set up branch-based deployments:

```
main → berg-projects production
staging-berg → berg-projects staging
main → acme-corp production
staging-acme → acme-corp staging
```

---

## 📚 Additional Resources

### Files to Reference

- `sites/site-config.schema.json` - Configuration schema
- `sites/_template/site.config.json` - Template configuration
- `packages/scripts/src/site-manager.ts` - Site manager source
- `BERG_PROJECTS_README.md` - Berg Projects documentation

### Related Documentation

- [Astro Documentation](https://docs.astro.build)
- [WordPress REST API](https://developer.wordpress.org/rest-api/)
- [Cloudflare Pages](https://pages.cloudflare.com)
- [ReactorBro Stack README](./README.md)

---

## 🤝 Support

### Getting Help

```bash
# Show all commands
pnpm site

# Show site info
pnpm site:info

# List all sites
pnpm site:list
```

### Common Questions

**Q: Can I run multiple sites at once?**
A: Yes! Use unique ports and run in separate terminals.

**Q: Do sites share the same WordPress?**
A: No, each site should have its own WordPress instance.

**Q: Can sites share components?**
A: Yes! Use `packages/ui` for shared components.

**Q: How do I deploy multiple sites?**
A: Create separate deployment projects per site.

**Q: Can I have different Astro versions per site?**
A: Currently no, all sites share the same Astro version.

---

## 📝 Changelog

### v1.0.0 (2024-11-03)
- Initial multi-site management system
- Site configuration schema
- CLI tool for site management
- Berg Projects as reference implementation
- Documentation and examples

---

## 🎉 Summary

The ReactorBro Stack multi-site management system allows you to:

✅ Manage multiple websites in one monorepo
✅ Share components and packages across sites
✅ Work on sites concurrently
✅ Deploy sites independently
✅ Configure each site uniquely
✅ Scale efficiently as you add more clients

**Get Started:**
```bash
pnpm site:list          # See available sites
pnpm site:create my-site # Create new site
pnpm site:use my-site    # Activate site
pnpm site:dev           # Start developing!
```

---

**Built with ❤️ using ReactorBro Stack**
**Managing Multiple Sites Like a Pro! 🚀**