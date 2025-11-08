/**
 * Motion One Animation Presets
 * Modern, lightweight animations using Motion One (Web Animations API)
 *
 * Motion One is the successor to anime.js, using native Web Animations API
 * for better performance and smaller bundle size (~5KB vs ~17KB)
 */

import { animate, stagger, spring, timeline } from '@motionone/dom';
import type { AnimationOptionsWithOverrides, AnimationOptions } from '@motionone/dom';

export interface MotionPresetConfig extends Partial<AnimationOptionsWithOverrides> {
  targets?: string | Element | Element[] | NodeListOf<Element>;
  duration?: number;
  delay?: number;
  easing?: string | number[];
}

/**
 * Entrance Animations
 */
export const entranceAnimations = {
  /**
   * Fade in and slide up
   */
  fadeInUp: (config: MotionPresetConfig = {}) => {
    const targets = config.targets || document.querySelectorAll('.animate-fade-in-up');
    return animate(
      targets,
      {
        opacity: [0, 1],
        transform: ['translateY(50px)', 'translateY(0)']
      },
      {
        duration: config.duration || 0.8,
        delay: config.delay || 0,
        easing: config.easing || spring({ stiffness: 300, damping: 30 }),
        ...config,
      }
    );
  },

  /**
   * Fade in and slide down
   */
  fadeInDown: (config: MotionPresetConfig = {}) => {
    const targets = config.targets || document.querySelectorAll('.animate-fade-in-down');
    return animate(
      targets,
      {
        opacity: [0, 1],
        transform: ['translateY(-50px)', 'translateY(0)']
      },
      {
        duration: config.duration || 0.8,
        delay: config.delay || 0,
        easing: config.easing || spring({ stiffness: 300, damping: 30 }),
        ...config,
      }
    );
  },

  /**
   * Fade in and slide from left
   */
  fadeInLeft: (config: MotionPresetConfig = {}) => {
    const targets = config.targets || document.querySelectorAll('.animate-fade-in-left');
    return animate(
      targets,
      {
        opacity: [0, 1],
        transform: ['translateX(-50px)', 'translateX(0)']
      },
      {
        duration: config.duration || 0.8,
        delay: config.delay || 0,
        easing: config.easing || spring({ stiffness: 300, damping: 30 }),
        ...config,
      }
    );
  },

  /**
   * Fade in and slide from right
   */
  fadeInRight: (config: MotionPresetConfig = {}) => {
    const targets = config.targets || document.querySelectorAll('.animate-fade-in-right');
    return animate(
      targets,
      {
        opacity: [0, 1],
        transform: ['translateX(50px)', 'translateX(0)']
      },
      {
        duration: config.duration || 0.8,
        delay: config.delay || 0,
        easing: config.easing || spring({ stiffness: 300, damping: 30 }),
        ...config,
      }
    );
  },

  /**
   * Fade in with scale
   */
  fadeInScale: (config: MotionPresetConfig = {}) => {
    const targets = config.targets || document.querySelectorAll('.animate-fade-in-scale');
    return animate(
      targets,
      {
        opacity: [0, 1],
        transform: ['scale(0.8)', 'scale(1)']
      },
      {
        duration: config.duration || 0.6,
        delay: config.delay || 0,
        easing: config.easing || spring({ stiffness: 400, damping: 25 }),
        ...config,
      }
    );
  },

  /**
   * Zoom in
   */
  zoomIn: (config: MotionPresetConfig = {}) => {
    const targets = config.targets || document.querySelectorAll('.animate-zoom-in');
    return animate(
      targets,
      {
        opacity: [0, 1],
        transform: ['scale(0)', 'scale(1)']
      },
      {
        duration: config.duration || 0.6,
        delay: config.delay || 0,
        easing: config.easing || spring({ stiffness: 300, damping: 30 }),
        ...config,
      }
    );
  },
};

/**
 * Stagger Animations
 */
