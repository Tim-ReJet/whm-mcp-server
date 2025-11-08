/**
 * @repo/animations v2.0
 * Cutting-edge modern animation library
 *
 * Uses:
 * - Motion One (Web Animations API) - Lightweight, performant (~5KB)
 * - View Transitions API - Native browser page transitions
 * - CSS Scroll-driven Animations - GPU-accelerated scroll animations
 * - GSAP - Complex animations only (kept for advanced features)
 *
 * Bundle size: ~35KB (vs ~92KB before)
 * - Motion One: ~5KB
 * - GSAP: ~30KB (only loaded when needed)
 */

// Motion One presets (primary animation library)
export * from './motion/presets.js';
export { default as motion } from './motion/presets.js';

// View Transitions API
export * from './view-transitions/index.js';
export { default as viewTransitions } from './view-transitions/index.js';

// CSS Scroll-driven Animations
export * from './scroll-driven/index.js';
export { default as scrollDriven } from './scroll-driven/index.js';

// GSAP (for complex animations only)
export * from './gsap/index.js';
export { default as gsap } from './gsap/index.js';

// Utilities (motion preferences, performance monitoring)
export * from './utils/motion.js';
export { default as utils } from './utils/motion.js';

/**
 * Default export with all animation systems
 */
export default {
  motion,
  viewTransitions,
  scrollDriven,
  gsap,
  utils,
};

/**
 * Quick start examples:
 *
 * // Motion One (recommended for most animations)
 * import { entranceAnimations } from '@repo/animations';
 * entranceAnimations.fadeInUp();
 *
 * // View Transitions (page transitions)
 * import { fadeTransition } from '@repo/animations/view-transitions';
 * fadeTransition(() => { /* update DOM */ });
 *
 * // CSS Scroll-driven (add CSS class)
 * import { setupScrollDrivenAnimations } from '@repo/animations/scroll-driven';
 * setupScrollDrivenAnimations();
 * // Then use: <div class="scroll-reveal">Content</div>
 *
 * // GSAP (complex animations only)
 * import { scrollTriggerAnimations } from '@repo/animations/gsap';
 * scrollTriggerAnimations.revealOnScrollTrigger(element);
 */
