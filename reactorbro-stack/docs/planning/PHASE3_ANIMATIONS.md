# Phase 3: Advanced Animations & Polished Sites

**ReactorBro Stack - Premium Visual Experience**  
**Duration:** 8 weeks  
**Status:** Planning  
**Dependencies:** Phase 2 Complete (Astro Generator, Site Generation CLI)

---

## 🎯 Overview

Phase 3 elevates the ReactorBro Stack from functional to **exceptional** by adding:

- 🎬 **Advanced Animation System** - Sophisticated animations with anime.js, Framer Motion, GSAP
- ✨ **Visual Effects Library** - Particles, gradients, overlays, blur effects, morphing
- 🎨 **Premium Theme System** - Fully-featured, production-ready themes
- 🔄 **Transition Engine** - Page transitions, micro-interactions, state animations
- 📱 **Interactive Components** - Hover effects, scroll animations, parallax, magnetic effects
- 🎭 **Motion Design Patterns** - Reusable animation patterns and presets

**Goal:** Generate sites that rival $50k+ custom builds in visual polish and interactivity.

---

## 📐 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Phase 3 Architecture                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │  Animation Agent │────────▶│  Motion Library  │         │
│  │   (AI-Powered)   │         │  (anime.js/FM)   │         │
│  └──────────────────┘         └──────────────────┘         │
│           │                              │                  │
│           ▼                              ▼                  │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │  Effect Library  │────────▶│  Astro Components│         │
│  │  (VFX Presets)   │         │  (with animations)│         │
│  └──────────────────┘         └──────────────────┘         │
│           │                              │                  │
│           ▼                              ▼                  │
│  ┌─────────────────────────────────────────────┐          │
│  │        Theme System (Premium Themes)         │          │
│  │  - SaaS    - Portfolio  - E-commerce         │          │
│  │  - Agency  - Blog       - Corporate          │          │
│  └─────────────────────────────────────────────┘          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗓️ Timeline: 8 Weeks

### Weeks 1-2: Animation Foundation
- Week 1: Animation Agent + Core Libraries
- Week 2: Basic Animations + Transitions

### Weeks 3-4: Visual Effects
- Week 3: Particle Systems + Overlays
- Week 4: Advanced Effects + Shaders

### Weeks 5-6: Premium Themes
- Week 5: Theme System + First 3 Themes
- Week 6: Additional 3 Themes + Variations

### Weeks 7-8: Polish & Integration
- Week 7: Performance Optimization
- Week 8: Documentation + Examples

---

## 📦 Week 1: Animation Foundation

### 1. Animation Agent Implementation

