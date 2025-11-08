# @repo/ui

Shared UI utilities and Tailwind CSS preset for ReactorJet Stack.

## Overview

This package provides:
- **Tailwind CSS preset** configured with design tokens
- **Utility functions** for className manipulation
- **Common component patterns** and styling helpers
- **Type definitions** for TypeScript projects

## Installation

This package is part of the monorepo workspace:

```json
{
  "dependencies": {
    "@repo/ui": "workspace:*"
  }
}
```

## Usage

### Tailwind Preset

Import the preset in your `tailwind.config.cjs`:

```javascript
module.exports = {
  presets: [require("@repo/ui/tailwind.preset.cjs")],
  content: ["./src/**/*.{astro,html,js,ts,vue}"],
};
```

The preset includes:
- Design token colors, spacing, radii, and shadows
- Custom font family (Inter)
- Tailwind plugins: `@tailwindcss/typography`, `@tailwindcss/forms`

### Utility Functions

#### `cn(...classes)`

Simple className concatenation that filters out falsy values.

```javascript
import { cn } from "@repo/ui";

const className = cn(
  "base-class",
  isActive && "active",
  isPending && "pending",
  "another-class"
);
// => "base-class active another-class" (if isActive is true, isPending is false)
```

#### `conditionalClass(classMap)`

Apply classes conditionally based on an object map.

```javascript
import { conditionalClass } from "@repo/ui";

const className = conditionalClass({
  "text-red-500": hasError,
  "text-green-500": isSuccess,
  "opacity-50": isDisabled,
});
```

#### `variants(config, props)`

Build variant-based component classes (similar to CVA or class-variance-authority).

```javascript
import { variants } from "@repo/ui";

const buttonVariants = variants(
  {
    base: "rounded px-4 py-2 font-medium transition-colors",
    variants: {
      color: {
        primary: "bg-primary-600 text-white hover:bg-primary-700",
        secondary: "bg-neutral-200 text-neutral-900 hover:bg-neutral-300",
        danger: "bg-red-600 text-white hover:bg-red-700",
      },
      size: {
        sm: "text-sm px-3 py-1.5",
        md: "text-base px-4 py-2",
        lg: "text-lg px-6 py-3",
      },
    },
    compoundVariants: [
      {
        color: "primary",
        size: "lg",
        class: "shadow-lg",
      },
    ],
  },
  { color: "primary", size: "md" }
);
```

### Design System Values

#### Colors

```javascript
import { colors } from "@repo/ui";

colors.primary.bg; // => "bg-primary-600"
colors.primary.hover; // => "hover:bg-primary-700"
colors.accent.DEFAULT; // => "text-accent-500"
```

#### Spacing

```javascript
import { spacing } from "@repo/ui";

spacing.xs; // => "4px"
spacing.md; // => "12px"
spacing.xl; // => "32px"
```

#### Patterns

Pre-defined component class patterns:

```javascript
import { patterns } from "@repo/ui";

patterns.card; // => "rounded-lg shadow-md p-4 bg-white"
patterns.button; // => "inline-flex items-center justify-center..."
patterns.input; // => "block w-full rounded-md border..."
patterns.container; // => "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
patterns.section; // => "py-12 sm:py-16 lg:py-20"

// Heading patterns
patterns.heading.h1; // => "text-4xl font-bold tracking-tight..."
patterns.heading.h2; // => "text-3xl font-bold tracking-tight..."
```

#### Breakpoints

Tailwind breakpoint values:

```javascript
import { breakpoints } from "@repo/ui";

breakpoints.sm; // => "640px"
breakpoints.md; // => "768px"
breakpoints.lg; // => "1024px"
breakpoints.xl; // => "1280px"
```

## Examples

### Astro Component

```astro
---
import { cn, patterns } from "@repo/ui";

interface Props {
  variant?: "primary" | "secondary";
  size?: "sm" | "lg";
}

const { variant = "primary", size = "sm" } = Astro.props;
---

<div class={patterns.card}>
  <h2 class={patterns.heading.h2}>Card Title</h2>
  <button
    class={cn(
      patterns.button,
      variant === "primary" && "btn-primary",
      variant === "secondary" && "btn-secondary",
      size === "sm" && "text-sm",
      size === "lg" && "text-lg"
    )}
  >
    Click Me
  </button>
</div>
```

### React Component (Future)

```tsx
import { variants } from "@repo/ui";

const buttonClass = variants({
  base: "rounded font-medium transition",
  variants: {
    intent: {
      primary: "bg-primary-600 text-white",
      secondary: "bg-neutral-200 text-neutral-900",
    },
    size: {
      small: "text-sm px-3 py-1",
      medium: "text-base px-4 py-2",
    },
  },
});

export function Button({ intent, size, children }) {
  return (
    <button className={buttonClass({ intent, size })}>
      {children}
    </button>
  );
}
```

## TypeScript Support

Full TypeScript definitions are included:

```typescript
import { cn, variants, VariantConfig } from "@repo/ui";

const config: VariantConfig = {
  base: "btn",
  variants: {
    color: {
      primary: "btn-primary",
      secondary: "btn-secondary",
    },
  },
};

const className: string = variants(config, { color: "primary" });
```

## API Reference

### Functions

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `cn` | `...classes: Array<string \| false \| null \| undefined>` | `string` | Concatenates class names, filtering falsy values |
| `conditionalClass` | `classMap: Record<string, boolean>` | `string` | Applies classes based on boolean conditions |
| `variants` | `config: VariantConfig, props?: Record<string, any>` | `string` | Builds variant-based component classes |

### Exports

| Export | Type | Description |
|--------|------|-------------|
| `tailwindPreset` | `object` | Tailwind preset configuration |
| `spacing` | `object` | Design token spacing values |
| `colors` | `object` | Design token color utilities |
| `patterns` | `object` | Common component class patterns |
| `breakpoints` | `object` | Tailwind breakpoint values |

## Dependencies

- `@repo/tokens` - Design token source
- `tailwindcss` (peer dependency)
- `@tailwindcss/forms` (optional)
- `@tailwindcss/typography` (optional)

## Contributing

When adding new utilities:
1. Add the function to `index.js`
2. Add TypeScript definitions to `index.d.ts`
3. Update this README with examples
4. Test in the Astro app

## License

Private package for ReactorJet Stack monorepo.