/**
 * OpenAPI 3.0 hujjati. Marshrutlar jadvali asosida generatsiya qilinadi.
 * Batafsil so'rov sxemalari modul ichidagi Zod sxemalarida (`*.schemas.ts`) belgilangan.
 */
type Method = 'get' | 'post' | 'put' | 'patch' | 'delete';
type Access = 'public' | 'auth' | 'STUDENT' | 'TEACHER+' | 'ADMIN';
type Route = [Method, string, string, Access, boolean?];

const R: Record<string, Route[]> = {
  Auth: [
    ['post', '/auth/register', 'Ro‘yxatdan o‘tish (talaba/o‘qituvchi)', 'public', true],
    ['post', '/auth/login', 'Kirish — access token + httpOnly refresh cookie', 'public', true],
    ['post', '/auth/refresh', 'Tokenni yangilash (X-Requested-With: dht header)', 'public'],
    ['post', '/auth/logout', 'Chiqish', 'public'],
    ['get', '/auth/me', 'Joriy foydalanuvchi', 'auth'],
    ['patch', '/auth/me', 'Profilni yangilash', 'auth', true],
    ['post', '/auth/change-password', 'Parolni o‘zgartirish', 'auth', true],
    ['post', '/auth/forgot-password', 'Parolni tiklash tokeni', 'public', true],
    ['post', '/auth/reset-password', 'Parolni tiklash', 'public', true],
  ],
  Users: [
    ['get', '/users', 'Foydalanuvchilar (o‘qituvchiga faqat faol talabalar)', 'TEACHER+'],
    ['post', '/users', 'Foydalanuvchi yaratish', 'ADMIN', true],
    ['get', '/users/{id}', 'Foydalanuvchi', 'ADMIN'],
    ['patch', '/users/{id}', 'Rol/holatni o‘zgartirish', 'ADMIN', true],
    ['post', '/users/{id}/approve', 'Tasdiqlash', 'ADMIN'],
    ['post', '/users/{id}/reset-password', 'Parolni tiklash', 'ADMIN', true],
    ['delete', '/users/{id}', 'O‘chirish (soft delete)', 'ADMIN'],
  ],
  Groups: [
    ['get', '/groups', 'Guruhlar (rolga mos)', 'auth'],
    ['post', '/groups', 'Guruh yaratish (REGULAR/EXPERIMENTAL/CONTROL)', 'TEACHER+', true],
    ['get', '/groups/{id}', 'Guruh va a’zolar', 'auth'],
    ['patch', '/groups/{id}', 'Guruhni tahrirlash', 'TEACHER+', true],
    ['delete', '/groups/{id}', 'Guruhni o‘chirish', 'TEACHER+'],
    ['post', '/groups/{id}/members', 'Talabalarni biriktirish', 'TEACHER+', true],
    ['delete', '/groups/{id}/members/{studentId}', 'Talabani chiqarish', 'TEACHER+'],
  ],
  Catalog: [
    ['get', '/periods', 'Tarixiy davrlar', 'public'],
    ['post', '/periods', 'Davr qo‘shish', 'ADMIN', true],
    ['patch', '/periods/{id}', 'Davrni tahrirlash', 'ADMIN', true],
    ['delete', '/periods/{id}', 'Davrni o‘chirish', 'ADMIN'],
    ['get', '/topics', 'Mavzular', 'public'],
    ['post', '/topics', 'Mavzu qo‘shish', 'ADMIN', true],
    ['patch', '/topics/{id}', 'Mavzuni tahrirlash', 'ADMIN', true],
    ['delete', '/topics/{id}', 'Mavzuni o‘chirish', 'ADMIN'],
  ],
  Sources: [
    ['get', '/sources', 'Manbalar katalogi (qidiruv, filtr, saralash)', 'public'],
    ['get', '/sources/{id}', 'Manba (id yoki slug)', 'public'],
    ['post', '/sources', 'Manba yaratish', 'TEACHER+', true],
    ['patch', '/sources/{id}', 'Tahrirlash (nashr — faqat admin)', 'TEACHER+', true],
    ['delete', '/sources/{id}', 'O‘chirish', 'TEACHER+'],
  ],
  'Source analysis': [
    ['get', '/source-analyses/template/{type}', 'Manba turiga mos tahlil savollari', 'auth'],
    ['get', '/source-analyses', 'Tahlillar', 'auth'],
    ['get', '/source-analyses/{id}', 'Tahlil', 'auth'],
    ['post', '/source-analyses', 'Tahlil boshlash', 'STUDENT', true],
    ['patch', '/source-analyses/{id}', 'Javoblarni saqlash', 'STUDENT', true],
    ['post', '/source-analyses/{id}/submit', 'Topshirish', 'STUDENT'],
    ['post', '/source-analyses/{id}/review', 'Qaytarish yoki baholash', 'TEACHER+', true],
    ['delete', '/source-analyses/{id}', 'Qoralamani o‘chirish', 'STUDENT'],
    ['get', '/source-comparisons', 'Taqqoslashlar', 'auth'],
    ['get', '/source-comparisons/{id}', 'Taqqoslash', 'auth'],
    ['post', '/source-comparisons', 'Taqqoslash yaratish', 'STUDENT', true],
    ['patch', '/source-comparisons/{id}', 'Tahrirlash', 'STUDENT', true],
    ['post', '/source-comparisons/{id}/submit', 'Topshirish', 'STUDENT'],
    ['post', '/source-comparisons/{id}/review', 'Baholash', 'TEACHER+', true],
  ],
  'Virtual museum': [
    ['get', '/virtual-objects', '3D/360° obyektlar katalogi', 'public'],
    ['get', '/virtual-objects/{id}', 'Obyekt (id yoki slug)', 'public'],
    ['post', '/virtual-objects', 'Obyekt qo‘shish (embed URL serverda tekshiriladi)', 'ADMIN', true],
    ['patch', '/virtual-objects/{id}', 'Tahrirlash', 'ADMIN', true],
    ['patch', '/virtual-objects/{id}/active', 'Faollashtirish/yashirish', 'ADMIN', true],
    ['delete', '/virtual-objects/{id}', 'O‘chirish', 'ADMIN'],
    ['put', '/virtual-objects/{id}/response', 'Kuzatuv javoblarini saqlash', 'STUDENT', true],
    ['post', '/virtual-objects/{id}/response/submit', 'Topshirish (portfolioga)', 'STUDENT'],
    ['get', '/virtual-objects/{id}/responses', 'Talabalar javoblari', 'TEACHER+'],
    ['get', '/virtual-objects/responses/mine', 'Mening javoblarim', 'STUDENT'],
    ['get', '/virtual-objects/responses/{responseId}', 'Javob', 'auth'],
    ['post', '/virtual-objects/responses/{responseId}/review', 'Baholash', 'TEACHER+', true],
  ],
  Assignments: [
    ['get', '/assignments', 'Topshiriqlar', 'auth'],
    ['get', '/assignments/{id}', 'Topshiriq', 'auth'],
    ['post', '/assignments', 'Yaratish', 'TEACHER+', true],
    ['patch', '/assignments/{id}', 'Tahrirlash/nashr', 'TEACHER+', true],
    ['delete', '/assignments/{id}', 'Arxivlash', 'TEACHER+'],
    ['put', '/assignments/{id}/submission', 'Javobni saqlash', 'STUDENT', true],
    ['post', '/assignments/{id}/submission/submit', 'Javobni topshirish', 'STUDENT'],
    ['get', '/assignments/rubrics', 'Rubrikalar', 'TEACHER+'],
    ['post', '/assignments/rubrics', 'Rubrika yaratish', 'TEACHER+', true],
    ['put', '/assignments/rubrics/{id}', 'Rubrikani tahrirlash', 'TEACHER+', true],
    ['delete', '/assignments/rubrics/{id}', 'Rubrikani o‘chirish', 'TEACHER+'],
    ['get', '/submissions', 'Javoblar', 'auth'],
    ['get', '/submissions/{id}', 'Javob (versiyalar va izohlar)', 'auth'],
    ['post', '/submissions/{id}/start-review', 'Tekshirishni boshlash', 'TEACHER+'],
    ['post', '/submissions/{id}/feedback', 'Izoh / qaytarish / rubrika bo‘yicha baholash', 'TEACHER+', true],
  ],
  Lessons: [
    ['get', '/lessons', 'Dars ishlanmalari', 'auth'],
    ['get', '/lessons/{id}', 'Dars ishlanmasi', 'auth'],
    ['get', '/lessons/{id}/versions/{version}', 'Versiya snapshot', 'auth'],
    ['post', '/lessons', 'Yaratish', 'auth', true],
    ['patch', '/lessons/{id}', 'Saqlash (yangi versiya)', 'auth', true],
    ['post', '/lessons/{id}/submit', 'Topshirish', 'auth'],
    ['post', '/lessons/{id}/review', 'Ekspertiza', 'TEACHER+', true],
    ['delete', '/lessons/{id}', 'Qoralamani o‘chirish', 'auth'],
  ],
  Diagnostics: [
    ['get', '/diagnostics', 'Diagnostikalar', 'auth'],
    ['get', '/diagnostics/{id}', 'Diagnostika', 'auth'],
    ['post', '/diagnostics', 'Yaratish', 'TEACHER+', true],
    ['patch', '/diagnostics/{id}', 'Tahrirlash', 'TEACHER+', true],
    ['delete', '/diagnostics/{id}', 'O‘chirish', 'ADMIN'],
    ['get', '/diagnostics/{id}/attempts', 'Urinishlar', 'TEACHER+'],
    ['post', '/diagnostics/{id}/attempts', 'Boshlash', 'STUDENT'],
    ['get', '/diagnostics/attempts/{attemptId}', 'Urinish', 'auth'],
    ['put', '/diagnostics/attempts/{attemptId}/responses', 'Javoblarni saqlash', 'STUDENT', true],
    ['post', '/diagnostics/attempts/{attemptId}/submit', 'Topshirish (avtomatik baholash)', 'STUDENT'],
    ['post', '/diagnostics/attempts/{attemptId}/grade', 'Matnli javoblarni baholash', 'TEACHER+', true],
  ],
  Assessments: [
    ['get', '/assessments/config', 'Komponentlar, mezonlar, indikatorlar, darajalar, vaznlar', 'auth'],
    ['post', '/assessments/components', 'Komponent qo‘shish', 'ADMIN', true],
    ['patch', '/assessments/components/{id}', 'Komponentni tahrirlash', 'ADMIN', true],
    ['delete', '/assessments/components/{id}', 'Komponentni o‘chirish', 'ADMIN'],
    ['put', '/assessments/components/{id}/weights', 'Dalil turlari vaznlari', 'ADMIN', true],
    ['post', '/assessments/components/{id}/criteria', 'Mezon qo‘shish', 'ADMIN', true],
    ['patch', '/assessments/criteria/{id}', 'Mezonni tahrirlash', 'ADMIN', true],
    ['delete', '/assessments/criteria/{id}', 'Mezonni o‘chirish', 'ADMIN'],
    ['post', '/assessments/criteria/{id}/indicators', 'Indikator qo‘shish', 'ADMIN', true],
    ['patch', '/assessments/indicators/{id}', 'Indikatorni tahrirlash', 'ADMIN', true],
    ['delete', '/assessments/indicators/{id}', 'Indikatorni o‘chirish', 'ADMIN'],
    ['put', '/assessments/levels', 'Darajalar chegaralari', 'ADMIN', true],
    ['get', '/assessments/me/profile', 'Mening kompetensiya profilim', 'auth'],
    ['get', '/assessments/students/{studentId}/profile', 'Talaba profili (?stage=)', 'auth'],
    ['get', '/assessments/students/{studentId}/dynamics', 'Bosqichlar bo‘yicha dinamika', 'auth'],
    ['get', '/assessments/students/{studentId}/records', 'Baholash tarixi', 'auth'],
    ['post', '/assessments/self', 'O‘zini o‘zi baholash', 'STUDENT', true],
    ['post', '/assessments/records', 'O‘qituvchi/ekspert bahosi', 'TEACHER+', true],
    ['get', '/assessments/groups/{groupId}/summary', 'Guruh natijalari', 'TEACHER+'],
    ['get', '/assessments/groups/{groupId}/export.csv', 'CSV eksport', 'TEACHER+'],
    ['get', '/assessments/experiment', 'Tajriba/nazorat guruhlari — tavsifiy taqqoslash', 'TEACHER+'],
  ],
  Portfolios: [
    ['get', '/portfolios/me', 'Mening portfoliom', 'STUDENT'],
    ['patch', '/portfolios/me', 'Portfolio tavsifi', 'STUDENT', true],
    ['get', '/portfolios/students/{studentId}', 'Talaba portfoliosi', 'auth'],
    ['get', '/portfolios/items/{id}', 'Element tafsiloti', 'auth'],
    ['patch', '/portfolios/items/{id}', 'Elementni belgilash', 'STUDENT', true],
    ['post', '/portfolios/reflections', 'Refleksiv yozuv', 'STUDENT', true],
    ['patch', '/portfolios/reflections/{id}', 'Tahrirlash', 'STUDENT', true],
    ['delete', '/portfolios/reflections/{id}', 'O‘chirish', 'STUDENT'],
  ],
  Analytics: [
    ['get', '/analytics/dashboard', 'Rolga mos dashboard', 'auth'],
    ['get', '/analytics/review-queue', 'Tekshiruv navbati', 'TEACHER+'],
  ],
  Explore: [
    ['get', '/explore/search', 'Umumiy qidiruv (?q=&types=sources,objects,...)', 'public'],
    ['get', '/explore/map', 'Xarita nuqtalari', 'public'],
    ['get', '/explore/timeline', 'Vaqt chizig‘i', 'public'],
  ],
  Admin: [
    ['get', '/admin/settings', 'Tizim sozlamalari', 'ADMIN'],
    ['put', '/admin/settings', 'Sozlamalarni saqlash', 'ADMIN', true],
    ['get', '/admin/audit-logs', 'Audit loglar', 'ADMIN'],
    ['get', '/settings/public', 'Ochiq sozlamalar (nom, logotip)', 'public'],
    ['post', '/media', 'Fayl yuklash (multipart, file)', 'TEACHER+'],
    ['get', '/media/{id}', 'Faylni olish', 'public'],
    ['delete', '/media/{id}', 'Faylni o‘chirish', 'ADMIN'],
  ],
};

