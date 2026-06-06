# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Authentication Flows >> Login Flow >> should successfully log in as CUSTOMER and redirect to home
- Location: tests\auth.spec.ts:51:9

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
    - waiting for" http://127.0.0.1:3000/" navigation to finish...
    - navigated to "http://127.0.0.1:3000/"

```

```yaml
- banner:
  - link "To'yxona.uz":
    - /url: /
  - navigation:
    - link "Bosh sahifa":
      - /url: /
    - link "To'yxonalar":
      - /url: /halls
    - link "Bronlarim":
      - /url: /my-bookings
    - link "Sevimlilar":
      - /url: /favorites
  - text: Olim
  - button "Chiqish"
- text: ♥ ✦ ✦ Hayotingizdagi eng muhim kun uchun
- heading "Orzuingizdagi to'yni biz bilan rejalashtiring" [level=1]
- paragraph: O'zbekistondagi eng sara to'yxonalarni kashf eting, taqqoslang va bir necha daqiqada online bron qiling. Har bir tafsilot sizning maxsus kuningiz uchun.
- link "To'yxonalarni ko'rish":
  - /url: /halls
- link "Bepul ro'yxatdan o'tish":
  - /url: /register
- text: 200+ To'yxonalar 5,000+ Muvaffaqiyatli to'ylar 4.8 O'rtacha reyting 🏛️ Luxury Wedding Hall Interior 💐 Elegant Decor 🎂 Wedding Cake ✦ Eng sara to'yxonalar
- heading "Mashhur to'yxonalar" [level=2]
- paragraph: Toshkentdagi eng yaxshi va ishonchli to'yxonalarni kashf eting
- text: 🏛️ Luxury Wedding Hall Interior Premium
- button "Sevimli": 🤍
- heading "Navro'z Palace" [level=3]
- text: 📍 Yunusobod tumani 👥 500 kishi ⭐ 4.9
- paragraph: Toshkentdagi eng hashamatli to'y marosimlarini o'tkazish uchun mo'ljallangan zamonaviy saroy
- text: 180 000 - 250 000 so'm 1 kishi uchun
- link "Batafsil →":
  - /url: /halls/1
- text: ✨ Grand Ballroom for 400 Guests Mashhur
- button "Sevimli": 🤍
- heading "Grand Tashkent" [level=3]
- text: 📍 Mirobod tumani 👥 400 kishi ⭐ 4.8
- paragraph: Klassik uslubdagi keng va yorug' zal, 400 kishilik sig'im bilan
- text: 150 000 - 200 000 so'm 1 kishi uchun
- link "Batafsil →":
  - /url: /halls/2
- text: 👑 Elegant Wedding Stage Design
- button "Sevimli": 🤍
- heading "Royal Wedding Hall" [level=3]
- text: 📍 Chilonzor tumani 👥 350 kishi ⭐ 4.7
- paragraph: Shohona bezatilgan zal, zamonaviy yorug'lik tizimi va professional xizmat
- text: 120 000 - 180 000 so'm 1 kishi uchun
- link "Batafsil →":
  - /url: /halls/3
- text: 💎 Premium Banquet Hall VIP
- button "Sevimli": 🤍
- heading "Diamond Hall" [level=3]
- text: 📍 Yakkasaroy tumani 👥 600 kishi ⭐ 4.9
- paragraph: Toshkentning eng katta va zamonaviy to'yxonasi — olmos darajasidagi xizmat
- text: 200 000 - 300 000 so'm 1 kishi uchun
- link "Batafsil →":
  - /url: /halls/4
- text: 🌙 Outdoor Wedding Garden
- button "Sevimli": 🤍
- heading "Oqshom Plaza" [level=3]
- text: 📍 Sergeli tumani 👥 250 kishi ⭐ 4.6
- paragraph: Oilaviy muhitda qulay va sifatli xizmat, ochiq hovli va bog' bilan
- text: 100 000 - 150 000 so'm 1 kishi uchun
- link "Batafsil →":
  - /url: /halls/5
- text: 🕌 Luxury Reception Area Yangi
- button "Sevimli": 🤍
- heading "Samarqand Hall" [level=3]
- text: 📍 Olmazor tumani 👥 300 kishi ⭐ 4.7
- paragraph: O'zbek milliy uslubida bezatilgan zal, an'anaviy va zamonaviy uyg'unlik
- text: 130 000 - 170 000 so'm 1 kishi uchun
- link "Batafsil →":
  - /url: /halls/6
