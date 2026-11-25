import React from 'react';
import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { ensureContentSeeded, ensureProductsSeeded } from '@/lib/db-seed-helper';
import { JOURNAL_ARTICLES } from '@/lib/journal-data';
import { getSeoSettings } from '@/lib/settings-actions';
import HomeClient, { CmsDictionary, ProductItem } from './HomeClient';

export const revalidate = 60; // Habilita ISR de 60s para respuestas instantáneas en 0ms

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoSettings();
  return {
    title: seo.seo_home_title,
    description: seo.seo_home_desc,
    openGraph: {
      title: seo.seo_home_title,
      description: seo.seo_home_desc,
      url: 'https://foeg-paris.com',
      siteName: 'FOEG Paris',
      images: seo.seo_home_image ? [{ url: seo.seo_home_image }] : undefined,
    },
  };
}

export default async function HomePage() {
  // 1. Initialisations non-bloquantes en mémoire
  ensureContentSeeded().catch(() => {});
  ensureProductsSeeded().catch(() => {});

  // 2. Récupération parallèle CMS + Produits avec select optimisé (zéro cascade)
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
        take: 6,
        orderBy: { createdAt: 'desc' },
        select: {
          slug: true,
          name: true,
          description: true,
          price: true,
          images: true,
          category: true,
          composition: true,
          variants: {
            select: { size: true },
          },
        },
      }),
    ]);

    rawContent = contentRes || [];
    rawProducts = productsRes || [];
  } catch (err) {
    console.warn('[HOME PARALLEL FETCH ERROR]:', err);
  }

  // Dictionnaire CMS
  const cmsMap: CmsDictionary = {};
  for (const item of rawContent) {
    cmsMap[item.key] = {
      fr: item.valueFr,
      en: item.valueEn,
      es: item.valueEs,
    };
  }

  // REGLA CRÍTICA: Conversion des Decimal en Number pour sérialisation
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
    <HomeClient
      cmsContent={cmsMap}
      initialProducts={sanitizedProducts}
      journalArticles={JOURNAL_ARTICLES.slice(0, 3)}
    />
  );
}
