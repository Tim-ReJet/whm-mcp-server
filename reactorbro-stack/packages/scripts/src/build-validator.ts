/**
 * Build Artifact Validator
 * Validates build artifacts before deployment
 */

import { existsSync, readFileSync, statSync } from 'fs';
import { join } from 'path';
import { logger } from '../../observability/src/logging/logger.js';

export interface ArtifactValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
  artifacts: ArtifactInfo[];
}

export interface ArtifactInfo {
  path: string;
  size: number;
  exists: boolean;
  type: 'file' | 'directory';
}

export class BuildArtifactValidator {
  private buildDir: string;
  private requiredFiles: string[] = ['index.html'];
  private maxSize: number = 100 * 1024 * 1024; // 100MB

  constructor(buildDir: string = 'apps/astro/dist') {
    this.buildDir = buildDir;
  }

  /**
   * Validate build artifacts
   */
  validate(): ArtifactValidation {
    const validation: ArtifactValidation = {
      valid: true,
      errors: [],
      warnings: [],
      artifacts: [],
    };

    // Check if build directory exists
    if (!existsSync(this.buildDir)) {
      validation.valid = false;
      validation.errors.push(`Build directory not found: ${this.buildDir}`);
      return validation;
    }

    // Check required files
    for (const file of this.requiredFiles) {
      const filePath = join(this.buildDir, file);
      const exists = existsSync(filePath);

      validation.artifacts.push({
        path: file,
        size: exists ? statSync(filePath).size : 0,
        exists,
        type: 'file',
      });

      if (!exists) {
        validation.valid = false;
        validation.errors.push(`Required file missing: ${file}`);
      }
    }

    // Check total size
    const totalSize = this.calculateTotalSize(this.buildDir);
    if (totalSize > this.maxSize) {
      validation.warnings.push(
        `Build size exceeds recommended limit: ${(totalSize / 1024 / 1024).toFixed(2)}MB > ${(this.maxSize / 1024 / 1024).toFixed(2)}MB`
      );
    }

    // Check for common issues
    this.checkCommonIssues(validation);

    logger.info('Build artifact validation completed', {
      valid: validation.valid,
      errors: validation.errors.length,
      warnings: validation.warnings.length,
      artifacts: validation.artifacts.length,
    });

    return validation;
  }

  /**
   * Check for common build issues
   */
  private checkCommonIssues(validation: ArtifactValidation): void {
    const indexPath = join(this.buildDir, 'index.html');
    if (existsSync(indexPath)) {
      const content = readFileSync(indexPath, 'utf-8');

      // Check for development references
      if (content.includes('localhost') || content.includes('127.0.0.1')) {
        validation.warnings.push('Build contains localhost references');
      }

      // Check for source maps in production
      if (content.includes('.map')) {
        validation.warnings.push('Build contains source map references');
      }

      // Check for empty HTML
      if (content.trim().length < 100) {
        validation.warnings.push('index.html appears to be empty or minimal');
      }
    }

    // Check for _astro directory
    const astroDir = join(this.buildDir, '_astro');
    if (!existsSync(astroDir)) {
      validation.warnings.push('_astro directory not found (may indicate build issues)');
    }
  }

  /**
   * Calculate total size of directory
   */
  private calculateTotalSize(dir: string): number {
    if (!existsSync(dir)) {
      return 0;
    }

    const stats = statSync(dir);
    if (stats.isFile()) {
      return stats.size;
    }

    let total = 0;
    try {
      const { readdirSync, statSync } = require('fs');
      const files = readdirSync(dir);

      for (const file of files) {
        const filePath = join(dir, file);
        try {
          total += this.calculateTotalSize(filePath);
        } catch {
          // Skip files we can't read
        }
      }
    } catch {
      // Skip directories we can't read
    }

    return total;
  }

  /**
   * Get artifact summary
   */
  getSummary(validation: ArtifactValidation): string {
    const totalSize = validation.artifacts.reduce((sum, a) => sum + a.size, 0);
    const existing = validation.artifacts.filter(a => a.exists).length;

    return `
Build Artifact Validation Summary:
  ✅ Valid: ${validation.valid ? 'Yes' : 'No'}
  📦 Artifacts: ${existing}/${validation.artifacts.length} found
  📊 Total Size: ${(totalSize / 1024 / 1024).toFixed(2)}MB
  ❌ Errors: ${validation.errors.length}
  ⚠️  Warnings: ${validation.warnings.length}
`;
  }
}

export default BuildArtifactValidator;

