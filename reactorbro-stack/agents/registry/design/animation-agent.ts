/**
 * Animation Agent
 * Designs and generates sophisticated animations using anime.js, Framer Motion, and GSAP
 */

import { AgentBase } from "../../core/agent-base.js";
import type { Task, TaskResult, Context } from "../../core/types.js";

/**
 * Animation Configuration
 */
export interface AnimationConfig {
  pageType: string;
  elements: string[];
  style: "minimal" | "moderate" | "bold" | "premium";
  complexity: "simple" | "medium" | "complex";
  performanceBudget: {
    maxDuration: number;
    maxStagger: number;
    targetFPS: number;
  };
  accessibility: {
    respectMotionPreference: boolean;
    reducedMotionFallback: boolean;
  };
}

/**
 * Animation Preset
 */
export interface AnimationPreset {
  id: string;
  name: string;
  category:
    | "entrance"
    | "exit"
    | "scroll"
    | "hover"
    | "interaction"
    | "transition";
  description: string;
  library: "anime" | "framer" | "gsap";
  config: {
    type: string;
    trigger: string;
    duration: number;
    easing: string;
    stagger?: number;
    delay?: number;
    loop?: boolean;
  };
  code: string;
  performance: {
    fps: number;
    cpu: "low" | "medium" | "high";
  };
}

/**
 * Animation Result
 */
export interface AnimationResult {
  presets: AnimationPreset[];
  implementation: {
    components: Array<{
      name: string;
      path: string;
      code: string;
    }>;
    utilities: Array<{
      name: string;
      code: string;
    }>;
  };
  styles: string;
  performance: {
    estimatedFPS: number;
    bundleSize: number;
    recommendations: string[];
  };
}

/**
 * Animation Agent
 * Generates production-ready animations with performance optimization
 */
export class AnimationAgent extends AgentBase {
  constructor() {
    super({
      id: "animation-agent",
      name: "Animation Agent",
      description:
        "Designs and generates sophisticated animations with anime.js, Framer Motion, and GSAP",
      version: "1.0.0",
      category: "design",
      capabilities: [
        "animation-design",
        "motion-patterns",
        "visual-effects",
        "performance-optimization",
        "accessibility-compliance",
      ],
      skills: [
        "design-animations",
        "generate-presets",
        "optimize-performance",
        "ensure-accessibility",
      ],
      subAgents: [],
      config: {
        maxRetries: 3,
        timeout: 30000,
        tokenLimit: 4000,
        parallel: false,
        priority: 5,
      },
      status: "idle",
    });
  }

  /**
   * Execute animation generation task
   */
  async execute(task: Task, context: Context): Promise<TaskResult> {
    try {
      const { action, config } = task.parameters;

      let result: AnimationResult;

      if (action === "design") {
        result = await this.designAnimations(config);
      } else {
        throw new Error(`Unknown action: ${action}`);
      }

      return {
        success: true,
        data: result,
        metadata: {
          tokensUsed: 100, // Estimate
          duration: Date.now() - task.createdAt.getTime(),
          agent: this.id,
          timestamp: new Date(),
        },
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        metadata: {
          tokensUsed: 0,
          duration: Date.now() - task.createdAt.getTime(),
          agent: this.id,
          timestamp: new Date(),
        },
      };
    }
  }

  /**
   * Design animations based on configuration
   */
  private async designAnimations(
    config: AnimationConfig,
  ): Promise<AnimationResult> {
    const { pageType, elements, style, complexity, performanceBudget } = config;

    // Select optimal library based on use case
    const primaryLibrary = this.selectLibrary(pageType, complexity);

    // Generate animation presets
    const presets = this.generateAnimationPresets(
      elements,
      style,
      complexity,
      primaryLibrary,
    );

    // Generate implementation code
    const implementation = this.generateImplementation(presets, config);

    // Generate utility styles
    const styles = this.generateStyles(presets);

    // Calculate performance metrics
    const performance = this.calculatePerformance(presets, performanceBudget);

    return {
      presets,
      implementation,
      styles,
      performance,
    };
  }

  /**
   * Select optimal animation library
   */
  private selectLibrary(
    pageType: string,
    complexity: string,
  ): "anime" | "framer" | "gsap" {
    // Framer Motion: Best for React-like components with complex state
    if (pageType.includes("interactive") || pageType.includes("app")) {
      return "framer";
    }

    // GSAP: Best for complex timelines and SVG animations
    if (complexity === "complex" || pageType.includes("creative")) {
      return "gsap";
    }

    // anime.js: Best for lightweight, simple animations
    return "anime";
  }

