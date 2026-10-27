# Digital History Teacher

**Raqamli tarixiy manbalar asosida bo‘lajak tarix fani o‘qituvchilarining metodik kompetensiyasini rivojlantirish elektron ta’lim platformasi.**

PhD dissertatsiyasi («Рақамли тарихий манбалар асосида бўлажак тарих фани ўқитувчиларининг методик компетенциясини такомиллаштириш») doirasida ishlab chiqilgan ishchi veb-platforma. Konseptual asos — `Платформа_яратиш_буйича_тавсиялар.docx`.

Platforma pedagogik zanjir bo‘yicha ishlaydi:

> manbani topish → tanlash va tekshirish → tanqidiy tahlil → dars maqsadiga moslashtirish → metodik topshiriq → dars ishlanmasi → baholash → refleksiya

---

## Mundarija

1. [Modullar](#modullar)
2. [Arxitektura va texnologiyalar](#arxitektura-va-texnologiyalar)
3. [Kerakli dasturlar](#kerakli-dasturlar)
4. [Tez ishga tushirish (Windows PowerShell)](#tez-ishga-tushirish-windows-powershell)
5. [Environment sozlamalari](#environment-sozlamalari)
6. [Migratsiya va seed](#migratsiya-va-seed)
7. [Demo foydalanuvchilar](#demo-foydalanuvchilar)
8. [Testlar va sifat nazorati](#testlar-va-sifat-nazorati)
9. [Production build](#production-build)
10. [3D/360° obyektlarni qo‘shish](#3d360-obyektlarni-qoshish)
11. [Yangi manba va topshiriq qo‘shish](#yangi-manba-va-topshiriq-qoshish)
12. [Kompetensiyani hisoblash mantiqi](#kompetensiyani-hisoblash-mantiqi)
13. [Xavfsizlik](#xavfsizlik)
14. [Hujjat talablari va taklif etilgan yechimlar](#hujjat-talablari-va-taklif-etilgan-yechimlar)
15. [Cheklovlar va tekshirilmagan qismlar](#cheklovlar-va-tekshirilmagan-qismlar)

---

## Modullar

| # | Modul (hujjat bo‘yicha) | Platformadagi bo‘lim | Asosiy imkoniyatlar |
|---|---|---|---|
| 1 | Raqamli tarixiy manbalar kutubxonasi | `/app/sources`, ochiq: `/catalog/sources` | **mavzu bo‘limlari** (masalan, «Buxoro amirligi tarixi» — shu mavzudagi barcha turdagi manbalar), qidiruv, davr/mavzu/tur filtri, saralash, saqlash, **asl manba / ilmiy sharh / ta’limiy moslashtirish** alohida variantlar, ishonchlilik va cheklovlar, litsenziya, raqamli nusxa (rasm, audio, video), **manba asosidagi amaliy topshiriqlar**, 2–4 manbani tanlab 2-moduldagi taqqoslash ishini boshlash. 3D/360° obyektlar manba turi emas — ular 4-modulda |
| 2 | Tahlil laboratoriyasi | `/app/analysis` | manba turiga moslashgan 12+ savol (yozma, vizual, xarita, audio, video, arxeologik), qoralama → topshirish → o‘qituvchi ko‘rib chiqishi, taqqoslash ishlari |
| 3 | Interaktiv dars konstruktori | `/app/lessons` | 7 bosqichli forma (12 talab qilingan qadam), bosqichlar va vaqt nazorati, versiya tarixi, chop etish/PDF; tayyor dars berilmaydi — faqat yo‘naltiruvchi savollar |
| 4 | Virtual sayohat va muzey (3D/360°) | `/app/museum`, ochiq: `/catalog/museum` | Sketchfab 3D (lazy embed), Uzbekistan360 panoramalari, fallback, kuzatuv/dalil/taqqoslash topshiriqlari, talaba ishi → portfolio |
| 5 | Kompetensiyani baholash markazi | `/app/competence`, `/app/diagnostics`, `/app/experiment` | 4 komponent, mezon/indikatorlar, sozlanadigan darajalar va vaznlar, boshlang‘ich/oraliq/yakuniy diagnostika, dinamika, o‘zini baholash, ekspert bahosi, tajriba/nazorat guruhlari tavsifiy taqqoslanishi |
| 6 | Metodik topshiriqlar va simulyator | `/app/assignments` | 10 xil topshiriq turi, 7 holat (qoralama … baholangan), rubrika, qaytarish va qayta topshirish (versiyalar) |
| 7 | Shaxsiy kabinet va e-portfolio | `/app/portfolio` | barcha ishlar avtomatik qo‘shiladi, manbalar bilan bog‘liqlik, refleksiv yozuvlar, ikki ishni taqqoslash, chop etish |

Qo‘shimcha: **rollar va ruxsatlar matritsasi** (`/app/admin/roles`), interaktiv **xarita va vaqt chizig‘i** (`/app/explore`), **umumiy qidiruv** (`/app/search`), rolga mos **dashboardlar**, **admin paneli** (foydalanuvchilar, manbalar, obyektlar, davrlar, baholash mezonlari, sozlamalar, audit log).

---

## Arxitektura va texnologiyalar

```text
digital-history-teacher/
├── frontend/   React 18 + TypeScript + Vite, Ant Design 5, Tailwind CSS 3, React Router 6,
│               TanStack Query 5, Axios, React Hook Form + Zod, Zustand, Recharts, Leaflet
├── backend/    Node.js + TypeScript, Express 4, Prisma 6 + PostgreSQL 16, Zod, JWT, Argon2id,
│               Helmet, rate limit, Pino, Swagger UI (OpenAPI 3)
├── docker-compose.yml   PostgreSQL
├── .env.example
└── README.md
```

**Backend** — modul asosida (`backend/src/modules/<modul>/`): `*.routes.ts` (marshrut + validatsiya + RBAC) → `*.controller.ts`/handler → `*.service.ts` (biznes mantiq, Prisma). Umumiy qatlamlar: `middleware/` (auth, validate, errorHandler), `shared/` (xatolar, logger, access helperlar, audit, embed tekshiruvi). Pedagogik yadro: `modules/assessments/competence.service.ts` (kompetensiya dalillari va hisoblash), `modules/portfolios/portfolio.writer.ts` (ishlarni portfolioga avtomatik yozish).

**Frontend** — `src/features/<modul>/{pages,components}`, API chaqiruvlari faqat `src/services/` orqali, javob turlari `src/types/api.ts` da markazlashgan. Ant Design — UI komponentlar; Tailwind — layout/spacing/responsive (preflight o‘chirilgan, to‘qnashuv yo‘q). Ranglar va radiuslar bitta joyda: `src/app/tokens.ts` (antd temasi va Tailwind shu fayldan oladi). Barcha sahifalar `React.lazy` bilan yuklanadi.

**API**: `/api/v1/...`, javob formati `{ data, meta? }`, xato formati `{ error: { code, message, details? } }`. Swagger: <http://localhost:4000/api/docs> (JSON: `/api/docs.json`) — faqat `API_DOCS_ENABLED=true` bo‘lganda (productionda standart holatda yopiq).

## Kerakli dasturlar

- Node.js 20+ (22/24 bilan tekshirilgan) va npm 10+
- Docker Desktop (PostgreSQL uchun) — yoki mavjud PostgreSQL 14+ serveri
- Git (ixtiyoriy)

## Tez ishga tushirish (Windows PowerShell)

```powershell
# 1) PostgreSQL (Docker) — 5433 portda (5432 band bo'lsa ham to'qnashmaydi)
docker compose up -d

# 2) Backend
cd backend
Copy-Item .env.example .env        # kerak bo'lsa qiymatlarni o'zgartiring
npm install
# npm 11 install skriptlarini bloklasa (prisma, argon2, esbuild):
npm install-scripts approve prisma @prisma/client @prisma/engines argon2 esbuild
npx prisma migrate deploy          # migratsiyalar
npx prisma db seed                 # boshlang'ich va demo ma'lumotlar
npm run dev                        # http://localhost:4000

# 3) Frontend (yangi terminalda)
cd frontend
Copy-Item .env.example .env
npm install
npm run dev                        # http://localhost:5173
```

Linux/macOS terminalida `Copy-Item` o‘rniga `cp` ishlating. Frontend dev serveri `/api` so‘rovlarini backendga proxy qiladi (refresh cookie bir xil origin’da ishlashi uchun).

Test bazasi (backend integratsion testlari uchun) bir marta yaratiladi:

```powershell
docker exec dht-postgres psql -U dht -d digital_history_teacher -c "CREATE DATABASE digital_history_teacher_test;"
```

## Environment sozlamalari

`backend/.env` (namuna: `backend/.env.example`):

| O‘zgaruvchi | Vazifasi |
|---|---|
| `DATABASE_URL` | PostgreSQL ulanishi |
| `TEST_DATABASE_URL` | Testlar uchun ALOHIDA baza (testlar uni har safar tozalaydi) |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` | kamida 32 belgi; productionda standart qiymat bilan server ishga tushmaydi |
| `JWT_ACCESS_TTL` | access token muddati (standart `15m`) |
| `REFRESH_TOKEN_TTL_DAYS` | refresh token muddati |
| `CORS_ORIGINS` | ruxsat etilgan frontend originlar (vergul bilan) |
| `EMBED_ALLOWED_HOSTS` | embed ruxsat etilgan domenlar (`sketchfab.com,uzbekistan360.uz`) |
| `AUTH_RATE_LIMIT_MAX` | login/ro‘yxat/parol tiklash uchun 15 daqiqadagi urinishlar (standart 30; lokal E2E uchun oshirish mumkin) |
| `UPLOAD_DIR`, `UPLOAD_MAX_MB` | lokal fayl saqlash joyi va limit |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_FULL_NAME` | **administrator paneli login-paroli** (login — email emas, oddiy username) — faqat shu yerda saqlanadi. Server har ishga tushganda hisobni yaratadi/parolini sinxronlaydi (parol ≥10 belgi; productionda `change-me…` taqiqlangan) |
| `SEED_DEMO_USERS` | `true` bo‘lsa (va `NODE_ENV≠production`) demo hisoblar yaratiladi |
| `DEMO_TEACHER_USERNAME`, `DEMO_TEACHER_PASSWORD`, `DEMO_STUDENT_USERNAMES` (3 ta), `DEMO_STUDENT_PASSWORD` | demo hisoblar login-parollari (kodda saqlanmaydi) |
| `API_DOCS_ENABLED` | Swagger hujjati `/api/docs` (ko‘rsatilmasa: productionda yopiq) |
| `EXPOSE_RESET_TOKEN` | parol tiklash tokenini javobda qaytarish (faqat development) |

`frontend/.env`: `VITE_API_PROXY_TARGET` (dev proxy), `VITE_API_BASE_URL` (API boshqa domenda bo‘lsa).

## Migratsiya va seed

```powershell
cd backend
npx prisma validate              # sxemani tekshirish
npx prisma migrate dev           # sxema o'zgarsa yangi migratsiya (development)
npx prisma migrate deploy        # production/CI
npx prisma db seed               # idempotent: qayta ishga tushirish xavfsiz
npm run db:reset                 # bazani tozalab qayta yaratish (DIQQAT: ma'lumotlar o'chadi)
```

Seed nimalarni yaratadi: 5 tarixiy davr, 11 mavzu (tavsifli bo‘limlar), 16 manba — 6 turning barchasi, 10 tasida Wikimedia Commons’dan litsenziyasi ko‘rsatilgan raqamli nusxa, har birida amaliy topshiriqlar (hammasi **Demo** belgisi bilan), 10 virtual obyekt (8 ta haqiqiy Sketchfab modeli + Xiva Uzbekistan360 sahifasi + 1 demo qoralama), 4 kompetensiya komponenti (mezon, indikator, vaznlar bilan), 3 daraja, 5 diagnostika (boshlang‘ich/yakuniy test va so‘rovnoma, refleksiv savollar), rubrika, 4 topshiriq, tajriba va nazorat guruhlari, namunaviy dars ishlanmasi qoralamasi.

## Demo foydalanuvchilar

> **Login va parollar kodda ham, README’da ham saqlanmaydi** — ular `backend/.env` faylida turadi.
> Administrator: `ADMIN_USERNAME` / `ADMIN_PASSWORD` (productionda ham ishlaydi).
> Demo o‘qituvchi va 3 talaba: `DEMO_*` o‘zgaruvchilari, faqat `SEED_DEMO_USERS=true` va `NODE_ENV≠production` bo‘lganda yaratiladi.
> Birinchi 2 talaba tajriba guruhiga, uchinchisi nazorat guruhiga qo‘shiladi.

**Asosiy ssenariyni sinab ko‘rish:** birinchi demo talaba bilan kiring → «Manbalar kutubxonasi»da «Zafarnoma»ni oching → «Tahlil qilish» → savollarga javob berib topshiring → «Virtual muzey»da Bibixonim masjidi 3D modelini yuklang va kuzatuv javoblarini topshiring → «Topshiriqlar»da 15 daqiqalik mashg‘ulot topshirig‘ini bajaring → «Dars konstruktori»da ishlanma yarating → «Diagnostika»da boshlang‘ich testni bajaring → «Portfolio» va «Kompetensiya» sahifalarida natijalarni ko‘ring. So‘ng demo o‘qituvchi bilan kirib «Tekshiruv navbati»dan ishlarni qaytaring yoki rubrika bo‘yicha baholang — talaba portfoliosi va kompetensiya profili yangilanadi.

## Testlar va sifat nazorati

```powershell
# Backend (alohida test bazasi kerak — TEST_DATABASE_URL)
cd backend
npm run typecheck
npm run lint
npm test            # Vitest + Supertest: auth, RBAC, manbalar, tahlil, topshiriqlar, dars, diagnostika
npm run build

# Frontend
cd frontend
npm run typecheck
npm run lint
npm test            # Vitest + React Testing Library: guardlar, rolga mos menyu, embed fallback, holatlar, forma validatsiyasi
npm run build
```

### Brauzer E2E (real Chrome, headless)

Oldin PostgreSQL, backend va frontend dev serverlari ishlab turishi va seed bajarilgan bo‘lishi kerak. Lokal Chrome ishlatiladi (`CHROME_PATH` bilan o‘zgartirish mumkin). Login-parollar `backend/.env` dagi `ADMIN_*` va `DEMO_*` (yoki `E2E_*`) o‘zgaruvchilaridan olinadi. Ko‘p marta login bo‘lgani uchun `AUTH_RATE_LIMIT_MAX` ni oshiring (masalan 500).

```powershell
cd frontend
npm run test:e2e
```

- `e2e/pages.e2e.mjs` — mehmon, talaba, o‘qituvchi va admin uchun 73 ta marshrutni ochadi: sahifa xatolari, konsol xatolari, ErrorBoundary, API xatolari, kutilgan 403/404.
- `e2e/flows.e2e.mjs` — UI orqali: ro‘yxatdan o‘tish (Zod xatosi bilan), kirish, dars konstruktorida saqlash va versiya, manba tahlili va sahifa yangilanganda sessiyaning tiklanishi, 3D modelni lazy yuklash, o‘qituvchi sahifalari, mobil (390px) ko‘rinishda gorizontal scroll yo‘qligi.

## Production build

```powershell
cd backend;  npm ci; npx prisma migrate deploy; npm run build; $env:NODE_ENV="production"; npm start
cd frontend; npm ci; npm run build      # natija: frontend/dist (statik fayllar)
```

Productionda `frontend/dist` ni nginx (yoki boshqa statik server) orqali bering va `/api` ni backendga reverse-proxy qiling — shunda refresh cookie bir xil origin’da ishlaydi. HTTPS majburiy (`secure` cookie productionda yoqiladi). `JWT_*` kalitlarini kuchli tasodifiy qiymatlarga almashtiring, `CORS_ORIGINS` ni haqiqiy domenga sozlang.

## 3D/360° obyektlarni qo‘shish

1. Administrator sifatida **Administrator → Virtual obyektlar → Yangi obyekt**.
2. **Sketchfab**: platforma = Sketchfab, «Tashqi manba URL» = model sahifasi manzili (masalan `https://sketchfab.com/3d-models/<nom>-<32 belgili ID>` yoki `https://sketchfab.com/models/<ID>`). Embed manzili (`/models/<ID>/embed`) server tomonida **avtomatik** hosil qilinadi. Model ID’sini taxmin qilmang — faqat haqiqiy sahifadan oling. Muallif va litsenziyani (masalan, CC BY-NC) kiriting.
3. **Uzbekistan360**: platforma = Uzbekistan360, tashqi URL = tur sahifasi (`https://uzbekistan360.uz/...`). Sayt iframe’ga ruxsat bergan holatda «Embed URL» ga ham shu manzilni kiriting; ruxsat bo‘lmasa bo‘sh qoldiring — sahifada «Yangi oynada ochish» tugmasi ko‘rsatiladi.
4. Pedagogik topshiriqlar (kuzatuv, dalil, taqqoslash, muhokama, darsda qo‘llash, material yaratish) va bog‘langan manbalarni qo‘shing, holatni «Nashr etilgan» qiling.

Server faqat `EMBED_ALLOWED_HOSTS` dagi domenlarni va faqat `https` ni qabul qiladi. Frontendda iframe `sandbox` bilan, faqat foydalanuvchi bosganda yuklanadi (lazy); 20 soniyada yuklanmasa fallback xabari va tashqi havola chiqadi.

Seed’dagi Sketchfab modellari Global Digital Heritage hisobidan Sketchfab ochiq API (`api.sketchfab.com/v3/search`) orqali **haqiqatan mavjudligi tekshirilgan** (2026-10). Uzbekistan360 sahifasining `frame-ancestors *` sarlavhasi ham tekshirilgan.

## Yangi manba va topshiriq qo‘shish

- **Manba**: «Manbalar kutubxonasi → Manba qo‘shish» (o‘qituvchi yoki admin). Asl matn, ilmiy sharh va o‘quvchilar uchun moslashtirilgan variantni alohida «variant» sifatida kiriting; ishonchlilik, cheklovlar, litsenziya va asl manba havolasini to‘ldiring. Tekshirilmagan ma’lumotlar uchun **«Demo yozuv»** belgisini qo‘ying. O‘qituvchi qoralama/tekshirilgan holatda saqlaydi, **nashr etish — faqat admin**.
- **Topshiriq**: «Topshiriqlar → Yangi topshiriq» — pedagogik vaziyat, turi, muddat, guruhlar, manbalar va 3D/360° obyektlar, rubrika va kompetensiya dalili turi. Rubrika mezonlarini «Rubrikalar» bo‘limida komponentlarga bog‘lang.
- **Diagnostika**: «Diagnostika → Yangi diagnostika» — bosqich (boshlang‘ich/oraliq/yakuniy), tur, savollar (har biri komponentga bog‘lanadi). Urinishlar boshlangach savollar bloklanadi (taqqoslanuvchanlik uchun).

## Kompetensiyani hisoblash mantiqi

Har bir baholash hodisasi (test, so‘rovnoma, tahlil, topshiriq, dars ekspertizasi, o‘zini baholash, ekspert bahosi) `CompetenceRecord` sifatida saqlanadi: talaba, komponent, bosqich, **dalil turi**, baholovchi roli, ball (0–100) va qaysi ishdan olingani (`refType/refId`).

- **Komponent natijasi** = Σ (dalil turi vazni × shu turdagi o‘rtacha ball) / Σ (mavjud dalil turlari vazni).
- **Umumiy ko‘rsatkich** = komponentlar vazni bo‘yicha o‘rtacha.
- **Daraja** = natija yetgan eng yuqori quyi chegara (standart: Past 0–54.9, O‘rta 55–79.9, Yuqori 80–100).
- Profil sahifasida har bir natija **qaysi yozuvlar va vaznlar asosida** hisoblangani ko‘rsatiladi.
- Agar komponent faqat bitta turdagi dalilga (masalan, faqat testga) asoslansa yoki ba’zi komponentlarda dalil bo‘lmasa — ogohlantirish chiqadi.

Dalillar qayerdan keladi (standart moslik):

| Faoliyat | Komponent | Dalil turi |
|---|---|---|
| Manba tahlili / taqqoslash (o‘qituvchi bahosi) | Kognitiv | Manba tahlili |
| Diagnostik test | savol bog‘langan komponent | Test |
| So‘rovnoma (Likert) | Motivatsion-qadriyatli | So‘rovnoma |
| Refleksiv savollar (o‘qituvchi baholaydi) | Refleksiv-baholash | Refleksiv savollar |
| Topshiriq (rubrika) | har bir mezon bog‘langan komponent | topshiriqda belgilangan tur |
| Dars ishlanmasi ekspertizasi | Faoliyatli-metodik (+ ixtiyoriy Refleksiv) | Dars ishlanmasi / Ekspert |
| 3D/360° obyekt asosidagi ish | Faoliyatli-metodik | Amaliy topshiriq |
| O‘zini baholash | tanlangan komponentlar | O‘zini baholash |

> **Ilmiy izoh.** Komponentlar DOCX hujjatda «ishchi model» sifatida taklif qilingan. Daraja chegaralari va barcha vaznlar — **dastlabki konfiguratsiya** bo‘lib, admin panelidan («Baholash mezonlari») o‘zgartiriladi va ilmiy jihatdan tasdiqlangan qiymat sifatida ko‘rsatilmaydi. «Eksperiment natijalari» sahifasi faqat tavsifiy o‘rtachalarni beradi; statistik ahamiyatlilik tadqiqotchi tomonidan alohida tekshiriladi. Platforma hisob-kitoblari eksperiment samaradorligining isboti emas.

## Xavfsizlik

- Tizimga kirish **login (username) + parol** orqali; email ixtiyoriy. Login 3–32 belgi (lotin harflari, raqamlar, `.` `_` `-`), katta-kichik harfga sezgir emas. Mavjud foydalanuvchilarga migratsiyada emailning `@` dan oldingi qismi login qilib berilgan.
- Parollar **Argon2id** bilan hash qilinadi; login’da foydalanuvchi yo‘q bo‘lganda ham bir xil vaqt sarflanadi.
- **Access token** (JWT, 15 daqiqa) faqat xotirada saqlanadi (localStorage ishlatilmaydi — XSS’da o‘g‘irlanmaydi). **Refresh token** — `httpOnly`, `SameSite=Strict`, `path=/api/v1/auth` cookie; bazada HMAC-hash ko‘rinishida; har yangilanishda **rotatsiya**, eski token qayta ishlatilsa — foydalanuvchining barcha sessiyalari bekor qilinadi. Cookie bilan ishlaydigan endpointlar `X-Requested-With: dht` headerini talab qiladi (CSRF).
- Bloklangan/o‘chirilgan foydalanuvchining tokeni darhol yaroqsiz bo‘ladi (har so‘rovda holat tekshiriladi).
- **RBAC backendda**: har bir marshrutda rol tekshiruvi; talabaning shaxsiy ishlariga faqat o‘zi, uning guruhidagi o‘qituvchi va admin kira oladi (`shared/utils/access.ts`).
- Helmet (CSP, xavfsizlik headerlari), aniq **CORS** ro‘yxati, umumiy va auth uchun alohida **rate limit**, Zod validatsiyasi, Prisma parametrli so‘rovlari.
- Embed URL — faqat ruxsat etilgan domenlar va https (server va frontendda), iframe `sandbox`.
- Fayl yuklash: tur va hajm limiti, **fayl mazmuni (magic bytes) tekshiruvi**, tasodifiy nom, path traversal himoyasi, `nosniff`. Storage interfeysi (`modules/media/storage.ts`) S3-compatible drayverga o‘tishga tayyor.
- Pino loglarida parol, token va cookie maskalanadi; `.env` Git’ga kirmaydi.
- Muhim amallar (foydalanuvchi, manba, obyekt, baholash, sozlamalar) **audit log**ga yoziladi.
- CSV eksportda formula injection oldi olinadi.

## Hujjat talablari va taklif etilgan yechimlar

**Hujjatdan olingan (majburiy):** 7 modul va ularning mazmuni; asl manba / ilmiy sharh / ta’limiy variantni ajratish; manba uchun kelib chiqish, ishonchlilik, cheklovlar, raqamli nusxa havolasi, metodik tavsiyalar va topshiriqlar; tahlil laboratoriyasidagi ko‘nikmalar; dars konstruktoridagi qadamlar va «tayyor dars bermaslik» tamoyili; 4 komponentli ishchi model va baholash usullari; 3 daraja ta’riflari; portfolio tarkibi va oldingi/keyingi ishlarni taqqoslash; pedagogik eksperiment bosqichlari (aniqlovchi, shakllantiruvchi, nazorat) va tajriba/nazorat guruhlari; manba mualliflik huquqi va talabalar ma’lumotlarini himoya qilish.

**Taklif qilingan texnik yechimlar (hujjatda yo‘q):** hujjat dastlab Moodle/WordPress’ni tavsiya qiladi; master prompt talabiga ko‘ra platforma React + Node.js + PostgreSQL asosida noldan qurildi. Qo‘shimcha ravishda: dalillarga asoslangan shaffof kompetensiya hisob-kitobi va sozlanadigan vaznlar; rubrika mezonlarini komponentlarga bog‘lash; diagnostika urinishlari boshlangach savollarni bloklash; to‘g‘ri javoblarni talabaga ko‘rsatmaslik (oldingi/keyingi diagnostika xolisligi); portfolio avtomatik to‘ldirilishi; tajriba/nazorat guruhlari uchun tavsifiy hisobot va CSV eksport; xarita/timeline; audit log.

## Cheklovlar va tekshirilmagan qismlar

- **Tarixiy ma’lumotlar**: seed’dagi manbalar qisqa ta’limiy tavsiflar bo‘lib, barchasi «Demo» deb belgilangan. Manba matnlaridan iqtiboslar ataylab kiritilmagan (o‘ylab topilgan iqtibos bo‘lmasligi uchun) — asl matnlar, nashr ma’lumotlari va aniq saqlanish joylarini tadqiqotchi birlamchi nashrlardan qo‘shishi kerak. Davr chegaralari taxminiy.
- **Koordinatalar**: faqat taniqli obidalar uchun kiritilgan va taxminiy; boshqalar uchun bo‘sh (o‘ylab topilmagan). Xarita OpenStreetMap tile serveridan foydalanadi (internet talab qilinadi).
- **Email**: parolni tiklash uchun email servisi ulanmagan; development rejimida token javobda qaytariladi, productionda administrator parolni qayta o‘rnatadi.
- **PDF eksport** brauzerning «Chop etish → PDF sifatida saqlash» funksiyasi orqali (chop etishga mos stil bilan); server tomonida PDF generatsiyasi yo‘q.
- **Statistik tahlil** (t-test, χ² va h.k.) platformada bajarilmaydi — CSV eksport orqali tadqiqotchi tahlil qiladi.
- Tashqi saytlarning (Sketchfab, Uzbekistan360) mavjudligi va iframe siyosati vaqt o‘tishi bilan o‘zgarishi mumkin; platforma bunday holatda fallback ko‘rsatadi.
- O‘yin elementlari (reyting, yutuqlar) hujjatda «keyinchalik qo‘shish mumkin» deb ko‘rsatilgani uchun hozirgi versiyaga kiritilmagan.
- Brauzer E2E testlari (`frontend/e2e`) Vitest to‘plamiga kirmaydi va ishlab turgan serverlarni talab qiladi; CI konfiguratsiyasi tayyorlanmagan.
- Rollar qat’iy uchta (Admin, O‘qituvchi, Talaba); ruxsatlar kodda belgilangan va «Rollar va ruxsatlar» sahifasida faqat ko‘rsatiladi (UI orqali o‘zgartirilmaydi).

## Deploy (Render + Neon)

Internetga joylash bo‘yicha qadamma-qadam qo‘llanma — [DEPLOY.md](DEPLOY.md). Sozlamalar `render.yaml` da.
