# ReactorBro Stack

A comprehensive, production-ready monorepo stack for multi-site management with AI agent capabilities, asset management, observability, and workflow visualization.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Bootstrap the project
pnpm bootstrap

# Start documentation site
pnpm docs

# Create a new site
pnpm site:create my-site

# Start development
pnpm site:dev
```

## 📚 Documentation

Comprehensive documentation is available at: http://localhost:4322

```bash
# Start documentation server
pnpm docs
```

### Documentation Features
- **Getting Started Guide** - Quick setup instructions
- **Architecture Overview** - System design and patterns
- **API Reference** - Complete API documentation
- **Interactive Examples** - Hands-on tutorials
- **Workflow Visualization** - Visual workflow editor and debugger
- **Deployment Dashboard** - Monitor deployments
- **Distributed Tracing** - Track requests across services

## 🏗️ Architecture

### Monorepo Structure
```
reactorbro-stack/
├── apps/              # Applications (Astro, WordPress, Docs)
├── packages/          # Shared packages
│   ├── animations/   # Animation library
│   ├── observability/ # Logging, metrics, tracing
│   ├── scripts/      # CLI tools and utilities
│   ├── tokens/       # Design tokens
│   └── ui/           # UI components
├── sites/            # Site configurations
├── agents/           # AI agent system
├── assets/           # Asset management
├── convex/           # Convex database functions
└── docs/            # Documentation
```

### Key Components

#### Multi-Site Architecture
- Configuration-driven site management
- Site-specific configs with validation
- Environment isolation

#### AI Agent System
- Orchestrator for agent coordination
- Workflow engine for multi-step processes
- Token optimization for cost efficiency
- Health monitoring

#### Asset Management
- Centralized asset registry
- Version control
- Dependency management
- Search and discovery
- Convex database integration (real-time sync)

#### Database & Storage
- Convex database (real-time, serverless)
- PostgreSQL support (fallback)
- File-based storage (local development)
- Automatic fallback chain

#### Observability
- Unified logging (structured JSON)
- Metrics collection (Prometheus-compatible)
- Distributed tracing (OpenTelemetry-compatible)
- Performance monitoring (Core Web Vitals)

#### Workflow Visualization
- Visual workflow editor
- Real-time execution debugging
- Workflow templates library
- Workflow validation

## 🛠️ Available Commands

### Site Management
```bash
pnpm site:list        # List all sites
pnpm site:create      # Create a new site
pnpm site:use         # Switch active site
pnpm site:dev         # Start development server
pnpm site:build       # Build site
```

### Agent Management
```bash
pnpm agent:list       # List available agents
pnpm agent:info       # Get agent information
pnpm agent:workflow   # Execute workflow
```

### Asset Management
```bash
pnpm asset:browse     # Browse assets
pnpm asset:search     # Search assets
pnpm asset:use        # Use an asset
pnpm asset:create     # Create new asset
```

### Observability
```bash
pnpm obs              # Observability CLI
pnpm dashboard        # Start development dashboard
```

### Deployment
```bash
pnpm deploy:detect    # Detect changes
pnpm deploy:deploy    # Deploy site
pnpm deploy:status    # Check deployment status
pnpm deploy:rollback  # Rollback deployment
```

### Testing
```bash
pnpm test:unit        # Unit tests
pnpm test:integration # Integration tests
pnpm test:e2e         # E2E tests
pnpm test:visual      # Visual regression tests
pnpm test:accessibility # Accessibility tests
pnpm test:security    # Security tests
```

### Documentation
```bash
pnpm docs             # Start docs server
pnpm docs:build       # Build docs
pnpm openapi:generate # Generate OpenAPI spec
```

### Convex Database
```bash
pnpm convex:dev       # Development mode (watch)
pnpm convex:deploy    # Deploy functions
pnpm convex:logs      # View function logs
pnpm convex:env       # Manage environment variables
pnpm convex:verify    # Verify integration
```

## 📦 Features

### Documentation Site
- ✅ Auto-generated from markdown
- ✅ Client-side search
- ✅ Interactive examples
- ✅ OpenAPI specification
- ✅ API documentation explorer
- ✅ Asset preview system

### Observability
- ✅ Distributed tracing
- ✅ Metrics collection
- ✅ Unified logging
- ✅ Performance monitoring
- ✅ Deployment dashboard

### Testing
- ✅ Visual regression testing
- ✅ Accessibility testing (WCAG)
- ✅ Security testing (OWASP)
- ✅ Comprehensive test coverage

### Workflow Management
- ✅ Visual workflow editor
- ✅ Real-time execution debugging
- ✅ Workflow templates
- ✅ Workflow validation
- ✅ Convex-backed storage (real-time sync)

### Database & Storage
- ✅ Convex database integration
- ✅ Real-time synchronization
- ✅ Automatic fallback (PostgreSQL → File-based)
- ✅ Type-safe database functions

## 🔗 Key Links

- **Documentation:** http://localhost:4322
- **Workflows:** http://localhost:4322/workflows
- **Workflow Editor:** http://localhost:4322/workflow-editor
- **Workflow Debugger:** http://localhost:4322/workflow-debugger
- **Templates:** http://localhost:4322/workflow-templates
- **Traces:** http://localhost:4322/traces
- **Deployments:** http://localhost:4322/deployments

## 📖 Documentation Structure

- `docs/guides/` - Step-by-step guides
- `docs/architecture/` - Architecture documentation
- `docs/reference/` - API reference
- `docs/deployment/` - Deployment guides
- `docs/development/` - Development guides

## 🗄️ Database

The stack uses **Convex** as the primary database with automatic fallback:

- **Convex** - Real-time, serverless database (primary)
- **PostgreSQL** - Traditional database (fallback)
- **File-based** - Local development (fallback)

### Setup Convex

```bash
# Configure existing project
npx convex dev --configure=existing --team tim-a6744 --project stack-3d50f

# Or initialize new project
npx convex dev

# Deploy functions
pnpm convex:deploy

# Verify integration
pnpm convex:verify
```

See `CONVEX_SETUP.md` for detailed setup instructions.

---

## 🧪 Testing

The project includes comprehensive testing:

- **Unit Tests** - Vitest for component testing
- **Integration Tests** - Full integration test suite
- **E2E Tests** - Playwright for end-to-end testing
- **Visual Regression** - Screenshot comparison
- **Accessibility** - WCAG compliance testing
- **Security** - OWASP vulnerability scanning

## 🚢 Deployment

The stack includes enhanced CI/CD capabilities:

- **Change Detection** - Git-based change detection
- **Quality Gates** - Automated testing gates
- **Build Validation** - Artifact validation
- **Health Checks** - Post-deployment validation
- **Rollback Automation** - Automatic rollback on failure

## 📝 License

[Your License Here]

## 🤝 Contributing

See `docs/development/CONTRIBUTING.md` for contribution guidelines.

---

**Built with:** Astro, TypeScript, Tailwind CSS, Vitest, Playwright, Convex
**Status:** ✅ Production Ready
**Version:** 1.0.0
