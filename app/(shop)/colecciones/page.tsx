import React from 'react';
import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { ensureProductsSeeded } from '@/lib/db-seed-helper';
import { MOCK_PRODUCTS, MockProduct } from '@/lib/mock-data';
import ColeccionesClient from './ColeccionesClient';

export const revalidate = 60; // Refresca cada 60s en vez de siempre renderizar desde cero

export const metadata: Metadata = {
  title: 'Colecciones · Maison FOEG Paris',
  description: 'L’ensemble des silhouettes créées par la Maison FOEG. Archives & Éditions Permanentes.',
};

export default async function ColeccionesPage() {
  ensureProductsSeeded().catch(() => {});

  let dbProducts: any[] = [];
  try {
    dbProducts = await prisma.product.findMany({
      include: {
        variants: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch (err) {
    console.warn('[COLECCIONES FETCH ERROR]:', err);
  }

  let products: MockProduct[] = (dbProducts || []).map((p) => ({
    id: p.id,
    slug: p.slug.replace(/^\//, ''),
    name: p.name,
    price: Number(p.price),
    currency: p.currency,
    category: p.category as 'Mujer' | 'Hombre',
    subcategory: p.subcategory || undefined,
    badge: p.badge || undefined,
    images: Array.isArray(p.images) && p.images.length >= 3
      ? (p.images.slice(0, 3) as [string, string, string])
      : Array.isArray(p.images) && p.images.length > 0
      ? [p.images[0], p.images[0], p.images[0]]
      : [
          'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1200&q=85',
          'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1200&q=85',
          'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1200&q=85',
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

  if (products.length === 0) {
    products = MOCK_PRODUCTS;
  }

  return <ColeccionesClient products={products} />;
}
