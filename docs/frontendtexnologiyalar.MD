# Frontend Texnologiyalari va Arxitekturasi Hisoboti (Wedding Platform)

Ushbu hujjat **Wedding Platform** loyihasining frontend qismida ishlatilgan texnologiyalar, kutubxonalar, arxitektura tuzilishi va ishlash mexanizmlari bo'yicha to'liq tahlilni o'z ichiga oladi. Loyiha o'quv topshirig'i (assignment) uchun tayyorlangan bo'lib, uning barcha asosiy qismlari quyida batafsil yoritilgan.

---

## 1. Asosiy Texnologiyalar Steki (Core Tech Stack)

Loyiha eng zamonaviy va barqaror frontend texnologiyalar yordamida qurilgan:

| Texnologiya / Kutubxona | Versiya | Vazifasi / Izoh |
| :--- | :--- | :--- |
| **Next.js** (App Router) | `16.2.7` | Loyihaning asosiy freymvorki. SSR (Server-Side Rendering), SSG (Static Site Generation) va API routes imkoniyatlarini taqdim etadi. |
| **React** | `19.2.4` | UI komponentlarni yaratish va interaktivlikni ta'minlovchi kutubxona. |
| **TypeScript** | `^5` | Loyiha kodini statik tiplash (static typing) orqali xavfsiz va xatolarsiz yozishni ta'minlaydi. |
| **Vanilla CSS & CSS Modules** | - | Dizayn tizimida TailwindCSS kabi tashqi freymvorklardan foydalanilmagan. Moslashuvchanlik va to'liq nazorat uchun sof CSS va `.module.css` (CSS Modules) qo'llanilgan. |

---

## 2. Kutubxonalar va Dependency-lar (Dependencies)

Loyihaning funksional imkoniyatlarini kengaytirish uchun quyidagi yordamchi kutubxonalar integratsiya qilingan:

*   **Axios (`^1.17.0`)**: Backend API (`https://wedding-backend-8.onrender.com`) bilan HTTP so'rovlarni boshqarish uchun ishlatiladi. Tokenlarni avtomatlashtirilgan request/response interceptor'lar orqali boshqaradi.
*   **Date-fns (`^4.4.0`)**: Sana va vaqtlar bilan ishlash, ularni formatlash va hisob-kitob qilish uchun yordamchi kutubxona.
*   **Nodemailer (`^6.9.5`)**: SMTP provayderi orqali xabarlar va taklifnomalarni yuborish uchun frontend dagi local API route-da (`/api/email`) ishlatiladi.
*   **React Icons (`^5.6.0`)**: Loyihadagi barcha SVG ikonkalarni yuklash uchun yengil va qulay to'plam.
*   **Playwright (`^1.51.1`)**: Frontend sahifalari (Homepage, Login, Register) va API route-larni avtomatlashtirilgan tarzda oxirigacha (End-to-End) test qilish uchun sinov muhiti.

---

## 3. Loyiha Arxitekturasi va Papkalar Strukturasi

Loyiha tuzilishi **Next.js App Router** konvensiyalariga muvofiq tashkil qilingan. Asosiy kodlar `src/` papkasi ichida joylashgan:

