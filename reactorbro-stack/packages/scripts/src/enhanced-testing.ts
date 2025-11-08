/**
 * Enhanced Testing Suite
 * Integrates visual regression, accessibility, and security testing
 */

import VisualRegressionTester from './visual-regression.js';
import AccessibilityTester from './accessibility-testing.js';
import SecurityTester from './security-testing.js';
import { logger } from '../../observability/src/logging/logger.js';

export interface EnhancedTestResult {
  visual: {
    passed: boolean;
    comparisons: any[];
  };
  accessibility: {
    passed: boolean;
    score: number;
    violations: any[];
  };
  security: {
    passed: boolean;
    score: number;
    vulnerabilities: any[];
  };
  overall: {
    passed: boolean;
    score: number;
  };
}

export class EnhancedTestingSuite {
  private visualTester: VisualRegressionTester;
  private accessibilityTester: AccessibilityTester;
  private securityTester: SecurityTester;

  constructor() {
    this.visualTester = new VisualRegressionTester();
    this.accessibilityTester = new AccessibilityTester();
    this.securityTester = new SecurityTester();
  }

  /**
   * Run all enhanced tests
   */
  async runAllTests(
    page: any,
    url: string,
    testName: string
  ): Promise<EnhancedTestResult> {
    logger.info('Running enhanced test suite', { url, testName });

    // Run visual regression test
    const screenshotPath = await this.visualTester.captureScreenshot(
      page,
      testName
    );
    const visualComparison = await this.visualTester.compareScreenshot(
      testName,
      screenshotPath
    );

    // Run accessibility test
    const accessibilityResult = await this.accessibilityTester.testPage(
      page,
      url
    );

    // Run security scan
    const securityResult = await this.securityTester.scanPage(page, url);

    // Calculate overall result
    const visualPassed = visualComparison.passed;
    const accessibilityPassed = accessibilityResult.score >= 80;
    const securityPassed = securityResult.passed;

    const overallPassed =
      visualPassed && accessibilityPassed && securityPassed;
    const overallScore =
      (accessibilityResult.score + securityResult.score) / 2;

    const result: EnhancedTestResult = {
      visual: {
        passed: visualPassed,
        comparisons: [visualComparison],
      },
      accessibility: {
        passed: accessibilityPassed,
        score: accessibilityResult.score,
        violations: accessibilityResult.violations,
      },
      security: {
        passed: securityPassed,
        score: securityResult.score,
        vulnerabilities: securityResult.vulnerabilities,
      },
      overall: {
        passed: overallPassed,
        score: overallScore,
      },
    };

    logger.info('Enhanced test suite completed', {
      url,
      testName,
      overallPassed,
      overallScore,
    });

    return result;
  }

  /**
   * Generate comprehensive test report
   */
  generateReport(results: EnhancedTestResult[]): string {
    const totalTests = results.length;
    const passedTests = results.filter((r) => r.overall.passed).length;
    const avgScore =
      results.reduce((sum, r) => sum + r.overall.score, 0) / totalTests;

    return `
# Enhanced Test Report

## Summary
- Total Tests: ${totalTests}
- Passed: ${passedTests}
- Failed: ${totalTests - passedTests}
- Average Score: ${avgScore.toFixed(1)}%

## Detailed Results
${results
  .map(
    (r, i) => `
### Test ${i + 1}

#### Visual Regression
- Status: ${r.visual.passed ? '✅ PASSED' : '❌ FAILED'}
- Comparisons: ${r.visual.comparisons.length}

#### Accessibility
- Status: ${r.accessibility.passed ? '✅ PASSED' : '❌ FAILED'}
- Score: ${r.accessibility.score.toFixed(1)}%
- Violations: ${r.accessibility.violations.length}

#### Security
- Status: ${r.security.passed ? '✅ PASSED' : '❌ FAILED'}
- Score: ${r.security.score.toFixed(1)}%
- Vulnerabilities: ${r.security.vulnerabilities.length}

#### Overall
- Status: ${r.overall.passed ? '✅ PASSED' : '❌ FAILED'}
- Score: ${r.overall.score.toFixed(1)}%
`
  )
  .join('')}
`;
  }
}

export default EnhancedTestingSuite;

