# Multi-Site Management System - Documentation Index

**ReactorBro Stack - Your Guide to Managing Multiple Websites**

---

## 🎯 Start Here

### New to the System?
👉 **[Quick Reference](./MULTI_SITE_QUICK_REF.md)** (5 min read)  
Get started with essential commands and a 5-step workflow.

### Want the Complete Guide?
👉 **[Multi-Site Management Guide](./MULTI_SITE_GUIDE.md)** (30 min read)  
Comprehensive guide with workflows, examples, and best practices.

### Just Installed?
👉 **[Setup Complete Summary](./MULTI_SITE_SETUP_COMPLETE.md)** (15 min read)  
Review what was installed and how to test the system.

---

## 📚 Documentation Map

### Quick Access

| Document | Purpose | Time | Level |
|----------|---------|------|-------|
| [Quick Reference](./MULTI_SITE_QUICK_REF.md) | Essential commands & cheat sheet | 5 min | Beginner |
| [Complete Guide](./MULTI_SITE_GUIDE.md) | Full documentation with examples | 30 min | All levels |
| [Setup Summary](./MULTI_SITE_SETUP_COMPLETE.md) | Installation verification | 15 min | Beginner |
| [Implementation](./MULTI_SITE_IMPLEMENTATION.md) | Technical implementation details | 20 min | Advanced |
| [Architecture](./docs/MULTI_SITE_ARCHITECTURE.md) | Visual diagrams & structure | 20 min | Intermediate |
| [Sites Config](./sites/README.md) | Configuration reference | 15 min | Intermediate |

---

## 🚀 Quick Start Paths

### Path 1: "I want to create my first site"
```bash
# 1. Read the quick reference
→ MULTI_SITE_QUICK_REF.md (5 min)

# 2. Try these commands
pnpm site:list
pnpm site:create my-first-site

# 3. Follow the prompts
→ Edit sites/my-first-site/site.config.json
→ pnpm site:use my-first-site
→ pnpm site:dev
```

### Path 2: "I want to understand the system"
```bash
# 1. Overview
→ MULTI_SITE_SETUP_COMPLETE.md (15 min)

# 2. Architecture
→ docs/MULTI_SITE_ARCHITECTURE.md (20 min)

# 3. Complete guide
→ MULTI_SITE_GUIDE.md (30 min)
```

### Path 3: "I want to see an example"
```bash
# 1. View Berg Projects config
pnpm site:info berg-projects

# 2. Read the docs
→ BERG_PROJECTS_README.md

# 3. Study the config file
→ sites/berg-projects/site.config.json
```

### Path 4: "I want to deploy sites"
```bash
# 1. Deployment workflows
→ .github/workflows-examples/README.md

# 2. Platform setup
→ MULTI_SITE_GUIDE.md (Deployment section)

# 3. CI/CD configuration
→ .github/workflows-examples/deploy-multi-site.yml
```

---

## 📖 By Topic

### Configuration
- **[Sites Directory README](./sites/README.md)** - Configuration documentation
- **[JSON Schema](./sites/site-config.schema.json)** - Configuration validation
- **[Template](./sites/_template/site.config.json)** - Base configuration
- **[Berg Projects](./sites/berg-projects/site.config.json)** - Example configuration

### Commands & CLI
- **[Quick Reference](./MULTI_SITE_QUICK_REF.md)** - All commands with examples
- **[Complete Guide](./MULTI_SITE_GUIDE.md)** - Detailed command usage
- **[Source Code](./packages/scripts/src/site-manager.ts)** - CLI implementation

### Architecture & Design
- **[Architecture Diagrams](./docs/MULTI_SITE_ARCHITECTURE.md)** - Visual documentation
- **[Implementation Details](./MULTI_SITE_IMPLEMENTATION.md)** - Technical overview
- **[Main README](./README.md)** - System overview

### Deployment
- **[Workflow Examples](../.github/workflows-examples/)** - CI/CD templates
- **[Deployment Guide](../.github/workflows-examples/README.md)** - Platform setup
- **[Multi-Site Guide](./MULTI_SITE_GUIDE.md)** - Deployment section

### Examples
- **[Berg Projects](./BERG_PROJECTS_README.md)** - Complete reference site
- **[Template Site](./sites/_template/)** - New site template
- **[Workflow Example](../.github/workflows-examples/deploy-multi-site.yml)** - CI/CD example

