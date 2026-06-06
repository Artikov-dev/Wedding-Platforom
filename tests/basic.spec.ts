import { test, expect } from '@playwright/test';

test.describe('App smoke tests', () => {
  test('homepage loads and shows updated contact email', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /artikovrozimuhammadxon@gmail.com/i })).toBeVisible();
  });

  test('login page loads and shows auth fields', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/parol/i)).toBeVisible();
  });

  test('register page loads and shows auth fields', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel('Parol *')).toBeVisible();
    await expect(page.getByLabel(/parolni tasdiqlang/i)).toBeVisible();
  });

  test('email API rejects invalid payload', async ({ request }) => {
    const response = await request.post('/api/email', { data: { subject: 'Test only' } });
    await expect(response.status()).toBe(400);
    await expect(response.ok()).toBeFalsy();
  });
});
