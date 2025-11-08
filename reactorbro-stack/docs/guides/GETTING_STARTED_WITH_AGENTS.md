# Getting Started with AI Agents

Welcome! This guide will help you start using the Phase 2 AI agents in your ReactorBro Stack projects.

## 📚 Prerequisites

- Node.js 18+ installed
- ReactorBro Stack set up and running
- Basic TypeScript knowledge
- Familiarity with async/await

## 🚀 Quick Start (5 minutes)

### 1. Import an Agent

```typescript
import { GraphicDesignAgent } from './agents/registry';
```

### 2. Create a Context

```typescript
import type { Context } from './agents/core/types';

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
```

### 3. Execute a Task

```typescript
const agent = new GraphicDesignAgent();

const result = await agent.execute({
  id: 'task-1',
  type: 'brand_identity',
  title: 'Create brand identity',
  description: 'Generate complete brand identity',
  parameters: {
    brandInfo: {
      name: 'MyBrand',
      industry: 'technology',
      values: ['innovation', 'trust'],
      targetAudience: 'developers',
      style: 'modern',
    },
  },
  context,
  priority: 'high',
  dependencies: [],
  status: 'pending',
  createdAt: new Date(),
  updatedAt: new Date(),
}, context);

console.log('Brand created:', result.data);
```

That's it! You've just used your first AI agent. 🎉

---

## 📖 Detailed Walkthrough

### Understanding Agents

Each agent is a specialized AI worker that can perform specific tasks:

- **GraphicDesignAgent** - Creates visual assets and brand identities
- **LayoutAgent** - Designs page layouts and grid systems
- **ContentGenerationAgent** - Generates content and copy
- **SEOOptimizationAgent** - Analyzes and optimizes for SEO

### The Task Structure

Every agent task needs:

1. **ID** - Unique identifier
2. **Type** - What kind of task (e.g., 'logo_design', 'page_layout')
3. **Parameters** - Task-specific input data
4. **Context** - Shared state and history
5. **Metadata** - Priority, dependencies, timestamps

### The Result Structure

Every agent returns:

```typescript
{
  success: boolean,          // Did the task succeed?
  data: any,                 // The actual result
  metadata: {
    tokensUsed: number,      // How many tokens were used
    duration: number,        // How long it took (ms)
    agent: string,           // Which agent executed it
    timestamp: Date,         // When it completed
  }
}
```

---

## 🎯 Common Use Cases

### 1. Generate a Logo

```typescript
import { GraphicDesignAgent } from './agents/registry';

const agent = new GraphicDesignAgent();

const result = await agent.execute({
  id: 'logo-task',
  type: 'logo_design',
  title: 'Generate logo',
  description: 'Create brand logo',
  parameters: {
    brandInfo: {
      name: 'Acme Corp',
      industry: 'technology',
      values: ['innovation', 'reliability'],
      targetAudience: 'businesses',
      style: 'modern',
    },
  },
  context,
  priority: 'high',
  dependencies: [],
  status: 'pending',
  createdAt: new Date(),
  updatedAt: new Date(),
}, context);

const logo = result.data;
console.log('Logo type:', logo.type);
console.log('Variations:', logo.variations);
```

### 2. Create Color Palette

```typescript
const result = await agent.execute({
  id: 'palette-task',
  type: 'color_palette_generation',
  title: 'Create color palette',
  description: 'Generate harmonious colors',
  parameters: {
    baseColor: '#3B82F6',
    style: 'modern',
  },
  context,
  priority: 'medium',
  dependencies: [],
  status: 'pending',
  createdAt: new Date(),
  updatedAt: new Date(),
}, context);

const colors = result.data;
console.log('Primary:', colors.primary);
console.log('Secondary:', colors.secondary);
console.log('Accent:', colors.accent);
```

### 3. Design Page Layout

```typescript
import { LayoutAgent } from './agents/registry';

const agent = new LayoutAgent();

const result = await agent.execute({
  id: 'layout-task',
  type: 'page_layout',
  title: 'Design landing page',
  description: 'Create responsive layout',
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

const layout = result.data;
console.log('Grid system:', layout.grid);
console.log('Sections:', layout.sections);
```

### 4. Generate Content

