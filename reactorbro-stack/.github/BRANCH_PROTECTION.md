# Branch Protection Configuration

This document describes the recommended branch protection settings for this repository.

## 🔒 Main Branch Protection

### Settings

Navigate to: `Settings > Branches > Branch protection rules`

### Rule Name
`main`

### Branch Name Pattern
`main`

### Protection Settings

#### ✅ Require a pull request before merging
- **Required approvals**: 1
- **Dismiss stale pull request approvals when new commits are pushed**: ✅ Enabled
- **Require review from Code Owners**: ✅ Enabled (if CODEOWNERS file exists)
- **Restrict who can dismiss pull request reviews**: Optional

#### ✅ Require status checks to pass before merging
- **Required status checks**:
  - `lint`
  - `typecheck`
  - `test-unit`
  - `test-integration`
  - `build`
  - `commitlint` (for PRs)
- **Require branches to be up to date before merging**: ✅ Enabled

#### ✅ Require conversation resolution before merging
- ✅ Enabled

#### ✅ Require linear history
- ✅ Enabled (prevents merge commits)

#### ✅ Require signed commits
- Optional (recommended for production)

#### ✅ Include administrators
- ✅ Enabled (admins must follow rules)

#### ✅ Restrict pushes that create matching branches
- ✅ Enabled (prevents direct pushes)

#### ✅ Allow force pushes
- ❌ Disabled

#### ✅ Allow deletions
- ❌ Disabled

## 🌿 Develop Branch Protection (Optional)

If using a `develop` branch:

### Rule Name
`develop`

### Branch Name Pattern
`develop`

### Protection Settings

#### ✅ Require a pull request before merging
- **Required approvals**: 1
- **Dismiss stale pull request approvals**: ✅ Enabled

#### ✅ Require status checks to pass before merging
- **Required status checks**:
  - `lint`
  - `typecheck`
  - `test-unit`
  - `build`
- **Require branches to be up to date**: ✅ Enabled

#### ✅ Require linear history
- ✅ Enabled

#### ✅ Restrict pushes that create matching branches
- ✅ Enabled

#### ✅ Allow force pushes
- ❌ Disabled

## 🔧 Setting Up Branch Protection

### Via GitHub UI

1. Go to repository `Settings`
2. Click `Branches` in the left sidebar
3. Click `Add rule` or edit existing rule
4. Configure settings as described above
5. Click `Create` or `Save changes`

### Via GitHub CLI

```bash
# Install GitHub CLI if not installed
# brew install gh (macOS)
# or download from https://cli.github.com/

# Authenticate
gh auth login

# Set branch protection for main
gh api repos/:owner/:repo/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["lint","typecheck","test-unit","test-integration","build"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
  --field restrictions=null \
  --field required_linear_history=true \
  --field allow_force_pushes=false \
  --field allow_deletions=false
```

### Via Terraform (if using Infrastructure as Code)

```hcl
resource "github_branch_protection" "main" {
  repository_id = github_repository.repo.node_id

  pattern          = "main"
  enforce_admins   = true

  required_status_checks {
    strict   = true
    contexts = ["lint", "typecheck", "test-unit", "test-integration", "build"]
  }

  required_pull_request_reviews {
    required_approving_review_count = 1
    dismiss_stale_reviews          = true
  }

  required_linear_history = true
  allow_force_pushes      = false
  allow_deletions         = false
}
```

## 📋 CODEOWNERS File

Create `.github/CODEOWNERS` to require reviews from specific teams:

```
# Global owners
* @your-team

# Specific areas
/apps/astro/ @astro-team
/apps/wp/ @wp-team
/packages/ @packages-team
/.github/ @devops-team
/docs/ @docs-team
```

## 🔍 Status Checks Reference

### CI Workflow Checks

- `lint` - Linting and formatting
- `typecheck` - TypeScript type checking
- `test-unit` - Unit tests
- `test-integration` - Integration tests
- `build` - Build verification
- `commitlint` - Commit message validation (PRs only)
- `security` - Security audit (informational)

### Deployment Checks

- `deploy-cloudflare` - Cloudflare Pages deployment
- `deploy-wp` - WordPress deployment (if applicable)

## 🚨 Troubleshooting

### Status Checks Not Showing

1. Ensure workflows are in `.github/workflows/`
2. Check workflow files are valid YAML
3. Verify workflow runs successfully at least once
4. Check branch name matches protection rule pattern

### Cannot Merge PR

1. Ensure all required checks pass
2. Get required number of approvals
3. Resolve any conversations
4. Update branch if behind main
5. Ensure PR follows linear history requirement

### Force Push Needed

If you need to force push (rare cases):

1. Temporarily disable protection (admin only)
2. Make necessary changes
3. Re-enable protection immediately
4. Document reason for force push

## 📚 Additional Resources

- [GitHub Branch Protection Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [GitHub CODEOWNERS Documentation](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
- [Branch Strategy Guide](BRANCH_STRATEGY.md)

