/**
 * Graphic Design Agent
 * Handles visual design tasks including branding, color palettes, and typography
 */

import { AgentBase } from "../../core/agent-base.js";
import type { Task, TaskResult, Context } from "../../core/types.js";

export interface BrandInfo {
  name: string;
  industry: string;
  values: string[];
  targetAudience: string;
  style: "modern" | "classic" | "playful" | "minimal" | "bold";
  preferences?: {
    colors?: string[];
    avoidColors?: string[];
    fonts?: string[];
  };
}

export interface Logo {
  type: "text" | "icon" | "combination" | "emblem";
  description: string;
  variations: LogoVariation[];
  files: {
    svg?: string;
    png?: string;
  };
}

export interface LogoVariation {
  name: string;
  description: string;
  usage: string;
  colorScheme: "color" | "monochrome" | "reverse";
}

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  neutral: {
    lightest: string;
    light: string;
    medium: string;
    dark: string;
    darkest: string;
  };
  semantic: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  metadata: {
    harmony: "complementary" | "analogous" | "triadic" | "monochromatic";
    contrast: "high" | "medium" | "low";
    accessibility: {
      wcagLevel: "AA" | "AAA";
      contrastRatios: Record<string, number>;
    };
  };
}

export interface Typography {
  headings: {
    family: string;
    weights: number[];
    fallback: string;
    source: "google" | "system" | "custom";
  };
  body: {
    family: string;
    weights: number[];
    fallback: string;
    source: "google" | "system" | "custom";
  };
  scale: {
    base: number;
    ratio: number;
    sizes: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      "2xl": string;
      "3xl": string;
      "4xl": string;
      "5xl": string;
    };
  };
  lineHeights: {
    tight: number;
    normal: number;
    relaxed: number;
    loose: number;
  };
}

export class GraphicDesignAgent extends AgentBase {
  constructor() {
    super({
      id: "graphic-design-agent",
      name: "Graphic Design Agent",
      description:
        "Creates visual assets, brand identities, color palettes, and typography systems",
      version: "1.0.0",
      category: "design",
      capabilities: [
        "logo_design",
        "color_palette_generation",
        "typography_selection",
        "brand_identity",
        "visual_assets",
      ],
      skills: [
        "color-theory",
        "typography-pairing",
        "brand-strategy",
        "visual-hierarchy",
        "accessibility-check",
      ],
      config: {
        maxRetries: 3,
        timeout: 180000,
        tokenLimit: 8000,
        parallel: false,
        priority: 7,
      },
    });
  }

  async execute(task: Task, context: Context): Promise<TaskResult> {
    this.log("info", `Executing graphic design task: ${task.type}`, {
      taskId: task.id,
    });

    try {
      let result: any;

      switch (task.type) {
        case "logo_design":
          result = await this.generateLogo(task.parameters.brandInfo, context);
          break;
        case "color_palette_generation":
          result = await this.createColorPalette(
            task.parameters.baseColor,
            task.parameters.style,
            context,
          );
          break;
        case "typography_selection":
          result = await this.selectTypography(
            task.parameters.brandStyle,
            context,
          );
          break;
        case "brand_identity":
          result = await this.createBrandIdentity(
            task.parameters.brandInfo,
            context,
          );
          break;
        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }

      return {
        success: true,
        data: result,
        metadata: {
          tokensUsed: this.estimateTokens(JSON.stringify(result)),
          duration: 0,
          agent: this.id,
          timestamp: new Date(),
        },
      };
    } catch (error) {
      this.log("error", "Task execution failed", error);
      throw error;
    }
  }

  /**
   * Generate logo concepts based on brand information
   */
  async generateLogo(brandInfo: BrandInfo, context: Context): Promise<Logo> {
    this.log("info", "Generating logo concept", { brand: brandInfo.name });

    // Analyze brand info to determine logo type
    const logoType = this.determineLogoType(brandInfo);

    // Generate logo description
    const description = this.createLogoDescription(brandInfo, logoType);

    // Create variations
    const variations = this.generateLogoVariations(logoType, brandInfo.style);

    return {
      type: logoType,
      description,
      variations,
      files: {
        // In production, these would be generated SVGs
        svg: `<!-- ${brandInfo.name} Logo -->`,
        png: `${brandInfo.name.toLowerCase().replace(/\s+/g, "-")}-logo.png`,
      },
    };
  }

  /**
   * Create a harmonious color palette
   */
  async createColorPalette(
    baseColor: string,
    style: BrandInfo["style"],
    context: Context,
  ): Promise<ColorPalette> {
    this.log("info", "Creating color palette", { baseColor, style });

    // Parse base color (assume hex format)
    const primary = this.normalizeColor(baseColor);

    // Generate complementary colors based on style
    const secondary = this.generateSecondaryColor(primary, style);
    const accent = this.generateAccentColor(primary, secondary, style);

    // Generate neutral palette
    const neutral = this.generateNeutralPalette(style);

    // Generate semantic colors
    const semantic = this.generateSemanticColors(style);

    // Calculate accessibility metrics
    const accessibility = this.checkAccessibility(primary, neutral);

    return {
      primary,
      secondary,
      accent,
      neutral,
      semantic,
      metadata: {
        harmony: this.determineHarmony(primary, secondary, accent),
        contrast: this.calculateContrast(primary, neutral.lightest),
        accessibility,
      },
    };
  }