**Create Animation Agent**
```typescript
// agents/registry/design/animation-agent.ts

export interface AnimationConfig {
  type: 'entrance' | 'exit' | 'transition' | 'continuous' | 'interaction';
  trigger: 'load' | 'scroll' | 'hover' | 'click' | 'time';
  library: 'anime' | 'framer' | 'gsap' | 'css' | 'mixed';
  duration: number;
  easing: string;
  delay?: number;
  stagger?: number;
}

export interface AnimationPreset {
  id: string;
  name: string;
  description: string;
  category: 'hero' | 'cards' | 'text' | 'navigation' | 'images';
  config: AnimationConfig;
  code: string;
}

export class AnimationAgent extends AgentBase {
  constructor() {
    super({
      id: 'animation-agent',
      name: 'Animation Agent',
      description: 'Creates sophisticated animations and transitions',
      category: 'design',
      capabilities: [
        'animation_design',
        'transition_creation',
        'motion_patterns',
        'performance_optimization'
      ]
    });
  }

  async execute(task: Task, context: Context): Promise<TaskResult> {
    switch (task.type) {
      case 'design_animations':
        return this.designAnimations(task.parameters, context);
      case 'create_transitions':
        return this.createTransitions(task.parameters, context);
      case 'optimize_performance':
        return this.optimizeAnimations(task.parameters, context);
      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }
  }

  private async designAnimations(params: any, context: Context): Promise<any> {
    const { pageType, elements, style } = params;

    // Analyze page context
    const complexity = this.analyzeComplexity(elements);
    const performanceBudget = this.calculateBudget(complexity);

    // Select animation library
    const library = this.selectLibrary(style, complexity);

    // Generate animation presets
    const animations = await this.generateAnimations({
      pageType,
      elements,
      library,
      performanceBudget
    });

    return {
      library,
      animations,
      implementation: this.generateCode(animations),
      performance: this.estimatePerformance(animations)
    };
  }

  private selectLibrary(style: string, complexity: number): string {
    if (style === 'smooth' && complexity < 10) return 'css';
    if (style === 'interactive' && complexity < 20) return 'anime';
    if (style === 'react' || complexity > 20) return 'framer';
    return 'mixed';
  }

  private generateAnimations(config: any): AnimationPreset[] {
    const presets: AnimationPreset[] = [];

    // Hero animations
    presets.push({
      id: 'hero-entrance',
      name: 'Hero Entrance',
      category: 'hero',
      description: 'Smooth fade-in with slide up',
      config: {
        type: 'entrance',
        trigger: 'load',
        library: 'anime',
        duration: 1000,
        easing: 'easeOutExpo',
        stagger: 100
      },
      code: this.generateAnimeCode('hero-entrance')
    });

    // Card animations
    presets.push({
      id: 'card-hover',
      name: 'Card Lift on Hover',
      category: 'cards',
      description: 'Smooth lift with shadow',
      config: {
        type: 'interaction',
        trigger: 'hover',
        library: 'css',
        duration: 300,
        easing: 'ease-out'
      },
      code: this.generateCSSCode('card-hover')
    });

    return presets;
  }
}
```

### 2. Animation Library Integration

**Install Dependencies**
```bash
cd apps/astro
pnpm add animejs framer-motion gsap @react-spring/web
pnpm add -D @types/animejs
```

**Create Animation Utilities**
```typescript
// packages/ui/src/animations/anime-utils.ts

import anime from 'animejs';

export const animations = {
  // Entrance animations
  fadeInUp: (target: string, options = {}) => ({
    targets: target,
    translateY: [40, 0],
    opacity: [0, 1],
    duration: 800,
    easing: 'easeOutExpo',
    ...options
  }),

  fadeInScale: (target: string, options = {}) => ({
    targets: target,
    scale: [0.8, 1],
    opacity: [0, 1],
    duration: 600,
    easing: 'easeOutQuad',
    ...options
  }),

  slideInLeft: (target: string, options = {}) => ({
    targets: target,
    translateX: [-100, 0],
    opacity: [0, 1],
    duration: 700,
    easing: 'easeOutCubic',
    ...options
  }),

  // Stagger animations
  staggerCards: (target: string, options = {}) => ({
    targets: target,
    translateY: [60, 0],
    opacity: [0, 1],
    delay: anime.stagger(100),
    duration: 800,
    easing: 'easeOutExpo',
    ...options
  }),

  // Continuous animations
  floatAnimation: (target: string) => ({
    targets: target,
    translateY: [0, -10, 0],
    duration: 3000,
    easing: 'easeInOutSine',
    loop: true
  }),

  // Magnetic effect
  magneticPull: (target: HTMLElement, intensity = 0.3) => {
    target.addEventListener('mousemove', (e) => {
      const rect = target.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      anime({
        targets: target,
        translateX: x * intensity,
        translateY: y * intensity,
        duration: 300,
        easing: 'easeOutQuad'
      });
    });

    target.addEventListener('mouseleave', () => {
      anime({
        targets: target,
        translateX: 0,
        translateY: 0,
        duration: 500,
        easing: 'easeOutElastic(1, .6)'
      });
    });
  }
};
```

**Create Framer Motion Presets**
```typescript
// packages/ui/src/animations/framer-presets.ts

export const framerVariants = {
  // Page transitions
  pageTransition: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 }
  },

  // Stagger children
  staggerContainer: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  },

  staggerItem: {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  },

  // Scale on hover
  scaleHover: {
    rest: { scale: 1 },
    hover: { scale: 1.05 }
  },

  // Reveal on scroll
  scrollReveal: {
    offscreen: { y: 50, opacity: 0 },
    onscreen: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: 'easeOut' }
    }
  }
};
```

