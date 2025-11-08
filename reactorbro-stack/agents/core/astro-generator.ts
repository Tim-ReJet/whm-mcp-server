/**
 * Astro Site Generator
 * Converts AI agent outputs into Astro components and pages
 *
 * This is the bridge between AI-generated designs/content and the Astro frontend
 */

import type { Layout, LayoutSection } from '../registry/design/layout-agent';
import type { Context } from './types';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface AstroComponentConfig {
  name: string;
  props?: Record<string, any>;
  imports?: string[];
  content: string;
  styles?: string;
  scripts?: string;
}

export interface AstroPageConfig {
  path: string;
  layout: string;
  title: string;
  description: string;
  components: AstroComponentConfig[];
  data?: Record<string, any>;
}

export interface SiteConfig {
  id: string;
  name: string;
  domain: {
    production: string;
    staging?: string;
  };
  wordpress?: {
    url: string;
    restApi: string;
  };
  theme: {
    primaryColor: string;
    fontFamily: string;
  };
  contact?: {
    email: string;
    phone: string;
  };
}

export class AstroGenerator {
  private outputDir: string;
  private siteConfig: SiteConfig;

  constructor(outputDir: string, siteConfig: SiteConfig) {
    this.outputDir = outputDir;
    this.siteConfig = siteConfig;
  }

  /**
   * Generate a complete Astro page from a Layout
   */
  async generatePage(
    pagePath: string,
    layout: Layout,
    content: Record<string, any>,
    context: Context
  ): Promise<string> {
    const pageConfig: AstroPageConfig = {
      path: pagePath,
      layout: 'MainLayout',
      title: content.title || this.siteConfig.name,
      description: content.description || '',
      components: this.layoutToComponents(layout, content),
      data: content,
    };

    const astroCode = this.generateAstroFile(pageConfig);
    const filePath = path.join(this.outputDir, 'src', 'pages', `${pagePath}.astro`);

    await this.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, astroCode, 'utf-8');

