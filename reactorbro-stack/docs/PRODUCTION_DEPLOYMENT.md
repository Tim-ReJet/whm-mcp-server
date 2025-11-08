# Production Deployment Guide

**ReactorJet Stack - Quick Deployment Guide**  
**Last Updated:** November 2024

---

## 🚀 Overview

This guide walks you through deploying ReactorJet Stack to production for the first time. For a comprehensive checklist, see [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md).

---

## 📋 Prerequisites

Before starting deployment:

- [ ] All code merged to `main` branch
- [ ] Client approval received
- [ ] Domain registered and accessible
- [ ] VPS provisioned (for WordPress)
- [ ] Cloudflare account created
- [ ] All tests passing locally
- [ ] Production environment variables prepared

---

## 🎯 Quick Deployment Steps

### Phase 1: Pre-Deployment (Day Before)

#### 1.1 Validate Environment

```bash
# Load production environment variables
cp .env.production .env
source .env

# Run production validator
pnpm so validate-prod

# Fix any critical issues before proceeding
```

#### 1.2 Final Testing

```bash
# Run all tests
pnpm run test

# Type check
pnpm -C apps/astro check

# Build locally
pnpm run build

# Test production build
pnpm -C apps/astro preview
```

#### 1.3 Prepare Backups

```bash
# Backup current production (if replacing existing site)
# Document all current credentials
# Export any existing data
```

---

### Phase 2: VPS Setup (WordPress)

#### 2.1 Server Provisioning

```bash
# SSH into your VPS
ssh root@your-vps-ip

# Update system
apt update && apt upgrade -y

# Install required packages
apt install -y nginx php8.2-fpm php8.2-mysql php8.2-curl php8.2-gd \
  php8.2-mbstring php8.2-xml php8.2-xmlrpc php8.2-zip \
  mariadb-server certbot python3-certbot-nginx git

# Secure MariaDB
mysql_secure_installation
```

#### 2.2 Create Database

```bash
# Login to MySQL
mysql -u root -p

# Create database and user
CREATE DATABASE wordpress_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'wpuser'@'localhost' IDENTIFIED BY 'STRONG_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON wordpress_prod.* TO 'wpuser'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### 2.3 Deploy WordPress

```bash
# Create web directory
mkdir -p /var/www/your-domain.com
cd /var/www/your-domain.com

# Clone or rsync your WordPress files
rsync -avz apps/wp/public/ /var/www/your-domain.com/

