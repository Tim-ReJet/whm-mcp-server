
# Runbooks

## Local (first time)
1. Install **pnpm**, **ddev**.
2. `pnpm install`
3. `pnpm -C packages/tokens build`
4. `pnpm so wp:init`
5. `pnpm -C apps/astro dev`

## VPS Production (headless WordPress)
- Provision VPS (Ubuntu 22.04+), Nginx, PHP-FPM 8.2, MariaDB 10.6+
- Set up domain `cms.yourdomain.com`
- Secure with Let's Encrypt
- Create DB + user; import from local if needed
- Add Cloudflare R2 (optional) via S3-compatible plugin (Offload Media)

## Deploy
- Astro: push to `main` → GitHub Action → Cloudflare Pages
- WP: push content/theme/plugin changes in `apps/wp/public/wp-content/**` → rsync to VPS

## Caching Strategy
- Enable Cloudflare APO (or page rules) for `cms` domain (bypass admin).
- For Astro site on CF Pages: default caching; add KV for GraphQL response cache if needed.

## Secrets (GitHub)
- CF_API_TOKEN, CF_ACCOUNT_ID, CF_PAGES_PROJECT
- WP_REMOTE_HOST, WP_REMOTE_USER, WP_REMOTE_PATH, WP_SSH_KEY