    return filePath;
  }

  /**
   * Generate a reusable Astro component
   */
  async generateComponent(
    componentName: string,
    config: AstroComponentConfig
  ): Promise<string> {
    const astroCode = this.generateComponentFile(config);
    const filePath = path.join(this.outputDir, 'src', 'components', `${componentName}.astro`);

    await this.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, astroCode, 'utf-8');

    return filePath;
  }

  /**
   * Convert Layout sections to Astro components
   */
  private layoutToComponents(layout: Layout, content: Record<string, any>): AstroComponentConfig[] {
    return layout.sections.map(section => this.sectionToComponent(section, content));
  }

  /**
   * Convert a LayoutSection to an Astro component
   */
  private sectionToComponent(section: LayoutSection, content: Record<string, any>): AstroComponentConfig {
    const tailwindClasses = this.generateTailwindClasses(section);
    const sectionContent = this.generateSectionContent(section, content);

    return {
      name: section.name,
      content: `
<section class="${tailwindClasses.section}">
  <div class="${tailwindClasses.container}">
    ${sectionContent}
  </div>
</section>
      `.trim(),
    };
  }

  /**
   * Generate Tailwind classes from layout configuration
   */
  private generateTailwindClasses(section: LayoutSection): Record<string, string> {
    const gridClasses = this.gridToTailwind(section.grid);
    const spacingClasses = this.spacingToTailwind(section.spacing);
    const bgClasses = this.backgroundToTailwind(section.background);

    return {
      section: `${spacingClasses} ${bgClasses} relative overflow-hidden`,
      container: `container-responsive ${gridClasses}`,
    };
  }

  /**
   * Convert grid config to Tailwind classes
   */
  private gridToTailwind(grid: LayoutSection['grid']): string {
    const classes: string[] = ['grid'];

    // Column classes
    if (grid.columns === 1) {
      classes.push('grid-cols-1');
    } else if (grid.columns === 2) {
      classes.push('grid-cols-1 md:grid-cols-2');
    } else if (grid.columns === 3) {
      classes.push('grid-cols-1 md:grid-cols-2 lg:grid-cols-3');
    } else if (grid.columns === 4) {
      classes.push('grid-cols-1 md:grid-cols-2 lg:grid-cols-4');
    }

    // Gap
    classes.push('gap-8 lg:gap-12');

    // Alignment
    classes.push('items-center');

    return classes.join(' ');
  }

  /**
   * Convert spacing config to Tailwind classes
   */
  private spacingToTailwind(spacing: LayoutSection['spacing']): string {
    const paddingMap: Record<string, string> = {
      '4rem': 'py-16',
      '5rem': 'py-20',
      '6rem': 'py-24',
      '8rem': 'py-32',
    };

    return paddingMap[spacing.paddingTop] || 'py-20';
  }

  /**
   * Convert background config to Tailwind classes
   */
  private backgroundToTailwind(background: LayoutSection['background']): string {
    if (background.type === 'color') {
      if (background.value === '#ffffff') return 'bg-white';
      if (background.value === '#f9fafb') return 'bg-neutral-50';
      if (background.value.includes('neutral')) return 'bg-neutral-900';
    }

    if (background.type === 'gradient') {
      return 'bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600';
    }

    return 'bg-white';
  }

  /**
   * Generate content for a section based on type
   */
  private generateSectionContent(section: LayoutSection, content: Record<string, any>): string {
    switch (section.type) {
      case 'hero':
        return this.generateHeroContent(content);
      case 'features':
        return this.generateFeaturesContent(content);
      case 'testimonials':
        return this.generateTestimonialsContent(content);
      case 'cta':
        return this.generateCTAContent(content);
      default:
        return this.generateGenericContent(content);
    }
  }

  /**
   * Generate hero section content
   */
  private generateHeroContent(content: Record<string, any>): string {
    return `
<div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[600px]">
  <div class="space-y-6 animate-fade-in">
    <h1 class="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-white">
      ${content.hero?.title || content.title || 'Welcome'}
    </h1>
    <p class="text-xl text-neutral-300 max-w-xl">
      ${content.hero?.subtitle || content.description || ''}
    </p>
    <div class="flex flex-wrap gap-4 pt-4">
      <a href="${content.hero?.primaryCta?.link || '/contact'}" class="btn btn-primary text-lg px-8 py-4">
        ${content.hero?.primaryCta?.text || 'Get Started'} →
      </a>
      <a href="${content.hero?.secondaryCta?.link || '/services'}" class="btn btn-secondary text-lg px-8 py-4">
        ${content.hero?.secondaryCta?.text || 'Learn More'}
      </a>
    </div>
  </div>

  <div class="relative hidden lg:block">
    ${content.hero?.image ? `
    <img
      src="${content.hero.image}"
      alt="${content.hero.imageAlt || 'Hero image'}"
      class="rounded-2xl shadow-2xl"
      width="800"
      height="600"
      loading="eager"
    />
    ` : `
    <div class="aspect-square bg-gradient-to-br from-primary-600 to-accent-500 rounded-2xl flex items-center justify-center text-white text-6xl font-bold">
      ${this.getInitials(this.siteConfig.name)}
    </div>
    `}
  </div>
</div>
    `.trim();
  }

  /**
   * Generate features section content
   */
  private generateFeaturesContent(content: Record<string, any>): string {
    const features = content.features || [];

    return `
<div class="text-center mb-16 max-w-3xl mx-auto">
  <h2 class="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
    ${content.featuresTitle || 'Our Services'}
  </h2>
  <p class="text-lg text-neutral-600">
    ${content.featuresDescription || 'Comprehensive solutions tailored to your needs'}
  </p>
</div>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
  ${features.map((feature: any, index: number) => `
  <div class="card group hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
    <div class="text-5xl mb-4 group-hover:scale-110 transition-transform">
      ${feature.icon || '🎯'}
    </div>
    <h3 class="text-xl font-semibold mb-3 text-neutral-900">
      ${feature.title}
    </h3>
    <p class="text-neutral-600 leading-relaxed mb-4">
      ${feature.description}
    </p>
    ${feature.link ? `
    <a href="${feature.link}" class="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-2 group-hover:gap-3 transition-all">
      Learn More
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
      </svg>
    </a>
    ` : ''}
  </div>
  `).join('\n')}
</div>
    `.trim();
  }

  /**
   * Generate testimonials section content
   */
  private generateTestimonialsContent(content: Record<string, any>): string {
    const testimonials = content.testimonials || [];

    return `
<div class="text-center mb-16">
  <h2 class="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
    ${content.testimonialsTitle || 'What Our Clients Say'}
  </h2>
</div>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
  ${testimonials.map((testimonial: any) => `
  <div class="card">
    <blockquote class="text-neutral-600 italic mb-4">
      "${testimonial.quote}"
    </blockquote>
    <div class="flex items-center gap-3">
      ${testimonial.avatar ? `
      <img src="${testimonial.avatar}" alt="${testimonial.name}" class="w-12 h-12 rounded-full" />
      ` : `
      <div class="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
        ${this.getInitials(testimonial.name)}
      </div>
      `}
      <div>
        <div class="font-semibold text-neutral-900">${testimonial.name}</div>
        <div class="text-sm text-neutral-600">${testimonial.role}</div>
      </div>
    </div>
  </div>
  `).join('\n')}
</div>
    `.trim();
  }

  /**
   * Generate CTA section content
   */
  private generateCTAContent(content: Record<string, any>): string {
    return `
<div class="max-w-4xl mx-auto text-center space-y-8 text-white">
  <h2 class="text-4xl md:text-5xl font-bold">
    ${content.cta?.title || 'Ready to Get Started?'}
  </h2>
  <p class="text-xl text-primary-100">
    ${content.cta?.description || 'Let\'s discuss how we can help you achieve your goals'}
  </p>
  <div class="flex flex-wrap gap-4 justify-center">
    <a href="${content.cta?.primaryLink || '/contact'}" class="btn bg-white text-primary-600 hover:bg-neutral-50 text-lg px-8 py-4">
      ${content.cta?.primaryText || 'Contact Us Today'}
    </a>
    ${this.siteConfig.contact?.phone ? `
    <a href="tel:${this.siteConfig.contact.phone.replace(/\s/g, '')}" class="btn btn-outline border-white text-white hover:bg-white hover:text-primary-600 text-lg px-8 py-4">
      📞 ${this.siteConfig.contact.phone}
    </a>
    ` : ''}
  </div>
</div>
    `.trim();
  }

  /**
   * Generate generic content section
   */
  private generateGenericContent(content: Record<string, any>): string {
    return `
<div class="prose prose-lg max-w-none">
  <h2>${content.title || 'Content Section'}</h2>
  <p>${content.body || content.description || ''}</p>
</div>
    `.trim();
  }

  /**
   * Generate complete Astro file
   */
  private generateAstroFile(config: AstroPageConfig): string {
    const imports = this.generateImports(config);
    const frontmatter = this.generateFrontmatter(config);
    const layout = this.generateLayout(config);

    return `---
${imports}
${frontmatter}
---

${layout}
`.trim();
  }

  /**
   * Generate imports section
   */
  private generateImports(config: AstroPageConfig): string {
    return `import ${config.layout} from '../layouts/${config.layout}.astro';`;
  }

  /**
   * Generate frontmatter
   */
  private generateFrontmatter(config: AstroPageConfig): string {
    let code = '';

    // WordPress data fetching if configured
    if (this.siteConfig.wordpress) {
      code += `
// Fetch content from WordPress REST API
const WP_URL = '${this.siteConfig.wordpress.url}';
let content = ${JSON.stringify(config.data || {}, null, 2)};

try {
  const response = await fetch(\`\${WP_URL}/wp-json/wp/v2/pages?slug=${config.path}\`);
  const data = await response.json();
  if (data.length > 0) {
    content = {
      ...content,
      title: data[0].title.rendered || content.title,
      description: data[0].excerpt.rendered.replace(/<[^>]*>/g, '') || content.description,
    };
  }
} catch (error) {
  console.error('Error fetching WordPress content:', error);
}
      `.trim();
    } else {
      code += `const content = ${JSON.stringify(config.data || {}, null, 2)};`;
    }

    return code;
  }

  /**
   * Generate layout wrapper
   */
  private generateLayout(config: AstroPageConfig): string {
    const sections = config.components.map(comp => comp.content).join('\n\n');

    return `
<${config.layout} title={content.title || "${config.title}"} description={content.description || "${config.description}"}>
  ${sections}
</${config.layout}>
    `.trim();
  }

  /**
   * Generate component file
   */
  private generateComponentFile(config: AstroComponentConfig): string {
    const imports = (config.imports || []).join('\n');
    const props = config.props ? `
interface Props {
${Object.entries(config.props).map(([key, type]) => `  ${key}: ${type};`).join('\n')}
}

const props = Astro.props;
    `.trim() : '';

    return `---
${imports}
${props}
---

${config.content}

${config.styles ? `<style>${config.styles}</style>` : ''}
${config.scripts ? `<script>${config.scripts}</script>` : ''}
    `.trim();
  }

  /**
   * Ensure directory exists
   */
  private async ensureDir(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      // Directory already exists
    }
  }

  /**
   * Get initials from name
   */
  private getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  /**
   * Generate a complete site from scratch
   */
  async generateSite(
    pages: Array<{ path: string; layout: Layout; content: Record<string, any> }>,
    context: Context
  ): Promise<string[]> {
    const generatedFiles: string[] = [];

    for (const page of pages) {
      const filePath = await this.generatePage(page.path, page.layout, page.content, context);
      generatedFiles.push(filePath);
    }

    return generatedFiles;
  }

  /**
   * Update site configuration
   */
  async updateSiteConfig(updates: Partial<SiteConfig>): Promise<void> {
    this.siteConfig = { ...this.siteConfig, ...updates };
  }
}

/**
 * Utility function to create an AstroGenerator instance
 */
export function createAstroGenerator(
  outputDir: string,
  siteConfig: SiteConfig
): AstroGenerator {
  return new AstroGenerator(outputDir, siteConfig);
}

/**
 * Helper to convert CSS values to Tailwind classes
 */
export function cssToTailwind(property: string, value: string): string {
  const mappings: Record<string, Record<string, string>> = {
    padding: {
      '1rem': 'p-4',
      '2rem': 'p-8',
      '3rem': 'p-12',
      '4rem': 'p-16',
    },
    margin: {
      '1rem': 'm-4',
      '2rem': 'm-8',
      '3rem': 'm-12',
      '4rem': 'm-16',
    },
    fontSize: {
      '1rem': 'text-base',
      '1.25rem': 'text-xl',
      '1.5rem': 'text-2xl',
      '2rem': 'text-3xl',
      '3rem': 'text-5xl',
    },
  };

  return mappings[property]?.[value] || '';
}
