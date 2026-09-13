# PEER SPACE & LAUNCH LAB 21 • DEPLOYMENT GUIDE

Ushbu yo'riqnoma tizimni **Neon PostgreSQL**, **Render** yoki **Vercel** platformalariga xavfsiz va to'liq joylashtirish (deploy) jarayonini tushuntiradi.

---

## 1. TALAB ETILADIGAN MUHIT O'ZGARUVCHILARI (.env)

Loyihani ishga tushirish uchun quyidagi o'zgaruvchilar sozlanishi shart:

```bash
# Neon PostgreSQL ulanish satri (Pooling bilan tavsiya etiladi)
DATABASE_URL="postgres://username:password@ep-cold-cloud-123456.eu-central-1.aws.neon.tech/neondb?sslmode=require"

# NextAuth xavfsizlik kaliti (openssl rand -base64 32)
NEXTAUTH_SECRET="your-generated-super-secret-key"

# Domen yoki URL manzili
NEXTAUTH_URL="https://school-21.onrender.com"
```

---

## 2. MA'LUMOTLAR BAZASI MIGRATSIYASI (NEON POSTGRESQL)

Loyiha ilk marta ishga tushganda `lib/db.ts` dagi `ensureSchema()` funksiyasi jadvallarni avtomatik yaratadi.
Shuningdek, SQL konsolida qo'lda bajarish uchun migratsiya fayli mavjud:

```bash
# Migratsiya fayli joylashuvi:
migrations/001_incubator_and_roles.sql
```

Bu migratsiya idempotent (agar mavjud bo'lsa xato bermaydi):
- `users.role` (admin, moderator, user) va `users.open_to_projects` ustunlari
- `incubator_projects`
- `incubator_project_members`
- `incubator_module_submissions`
- `incubator_module_feedback`
- `incubator_one_pagers`

---

## 3. RENDER VA VERCEL SOZLAMALARI

### Render.com orqali:
1. **Build Command**: `npm install && npm run build`
2. **Start Command**: `npm start`
3. **Environment Variables**: Yuqoridagi 3 ta o'zgaruvchini kiriting.
4. **Node version**: 20.x yoki 22.x

### Vercel orqali:
1. Framework Preset: **Next.js**
2. Environment Variables: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`.
3. Deploy tugmasini bosing.

---

## 4. OFFLAYN VA MAHALLIY DEMO REJIMI

Turnir reglamenti bo'yicha internetsiz yoki mahalliy kompyuterda taqdimot qilish uchun:
```bash
# Mahalliy serverni ishga tushirish:
npm run dev
# yoki production rejimda:
npm run build && npm start
```
`lib/incubatorStorage.ts` qatlami brauzer `LocalStorage` xotirasidan foydalanganligi sababli, ma'lumotlar bazasi uzilgan taqdirda ham barcha loyihalar, modullar va One-Pagerlar to'liq va uzluksiz ishlaydi.

