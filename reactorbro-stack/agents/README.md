# AI Agents System

A comprehensive AI agent framework for automated website design, content generation, and optimization.

## 📁 Directory Structure

```
agents/
├── core/                    # Core agent infrastructure
│   ├── agent-base.ts       # Base agent class
│   ├── orchestrator.ts     # Agent orchestration
│   ├── context-manager.ts  # Context management
│   ├── token-optimizer.ts  # Token optimization
│   ├── workflow-engine.ts  # Workflow execution
│   └── types.ts            # Type definitions
├── registry/               # Agent implementations
│   ├── design/            # Design agents
│   │   ├── graphic-design-agent.ts
│   │   └── layout-agent.ts
│   ├── content/           # Content agents
│   │   ├── content-generation-agent.ts
│   │   └── seo-optimization-agent.ts
│   ├── planning/          # Planning agents (Phase 3)
│   └── index.ts           # Agent registry
├── skills/                # Reusable agent skills
├── workflows/             # Workflow definitions
├── commands/              # CLI commands
├── config/                # Agent configurations
└── mcp/                   # MCP server integration
```

## 🤖 Available Agents

### Design Agents

#### Graphic Design Agent
Creates visual assets, brand identities, and design systems.

**Capabilities:**
- Logo design and variations
- Color palette generation
- Typography selection
- Brand identity packages
- Accessibility validation (WCAG AA/AAA)

**Task Types:**
- `logo_design`
- `color_palette_generation`
- `typography_selection`
- `brand_identity`

#### Layout Agent
Designs page layouts, grid systems, and responsive structures.

**Capabilities:**
- Complete page layouts (landing, blog, product, etc.)
- Grid system generation (12-col, 16-col, CSS Grid, Flexbox)
- Responsive design configurations
- Section composition
- Accessibility features

**Task Types:**
- `page_layout`
- `grid_system`
- `responsive_design`
- `layout_optimization`

### Content Agents

#### Content Generation Agent
Creates compelling content, copy, and blog posts.

**Capabilities:**
- Page content generation
- Blog post creation
- Copywriting for specific purposes
- CTA creation
- Tone and brand voice matching

**Task Types:**
- `page_content`
- `blog_post`
- `copywriting`
- `cta_creation`

#### SEO Optimization Agent
Optimizes content for search engines and analyzes SEO performance.

**Capabilities:**
- SEO analysis and scoring
- Keyword research
- Content optimization
- Meta tag generation
- Schema markup
- Technical SEO auditing

**Task Types:**
- `seo_analysis`
- `keyword_research`
- `content_optimization`
- `meta_tag_generation`

## 🚀 Quick Start

### Basic Usage

```typescript
import { GraphicDesignAgent } from './agents/registry/index.js';
import type { Context, Task } from './agents/core/types.js';

// Create agent instance
const agent = new GraphicDesignAgent();

// Create context
const context: Context = {
  id: 'ctx-1',
  sessionId: 'session-1',
  data: {},
  history: [],
  metadata: {
    created: new Date(),
    updated: new Date(),
    totalTokens: 0,
    entryCount: 0,
    size: 0,
  },
};

// Create task
const task: Task = {
  id: 'task-1',
  type: 'brand_identity',
  title: 'Create brand identity for TechFlow',
  description: 'Generate complete brand identity package',
  parameters: {
    brandInfo: {
      name: 'TechFlow',
      industry: 'technology',
      values: ['innovation', 'reliability', 'simplicity'],
      targetAudience: 'developers and tech professionals',
      style: 'modern',
      preferences: {
        colors: ['#6366F1'],
      },
    },
  },
  context,
  priority: 'high',
  dependencies: [],
  status: 'pending',
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Execute task
const result = await agent.execute(task, context);

console.log('Brand Identity Created:', result.data);
```

### Using with Retry Logic

```typescript
// Execute with automatic retries
const result = await agent.executeWithRetry(task, context);
```

### Agent Information

```typescript
// Get agent capabilities
const info = agent.getInfo();
console.log(`Agent: ${info.name}`);
console.log(`Capabilities: ${info.capabilities.join(', ')}`);
console.log(`Skills: ${info.skills.join(', ')}`);
```