export const staggerAnimations = {
  /**
   * Stagger cards with fade and slide
   */
  staggerCards: (config: MotionPresetConfig = {}) => {
    const targets = config.targets || document.querySelectorAll('.card');
    return animate(
      targets,
      {
        opacity: [0, 1],
        transform: ['translateY(30px)', 'translateY(0)']
      },
      {
        duration: config.duration || 0.6,
        delay: stagger(0.08, { start: 0.2 }),
        easing: spring({ stiffness: 300, damping: 30 }),
        ...config,
      }
    );
  },

  /**
   * Stagger list items
   */
  staggerList: (config: MotionPresetConfig = {}) => {
    const targets = config.targets || document.querySelectorAll('li');
    return animate(
      targets,
      {
        opacity: [0, 1],
        transform: ['translateX(-30px)', 'translateX(0)']
      },
      {
        duration: config.duration || 0.5,
        delay: stagger(0.06),
        easing: spring({ stiffness: 300, damping: 30 }),
        ...config,
      }
    );
  },

  /**
   * Stagger from center (grid)
   */
  staggerFromCenter: (config: MotionPresetConfig = {}) => {
    const targets = config.targets || document.querySelectorAll('.grid-item');
    return animate(
      targets,
      {
        opacity: [0, 1],
        transform: ['scale(0)', 'scale(1)']
      },
      {
        duration: config.duration || 0.5,
        delay: stagger(0.05, { from: 'center' }),
        easing: spring({ stiffness: 300, damping: 30 }),
        ...config,
      }
    );
  },

  /**
   * Wave effect
   */
  wave: (config: MotionPresetConfig = {}) => {
    const targets = config.targets || document.querySelectorAll('.wave-item');
    return animate(
      targets,
      {
        transform: ['translateY(0)', 'translateY(-20px)', 'translateY(0)']
      },
      {
        duration: config.duration || 0.8,
        delay: stagger(0.1),
        easing: 'ease-in-out',
        repeat: Infinity,
        ...config,
      }
    );
  },
};

/**
 * Scroll Animations (using Intersection Observer + Motion One)
 */
export const scrollAnimations = {
  /**
   * Parallax scroll effect (using CSS transforms for performance)
   */
  parallax: (element: Element, speed: number = 0.5) => {
    let ticking = false;
    let lastScrollY = window.scrollY;

    const updateParallax = () => {
      const scrolled = window.scrollY;
      const delta = scrolled - lastScrollY;
      lastScrollY = scrolled;

      const elementTop = element.getBoundingClientRect().top + scrolled;
      const elementVisible = elementTop - window.innerHeight;

      if (scrolled > elementVisible) {
        const yPos = -(scrolled - elementTop) * speed;
        (element as HTMLElement).style.transform = `translateY(${yPos}px)`;
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  },

  /**
   * Reveal on scroll using Intersection Observer + Motion One
   */
  revealOnScroll: (config: MotionPresetConfig = {}) => {
    const targets = document.querySelectorAll(
      (config.targets as string) || '.scroll-reveal'
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate(
              entry.target,
              {
                opacity: [0, 1],
                transform: ['translateY(50px)', 'translateY(0)']
              },
              {
                duration: config.duration || 0.8,
                easing: spring({ stiffness: 300, damping: 30 }),
                ...config,
              }
            );
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '-50px' }
    );

    targets.forEach((target) => observer.observe(target));
    return observer;
  },
};

/**
 * Interaction Animations
 */
export const interactionAnimations = {
  /**
   * Magnetic button effect
   */
  magneticButton: (button: HTMLElement, strength: number = 0.5) => {
    const handleMouseMove = (e: MouseEvent) => {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      animate(
        button,
        {
          transform: `translate(${x * strength}px, ${y * strength}px)`
        },
        {
          duration: 0.3,
          easing: spring({ stiffness: 300, damping: 30 }),
        }
      );
    };

    const handleMouseLeave = () => {
      animate(
        button,
        {
          transform: 'translate(0, 0)'
        },
        {
          duration: 0.4,
          easing: spring({ stiffness: 200, damping: 20 }),
        }
      );
    };

    button.addEventListener('mousemove', handleMouseMove);
    button.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      button.removeEventListener('mousemove', handleMouseMove);
      button.removeEventListener('mouseleave', handleMouseLeave);
    };
  },

  /**
   * Hover lift effect
   */
  hoverLift: (element: HTMLElement) => {
    const enter = () => {
      animate(
        element,
        {
          transform: 'translateY(-8px) scale(1.02)'
        },
        {
          duration: 0.3,
          easing: spring({ stiffness: 300, damping: 30 }),
        }
      );
    };

    const leave = () => {
      animate(
        element,
        {
          transform: 'translateY(0) scale(1)'
        },
        {
          duration: 0.3,
          easing: spring({ stiffness: 300, damping: 30 }),
        }
      );
    };

    element.addEventListener('mouseenter', enter);
    element.addEventListener('mouseleave', leave);

    return () => {
      element.removeEventListener('mouseenter', enter);
      element.removeEventListener('mouseleave', leave);
    };
  },

  /**
   * Ripple effect
   */
  ripple: (element: HTMLElement, x: number, y: number) => {
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    ripple.style.position = 'absolute';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.width = '20px';
    ripple.style.height = '20px';
    ripple.style.borderRadius = '50%';
    ripple.style.background = 'rgba(255, 255, 255, 0.5)';
    ripple.style.pointerEvents = 'none';
    element.style.position = 'relative';
    element.appendChild(ripple);

    const animation = animate(
      ripple,
      {
        scale: [0, 2.5],
        opacity: [0.5, 0]
      },
      {
        duration: 0.6,
        easing: spring({ stiffness: 300, damping: 30 }),
      }
    );

    animation.finished.then(() => ripple.remove());
    return animation;
  },
};

