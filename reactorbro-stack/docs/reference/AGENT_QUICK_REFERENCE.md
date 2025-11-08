# Agent Quick Reference Guide

Quick reference for using Phase 2 AI agents in the ReactorBro Stack.

## 🤖 Available Agents

### Design Agents

#### Graphic Design Agent
```typescript
import { GraphicDesignAgent } from '@/agents/registry';

const agent = new GraphicDesignAgent();
```

**Task Types:**
- `logo_design` - Generate logo concepts
- `color_palette_generation` - Create color palettes
- `typography_selection` - Select fonts
- `brand_identity` - Complete brand package

**Example:**
```typescript
const result = await agent.execute({
  type: 'brand_identity',
  parameters: {
    brandInfo: {
      name: 'MyBrand',
      industry: 'technology',
      values: ['innovation', 'trust'],
      targetAudience: 'developers',
      style: 'modern', // modern|classic|playful|minimal|bold
    }
  }
}, context);
```

#### Layout Agent
```typescript
import { LayoutAgent } from '@/agents/registry';

const agent = new LayoutAgent();
```

**Task Types:**
- `page_layout` - Design complete page layout
- `grid_system` - Generate grid system
- `responsive_design` - Create responsive config
- `layout_optimization` - Optimize existing layout

**Example:**
```typescript
const result = await agent.execute({
  type: 'page_layout',
  parameters: {
    pageType: 'landing', // landing|blog|product|about|contact|custom
    requirements: {
      contentComplexity: 'moderate',
      deviceTargets: ['mobile', 'desktop'],
      designStyle: 'modern'
    }
  }
}, context);
```

### Content Agents

#### Content Generation Agent
```typescript
import { ContentGenerationAgent } from '@/agents/registry';

const agent = new ContentGenerationAgent();
```

**Task Types:**
- `page_content` - Generate page content
- `blog_post` - Create blog post
- `copywriting` - Write specific copy
- `cta_creation` - Create call-to-action

**Example:**
```typescript
const result = await agent.execute({
  type: 'page_content',
  parameters: {
    request: {
      pageType: 'landing',
      purpose: 'Convert visitors to customers',
      targetAudience: 'Small businesses',
      tone: 'professional', // professional|casual|friendly|authoritative|playful|inspirational
      length: 'medium', // short|medium|long
      keywords: ['automation', 'productivity']
    }
  }
}, context);
```

#### SEO Optimization Agent
```typescript
import { SEOOptimizationAgent } from '@/agents/registry';

const agent = new SEOOptimizationAgent();
```

**Task Types:**
- `seo_analysis` - Analyze content SEO
- `keyword_research` - Research keywords
- `content_optimization` - Optimize content
- `meta_tag_generation` - Generate meta tags

**Example:**
```typescript
const result = await agent.execute({
  type: 'seo_analysis',
  parameters: {
    content: pageContent,
    url: 'https://example.com/page'
  }
}, context);
```

## 🔧 Common Patterns

### Create Context
```typescript
import type { Context } from '@/agents/core/types';

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
    size: 0
  }
};
```

### Execute with Retry
```typescript
// Automatic retry with exponential backoff
const result = await agent.executeWithRetry(task, context);
```

### Get Agent Info
```typescript
const info = agent.getInfo();
console.log(info.capabilities); // Array of capabilities
console.log(info.skills);       // Array of skills
console.log(info.status);       // Current status
```

### Handle Results
```typescript
const result = await agent.execute(task, context);

if (result.success) {
  console.log('Data:', result.data);
  console.log('Tokens used:', result.metadata.tokensUsed);
  console.log('Duration:', result.metadata.duration);
} else {
  console.error('Task failed');
}
```

## 📦 Registry Helpers

### Get Agent by ID
```typescript
import { getAgentById } from '@/agents/registry';

const agent = getAgentById('graphic-design-agent');
```

### Get Agents by Category
```typescript
import { getAgentsByCategory } from '@/agents/registry';

const designAgents = getAgentsByCategory('design');
const contentAgents = getAgentsByCategory('content');
```

### Get All Agent Info
```typescript
import { getAllAgentInfo } from '@/agents/registry';

const allAgents = getAllAgentInfo();
allAgents.forEach(agent => {
  console.log(`${agent.name}: ${agent.capabilities.join(', ')}`);
});
```

## 🎨 Design Token Usage

### Load Color Palette
```typescript
import modernTech from '@/assets/library/design-tokens/colors/modern-tech-palette.json';

const primaryColor = modernTech.colors.primary.default; // "#6366F1"
const neutrals = modernTech.colors.neutral;
```

### Available Palettes
- `modern-tech-palette.json` - Vibrant tech colors
- `warm-organic-palette.json` - Earthy wellness colors
- `minimal-monochrome-palette.json` - Sophisticated grayscale

## 🔄 Workflow Usage

### Load Workflow
```typescript
import pageDesignWorkflow from '@/agents/workflows/definitions/page-design-workflow.yaml';

// Workflow includes:
// 1. Brand Identity Setup
// 2. Page Layout Design
// 3. Content Generation
// 4. SEO Optimization
// 5. Meta Tag Generation
// 6. Final Assembly
```

