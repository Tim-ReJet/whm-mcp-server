# Animated Components

Production-ready animated components for Astro using the `@repo/animations` library.

## Overview

These components provide easy-to-use, accessible animations that respect user preferences and deliver 60 FPS performance.

**Key Features:**
- 🎬 Scroll-triggered animations
- ♿ Respects `prefers-reduced-motion`
- ⚡ 60 FPS performance
- 🔄 Works with Astro View Transitions
- 📱 Mobile-optimized
- 🎯 IntersectionObserver-based (efficient)

## Available Components

### AnimatedSection ✅

A wrapper component that adds scroll-triggered animations to any content.

### AnimatedCard ✅

A card component with built-in scroll reveal and hover animations.

### AnimatedButton ✅

An interactive button with smooth hover, tap, and focus animations.

### AnimatedHero ✅

A hero section with sophisticated staggered entrance animations.

---

## AnimatedSection

A wrapper component that adds scroll-triggered animations to any content.

**Usage:**

```astro
---
import AnimatedSection from '@/components/animated/AnimatedSection.astro';
---

<!-- Basic fade animation -->
<AnimatedSection animationType="fade">
  <h2>Your Content</h2>
  <p>This will fade in when scrolled into view.</p>
</AnimatedSection>

<!-- Slide up animation with delay -->
<AnimatedSection 
  animationType="slide" 
  direction="up" 
  delay={200}
  duration={1000}
>
  <div class="card">
    This card slides up with a 200ms delay
  </div>
</AnimatedSection>

<!-- Scale animation with custom threshold -->
<AnimatedSection 
  animationType="scale"
  threshold={0.2}
  rootMargin="-100px"
>
  <img src="/hero.jpg" alt="Hero" />
</AnimatedSection>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `animationType` | `'fade' \| 'slide' \| 'scale' \| 'zoom'` | `'fade'` | Type of animation |
| `direction` | `'up' \| 'down' \| 'left' \| 'right'` | `'up'` | Direction for slide animations |
| `delay` | `number` | `0` | Animation delay in milliseconds |
| `duration` | `number` | `800` | Animation duration in milliseconds |
| `easing` | `string` | `'easeOutExpo'` | Easing function (anime.js easing) |
| `threshold` | `number` | `0.1` | IntersectionObserver threshold (0-1) |
| `rootMargin` | `string` | `'-50px'` | IntersectionObserver root margin |
| `disableAnimation` | `boolean` | `false` | Disable animation (useful for testing) |
| `class` | `string` | `''` | Additional CSS classes |

**Animation Types:**

- **fade**: Simple opacity fade-in
- **slide**: Fade + translate (specify direction with `direction` prop)
- **scale**: Fade + scale from 80% to 100%
- **zoom**: Fade + scale from 0% to 100%

**Easing Options:**

Common anime.js easing functions:
- `easeOutExpo` (default) - Smooth, professional
- `easeOutCubic` - Natural, subtle
- `easeOutBack` - Playful bounce
- `easeInOutQuad` - Balanced
- `linear` - Constant speed

[Full easing reference →](https://animejs.com/documentation/#pennerFunctions)

---

## AnimatedCard

A card component with built-in scroll reveal and hover animations. Combines entrance animations with interactive hover effects.

**Usage:**

```astro
---
import AnimatedCard from '@/components/animated/AnimatedCard.astro';
---

<!-- Basic card with default animations -->
<AnimatedCard>
  <h3>Project Title</h3>
  <p>Project description goes here</p>
</AnimatedCard>

<!-- Card with custom animation and hover effect -->
<AnimatedCard 
  animationType="scale" 
  hoverEffect="lift"
  delay={200}
>
  <img src="/project.jpg" alt="Project" />
  <h3>Featured Project</h3>
  <p>Details about the project</p>
</AnimatedCard>

<!-- Clickable card (renders as link) -->
<AnimatedCard 
  href="/project/1"
  hoverEffect="glow"
  class="project-card"