```typescript
import { ContentGenerationAgent } from './agents/registry';

const agent = new ContentGenerationAgent();

const result = await agent.execute({
  id: 'content-task',
  type: 'page_content',
  title: 'Generate page content',
  description: 'Create landing page copy',
  parameters: {
    request: {
      pageType: 'landing',
      purpose: 'Convert visitors to customers',
      targetAudience: 'Small businesses',
      tone: 'professional',
      length: 'medium',
      keywords: ['automation', 'productivity'],
    },
  },
  context,
  priority: 'high',
  dependencies: [],
  status: 'pending',
  createdAt: new Date(),
  updatedAt: new Date(),
}, context);

const content = result.data;
console.log('Headline:', content.headline);
console.log('CTA:', content.cta);
```

### 5. Analyze SEO

```typescript
import { SEOOptimizationAgent } from './agents/registry';

const agent = new SEOOptimizationAgent();

const result = await agent.execute({
  id: 'seo-task',
  type: 'seo_analysis',
  title: 'Analyze SEO',
  description: 'Check SEO performance',
  parameters: {
    content: pageContent,
    url: 'https://example.com/page',
  },
  context,
  priority: 'medium',
  dependencies: [],
  status: 'pending',
  createdAt: new Date(),
  updatedAt: new Date(),
}, context);

const analysis = result.data;
console.log('SEO Score:', analysis.score);
console.log('Issues:', analysis.issues);
console.log('Recommendations:', analysis.recommendations);
```

---

## 🔄 Chaining Agents

Agents can work together sequentially:

```typescript
import { 
  GraphicDesignAgent, 
  LayoutAgent, 
  ContentGenerationAgent 
} from './agents/registry';

// 1. Create brand identity
const designAgent = new GraphicDesignAgent();
const brand = await designAgent.execute({
  type: 'brand_identity',
  parameters: { brandInfo: { /* ... */ } },
  // ... other task properties
}, context);

// 2. Design layout using brand colors
const layoutAgent = new LayoutAgent();
const layout = await layoutAgent.execute({
  type: 'page_layout',
  parameters: { 
    pageType: 'landing',
    requirements: { designStyle: 'modern' }
  },
  // ... other task properties
}, context);

// 3. Generate content matching brand voice
const contentAgent = new ContentGenerationAgent();
const content = await contentAgent.execute({
  type: 'page_content',
  parameters: {
    request: {
      pageType: 'landing',
      tone: 'professional',
      // ... other content parameters
    }
  },
  // ... other task properties
}, context);

console.log('Complete page created!');
```

---

## ⚙️ Configuration

### Adjust Agent Settings

```typescript
const agent = new GraphicDesignAgent();

// View current config
console.log(agent.config);

// Modify settings
agent.config.maxRetries = 5;
agent.config.timeout = 300000; // 5 minutes
agent.config.tokenLimit = 10000;
```

### Use Retry Logic

```typescript
// Automatic retry with exponential backoff
try {
  const result = await agent.executeWithRetry(task, context);
  console.log('Success:', result.data);
} catch (error) {
  console.error('Failed after retries:', error);
}
```

---

## 🎨 Using Design Tokens

Load and use color palettes:

```typescript
import modernTech from '@/assets/library/design-tokens/colors/modern-tech-palette.json';
import warmOrganic from '@/assets/library/design-tokens/colors/warm-organic-palette.json';
import minimal from '@/assets/library/design-tokens/colors/minimal-monochrome-palette.json';

// Use in your design
const primaryColor = modernTech.colors.primary.default;
const secondaryColor = modernTech.colors.secondary.default;

console.log('Primary:', primaryColor); // #6366F1
```

Available palettes:
- `modern-tech-palette.json` - Vibrant tech colors (WCAG AA)
- `warm-organic-palette.json` - Earthy wellness colors (WCAG AA)
- `minimal-monochrome-palette.json` - Sophisticated grayscale (WCAG AAA)

---

## 📊 Monitoring & Debugging

### Check Token Usage

```typescript
const result = await agent.execute(task, context);
console.log('Tokens used:', result.metadata.tokensUsed);
console.log('Duration:', result.metadata.duration, 'ms');
```

### Log Agent Activity

Agents automatically log their activities:

```typescript
// Logs appear in console:
// [2024-01-01T12:00:00Z] [INFO] [graphic-design-agent] Generating logo concept
// [2024-01-01T12:00:30Z] [INFO] [graphic-design-agent] Logo concept created
```

### Get Agent Info

