# APILAR - API Status Report

## 1. Loyihada aniqlangan API endpointlar

### 1.1 Local Next.js API route

- `POST /api/email`
  - Maqsad: SMTP orqali xabar yuborish
  - Holat: mavjud, lekin hozirgi lokal muhitda SMTP konfiguratsiyasi yo‘q
  - Natija: `500` xato, `SMTP configuration is missing`
  - Amalga oshirilishi kerak: `.env.local` ichiga SMTP maʼlumotlarini joylashtirish

### 1.2 Frontend kodda ishlatilayotgan backend API endpointlari

Quyidagi endpointlar frontenddan `src/lib/api.ts` dagi `API_BASE_URL` orqali `https://wedding-backend-8.onrender.com` ga yo‘naltiriladi.

#### Auth / foydalanuvchi
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/verify-otp`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/refresh`

#### Hallar / qidiruv
- `GET /api/halls/search`
- `GET /api/halls/:hallId`
- `POST /api/halls/create`

#### Xizmatlar
- `GET /api/services`

#### Favorites / sevimlilar
- `GET /api/favorites`
- `POST /api/favorites`

#### Bookings / buyurtmalar
- `GET /api/bookings`
- `POST /api/bookings/create`

#### To‘lovlar
- `POST /api/payments/create`

## 2. Test qilingan API natijalari

### 2.1 Playwright sinovlari
- `tests/basic.spec.ts` orqali quyidagi tekshiruvlar o‘tkazildi:
  - `homepage` ochildi
  - footer email manzili `artikovrozimuhammadxon@gmail.com` ekanligi tekshirildi
  - `login` sahifasi ochildi
  - `register` sahifasi ochildi
  - `POST /api/email` noto‘g‘ri body bilan `400` qaytishi tekshirildi

Natija: `4 passed`

### 2.2 To‘g‘ridan-to‘g‘ri endpoint tekshiruvi
- `GET /` (backend root) -> `200`
- `GET /api/halls/search` -> `200`
- `GET /api/halls/search?limit=10` -> `200`
- `GET /api/services` -> `200`
- `GET /api/bookings` -> `401 Unauthorized` (auth token kerak)
- `GET /api/favorites` -> `401 Unauthorized` (auth token kerak)
- `POST /api/auth/login` -> `401 Invalid email or password` (endpoint ishlayapti, ammo kredensial noto‘g‘ri)
- `POST /api/auth/register` -> `400 Validation error` (endpoint ishlayapti, ammo kiritilgan maʼlumotlar to‘liq emas)
- `POST /api/email` (local) -> `500 SMTP configuration is missing`

### 2.3 API ish holati umumiy hisobi
- Test qilingan endpointlar: `9`
- Ishlayotganlar: `4`
  - `GET /`
  - `GET /api/halls/search`
  - `GET /api/halls/search?limit=10`
  - `GET /api/services`
- Hozircha ishlamayotganlar: `5`
  - `GET /api/bookings`
  - `GET /api/favorites`
  - `POST /api/auth/login`
  - `POST /api/auth/register`
  - `POST /api/email`
- Ishlamaslik sabablari:
  - `GET /api/bookings` va `GET /api/favorites` uchun auth token yo‘q
  - `POST /api/auth/login` uchun sinov kredensial noto‘g‘ri
  - `POST /api/auth/register` uchun yuborilgan maʼlumotlar validatsiyadan o‘tmaydi
  - `POST /api/email` uchun lokal SMTP konfiguratsiyasi hozircha yo‘q

### 2.4 Nega faqat 9 ta endpoint tekshirildi?
- Siz bergan ro‘yxatdagi endpointlar juda katta va ulardan ko‘pchilari hozirgi loyihaning lokal yoki remote test muhitida avtomatik ravishda aniqlanmaydi.
- Bizning amaldagi tekshiruvimiz faqat:
  - lokal `POST /api/email`
  - va remote `https://wedding-backend-8.onrender.com` ustidagi bir necha asosiy endpointlarni
  tekshirgan.
