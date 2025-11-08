/**
 * View Transitions API
 * Native browser API for smooth page transitions
 *
 * Modern browsers (Chrome 111+, Edge 111+) support View Transitions API
 * Provides smooth, native transitions between page states
 */

export interface ViewTransitionOptions {
  updateDOM: () => void | Promise<void>;
  types?: string[];
  skipTransition?: boolean;
}

/**
 * Check if View Transitions API is supported
 */
export function supportsViewTransitions(): boolean {
  return typeof document !== 'undefined' && 'startViewTransition' in document;
}

/**
 * Start a view transition
 */
export function startViewTransition(
  updateDOM: () => void | Promise<void>,
  options?: Omit<ViewTransitionOptions, 'updateDOM'>
): Promise<ViewTransition> | Promise<void> {
  if (!supportsViewTransitions()) {
    // Fallback: just update DOM without transition
    return Promise.resolve(updateDOM());
  }

  return (document as any).startViewTransition(() => updateDOM());
}

/**
 * Create a named view transition
 */
export function createViewTransition(
  name: string,
  updateDOM: () => void | Promise<void>
): Promise<ViewTransition> | Promise<void> {
  if (!supportsViewTransitions()) {
    return Promise.resolve(updateDOM());
  }

  return (document as any).startViewTransition(() => {
    const root = document.documentElement;
    root.style.setProperty('--view-transition-name', name);
    return updateDOM();
  });
}

/**
 * Page transition helper
 */
export async function pageTransition(
  updateDOM: () => void | Promise<void>,
  options?: {
    type?: 'fade' | 'slide' | 'scale' | 'none';
    duration?: number;
  }
): Promise<void> {
  if (!supportsViewTransitions()) {
    await updateDOM();
    return;
  }

  const root = document.documentElement;
  const duration = options?.duration || 300;

  // Set transition type
  if (options?.type && options.type !== 'none') {
    root.style.setProperty('--view-transition-type', options.type);
  }

  root.style.setProperty('--view-transition-duration', `${duration}ms`);

  const transition = await startViewTransition(updateDOM);

  if (transition && 'finished' in transition) {
    await transition.finished;
  }
}

/**
 * Fade transition
 */
export function fadeTransition(updateDOM: () => void | Promise<void>): Promise<void> {
  return pageTransition(updateDOM, { type: 'fade', duration: 300 });
}

/**
 * Slide transition
 */
export function slideTransition(
  updateDOM: () => void | Promise<void>,
  direction: 'left' | 'right' | 'up' | 'down' = 'left'
): Promise<void> {
  if (!supportsViewTransitions()) {
    return Promise.resolve(updateDOM());
  }

  const root = document.documentElement;
  root.style.setProperty('--view-transition-slide-direction', direction);

  return pageTransition(updateDOM, { type: 'slide', duration: 400 });
}

/**
 * Scale transition
 */
export function scaleTransition(updateDOM: () => void | Promise<void>): Promise<void> {
  return pageTransition(updateDOM, { type: 'scale', duration: 300 });
}

/**
 * View transition CSS helper
 * Returns CSS to add to your stylesheet for view transitions
 */
export function getViewTransitionCSS(): string {
  return `
    /* View Transitions API Styles */
    @view-transition {
      navigation: auto;
    }

    ::view-transition-old(root),
    ::view-transition-new(root) {
      animation-duration: var(--view-transition-duration, 300ms);
      animation-timing-function: ease-in-out;
    }

    /* Fade transition */
    [data-transition="fade"] {
      view-transition-name: fade;
    }

    ::view-transition-old(fade),
    ::view-transition-new(fade) {
      animation: fade 300ms ease-in-out;
    }

    /* Slide transitions */
    [data-transition="slide-left"] {
      view-transition-name: slide-left;
    }

    [data-transition="slide-right"] {
      view-transition-name: slide-right;
    }

    /* Scale transition */
    [data-transition="scale"] {
      view-transition-name: scale;
    }

    ::view-transition-old(scale),
    ::view-transition-new(scale) {
      animation: scale 300ms ease-in-out;
    }

    @keyframes fade {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes scale {
      from { transform: scale(0.9); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
  `;
}

/**
 * Setup view transitions for Astro
 */
export function setupAstroViewTransitions(): void {
  if (typeof document === 'undefined' || !supportsViewTransitions()) {
    return;
  }

  // Add CSS
  const style = document.createElement('style');
  style.textContent = getViewTransitionCSS();
  document.head.appendChild(style);

  // Intercept navigation
  document.addEventListener('astro:before-preparation', (event: any) => {
    const transition = startViewTransition(async () => {
      // Astro will handle the DOM update
      await event.detail.prepare();
    });

    event.preventDefault();
  });
}

/**
 * Export all view transition utilities
 */
export default {
  supportsViewTransitions,
  startViewTransition,
  createViewTransition,
  pageTransition,
  fadeTransition,
  slideTransition,
  scaleTransition,
  getViewTransitionCSS,
  setupAstroViewTransitions,
};

