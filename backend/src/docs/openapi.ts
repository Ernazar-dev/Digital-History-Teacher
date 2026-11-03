/**
 * OpenAPI 3.0 hujjati. Marshrutlar jadvali asosida generatsiya qilinadi.
 * Batafsil so'rov sxemalari modul ichidagi Zod sxemalarida (`*.schemas.ts`) belgilangan.
 */
type Method = 'get' | 'post' | 'put' | 'patch' | 'delete';
type Access = 'public' | 'auth' | 'STUDENT' | 'TEACHER+' | 'ADMIN';
type Route = [Method, string, string, Access, boolean?];

const R: Record<string, Route[]> = {
  Auth: [
    ['post', '/auth/register', 'Ro‘yxatdan o‘tish (faqat talaba)', 'public', true],
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
    ['get', '/sources', 'Mavzular (ma’ruza, taqdimot, video)', 'public'],
    ['get', '/sources/{id}', 'Manba (id yoki slug)', 'public'],
    ['post', '/sources', 'Manba yaratish', 'TEACHER+', true],
    ['patch', '/sources/{id}', 'Tahrirlash (nashr — faqat admin)', 'TEACHER+', true],
    ['delete', '/sources/{id}', 'O‘chirish', 'TEACHER+'],
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
  Tests: [
    ['get', '/tests', 'Testlar (talabaga — o‘zi natijasi bilan)', 'auth'],
    ['get', '/tests/{id}', 'Test (kalit faqat o‘qituvchiga; talabaga topshirgach)', 'auth'],
    ['post', '/tests', 'Test yuklash (fayl + javoblar kaliti)', 'TEACHER+', true],
    ['patch', '/tests/{id}', 'Tahrirlash (kalit o‘zgarsa natijalar qayta hisoblanadi)', 'TEACHER+', true],
    ['delete', '/tests/{id}', 'O‘chirish', 'TEACHER+'],
    ['post', '/tests/{id}/attempt', 'Javoblarni topshirish (bir marta)', 'STUDENT', true],
    ['get', '/tests/{id}/results', 'Talabalar natijalari', 'TEACHER+'],
    ['delete', '/tests/{id}/attempts/{attemptId}', 'Qayta topshirishga ruxsat', 'TEACHER+'],
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
