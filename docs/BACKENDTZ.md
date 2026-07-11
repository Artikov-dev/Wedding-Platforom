# BACKEND TEXNIK TOPSHIRIG'I (TZ)
## Wedding Platform Premium — REST API

**Versiya:** 1.0  
**Sana:** 2026-06-07  
**Frontend stack:** Next.js 16, React 19, TypeScript  
**Backend base URL:** `https://wedding-backend-8.onrender.com`  
**Barcha javoblar uchun umumiy format:**

```json
{
  "success": true | false,
  "data": <T> | null,
  "message": "...",
  "error": "..." | null,
  "statusCode": 200 | 201 | 400 | 401 | 403 | 404 | 500
}
```

---

## MUHIM QOIDALAR

1. Barcha protected endpoint'lar `Authorization: Bearer <token>` header talab qiladi
2. Barcha sana/vaqt maydonlari **ISO 8601** formatida (`2026-08-15T10:00:00Z`)
3. Barcha pul maydonlari **integer** (tiyin emas, so'm): `57600000`
4. `GET /api/bookings` — **CUSTOMER, HALL_OWNER, ADMIN** uchun ham ishlashi kerak (hozir 500 qaytaradi)
5. `PUT /api/bookings/:id` — **Admin va Hall Owner** ham status o'zgartira olishi kerak (hozir 403 qaytaradi)
6. Response ichidagi `data` maydoni — **to'g'ridan-to'g'ri object yoki array** bo'lishi kerak (qo'shimcha wrapper yo'q)

---

## ROLLAR

| Rol | Tavsif |
|-----|--------|
| `CUSTOMER` | Oddiy foydalanuvchi — to'yxona qidiradi, bron qiladi |
| `HALL_OWNER` | To'yxona egasi — o'z zalini boshqaradi, bronlarni ko'radi |
| `ADMIN` | Administrator — hammasini boshqaradi |

---

## 1. AUTH ENDPOINTS

### 1.1 Tizimga kirish
```
POST /api/auth/login
Auth: Yo'q
```
**Request body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
**Response `data`:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "Dilnoza",
    "lastName": "Karimova",
    "phone": "+998901234567",
    "role": "CUSTOMER",
    "isVerified": true
  },
  "token": "eyJhbGci...",
  "refreshToken": "eyJhbGci..."
}
```
**Xatolar:**
- `401` — Email yoki parol noto'g'ri
- `403` — Email tasdiqlanmagan (isVerified: false)

---

### 1.2 Ro'yxatdan o'tish
```
POST /api/auth/register
Auth: Yo'q
```
**Request body:**
```json
{
  "firstName": "Dilnoza",
  "lastName": "Karimova",
  "email": "user@example.com",
  "phone": "+998901234567",
  "password": "password123",
  "role": "CUSTOMER"
}
```
**Validatsiya:**
- `password` — kamida 8 ta belgi
- `phone` — kamida 10 ta belgi
- `role` — faqat `CUSTOMER` yoki `HALL_OWNER`
- `email` — unikal bo'lishi kerak

**Response `data`:** `null` (yoki `{ message: "OTP yuborildi" }`)  
**Xatolar:**
- `400` — Validatsiya xatosi
- `409` — Email allaqachon mavjud

**Muhim:** Register'dan keyin foydalanuvchiga **emailga 6 xonali OTP** yuborilishi kerak.

---

### 1.3 OTP tasdiqlash
```
POST /api/auth/verify-otp
Auth: Yo'q
```
**Request body:**
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```
**Response `data`:** `null`  
**Xatolar:**
- `400` — Kod noto'g'ri yoki muddati o'tgan
- `404` — Email topilmadi

---

### 1.4 Parol tiklash — 1-qadam (OTP yuborish)
```
POST /api/auth/forgot-password
Auth: Yo'q
```
**Request body:**
```json
{
  "email": "user@example.com"
}
```
**Response `data`:** `null`  
**Muhim:** Bu endpoint hozir **500 qaytaradi** — tuzatilishi shart.  
**Xatolar:**
- `404` — Email topilmadi

---

### 1.5 Parol tiklash — 2-qadam (yangi parol)
```
POST /api/auth/reset-password
Auth: Yo'q
```
**Request body:**
```json
{
  "email": "user@example.com",
  "code": "123456",
  "newPassword": "newpassword123"
}
```
**Response `data`:** `null`  
**Xatolar:**
- `400` — Kod noto'g'ri, muddati o'tgan, yoki parol 8 ta belgidan kam

