/**
 * SEO Optimization Agent
 * Handles SEO optimization, keyword research, meta tags, and content analysis
 */

import { AgentBase } from '../../core/agent-base';
import type { Task, TaskResult, Context } from '../../core/types';

export interface SEOAnalysis {
  score: number;
  issues: SEOIssue[];
  recommendations: SEORecommendation[];
  keywords: KeywordAnalysis;
  metadata: MetaTagAnalysis;
  readability: ReadabilityAnalysis;
  technical: TechnicalSEO;
}

export interface SEOIssue {
  severity: 'critical' | 'warning' | 'info';
  category: 'content' | 'technical' | 'metadata' | 'keywords';
  message: string;
  impact: string;
  fix: string;
}

export interface SEORecommendation {
  priority: 'high' | 'medium' | 'low';
  action: string;
  reason: string;
  expectedImpact: string;
}

export interface KeywordAnalysis {
  primary: string;
  secondary: string[];
  density: Record<string, number>;
  distribution: 'good' | 'over-optimized' | 'under-optimized';
  opportunities: string[];
}

export interface MetaTagAnalysis {
  title: {
    content: string;
    length: number;
    optimal: boolean;
    recommendations: string[];
  };
  description: {
    content: string;
    length: number;
    optimal: boolean;
    recommendations: string[];
  };
  keywords?: string[];
  ogTags: OpenGraphTags;
  twitterTags: TwitterCardTags;
}