  /**
   * Generate animation presets based on requirements
   */
  private generateAnimationPresets(
    elements: string[],
    style: string,
    complexity: string,
    library: "anime" | "framer" | "gsap",
  ): AnimationPreset[] {
    const presets: AnimationPreset[] = [];

    // Hero entrance animation
    if (elements.includes("hero")) {
      presets.push({
        id: "hero-entrance",
        name: "Hero Entrance",
        category: "entrance",
        description: "Fade in and slide up animation for hero section",
        library: library === "anime" ? "anime" : library,
        config: {
          type: "fadeInUp",
          trigger: "load",
          duration: style === "bold" ? 1200 : 800,
          easing: "easeOutExpo",
          stagger: 100,
        },
        code:
          library === "anime"
            ? this.generateAnimeCode("hero", "fadeInUp", style)
            : library === "framer"
              ? this.generateFramerCode("hero", "fadeInUp", style)
              : this.generateGSAPCode("hero", "fadeInUp", style),
        performance: {
          fps: 60,
          cpu: "low",
        },
      });
    }

    // Card stagger animation
    if (elements.includes("cards") || elements.includes("grid")) {
      presets.push({
        id: "card-stagger",
        name: "Card Stagger",
        category: "scroll",
        description: "Staggered reveal animation for card grids",
        library: "anime",
        config: {
          type: "stagger",
          trigger: "scroll",
          duration: 600,
          easing: "easeOutCubic",
          stagger: 80,
        },
        code: this.generateAnimeCode("cards", "stagger", style),
        performance: {
          fps: 60,
          cpu: "low",
        },
      });
    }

    // Button hover animation
    if (elements.includes("button") || elements.includes("cta")) {
      presets.push({
        id: "button-hover",
        name: "Button Hover",
        category: "hover",
        description: "Smooth scale and shadow effect on hover",
        library: "framer",
        config: {
          type: "scaleHover",
          trigger: "hover",
          duration: 200,
          easing: "easeInOut",
        },
        code: this.generateFramerCode("button", "hover", style),
        performance: {
          fps: 60,
          cpu: "low",
        },
      });
    }

    // Scroll reveal animation
    if (elements.includes("section")) {
      presets.push({
        id: "scroll-reveal",
        name: "Scroll Reveal",
        category: "scroll",
        description: "Progressive reveal on scroll",
        library: "framer",
        config: {
          type: "scrollReveal",
          trigger: "scroll",
          duration: 800,
          easing: "easeOut",
        },
        code: this.generateFramerCode("section", "scrollReveal", style),
        performance: {
          fps: 60,
          cpu: "medium",
        },
      });
    }

    // Page transition
    presets.push({
      id: "page-transition",
      name: "Page Transition",
      category: "transition",
      description: "Smooth page transitions",
      library: "framer",
      config: {
        type: "pageTransition",
        trigger: "navigation",
        duration: 400,
        easing: "easeInOut",
      },
      code: this.generateFramerCode("page", "transition", style),
      performance: {
        fps: 60,
        cpu: "low",
      },
    });

    return presets;
  }

  /**
   * Generate anime.js code
   */
  private generateAnimeCode(
    element: string,
    animationType: string,
    style: string,
  ): string {
    const duration = style === "bold" ? 1200 : style === "moderate" ? 800 : 600;

    if (animationType === "fadeInUp") {
      return `import anime from 'animejs';

export function animateHero() {
  anime({
    targets: '.hero-content',
    translateY: [50, 0],
    opacity: [0, 1],
    duration: ${duration},
    easing: 'easeOutExpo',
    delay: anime.stagger(100)
  });
}`;
    }

    if (animationType === "stagger") {
      return `import anime from 'animejs';

export function animateCards() {
  anime({
    targets: '.card',
    translateY: [30, 0],
    opacity: [0, 1],
    duration: 600,
    easing: 'easeOutCubic',
    delay: anime.stagger(80, {start: 200})
  });
}`;
    }

    return `// ${animationType} animation code`;
  }

  /**
   * Generate Framer Motion code
   */
  private generateFramerCode(
    element: string,
    animationType: string,
    style: string,
  ): string {
    if (animationType === "hover") {
      return `import { motion } from 'framer-motion';

export const AnimatedButton = ({ children, ...props }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    transition={{ duration: 0.2 }}
    {...props}
  >
    {children}
  </motion.button>
);`;
    }

    if (animationType === "scrollReveal") {
      return `import { motion } from 'framer-motion';

export const ScrollReveal = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.8, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);`;
    }

    if (animationType === "transition") {
      return `import { motion } from 'framer-motion';

export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.4 }
};`;
    }

    return `// ${animationType} Framer Motion code`;
  }

