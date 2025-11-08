/**
 * GSAP Animation Presets
 * Keep GSAP only for complex animations that require advanced features
 *
 * GSAP is kept for:
 * - Complex timeline sequences
 * - Advanced easing functions
 * - ScrollTrigger animations
 * - SVG animations
 * - Physics-based animations
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export interface GSAPPresetConfig {
  targets?: string | Element | Element[] | NodeListOf<Element>;
  duration?: number;
  delay?: number;
  ease?: string;
}

/**
 * Complex timeline animations
 */
export const complexAnimations = {
  /**
   * Staggered reveal with complex easing
   */
  staggeredReveal: (targets: Element[], config: GSAPPresetConfig = {}) => {
    return gsap.from(targets, {
      opacity: 0,
      y: 50,
      duration: config.duration || 0.8,
      stagger: 0.1,
      ease: config.ease || 'power3.out',
      ...config,
    });
  },

  /**
   * Morphing animation
   */
  morph: (element: Element, to: Record<string, any>, config: GSAPPresetConfig = {}) => {
    return gsap.to(element, {
      ...to,
      duration: config.duration || 1,
      ease: config.ease || 'power2.inOut',
      ...config,
    });
  },
};

/**
 * ScrollTrigger animations (GSAP-specific)
 */
export const scrollTriggerAnimations = {
  /**
   * Pin element on scroll
   */
  pinOnScroll: (element: Element, config: { start?: string; end?: string } = {}) => {
    return gsap.to(element, {
      scrollTrigger: {
        trigger: element,
        start: config.start || 'top top',
        end: config.end || 'bottom top',
        pin: true,
        pinSpacing: true,
      },
    });
  },

  /**
   * Parallax with ScrollTrigger
   */
  parallaxScrollTrigger: (
    element: Element,
    speed: number = 0.5,
    config: GSAPPresetConfig = {}
  ) => {
    return gsap.to(element, {
      y: speed * 100,
      ease: 'none',
      scrollTrigger: {
        trigger: element,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
      ...config,
    });
  },

  /**
   * Reveal on scroll with ScrollTrigger
   */
  revealOnScrollTrigger: (element: Element, config: GSAPPresetConfig = {}) => {
    return gsap.from(element, {
      opacity: 0,
      y: 50,
      duration: config.duration || 1,
      ease: config.ease || 'power3.out',
      scrollTrigger: {
        trigger: element,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
      ...config,
    });
  },
};

/**
 * SVG animations (GSAP excels at this)
 */
export const svgAnimations = {
  /**
   * Draw SVG path
   */
  drawPath: (path: SVGPathElement, config: GSAPPresetConfig = {}) => {
    const length = path.getTotalLength();
    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = `${length}`;

    return gsap.to(path, {
      strokeDashoffset: 0,
      duration: config.duration || 2,
      ease: config.ease || 'power2.inOut',
      ...config,
    });
  },

  /**
   * Morph SVG path
   */
  morphPath: (
    from: SVGPathElement,
    to: SVGPathElement,
    config: GSAPPresetConfig = {}
  ) => {
    return gsap.to(from, {
      morphSVG: to,
      duration: config.duration || 1,
      ease: config.ease || 'power2.inOut',
      ...config,
    });
  },
};

/**
 * Physics-based animations
 */
export const physicsAnimations = {
  /**
   * Elastic bounce
   */
  elasticBounce: (element: Element, config: GSAPPresetConfig = {}) => {
    return gsap.to(element, {
      scale: 1.2,
      duration: config.duration || 0.6,
      ease: 'elastic.out(1, 0.5)',
      yoyo: true,
      repeat: 1,
      ...config,
    });
  },

  /**
   * Spring animation
   */
  spring: (element: Element, to: Record<string, any>, config: GSAPPresetConfig = {}) => {
    return gsap.to(element, {
      ...to,
      duration: config.duration || 1,
      ease: 'back.out(1.7)',
      ...config,
    });
  },
};

/**
 * Export GSAP instance for advanced usage
 */
export { gsap, ScrollTrigger };

/**
 * Export all GSAP presets
 */
export default {
  complex: complexAnimations,
  scrollTrigger: scrollTriggerAnimations,
  svg: svgAnimations,
  physics: physicsAnimations,
  gsap,
  ScrollTrigger,
};

