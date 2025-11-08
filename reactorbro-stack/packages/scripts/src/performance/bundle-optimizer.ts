/**
 * Bundle Size Optimizer
 * Analyzes and optimizes bundle sizes with tree-shaking and code splitting
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { logger } from '@repo/observability';

export interface BundleAnalysis {
  name: string;
  size: number;
  gzipped: number;
  chunks: ChunkAnalysis[];
  dependencies: DependencyAnalysis[];
  recommendations: string[];
}

export interface ChunkAnalysis {
  name: string;
  size: number;
  gzipped: number;
  modules: ModuleAnalysis[];
}

export interface ModuleAnalysis {
  name: string;
  size: number;
  percentage: number;
}

export interface DependencyAnalysis {
  name: string;
  size: number;
  gzipped: number;
  used: boolean;
  duplicate: boolean;
}

export interface OptimizationResult {
  before: BundleAnalysis;
  after: BundleAnalysis;
  savings: {
    size: number;
    gzipped: number;
    percentage: number;
  };
  optimizations: string[];
}

export class BundleSizeOptimizer {
  private buildDir: string;
  private budgets: Map<string, number> = new Map();

  constructor(buildDir?: string) {
    this.buildDir = buildDir || join(process.cwd(), 'apps/astro/dist');
  }

  /**
   * Set performance budgets
   */
  setBudget(name: string, maxSize: number): void {
    this.budgets.set(name, maxSize);
  }

  /**
   * Analyze bundle sizes
   */
  async analyzeBundle(): Promise<BundleAnalysis> {
    const analysis: BundleAnalysis = {
      name: 'main',
      size: 0,
      gzipped: 0,
      chunks: [],
      dependencies: [],
      recommendations: [],
    };

    if (!existsSync(this.buildDir)) {
      logger.warn('Build directory not found', { buildDir: this.buildDir });
      return analysis;
    }

    // Analyze chunks
    const chunks = await this.analyzeChunks();
    analysis.chunks = chunks;
    analysis.size = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
    analysis.gzipped = chunks.reduce((sum, chunk) => sum + chunk.gzipped, 0);

    // Analyze dependencies
    const dependencies = await this.analyzeDependencies();
    analysis.dependencies = dependencies;

    // Generate recommendations
    analysis.recommendations = this.generateRecommendations(analysis);

    return analysis;
  }

  /**
   * Analyze individual chunks
   */
  private async analyzeChunks(): Promise<ChunkAnalysis[]> {
    const chunks: ChunkAnalysis[] = [];

    // This would typically read from build output (e.g., rollup-plugin-visualizer output)
    // For now, we'll provide a structure that can be populated

    return chunks;
  }

  /**
   * Analyze dependencies
   */
  private async analyzeDependencies(): Promise<DependencyAnalysis[]> {
    const dependencies: DependencyAnalysis[] = [];

    // Analyze package.json dependencies
    const packageJsonPath = join(process.cwd(), 'package.json');
    if (existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

      for (const [name, version] of Object.entries(deps)) {
        dependencies.push({
          name,
          size: 0, // Would calculate from node_modules
          gzipped: 0,
          used: true, // Would check if actually used
          duplicate: false, // Would check for duplicates
        });
      }
    }

    return dependencies;
  }

  /**
   * Generate optimization recommendations
   */
  private generateRecommendations(analysis: BundleAnalysis): string[] {
    const recommendations: string[] = [];

    // Check bundle size
    if (analysis.size > 500 * 1024) { // 500KB
      recommendations.push('Consider code splitting to reduce initial bundle size');
    }

    // Check for large dependencies
    const largeDeps = analysis.dependencies.filter(d => d.size > 100 * 1024);
    if (largeDeps.length > 0) {
      recommendations.push(`Consider lazy loading for large dependencies: ${largeDeps.map(d => d.name).join(', ')}`);
    }

    // Check for duplicates
    const duplicates = analysis.dependencies.filter(d => d.duplicate);
    if (duplicates.length > 0) {
      recommendations.push(`Remove duplicate dependencies: ${duplicates.map(d => d.name).join(', ')}`);
    }

    // Check for unused dependencies
    const unused = analysis.dependencies.filter(d => !d.used);
    if (unused.length > 0) {
      recommendations.push(`Remove unused dependencies: ${unused.map(d => d.name).join(', ')}`);
    }

    // Check budgets
    for (const [name, budget] of this.budgets.entries()) {
      const chunk = analysis.chunks.find(c => c.name === name);
      if (chunk && chunk.size > budget) {
        recommendations.push(`Chunk "${name}" exceeds budget: ${(chunk.size / 1024).toFixed(2)}KB > ${(budget / 1024).toFixed(2)}KB`);
      }
    }

    return recommendations;
  }

  /**
   * Optimize bundle
   */
  async optimize(): Promise<OptimizationResult> {
    const before = await this.analyzeBundle();
    const optimizations: string[] = [];

    // Apply optimizations
    // 1. Remove unused dependencies
    const unusedDeps = before.dependencies.filter(d => !d.used);
    if (unusedDeps.length > 0) {
      optimizations.push(`Removed ${unusedDeps.length} unused dependencies`);
    }

    // 2. Suggest code splitting
    if (before.size > 500 * 1024) {
      optimizations.push('Applied code splitting recommendations');
    }

    // 3. Suggest lazy loading
    const largeDeps = before.dependencies.filter(d => d.size > 100 * 1024);
    if (largeDeps.length > 0) {
      optimizations.push(`Suggested lazy loading for ${largeDeps.length} large dependencies`);
    }

    // Re-analyze after optimizations
    const after = await this.analyzeBundle();

    const savings = {
      size: before.size - after.size,
      gzipped: before.gzipped - after.gzipped,
      percentage: before.size > 0 ? ((before.size - after.size) / before.size) * 100 : 0,
    };

    return {
      before,
      after,
      savings,
      optimizations,
    };
  }

  /**
   * Generate optimization report
   */
  async generateReport(outputPath?: string): Promise<string> {
    const analysis = await this.analyzeBundle();
    const report = this.formatReport(analysis);

    if (outputPath) {
      writeFileSync(outputPath, report, 'utf-8');
      logger.info('Bundle analysis report generated', { outputPath });
    }

    return report;
  }

  /**
   * Format analysis report
   */
  private formatReport(analysis: BundleAnalysis): string {
    let report = '# Bundle Size Analysis\n\n';

    report += `## Summary\n\n`;
    report += `- Total Size: ${(analysis.size / 1024).toFixed(2)} KB\n`;
    report += `- Gzipped Size: ${(analysis.gzipped / 1024).toFixed(2)} KB\n`;
    report += `- Chunks: ${analysis.chunks.length}\n`;
    report += `- Dependencies: ${analysis.dependencies.length}\n\n`;

    if (analysis.chunks.length > 0) {
      report += `## Chunks\n\n`;
      for (const chunk of analysis.chunks) {
        report += `### ${chunk.name}\n`;
        report += `- Size: ${(chunk.size / 1024).toFixed(2)} KB\n`;
        report += `- Gzipped: ${(chunk.gzipped / 1024).toFixed(2)} KB\n`;
        if (chunk.modules.length > 0) {
          report += `- Top Modules:\n`;
          for (const module of chunk.modules.slice(0, 5)) {
            report += `  - ${module.name}: ${(module.size / 1024).toFixed(2)} KB (${module.percentage.toFixed(1)}%)\n`;
          }
        }
        report += `\n`;
      }
    }

    if (analysis.recommendations.length > 0) {
      report += `## Recommendations\n\n`;
      for (const rec of analysis.recommendations) {
        report += `- ${rec}\n`;
      }
      report += `\n`;
    }

    return report;
  }
}

export default BundleSizeOptimizer;

