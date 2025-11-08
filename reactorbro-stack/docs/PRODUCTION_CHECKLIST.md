# Production Deployment Checklist

**Project:** ReactorJet Stack  
**Last Updated:** November 2024  
**Purpose:** Ensure safe, secure, and successful production deployments

---

## 📋 Table of Contents

- [Pre-Deployment](#pre-deployment)
- [Security](#security)
- [Performance](#performance)
- [WordPress Configuration](#wordpress-configuration)
- [Astro Frontend](#astro-frontend)
- [Infrastructure](#infrastructure)
- [DNS & Domain](#dns--domain)
- [Monitoring & Analytics](#monitoring--analytics)
- [Testing](#testing)
- [Go-Live](#go-live)
- [Post-Deployment](#post-deployment)
- [Rollback Plan](#rollback-plan)

---

## ✅ Pre-Deployment

### Code Review & Quality

- [ ] All PRs reviewed and merged to `main`
- [ ] All tests passing (`pnpm run test`)
- [ ] No TypeScript errors (`pnpm -C apps/astro check`)
- [ ] Code formatted and linted (`pnpm run format`)
- [ ] No console.log or debug code remaining
- [ ] Dependencies updated to stable versions
- [ ] Security vulnerabilities resolved (`pnpm audit`)
- [ ] Build succeeds locally (`pnpm run build`)
- [ ] Preview build tested locally (`pnpm -C apps/astro preview`)

### Documentation

- [ ] README.md updated with current information
- [ ] API documentation current
- [ ] Environment variables documented in `.env.example`
- [ ] Deployment procedures documented
- [ ] Architecture diagrams updated
- [ ] Changelog updated
- [ ] Client handoff documentation prepared

### Environment Setup

- [ ] `.env.example` up to date
- [ ] Production environment variables configured
- [ ] API keys and secrets secured (never committed)
- [ ] Database credentials secured
- [ ] WordPress admin credentials documented securely
- [ ] Third-party service credentials configured

---

## 🔒 Security

### WordPress Security

- [ ] Strong admin password set (20+ characters, mixed)
- [ ] Admin username changed from default `admin`
- [ ] WordPress core updated to latest stable version
- [ ] All plugins updated to latest stable versions
- [ ] Unused plugins removed
- [ ] Unused themes removed (except active theme)
- [ ] File permissions set correctly (files: 644, directories: 755)
- [ ] wp-config.php has secure salts/keys (from https://api.wordpress.org/secret-key/1.1/salt/)
- [ ] Database table prefix changed from `wp_` default
- [ ] XML-RPC disabled if not needed
- [ ] File editing disabled in admin (`DISALLOW_FILE_EDIT`)
- [ ] Login attempt limiting enabled
- [ ] Two-factor authentication enabled for admin
- [ ] SSL certificate installed and forced
- [ ] /wp-admin protected with Cloudflare Access (recommended)

### Application Security

- [ ] HTTPS enforced site-wide (HSTS enabled)
- [ ] Security headers configured (`_headers` file)
- [ ] Content Security Policy (CSP) configured
- [ ] CORS policies configured properly
- [ ] Rate limiting enabled on API endpoints
- [ ] Input validation and sanitization verified
- [ ] SQL injection prevention verified
- [ ] XSS protection verified
- [ ] CSRF protection enabled
- [ ] Authentication tokens secured
- [ ] Sensitive data encrypted at rest
- [ ] Secure session management
- [ ] Error messages don't expose sensitive info

### Infrastructure Security

- [ ] SSH keys only (no password auth)
- [ ] Firewall configured (ports 80, 443, 22 only)
- [ ] Fail2ban or similar intrusion prevention installed
- [ ] Root login disabled
- [ ] Sudo access limited to necessary users
- [ ] System packages updated
- [ ] Automated security updates enabled
- [ ] Database access restricted to localhost
- [ ] Backup encryption enabled
- [ ] SSL/TLS certificate valid (Let's Encrypt or commercial)

### Secrets Management

- [ ] Environment variables stored in Cloudflare Pages settings (not in code)
- [ ] GitHub secrets configured for CI/CD
- [ ] API keys rotated if previously exposed
- [ ] Database credentials complex and unique
- [ ] WordPress salts regenerated
- [ ] SSH keys unique per environment
- [ ] Access tokens have appropriate scopes only

---

## ⚡ Performance

### Frontend Optimization

- [ ] Images optimized (WebP/AVIF format)
- [ ] Images lazy-loaded
- [ ] Proper image sizes and srcsets configured
- [ ] Critical CSS inlined
- [ ] JavaScript minified and bundled
- [ ] CSS minified
- [ ] Unused CSS removed
- [ ] Font loading optimized (preload, font-display: swap)
- [ ] Third-party scripts loaded asynchronously
- [ ] Service worker configured (if applicable)
- [ ] Asset compression enabled (Brotli/Gzip)

### Caching Strategy

- [ ] CDN configured (Cloudflare)
- [ ] Static assets cached (1 year)
- [ ] HTML cached appropriately (short TTL)
- [ ] Cache-Control headers configured
- [ ] ETags configured
- [ ] Browser caching optimized
- [ ] Redis/Memcached configured for WordPress (if high traffic)
- [ ] Object caching enabled in WordPress
- [ ] Database query caching enabled
- [ ] WordPress transients optimized

### Backend Optimization

- [ ] PHP version 8.2+ (latest stable)
- [ ] PHP OPcache enabled
- [ ] Database queries optimized
- [ ] Unnecessary database queries removed
- [ ] Database indexes created for common queries
- [ ] Large media files offloaded to R2/S3
- [ ] WordPress database optimized (remove revisions, spam, etc.)
- [ ] Cron jobs scheduled appropriately
- [ ] WP-Cron disabled (use system cron instead)

### Performance Testing

- [ ] Lighthouse score > 90 for all categories
- [ ] Core Web Vitals passing (LCP, FID, CLS)
- [ ] PageSpeed Insights tested
- [ ] GTmetrix tested
- [ ] WebPageTest tested
- [ ] Load testing completed (simulated traffic)
- [ ] Stress testing completed
- [ ] Database performance tested

---

## 📝 WordPress Configuration

### Core Settings

- [ ] Site title and tagline set
- [ ] Timezone configured correctly
- [ ] Date and time formats set
- [ ] Permalink structure configured (pretty permalinks)
- [ ] Reading settings configured
- [ ] Discussion settings configured
- [ ] Media settings configured
- [ ] Privacy policy page created and linked

### Content

- [ ] All placeholder content removed
- [ ] Client content imported and verified
- [ ] Media library organized
- [ ] Featured images set for all posts
- [ ] SEO meta data added to all pages/posts
- [ ] 404 page customized
- [ ] Search results page tested

### Users & Permissions

- [ ] Client admin account created
- [ ] Development admin accounts removed
- [ ] User roles configured appropriately
- [ ] Editor/Author accounts created as needed
- [ ] User permissions audited
- [ ] Email notifications configured

### Plugins (Essential Only)

- [ ] **WPGraphQL** - Latest version, configured
- [ ] **Advanced Custom Fields (ACF)** - Latest version
- [ ] **WPGraphQL for ACF** - Latest version
- [ ] **Query Monitor** - Removed for production (dev only)
- [ ] **WP Offload Media Lite** - Configured for R2 (if using)
- [ ] **UpdraftPlus** or similar - Backup solution configured
- [ ] **Wordfence** or similar - Security plugin configured
- [ ] All other plugins verified as necessary

### ACF Configuration

- [ ] All field groups created
- [ ] ACF JSON sync enabled (`acf-json` directory)
- [ ] ACF fields exposed to GraphQL
- [ ] ACF fields tested in GraphQL queries
- [ ] Field group naming conventions followed
- [ ] Conditional logic tested

### GraphQL Configuration

- [ ] GraphQL endpoint working (`/graphql`)
- [ ] Introspection enabled for development, consider disabling for production
- [ ] Query depth limit set (prevent DoS)
- [ ] Query complexity limit set
- [ ] Authentication configured for private content
- [ ] CORS configured properly for frontend domain
- [ ] Rate limiting configured
- [ ] All required data accessible via GraphQL

---

## 🚀 Astro Frontend

### Configuration

- [ ] `site` URL set to production domain in `astro.config.mjs`
- [ ] Sitemap generation enabled
- [ ] Robots.txt configured
- [ ] 404 page created and tested
- [ ] Meta tags (OG, Twitter) configured
- [ ] Favicon and app icons added
- [ ] manifest.json configured (if PWA)

### Environment Variables

- [ ] `SITE_URL` set to production domain
- [ ] `WP_GRAPHQL_URL` set to production WordPress GraphQL endpoint
- [ ] All API keys configured in Cloudflare Pages settings
- [ ] No secrets in code or committed `.env` files
- [ ] Environment-specific configs verified

### Build & Deploy

- [ ] Production build tested locally
- [ ] Build artifacts verified (no dev dependencies)
- [ ] Source maps disabled for production (or uploaded to monitoring)
- [ ] Bundle size analyzed and optimized
- [ ] Build time acceptable (< 5 minutes)
- [ ] Cloudflare adapter configured
- [ ] Deploy preview tested

### Content & Design

- [ ] All pages created
- [ ] Navigation menus working
- [ ] Footer content updated
- [ ] Contact forms working and tested
- [ ] Social media links updated
- [ ] Privacy policy and terms of service pages created
- [ ] Cookie consent banner added (if required)
- [ ] Design tokens finalized
- [ ] Responsive design tested on all breakpoints
- [ ] Browser compatibility tested

---

## 🏗️ Infrastructure

### VPS (WordPress)

- [ ] Server provisioned and accessible
- [ ] Nginx or Apache configured
- [ ] PHP 8.2+ installed and configured
- [ ] MariaDB/MySQL 10.6+ installed
- [ ] SSL certificate installed (Let's Encrypt)
- [ ] Domain DNS pointed to server
- [ ] Firewall configured (UFW or similar)
- [ ] Fail2ban configured
- [ ] Automatic security updates enabled
- [ ] Backups automated (daily minimum)
- [ ] Backup restoration tested
- [ ] Server monitoring configured
- [ ] Log rotation configured
- [ ] Disk space monitored
- [ ] Swap space configured appropriately

### Cloudflare Pages (Astro)

- [ ] Cloudflare account set up
- [ ] Custom domain configured
- [ ] SSL/TLS mode set to "Full (strict)"
- [ ] Auto HTTPS rewrites enabled
- [ ] Minimum TLS version set (1.2 or higher)
- [ ] GitHub repository connected
- [ ] Build settings configured correctly
- [ ] Environment variables set
- [ ] Build hooks configured (for manual deploys)
- [ ] Deploy notifications configured
- [ ] Preview deployments working
- [ ] Production branch set to `main`

### Cloudflare Configuration

- [ ] WAF (Web Application Firewall) rules configured
- [ ] Rate limiting rules set
- [ ] Caching rules optimized
- [ ] Page rules configured
- [ ] Bot fight mode enabled
- [ ] DDoS protection enabled
- [ ] Email routing configured (if using)
- [ ] Analytics enabled
- [ ] Workers configured (if needed)

### Database

- [ ] Production database created
- [ ] Strong database password set
- [ ] Database user with appropriate permissions created
- [ ] Database accessible only from localhost/VPS
- [ ] Database backups automated (multiple times daily)
- [ ] Database backup restoration tested
- [ ] Old database backups removed automatically
- [ ] Database performance tuned
- [ ] Database size monitored

### Cloudflare R2 (Optional - Media Offload)

- [ ] R2 bucket created
- [ ] Bucket access keys generated
- [ ] CORS policy configured
- [ ] WP Offload Media plugin configured
- [ ] Existing media migrated to R2
- [ ] Media URLs rewritten correctly
- [ ] Media access tested (public/private)
- [ ] CDN domain configured (if using)

---

## 🌐 DNS & Domain

### Domain Configuration

- [ ] Domain registered and owned by client
- [ ] Domain registrar access documented
- [ ] DNS managed in Cloudflare
- [ ] A/AAAA records pointing to VPS for WordPress
- [ ] CNAME record pointing to Cloudflare Pages for Astro
- [ ] MX records configured for email (if hosting email)
- [ ] SPF record configured
- [ ] DKIM configured
- [ ] DMARC policy set
- [ ] CAA records configured (for SSL)
- [ ] TTL values set appropriately (lower for go-live, higher after)
- [ ] DNS propagation completed (24-48 hours)

### SSL/TLS

- [ ] SSL certificate issued and active
- [ ] Certificate auto-renewal configured
- [ ] HTTPS forced site-wide
- [ ] HSTS enabled (after testing)
- [ ] Mixed content warnings resolved
- [ ] SSL certificate chain valid
- [ ] SSL Labs test: A+ rating

---

## 📊 Monitoring & Analytics

### Uptime Monitoring

- [ ] Uptime monitoring service configured (UptimeRobot, Pingdom, etc.)
- [ ] WordPress endpoint monitored
- [ ] Astro frontend monitored
- [ ] GraphQL endpoint monitored
- [ ] Alerts configured (email, SMS, Slack)
- [ ] Response time thresholds set
- [ ] Status page created (if client-facing)

### Error Tracking (Optional but Recommended)

- [ ] Sentry or similar configured for frontend
- [ ] Sentry or similar configured for backend
- [ ] Error alerts configured
- [ ] Source maps uploaded
- [ ] Release tracking configured
- [ ] Team members invited

### Analytics

- [ ] Google Analytics 4 configured (if using)
- [ ] Cloudflare Web Analytics enabled
- [ ] Privacy-friendly analytics alternative (Plausible, Fathom) configured
- [ ] Cookie consent obtained before tracking (GDPR/CCPA)
- [ ] Goals and conversions configured
- [ ] E-commerce tracking (if applicable)
- [ ] Custom events configured

### Performance Monitoring

- [ ] Real User Monitoring (RUM) enabled
- [ ] Synthetic monitoring configured
- [ ] Core Web Vitals tracked
- [ ] Performance budgets set
- [ ] Alerts configured for performance degradation

### WordPress Monitoring

- [ ] WordPress uptime monitored
- [ ] Plugin update alerts configured
- [ ] Security scan scheduled (weekly)
- [ ] Backup success/failure alerts configured
- [ ] Disk space alerts configured
- [ ] Error log monitoring

---

## 🧪 Testing

### Functional Testing

- [ ] All pages load correctly
- [ ] All links working (no 404s)
- [ ] Forms submit correctly
- [ ] Contact form delivers emails
- [ ] Search functionality working
- [ ] Navigation menus working on all pages
- [ ] WordPress admin accessible
- [ ] GraphQL queries returning expected data
- [ ] User authentication working (if applicable)
- [ ] Payment processing working (if applicable)

### Cross-Browser Testing

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)
- [ ] Internet Explorer 11 (if required)

### Device Testing

- [ ] Desktop (1920x1080, 1366x768)
- [ ] Laptop (1440x900)
- [ ] Tablet (iPad, iPad Pro)
- [ ] Mobile (iPhone 12/13/14, Samsung Galaxy)
- [ ] Small mobile devices (< 375px width)
- [ ] Large desktop (> 1920px width)

### Accessibility Testing

- [ ] Keyboard navigation working
- [ ] Screen reader tested (NVDA, JAWS, or VoiceOver)
- [ ] Color contrast meets WCAG AA standards
- [ ] Alt text on all images
- [ ] Proper heading hierarchy
- [ ] Form labels associated correctly
- [ ] Focus indicators visible
- [ ] No flashing content
- [ ] ARIA attributes used correctly
- [ ] Skip navigation links present

### SEO Testing

- [ ] Meta titles unique and descriptive (< 60 chars)
- [ ] Meta descriptions unique and compelling (< 160 chars)
- [ ] Heading structure logical (H1 → H2 → H3)
- [ ] Alt text on images
- [ ] Sitemap XML generated and accessible
- [ ] Robots.txt configured correctly
- [ ] Canonical URLs set
- [ ] Open Graph tags present
- [ ] Twitter Card tags present
- [ ] Schema markup added (JSON-LD)
- [ ] Google Search Console configured
- [ ] Bing Webmaster Tools configured

### Performance Testing

- [ ] Lighthouse: Performance > 90
- [ ] Lighthouse: Accessibility > 90
- [ ] Lighthouse: Best Practices > 90
- [ ] Lighthouse: SEO > 90
- [ ] PageSpeed Insights tested
- [ ] GTmetrix: Grade A
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] TTFB < 600ms
- [ ] Load testing completed (simulate 100+ concurrent users)

### Security Testing

- [ ] Security scan completed (Sucuri, Wordfence)
- [ ] SSL Labs test: A+ rating
- [ ] Security headers verified (securityheaders.com)
- [ ] XSS vulnerabilities tested
- [ ] SQL injection tested
- [ ] CSRF protection tested
- [ ] Authentication bypass attempts tested
- [ ] File upload security tested
- [ ] Rate limiting tested

---

## 🎬 Go-Live

### Pre-Launch (T-1 Week)

- [ ] All checklist items above completed
- [ ] Client final review and approval
- [ ] Deployment plan documented
- [ ] Rollback plan documented
- [ ] Maintenance window scheduled (if needed)
- [ ] Stakeholders notified of go-live date/time
- [ ] Support team briefed
- [ ] Backup of old site taken (if replacing existing site)

### Pre-Launch (T-24 Hours)

- [ ] Final content review
- [ ] Final functionality testing
- [ ] DNS changes prepared (not applied)
- [ ] Team on standby for go-live
- [ ] Client approval confirmed
- [ ] Monitoring dashboards open
- [ ] Emergency contacts list ready

### Launch Day (T-0)

- [ ] Final backup of WordPress database and files
- [ ] DNS TTL lowered (24 hours before if possible)
- [ ] WordPress deployed to production VPS
- [ ] Database migrated to production
- [ ] WordPress URLs updated (wp-config.php)
- [ ] Astro deployed to Cloudflare Pages
- [ ] DNS records updated to point to production
- [ ] SSL certificate verified working
- [ ] Test production URLs immediately after DNS change
- [ ] Monitor error logs
- [ ] Monitor analytics for traffic
- [ ] Verify all integrations working

### Post-Launch (T+1 Hour)

- [ ] All pages loading correctly
- [ ] Forms working
- [ ] WordPress admin accessible
- [ ] GraphQL queries working
- [ ] No console errors
- [ ] No 404 errors
- [ ] Search engines not blocked (robots.txt)
- [ ] Analytics tracking data

### Post-Launch (T+24 Hours)

- [ ] No critical errors in logs
- [ ] Performance metrics within acceptable range
- [ ] Uptime 99.9%+
- [ ] User feedback collected
- [ ] Minor issues logged
- [ ] DNS propagation complete (check from multiple locations)
- [ ] Old site taken down (if applicable)

---

## 🔄 Post-Deployment

### Immediate (First Week)

- [ ] Monitor error logs daily
- [ ] Monitor performance metrics daily
- [ ] Monitor uptime
- [ ] Monitor user feedback
- [ ] Fix any critical bugs immediately
- [ ] Address any user complaints
- [ ] Verify backups running automatically
- [ ] Test backup restoration
- [ ] DNS TTL raised back to normal (1 hour or more)

### Ongoing (First Month)

- [ ] Weekly performance reviews
- [ ] Weekly security scans
- [ ] User feedback analysis
- [ ] Analytics review
- [ ] Content updates as needed
- [ ] Plugin updates as released
- [ ] WordPress core updates as released

### Maintenance Schedule

- [ ] **Daily**: Automated backups
- [ ] **Weekly**: Security scans, plugin updates
- [ ] **Monthly**: Performance reviews, content audits
- [ ] **Quarterly**: Security audits, accessibility audits
- [ ] **Annually**: SSL certificate renewal check, hosting review

### Client Handoff

- [ ] Admin credentials provided securely
- [ ] Training session scheduled
- [ ] User documentation provided
- [ ] Support contact information shared
- [ ] Warranty/support period defined
- [ ] Maintenance plan presented
- [ ] Invoice sent
- [ ] Domain transfer completed (if applicable)

---

## ⚠️ Rollback Plan

### When to Rollback

Rollback if any of these occur within first 24 hours:
- Critical functionality completely broken
- Site completely down for > 15 minutes
- Security vulnerability exploited
- Data loss or corruption
- Client requests immediate rollback

### Rollback Procedure

#### Astro Frontend Rollback

1. Go to Cloudflare Pages dashboard
2. Navigate to Deployments
3. Find previous stable deployment
4. Click "Rollback to this deployment"
5. Verify rollback successful
6. Monitor for 30 minutes

#### WordPress Rollback

1. SSH into VPS
2. Stop web server: `sudo systemctl stop nginx`
3. Restore database from backup:
   ```bash
   mysql -u dbuser -p dbname < backup-pre-launch.sql
   ```
4. Restore files from backup:
   ```bash
   rsync -av /backups/pre-launch/wp-content/ /var/www/wp-content/
   ```
5. Start web server: `sudo systemctl start nginx`
6. Verify site loads
7. Test critical functionality
8. Monitor for 30 minutes

#### DNS Rollback

1. Access Cloudflare DNS dashboard
2. Restore previous DNS records from notes
3. Wait for propagation (up to 48 hours if TTL was high)
4. Use low TTL values in future for faster rollback

### Post-Rollback

- [ ] Identify root cause of issue
- [ ] Document what went wrong
- [ ] Fix issues in staging environment
- [ ] Test thoroughly before attempting re-deployment
- [ ] Communicate status to client
- [ ] Schedule new deployment date

---

## 📞 Emergency Contacts

### Team

- **Project Manager**: [Name, Phone, Email]
- **Lead Developer**: [Name, Phone, Email]
- **DevOps Engineer**: [Name, Phone, Email]
- **Client Contact**: [Name, Phone, Email]

### Services

- **Domain Registrar**: [Company, Support Phone, Account #]
- **Hosting Provider**: [Company, Support Phone, Account #]
- **Cloudflare**: Support ticket system
- **DNS Provider**: [If different from Cloudflare]

### On-Call Schedule

- **Primary**: [Name] - [Days/Hours]
- **Secondary**: [Name] - [Days/Hours]
- **Escalation**: [Name] - [Always available]

---

## 📝 Sign-Off

This checklist must be completed and signed off by the following:

- [ ] **Developer Lead**: _________________ Date: _______
- [ ] **Project Manager**: _________________ Date: _______
- [ ] **Client Representative**: _________________ Date: _______
- [ ] **QA Lead**: _________________ Date: _______

---

## 📄 Additional Resources

- [WordPress Hardening Guide](https://wordpress.org/support/article/hardening-wordpress/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Astro Deployment Docs](https://docs.astro.build/en/guides/deploy/)
- [Web.dev Performance Guide](https://web.dev/performance/)
- [Google Search Console](https://search.google.com/search-console)

---

**Remember**: This is a living document. Update it based on your specific project needs and lessons learned from each deployment.

**Last Reviewed**: November 2024  
**Next Review Due**: December 2024