### Execute Workflow
```typescript
import { WorkflowEngine } from '@/agents/core/workflow-engine';

const engine = new WorkflowEngine();
const result = await engine.execute(workflow, inputs);
```

## 🎯 Task Structure

### Minimal Task
```typescript
const task: Task = {
  id: 'task-1',
  type: 'logo_design',
  title: 'Generate logo',
  description: 'Create brand logo',
  parameters: { /* task-specific params */ },
  context: context,
  priority: 'high',
  dependencies: [],
  status: 'pending',
  createdAt: new Date(),
  updatedAt: new Date()
};
```

### Task Priorities
- `critical` - Must complete immediately
- `high` - Important, complete soon
- `medium` - Normal priority
- `low` - Can be deferred

## 🔍 Type References

### Common Types
```typescript
// Agent categories
type AgentCategory = 'design' | 'content' | 'planning' | 'optimization' | 'analysis';

// Task types
type TaskType = 'design' | 'content_generation' | 'seo_optimization' | 'planning' | 'custom';

// Task status
type TaskStatus = 'pending' | 'queued' | 'running' | 'paused' | 'completed' | 'failed';

// Agent status
type AgentStatus = 'idle' | 'running' | 'paused' | 'error' | 'completed';
```

## ⚙️ Configuration

### Agent Config
```typescript
const config = {
  maxRetries: 3,        // Number of retry attempts
  timeout: 180000,      // Timeout in ms (3 min)
  tokenLimit: 8000,     // Max tokens per task
  parallel: false,      // Allow parallel execution
  priority: 7           // Agent priority (1-10)
};
```

### Modify Agent Config
```typescript
const agent = new GraphicDesignAgent();
agent.config.maxRetries = 5;
agent.config.timeout = 300000; // 5 minutes
```

## 📊 Output Examples

### Graphic Design Agent Output
```typescript
{
  logo: {
    type: 'combination',
    description: '...',
    variations: [...],
    files: { svg: '...', png: '...' }
  },
  colors: {
    primary: '#6366F1',
    secondary: '#8B5CF6',
    accent: '#10B981',
    neutral: { ... },
    semantic: { ... }
  },
  typography: {
    headings: { family: 'Inter', ... },
    body: { family: 'Inter', ... },
    scale: { ... }
  }
}
```

### Layout Agent Output
```typescript
{
  type: 'landing',
  structure: {
    header: { type: 'sticky', ... },
    main: { maxWidth: '1280px', ... },
    footer: { type: 'comprehensive', ... }
  },
  grid: {
    type: '12-column',
    columns: 12,
    gap: '2rem',
    breakpoints: [...]
  },
  sections: [
    { id: 'hero', type: 'hero', ... },
    { id: 'features', type: 'features', ... }
  ]
}
```

### Content Generation Output
```typescript
{
  headline: 'Transform Your Business Today',
  subheadline: 'Join thousands who have...',
  body: [
    { type: 'paragraph', content: '...' },
    { type: 'list', content: [...] }
  ],
  cta: {
    primary: { text: 'Get Started', action: '/signup' },
    secondary: { text: 'Learn More', action: '/about' }
  },
  metadata: {
    wordCount: 450,
    readingTime: 3,
    tone: 'professional',
    keywords: [...]
  }
}
```

### SEO Analysis Output
```typescript
{
  score: 85,
  issues: [
    {
      severity: 'warning',
      category: 'metadata',
      message: 'Title too long',
      fix: 'Keep title under 60 characters'
    }
  ],
  recommendations: [...],
  keywords: {
    primary: 'automation',
    secondary: ['productivity', 'efficiency'],
    density: { ... }
  },
  metadata: {
    title: { content: '...', optimal: true },
    description: { ... }
  },
  readability: {
    score: 75,
    gradeLevel: 8
  }
}
```

## 🚨 Error Handling

### Try-Catch Pattern
```typescript
try {
  const result = await agent.execute(task, context);
  // Handle success
} catch (error) {
  if (error instanceof AgentError) {
    console.error(`Agent error: ${error.message}`);
    console.error(`Recoverable: ${error.recoverable}`);
  } else if (error instanceof TokenLimitError) {
    console.error('Token limit exceeded');
  }
}
```

### Graceful Degradation
```typescript
const result = await agent.executeWithRetry(task, context)
  .catch(error => {
    console.error('All retries failed, using fallback');
    return fallbackResult;
  });
```

## 📝 Best Practices

1. **Always validate inputs** before passing to agents
2. **Use retry logic** for production code
3. **Set appropriate timeouts** based on task complexity
4. **Monitor token usage** to stay within budgets
5. **Log all agent activities** for debugging
6. **Handle errors gracefully** with fallbacks
7. **Use type guards** for runtime safety

## 🔗 Related Documentation

- [Agent System README](../../agents/README.md)
- [Phase 2 Implementation Summary](../planning/PHASE2_IMPLEMENTATION_SUMMARY.md)
- [Agentic System Architecture](../architecture/AGENTIC_SYSTEM_ARCHITECTURE.md)
- [Core Types](../../agents/core/types.ts)

## 📞 Support

For issues or questions:
- Check the full documentation in `/docs`
- Review agent source code in `/agents/registry`
- Consult type definitions in `/agents/core/types.ts`

---

**Version:** 1.0.0 (Phase 2)  
**Last Updated:** 2024