---

## 📦 Week 2: Basic Animations & Transitions

### 1. Animated Astro Components

**Create Animated Hero Component**
```astro
---
// packages/ui/src/components/AnimatedHero.astro
interface Props {
  title: string;
  subtitle: string;
  animation?: 'fade' | 'slide' | 'scale';
}

const { title, subtitle, animation = 'fade' } = Astro.props;
---

<section class="hero-section" data-animation={animation}>
  <div class="hero-content">
    <h1 class="hero-title">{title}</h1>
    <p class="hero-subtitle">{subtitle}</p>
    <div class="hero-cta">
      <slot name="cta" />
    </div>
  </div>
</section>

<script>
  import anime from 'animejs';

  document.addEventListener('DOMContentLoaded', () => {
    const hero = document.querySelector('.hero-section');
    const animation = hero?.getAttribute('data-animation');

    const animations = {
      fade: {
        targets: '.hero-content > *',
        translateY: [40, 0],
        opacity: [0, 1],
        delay: anime.stagger(100),
        duration: 800,
        easing: 'easeOutExpo'
      },
      slide: {
        targets: '.hero-content > *',
        translateX: [-100, 0],
        opacity: [0, 1],
        delay: anime.stagger(150),
        duration: 1000,
        easing: 'easeOutCubic'
      },
      scale: {
        targets: '.hero-content > *',
        scale: [0.8, 1],
        opacity: [0, 1],
        delay: anime.stagger(120),
        duration: 700,
        easing: 'easeOutQuad'
      }
    };

    if (animation && animations[animation]) {
      anime(animations[animation]);
    }
  });
</script>

<style>
  .hero-section {
    min-height: 90vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .hero-content > * {
    opacity: 0;
  }

  .hero-title {
    font-size: clamp(2.5rem, 5vw, 5rem);
    font-weight: 900;
    margin-bottom: 1.5rem;
  }
</style>
```

**Create Scroll Animation Component**
```astro
---
// packages/ui/src/components/ScrollReveal.astro
interface Props {
  threshold?: number;
  animation?: 'fade' | 'slide' | 'scale';
  stagger?: boolean;
}

const { threshold = 0.1, animation = 'fade', stagger = false } = Astro.props;
---

<div class="scroll-reveal" data-threshold={threshold} data-animation={animation} data-stagger={stagger}>
  <slot />
</div>

<script>
  import anime from 'animejs';

  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target as HTMLElement;
        const animation = element.getAttribute('data-animation');
        const stagger = element.getAttribute('data-stagger') === 'true';

        const target = stagger ? element.children : element;

        const animations = {
          fade: {
            targets: target,
            opacity: [0, 1],
            translateY: [30, 0],
            duration: 800,
            easing: 'easeOutExpo',
            delay: stagger ? anime.stagger(100) : 0
          },
          slide: {
            targets: target,
            opacity: [0, 1],
            translateX: [-50, 0],
            duration: 1000,
            easing: 'easeOutCubic',
            delay: stagger ? anime.stagger(150) : 0
          },
          scale: {
            targets: target,
            opacity: [0, 1],
            scale: [0.9, 1],
            duration: 700,
            easing: 'easeOutQuad',
            delay: stagger ? anime.stagger(100) : 0
          }
        };

        if (animation && animations[animation]) {
          anime(animations[animation]);
        }

        observer.unobserve(element);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.scroll-reveal').forEach(el => {
    observer.observe(el);
  });
</script>
```

---

## 📦 Week 3: Visual Effects

### 1. Particle System

