# Backend Fix Task — API Test Natijalari

**Birinchi test sanasi:** 2026-06-07  
**Oxirgi yangilanish:** 2026-06-07 (4-sesiya — Frontend Full Fix)  
**Backend URL:** `https://wedding-backend-8.onrender.com`  
**Test metodi:** Real HTTP so'rovlar (curl) — auth tokeni bilan va tokensiz

---

## 🔑 TEST AKKAUNTLARI (Login uchun tayyor)

| Role | Email | Parol |
|------|-------|-------|
| **ADMIN** | `superadmin@wedding.uz` | `SuperAdmin1234!` |
| **HALL_OWNER** | `hallowner_test@wedding.uz` | `HallOwner1234!` |
| **CUSTOMER** | `customer_test@wedding.uz` | `Customer1234!` |

> Login sahifasida "Test akkauntlar" bloki bor — bosib avtomatik to'ldirish mumkin.

---

## 4-SESIYA: FRONTEND FULL FIX + BACKEND TZ (2026-06-07)

### ✅ Frontend — Tuzatilganlar:

#### HallCard component (src/components/shared/HallCard.tsx)
- `next/image` bilan real rasmlar ko'rsatiladi (avval `<img>` tag edi — Next.js warning)
- `approvalStatus` field qo'shildi (`status` emas — backend bu fieldni qaytaradi)
- Favorites toggle button qo'shildi (isFavorite prop bilan)
- SVG iconlar — Material-style inline (location pin, people, star, chevron, delete, edit, check)
- Fallback Unsplash rasmlar — example.com URL bo'lsa avtomatik almashadi

#### Halls list (src/app/(client)/halls/page.tsx)
- `data.halls` array extraction fix (eski: `Array.isArray(data)` — to'g'ri: `data?.halls`)
- Favorites real-time toggle qo'shildi
- Pagination fix: `data.pagination.pages` dan olinadi

#### Favorites page (src/app/(client)/favorites/page.tsx)
- `data.favorites` extraction fix (eski: `Array.isArray(data)` — to'g'ri: `data?.favorites`)
- Auth check qo'shildi — kirmaganlarga login sahifaga yo'naltirish
- HallCard isFavorite prop bilan

#### Booking + Payment (src/app/(client)/halls/[hallId]/page.tsx)
- Amount `Math.round(x * 100) / 100` — "Invalid amount" xatosi tuzatildi
- Payment fail bo'lsa booking saqlanadi (partial success)
- `serviceProviderIds: undefined` — bo'sh array yubormaslik

#### My Bookings (src/app/(client)/my-bookings/page.tsx)
- `data.bookings` extraction fix

#### Admin Bookings (src/app/admin/bookings/page.tsx)
- `data.bookings` extraction fix
- Status dropdown — har bir bron uchun status o'zgartirish
- Stats cards qo'shildi
- Qidiruv (hall nomi, user) qo'shildi

#### Admin Halls (src/app/admin/halls/page.tsx)
- `approvalStatus` field fix
- Edit modal qo'shildi (inline tahrirlash)
- Real rasm preview (next/image)
- SVG iconlar

#### Admin Owners (src/app/admin/owners/page.tsx)
- Real `/api/auth/users` dan data load qiladi (fallback: `/api/users`)
- Qidiruv filter qo'shildi
- Avatar (initials) qo'shildi

#### Admin Payments (src/app/admin/payments/page.tsx — YANGI)
- `/api/payments` dan to'lovlarni ko'rsatadi
- Stats: jami, kutilmoqda, bajarilgan, jami summa
- Filter: status, tur (ADVANCE/FULL)

#### Owner My Hall (src/app/owner/my-hall/page.tsx)
- `/api/halls/owner` dan owner halls load (fallback: `/api/halls/search`)
- Edit modal (inline tahrirlash)
- Delete confirm modal
- Rasm preview (next/image)

#### Owner Bookings (src/app/owner/bookings/page.tsx)
- Confirm / Cancel buttons
- Bron detail modal (click on row)
- Stats cards

