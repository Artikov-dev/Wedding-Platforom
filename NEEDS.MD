# NEEDS.MD — Frontend tekshiruvi bo‘yicha API holati

## 1) Ishlamayapti (yoki xato qaytaryapti) — aniq ko‘rinayotganlar

### 1.1 Local Next API
- **`POST /api/email`**  
  - Manba: `src/app/api/email/route.ts`  
  - Holat: **500**  
  - Xato: **SMTP configuration is missing**  
  - Sabab: `sendEmail` ishlashi uchun loyiha env (SMTP) parametrlar kerak, lekin lokal muhitda o‘rnatilmagan.
  - Kerak bo‘ladi:
    - `.env.local` ga quyidagilardan kamida mosini qo‘shish (loyihadagi ishlatishiga qarab):
      - `SMTP_HOST`
      - `SMTP_PORT`
      - `SMTP_USER`
      - `SMTP_PASS`
      - `SMTP_FROM` (yoki yo‘q bo‘lsa fallback ishlaydi: `SMTP_FROM || SMTP_USER || 'artikovrozimuhammadxon@gmail.com'`)

## 2) Remote backend integratsiyasi — token yo‘qligi sabab “ishlamayotgandek” ko‘rinadiganlar

Frontend tokenni `src/lib/api.ts` interceptor orqali yuboradi:
- `Authorization: Bearer <token>` (localStorage: `token`)
- 401 bo‘lsa refresh token orqali `POST /api/auth/refresh` chaqiriladi.

Shu sababli quyidagi endpointlar auth talab qilgani uchun token bo‘lmasa `401 Unauthorized` qaytaradi:
- **`GET /api/bookings`** → `401 Unauthorized` (auth token kerak)
- **`GET /api/favorites`** → `401 Unauthorized` (auth token kerak)

## 3) Remote backend — endpoint ishlayapti, ammo frontend tomonidan yuborilgan ma’lumotlar validatsiyadan o‘tmayapti

Test/tekshiruv natijalari bo‘yicha:
- **`POST /api/auth/login`** → `401 Invalid email or password`  
  - Endpoint mavjud va ishlayapti, lekin kredensial noto‘g‘ri.
- **`POST /api/auth/register`** → `400 Validation error`  
  - Endpoint mavjud va ishlayapti, lekin request body validatsiya talablariga mos emas.

## 4) Backendda “yetishmayotgan” API lar (frontdan ko‘rinishi mumkin bo‘lgan turlar)

Frontendda keng ro‘yxatdagi endpointlar chaqirilishi rejalashtirilgan (yoki ishlatiladi), ammo qaysilari backendda umuman yo‘qligi masalasini **to‘liq tekshirish** uchun `src` ichidan `axios.post/get` hamda `'/api/'` bilan boshlanadigan barcha joylarni scan qilish kerak.

Hozirgi tekshiruvdan (mavjud fayllar/yo‘nalishlar bo‘yicha) aniq topilgan local route — faqat `POST /api/email`.

Agar frontendda biror sahifa xatosiz ishlashi uchun quyidagi “core” API lar backendda bo‘lishi shart (frontend talab qiladigan oqimlar):
- **Auth:** `login`, `register`, `verify-otp`, `forgot-password`, `reset-password`, `refresh`
- **Hallar:** `GET /api/halls/search`, `GET /api/halls/:hallId`, `POST /api/halls/create`, va (odatda) update/delete
- **Services:** `GET /api/services`
- **Favorites:** list/add/delete
- **Bookings:** list/create
- **Payments:** `POST /api/payments/create`

> Eslatma: “backendda yetishmayapti” (route yo‘q) degan xulosa uchun har bir endpointga token/sahifa kontekstida real request yuborib javob status kodini aniq tekshirish kerak.

## 5) Amaliy to‘g‘rilash check-listi

1. **`.env.local`** ni to‘g‘rilash (kamida `POST /api/email` uchun SMTP).
2. Auth testlarida real valid email/password yoki valid register payload yuborish.
3. Auth talab qiladigan endpointlar uchun frontendda token mavjudligini tekshirish:
   - `localStorage.token`
   - refresh token borligi (`localStorage.refreshToken`)
4. Agar “API yo‘q” xatosi kelsa (404), frontenddan qaysi endpoint chaqilayotgani va backendda mavjudligini route bo‘yicha tekshirish.

