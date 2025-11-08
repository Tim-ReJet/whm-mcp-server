/**
 * Motion Preference and Accessibility Utilities
 * Utilities for respecting user motion preferences and ensuring accessible animations
 */

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;

  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  return mediaQuery.matches;
}

/**
 * Get safe animation duration based on user preference
 * Returns 0 if user prefers reduced motion, otherwise returns the specified duration
 */
export function getSafeDuration(duration: number): number {
  return prefersReducedMotion() ? 0 : duration;
}

/**
 * Get safe animation delay based on user preference
 */
export function getSafeDelay(delay: number): number {
  return prefersReducedMotion() ? 0 : delay;
}

/**
 * Create a motion preference listener
 * Calls the callback whenever the user's motion preference changes
 */
export function onMotionPreferenceChange(
  callback: (prefersReduced: boolean) => void
): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  const handler = (event: MediaQueryListEvent) => {
    callback(event.matches);
  };

  // Modern browsers
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }

  // Legacy browsers
  mediaQuery.addListener(handler);
  return () => mediaQuery.removeListener(handler);
}

/**
 * Get motion-safe animation config
 * Returns animation config that respects user preferences
 */
export function getMotionSafeConfig<T extends Record<string, any>>(
  config: T,
  fallbackConfig?: Partial<T>
): T {
  if (prefersReducedMotion()) {
    return {
      ...config,
      ...fallbackConfig,
      duration: 0,
      delay: 0,
    } as T;
  }
  return config;
}

/**
 * Check if animations should be enabled
 * Considers both user preference and device capabilities
 */
export function shouldEnableAnimations(): boolean {
  if (typeof window === 'undefined') return false;

  // Check motion preference
  if (prefersReducedMotion()) return false;

  // Check if device has sufficient power
  // Low-end devices might benefit from reduced animations
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    if (connection?.saveData) return false;
  }

  return true;
}

/**
 * Visibility API utilities for pausing animations when tab is hidden
 */
export class VisibilityManager {
  private listeners: Set<(visible: boolean) => void> = new Set();
  private isVisible: boolean = true;

  constructor() {
    if (typeof document !== 'undefined') {
      this.isVisible = !document.hidden;
      this.setupListeners();
    }
  }

  private setupListeners() {
    const handleVisibilityChange = () => {
      this.isVisible = !document.hidden;
      this.notify();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
  }

  private notify() {
    this.listeners.forEach(listener => listener(this.isVisible));
  }

  /**
   * Subscribe to visibility changes
   */
  subscribe(callback: (visible: boolean) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Get current visibility state
   */
  get visible(): boolean {
    return this.isVisible;
  }
}

/**
 * Performance monitoring for animations
 */
export class AnimationPerformanceMonitor {
  private frameCount: number = 0;
  private lastTime: number = performance.now();
  private fps: number = 60;
  private isMonitoring: boolean = false;
  private animationFrame: number | null = null;

  /**
   * Start monitoring FPS
   */
  start() {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.measure();
  }

  /**
   * Stop monitoring
   */
  stop() {
    this.isMonitoring = false;
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  private measure = () => {
    if (!this.isMonitoring) return;

    const currentTime = performance.now();
    this.frameCount++;

    // Calculate FPS every second
    if (currentTime >= this.lastTime + 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
      this.frameCount = 0;
      this.lastTime = currentTime;
    }

    this.animationFrame = requestAnimationFrame(this.measure);
  };

  /**
   * Get current FPS
   */
  getFPS(): number {
    return this.fps;
  }

  /**
   * Check if performance is acceptable
   */
  isPerformanceGood(threshold: number = 55): boolean {
    return this.fps >= threshold;
  }
}

/**
 * Adaptive animation quality based on device performance
 */
export class AdaptiveAnimationQuality {
  private performanceMonitor: AnimationPerformanceMonitor;
  private quality: 'high' | 'medium' | 'low' = 'high';
  private listeners: Set<(quality: 'high' | 'medium' | 'low') => void> = new Set();

  constructor() {
    this.performanceMonitor = new AnimationPerformanceMonitor();
    this.detectInitialQuality();
  }

  private detectInitialQuality() {
    // Check device capabilities
    const isLowEnd = this.isLowEndDevice();

    if (isLowEnd) {
      this.quality = 'low';
    } else if (prefersReducedMotion()) {
      this.quality = 'low';
    } else {
      this.quality = 'high';
    }
  }

  private isLowEndDevice(): boolean {
    // Check various indicators of device performance
    if (typeof navigator === 'undefined') return false;

    // Check connection
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g') {
        return true;
      }
    }

    // Check device memory (if available)
    if ('deviceMemory' in navigator) {
      const memory = (navigator as any).deviceMemory;
      if (memory && memory < 4) return true;
    }

    // Check hardware concurrency
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
      return true;
    }

    return false;
  }