## 📝 Usage Examples

### 1. Generate Brand Identity

```typescript
import { GraphicDesignAgent } from './agents/registry/index.js';

const agent = new GraphicDesignAgent();

const brandInfo = {
  name: 'TechFlow',
  industry: 'technology',
  values: ['innovation', 'reliability', 'simplicity'],
  targetAudience: 'developers and tech professionals',
  style: 'modern',
  preferences: {
    colors: ['#6366F1'],
  },
};

const result = await agent.execute({
  id: 'task-1',
  type: 'brand_identity',
  title: 'Create brand identity',
  description: 'Generate complete brand identity package',
  parameters: { brandInfo },
  context,
  priority: 'high',
  dependencies: [],
  status: 'pending',
  createdAt: new Date(),
  updatedAt: new Date(),
}, context);

// Result includes:
// - logo (with variations)
// - colors (full palette)
// - typography (headings, body, scale)
// - guidelines (usage rules)
```

### 2. Design Page Layout

```typescript
import { LayoutAgent } from './agents/registry/index.js';

const agent = new LayoutAgent();

const result = await agent.execute({
  id: 'task-2',
  type: 'page_layout',
  title: 'Design landing page',
  description: 'Create responsive landing page layout',
  parameters: {
    pageType: 'landing',
    requirements: {
      pageType: 'landing',
      contentComplexity: 'moderate',
      deviceTargets: ['mobile', 'desktop'],
      designStyle: 'modern',
    },
  },
  context,
  priority: 'high',
  dependencies: [],
  status: 'pending',
  createdAt: new Date(),
  updatedAt: new Date(),
}, context);

// Result includes:
// - structure (header, main, footer)
// - grid (12-column system with breakpoints)
// - sections (hero, features, testimonials, CTA)
// - responsive config (mobile-first approach)
```

### 3. Generate Content

```typescript
import { ContentGenerationAgent } from './agents/registry/index.js';

const agent = new ContentGenerationAgent();

const request = {
  pageType: 'landing',
  purpose: 'Convert visitors into customers',
  targetAudience: 'Small business owners',
  tone: 'professional',
  length: 'medium',
  keywords: ['business automation', 'productivity'],
};

const result = await agent.execute({
  id: 'task-3',
  type: 'page_content',
  title: 'Generate landing page content',
  description: 'Create compelling content for landing page',
  parameters: { request },
  context,
  priority: 'high',
  dependencies: [],
  status: 'pending',
  createdAt: new Date(),
  updatedAt: new Date(),
}, context);

// Result includes:
// - headline
// - subheadline
// - body (structured content blocks)
// - cta (primary and secondary)
// - metadata (word count, reading time, keywords)
```

### 4. Optimize for SEO

```typescript
import { SEOOptimizationAgent } from './agents/registry/index.js';

const agent = new SEOOptimizationAgent();

const result = await agent.execute({
  id: 'task-4',
  type: 'seo_analysis',
  title: 'Analyze page SEO',
  description: 'Comprehensive SEO analysis',
  parameters: {
    content: pageContent,
    url: 'https://example.com/page',
  },
  context,
  priority: 'high',
  dependencies: [],
  status: 'pending',
  createdAt: new Date(),
  updatedAt: new Date(),
}, context);

// Result includes:
// - score (0-100)
// - issues (categorized by severity)
// - recommendations (prioritized)
// - keyword analysis
// - metadata analysis
// - readability score
// - technical SEO audit
```

### 5. Create Blog Post

```typescript
import { ContentGenerationAgent } from './agents/registry/index.js';

const agent = new ContentGenerationAgent();

const result = await agent.execute({
  id: 'task-5',
  type: 'blog_post',
  title: 'Generate blog post',
  description: 'Create comprehensive blog article',
  parameters: {
    topic: 'Modern Web Development Best Practices',
    options: {
      tone: 'professional',
      keywords: ['web development', 'best practices', 'modern', 'frontend'],
      length: 'long',
    },
  },
  context,
  priority: 'medium',
  dependencies: [],
  status: 'pending',
  createdAt: new Date(),
  updatedAt: new Date(),
}, context);

// Result includes:
// - title and slug
// - excerpt
// - content (structured blocks)
// - metadata (reading time, category, tags)
// - seo (meta title, description, focus keyword)
```

