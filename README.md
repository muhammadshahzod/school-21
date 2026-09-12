# Peer Space · School 21

School 21 pirlari uchun oq-qora, responsive frontend. Next.js App Router, TypeScript, React va oddiy CSS. UI tili — o‘zbekcha.

## Ishga tushirish

Node.js 20.9 yoki undan yangi versiya kerak.

```bash
cd school_21_uz
npm install
npm run dev
```

http://localhost:3000 avtomatik `/feed` sahifasiga yo‘naltiradi.

- `/feed` — qidiruv, skill filtrlari, post qo‘shish, rasm URL, like, kommentlar va post saqlash.
- `/chat` — suhbatlarni qidirish, onlayn holati, o‘qilmagan xabarlar va xabar yuborish. Mobil ekranda suhbatni tanlang; orqaga tugmasi ro‘yxatga qaytaradi. Enter yuboradi, Shift+Enter yangi qator qo‘shadi. Har bir suhbatning yozilayotgan matni alohida saqlanadi.
- `/profile` — bio, skill’lar, loyiha, shaxsiy va saqlangan postlar; tahrirlash modali.
- `/login` — email/parol UI, parolni ko‘rsatish va demo havolasi. Kirish haqiqiy autentifikatsiya bajarmaydi; Google tugmasi hozircha o‘chiq.

Pastki navigatsiya va light/dark almashtirish barcha sahifalarda mavjud. Tema localStorage’da saqlanadi; dastlab tizim sozlamasi olinadi. Post, like, komment, profil va xabar o‘zgarishlari React Context’da turadi: sahifalar orasida saqlanadi, brauzer yangilanganda mock holatiga qaytadi.

## Backend tayyor bo‘lganda

Barcha dastlabki ma’lumotlar [components/mock-api.ts](components/mock-api.ts) dagi async funksiyalardan olinadi:

```ts
getPosts();
getMessages();
getConversations();
getCurrentUser();
getPeers();
getCommunity();
```

Ma’lumot formatlari [components/types.ts](components/types.ts) da. [components/DemoProvider.tsx](components/DemoProvider.tsx) ichidagi importni jamoadoshingizning `/lib/api.ts` fayliga almashtiring. `getMessages()` hozir barcha demo suhbatlarining xabarlarini qaytaradi. Agar API suhbat ID sini talab qilsa, tanlangan suhbatni yuklashni moslashtiring.

Mutatsiyalar (`addPost`, `toggleLike`, `toggleSave`, `addComment`, `sendMessage`, `updateProfile`, `markRead`) hozir faqat lokal React holatini o‘zgartiradi. Haqiqiy API uchun shu metodlarga so‘rovlar, server xatolari va yuborilayotgan holatni qo‘shing. `getCurrentUser()` o‘rnini NextAuth sessiyasi egallaydi. Login UI’dagi submit va Google tugmasini jamoadoshingiz autentifikatsiya bilan ulaydi.

`/app/api/`, `/prisma/` va `/lib/` yaratilmagan. Ilova kodi faqat kelishilgan `app/feed`, `app/chat`, `app/profile`, `app/login`, `components`, `app/layout.tsx`, `app/globals.css` ichida. Yangi mustaqil loyihani ishga tushirish uchun ildizda minimal npm, TypeScript, ESLint va Next.js konfiguratsiyasi bor.

Rasmlar Unsplash’dan, shriftlar Google Fonts’dan yuklanadi. Tarmoq bo‘lmasa avatarlar bosh harflarga, rasm xabarli placeholder’ga, shriftlar tizim shriftlariga almashadi. Foydalanuvchi rasm URL’i uchun faqat HTTP(S) qabul qilinadi. Barcha post rasmlari oq-qora ko‘rsatiladi.

## Tekshirish

```bash
npm run lint
npm run typecheck
npm run build
npm start
```

`npm run build` va dev serverni bir vaqtda bir xil `.next` papkasida ishlatmang. Production tekshiruvi uchun avval build, so‘ng `npm start` bajaring.

Asosiy qayta ishlatiladigan komponentlar: `BottomNav`, `ThemeToggle`, `PostCard`, `ChatBubble`, `UserCard`, `Avatar`, `Modal`. Modal native `<dialog>` bilan fokusni ushlab turadi, Escape bilan yopiladi va fokusni oldingi tugmaga qaytaradi.
