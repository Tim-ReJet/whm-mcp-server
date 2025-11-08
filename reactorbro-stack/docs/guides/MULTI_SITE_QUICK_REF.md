# Multi-Site Quick Reference

**ReactorBro Stack - Cheat Sheet for Managing Multiple Sites**

---

## 🚀 Essential Commands

| Command | Description |
|---------|-------------|
| `pnpm site:list` | List all sites |
| `pnpm site:create <id>` | Create new site |
| `pnpm site:use <id>` | Switch to a site |
| `pnpm site:dev [id]` | Start dev server |
| `pnpm site:build [id]` | Build for production |
| `pnpm site:info [id]` | Show site details |
| `pnpm site:active` | Show active site |

---

## 📋 Quick Workflow

### Create & Launch New Site (5 steps)

```bash
# 1. Create site
pnpm site:create acme-corp

# 2. Edit config
vim sites/acme-corp/site.config.json

# 3. Update key fields
# - name: "ACME Corporation"
# - domain.production: "https://acmecorp.com"
# - wordpress.url: "https://acmecorp.com"
# - astro.port: 4324 (unique!)

# 4. Activate
pnpm site:use acme-corp

# 5. Start developing
pnpm site:dev
```

---

## 🔧 Configuration Essentials

### Minimum Required Config

```json
{
  "name": "Site Name",
  "id": "site-id",
  "domain": {
    "production": "https://example.com"
  },
  "wordpress": {
    "url": "https://example.com"
  },
  "astro": {
    "port": 4323,
    "output": "static",
    "adapter": "cloudflare"
  }
}
```

### Port Assignment Guide

- **Berg Projects**: 4322
- **New Site 1**: 4323
- **New Site 2**: 4324
- **New Site 3**: 4325
- etc.

---

## 🌍 Working Concurrently

Run multiple sites at once:

```bash
# Terminal 1
pnpm site:use site-1
pnpm site:dev
# → http://localhost:4322

# Terminal 2
pnpm site:use site-2
pnpm site:dev
# → http://localhost:4323

# Terminal 3
pnpm site:use site-3
pnpm site:dev
# → http://localhost:4324
```

---

## 📁 File Locations

```
reactorbro-stack/
├── sites/
│   └── <site-id>/
│       └── site.config.json       # Site configuration
├── apps/astro/
│   ├── .env.<site-id>             # Generated env file
│   ├── .env                       # Symlink to active site
│   └── astro.config.<site-id>.mjs # Generated config
└── .active-site                   # Currently active site
```

---

## 🎯 Common Tasks

### Check Current Site
```bash
pnpm site:active
```

### Switch Between Sites
```bash
pnpm site:list                    # See all sites
pnpm site:use other-site          # Switch to other-site
pnpm site:dev                     # Start dev server
```

### Build All Sites
```bash
pnpm site:build berg-projects
pnpm site:build acme-corp
pnpm site:build xyz-company
```

### Get Site Info
```bash
pnpm site:info berg-projects
# Shows: domains, WordPress, ports, deployment, etc.
```

---

## 🚢 Deployment Quick Guide

### Cloudflare Pages Setup

1. **Create Project** in Cloudflare Pages
2. **Build Settings**:
   - Build command: `pnpm site:build site-id`
   - Build output: `apps/astro/dist`
   - Root directory: `/`
3. **Environment Variables**:
   ```
   SITE_ID=site-id
   ```
4. **Deploy!**

---

## 🔍 Troubleshooting

### Port Already in Use
```bash
# Change port in site.config.json
{
  "astro": { "port": 4325 }
}
```

### Site Not Found
```bash
pnpm site:list              # Check available sites
pnpm site:create my-site    # Create if missing
```

### Config Not Loading
```bash
pnpm site:use site-id       # Re-activate site
```

### WordPress API Issues
```bash
pnpm site:info              # Check WordPress URL
curl https://example.com/wp-json/wp/v2/posts
```

---

## ✅ Best Practices

1. ✅ Use unique ports (4321, 4322, 4323...)
2. ✅ Use lowercase-hyphen-case for site IDs
3. ✅ Each site = separate WordPress instance
4. ✅ No secrets in site.config.json
5. ✅ Test before deploying: `pnpm site:build`

---

## 📚 Full Documentation

- **[Multi-Site Management Guide](./MULTI_SITE_GUIDE.md)** - Complete guide
- **[Sites Directory README](./sites/README.md)** - Configuration reference
- **[Berg Projects README](./BERG_PROJECTS_README.md)** - Example site

---

## 🎉 Quick Example

```bash
# Create a construction company site (like Berg Projects)
pnpm site:create abc-construction

# Edit config
cat > sites/abc-construction/site.config.json << 'EOF'
{
  "name": "ABC Construction",
  "id": "abc-construction",
  "domain": { "production": "https://abc-construction.com" },
  "wordpress": { "url": "https://abc-construction.com" },
  "astro": { "port": 4323, "output": "static", "adapter": "cloudflare" },
  "status": "development"
}
EOF

# Activate and start
pnpm site:use abc-construction
pnpm site:dev
```

---

**Need help?** Run: `pnpm site`
