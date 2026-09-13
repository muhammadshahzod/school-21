# Peer Space & Launch Lab 21 · School 21

School 21 pirlari uchun professional ijtimoiy tarmoq va 60-daqiqalik AI-sprint Vaybkoding turniri uchun **Launch Lab 21** startup inkubatori.

- **Stack**: Next.js 16 (App Router), React 19, TypeScript, NextAuth, Neon PostgreSQL (`pg`), CSS Variables, Lucide Icons.
- **Dizayn tizimi**: School 21 brand purple (`#7c3aed`) va mint (`#10b981`), to'liq dark/light mavzular, mobilga moslashuvchan va A4 chop etish (`@media print`).
- **Tillar**: O'zbekcha (UZ), Ruscha (RU), Inglizcha (EN).

---

## 🚀 ASOSIY IMKONIYATLAR

### 1. Launch Lab 21 — Startup Inkubatori
- **Loyiha profili**: Nomi, qisqa pitch, bosqich (G'oya, Prototip, MVP, Ishga tushgan), jamoa a'zolari va talab etiladigan ko'nikmalar.
- **6 ta ketma-ket modul**:
  1. *Problem & Pain Point*
  2. *Customer & Market*
  3. *Solution & Value Prop*
  4. *MVP Scope & Tech Stack*
  5. *Go-To-Market & Growth*
  6. *Team & Execution*
- **Aniq topshiriq shablonlari & Real namunalar**: Har bir modulda yo'naltiruvchi savollar va real hayotiy misollar ("Example Box").
- **Offline-First & Bardavom xotira**: Hakamlar oldida internetsiz ishlash uchun `LocalStorage` ga bir zumda saqlash + Neon PostgreSQL ga foniy sinxronizatsiya. Sahifa yangilanganda ham barcha ma'lumotlar saqlanib qoladi.
- **Haqiqiy progress hisobi**: `X/6 bajarildi · Y ta qoldi · Z%` ko'rinishida topshirilgan modullarga asoslangan aniq ko'rsatkich.
- **Avto-yig'iluvchi One-Pager**: Modullardan avtomatik generatsiya qilinadi. To'ldirilmagan modullar haqqoniy ogohlantirish bilan ko'rsatiladi. A4 formatida chop etish yoki PDF sifatida saqlash imkoniyati.
- **Snapshotlar tarixi**: Turnir davomida turli daqiqalardagi loyiha holatini muzlatib saqlash.

### 2. Kadrlar va Jamoa yig'ish (Team Matching)
- **"Loyihalarga ochiqman" (Open to Projects)**: Profil sozlamalarida maxsus kalit (toggle).
- Faol pirlar profili va kashfiyot ro'yxatlarida yashil *"Loyihaga tayyor"* nishonchasi (badge).

### 3. Markazlashgan RBAC (Ruxsatnomalar)
- `admin`, `moderator` (kurator/hakam) va `user` rollari.
- Kuratorlar har bir modulga to'g'ridan-to'g'ri izoh, ball va yo'naltiruvchi fikr-mulohazalar (feedback) qoldira oladi.

---

## 🛠 ISHGA TUSHIRISH

### 1. Talablar
Node.js 20.9+ yoki 22+ tavsiya etiladi.

### 2. O'rnatish
```bash
npm install
```

### 3. Muhit o'zgaruvchilari
`.env` faylini yarating yoki `.env.example` dan nusxa oling:
```bash
cp .env.example .env
```
Fayl ichiga quyidagilarni kiriting:
```bash
DATABASE_URL="postgres://username:password@ep-cold-cloud-123456.eu-central-1.aws.neon.tech/neondb?sslmode=require"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Dasturchi rejimida yurgizish
```bash
npm run dev
```
Brauzerda `http://localhost:3000` manzilini oching.

---

## 🧪 TESTLAR VA TEKSHIRUV

Loyihada barcha kod sifat standartlari to'liq joriy etilgan:

```bash
# Inkubator oqimi va RBAC testlarini bajarish:
npm run test:incubator

# TypeScript tip tekshiruvi:
npm run typecheck

# ESLint qoidalarini tekshirish:
npm run lint

# Production yig'ish (build):
npm run build
```

---

## 📚 HUJJATLAR
- [docs/IMPLEMENTATION_STATUS.md](docs/IMPLEMENTATION_STATUS.md) — 6 ta MVP mezonlari bajarilishi va test hisoboti.
- [docs/USER_GUIDE_UZ.md](docs/USER_GUIDE_UZ.md) — Ishtirokchilar va hakamlar uchun foydalanuvchi qo'llanmasi.
- [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) — Render, Vercel va Neon orqali production deployment yo'riqnomasi.