#### Sidebar (src/components/layout/Sidebar.tsx)
- Admin: "To'lovlar" 💳 link qo'shildi
- Owner: "To'yxonalarim" label yangilandi

#### Types (src/types/index.ts)
- `Hall.approvalStatus?: string` qo'shildi
- `Hall.isActive?: boolean` qo'shildi
- `Hall.totalReviews?: number` qo'shildi

---

### ❌ BACKEND — Tuzatish kerak (TZ):

#### 1. `/api/bookings` — 500 Internal Server Error
- **Muammo:** ADMIN va CUSTOMER uchun 500 qaytaradi. Faqat HALL_OWNER uchun ishlaydi.
- **Frontend qanday kutmoqda:** `{ success: true, data: { bookings: [...], pagination: {...} } }`
- **Fix:** Prisma query'dagi `role` yoki `userId` filter mantiqini tekshirish. Admin uchun barcha bronlar, Customer uchun o'z bronlari.

#### 2. `/api/bookings/my` — 500 Internal Server Error  
- **Muammo:** User o'z bronlarini ko'rish uchun maxsus endpoint kerak lekin ishlaydi emas.
- **Fix:** `GET /api/bookings/my` — faqat `req.user.id === userId` qo'shish.

#### 3. `/api/halls/owner` — 500 Internal Server Error
- **Muammo:** Hall owner o'z to'yxonalarini olib bo'lmaydi. `Failed to retrieve hall` xatosi.
- **Fix:** Prisma query'da `where: { userId: req.user.id }` bilan filtrlab qaytarish.

#### 4. `/api/users` — 404 Not Found (ADMIN token bilan ham)
- **Muammo:** Admin barcha userlarni ko'rish uchun endpoint yo'q.
- **Fix:** `GET /api/users` — faqat ADMIN role uchun, paginated.

#### 5. `/api/auth/users` — 404 Not Found
- **Muammo:** Admin foydalanuvchilar ro'yxatini ko'rish uchun endpoint yo'q.
- **Fix:** `GET /api/auth/users` yoki `GET /api/users` — ADMIN guard bilan.

#### 6. `/api/bookings/:id (PUT)` — Status update
- **Muammo:** Status update qilish imkoniyati frontend'da kerak, lekin backend qo'llab-quvvatlashini tekshirish kerak.
- **Kerak:** `PUT /api/bookings/:id` body: `{ status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' }`

#### 7. `reset-password` — "Required" xatosi (oldindan ma'lum)
- **Muammo:** Zod schema'da undocumented required field bor.
- **Fix:** `POST /api/auth/reset-password` body: `{ email, code/token, newPassword }` — dokumentatsiya va schema mosligi.

#### 8. `/api/halls` search — `imageUrl: "https://example.com/hall.jpg"` (placeholder)
- **Muammo:** Ko'p to'yxonalar example.com URL bilan saqlanib qolgan. Frontend bu URL'ni taniydigan va Unsplash bilan almashtiradi, lekin backend'da real rasm yuklash mexanizmi bo'lishi kerak.
- **Tavsiya:** `imageUrl` majburiy bo'lmagan, lekin kiritilganda real URL bo'lishi kerak.

---

### 📋 API ENDPOINT TO'LIQ RO'YXATI (Ishlayotganlar):

