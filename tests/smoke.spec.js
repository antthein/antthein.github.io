const { test, expect } = require('playwright/test');

test('home loads with hero and six cards', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Antt Hein \| Portfolio/i);
  await expect(page.locator('#heroName')).toBeVisible();
  await expect(page.locator('.cards .card')).toHaveCount(6);
});

test('card opens its panel in place and back returns to cards', async ({ page }) => {
  await page.goto('/');
  await page.locator('.card[href="#projects"]').click();
  await expect(page.locator('#projects')).toBeVisible();
  await expect(page.locator('#home')).toBeHidden();
  await page.locator('#projects [data-back]').click();
  await expect(page.locator('#home')).toBeVisible();
  await expect(page.locator('#projects')).toBeHidden();
});

test('browser back and escape close a panel', async ({ page }) => {
  await page.goto('/');
  await page.locator('.card[href="#experience"]').click();
  await expect(page.locator('#experience')).toBeVisible();
  await page.goBack();
  await expect(page.locator('#home')).toBeVisible();
  await page.locator('.card[href="#lab"]').click();
  await expect(page.locator('#lab')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#home')).toBeVisible();
});

test('deep link opens a panel directly', async ({ page }) => {
  await page.goto('/#certificates');
  await expect(page.locator('#certificates')).toBeVisible();
  await expect(page.locator('#home')).toBeHidden();
});

test('project modal opens and closes', async ({ page }) => {
  await page.goto('/#projects');
  await page.locator('#projects').getByRole('button', { name: 'Details' }).first().click();
  await expect(page.locator('#projectModal.open')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#projectModal.open')).toHaveCount(0);
  await expect(page.locator('#projects')).toBeVisible();
});

test('certificate gallery opens', async ({ page }) => {
  await page.goto('/#certificates');
  await page.locator('.cert-item[data-cert-images]').first().click();
  await expect(page.locator('#certModal.open')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#certModal.open')).toHaveCount(0);
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
  await page.locator('.card[href="#contact"]').click();
  await page.locator('#contactForm button[type="submit"]').click();
  await expect(page.locator('#name + .error')).toContainText('Please enter your name');
  await expect(page.locator('#email + .error')).toContainText('Please enter a valid email');
});

test('theme switch sets and remembers dark mode', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-theme-pref="dark"]').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('[data-theme-pref="dark"]')).toHaveAttribute('aria-pressed', 'true');
});

test('desktop home fits one screen without page scroll', async ({ page }) => {
  for (const size of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    await page.setViewportSize(size);
    await page.goto('/');
    const overflow = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
    expect(overflow, `page scrolls at ${size.width}x${size.height}`).toBeLessThanOrEqual(0);
    const cardsBottom = await page.locator('.cards').evaluate((el) => el.getBoundingClientRect().bottom);
    expect(cardsBottom, `cards clipped at ${size.width}x${size.height}`).toBeLessThanOrEqual(size.height);
  }
});

test('robot assistant opens and answers', async ({ page }) => {
  await page.goto('/');
  await page.locator('#botToggle').click();
  await expect(page.locator('#botPanel')).toBeVisible();
  await page.locator('#botSuggestions button', { hasText: 'Contact' }).click();
  await expect(page.locator('#botMessages')).toContainText('antthein.dev@gmail.com');
});

test('phone layout has no sideways scroll', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  const extra = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(extra).toBeLessThanOrEqual(0);
});

test('old site section links open the matching card', async ({ page }) => {
  await page.goto('/#creative-hub');
  await expect(page.locator('#lab')).toBeVisible();
  await page.goto('/#certifications');
  await expect(page.locator('#certificates')).toBeVisible();
});

test('AB-730 certificate shows Microsoft verify link', async ({ page }) => {
  await page.goto('/#certificates');
  await page.locator('.cert-item[data-cert-link]').click();
  await expect(page.locator('#certVerify')).toBeVisible();
  await expect(page.locator('#certVerify')).toHaveAttribute('href', /learn\.microsoft\.com/);
  await page.keyboard.press('Escape');
  await page.locator('.cert-item[data-cert-images]').nth(1).click();
  await expect(page.locator('#certVerify')).toBeHidden();
});

test('scrolling on the one-screen home shows a friendly hint and edge glow', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.mouse.move(700, 400);
  await page.mouse.wheel(0, 300);
  await expect(page.locator('#scrollToast')).toHaveClass(/is-on/);
  await expect(page.locator('#scrollToast')).toContainText(/scroll|bottom|card|page/i);
  await expect(page.locator('.edge-glow-bottom')).toHaveClass(/is-on/);
});

test('scroll hint stays off on phones', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await expect(page.locator('#scrollToast')).toBeHidden();
});
