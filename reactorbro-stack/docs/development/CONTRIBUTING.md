# Contributing to ReactorJet Stack

Thank you for your interest in contributing to the ReactorJet Stack! This guide will help you get started with contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Conventions](#commit-conventions)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Common Tasks](#common-tasks)
- [Troubleshooting](#troubleshooting)

---

## 🤝 Code of Conduct

### Our Standards

- **Be respectful** - Treat everyone with respect and professionalism
- **Be collaborative** - Work together to achieve common goals
- **Be constructive** - Provide helpful feedback and suggestions
- **Be inclusive** - Welcome diverse perspectives and experiences
- **Be patient** - Help others learn and grow

### Unacceptable Behavior

- Harassment, discrimination, or offensive comments
- Personal attacks or trolling
- Publishing others' private information
- Other conduct which could reasonably be considered inappropriate

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **pnpm** 9.0+ (`npm install -g pnpm`)
- **DDEV** ([Installation Guide](https://ddev.readthedocs.io/en/stable/users/install/))
- **Git** ([Download](https://git-scm.com/))
- **Code Editor** - VS Code recommended (with our extensions)

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/reactorbro-stack.git
   cd reactorbro-stack
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your local values
   ```

4. **Build design tokens**
   ```bash
   pnpm so tokens
   ```

5. **Initialize WordPress**
   ```bash
   pnpm so wp:init
   pnpm so wp:plugins
   ```

6. **Start development**
   ```bash
   pnpm -C apps/astro dev
   ```

### VS Code Setup

Install recommended extensions when prompted, or manually:

```bash
code --install-extension astro-build.astro-vscode
code --install-extension biomejs.biome
code --install-extension bradlc.vscode-tailwindcss
# ... see .vscode/extensions.json for full list
```

---

## 🔄 Development Workflow

### Branching Strategy

We follow **Git Flow** with these branch types:

- `main` - Production-ready code (protected)
- `develop` - Integration branch for features (protected)
- `feature/*` - New features
- `fix/*` - Bug fixes
- `hotfix/*` - Critical production fixes
- `refactor/*` - Code refactoring
- `docs/*` - Documentation updates
- `test/*` - Test improvements

### Creating a Branch

```bash
# Feature branch
git checkout -b feature/add-homepage-hero

# Bug fix branch
git checkout -b fix/navigation-mobile-menu

# Refactor branch
git checkout -b refactor/ui-components
```

### Branch Naming Conventions

- Use lowercase with hyphens
- Start with type prefix (feature/, fix/, etc.)
- Be descriptive but concise
- Reference issue number when applicable

**Good:**
- `feature/user-authentication`
- `fix/graphql-timeout-error`
- `docs/update-readme-setup`

**Bad:**
- `my-feature`
- `fix`
- `FEATURE-USER-AUTH`

---

## 💻 Coding Standards

### General Principles

1. **Write clean, readable code** - Code is read more than written
2. **Keep functions small** - Single Responsibility Principle
3. **Use meaningful names** - Self-documenting code
4. **Comment complex logic** - Explain "why", not "what"
5. **Avoid premature optimization** - Make it work, then make it fast
6. **Follow DRY** - Don't Repeat Yourself

### TypeScript

```typescript
// ✅ Good: Type-safe with clear interfaces
interface Post {
  id: string;
  title: string;
  content: string;
  publishedAt: Date;
}

function formatPost(post: Post): string {
  return `${post.title} - ${post.publishedAt.toLocaleDateString()}`;
}

// ❌ Bad: Using 'any' defeats the purpose of TypeScript
function formatPost(post: any): string {
  return `${post.title} - ${post.date}`;
}
```

### Component Structure

```typescript
// ✅ Good: Organized with clear sections
---
// Imports
import Layout from '@layouts/Layout.astro';
import { cn } from '@repo/ui';

// Types
interface Props {
  title: string;
  subtitle?: string;
}

// Props destructuring with defaults
const { title, subtitle = 'Default subtitle' } = Astro.props;

// Data fetching / logic
const posts = await fetchPosts();
---

<!-- Template -->
<Layout>
  <h1 class={cn('heading', subtitle && 'with-subtitle')}>
    {title}
  </h1>
  {subtitle && <p>{subtitle}</p>}
</Layout>
```

### Styling

```typescript
// ✅ Good: Use design tokens and UI utilities
import { cn, patterns } from '@repo/ui';

const className = cn(
  patterns.card,
  'hover:shadow-lg',
  isActive && 'border-primary-600'
);

// ❌ Bad: Hardcoded values
const className = 'p-4 rounded shadow bg-white border-2 border-blue-500';
```

### File Naming

- **Components**: PascalCase - `HeroSection.astro`
- **Utilities**: camelCase - `formatDate.ts`
- **Tests**: Same as file + `.test` - `formatDate.test.ts`
- **Types**: PascalCase + `.types` - `Post.types.ts`

### Directory Structure

```
src/
├── components/       # Reusable components
│   ├── common/      # Generic components (Button, Card)
│   ├── layout/      # Layout components (Header, Footer)
│   └── sections/    # Page sections (Hero, Features)
├── layouts/         # Page layouts
├── pages/           # Astro pages (routes)
├── styles/          # Global styles
├── lib/             # Utilities and helpers
├── types/           # TypeScript types
└── test/            # Test utilities and fixtures
```

---

## 📝 Commit Conventions

We use **Conventional Commits** for clear, semantic commit history.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style (formatting, no logic change)
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `test` - Test additions/updates
- `build` - Build system changes
- `ci` - CI/CD changes
- `chore` - Maintenance tasks
- `revert` - Revert previous commit
- `content` - Content changes (WordPress)
- `design` - Design token or UI changes

### Scopes

- `astro` - Astro app
- `wp` - WordPress
- `tokens` - Design tokens
- `ui` - UI package
- `scripts` - Scripts package
- `docs` - Documentation
- `config` - Configuration
- `graphql` - GraphQL

### Examples

```bash
# Simple feature
feat(astro): add hero section to homepage

# Bug fix with scope
fix(graphql): resolve timeout on large queries

# Breaking change
feat(tokens)!: restructure color token naming

BREAKING CHANGE: Color tokens now use semantic names instead of numeric scales

# Multiple changes
refactor(ui): improve utility function performance

- Optimize cn() function
- Add memoization to variants()
- Update TypeScript definitions
```

### Using Commitizen

We provide interactive commit tool:

```bash
# Instead of git commit
pnpm commit

# Follow the prompts
```

### Pre-commit Hooks

Commits are automatically validated:

- ✅ Biome linting and formatting
- ✅ TypeScript type checking
- ✅ Commit message format
- ✅ No console.log statements
- ✅ File size limits

---

## 🔀 Pull Request Process

### Before Creating a PR

1. **Update from main**
   ```bash
   git checkout main
   git pull origin main
   git checkout your-branch
   git rebase main
   ```

2. **Run tests**
   ```bash
   pnpm run test
   pnpm -C apps/astro check
   ```

3. **Build locally**
   ```bash
   pnpm run build
   ```

4. **Format code**
   ```bash
   pnpm run format
   ```

### Creating a PR

1. **Push your branch**
   ```bash
   git push origin your-branch
   ```

2. **Open PR on GitHub**
   - Use the PR template (auto-populated)
   - Fill in all sections completely
   - Add screenshots for UI changes
   - Link related issues

3. **PR Title Format**
   ```
   feat(astro): add user authentication system
   fix(wp): resolve GraphQL caching issue
   docs: update contributing guide
   ```

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests pass
- [ ] No new warnings or errors
- [ ] Design tokens used (not hardcoded values)
- [ ] PR description is complete
- [ ] Screenshots added (for UI changes)

### Review Process

1. **Automated Checks** - Must pass before review
   - Biome linting
   - TypeScript compilation
   - Test suite
   - Build process

2. **Code Review** - At least 1 approval required
   - Review within 24 hours (weekdays)
   - Provide constructive feedback
   - Approve when satisfied

3. **Address Feedback**
   - Make requested changes
   - Reply to comments
   - Re-request review

4. **Merge**
   - Squash and merge preferred
   - Delete branch after merge
   - Update related issues

### Review Guidelines

**As a Reviewer:**

- ✅ Check logic and implementation
- ✅ Test locally when possible
- ✅ Verify tests are adequate
- ✅ Ensure documentation is updated
- ✅ Be respectful and constructive
- ✅ Approve if all standards met

**As an Author:**

- ✅ Respond to all comments
- ✅ Don't take feedback personally
- ✅ Ask questions if unclear
- ✅ Update PR based on feedback
- ✅ Thank reviewers

---

## 🧪 Testing Guidelines

### Test Requirements

- **New features** must have tests
- **Bug fixes** must have regression tests
- **Aim for 80%+ coverage**
- **Write tests as you code**, not after

### Running Tests

```bash
# Run all tests
pnpm -C apps/astro test

# Watch mode
pnpm -C apps/astro test:watch

# With coverage
pnpm -C apps/astro test:coverage

# Single file
pnpm -C apps/astro test src/lib/formatDate.test.ts
```

### Writing Tests

```typescript
// formatDate.test.ts
import { describe, it, expect } from 'vitest';
import { formatDate } from './formatDate';

describe('formatDate', () => {
  it('should format date correctly', () => {
    const result = formatDate('2024-01-15T00:00:00');
    expect(result).toBe('January 15, 2024');
  });

  it('should handle invalid dates', () => {
    expect(() => formatDate('invalid')).toThrow();
  });
});
```

### Test Structure

- **Arrange** - Set up test data
- **Act** - Execute the code
- **Assert** - Verify the result

### Test Naming

```typescript
// ✅ Good: Descriptive test names
it('should return empty array when no posts found', () => {});
it('should throw error when GraphQL endpoint is unreachable', () => {});

// ❌ Bad: Vague test names
it('works', () => {});
it('test 1', () => {});
```

---

## 📚 Documentation

### What to Document

1. **Code Comments**
   - Complex algorithms
   - Non-obvious decisions
   - Workarounds and hacks
   - Public APIs

2. **README Updates**
   - New features
   - Configuration changes
   - Breaking changes

3. **Inline Documentation**
   - JSDoc for functions
   - TypeScript interfaces
   - Component props

### Documentation Standards

```typescript
/**
 * Fetches posts from WordPress GraphQL API
 *
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of posts
 * @param {string} options.category - Category slug to filter
 * @returns {Promise<Post[]>} Array of posts
 * @throws {Error} When GraphQL endpoint is unreachable
 *
 * @example
 * const posts = await fetchPosts({ limit: 10, category: 'news' });
 */
async function fetchPosts(options: FetchOptions): Promise<Post[]> {
  // Implementation
}
```

---

## 🔧 Common Tasks

### Adding a New Component

1. Create component file
   ```bash
   # apps/astro/src/components/common/Button.astro
   ```

2. Write component with types
3. Add to barrel export (if applicable)
4. Write tests
5. Document usage
6. Use in pages

### Adding a New Design Token

1. Edit `packages/tokens/tokens.json`
2. Run `pnpm so tokens`
3. Use in Tailwind classes
4. Update documentation

### Adding a New WordPress Plugin

1. Add to `Makefile` under `wp:plugins`
2. Document in README
3. Update WordPress setup docs

### Creating a New Package

1. Create directory in `packages/`
2. Add `package.json` with `@repo/` name
3. Update `pnpm-workspace.yaml`
4. Add to `turbo.json` pipeline
5. Run `pnpm install` from root

---

## 🐛 Troubleshooting

### Common Issues

**Issue: pnpm install fails**
```bash
# Clear cache and reinstall
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

**Issue: DDEV not starting**
```bash
ddev stop
ddev start
# Check status
ddev describe
```

**Issue: Port conflicts**
```bash
# Check what's using port 4321
lsof -i :4321
# Kill process if needed
kill -9 <PID>
```

**Issue: Git hooks not working**
```bash
# Reinstall Husky
rm -rf .husky
pnpm prepare
```

### Getting Help

1. **Check documentation** - README, this guide, package docs
2. **Search issues** - GitHub issues for similar problems
3. **Ask the team** - Slack/Discord/Team chat
4. **Create an issue** - Use issue templates

---

## 🎯 Best Practices Summary

### DO

- ✅ Write tests for new features
- ✅ Use design tokens and UI utilities
- ✅ Follow commit conventions
- ✅ Document complex logic
- ✅ Keep PRs focused and small
- ✅ Update documentation
- ✅ Ask questions when unsure
- ✅ Review code thoroughly

### DON'T

- ❌ Commit directly to main
- ❌ Skip tests
- ❌ Use hardcoded values
- ❌ Leave console.log statements
- ❌ Push broken code
- ❌ Ignore linter warnings
- ❌ Create massive PRs
- ❌ Rush code reviews

---

## 📞 Questions?

If you have questions or need help:

- **Documentation**: Check README.md and package docs
- **Team Chat**: Ask in your team channel
- **Issues**: Create a GitHub issue
- **Discussions**: Use GitHub Discussions for broader topics

---

**Thank you for contributing to ReactorJet Stack! 🚀**

Your contributions help make this project better for everyone.