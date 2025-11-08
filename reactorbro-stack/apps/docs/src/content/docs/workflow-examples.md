---
title: Workflow Examples
description: Practical examples of using workflows in ReactorBro Stack
category: examples
order: 5
---

# Workflow Examples

This guide provides practical examples of using workflows in the ReactorBro Stack.

## Quick Start Example

### Creating Your First Workflow

```typescript
import { WorkflowEngine } from '@repo/agents/core';
import { AgentOrchestrator } from '@repo/agents/core';

// Initialize
const orchestrator = new AgentOrchestrator();
const engine = new WorkflowEngine();
engine.setOrchestrator(orchestrator);

// Define workflow
const workflow = {
  id: 'my-first-workflow',
  name: 'My First Workflow',
  description: 'A simple example workflow',
  version: '1.0.0',
  steps: [
    {
      id: 'step-1',
      name: 'Design Step',
      agent: 'graphic-design-agent',
      task: {
        id: 'task-1',
        type: 'custom',
        title: 'Create Design',
        description: 'Generate a design',
        parameters: {},
        context: {},
        priority: 'high',
        dependencies: [],
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      dependsOn: [],
      parallel: false,
      optional: false,
      retryPolicy: {
        maxAttempts: 3,
        delay: 1000,
        backoff: 'exponential',
      },
      timeout: 300000,
    },
  ],
  config: {
    maxConcurrent: 3,
    failFast: false,
    saveState: true,
    notifications: false,
  },
  status: 'draft',
};

// Load and execute
await engine.loadWorkflow(workflow);
const result = await engine.execute('my-first-workflow', {
  id: 'context-1',
  siteId: 'my-site',
  entries: [],
  metadata: {
    totalTokens: 0,
    entryCount: 0,
    size: 0,
  },
});
```

## Using Templates

### Landing Page Workflow

```typescript
import { workflowTemplates } from '@repo/scripts/workflow-templates';

// Get template
const template = workflowTemplates.getTemplate('landing-page');

// Customize workflow
const workflow = {
  ...template.workflow,
  id: 'my-landing-page',
  name: 'My Landing Page',
};

// Execute
await engine.loadWorkflow(workflow);
await engine.execute('my-landing-page', context);
```

### Blog Post Generation

```typescript
// Get blog post template
const blogTemplate = workflowTemplates.getTemplate('blog-post');

// Modify for your needs
blogTemplate.workflow.steps[0].task.parameters = {
  topic: 'React Best Practices',
  wordCount: 1500,
};

await engine.loadWorkflow(blogTemplate.workflow);
await engine.execute('blog-post-workflow', context);
```

## Parallel Execution

### Running Steps in Parallel

```typescript
const workflow = {
  id: 'parallel-workflow',
  name: 'Parallel Workflow',
  // ... other fields
  steps: [
    {
      id: 'step-1',
      name: 'Step 1',
      agent: 'agent-1',
      // ...
      parallel: true, // Enable parallel execution
      dependsOn: [],
    },
    {
      id: 'step-2',
      name: 'Step 2',
      agent: 'agent-2',
      // ...
      parallel: true,
      dependsOn: [], // No dependencies = can run in parallel
    },
  ],
};
```

## Error Handling

### Retry Policies

```typescript
const step = {
  id: 'retry-step',
  name: 'Retry Step',
  agent: 'some-agent',
  retryPolicy: {
    maxAttempts: 5, // Retry up to 5 times
    delay: 2000, // Wait 2 seconds between retries
    backoff: 'exponential', // Exponential backoff
  },
  timeout: 600000, // 10 minute timeout
};
```

### Optional Steps

```typescript
const step = {
  id: 'optional-step',
  name: 'Optional Step',
  agent: 'some-agent',
  optional: true, // Workflow continues even if this fails
  // ...
};
```

## Workflow Composition

### Chaining Workflows

```typescript
// Execute workflow 1
const result1 = await engine.execute('workflow-1', context);

// Use result in workflow 2
const context2 = {
  ...context,
  entries: [
    ...context.entries,
    { type: 'result', data: result1 },
  ],
};

const result2 = await engine.execute('workflow-2', context2);
```

## Monitoring Execution

### Checking Status

```typescript
// Get execution status
const status = await engine.getExecutionStatus('exec-12345');

console.log('Status:', status.status);
console.log('Completed steps:', status.completedSteps);
console.log('Total steps:', status.totalSteps);
```

### Resuming Workflows

```typescript
// Resume a paused or failed workflow
const result = await engine.resumeWorkflow('exec-12345');
```

## Best Practices

1. **Use Templates**: Start with templates and customize as needed
2. **Set Timeouts**: Always set reasonable timeouts for steps
3. **Handle Errors**: Use retry policies and optional steps
4. **Monitor Execution**: Check status regularly for long workflows
5. **Save State**: Enable `saveState` for important workflows
6. **Parallel When Possible**: Use parallel execution for independent steps

## Common Patterns

### Sequential Processing

```typescript
steps: [
  { id: 'step-1', dependsOn: [] },
  { id: 'step-2', dependsOn: ['step-1'] },
  { id: 'step-3', dependsOn: ['step-2'] },
]
```

### Fan-Out Pattern

```typescript
steps: [
  { id: 'step-1', dependsOn: [] },
  { id: 'step-2a', dependsOn: ['step-1'], parallel: true },
  { id: 'step-2b', dependsOn: ['step-1'], parallel: true },
  { id: 'step-2c', dependsOn: ['step-1'], parallel: true },
  { id: 'step-3', dependsOn: ['step-2a', 'step-2b', 'step-2c'] },
]
```

### Conditional Execution

```typescript
steps: [
  { id: 'check-condition', dependsOn: [] },
  { id: 'if-true', dependsOn: ['check-condition'], optional: true },
  { id: 'if-false', dependsOn: ['check-condition'], optional: true },
]
```
