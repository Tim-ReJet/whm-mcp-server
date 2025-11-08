/**
 * Layout Agent
 * Handles page layout design, grid systems, and responsive design
 */

import { AgentBase } from '../../core/agent-base';
import type { Task, TaskResult, Context } from '../../core/types';

export interface Layout {
  type: 'landing' | 'blog' | 'product' | 'about' | 'contact' | 'custom';
  structure: LayoutStructure;
  grid: GridSystem;
  sections: LayoutSection[];
  responsive: ResponsiveConfig;
  metadata: {
    purpose: string;
    targetDevices: string[];
    accessibility: AccessibilityFeatures;
  };
}

export interface LayoutStructure {
  header: HeaderConfig;
  main: MainConfig;
  footer: FooterConfig;
  sidebar?: SidebarConfig;
}

export interface HeaderConfig {
  type: 'fixed' | 'sticky' | 'static';
  height: string;
  layout: 'centered' | 'spread' | 'left-aligned';
  elements: string[];
}

export interface MainConfig {
  maxWidth: string;
  padding: string;
  centered: boolean;
}

export interface FooterConfig {
  type: 'minimal' | 'comprehensive' | 'sticky';
  columns: number;
  elements: string[];
}

export interface SidebarConfig {
  position: 'left' | 'right';
  width: string;
  sticky: boolean;
}

export interface GridSystem {
  type: '12-column' | '16-column' | 'css-grid' | 'flexbox';
  columns: number;
  gap: string;
  breakpoints: Breakpoint[];
  container: {
    maxWidth: string;
    padding: string;
  };
}

export interface Breakpoint {
  name: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  minWidth: number;
  columns?: number;
  gap?: string;
}

export interface LayoutSection {
  id: string;
  name: string;
  type: 'hero' | 'features' | 'testimonials' | 'cta' | 'content' | 'gallery' | 'form' | 'custom';
  grid: {
    columns: number;
    rows?: number;
    areas?: string[];
  };
  spacing: {
    paddingTop: string;
    paddingBottom: string;
  };
  background: {
    type: 'color' | 'gradient' | 'image' | 'pattern';
    value: string;
  };
  elements: SectionElement[];
}

export interface SectionElement {
  type: string;
  position: {
    column: string;
    row?: string;
  };
  alignment: 'left' | 'center' | 'right';
  width: string;
}

export interface ResponsiveConfig {
  strategy: 'mobile-first' | 'desktop-first';
  breakpoints: Breakpoint[];
  adaptations: {
    [breakpoint: string]: LayoutAdaptation;
  };
}

export interface LayoutAdaptation {
  stackSections: boolean;
  hideElements?: string[];
  showElements?: string[];
  columnChanges?: Record<string, number>;
}

export interface AccessibilityFeatures {
  skipLinks: boolean;
  landmarkRoles: boolean;
  focusManagement: boolean;
  keyboardNavigation: boolean;
}

export interface GridRequirements {
  pageType: string;
  contentComplexity: 'simple' | 'moderate' | 'complex';
  deviceTargets: string[];
  designStyle: 'modern' | 'classic' | 'minimal' | 'bold';
}

