# Sites Directory

This directory contains configuration files for all websites managed by the ReactorBro Stack.

## 📁 Structure

```
sites/
├── README.md                   # This file
├── site-config.schema.json     # JSON schema for validation
├── _template/                  # Template for new sites
│   └── site.config.json
├── berg-projects/              # Berg Projects site
│   └── site.config.json
└── [other-sites]/              # Additional sites
    └── site.config.json
```

## 🚀 Quick Start

### Create a New Site

```bash
pnpm site:create my-new-site
```

This creates a new directory with a configuration file based on the template.

### Edit Site Configuration

Edit `sites/my-new-site/site.config.json`:

```json
{
  "name": "My New Site",
  "id": "my-new-site",
  "domain": {
    "production": "https://mynewsite.com"
  },
  "wordpress": {
    "url": "https://mynewsite.com"
  },
  "astro": {
    "port": 4323
  }
}
```

### Activate and Use

```bash
pnpm site:use my-new-site
pnpm site:dev
```

## 📋 Configuration File

Each site directory contains a `site.config.json` file that defines:

- **Basic Info**: Name, ID, description
- **Domains**: Production, staging, preview URLs
- **WordPress**: Backend URL, API endpoints, local settings
- **Astro**: Port, output mode, adapter
- **Deployment**: Platform, project ID, build commands
- **SEO**: Title, description, locale
- **Features**: Enabled features (blog, ecommerce, etc.)
- **Contact**: Email, phone, social media
- **Analytics**: Tracking IDs (GA, GTM, etc.)
- **Theme**: Colors, fonts, logo
- **Environment**: Custom environment variables
- **Status**: active, development, staging, archived

## 🔧 Configuration Schema

All configuration files follow the JSON schema defined in `site-config.schema.json`.

### Required Fields

- `name` - Human-readable site name
- `id` - Unique site identifier (lowercase, hyphens)
- `domain.production` - Production URL
- `wordpress.url` - WordPress backend URL
- `astro.port` - Development server port (must be unique)
- `astro.output` - Output mode (static/server/hybrid)
- `astro.adapter` - Deployment adapter

### Optional Fields

- All other fields are optional but recommended for production sites

## 🎯 Best Practices

### 1. Unique Site IDs

Use lowercase with hyphens:
- ✅ `my-company`, `berg-projects`, `acme-corp`
- ❌ `MyCompany`, `Berg_Projects`, `AcmeCorp`

### 2. Unique Ports

Each site needs a unique port for concurrent development:

```json
{
  "astro": {
    "port": 4322  // Must be different from other sites
  }
}
```

Suggested port assignments:
- Berg Projects: `4322`
- New sites: `4323`, `4324`, `4325`, etc.

### 3. WordPress URLs

Each site should have its own WordPress instance:

```json
{
  "wordpress": {
    "url": "https://mynewsite.com",
    "restApi": "https://mynewsite.com/wp-json/wp/v2"
  }
}
```

### 4. No Secrets in Config

Never commit secrets to configuration files!

❌ Don't do this:
```json
{
  "env": {
    "API_KEY": "secret_key_12345",
    "PASSWORD": "my_password"
  }
}
```

✅ Instead use:
- `.env.local` files (gitignored)
- Deployment platform environment variables
- CI/CD secrets

### 5. Status Field

Use the status field to track site lifecycle:

- `development` - Site in development
- `staging` - Site in staging environment
- `active` - Site live in production
- `archived` - Site no longer maintained

## 📚 Examples

### Example 1: Simple Static Site

```json
{
  "name": "Simple Blog",
  "id": "simple-blog",
  "domain": {
    "production": "https://simpleblog.com"
  },
  "wordpress": {
    "url": "https://simpleblog.com"
  },
  "astro": {
    "port": 4323,
    "output": "static",
    "adapter": "cloudflare"
  },
  "features": {
    "blog": true,
    "ecommerce": false
  },
  "status": "active"
}
```

### Example 2: E-commerce Site

```json
{
  "name": "Online Store",
  "id": "online-store",
  "domain": {
    "production": "https://store.com",
    "staging": "https://staging.store.com"
  },
  "wordpress": {
    "url": "https://wp.store.com"
  },
  "astro": {
    "port": 4324,
    "output": "hybrid",
    "adapter": "cloudflare"
  },
  "features": {
    "blog": true,
    "ecommerce": true,
    "search": true
  },
  "analytics": {
    "googleAnalytics": "G-XXXXXXXXXX",
    "googleTagManager": "GTM-XXXXXXX"
  },
  "status": "active"
}
```

### Example 3: Multi-language Site

```json
{
  "name": "Global Company",
  "id": "global-company",
  "domain": {
    "production": "https://globalco.com"
  },
  "wordpress": {
    "url": "https://globalco.com"
  },
  "astro": {
    "port": 4325,
    "output": "static",
    "adapter": "vercel"
  },
  "features": {
    "multilingual": true,
    "blog": true
  },
  "seo": {
    "locale": "en-US",
    "title": "Global Company - International Services"
  },
  "status": "active"
}
```

## 🔍 Validation

Configuration files are validated against the JSON schema. To validate manually:

```bash
# Using a JSON schema validator
ajv validate -s sites/site-config.schema.json -d sites/my-site/site.config.json
```

VS Code provides automatic validation if you include the schema reference:

```json
{
  "$schema": "../site-config.schema.json",
  ...
}
```

## 📖 Reference Sites

### Berg Projects (`berg-projects/`)

Complete reference implementation showcasing:
- Construction company website
- 5 pages (Home, About, Services, Projects, Contact)
- WordPress REST API integration
- Cloudflare Pages deployment
- Custom design system
- Production-ready configuration

Use Berg Projects as a template for similar sites.

## 🔗 Related Documentation

- [Multi-Site Management Guide](../MULTI_SITE_GUIDE.md) - Complete guide
- [Berg Projects README](../BERG_PROJECTS_README.md) - Reference implementation
- [ReactorBro Stack README](../README.md) - Main documentation

## 🛠️ CLI Commands

```bash
# List all sites
pnpm site:list

# Show site details
pnpm site:info berg-projects

# Create new site
pnpm site:create my-new-site

# Switch to a site
pnpm site:use my-new-site

# Start development
pnpm site:dev

# Build for production
pnpm site:build
```

## 📝 Template

The `_template/` directory contains the base configuration for new sites. When you run `pnpm site:create`, it copies this template and customizes it with your site ID.

To modify the default configuration for new sites, edit:
```
sites/_template/site.config.json
```

## ⚠️ Important Notes

1. **Don't rename the `_template` directory** - It's used by the CLI tool
2. **Keep site IDs unique** - They're used as identifiers throughout the system
3. **Assign unique ports** - Required for concurrent development
4. **Validate your config** - Use the JSON schema for validation
5. **Keep secrets separate** - Never commit API keys or passwords

## 🎉 Getting Started

1. Create a new site:
   ```bash
   pnpm site:create my-awesome-site
   ```

2. Edit the configuration:
   ```bash
   vim sites/my-awesome-site/site.config.json
   ```

3. Activate and start developing:
   ```bash
   pnpm site:use my-awesome-site
   pnpm site:dev
   ```

4. Build and deploy:
   ```bash
   pnpm site:build
   ```

---

**Need help?** Run `pnpm site` to see all available commands.