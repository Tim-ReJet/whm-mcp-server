/**
 * Framer Motion Animation Presets
 * Production-ready variants and presets for Framer Motion
 */

import type { Variants, Transition, MotionProps } from 'framer-motion';

/**
 * Page Transition Variants
 */
export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: 'easeIn',
    },
  },
};

/**
 * Fade Variants
 */
export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.4,
    },
  },
};

/**
 * Slide Variants
 */
export const slideVariants = {
  up: {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1], // Custom easing
      },
    },
  },
  down: {
    hidden: { opacity: 0, y: -50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  },
  left: {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  },
  right: {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  },
};

/**
 * Scale Variants
 */
export const scaleVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.34, 1.56, 0.64, 1], // Back easing
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: 0.3,
    },
  },
};

/**
 * Stagger Container Variants
 */
export const staggerContainer: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

/**
 * Stagger Item Variants
 */
export const staggerItem: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

/**
 * Grid Stagger Container
 */
export const gridStaggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
};

/**
 * Grid Stagger Item
 */
export const gridStaggerItem: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
};

/**
 * Scroll Reveal Variants
 */
export const scrollRevealVariants: Variants = {
  offscreen: {
    opacity: 0,
    y: 50,
  },
  onscreen: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      bounce: 0.3,
      duration: 0.8,
    },
  },
};

/**
 * Advanced Scroll Reveal with Viewport
 */
export const scrollRevealWithViewport = {
  variants: {
    offscreen: {
      opacity: 0,
      y: 50,
    },
    onscreen: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        bounce: 0.3,
        duration: 0.8,
      },
    },
  },
  viewport: {
    once: true,
    margin: '-100px',
  },
};

/**
 * Hover Variants
 */
export const hoverVariants = {
  scale: {
    rest: { scale: 1 },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    },
    tap: { scale: 0.95 },
  },
  lift: {
    rest: { y: 0 },
    hover: {
      y: -8,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    },
  },
  glow: {
    rest: { boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' },
    hover: {
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
      transition: {
        duration: 0.3,
      },
    },
  },
};

/**
 * Button Hover Animation
 */
export const buttonHover: MotionProps = {
  whileHover: {
    scale: 1.05,
    transition: { duration: 0.2 },
  },
  whileTap: {
    scale: 0.95,
  },
};

/**
 * Card Hover Animation
 */
export const cardHover: MotionProps = {
  whileHover: {
    y: -8,
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
};

/**
 * Modal Variants
 */
export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: 0.2,
    },
  },
};

/**
 * Backdrop Variants
 */
export const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
      delay: 0.1,
    },
  },
};

/**
 * Drawer Variants
 */
export const drawerVariants = {
  left: {
    hidden: { x: '-100%' },
    visible: {
      x: 0,
      transition: {
        type: 'spring',
        damping: 30,
        stiffness: 300,
      },
    },
    exit: {
      x: '-100%',
      transition: {
        duration: 0.2,
      },
    },
  },
  right: {
    hidden: { x: '100%' },
    visible: {
      x: 0,
      transition: {
        type: 'spring',
        damping: 30,
        stiffness: 300,
      },
    },
    exit: {
      x: '100%',
      transition: {
        duration: 0.2,
      },
    },
  },
  top: {
    hidden: { y: '-100%' },
    visible: {
      y: 0,
      transition: {
        type: 'spring',
        damping: 30,
        stiffness: 300,
      },
    },
    exit: {
      y: '-100%',
      transition: {
        duration: 0.2,
      },
    },
  },
  bottom: {
    hidden: { y: '100%' },
    visible: {
      y: 0,
      transition: {
        type: 'spring',
        damping: 30,
        stiffness: 300,
      },
    },
    exit: {
      y: '100%',
      transition: {
        duration: 0.2,
      },
    },
  },
};

/**
 * Menu Variants
 */
export const menuVariants: Variants = {
  closed: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
    },
  },
  open: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
};

/**
 * Menu Item Variants (for stagger)
 */
export const menuItemVariants: Variants = {
  closed: {
    opacity: 0,
    x: -20,
  },
  open: {
    opacity: 1,
    x: 0,
  },
};

/**
 * Accordion Variants
 */
export const accordionVariants: Variants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: 'easeInOut',
    },
  },
  expanded: {
    height: 'auto',
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'easeInOut',
    },
  },
};

/**
 * Tab Variants
 */
export const tabVariants: Variants = {
  inactive: {
    opacity: 0.6,
    scale: 0.95,
  },
  active: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
    },
  },
};

/**
 * Loading Spinner Variants
 */
export const spinnerVariants: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

/**
 * Pulse Variants
 */
export const pulseVariants: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

/**
 * Notification Variants
 */
export const notificationVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -50,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 300,
    },
  },
  exit: {
    opacity: 0,
    x: 100,
    transition: {
      duration: 0.2,
    },
  },
};

/**
 * Skeleton Loading Variants
 */
export const skeletonVariants: Variants = {
  animate: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

/**
 * Shimmer Effect
 */
export const shimmerVariants: Variants = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

/**
 * Spring Configurations
 */
export const springConfigs = {
  gentle: {
    type: 'spring' as const,
    stiffness: 100,
    damping: 15,
  },
  bouncy: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 20,
  },
  snappy: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 30,
  },
  slow: {
    type: 'spring' as const,
    stiffness: 50,
    damping: 20,
  },
};

/**
 * Easing Functions
 */
export const easings = {
  // Custom cubic-bezier curves
  smooth: [0.22, 1, 0.36, 1],
  emphasized: [0.4, 0, 0.2, 1],
  decelerate: [0, 0, 0.2, 1],
  accelerate: [0.4, 0, 1, 1],
  sharp: [0.4, 0, 0.6, 1],
};

/**
 * Common Transition Presets
 */
export const transitionPresets: Record<string, Transition> = {
  fast: {
    duration: 0.2,
    ease: easings.sharp,
  },
  medium: {
    duration: 0.4,
    ease: easings.smooth,
  },
  slow: {
    duration: 0.6,
    ease: easings.smooth,
  },
  spring: springConfigs.gentle,
  bouncy: springConfigs.bouncy,
};

/**
 * Utility function to create custom variants
 */
export function createVariants(config: {
  hidden: Record<string, any>;
  visible: Record<string, any>;
  exit?: Record<string, any>;
  transition?: Transition;
}): Variants {
  const { hidden, visible, exit, transition } = config;

  return {
    hidden,
    visible: {
      ...visible,
      transition: transition || transitionPresets.medium,
    },
    ...(exit && {
      exit: {
        ...exit,
        transition: transition || transitionPresets.fast,
      },
    }),
  };
}

/**
 * Export all presets
 */
export default {
  page: pageTransition,
  fade: fadeVariants,
  slide: slideVariants,
  scale: scaleVariants,
  stagger: {
    container: staggerContainer,
    item: staggerItem,
    grid: {
      container: gridStaggerContainer,
      item: gridStaggerItem,
    },
  },
  scroll: {
    reveal: scrollRevealVariants,
    withViewport: scrollRevealWithViewport,
  },
  hover: hoverVariants,
  button: buttonHover,
  card: cardHover,
  modal: modalVariants,
  backdrop: backdropVariants,
  drawer: drawerVariants,
  menu: {
    container: menuVariants,
    item: menuItemVariants,
  },
  accordion: accordionVariants,
  tab: tabVariants,
  spinner: spinnerVariants,
  pulse: pulseVariants,
  notification: notificationVariants,
  skeleton: skeletonVariants,
  shimmer: shimmerVariants,
  springs: springConfigs,
  easings,
  transitions: transitionPresets,
  createVariants,
};
