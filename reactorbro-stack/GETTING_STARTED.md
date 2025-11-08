# 🚀 Getting Started
**ReactorBro Stack - Your Complete Guide**

---

## 📖 Navigation

### 🎯 I Want To...

#### Build a Website
→ [Multi-Site Guide](./docs/guides/MULTI_SITE_GUIDE.md)  
→ [Quick Reference](./docs/guides/MULTI_SITE_QUICK_REF.md)

#### Understand the Architecture
→ [Multi-Site Architecture](./docs/architecture/MULTI_SITE_ARCHITECTURE.md)  
→ [AI Agentic System](./docs/architecture/AGENTIC_SYSTEM_ARCHITECTURE.md)  
→ [Asset Management](./docs/architecture/ASSET_MANAGEMENT_ARCHITECTURE.md)

#### Set Up Development
→ [Setup Guide](./docs/development/SETUP_GUIDE.md)  
→ [Git Workflow](./docs/development/GIT_WORKFLOW.md)  
→ [Contributing Guide](./docs/development/CONTRIBUTING.md)

#### Deploy to Production
→ [Deployment Guide](./docs/deployment/DEPLOYMENT_GUIDE.md)  
→ [Production Checklist](./docs/deployment/PRODUCTION_READY.md)

#### Work on AI Features
→ [Implementation Roadmap](./docs/planning/IMPLEMENTATION_ROADMAP.md)  
→ [Implementation Checklist](./docs/planning/AI_IMPLEMENTATION_CHECKLIST.md)  
→ [AI Features Summary](./docs/guides/AI_FEATURES_SUMMARY.md)

---

## 🏁 Quick Start

### 1. Setup Environment
```bash
# Install dependencies
pnpm install

# Build design tokens
pnpm tokens

# Optional: Setup WordPress
pnpm so wp:init
```

### 2. Create Your First Site
```bash
# Create site
pnpm site:create my-awesome-site

# Edit configuration
vim sites/my-awesome-site/site.config.json

# Activate and start
pnpm site:use my-awesome-site
pnpm site:dev
```

### 3. Start Building
Your site is now running at http://localhost:4321 (or your configured port)

---

## 🌳 For Developers

### Start Feature Development
```bash
# Create feature branch
git checkout develop
git checkout -b feature/your-feature

# Make changes and commit
git add .
git commit -m "feat(scope): description"
git push origin feature/your-feature

# Create PR on GitHub
```

### Work on AI Features
```bash
# Agent development
git checkout -b feature/agents-core
# Develop in agents/ directory

# Asset development
git checkout -b feature/assets-core
# Develop in assets/ directory
```

---

## 📚 Complete Documentation

**Everything is organized in [docs/](./docs/):**

```
docs/
├── README.md              ← Start here for full index
├── architecture/          ← System designs
├── guides/                ← User guides
├── development/           ← Dev documentation
├── deployment/            ← Deployment guides
└── planning/              ← Implementation plans
```

---

## 🤖 AI Features (Coming Soon)

The ReactorBro Stack is getting revolutionary AI features:

### AI Agentic Tools
- 12 specialized agents
- Automated site building
- Workflow orchestration
- 60% token savings

### Asset Management
- 14 asset categories
- Version control
- Smart search
- Marketplace

**[Read More →](./docs/guides/AI_FEATURES_SUMMARY.md)**

---

## 💡 Quick Commands

### Multi-Site
```bash
pnpm site:list              # List all sites
pnpm site:create <id>       # Create new site
pnpm site:use <id>          # Switch to site
pnpm site:dev               # Start dev server
pnpm site:build             # Build for production
```

### Development
```bash
pnpm tokens                 # Build design tokens
pnpm lint                   # Lint code
pnpm test                   # Run tests
pnpm build                  # Build all packages
```

### WordPress
```bash
pnpm so wp:init             # Initialize WordPress
pnpm so wp:up               # Start DDEV
pnpm so wp:down             # Stop DDEV
```

---

## 🆘 Need Help?

### Documentation
- [Complete Index](./docs/README.md)
- [Troubleshooting](./docs/reference/TROUBLESHOOTING.md)
- [Contributing Guide](./docs/development/CONTRIBUTING.md)

### Quick Links
- [Main README](./README.md)
- [Cleanup Summary](./CLEANUP_SUMMARY.md)
- [Project Cleanup Plan](./PROJECT_CLEANUP_PLAN.md)

---

## 🎊 Ready to Build!

**Choose your path:**

1. **Build Sites Now** → [Multi-Site Guide](./docs/guides/MULTI_SITE_GUIDE.md)
2. **Develop AI Features** → [Implementation Roadmap](./docs/planning/IMPLEMENTATION_ROADMAP.md)
3. **Contribute** → [Contributing Guide](./docs/development/CONTRIBUTING.md)

---

**Let's build something amazing! 🚀**