  /**
   * Select appropriate typography for brand
   */
  async selectTypography(
    brandStyle: BrandInfo["style"],
    context: Context,
  ): Promise<Typography> {
    this.log("info", "Selecting typography", { style: brandStyle });

    const fontPairings = this.getFontPairings(brandStyle);

    return {
      headings: fontPairings.headings,
      body: fontPairings.body,
      scale: this.generateTypeScale(16, 1.25), // Base 16px, ratio 1.25 (Major Third)
      lineHeights: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75,
        loose: 2,
      },
    };
  }

  /**
   * Create complete brand identity package
   */
  async createBrandIdentity(
    brandInfo: BrandInfo,
    context: Context,
  ): Promise<any> {
    this.log("info", "Creating brand identity", { brand: brandInfo.name });

    const logo = await this.generateLogo(brandInfo, context);
    const colors = await this.createColorPalette(
      brandInfo.preferences?.colors?.[0] || "#3B82F6",
      brandInfo.style,
      context,
    );
    const typography = await this.selectTypography(brandInfo.style, context);

    return {
      brand: brandInfo,
      logo,
      colors,
      typography,
      guidelines: this.generateBrandGuidelines(
        brandInfo,
        logo,
        colors,
        typography,
      ),
    };
  }

  // Helper methods

  private determineLogoType(brandInfo: BrandInfo): Logo["type"] {
    const { style, industry } = brandInfo;

    if (style === "minimal" || style === "modern") {
      return "text";
    } else if (industry === "technology" || industry === "software") {
      return "icon";
    } else if (style === "classic" || style === "bold") {
      return "combination";
    }
    return "combination";
  }

  private createLogoDescription(
    brandInfo: BrandInfo,
    logoType: Logo["type"],
  ): string {
    const styleDescriptors = {
      modern: "clean, contemporary geometric shapes with subtle gradients",
      classic: "timeless, elegant serif typography with traditional elements",
      playful: "friendly, rounded shapes with vibrant personality",
      minimal: "simple, refined forms with maximum white space",
      bold: "strong, confident letterforms with high contrast",
    };

    return `A ${logoType} logo featuring ${styleDescriptors[brandInfo.style]} that represents ${brandInfo.values.join(", ")}. Designed for ${brandInfo.targetAudience} in the ${brandInfo.industry} industry.`;
  }

  private generateLogoVariations(
    logoType: Logo["type"],
    style: BrandInfo["style"],
  ): LogoVariation[] {
    return [
      {
        name: "Primary",
        description: "Full color logo for light backgrounds",
        usage: "Website headers, marketing materials, presentations",
        colorScheme: "color",
      },
      {
        name: "Monochrome",
        description: "Single color version for limited color applications",
        usage: "Print materials, embroidery, stamps",
        colorScheme: "monochrome",
      },
      {
        name: "Reverse",
        description: "Inverted colors for dark backgrounds",
        usage: "Dark mode websites, colored backgrounds",
        colorScheme: "reverse",
      },
    ];
  }

  private normalizeColor(color: string): string {
    // Simple hex color normalization
    if (color.startsWith("#")) {
      return color.toUpperCase();
    }
    return `#${color}`.toUpperCase();
  }

  private generateSecondaryColor(
    primary: string,
    style: BrandInfo["style"],
  ): string {
    // Simplified color generation - in production would use proper color theory
    const colorMap: Record<BrandInfo["style"], string> = {
      modern: "#6366F1",
      classic: "#8B5CF6",
      playful: "#EC4899",
      minimal: "#64748B",
      bold: "#EF4444",
    };
    return colorMap[style];
  }

  private generateAccentColor(
    primary: string,
    secondary: string,
    style: BrandInfo["style"],
  ): string {
    const accentMap: Record<BrandInfo["style"], string> = {
      modern: "#10B981",
      classic: "#F59E0B",
      playful: "#F97316",
      minimal: "#06B6D4",
      bold: "#FBBF24",
    };
    return accentMap[style];
  }

  private generateNeutralPalette(
    style: BrandInfo["style"],
  ): ColorPalette["neutral"] {
    // Tailwind-inspired neutral palette
    return {
      lightest: "#F8FAFC",
      light: "#E2E8F0",
      medium: "#94A3B8",
      dark: "#334155",
      darkest: "#0F172A",
    };
  }

  private generateSemanticColors(
    style: BrandInfo["style"],
  ): ColorPalette["semantic"] {
    return {
      success: "#10B981",
      warning: "#F59E0B",
      error: "#EF4444",
      info: "#3B82F6",
    };
  }

  private checkAccessibility(
    primary: string,
    neutral: ColorPalette["neutral"],
  ): ColorPalette["metadata"]["accessibility"] {
    // Simplified accessibility check - in production would calculate actual contrast ratios
    return {
      wcagLevel: "AA",
      contrastRatios: {
        "primary-on-light": 4.5,
        "primary-on-dark": 7.2,
        "text-on-background": 12.1,
      },
    };
  }

  private determineHarmony(
    primary: string,
    secondary: string,
    accent: string,
  ): ColorPalette["metadata"]["harmony"] {
    // Simplified - would analyze actual color relationships
    return "triadic";
  }

  private calculateContrast(
    color1: string,
    color2: string,
  ): ColorPalette["metadata"]["contrast"] {
    // Simplified - would calculate actual contrast ratio
    return "high";
  }

  private getFontPairings(style: BrandInfo["style"]): {
    headings: Typography["headings"];
    body: Typography["body"];
  } {
    const pairings = {
      modern: {
        headings: {
          family: "Inter",
          weights: [600, 700, 800],
          fallback: "system-ui, -apple-system, sans-serif",
          source: "google" as const,
        },
        body: {
          family: "Inter",
          weights: [400, 500],
          fallback: "system-ui, -apple-system, sans-serif",
          source: "google" as const,
        },
      },
      classic: {
        headings: {
          family: "Playfair Display",
          weights: [600, 700, 800],
          fallback: "Georgia, serif",
          source: "google" as const,
        },
        body: {
          family: "Source Sans Pro",
          weights: [400, 600],
          fallback: "sans-serif",
          source: "google" as const,
        },
      },
      playful: {
        headings: {
          family: "Poppins",
          weights: [600, 700, 800],
          fallback: "system-ui, sans-serif",
          source: "google" as const,
        },
        body: {
          family: "Poppins",
          weights: [400, 500],
          fallback: "system-ui, sans-serif",
          source: "google" as const,
        },
      },
      minimal: {
        headings: {
          family: "Outfit",
          weights: [500, 600, 700],
          fallback: "system-ui, sans-serif",
          source: "google" as const,
        },
        body: {
          family: "Outfit",
          weights: [300, 400],
          fallback: "system-ui, sans-serif",
          source: "google" as const,
        },
      },
      bold: {
        headings: {
          family: "Montserrat",
          weights: [700, 800, 900],
          fallback: "sans-serif",
          source: "google" as const,
        },
        body: {
          family: "Open Sans",
          weights: [400, 600],
          fallback: "sans-serif",
          source: "google" as const,
        },
      },
    };

    return pairings[style];
  }

  private generateTypeScale(
    baseSize: number,
    ratio: number,
  ): Typography["scale"] {
    return {
      base: baseSize,
      ratio,
      sizes: {
        xs: `${(baseSize / ratio / ratio).toFixed(2)}px`,
        sm: `${(baseSize / ratio).toFixed(2)}px`,
        base: `${baseSize}px`,
        lg: `${(baseSize * ratio).toFixed(2)}px`,
        xl: `${(baseSize * ratio * ratio).toFixed(2)}px`,
        "2xl": `${(baseSize * Math.pow(ratio, 3)).toFixed(2)}px`,
        "3xl": `${(baseSize * Math.pow(ratio, 4)).toFixed(2)}px`,
        "4xl": `${(baseSize * Math.pow(ratio, 5)).toFixed(2)}px`,
        "5xl": `${(baseSize * Math.pow(ratio, 6)).toFixed(2)}px`,
      },
    };
  }

  private generateBrandGuidelines(
    brandInfo: BrandInfo,
    logo: Logo,
    colors: ColorPalette,
    typography: Typography,
  ): any {
    return {
      logoUsage: {
        clearSpace:
          "Minimum clear space around logo should be equal to the height of the logo",
        minimumSize: "Logo should never appear smaller than 48px in width",
        doNots: [
          "Do not rotate or distort the logo",
          "Do not change the logo colors",
          "Do not add effects or shadows",
          "Do not place on busy backgrounds",
        ],
      },
      colorUsage: {
        primary: `Primary brand color. Use for main CTAs and key brand elements.`,
        secondary: `Secondary color. Use for supporting elements and variety.`,
        accent: `Accent color. Use sparingly for highlights and attention.`,
        backgrounds: `Use neutral colors for backgrounds. Maintain sufficient contrast.`,
      },
      typographyUsage: {
        headings: `${typography.headings.family} for all headings. Use weights ${typography.headings.weights.join(", ")} for hierarchy.`,
        body: `${typography.body.family} for body text. Use weight ${typography.body.weights[0]} for regular text.`,
        lineHeight: "Use 1.5 line-height for body text, 1.25 for headings.",
      },
    };
  }
}
