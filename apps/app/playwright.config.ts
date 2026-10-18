import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  reporter: 'list',
  outputDir: '.cache/browser-results',
  use: { baseURL: 'http://127.0.0.1:4310', viewport: { width: 1440, height: 1000 }, trace: 'retain-on-failure' },
  webServer: {
    command: 'node scripts/design-preview.mjs',
    url: 'http://127.0.0.1:4310/api/__design/session',
    timeout: 120_000,
    reuseExistingServer: process.env.CMS_REUSE_DESIGN_PREVIEW === 'true',
  },
});