# Download WordPress core
wget https://wordpress.org/latest.tar.gz
tar -xzf latest.tar.gz
mv wordpress/* .
rm -rf wordpress latest.tar.gz

# Set permissions
chown -R www-data:www-data /var/www/your-domain.com
find /var/www/your-domain.com -type d -exec chmod 755 {} \;
find /var/www/your-domain.com -type f -exec chmod 644 {} \;

# Create wp-config.php
cp wp-config-sample.php wp-config.php
nano wp-config.php
```

**Edit wp-config.php:**

```php
define('DB_NAME', 'wordpress_prod');
define('DB_USER', 'wpuser');
define('DB_PASSWORD', 'YOUR_PASSWORD');
define('DB_HOST', 'localhost');
define('DB_CHARSET', 'utf8mb4');

// Get salts from: https://api.wordpress.org/secret-key/1.1/salt/
// Paste here

// WordPress URLs
define('WP_HOME', 'https://your-domain.com');
define('WP_SITEURL', 'https://your-domain.com');

// Security
define('DISALLOW_FILE_EDIT', true);
define('WP_DEBUG', false);
define('WP_DEBUG_LOG', false);
define('WP_DEBUG_DISPLAY', false);
```

#### 2.4 Configure Nginx

```bash
# Create Nginx config
nano /etc/nginx/sites-available/your-domain.com
```

**Nginx Configuration:**

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com www.your-domain.com;
    root /var/www/your-domain.com;
    index index.php index.html;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # WordPress permalinks
    location / {
        try_files $uri $uri/ /index.php?$args;
    }

    # PHP processing
    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    # Deny access to sensitive files
    location ~ /\.(?!well-known).* {
        deny all;
    }

    location = /xmlrpc.php {
        deny all;
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/your-domain.com /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

#### 2.5 Install SSL Certificate

```bash
# Install Let's Encrypt certificate
certbot --nginx -d your-domain.com -d www.your-domain.com

# Test auto-renewal
certbot renew --dry-run
```

#### 2.6 Complete WordPress Installation

```bash
# Access WordPress in browser
https://your-domain.com/wp-admin/install.php

# Complete installation wizard:
# - Site Title: Your Site Name
# - Username: admin_UNIQUE (NOT "admin")
# - Password: Strong password from password manager
# - Email: your-email@domain.com
```

#### 2.7 Install Required Plugins

```bash
# Via WP-CLI (if installed)
cd /var/www/your-domain.com

wp plugin install wp-graphql --activate
wp plugin install advanced-custom-fields --activate
wp plugin install wp-graphql-acf --activate
wp plugin install updraftplus --activate
wp plugin install wordfence --activate

# Or install manually via WordPress admin
```

---

### Phase 3: Cloudflare Setup

#### 3.1 Add Domain to Cloudflare

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click "Add a Site"
3. Enter your domain: `your-domain.com`
4. Select Free plan
5. Cloudflare will scan your DNS records
6. Review and confirm DNS records
7. Update nameservers at your domain registrar to Cloudflare's nameservers
8. Wait for DNS propagation (can take 24-48 hours)

#### 3.2 Configure Cloudflare Settings

**SSL/TLS Settings:**
- SSL/TLS encryption mode: **Full (strict)**
- Always Use HTTPS: **On**
- Automatic HTTPS Rewrites: **On**
- Minimum TLS Version: **1.2**

**Security Settings:**
- Security Level: **Medium**
- Challenge Passage: **30 minutes**
- Browser Integrity Check: **On**
- Privacy Pass Support: **On**

**Firewall:**
- Add rate limiting rules
- Add WAF rules for WordPress protection
- Consider adding bot fight mode

**Speed:**
- Auto Minify: Enable HTML, CSS, JS
- Brotli: **On**
- Early Hints: **On**
- HTTP/2: **On**
- HTTP/3 (with QUIC): **On**

**Caching:**
- Caching Level: **Standard**
- Browser Cache TTL: **4 hours**
- Always Online: **On**
- Development Mode: **Off** (for production)

#### 3.3 Configure DNS Records

**For WordPress (VPS):**
```
Type: A
Name: @
Content: YOUR_VPS_IP
Proxy: Enabled (orange cloud)
TTL: Auto

Type: A
Name: www
Content: YOUR_VPS_IP
Proxy: Enabled (orange cloud)
TTL: Auto
```

**For Astro (will be updated after Cloudflare Pages setup):**
```
Type: CNAME
Name: www
Content: your-project.pages.dev
Proxy: Enabled
TTL: Auto
```

---

### Phase 4: Deploy Astro to Cloudflare Pages

#### 4.1 Create Cloudflare Pages Project

1. Go to Cloudflare Dashboard → Pages
2. Click "Create a project"
3. Connect to Git provider (GitHub)
4. Select repository: `your-org/reactorbro-stack`
5. Configure build settings:
   - **Framework preset:** Astro
   - **Build command:** `pnpm run build`
   - **Build output directory:** `apps/astro/dist`
   - **Root directory:** `/`
   - **Node version:** 18

#### 4.2 Set Environment Variables

In Cloudflare Pages → Settings → Environment Variables:

```
SITE_URL=https://your-domain.com
WP_GRAPHQL_URL=https://your-domain.com/graphql
NODE_VERSION=18
```

#### 4.3 Configure Custom Domain

1. In Cloudflare Pages project → Custom domains
2. Add custom domain: `your-domain.com`
3. Cloudflare will automatically configure DNS
4. Wait for SSL certificate provisioning (few minutes)

#### 4.4 Deploy

```bash
# Push to main branch triggers automatic deployment
git push origin main

# Or use Cloudflare Pages dashboard to trigger manual deployment
```

#### 4.5 Verify Deployment

```bash
# Check deployment status in Cloudflare Pages dashboard
# Visit: https://your-domain.com
# Should see your Astro site live
```

---

### Phase 5: Post-Deployment Configuration

#### 5.1 WordPress Configuration

1. Log in to WordPress admin: `https://your-domain.com/wp-admin`
2. **Settings → General:**
   - WordPress Address: `https://your-domain.com`
   - Site Address: `https://your-domain.com`
3. **Settings → Permalinks:**
   - Set to "Post name" or custom structure
4. **Settings → Reading:**
   - Configure homepage and blog page
5. **WPGraphQL → Settings:**
   - Enable GraphQL endpoint
   - Set query depth limit: 10
   - Set query complexity limit: 1000

#### 5.2 Create ACF Fields

1. Create field groups in ACF
2. Export to JSON (acf-json directory)
3. Commit to repository
4. Verify fields appear in GraphQL schema

#### 5.3 Configure Cloudflare Access (Optional but Recommended)

Protect WordPress admin:

1. Cloudflare Dashboard → Zero Trust → Access → Applications
2. Create new application:
   - **Name:** WordPress Admin
   - **Domain:** `your-domain.com`
   - **Path:** `/wp-admin*`
3. Add policy:
   - **Rule name:** Admins Only
   - **Action:** Allow
   - **Include:** Emails (add admin emails)

#### 5.4 Set Up Automated Backups

**UpdraftPlus Configuration:**
1. WordPress Admin → Settings → UpdraftPlus Backups
2. Configure backup schedule (daily recommended)
3. Set remote storage (Cloudflare R2, S3, etc.)
4. Test backup and restoration
5. Set up email notifications

**Or VPS-level backups:**
```bash
# Create backup script
nano /root/backup-wordpress.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/backups"
SITE_DIR="/var/www/your-domain.com"
DB_NAME="wordpress_prod"
DB_USER="wpuser"
DB_PASS="YOUR_PASSWORD"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME > $BACKUP_DIR/db_$DATE.sql

# Backup files
tar -czf $BACKUP_DIR/files_$DATE.tar.gz $SITE_DIR

# Keep only last 7 days of backups
find $BACKUP_DIR -name "db_*" -mtime +7 -delete
find $BACKUP_DIR -name "files_*" -mtime +7 -delete

echo "Backup completed: $DATE"
```

```bash
# Make executable
chmod +x /root/backup-wordpress.sh

# Add to crontab (daily at 2 AM)
crontab -e
0 2 * * * /root/backup-wordpress.sh >> /var/log/wordpress-backup.log 2>&1
```

---

### Phase 6: Monitoring & Analytics

#### 6.1 Set Up Uptime Monitoring

**UptimeRobot (Free):**
1. Sign up at [uptimerobot.com](https://uptimerobot.com)
2. Add monitors:
   - **WordPress:** `https://your-domain.com`
   - **GraphQL:** `https://your-domain.com/graphql`
   - **Astro Frontend:** `https://your-domain.com`
3. Configure alerts (email, SMS, Slack)

#### 6.2 Configure Analytics

**Cloudflare Web Analytics:**
1. Cloudflare Dashboard → Analytics → Web Analytics
2. Enable for your site
3. Add beacon to Astro site (optional, automatic in most cases)

**Google Analytics 4 (Optional):**
1. Create GA4 property
2. Add tracking code to Astro layout
3. Configure goals and conversions

#### 6.3 Set Up Error Monitoring (Optional)

**Sentry:**
1. Create account at [sentry.io](https://sentry.io)
2. Create new project for Astro
3. Add Sentry SDK to Astro
4. Configure error tracking

---

## ✅ Post-Deployment Checklist

Within 1 hour of deployment:

- [ ] All pages loading correctly
- [ ] WordPress admin accessible
- [ ] GraphQL queries working
- [ ] Forms submitting correctly
- [ ] SSL certificate valid
- [ ] No console errors
- [ ] Analytics tracking
- [ ] Backups configured

Within 24 hours:

- [ ] Monitor error logs
- [ ] Check uptime monitoring
- [ ] Verify DNS propagation complete
- [ ] Test from multiple locations/devices
- [ ] Performance metrics acceptable
- [ ] Client approval and sign-off

---

## 🔧 Common Issues & Solutions

### Issue: WordPress shows "Error establishing database connection"

**Solution:**
```bash
# Check database credentials in wp-config.php
# Verify database exists
mysql -u wpuser -p wordpress_prod

# Check MySQL is running
systemctl status mysql
```

### Issue: SSL Certificate errors

**Solution:**
```bash
# Regenerate certificate
certbot delete --cert-name your-domain.com
certbot --nginx -d your-domain.com -d www.your-domain.com
```

### Issue: GraphQL endpoint not accessible

**Solution:**
1. Check WPGraphQL plugin is activated
2. Verify permalinks are not "Plain"
3. Check .htaccess or Nginx config

### Issue: Cloudflare Pages build fails

**Solution:**
1. Check build logs in Cloudflare dashboard
2. Verify environment variables are set
3. Ensure package.json has correct build command
4. Check Node version compatibility

### Issue: High response times

**Solution:**
1. Enable Cloudflare caching
2. Configure WordPress object caching
3. Optimize database queries
4. Enable PHP OPcache
5. Use CDN for media files

---

## 📞 Emergency Contacts

- **Cloudflare Support:** https://dash.cloudflare.com/support
- **VPS Provider:** [Your provider support URL]
- **Team Lead:** [Name, Phone, Email]
- **Client Contact:** [Name, Phone, Email]

---

## 🔄 Deployment Workflow for Updates

After initial deployment, use this workflow for updates:

```bash
# 1. Make changes and test locally
pnpm run test
pnpm run build

# 2. Commit and push to main
git add .
pnpm commit
git push origin main

# 3. Cloudflare Pages automatically deploys
# Monitor deployment in Cloudflare dashboard

# 4. For WordPress updates
# SSH into VPS and pull changes
cd /var/www/your-domain.com
git pull origin main
# Or use rsync for specific files
```

---

## 📚 Additional Resources

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [WordPress Hardening](https://wordpress.org/support/article/hardening-wordpress/)
- [WPGraphQL Docs](https://www.wpgraphql.com/)
- [Astro Deployment](https://docs.astro.build/en/guides/deploy/)
- [Nginx Configuration](https://nginx.org/en/docs/)

---

## 🎉 Congratulations!

Your ReactorJet Stack is now live in production! 

**Next steps:**
1. Monitor closely for first 48 hours
2. Address any issues immediately
3. Collect user feedback
4. Plan regular maintenance schedule
5. Keep documentation updated

**Remember:** Always test in staging before deploying to production!

---

**Document Version:** 1.0  
**Last Updated:** November 2024  
**Maintained by:** [Your Team Name]