/**
 * Anime.js Animation Presets
 * Production-ready animation presets using anime.js
 */

// anime.js uses CommonJS exports
const anime = require("animejs");

type AnimeParams = {
  targets?: string | Element | Element[] | NodeList;
  [key: string]: any;
};

/**
 * Preset configuration type
 */
export interface AnimePresetConfig {
  targets?: string | Element | Element[] | NodeList;
  duration?: number;
  delay?: number;
  easing?: string;
  stagger?: number | { start?: number; from?: string; direction?: string };
}

/**
 * Entrance Animations
 */
export const entranceAnimations = {
  /**
   * Fade in and slide up
   */
  fadeInUp: (config: AnimePresetConfig = {}): AnimeParams => ({
    targets: config.targets || ".animate-fade-in-up",
    translateY: [50, 0],
    opacity: [0, 1],
    duration: config.duration || 800,
    delay: config.delay || 0,
    easing: config.easing || "easeOutExpo",
    ...config,
  }),

  /**
   * Fade in and slide down
   */
  fadeInDown: (config: AnimePresetConfig = {}): AnimeParams => ({
    targets: config.targets || ".animate-fade-in-down",
    translateY: [-50, 0],
    opacity: [0, 1],
    duration: config.duration || 800,
    delay: config.delay || 0,
    easing: config.easing || "easeOutExpo",
    ...config,
  }),

  /**
   * Fade in and slide from left
   */
  fadeInLeft: (config: AnimePresetConfig = {}): AnimeParams => ({
    targets: config.targets || ".animate-fade-in-left",
    translateX: [-50, 0],
    opacity: [0, 1],
    duration: config.duration || 800,
    delay: config.delay || 0,
    easing: config.easing || "easeOutExpo",
    ...config,
  }),

  /**
   * Fade in and slide from right
   */
  fadeInRight: (config: AnimePresetConfig = {}): AnimeParams => ({
    targets: config.targets || ".animate-fade-in-right",
    translateX: [50, 0],
    opacity: [0, 1],
    duration: config.duration || 800,
    delay: config.delay || 0,
    easing: config.easing || "easeOutExpo",
    ...config,
  }),

  /**
   * Fade in with scale
   */
  fadeInScale: (config: AnimePresetConfig = {}): AnimeParams => ({
    targets: config.targets || ".animate-fade-in-scale",
    scale: [0.8, 1],
    opacity: [0, 1],
    duration: config.duration || 600,
    delay: config.delay || 0,
    easing: config.easing || "easeOutBack",
    ...config,
  }),

  /**
   * Zoom in
   */
  zoomIn: (config: AnimePresetConfig = {}): AnimeParams => ({
    targets: config.targets || ".animate-zoom-in",
    scale: [0, 1],
    opacity: [0, 1],
    duration: config.duration || 600,
    delay: config.delay || 0,
    easing: config.easing || "easeOutExpo",
    ...config,
  }),
};

/**
 * Stagger Animations
 */
export const staggerAnimations = {
  /**
   * Stagger cards with fade and slide
   */
  staggerCards: (config: AnimePresetConfig = {}): AnimeParams => ({
    targets: config.targets || ".card",
    translateY: [30, 0],
    opacity: [0, 1],
    duration: config.duration || 600,
    delay: anime.stagger(80, { start: 200 }),
    easing: config.easing || "easeOutCubic",
    ...config,
  }),

  /**
   * Stagger list items
   */
  staggerList: (config: AnimePresetConfig = {}): AnimeParams => ({
    targets: config.targets || "li",
    translateX: [-30, 0],
    opacity: [0, 1],
    duration: config.duration || 500,
    delay: anime.stagger(60),
    easing: config.easing || "easeOutQuad",
    ...config,
  }),

  /**
   * Stagger from center
   */
  staggerFromCenter: (config: AnimePresetConfig = {}): AnimeParams => ({
    targets: config.targets || ".grid-item",
    scale: [0, 1],
    opacity: [0, 1],
    duration: config.duration || 500,
    delay: anime.stagger(50, { from: "center", grid: [5, 5] }),
    easing: config.easing || "easeOutExpo",
    ...config,
  }),

  /**
   * Wave effect
   */
  wave: (config: AnimePresetConfig = {}): AnimeParams => ({
    targets: config.targets || ".wave-item",
    translateY: [
      { value: -20, duration: 400 },
      { value: 0, duration: 400 },
    ],
    delay: anime.stagger(100),
    easing: "easeInOutSine",
    loop: true,
    ...config,
  }),
};

/**
 * Scroll Animations
 */
