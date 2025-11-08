# Running the Application

## Available Apps

### 1. Documentation Site (Recommended)
```bash
pnpm docs
```
- **URL:** http://localhost:4322
- **Features:** Documentation, API reference, workflow visualization
- **Status:** Starting in background...

### 2. Main Astro App
```bash
pnpm -C apps/astro dev
```
- **URL:** http://localhost:4321 (default Astro port)
- **Features:** Main application frontend

### 3. Convex Dashboard
```bash
npx convex dashboard
```
- **URL:** Opens in browser
- **Features:** Database management, function logs, data viewer

### 4. Development Dashboard
```bash
pnpm dashboard
```
- **URL:** http://localhost:3000 (default)
- **Features:** Observability dashboard, metrics, traces

---

## Quick Start

The documentation site is the main entry point:

```bash
# Start docs server
pnpm docs

# Or start in background
pnpm docs &
```

Then visit: **http://localhost:4322**

---

## What's Available

### Documentation Site Features
- 📚 Getting Started Guides
- 🏗️ Architecture Documentation
- 📖 API Reference
- 🎨 Workflow Visualization
- 📊 Deployment Dashboard
- 🔍 Distributed Tracing Viewer
- 📝 Interactive Examples

### Convex Dashboard
- View database tables
- Monitor function executions
- View logs and errors
- Manage schema
- Query data

---

## Status

**Docs Server:** Starting...
**Convex:** ✅ Configured and deployed
**All Systems:** ✅ Ready

Visit http://localhost:4322 once the server starts!

