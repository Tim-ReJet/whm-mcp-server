# Multi-Site Management System - Setup Complete ✅

**ReactorBro Stack - Multiple Website Builds Management**

---

## 🎉 What's Been Added

The ReactorBro Stack now has a complete multi-site management system that allows you to work on multiple website builds (like Berg Projects) concurrently within a single monorepo.

---

## 📦 Components Installed

### 1. Site Configuration System

**Location:** `sites/`

```
sites/
├── site-config.schema.json     # JSON schema for validation
├── _template/                  # Template for new sites
│   └── site.config.json
├── berg-projects/              # Berg Projects configuration
│   └── site.config.json
└── README.md                   # Configuration documentation
```

Each site has its own JSON configuration file defining:
- Domain URLs (production, staging, preview)
- WordPress backend connection
- Astro settings (port, output mode, adapter)
- Deployment configuration
- SEO metadata
- Feature flags
- Contact information
- Analytics tracking
- Theme customization
- Environment variables
- Site status

### 2. Site Manager CLI Tool

**Location:** `packages/scripts/src/site-manager.ts`

A comprehensive TypeScript CLI tool for managing sites:
- List all sites with status indicators
- Create new sites from template
- Switch between sites
- Start development servers
- Build sites for production
- View detailed site information
- Generate environment files
- Generate Astro configs

### 3. Package Scripts

**Location:** `package.json`

New commands added:
```json
{
  "site": "Site manager main command",
  "site:list": "List all sites",
  "site:info": "Show site details",
  "site:use": "Switch to a site",
  "site:create": "Create new site",
  "site:dev": "Start dev server",
  "site:build": "Build for production",
  "site:active": "Show active site"
}
```

### 4. Documentation

**Location:** Root directory

- `MULTI_SITE_GUIDE.md` (828 lines) - Complete guide with workflows, examples, and best practices
- `MULTI_SITE_QUICK_REF.md` (236 lines) - Quick reference cheat sheet
- `sites/README.md` (345 lines) - Site configuration documentation

### 5. Deployment Examples

**Location:** `.github/workflows-examples/`

- `deploy-multi-site.yml` - Multi-site GitHub Actions workflow
- `README.md` - Workflow configuration guide

### 6. Updated Files

- `package.json` - Added site management scripts
- `README.md` - Added multi-site section
- `.gitignore` - Added multi-site files to ignore

---

## 🚀 How It Works

### Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                   ReactorBro Stack                      │
│                    (Monorepo Root)                      │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
   ┌────▼────┐       ┌────▼────┐      ┌────▼────┐
   │ Site 1  │       │ Site 2  │      │ Site 3  │
   │ Config  │       │ Config  │      │ Config  │
   └────┬────┘       └────┬────┘      └────┬────┘
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
                ┌─────────▼──────────┐
                │   Shared Astro App │
                │   (apps/astro/)    │
                └─────────┬──────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
   ┌────▼────┐       ┌────▼────┐      ┌────▼────┐
   │Packages │       │Packages │      │Packages │
   │  /ui    │       │ /tokens │      │/scripts │
   └─────────┘       └─────────┘      └─────────┘
```

### Workflow

1. **Create Site**: `pnpm site:create my-site`
   - Creates `sites/my-site/site.config.json`
   - Based on template configuration

2. **Configure**: Edit `sites/my-site/site.config.json`
   - Set domain, WordPress URL, port, etc.
   - Customize features and settings

3. **Activate**: `pnpm site:use my-site`
   - Generates `apps/astro/.env.my-site`
   - Generates `apps/astro/astro.config.my-site.mjs`
   - Creates symlink to active env file
   - Saves active site to `.active-site`

4. **Develop**: `pnpm site:dev`
   - Starts Astro dev server
   - Uses site-specific configuration
   - Runs on configured port

5. **Build**: `pnpm site:build`
   - Builds site for production
   - Uses site-specific settings
   - Outputs to `apps/astro/dist`

6. **Deploy**: Via CI/CD or manual
   - Each site deploys independently
   - Uses platform-specific adapters
   - Configured per site

---

## 📋 Quick Start Guide

### 1. List Available Sites

```bash
pnpm site:list
```

Output:
```
📋 Available Sites:

  [✓] 🟢 Berg Projects (berg-projects)
      Professional construction and project management company website
      https://bergprojects.co.za
      Status: active

🎯 Active site: berg-projects
```

### 2. Create a New Site

```bash
pnpm site:create acme-corp
```

Output:
```
✅ Created new site: acme-corp

📝 Next steps:
   1. Edit the configuration: sites/acme-corp/site.config.json
   2. Activate the site:      pnpm site:use acme-corp
   3. Start development:      pnpm site:dev acme-corp