const ACCESS_NOTE: Record<Access, string> = {
  public: 'Ochiq',
  auth: 'Autentifikatsiya talab qilinadi',
  STUDENT: 'Rol: STUDENT',
  'TEACHER+': 'Rol: TEACHER yoki ADMIN',
  ADMIN: 'Rol: ADMIN',
};

const errorResponse = { $ref: '#/components/responses/Error' };

const paths: Record<string, Record<string, unknown>> = {};
for (const [tag, routes] of Object.entries(R)) {
  for (const [method, path, summary, access, hasBody] of routes) {
    const params = [...path.matchAll(/\{(\w+)\}/g)].map((m) => ({
      name: m[1], in: 'path', required: true, schema: { type: 'string' },
    }));
    paths[path] ??= {};
    paths[path][method] = {
      tags: [tag],
      summary,
      description: ACCESS_NOTE[access],
      ...(access === 'public' ? {} : { security: [{ bearerAuth: [] }] }),
      ...(params.length ? { parameters: params } : {}),
      ...(hasBody ? { requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } } } : {}),
      responses: {
        200: { description: 'Muvaffaqiyatli: { data, meta? }' },
        400: errorResponse,
        401: errorResponse,
        403: errorResponse,
        404: errorResponse,
      },
    };
  }
}

export const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Digital History Teacher API',
    version: '1.0.0',
    description:
      'Bo‘lajak tarix o‘qituvchilarining metodik kompetensiyasini rivojlantirish platformasi REST API. Javoblar `{ data, meta? }`, xatolar `{ error: { code, message, details? } }` formatida.',
  },
  servers: [{ url: '/api/v1' }],
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    responses: {
      Error: {
        description: 'Xato',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: { type: 'object', properties: { code: { type: 'string' }, message: { type: 'string' }, details: {} } },
              },
            },
          },
        },
      },
    },
  },
  paths,
};
