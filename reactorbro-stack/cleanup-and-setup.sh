#!/bin/bash

# ReactorBro Stack - Project Cleanup & Git Setup Script
# This script reorganizes the project for better DX and sets up Git branching

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  ReactorBro Stack - Project Cleanup & Git Setup           ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Create new directory structure
echo -e "${BLUE}📁 Step 1: Creating new directory structure...${NC}"

mkdir -p docs/{architecture,guides,development,deployment,planning,reference}
mkdir -p docs/planning/FEATURE_SPECS
mkdir -p agents/{core,registry,skills,workflows,mcp,commands,config}
mkdir -p agents/registry/{design,content,planning}
mkdir -p assets/{core,library,metadata,cache,config}
mkdir -p assets/library/{design-tokens,style-prompts,templates,ui-components}
mkdir -p assets/library/{workflows,modules,tools,configs,ai-prompts}
mkdir -p assets/library/{agent-workflows,sub-agents,agent-skills}
mkdir -p tests/{unit,integration,e2e}
mkdir -p scripts
mkdir -p archive/old-docs

echo -e "${GREEN}✓ Directories created${NC}"
echo ""

# Step 2: Move documentation files
echo -e "${BLUE}📄 Step 2: Reorganizing documentation...${NC}"

# Architecture docs
[ -f "MULTI_SITE_ARCHITECTURE.md" ] && mv MULTI_SITE_ARCHITECTURE.md docs/architecture/ && echo "  Moved MULTI_SITE_ARCHITECTURE.md"
[ -f "docs/MULTI_SITE_ARCHITECTURE.md" ] && mv docs/MULTI_SITE_ARCHITECTURE.md docs/architecture/ && echo "  Moved MULTI_SITE_ARCHITECTURE.md"
[ -f "docs/AGENTIC_SYSTEM_ARCHITECTURE.md" ] && mv docs/AGENTIC_SYSTEM_ARCHITECTURE.md docs/architecture/ && echo "  Moved AGENTIC_SYSTEM_ARCHITECTURE.md"
[ -f "docs/ASSET_MANAGEMENT_ARCHITECTURE.md" ] && mv docs/ASSET_MANAGEMENT_ARCHITECTURE.md docs/architecture/ && echo "  Moved ASSET_MANAGEMENT_ARCHITECTURE.md"

# User guides
[ -f "MULTI_SITE_GUIDE.md" ] && mv MULTI_SITE_GUIDE.md docs/guides/ && echo "  Moved MULTI_SITE_GUIDE.md"
[ -f "MULTI_SITE_QUICK_REF.md" ] && mv MULTI_SITE_QUICK_REF.md docs/guides/ && echo "  Moved MULTI_SITE_QUICK_REF.md"
[ -f "QUICK_START.md" ] && mv QUICK_START.md docs/guides/ && echo "  Moved QUICK_START.md"
[ -f "docs/AI_FEATURES_SUMMARY.md" ] && mv docs/AI_FEATURES_SUMMARY.md docs/guides/ && echo "  Moved AI_FEATURES_SUMMARY.md"

# Development docs
[ -f "SETUP_COMPLETE.md" ] && mv SETUP_COMPLETE.md docs/development/SETUP_GUIDE.md && echo "  Moved SETUP_COMPLETE.md → SETUP_GUIDE.md"
[ -f "CONTRIBUTING.md" ] && mv CONTRIBUTING.md docs/development/ && echo "  Moved CONTRIBUTING.md"
[ -f "REVIEW_GUIDE.md" ] && mv REVIEW_GUIDE.md docs/development/ && echo "  Moved REVIEW_GUIDE.md"

# Deployment docs
[ -f "DEPLOYMENT_SUMMARY.md" ] && mv DEPLOYMENT_SUMMARY.md docs/deployment/DEPLOYMENT_GUIDE.md && echo "  Moved DEPLOYMENT_SUMMARY.md → DEPLOYMENT_GUIDE.md"
[ -f "PRODUCTION_READY.md" ] && mv PRODUCTION_READY.md docs/deployment/ && echo "  Moved PRODUCTION_READY.md"

