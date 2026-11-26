import React from 'react';
import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { ensureContentSeeded, ensureProductsSeeded } from '@/lib/db-seed-helper';
import { JOURNAL_ARTICLES } from '@/lib/journal-data';
import AdminCmsClient from './AdminCmsClient';
import { CmsDictionary, ProductItem } from '@/app/HomeClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'CMS Visual en Vivo (WYSIWYG) · Maison FOEG Paris',
  description: 'Éditeur visuel en direct pour la boutique officielle FOEG Paris.',
};

export default async function AdminCmsPage() {
  // Synchronisation des clés multimédias
  try {
    await ensureContentSeeded();
    await ensureProductsSeeded();
  } catch (_) {}

  let rawContent: any[] = [];
  let rawProducts: any[] = [];

  try {
    const [contentRes, productsRes] = await Promise.all([
      (prisma as any).siteContent.findMany({
        select: {
          key: true,
          valueFr: true,
          valueEn: true,
          valueEs: true,
        },
      }),
      prisma.product.findMany({
        where: {
          category: {
            equals: 'Hombre',
            mode: 'insensitive',
          },
        },
        take: 12,
        orderBy: [{ isNew: 'desc' }, { createdAt: 'desc' }],
        select: {
          slug: true,
          name: true,
          description: true,
          price: true,
          images: true,
          category: true,
          subcategory: true,
          badge: true,
          composition: true,
          variants: {
            select: { size: true },
          },
        },
      }),
    ]);

    // Filtrage strict : seules les pièces expressément marquées comme ICONIC ou Iconique apparaissent dans "Pièces Iconiques"
    const iconicOnly = (productsRes || []).filter((p: any) => {
      return p.badge === 'ICONIC' || p.subcategory === 'Iconique';
    });

    rawContent = contentRes || [];
    rawProducts = iconicOnly;
  } catch (err) {
    console.warn('[CMS LIVE FETCH ERROR]:', err);
  }

  const cmsMap: CmsDictionary = {};
  for (const item of rawContent) {
    cmsMap[item.key] = {
      fr: item.valueFr,
      en: item.valueEn,
      es: item.valueEs,
    };
  }

  const sanitizedProducts: ProductItem[] = rawProducts.map((p) => {
    const subtitle =
      p.description && p.description.length > 70
        ? p.description.slice(0, 70) + '...'
        : p.description || 'Création exclusive confectionnée à Paris.';
    const img =
      Array.isArray(p.images) && p.images[0]
        ? p.images[0]
        : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1200&q=85';

    return {
      id: p.slug,
      name: p.name,
      subtitle,
      numericPrice: Number(p.price),
      image: img,
      category: p.category,
      materials: p.composition,
      sizes: p.variants?.map((v: any) => v.size) || ['S', 'M', 'L'],
    };
  });

  return (
    <AdminCmsClient
      cmsContent={cmsMap}
      initialProducts={sanitizedProducts}
      journalArticles={JOURNAL_ARTICLES.slice(0, 3)}
    />
  );
}
