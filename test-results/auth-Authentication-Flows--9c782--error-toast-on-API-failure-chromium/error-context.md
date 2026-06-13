# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Authentication Flows >> Login Flow >> should show error toast on API failure
- Location: tests\auth.spec.ts:26:9

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: net::ERR_INSUFFICIENT_RESOURCES at http://127.0.0.1:3000/login
Call log:
  - navigating to "http://127.0.0.1:3000/login", waiting until "load"

```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Authentication Flows', () => {
  4   |   // Ensure local storage and cookies are clean before each test
  5   |   test.beforeEach(async ({ page }) => {
  6   |     await page.goto('/');
  7   |     await page.evaluate(() => {
  8   |       localStorage.clear();
  9   |       sessionStorage.clear();
  10  |     });
  11  |   });
  12  | 
  13  |   test.describe('Login Flow', () => {
  14  |     test('should validate empty inputs and show toast error', async ({ page }) => {
  15  |       await page.goto('/login');
  16  |       
  17  |       // Submit form without filling fields
  18  |       await page.click('button[type="submit"]');
  19  | 
  20  |       // Check for validation error toast
  21  |       const toast = page.locator('.toast-error');
  22  |       await expect(toast).toBeVisible();
  23  |       await expect(toast).toContainText("Barcha maydonlarni to'ldiring");
  24  |     });
  25  | 
  26  |     test('should show error toast on API failure', async ({ page }) => {
> 27  |       await page.goto('/login');
      |                  ^ Error: page.goto: net::ERR_INSUFFICIENT_RESOURCES at http://127.0.0.1:3000/login
  28  | 
  29  |       // Mock the login API to fail
  30  |       await page.route('**/api/auth/login', async (route) => {
  31  |         await route.fulfill({
  32  |           status: 400,
  33  |           contentType: 'application/json',
  34  |           body: JSON.stringify({
  35  |             message: 'Email yoki parol noto\'g\'ri'
  36  |           })
  37  |         });
  38  |       });
  39  | 
  40  |       // Fill in fields
  41  |       await page.fill('#login-email', 'invalid@example.com');
  42  |       await page.fill('#login-password', 'wrongpassword');
  43  |       await page.click('button[type="submit"]');
  44  | 
  45  |       // Verify error toast
  46  |       const toast = page.locator('.toast-error');
  47  |       await expect(toast).toBeVisible();
  48  |       await expect(toast).toContainText('Email yoki parol noto\'g\'ri');
  49  |     });
  50  | 
  51  |     test('should successfully log in as CUSTOMER and redirect to home', async ({ page }) => {
  52  |       await page.goto('/login');
  53  | 
  54  |       // Mock the login API to return success for Customer
  55  |       await page.route('**/api/auth/login', async (route) => {
  56  |         await route.fulfill({
  57  |           status: 200,
  58  |           contentType: 'application/json',
  59  |           body: JSON.stringify({
  60  |             data: {
  61  |               token: 'mock-access-token',
  62  |               refreshToken: 'mock-refresh-token',
  63  |               user: {
  64  |                 id: '1',
  65  |                 email: 'customer@example.com',
  66  |                 firstName: 'Olim',
  67  |                 lastName: 'Karimov',
  68  |                 phone: '+998901234567',
  69  |                 role: 'CUSTOMER'
  70  |               }
  71  |             }
  72  |           })
  73  |         });
  74  |       });
  75  | 
  76  |       // Fill in fields
  77  |       await page.fill('#login-email', 'customer@example.com');
  78  |       await page.fill('#login-password', 'password123');
  79  |       await page.click('button[type="submit"]');
  80  | 
  81  |       // Verify redirect and toast
  82  |       const toast = page.locator('.toast-success');
  83  |       await expect(toast).toBeVisible();
  84  |       await expect(toast).toContainText('Muvaffaqiyatli kirildi!');
  85  | 
  86  |       // Should redirect to homepage (baseURL or "/")
  87  |       await expect(page).toHaveURL('/');
  88  |     });
  89  | 
  90  |     test('should successfully log in as HALL_OWNER and redirect to owner dashboard', async ({ page }) => {
  91  |       await page.goto('/login');
  92  | 
  93  |       // Mock the login API for Hall Owner
  94  |       await page.route('**/api/auth/login', async (route) => {
  95  |         await route.fulfill({
  96  |           status: 200,
  97  |           contentType: 'application/json',
  98  |           body: JSON.stringify({
  99  |             data: {
  100 |               token: 'mock-access-token',
  101 |               refreshToken: 'mock-refresh-token',
  102 |               user: {
  103 |                 id: '2',
  104 |                 email: 'owner@example.com',
  105 |                 firstName: 'Sherzod',
  106 |                 lastName: 'Rustamov',
  107 |                 phone: '+998907654321',
  108 |                 role: 'HALL_OWNER'
  109 |               }
  110 |             }
  111 |           })
  112 |         });
  113 |       });
  114 | 
  115 |       await page.fill('#login-email', 'owner@example.com');
  116 |       await page.fill('#login-password', 'password123');
  117 |       await page.click('button[type="submit"]');
  118 | 
  119 |       const toast = page.locator('.toast-success');
  120 |       await expect(toast).toBeVisible();
  121 |       
  122 |       // Should redirect to owner dashboard
  123 |       await expect(page).toHaveURL('/owner/dashboard');
  124 |     });
  125 |   });
  126 | 
  127 |   test.describe('Register Flow', () => {
```