/**
 * CSS Scroll-driven Animations
 * Native CSS animations driven by scroll position
 *
 * Modern browsers (Chrome 115+, Edge 115+) support scroll-driven animations
 * Provides performant, GPU-accelerated scroll animations without JavaScript
 */

export interface ScrollTimelineOptions {
  source?: Element | 'root';
  orientation?: 'block' | 'inline' | 'vertical' | 'horizontal';
  scrollOffsets?: Array<{ target: Element | string; edge: 'start' | 'end'; threshold?: number }>;
}

/**
 * Check if Scroll-driven Animations are supported
 */
export function supportsScrollDrivenAnimations(): boolean {
  if (typeof CSS === 'undefined' || !CSS.supports) {
    return false;
  }

  return CSS.supports('animation-timeline', 'scroll()');
}

/**
 * Create scroll timeline CSS
 */
export function createScrollTimeline(
  name: string,
  options: ScrollTimelineOptions = {}
): string {
  const source = options.source === 'root' ? 'root' : options.source || 'root';
  const orientation = options.orientation || 'block';

  return `
    @scroll-timeline ${name} {
      source: ${source === 'root' ? 'auto' : `selector(${source})`};
      orientation: ${orientation};
    }
  `;
}

/**
 * Create scroll-driven animation CSS
 */
export function createScrollAnimation(
  name: string,
  keyframes: Record<string, any>,
  options: {
    timeline?: string;
    range?: { start: string; end: string };
    duration?: string;
  } = {}
): string {
  const timeline = options.timeline || 'scroll()';
  const range = options.range
    ? `animation-range: ${options.range.start} ${options.range.end};`
    : '';
  const duration = options.duration ? `animation-duration: ${options.duration};` : '';

  const keyframeString = Object.entries(keyframes)
    .map(([key, value]) => `  ${key} { ${Object.entries(value).map(([prop, val]) => `${prop}: ${val};`).join(' ')} }`)
    .join('\n');

  return `
    @keyframes ${name} {
${keyframeString}
    }

    .${name} {
      animation-name: ${name};
      animation-timeline: ${timeline};
      ${range}
      ${duration}
    }
  `;
}

/**
 * Scroll reveal animation (CSS-only)
 */
export function scrollRevealCSS(): string {
  return `
    @keyframes scroll-reveal {
      from {
        opacity: 0;
        transform: translateY(50px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .scroll-reveal {
      animation: scroll-reveal linear;
      animation-timeline: scroll();
      animation-range: entry 0% entry 100%;
    }
  `;
}

/**
 * Parallax scroll animation (CSS-only)
 */
export function parallaxScrollCSS(speed: number = 0.5): string {
  const translateY = speed * 100;

  return `
    @keyframes parallax {
      from {
        transform: translateY(0);
      }
      to {
        transform: translateY(${translateY}px);
      }
    }

    .parallax {
      animation: parallax linear;
      animation-timeline: scroll();
      animation-range: entry 0% exit 100%;
    }
  `;
}

/**
 * Fade in on scroll (CSS-only)
 */
export function fadeInOnScrollCSS(): string {
  return `
    @keyframes fade-in-scroll {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .fade-in-scroll {
      animation: fade-in-scroll linear;
      animation-timeline: scroll();
      animation-range: entry 0% entry 50%;
    }
  `;
}

/**
 * Scale on scroll (CSS-only)
 */
export function scaleOnScrollCSS(): string {
  return `
    @keyframes scale-scroll {
      from {
        transform: scale(0.8);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }

    .scale-scroll {
      animation: scale-scroll linear;
      animation-timeline: scroll();
      animation-range: entry 0% entry 100%;
    }
  `;
}

/**
 * Progress bar animation (CSS-only)
 */
export function progressBarCSS(): string {
  return `
    @keyframes progress {
      from {
        width: 0%;
      }
      to {
        width: 100%;
      }
    }

    .progress-bar {
      animation: progress linear;
      animation-timeline: scroll();
      animation-range: entry 0% exit 100%;
    }
  `;
}

/**
 * Get all scroll-driven animation CSS
 */
export function getAllScrollDrivenCSS(): string {
  return `
    /* Scroll-driven Animations */
    ${scrollRevealCSS()}
    ${parallaxScrollCSS()}
    ${fadeInOnScrollCSS()}
    ${scaleOnScrollCSS()}
    ${progressBarCSS()}
  `;
}

/**
 * Setup scroll-driven animations
 * Adds CSS to document if supported
 */
export function setupScrollDrivenAnimations(): void {
  if (typeof document === 'undefined' || !supportsScrollDrivenAnimations()) {
    return;
  }

  const style = document.createElement('style');
  style.textContent = getAllScrollDrivenCSS();
  document.head.appendChild(style);
}

/**
 * Intersection Observer fallback for unsupported browsers
 */
export function createScrollRevealFallback(
  selector: string = '.scroll-reveal',
  options: IntersectionObserverInit = {}
): IntersectionObserver {
  const elements = document.querySelectorAll(selector);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '-50px',
      ...options,
    }
  );

  elements.forEach((el) => observer.observe(el));
  return observer;
}

/**
 * Export all scroll-driven utilities
 */
export default {
  supportsScrollDrivenAnimations,
  createScrollTimeline,
  createScrollAnimation,
  scrollRevealCSS,
  parallaxScrollCSS,
  fadeInOnScrollCSS,
  scaleOnScrollCSS,
  progressBarCSS,
  getAllScrollDrivenCSS,
  setupScrollDrivenAnimations,
  createScrollRevealFallback,
};

