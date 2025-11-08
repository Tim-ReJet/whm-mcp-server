# GitHub Actions Workflows - Examples

This directory contains example GitHub Actions workflows for multi-site deployment in the ReactorBro Stack.

## 📁 Contents

- `deploy-multi-site.yml` - Multi-site deployment workflow with automatic change detection

## 🚀 Quick Setup

### 1. Copy to Workflows Directory

```bash
cp .github/workflows-examples/deploy-multi-site.yml .github/workflows/
```

### 2. Configure Secrets

Add these secrets to your GitHub repository:

**Settings → Secrets and variables → Actions**

| Secret Name | Description | Where to Find |
|-------------|-------------|---------------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token | Cloudflare Dashboard → My Profile → API Tokens |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID | Cloudflare Dashboard → Workers & Pages → Overview |

### 3. Customize for Your Sites

Edit `.github/workflows/deploy-multi-site.yml` and:

1. Add/remove site deployment jobs
2. Update project names
3. Configure branch triggers
4. Customize build commands

## 📋 How It Works

### Automatic Change Detection

The workflow automatically detects which sites have changed:

- **Package changes** → Deploy all sites
- **Site-specific changes** → Deploy only affected sites
- **Astro app changes** → Deploy all sites

### Manual Deployment

Trigger deployments manually via GitHub Actions UI:

1. Go to **Actions** tab
2. Select **Deploy Multi-Site** workflow
3. Click **Run workflow**
4. Optionally specify a site ID
5. Click **Run workflow** button

## 🎯 Workflow Structure

```yaml
detect-changes          # Detect which sites changed
    ↓
deploy-site-1          # Deploy site 1 (if changed)
deploy-site-2          # Deploy site 2 (if changed)
deploy-site-3          # Deploy site 3 (if changed)
    ↓
notify                 # Send deployment summary
```

## 🔧 Customization Examples

### Add a New Site

Add a new job to the workflow:

```yaml
deploy-new-site:
  needs: detect-changes
  if: contains(fromJSON(needs.detect-changes.outputs.sites), 'new-site')
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '20'
    - uses: pnpm/action-setup@v2
      with:
        version: 9
    - run: pnpm install
    - run: pnpm tokens
    - run: pnpm site:use new-site
    - run: pnpm site:build new-site
    - uses: cloudflare/pages-action@v1
      with:
        apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
        accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
        projectName: new-site
        directory: apps/astro/dist
```

### Deploy to Vercel

Replace Cloudflare Pages action:

```yaml
- name: Deploy to Vercel
  uses: amondnet/vercel-action@v25
  with:
    vercel-token: ${{ secrets.VERCEL_TOKEN }}
    vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
    vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
    working-directory: apps/astro
```

### Deploy to Netlify

Replace Cloudflare Pages action:

```yaml
- name: Deploy to Netlify
  uses: nwtgck/actions-netlify@v2
  with:
    publish-dir: apps/astro/dist
    production-branch: main
    github-token: ${{ secrets.GITHUB_TOKEN }}
    deploy-message: "Deploy from GitHub Actions"
  env:
    NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
    NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

### Deploy on Schedule

Add schedule trigger:

```yaml
on:
  push:
    branches: [main]
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
  workflow_dispatch:
```

### Deploy Specific Branches

Configure branch-based deployments:

```yaml
on:
  push:
    branches:
      - main              # Production
      - staging           # Staging
      - 'preview/**'      # Preview branches
```

## 🔐 Security Best Practices

### 1. Use Environment Secrets

Never hardcode secrets in workflows:

```yaml
# ❌ Bad
apiToken: "abc123xyz"

# ✅ Good
apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

### 2. Limit Secret Scope

Use environment-specific secrets when possible:

```yaml
environment:
  name: production
  url: https://bergprojects.co.za
```

### 3. Verify Before Deploy

Add validation steps:

```yaml
- name: Validate site config
  run: |
    if [ ! -f "sites/$SITE_ID/site.config.json" ]; then
      echo "Site config not found!"
      exit 1
    fi

- name: Check build output
  run: |
    if [ ! -d "apps/astro/dist" ]; then
      echo "Build output not found!"
      exit 1
    fi
```

## 📊 Deployment Status

View deployment status in:

1. **Actions tab** - Real-time build logs
2. **Deployments** - Deployment history
3. **Summary** - Deployment summary per run

## 🐛 Troubleshooting

### Build Fails

```bash
# Check locally first
pnpm site:use site-id
pnpm site:build

# View workflow logs in GitHub Actions
```

### Deployment Fails

```bash
# Verify secrets are configured
# Check Cloudflare/Vercel/Netlify dashboard
# Review deployment logs
```

### Change Detection Issues

```bash
# Manually trigger deployment
# Actions → Deploy Multi-Site → Run workflow
# Specify site ID if needed
```

### Concurrent Builds

```yaml
# Prevent concurrent deployments
concurrency:
  group: deploy-${{ matrix.site }}
  cancel-in-progress: false
```

## 🔄 Workflow Variations

### Deploy All Sites

```yaml
strategy:
  matrix:
    site: [berg-projects, acme-corp, xyz-company]
steps:
  - run: pnpm site:build ${{ matrix.site }}
```

### Sequential Deployment

```yaml
deploy-sites:
  runs-on: ubuntu-latest
  steps:
    - name: Deploy all sites
      run: |
        for site in berg-projects acme-corp; do
          pnpm site:use $site
          pnpm site:build
          # Deploy...
        done
```

### Parallel Deployment

```yaml
strategy:
  matrix:
    site: [berg-projects, acme-corp]
  max-parallel: 2  # Deploy 2 sites at once
```

## 📚 Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Cloudflare Pages Actions](https://github.com/marketplace/actions/cloudflare-pages-github-action)
- [Vercel Actions](https://github.com/marketplace/actions/vercel-action)
- [Netlify Actions](https://github.com/marketplace/actions/netlify-actions-deploy)

## 💡 Tips

1. **Test locally first**: Always test `pnpm site:build` locally before pushing
2. **Monitor costs**: Check deployment platform costs for multiple sites
3. **Use caching**: Cache `node_modules` and `pnpm` store for faster builds
4. **Branch protection**: Require successful builds before merging
5. **Notifications**: Add Slack/Discord notifications for deployment status

## ✅ Checklist

Before deploying to production:

- [ ] Secrets configured in GitHub
- [ ] Site config validated
- [ ] Local build successful
- [ ] Domain configured in deployment platform
- [ ] SSL certificate active
- [ ] Environment variables set
- [ ] Workflow tested with manual trigger
- [ ] Deployment verified in production

---

**Need help?** Check the [Multi-Site Management Guide](../../MULTI_SITE_GUIDE.md)