# Animations Quick Start Guide 🚀

**ReactorBro Stack Phase 3 - Get Started in 5 Minutes**

---

## What You Get

- ✅ 4 Production-ready animated components
- ✅ 70+ animation presets (anime.js, Framer Motion, GSAP)
- ✅ Full accessibility support (prefers-reduced-motion)
- ✅ 60 FPS performance
- ✅ Zero configuration required

---

## Installation

Dependencies are already installed! Just use the components.

```bash
# If starting fresh, install dependencies:
pnpm install
```

---

## Quick Start: 3 Steps

### Step 1: Import Components

```astro
---
import AnimatedHero from '@/components/animated/AnimatedHero.astro';
import AnimatedSection from '@/components/animated/AnimatedSection.astro';
import AnimatedCard from '@/components/animated/AnimatedCard.astro';
import AnimatedButton from '@/components/animated/AnimatedButton.astro';
---
```

### Step 2: Use in Your Page

```astro
<!-- Hero Section -->
<AnimatedHero
  title="Welcome to Your Site"
  subtitle="Amazing Tagline"
>
  <p>Your description here</p>
  <div slot="cta">
    <AnimatedButton href="/contact">Get Started</AnimatedButton>
  </div>
</AnimatedHero>

<!-- Content Section -->
<AnimatedSection animationType="fade">
  <h2>About Us</h2>
  <p>Your content...</p>
</AnimatedSection>

<!-- Cards Grid -->
<div class="grid">
  <AnimatedCard animationType="scale" hoverEffect="lift">
    <h3>Feature 1</h3>
    <p>Description...</p>
  </AnimatedCard>
  
  <AnimatedCard animationType="scale" hoverEffect="lift" delay={100}>
    <h3>Feature 2</h3>
    <p>Description...</p>
  </AnimatedCard>
  
  <AnimatedCard animationType="scale" hoverEffect="lift" delay={200}>
    <h3>Feature 3</h3>
    <p>Description...</p>
  </AnimatedCard>
</div>
```

### Step 3: Run Dev Server

```bash
cd apps/astro
pnpm dev
```

Visit `http://localhost:4321` and see the magic! ✨

---

## Component Cheat Sheet

### AnimatedHero
```astro
<AnimatedHero
  title="Your Title"              <!-- Required -->
  subtitle="Subtitle"             <!-- Optional -->
  backgroundImage="/hero.jpg"     <!-- Optional -->
  parallax={true}                 <!-- Optional, default: false -->
  height="large"                  <!-- small|medium|large|full -->
>
  <p>Description</p>
  <div slot="cta">
    <AnimatedButton>CTA</AnimatedButton>
  </div>
</AnimatedHero>
```

### AnimatedSection
```astro
<AnimatedSection
  animationType="fade"            <!-- fade|slide|scale|zoom -->
  direction="up"                  <!-- up|down|left|right -->
  delay={200}                     <!-- Milliseconds -->
>
  Your content here
</AnimatedSection>
```

### AnimatedCard
```astro
<AnimatedCard
  animationType="scale"           <!-- fade|slide|scale|zoom -->
  hoverEffect="lift"              <!-- lift|scale|glow|none -->
  delay={100}                     <!-- Milliseconds -->
  href="/link"                    <!-- Optional, makes card clickable -->
>
  Card content
</AnimatedCard>
```

### AnimatedButton
```astro
<AnimatedButton
  variant="primary"               <!-- primary|secondary|outline|ghost|link -->
  size="medium"                   <!-- small|medium|large -->
  animation="scale"               <!-- scale|lift|magnetic|ripple|none -->
  href="/link"                    <!-- Optional, renders as <a> -->
>
  Button Text
</AnimatedButton>
```

---

## Common Patterns

### Pattern 1: Hero + Features Grid

```astro
---
import AnimatedHero from '@/components/animated/AnimatedHero.astro';
import AnimatedCard from '@/components/animated/AnimatedCard.astro';
import AnimatedButton from '@/components/animated/AnimatedButton.astro';
---

<AnimatedHero
  title="Your Product"
  subtitle="Best Solution"
  backgroundImage="/hero.jpg"
>
  <p>Why choose us?</p>
  <div slot="cta">
    <AnimatedButton href="/signup" size="large">Get Started</AnimatedButton>
  </div>
</AnimatedHero>

<section>
  <div class="grid">
    <AnimatedCard animationType="scale" delay={0}>
      <h3>Fast</h3>
      <p>Lightning speed</p>
    </AnimatedCard>
    
    <AnimatedCard animationType="scale" delay={100}>
      <h3>Secure</h3>
      <p>Bank-level security</p>
    </AnimatedCard>
    
    <AnimatedCard animationType="scale" delay={200}>
      <h3>Easy</h3>
      <p>Simple to use</p>
    </AnimatedCard>
  </div>
</section>
```

### Pattern 2: Staggered Content Sections

```astro
<AnimatedSection animationType="fade" delay={0}>
  <h2>Our Story</h2>
  <p>Founded in 2024...</p>
</AnimatedSection>

<AnimatedSection animationType="slide" direction="left" delay={100}>
  <h2>Our Mission</h2>
  <p>To make the web beautiful...</p>
</AnimatedSection>

<AnimatedSection animationType="slide" direction="right" delay={200}>
  <h2>Our Vision</h2>
  <p>A world where...</p>
</AnimatedSection>
```

### Pattern 3: CTA Section

