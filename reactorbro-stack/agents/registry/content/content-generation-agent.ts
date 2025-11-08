/**
 * Content Generation Agent
 * Handles content creation, copywriting, and content strategy
 */

import { AgentBase } from '../../core/agent-base';
import type { Task, TaskResult, Context } from '../../core/types';

export interface ContentRequest {
  pageType: 'landing' | 'blog' | 'product' | 'about' | 'service' | 'custom';
  purpose: string;
  targetAudience: string;
  tone: 'professional' | 'casual' | 'friendly' | 'authoritative' | 'playful' | 'inspirational';
  length: 'short' | 'medium' | 'long';
  keywords?: string[];
  brandVoice?: BrandVoice;
}

export interface BrandVoice {
  personality: string[];
  values: string[];
  doWords: string[];
  dontWords: string[];
  sampleCopy?: string;
}

export interface GeneratedContent {
  headline: string;
  subheadline?: string;
  body: ContentBlock[];
  cta: CallToAction;
  metadata: {
    wordCount: number;
    readingTime: number;
    tone: string;
    keywords: string[];
  };
}

export interface ContentBlock {
  type: 'paragraph' | 'heading' | 'list' | 'quote' | 'feature' | 'benefit';
  content: string | string[];
  emphasis?: 'normal' | 'strong' | 'emphasized';
}

export interface CallToAction {
  primary: {
    text: string;
    action: string;
  };
  secondary?: {
    text: string;
    action: string;
  };
}

export interface BlogPost {
  title: string;
  slug: string;
  excerpt: string;
  content: ContentBlock[];
  metadata: {
    author?: string;
    publishDate?: Date;
    readingTime: number;
    wordCount: number;
    keywords: string[];
    category: string;
    tags: string[];
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    focusKeyword: string;
  };
}

export interface CopyOptions {
  purpose: 'inform' | 'persuade' | 'engage' | 'convert' | 'educate';
  format: 'headline' | 'tagline' | 'description' | 'cta' | 'body' | 'feature' | 'benefit';
  context: string;
  constraints?: {
    maxLength?: number;
    includeKeywords?: string[];
    avoidWords?: string[];
  };
}

export class ContentGenerationAgent extends AgentBase {
  constructor() {
    super({
      id: 'content-generation-agent',
      name: 'Content Generation Agent',
      description: 'Creates compelling website content, copy, and blog posts',
      version: '1.0.0',
      category: 'content',
      capabilities: [
        'page_content',
        'blog_post',
        'copywriting',
        'cta_creation',
        'content_optimization',
      ],
      skills: [
        'seo-writing',
        'tone-matching',
        'content-structuring',
        'persuasive-writing',
        'storytelling',
      ],
      config: {
        maxRetries: 3,
        timeout: 180000,
        tokenLimit: 10000,
        parallel: false,
        priority: 8,
      },
    });
  }