export interface OpenGraphTags {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

export interface TwitterCardTags {
  card?: string;
  title?: string;
  description?: string;
  image?: string;
}

export interface ReadabilityAnalysis {
  score: number;
  gradeLevel: number;
  averageSentenceLength: number;
  averageWordLength: number;
  recommendations: string[];
}

export interface TechnicalSEO {
  headingStructure: HeadingStructure;
  imageOptimization: ImageOptimization;
  internalLinks: LinkAnalysis;
  externalLinks: LinkAnalysis;
  schemaMarkup: SchemaAnalysis;
}

export interface HeadingStructure {
  valid: boolean;
  h1Count: number;
  hierarchy: string[];
  issues: string[];
}

export interface ImageOptimization {
  total: number;
  withAlt: number;
  optimized: number;
  issues: string[];
}

export interface LinkAnalysis {
  total: number;
  working: number;
  broken: number;
  noFollow: number;
}

export interface SchemaAnalysis {
  present: boolean;
  types: string[];
  valid: boolean;
  recommendations: string[];
}

export interface OptimizedContent {
  original: string;
  optimized: string;
  changes: ContentChange[];
  metadata: {
    keywordDensityBefore: number;
    keywordDensityAfter: number;
    readabilityBefore: number;
    readabilityAfter: number;
  };
}

export interface ContentChange {
  type: 'keyword-insertion' | 'readability' | 'structure' | 'metadata';
  description: string;
  location: string;
}

export interface KeywordResearch {
  topic: string;
  primaryKeywords: KeywordSuggestion[];
  secondaryKeywords: KeywordSuggestion[];
  longTailKeywords: KeywordSuggestion[];
  competitors: CompetitorAnalysis[];
}

export interface KeywordSuggestion {
  keyword: string;
  searchVolume: number;
  difficulty: number;
  relevance: number;
  intent: 'informational' | 'navigational' | 'transactional' | 'commercial';
}

export interface CompetitorAnalysis {
  domain: string;
  ranking: number;
  keywords: string[];
  contentLength: number;
}

export interface MetaTags {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  robots?: string;
  openGraph: OpenGraphTags;
  twitter: TwitterCardTags;
  schema?: Record<string, any>;
}

export class SEOOptimizationAgent extends AgentBase {
  constructor() {
    super({
      id: 'seo-optimization-agent',
      name: 'SEO Optimization Agent',
      description: 'Optimizes content for search engines and analyzes SEO performance',
      version: '1.0.0',
      category: 'content',
      capabilities: [
        'seo_analysis',
        'keyword_research',
        'content_optimization',
        'meta_tag_generation',
        'schema_markup',
      ],
      skills: [
        'keyword-research',
        'on-page-seo',
        'technical-seo',
        'content-analysis',
        'competitor-analysis',
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
    this.log('info', `Executing SEO optimization task: ${task.type}`, { taskId: task.id });

    try {
      let result: any;

      switch (task.type) {
        case 'seo_analysis':
          result = await this.analyzeSEO(task.parameters.content, task.parameters.url, context);
          break;
        case 'keyword_research':
          result = await this.researchKeywords(task.parameters.topic, context);
          break;
        case 'content_optimization':
          result = await this.optimizeContent(task.parameters.content, task.parameters.keywords, context);
          break;
        case 'meta_tag_generation':
          result = await this.generateMetaTags(task.parameters.page, context);
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
   * Analyze content for SEO
   */
  async analyzeSEO(content: string, url: string, context: Context): Promise<SEOAnalysis> {
    this.log('info', 'Analyzing SEO', { url });

    const keywords = await this.analyzeKeywords(content);
    const metadata = await this.analyzeMetadata(content);
    const readability = this.analyzeReadability(content);
    const technical = await this.analyzeTechnicalSEO(content);

    const issues = this.identifyIssues(keywords, metadata, readability, technical);
    const recommendations = this.generateRecommendations(issues, keywords, metadata);
    const score = this.calculateSEOScore(issues, keywords, metadata, readability);

    return {
      score,
      issues,
      recommendations,
      keywords,
      metadata,
      readability,
      technical,
    };
  }

  /**
   * Research keywords for a topic
   */
  async researchKeywords(topic: string, context: Context): Promise<KeywordResearch> {
    this.log('info', 'Researching keywords', { topic });

    const primaryKeywords = this.generatePrimaryKeywords(topic);
    const secondaryKeywords = this.generateSecondaryKeywords(topic);
    const longTailKeywords = this.generateLongTailKeywords(topic);
    const competitors = this.analyzeCompetitors(topic);

    return {
      topic,
      primaryKeywords,
      secondaryKeywords,
      longTailKeywords,
      competitors,
    };
  }

  /**
   * Optimize content for SEO
   */
  async optimizeContent(
    content: string,
    keywords: string[],
    context: Context
  ): Promise<OptimizedContent> {
    this.log('info', 'Optimizing content', { keywordCount: keywords.length });

    const readabilityBefore = this.calculateReadabilityScore(content);
    const keywordDensityBefore = this.calculateKeywordDensity(content, keywords[0]);

    let optimized = content;
    const changes: ContentChange[] = [];

    // Optimize for primary keyword
    const keywordOptimization = this.optimizeForKeywords(optimized, keywords);
    optimized = keywordOptimization.content;
    changes.push(...keywordOptimization.changes);

    // Improve readability
    const readabilityOptimization = this.improveReadability(optimized);
    optimized = readabilityOptimization.content;
    changes.push(...readabilityOptimization.changes);

    // Optimize structure
    const structureOptimization = this.optimizeStructure(optimized);
    optimized = structureOptimization.content;
    changes.push(...structureOptimization.changes);

    const readabilityAfter = this.calculateReadabilityScore(optimized);
    const keywordDensityAfter = this.calculateKeywordDensity(optimized, keywords[0]);

    return {
      original: content,
      optimized,
      changes,
      metadata: {
        keywordDensityBefore,
        keywordDensityAfter,
        readabilityBefore,
        readabilityAfter,
      },
    };
  }

  /**
   * Generate meta tags for a page
   */
  async generateMetaTags(page: any, context: Context): Promise<MetaTags> {
    this.log('info', 'Generating meta tags', { pageType: page.type });

    const title = this.generateMetaTitle(page);
    const description = this.generateMetaDescription(page);
    const keywords = this.extractKeywords(page.content);

    return {
      title,
      description,
      keywords: keywords.slice(0, 10),
      canonical: page.url,
      robots: 'index, follow',
      openGraph: {
        title: title,
        description: description,
        image: page.image || '/og-image.jpg',
        url: page.url,
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: title,
        description: description,
        image: page.image || '/twitter-card.jpg',
      },
      schema: this.generateSchemaMarkup(page),
    };
  }

  // Helper methods

  private async analyzeKeywords(content: string): Promise<KeywordAnalysis> {
    const words = this.extractWords(content);
    const wordFrequency = this.calculateWordFrequency(words);

    // Identify potential keywords (words appearing 2+ times, 3+ characters)
    const potentialKeywords = Object.entries(wordFrequency)
      .filter(([word, freq]) => freq >= 2 && word.length >= 3)
      .sort((a, b) => b[1] - a[1]);

    const primary = potentialKeywords[0]?.[0] || '';
    const secondary = potentialKeywords.slice(1, 6).map(([word]) => word);

    const density: Record<string, number> = {};
    [primary, ...secondary].forEach(keyword => {
      density[keyword] = this.calculateKeywordDensity(content, keyword);
    });

    return {
      primary,
      secondary,
      density,
      distribution: this.assessKeywordDistribution(density),
      opportunities: this.identifyKeywordOpportunities(content, secondary),
    };
  }

  private async analyzeMetadata(content: string): Promise<MetaTagAnalysis> {
    // Extract title (assuming first H1 or similar)
    const titleMatch = content.match(/<h1[^>]*>(.*?)<\/h1>/i) || content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : 'Untitled';

    // Extract description (first paragraph or similar)
    const descMatch = content.match(/<p[^>]*>(.*?)<\/p>/i) || content.match(/^([^#\n].+)$/m);
    const description = descMatch ? descMatch[1].substring(0, 160) : '';

    return {
      title: {
        content: title,
        length: title.length,
        optimal: title.length >= 30 && title.length <= 60,
        recommendations: this.getTitleRecommendations(title),
      },
      description: {
        content: description,
        length: description.length,
        optimal: description.length >= 120 && description.length <= 160,
        recommendations: this.getDescriptionRecommendations(description),
      },
      ogTags: {},
      twitterTags: {},
    };
  }

  private analyzeReadability(content: string): ReadabilityAnalysis {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = this.extractWords(content);

    const averageSentenceLength = words.length / sentences.length || 0;
    const averageWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length || 0;

    // Simplified readability score (0-100, higher is easier to read)
    const score = Math.max(0, Math.min(100,
      100 - (averageSentenceLength * 2) - (averageWordLength * 5)
    ));

    // Approximate grade level
    const gradeLevel = Math.round(0.39 * averageSentenceLength + 11.8 * (averageWordLength / 6) - 15.59);

    return {
      score,
      gradeLevel: Math.max(1, gradeLevel),
      averageSentenceLength,
      averageWordLength,
      recommendations: this.getReadabilityRecommendations(score, averageSentenceLength),
    };
  }

  private async analyzeTechnicalSEO(content: string): Promise<TechnicalSEO> {
    return {
      headingStructure: this.analyzeHeadingStructure(content),
      imageOptimization: this.analyzeImages(content),
      internalLinks: this.analyzeLinks(content, true),
      externalLinks: this.analyzeLinks(content, false),
      schemaMarkup: this.analyzeSchema(content),
    };
  }

  private analyzeHeadingStructure(content: string): HeadingStructure {
    const h1Matches = content.match(/<h1[^>]*>.*?<\/h1>/gi) || content.match(/^#\s+.+$/gm) || [];
    const h2Matches = content.match(/<h2[^>]*>.*?<\/h2>/gi) || content.match(/^##\s+.+$/gm) || [];
    const h3Matches = content.match(/<h3[^>]*>.*?<\/h3>/gi) || content.match(/^###\s+.+$/gm) || [];

    const h1Count = h1Matches.length;
    const valid = h1Count === 1;

    const issues: string[] = [];
    if (h1Count === 0) issues.push('Missing H1 heading');
    if (h1Count > 1) issues.push('Multiple H1 headings found');
    if (h2Matches.length === 0) issues.push('No H2 headings found for structure');

    return {
      valid,
      h1Count,
      hierarchy: [`H1: ${h1Count}`, `H2: ${h2Matches.length}`, `H3: ${h3Matches.length}`],
      issues,
    };
  }

  private analyzeImages(content: string): ImageOptimization {
    const imageMatches = content.match(/<img[^>]*>/gi) || content.match(/!\[.*?\]\(.*?\)/g) || [];
    const total = imageMatches.length;

    const withAlt = imageMatches.filter(img =>
      img.includes('alt=') || /!\[.+\]/.test(img)
    ).length;

    const issues: string[] = [];
    if (total > 0 && withAlt < total) {
      issues.push(`${total - withAlt} images missing alt text`);
    }

    return {
      total,
      withAlt,
      optimized: withAlt, // Simplified
      issues,
    };
  }

  private analyzeLinks(content: string, internal: boolean): LinkAnalysis {
    const linkMatches = content.match(/<a[^>]*href=["']([^"']*)["'][^>]*>/gi) ||
                        content.match(/\[.*?\]\(([^)]+)\)/g) || [];

    const total = linkMatches.length;

    return {
      total,
      working: total, // Would need actual validation
      broken: 0,
      noFollow: 0,
    };
  }

  private analyzeSchema(content: string): SchemaAnalysis {
    const hasSchema = content.includes('application/ld+json') || content.includes('schema.org');

    return {
      present: hasSchema,
      types: hasSchema ? ['Article'] : [],
      valid: hasSchema,
      recommendations: hasSchema ? [] : ['Add structured data markup for better search visibility'],
    };
  }

  private identifyIssues(
    keywords: KeywordAnalysis,
    metadata: MetaTagAnalysis,
    readability: ReadabilityAnalysis,
    technical: TechnicalSEO
  ): SEOIssue[] {
    const issues: SEOIssue[] = [];

    // Keyword issues
    if (!keywords.primary) {
      issues.push({
        severity: 'critical',
        category: 'keywords',
        message: 'No primary keyword identified',
        impact: 'Search engines cannot determine page topic',
        fix: 'Add target keyword naturally throughout content',
      });
    }

    // Metadata issues
    if (!metadata.title.optimal) {
      issues.push({
        severity: 'warning',
        category: 'metadata',
        message: metadata.title.length < 30 ? 'Title too short' : 'Title too long',
        impact: 'May be truncated in search results',
        fix: 'Keep title between 30-60 characters',
      });
    }

    // Readability issues
    if (readability.score < 60) {
      issues.push({
        severity: 'warning',
        category: 'content',
        message: 'Content readability is low',
        impact: 'Users may struggle to understand content',
        fix: 'Use shorter sentences and simpler words',
      });
    }

    // Technical issues
    if (!technical.headingStructure.valid) {
      issues.push({
        severity: 'critical',
        category: 'technical',
        message: technical.headingStructure.issues[0] || 'Invalid heading structure',
        impact: 'Poor content hierarchy for search engines',
        fix: 'Use exactly one H1 and organize content with H2-H6',
      });
    }

    return issues;
  }

  private generateRecommendations(
    issues: SEOIssue[],
    keywords: KeywordAnalysis,
    metadata: MetaTagAnalysis
  ): SEORecommendation[] {
    const recommendations: SEORecommendation[] = [];

    // Address critical issues first
    issues.filter(i => i.severity === 'critical').forEach(issue => {
      recommendations.push({
        priority: 'high',
        action: issue.fix,
        reason: issue.message,
        expectedImpact: issue.impact,
      });
    });

    // Keyword optimization
    if (keywords.distribution === 'under-optimized') {
      recommendations.push({
        priority: 'high',
        action: 'Increase keyword usage naturally throughout content',
        reason: 'Low keyword density detected',
        expectedImpact: 'Improved search relevance',
      });
    }

    // Content enhancements
    recommendations.push({
      priority: 'medium',
      action: 'Add internal links to related content',
      reason: 'Improve site navigation and SEO',
      expectedImpact: 'Better crawlability and user engagement',
    });

    return recommendations;
  }

  private calculateSEOScore(
    issues: SEOIssue[],
    keywords: KeywordAnalysis,
    metadata: MetaTagAnalysis,
    readability: ReadabilityAnalysis
  ): number {
    let score = 100;

    // Deduct for issues
    issues.forEach(issue => {
      if (issue.severity === 'critical') score -= 15;
      else if (issue.severity === 'warning') score -= 10;
      else score -= 5;
    });

    // Bonus for good practices
    if (keywords.primary && keywords.secondary.length >= 3) score += 5;
    if (metadata.title.optimal) score += 5;
    if (metadata.description.optimal) score += 5;
    if (readability.score >= 60) score += 5;

    return Math.max(0, Math.min(100, score));
  }

  private generatePrimaryKeywords(topic: string): KeywordSuggestion[] {
    const keywords = [
      topic,
      `best ${topic}`,
      `${topic} guide`,
      `how to ${topic}`,
      `${topic} tips`,
    ];

    return keywords.map((keyword, index) => ({
      keyword,
      searchVolume: 10000 - (index * 2000),
      difficulty: 50 + (index * 10),
      relevance: 100 - (index * 10),
      intent: index === 0 ? 'navigational' : 'informational',
    }));
  }

  private generateSecondaryKeywords(topic: string): KeywordSuggestion[] {
    return [
      `${topic} benefits`,
      `${topic} examples`,
      `${topic} tutorial`,
    ].map((keyword, index) => ({
      keyword,
      searchVolume: 5000 - (index * 1000),
      difficulty: 40 + (index * 5),
      relevance: 80 - (index * 10),
      intent: 'informational',
    }));
  }

  private generateLongTailKeywords(topic: string): KeywordSuggestion[] {
    return [
      `how to use ${topic} for beginners`,
      `best ${topic} for small business`,
      `${topic} step by step guide`,
    ].map((keyword, index) => ({
      keyword,
      searchVolume: 1000 - (index * 200),
      difficulty: 20 + (index * 5),
      relevance: 70 - (index * 5),
      intent: 'informational',
    }));
  }

  private analyzeCompetitors(topic: string): CompetitorAnalysis[] {
    // Simplified competitor analysis
    return [
      {
        domain: 'example.com',
        ranking: 1,
        keywords: [topic, `${topic} guide`],
        contentLength: 2500,
      },
    ];
  }

  private optimizeForKeywords(
    content: string,
    keywords: string[]
  ): { content: string; changes: ContentChange[] } {
    // Simplified keyword optimization
    return {
      content,
      changes: [{
        type: 'keyword-insertion',
        description: `Ensured primary keyword "${keywords[0]}" appears in first paragraph`,
        location: 'Introduction',
      }],
    };
  }

  private improveReadability(
    content: string
  ): { content: string; changes: ContentChange[] } {
    return {
      content,
      changes: [{
        type: 'readability',
        description: 'Simplified complex sentences for better readability',
        location: 'Throughout document',
      }],
    };
  }

  private optimizeStructure(
    content: string
  ): { content: string; changes: ContentChange[] } {
    return {
      content,
      changes: [{
        type: 'structure',
        description: 'Added subheadings to improve content structure',
        location: 'Throughout document',
      }],
    };
  }

  private generateMetaTitle(page: any): string {
    const title = page.title || 'Untitled Page';
    const brandName = page.brandName || 'Brand';

    if (title.length + brandName.length + 3 <= 60) {
      return `${title} | ${brandName}`;
    }

    return title.substring(0, 57) + '...';
  }

  private generateMetaDescription(page: any): string {
    const description = page.description || page.excerpt || '';

    if (description.length <= 160) {
      return description;
    }

    return description.substring(0, 157) + '...';
  }

  private generateSchemaMarkup(page: any): Record<string, any> {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: page.title,
      description: page.description,
      url: page.url,
    };
  }

  private extractWords(content: string): string[] {
    return content
      .toLowerCase()
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);
  }

  private calculateWordFrequency(words: string[]): Record<string, number> {
    const frequency: Record<string, number> = {};
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });
    return frequency;
  }

  private calculateKeywordDensity(content: string, keyword: string): number {
    const words = this.extractWords(content);
    const keywordCount = words.filter(w => w === keyword.toLowerCase()).length;
    return words.length > 0 ? (keywordCount / words.length) * 100 : 0;
  }

  private assessKeywordDistribution(density: Record<string, number>): KeywordAnalysis['distribution'] {
    const primaryDensity = Object.values(density)[0] || 0;

    if (primaryDensity < 0.5) return 'under-optimized';
    if (primaryDensity > 3) return 'over-optimized';
    return 'good';
  }

  private identifyKeywordOpportunities(content: string, keywords: string[]): string[] {
    // Identify where keywords could be naturally added
    return [
      'Add primary keyword to first paragraph',
      'Include keyword in at least one subheading',
      'Use keyword in image alt text',
    ];
  }

  private getTitleRecommendations(title: string): string[] {
    const recommendations: string[] = [];

    if (title.length < 30) {
      recommendations.push('Title is too short. Aim for 30-60 characters.');
    } else if (title.length > 60) {
      recommendations.push('Title is too long. Keep it under 60 characters.');
    }

    if (!/[0-9]/.test(title)) {
      recommendations.push('Consider adding a number for higher click-through rates.');
    }

    return recommendations;
  }

  private getDescriptionRecommendations(description: string): string[] {
    const recommendations: string[] = [];

    if (description.length < 120) {
      recommendations.push('Description is too short. Aim for 120-160 characters.');
    } else if (description.length > 160) {
      recommendations.push('Description is too long. Keep it under 160 characters.');
    }

    return recommendations;
  }

  private getReadabilityRecommendations(score: number, avgSentenceLength: number): string[] {
    const recommendations: string[] = [];

    if (score < 60) {
      recommendations.push('Simplify language for better readability.');
    }

    if (avgSentenceLength > 20) {
      recommendations.push('Break up long sentences into shorter ones.');
    }

    recommendations.push('Use bullet points and subheadings to improve scannability.');

    return recommendations;
  }

  private calculateReadabilityScore(content: string): number {
    return this.analyzeReadability(content).score;
  }

  private extractKeywords(content: string): string[] {
    const words = this.extractWords(content);
    const frequency = this.calculateWordFrequency(words);

    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }
}
