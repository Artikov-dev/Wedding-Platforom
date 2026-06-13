import { test, expect } from '@playwright/test';

test.describe('Owner Dashboard Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear local storage
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('should display owner dashboard with demo data on API failure', async ({ page }) => {
    // 1. Mock login to return an Owner account
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            token: 'mock-owner-token',
            refreshToken: 'mock-refresh-token',
            user: {
              id: 'owner_123',
              email: 'owner@test.uz',
              firstName: 'Test',
              lastName: 'Owner',
              role: 'HALL_OWNER'
            }
          }
        })
      });
    });

    // 2. Mock halls and bookings API calls to fail, so dashboard uses DEMO_BOOKINGS
    await page.route('**/api/halls/search*', async (route) => {
      await route.fulfill({ status: 500, body: 'Error' });
    });
    await page.route('**/api/bookings*', async (route) => {
      await route.fulfill({ status: 500, body: 'Error' });
    });

    // 3. Login
    await page.goto('/login');
    await page.fill('#login-email', 'owner@test.uz');
    await page.fill('#login-password', 'password123');
    await page.click('button[type="submit"]');

    // 4. Wait for redirect to owner dashboard
    await page.waitForURL('**/owner/dashboard');

    // 5. Assertions
    // Title
    await expect(page.locator('h1.page-title')).toContainText('Dashboard');
    
    // Revenue Banner (since DEMO_BOOKINGS has confirmed bookings, revenue should be calculated)
    const revenueText = await page.locator('text=Jami daromad').locator('..').textContent();
    expect(revenueText).toContain('so\'m');

    // Stats Grid
    await expect(page.locator('.stat-label >> text=To\'yxonalar')).toBeVisible();
    await expect(page.locator('.stat-label >> text=Jami bronlar')).toBeVisible();

    // Table
    await expect(page.locator('table.table')).toBeVisible();
    await expect(page.locator('text=Visol to\'yxonasi')).toBeVisible(); // from DEMO_BOOKINGS
  });
});
