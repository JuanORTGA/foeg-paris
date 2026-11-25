'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { createNotification } from '@/lib/notifications';
import { DEFAULT_SITE_CONTENT } from '@/lib/db-seed-helper';
import { smartTranslateAll } from '@/lib/translate';

export async function updateSiteContent(
  id: string,
  valueFr: string,
  valueEn: string,
  valueEs: string,
  forceAutoTranslate: boolean = false
) {
  try {
    let finalFr = (valueFr || '').trim();
    let finalEn = (valueEn || '').trim();
    let finalEs = (valueEs || '').trim();

    const isUrl =
      finalFr.startsWith('http://') ||
      finalFr.startsWith('https://') ||
      finalFr.startsWith('/') ||
      finalFr.startsWith('data:');

    // Si on force l'auto-traduction ou qu'un champ linguistique est vide
    if (!isUrl && (forceAutoTranslate || !finalFr || !finalEn || !finalEs)) {
      try {
        const source = finalEs || finalFr || finalEn;
        const sourceLang: 'fr' | 'en' | 'es' = finalEs && !finalFr ? 'es' : finalFr ? 'fr' : 'en';
        const tr = await smartTranslateAll(source, sourceLang);
        if (!finalFr) finalFr = tr.fr;
        if (!finalEn) finalEn = tr.en;
        if (!finalEs) finalEs = tr.es;
      } catch (trErr) {
        console.warn('[TRANSLATION WARN in updateSiteContent]:', trErr);
      }
    }

    const updated = await (prisma as any).siteContent.update({
      where: { id },
      data: {
        valueFr: finalFr,
        valueEn: finalEn || finalFr,
        valueEs: finalEs || finalFr,
      },
    });

    try {
      await createNotification({
        title: 'Contenu du Site Actualisé',
        message: `Le texte éditorial [${updated.key}] a été enregistré en FR, EN et ES.`,
        type: 'info',
        link: '/admin/contenido',
      });
    } catch (notifErr) {
      console.warn('[NOTIFICATION SILENT WARN]:', notifErr);
    }

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/');
      revalidatePath('/admin/contenido');
      revalidatePath('/hombre');
      revalidatePath('/mujer');
      revalidatePath('/colecciones');
    } catch (revErr) {
      console.warn('[REVALIDATE WARN]:', revErr);
    }

    return { success: true, item: updated };
  } catch (error: any) {
    console.error('[UPDATE CONTENT ERROR]:', error);
    return {
      success: false,
      error: `Erreur lors de la mise à jour: ${error?.message || 'Erreur inconnue'}`,
    };
  }
}

export async function autoTranslateContentAction(
  text: string,
  sourceLang: 'fr' | 'en' | 'es' = 'fr'
) {
  try {
    const translations = await smartTranslateAll(text, sourceLang);
    return { success: true, ...translations };
  } catch (err: any) {
    console.error('[AUTO TRANSLATE ACTION ERROR]:', err);
    return { success: false, error: 'Impossible de traduire le texte automatiquement.' };
  }
}

export async function initDefaultContentAction() {
  try {
    const existing = await (prisma as any).siteContent.findMany({
      select: { key: true },
    });
    const existingKeys = new Set(existing.map((e: any) => e.key));
    const toCreate = DEFAULT_SITE_CONTENT.filter((item) => !existingKeys.has(item.key));

    if (toCreate.length > 0) {
      await (prisma as any).siteContent.createMany({
        data: toCreate,
        skipDuplicates: true,
      });
    }

    try {
      await createNotification({
        title: 'CMS Initialisé',
        message: 'Les textes éditoriaux par défaut de la Maison FOEG ont été synchronisés.',
        type: 'info',
        link: '/admin/contenido',
      });
    } catch {}

    try {
      revalidatePath('/');
      revalidatePath('/admin/contenido');
      revalidatePath('/hombre');
      revalidatePath('/mujer');
    } catch {}

    return { success: true };
  } catch (err: any) {
    console.error('[INIT DEFAULT CONTENT ERROR]:', err);
    return { success: false, error: err?.message || 'Erreur lors de la synchronisation.' };
  }
}