# Planning docs
[ -f "docs/IMPLEMENTATION_ROADMAP.md" ] && mv docs/IMPLEMENTATION_ROADMAP.md docs/planning/ && echo "  Moved IMPLEMENTATION_ROADMAP.md"
[ -f "AI_IMPLEMENTATION_CHECKLIST.md" ] && mv AI_IMPLEMENTATION_CHECKLIST.md docs/planning/ && echo "  Moved AI_IMPLEMENTATION_CHECKLIST.md"

# Archive old docs
[ -f "BERG_PROJECTS_README.md" ] && mv BERG_PROJECTS_README.md archive/old-docs/ && echo "  Archived BERG_PROJECTS_README.md"
[ -f "MULTI_SITE_SETUP_COMPLETE.md" ] && mv MULTI_SITE_SETUP_COMPLETE.md archive/old-docs/ && echo "  Archived MULTI_SITE_SETUP_COMPLETE.md"
[ -f "MULTI_SITE_IMPLEMENTATION.md" ] && mv MULTI_SITE_IMPLEMENTATION.md archive/old-docs/ && echo "  Archived MULTI_SITE_IMPLEMENTATION.md"
[ -f "MULTI_SITE_README.md" ] && mv MULTI_SITE_README.md archive/old-docs/ && echo "  Archived MULTI_SITE_README.md"

echo -e "${GREEN}✓ Documentation reorganized${NC}"
echo ""

# Step 3: Create navigation README files
echo -e "${BLUE}📝 Step 3: Creating navigation files...${NC}"

# Main docs README
cat > docs/README.md << 'DOCEOF'
# Documentation Index
**ReactorBro Stack - Complete Documentation**

## 📚 Quick Navigation

### Getting Started
- [Quick Start Guide](./guides/QUICK_START.md) - Get up and running
- [Setup Guide](./development/SETUP_GUIDE.md) - Development setup

### Architecture
- [Multi-Site Architecture](./architecture/MULTI_SITE_ARCHITECTURE.md)
- [AI Agentic System](./architecture/AGENTIC_SYSTEM_ARCHITECTURE.md)
- [Asset Management](./architecture/ASSET_MANAGEMENT_ARCHITECTURE.md)

### User Guides
- [Multi-Site Guide](./guides/MULTI_SITE_GUIDE.md)
- [Multi-Site Quick Reference](./guides/MULTI_SITE_QUICK_REF.md)
- [AI Features Summary](./guides/AI_FEATURES_SUMMARY.md)

### Development
- [Contributing Guide](./development/CONTRIBUTING.md)
- [Review Guide](./development/REVIEW_GUIDE.md)
- [Testing Guide](./development/TESTING_GUIDE.md)

### Deployment
- [Deployment Guide](./deployment/DEPLOYMENT_GUIDE.md)
- [Production Ready Checklist](./deployment/PRODUCTION_READY.md)

### Planning
- [Implementation Roadmap](./planning/IMPLEMENTATION_ROADMAP.md)
- [Implementation Checklist](./planning/AI_IMPLEMENTATION_CHECKLIST.md)
- [Feature Specs](./planning/FEATURE_SPECS/)

### Reference
- [API Reference](./reference/API_REFERENCE.md)
- [CLI Reference](./reference/CLI_REFERENCE.md)
- [Troubleshooting](./reference/TROUBLESHOOTING.md)

---

**Navigate efficiently. Build amazing things. 🚀**
DOCEOF

echo "  Created docs/README.md"

# Architecture README
cat > docs/architecture/README.md << 'ARCHEOF'
# Architecture Documentation

## System Architectures

### Multi-Site System
- [Multi-Site Architecture](./MULTI_SITE_ARCHITECTURE.md)
- Manages multiple websites in one monorepo
- Site-specific configurations
- Shared components and packages

### AI Agentic System
- [Agentic System Architecture](./AGENTIC_SYSTEM_ARCHITECTURE.md)
- 12 specialized AI agents
- Sub-agent architecture
- Workflow chains and MCP integration

### Asset Management System
- [Asset Management Architecture](./ASSET_MANAGEMENT_ARCHITECTURE.md)
- 14 asset categories
- Version control and dependencies
- Search and marketplace