```
src/
├── app/                  # Next.js App Router (Sahifalar va API-lar)
│   ├── (auth)/           # Autentifikatsiya sahifalari (Login, Register va boshqalar)
│   ├── (client)/         # Mijoz sahifalari (Sevimli to'yxonalar, Buyurtmalar)
│   ├── admin/            # Admin paneli (To'yxonalar, Buyurtmalar, Egalar boshqaruvi)
│   ├── owner/            # To'yxona egalari paneli (Yangi to'yxona qo'shish, Dashboard)
│   ├── api/              # Lokal server API route-lari (Email yuborish)
│   ├── globals.css       # Global stillar fayli (CSS)
│   ├── layout.tsx        # Umumiy sahifa shakli (Layout)
│   └── page.tsx          # Bosh sahifa (Landing page)
├── components/           # Qayta ishlatiladigan UI komponentlar
│   ├── layout/           # Sayt tuzilishi qismlari (Header, Footer, Sidebar)
│   ├── shared/           # Umumiy komponentlar (Calendar, HallCard)
│   └── ui/               # Kichik interaktiv elementlar (Modal, Toast)
├── context/              # Global holat boshqaruvi (React Context)
│   └── AuthContext.tsx   # Tizimga kirish, ro'yxatdan o'tish va sessiya nazorati
├── lib/                  # Yordamchi sozlamalar va util-funksiyalar
│   ├── api.ts            # Axios instansiyasi, request/response interceptor'lar
│   ├── smtp.ts           # SMTP Nodemailer transporteri
│   └── utils.ts          # Yordamchi JavaScript util funksiyalari
└── types/                # TypeScript uchun type va interfeyslar
    └── index.ts          # Ma'lumotlar modellari (User, Hall, Booking va boshqalar)
```

### Sahifalar va Yo'nalishlar (Routing)

Loyiha foydalanuvchi guruhlari bo'yicha 4 ta asosiy qismga ajratilgan:

1.  **Mehmonlar va Mijozlar uchun (Public & Client Routes)**:
    *   `/` - Bosh sahifa: To'yxonalarni ko'rish, qidirish va saralash.
    *   `/halls/[hallId]` - To'yxona detali sahifasi: Sig'imi, narxi, qulayliklari, rasmlari va bron qilish taqvimi.
    *   `/favorites` - Sevimli to'yxonalar ro'yxati.
    *   `/my-bookings` - Mijozning o'z buyurtmalari va to'lov holati.