>
  <div class="card-content">
    <h3>View Project</h3>
    <p>Click to see details</p>
  </div>
</AnimatedCard>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `animationType` | `'fade' \| 'slide' \| 'scale' \| 'zoom'` | `'fade'` | Entrance animation type |
| `direction` | `'up' \| 'down' \| 'left' \| 'right'` | `'up'` | Direction for slide animations |
| `hoverEffect` | `'lift' \| 'scale' \| 'glow' \| 'none'` | `'lift'` | Hover effect type |
| `delay` | `number` | `0` | Animation delay in milliseconds |
| `duration` | `number` | `600` | Animation duration in milliseconds |
| `threshold` | `number` | `0.1` | IntersectionObserver threshold |
| `href` | `string` | `undefined` | URL (makes card clickable) |
| `disableAnimation` | `boolean` | `false` | Disable entrance animation |
| `disableHover` | `boolean` | `false` | Disable hover effects |

---

## AnimatedButton

An interactive button with smooth hover, tap, and focus animations. Includes ripple effect and loading states.

**Usage:**

```astro
---
import AnimatedButton from '@/components/animated/AnimatedButton.astro';
---

<!-- Basic button -->
<AnimatedButton>Click Me</AnimatedButton>

<!-- Primary button with link -->
<AnimatedButton 
  variant="primary" 
  size="large"
  href="/contact"
>
  Get Started
</AnimatedButton>

<!-- Button with different animations -->
<AnimatedButton animation="ripple">
  Ripple Effect
</AnimatedButton>

<AnimatedButton animation="magnetic">
  Magnetic Effect
</AnimatedButton>

<!-- Loading button -->
<AnimatedButton loading={true}>
  Loading...
</AnimatedButton>

<!-- Full width button -->
<AnimatedButton fullWidth variant="secondary">
  Full Width Button
</AnimatedButton>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'link'` | `'primary'` | Button style variant |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Button size |
| `animation` | `'scale' \| 'lift' \| 'magnetic' \| 'ripple' \| 'none'` | `'scale'` | Animation style |
| `href` | `string` | `undefined` | URL (renders as link) |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Button type |
| `disabled` | `boolean` | `false` | Disabled state |
| `loading` | `boolean` | `false` | Loading state |
| `fullWidth` | `boolean` | `false` | Full width button |

**Animation Types:**

- **scale**: Button scales up on hover, down on click
- **lift**: Button lifts up with shadow on hover
- **magnetic**: Button follows cursor within hover area
- **ripple**: Material Design ripple effect on click

---

## AnimatedHero

A hero section component with sophisticated staggered entrance animations. Perfect for landing pages.

**Usage:**

```astro
---
import AnimatedHero from '@/components/animated/AnimatedHero.astro';
import AnimatedButton from '@/components/animated/AnimatedButton.astro';
---

<!-- Basic hero -->
<AnimatedHero
  title="Welcome to Berg Projects"
  subtitle="Excellence in Construction"
>
  <p>Building quality structures since 1995</p>
  <div slot="cta">
    <AnimatedButton href="/contact" variant="primary" size="large">
      Get Started
    </AnimatedButton>
    <AnimatedButton href="/portfolio" variant="outline" size="large">
      View Portfolio
    </AnimatedButton>
  </div>
</AnimatedHero>

<!-- Hero with background image -->
<AnimatedHero
  title="Transform Your Vision"
  subtitle="Professional Construction Services"
  backgroundImage="/hero-bg.jpg"
  overlayOpacity={0.7}
  height="full"
>
  <p>From concept to completion, we deliver excellence.</p>
  <div slot="cta">
    <AnimatedButton href="/services">Explore Services</AnimatedButton>
  </div>
</AnimatedHero>

<!-- Hero with parallax -->
<AnimatedHero
  title="Building Tomorrow"
  backgroundImage="/construction.jpg"
  parallax={true}
  align="left"
>
  <p>Innovative solutions for modern construction challenges.</p>
  <div slot="cta">
    <AnimatedButton>Learn More</AnimatedButton>
  </div>
</AnimatedHero>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | *required* | Hero title text |
| `subtitle` | `string` | `undefined` | Hero subtitle text |
| `backgroundImage` | `string` | `undefined` | Background image URL |
| `overlayOpacity` | `number` | `0.6` | Background overlay opacity (0-1) |
| `animationStyle` | `'stagger' \| 'fade' \| 'slide' \| 'none'` | `'stagger'` | Animation style |
| `align` | `'left' \| 'center' \| 'right'` | `'center'` | Text alignment |
| `height` | `'small' \| 'medium' \| 'large' \| 'full'` | `'large'` | Hero height |
| `parallax` | `boolean` | `false` | Enable parallax scroll effect |
| `staggerDelay` | `number` | `100` | Delay between staggered elements (ms) |
| `initialDelay` | `number` | `200` | Initial animation delay (ms) |

**Slots:**

- **default**: Main content (description)
- **cta**: Call-to-action buttons

---

## Full Examples

### Hero Section

```astro
---
import AnimatedSection from '@/components/animated/AnimatedSection.astro';
---

