# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Authentication Flows >> Login Flow >> should successfully log in as HALL_OWNER and redirect to owner dashboard
- Location: tests\auth.spec.ts:90:9

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
- complementary:
  - link "To'yxona Egasi":
    - /url: /owner/dashboard
    - heading "To'yxona Egasi" [level=2]
  - paragraph: Sherzod Rustamov
  - navigation:
    - text: Asosiy
    - link "📊 Dashboard":
      - /url: /owner/dashboard
    - text: To'yxonam
    - link "🏛️ To'yxonam":
      - /url: /owner/my-hall
    - link "➕ Ro'yxatdan o'tkazish":
      - /url: /owner/register-hall
    - link "📋 Bronlar":
      - /url: /owner/bookings
  - link "🌐 Saytga o'tish":
    - /url: /
  - button "🚪 Chiqish"
- main:
  - heading "To'yxona Egasi" [level=3]
  - text: Sherzod Rustamov
  - heading "Dashboard" [level=1]
  - text: 📋 0 Jami bronlar ✅ 0 Tasdiqlangan ⏳ 0 Kutilmoqda
  - heading "Oxirgi bronlar" [level=3]
  - link "Barchasini ko'rish":
    - /url: /owner/bookings
  - link "🏛️ To'yxonamni ko'rish":
    - /url: /owner/my-hall
  - link "➕ Yangi to'yxona qo'shish":
    - /url: /owner/register-hall
- alert
```

# Test source

```ts
  20  |       // Check for validation error toast
  21  |       const toast = page.locator('.toast-error');
  22  |       await expect(toast).toBeVisible();
  23  |       await expect(toast).toContainText("Barcha maydonlarni to'ldiring");
  24  |     });
  25  | 
  26  |     test('should show error toast on API failure', async ({ page }) => {
  27  |       await page.goto('/login');
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
> 120 |       await expect(toast).toBeVisible();
      |                           ^ Error: expect(locator).toBeVisible() failed
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
  189 |       await expect(toast).toBeVisible();
  190 |       await expect(toast).toContainText('Muvaffaqiyatli! Email tasdiqlang');
  191 | 
  192 |       await expect(page).toHaveURL(/\/verify-otp\?email=ali%40example\.com/);
  193 |     });
  194 |   });
  195 | });
  196 | 
```