'use server';

import { prisma } from '@/lib/db';
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache';
import { cache } from 'react';
import { createNotification } from '@/lib/notifications';

export interface GlobalSettings {
  contact_email: string;
  contact_phone: string;
  contact_whatsapp: string;
  social_instagram: string;
  social_facebook: string;
  shipping_threshold: string;
  low_stock_warning: string;
}

export interface SeoSettings {
  seo_home_title: string;
  seo_home_desc: string;
  seo_home_image?: string;
  seo_femme_title: string;
  seo_femme_desc: string;
  seo_femme_image?: string;
  seo_homme_title: string;
  seo_homme_desc: string;
  seo_homme_image?: string;
}

const DEFAULT_GLOBAL_SETTINGS: GlobalSettings = {
  contact_email: 'concierge@foeg-paris.com',
  contact_phone: '+33 1 42 68 55 00',
  contact_whatsapp: '+33 6 12 34 56 78',
  social_instagram: 'https://www.instagram.com/foegparis/',
  social_facebook: 'https://www.facebook.com/profile.php?id=61569466776955',
  shipping_threshold: '150',
  low_stock_warning: '3',
};

const DEFAULT_SEO_SETTINGS: SeoSettings = {
  seo_home_title: 'FOEG Paris | Maison de Confection Française',
  seo_home_desc:
    'Maison de confection française située rue Lucien Sampaix, Paris 75010. L’art de l’essentiel, coupes architecturales, matières nobles et silhouettes intemporelles.',
  seo_home_image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1600&q=85',
  seo_femme_title: 'Vestiaire Femme | Maison FOEG Paris',
  seo_femme_desc:
    'Découvrez les créations exclusives du vestiaire féminin FOEG Paris : manteaux d’exception, soies pures et coupes architecturales.',
  seo_femme_image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1600&q=85',
  seo_homme_title: 'Vestiaire Homme | Maison FOEG Paris',
  seo_homme_desc:
    'Explorez le vestiaire masculin de la Maison FOEG Paris : tailleurs sur-mesure, mailles nobles et élégance intemporelle.',
  seo_homme_image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1600&q=85',
};

/**
 * Obtener ajustes globales desde la base de datos con fallbacks seguros.
 * Cache de 60s para evitar consultas DB en cada render del Header/Footer/Widget.
 */
const _fetchGlobalSettings = async (): Promise<GlobalSettings> => {
  try {
    const keys = Object.keys(DEFAULT_GLOBAL_SETTINGS);
    const settings = (await (prisma as any).setting.findMany({
      where: { key: { in: keys } },
    })) as any[];

    const result = { ...DEFAULT_GLOBAL_SETTINGS };
    if (Array.isArray(settings)) {
      for (const s of settings) {
        if (s.key in result) {
          (result as any)[s.key] = s.value;
        }
      }
    }
    return result;
  } catch (err) {
    return DEFAULT_GLOBAL_SETTINGS;
  }
};

export const getGlobalSettings = unstable_cache(
  _fetchGlobalSettings,
  ['global-settings'],
  { revalidate: 60, tags: ['global-settings'] }
);

/**
 * Actualizar ajustes globales en Prisma Setting
 */
export async function updateGlobalSettings(data: Partial<GlobalSettings>) {
  try {
    const entries = Object.entries(data);
    for (const [key, value] of entries) {
      if (typeof value === 'string') {
        await (prisma as any).setting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        });
      }
    }

    try {
      revalidatePath('/', 'layout');
      revalidateTag('global-settings'); // invalida el cache inmediatamente al guardar ajustes
    } catch {}

    try {
      await createNotification({
        title: 'Paramètres Généraux Mis à Jour',
        message: 'Les coordonnées, réseaux sociaux et règles commerciales ont été synchronisés.',
        type: 'info',
        link: '/admin/ajustes',
      });
    } catch {}

    return { success: true, message: 'Paramètres enregistrés avec succès.' };
  } catch (err: any) {
    console.error('[UPDATE GLOBAL SETTINGS ERROR]:', err);
    return { success: false, error: err.message || 'Erreur lors de l’enregistrement.' };
  }
}

/**
 * Obtener ajustes SEO desde la base de datos con caché de 60s y deduplicación por render
 */
const _fetchSeoSettings = async (): Promise<SeoSettings> => {
  try {
    const keys = Object.keys(DEFAULT_SEO_SETTINGS);
    const settings = (await (prisma as any).setting.findMany({
      where: { key: { in: keys } },
    })) as any[];

    const result = { ...DEFAULT_SEO_SETTINGS };
    if (Array.isArray(settings)) {
      for (const s of settings) {
        if (s.key in result) {
          (result as any)[s.key] = s.value;
        }
      }
    }
    return result;
  } catch (err) {
    return DEFAULT_SEO_SETTINGS;
  }
};

export const getSeoSettings = cache(
  unstable_cache(_fetchSeoSettings, ['seo-settings'], {
    revalidate: 60,
    tags: ['seo-settings'],
  })
);

/**
 * Actualizar ajustes SEO en Prisma Setting
 */
export async function updateSeoSettings(data: Partial<SeoSettings>) {
  try {
    const entries = Object.entries(data);
    for (const [key, value] of entries) {
      if (typeof value === 'string') {
        await (prisma as any).setting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        });
      }
    }

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/');
      revalidatePath('/mujer');
      revalidatePath('/hombre');
      revalidateTag('seo-settings');
    } catch {}

    try {
      await createNotification({
        title: 'Paramètres SEO Mis à Jour',
        message: 'Les balises méta Google et réseaux sociaux ont été synchronisées.',
        type: 'info',
        link: '/admin/seo',
      });
    } catch {}

    return { success: true, message: 'Métadonnées SEO synchronisées avec Google.' };
  } catch (err: any) {
    console.error('[UPDATE SEO SETTINGS ERROR]:', err);
    return { success: false, error: err.message || 'Erreur lors de la mise à jour SEO.' };
  }
}
