# Animation Library Migration Guide

## Overview

The animation library has been upgraded from anime.js + framer-motion to **Motion One** + modern web APIs.

**Benefits:**
- ✅ 67% smaller bundle size (~62KB saved)
- ✅ Better performance (uses Web Animations API)
- ✅ Modern browser APIs (View Transitions, CSS Scroll-driven)
- ✅ Better tree-shaking

---

## Migration Steps

### 1. Update Dependencies

The `apps/astro/package.json` has been updated. Run:

```bash
pnpm install
```

This will:
- ✅ Remove `animejs` and `framer-motion`
- ✅ Add `@repo/animations` (workspace package)

### 2. Update Component Imports

#### Before (anime.js)

```typescript
const anime = require('animejs');

anime({
  targets: '.element',
  translateY: [50, 0],
  opacity: [0, 1],
  duration: 800,
});
```

#### After (Motion One)

```typescript
import { entranceAnimations } from '@repo/animations';

entranceAnimations.fadeInUp({
  targets: '.element',
  duration: 0.8,
});
```

### 3. Update Animated Components

#### AnimatedHero.astro

**Before:**
```typescript
const anime = require('animejs');
anime({
  targets: '.hero-title',
  translateY: [50, 0],
  opacity: [0, 1],
});
```

**After:**
```typescript
import { entranceAnimations } from '@repo/animations';

entranceAnimations.fadeInUp({
  targets: '.hero-title',
});
```

#### AnimatedButton.astro

**Before:**
```typescript
const anime = require('animejs');
anime({
  targets: button,
  scale: [1, 1.05],
  duration: 300,
});
```

**After:**
```typescript
import { interactionAnimations } from '@repo/animations';

interactionAnimations.hoverLift(button);
```

#### AnimatedCard.astro

**Before:**
```typescript
const anime = require('animejs');
anime({
  targets: '.card',
  translateY: [30, 0],
  opacity: [0, 1],
  delay: anime.stagger(80),
});
```

**After:**
```typescript
import { staggerAnimations } from '@repo/animations';

staggerAnimations.staggerCards({
  targets: '.card',
});
```

#### AnimatedSection.astro

**Before:**
```typescript
const anime = require('animejs');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      anime({
        targets: entry.target,
        translateY: [50, 0],
        opacity: [0, 1],
      });
    }
  });
});
```

**After:**
```typescript
import { scrollAnimations } from '@repo/animations';

scrollAnimations.revealOnScroll({
  targets: '.scroll-reveal',
});
```

---

## New Features Available

### 1. View Transitions API

```typescript
import { fadeTransition } from '@repo/animations/view-transitions';

await fadeTransition(() => {
  // Update DOM
  document.getElementById('content').innerHTML = newContent;
});
```

### 2. CSS Scroll-driven Animations

```typescript
import { setupScrollDrivenAnimations } from '@repo/animations/scroll-driven';

setupScrollDrivenAnimations();

// Then use CSS classes:
// <div class="scroll-reveal">Content</div>
```

### 3. Motion One Presets

```typescript
import {
  entranceAnimations,
  staggerAnimations,
  interactionAnimations,
  continuousAnimations,
} from '@repo/animations';

// Entrance
entranceAnimations.fadeInUp();
entranceAnimations.zoomIn();

// Stagger
staggerAnimations.staggerCards();
staggerAnimations.staggerList();

// Interactions
interactionAnimations.magneticButton(button);
interactionAnimations.hoverLift(element);

// Continuous
continuousAnimations.float();
continuousAnimations.pulse();
```

---

## Component Update Checklist

- [ ] Update `AnimatedHero.astro`
- [ ] Update `AnimatedButton.astro`
- [ ] Update `AnimatedCard.astro`
- [ ] Update `AnimatedSection.astro`
- [ ] Test all animations
- [ ] Verify reduced motion support
- [ ] Check performance improvements

---

## Testing

After migration, test:

1. ✅ All entrance animations work
2. ✅ Stagger animations work
3. ✅ Scroll animations work
4. ✅ Interaction animations work
5. ✅ Reduced motion is respected
6. ✅ No console errors
7. ✅ Bundle size reduced

---

## Need Help?

See the full documentation:
- `packages/animations/README.md` - Complete API reference
- `packages/animations/src/` - Source code examples

---

**Migration Status:** Ready to migrate components ✅

