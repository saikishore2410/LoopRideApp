const { test, expect } = require('@playwright/test');

test('rider UI loads, selects a destination and displays a fare estimate', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Loop Ride App');
  await expect(page.getByRole('heading', { name: 'Where would you like to go?' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Rider App/ })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: /Gachibowli/ }).click();
  await expect(page.locator('#message')).toContainText('Destination selected: Gachibowli');
  await expect(page.locator('#summaryFare')).toHaveText('₹99');
  await expect(page.locator('#summaryDistance')).toHaveText('8.2 km');
});

test('rider can search destinations and see an empty state for unmatched text', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Search destinations' }).fill('char');
  await expect(page.getByRole('button', { name: /Charminar/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Gachibowli/ })).toBeHidden();
  await page.getByRole('searchbox', { name: 'Search destinations' }).fill('not a place');
  await expect(page.getByText('No destinations match your search.')).toBeVisible();
});

test('user can switch between Rider and Driver views', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Driver App/ }).click();
  await expect(page.getByRole('heading', { name: 'Driver dashboard' })).toBeVisible();
  await expect(page.locator('#driver')).toBeVisible();
  await expect(page.locator('#rider')).toBeHidden();
  await page.getByRole('button', { name: /Rider App/ }).click();
  await expect(page.getByRole('heading', { name: 'Where would you like to go?' })).toBeVisible();
  await expect(page.locator('#driver')).toBeHidden();
});

test('driver online toggle changes visible status and busy zones are rendered', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Driver App/ }).click();
  const online = page.locator('#online');
  await expect(page.locator('#driverStatus')).toContainText('offline');
  await online.check();
  await expect(page.locator('#driverStatus')).toContainText('ONLINE');
  await online.uncheck();
  await expect(page.locator('#driverStatus')).toContainText('offline');
  await expect(page.getByRole('heading', { name: 'HITEC City' })).toBeVisible();
  await expect(page.getByText('Sample bonus ₹40')).toBeVisible();
});

test('request ride clearly states that this is a demo, then trip can be cleared', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Pickup location').fill('JNTU, Kukatpally');
  await page.getByRole('button', { name: /Gachibowli/ }).click();
  await page.getByRole('button', { name: 'Request demo ride' }).click();
  await expect(page.getByRole('status')).toContainText('No real driver has been contacted');
  await page.getByRole('button', { name: 'Clear trip' }).click();
  await expect(page.locator('#tripSummary')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Request demo ride' })).toBeDisabled();
});

test('responsive layout fits a mobile viewport without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth
  }));
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);
  await expect(page.getByRole('heading', { name: 'Where would you like to go?' })).toBeVisible();
  await page.getByRole('button', { name: /Driver App/ }).click();
  await expect(page.getByRole('heading', { name: 'Driver dashboard' })).toBeVisible();
});

test('browser has no uncaught page errors during primary navigation', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  await page.goto('/');
  await page.getByRole('button', { name: /Driver App/ }).click();
  await page.getByRole('button', { name: /Rider App/ }).click();
  await page.getByRole('button', { name: /Charminar/ }).click();
  await expect(page.locator('#message')).toContainText('Destination selected: Charminar');
  expect(pageErrors).toEqual([]);
});