**Create Particle Effect Component**
```typescript
// packages/ui/src/effects/particles.ts

export class ParticleSystem {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: Particle[] = [];

  constructor(canvas: HTMLCanvasElement, config: ParticleConfig) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.init(config);
  }

  private init(config: ParticleConfig) {
    this.resize();
    this.createParticles(config);
    this.animate();
  }

  private createParticles(config: ParticleConfig) {
    for (let i = 0; i < config.count; i++) {
      this.particles.push(new Particle(this.canvas, config));
    }
  }

  private animate = () => {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.particles.forEach(p => p.update(this.ctx));
    requestAnimationFrame(this.animate);
  };

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
}

class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;

  constructor(canvas: HTMLCanvasElement, config: ParticleConfig) {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * config.speed;
    this.vy = (Math.random() - 0.5) * config.speed;
    this.size = Math.random() * config.maxSize + config.minSize;
    this.color = config.color;
  }

  update(ctx: CanvasRenderingContext2D) {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0 || this.x > ctx.canvas.width) this.vx *= -1;
    if (this.y < 0 || this.y > ctx.canvas.height) this.vy *= -1;

    this.draw(ctx);
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}
```

### 2. Gradient Animations

**Create Animated Gradient Background**
```astro
---
// packages/ui/src/components/AnimatedGradient.astro
interface Props {
  colors: string[];
  speed?: number;
}

const { colors, speed = 5 } = Astro.props;
const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`;
---

<div class="animated-gradient" id={gradientId}>
  <slot />
</div>

