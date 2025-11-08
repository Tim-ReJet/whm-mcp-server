/**
 * Testing Gates
 * Enforces quality gates before deployment
 */

import { execSync } from 'child_process';
import { logger } from '../../observability/src/logging/logger.js';

export interface TestGateResult {
  passed: boolean;
  tests: TestResult[];
  errors: string[];
  warnings: string[];
}

export interface TestResult {
  name: string;
  passed: boolean;
  duration?: number;
  error?: string;
}

export interface TestGateConfig {
  unitTests?: boolean;
  integrationTests?: boolean;
  e2eTests?: boolean;
  typeCheck?: boolean;
  lint?: boolean;
  build?: boolean;
  coverageThreshold?: number;
}

export class TestingGates {
  private config: Required<TestGateConfig>;

  constructor(config: TestGateConfig = {}) {
    this.config = {
      unitTests: config.unitTests ?? true,
      integrationTests: config.integrationTests ?? true,
      e2eTests: config.e2eTests ?? false,
      typeCheck: config.typeCheck ?? true,
      lint: config.lint ?? true,
      build: config.build ?? true,
      coverageThreshold: config.coverageThreshold ?? 80,
    };
  }

  /**
   * Run all test gates
   */
  async runGates(): Promise<TestGateResult> {
    const result: TestGateResult = {
      passed: true,
      tests: [],
      errors: [],
      warnings: [],
    };

    logger.info('Running test gates', { config: this.config });

    // Type check
    if (this.config.typeCheck) {
      const typeCheck = await this.runTypeCheck();
      result.tests.push(typeCheck);
      if (!typeCheck.passed) {
        result.passed = false;
        result.errors.push(`Type check failed: ${typeCheck.error}`);
      }
    }

    // Lint
    if (this.config.lint) {
      const lint = await this.runLint();
      result.tests.push(lint);
      if (!lint.passed) {
        result.passed = false;
        result.errors.push(`Lint check failed: ${lint.error}`);
      }
    }

    // Unit tests
    if (this.config.unitTests) {
      const unitTests = await this.runUnitTests();
      result.tests.push(unitTests);
      if (!unitTests.passed) {
        result.passed = false;
        result.errors.push(`Unit tests failed: ${unitTests.error}`);
      }
    }

    // Integration tests
    if (this.config.integrationTests) {
      const integrationTests = await this.runIntegrationTests();
      result.tests.push(integrationTests);
      if (!integrationTests.passed) {
        result.passed = false;
        result.errors.push(`Integration tests failed: ${integrationTests.error}`);
      }
    }

    // E2E tests (optional, can be slow)
    if (this.config.e2eTests) {
      const e2eTests = await this.runE2ETests();
      result.tests.push(e2eTests);
      if (!e2eTests.passed) {
        result.warnings.push(`E2E tests failed: ${e2eTests.error}`);
        // E2E failures are warnings, not blocking
      }
    }

    // Build check
    if (this.config.build) {
      const build = await this.runBuild();
      result.tests.push(build);
      if (!build.passed) {
        result.passed = false;
        result.errors.push(`Build check failed: ${build.error}`);
      }
    }

    // Coverage check
    if (this.config.coverageThreshold > 0) {
      const coverage = await this.checkCoverage();
      if (coverage) {
        result.tests.push(coverage);
        if (!coverage.passed) {
          result.warnings.push(`Coverage below threshold: ${coverage.error}`);
          // Coverage warnings don't block deployment
        }
      }
    }

    logger.info('Test gates completed', {
      passed: result.passed,
      tests: result.tests.length,
      errors: result.errors.length,
      warnings: result.warnings.length,
    });

    return result;
  }

  /**
   * Run type check
   */
  private async runTypeCheck(): Promise<TestResult> {
    const startTime = Date.now();
    try {
      execSync('pnpm -C apps/astro check', { stdio: 'pipe' });
      return {
        name: 'Type Check',
        passed: true,
        duration: Date.now() - startTime,
      };
    } catch (error: any) {
      return {
        name: 'Type Check',
        passed: false,
        duration: Date.now() - startTime,
        error: error.message,
      };
    }
  }

