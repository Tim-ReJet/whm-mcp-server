# Contributing to ReactorBro Stack

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- Git

### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/reactorbro-stack.git
   cd reactorbro-stack
   ```

3. Install dependencies:
   ```bash
   pnpm install
   ```

4. Create a branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 📝 Development Workflow

### Branch Naming

Follow these conventions:

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions/changes
- `chore/` - Maintenance tasks

Examples:
- `feature/add-user-authentication`
- `fix/resolve-memory-leak`
- `docs/update-api-documentation`

### Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/) with commitlint.

Format: `<type>(<scope>): <subject>`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding/updating tests
- `build`: Build system changes
- `ci`: CI/CD changes
- `chore`: Other changes

Examples:
```bash
git commit -m "feat(astro): add user authentication"
git commit -m "fix(scripts): resolve memory leak in asset manager"
git commit -m "docs(readme): update installation instructions"
```

Or use the interactive commit tool:
```bash
pnpm commit
```

### Making Changes

1. Make your changes
2. Run linting:
   ```bash
   pnpm lint
   ```

3. Run tests:
   ```bash
   pnpm test
   ```

4. Format code:
   ```bash
   pnpm format
   ```

5. Build to verify:
   ```bash
   pnpm build
   ```

## 🔀 Pull Request Process

### Before Submitting

1. **Update your branch**:
   ```bash
   git checkout main
   git pull upstream main
   git checkout your-branch
   git rebase main
   ```

2. **Ensure all checks pass**:
   - Linting
   - Type checking
   - Tests
   - Build

3. **Follow the PR template**:
   - Fill out all relevant sections
   - Add screenshots if UI changes
   - Link related issues

### PR Requirements

- ✅ All CI checks must pass
- ✅ At least one approval required
- ✅ PR must be up to date with base branch
- ✅ Follow conventional commit format for PR title
- ✅ Include tests for new features
- ✅ Update documentation if needed

### PR Title Format

Follow conventional commits:
- `feat(scope): description`
- `fix(scope): description`
- `docs(scope): description`

Examples:
- `feat(astro): add user authentication`
- `fix(scripts): resolve memory leak`
- `docs(readme): update installation guide`

### Review Process

1. PR is automatically labeled based on changes
2. CI checks run automatically
3. Reviewers will review your code
4. Address any feedback
5. Once approved, maintainers will merge

## 📦 Versioning

We use [Changesets](https://github.com/changesets/changesets) for versioning.

### Adding a Changeset

When making changes that affect package versions:

1. Create a changeset:
   ```bash
   pnpm changeset
   ```

2. Select the packages affected
3. Choose version bump type (major/minor/patch)
4. Write a summary of changes

### Release Process

1. Changesets are automatically processed
2. Version PR is created
3. After merge, packages are published
4. GitHub release is created

## 🧪 Testing

### Running Tests

```bash
# All tests
pnpm test

# Unit tests only
pnpm test:unit

# Integration tests
pnpm test:integration

# E2E tests
pnpm test:e2e

# Watch mode
pnpm test:watch
```

### Writing Tests

- Write tests for new features
- Update tests when fixing bugs
- Aim for good coverage
- Use descriptive test names

## 📚 Code Style

### Formatting

We use Biome and Prettier:
- Run `pnpm format` before committing
- Formatting is checked in CI

### Linting

We use Biome:
- Run `pnpm lint` before committing
- Linting is checked in CI

### TypeScript

- Use TypeScript for all new code
- Avoid `any` types
- Use proper type definitions
- Run type checking: `pnpm -C apps/astro check`

## 🐛 Reporting Issues

### Bug Reports

Include:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Screenshots if applicable

### Feature Requests

Include:
- Use case description
- Proposed solution
- Alternatives considered
- Additional context

## 📖 Documentation

### Updating Docs

- Update relevant docs when making changes
- Add examples for new features
- Keep API docs up to date
- Use clear, concise language

### Doc Structure

- `README.md` - Main project documentation
- `docs/` - Detailed documentation
- Code comments - Inline documentation

## 🔒 Security

### Reporting Security Issues

**Do not** open public issues for security vulnerabilities.

Instead:
1. Email security concerns privately
2. Include detailed information
3. Wait for response before disclosure

## 💡 Tips

- Keep PRs focused and small
- Write clear commit messages
- Test your changes thoroughly
- Ask questions if unsure
- Be respectful and constructive

## 📞 Getting Help

- Check existing documentation
- Search closed issues
- Ask in discussions
- Open an issue for bugs

## 🙏 Thank You!

Your contributions make this project better. We appreciate your time and effort!