- Ko‘p endpointlar faqat auth token bilan ishlaydi (`/api/bookings`, `/api/favorites`, `/api/payments`, `/api/chat`, va boshqalar), shuning uchun oddiy unauthenticated so‘rov bilan ular `401` qaytaradi.
- Baʼzi endpointlar uchun to‘g‘ri so‘rov body yoki to‘liq registratsiya/booking/stripe oqimi kerak, shuning uchun ularni oddiy probe bilan “buzilgan” deb aytish noto‘g‘ri bo‘ladi.
- Shu sababli, hozirgi natijalar “faqat 9 ta endpointni bevosita tekshira oldik” demakdir, qolganlari esa:
  1) auth token talab qiladi,
  2) to‘liq maʼlumot bilan ishlovchi test talab qiladi,
  3) yoki loyiha ichida hozircha lokal route sifatida mavjud emas.

## 3. Hozirgi holat

- `POST /api/email` local route mavjud va ishga tushadi, lekin SMTP sozlamalari to‘ldirilishi kerak.
- Remote backenddagi ko‘pchilik endpointlar mavjud va server jonli.
- `GET /api/bookings` va `GET /api/favorites` auth talab qiladi, bu yerda token yo‘q.
- `POST /api/auth/login` ham `POST /api/auth/register` ham endpoint sifatida ishlayapti; testlar login maʼlumotlari va register maʼlumotlari noto‘g‘ri yoki to‘liq emasligi sababli xato qaytardi.
- `GET /api/halls/search` endpointi hozir ishlayotgan ko‘rinadi.

### 3.1 Nima uchun barchasi ishlamayapti?

- Hozirgi loyiha asosan frontend. Faqat bitta lokal API route (`POST /api/email`) qo‘shilgan.
- Boshqa ko‘plab endpointlar uzoqdagi backend (`https://wedding-backend-8.onrender.com`) ga yo‘naltirilgan.
- Uzoqdagi backendda hamma zarur endpointlar mavjudligi yoki ishlash holati aniqlanmagan.
- Shuning uchun faqatgina oddiy unauthenticated so‘rovlar bilan ishlaydigan 9 ta endpoint tekshirildi.
- Sizning keng ro‘yxatingizdagi barcha APIlar hamma-frontenda hozircha bitta joyda ishlamayapti, chunki:
  1) Ular backendda yo‘qligi mumkin,
  2) ular auth token, to‘liq request body yoki qo‘shimcha maʼlumot talab qiladi,
  3) baʼzilari faqat maʼlum rol (toʻyxona egasi, admin yoki foydalanuvchi) uchun ishlaydi.

### 3.2 Single page (hall detail) muammosi

- `src/app/(client)/halls/[hallId]/page.tsx` sahifasi mavjud va UI tomondan to‘g‘ri yazilgan.
- Ammo bu sahifa to‘liq ishlashi uchun backendda `GET /api/halls/{hallId}` endpointi to‘g‘ri javob qaytarishi kerak.
- Agar bu endpoint noto‘g‘ri yoki mavjud bo‘lmasa, sahifa xato `To'yxona topilmadi` yoki bo‘sh chiqadi.
- Shuningdek, single hall page uchun `GET /api/services` ham ishlashi kerak, chunki u qo‘shimcha xizmatlarni yuklaydi.
- Demak, single page ishlamasligi ehtimoli:
  - backend’da `GET /api/halls/{hallId}` yo‘qligi,
  - yoki bu so‘rovga auth token / kerakli query yo‘qligi,
  - yoki `hallId` ga mos maʼlumot yo‘qligi.

### 3.3 Toyxona egasi hall qo‘sholmasligi sababi

- `src/app/owner/register-hall/page.tsx` sahifasi `POST /api/halls/create` so‘rovini yuboradi.
- Bu sahifa frontendda mavjud, lekin quyidagi sabablar bilan backendda qabul qilinmasligi mumkin:
  - `POST /api/halls/create` protected route bo‘lishi va token talab qilishi,
  - frontend to‘liq talab qilinadigan maydonlarni yubormayapti (`city`, `address`, `phone`, `status` va boshqalar),
  - backend validatsiyasi `category` yoki `imageUrl` kabi maydonlarni ham talab qilishi mumkin.
