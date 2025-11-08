---
title: Architecture Overview
description: System architecture and design patterns
category: architecture
order: 2
---

# Architecture Overview

ReactorBro Stack is built with a modern, scalable architecture.

## Monorepo Structure

\`\`\`
reactorbro-stack/
├── apps/          # Applications (Astro, WordPress, Docs)
├── packages/      # Shared packages
├── sites/         # Site configurations
├── agents/         # AI agent system
├── assets/         # Asset management
└── docs/          # Documentation
\`\`\`

## Key Components

### Multi-Site Architecture
- Configuration-driven site management
- Site-specific configs with validation
- Environment isolation

### Agent System
- Orchestrator for agent coordination
- Workflow engine for multi-step processes
- Token optimization for cost efficiency

### Asset Management
- Centralized asset registry
- Version control
- Dependency management
- Search and discovery

### Observability
- Unified logging
- Metrics collection
- Performance monitoring

## Design Principles

1. **Modularity** - Each component is independent
2. **Scalability** - Designed to handle multiple sites
3. **Developer Experience** - Tools and dashboards for easy management
4. **Performance** - Optimized builds and runtime

