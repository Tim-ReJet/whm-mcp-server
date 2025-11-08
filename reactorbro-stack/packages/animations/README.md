# @repo/animations v2.0

**Cutting-edge modern animation library** using native browser APIs and modern web technologies.

## 🚀 What's New

### v2.0 - Modern Web Technology Upgrade

- ✅ **Motion One** - Lightweight (~5KB) successor to anime.js, uses Web Animations API
- ✅ **View Transitions API** - Native browser page transitions
- ✅ **CSS Scroll-driven Animations** - GPU-accelerated scroll animations
- ✅ **GSAP** - Kept only for complex animations (ScrollTrigger, SVG, physics)

### Bundle Size Reduction

- **Before:** ~92KB (anime.js + framer-motion + GSAP)
- **After:** ~35KB (Motion One + GSAP, GSAP lazy-loaded)
- **Savings:** ~62KB (67% reduction)

---

## 📦 Installation

```bash
pnpm add @repo/animations
```

---

## 🎯 Quick Start

### Motion One (Recommended for Most Animations)

```typescript
import { entranceAnimations } from "@repo/animations";

// Fade in and slide up
entranceAnimations.fadeInUp();

// With custom config
entranceAnimations.fadeInUp({
  targets: ".my-element",
  duration: 1,
  delay: 0.2,
});
```

### View Transitions API (Page Transitions)

```typescript
import {
  fadeTransition,
  slideTransition,
} from "@repo/animations/view-transitions";

// Fade transition
await fadeTransition(() => {
  // Update DOM
  document.getElementById("content").innerHTML = newContent;
});

// Slide transition
await slideTransition(() => {
  // Update DOM
}, "left");
```

### CSS Scroll-driven Animations (GPU-Accelerated)

```typescript
import { setupScrollDrivenAnimations } from '@repo/animations/scroll-driven';

// Setup once
setupScrollDrivenAnimations();

// Then use CSS classes in your HTML
<div class="scroll-reveal">Content</div>
<div class="parallax">Parallax content</div>
```

### GSAP (Complex Animations Only)

```typescript
import { scrollTriggerAnimations } from "@repo/animations/gsap";

// ScrollTrigger animation
scrollTriggerAnimations.revealOnScrollTrigger(element);
```

---

## 📚 API Reference

### Motion One Presets

#### Entrance Animations

```typescript
import { entranceAnimations } from "@repo/animations";

entranceAnimations.fadeInUp(config);
entranceAnimations.fadeInDown(config);
entranceAnimations.fadeInLeft(config);
entranceAnimations.fadeInRight(config);
entranceAnimations.fadeInScale(config);
entranceAnimations.zoomIn(config);
```

#### Stagger Animations

```typescript
import { staggerAnimations } from "@repo/animations";

staggerAnimations.staggerCards(config);
staggerAnimations.staggerList(config);
staggerAnimations.staggerFromCenter(config);
staggerAnimations.wave(config);
```

#### Interaction Animations

```typescript
import { interactionAnimations } from "@repo/animations";

// Magnetic button
const cleanup = interactionAnimations.magneticButton(buttonElement, 0.5);

// Hover lift
const cleanup = interactionAnimations.hoverLift(element);

// Ripple effect
interactionAnimations.ripple(element, x, y);
```

#### Continuous Animations

```typescript
import { continuousAnimations } from "@repo/animations";

continuousAnimations.float(config);
continuousAnimations.pulse(config);
continuousAnimations.rotate(config);
continuousAnimations.shimmer(config);
```

### View Transitions API

```typescript
import {
  startViewTransition,
  fadeTransition,
  slideTransition,
  scaleTransition,
  supportsViewTransitions,
} from "@repo/animations/view-transitions";

// Check support
if (supportsViewTransitions()) {
  await fadeTransition(() => {
    // Update DOM
  });
}
```

### CSS Scroll-driven Animations

```typescript
import {
  setupScrollDrivenAnimations,
  scrollRevealCSS,
  parallaxScrollCSS,
  supportsScrollDrivenAnimations,
} from "@repo/animations/scroll-driven";

// Setup
setupScrollDrivenAnimations();

// Get CSS for custom styles
const css = scrollRevealCSS();
```

### GSAP (Advanced)

```typescript
import {
  scrollTriggerAnimations,
  svgAnimations,
  physicsAnimations,
} from "@repo/animations/gsap";

// ScrollTrigger
scrollTriggerAnimations.pinOnScroll(element);

// SVG animations
svgAnimations.drawPath(pathElement);

// Physics
physicsAnimations.elasticBounce(element);
```

