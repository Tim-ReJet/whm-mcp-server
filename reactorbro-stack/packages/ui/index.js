/**
 * @repo/ui - Shared UI utilities and components
 *
 * This package provides:
 * - Tailwind CSS preset with design tokens
 * - Utility functions for className manipulation
 * - Common component helpers
 */

// Re-export Tailwind preset for convenience
const tailwindPreset = require("./tailwind.preset.cjs");

/**
 * Simple className concatenation utility
 * Joins class names and filters out falsy values
 *
 * @param {...(string|false|null|undefined)} classes
 * @returns {string}
 *
 * @example
 * cn('base-class', isActive && 'active', 'another-class')
 * // => 'base-class active another-class'
 */
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

/**
 * Conditional className helper
 *
 * @param {Object} classMap - Object where keys are class names and values are booleans
 * @returns {string}
 *
 * @example
 * conditionalClass({ 'active': isActive, 'disabled': isDisabled })
 * // => 'active' (if isActive is true and isDisabled is false)
 */
function conditionalClass(classMap) {
  return Object.entries(classMap)
    .filter(([_, condition]) => condition)
    .map(([className]) => className)
    .join(" ");
}

/**
 * Variant-based className builder
 * Useful for component variants
 *
 * @param {Object} config
 * @param {string} config.base - Base classes always applied
 * @param {Object} config.variants - Variant definitions
 * @param {Object} config.compoundVariants - Compound variant rules
 * @param {Object} props - Component props with variant values
 * @returns {string}
 *
 * @example
 * const buttonClass = variants({
 *   base: 'rounded px-4 py-2',
 *   variants: {
 *     color: {
 *       primary: 'bg-primary-600 text-white',
 *       secondary: 'bg-neutral-200 text-neutral-900'
 *     },
 *     size: {
 *       sm: 'text-sm',
 *       lg: 'text-lg'
 *     }
 *   }
 * }, { color: 'primary', size: 'lg' })
 */
function variants(config, props = {}) {
  const {
    base = "",
    variants: variantDefs = {},
    compoundVariants = [],
  } = config;

  const variantClasses = Object.entries(variantDefs)
    .map(([variantKey, variantValues]) => {
      const propValue = props[variantKey];
      return propValue && variantValues[propValue]
        ? variantValues[propValue]
        : "";
    })
    .filter(Boolean);

  const compoundClasses = compoundVariants
    .filter((compound) => {
      return Object.entries(compound)
        .filter(([key]) => key !== "class")
        .every(([key, value]) => props[key] === value);
    })
    .map((compound) => compound.class)
    .filter(Boolean);

  return cn(base, ...variantClasses, ...compoundClasses);
}

/**
 * Common spacing utilities based on design tokens
 */
const spacing = {
  xs: "4px",
  sm: "8px",
  md: "12px",
  lg: "20px",
  xl: "32px",
};

/**
 * Common color utilities
 */
const colors = {
  primary: {
    DEFAULT: "text-primary-600",
    bg: "bg-primary-600",
    border: "border-primary-600",
    hover: "hover:bg-primary-700",
  },
  accent: {
    DEFAULT: "text-accent-500",
    bg: "bg-accent-500",
    border: "border-accent-500",
    hover: "hover:bg-accent-600",
  },
  neutral: {
    DEFAULT: "text-neutral-900",
    bg: "bg-neutral-50",
    border: "border-neutral-200",
    hover: "hover:bg-neutral-100",
  },
};

/**
 * Common component class patterns
 */
const patterns = {
  card: "rounded-lg shadow-md p-4 bg-white",
  button:
    "inline-flex items-center justify-center rounded-md px-4 py-2 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
  input:
    "block w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-primary-500 focus:ring-primary-500",
  container: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
  section: "py-12 sm:py-16 lg:py-20",
  heading: {
    h1: "text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl",
    h2: "text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl",
    h3: "text-2xl font-bold tracking-tight text-neutral-900",
    h4: "text-xl font-semibold text-neutral-900",
  },
};

/**
 * Screen size breakpoints (Tailwind defaults)
 */
const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
};

// CommonJS exports
module.exports = {
  // Tailwind
  tailwindPreset,

  // Utility functions
  cn,
  conditionalClass,
  variants,

  // Design system values
  spacing,
  colors,
  patterns,
  breakpoints,
};

// ESM export for modern bundlers
module.exports.default = module.exports;
