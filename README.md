# 🎓 GeoEducationBot - Ta'lim Platformasi

O'qituvchilar va talabalar uchun zamonaviy topshiriqlar va amaliyot boshqaruv tizimi.

## 🌟 Imkoniyatlar

### 👨‍🏫 O'qituvchilar uchun:
- ✅ Guruhlar yaratish va boshqarish
- ✅ Uyga vazifa va Amaliyot topshiriqlari berish
- ✅ Talaba javoblarini ko'rish va baholash
- ✅ Statistika va hisobotlar
- ✅ Kalendar rejalashtirish

### 👨‍🎓 Talabalar uchun:
- ✅ Guruhlarga qo'shilish
- ✅ Topshiriqlarni ko'rish va bajarish
- ✅ Javoblarni yuklash (fayl + tavsif)
- ✅ **Geo-lokatsiya tekshiruvi** amaliyot uchun
- ✅ Baholar va natijalarni ko'rish

## 🗺️ Geo-Funktsiyalar

**Amaliyot topshiriqlari** uchun maxsus:
- Talaba amaliyot joyida bo'lishini tekshiradi
- Guruh lokatsiyasiga yaqinlikni aniqlaydi (2km radius)
- Faqat to'g'ri joylashuvda javob yuborish mumkin

## 🛠️ Texnologiyalar

- **Frontend:** React 18 + TypeScript + Vite
- **UI:** Shadcn UI + Tailwind CSS
- **Backend:** Supabase (PostgreSQL)
- **State:** Zustand + TanStack Query
- **Maps:** Leaflet / React-Leaflet
- **Auth:** Supabase Authentication

## 📦 O'rnatish

### 1. Dependency'larni o'rnatish
```bash
npm install
```

### 2. Supabase sozlash
`supabase/SETUP_GUIDE.md` faylini o'qing va qadamma-qadam bajaring.

### 3. Environment Variables
`.env` faylini yarating:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Development serverni ishga tushirish
```bash
npm run dev
```

## 📂 Loyiha Strukturasi

```
src/
├── components/       # UI komponentlar
├── contexts/         # React Context (Auth)
├── hooks/           # Custom hooks
├── integrations/    # Supabase integration
├── lib/             # Utilities
├── pages/           # Sahifalar
│   ├── auth/        # Login/Register
│   ├── teacher/     # O'qituvchi sahifalari
│   └── student/     # Talaba sahifalari
├── providers/       # Global providers
├── store/           # Zustand store
├── types/           # TypeScript types
└── utils/           # Helper functions

supabase/
├── schema.sql       # Database schema
└── SETUP_GUIDE.md   # O'rnatish qo'llanmasi
```

## 🗃️ Database Schema

### Asosiy Jadvallar:
- **profiles** - Foydalanuvchi profillari (teacher/student)
- **groups** - O'quv guruhlari (geo-lokatsiya bilan)
- **group_members** - Guruh a'zolari
- **tasks** - Topshiriqlar (homework/internship)
- **answers** - Talaba javoblari (geo-lokatsiya bilan)

RLS (Row Level Security) to'liq sozlangan.

## 🎯 Foydalanish

### O'qituvchi sifatida:
1. Ro'yxatdan o'ting (Teacher rolini tanlang)
2. **Guruh yarating** (Joylashuvni belgilang)
3. **Topshiriq qo'shing** (Uyga vazifa yoki Amaliyot)
4. Talabalar javoblarini **ko'ring va baholang**

### Talaba sifatida:
1. Ro'yxatdan o'ting (Student rolini tanlang)
2. **Guruh ID** orqali guruhga qo'shiling
3. Topshiriqlarni **bajaring va javob yuboring**
4. **Baholaringizni** kuzating

## 🔐 Xavfsizlik

- Supabase RLS policies orqali himoyalangan
- Role-based access control (RBAC)
- Secure file storage (Supabase Storage)
- Location validation for internships

## 📱 Responsive Design

Barcha qurilmalarda ishlaydi:
- 📱 Mobile
- 💻 Desktop
- 📱 Tablet

## 🤝 Hissa qo'shish

Pull requestlar qabul qilinadi! Katta o'zgarishlar uchun avval issue oching.

## 📄 Litsenziya

MIT

## 👨‍💻 Muallif

Created with ❤️ for Education

---

**Qo'shimcha yordam:** `supabase/SETUP_GUIDE.md`