| Method | Endpoint | Status | Izoh |
|--------|----------|--------|------|
| POST | `/api/auth/register` | ✅ | CUSTOMER, HALL_OWNER, ADMIN |
| POST | `/api/auth/login` | ✅ | Token qaytaradi |
| POST | `/api/auth/refresh` | ✅ | Token yangilash |
| POST | `/api/auth/logout` | ✅ | |
| POST | `/api/auth/forgot-password` | ✅ | OTP yuboradi |
| POST | `/api/auth/verify-otp` | ✅ | `{email, code}` |
| POST | `/api/auth/reset-password` | ❌ | "Required" xatosi |
| GET | `/api/halls/search` | ✅ | `data.halls[]`, `data.pagination` |
| GET | `/api/halls/:id` | ✅ | Single hall |
| POST | `/api/halls/create` | ✅ | HALL_OWNER |
| PUT | `/api/halls/:id` | ✅ | `approvalStatus: 'APPROVED'` |
| DELETE | `/api/halls/:id` | ✅ | |
| GET | `/api/halls/owner` | ❌ | 500 error |
| POST | `/api/bookings/create` | ✅ | ISO date, number amounts |
| GET | `/api/bookings` | ❌ | ADMIN/CUSTOMER: 500, OWNER: ✅ |
| PUT | `/api/bookings/:id` | ? | Status update — tekshirilmagan |
| DELETE | `/api/bookings/:id` | ✅ | |
| GET | `/api/favorites` | ✅ | `data.favorites[]`, `data.pagination` |
| POST | `/api/favorites` | ✅ | `{hallId}` |
| DELETE | `/api/favorites/:hallId` | ✅ | |
| GET | `/api/payments` | ✅ | `data.payments[]`, amount string |
| POST | `/api/payments/create` | ✅ | amount number, type, method |
| GET | `/api/services` | ? | Tekshirilmagan |
| GET | `/api/users` | ❌ | 404 |

---

## 3-SESIYA YANGILANISHLARI (2026-06-07)