<section class="hero">
  <AnimatedSection animationType="fade" duration={600}>
    <h1>Welcome to Berg Projects</h1>
  </AnimatedSection>
  
  <AnimatedSection animationType="slide" direction="up" delay={200}>
    <p>Excellence in Construction</p>
  </AnimatedSection>
  
  <AnimatedSection animationType="scale" delay={400}>
    <button class="cta">Get Started</button>
  </AnimatedSection>
</section>
```

### Card Grid with Stagger

For staggered animations, use multiple AnimatedSections with increasing delays:

```astro
---
import AnimatedSection from '@/components/animated/AnimatedSection.astro';

const projects = [
  { title: 'Project 1', description: '...' },
  { title: 'Project 2', description: '...' },
  { title: 'Project 3', description: '...' },
];
---

<div class="grid">
  {projects.map((project, i) => (
    <AnimatedSection 
      animationType="slide"
      direction="up"
      delay={i * 100}
      class="card"
    >
      <h3>{project.title}</h3>
      <p>{project.description}</p>
    </AnimatedSection>
  ))}
</div>
```

### Image Gallery

```astro
---
import AnimatedSection from '@/components/animated/AnimatedSection.astro';
---

<div class="gallery">
  {images.map((img, i) => (
    <AnimatedSection 
      animationType="zoom"
      delay={i * 80}
      duration={500}
    >
      <img src={img.src} alt={img.alt} />
    </AnimatedSection>
  ))}
</div>
```

### About Section with Multiple Elements

```astro
---
import AnimatedSection from '@/components/animated/AnimatedSection.astro';
---

<section class="about">
  <AnimatedSection animationType="slide" direction="left">
    <img src="/team.jpg" alt="Our Team" />
  </AnimatedSection>
  
  <div class="content">
    <AnimatedSection animationType="fade" delay={200}>
      <h2>About Us</h2>
    </AnimatedSection>
    
    <AnimatedSection animationType="slide" direction="up" delay={400}>
      <p>We've been building excellence since 1995...</p>
    </AnimatedSection>
    
    <AnimatedSection animationType="scale" delay={600}>
      <a href="/about" class="btn">Learn More</a>
    </AnimatedSection>
  </div>