---

**Understand the systems. Build with confidence. 🏗️**
ARCHEOF

echo "  Created docs/architecture/README.md"

# Guides README
cat > docs/guides/README.md << 'GUIDEOF'
# User Guides

## Available Guides

### Multi-Site Management
- [Complete Multi-Site Guide](./MULTI_SITE_GUIDE.md)
- [Quick Reference](./MULTI_SITE_QUICK_REF.md)

### AI Features
- [AI Features Summary](./AI_FEATURES_SUMMARY.md)

### Getting Started
- [Quick Start Guide](./QUICK_START.md)

---

**Learn quickly. Work efficiently. 📖**
GUIDEOF

echo "  Created docs/guides/README.md"

# Planning README
cat > docs/planning/README.md << 'PLANEOF'
# Planning Documentation

## Implementation Plans

### Roadmaps
- [Implementation Roadmap](./IMPLEMENTATION_ROADMAP.md) - 16-week plan
- [Implementation Checklist](./AI_IMPLEMENTATION_CHECKLIST.md) - Track progress

### Feature Specifications
- [Feature Specs Directory](./FEATURE_SPECS/) - Detailed specifications

---

**Plan thoroughly. Execute flawlessly. 📋**
PLANEOF

echo "  Created docs/planning/README.md"

# Agents README
cat > agents/README.md << 'AGENTEOF'
# AI Agent System

## Directory Structure

```
agents/
├── core/           # Core agent infrastructure
├── registry/       # Agent definitions
├── skills/         # Reusable skills
├── workflows/      # Workflow definitions
├── mcp/            # MCP server integrations
├── commands/       # Slash commands
└── config/         # Configuration
```

## Status

🚧 **Under Development**

This system is being built according to the [Agentic System Architecture](../docs/architecture/AGENTIC_SYSTEM_ARCHITECTURE.md).

---

**Build intelligent agents. Automate everything. 🤖**
AGENTEOF

echo "  Created agents/README.md"

# Assets README
cat > assets/README.md << 'ASSETEOF'
# Asset Management System

## Directory Structure

```
assets/
├── core/           # Core asset management
├── library/        # Asset library (14 categories)
├── metadata/       # Asset metadata
├── cache/          # Asset cache
└── config/         # Configuration
```

## Status

🚧 **Under Development**

This system is being built according to the [Asset Management Architecture](../docs/architecture/ASSET_MANAGEMENT_ARCHITECTURE.md).

---

**Manage assets. Reuse everything. 📦**
ASSETEOF

echo "  Created assets/README.md"

# Tests README
cat > tests/README.md << 'TESTEOF'
# Test Suite

## Directory Structure

```
tests/
├── unit/           # Unit tests
├── integration/    # Integration tests
└── e2e/            # End-to-end tests
```

## Running Tests

```bash
# All tests
pnpm test

# Unit tests only
pnpm test:unit

# Integration tests
pnpm test:integration

# E2E tests
pnpm test:e2e

# With coverage
pnpm test:coverage
```

---

**Test everything. Ship with confidence. 🧪**
TESTEOF

echo "  Created tests/README.md"

echo -e "${GREEN}✓ Navigation files created${NC}"
echo ""

# Step 4: Update main README
echo -e "${BLUE}📖 Step 4: Updating main README...${NC}"

cat > README_NEW.md << 'MAINEOF'
# ReactorBro Stack — Headless WordPress + Astro

<div align="center">

**A modern, type-safe monorepo combining headless WordPress (DDEV) with Astro frontend, AI agents, and asset management**

