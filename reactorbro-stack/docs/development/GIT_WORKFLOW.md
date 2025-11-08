# Git Workflow Guide
**ReactorBro Stack - Branching Strategy**

## 🌳 Branch Structure

```
main (production)
  └── develop (integration)
      ├── feature/agents-* (AI agent features)
      ├── feature/assets-* (asset management)
      ├── feature/ui-* (UI improvements)
      └── hotfix/* (urgent fixes)
```

## 🚀 Quick Commands

### Start New Feature
```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature
```

### Daily Work
```bash
# Sync with develop
git checkout feature/your-feature
git pull origin develop
git merge develop

# Commit work
git add .
git commit -m "feat(scope): description"
git push origin feature/your-feature
```

### Merge Feature
```bash
# Create PR on GitHub
# After approval:
git checkout develop
git merge --squash feature/your-feature
git push origin develop

# Cleanup
git branch -d feature/your-feature
git push origin --delete feature/your-feature
```

## 📋 Commit Convention

Format: `<type>(<scope>): <subject>`

Types: feat, fix, docs, style, refactor, test, chore

Example: `feat(agents): implement graphic design agent`

---

**[Full Git Strategy →](../PROJECT_CLEANUP_PLAN.md#-git-branching-strategy)**
