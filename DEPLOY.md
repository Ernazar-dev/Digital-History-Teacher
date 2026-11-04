# Deploy: GitHub → Render (free, bitta servis) + Neon (PostgreSQL)

Tuzilma:

| Qism | Qayerda | Tarif |
|---|---|---|
| Backend + Frontend (Express + Prisma; React `dist` ni ham backend beradi) | Render **Web Service** — `dht-backend` | Free |
| Ma'lumotlar bazasi | **Neon** PostgreSQL | Free |
| Yuklangan fayllar | Neon bazasida (`StoredFile` jadvali) | — |

Brauzer faqat bitta manzilni ko'radi: sahifalar ham, `/api/*` ham bitta servisdan keladi (`FRONTEND_DIST_DIR`).
Alohida proxy/rewrite hop'i yo'q — sahifadan sahifaga o'tish tezroq; cookie (login sessiyasi) va CORS bilan muammo ham bo'lmaydi. Hammasi `render.yaml` da yozilgan.

---

## 1. GitHub'ga yuklash

```bash
# loyiha papkasida (git allaqachon yoqilgan, branch: main)
git add -A
git commit -m "Dastlabki versiya"
git remote add origin https://github.com/<login>/<repo>.git
git push -u origin main
```

`.gitignore` tufayli repoga **chiqmaydi**: `.env` fayllar (parollar), `node_modules`, `dist`,
`backend/uploads` (yuklangan fayllar), dizayn maketlari va `.docx` hujjatlar. Faqat `.env.example` namunalari chiqadi.

## 2. Neon — baza

1. <https://neon.tech> → **New project** → Region: **AWS Europe Central (Frankfurt)** (Render backend ham shu yerda).
2. **Connect** oynasidan ikkita manzil oling:
   - **Pooled connection o'chiq** — `DATABASE_URL` (migratsiya va seed uchun to'g'ridan-to'g'ri ulanish);
   - **Pooled connection yoqiq** (host `...-pooler...`) — `DATABASE_POOLED_URL` (ishlayotgan server uchun: ulanishlar qayta ochilmaydi, sahifalar tezroq).
3. Connection string'ni nusxalang va oxiriga `&connect_timeout=15` qo'shing:
   ```
   postgresql://USER:PAROL@ep-xxxx.eu-central-1.aws.neon.tech/neondb?sslmode=require&connect_timeout=15
   ```
   Bu — `DATABASE_URL`. Hech kimga ko'rsatmang va GitHub'ga yozmang.

## 3. Render — servislar

1. <https://render.com> → GitHub bilan kiring → **New → Blueprint** → repozitoriyni tanlang.
   Render `render.yaml` ni o'qib, servisni o'zi yaratadi (frontend ham shu servisda quriladi).
2. So'ralgan qiymatlarni kiriting (`dht-backend` uchun):

   | O'zgaruvchi | Qiymat |
   |---|---|
   | `DATABASE_URL` | Neon to'g'ridan-to'g'ri connection string (2-bosqich) |
   | `DATABASE_POOLED_URL` | Neon pooled (`-pooler`) connection string (2-bosqich) |
   | `ADMIN_USERNAME` | administrator logini, masalan `admin` |
   | `ADMIN_PASSWORD` | kuchli parol (kamida 10 belgi, `change-me` bilan boshlanmasin) |
   | `CORS_ORIGINS` | servisning o'z manzili: `https://dht-backend.onrender.com` |

   `JWT_*` kalitlarini Render o'zi yaratadi.
3. **Apply** → birinchi deploy boshlanadi (backend ~5–8 daqiqa). Backend build vaqtida o'zi:
   - migratsiyalarni qo'llaydi (`prisma migrate deploy`);
   - baza **bo'sh bo'lsa** — boshlang'ich ma'lumotlarni (davrlar, manbalar, muzey obyektlari) yuklaydi.
     Keyingi deploylarda bu qadam o'tkazib yuboriladi — administrator tahrirlari saqlanadi;
   - administrator hisobini `ADMIN_*` qiymatlari asosida yaratadi.
