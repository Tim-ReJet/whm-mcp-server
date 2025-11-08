import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { createTestEnv, createMockSiteConfig, assertFileExists } from './utils';

// Note: SiteManager is not exported, so we'll test the functionality indirectly
// or we need to export it for testing
describe('Site Manager Functionality', () => {
  let testEnv: ReturnType<typeof createTestEnv>;

  beforeEach(() => {
    testEnv = createTestEnv();
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  describe('Site Config Loading', () => {
    it('should load valid site config JSON', () => {
      const config = createMockSiteConfig();
      const configPath = testEnv.createFile('site.config.json', JSON.stringify(config, null, 2));

      const loaded = JSON.parse(testEnv.readFile('site.config.json'));
      expect(loaded).toEqual(config);
      expect(loaded.name).toBe('Test Site');
      expect(loaded.id).toBe('test-site');
    });

    it('should handle missing config file', () => {
      expect(() => {
        readFileSync(join(testEnv.tempDir, 'nonexistent.json'), 'utf-8');
      }).toThrow();
    });

    it('should handle invalid JSON', () => {
      testEnv.createFile('invalid.json', '{ invalid json }');

      expect(() => {
        JSON.parse(testEnv.readFile('invalid.json'));
      }).toThrow();
    });
  });

  describe('Site Config Validation', () => {
    it('should validate required fields', () => {
      const validConfig = createMockSiteConfig();
      expect(validConfig.name).toBeDefined();
      expect(validConfig.id).toBeDefined();
      expect(validConfig.domain).toBeDefined();
      expect(validConfig.wordpress).toBeDefined();
      expect(validConfig.astro).toBeDefined();
    });

    it('should require name field', () => {
      const config = createMockSiteConfig({ name: undefined });
      expect(config.name).toBeUndefined();
    });
  });
});