```typescript
const agent = new GraphicDesignAgent();
const info = agent.getInfo();

console.log('Agent:', info.name);
console.log('Capabilities:', info.capabilities);
console.log('Skills:', info.skills);
console.log('Status:', info.status);
```

---

## 🚨 Error Handling

### Basic Try-Catch

```typescript
try {
  const result = await agent.execute(task, context);
  // Handle success
} catch (error) {
  console.error('Error:', error.message);
}
```

### Handle Specific Errors

```typescript
import { AgentError, TokenLimitError } from './agents/core/types';

try {
  const result = await agent.execute(task, context);
} catch (error) {
  if (error instanceof TokenLimitError) {
    console.error('Token limit exceeded!');
  } else if (error instanceof AgentError) {
    console.error('Agent error:', error.message);
    console.log('Recoverable:', error.recoverable);
  } else {
    console.error('Unknown error:', error);
  }
}
```

### Graceful Degradation

```typescript
const result = await agent.execute(task, context).catch(error => {
  console.error('Task failed, using fallback');
  return fallbackResult;
});
```

---

## 🎓 Best Practices

### 1. Validate Inputs

```typescript
function validateBrandInfo(brandInfo: any): boolean {
  if (!brandInfo.name || !brandInfo.industry) {
    throw new Error('Missing required brand info');
  }
  return true;
}

validateBrandInfo(brandInfo);
const result = await agent.execute(task, context);
```

### 2. Reuse Context

```typescript
// Create context once
const context = createContext();

// Use for multiple tasks
const logo = await agent1.execute(task1, context);
const layout = await agent2.execute(task2, context);
const content = await agent3.execute(task3, context);

// Context maintains history and state
console.log('Total tokens used:', context.metadata.totalTokens);
```

### 3. Set Appropriate Timeouts

```typescript
// Quick tasks
agent.config.timeout = 60000; // 1 minute

// Complex tasks
agent.config.timeout = 300000; // 5 minutes
```

### 4. Monitor Token Usage

```typescript
let totalTokens = 0;

const result = await agent.execute(task, context);
totalTokens += result.metadata.tokensUsed;

if (totalTokens > 50000) {
  console.warn('High token usage detected');
}
```

### 5. Use TypeScript Types

```typescript
import type { 
  BrandInfo, 
  Logo, 
  ColorPalette,
  Layout,
  ContentRequest
} from './agents/registry';

// Type-safe inputs
const brandInfo: BrandInfo = {
  name: 'MyBrand',
  industry: 'technology',
  values: ['innovation'],
  targetAudience: 'developers',
  style: 'modern',
};
```

---

## 🔗 Helper Functions

### Create Task Helper

```typescript
function createTask(
  type: string,
  parameters: any,
  context: Context
): Task {
  return {
    id: `task-${Date.now()}`,
    type,
    title: `Execute ${type}`,
    description: `Task for ${type}`,
    parameters,
    context,
    priority: 'medium',
    dependencies: [],
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// Usage
const task = createTask('logo_design', { brandInfo }, context);
```

### Create Context Helper

```typescript
function createContext(sessionId?: string): Context {
  return {
    id: `ctx-${Date.now()}`,
    sessionId: sessionId || `session-${Date.now()}`,
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
}

// Usage
const context = createContext();
```

---

## 📚 Next Steps

### Learn More
- Read the [Agent Quick Reference](../reference/AGENT_QUICK_REFERENCE.md)
- Review [Phase 2 Complete](../../PHASE2_COMPLETE.md)
- Explore agent source code in `/agents/registry`

### Try Advanced Features
- Chain multiple agents together
- Use workflows for automation
- Create custom agents
- Integrate with MCP servers (Phase 3)

### Get Help
- Check the [Agent System README](../../agents/README.md)
- Review type definitions in `/agents/core/types.ts`
- Consult the [Architecture Documentation](../architecture/AGENTIC_SYSTEM_ARCHITECTURE.md)

---

## 🎉 You're Ready!

You now know how to:
- ✅ Import and create agents
- ✅ Execute tasks with proper structure
- ✅ Handle results and errors
- ✅ Chain agents together
- ✅ Use design tokens
- ✅ Monitor and debug

**Start building amazing things with AI agents!** 🚀

---

**Version:** 1.0.0 (Phase 2)  
**Last Updated:** 2024  
**Status:** Complete