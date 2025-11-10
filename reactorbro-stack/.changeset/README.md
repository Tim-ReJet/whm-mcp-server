# Changesets

This directory contains [Changesets](https://github.com/changesets/changesets) files that describe version changes for packages in this monorepo.

## What are Changesets?

Changesets are a way to document changes to packages. When you make changes that affect package versions, you should create a changeset file.

## Creating a Changeset

Run this command:

```bash
pnpm changeset
```

This will:

1. Show you which packages have changed
2. Ask you to select which packages are affected
3. Ask you to choose the version bump (major/minor/patch)
4. Ask you to write a summary of changes
5. Create a changeset file in `.changeset/`

## Changeset File Format

Changeset files are markdown files with a specific format:

```markdown
---
"package-name": patch
---

Description of changes
```

## Version Bump Types

- **patch** - Bug fixes, small changes (1.0.0 → 1.0.1)
- **minor** - New features, backwards compatible (1.0.0 → 1.1.0)
- **major** - Breaking changes (1.0.0 → 2.0.0)

## Release Process

1. Changesets are automatically processed when PRs are merged to `main`
2. A version PR is created with updated versions and changelogs
3. After the version PR is merged, packages are published
4. A GitHub release is created

## When to Create a Changeset

Create a changeset when:

- ✅ Adding new features
- ✅ Fixing bugs
- ✅ Making breaking changes
- ✅ Updating dependencies that affect consumers

Don't create a changeset for:

- ❌ Documentation-only changes
- ❌ Internal refactoring (unless it affects API)
- ❌ Test-only changes
- ❌ CI/CD changes

## Examples

### Feature Addition

```bash
pnpm changeset
# Select: packages/ui
# Version: minor
# Summary: Add Button component with variants
```

### Bug Fix

```bash
pnpm changeset
# Select: packages/scripts
# Version: patch
# Summary: Fix memory leak in asset manager
```

### Breaking Change

```bash
pnpm changeset
# Select: packages/ui
# Version: major
# Summary: Remove deprecated prop API, use new API instead
```

## More Information

- [Changesets Documentation](https://github.com/changesets/changesets)
- [Changesets Config](../.changeset/config.json)