## 🔧 Agent Configuration

Each agent can be configured with custom settings:

```typescript
const agent = new GraphicDesignAgent();

// Agents have default configuration:
// - maxRetries: 3
// - timeout: 180000ms (3 minutes)
// - tokenLimit: 8000
// - parallel: false
// - priority: 7

// Access configuration
console.log(agent.config);
```

## 🎯 Task Priorities

Tasks can be prioritized:
- `critical` - Urgent, must complete immediately
- `high` - Important, should complete soon
- `medium` - Normal priority
- `low` - Can be deferred

## 🔄 Agent Orchestration

Use the orchestrator to coordinate multiple agents:

```typescript
import { AgentOrchestrator } from './agents/core/orchestrator.js';

const orchestrator = new AgentOrchestrator();

// Register agents
orchestrator.registerAgent(new GraphicDesignAgent());
orchestrator.registerAgent(new ContentGenerationAgent());

// Execute workflow
const result = await orchestrator.executeWorkflow(workflow, context);
```

## 📊 Monitoring & Logging

All agents include built-in logging:

```typescript
// Agents automatically log:
// - Task execution start/end
// - Errors and retries
// - Token usage
// - Execution duration

// Log levels: debug, info, warn, error
```

## 🧪 Testing

```typescript
import { GraphicDesignAgent } from './agents/registry/index.js';

describe('GraphicDesignAgent', () => {
  it('should generate logo', async () => {
    const agent = new GraphicDesignAgent();
    const result = await agent.execute(logoTask, context);
    
    expect(result.success).toBe(true);
    expect(result.data.logo).toBeDefined();
  });
});
```

## 🛠️ Creating Custom Agents

Extend `AgentBase` to create new agents:

```typescript
import { AgentBase } from './core/agent-base.js';
import type { Task, TaskResult, Context } from './core/types.js';

export class CustomAgent extends AgentBase {
  constructor() {
    super({
      id: 'custom-agent',
      name: 'Custom Agent',
      description: 'Does custom things',
      version: '1.0.0',
      category: 'custom',
      capabilities: ['custom_task'],
      skills: ['custom-skill'],
      config: {
        maxRetries: 3,
        timeout: 180000,
        tokenLimit: 8000,
        parallel: false,
        priority: 5,
      },
    });
  }

  async execute(task: Task, context: Context): Promise<TaskResult> {
    // Implement your agent logic
    const result = await this.performCustomTask(task.parameters);

    return {
      success: true,
      data: result,
      metadata: {
        tokensUsed: this.estimateTokens(JSON.stringify(result)),
        duration: 0,
        agent: this.id,
        timestamp: new Date(),
      },
    };
  }

  private async performCustomTask(params: any): Promise<any> {
    // Your custom logic here
    return {};
  }
}
```

## 📚 Additional Resources

- [Agent System Architecture](../docs/architecture/AGENTIC_SYSTEM_ARCHITECTURE.md)
- [Phase 2 Implementation Summary](../docs/planning/PHASE2_IMPLEMENTATION_SUMMARY.md)
- [Implementation Roadmap](../docs/planning/IMPLEMENTATION_ROADMAP.md)
- [Core Types Reference](./core/types.ts)

## 🔗 Related Systems

- **Asset Library:** Reusable design tokens, templates, and components
- **MCP Servers:** External tool integration via Model Context Protocol
- **Workflow Engine:** Multi-step agent orchestration
- **Skills Library:** Reusable agent capabilities

## 🚀 Next Steps

1. Explore individual agent documentation
2. Try the usage examples
3. Create custom agents for your needs
4. Integrate with workflows and MCP servers
5. Extend with custom skills

---

**Version:** 1.0.0 (Phase 2)  
**Status:** Production Ready  
**Last Updated:** 2024