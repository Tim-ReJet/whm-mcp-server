/**
 * Deployment Health Checker
 * Performs health checks after deployment
 */

import { logger } from '../../observability/src/logging/logger.js';

export interface HealthCheckResult {
  status: 'passing' | 'failing' | 'timeout';
  responseTime?: number;
  statusCode?: number;
  error?: string;
  timestamp: Date;
}

export interface HealthCheckConfig {
  url: string;
  timeout?: number;
  retries?: number;
  expectedStatus?: number;
  expectedContent?: string;
}

export class DeploymentHealthChecker {
  private defaultTimeout: number = 30000; // 30 seconds
  private defaultRetries: number = 3;

  /**
   * Perform health check
   */
  async check(config: HealthCheckConfig): Promise<HealthCheckResult> {
    const timeout = config.timeout || this.defaultTimeout;
    const retries = config.retries || this.defaultRetries;
    const expectedStatus = config.expectedStatus || 200;

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const startTime = Date.now();
        const response = await this.fetchWithTimeout(config.url, timeout);

        const responseTime = Date.now() - startTime;
        const statusCode = response.status;

        // Check status code
        if (statusCode !== expectedStatus) {
          throw new Error(`Expected status ${expectedStatus}, got ${statusCode}`);
        }

        // Check content if specified
        if (config.expectedContent) {
          const content = await response.text();
          if (!content.includes(config.expectedContent)) {
            throw new Error(`Expected content not found: ${config.expectedContent}`);
          }
        }

        const result: HealthCheckResult = {
          status: 'passing',
          responseTime,
          statusCode,
          timestamp: new Date(),
        };

        logger.info('Health check passed', {
          url: config.url,
          responseTime,
          attempt,
        });

        return result;
      } catch (error) {
        lastError = error as Error;
        logger.warn('Health check attempt failed', {
          url: config.url,
          attempt,
          error: lastError.message,
        });

        if (attempt < retries) {
          // Wait before retry (exponential backoff)
          await this.sleep(1000 * attempt);
        }
      }
    }

    // All retries failed
    const result: HealthCheckResult = {
      status: 'failing',
      error: lastError?.message || 'Health check failed',
      timestamp: new Date(),
    };

    logger.error('Health check failed after retries', {
      url: config.url,
      retries,
      error: lastError?.message,
    });

    return result;
  }

  /**
   * Fetch with timeout
   */
  private async fetchWithTimeout(url: string, timeout: number): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'ReactorBro-HealthCheck/1.0',
        },
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms`);
      }
      throw error;
    }
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Perform multiple health checks
   */
  async checkMultiple(configs: HealthCheckConfig[]): Promise<HealthCheckResult[]> {
    const results = await Promise.all(
      configs.map(config => this.check(config))
    );

    return results;
  }

  /**
   * Check if all health checks passed
   */
  allPassed(results: HealthCheckResult[]): boolean {
    return results.every(result => result.status === 'passing');
  }
}

export default DeploymentHealthChecker;

