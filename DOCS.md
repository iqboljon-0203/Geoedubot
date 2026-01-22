# 🎓 GeoEducationBot - To'liq Hujjat

> O'qituvchilar va talabalar uchun zamonaviy topshiriqlar va amaliyot boshqaruv tizimi
> Telegram WebApp orqali ishlaydi

---

## 📚 Mundarija

1. [Loyiha Haqida](#loyiha-haqida)
2. [Texnologiyalar](#texnologiyalar)
3. [Imkoniyatlar](#imkoniyatlar)
4. [O'rnatish](#ornatish)
5. [Database Schema](#database-schema)
6. [Telegram Auth](#telegram-auth)
7. [Deploy](#deploy)
8. [Development](#development)

---

## Loyiha Haqida

**GeoEducationBot** - Telegram WebApp sifatida ishlaydigan ta'lim platformasi.

### Asosiy Xususiyatlar:
- 🤖 **Telegram Auth** - Parolsiz, xavfsiz kirish
- 🗺️ **Geo-lokatsiya** - Amaliyot topshiriqlari uchun joylashuv tekshiruvi
- 👥 **Ikki rol** - Teacher va Student
- 📱 **Responsive** - Barcha qurilmalarda ishlaydi
- 🎨 **Zamonaviy UI** - Shadcn UI + Tailwind CSS

---

## Texnologiyalar

### Frontend:
- **React 18** + **TypeScript**
- **Vite** - Build tool
- **Shadcn UI** - UI components
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **Zustand** - State management
- **TanStack Query** - Data fetching

### Backend:
- **Supabase** - PostgreSQL database
- **Supabase Auth** - (ishlatilmaydi, Telegram Auth o'rniga)
- **Supabase Storage** - Fayllar uchun
- **Supabase RLS** - Row Level Security

### Maps:
- **Leaflet** + **React-Leaflet**

### Telegram:
- **Telegram WebApp SDK**
- **Telegram Bot API**

---

## Imkoniyatlar

### 👨‍🏫 O'qituvchilar:

#### Guruhlar:
- ✅ Yangi guruh yaratish (nom, tavsif, joylashuv)
- ✅ Guruh ma'lumotlarini ko'rish va tahrirlash
- ✅ Guruh a'zolarini boshqarish

#### Topshiriqlar:
- ✅ **Uyga vazifa** - Deadline bilan
- ✅ **Amaliyot** - Joylashuv va sana bilan
- ✅ Fayllar biriktirish (PDF, DOCX, va h.k.)
- ✅ Topshiriqlarni tahrirlash va o'chirish

#### Baholash:
- ✅ Talaba javoblarini ko'rish
- ✅ Fayllarni yuklab olish
- ✅ Baho qo'yish (0-100)
- ✅ Izoh qoldirish

#### Statistika:
- ✅ Guruhlar soni
- ✅ Topshiriqlar soni
- ✅ Javoblar soni
- ✅ Baholanmagan javoblar

---

### 👨‍🎓 Talabalar:

#### Guruhlar:
- ✅ Guruh ID orqali qo'shilish
- ✅ Guruhlarni ko'rish
- ✅ Guruhdan chiqish

#### Topshiriqlar:
- ✅ Barcha topshiriqlarni ko'rish
- ✅ Uyga vazifa va Amaliyotlarni ajratish
- ✅ Deadline'larni kuzatish

#### Javob Yuborish:
- ✅ Tavsif yozish
- ✅ Fayl yuklash
- ✅ **Amaliyot uchun:** Geo-lokatsiya tekshiruvi
  - Faqat to'g'ri joyda javob yuborish mumkin
  - 2km radius ichida bo'lish kerak

#### Baholar:
- ✅ Barcha baholarni ko'rish
- ✅ O'qituvchi izohlarini o'qish
- ✅ Yuborilgan fayllarni ko'rish

#### Statistika:
- ✅ Bajarilgan topshiriqlar
- ✅ Kutilayotgan topshiriqlar
- ✅ Kelgusi amaliyotlar

---

## O'rnatish

### 1. Repository'ni Clone Qilish

```bash
git clone <repo-url>
cd GeoEducationbot
```

### 2. Dependencies O'rnatish

```bash
npm install
```

### 3. Environment Variables

`.env` faylini yarating:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Qayerdan olish:**
1. [Supabase Dashboard](https://supabase.com) → Loyihangizni oching
2. **Settings** → **API**
3. **Project URL** va **anon public key** ni nusxalang

### 4. Database Schema Yuklash

**Supabase SQL Editor**da ishga tushiring:

```sql
-- supabase/schema.sql faylini nusxalang va joylashtiring
-- Yoki quyidagi buyruq bilan:
```

### 5. Telegram Migration

```sql
-- supabase/telegram_migration.sql
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS telegram_user_id BIGINT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_profiles_telegram_user_id 
ON public.profiles(telegram_user_id);
```

### 6. Storage Buckets Yaratish

Supabase Dashboard → **Storage** → **New Bucket**:

- `avatars` (Public ✅)
- `tasks` (Public ✅)
- `answers` (Public ✅)

### 7. Development Server

```bash
npm run dev
```

Development rejimida test user avtomatik yaratiladi.

---

## Database Schema

### Jadvallar:

#### 1. **profiles**
Foydalanuvchi profillari

```sql
- id: UUID (auth.users FK)
- telegram_user_id: BIGINT (UNIQUE) ⭐ Yangi
- full_name: TEXT
- avatar: TEXT
- role: TEXT ('teacher' | 'student')
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

**RLS Policies:**
- Hamma o'z profilini ko'ra oladi
- Telegram users o'z profilini yarata oladi

---

#### 2. **groups**
O'quv guruhlari

```sql
- id: UUID (PK)
- name: TEXT
- description: TEXT
- lat: DOUBLE PRECISION (geo-lokatsiya)
- lng: DOUBLE PRECISION (geo-lokatsiya)
- address: TEXT
- created_by: UUID (auth.users FK)
- created_at: TIMESTAMPTZ
```

**RLS Policies:**
- Hamma guruhlarni ko'ra oladi
- Teacher'lar guruh yarata oladi
- Teacher'lar o'z guruhlarini boshqaradi

---

#### 3. **group_members**
Guruh a'zolari

```sql
- id: UUID (PK)
- group_id: UUID (groups FK, CASCADE)
- user_id: UUID (auth.users FK)
- joined_at: TIMESTAMPTZ
- UNIQUE(group_id, user_id)
```

**RLS Policies:**
- Hamma a'zolarni ko'ra oladi
- Student'lar qo'shilish so'rovi yuboradi
- Student'lar o'zini chiqarishi mumkin

---

#### 4. **tasks**
Topshiriqlar

```sql
- id: UUID (PK)
- title: TEXT
- description: TEXT
- type: TEXT ('homework' | 'internship')
- group_id: UUID (groups FK, CASCADE)
- created_by: UUID (auth.users FK)
- file_url: TEXT
- deadline: DATE (uyga vazifa uchun)
- date: DATE (amaliyot uchun)
- created_at: TIMESTAMPTZ
```

**RLS Policies:**
- Hamma topshiriqlarni ko'ra oladi
- Teacher'lar topshiriq yarata oladi
- Teacher'lar o'z topshiriqlarini boshqaradi

---

#### 5. **answers**
Talaba javoblari

```sql
- id: UUID (PK)
- task_id: UUID (tasks FK, CASCADE)
- user_id: UUID (auth.users FK)
- description: TEXT
- file_url: TEXT
- location_lat: DOUBLE PRECISION
- location_lng: DOUBLE PRECISION
- score: INTEGER (0-100)
- teacher_comment: TEXT
- created_at: TIMESTAMPTZ
- graded_at: TIMESTAMPTZ
- UNIQUE(task_id, user_id)
```

**RLS Policies:**
- Hamma javoblarni ko'ra oladi
- Student'lar o'z javoblarini yuboradi
- Student'lar faqat baholanmagan javoblarni tahrirlaydi
- Teacher'lar javoblarni baholaydi

**Triggers:**
- ✅ Amaliyot uchun lokatsiya tekshiruvi
- ✅ graded_at avtomatik o'rnatiladi

---

## Telegram Auth

### Qanday Ishlaydi?

#### Eski Tizim (O'chirildi):
```
User → Login Page → Email/Password → Dashboard
```

#### Yangi Tizim:
```
User → Telegram Bot → WebApp → Role Selection → Dashboard
```

### Afzalliklari:

- ✅ **Sodda** - Faqat bir marta rol tanlash
- ✅ **Xavfsiz** - Telegram autentifikatsiya
- ✅ **Tez** - Login shart emas
- ✅ **Ma'lumotlar tayyor** - Avatar, Ism avtomatik

---

### Setup:

#### 1. Telegram Bot Yaratish

@BotFather ga o'ting:

```
/newbot
Bot nomi: GeoEducationBot
Username: @geoedubot_bot
```

**Bot Token** ni saqlab qo'ying!

#### 2. WebApp Sozlash

```
/setmenubutton
@geoedubot_bot
Ochish 📱
https://your-domain.vercel.app
```

Yoki: `/mybots` → Botni tanlang → **Edit Bot** → **Menu Button**

---

### Development Mode

`src/hooks/useTelegram.ts` da avtomatik test user yaratiladi:

```typescript
if (import.meta.env.DEV) {
  setUser({
    id: 123456789,
    first_name: 'Test',
    last_name: 'User',
    username: 'testuser',
  });
}
```

Local test qilish uchun Telegram SDK shart emas.

---

### Telegram WebApp API

```typescript
import { useTelegram } from '@/hooks/useTelegram';

function MyComponent() {
  const { user, webApp, isReady } = useTelegram();
  
  // User info
  console.log(user?.first_name);
  console.log(user?.username);
  
  // WebApp controls
  webApp?.BackButton.show();
  webApp?.MainButton.setText('Saqlash');
  webApp?.HapticFeedback.impactOccurred('medium');
}
```

---

## Deploy

### Vercel (Tavsiya):

#### 1. Vercel CLI O'rnatish

```bash
npm i -g vercel
```

#### 2. Login

```bash
vercel login
```

#### 3. Deploy

```bash
# Preview
vercel

# Production
vercel --prod
```

#### 4. Environment Variables

Vercel Dashboard → **Settings** → **Environment Variables**:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

### Telegram Bot Bog'lash

Production URL olganingizdan keyin:

```
/setmenubutton
@your_bot
Ochish 📱
https://your-app.vercel.app
```

---

## Development

### Folder Structure

```
src/
├── components/         # UI komponentlar
│   ├── layouts/       # Dashboard layout
│   ├── modals/        # Modal'lar
│   └── ui/            # Shadcn UI
├── contexts/          # React Context
│   └── TelegramAuthContext.tsx
├── hooks/             # Custom hooks
│   ├── useTelegram.ts
│   └── use-toast.ts
├── integrations/      # Supabase
│   └── supabase/
├── lib/               # Utilities
│   └── supabaseClient.ts
├── pages/             # Sahifalar
│   ├── auth/          # RoleSelection
│   ├── teacher/       # Teacher pages
│   └── student/       # Student pages
├── providers/         # Providers
├── store/             # Zustand
│   └── authStore.ts
├── types/             # TypeScript types
│   └── telegram.d.ts
└── utils/             # Helper functions
```

---

### Key Files

#### `src/hooks/useTelegram.ts`
Telegram WebApp SDK bilan ishlash

#### `src/contexts/TelegramAuthContext.tsx`
Auth logikasi - Telegram user asosida profile tekshirish

#### `src/pages/auth/RoleSelection.tsx`
Birinchi martalik foydalanuvchilar uchun rol tanlash

#### `src/store/authStore.ts`
Global auth state (Zustand)

---

### Commands

```bash
# Development
npm run dev

# Build
npm run build

# Preview production build
npm run preview

# Lint
npm run lint

# Type check
npx tsc --noEmit
```

---

### Geo-Lokatsiya Qanday Ishlaydi?

#### Amaliyot Topshiriqlari:

1. **Guruh yaratishda** teacher joylashuvni belgilaydi (map)
2. **Topshiriq yaratishda** type = `internship` bo'ladi
3. **Talaba javob yuborishda**:
   - Browser'dan lokatsiya so'raydi
   - Guruh lokatsiyasi bilan taqqoslaydi
   - 2km radius ichida bo'lishi kerak
   - Aks holda xatolik

**Kod:** `supabase/schema.sql` → `validate_internship_location()` trigger

---

## Troubleshooting

### "Telegram SDK topilmadi"

**Sabab:** `index.html` da script yo'q

**Yechim:**
```html
<script src="https://telegram.org/js/telegram-web-app.js"></script>
```

---

### "Profile yaratilmadi"

**Sabab:** Database migration ishga tushirilmagan

**Yechim:**
```sql
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS telegram_user_id BIGINT UNIQUE;
```

---

### TypeScript Xatolari

**Sabab:** `types.ts` yangilanmagan

**Yechim:**
```bash
npx supabase gen types typescript --linked > src/integrations/supabase/types.ts
```

---

### Development'da test user ishlamayapti

**Sabab:** `import.meta.env.DEV` false

**Yechim:** `npm run dev` bilan ishga tushiring

---

## Qo'shimcha

### Storage Buckets

| Bucket | Maqsad | Public |
|--------|--------|--------|
| `avatars` | Profile rasmlari | ✅ |
| `tasks` | Topshiriq fayllari | ✅ |
| `answers` | Javob fayllari | ✅ |

### RLS (Row Level Security)

Barcha jadvallar RLS bilan himoyalangan:
- Teacher'lar faqat o'z guruh/topshiriqlarini boshqaradi
- Student'lar faqat o'z javoblarini ko'radi
- Public read access ko'p joylarda

---

## Ma'lumotnomalar

- [Telegram WebApp Docs](https://core.telegram.org/bots/webapps)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Supabase Docs](https://supabase.com/docs)
- [React Router](https://reactrouter.com)
- [Shadcn UI](https://ui.shadcn.com)
- [Leaflet](https://leafletjs.com)

---

## Litsenziya

MIT

---

## Muallif

Created with ❤️ for Education

**Loyiha Holati:** ✅ Production Ready

**Oxirgi Yangilanish:** 2026-01-22

---

**Test:** `npm run dev` 🚀