---

### 1.6 Token yangilash
```
POST /api/auth/refresh
Auth: Yo'q
```
**Request body:**
```json
{
  "refreshToken": "eyJhbGci..."
}
```
**Response `data`:**
```json
{
  "token": "eyJhbGci...",
  "refreshToken": "eyJhbGci..."
}
```
**Muhim:** Frontend 401 olganida **avtomatik** shu endpoint chaqiradi.

---

### 1.7 Barcha foydalanuvchilar (Admin)
```
GET /api/auth/users
Auth: Bearer token (ADMIN)
```
**Response `data`:**
```json
{
  "users": [
    {
      "id": "uuid",
      "firstName": "Bobur",
      "lastName": "To'ychiyev",
      "email": "bobur@mail.com",
      "phone": "+998901112233",
      "role": "HALL_OWNER",
      "isVerified": true,
      "createdAt": "2025-11-10T00:00:00Z"
    }
  ]
}
```
**Muhim:** Frontend bu endpoint bilan `HALL_OWNER` rolini filter qiladi.

---

## 2. HALLS ENDPOINTS

### 2.1 To'yxonalar qidirish/ro'yxat
```
GET /api/halls/search
Auth: Yo'q (ham authenticated ham guest ko'ra oladi)
```
**Query parameters:**
| Parametr | Tur | Izohlash |
|----------|-----|----------|
| `page` | number | Sahifa raqami (default: 1) |
| `limit` | number | Sahifadagi elementlar soni (default: 20, max: 100) |
| `search` | string | Nom bo'yicha qidirish |
| `city` | string | Shahar bo'yicha filter |
| `category` | string | `ECONOMY`, `STANDARD`, `PREMIUM`, `VIP` |
| `minPrice` | number | Minimal narx (pricePerPlate) |
| `maxPrice` | number | Maksimal narx (pricePerPlate) |

**Response `data`:**
```json
{
  "halls": [
    {
      "id": "uuid",
      "name": "Navro'z Palace",
      "description": "Toshkentdagi eng hashamatli to'y saroyi",
      "category": "PREMIUM",
      "capacity": 500,
      "pricePerPlate": 180000,
      "advancePercentage": 25,
      "imageUrl": "https://...",
      "images": ["https://...", "https://..."],
      "city": "Toshkent",
      "address": "Yunusobod tumani, Amir Temur ko'chasi 45",
      "phone": "+998901234567",
      "rating": 4.9,
      "totalReviews": 127,
      "status": "APPROVED",
      "isActive": true,
      "ownerId": "uuid",
      "userId": "uuid",
      "createdAt": "2025-10-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "pages": 3
  }
}
```
**Muhim qoidalar:**
- Faqat `status: "APPROVED"` va `isActive: true` bo'lgan zallar ko'rsatilishi kerak (admin panel bundan mustasno)
- `userId` va `ownerId` — frontend shu field bilan owner o'z zalini topadi

---

### 2.2 To'yxona batafsil
```
GET /api/halls/:hallId
Auth: Yo'q
```
**Response `data`:** Yuqoridagi `Hall` object (to'liq ma'lumot bilan)

**Muhim:** `amenities` array bo'lsa — uni ham qaytarish kerak:
```json
{
  "amenities": [
    { "id": "uuid", "name": "Bepul avtoturargoh", "hallId": "uuid" }
  ]
}
```

---

### 2.3 Bronlangan sanalar ✨ YANGI ENDPOINT KERAK
```
GET /api/halls/:hallId/booked-dates
Auth: Yo'q
```
**Tavsif:** Hozir frontend random sanalar generate qiladi. Bu endpoint real ma'lumot berishi kerak.

**Response `data`:**
```json
{
  "bookedDates": [
    "2026-08-15",
    "2026-08-22",
    "2026-09-05"
  ]
}
```
**Qoidalar:**
- Faqat `CONFIRMED` yoki `PENDING` statusdagi bronlar uchun sanalar qaytariladi
- `CANCELLED` va `COMPLETED` bronlar ko'rsatilmaydi

---

### 2.4 To'yxona yaratish
```
POST /api/halls/create
Auth: Bearer token (HALL_OWNER, ADMIN)
```
**Request body:**
```json
{
  "name": "Navro'z Palace",
  "description": "Toshkentdagi eng hashamatli to'y saroyi",
  "category": "PREMIUM",
  "capacity": 500,
  "pricePerPlate": 180000,
  "imageUrl": "https://...",
  "city": "Toshkent",
  "address": "Yunusobod tumani, Amir Temur ko'chasi 45",
  "phone": "+998901234567"
}
```
**Response `data`:** Yaratilgan `Hall` object  
**Xatolar:**
- `400` — Majburiy maydonlar (`name`, `capacity`, `pricePerPlate`) yo'q
- `403` — CUSTOMER roli zal yarata olmaydi

