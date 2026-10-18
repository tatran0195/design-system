import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/ui',
  fullyParallel: false,
  workers: 1,
  timeout: 45_000,
  expect: { timeout: 8000 },
  reporter: 'list',
  outputDir: '.arena/playwright-ui',
  use: {
    baseURL: process.env.UI_REVIEW_BASE_URL ?? 'http://127.0.0.1:3001',
    viewport: { width: 1440, height: 1000 },
    actionTimeout: 10_000,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
});
