# ReactorBro Stack Documentation

Welcome to the ReactorBro Stack documentation! This directory contains comprehensive documentation for all aspects of the platform.

## 📚 Documentation Overview

### Getting Started
- **[Quick Start Guide](guides/QUICK_START.md)** - Get up and running quickly
- **[Getting Started with Agents](guides/GETTING_STARTED_WITH_AGENTS.md)** - Learn about the AI agent system
- **[Multi-Site Guide](guides/MULTI_SITE_GUIDE.md)** - Multi-site management

### Architecture
- **[Architecture Analysis](ARCHITECTURE_ANALYSIS.md)** - Complete architecture overview
- **[Agent System Architecture](architecture/AGENTIC_SYSTEM_ARCHITECTURE.md)** - AI agent system design
- **[Asset Management Architecture](architecture/ASSET_MANAGEMENT_ARCHITECTURE.md)** - Asset system design
- **[Multi-Site Architecture](architecture/MULTI_SITE_ARCHITECTURE.md)** - Multi-site system design

### Guides
- **[Multi-Site Quick Reference](guides/MULTI_SITE_QUICK_REF.md)** - Quick reference guide
- **[AI Features Summary](guides/AI_FEATURES_SUMMARY.md)** - AI capabilities overview

### Development
- **[Setup Guide](development/SETUP_GUIDE.md)** - Development environment setup
- **[Contributing Guide](development/CONTRIBUTING.md)** - Contribution guidelines
- **[Git Workflow](development/GIT_WORKFLOW.md)** - Git workflow practices
- **[Review Guide](development/REVIEW_GUIDE.md)** - Code review guidelines

### Deployment
- **[Deployment Guide](deployment/DEPLOYMENT_GUIDE.md)** - Deployment instructions
- **[Production Ready](deployment/PRODUCTION_READY.md)** - Production checklist

### Reference
- **[Agent Quick Reference](reference/AGENT_QUICK_REFERENCE.md)** - Agent API reference

### Implementation Summaries
- **[Complete Implementation Summary](COMPLETE_IMPLEMENTATION_SUMMARY.md)** - All completed enhancements
- **[Option 1: Documentation](OPTION1_COMPLETE.md)** - Documentation site implementation
- **[Option 2: Production Hardening](OPTION2_COMPLETE.md)** - Observability and testing
- **[Option 3: Workflow Visualization](OPTION3_COMPLETE.md)** - Workflow management tools

## 🚀 Quick Access

### Documentation Site
Start the documentation server:
```bash
pnpm docs
```

Access at: http://localhost:4322

### Key Pages
- **Home:** http://localhost:4322
- **Getting Started:** http://localhost:4322/docs/getting-started
- **Architecture:** http://localhost:4322/docs/architecture
- **API Reference:** http://localhost:4322/docs/api
- **Examples:** http://localhost:4322/examples
- **Workflows:** http://localhost:4322/workflows
- **Workflow Editor:** http://localhost:4322/workflow-editor
- **Workflow Debugger:** http://localhost:4322/workflow-debugger
- **Templates:** http://localhost:4322/workflow-templates
- **Traces:** http://localhost:4322/traces
- **Deployments:** http://localhost:4322/deployments

## 📖 Documentation Features

### Interactive Documentation
- **Search** - Find documentation quickly
- **Examples** - Interactive code examples
- **API Explorer** - Browse API endpoints
- **Asset Preview** - Preview assets visually

### Workflow Tools
- **Visual Editor** - Create workflows visually
- **Debugger** - Debug workflow executions
- **Templates** - Use pre-built templates
- **Visualization** - View workflow graphs

### Observability
- **Traces** - Distributed tracing dashboard
- **Deployments** - Deployment monitoring
- **Metrics** - Performance metrics

## 🎯 Documentation Structure

```
docs/
├── guides/              # Step-by-step guides
├── architecture/        # Architecture documentation
├── reference/           # API reference
├── deployment/          # Deployment guides
├── development/         # Development guides
└── planning/            # Planning documents
```

## 📝 Contributing to Documentation

Documentation is written in Markdown and auto-generated into the documentation site. To contribute:

1. Edit markdown files in `docs/`
2. Add new pages to `apps/docs/src/content/docs/`
3. Run `pnpm docs` to preview changes
4. Build with `pnpm docs:build`

## 🔍 Search

Use the search functionality in the documentation site to quickly find:
- API endpoints
- Configuration options
- Code examples
- Guides and tutorials

## 📊 Documentation Statistics

- **Total Pages:** 15+
- **API Endpoints:** 20+
- **Examples:** 3+
- **Templates:** 2+
- **Guides:** 5+

---

**Last Updated:** December 2024
**Status:** ✅ Complete
**Access:** `pnpm docs` → http://localhost:4322