<style define:vars={{ speed: `${speed}s` }}>
  .animated-gradient {
    background: linear-gradient(
      -45deg,
      var(--color-1, #ee7752),
      var(--color-2, #e73c7e),
      var(--color-3, #23a6d5),
      var(--color-4, #23d5ab)
    );
    background-size: 400% 400%;
    animation: gradient var(--speed) ease infinite;
  }

  @keyframes gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
</style>

<script define:vars={{ gradientId, colors }}>
  const element = document.getElementById(gradientId);
  if (element && colors) {
    colors.forEach((color, i) => {
      element.style.setProperty(`--color-${i + 1}`, color);
    });
  }
</script>
```

### 3. Overlay Effects

**Create Modal/Overlay System**
```typescript
// packages/ui/src/effects/overlay.ts

export class OverlayManager {
  private overlay: HTMLElement;

  constructor() {
    this.createOverlay();
  }

  private createOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'overlay';
    this.overlay.innerHTML = `
      <div class="overlay-backdrop"></div>
      <div class="overlay-content"></div>
    `;
    document.body.appendChild(this.overlay);
  }

  show(content: string | HTMLElement, options = {}) {
    const contentEl = this.overlay.querySelector('.overlay-content');
    
    if (typeof content === 'string') {
      contentEl!.innerHTML = content;
    } else {
      contentEl!.appendChild(content);
    }

    this.overlay.classList.add('active');
    
    anime({
      targets: '.overlay-backdrop',
      opacity: [0, 1],
      duration: 300,
      easing: 'easeOutQuad'
    });

    anime({
      targets: '.overlay-content',
      scale: [0.8, 1],
      opacity: [0, 1],
      duration: 400,
      easing: 'easeOutBack'
    });
  }

  hide() {
    anime({
      targets: '.overlay-backdrop',
      opacity: [1, 0],
      duration: 300,
      easing: 'easeInQuad'
    });

    anime({
      targets: '.overlay-content',
      scale: [1, 0.8],
      opacity: [1, 0],
      duration: 300,
      easing: 'easeInBack',
      complete: () => {
        this.overlay.classList.remove('active');
        this.overlay.querySelector('.overlay-content')!.innerHTML = '';
      }
    });
  }
}
```

---

## 📦 Weeks 5-6: Premium Themes

### Theme 1: SaaS Landing Page
**Features:**
- Hero with animated gradient background
- Floating product mockup with parallax
- Animated feature cards with hover effects
- Smooth scroll progress indicator
- Magnetic CTA buttons
- Testimonial carousel with slide transitions

### Theme 2: Portfolio/Agency
**Features:**
- Full-screen video/image hero with text overlay
- Grid gallery with masonry layout and hover zoom
- Project cards with image parallax
- Cursor-following spotlight effect
- Smooth page transitions
- Case study reveal animations

### Theme 3: E-commerce
**Features:**
- Product image carousel with smooth transitions
- Add-to-cart animation with particle burst
- Category navigation with slide animations
- Product quick-view overlay
- Checkout progress indicator with smooth steps
- Review stars animation

### Theme 4: Blog/Magazine
**Features:**
- Hero post with Ken Burns effect
- Article cards with image slide-up on hover
- Infinite scroll with smooth loading
- Reading progress bar
- Share button with ripple effect
- Related posts slide-in

### Theme 5: Corporate/Business
**Features:**
- Hero with typed text animation
- Stats counter with number roll-up
- Team grid with image fade transitions
- Timeline with scroll-triggered reveals
- Office locations map with markers
- Client logo carousel

### Theme 6: Creative/Studio
**Features:**
- Split-screen hero with hover interaction
- Work grid with 3D tilt effect
- Video showcase with smooth play transitions
- Horizontal scroll sections
- Creative cursor effects
- Dynamic background color changes

---

## 🛠️ Implementation Guidelines

### Performance Budget
```typescript
export const performanceBudgets = {
  animations: {
    maxDuration: 1000,        // 1 second max
    maxStagger: 200,          // 200ms max stagger
    maxConcurrent: 10         // 10 animations max at once
  },
  effects: {
    maxParticles: 100,        // 100 particles max
    targetFPS: 60,            // 60fps target
    maxCanvases: 2            // 2 canvas elements max
  },
  bundle: {
    maxJSSize: '50kb',        // 50kb max JS for animations
    maxCSSSize: '20kb'        // 20kb max CSS for animations
  }
};
```

### Accessibility
```typescript
export const accessibilityRules = {
  // Respect prefers-reduced-motion
  respectMotionPreference: true,
  
  // Provide skip animation option
  skipAnimationButton: true,
  
  // Ensure focus is never lost
  maintainFocusStates: true,
  
  // No seizure-inducing flashes
  maxFlashRate: 3 // per second
};
```

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## 📊 Success Metrics

- **Animation Library Size:** < 50kb gzipped
- **Performance:** 60fps on mid-range devices
- **Time to Interactive:** < 3s
- **Accessibility Score:** 100/100
- **Theme Generation Time:** < 30s per theme
- **Developer Satisfaction:** 9+/10

---

## 🎓 Documentation Deliverables

1. **Animation Guide** - Complete guide to all animations
2. **Effect Showcase** - Interactive demo of all effects
3. **Theme Documentation** - Docs for each premium theme
4. **Performance Guide** - Optimization best practices
5. **API Reference** - Complete API for all animation utilities

---

## 🚀 Usage Examples

### Generate Site with Animations
```bash
# Generate site with animation preset
pnpm generate:site berg-projects --theme saas --animations premium

# Generate with specific animation style
pnpm generate:site portfolio --animations smooth --effects particles

# Generate with custom animation config
pnpm generate:site agency --animation-config ./custom-animations.json
```

### Customize Animations
```typescript
// apps/astro/src/animations/custom.ts
import { animations } from '@repo/ui/animations';

export const customHero = animations.fadeInUp('.hero', {
  duration: 1200,
  delay: 200,
  easing: 'easeOutExpo'
});
```

---

## ✅ Phase 3 Checklist

### Week 1-2: Foundation
- [ ] Create Animation Agent
- [ ] Integrate anime.js
- [ ] Integrate Framer Motion
- [ ] Create animation presets library
- [ ] Build basic animated components

### Week 3-4: Effects
- [ ] Particle system
- [ ] Gradient animations
- [ ] Overlay/modal system
- [ ] Blur/glass effects
- [ ] Cursor effects

### Week 5-6: Themes
- [ ] SaaS theme
- [ ] Portfolio theme
- [ ] E-commerce theme
- [ ] Blog theme
- [ ] Corporate theme
- [ ] Creative theme

### Week 7-8: Polish
- [ ] Performance optimization
- [ ] Accessibility testing
- [ ] Browser testing
- [ ] Documentation
- [ ] Examples gallery

---

**Status:** Ready for Implementation  
**Next Steps:** Begin Week 1 tasks after Phase 2 completion