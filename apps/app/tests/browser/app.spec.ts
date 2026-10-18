import { expect, type Page, test } from '@playwright/test';

function observe(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  return errors;
}

test.beforeEach(async ({ request }) => {
  // Refuse to exercise a normal app/real backend accidentally.
  const probe = await request.get('/api/__design/session');
  expect(probe.headers()['content-type']).toContain('application/json');
  expect(await probe.json()).toHaveProperty('signedIn');
  await request.post('/api/__design/reset');
});

test('dashboard hydrates cleanly and command search navigates with the keyboard', async ({ page }) => {
  const errors = observe(page);
  await page.goto('/app');
  await expect(page.getByRole('heading', { name: 'Your sites' })).toBeVisible();
  await expect(page.getByText('Company handbook', { exact: true })).toBeVisible();
  await page.keyboard.press('Control+k');
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('combobox').fill('handbook');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/app\/projects\/design-handbook/);
  await expect(page.getByText('MSW mock preview', { exact: false })).toBeVisible();
  expect(errors).toEqual([]);
});

test('editor uses shared document typography and modal focus stays above its sidebar', async ({ page }) => {
  const errors = observe(page);
  await page.goto('/app/projects/design-handbook/editor?page=design-handbook-page-0');
  await expect(page.getByRole('textbox', { name: 'Page title' })).toHaveValue('Welcome');
  const heading = page.locator('.pl-editor .tiptap h1').first();
  await expect(heading).toBeVisible();
  expect(await heading.evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize))).toBeGreaterThan(20);
  const opener = page.getByRole('button', { name: 'Page settings', exact: true }).last();
  await opener.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect.poll(() => dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  const layer = await dialog.evaluate((element) => Number.parseFloat(getComputedStyle(element).zIndex));
  expect(layer).toBeGreaterThanOrEqual(50);
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(opener).toBeFocused();
  expect(errors).toEqual([]);
});

test('RHF document edits keep the original autosave request contract', async ({ page }) => {
  const errors = observe(page);
  await page.goto('/app/projects/design-handbook/editor?page=design-handbook-page-0');
  const title = page.getByRole('textbox', { name: 'Page title' });
  await expect(title).toHaveValue('Welcome');
  const saved = page.waitForResponse(
    (response) => response.url().includes('/pages/design-handbook-page-0') && response.request().method() === 'PATCH',
  );
  await title.fill('Welcome updated');
  const response = await saved;
  expect(response.ok()).toBe(true);
  expect(response.request().postDataJSON()).toMatchObject({ title: 'Welcome updated' });
  await expect(title).toHaveValue('Welcome updated');
  const restored = page.waitForResponse(
    (response) => response.url().includes('/pages/design-handbook-page-0') && response.request().method() === 'PATCH',
  );
  await title.fill('Welcome');
  await restored;
  expect(errors).toEqual([]);
});

test('theme and Arabic interface work through native account/menu/dialog controls', async ({ page }) => {
  const errors = observe(page);
  await page.goto('/app');
  const account = page.getByRole('button', { name: /Alex Morgan/ });
  await account.click();
  await page.getByRole('menuitem', { name: /Dark mode/i }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await account.click();
  await page.getByRole('menuitem', { name: /language/i }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('option', { name: /Arabic/ }).click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await page.reload();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  expect(errors).toEqual([]);
});

test('published documentation retains reader rendering and typography', async ({ page }) => {
  const errors = observe(page);
  await page.goto('/sites/design-handbook/welcome');
  await expect(page.getByRole('heading', { name: 'Welcome', exact: true }).first()).toBeVisible();
  const heading = page.locator('.typeset h2').first();
  await expect(heading).toBeVisible();
  const paragraphSize = await page
    .locator('.typeset p')
    .first()
    .evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize));
  expect(await heading.evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize))).toBeGreaterThan(paragraphSize);
  expect(await heading.evaluate((element) => Number.parseInt(getComputedStyle(element).fontWeight, 10))).toBeGreaterThanOrEqual(600);
  await expect(page.getByText('Made with CMS', { exact: false })).toBeVisible();
  expect(errors).toEqual([]);
});

test('mobile sidebar is a native dismissible modal without horizontal overflow', async ({ page }) => {
  const errors = observe(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/app');
  await expect(page.getByRole('heading', { name: 'Your sites' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 2)).toBe(true);
  await page.getByRole('button', { name: 'Toggle Sidebar' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  expect(errors).toEqual([]);
});

test('internal signup has no SaaS marketing or mandatory public legal consent', async ({ page, request }) => {
  const errors = observe(page);
  await request.post('/api/__design/session?state=off');
  await page.goto('/sign-up');
  await expect(page.getByRole('textbox', { name: /Email/ })).toBeVisible();
  await expect(page.locator('#agree-terms')).toHaveCount(0);
  await expect(page.getByText('CMS Cloud', { exact: false })).toHaveCount(0);
  await expect(page.getByText('Managed hosting', { exact: false })).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('demo email/OTP uses the ordinary auth contract and latest complete code', async ({ page, request }) => {
  const errors = observe(page);
  await request.post('/api/__design/session?state=off');
  await page.goto('/sign-in');
  await page.getByRole('textbox', { name: /Email/ }).fill('alex@company.test');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  const code = page.locator('input[inputmode="numeric"]').first();
  await expect(code).toBeVisible();
  await code.focus();
  // Multi-cell OTP deliberately moves focus between native inputs.
  // Use human typing cadence rather than issuing six keys in one task.
  await page.keyboard.type('123456', { delay: 100 });
  await expect(page).toHaveURL(/\/app$/);
  await expect(page.getByRole('heading', { name: 'Your sites' })).toBeVisible();
  expect(errors).toEqual([]);
});