```

### 3. Configure Your Site

Edit `sites/acme-corp/site.config.json`:

```json
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
    "port": 4323,
    "output": "static",
    "adapter": "cloudflare"
  }
}
```

### 4. Activate and Start

```bash
pnpm site:use acme-corp
pnpm site:dev
```

Visit: `http://localhost:4323`

### 5. Build and Deploy

```bash
pnpm site:build acme-corp
```

Deploy the `apps/astro/dist` directory to your platform.

---

## 🌟 Key Features

### ✅ Concurrent Development

Run multiple sites simultaneously on different ports:

```bash
# Terminal 1
pnpm site:use berg-projects && pnpm site:dev
# → http://localhost:4322

# Terminal 2
pnpm site:use acme-corp && pnpm site:dev
# → http://localhost:4323
```

### ✅ Shared Components

All sites share packages:
- `@repo/ui` - Shared UI components
- `@repo/tokens` - Design token system
- Common Astro app structure

### ✅ Independent Configuration

Each site has unique:
- WordPress backend connection
- Domain URLs
- Port assignments
- Deployment settings
- Environment variables
- Feature flags
- Theme customization

### ✅ Smart Change Detection

GitHub Actions workflow detects changes:
- Deploy only affected sites
- Deploy all if shared packages change
- Manual deployment triggers

### ✅ Environment Management

Automatic generation of:
- `.env.{site-id}` - Site-specific environment
- `astro.config.{site-id}.mjs` - Site-specific Astro config
- `.env` symlink - Points to active site

---

## 📚 Documentation Reference

| Document | Description | Lines |
|----------|-------------|-------|
| `MULTI_SITE_GUIDE.md` | Complete guide with workflows | 828 |
| `MULTI_SITE_QUICK_REF.md` | Quick reference cheat sheet | 236 |
| `sites/README.md` | Configuration documentation | 345 |
| `sites/site-config.schema.json` | JSON schema | 314 |
| `.github/workflows-examples/README.md` | Deployment guide | 312 |

**Total Documentation:** 2,035+ lines

---

## 🎯 Use Cases

### 1. Agency Managing Multiple Clients

```bash
# Client 1
pnpm site:create client1
pnpm site:use client1
pnpm site:dev

# Client 2
pnpm site:create client2
pnpm site:use client2
pnpm site:dev

# Client 3
pnpm site:create client3
pnpm site:use client3
pnpm site:dev
```

### 2. Building Similar Sites

Use Berg Projects as a template:

```bash
# Create new construction company site
pnpm site:create new-construction
# Copy pages and customize
# Update configuration
pnpm site:use new-construction
pnpm site:build
```

### 3. Multi-Brand Company

```bash
# Main brand
pnpm site:create main-brand

# Sub-brand 1
pnpm site:create sub-brand-1

# Sub-brand 2
pnpm site:create sub-brand-2
```

### 4. Testing and Staging

```bash
# Production site
pnpm site:create mysite-prod

# Staging site
pnpm site:create mysite-staging

# Development site
pnpm site:create mysite-dev
```

---

## 🛠️ Available Commands

### Core Commands

```bash
pnpm site                    # Show help
pnpm site:list              # List all sites
pnpm site:create <id>       # Create new site
pnpm site:use <id>          # Switch to site
pnpm site:dev [id]          # Start dev server
pnpm site:build [id]        # Build for production
pnpm site:info [id]         # Show site details
pnpm site:active            # Show active site
```

### Command Aliases

```bash
pnpm site list              # = pnpm site:list
pnpm site ls                # = pnpm site:list
pnpm site create <id>       # = pnpm site:create
pnpm site new <id>          # = pnpm site:create
pnpm site use <id>          # = pnpm site:use
pnpm site switch <id>       # = pnpm site:use
pnpm site activate <id>     # = pnpm site:use
pnpm site dev               # = pnpm site:dev
pnpm site start             # = pnpm site:dev
pnpm site active            # = pnpm site:active
pnpm site current           # = pnpm site:active
```

---

## ⚙️ Configuration Options

### Minimum Required

```json
{
  "name": "Site Name",
  "id": "site-id",
  "domain": { "production": "https://example.com" },
  "wordpress": { "url": "https://example.com" },
  "astro": { "port": 4321, "output": "static", "adapter": "cloudflare" }
}
```

### Full Configuration

See `sites/_template/site.config.json` for all available options including:
- Deployment settings
- SEO metadata
- Feature flags
- Contact information
- Analytics
- Theme customization
- Custom environment variables

---

## 🚢 Deployment Platforms