  /**
   * Start adaptive quality monitoring
   */
  startMonitoring() {
    this.performanceMonitor.start();

    // Check performance every 3 seconds
    setInterval(() => {
      const fps = this.performanceMonitor.getFPS();
      let newQuality: 'high' | 'medium' | 'low' = this.quality;

      if (fps < 30) {
        newQuality = 'low';
      } else if (fps < 50) {
        newQuality = 'medium';
      } else {
        newQuality = 'high';
      }

      if (newQuality !== this.quality) {
        this.quality = newQuality;
        this.notify();
      }
    }, 3000);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    this.performanceMonitor.stop();
  }

  private notify() {
    this.listeners.forEach(listener => listener(this.quality));
  }

  /**
   * Subscribe to quality changes
   */
  subscribe(callback: (quality: 'high' | 'medium' | 'low') => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Get current quality level
   */
  getQuality(): 'high' | 'medium' | 'low' {
    return this.quality;
  }

  /**
   * Get animation config based on quality
   */
  getQualityConfig() {
    const configs = {
      high: {
        enableParticles: true,
        enableBlur: true,
        enableShadows: true,
        maxAnimations: 10,
        particleCount: 100,
      },
      medium: {
        enableParticles: true,
        enableBlur: false,
        enableShadows: true,
        maxAnimations: 5,
        particleCount: 50,
      },
      low: {
        enableParticles: false,
        enableBlur: false,
        enableShadows: false,
        maxAnimations: 2,
        particleCount: 0,
      },
    };

    return configs[this.quality];
  }
}

/**
 * Create a singleton instance for global use
 */
export const visibilityManager = new VisibilityManager();
export const adaptiveQuality = new AdaptiveAnimationQuality();

/**
 * Utility to check if element is in viewport
 */
export function isInViewport(element: Element, margin: number = 0): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= -margin &&
    rect.left >= -margin &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + margin &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth) + margin
  );
}

/**
 * Intersection Observer helper for scroll animations
 */
export function createScrollObserver(
  callback: (entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver {
  const defaultOptions: IntersectionObserverInit = {
    threshold: 0.1,
    rootMargin: '-50px',
    ...options,
  };

  return new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        callback(entry);
      }
    });
  }, defaultOptions);
}

/**
 * Throttle function for performance
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let timeoutId: NodeJS.Timeout | null = null;

  return function (...args: Parameters<T>) {
    const now = Date.now();

    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    } else {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        func(...args);
      }, delay - (now - lastCall));
    }
  };
}

/**
 * Debounce function for performance
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return function (...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Request animation frame with fallback
 */
export const raf = typeof requestAnimationFrame !== 'undefined'
  ? requestAnimationFrame
  : (callback: FrameRequestCallback) => setTimeout(callback, 16);

/**
 * Cancel animation frame with fallback
 */
export const caf = typeof cancelAnimationFrame !== 'undefined'
  ? cancelAnimationFrame
  : clearTimeout;

/**
 * Export all utilities
 */
export default {
  prefersReducedMotion,
  getSafeDuration,
  getSafeDelay,
  onMotionPreferenceChange,
  getMotionSafeConfig,
  shouldEnableAnimations,
  VisibilityManager,
  AnimationPerformanceMonitor,
  AdaptiveAnimationQuality,
  visibilityManager,
  adaptiveQuality,
  isInViewport,
  createScrollObserver,
  throttle,
  debounce,
  raf,
  caf,
};
