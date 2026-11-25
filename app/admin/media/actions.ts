'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export interface MediaItem {
  id: string;
  url: string;
  title: string;
  category: 'Produits' | 'CMS & Éditorial' | 'Téléversements';
  date: string;
}

const MEDIA_STORAGE_KEY = 'admin_uploaded_media';

export async function getMediaLibrary(): Promise<MediaItem[]> {
  const mediaList: MediaItem[] = [];
  const seenUrls = new Set<string>();

  try {
    // 1. Photos des Produits
    const products = await prisma.product.findMany({
      select: { id: true, name: true, images: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });

    products.forEach((p) => {
      (p.images || []).forEach((imgUrl, idx) => {
        if (imgUrl && !seenUrls.has(imgUrl)) {
          seenUrls.add(imgUrl);
          mediaList.push({
            id: `prod_${p.id}_${idx}`,
            url: imgUrl,
            title: `${p.name} (Vue ${idx + 1})`,
            category: 'Produits',
            date: new Date(p.createdAt).toLocaleDateString('fr-FR'),
          });
        }
      });
    });

    // 2. Photos du CMS & Éditorial
    const contentImages = await prisma.siteContent.findMany({
      where: { key: { contains: 'image' } },
    });

    contentImages.forEach((c) => {
      if (c.valueFr && !seenUrls.has(c.valueFr)) {
        seenUrls.add(c.valueFr);
        mediaList.push({
          id: `cms_${c.id}`,
          url: c.valueFr,
          title: `Visuel CMS : ${c.key}`,
          category: 'CMS & Éditorial',
          date: new Date(c.updatedAt).toLocaleDateString('fr-FR'),
        });
      }
    });

    // 3. Téléversements personnalisés
    const customRecord = await prisma.siteContent.findUnique({
      where: { key: MEDIA_STORAGE_KEY },
    });

    if (customRecord?.valueFr) {
      const customItems: MediaItem[] = JSON.parse(customRecord.valueFr);
      customItems.forEach((ci) => {
        if (!seenUrls.has(ci.url)) {
          seenUrls.add(ci.url);
          mediaList.push(ci);
        }
      });
    }
  } catch (err) {
    console.warn('[MEDIA LIBRARY FETCH ERROR]:', err);
  }

  // Fallback initial élégant si peu de photos
  if (mediaList.length === 0) {
    return [
      {
        id: 'mock-01',
        url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1200&q=85',
        title: 'Manteau en Cachemire Double Face',
        category: 'Produits',
        date: 'Aujourd’hui',
      },
      {
        id: 'mock-02',
        url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85',
        title: 'Chemise en Popeline de Coton d’Égypte',
        category: 'Produits',
        date: 'Hier',
      },
      {
        id: 'mock-03',
        url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1600&q=85',
        title: 'Vestiaire Homme Atelier',
        category: 'Produits',
        date: '18 Nov 2026',
      },
      {
        id: 'mock-04',
        url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=85',
        title: 'Façade Boutique rue Lucien Sampaix',
        category: 'CMS & Éditorial',
        date: '17 Nov 2026',
      },
    ];
  }

  return mediaList;
}

export async function addMediaItem(url: string, title?: string): Promise<{ success: boolean; item?: MediaItem; error?: string }> {
  try {
    const trimmed = (url || '').trim();
    if (!trimmed) return { success: false, error: 'URL invalide.' };

    const newItem: MediaItem = {
      id: `media_${Date.now()}`,
      url: trimmed,
      title: title?.trim() || 'Photographie Atelier Téléversée',
      category: 'Téléversements',
      date: new Date().toLocaleDateString('fr-FR'),
    };

    let existing: MediaItem[] = [];
    const customRecord = await prisma.siteContent.findUnique({
      where: { key: MEDIA_STORAGE_KEY },
    });

    if (customRecord?.valueFr) {
      existing = JSON.parse(customRecord.valueFr);
    }

    const updated = [newItem, ...existing];
    const serialized = JSON.stringify(updated);

    await prisma.siteContent.upsert({
      where: { key: MEDIA_STORAGE_KEY },
      create: {
        key: MEDIA_STORAGE_KEY,
        section: 'media',
        valueFr: serialized,
        valueEn: serialized,
        valueEs: serialized,
      },
      update: {
        valueFr: serialized,
        valueEn: serialized,
        valueEs: serialized,
      },
    });

    revalidatePath('/admin/media');
    return { success: true, item: newItem };
  } catch (err: any) {
    console.error('[ADD MEDIA ITEM ERROR]:', err);
    return { success: false, error: 'Erreur lors de l’enregistrement du média.' };
  }
}
