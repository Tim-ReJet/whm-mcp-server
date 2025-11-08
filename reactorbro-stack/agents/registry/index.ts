/**
 * Agent Registry Index
 * Exports all available agents for easy import and use
 */

// Design Agents
import { GraphicDesignAgent } from "./design/graphic-design-agent.js";
import { LayoutAgent } from "./design/layout-agent.js";
import { AnimationAgent } from "./design/animation-agent.js";

// Content Agents
import { ContentGenerationAgent } from "./content/content-generation-agent.js";
import { SEOOptimizationAgent } from "./content/seo-optimization-agent.js";

// Re-export agents
export {
  GraphicDesignAgent,
  LayoutAgent,
  AnimationAgent,
  ContentGenerationAgent,
  SEOOptimizationAgent,
};

// Re-export types for convenience
export type {
  BrandInfo,
  Logo,
  ColorPalette,
  Typography,
} from "./design/graphic-design-agent.js";

export type {
  Layout,
  LayoutStructure,
  GridSystem,
  LayoutSection,
  ResponsiveConfig,
  GridRequirements,
} from "./design/layout-agent.js";

export type {
  ContentRequest,
  GeneratedContent,
  BlogPost,
  CallToAction,
  BrandVoice,
  ContentBlock,
  CopyOptions,
} from "./content/content-generation-agent.js";

export type {
  SEOAnalysis,
  KeywordResearch,
  OptimizedContent,
  MetaTags,
  SEOIssue,
  SEORecommendation,
  KeywordAnalysis,
  MetaTagAnalysis,
} from "./content/seo-optimization-agent.js";

export type {
  AnimationConfig,
  AnimationPreset,
  AnimationResult,
} from "./design/animation-agent.js";

/**
 * Agent Registry
 * Central registry for all available agents
 */
export const AgentRegistry = {
  design: {
    GraphicDesignAgent,
    LayoutAgent,
    AnimationAgent,
  },
  content: {
    ContentGenerationAgent,
    SEOOptimizationAgent,
  },
} as const;

/**
 * Get agent by ID
 */
export function getAgentById(id: string) {
  const agents = [
    new GraphicDesignAgent(),
    new LayoutAgent(),
    new AnimationAgent(),
    new ContentGenerationAgent(),
    new SEOOptimizationAgent(),
  ];

  return agents.find((agent) => agent.id === id);
}

/**
 * Get all agents by category
 */
export function getAgentsByCategory(
  category: "design" | "content" | "planning" | "optimization" | "analysis",
) {
  const agents = [
    new GraphicDesignAgent(),
    new LayoutAgent(),
    new AnimationAgent(),
    new ContentGenerationAgent(),
    new SEOOptimizationAgent(),
  ];

  return agents.filter((agent) => agent.category === category);
}

/**
 * Get agent info for all registered agents
 */
export function getAllAgentInfo() {
  return [
    new GraphicDesignAgent().getInfo(),
    new LayoutAgent().getInfo(),
    new AnimationAgent().getInfo(),
    new ContentGenerationAgent().getInfo(),
    new SEOOptimizationAgent().getInfo(),
  ];
}