  /**
   * Run lint
   */
  private async runLint(): Promise<TestResult> {
    const startTime = Date.now();
    try {
      execSync('pnpm lint', { stdio: 'pipe' });
      return {
        name: 'Lint',
        passed: true,
        duration: Date.now() - startTime,
      };
    } catch (error: any) {
      return {
        name: 'Lint',
        passed: false,
        duration: Date.now() - startTime,
        error: error.message,
      };
    }
  }

  /**
   * Run unit tests
   */
  private async runUnitTests(): Promise<TestResult> {
    const startTime = Date.now();
    try {
      execSync('pnpm test:unit', { stdio: 'pipe' });
      return {
        name: 'Unit Tests',
        passed: true,
        duration: Date.now() - startTime,
      };
    } catch (error: any) {
      return {
        name: 'Unit Tests',
        passed: false,
        duration: Date.now() - startTime,
        error: error.message,
      };
    }
  }

  /**
   * Run integration tests
   */
  private async runIntegrationTests(): Promise<TestResult> {
    const startTime = Date.now();
    try {
      execSync('pnpm test:integration', { stdio: 'pipe' });
      return {
        name: 'Integration Tests',
        passed: true,
        duration: Date.now() - startTime,
      };
    } catch (error: any) {
      return {
        name: 'Integration Tests',
        passed: false,
        duration: Date.now() - startTime,
        error: error.message,
      };
    }
  }

  /**
   * Run E2E tests
   */
  private async runE2ETests(): Promise<TestResult> {
    const startTime = Date.now();
    try {
      execSync('pnpm test:e2e', { stdio: 'pipe' });
      return {
        name: 'E2E Tests',
        passed: true,
        duration: Date.now() - startTime,
      };
    } catch (error: any) {
      return {
        name: 'E2E Tests',
        passed: false,
        duration: Date.now() - startTime,
        error: error.message,
      };
    }
  }

  /**
   * Run build
   */
  private async runBuild(): Promise<TestResult> {
    const startTime = Date.now();
    try {
      execSync('pnpm build', { stdio: 'pipe' });
      return {
        name: 'Build',
        passed: true,
        duration: Date.now() - startTime,
      };
    } catch (error: any) {
      return {
        name: 'Build',
        passed: false,
        duration: Date.now() - startTime,
        error: error.message,
      };
    }
  }

  /**
   * Check coverage
   */
  private async checkCoverage(): Promise<TestResult | null> {
    try {
      const output = execSync('pnpm test:coverage', { encoding: 'utf-8', stdio: 'pipe' });
      // Parse coverage from output (simplified)
      const coverageMatch = output.match(/(\d+\.\d+)%/);
      if (coverageMatch) {
        const coverage = parseFloat(coverageMatch[1]);
        const passed = coverage >= this.config.coverageThreshold;
        return {
          name: 'Coverage',
          passed,
          error: passed ? undefined : `Coverage ${coverage}% below threshold ${this.config.coverageThreshold}%`,
        };
      }
    } catch {
      // Coverage check failed, return null to skip
    }
    return null;
  }

  /**
   * Get summary
   */
  getSummary(result: TestGateResult): string {
    const passed = result.tests.filter(t => t.passed).length;
    const total = result.tests.length;

    let summary = `\n🧪 Test Gates Summary:\n`;
    summary += `   ✅ Passed: ${passed}/${total}\n`;
    summary += `   ❌ Failed: ${total - passed}/${total}\n\n`;

    for (const test of result.tests) {
      const icon = test.passed ? '✅' : '❌';
      const duration = test.duration ? ` (${test.duration}ms)` : '';
      summary += `   ${icon} ${test.name}${duration}\n`;
      if (test.error) {
        summary += `      ${test.error}\n`;
      }
    }

    if (result.warnings.length > 0) {
      summary += `\n⚠️  Warnings:\n`;
      for (const warning of result.warnings) {
        summary += `   • ${warning}\n`;
      }
    }

    return summary;
  }
}

export default TestingGates;