---

### 2.5 To'yxonani tahrirlash
```
PUT /api/halls/:hallId
Auth: Bearer token (HALL_OWNER o'z zali, ADMIN barcha)
```
**Request body** (barcha maydonlar ixtiyoriy):
```json
{
  "name": "Navro'z Palace (yangilangan)",
  "description": "...",
  "category": "VIP",
  "capacity": 600,
  "pricePerPlate": 200000,
  "imageUrl": "https://...",
  "city": "Toshkent",
  "address": "...",
  "phone": "...",
  "status": "APPROVED",
  "isActive": true
}
```
**Admin qo'shimcha maydoni:**
```json
{
  "status": "APPROVED"
}
```
**Response `data`:** Yangilangan `Hall` object  
**Xatolar:**
- `403` — O'zgasi zalini tahrirlashga urinish
- `404` — Zal topilmadi

---

### 2.6 To'yxonani o'chirish
```
DELETE /api/halls/:hallId
Auth: Bearer token (HALL_OWNER o'z zali, ADMIN barcha)
```
**Response `data`:** `null`

---

## 3. BOOKINGS ENDPOINTS ⚠️ ASOSIY MUAMMO

### 3.1 Bron yaratish
```
POST /api/bookings/create
Auth: Bearer token (CUSTOMER)
```
**Request body:**
```json
{
  "hallId": "uuid",
  "eventDate": "2026-08-15",
  "eventTime": "18:00",
  "numberOfGuests": 320,
  "notes": "Milliy uslubda bezak kerak",
  "totalAmount": 57600000,
  "advanceAmount": 14400000,
  "finalAmount": 43200000,
  "serviceProviderIds": ["uuid1", "uuid2"]
}
```
**Response `data`:**
```json
{
  "id": "uuid",
  "hallId": "uuid",
  "hall": {
    "id": "uuid",
    "name": "Navro'z Palace",
    "city": "Toshkent"
  },
  "userId": "uuid",
  "eventDate": "2026-08-15",
  "eventTime": "18:00",
  "numberOfGuests": 320,
  "notes": "Milliy uslubda bezak kerak",
  "totalAmount": 57600000,
  "advanceAmount": 14400000,
  "finalAmount": 43200000,
  "status": "PENDING",
  "paymentStatus": "PENDING",
  "createdAt": "2026-06-07T10:00:00Z"
}
```
**Xatolar:**
- `400` — Tanlangan sana allaqachon bron qilingan
- `400` — `numberOfGuests` zalning `capacity`dan oshib ketsa
- `404` — Zal topilmadi

---

### 3.2 Bronlar ro'yxati ⚠️ TUZATILISHI SHART
```
GET /api/bookings
Auth: Bearer token (CUSTOMER, HALL_OWNER, ADMIN)
```

**MUHIM:** Bu endpoint hozir **500 xatosi** qaytaradi. Rol asosida to'g'ri ishlashi kerak:

| Rol | Ko'rinadigan bronlar |
|-----|---------------------|
| `CUSTOMER` | Faqat o'z bronlari (`userId === user.id`) |
| `HALL_OWNER` | Faqat o'z zallaridagi bronlar (`hall.ownerId === user.id`) |
| `ADMIN` | Barcha bronlar |

**Query parameters:**
| Parametr | Tur | Tavsif |
|----------|-----|--------|
| `limit` | number | Nechta qaytarish (default: 20) |
| `page` | number | Sahifa raqami |
| `status` | string | Filter: `PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED` |

