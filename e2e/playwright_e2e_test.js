const { test, expect } = require('@playwright/test');
require('dotenv').config({ path: 'config/.env' });

/**
 * QA Learner Journey E2E
 * 1) Read BASE_URL from env
 * 2) Navigate to app
 * 3) Register new user
 * 4) Login with same credentials
 * 5) Search for "hammer"
 * 6) Open first product
 * 7) Add product to cart
 * 8) Verify cart count increments
 */
test('learner journey: register, login, search, and add to cart', async ({ page }) => {
  const baseURL = process.env.BASE_URL || 'https://with-bugs.practicesoftwaretesting.com';

  const timestamp = Date.now();
  const user = {
    firstName: 'Aarav',
    lastName: `Sharma${String(timestamp).slice(-4)}`,
    dateOfBirth: '1997-08-17',
    street: '42 MG Road',
    postalCode: '560001',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    phone: '9876543210',
    email: `qa.intern.${timestamp}@example.com`,
    password: `Qa!${timestamp}`,
  };

  // Step 1-2: Open application from env-based URL.
  await page.goto(baseURL, { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/with-bugs\.practicesoftwaretesting\.com/);

  // Step 3: Register new user and fail fast with descriptive error if registration breaks.
  try {
    await page.getByRole('link', { name: /sign in/i }).waitFor({ state: 'visible' });
    await page.getByRole('link', { name: /sign in/i }).click();

    await page.getByRole('link', { name: /register your account/i }).waitFor({ state: 'visible' });
    await page.getByRole('link', { name: /register your account/i }).click();

    await expect(page).toHaveURL(/\/auth\/register/);

    await page.getByLabel(/first name/i).fill(user.firstName);
    await page.getByLabel(/last name/i).fill(user.lastName);
    await page.getByLabel(/date of birth/i).fill(user.dateOfBirth);
    await page.getByLabel(/street/i).fill(user.street);
    await page.getByLabel(/postal code/i).fill(user.postalCode);
    await page.getByLabel(/^city$/i).fill(user.city);
    await page.getByLabel(/^state$/i).fill(user.state);
    await page.getByLabel(/country/i).selectOption({ label: user.country });
    await page.getByLabel(/phone/i).fill(user.phone);
    await page.getByLabel(/email/i).fill(user.email);
    await page.getByLabel(/^password$/i).fill(user.password);

    await page.getByRole('button', { name: /^register$/i }).click();
    await expect(page).toHaveURL(/\/auth\/login/);
  } catch (error) {
    throw new Error(`Registration failure: ${error.message}`);
  }

  // Step 4: Login with the newly-created account.
  try {
    await page.getByLabel(/email/i).fill(user.email);
    await page.getByLabel(/password/i).fill(user.password);
    await page.getByRole('button', { name: /^login$/i }).click();

    // Explicit wait for successful authenticated state (home URL + cart icon visible).
    await expect(page).toHaveURL(/with-bugs\.practicesoftwaretesting\.com/);
    await expect(page.locator('[data-test="nav-cart"]')).toBeVisible();
  } catch (error) {
    throw new Error(`Login failure: ${error.message}`);
  }

  // Step 5-6: Search for hammer and open first product result.
  try {
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.waitFor({ state: 'visible' });
    await searchInput.fill('hammer');
    await searchInput.press('Enter');

    const firstProductCard = page.locator('[data-test="product-card"]').first();
    await firstProductCard.waitFor({ state: 'visible' });
    await firstProductCard.click();

    await expect(page.getByRole('button', { name: /add to cart/i })).toBeVisible();
  } catch (error) {
    throw new Error(`Product search failure: ${error.message}`);
  }

  // Step 7-8: Add to cart and verify cart badge increments.
  try {
    const cartBadge = page.locator('[data-test="nav-cart"] .badge');
    const beforeCountText = ((await cartBadge.textContent()) || '0').trim();
    const beforeCount = Number(beforeCountText) || 0;

    await page.getByRole('button', { name: /add to cart/i }).click();

    await expect
      .poll(async () => {
        const text = ((await cartBadge.textContent()) || '0').trim();
        return Number(text) || 0;
      }, { timeout: 10000, message: 'Cart count did not increment after adding product' })
      .toBeGreaterThan(beforeCount);

    const afterCountText = ((await cartBadge.textContent()) || '0').trim();
    const afterCount = Number(afterCountText) || 0;
    expect(afterCount).toBeGreaterThan(beforeCount);
  } catch (error) {
    throw new Error(`Cart assertion failure: ${error.message}`);
  }
});
