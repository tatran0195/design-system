import { resolve } from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { chromium } from '@playwright/test';
import { writeReport } from './architecture/write-report.mjs';

const origin = process.env.CMS_DESIGN_BASE_URL ?? 'http://127.0.0.1:4310';
const browser = await chromium.launch({ headless: true });
const results = [];
try {
  const context = await browser.newContext({ baseURL: origin, viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const marker = await page.request.get('/api/__design/session');
  const markerData = await marker.json();
  if (typeof markerData !== 'object' || markerData === null || typeof markerData.signedIn !== 'boolean')
    throw new Error('Accessibility checks require the explicit local fixture API.');
  await page.request.post('/api/__design/reset');
  for (const url of ['/app', '/app/projects/design-handbook/editor?page=design-handbook-page-0', '/sites/design-handbook/welcome', '/sign-in']) {
    if (url === '/sign-in') await page.request.post('/api/__design/session?state=off');
    await page.goto(url, { waitUntil: 'networkidle' });
    const report = await new AxeBuilder({ page }).analyze();
    results.push({
      url,
      violations: report.violations.map(({ id, impact, help, nodes }) => ({ id, impact, help, targets: nodes.map((node) => node.target) })),
      passes: report.passes.length,
      incomplete: report.incomplete.length,
      manualReview: report.incomplete.map(({ id, impact, nodes }) => ({ id, impact, targets: nodes.map((node) => node.target) })),
    });
    console.log(`${url}: ${report.violations.length} axe violations (${report.incomplete.length} checks need manual review).`);
  }
  await page.request.post('/api/__design/reset');
} finally {
  await browser.close();
}
await writeReport(resolve(import.meta.dirname, '../docs/architecture/evidence/accessibility-final.json'), results);
if (results.some((result) => result.violations.length)) process.exitCode = 1;