---

## 🎨 Usage Examples

### Astro Component

```astro
---
import { entranceAnimations } from '@repo/animations';
import { onMount } from 'astro';

onMount(() => {
  entranceAnimations.fadeInUp({
    targets: '.animate-on-load',
  });
});
---

<div class="animate-on-load">
  <h1>Hello World</h1>
</div>
```

### React Component

```tsx
import { useEffect, useRef } from "react";
import { entranceAnimations } from "@repo/animations";

function MyComponent() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      entranceAnimations.fadeInUp({
        targets: ref.current,
      });
    }
  }, []);

  return <div ref={ref}>Content</div>;
}
```

### View Transitions in Astro

```astro
---
import { fadeTransition } from '@repo/animations/view-transitions';

async function handleNavigation() {
  await fadeTransition(() => {
    // Update content
  });
}
---

<a onclick={handleNavigation}>Navigate</a>
```

---

## 🌐 Browser Support

### Motion One (Web Animations API)

- ✅ Chrome 36+
- ✅ Firefox 48+
- ✅ Safari 13.1+
- ✅ Edge 79+

### View Transitions API Browser Support

- ✅ Chrome 111+
- ✅ Edge 111+
- ⚠️ Firefox (in development)
- ⚠️ Safari (in development)
- ✅ Fallback: Direct DOM update

### CSS Scroll-driven Animations Browser Support

- ✅ Chrome 115+
- ✅ Edge 115+
- ⚠️ Firefox (in development)
- ⚠️ Safari (in development)
- ✅ Fallback: Intersection Observer

### GSAP

- ✅ All modern browsers

---

## ⚡ Performance

### Why Motion One?

1. **Native Web Animations API** - Hardware accelerated
2. **Small bundle size** - ~5KB vs ~17KB (anime.js)
3. **Better performance** - Uses browser's native animation engine
4. **Tree-shakeable** - Only import what you use

### Why CSS Scroll-driven Animations?

1. **GPU-accelerated** - Runs on compositor thread
2. **No JavaScript** - Pure CSS, zero JS overhead
3. **Smooth** - 60fps even on low-end devices
4. **Battery efficient** - Less CPU usage

### When to Use GSAP?

- Complex timeline sequences
- ScrollTrigger animations
- SVG morphing
- Physics-based animations
- Advanced easing functions

---

## 🔧 Configuration

### Motion Preferences

All animations respect `prefers-reduced-motion`:

```typescript
import { prefersReducedMotion, getSafeDuration } from "@repo/animations/utils";

if (prefersReducedMotion()) {
  // Skip animations or use instant transitions
}

const duration = getSafeDuration(800); // Returns 0 if reduced motion
```

### Performance Monitoring

```typescript
import { AnimationPerformanceMonitor } from "@repo/animations/utils";

const monitor = new AnimationPerformanceMonitor();
monitor.start();

// Check FPS
const fps = monitor.getFPS();
if (fps < 55) {
  // Reduce animation complexity
}
```

---

## 📖 Migration Guide

### From anime.js

```typescript
// Before
import anime from "animejs";
anime({
  targets: ".element",
  translateY: [50, 0],
  opacity: [0, 1],
});

// After
import { entranceAnimations } from "@repo/animations";
entranceAnimations.fadeInUp({
  targets: ".element",
});
```

### From framer-motion

```typescript
// Before
<motion.div
  initial={{ opacity: 0, y: 50 }}
  animate={{ opacity: 1, y: 0 }}
/>

// After
import { entranceAnimations } from '@repo/animations';
// Use Motion One in useEffect or onMount
```

---

## 🎯 Best Practices

1. **Use Motion One for most animations** - It's lightweight and performant
2. **Use CSS Scroll-driven for scroll animations** - Best performance
3. **Use View Transitions for page transitions** - Native browser support
4. **Use GSAP only when needed** - Complex animations, ScrollTrigger, SVG
5. **Respect motion preferences** - Always check `prefers-reduced-motion`
6. **Monitor performance** - Use performance monitoring tools
7. **Lazy load GSAP** - Only import when needed

---

## 📝 License

Private project. All rights reserved.

---

## 🙏 Acknowledgments

Built with:

- [Motion One](https://motion.dev/) - Modern animation library
- [GSAP](https://greensock.com/gsap/) - Professional animation platform
- [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API) - Native browser API
- [View Transitions API](https://developer.chrome.com/docs/web-platform/view-transitions/) - Native page transitions

---

## 🚀 Get Started

Start animating with modern web technology!
