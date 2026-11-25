import React from 'react';
import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { ensureProductsSeeded } from '@/lib/db-seed-helper';
import { MOCK_PRODUCTS, MockProduct } from '@/lib/mock-data';
import { getSeoSettings } from '@/lib/settings-actions';
import HombreClient from './HombreClient';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoSettings();
  return {
    title: seo.seo_homme_title || 'Homme · Maison FOEG Paris',
    description: seo.seo_homme_desc || 'Garde-robe masculine Haute Couture par FOEG Paris.',
    openGraph: {
      title: seo.seo_homme_title || 'Homme · Maison FOEG Paris',
      description: seo.seo_homme_desc || 'Garde-robe masculine Haute Couture par FOEG Paris.',
      url: 'https://foeg-paris.com/hombre',
      siteName: 'FOEG Paris',
      images: seo.seo_homme_image ? [{ url: seo.seo_homme_image }] : undefined,
    },
  };
}

interface PageProps {
  searchParams?: Promise<{
    category?: string;
    subcategory?: string;
    size?: string;
    sort?: string;
  }>;
}

export default async function HombrePage({ searchParams }: PageProps) {
  ensureProductsSeeded().catch(() => {});

  const params = searchParams ? await searchParams : {};
  const activeSubcategory = params.subcategory || params.category || 'Tout';
  const activeSize = params.size || 'Toutes';
  const activeSort = params.sort || 'newest';

  // Construction du filtre Prisma
  const whereClause: any = {
    category: {
      equals: 'Hombre',
      mode: 'insensitive',
    },
  };

  const isAllSubcategories =
    !activeSubcategory ||
    ['tout', 'todas', 'todos', 'all'].includes(activeSubcategory.toLowerCase());

  if (!isAllSubcategories) {
    // Normalisation multi-langue pour correspondance souple (FR, ES, EN)
    const sub = activeSubcategory.toLowerCase();
    let subMatches = [activeSubcategory];
    if (sub.includes('chemise') || sub.includes('camisa') || sub.includes('shirt') || sub.includes('top')) {
      subMatches = ['Chemises', 'Camisas y Tops', 'Camisas', 'Shirts'];
    } else if (sub.includes('manteau') || sub.includes('abrigo') || sub.includes('coat')) {
      subMatches = ['Manteaux', 'Abrigos', 'Coats'];
    } else if (sub.includes('pantalon') || sub.includes('pant')) {
      subMatches = ['Pantalons', 'Pantalones', 'Pants'];
    } else if (sub.includes('chaussure') || sub.includes('calzado') || sub.includes('shoe')) {
      subMatches = ['Chaussures', 'Calzado', 'Shoes'];
    } else if (sub.includes('accessoire') || sub.includes('accesorio') || sub.includes('accessory')) {
      subMatches = ['Accessoires', 'Accesorios', 'Accessories'];
    }

    whereClause.OR = subMatches.map((val) => ({
      subcategory: { equals: val, mode: 'insensitive' },
    }));
  }

  if (activeSize && !['toutes', 'todas', 'all'].includes(activeSize.toLowerCase())) {
    whereClause.variants = {
      some: {
        size: { equals: activeSize, mode: 'insensitive' },
        stock: { gt: 0 },
      },
    };
  }

  // Tri Prisma
  let orderByClause: any = { createdAt: 'desc' };
  if (activeSort === 'price_asc') {
    orderByClause = { price: 'asc' };
  } else if (activeSort === 'price_desc') {
    orderByClause = { price: 'desc' };
  }

  let dbProducts: any[] = [];
  try {
    dbProducts = await prisma.product.findMany({
      where: whereClause,
      include: {
        variants: true,
      },
      orderBy: orderByClause,
    });
  } catch (err) {
    console.warn('[HOMBRE FETCH ERROR]:', err);
  }

  // Conversion des Decimal / données brutes en MockProduct
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
          'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1600&q=85',
          'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1600&q=85',
          'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1600&q=85',
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

  // Fallback si la DB est injoignable ou vide
  if (products.length === 0 && dbProducts.length === 0) {
    let mockFiltered = MOCK_PRODUCTS.filter((p) => p.category?.toLowerCase() === 'hombre');

    if (!isAllSubcategories) {
      mockFiltered = mockFiltered.filter(
        (p) => p.subcategory?.toLowerCase() === activeSubcategory.toLowerCase()
      );
    }

    if (activeSize && !['toutes', 'todas', 'all'].includes(activeSize.toLowerCase())) {
      mockFiltered = mockFiltered.filter((p) =>
        p.variants.some((v) => v.size.toLowerCase() === activeSize.toLowerCase() && v.stock > 0)
      );
    }

    if (activeSort === 'price_asc') {
      mockFiltered.sort((a, b) => a.price - b.price);
    } else if (activeSort === 'price_desc') {
      mockFiltered.sort((a, b) => b.price - a.price);
    }

    products = mockFiltered;
  }

  return (
    <HombreClient
      products={products}
      activeSubcategory={activeSubcategory}
      activeSize={activeSize}
      activeSort={activeSort}
    />
  );
}
