// Node'da (TypeScript'ni o'zi o'qiydi) kitob ssenariysini slug bo'yicha BOOKS ro'yxatidan yuklaydi.
export const load = async (slug) => {
  const { BOOKS } = await import('../src/books/index.ts');
  const book = BOOKS.find((b) => b.slug === slug);
  if (!book) throw new Error(`Noma'lum kitob: ${slug}`);
  return book;
};
