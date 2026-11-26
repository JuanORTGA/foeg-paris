import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { ensureProductsSeeded } from '@/lib/db-seed-helper';
import { MOCK_PRODUCTS, MockProduct } from '@/lib/mock-data';
import ProductoClient from './ProductoClient';

export const revalidate = 60; // Habilita ISR de 60s y prefetch ultra-rápido

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductoPage({ params }: PageProps) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug || '');
  const cleanSlug = slug.replace(/^\//, '').trim();

  // 1. Recherche parallèle du produit et des pièces associées dans Neon
  let dbProduct: any = null;
  let dbRelated: any[] = [];

  try {
    const [productRes, relatedRes] = await Promise.all([
      prisma.product.findFirst({
        where: {
          OR: [
            { slug: cleanSlug },
            { slug: `/${cleanSlug}` },
            { slug: { equals: cleanSlug, mode: 'insensitive' } },
          ],
        },
        include: {
          variants: true,
          measurements: true,
        },
      }),
      prisma.product.findMany({
        where: {
          slug: { notIn: [cleanSlug, `/${cleanSlug}`] },
        },
        take: 3,
        include: {
          variants: true,
        },
      }),
    ]);

    dbProduct = productRes;
    dbRelated = relatedRes || [];
  } catch (err) {
    console.warn('[PRODUCTO SLUG FETCH ERROR]:', err);
  }

  // 2. Si non trouvé dans Neon par slug, recherche de secours dans le catalogue mock
  let product: MockProduct | undefined;
  if (dbProduct) {
    product = {
      id: dbProduct.id,
      slug: dbProduct.slug.replace(/^\//, ''),
      name: dbProduct.name,
      price: Number(dbProduct.price),
      currency: dbProduct.currency,
      category: dbProduct.category as 'Mujer' | 'Hombre',
      subcategory: dbProduct.subcategory || undefined,
      badge: dbProduct.badge || undefined,
      images: Array.isArray(dbProduct.images) && dbProduct.images.length > 0
        ? (dbProduct.images as string[])
        : [
            (dbProduct.images?.[0] as string) || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1200&q=85',
            (dbProduct.images?.[0] as string) || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1200&q=85',
            (dbProduct.images?.[0] as string) || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1200&q=85',
          ],
      isNew: dbProduct.isNew,
      description: dbProduct.description,
      composition: dbProduct.composition,
      origin: dbProduct.origin,
      care: Array.isArray(dbProduct.care) ? dbProduct.care : ['Nettoyage à sec spécialisé uniquement'],
      variants: (dbProduct.variants || []).map((v: any) => ({
        size: v.size as any,
        stock: Number(v.stock),
        color: v.color,
      })),
      measurements: (dbProduct.measurements || []).map((m: any) => ({
        size: m.size as any,
        chest: m.chest,
        waist: m.waist,
        hips: m.hips,
        length: m.length,
      })),
    };
  } else {
    product = MOCK_PRODUCTS.find((p) => p.slug === cleanSlug || p.slug === slug);
  }

  if (!product) {
    return notFound();
  }

  // 3. Produits associés (déjà récupérés en parallèle)
  let relatedProducts: MockProduct[] = [];
  if (Array.isArray(dbRelated) && dbRelated.length > 0) {
    relatedProducts = dbRelated.map((p) => ({
      id: p.id,
      slug: p.slug.replace(/^\//, ''),
      name: p.name,
      price: Number(p.price),
      currency: p.currency,
      category: p.category as 'Mujer' | 'Hombre',
      subcategory: p.subcategory || undefined,
      badge: p.badge || undefined,
      images: Array.isArray(p.images) && p.images.length > 0 ? (p.images as string[]) : ['https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1200&q=85'],
      isNew: p.isNew,
      description: p.description,
      composition: p.composition,
      origin: p.origin,
      care: Array.isArray(p.care) ? p.care : ['Nettoyage à sec spécialisé uniquement'],
      variants: (p.variants || []).map((v: any) => ({ size: v.size, stock: Number(v.stock), color: v.color })),
      measurements: [],
    }));
  }

  if (relatedProducts.length === 0) {
    relatedProducts = MOCK_PRODUCTS.filter((p) => p.slug !== product?.slug).slice(0, 3);
  }

  return <ProductoClient currentProduct={product} relatedProducts={relatedProducts} />;
}