### ✅ Admin akkount yaratildi:
- `superadmin@wedding.uz` — ADMIN roli bilan register qilindi
- Backend `role: "ADMIN"` qiymatini qabul qildi (oldingi blok yo'q ekan)
- Barcha 3 test akkount yaratildi va login tekshirildi

### ✅ Frontend login sahifasi yangilandi:
- "Test akkauntlar" bloki qo'shildi — bir click bilan credentials kiritiladi
- Admin, Hall Owner, Customer akkauntlari ko'rsatiladi

---

## 2-SESIYA YANGILANISHLARI (2026-06-07)

### ✅ Backend'da tuzatilganlar:
- **verify-otp** — backend endi `{ email, code }` ni qabul qiladi. Test: `401 "Invalid or expired OTP"` (to'g'ri — OTP emas, lekin endpoint ishlaydi)
- **payments/create** — Decimal vs Number bug tuzatildi. Test: `201 CREATED` — to'liq ishlaydi!

### ❌ Hali tuzatilmagan:
- **reset-password** — hali ham `"Required"` qaytarmoqda. Backend Zod schema'da undocumented majburiy field bor

### ✅ Frontend'da tuzatilganlar (shu sessiyada):
- `eventDate` → ISO 8601 format: `new Date(date + 'T18:00:00.000Z').toISOString()`
- `payments/create` → `paymentType: 'ADVANCE'`, `paymentMethod: 'CASH'` (eski: `paymentMethodId: 'default'`, `paymentMethod: 'card'`)

---

## UMUMIY HOLAT (YANGILANGAN)

| Kategoriya | Jami | Ishlaydigan | Ishlamaydigan |
|---|---|---|---|
| Auth | 6 | **4** ✅ | **2** |
| Halls | 5 | 4 | 1 |
| Bookings | 3 | **3** ✅ | 0 |
| Favorites | 3 | 3 | 0 |
| Services | 1 | 1 | 0 |
| Payments | 1 | **1** ✅ | 0 |
| Notifications | 1 | 1 | 0 |
| **Jami** | **20** | **14** | **6** |

---

## ISHLAYOTGAN APIlar ✅

### AUTH

| # | Method | Endpoint | Natija |
|---|---|---|---|
| 1 | POST | `/api/auth/login` | ✅ 401 qaytaradi (noto'g'ri parolda) — endpoint ishlaydi |
| 2 | POST | `/api/auth/register` | ✅ 201 Created — foydalanuvchi ro'yxatdan o'tadi |
| 3 | POST | `/api/auth/forgot-password` | ✅ 200 — OTP yuborilganligi haqida xabar beradi |
| 4 | POST | `/api/auth/refresh` | ✅ 401 qaytaradi (noto'g'ri token) — endpoint ishlaydi |

### HALLS

| # | Method | Endpoint | Natija |
|---|---|---|---|
| 5 | GET | `/api/halls/search` | ✅ 200 — zal ro'yxati qaytadi |
| 6 | GET | `/api/halls/search?city=...` | ✅ 200 — filter ishlaydi |
| 7 | GET | `/api/halls/{id}` | ✅ 200 — auth token bilan ishlaydi |
| 8 | POST | `/api/halls/create` | ✅ 403 — faqat HALL_OWNER uchun (to'g'ri) |
| 9 | PUT | `/api/halls/{id}` | ✅ 403 — faqat egasi yangilashi mumkin (to'g'ri) |
| 10 | DELETE | `/api/halls/{id}` | ✅ 403 — faqat egasi o'chira oladi (to'g'ri) |

### BOOKINGS

| # | Method | Endpoint | Natija |
|---|---|---|---|
| 11 | GET | `/api/bookings` | ✅ 200 — bookinglar ro'yxati qaytadi |
| 12 | POST | `/api/bookings/create` | ✅ 201 — to'g'ri ISO 8601 format bilan ishlaydi |
| 13 | DELETE | `/api/bookings/{id}` | ✅ 200 — o'chirish ishlaydi |

### FAVORITES

| # | Method | Endpoint | Natija |
|---|---|---|---|
| 14 | GET | `/api/favorites` | ✅ 200 — sevimlilar ro'yxati qaytadi |
| 15 | POST | `/api/favorites` | ✅ 201 — sevimliga qo'shish ishlaydi |
| 16 | DELETE | `/api/favorites/{hallId}` | ✅ 200 — sevimlilardan o'chirish ishlaydi |

### SERVICES

| # | Method | Endpoint | Natija |
|---|---|---|---|
| 17 | GET | `/api/services` | ✅ 200 — xizmat ko'rsatuvchilar ro'yxati qaytadi |

### NOTIFICATIONS (Frontend ishlatmaydi — lekin mavjud)

| # | Method | Endpoint | Natija |
|---|---|---|---|
| 18 | GET | `/api/notifications` | ✅ 200 — bildirish noma'lumotlari qaytadi |

---

## ISHLAMAYDIGAN APIlar ❌ — BACKEND BUG

### 1. `POST /api/auth/verify-otp` — KRITIK BUG ❌

**Muammo:** Frontend `{ email, code }` yuboradi, lekin backend "Required" xatosi qaytaradi  
**Test qilingan barcha variantlar:**
- `{ email, code }` → 400 "Required"
- `{ email, otp }` → 400 "Required"
- `{ email, token }` → 400 "Required"
- `{ userId, code }` → 400 "Required"

**Holat:** Swagger/OpenAPI docs ham `required: ["email", "code"]` deydi — lekin backend bu fieldlarni tanimaydi.

**Oqibat:** Foydalanuvchi ro'yxatdan o'tgandan keyin emailini tasdiqlay olmaydi. Register qilgandan so'ng `/verify-otp` sahifasi ishlaydi, lekin API so'rovi DOIM muvaffaqiyatsiz bo'ladi.

**Backend Fix:**
```typescript
// Zod schema'ni tekshirish kerak — ehtimol "code" o'rniga boshqa field nomi ishlatilgan
// Backend'da verify-otp controller'ni oching va Zod schema'ni aniqlang:
z.object({
  email: z.string().email(),
  code: z.string()   // <-- bu field nomi to'g'rimi?
})
// "Required" xatosi = schema'dagi field nomi frontend yuborayotgan field nomidan farq qiladi
```

---

### 2. `POST /api/auth/reset-password` — KRITIK BUG ❌

**Muammo:** Frontend `{ email, otp, newPassword }` yuboradi, lekin backend "Required" xatosi qaytaradi  
**Swagger deydi:** `required: ["email", "otp", "newPassword"]`  
**Test qilingan:**
- `{ email, otp, newPassword }` → 400 "Required"
- `{ email, code, newPassword }` → 400 "Required"
- `{ email, token, newPassword }` → 400 "Required"

**Oqibat:** Parolni tiklash funksiyasi butunlay ishlamaydi. Foydalanuvchi parolini tiklolmaydi.

**Backend Fix:**
```typescript
// reset-password controller'dagi Zod schema'ni tekshirish:
// Ehtimol undocumented required field bor (masalan: confirmPassword, userId, etc.)
// Xato xabari: "Required" (field nomi ko'rsatilmagan) = bitta majburiy field aniqlanmagan
```

---

### 3. `POST /api/payments/create` — KRITIK BUG ❌

**Muammo 1: `paymentMethodId` bilan "Required" xatosi**  
Frontend yuboradi: `{ bookingId, amount, paymentMethodId, paymentMethod }`  
Swagger schema: `required: ["bookingId", "amount", "paymentMethodId"]`  
Natija: 400 "Required" — undocumented majburiy field bor

**Muammo 2: `paymentMethod` bilan amount validation bug**  
`{ bookingId, amount: 937.5, paymentMethodId, paymentMethod: "CASH", paymentType: "ADVANCE" }` yuborilganda:  
→ 400 "Advance amount should be 937.5" — amount TO'G'RI yuborilgan, lekin backend uni taqqoslay olmaydi!

**Sabab (Database/Type bug):**  
Backend `advanceAmount` ni Prisma `Decimal` sifatida saqlaydi → JSON'da `"937.5"` (string).  
Keyin `amount` (JavaScript `number`: `937.5`) bilan qiyoslashda:
```javascript
// Bug:
"937.5" !== 937.5  // string vs number — FALSE qaytaradi!

// Fix:
parseFloat(booking.advanceAmount) === amount  // YOKI
Number(booking.advanceAmount) === Number(amount)
```

**Frontend'dagi noto'g'ri ma'lumotlar (`halls/[hallId]/page.tsx:90`):**
```typescript
// HOZIRGI (NOTO'G'RI):
await api.post('/api/payments/create', { 
  bookingId, 
  amount: advancePrice, 
  paymentMethodId: 'default',  // Bu random string — noto'g'ri
  paymentMethod: 'card'         // Backend qabul qilmaydi ('card' enum qiymati emas)
});

// TO'G'RI (Swagger + real backend testiga ko'ra):
await api.post('/api/payments/create', {
  bookingId,
  amount: advancePrice,
  paymentMethodId: 'pm_default',  // yoki backend'dan kelgan real ID
  paymentMethod: 'CASH',          // Enum: 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER' | 'CASH' | 'STRIPE'
  paymentType: 'ADVANCE'          // Enum: 'ADVANCE' | 'FINAL' | 'SERVICE'
});
```

**To'g'ri `paymentMethod` enum qiymatlari (backenddan aniqlangan):**
- `CREDIT_CARD`
- `DEBIT_CARD`
- `BANK_TRANSFER`
- `CASH`
- `STRIPE`

---

### 4. `POST /api/auth/register` — ENUM NOMI BUG ⚠️

**Muammo:** Frontend `role: "client"` yuboradi, lekin backend `"CUSTOMER"` kutadi  
**To'g'ri enum qiymatlari:** `'ADMIN' | 'HALL_OWNER' | 'SERVICE_PROVIDER' | 'CUSTOMER'`

**Frontend (`AuthContext.tsx:59`) o'zgartirish:**
```typescript
// NOTO'G'RI:
role: 'client'

// TO'G'RI:
role: 'CUSTOMER'
```

**Frontend (`register/page.tsx`) o'zgartirish:**
```typescript
// Register formda role field uchun to'g'ri enum ishlatilsin:
const roles = {
  client: 'CUSTOMER',
  owner: 'HALL_OWNER',
  service: 'SERVICE_PROVIDER'
}
```

---

## FRONTEND → BACKEND MISMATCH MUAMMOLARI

### 5. Booking eventDate formati — DIQQAT ⚠️

**Frontend yuboradi:** `"2024-12-25"` (ISO date string)  
**Backend kutadi:** `"2024-12-25T18:00:00.000Z"` (ISO 8601 datetime)

**Frontend (`halls/[hallId]/page.tsx`) o'zgartirish:**
```typescript
// NOTO'G'RI:
eventDate: selectedDate  // "2024-12-25" formatda

// TO'G'RI:
eventDate: new Date(selectedDate).toISOString()  // "2024-12-25T00:00:00.000Z"
```

---

## FRONTEND'DA YO'Q — BACKEND'DA BOR (KERAKLI) APIlar

Backend'da mavjud, lekin frontend'da hali ulangan endpoint'lar:

### 1. `GET /api/notifications` ⚠️ YO'Q
- Frontend'da bildirishnoma UI yo'q
- Backend 200 qaytaradi, `{ notifications, unreadCount, pagination }` qaytaradi
- **Tavsiya:** Header'ga notification bell icon va real-time ma'lumot kerak

### 2. `GET /api/payments` ⚠️ TO'LIQ YO'Q
- Frontend faqat payment yaratadi, lekin to'lov tarixini ko'rsatmaydi
- Backend `{ payments, pagination }` qaytaradi
- **Tavsiya:** "Mening to'lovlarim" sahifasi kerak

### 3. `GET /api/users` / Profil API ⚠️ YO'Q
- Foydalanuvchi profilini ko'rish/yangilash API'si frontend'ga ulanmagan
- **Tavsiya:** `/api/auth/me` yoki `/api/users/{id}` endpoint'i kerak (backend'da tekshirilsin)