- Shu sababli, toyxona egasi sahifasi frontendida forma bor, ammo backend tomonda bu endpoint to‘liq ishlamasa yoki auth bo‘lmasa hall qo‘shish muvaffaqiyatsiz bo‘ladi.

### 3.4 Frontend mukammal bo‘lishi uchun nima qilish kerak?

1. Backendni to‘liq ishga tushiring yoki lokal route’larni yarating.
2. Quyidagi APIlar to‘liq qo‘llab-quvvatlanishi kerak:
   - Auth: `login`, `register`, `refresh`, `verify-otp`, `forgot-password`, `reset-password`
   - Hallar: `search`, `create`, `get by id`, `update`, `delete`, `amenities`
   - Bookings: `list`, `create`, `get`, `update`, `delete`
   - Favorites: `list`, `add`, `delete`
   - Payments: `create`, `stripe`, `stripe status`
   - Chat: `conversations`, `messages`
   - Notifications: `list`, `mark read`, `delete`
   - Reviews: `create`
   - Services: `list`, `create`, `get`, `update`, `delete`
   - Docs: `GET /api/docs`
3. Token / auth ko‘rsatkichlarini to‘liq tekshiring. Hozirgi `AuthContext` tokenni localStorage ga olib qo‘yadi, lekin backend tomonidan beriladigan to‘liq auth oqimi kerak.
4. `single page` uchun `GET /api/halls/{hallId}` va `GET /api/services` ishlashi zarur.
5. Toyxona qo‘shish uchun `POST /api/halls/create` har doim auth token bilan yuborilishi va backend validatsiyasiga mos kelishi kerak.

## 4. Qaysi API lar qo‘shish kerak

Agar bu loyihani to‘liq lokal boshqaruvga o‘tkazmoqchi bo‘lsangiz yoki backend mustahkamligini oshirmoqchi bo‘lsangiz, quyidagi API larni qo‘shish yoki lokalga ko‘chirish kerak:

1. `GET /api/health` yoki `GET /api/status`
   - server sog‘lig‘i tekshiruvi uchun
2. `GET /api/users/me`
   - foydalanuvchi profilini olish va tokenni tekshirish uchun
3. `POST /api/auth/refresh`
   - token yangilash uchun
4. `POST /api/auth/register` va `POST /api/auth/login`
   - agar backend lokal bo‘lsa, ushbu auth oqimlari kerak bo‘ladi
5. `POST /api/auth/verify-otp`
   - email tasdiqlash uchun
6. `POST /api/auth/forgot-password` va `POST /api/auth/reset-password`
   - parol tiklash jarayoni uchun
7. `GET /api/halls/:hallId` va `GET /api/halls/search`
   - to‘liq hall qidiruv va detallari uchun
8. `POST /api/halls/create`
   - egalar uchun yangi hall ro‘yxatga olish
9. `POST /api/bookings/create`
   - bron yaratish uchun
10. `POST /api/payments/create`
   - to‘lovni boshlash uchun
11. `GET /api/bookings`
   - foydalanuvchi va admin buyurtmalarini olish uchun
12. `POST /api/favorites`
   - sevimlilarni qo‘shish/olib tashlash uchun
13. `POST /api/payments/webhook`
   - haqiqiy to‘lov servislarini qo‘llash uchun

## 5. Tavsiya

- Eng tezkor va zarur ish: `POST /api/email` uchun SMTP muhit o‘zgaruvchilarini to‘ldiring.
- Keyin: `login/register/verify-otp` oqimlarini lokal yoki remote backend bilan to‘liq sinovdan o‘tkazing.
- Agar backend bilan integratsiya doimiy bo‘lishi kerak bo‘lsa, loyihaga `api/auth`, `api/halls`, `api/bookings`, `api/payments`, `api/favorites` kabi lokal route’larni ham qo‘shish foydali bo‘ladi.

---

Bu fayl loyihani tezkor API tekshiruvi va keyingi ishlash yo‘nalishlarini aniqlash uchun yozildi.