import { test, expect } from '@playwright/test';

test.describe('Authentication Flows', () => {
  // Ensure local storage and cookies are clean before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test.describe('Login Flow', () => {
    test('should validate empty inputs and show toast error', async ({ page }) => {
      await page.goto('/login');
      
      // Submit form without filling fields
      await page.click('button[type="submit"]');

      // Check for validation error toast
      const toast = page.locator('.toast-error');
      await expect(toast).toBeVisible();
      await expect(toast).toContainText("Barcha maydonlarni to'ldiring");
    });

    test('should show error toast on API failure', async ({ page }) => {
      await page.goto('/login');

      // Mock the login API to fail
      await page.route('**/api/auth/login', async (route) => {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Email yoki parol noto\'g\'ri'
          })
        });
      });

      // Fill in fields
      await page.fill('#login-email', 'invalid@example.com');
      await page.fill('#login-password', 'wrongpassword');
      await page.click('button[type="submit"]');

      // Verify error toast
      const toast = page.locator('.toast-error');
      await expect(toast).toBeVisible();
      await expect(toast).toContainText('Email yoki parol noto\'g\'ri');
    });

    test('should successfully log in as CUSTOMER and redirect to home', async ({ page }) => {
      await page.goto('/login');

      // Mock the login API to return success for Customer
      await page.route('**/api/auth/login', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              token: 'mock-access-token',
              refreshToken: 'mock-refresh-token',
              user: {
                id: '1',
                email: 'customer@example.com',
                firstName: 'Olim',
                lastName: 'Karimov',
                phone: '+998901234567',
                role: 'CUSTOMER'
              }
            }
          })
        });
      });

      // Fill in fields
      await page.fill('#login-email', 'customer@example.com');
      await page.fill('#login-password', 'password123');
      await page.click('button[type="submit"]');

      // Verify redirect and toast
      const toast = page.locator('.toast-success');
      await expect(toast).toBeVisible();
      await expect(toast).toContainText('Muvaffaqiyatli kirildi!');

      // Should redirect to homepage (baseURL or "/")
      await expect(page).toHaveURL('/');
    });

    test('should successfully log in as HALL_OWNER and redirect to owner dashboard', async ({ page }) => {
      await page.goto('/login');

      // Mock the login API for Hall Owner
      await page.route('**/api/auth/login', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              token: 'mock-access-token',
              refreshToken: 'mock-refresh-token',
              user: {
                id: '2',
                email: 'owner@example.com',
                firstName: 'Sherzod',
                lastName: 'Rustamov',
                phone: '+998907654321',
                role: 'HALL_OWNER'
              }
            }
          })
        });
      });

      await page.fill('#login-email', 'owner@example.com');
      await page.fill('#login-password', 'password123');
      await page.click('button[type="submit"]');

      const toast = page.locator('.toast-success');
      await expect(toast).toBeVisible();
      
      // Should redirect to owner dashboard
      await expect(page).toHaveURL('/owner/dashboard');
    });
  });

  test.describe('Register Flow', () => {
    test('should validate required fields', async ({ page }) => {
      await page.goto('/register');

      // Leave required fields blank and submit
      await page.click('button[type="submit"]');

      const toast = page.locator('.toast-error');
      await expect(toast).toBeVisible();
      await expect(toast).toContainText("Majburiy maydonlarni to'ldiring");
    });

    test('should validate password match', async ({ page }) => {
      await page.goto('/register');

      await page.fill('input[placeholder="Ismingiz"]', 'Ali');
      await page.fill('#register-email', 'ali@example.com');
      await page.fill('#register-password', 'password123');
      await page.fill('#register-confirm-password', 'different123');
      await page.click('button[type="submit"]');

      const toast = page.locator('.toast-error');
      await expect(toast).toBeVisible();
      await expect(toast).toContainText('Parollar mos kelmaydi');
    });

    test('should validate password length', async ({ page }) => {
      await page.goto('/register');

      await page.fill('input[placeholder="Ismingiz"]', 'Ali');
      await page.fill('#register-email', 'ali@example.com');
      await page.fill('#register-password', '123');
      await page.fill('#register-confirm-password', '123');
      await page.click('button[type="submit"]');

      const toast = page.locator('.toast-error');
      await expect(toast).toBeVisible();
      await expect(toast).toContainText("Parol kamida 6 ta belgidan iborat bo'lishi kerak");
    });

    test('should register successfully and redirect to verify OTP', async ({ page }) => {
      await page.goto('/register');

      // Mock register API response
      await page.route('**/api/auth/register', async (route) => {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'User registered successfully. Please verify your email.'
          })
        });
      });

      await page.fill('input[placeholder="Ismingiz"]', 'Ali');
      await page.fill('#register-email', 'ali@example.com');
      await page.fill('#register-password', 'password123');
      await page.fill('#register-confirm-password', 'password123');
      await page.click('button[type="submit"]');

      // Verify success toast and redirect
      const toast = page.locator('.toast-success');
      await expect(toast).toBeVisible();
      await expect(toast).toContainText('Muvaffaqiyatli! Email tasdiqlang');

      await expect(page).toHaveURL(/\/verify-otp\?email=ali%40example\.com/);
    });
  });
});
