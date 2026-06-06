# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Authentication Flows >> Register Flow >> should register successfully and redirect to verify OTP
- Location: tests\auth.spec.ts:167:9

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.toast-success')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('.toast-success')

```

```yaml
- text: 📧
- heading "Email tasdiqlash" [level=1]
- paragraph:
  - strong: ali@example.com
  - text: manziliga yuborilgan 6 raqamli kodni kiriting
- textbox
- textbox
- textbox
- textbox
- textbox
- textbox
- button "Tasdiqlash"
- link "← Kirishga qaytish":
  - /url: /login
- alert
```

# Test source

```ts
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
  128 |     test('should validate required fields', async ({ page }) => {
  129 |       await page.goto('/register');
  130 | 
  131 |       // Leave required fields blank and submit
  132 |       await page.click('button[type="submit"]');
  133 | 
  134 |       const toast = page.locator('.toast-error');
  135 |       await expect(toast).toBeVisible();
  136 |       await expect(toast).toContainText("Majburiy maydonlarni to'ldiring");
  137 |     });
  138 | 
  139 |     test('should validate password match', async ({ page }) => {
  140 |       await page.goto('/register');
  141 | 
  142 |       await page.fill('input[placeholder="Ismingiz"]', 'Ali');
  143 |       await page.fill('#register-email', 'ali@example.com');
  144 |       await page.fill('#register-password', 'password123');
  145 |       await page.fill('#register-confirm-password', 'different123');
  146 |       await page.click('button[type="submit"]');
  147 | 
  148 |       const toast = page.locator('.toast-error');
  149 |       await expect(toast).toBeVisible();
  150 |       await expect(toast).toContainText('Parollar mos kelmaydi');
  151 |     });
  152 | 
  153 |     test('should validate password length', async ({ page }) => {
  154 |       await page.goto('/register');
  155 | 
  156 |       await page.fill('input[placeholder="Ismingiz"]', 'Ali');
  157 |       await page.fill('#register-email', 'ali@example.com');
  158 |       await page.fill('#register-password', '123');
  159 |       await page.fill('#register-confirm-password', '123');
  160 |       await page.click('button[type="submit"]');
  161 | 
  162 |       const toast = page.locator('.toast-error');
  163 |       await expect(toast).toBeVisible();
  164 |       await expect(toast).toContainText("Parol kamida 6 ta belgidan iborat bo'lishi kerak");
  165 |     });
  166 | 
  167 |     test('should register successfully and redirect to verify OTP', async ({ page }) => {
  168 |       await page.goto('/register');
  169 | 
  170 |       // Mock register API response
  171 |       await page.route('**/api/auth/register', async (route) => {
  172 |         await route.fulfill({
  173 |           status: 201,
  174 |           contentType: 'application/json',
  175 |           body: JSON.stringify({
  176 |             message: 'User registered successfully. Please verify your email.'
  177 |           })
  178 |         });
  179 |       });
  180 | 
  181 |       await page.fill('input[placeholder="Ismingiz"]', 'Ali');
  182 |       await page.fill('#register-email', 'ali@example.com');
  183 |       await page.fill('#register-password', 'password123');
  184 |       await page.fill('#register-confirm-password', 'password123');
  185 |       await page.click('button[type="submit"]');
  186 | 
  187 |       // Verify success toast and redirect
  188 |       const toast = page.locator('.toast-success');
> 189 |       await expect(toast).toBeVisible();
      |                           ^ Error: expect(locator).toBeVisible() failed
  190 |       await expect(toast).toContainText('Muvaffaqiyatli! Email tasdiqlang');
  191 | 
  192 |       await expect(page).toHaveURL(/\/verify-otp\?email=ali%40example\.com/);
  193 |     });
  194 |   });
  195 | });
  196 | 
```