</section>
```

## Accessibility

All animated components automatically respect user preferences:

### prefers-reduced-motion

Users who have enabled "Reduce motion" in their OS settings will see instant content without animations.

**Test it:**
```css
/* In your browser DevTools, emulate prefers-reduced-motion */
/* Chrome: DevTools → Rendering → Emulate CSS media feature prefers-reduced-motion */
```

### No JavaScript Fallback

If JavaScript fails to load, content is visible immediately with no animation.

### Keyboard Navigation

All interactive elements remain keyboard-accessible during and after animations.

### Screen Readers

Animations don't interfere with screen reader functionality. Content is announced as soon as it's in the DOM.

## Performance

### Best Practices

✅ **DO:**
- Use `transform` and `opacity` for animations (GPU-accelerated)
- Keep concurrent animations under 5-7 elements
- Use appropriate `threshold` and `rootMargin` values
- Test on mobile devices
- Monitor FPS with Chrome DevTools Performance panel

❌ **DON'T:**
- Animate `width`, `height`, `top`, `left` (causes layout recalculation)
- Run too many animations simultaneously
- Use very long durations (> 1000ms)
- Animate large images without optimization

### Performance Monitoring

```javascript
// Add to a test page to monitor FPS
import { AnimationPerformanceMonitor } from '@repo/animations/utils';

const monitor = new AnimationPerformanceMonitor();
monitor.start();

setInterval(() => {
  const fps = monitor.getFPS();
  console.log('Current FPS:', fps);
  
  if (fps < 50) {
    console.warn('Animation performance degraded!');
  }
}, 1000);
```

### Bundle Size

Current impact: ~15KB gzipped (anime.js + component code)

## Testing

### Visual Testing

```astro
---
// Test page for all animation types
import AnimatedSection from '@/components/animated/AnimatedSection.astro';
---

<div class="test-page">
  <h1>Animation Test Page</h1>
  
  <section>
    <h2>Fade</h2>
    <AnimatedSection animationType="fade">
      <div class="box">Fade In</div>
    </AnimatedSection>
  </section>
  
  <section>
    <h2>Slide Up</h2>
    <AnimatedSection animationType="slide" direction="up">
      <div class="box">Slide Up</div>
    </AnimatedSection>
  </section>
  
  <section>
    <h2>Slide Left</h2>
    <AnimatedSection animationType="slide" direction="left">
      <div class="box">Slide Left</div>
    </AnimatedSection>
  </section>
  
  <section>
    <h2>Scale</h2>
    <AnimatedSection animationType="scale">
      <div class="box">Scale In</div>
    </AnimatedSection>
  </section>
  
  <section>
    <h2>Zoom</h2>
    <AnimatedSection animationType="zoom">
      <div class="box">Zoom In</div>
    </AnimatedSection>
  </section>
</div>
```

### Automated Testing

```typescript
// Test reduced motion preference
describe('AnimatedSection', () => {
  it('should respect prefers-reduced-motion', () => {
    // Mock media query
    window.matchMedia = jest.fn().mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }));
    
    // Component should be visible immediately
    const section = document.querySelector('.animated-section');
    expect(section.style.opacity).toBe('1');
  });
});
```

## Troubleshooting

### Animations Not Running

**Check:**
1. Is `animejs` installed? → `pnpm install animejs`
2. Is the element in viewport? → Adjust `threshold` or `rootMargin`
3. Is JavaScript enabled?
4. Are there console errors?

**Debug:**
```javascript
// Add to component script
console.log('Animation initialized:', {
  type: animationType,
  delay,
  duration,
  reducedMotion: prefersReducedMotion()
});
```

### Poor Performance

**Solutions:**
1. Reduce concurrent animations
2. Lower particle counts (if using effects)
3. Decrease `duration` values
4. Simplify animation types (prefer `fade` over `zoom`)
5. Test on target devices

### Layout Shift

**Solution:**
Reserve space for animated elements:

```css
.animated-section {
  min-height: 200px; /* Reserve vertical space */
  contain: layout; /* CSS containment */
}
```

## Advanced Usage

### Custom Animations

For custom animations beyond the built-in types, use anime.js directly:

```astro
<div class="custom-animation" data-custom>
  <slot />
</div>

<script>
  import anime from 'animejs';
  
  document.querySelectorAll('[data-custom]').forEach((el) => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          anime({
            targets: entry.target,
            rotate: [0, 360],
            scale: [0.5, 1],
            opacity: [0, 1],
            duration: 1500,
            easing: 'easeOutElastic(1, .5)'
          });
          observer.unobserve(entry.target);
        }
      });
    });
    
    observer.observe(el);
  });
