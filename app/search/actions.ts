'use server';

import { prisma } from '@/lib/db';
import { MOCK_PRODUCTS, MockProduct } from '@/lib/mock-data';

export async function searchProducts(query: string): Promise<MockProduct[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  let dbProducts: any[] = [];
  try {
    dbProducts = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: trimmed, mode: 'insensitive' } },
          { description: { contains: trimmed, mode: 'insensitive' } },
          { subcategory: { contains: trimmed, mode: 'insensitive' } },
          { category: { contains: trimmed, mode: 'insensitive' } },
          { composition: { contains: trimmed, mode: 'insensitive' } },
        ],
      },
      include: {
        variants: true,
        measurements: true,
      },
      take: 24,
      orderBy: { createdAt: 'desc' },
    });
  } catch (err) {
    console.warn('[SEARCH SERVER ACTION DB ERROR]:', err);
  }

  if (dbProducts && dbProducts.length > 0) {
    return dbProducts.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      price: Number(p.price),
      currency: p.currency,
      category: p.category as 'Mujer' | 'Hombre',
      subcategory: p.subcategory || undefined,
      images: Array.isArray(p.images) && p.images.length >= 3
        ? (p.images.slice(0, 3) as [string, string, string])
        : [
            (p.images?.[0] as string) || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1200&q=85',
            (p.images?.[0] as string) || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1200&q=85',
            (p.images?.[0] as string) || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1200&q=85',
          ],
      isNew: p.isNew,
      description: p.description,
      composition: p.composition,
      origin: p.origin,
      care: Array.isArray(p.care) ? p.care : ['Nettoyage à sec spécialisé uniquement'],
      variants: (p.variants || []).map((v: any) => ({
        size: v.size,
        stock: Number(v.stock),
        color: v.color,
      })),
      measurements: (p.measurements || []).map((m: any) => ({
        size: m.size,
        chest: m.chest,
        waist: m.waist,
        hips: m.hips,
        length: m.length,
      })),
    }));
  }

  // Fallback avec les créations en mémoire
  const lower = trimmed.toLowerCase();
  return MOCK_PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(lower) ||
      p.description.toLowerCase().includes(lower) ||
      (p.subcategory && p.subcategory.toLowerCase().includes(lower)) ||
      p.category.toLowerCase().includes(lower) ||
      p.composition.toLowerCase().includes(lower)
  );
}
