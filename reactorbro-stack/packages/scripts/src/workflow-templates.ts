/**
 * Workflow Templates Library
 * Pre-built workflow templates for common use cases
 */

import type { Workflow } from '../../agents/core/types.js';

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  workflow: Workflow;
  estimatedDuration: number;
  estimatedTokens: number;
}

export class WorkflowTemplates {
  private templates: Map<string, WorkflowTemplate> = new Map();

  constructor() {
    this.loadDefaultTemplates();
  }

  /**
   * Load default workflow templates
   */
  private loadDefaultTemplates(): void {
    // Page Design Template
    this.templates.set('page-design', {
      id: 'page-design',
      name: 'Page Design Workflow',
      description: 'Complete page design workflow from concept to implementation',
      category: 'design',
      tags: ['design', 'page', 'layout', 'content'],
      workflow: {
        id: 'page-design-workflow',
        name: 'Page Design Workflow',
        description: 'Complete page design workflow',
        version: '1.0.0',
        steps: [
          {
            id: 'brand-identity',
            name: 'Brand Identity',
            agent: 'graphic-design-agent',
            task: {
              id: 'task-brand',
              type: 'custom',
              title: 'Create Brand Identity',
              description: 'Generate brand identity including colors and typography',
              parameters: {},
              context: {} as any,
              priority: 'high',
              dependencies: [],
              status: 'pending',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            dependsOn: [],
            parallel: false,
            optional: false,
            retryPolicy: {
              maxAttempts: 3,
              delay: 1000,
              backoff: 'exponential',
            },
          },
          {
            id: 'layout-design',
            name: 'Layout Design',
            agent: 'layout-agent',
            task: {
              id: 'task-layout',
              type: 'custom',
              title: 'Design Page Layout',
              description: 'Create responsive page layout',
              parameters: {},
              context: {} as any,
              priority: 'high',
              dependencies: [],
              status: 'pending',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            dependsOn: ['brand-identity'],
            parallel: false,
            optional: false,
            retryPolicy: {
              maxAttempts: 3,
              delay: 1000,
              backoff: 'exponential',
            },
          },
          {
            id: 'content-generation',
            name: 'Content Generation',
            agent: 'content-generation-agent',
            task: {
              id: 'task-content',
              type: 'custom',
              title: 'Generate Content',
              description: 'Generate page content',
              parameters: {},
              context: {} as any,
              priority: 'medium',
              dependencies: [],
              status: 'pending',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            dependsOn: ['layout-design'],
            parallel: false,
            optional: false,
            retryPolicy: {
              maxAttempts: 3,
              delay: 1000,
              backoff: 'exponential',
            },
            timeout: 300000, // 5 minutes
          },
        ],
        config: {
          maxConcurrent: 3,
          failFast: false,
          saveState: true,
          notifications: false,
        },
        status: 'draft',
      },
      estimatedDuration: 360000, // 6 minutes
      estimatedTokens: 15000,
    });

    // SEO Optimization Template
    this.templates.set('seo-optimization', {
      id: 'seo-optimization',
      name: 'SEO Optimization Workflow',
      description: 'Complete SEO optimization workflow',
      category: 'seo',
      tags: ['seo', 'optimization', 'content'],
      workflow: {
        id: 'seo-optimization-workflow',
        name: 'SEO Optimization Workflow',
        description: 'Complete SEO optimization workflow',
        version: '1.0.0',
        steps: [
          {
            id: 'keyword-research',
            name: 'Keyword Research',
            agent: 'seo-optimization-agent',
            task: {
              id: 'task-keywords',
              type: 'custom',
              title: 'Research Keywords',
              description: 'Research and analyze keywords',
              parameters: {},
              context: {} as any,
              priority: 'high',
              dependencies: [],
              status: 'pending',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            dependsOn: [],
            parallel: false,
            optional: false,
            retryPolicy: {
              maxAttempts: 3,
              delay: 1000,
              backoff: 'exponential',
            },
          },
          {
            id: 'content-optimization',
            name: 'Content Optimization',
            agent: 'seo-optimization-agent',
            task: {
              id: 'task-optimize',
              type: 'custom',
              title: 'Optimize Content',
              description: 'Optimize content for SEO',
              parameters: {},
              context: {} as any,
              priority: 'high',
              dependencies: [],
              status: 'pending',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            dependsOn: ['keyword-research'],
            parallel: false,
            optional: false,
            retryPolicy: {
              maxAttempts: 3,
              delay: 1000,
              backoff: 'exponential',
            },
            timeout: 300000, // 5 minutes
          },
        ],
        config: {
          maxConcurrent: 2,
          failFast: false,
          saveState: true,
          notifications: false,
        },
        status: 'draft',
      },
      estimatedDuration: 240000, // 4 minutes
      estimatedTokens: 10000,
    });

    // Landing Page Creation Template
    this.templates.set('landing-page', {
      id: 'landing-page',
      name: 'Landing Page Creation',
      description: 'Complete landing page workflow with hero, features, testimonials, and CTA',
      category: 'design',
      tags: ['landing', 'page', 'conversion', 'marketing'],
      workflow: {
        id: 'landing-page-workflow',
        name: 'Landing Page Creation',
        description: 'Create a high-converting landing page',
        version: '1.0.0',
        steps: [
          {
            id: 'hero-section',
            name: 'Hero Section Design',
            agent: 'graphic-design-agent',
            task: {
              id: 'task-hero',
              type: 'custom',
              title: 'Design Hero Section',
              description: 'Create compelling hero section with headline and CTA',
              parameters: {},
              context: {} as any,
              priority: 'high',
              dependencies: [],
              status: 'pending',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            dependsOn: [],
            parallel: false,
            optional: false,
            retryPolicy: {
              maxAttempts: 3,
              delay: 1000,
              backoff: 'exponential',
            },
            timeout: 300000,
          },
          {
            id: 'features-section',
            name: 'Features Section',
            agent: 'content-generation-agent',
            task: {
              id: 'task-features',
              type: 'custom',
              title: 'Generate Features Content',
              description: 'Create feature descriptions and benefits',
              parameters: {},
              context: {} as any,
              priority: 'high',
              dependencies: [],
              status: 'pending',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            dependsOn: ['hero-section'],
            parallel: false,
            optional: false,
            retryPolicy: {
              maxAttempts: 3,
              delay: 1000,
              backoff: 'exponential',
            },
            timeout: 300000,
          },
          {
            id: 'testimonials',
            name: 'Testimonials Section',
            agent: 'content-generation-agent',
            task: {
              id: 'task-testimonials',
              type: 'custom',
              title: 'Generate Testimonials',
              description: 'Create social proof testimonials',
              parameters: {},
              context: {} as any,
              priority: 'medium',
              dependencies: [],
              status: 'pending',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            dependsOn: ['features-section'],
            parallel: false,
            optional: true,
            retryPolicy: {
              maxAttempts: 2,
              delay: 1000,
              backoff: 'linear',
            },
            timeout: 180000,
          },
          {
            id: 'cta-optimization',
            name: 'CTA Optimization',
            agent: 'seo-optimization-agent',
            task: {
              id: 'task-cta',
              type: 'custom',
              title: 'Optimize CTAs',
              description: 'Optimize call-to-action buttons for conversion',
              parameters: {},
              context: {} as any,
              priority: 'high',
              dependencies: [],
              status: 'pending',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            dependsOn: ['features-section'],
            parallel: true,
            optional: false,
            retryPolicy: {
              maxAttempts: 3,
              delay: 1000,
              backoff: 'exponential',
            },
            timeout: 180000,
          },
        ],
        config: {
          maxConcurrent: 2,
          failFast: false,
          saveState: true,
          notifications: false,
        },
        status: 'draft',
      },
      estimatedDuration: 480000, // 8 minutes
      estimatedTokens: 20000,
    });

    // Blog Post Generation Template
    this.templates.set('blog-post', {
      id: 'blog-post',
      name: 'Blog Post Generation',
      description: 'Complete blog post workflow from research to publication',
      category: 'content',
      tags: ['blog', 'content', 'seo', 'writing'],
      workflow: {
        id: 'blog-post-workflow',
        name: 'Blog Post Generation',
        description: 'Generate a complete blog post',
        version: '1.0.0',
        steps: [
          {
            id: 'topic-research',
            name: 'Topic Research',
            agent: 'research-agent',
            task: {
              id: 'task-research',
              type: 'custom',
              title: 'Research Topic',
              description: 'Research and gather information on the topic',
              parameters: {},
              context: {} as any,
              priority: 'high',
              dependencies: [],
              status: 'pending',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            dependsOn: [],
            parallel: false,
            optional: false,
            retryPolicy: {
              maxAttempts: 3,
              delay: 1000,
              backoff: 'exponential',
            },
            timeout: 300000,
          },
          {
            id: 'outline-creation',
            name: 'Create Outline',
            agent: 'content-generation-agent',
            task: {
              id: 'task-outline',
              type: 'custom',
              title: 'Create Blog Outline',
              description: 'Generate structured outline for the blog post',
              parameters: {},
              context: {} as any,
              priority: 'high',
              dependencies: [],
              status: 'pending',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            dependsOn: ['topic-research'],
            parallel: false,
            optional: false,
            retryPolicy: {
              maxAttempts: 3,
              delay: 1000,
              backoff: 'exponential',
            },
            timeout: 180000,
          },
          {
            id: 'content-writing',
            name: 'Write Content',
            agent: 'content-generation-agent',
            task: {
              id: 'task-write',
              type: 'custom',
              title: 'Write Blog Post',
              description: 'Write the full blog post content',
              parameters: {},
              context: {} as any,
              priority: 'high',
              dependencies: [],
              status: 'pending',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            dependsOn: ['outline-creation'],
            parallel: false,
            optional: false,
            retryPolicy: {
              maxAttempts: 3,
              delay: 1000,
              backoff: 'exponential',
            },
            timeout: 600000,
          },
          {
            id: 'seo-optimization',
            name: 'SEO Optimization',
            agent: 'seo-optimization-agent',
            task: {
              id: 'task-seo',
              type: 'custom',
              title: 'Optimize for SEO',
              description: 'Optimize blog post for search engines',
              parameters: {},
              context: {} as any,
              priority: 'medium',
              dependencies: [],
              status: 'pending',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            dependsOn: ['content-writing'],
            parallel: false,
            optional: false,
            retryPolicy: {
              maxAttempts: 2,
              delay: 1000,
              backoff: 'linear',
            },
            timeout: 240000,
          },
        ],
        config: {
          maxConcurrent: 2,
          failFast: false,
          saveState: true,
          notifications: false,
        },
        status: 'draft',
      },
      estimatedDuration: 1320000, // 22 minutes
      estimatedTokens: 30000,
    });

    // Full Site Build Template
    this.templates.set('full-site-build', {
      id: 'full-site-build',
      name: 'Full Site Build',
      description: 'Complete site building workflow from planning to deployment',
      category: 'development',
      tags: ['site', 'build', 'full', 'deployment'],
      workflow: {
        id: 'full-site-build-workflow',
        name: 'Full Site Build',
        description: 'Build a complete website from scratch',
        version: '1.0.0',
        steps: [
          {
            id: 'planning',
            name: 'Site Planning',
            agent: 'planning-agent',
            task: {
              id: 'task-plan',
              type: 'custom',
              title: 'Plan Site Structure',
              description: 'Create site architecture and plan',
              parameters: {},
              context: {} as any,
              priority: 'high',
              dependencies: [],
              status: 'pending',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            dependsOn: [],
            parallel: false,
            optional: false,
            retryPolicy: {
              maxAttempts: 3,
              delay: 1000,
              backoff: 'exponential',
            },
            timeout: 300000,
          },
          {
            id: 'brand-design',
            name: 'Brand Design',
            agent: 'graphic-design-agent',
            task: {
              id: 'task-brand',
              type: 'custom',
              title: 'Design Brand Identity',
              description: 'Create brand colors, typography, and logo',
              parameters: {},
              context: {} as any,
              priority: 'high',
              dependencies: [],
              status: 'pending',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            dependsOn: ['planning'],
            parallel: false,
            optional: false,
            retryPolicy: {
              maxAttempts: 3,
              delay: 1000,
              backoff: 'exponential',
            },
            timeout: 300000,
          },
          {
            id: 'page-design',
            name: 'Page Design',
            agent: 'layout-agent',
            task: {
              id: 'task-pages',
              type: 'custom',
              title: 'Design Pages',
              description: 'Design all site pages',
              parameters: {},
              context: {} as any,
              priority: 'high',
              dependencies: [],
              status: 'pending',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            dependsOn: ['brand-design'],
            parallel: false,
            optional: false,
            retryPolicy: {
              maxAttempts: 3,
              delay: 1000,
              backoff: 'exponential',
            },
            timeout: 600000,
          },
          {
            id: 'content-creation',
            name: 'Content Creation',
            agent: 'content-generation-agent',
            task: {
              id: 'task-content',
              type: 'custom',
              title: 'Generate Content',
              description: 'Create all site content',
              parameters: {},
              context: {} as any,
              priority: 'high',
              dependencies: [],
              status: 'pending',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            dependsOn: ['page-design'],
            parallel: false,
            optional: false,
            retryPolicy: {
              maxAttempts: 3,
              delay: 1000,
              backoff: 'exponential',
            },
            timeout: 600000,
          },
          {
            id: 'development',
            name: 'Development',
            agent: 'development-agent',
            task: {
              id: 'task-dev',
              type: 'custom',
              title: 'Build Site',
              description: 'Develop and build the site',
              parameters: {},
              context: {} as any,
              priority: 'high',
              dependencies: [],
              status: 'pending',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            dependsOn: ['content-creation'],
            parallel: false,
            optional: false,
            retryPolicy: {
              maxAttempts: 3,
              delay: 1000,
              backoff: 'exponential',
            },
            timeout: 900000,
          },
          {
            id: 'qa-testing',
            name: 'QA Testing',
            agent: 'qa-agent',
            task: {
              id: 'task-qa',
              type: 'custom',
              title: 'Test Site',
              description: 'Perform quality assurance testing',
              parameters: {},
              context: {} as any,
              priority: 'high',
              dependencies: [],
              status: 'pending',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            dependsOn: ['development'],
            parallel: false,
            optional: false,
            retryPolicy: {
              maxAttempts: 2,
              delay: 1000,
              backoff: 'linear',
            },
            timeout: 300000,
          },
        ],
        config: {
          maxConcurrent: 3,
          failFast: false,
          saveState: true,
          notifications: true,
        },
        status: 'draft',
      },
      estimatedDuration: 3000000, // 50 minutes
      estimatedTokens: 50000,
    });

    // E-commerce Product Page Template
    this.templates.set('ecommerce-product', {
      id: 'ecommerce-product',
      name: 'E-commerce Product Page',
      description: 'Create a complete e-commerce product page with images, descriptions, and reviews',
      category: 'ecommerce',
      tags: ['ecommerce', 'product', 'shop', 'sales'],
      workflow: {
        id: 'ecommerce-product-workflow',
        name: 'E-commerce Product Page',
        description: 'Create product page for e-commerce',
        version: '1.0.0',
        steps: [
          {
            id: 'product-images',
            name: 'Product Images',
            agent: 'graphic-design-agent',
            task: {
              id: 'task-images',
              type: 'custom',
              title: 'Create Product Images',
              description: 'Generate or optimize product images',
              parameters: {},
              context: {} as any,
              priority: 'high',
              dependencies: [],
              status: 'pending',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            dependsOn: [],
            parallel: false,
            optional: false,
            retryPolicy: {
              maxAttempts: 3,
              delay: 1000,
              backoff: 'exponential',
            },
            timeout: 300000,
          },
          {
            id: 'product-description',
            name: 'Product Description',
            agent: 'content-generation-agent',
            task: {
              id: 'task-description',
              type: 'custom',
              title: 'Write Product Description',
              description: 'Create compelling product description',
              parameters: {},
              context: {} as any,
              priority: 'high',
              dependencies: [],
              status: 'pending',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            dependsOn: ['product-images'],
            parallel: false,
            optional: false,
            retryPolicy: {
              maxAttempts: 3,
              delay: 1000,
              backoff: 'exponential',
            },
            timeout: 240000,
          },
          {
            id: 'pricing-optimization',
            name: 'Pricing Strategy',
            agent: 'seo-optimization-agent',
            task: {
              id: 'task-pricing',
              type: 'custom',
              title: 'Optimize Pricing',
              description: 'Analyze and optimize product pricing',
              parameters: {},
              context: {} as any,
              priority: 'medium',
              dependencies: [],
              status: 'pending',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            dependsOn: ['product-description'],
            parallel: false,
            optional: true,
            retryPolicy: {
              maxAttempts: 2,
              delay: 1000,
              backoff: 'linear',
            },
            timeout: 180000,
          },
        ],
        config: {
          maxConcurrent: 2,
          failFast: false,
          saveState: true,
          notifications: false,
        },
        status: 'draft',
      },
      estimatedDuration: 720000, // 12 minutes
      estimatedTokens: 18000,
    });

    // Performance Optimization Template
    this.templates.set('performance-optimization', {
      id: 'performance-optimization',
      name: 'Performance Optimization',
      description: 'Optimize site performance including images, code, and assets',
      category: 'optimization',
      tags: ['performance', 'optimization', 'speed', 'lighthouse'],
      workflow: {
        id: 'performance-optimization-workflow',
        name: 'Performance Optimization',
        description: 'Optimize site performance',
        version: '1.0.0',
        steps: [
          {
            id: 'performance-audit',
            name: 'Performance Audit',
            agent: 'qa-agent',
            task: {
              id: 'task-audit',
              type: 'custom',
              title: 'Run Performance Audit',
              description: 'Audit site performance metrics',
              parameters: {},
              context: {} as any,
              priority: 'high',
              dependencies: [],
              status: 'pending',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            dependsOn: [],
            parallel: false,
            optional: false,
            retryPolicy: {
              maxAttempts: 2,
              delay: 1000,
              backoff: 'linear',
            },
            timeout: 300000,
          },
          {
            id: 'image-optimization',
            name: 'Image Optimization',
            agent: 'graphic-design-agent',
            task: {
              id: 'task-images',
              type: 'custom',
              title: 'Optimize Images',
              description: 'Compress and optimize images',
              parameters: {},
              context: {} as any,
              priority: 'high',
              dependencies: [],
              status: 'pending',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            dependsOn: ['performance-audit'],
            parallel: false,
            optional: false,
            retryPolicy: {
              maxAttempts: 3,
              delay: 1000,
              backoff: 'exponential',
            },
            timeout: 600000,
          },
          {
            id: 'code-optimization',
            name: 'Code Optimization',
            agent: 'development-agent',
            task: {
              id: 'task-code',
              type: 'custom',
              title: 'Optimize Code',
              description: 'Minify and optimize code',
              parameters: {},
              context: {} as any,
              priority: 'high',
              dependencies: [],
              status: 'pending',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            dependsOn: ['performance-audit'],
            parallel: true,
            optional: false,
            retryPolicy: {
              maxAttempts: 3,
              delay: 1000,
              backoff: 'exponential',
            },
            timeout: 600000,
          },
          {
            id: 'caching-setup',
            name: 'Caching Setup',
            agent: 'development-agent',
            task: {
              id: 'task-cache',
              type: 'custom',
              title: 'Setup Caching',
              description: 'Configure caching strategies',
              parameters: {},
              context: {} as any,
              priority: 'medium',
              dependencies: [],
              status: 'pending',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            dependsOn: ['code-optimization'],
            parallel: false,
            optional: true,
            retryPolicy: {
              maxAttempts: 2,
              delay: 1000,
              backoff: 'linear',
            },
            timeout: 300000,
          },
        ],
        config: {
          maxConcurrent: 2,
          failFast: false,
          saveState: true,
          notifications: false,
        },
        status: 'draft',
      },
      estimatedDuration: 1800000, // 30 minutes
      estimatedTokens: 25000,
    });
  }

  /**
   * Get all templates
   */
  getAllTemplates(): WorkflowTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Get template by ID
   */
  getTemplate(id: string): WorkflowTemplate | undefined {
    return this.templates.get(id);
  }

  /**
   * Get templates by category
   */
  getTemplatesByCategory(category: string): WorkflowTemplate[] {
    return Array.from(this.templates.values()).filter(
      (t) => t.category === category
    );
  }

  /**
   * Search templates
   */
  searchTemplates(query: string): WorkflowTemplate[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.templates.values()).filter(
      (t) =>
        t.name.toLowerCase().includes(lowerQuery) ||
        t.description.toLowerCase().includes(lowerQuery) ||
        t.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Add custom template
   */
  addTemplate(template: WorkflowTemplate): void {
    this.templates.set(template.id, template);
  }

  /**
   * Remove template
   */
  removeTemplate(id: string): boolean {
    return this.templates.delete(id);
  }
}

export const workflowTemplates = new WorkflowTemplates();

export default WorkflowTemplates;