  async execute(task: Task, context: Context): Promise<TaskResult> {
    this.log('info', `Executing content generation task: ${task.type}`, { taskId: task.id });

    try {
      let result: any;

      switch (task.type) {
        case 'page_content':
          result = await this.generatePageContent(task.parameters.request, context);
          break;
        case 'blog_post':
          result = await this.generateBlogPost(task.parameters.topic, task.parameters.options, context);
          break;
        case 'copywriting':
          result = await this.writeCopy(task.parameters.options, context);
          break;
        case 'cta_creation':
          result = await this.createCTA(task.parameters.context, context);
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
   * Generate complete page content
   */
  async generatePageContent(
    request: ContentRequest,
    context: Context
  ): Promise<GeneratedContent> {
    this.log('info', 'Generating page content', { pageType: request.pageType });

    const headline = await this.generateHeadline(request);
    const subheadline = await this.generateSubheadline(request, headline);
    const body = await this.generateBody(request);
    const cta = await this.createCTA(request.purpose, context);

    const allText = [headline, subheadline, ...body.map(b => JSON.stringify(b.content))].join(' ');
    const wordCount = this.countWords(allText);

    return {
      headline,
      subheadline,
      body,
      cta,
      metadata: {
        wordCount,
        readingTime: Math.ceil(wordCount / 200), // 200 words per minute
        tone: request.tone,
        keywords: request.keywords || [],
      },
    };
  }

  /**
   * Generate blog post
   */
  async generateBlogPost(
    topic: string,
    options: Partial<ContentRequest>,
    context: Context
  ): Promise<BlogPost> {
    this.log('info', 'Generating blog post', { topic });

    const title = await this.generateBlogTitle(topic, options.tone || 'professional');
    const slug = this.createSlug(title);
    const excerpt = await this.generateExcerpt(topic, title);
    const content = await this.generateBlogContent(topic, options);

    const allText = [title, excerpt, ...content.map(b => JSON.stringify(b.content))].join(' ');
    const wordCount = this.countWords(allText);

    return {
      title,
      slug,
      excerpt,
      content,
      metadata: {
        readingTime: Math.ceil(wordCount / 200),
        wordCount,
        keywords: options.keywords || [],
        category: this.determineCategory(topic),
        tags: this.generateTags(topic, content),
      },
      seo: {
        metaTitle: this.createMetaTitle(title),
        metaDescription: excerpt,
        focusKeyword: options.keywords?.[0] || topic,
      },
    };
  }

  /**
   * Write copy for specific purpose
   */
  async writeCopy(options: CopyOptions, context: Context): Promise<string> {
    this.log('info', 'Writing copy', { format: options.format, purpose: options.purpose });

    switch (options.format) {
      case 'headline':
        return this.generateCopyHeadline(options);
      case 'tagline':
        return this.generateTagline(options);
      case 'cta':
        return this.generateCTACopy(options);
      case 'feature':
        return this.generateFeatureCopy(options);
      case 'benefit':
        return this.generateBenefitCopy(options);
      default:
        return this.generateGenericCopy(options);
    }
  }

  /**
   * Create call-to-action
   */
  async createCTA(purpose: string, context: Context): Promise<CallToAction> {
    this.log('info', 'Creating CTA', { purpose });

    const ctaTemplates = this.getCTATemplates(purpose);

    return {
      primary: {
        text: ctaTemplates.primary.text,
        action: ctaTemplates.primary.action,
      },
      secondary: ctaTemplates.secondary ? {
        text: ctaTemplates.secondary.text,
        action: ctaTemplates.secondary.action,
      } : undefined,
    };
  }

  // Helper methods

  private async generateHeadline(request: ContentRequest): Promise<string> {
    const templates: Record<ContentRequest['pageType'], string[]> = {
      landing: [
        `Transform Your ${this.extractIndustry(request.purpose)} with [Solution]`,
        `The Ultimate [Solution] for ${request.targetAudience}`,
        `[Benefit] Made Simple`,
      ],
      product: [
        `Meet [Product]: Your New Favorite [Category]`,
        `[Product] - [Main Benefit] Without the [Pain Point]`,
      ],
      service: [
        `Professional [Service] That Delivers Results`,
        `Expert [Service] for ${request.targetAudience}`,
      ],
      about: [
        `We're on a Mission to [Mission]`,
        `Building [Solution] That Makes a Difference`,
      ],
      blog: [
        `Everything You Need to Know About [Topic]`,
        `The Complete Guide to [Topic]`,
      ],
      custom: [
        `[Custom Headline Based on Purpose]`,
      ],
    };

    const template = templates[request.pageType][0];
    return this.customizeTemplate(template, request);
  }

  private async generateSubheadline(request: ContentRequest, headline: string): Promise<string> {
    const purposes: Record<string, string> = {
      convert: `Join thousands who have already transformed their ${this.extractIndustry(request.purpose)}.`,
      inform: `Learn how to get the most out of your ${this.extractIndustry(request.purpose)}.`,
      engage: `Discover why ${request.targetAudience} trust our solution.`,
      educate: `Master the skills you need to succeed.`,
    };

    return purposes[this.determinePurpose(request.purpose)] ||
           `Experience the difference with our proven approach.`;
  }

  private async generateBody(request: ContentRequest): Promise<ContentBlock[]> {
    const blocks: ContentBlock[] = [];

    // Introduction paragraph
    blocks.push({
      type: 'paragraph',
      content: this.generateIntroduction(request),
      emphasis: 'normal',
    });

    // Main content based on page type
    if (request.pageType === 'landing' || request.pageType === 'product') {
      // Features section
      blocks.push({
        type: 'heading',
        content: 'Key Features',
        emphasis: 'strong',
      });

      blocks.push({
        type: 'list',
        content: this.generateFeatureList(request),
        emphasis: 'normal',
      });

      // Benefits section
      blocks.push({
        type: 'heading',
        content: 'Benefits',
        emphasis: 'strong',
      });

      blocks.push({
        type: 'list',
        content: this.generateBenefitList(request),
        emphasis: 'normal',
      });
    } else if (request.pageType === 'about') {
      blocks.push({
        type: 'paragraph',
        content: this.generateAboutContent(request),
        emphasis: 'normal',
      });

      blocks.push({
        type: 'quote',
        content: 'Our mission is to make technology accessible to everyone.',
        emphasis: 'emphasized',
      });
    }

    // Closing paragraph
    blocks.push({
      type: 'paragraph',
      content: this.generateClosing(request),
      emphasis: 'normal',
    });

    return blocks;
  }

  private async generateBlogTitle(topic: string, tone: ContentRequest['tone']): Promise<string> {
    const formats = [
      `How to ${topic}: A Complete Guide`,
      `${topic}: Everything You Need to Know`,
      `The Ultimate Guide to ${topic}`,
      `Mastering ${topic} in 2024`,
      `${topic} Best Practices and Tips`,
    ];

    return formats[Math.floor(Math.random() * formats.length)];
  }

  private async generateExcerpt(topic: string, title: string): Promise<string> {
    return `Discover everything you need to know about ${topic}. This comprehensive guide covers best practices, tips, and strategies to help you succeed.`;
  }

  private async generateBlogContent(
    topic: string,
    options: Partial<ContentRequest>
  ): Promise<ContentBlock[]> {
    const blocks: ContentBlock[] = [];

    // Introduction
    blocks.push({
      type: 'paragraph',
      content: `In this guide, we'll explore ${topic} and provide you with actionable insights to implement right away.`,
    });

    // Main sections
    blocks.push({
      type: 'heading',
      content: `Understanding ${topic}`,
    });

    blocks.push({
      type: 'paragraph',
      content: `${topic} is an essential aspect of modern business. Here's what you need to know to get started.`,
    });

    blocks.push({
      type: 'heading',
      content: 'Key Concepts',
    });

    blocks.push({
      type: 'list',
      content: [
        `Core principles of ${topic}`,
        'Best practices and methodologies',
        'Common pitfalls to avoid',
        'Tools and resources to use',
      ],
    });

    blocks.push({
      type: 'heading',
      content: 'Implementation Guide',
    });

    blocks.push({
      type: 'paragraph',
      content: 'Follow these steps to successfully implement these strategies in your own context.',
    });

    // Conclusion
    blocks.push({
      type: 'heading',
      content: 'Conclusion',
    });

    blocks.push({
      type: 'paragraph',
      content: `By following the guidance in this article, you'll be well-equipped to master ${topic} and achieve your goals.`,
    });

    return blocks;
  }

  private generateCopyHeadline(options: CopyOptions): string {
    const templates = [
      `Transform Your ${options.context} Today`,
      `The Future of ${options.context} Is Here`,
      `Unlock the Power of ${options.context}`,
    ];

    return this.applyConstraints(templates[0], options.constraints);
  }

  private generateTagline(options: CopyOptions): string {
    const templates = [
      `Making ${options.context} Simple`,
      `${options.context} Reimagined`,
      `Your Partner in ${options.context}`,
    ];

    return this.applyConstraints(templates[0], options.constraints);
  }

  private generateCTACopy(options: CopyOptions): string {
    const actionVerbs = ['Start', 'Get', 'Try', 'Join', 'Discover', 'Unlock'];
    const verb = actionVerbs[Math.floor(Math.random() * actionVerbs.length)];

    return `${verb} ${options.context} Now`;
  }

  private generateFeatureCopy(options: CopyOptions): string {
    return `Advanced ${options.context} capabilities that set you apart from the competition.`;
  }

  private generateBenefitCopy(options: CopyOptions): string {
    return `Save time and increase efficiency with our ${options.context} solution.`;
  }

  private generateGenericCopy(options: CopyOptions): string {
    return `Discover how ${options.context} can help you achieve your goals.`;
  }

  private getCTATemplates(purpose: string): { primary: CallToAction['primary']; secondary?: CallToAction['secondary'] } {
    const templates: Record<string, any> = {
      convert: {
        primary: { text: 'Get Started Free', action: '/signup' },
        secondary: { text: 'See How It Works', action: '/demo' },
      },
      contact: {
        primary: { text: 'Contact Us', action: '/contact' },
        secondary: { text: 'Schedule a Call', action: '/schedule' },
      },
      learn: {
        primary: { text: 'Learn More', action: '/about' },
        secondary: { text: 'Read Documentation', action: '/docs' },
      },
      purchase: {
        primary: { text: 'Buy Now', action: '/checkout' },
        secondary: { text: 'View Pricing', action: '/pricing' },
      },
      default: {
        primary: { text: 'Get Started', action: '/start' },
      },
    };

    return templates[purpose] || templates.default;
  }

  private generateIntroduction(request: ContentRequest): string {
    return `Welcome! We're excited to share how our solution can help ${request.targetAudience} achieve their goals.`;
  }

  private generateFeatureList(request: ContentRequest): string[] {
    return [
      'Intuitive and easy-to-use interface',
      'Powerful features that save time',
      'Seamless integration with existing tools',
      'Enterprise-grade security and reliability',
      '24/7 customer support',
    ];
  }

  private generateBenefitList(request: ContentRequest): string[] {
    return [
      'Increase productivity by up to 50%',
      'Reduce costs and improve ROI',
      'Scale effortlessly as you grow',
      'Gain insights with advanced analytics',
      'Stay ahead of the competition',
    ];
  }

  private generateAboutContent(request: ContentRequest): string {
    return `We're a team of passionate innovators dedicated to creating solutions that make a real difference. Our mission is to empower ${request.targetAudience} with the tools they need to succeed.`;
  }

  private generateClosing(request: ContentRequest): string {
    return `Ready to get started? Join thousands of satisfied customers who have already transformed their ${this.extractIndustry(request.purpose)}.`;
  }

  private createSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private createMetaTitle(title: string): string {
    return title.length > 60 ? `${title.substring(0, 57)}...` : title;
  }

  private determineCategory(topic: string): string {
    // Simple categorization - in production would use more sophisticated logic
    const categories = ['Technology', 'Business', 'Design', 'Development', 'Marketing'];
    return categories[0];
  }

  private generateTags(topic: string, content: ContentBlock[]): string[] {
    // Extract potential tags from topic and content
    const tags = [topic, 'guide', 'tutorial', 'best-practices'];
    return tags.slice(0, 5);
  }

  private countWords(text: string): number {
    return text.trim().split(/\s+/).length;
  }

  private extractIndustry(purpose: string): string {
    // Extract industry context from purpose
    return 'business';
  }

  private determinePurpose(purpose: string): string {
    // Map purpose to predefined categories
    if (purpose.includes('buy') || purpose.includes('purchase')) return 'purchase';
    if (purpose.includes('contact') || purpose.includes('reach')) return 'contact';
    if (purpose.includes('learn') || purpose.includes('understand')) return 'learn';
    return 'convert';
  }

  private customizeTemplate(template: string, request: ContentRequest): string {
    // Simple template customization
    return template
      .replace('[Solution]', 'Solution')
      .replace('[Product]', 'Product')
      .replace('[Benefit]', 'Innovation')
      .replace('[Topic]', request.purpose);
  }

  private applyConstraints(text: string, constraints?: CopyOptions['constraints']): string {
    if (!constraints) return text;

    let result = text;

    if (constraints.maxLength && result.length > constraints.maxLength) {
      result = result.substring(0, constraints.maxLength - 3) + '...';
    }

    return result;
  }
}