export class LayoutAgent extends AgentBase {
  constructor() {
    super({
      id: 'layout-agent',
      name: 'Layout Agent',
      description: 'Designs page layouts, grid systems, and responsive structures',
      version: '1.0.0',
      category: 'design',
      capabilities: [
        'page_layout',
        'grid_system',
        'responsive_design',
        'section_composition',
        'layout_optimization',
      ],
      skills: [
        'grid-design',
        'responsive-breakpoints',
        'visual-hierarchy',
        'white-space-optimization',
        'accessibility-layout',
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
    this.log('info', `Executing layout task: ${task.type}`, { taskId: task.id });

    try {
      let result: any;

      switch (task.type) {
        case 'page_layout':
          result = await this.designPage(task.parameters.pageType, task.parameters.requirements, context);
          break;
        case 'grid_system':
          result = await this.createGrid(task.parameters.requirements, context);
          break;
        case 'responsive_design':
          result = await this.createResponsiveLayout(task.parameters.layout, context);
          break;
        case 'layout_optimization':
          result = await this.optimizeLayout(task.parameters.layout, context);
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
      this.log('error', 'Task execution failed', error);
      throw error;
    }
  }

  /**
   * Design a complete page layout
   */
  async designPage(
    pageType: Layout['type'],
    requirements: any,
    context: Context
  ): Promise<Layout> {
    this.log('info', 'Designing page layout', { pageType });

    const structure = this.createLayoutStructure(pageType);
    const grid = await this.createGrid({ pageType, ...requirements }, context);
    const sections = this.createSections(pageType);
    const responsive = this.createResponsiveConfig(grid);

    return {
      type: pageType,
      structure,
      grid,
      sections,
      responsive,
      metadata: {
        purpose: this.getPagePurpose(pageType),
        targetDevices: ['mobile', 'tablet', 'desktop'],
        accessibility: this.createAccessibilityFeatures(),
      },
    };
  }

  /**
   * Create a grid system
   */
  async createGrid(requirements: GridRequirements, context: Context): Promise<GridSystem> {
    this.log('info', 'Creating grid system', requirements);

    const columns = this.determineColumnCount(requirements);
    const breakpoints = this.createBreakpoints(requirements);

    return {
      type: this.determineGridType(requirements),
      columns,
      gap: this.calculateGap(requirements.designStyle),
      breakpoints,
      container: {
        maxWidth: this.determineMaxWidth(requirements.pageType),
        padding: this.calculateContainerPadding(),
      },
    };
  }

  /**
   * Create responsive layout configuration
   */
  async createResponsiveLayout(baseLayout: Layout, context: Context): Promise<ResponsiveConfig> {
    this.log('info', 'Creating responsive configuration');

    const breakpoints = this.createBreakpoints({
      pageType: baseLayout.type,
      contentComplexity: 'moderate',
      deviceTargets: ['mobile', 'tablet', 'desktop'],
      designStyle: 'modern',
    });

    const adaptations = this.generateAdaptations(baseLayout, breakpoints);

    return {
      strategy: 'mobile-first',
      breakpoints,
      adaptations,
    };
  }

  /**
   * Optimize an existing layout
   */
  async optimizeLayout(layout: Layout, context: Context): Promise<Layout> {
    this.log('info', 'Optimizing layout');

    // Optimize spacing
    layout.sections = layout.sections.map(section => ({
      ...section,
      spacing: this.optimizeSpacing(section),
    }));

    // Optimize grid
    layout.grid = this.optimizeGrid(layout.grid);

    // Improve accessibility
    layout.metadata.accessibility = this.enhanceAccessibility(layout.metadata.accessibility);

    return layout;
  }

  // Helper methods

  private createLayoutStructure(pageType: Layout['type']): LayoutStructure {
    const baseStructure: LayoutStructure = {
      header: {
        type: pageType === 'landing' ? 'sticky' : 'static',
        height: '72px',
        layout: 'spread',
        elements: ['logo', 'navigation', 'cta'],
      },
      main: {
        maxWidth: '1280px',
        padding: '0 1rem',
        centered: true,
      },
      footer: {
        type: 'comprehensive',
        columns: 4,
        elements: ['branding', 'navigation', 'social', 'legal'],
      },
    };

    // Customize based on page type
    if (pageType === 'blog') {
      baseStructure.sidebar = {
        position: 'right',
        width: '300px',
        sticky: true,
      };
    }

    return baseStructure;
  }

  private createSections(pageType: Layout['type']): LayoutSection[] {
    const sectionTemplates: Record<Layout['type'], LayoutSection[]> = {
      landing: [
        this.createHeroSection(),
        this.createFeaturesSection(),
        this.createTestimonialsSection(),
        this.createCTASection(),
      ],
      blog: [
        this.createContentSection(),
      ],
      product: [
        this.createHeroSection(),
        this.createFeaturesSection(),
        this.createCTASection(),
      ],
      about: [
        this.createHeroSection(),
        this.createContentSection(),
      ],
      contact: [
        this.createFormSection(),
      ],
      custom: [],
    };

    return sectionTemplates[pageType] || [];
  }

  private createHeroSection(): LayoutSection {
    return {
      id: 'hero',
      name: 'Hero Section',
      type: 'hero',
      grid: {
        columns: 2,
        areas: ['content', 'visual'],
      },
      spacing: {
        paddingTop: '6rem',
        paddingBottom: '6rem',
      },
      background: {
        type: 'gradient',
        value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      },
      elements: [
        {
          type: 'heading',
          position: { column: '1', row: '1' },
          alignment: 'left',
          width: '100%',
        },
        {
          type: 'description',
          position: { column: '1', row: '2' },
          alignment: 'left',
          width: '100%',
        },
        {
          type: 'cta-group',
          position: { column: '1', row: '3' },
          alignment: 'left',
          width: 'auto',
        },
        {
          type: 'image',
          position: { column: '2' },
          alignment: 'center',
          width: '100%',
        },
      ],
    };
  }

  private createFeaturesSection(): LayoutSection {
    return {
      id: 'features',
      name: 'Features Section',
      type: 'features',
      grid: {
        columns: 3,
        rows: 2,
      },
      spacing: {
        paddingTop: '5rem',
        paddingBottom: '5rem',
      },
      background: {
        type: 'color',
        value: '#ffffff',
      },
      elements: [],
    };
  }

  private createTestimonialsSection(): LayoutSection {
    return {
      id: 'testimonials',
      name: 'Testimonials Section',
      type: 'testimonials',
      grid: {
        columns: 3,
      },
      spacing: {
        paddingTop: '5rem',
        paddingBottom: '5rem',
      },
      background: {
        type: 'color',
        value: '#f9fafb',
      },
      elements: [],
    };
  }

  private createCTASection(): LayoutSection {
    return {
      id: 'cta',
      name: 'Call to Action Section',
      type: 'cta',
      grid: {
        columns: 1,
      },
      spacing: {
        paddingTop: '6rem',
        paddingBottom: '6rem',
      },
      background: {
        type: 'gradient',
        value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      },
      elements: [
        {
          type: 'heading',
          position: { column: '1' },
          alignment: 'center',
          width: '100%',
        },
        {
          type: 'button',
          position: { column: '1' },
          alignment: 'center',
          width: 'auto',
        },
      ],
    };
  }

  private createContentSection(): LayoutSection {
    return {
      id: 'content',
      name: 'Content Section',
      type: 'content',
      grid: {
        columns: 1,
      },
      spacing: {
        paddingTop: '4rem',
        paddingBottom: '4rem',
      },
      background: {
        type: 'color',
        value: '#ffffff',
      },
      elements: [],
    };
  }

  private createFormSection(): LayoutSection {
    return {
      id: 'contact-form',
      name: 'Contact Form Section',
      type: 'form',
      grid: {
        columns: 2,
        areas: ['form', 'info'],
      },
      spacing: {
        paddingTop: '4rem',
        paddingBottom: '4rem',
      },
      background: {
        type: 'color',
        value: '#ffffff',
      },
      elements: [],
    };
  }

  private determineGridType(requirements: GridRequirements): GridSystem['type'] {
    if (requirements.designStyle === 'modern') {
      return 'css-grid';
    } else if (requirements.contentComplexity === 'complex') {
      return '16-column';
    }
    return '12-column';
  }

  private determineColumnCount(requirements: GridRequirements): number {
    const complexityMap = {
      simple: 12,
      moderate: 12,
      complex: 16,
    };
    return complexityMap[requirements.contentComplexity];
  }

  private createBreakpoints(requirements: GridRequirements): Breakpoint[] {
    return [
      { name: 'xs', minWidth: 0, columns: 4, gap: '1rem' },
      { name: 'sm', minWidth: 640, columns: 6, gap: '1.5rem' },
      { name: 'md', minWidth: 768, columns: 8, gap: '2rem' },
      { name: 'lg', minWidth: 1024, columns: 12, gap: '2rem' },
      { name: 'xl', minWidth: 1280, columns: 12, gap: '2.5rem' },
      { name: '2xl', minWidth: 1536, columns: 12, gap: '3rem' },
    ];
  }

  private calculateGap(designStyle: GridRequirements['designStyle']): string {
    const gapMap = {
      modern: '2rem',
      classic: '1.5rem',
      minimal: '3rem',
      bold: '2.5rem',
    };
    return gapMap[designStyle];
  }

  private determineMaxWidth(pageType: string): string {
    const widthMap: Record<string, string> = {
      landing: '1280px',
      blog: '1024px',
      product: '1280px',
      about: '1024px',
      contact: '768px',
    };
    return widthMap[pageType] || '1280px';
  }

  private calculateContainerPadding(): string {
    return 'clamp(1rem, 5vw, 3rem)';
  }

  private createResponsiveConfig(grid: GridSystem): ResponsiveConfig {
    return {
      strategy: 'mobile-first',
      breakpoints: grid.breakpoints,
      adaptations: {
        xs: {
          stackSections: true,
          columnChanges: { '2-col': 1, '3-col': 1, '4-col': 1 },
        },
        sm: {
          stackSections: false,
          columnChanges: { '3-col': 2, '4-col': 2 },
        },
        md: {
          stackSections: false,
          columnChanges: { '4-col': 2 },
        },
        lg: {
          stackSections: false,
          columnChanges: {},
        },
      },
    };
  }

  private generateAdaptations(
    layout: Layout,
    breakpoints: Breakpoint[]
  ): ResponsiveConfig['adaptations'] {
    const adaptations: ResponsiveConfig['adaptations'] = {};

    for (const breakpoint of breakpoints) {
      adaptations[breakpoint.name] = {
        stackSections: breakpoint.name === 'xs' || breakpoint.name === 'sm',
        hideElements: breakpoint.name === 'xs' ? ['sidebar', 'decorative'] : undefined,
      };
    }

    return adaptations;
  }

  private optimizeSpacing(section: LayoutSection): LayoutSection['spacing'] {
    // Apply consistent rhythm
    return {
      paddingTop: section.type === 'hero' ? '6rem' : '5rem',
      paddingBottom: section.type === 'hero' ? '6rem' : '5rem',
    };
  }

  private optimizeGrid(grid: GridSystem): GridSystem {
    // Optimize gap for better visual rhythm
    const baseGap = parseFloat(grid.gap);
    return {
      ...grid,
      gap: `${baseGap}rem`,
    };
  }

  private enhanceAccessibility(features: AccessibilityFeatures): AccessibilityFeatures {
    return {
      skipLinks: true,
      landmarkRoles: true,
      focusManagement: true,
      keyboardNavigation: true,
    };
  }

  private createAccessibilityFeatures(): AccessibilityFeatures {
    return {
      skipLinks: true,
      landmarkRoles: true,
      focusManagement: true,
      keyboardNavigation: true,
    };
  }

  private getPagePurpose(pageType: Layout['type']): string {
    const purposes: Record<Layout['type'], string> = {
      landing: 'Convert visitors into customers with compelling hero and clear CTAs',
      blog: 'Present content in a readable, engaging format with easy navigation',
      product: 'Showcase product features and benefits to drive purchases',
      about: 'Tell the brand story and build trust with visitors',
      contact: 'Make it easy for visitors to get in touch',
      custom: 'Custom layout for specific requirements',
    };
    return purposes[pageType];
  }
}