export const scrollAnimations = {
  /**
   * Parallax scroll effect
   */
  parallax: (element: Element, speed: number = 0.5) => {
    let ticking = false;

    const updateParallax = () => {
      const scrolled = window.pageYOffset;
      const elementTop = element.getBoundingClientRect().top + scrolled;
      const elementVisible = elementTop - window.innerHeight;

      if (scrolled > elementVisible) {
        const yPos = -(scrolled - elementTop) * speed;
        anime({
          targets: element,
          translateY: yPos,
          duration: 0,
        });
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  },

  /**
   * Reveal on scroll
   */
  revealOnScroll: (config: AnimePresetConfig = {}) => {
    const targets = document.querySelectorAll(
      (config.targets as string) || ".scroll-reveal",
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            anime({
              targets: entry.target,
              translateY: [50, 0],
              opacity: [0, 1],
              duration: config.duration || 800,
              easing: config.easing || "easeOutExpo",
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "-50px" },
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

      anime({
        targets: button,
        translateX: x * strength,
        translateY: y * strength,
        duration: 300,
        easing: "easeOutQuad",
      });
    };

    const handleMouseLeave = () => {
      anime({
        targets: button,
        translateX: 0,
        translateY: 0,
        duration: 400,
        easing: "easeOutElastic(1, .5)",
      });
    };

    button.addEventListener("mousemove", handleMouseMove);
    button.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      button.removeEventListener("mousemove", handleMouseMove);
      button.removeEventListener("mouseleave", handleMouseLeave);
    };
  },

  /**
   * Hover lift effect
   */
  hoverLift: (
    config: AnimePresetConfig = {},
  ): { enter: AnimeParams; leave: AnimeParams } => ({
    enter: {
      targets: config.targets,
      translateY: -8,
      scale: 1.02,
      duration: 300,
      easing: "easeOutCubic",
    },
    leave: {
      targets: config.targets,
      translateY: 0,
      scale: 1,
      duration: 300,
      easing: "easeOutCubic",
    },
  }),

  /**
   * Ripple effect
   */
  ripple: (element: HTMLElement, x: number, y: number) => {
    const ripple = document.createElement("span");
    ripple.classList.add("ripple");
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    element.appendChild(ripple);

    anime({
      targets: ripple,
      scale: [0, 2.5],
      opacity: [0.5, 0],
      duration: 600,
      easing: "easeOutExpo",
      complete: () => ripple.remove(),
    });
  },
};

/**
 * Continuous Animations
 */
export const continuousAnimations = {
  /**
   * Float animation
   */
  float: (config: AnimePresetConfig = {}): AnimeParams => ({
    targets: config.targets || ".float",
    translateY: [-10, 10],
    duration: config.duration || 3000,
    easing: "easeInOutSine",
    direction: "alternate",
    loop: true,
    ...config,
  }),

  /**
   * Pulse animation
   */
  pulse: (config: AnimePresetConfig = {}): AnimeParams => ({
    targets: config.targets || ".pulse",
    scale: [1, 1.05, 1],
    duration: config.duration || 2000,
    easing: "easeInOutQuad",
    loop: true,
    ...config,
  }),

  /**
   * Rotate animation
   */
  rotate: (config: AnimePresetConfig = {}): AnimeParams => ({
    targets: config.targets || ".rotate",
    rotate: "1turn",
    duration: config.duration || 4000,
    easing: "linear",
    loop: true,
    ...config,
  }),

  /**
   * Shimmer effect
   */
  shimmer: (config: AnimePresetConfig = {}): AnimeParams => ({
    targets: config.targets || ".shimmer",
    opacity: [0.5, 1, 0.5],
    duration: config.duration || 2000,
    easing: "easeInOutSine",
    loop: true,
    ...config,
  }),
};

/**
 * Exit Animations
 */
export const exitAnimations = {
  /**
   * Fade out and slide up
   */
  fadeOutUp: (config: AnimePresetConfig = {}): AnimeParams => ({
    targets: config.targets,
    translateY: [0, -50],
    opacity: [1, 0],
    duration: config.duration || 600,
    easing: config.easing || "easeInExpo",
    ...config,
  }),

  /**
   * Zoom out
   */
  zoomOut: (config: AnimePresetConfig = {}): AnimeParams => ({
    targets: config.targets,
    scale: [1, 0],
    opacity: [1, 0],
    duration: config.duration || 400,
    easing: config.easing || "easeInExpo",
    ...config,
  }),
};

/**
 * Execute animation preset by name
 */
export function executePreset(
  presetName: keyof typeof entranceAnimations | keyof typeof staggerAnimations,
  config: AnimePresetConfig = {},
): any {
  const preset =
    entranceAnimations[presetName as keyof typeof entranceAnimations] ||
    staggerAnimations[presetName as keyof typeof staggerAnimations];

  if (!preset) {
    throw new Error(`Animation preset "${presetName}" not found`);
  }

  return anime(preset(config));
}

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
  execute: executePreset,
};