</script>
```

### Integration with View Transitions

AnimatedSection automatically works with Astro View Transitions:

```astro
---
// src/layouts/Layout.astro
import { ViewTransitions } from 'astro:transitions';
---

<html>
  <head>
    <ViewTransitions />
  </head>
  <body>
    <slot />
  </body>
</html>
```

Animations will re-initialize on each page navigation.

## Complete Page Example

Here's how to use all components together:

```astro
---
import AnimatedHero from '@/components/animated/AnimatedHero.astro';
import AnimatedSection from '@/components/animated/AnimatedSection.astro';
import AnimatedCard from '@/components/animated/AnimatedCard.astro';
import AnimatedButton from '@/components/animated/AnimatedButton.astro';

const projects = [
  { title: 'Project 1', description: 'Description 1' },
  { title: 'Project 2', description: 'Description 2' },
  { title: 'Project 3', description: 'Description 3' },
];
---

<!-- Hero Section -->
<AnimatedHero
  title="Welcome to Berg Projects"
  subtitle="Excellence in Construction"
  backgroundImage="/hero.jpg"
  parallax={true}
>
  <p>Building quality structures since 1995</p>
  <div slot="cta">
    <AnimatedButton href="/contact" size="large">Get Started</AnimatedButton>
    <AnimatedButton href="/portfolio" variant="outline" size="large">View Work</AnimatedButton>
  </div>
</AnimatedHero>

<!-- About Section -->
<section class="about">
  <AnimatedSection animationType="fade">
    <h2>About Us</h2>
    <p>We are a leading construction company...</p>
  </AnimatedSection>
</section>

<!-- Projects Grid -->
<section class="projects">
  <AnimatedSection animationType="fade">
    <h2>Featured Projects</h2>
  </AnimatedSection>
  
  <div class="grid">
    {projects.map((project, i) => (
      <AnimatedCard 
        animationType="scale"
        hoverEffect="lift"
        delay={i * 100}
      >
        <h3>{project.title}</h3>
        <p>{project.description}</p>
        <AnimatedButton variant="outline" size="small">
          View Details
        </AnimatedButton>
      </AnimatedCard>
    ))}
  </div>
</section>

<!-- CTA Section -->
<section class="cta">
  <AnimatedSection animationType="slide" direction="up">
    <h2>Ready to Start Your Project?</h2>
    <p>Get in touch with us today</p>
    <AnimatedButton href="/contact" size="large" animation="ripple">
      Contact Us
    </AnimatedButton>
  </AnimatedSection>
</section>
```

---

## Roadmap

Upcoming components:
- [x] AnimatedCard - Card with hover effects ✅
- [x] AnimatedButton - Button with interaction animations ✅
- [x] AnimatedHero - Full hero section with parallax ✅
- [ ] ScrollReveal - Advanced scroll-based reveal
- [ ] StaggerContainer - Automated stagger for children
- [ ] AnimatedNav - Animated navigation menu
- [ ] AnimatedModal - Modal with entrance/exit animations

## Contributing

To add new animated components:

1. Create component in `src/components/animated/`
2. Follow existing patterns (accessibility, performance)
3. Add usage examples to this README
4. Test with `prefers-reduced-motion`
5. Validate performance (60 FPS target)

## Resources

- [anime.js Documentation](https://animejs.com/documentation/)
- [@repo/animations Package](../../../../packages/animations/)
- [Phase 3 Implementation Plan](../../../../docs/planning/PHASE3_IMPLEMENTATION_PLAN.md)
- [Web Animations Best Practices](https://web.dev/animations/)

---

**Last Updated:** 2024  
**Version:** 1.1.0  
**Status:** Production Ready ✅  
**Components:** 4 (AnimatedSection, AnimatedCard, AnimatedButton, AnimatedHero)