**Response `data`:**
```json
{
  "bookings": [
    {
      "id": "uuid",
      "hallId": "uuid",
      "hall": {
        "id": "uuid",
        "name": "Navro'z Palace",
        "city": "Toshkent"
      },
      "userId": "uuid",
      "user": {
        "id": "uuid",
        "firstName": "Dilnoza",
        "lastName": "Karimova",
        "phone": "+998901234567",
        "email": "d@mail.com"
      },
      "eventDate": "2026-08-15",
      "eventTime": "18:00",
      "numberOfGuests": 320,
      "notes": "...",
      "totalAmount": 57600000,
      "advanceAmount": 14400000,
      "finalAmount": 43200000,
      "status": "CONFIRMED",
      "paymentStatus": "PAID",
      "createdAt": "2026-06-01T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

---

### 3.3 Bron statusini o'zgartirish ⚠️ TUZATILISHI SHART
```
PUT /api/bookings/:id
Auth: Bearer token (CUSTOMER o'z bron, HALL_OWNER o'z zali bron, ADMIN barcha)
```

**MUHIM:** Bu endpoint hozir **403 Forbidden** qaytaradi Admin va Hall Owner uchun. Tuzatilishi kerak.

**Ruxsatlar:**
| Rol | Nima qila oladi |
|-----|----------------|
| `CUSTOMER` | Faqat o'z bronini `CANCELLED` qila oladi |
| `HALL_OWNER` | O'z zali bronlarini `CONFIRMED` yoki `CANCELLED` qila oladi |
| `ADMIN` | Istalgan bronni istalgan statusga o'zgartira oladi |

**Request body:**
```json
{
  "status": "CONFIRMED"
}
```
**Mumkin bo'lgan statuslar:** `PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED`

**Response `data`:** Yangilangan `Booking` object  
**Xatolar:**
- `403` — Ruxsat yo'q
- `404` — Bron topilmadi

---

### 3.4 Bronni bekor qilish (o'chirish)
```
DELETE /api/bookings/:id
Auth: Bearer token (CUSTOMER o'z bron, ADMIN barcha)
```
**Response `data`:** `null`  
**Xatolar:**
- `404` — Bron topilmadi (frontend 404 ni ok deb qabul qiladi)
- `403` — Ruxsat yo'q

---

## 4. PAYMENTS ENDPOINTS

### 4.1 To'lov yaratish
```
POST /api/payments/create
Auth: Bearer token (CUSTOMER)
```
**Request body:**
```json
{
  "bookingId": "uuid",
  "amount": 14400000,
  "paymentType": "ADVANCE",
  "paymentMethod": "CASH"
}
```
**Mumkin bo'lgan `paymentType`:** `ADVANCE`, `FULL`, `REFUND`  
**Mumkin bo'lgan `paymentMethod`:** `CASH`, `CREDIT_CARD`, `DEBIT_CARD`, `BANK_TRANSFER`, `STRIPE`

**Response `data`:**
```json
{
  "id": "uuid",
  "bookingId": "uuid",
  "amount": 14400000,
  "paymentType": "ADVANCE",
  "paymentMethod": "CASH",
  "status": "COMPLETED",
  "createdAt": "2026-06-07T10:00:00Z"
}
```

---

### 4.2 To'lovlar ro'yxati
```
GET /api/payments
Auth: Bearer token (ADMIN)
```
**Response `data`:**
```json
{
  "payments": [
    {
      "id": "uuid",
      "bookingId": "uuid",
      "userId": "uuid",
      "amount": 14400000,
      "paymentType": "ADVANCE",
      "paymentMethod": "CASH",
      "status": "COMPLETED",
      "createdAt": "2026-06-01T10:00:00Z",
      "booking": {
        "id": "uuid",
        "hall": {
          "name": "Navro'z Palace"
        },
        "user": {
          "firstName": "Dilnoza",
          "lastName": "Karimova"
        },
        "numberOfGuests": 320
      }
    }
  ]
}
```
**Muhim:** `booking.hall.name` va `booking.user.firstName/lastName` — frontend to'lovlar jadvalida ko'rsatish uchun kerak.

---

## 5. FAVORITES ENDPOINTS

### 5.1 Sevimlilar ro'yxati
```
GET /api/favorites
Auth: Bearer token (CUSTOMER)
```
**Response `data`:**
```json
[
  {
    "id": "uuid",
    "hallId": "uuid",
    "userId": "uuid",
    "hall": {
      "id": "uuid",
      "name": "Navro'z Palace",
      "city": "Toshkent",
      "capacity": 500,
      "pricePerPlate": 180000,
      "imageUrl": "https://...",
      "rating": 4.9,
      "category": "PREMIUM"
    }
  }
]
```

---

### 5.2 Sevimliga qo'shish
```
POST /api/favorites
Auth: Bearer token (CUSTOMER)
```
**Request body:**
```json
{
  "hallId": "uuid"
}
```
**Response `data`:** `null` yoki yaratilgan Favorite object  
**Xatolar:**
- `409` — Allaqachon sevimliga qo'shilgan

---

### 5.3 Sevimlilardan o'chirish
```
DELETE /api/favorites/:hallId
Auth: Bearer token (CUSTOMER)
```
**Eslatma:** URL parametri `hallId` — Favorite ID emas, Hall ID.  
**Response `data`:** `null`

---

## 6. SERVICES ENDPOINTS

### 6.1 Xizmatlar ro'yxati
```
GET /api/services
Auth: Yo'q
```
**Response `data`:**
```json
[
  {
    "id": "uuid",
    "name": "Premium Foto/Video",
    "description": "Professional fotosuratchi va videograf xizmati",
    "price": 5000000,
    "category": "PHOTO",
    "imageUrl": "https://..."
  }
]
```
**Muhim:** Frontend bron qilishda max 5 ta service ko'rsatadi. Bu endpoint bo'sh bo'lsa bron formida xizmatlar bo'limi ko'rinmaydi.

---

## 7. USERS ENDPOINTS

### 7.1 Barcha foydalanuvchilar (fallback)
```
GET /api/users
Auth: Bearer token (ADMIN)
```
**Response `data`:**
```json
{
  "users": [
    {
      "id": "uuid",
      "firstName": "Bobur",
      "lastName": "To'ychiyev",
      "email": "bobur@mail.com",
      "phone": "+998901112233",
      "role": "HALL_OWNER",
      "isVerified": true,
      "createdAt": "2025-11-10T00:00:00Z"
    }
  ]
}
```

---

## 8. MUHIM — TUZATILISHI SHART BO'LGAN ENDPOINTLAR

### Ustuvorlik tartibi:

#### 🔴 1-ustuvorlik (Sayt ishlamasligi sababi)

**1. `GET /api/bookings` — 500 xatosi**
- Muammo: CUSTOMER, HALL_OWNER, ADMIN rollari uchun 500 qaytaradi
- Ta'siri: `/my-bookings`, `/admin/bookings`, `/owner/bookings`, `/admin/dashboard`, `/owner/dashboard` — hammasi bo'sh
- Yechim: Har bir rol uchun to'g'ri filter bilan ishlash (yuqoridagi 3.2 bo'limga qarang)

**2. `PUT /api/bookings/:id` — 403 Forbidden**
- Muammo: Faqat bron yaratgan CUSTOMER o'zgartira oladi, Admin/Owner ham o'zgartira olishi kerak
- Ta'siri: Admin va Owner bronlarni CONFIRMED/CANCELLED qila olmaydi
- Yechim: Rol asosida permission (yuqoridagi 3.3 bo'limga qarang)

**3. `POST /api/auth/forgot-password` — 500 xatosi**
- Muammo: Parol tiklash birinchi qadami ishlamaydi
- Ta'siri: Foydalanuvchilar parolini tiklolmaydi

---

#### 🟡 2-ustuvorlik (Muhim funksional)

**4. `GET /api/halls/:hallId/booked-dates` — Yangi endpoint kerak**
- Hozir: Frontend random sanalar generate qiladi
- Kerak: Real bronlangan sanalar (CONFIRMED + PENDING statusdagi bronlar sanasi)
- Frontend URL: `/api/halls/:hallId/booked-dates`

**5. `/api/auth/users` yoki `/api/users` — HALL_OWNER foydalanuvchilarini qaytarishi**
- Admin panelda egalari ro'yxati ko'rsatilishi uchun kerak
- Role filter bilan ishlashi kerak

---

#### 🟢 3-ustuvorlik (Yaxshilash)

**6. `/api/halls/search` — ownerId/userId filter qo'shish**
- Hozir: Owner barcha zallarni oladi va frontendda filter qiladi
- Kerak: `?ownerId=uuid` param bilan faqat o'z zallarini olsin

**7. `/api/services` — Xizmatlar mavjudligini tekshirish**
- Bron formida ko'rsatiladi, bo'sh bo'lsa section ko'rinmaydi

---

## 9. TYPE DEFINITIONS (Frontend bilan mos kelishi kerak)

```typescript
// Foydalanuvchi
interface User {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'HALL_OWNER' | 'CUSTOMER';
  isVerified?: boolean;
  createdAt?: string;
}

// To'yxona
interface Hall {
  id: string;
  name: string;
  description: string;
  category: 'ECONOMY' | 'STANDARD' | 'PREMIUM' | 'VIP';
  capacity: number;
  pricePerPlate: number;
  advancePercentage?: number;  // default: 25
  imageUrl?: string;
  images?: string[];
  city?: string;
  address?: string;
  phone?: string;
  rating?: number;
  totalReviews?: number;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  isActive?: boolean;
  ownerId?: string;
  userId?: string;
  amenities?: Amenity[];
  createdAt?: string;
}

// Bron
interface Booking {
  id: string;
  hallId: string;
  hall?: Hall;
  userId?: string;
  user?: User;
  eventDate: string;       // "2026-08-15"
  eventTime?: string;      // "18:00"
  numberOfGuests: number;
  notes?: string;
  totalAmount: number;
  advanceAmount: number;
  finalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  paymentStatus?: 'PENDING' | 'PAID' | 'REFUNDED';
  serviceProviderIds?: string[];
  createdAt?: string;
}

// To'lov
interface Payment {
  id: string;
  bookingId: string;
  userId?: string;
  amount: number;
  paymentType: 'ADVANCE' | 'FULL' | 'REFUND';
  paymentMethod: 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER' | 'STRIPE';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  createdAt: string;
  booking?: {
    id: string;
    hall?: { name: string };
    user?: { firstName: string; lastName: string };
    numberOfGuests?: number;
  };
}

// Xizmat
interface ServiceProvider {
  id: string;
  name: string;
  description?: string;
  price?: number;
  category?: string;
  imageUrl?: string;
}

// Sevimli
interface Favorite {
  id: string;
  hallId: string;
  userId: string;
  hall?: Hall;
}

// Amenity
interface Amenity {
  id: string;
  name: string;
  description?: string;
  hallId: string;
}
```

---

## 10. BARCHA ENDPOINTLAR JADVALI

| # | Endpoint | Method | Auth | Rol | Holat |
|---|----------|--------|------|-----|-------|
| 1 | `/api/auth/login` | POST | Yo'q | — | ✅ OK |
| 2 | `/api/auth/register` | POST | Yo'q | — | ✅ OK |
| 3 | `/api/auth/verify-otp` | POST | Yo'q | — | ✅ OK |
| 4 | `/api/auth/forgot-password` | POST | Yo'q | — | ❌ 500 |
| 5 | `/api/auth/reset-password` | POST | Yo'q | — | ✅ OK |
| 6 | `/api/auth/refresh` | POST | Yo'q | — | ✅ OK |
| 7 | `/api/auth/users` | GET | Bearer | ADMIN | ⚠️ Tekshirish kerak |
| 8 | `/api/halls/search` | GET | Yo'q | Hammasi | ✅ OK |
| 9 | `/api/halls/:hallId` | GET | Yo'q | Hammasi | ✅ OK |
| 10 | `/api/halls/:hallId/booked-dates` | GET | Yo'q | Hammasi | ❌ Yo'q (yaratish kerak) |
| 11 | `/api/halls/create` | POST | Bearer | OWNER, ADMIN | ✅ OK |
| 12 | `/api/halls/:hallId` | PUT | Bearer | OWNER (o'z), ADMIN | ✅ OK |
| 13 | `/api/halls/:hallId` | DELETE | Bearer | OWNER (o'z), ADMIN | ✅ OK |
| 14 | `/api/bookings/create` | POST | Bearer | CUSTOMER | ✅ OK |
| 15 | `/api/bookings` | GET | Bearer | CUSTOMER, OWNER, ADMIN | ❌ 500 |
| 16 | `/api/bookings/:id` | PUT | Bearer | CUSTOMER (o'z), OWNER (o'z zali), ADMIN | ❌ 403 |
| 17 | `/api/bookings/:id` | DELETE | Bearer | CUSTOMER (o'z), ADMIN | ✅ OK |
| 18 | `/api/payments/create` | POST | Bearer | CUSTOMER | ✅ OK |
| 19 | `/api/payments` | GET | Bearer | ADMIN | ✅ OK |
| 20 | `/api/favorites` | GET | Bearer | CUSTOMER | ✅ OK |
| 21 | `/api/favorites` | POST | Bearer | CUSTOMER | ✅ OK |
| 22 | `/api/favorites/:hallId` | DELETE | Bearer | CUSTOMER | ✅ OK |
| 23 | `/api/services` | GET | Yo'q | Hammasi | ✅ OK |
| 24 | `/api/users` | GET | Bearer | ADMIN | ⚠️ Fallback |

**Jami:** 24 endpoint — 3 ta ❌ (kritik), 2 ta ⚠️ (tekshirish kerak), 19 ta ✅

---

*TZ tayyorlangan: 2026-06-07 | Frontend: Next.js 16 + React 19 + TypeScript*