### 4. Reviews API ⚠️ HALI ULANMAGAN
- OpenAPI schema'da `ReviewCreateRequest` mavjud
- Frontend'da zalga baho berish funksiyasi yo'q
- **Kerakli endpointlar:** `POST /api/reviews`, `GET /api/halls/{id}/reviews`

### 5. Invitation API ⚠️ HALI ULANMAGAN  
- OpenAPI schema'da `InvitationCreateRequest` mavjud
- Wedding invitation (taklifnoma) funksiyasi frontend'da yo'q
- **Kerakli endpointlar:** `POST /api/invitations`, `GET /api/invitations`

### 6. Services CRUD ⚠️ FAQAT GET ULANГАН
- Frontend faqat `GET /api/services` qiladi (zalga qo'shish uchun)
- Service yaratish/yangilash/o'chirish frontend'da yo'q
- **Kerakli (agar owner panel uchun):** `POST /api/services/create`, `PUT /api/services/{id}`

---

## XULOSA: BACKEND UCHUN ZUDLIK BILAN TUZATISh KERAK

| Prioritet | Muammo | File | Status |
|---|---|---|---|
| 🔴 KRITIK | `verify-otp` — "Required" xatosi | `auth.controller.ts` / Zod schema | Backend bug |
| 🔴 KRITIK | `reset-password` — "Required" xatosi | `auth.controller.ts` / Zod schema | Backend bug |
| 🔴 KRITIK | `payments/create` — Decimal vs Number bug | `payment.service.ts` | Backend bug |
| 🟡 MUHIM | `register` — `role: 'client'` noto'g'ri | `AuthContext.tsx` | Frontend bug |
| 🟡 MUHIM | `payments/create` — noto'g'ri field nomlar | `halls/[hallId]/page.tsx:90` | Frontend bug |
| 🟡 MUHIM | `bookings/create` — eventDate formati | `halls/[hallId]/page.tsx` | Frontend bug |
| 🟢 KERAKLI | Notifications UI qo'shish | Yangi component | Yo'q |
| 🟢 KERAKLI | Payment tarixi sahifasi | Yangi page | Yo'q |
| 🟢 KERAKLI | Reviews funksiyasi | Yangi component | Yo'q |
