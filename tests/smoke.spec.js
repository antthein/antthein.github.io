const { test, expect } = require('playwright/test');

test('home loads and core nav works', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Antt Hein \| Portfolio/i);
  await page.locator('a.nav-link[href="#projects"]').click();
  await expect(page.locator('#projects')).toBeInViewport();
});

test('creative hub nav link scrolls to section', async ({ page }) => {
  await page.goto('/');
  await page.locator('a.nav-link[href="#creative-hub"]').click();
  await expect(page.locator('#creative-hub')).toBeInViewport();
});

test('project modal opens and closes', async ({ page }) => {
  await page.goto('/');
  await page.locator('a.nav-link[href="#projects"]').click();
  await page.getByRole('button', { name: 'View Details' }).first().click();
  await expect(page.locator('#projectModal.open')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#projectModal.open')).toHaveCount(0);
});

test('cv modal opens and closes by escape', async ({ page }) => {
  await page.goto('/');
  await page.locator('#cvDownloadBtn').click();
  await expect(page.locator('#cvEmailModal.open')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#cvEmailModal.open')).toHaveCount(0);
});

test('contact form shows validation errors', async ({ page }) => {
  await page.goto('/');
  await page.locator('a.nav-link[href="#contact"]').click();
  await page.locator('#contactForm button[type="submit"]').click();
  await expect(page.locator('#name + .error')).toContainText('Please enter your name');
  await expect(page.locator('#email + .error')).toContainText('Please enter a valid email');
});