- link "Barcha to'yxonalarni ko'rish →":
  - /url: /halls
- text: ✦ Nima uchun biz?
- heading "Sizning qulayligingiz uchun" [level=2]
- paragraph: Eng qulay va ishonchli bron qilish tajribasini taqdim etamiz
- text: 🔍
- heading "Oson qidiruv" [level=4]
- paragraph: Rayon, narx va sig'im bo'yicha filtrlang. Real-time qidiruv bilan eng mos to'yxonani toping.
- text: 📅
- heading "Online bron" [level=4]
- paragraph: Kalendardan bo'sh kunni tanlang, qo'shimcha xizmatlarni belgilang va bir zumda bron qiling.
- text: 💳
- heading "Xavfsiz to'lov" [level=4]
- paragraph: 20% avans to'lab joyingizni band qiling. Stripe orqali xavfsiz va tez to'lov tizimi.
- text: ⭐
- heading "Ishonchli sharhlar" [level=4]
- paragraph: Haqiqiy mijozlar sharhlarini o'qing va eng yaxshi to'yxonani ishonch bilan tanlang.
- text: ✦ Galereya
- heading "Ajoyib lahzalar" [level=2]
- paragraph: To'yxonalarimiz interyer va bezaklari bilan tanishing
- text: 🏛️ Hashamatli to'y zali interyeri Hashamatli to'y zali interyeri 🎭 Zamonaviy sahna bezatish Zamonaviy sahna bezatish 🍽️ Premium banket stollari Premium banket stollari 🌿 Ochiq havo marosimi Ochiq havo marosimi ✨ Romantik yoritish dizayni Romantik yoritish dizayni 💐 Gul bezaklari va dekor Gul bezaklari va dekor ✦ Mijozlar fikri
- heading "Ishonch va mamnuniyat" [level=2]
- paragraph: Bizning xizmatimizdan foydalangan mijozlarning fikrlari
- text: “
- paragraph: To'yxona.uz orqali biz orzuimizdagi to'yxonani topdik. Bron qilish juda oson va qulay bo'ldi. Xizmat darajasi a'lo!
- text: ★★★★★ DK Dilnoza Karimova Kelin, 2024-yil to'yi “
- paragraph: 300 kishilik to'yimiz uchun eng mos variantni 10 daqiqada topdik. Kalendardan bo'sh kunni ko'rib, darhol bron qildik.
- text: ★★★★★ JA Jasur Aliyev Kuyov, 2024-yil mart “
- paragraph: To'yxona egasi sifatida aytaman — bu platforma mijozlarni topishda juda yordam berdi. Professional va zamonaviy tizim.
- text: ★★★★★ BT Bobur To'ychiyev To'yxona egasi ✦ Tayyor misiz?
- heading "O'zingizga mos to'yxonani hoziroq toping" [level=2]
- paragraph: 200 dan ortiq to'yxonalar orasidan o'zingizga mosini tanlang. Bepul ro'yxatdan o'ting va bir necha daqiqada bron qiling.
- link "To'yxonalarni ko'rish":
  - /url: /halls
- link "Bepul boshlash":
  - /url: /register
- contentinfo:
  - heading "To'yxona.uz" [level=3]
  - paragraph: O'zbekistondagi eng yaxshi to'yxonalarni toping va online bron qiling. Sizning hayotingizdagi eng muhim kun uchun eng yaxshi joy.
  - heading "Sahifalar" [level=4]
  - link "Bosh sahifa":
    - /url: /
  - link "To'yxonalar":
    - /url: /halls
  - link "Kirish":
    - /url: /login
  - link "Ro'yxatdan o'tish":
    - /url: /register
  - heading "Xizmatlar" [level=4]
  - link "Bron qilish":
    - /url: /halls
  - link "To'yxona qidirish":
    - /url: /halls
  - link "Egasi sifatida":
    - /url: /register
  - heading "Bog'lanish" [level=4]
  - link "+998 90 123 45 67":
    - /url: tel:+998901234567
  - link "artikovrozimuhammadxon@gmail.com":
    - /url: mailto:artikovrozimuhammadxon@gmail.com
  - text: Toshkent, O'zbekiston © 2026 To'yxona.uz Sevgi bilan yaratilgan ♥
- alert
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
> 83  |       await expect(toast).toBeVisible();
      |                           ^ Error: expect(locator).toBeVisible() failed
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
```