/**
 * Continuous Animations
 */
export const continuousAnimations = {
  /**
   * Float animation
   */
  float: (config: MotionPresetConfig = {}) => {
    const targets = config.targets || document.querySelectorAll('.float');
    return animate(
      targets,
      {
        transform: ['translateY(-10px)', 'translateY(10px)']
      },
      {
        duration: config.duration || 3,
        easing: 'ease-in-out',
        direction: 'alternate',
        repeat: Infinity,
        ...config,
      }
    );
  },

  /**
   * Pulse animation
   */
  pulse: (config: MotionPresetConfig = {}) => {
    const targets = config.targets || document.querySelectorAll('.pulse');
    return animate(
      targets,
      {
        transform: ['scale(1)', 'scale(1.05)', 'scale(1)']
      },
      {
        duration: config.duration || 2,
        easing: 'ease-in-out',
        repeat: Infinity,
        ...config,
      }
    );
  },

  /**
   * Rotate animation
   */
  rotate: (config: MotionPresetConfig = {}) => {
    const targets = config.targets || document.querySelectorAll('.rotate');
    return animate(
      targets,
      {
        transform: ['rotate(0deg)', 'rotate(360deg)']
      },
      {
        duration: config.duration || 4,
        easing: 'linear',
        repeat: Infinity,
        ...config,
      }
    );
  },

  /**
   * Shimmer effect
   */
  shimmer: (config: MotionPresetConfig = {}) => {
    const targets = config.targets || document.querySelectorAll('.shimmer');
    return animate(
      targets,
      {
        opacity: [0.5, 1, 0.5]
      },
      {
        duration: config.duration || 2,
        easing: 'ease-in-out',
        repeat: Infinity,
        ...config,
      }
    );
  },
};

/**
 * Exit Animations
 */
export const exitAnimations = {
  /**
   * Fade out and slide up
   */
  fadeOutUp: (config: MotionPresetConfig = {}) => {
    return animate(
      config.targets as Element,
      {
        opacity: [1, 0],
        transform: ['translateY(0)', 'translateY(-50px)']
      },
      {
        duration: config.duration || 0.6,
        easing: spring({ stiffness: 300, damping: 30 }),
        ...config,
      }
    );
  },

  /**
   * Zoom out
   */
  zoomOut: (config: MotionPresetConfig = {}) => {
    return animate(
      config.targets as Element,
      {
        opacity: [1, 0],
        transform: ['scale(1)', 'scale(0)']
      },
      {
        duration: config.duration || 0.4,
        easing: spring({ stiffness: 300, damping: 30 }),
        ...config,
      }
    );
  },
};

/**
 * Timeline animations for complex sequences
 */
export const timelineAnimations = {
  /**
   * Staggered entrance with timeline
   */
  staggeredEntrance: (targets: Element[], config: MotionPresetConfig = {}) => {
    return timeline(
      targets.map((target, index) => [
        target,
        {
          opacity: [0, 1],
          transform: ['translateY(30px)', 'translateY(0)']
        },
        {
          duration: config.duration || 0.6,
          delay: index * 0.1,
          easing: spring({ stiffness: 300, damping: 30 }),
        }
      ])
    );
  },
};

/**
 * Export all presets
 */
export default {
  entrance: entranceAnimations,
  stagger: staggerAnimations,
  scroll: scrollAnimations,
  interaction: interactionAnimations,
  continuous: continuousAnimations,
  exit: exitAnimations,
  timeline: timelineAnimations,
  // Re-export Motion One functions for advanced usage
  animate,
  stagger,
  spring,
  timeline,
};