```astro
<AnimatedSection animationType="scale">
  <h2>Ready to Get Started?</h2>
  <p>Join thousands of happy customers</p>
  <div style="display: flex; gap: 1rem; justify-content: center;">
    <AnimatedButton variant="primary" size="large" animation="ripple">
      Start Free Trial
    </AnimatedButton>
    <AnimatedButton variant="outline" size="large" animation="lift">
      Learn More
    </AnimatedButton>
  </div>
</AnimatedSection>
```

---

## Animation Types Explained

### Entrance Animations

- **fade** - Simple opacity fade-in (subtle, professional)
- **slide** - Fade + translate (dynamic, engaging)
- **scale** - Fade + scale up (playful, attention-grabbing)
- **zoom** - Fade + scale from 0 (dramatic, bold)

### Hover Effects

- **lift** - Elevates with shadow (classic, elegant)
- **scale** - Scales up slightly (modern, clean)
- **glow** - Enhanced shadow (premium, sophisticated)

### Button Animations

- **scale** - Scales on hover/click (responsive, tactile)
- **lift** - Lifts with shadow (elevated, premium)
- **magnetic** - Follows cursor (interactive, playful)
- **ripple** - Material Design ripple (modern, satisfying)

---

## Timing Guide

### Delays (ms)
- **No delay:** 0ms - Instant
- **Quick stagger:** 50-100ms - Fast sequence
- **Normal stagger:** 100-150ms - Comfortable pace
- **Slow stagger:** 200-300ms - Dramatic entrance

### Durations (ms)
- **Quick:** 400-600ms - Snappy
- **Normal:** 600-800ms - Balanced (default)
- **Slow:** 800-1200ms - Dramatic

### Example: Perfect Stagger
```astro
{items.map((item, i) => (
  <AnimatedCard delay={i * 100}>  <!-- 100ms between each -->
    {item.content}
  </AnimatedCard>
))}
```

---

## Accessibility Notes

All components automatically:
- ✅ Respect `prefers-reduced-motion`
- ✅ Include ARIA labels
- ✅ Support keyboard navigation
- ✅ Have visible focus states
- ✅ Work without JavaScript

### Test Reduced Motion

**Chrome DevTools:**
1. Open DevTools (F12)
2. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows)
3. Type "Rendering"
4. Select "Show Rendering"
5. Find "Emulate CSS media feature prefers-reduced-motion"
6. Select "prefers-reduced-motion: reduce"

---

## Performance Tips

### DO ✅
- Use `transform` and `opacity` (GPU-accelerated)
- Keep concurrent animations under 5-7 elements
- Use appropriate delays for stagger effects
- Test on mobile devices

### DON'T ❌
- Animate `width`, `height`, `top`, `left` (causes reflow)
- Run 20+ animations simultaneously
- Use very long durations (>1000ms)
- Forget to test performance

---

## Troubleshooting

### Animations not running?
1. Check browser console for errors
2. Verify anime.js is installed: `pnpm list animejs`
3. Ensure element is in viewport (adjust `threshold`)
4. Check if prefers-reduced-motion is enabled

### Poor performance?
1. Reduce concurrent animations
2. Shorten animation durations
3. Simplify animation types
4. Test FPS: Chrome DevTools → Performance tab

### Layout shifting?
```css
.animated-card {
  min-height: 200px; /* Reserve space */
  contain: layout;   /* CSS containment */
}
```

---

## Advanced Usage

### Using Animation Presets Directly

```astro
<script>
  import { entranceAnimations } from '@repo/animations/anime';
  const anime = require('animejs');

  // Custom animation
  anime(entranceAnimations.fadeInUp({
    targets: '.my-element',
    duration: 1000,
    delay: 200
  }));
</script>
```

### Custom Animation with anime.js

```astro
<script>
  const anime = require('animejs');

  anime({
    targets: '.custom-element',
    translateX: [0, 100],
    rotate: '1turn',
    backgroundColor: '#FFF',
    duration: 2000,
    easing: 'easeInOutQuad'
  });
</script>
```

---

## Demo Page

See all animations in action:

```bash
cd apps/astro
pnpm dev
```

Visit: `http://localhost:4321/animations-demo`

---

## Next Steps

1. **Integrate into Berg Projects**
   - Update homepage with AnimatedHero
   - Add AnimatedCards to portfolio section
   - Replace buttons with AnimatedButton

2. **Customize Animations**
   - Adjust delays and durations
   - Try different animation types
   - Experiment with combinations

3. **Build Visual Effects (Week 3-4)**
   - Particle systems
   - Animated gradients
   - Advanced effects

4. **Create Premium Themes (Week 5-6)**
   - SaaS landing page
   - Portfolio/Agency
   - E-commerce

---

## Support

### Documentation
- Component README: `apps/astro/src/components/animated/README.md`
- Implementation Plan: `docs/planning/PHASE3_IMPLEMENTATION_PLAN.md`

### Resources
- [anime.js Docs](https://animejs.com/documentation/)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [GSAP Docs](https://greensock.com/docs/)

---

## Summary

You now have:
✅ 4 animated components ready to use  
✅ 70+ animation presets at your disposal  
✅ Full accessibility support  
✅ Production-ready performance  
✅ Comprehensive documentation  

**Start animating in your next commit!** 🎉

---

**Version:** 1.0.0  
**Last Updated:** 2024  
**Status:** Production Ready ✅