4. **Muhim:** Render boshqa manzil bergan bo'lsa (masalan `dht-backend-x1y2.onrender.com`), `CORS_ORIGINS` ni shu haqiqiy manzilga o'zgartiring.
5. **Eski sozlamadan o'tish** (avval alohida `dht-frontend` static sayt bo'lgan bo'lsa): Blueprint'ni qayta sinxronlang (yoki `dht-backend` da *Root Directory* ni bo'sh qoldirib, build/start buyruqlarini `render.yaml` dagidek qo'ying), `DATABASE_POOLED_URL` va `FRONTEND_DIST_DIR=../frontend/dist` ni qo'shing, `TRUST_PROXY_HOPS=1` qiling. Sayt endi `dht-backend` manzilida ochiladi; eski `dht-frontend` ni o'chirishingiz mumkin.

Tekshirish: `https://dht-backend.onrender.com` ochiladi, `https://dht-backend.onrender.com/api/v1/health` → `{"data":{"status":"ok"...}}`.
Administrator sifatida kiring → **Sozlamalar** da logotip, nom va boshqa ma'lumotlarni to'ldiring → **Guruhlar** yarating.

## 4. Free tarif cheklovlari (bilib qo'ying)

- **Backend 15 daqiqa ishlatilmasa "uxlaydi".** Keyingi birinchi so'rov ~30–60 soniya kutadi, keyin odatdagidek tez.
  Darsdan oldin saytni bir marta ochib qo'yish kifoya.
- **Neon** ham ishlatilmaganda to'xtaydi va bir soniyada uyg'onadi (`connect_timeout=15` shu uchun).
- Neon free — **0.5 GB** joy. Yuklangan fayllar ham bazada saqlanadi (bitta fayl ≤ 10 MB) — dissertatsiya tajribasi uchun yetarli.
- Render free diski vaqtinchalik — shuning uchun `STORAGE_DRIVER=database` (fayllar deploydan keyin yo'qolmaydi).

## 5. Yangilash

Kodni o'zgartirib `git push` qilsangiz, Render servisni avtomatik qayta deploy qiladi.
Yangi migratsiyalar avtomatik qo'llanadi.

## 6. (Ixtiyoriy) Lokal ma'lumotlarni Neon'ga ko'chirish

Kompyuteringizdagi bazadagi manbalar, foydalanuvchilar va natijalarni saytga o'tkazmoqchi bo'lsangiz —
**birinchi Render deploydan oldin**, bo'sh Neon bazasiga (PowerShell, loyiha papkasida):

```powershell
# 1) Lokal bazadan nusxa (docker-compose dagi PostgreSQL)
docker exec dht-postgres pg_dump -U dht -d digital_history_teacher --no-owner --no-acl -Fc -f /tmp/dht.dump
docker cp dht-postgres:/tmp/dht.dump ./dht.dump

# 2) Neon'ga tiklash (pg_restore — Docker orqali)
$NEON = "postgresql://USER:PAROL@ep-xxxx.eu-central-1.aws.neon.tech/neondb?sslmode=require"
docker run --rm -v "${PWD}:/w" postgres:16 pg_restore --no-owner --no-acl -d "$NEON" /w/dht.dump

# 3) Yuklangan fayllarni (backend/uploads) Neon bazasiga ko'chirish
cd backend
$env:DATABASE_URL = $NEON
npm run storage:import
Remove-Item Env:DATABASE_URL
cd ..; Remove-Item ./dht.dump
```

Shundan keyin Render deploy qilinganda migratsiyalar "allaqachon qo'llangan", boshlang'ich ma'lumotlar esa
"baza bo'sh emas" deb o'tkazib yuboriladi — sizning ma'lumotlaringiz o'zgarmaydi.

## Lokal ishlab chiqish

Lokal ishga tushirish avvalgidek (README.md). Lokal muhitda fayllar diskda saqlanadi (`STORAGE_DRIVER=local`).
