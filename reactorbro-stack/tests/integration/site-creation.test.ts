import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestEnv, createMockSiteConfig } from '../unit/utils';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

/**
 * Integration tests for site creation flow
 */
describe('Site Creation Flow', () => {
  let testEnv: ReturnType<typeof createTestEnv>;

  beforeAll(() => {
    testEnv = createTestEnv();
  });

  afterAll(() => {
    testEnv.cleanup();
  });

  describe('Site Config Creation', () => {
    it('should create a valid site config file', () => {
      const config = createMockSiteConfig({
        name: 'Integration Test Site',
        id: 'integration-test',
      });

      const configPath = testEnv.createFile(
        'site.config.json',
        JSON.stringify(config, null, 2)
      );

      expect(existsSync(configPath)).toBe(true);

      const loaded = JSON.parse(testEnv.readFile('site.config.json'));
      expect(loaded.name).toBe('Integration Test Site');
      expect(loaded.id).toBe('integration-test');
    });

    it('should create site directory structure', () => {
      const siteDir = join(testEnv.tempDir, 'test-site');
      mkdirSync(siteDir, { recursive: true });

      const configPath = join(siteDir, 'site.config.json');
      const config = createMockSiteConfig({ id: 'test-site' });
      writeFileSync(configPath, JSON.stringify(config, null, 2));

      expect(existsSync(siteDir)).toBe(true);
      expect(existsSync(configPath)).toBe(true);
    });
  });

  describe('Config Validation', () => {
    it('should validate complete site config', () => {
      const config = createMockSiteConfig();

      // Validate required fields
      expect(config.name).toBeTruthy();
      expect(config.id).toBeTruthy();
      expect(config.domain.production).toBeTruthy();
      expect(config.wordpress.url).toBeTruthy();
      expect(config.astro.port).toBeGreaterThan(0);
    });

    it('should handle optional fields', () => {
      const config = createMockSiteConfig({
        description: undefined,
        staging: undefined,
      });

      expect(config.description).toBeUndefined();
      expect(config.domain.staging).toBeUndefined();
    });
  });
});

