# Branch Strategy

This document outlines our Git branching strategy and workflow.

## 🌳 Branch Structure

### Main Branches

- **`main`** - Production-ready code
  - Protected branch
  - Requires PR and approval
  - All commits must pass CI
  - Auto-deploys to production

- **`develop`** - Development branch (optional)
  - Integration branch for features
  - Can be used for staging

### Feature Branches

- **`feature/*`** - New features
  - Branch from: `main` or `develop`
  - Merge back to: `main` or `develop`
  - Naming: `feature/description` (e.g., `feature/user-auth`)

- **`fix/*`** - Bug fixes
  - Branch from: `main` or `develop`
  - Merge back to: `main` or `develop`
  - Naming: `fix/description` (e.g., `fix/memory-leak`)

- **`hotfix/*`** - Critical production fixes
  - Branch from: `main`
  - Merge back to: `main` and `develop`
  - Naming: `hotfix/description` (e.g., `hotfix/security-patch`)

- **`docs/*`** - Documentation updates
  - Branch from: `main`
  - Merge back to: `main`
  - Naming: `docs/description` (e.g., `docs/api-reference`)

- **`refactor/*`** - Code refactoring
  - Branch from: `main` or `develop`
  - Merge back to: `main` or `develop`
  - Naming: `refactor/description` (e.g., `refactor/asset-manager`)

- **`chore/*`** - Maintenance tasks
  - Branch from: `main`
  - Merge back to: `main`
  - Naming: `chore/description` (e.g., `chore/update-deps`)

## 🔀 Workflow

### Creating a Feature Branch

```bash
# Update main
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "feat(scope): add my feature"

# Push to remote
git push origin feature/my-feature
```

### Updating Your Branch

```bash
# Fetch latest changes
git fetch origin

# Rebase on main
git checkout feature/my-feature
git rebase origin/main

# Resolve conflicts if any
# Then force push (if already pushed)
git push --force-with-lease origin feature/my-feature
```

### Merging a PR

1. Create PR from feature branch to `main`
2. Ensure all CI checks pass
3. Get at least one approval
4. Squash and merge (recommended) or merge commit
5. Delete branch after merge

### Hotfix Process

```bash
# Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-fix

# Make fix and commit
git add .
git commit -m "fix(scope): critical security fix"

# Push and create PR
git push origin hotfix/critical-fix

# After merge to main, merge to develop
git checkout develop
git pull origin develop
git merge main
git push origin develop
```

## 🔒 Branch Protection Rules

### Main Branch Protection

- ✅ Require pull request reviews (1 approval minimum)
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- ✅ Require linear history (no merge commits)
- ✅ Restrict pushes (no direct pushes)
- ✅ Allow force pushes: No
- ✅ Allow deletions: No

### Required Status Checks

- Lint
- Type Check
- Unit Tests
- Integration Tests
- Build

## 🧹 Branch Cleanup

### Automatic Cleanup

- Merged branches are automatically deleted after merge
- Weekly cleanup job removes stale merged branches
- Protected branches are never deleted

### Manual Cleanup

```bash
# Delete local merged branches
git branch --merged main | grep -v "main\|develop" | xargs git branch -d

# Delete remote merged branches
git fetch --prune
```

## 📋 Branch Naming Conventions

### Format

`<type>/<description>`

### Types

- `feature` - New features
- `fix` - Bug fixes
- `hotfix` - Critical production fixes
- `docs` - Documentation
- `refactor` - Refactoring
- `test` - Test additions/changes
- `chore` - Maintenance
- `perf` - Performance improvements

### Examples

✅ Good:
- `feature/user-authentication`
- `fix/memory-leak-in-asset-manager`
- `docs/api-documentation-update`
- `refactor/workflow-engine`

❌ Bad:
- `my-feature` (missing type)
- `fix` (missing description)
- `feature/user-auth-and-fix-bug` (too many things)
- `FEATURE/user-auth` (wrong case)

## 🔄 Rebase vs Merge

### Use Rebase For

- Feature branches
- Keeping history clean
- Before creating PR

### Use Merge For

- Merging PRs (use squash merge)
- Hotfixes that need to go to multiple branches
- Preserving branch history

### Rebase Workflow

```bash
# Before pushing PR
git checkout feature/my-feature
git rebase origin/main

# Resolve conflicts if any
git add .
git rebase --continue

# Force push (safe with --force-with-lease)
git push --force-with-lease origin feature/my-feature
```

## 📝 Commit Strategy

### On Feature Branches

- Make frequent, small commits
- Use descriptive commit messages
- Follow conventional commits

### Before PR

- Squash related commits
- Ensure clean history
- Write clear PR description

### Example

```bash
# During development
git commit -m "feat(astro): add login form"
git commit -m "feat(astro): add validation"
git commit -m "test(astro): add login tests"

# Before PR, squash if needed
git rebase -i HEAD~3
```

## 🚨 Common Issues

### Branch Out of Date

```bash
git checkout feature/my-feature
git fetch origin
git rebase origin/main
```

### Merge Conflicts

```bash
# During rebase
git rebase origin/main
# Resolve conflicts in files
git add .
git rebase --continue
```

### Accidentally Committed to Main

```bash
# Create branch from current state
git branch feature/my-feature
git reset --hard origin/main
git checkout feature/my-feature
```

## 📚 Best Practices

1. **Keep branches focused** - One feature/fix per branch
2. **Update frequently** - Rebase on main regularly
3. **Write clear commits** - Use conventional commits
4. **Test before PR** - Ensure all checks pass locally
5. **Delete after merge** - Clean up merged branches
6. **Use descriptive names** - Clear branch names help everyone
7. **Small PRs** - Easier to review and merge
8. **Communicate** - Use PR comments for discussion

## 🔗 Related Documentation

- [Contributing Guide](CONTRIBUTING.md)
- [PR Template](../PULL_REQUEST_TEMPLATE.md)
- [Commit Convention](https://www.conventionalcommits.org/)