[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-cc00ff.svg)](https://pnpm.io/)
[![Turborepo](https://img.shields.io/badge/built%20with-Turborepo-ef4444.svg)](https://turbo.build/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178c6.svg)](https://www.typescriptlang.org/)

</div>

---

## 🎯 What You Get

- **🏗️ Monorepo Architecture** — pnpm workspaces + Turborepo for efficient builds
- **🌐 Multi-Site Management** — Manage multiple websites concurrently with site-specific configs
- **🤖 AI Agentic Tools** — 12 specialized agents for automated site building (coming soon)
- **📦 Asset Management** — Comprehensive library for reusable elements (coming soon)
- **⚡ Astro 5.15** — Fast, modern frontend framework with Tailwind CSS 3.4
- **📝 Headless WordPress** — DDEV-powered local development (PHP 8.2 + MariaDB 10.6)
- **🎨 Design Token System** — Centralized tokens compiled to Tailwind config
- **🔧 Type-Safe** — Full TypeScript support across the stack
- **🚀 CI/CD Ready** — GitHub Actions for Cloudflare Pages + VPS deployment

---

## 📁 Project Structure

```
reactorbro-stack/
├── 📚 docs/                    # All documentation
│   ├── architecture/           # System architectures
│   ├── guides/                 # User guides
│   ├── development/            # Dev documentation
│   ├── deployment/             # Deployment guides
│   └── planning/               # Implementation plans
│
├── 🌐 sites/                   # Multi-site configurations
│   ├── berg-projects/          # Example site
│   └── _template/              # Site template
│
├── 🤖 agents/                  # AI Agent system (in development)
├── 📦 assets/                  # Asset management (in development)
│
├── 📱 apps/
│   ├── astro/                  # Astro frontend
│   └── wp/                     # WordPress backend
│
├── 📦 packages/
│   ├── scripts/                # CLI tools
│   ├── tokens/                 # Design tokens
│   └── ui/                     # UI components
│
└── 🧪 tests/                   # Test suite
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ 
- **pnpm** 9.0+ (`npm install -g pnpm`)
- **DDEV** ([Installation guide](https://ddev.readthedocs.io/en/stable/users/install/))

### Setup

```bash
# 1. Clone and install
git clone <repo-url>
cd reactorbro-stack
pnpm install

# 2. Build design tokens
pnpm tokens

# 3. Initialize WordPress (optional)
pnpm so wp:init

# 4. Start development
pnpm site:use berg-projects
pnpm site:dev
```

📖 **[Full Setup Guide →](./docs/development/SETUP_GUIDE.md)**

---

## 🌐 Multi-Site Management

Manage multiple websites concurrently:

```bash
# List all sites
pnpm site:list

# Create a new site
pnpm site:create my-new-site

# Switch to a site
pnpm site:use my-new-site

# Start development
pnpm site:dev

# Build for production
pnpm site:build
```

📚 **[Multi-Site Guide →](./docs/guides/MULTI_SITE_GUIDE.md)**

---

## 🤖 AI Features (Coming Soon)

Revolutionary AI-powered development with:

- **12 Specialized Agents** (Design, Content, SEO, Planning)
- **Asset Management System** (14 categories, 500+ assets)
- **Token Optimization** (60% savings)
- **Workflow Automation** (10x faster development)

📋 **[Implementation Roadmap →](./docs/planning/IMPLEMENTATION_ROADMAP.md)**
📖 **[AI Features Summary →](./docs/guides/AI_FEATURES_SUMMARY.md)**

---

## 📚 Documentation

### Getting Started
- [Quick Start Guide](./docs/guides/QUICK_START.md)
- [Setup Guide](./docs/development/SETUP_GUIDE.md)

### User Guides
- [Multi-Site Guide](./docs/guides/MULTI_SITE_GUIDE.md)
- [Quick Reference](./docs/guides/MULTI_SITE_QUICK_REF.md)

### Architecture
- [Multi-Site Architecture](./docs/architecture/MULTI_SITE_ARCHITECTURE.md)
- [AI Agentic System](./docs/architecture/AGENTIC_SYSTEM_ARCHITECTURE.md)
- [Asset Management](./docs/architecture/ASSET_MANAGEMENT_ARCHITECTURE.md)

### Development
- [Contributing Guide](./docs/development/CONTRIBUTING.md)
- [Development Workflow](./docs/development/DEVELOPMENT_WORKFLOW.md)

### Deployment
- [Deployment Guide](./docs/deployment/DEPLOYMENT_GUIDE.md)
- [Production Ready](./docs/deployment/PRODUCTION_READY.md)

📖 **[Complete Documentation Index →](./docs/README.md)**

---

## 🛠️ Development Commands

### Multi-Site
```bash
pnpm site:list                  # List all sites
pnpm site:create <site-id>      # Create new site
pnpm site:use <site-id>         # Switch to site
pnpm site:dev [site-id]         # Start dev server
pnpm site:build [site-id]       # Build for production
```

### WordPress
```bash
pnpm so wp:init                 # Initialize WordPress
pnpm so wp:up                   # Start DDEV
pnpm so wp:down                 # Stop DDEV
pnpm so wp:plugins              # Install plugins
```

### Development
```bash
pnpm tokens                     # Build design tokens
pnpm lint                       # Lint code
pnpm test                       # Run tests
pnpm build                      # Build all packages
```

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./docs/development/CONTRIBUTING.md) for details.

### Quick Contributing Steps

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Run tests: `pnpm test`
5. Commit using conventional commits
6. Push and create a PR

---

## 📈 Project Status

### ✅ Production Ready
- Multi-site management system
- Astro + WordPress integration
- Design token system
- CLI tools

### 🚧 In Development
- AI Agentic Tools (Phase 1)
- Asset Management System (Phase 1)
- Enhanced testing suite

### 📋 Planned
- MCP Server integration
- Asset marketplace
- Advanced workflows

---

## 📄 License

Private project. All rights reserved.

---

## 🙏 Acknowledgments

Built with:
- [Astro](https://astro.build)
- [WordPress](https://wordpress.org)
- [DDEV](https://ddev.readthedocs.io)
- [Turborepo](https://turbo.build)
- [pnpm](https://pnpm.io)

---

**Built with ❤️ for modern web development**

**Start building amazing sites today! 🚀**
MAINEOF

mv README.md README_OLD.md 2>/dev/null || true
mv README_NEW.md README.md

echo -e "${GREEN}✓ Main README updated${NC}"
echo ""

# Step 5: Git setup
echo -e "${BLUE}🌳 Step 5: Setting up Git branching strategy...${NC}"

# Check if we're in a git repo
if [ -d ".git" ]; then
    echo "  Git repository detected"
    
    # Save current branch
    CURRENT_BRANCH=$(git branch --show-current)
    echo "  Current branch: $CURRENT_BRANCH"
    
    # Stash any changes
    if ! git diff-index --quiet HEAD --; then
        echo "  Stashing uncommitted changes..."
        git stash push -m "Pre-cleanup stash $(date +%Y%m%d_%H%M%S)"
    fi
    
    # Create develop branch if it doesn't exist
    if ! git rev-parse --verify develop >/dev/null 2>&1; then
        echo "  Creating 'develop' branch..."
        git checkout -b develop
        git push -u origin develop 2>/dev/null || echo "  (Remote push will be done manually)"
    else
        echo "  'develop' branch already exists"
    fi
    
    # Return to original branch
    git checkout "$CURRENT_BRANCH" 2>/dev/null || git checkout main
    
    echo -e "${GREEN}✓ Git branches configured${NC}"
else
    echo -e "${YELLOW}  No git repository found. Skipping git setup.${NC}"
fi

echo ""

# Step 6: Create Git workflow documentation
echo -e "${BLUE}📝 Step 6: Creating Git workflow documentation...${NC}"

cat > docs/development/GIT_WORKFLOW.md << 'GITEOF'
# Git Workflow Guide
**ReactorBro Stack - Branching Strategy**

## 🌳 Branch Structure

```
main (production)
  └── develop (integration)
      ├── feature/agents-* (AI agent features)
      ├── feature/assets-* (asset management)
      ├── feature/ui-* (UI improvements)
      └── hotfix/* (urgent fixes)
```

## 🚀 Quick Commands

### Start New Feature
```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature
```

### Daily Work
```bash
# Sync with develop
git checkout feature/your-feature
git pull origin develop
git merge develop

# Commit work
git add .
git commit -m "feat(scope): description"
git push origin feature/your-feature
```

### Merge Feature
```bash
# Create PR on GitHub
# After approval:
git checkout develop
git merge --squash feature/your-feature
git push origin develop

# Cleanup
git branch -d feature/your-feature
git push origin --delete feature/your-feature
```

## 📋 Commit Convention

Format: `<type>(<scope>): <subject>`

Types: feat, fix, docs, style, refactor, test, chore

Example: `feat(agents): implement graphic design agent`

---

**[Full Git Strategy →](../PROJECT_CLEANUP_PLAN.md#-git-branching-strategy)**
GITEOF

echo "  Created docs/development/GIT_WORKFLOW.md"
echo -e "${GREEN}✓ Git workflow documented${NC}"
echo ""

# Step 7: Create cleanup summary
echo -e "${BLUE}📋 Step 7: Creating cleanup summary...${NC}"

cat > CLEANUP_SUMMARY.md << 'SUMEOF'
# Cleanup Summary
**ReactorBro Stack - Project Reorganization Complete**

## ✅ What Was Done

### 1. Directory Structure
- Created organized `docs/` hierarchy
- Set up `agents/` directory for AI system
- Set up `assets/` directory for asset management
- Created `tests/` directory for test suite
- Created `scripts/` directory for build scripts
- Created `archive/` for old documentation

### 2. Documentation Reorganization
- Moved architecture docs to `docs/architecture/`
- Moved user guides to `docs/guides/`
- Moved development docs to `docs/development/`
- Moved deployment docs to `docs/deployment/`
- Moved planning docs to `docs/planning/`
- Archived old/redundant docs to `archive/old-docs/`

### 3. Navigation Improvements
- Created README.md in every major directory
- Created comprehensive `docs/README.md` index
- Updated main `README.md` with new structure
- Added clear navigation paths

### 4. Git Setup
- Created `develop` branch for integration
- Documented branching strategy
- Set up feature branch workflow
- Created Git workflow guide

## 📁 New Structure

```
reactorbro-stack/
├── docs/              # All documentation (organized)
├── sites/             # Multi-site configs
├── agents/            # AI Agent system (ready for dev)
├── assets/            # Asset management (ready for dev)
├── apps/              # Applications (astro, wp)
├── packages/          # Shared packages
├── tests/             # Test suite
└── scripts/           # Build scripts
```

## 🌳 Git Branches

- `main` - Production code
- `develop` - Integration branch
- `feature/*` - Feature branches

## 📖 Documentation Index

Start here: [docs/README.md](./docs/README.md)

## 🚀 Next Steps

1. Review the new structure
2. Check `docs/README.md` for navigation
3. Read `docs/development/GIT_WORKFLOW.md`
4. Start development on feature branches!

## 📋 Commands Reference

```bash
# Multi-site
pnpm site:list
pnpm site:create <site-id>
pnpm site:use <site-id>
pnpm site:dev

# Git workflow
git checkout develop
git checkout -b feature/your-feature
# ... develop ...
git push origin feature/your-feature
```

---

**Project is now organized and ready for concurrent development! 🎉**
SUMEOF

echo "  Created CLEANUP_SUMMARY.md"
echo -e "${GREEN}✓ Summary created${NC}"
echo ""

# Done!
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    CLEANUP COMPLETE! ✅                    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}✓ Directory structure created${NC}"
echo -e "${GREEN}✓ Documentation reorganized${NC}"
echo -e "${GREEN}✓ Navigation files created${NC}"
echo -e "${GREEN}✓ Main README updated${NC}"
echo -e "${GREEN}✓ Git branches configured${NC}"
echo -e "${GREEN}✓ Git workflow documented${NC}"
echo -e "${GREEN}✓ Summary created${NC}"
echo ""
echo -e "${BLUE}📖 Next Steps:${NC}"
echo "  1. Review CLEANUP_SUMMARY.md"
echo "  2. Check docs/README.md for navigation"
echo "  3. Read docs/development/GIT_WORKFLOW.md"
echo "  4. Start development: git checkout -b feature/your-feature"
echo ""
echo -e "${YELLOW}📋 Quick Commands:${NC}"
echo "  pnpm site:list               # List all sites"
echo "  git checkout develop         # Switch to develop branch"
echo "  git checkout -b feature/name # Create feature branch"
echo ""
echo -e "${GREEN}🚀 Ready for concurrent development!${NC}"
echo ""