  /**
   * Generate GSAP code
   */
  private generateGSAPCode(
    element: string,
    animationType: string,
    style: string,
  ): string {
    if (animationType === "fadeInUp") {
      return `import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function animateHero() {
  gsap.from('.hero-content', {
    y: 50,
    opacity: 0,
    duration: 1.2,
    ease: 'expo.out',
    stagger: 0.1
  });
}`;
    }

    return `// ${animationType} GSAP code`;
  }

  /**
   * Generate implementation components and utilities
   */
  private generateImplementation(
    presets: AnimationPreset[],
    config: AnimationConfig,
  ) {
    const components = [];
    const utilities = [];

    // Generate motion detection utility
    utilities.push({
      name: "motionPreference",
      code: `/**
 * Detect user's motion preference
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get safe animation duration based on user preference
 */
export function getSafeDuration(duration: number): number {
  return prefersReducedMotion() ? 0 : duration;
}`,
    });

    // Generate animation hook utility
    utilities.push({
      name: "useAnimation",
      code: `import { useEffect, useState } from 'react';
import { prefersReducedMotion } from './motionPreference';

export function useAnimation(enabled = true) {
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    setShouldAnimate(enabled && !prefersReducedMotion());
  }, [enabled]);

  return shouldAnimate;
}`,
    });

    // Generate Astro component wrapper
    components.push({
      name: "AnimatedSection",
      path: "components/AnimatedSection.astro",
      code: `---
interface Props {
  animationType?: 'fade' | 'slide' | 'scale';
  delay?: number;
  class?: string;
}

const { animationType = 'fade', delay = 0, class: className = '' } = Astro.props;
---

<div
  class={\`animated-section \${className}\`}
  data-animation={animationType}
  data-delay={delay}
>
  <slot />
</div>

<script>
  import anime from 'animejs';

  function initAnimations() {
    const sections = document.querySelectorAll('.animated-section');

    sections.forEach((section, index) => {
      const element = section as HTMLElement;
      const animationType = element.dataset.animation || 'fade';
      const delay = parseInt(element.dataset.delay || '0');

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        element.style.opacity = '1';
        element.style.transform = 'none';
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateElement(element, animationType, delay);
              observer.unobserve(element);
            }
          });
        },
        { threshold: 0.1, rootMargin: '-50px' }
      );

      observer.observe(element);
    });
  }

  function animateElement(element: HTMLElement, type: string, delay: number) {
    const animations: Record<string, any> = {
      fade: {
        opacity: [0, 1],
        duration: 800,
        easing: 'easeOutCubic',
      },
      slide: {
        translateY: [50, 0],
        opacity: [0, 1],
        duration: 800,
        easing: 'easeOutExpo',
      },
      scale: {
        scale: [0.8, 1],
        opacity: [0, 1],
        duration: 600,
        easing: 'easeOutBack',
      },
    };

    anime({
      targets: element,
      delay,
      ...animations[type] || animations.fade,
    });
  }

  // Initialize on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnimations);
  } else {
    initAnimations();
  }

  // Re-initialize on view transitions
  document.addEventListener('astro:page-load', initAnimations);
</script>

<style>
  .animated-section {
    opacity: 0;
  }
</style>`,
    });

    return { components, utilities };
  }

  /**
   * Generate utility styles
   */
  private generateStyles(presets: AnimationPreset[]): string {
    return `/* Animation Utilities */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Base animation classes */
.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

.animate-slide-up {
  animation: slideUp 0.8s ease-out;
}

.animate-scale-in {
  animation: scaleIn 0.6s ease-out;
}

/* Keyframes */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Hover effects */
.hover-lift {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.hover-scale {
  transition: transform 0.2s ease;
}

.hover-scale:hover {
  transform: scale(1.05);
}`;
  }

  /**
   * Calculate performance metrics
   */
  private calculatePerformance(
    presets: AnimationPreset[],
    budget: AnimationConfig["performanceBudget"],
  ) {
    const totalAnimations = presets.length;
    const complexAnimations = presets.filter(
      (p) => p.performance.cpu === "high",
    ).length;

    const estimatedFPS = complexAnimations > 3 ? 45 : 60;
    const bundleSize = presets.length * 2; // Rough estimate in KB

    const recommendations: string[] = [];

    if (estimatedFPS < budget.targetFPS) {
      recommendations.push(
        "Consider reducing the number of concurrent animations",
      );
    }

    if (bundleSize > 50) {
      recommendations.push("Consider code splitting for animation libraries");
    }

    recommendations.push("Use will-change CSS property for animated elements");
    recommendations.push("Prefer transform and opacity for best performance");

    return {
      estimatedFPS,
      bundleSize,
      recommendations,
    };
  }
}