---

## 🎓 Learning Paths

### Beginner (Total: 25 min)
1. Read **[Quick Reference](./MULTI_SITE_QUICK_REF.md)** (5 min)
2. Run `pnpm site:list` and `pnpm site:info berg-projects`
3. Read **[Setup Summary](./MULTI_SITE_SETUP_COMPLETE.md)** (15 min)
4. Create a test site: `pnpm site:create test`
5. Try development: `pnpm site:dev test`

### Intermediate (Total: 60 min)
1. Complete Beginner path (25 min)
2. Read **[Complete Guide](./MULTI_SITE_GUIDE.md)** (30 min)
3. Study **[Sites Config](./sites/README.md)** (15 min)
4. Create a real site with full configuration
5. Set up local development workflow

### Advanced (Total: 90 min)
1. Complete Intermediate path (60 min)
2. Read **[Architecture](./docs/MULTI_SITE_ARCHITECTURE.md)** (20 min)
3. Review **[Implementation](./MULTI_SITE_IMPLEMENTATION.md)** (20 min)
4. Study **[CLI Source](./packages/scripts/src/site-manager.ts)** (30 min)
5. Set up CI/CD pipeline
6. Customize workflows for your needs

---

## 🔍 Find What You Need

### "How do I...?"

#### Create a new site
→ [Quick Reference](./MULTI_SITE_QUICK_REF.md#create--launch-new-site-5-steps)

#### Configure a site
→ [Sites README](./sites/README.md#configuration-file)

#### Deploy a site
→ [Deployment Guide](.github/workflows-examples/README.md)

#### Work on multiple sites
→ [Complete Guide](./MULTI_SITE_GUIDE.md#workflow-2-working-on-multiple-sites-concurrently)

#### Share components
→ [Complete Guide](./MULTI_SITE_GUIDE.md#sharing-components--styles)

#### Troubleshoot issues
→ [Complete Guide](./MULTI_SITE_GUIDE.md#troubleshooting)

---

## 📋 Command Reference

```bash
# Core Commands
pnpm site:list              # List all sites
pnpm site:create <id>       # Create new site
pnpm site:use <id>          # Switch to site
pnpm site:dev [id]          # Start dev server
pnpm site:build [id]        # Build for production
pnpm site:info [id]         # Show site details
pnpm site:active            # Show active site

# Get Help
pnpm site                   # Show all commands
```

Full command reference: [Quick Reference](./MULTI_SITE_QUICK_REF.md)

---

## 🗂️ File Structure

```
reactorbro-stack/
│
├── 📚 Documentation
│   ├── MULTI_SITE_INDEX.md              ← You are here
│   ├── MULTI_SITE_QUICK_REF.md          ← Quick reference
│   ├── MULTI_SITE_GUIDE.md              ← Complete guide
│   ├── MULTI_SITE_SETUP_COMPLETE.md     ← Setup summary
│   ├── MULTI_SITE_IMPLEMENTATION.md     ← Implementation
│   └── docs/MULTI_SITE_ARCHITECTURE.md  ← Architecture
│
├── 🌐 Site Configurations
│   └── sites/
│       ├── README.md                    ← Config docs
│       ├── site-config.schema.json      ← JSON schema
│       ├── _template/                   ← New site template
│       └── berg-projects/               ← Example site
│
├── 🛠️ CLI Tool
│   └── packages/scripts/src/
│       └── site-manager.ts              ← CLI implementation
│
└── 🚀 Deployment
    └── .github/workflows-examples/
        ├── README.md                    ← Deployment guide
        └── deploy-multi-site.yml        ← Example workflow
```

---

## ✅ Checklists

### Creating Your First Site
- [ ] Read Quick Reference
- [ ] Run `pnpm site:list`
- [ ] Create site: `pnpm site:create my-site`
- [ ] Edit configuration file
- [ ] Activate: `pnpm site:use my-site`
- [ ] Start dev: `pnpm site:dev`
- [ ] Build: `pnpm site:build`
- [ ] Deploy

### Going to Production
- [ ] Site configuration complete
- [ ] WordPress backend connected
- [ ] Local testing successful
- [ ] Build verified: `pnpm site:build`
- [ ] Deployment platform configured
- [ ] Environment variables set
- [ ] CI/CD pipeline set up
- [ ] Domain and SSL configured
- [ ] Production deployment tested
- [ ] Monitoring and analytics active

---

## 🎯 Common Tasks

### Switch Between Sites
```bash
pnpm site:list              # See all sites
pnpm site:use site-id       # Switch to site
pnpm site:active            # Verify active site
```
→ [Complete Guide](./MULTI_SITE_GUIDE.md#workflow-4-switching-between-sites)

### Run Multiple Sites
```bash
# Terminal 1
pnpm site:use site-1 && pnpm site:dev

# Terminal 2
pnpm site:use site-2 && pnpm site:dev
```
→ [Complete Guide](./MULTI_SITE_GUIDE.md#workflow-2-working-on-multiple-sites-concurrently)

### Deploy All Sites
```bash
for site in $(ls sites | grep -v _template); do
  pnpm site:build $site
done
```
→ [Complete Guide](./MULTI_SITE_GUIDE.md#workflow-3-building-all-sites-for-production)

---

## 💡 Tips

### For Efficiency
1. Use aliases: `pnpm site ls` = `pnpm site:list`
2. Tab completion works for site IDs
3. Omit site ID to use active site
4. Check status with `pnpm site:active`

### For Organization
1. Use consistent naming: `company-name` not `CompanyName`
2. Assign sequential ports: 4322, 4323, 4324...
3. Document custom configs in site README
4. Keep site configs in version control

### For Teams
1. Share documentation with team members
2. Define site creation standards
3. Set up code review process
4. Use PR previews for changes
5. Automate deployments with CI/CD

---

## 🆘 Getting Help

### Documentation Issues?
- Check the [Quick Reference](./MULTI_SITE_QUICK_REF.md) for commands
- Search the [Complete Guide](./MULTI_SITE_GUIDE.md) for workflows
- Review [Troubleshooting](./MULTI_SITE_GUIDE.md#troubleshooting) section

### Configuration Issues?
- Read [Sites README](./sites/README.md)
- Validate against [JSON Schema](./sites/site-config.schema.json)
- Check [Berg Projects example](./sites/berg-projects/site.config.json)

### Deployment Issues?
- Review [Workflow Examples](.github/workflows-examples/)
- Check [Deployment Guide](.github/workflows-examples/README.md)
- Verify platform configuration

---

## 📊 Documentation Stats

- **Total Documentation:** 2,600+ lines
- **Number of Documents:** 6 main documents
- **Code Examples:** 50+ examples
- **Command Reference:** 8 CLI commands
- **Total Files Created:** 15+ files
- **Implementation Time:** Complete and tested

---

## 🎉 Ready to Start?

### Quick Start (5 minutes)
```bash
# 1. See what's available
pnpm site:list

# 2. View the example
pnpm site:info berg-projects

# 3. Create your first site
pnpm site:create my-awesome-site

# 4. Start building!
pnpm site:use my-awesome-site
pnpm site:dev
```

### Next Steps
1. ✅ Read [Quick Reference](./MULTI_SITE_QUICK_REF.md)
2. ✅ Create your first site
3. ✅ Explore the [Complete Guide](./MULTI_SITE_GUIDE.md)
4. ✅ Set up deployment
5. ✅ Share with your team

---

## 📞 Quick Links

| Resource | Link |
|----------|------|
| Quick Start | [MULTI_SITE_QUICK_REF.md](./MULTI_SITE_QUICK_REF.md) |
| Complete Guide | [MULTI_SITE_GUIDE.md](./MULTI_SITE_GUIDE.md) |
| Configuration | [sites/README.md](./sites/README.md) |
| Architecture | [docs/MULTI_SITE_ARCHITECTURE.md](./docs/MULTI_SITE_ARCHITECTURE.md) |
| Examples | [Berg Projects](./BERG_PROJECTS_README.md) |
| Deployment | [workflows-examples/README.md](.github/workflows-examples/README.md) |
| Main README | [README.md](./README.md) |

---

**🚀 Multi-Site Management System - ReactorBro Stack**

**Find what you need. Build amazing sites. Deploy with confidence.**

---

*Last Updated: November 3, 2024*  
*Version: 1.0.0*  
*Status: Production Ready ✅*