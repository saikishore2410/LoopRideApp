const { test, expect } = require('@playwright/test');

test('rider UI loads and destination selection calls the rider API', async ({ page }) => {
  const riderResponse = page.waitForResponse(
    response => response.url().endsWith('/api/rider') && response.request().method() === 'GET'
  );

  await page.goto('/');
  await expect(page).toHaveTitle('Loop Ride App');
  await expect(page.getByRole('heading', { name: 'Where do you want to go?' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Rider App' })).toHaveClass(/active/);

  await page.getByText('Gachibowli', { exact: true }).first().click();
  const response = await riderResponse;
  expect(response.status()).toBe(200);
  await expect(page.locator('#message')).toContainText('Destination: Gachibowli');
  await expect(page.locator('#message')).toContainText('Status: ready');
});

test('user can switch between Rider and Driver views', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Driver App' }).click();
  await expect(page.getByRole('heading', { name: 'Driver Dashboard' })).toBeVisible();
  await expect(page.locator('#driver')).toBeVisible();
  await expect(page.locator('#rider')).toBeHidden();

  await page.getByRole('button', { name: 'Rider App' }).click();
  await expect(page.getByRole('heading', { name: 'Where do you want to go?' })).toBeVisible();
  await expect(page.locator('#driver')).toBeHidden();
});

test('driver online toggle changes the visible status and busy zones are rendered', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Driver App' }).click();

  const online = page.locator('#online');
  await expect(page.locator('#driverStatus')).toContainText('offline');
  await online.check();
  await expect(page.locator('#driverStatus')).toContainText('ONLINE');
  await online.uncheck();
  await expect(page.locator('#driverStatus')).toContainText('offline');

  await expect(page.getByText('HITEC City')).toBeVisible();
  await expect(page.getByText('Bonus ₹40')).toBeVisible();
});

test('browser has no uncaught page errors during primary navigation', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  await page.goto('/');
  await page.getByRole('button', { name: 'Driver App' }).click();
  await page.getByRole('button', { name: 'Rider App' }).click();
  await page.getByText('Charminar', { exact: true }).click();
  await expect(page.locator('#message')).toContainText('Status: ready');
  expect(pageErrors).toEqual([]);
});