2.  **Autentifikatsiya (Auth Routes)**:
    *   `/login` - Tizimga kirish.
    *   `/register` - Ro'yxatdan o'tish (Mijoz yoki To'yxona egasi sifatida).
    *   `/forgot-password` / `/verify-otp` - Parolni tiklash va tasdiqlash kodini kiritish sahifasi.
3.  **To'yxona egalari uchun (Owner Routes)**:
    *   `/owner/dashboard` - Statistika va buyurtmalar jadvali.
    *   `/owner/register-hall` - Yangi to'yxonani tizimga qo'shish formasi.
    *   `/owner/my-hall` - O'z to'yxonasini tahrirlash va ma'lumotlarini boshqarish.
4.  **Adminlar uchun (Admin Routes)**:
    *   `/admin/dashboard` - Tizimdagi umumiy moliyaviy va foydalanuvchilar statistikasi.
    *   `/admin/halls` - Barcha to'yxonalarni tasdiqlash yoki o'chirish.
    *   `/admin/owners` - Hamkorlar (egalar) ro'yxatini boshqarish.

---

## 4. Xavfsizlik, Autentifikatsiya va API integratsiyasi

### 4.1 Tokenlar orqali Autentifikatsiya
Tizimda foydalanuvchini autentifikatsiya qilish uchun JWT (JSON Web Token) ishlatiladi. Bu oqim `src/context/AuthContext.tsx` orqali boshqariladi:
*   Foydalanuvchi tizimga kirganda `token` va `refreshToken` localStorage-ga saqlanadi.
*   Foydalanuvchi ma'lumotlari (`User` obyekti) `AuthContext` state-ida saqlanib, butun loyiha bo'ylab ulashiladi.

### 4.2 Axios Interceptors (Avtomatik Token Yangilash)
[`src/lib/api.ts`](file:///c:/Users/artik/OneDrive/Desktop/wedding-platform-premium/src/lib/api.ts) faylida Axios-ning o'ta muhim ikki mexanizmi o'rnatilgan:
1.  **Request Interceptor**: Har bir so'rov yuborilishidan oldin localStorage-da token borligini tekshiradi va agar mavjud bo'lsa, uni `Authorization: Bearer <token>` ko'rinishida sarlavhaga (header) qo'shadi.
2.  **Response Interceptor (Token Rotation)**: Agar server so'rovga `401 Unauthorized` xatosini qaytarsa, interceptor avtomatik ravishda so'rovni to'xtatadi, localStorage-dagi `refreshToken` orqali `/api/auth/refresh` API-ga murojaat qilib yangi token oladi. Yangi tokenni saqlab, dastlab xato bergan so'rovni foydalanuvchiga sezdirmasdan qaytadan yuboradi (transparent token refresh). Agar refresh token muddati ham tugagan bo'lsa, foydalanuvchini avtomatik ravishda `/login` sahifasiga yo'naltiradi.

---

## 5. Ma'lumotlar Modellari (TypeScript Types)

TypeScript yordamida loyiha uchun mustahkam ma'lumot turlari yozilgan. Ularning asosiylari [`src/types/index.ts`](file:///c:/Users/artik/OneDrive/Desktop/wedding-platform-premium/src/types/index.ts) da joylashgan:

*   **UserRole**: Foydalanuvchi rollari: `'ADMIN' | 'HALL_OWNER' | 'SERVICE_PROVIDER' | 'CUSTOMER'`.
*   **User**: Foydalanuvchi ma'lumotlari (id, email, phone, firstName, lastName, role).
*   **Hall**: To'yxona modeli (id, name, capacity, pricePerPlate, imageUrl, images, city, address, rating, amenities).
*   **Booking**: Bron qilish ma'lumotlari (id, eventDate, numberOfGuests, totalAmount, advanceAmount, finalAmount, status, paymentStatus).
*   **Invitation**: Mehmonlarni taklif qilish va ularning kelish holatini tasdiqlash uchun model.

---

## 6. Mahalliy API Route (Local API Endpoint)

Loyiha asosan uzoqdagi backend API-lari bilan ishlaydi, ammo unda bitta ichki API xizmati ham mavjud:
*   **`POST /api/email`** (fayl: `src/app/api/email/route.ts`): Ushbu lokal endpoint Nodemailer yordamida to'g'ridan-to'g'ri SMTP server orqali elektron xatlar yuborish funksiyasini bajaradi.
*   Tizim ishlashi uchun `.env.local` faylida quyidagi parametrlar to'ldirilishi talab etiladi:
    ```env
    SMTP_HOST=smtp.example.com
    SMTP_PORT=587
    SMTP_USER=your-email@example.com
    SMTP_PASS=your-strong-password
    SMTP_FROM=noreply@example.com
    ```

---

## 7. Avtomatlashtirilgan Testlash (Playwright E2E Tests)

Loyiha integratsiyasini tekshirish va regression xatolarni oldini olish uchun **Playwright** o'rnatilgan. Hozirda [`tests/basic.spec.ts`](file:///c:/Users/artik/OneDrive/Desktop/wedding-platform-premium/tests/basic.spec.ts) faylida quyidagi testlar amalga oshiriladi:
*   Bosh sahifaning muvaffaqiyatli yuklanishi (Smoke Test).
*   Sayt footer qismidagi kontakt elektron pochta manzili to'g'riligini tekshirish (`artikovrozimuhammadxon@gmail.com`).
*   `/login` va `/register` sahifalarining mavjudligi va formalar to'g'ri ishlashi.
*   `/api/email` API endpointiga noto'g'ri ma'lumotlar bilan so'rov yuborilganda to'g'ri validatsiya xatosi (`400 Bad Request`) qaytishini tekshirish.

---

## Xulosa

Ushbu frontend loyihasi Next.js freymvorkining eng yangi imkoniyatlaridan (App Router, Server API routes) foydalanib, toza TypeScript arxitekturasida yozilgan. U autentifikatsiyani xavfsiz saqlash, avtomatik token yangilash (Axios interceptor) hamda local SMTP email xizmati kabi murakkab biznes-mantiqlarni o'z ichiga oladi. Ishlatilgan texnologiyalar assignments topshiriqlari talablariga to'liq mos keladi va yuqori darajadagi strukturaga ega.
