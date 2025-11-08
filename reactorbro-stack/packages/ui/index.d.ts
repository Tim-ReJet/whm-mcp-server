/**
 * Type definitions for @repo/ui
 */

// Tailwind preset type
export const tailwindPreset: any;

/**
 * Simple className concatenation utility
 * Joins class names and filters out falsy values
 */
export function cn(
  ...classes: Array<string | false | null | undefined | 0 | "">
): string;

/**
 * Conditional className helper
 */
export function conditionalClass(classMap: Record<string, boolean>): string;

/**
 * Variant configuration for the variants function
 */
export interface VariantConfig {
  base?: string;
  variants?: Record<string, Record<string, string>>;
  compoundVariants?: Array<Record<string, any> & { class: string }>;
}

/**
 * Variant-based className builder
 */
export function variants(
  config: VariantConfig,
  props?: Record<string, any>
): string;

/**
 * Common spacing utilities based on design tokens
 */
export const spacing: {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
};

/**
 * Common color utilities
 */
export const colors: {
  primary: {
    DEFAULT: string;
    bg: string;
    border: string;
    hover: string;
  };
  accent: {
    DEFAULT: string;
    bg: string;
    border: string;
    hover: string;
  };
  neutral: {
    DEFAULT: string;
    bg: string;
    border: string;
    hover: string;
  };
};

/**
 * Common component class patterns
 */
export const patterns: {
  card: string;
  button: string;
  input: string;
  container: string;
  section: string;
  heading: {
    h1: string;
    h2: string;
    h3: string;
    h4: string;
  };
};

/**
 * Screen size breakpoints (Tailwind defaults)
 */
export const breakpoints: {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  "2xl": string;
};

// Default export
declare const _default: {
  tailwindPreset: any;
  cn: typeof cn;
  conditionalClass: typeof conditionalClass;
  variants: typeof variants;
  spacing: typeof spacing;
  colors: typeof colors;
  patterns: typeof patterns;
  breakpoints: typeof breakpoints;
};

export default _default;
