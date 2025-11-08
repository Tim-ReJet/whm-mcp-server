# 🌐 Multi-Site Management System

**Manage Multiple Websites in One Monorepo - ReactorBro Stack**

---

## ⚡ Quick Start

```bash
# List all sites
pnpm site:list

# Create a new site
pnpm site:create my-site

# Switch to site
pnpm site:use my-site

# Start development
pnpm site:dev

# Build for production
pnpm site:build
```

---

## 📚 Documentation

| Guide | Purpose | Time |
|-------|---------|------|
| **[Quick Reference](./MULTI_SITE_QUICK_REF.md)** | Essential commands | 5 min |
| **[Complete Guide](./MULTI_SITE_GUIDE.md)** | Full documentation | 30 min |
| **[Index](./MULTI_SITE_INDEX.md)** | Navigation guide | - |

---

## 🏗️ What You Get

✅ Manage unlimited websites in one repo  
✅ Share components across all sites  
✅ Work on sites concurrently  
✅ Deploy independently  
✅ Configure uniquely  
✅ Scale efficiently  

---

## 🎯 Example

```bash
# Create a site
pnpm site:create acme-corp

# Configure (edit sites/acme-corp/site.config.json)
{
  "name": "ACME Corporation",
  "domain": { "production": "https://acmecorp.com" },
  "wordpress": { "url": "https://acmecorp.com" },
  "astro": { "port": 4323 }
}

# Develop
pnpm site:use acme-corp
pnpm site:dev
# → http://localhost:4323

# Deploy
pnpm site:build
```

---

## 📋 Commands

```bash
pnpm site:list              # List all sites
pnpm site:create <id>       # Create new site
pnpm site:use <id>          # Switch to site
pnpm site:dev [id]          # Start dev server
pnpm site:build [id]        # Build for production
pnpm site:info [id]         # Show site details
pnpm site:active            # Show active site
pnpm site                   # Show help
```

---

## 🌟 Reference Site

**Berg Projects** - Complete production website
- URL: https://bergprojects.co.za
- Config: `sites/berg-projects/site.config.json`
- Docs: [BERG_PROJECTS_README.md](./BERG_PROJECTS_README.md)

View details: `pnpm site:info berg-projects`

---

## 🚀 Get Started Now

1. **Read**: [Quick Reference](./MULTI_SITE_QUICK_REF.md) (5 min)
2. **List**: `pnpm site:list`
3. **Create**: `pnpm site:create my-first-site`
4. **Build**: Start developing!

---

**Built with ❤️ for ReactorBro Stack**
