import React from 'react';
import { prisma } from '@/lib/db';
import { ensureProductsSeeded } from '@/lib/db-seed-helper';
import AdminProductosClient, { AdminProductItem } from './AdminProductosClient';

export const dynamic = 'force-dynamic';

export default async function AdminProductosPage() {
  // 1. Auto-initialisation en arrière-plan
  ensureProductsSeeded().catch(() => {});

  // 2. Récupération stricte des produits réels dans Neon
  let rawProducts: any[] = [];
  try {
    rawProducts = await prisma.product.findMany({
      select: {
        id: true,
        slug: true,
        name: true,
        price: true,
        currency: true,
        category: true,
        subcategory: true,
        badge: true,
        images: true,
        description: true,
        composition: true,
        variants: {
          select: {
            id: true,
            size: true,
            stock: true,
            color: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch (err) {
    console.error('[ADMIN PRODUCTOS FETCH ERROR]:', err);
  }

  // 3. REGLA CRÍTICA: Conversion des Decimal en Number pour sérialisation Server -> Client
  const sanitizedProducts: AdminProductItem[] = rawProducts.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: Number(p.price),
    currency: p.currency,
    category: p.category,
    subcategory: p.subcategory,
    badge: (p as any).badge || null,
    images: Array.isArray(p.images) ? p.images : [],
    description: p.description,
    composition: p.composition,
    variants: p.variants?.map((v: any) => ({
      id: v.id,
      size: v.size,
      stock: Number(v.stock),
      color: v.color,
    })) || [],
  }));

  return <AdminProductosClient initialProducts={sanitizedProducts} />;
}