Supported platforms:
- ✅ Cloudflare Pages
- ✅ Vercel
- ✅ Netlify
- ✅ Node.js servers
- ✅ Static hosting

Each site can use a different platform!

---

## 📊 Current Sites

### Berg Projects (Reference Implementation)

- **ID:** `berg-projects`
- **Status:** Active
- **URL:** https://bergprojects.co.za
- **Port:** 4322
- **Pages:** Home, About, Services, Projects, Contact
- **Features:** Complete production website

See `BERG_PROJECTS_README.md` for details.

---

## ✅ Testing the System

### Test 1: List Sites

```bash
pnpm site:list
```

Expected: Shows Berg Projects and any other configured sites.

### Test 2: View Site Info

```bash
pnpm site:info berg-projects
```

Expected: Shows complete site configuration details.

### Test 3: Create Test Site

```bash
pnpm site:create test-site
```

Expected: Creates `sites/test-site/site.config.json`.

### Test 4: Activate Site

```bash
pnpm site:use test-site
```

Expected: Generates env files and configs.

### Test 5: Development Server

```bash
pnpm site:dev test-site
```

Expected: Starts Astro on configured port.

---

## 🎓 Learning Resources

### Start Here

1. Read `MULTI_SITE_QUICK_REF.md` (5 min)
2. Run `pnpm site:list` to see available sites
3. Run `pnpm site:info berg-projects` to see example
4. Create a test site: `pnpm site:create test`
5. Try development: `pnpm site:dev test`

### Deep Dive

1. Read `MULTI_SITE_GUIDE.md` (20 min)
2. Study `sites/README.md` (10 min)
3. Review `sites/berg-projects/site.config.json`
4. Check deployment examples in `.github/workflows-examples/`

### Advanced

1. Review `packages/scripts/src/site-manager.ts`
2. Customize workflows for your platforms
3. Create shared component library in `packages/ui`
4. Set up multi-site CI/CD pipeline

---

## 🔐 Security Notes

### ⚠️ Important

- **Never commit secrets** to `site.config.json`
- Use `.env.local` for local secrets (gitignored)
- Use platform environment variables for production
- Keep WordPress credentials separate
- Use API tokens with minimal required permissions

### Files in .gitignore

```
.env.*                          # Site environment files
!.env.example                   # Except example file
.active-site                    # Active site tracker
apps/astro/astro.config.*.mjs   # Generated configs
```

---

## 🐛 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Site not found | Run `pnpm site:list` to check, or `pnpm site:create` |
| Port in use | Change port in `site.config.json` |
| Env not loading | Run `pnpm site:use <id>` to regenerate |
| Build fails | Check `pnpm site:active` and try `pnpm site:build` |
| WP API issues | Verify URL in config, test endpoint with curl |

See `MULTI_SITE_GUIDE.md` for detailed troubleshooting.

---

## 📈 Next Steps

### For New Sites

1. ✅ Create site configuration
2. ✅ Connect to WordPress backend
3. ✅ Develop pages in Astro
4. ✅ Test locally
5. ✅ Build for production
6. ✅ Set up deployment platform
7. ✅ Configure CI/CD
8. ✅ Deploy to production

### For Existing Berg Projects Site

1. ✅ Already configured
2. ✅ Use as reference for new sites
3. ✅ Copy and customize for similar projects
4. ✅ Share components via `packages/ui`

---

## 🎉 Summary

You now have a complete multi-site management system that allows you to:

✅ **Manage** multiple websites in one monorepo
✅ **Share** components and packages across sites
✅ **Work** on sites concurrently
✅ **Deploy** sites independently
✅ **Configure** each site uniquely
✅ **Scale** efficiently as you add clients

### Quick Reference Card

```bash
# Essential Commands
pnpm site:list              # List sites
pnpm site:create <id>       # Create site
pnpm site:use <id>          # Switch site
pnpm site:dev               # Start dev
pnpm site:build             # Build site

# Documentation
MULTI_SITE_GUIDE.md         # Complete guide
MULTI_SITE_QUICK_REF.md     # Quick reference
sites/README.md             # Configuration
```

---

## 🚀 Get Started Now!

```bash
# 1. Check what's available
pnpm site:list

# 2. View the example site
pnpm site:info berg-projects

# 3. Create your first site
pnpm site:create my-awesome-site

# 4. Start building!
pnpm site:use my-awesome-site
pnpm site:dev
```

---

**🎊 Multi-Site Management System: Installation Complete!**

**Built with ❤️ for the ReactorBro Stack**

**Ready to manage multiple sites like a pro! 🚀**

---

*Setup Date: November 3, 2024*
*System Version: 1.0.0*
*Status: Production Ready ✅*