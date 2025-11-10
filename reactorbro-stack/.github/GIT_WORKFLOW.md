# Git Workflow Guide

This guide explains the complete Git workflow for contributing to ReactorBro Stack.

## 📋 Table of Contents

- [Initial Setup](#initial-setup)
- [Daily Workflow](#daily-workflow)
- [Feature Development](#feature-development)
- [Bug Fixes](#bug-fixes)
- [Hotfixes](#hotfixes)
- [Pull Requests](#pull-requests)
- [Versioning](#versioning)
- [Troubleshooting](#troubleshooting)

## 🚀 Initial Setup

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR_USERNAME/reactorbro-stack.git
cd reactorbro-stack

# Add upstream remote
git remote add upstream https://github.com/Tim-ReJet/reactorbro-stack.git

# Verify remotes
git remote -v
```

### 2. Configure Git

```bash
# Set your name and email
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Set up commit signing (optional but recommended)
git config commit.gpgsign true

# Set up pull rebase
git config pull.rebase true
```

### 3. Install Dependencies

```bash
pnpm install
```

## 🔄 Daily Workflow

### Starting Your Day

```bash
# Fetch latest changes
git fetch upstream

# Update main branch
git checkout main
git pull upstream main

# Push to your fork
git push origin main
```

### Before Starting Work

```bash
# Always start from updated main
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/my-feature
```

## ✨ Feature Development

### 1. Create Feature Branch

```bash
git checkout main
git pull upstream main
git checkout -b feature/user-authentication
```

### 2. Make Changes

```bash
# Make your changes, then:
git add .
git commit -m "feat(auth): add login form"
```

### 3. Keep Branch Updated

```bash
# Regularly update your branch
git fetch upstream
git rebase upstream/main

# If conflicts occur:
# 1. Resolve conflicts in files
# 2. git add .
# 3. git rebase --continue
```

### 4. Push Changes

```bash
# First push
git push origin feature/user-authentication

# After rebasing (if already pushed)
git push --force-with-lease origin feature/user-authentication
```

### 5. Create Pull Request

1. Go to GitHub
2. Click "New Pull Request"
3. Select your branch
4. Fill out PR template
5. Submit PR

## 🐛 Bug Fixes

### 1. Create Fix Branch

```bash
git checkout main
git pull upstream main
git checkout -b fix/memory-leak
```

### 2. Fix and Commit

```bash
# Make fix
git add .
git commit -m "fix(scripts): resolve memory leak in asset manager"
```

### 3. Test Fix

```bash
pnpm test
pnpm lint
pnpm build
```

### 4. Push and PR

```bash
git push origin fix/memory-leak
# Create PR
```

## 🔥 Hotfixes

For critical production fixes:

### 1. Create Hotfix Branch

```bash
git checkout main
git pull upstream main
git checkout -b hotfix/security-patch
```

### 2. Fix and Commit

```bash
git add .
git commit -m "fix(security): patch XSS vulnerability"
```

### 3. Push and PR

```bash
git push origin hotfix/security-patch
# Create PR to main
```

### 4. After Merge

```bash
# Merge to develop if it exists
git checkout develop
git pull upstream develop
git merge main
git push origin develop
```

## 📝 Pull Requests

### Before Creating PR

```bash
# Ensure branch is up to date
git checkout feature/my-feature
git fetch upstream
git rebase upstream/main

# Run checks locally
pnpm lint
pnpm test
pnpm build

# Push
git push --force-with-lease origin feature/my-feature
```

### PR Checklist

- [ ] Branch is up to date with main
- [ ] All tests pass
- [ ] Linting passes
- [ ] Build succeeds
- [ ] PR title follows conventional commits
- [ ] PR description is complete
- [ ] Related issues linked
- [ ] Screenshots added (if UI changes)

### During Review

```bash
# Address feedback
git add .
git commit -m "fix(scope): address review feedback"

# Update PR
git push origin feature/my-feature
```

### After Approval

1. Squash commits if needed:
   ```bash
   git rebase -i upstream/main
   ```

2. Update PR (if squashed):
   ```bash
   git push --force-with-lease origin feature/my-feature
   ```

3. Wait for maintainer to merge

## 📦 Versioning

### Adding a Changeset

When your changes affect package versions:

```bash
# Create changeset
pnpm changeset

# Follow prompts:
# 1. Select affected packages
# 2. Choose version bump (major/minor/patch)
# 3. Write summary
```

### Release Process

1. Changesets are automatically processed
2. Version PR is created
3. After merge, packages are published
4. GitHub release is created

## 🔧 Advanced Workflows

### Interactive Rebase

```bash
# Rebase last 3 commits
git rebase -i HEAD~3

# Options:
# pick - use commit as-is
# reword - change commit message
# edit - modify commit
# squash - combine with previous
# drop - remove commit
```

### Stashing Changes

```bash
# Save current changes
git stash

# Do other work
git checkout main
git pull

# Restore changes
git checkout feature/my-feature
git stash pop
```

### Cherry-picking

```bash
# Apply specific commit to current branch
git cherry-pick <commit-hash>

# Resolve conflicts if any
git add .
git cherry-pick --continue
```

### Splitting Commits

```bash
# Start interactive rebase
git rebase -i HEAD~3

# Mark commit as 'edit'
# Git will pause at that commit

# Reset to split
git reset HEAD~1

# Stage and commit parts separately
git add file1.ts
git commit -m "feat(scope): add feature part 1"
git add file2.ts
git commit -m "feat(scope): add feature part 2"

# Continue rebase
git rebase --continue
```

## 🚨 Troubleshooting

### Branch Out of Date

```bash
git checkout feature/my-feature
git fetch upstream
git rebase upstream/main
```

### Merge Conflicts

```bash
# During rebase
git rebase upstream/main

# Resolve conflicts in files
# Then:
git add .
git rebase --continue

# If you want to abort:
git rebase --abort
```

### Accidentally Committed to Main

```bash
# Create branch from current state
git branch feature/my-feature

# Reset main
git checkout main
git reset --hard upstream/main

# Switch to feature branch
git checkout feature/my-feature
```

### Wrong Commit Message

```bash
# Amend last commit
git commit --amend -m "feat(scope): correct message"

# If already pushed (use carefully)
git push --force-with-lease origin feature/my-feature
```

### Undo Last Commit (Keep Changes)

```bash
git reset --soft HEAD~1
```

### Undo Last Commit (Discard Changes)

```bash
git reset --hard HEAD~1
```

### Revert a Commit

```bash
# Create new commit that undoes changes
git revert <commit-hash>
```

### Find Commit by Message

```bash
git log --grep="search term"
```

### View File History

```bash
git log --follow -- path/to/file
```

## 📚 Best Practices

1. **Commit Often** - Small, focused commits
2. **Write Clear Messages** - Use conventional commits
3. **Test Before Committing** - Run tests locally
4. **Keep Branches Updated** - Rebase regularly
5. **Review Your Own Code** - Check diff before PR
6. **Use Descriptive Names** - Clear branch names
7. **One Feature Per Branch** - Keep PRs focused
8. **Communicate** - Use PR comments for discussion

## 🔗 Related Documentation

- [Contributing Guide](CONTRIBUTING.md)
- [Branch Strategy](BRANCH_STRATEGY.md)
- [PR Template](../PULL_REQUEST_TEMPLATE.md)
- [Conventional Commits](https://www.conventionalcommits.org/)

## 💡 Tips

### Git Aliases

Add to `~/.gitconfig`:

```ini
[alias]
  co = checkout
  br = branch
  ci = commit
  st = status
  unstage = reset HEAD --
  last = log -1 HEAD
  visual = !gitk
  lg = log --oneline --decorate --graph --all
  amend = commit --amend --no-edit
  save = !git add -A && git commit -m 'SAVEPOINT'
  undo = reset HEAD~1 --mixed
  wip = !git add -u && git commit -m "WIP"
```

### Useful Commands

```bash
# View branch tree
git log --oneline --decorate --graph --all

# See what changed
git diff

# See staged changes
git diff --staged

# See file changes in commit
git show <commit-hash> -- <file>

# Find when bug was introduced
git bisect start
git bisect bad
git bisect good <commit-hash>
# Test, then mark good/bad
git bisect reset
```

## 🎓 Learning Resources

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)
- [Atlassian Git Tutorials](https://www.atlassian.com/git/tutorials)
- [Conventional Commits](https://www.conventionalcommits.org/)

