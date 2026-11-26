'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { createNotification } from '@/lib/notifications';
import { smartTranslateAll } from '@/lib/translate';

export interface UpdateContentResult {
  success: boolean;
  key: string;
  value: string;
  error?: string;
}

/**
 * Met à jour un champ textuel ou multimédia directement depuis l'éditeur inline WYSIWYG
 */
export async function updateContentField(
  key: string,
  value: string,
  lang: 'fr' | 'en' | 'es' = 'fr'
): Promise<UpdateContentResult> {
  try {
    const trimmed = (value || '').trim();
    const isUrl =
      trimmed.startsWith('http://') ||
      trimmed.startsWith('https://') ||
      trimmed.startsWith('/') ||
      trimmed.startsWith('data:') ||
      key.includes('pos') ||
      key.includes('grayscale') ||
      key.includes('image') ||
      key.includes('video');

    // Déterminer la section en fonction du préfixe de la clé
    let section = 'general';
    if (key.startsWith('hero_')) section = 'hero';
    else if (key.startsWith('philosophy_') || key.startsWith('editorial_')) section = 'philosophy';
    else if (key.startsWith('values_')) section = 'trust';
    else if (key.startsWith('quote_')) section = 'quote';
    else if (key.startsWith('journal_')) section = 'journal';
    else if (key.startsWith('vip_')) section = 'vip';
    else if (key.startsWith('boutique_')) section = 'boutique';
    else if (key.startsWith('atelier_') || key.startsWith('reel_') || key.startsWith('reels_')) section = 'media';
    else if (key.startsWith('footer_')) section = 'footer';
    else if (key.startsWith('topbar_')) section = 'announcement';

    // Récupérer la valeur existante si elle existe
    const existing = await (prisma as any).siteContent.findUnique({
      where: { key },
    });

    let updateData: any = {};
    let createData: any = {
      key,
      section,
      valueFr: trimmed,
      valueEn: trimmed,
      valueEs: trimmed,
    };

    if (trimmed === '') {
      // Si el texto fue eliminado/vaciado intencionalmente, vaciarlo en los 3 idiomas
      updateData = {
        valueFr: '',
        valueEn: '',
        valueEs: '',
      };
      createData = {
        key,
        section,
        valueFr: '',
        valueEn: '',
        valueEs: '',
      };
    } else if (isUrl) {
      // Pour les images et vidéos, on synchronise les 3 langues à la même URL
      updateData = {
        valueFr: trimmed,
        valueEn: trimmed,
        valueEs: trimmed,
      };
    } else {
      // Pour les textes, on traduit automatiquement afin de remplir les 3 langues (FR, EN, ES)
      try {
        const translations = await smartTranslateAll(trimmed, lang);
        const finalFr = translations.fr || trimmed;
        const finalEn = translations.en || trimmed;
        const finalEs = translations.es || trimmed;

        if (lang === 'fr') {
          updateData.valueFr = trimmed;
          updateData.valueEn = finalEn;
          updateData.valueEs = finalEs;
        } else if (lang === 'en') {
          updateData.valueEn = trimmed;
          updateData.valueFr = finalFr;
          updateData.valueEs = finalEs;
        } else if (lang === 'es') {
          updateData.valueEs = trimmed;
          updateData.valueFr = finalFr;
          updateData.valueEn = finalEn;
        }
        createData.valueFr = finalFr;
        createData.valueEn = finalEn;
        createData.valueEs = finalEs;
      } catch (trErr) {
        console.warn('[TRANSLATION WARN in CMS updateContentField]:', trErr);
        // Fallback robusto: sincronizar el nuevo texto en los tres idiomas
        updateData.valueFr = trimmed;
        updateData.valueEn = trimmed;
        updateData.valueEs = trimmed;
        createData.valueFr = trimmed;
        createData.valueEn = trimmed;
        createData.valueEs = trimmed;
      }
    }

    const saved = await (prisma as any).siteContent.upsert({
      where: { key },
      update: updateData,
      create: createData,
    });

    // Synchronisation intelligente Hero Vidéo / Photo
    if (key === 'hero_image' || key === 'hero_video') {
      const isVideo = isUrl && (
        trimmed.endsWith('.mp4') ||
        trimmed.endsWith('.webm') ||
        trimmed.endsWith('.mov') ||
        trimmed.includes('/video/upload/') ||
        trimmed.includes('reel')
      );
      if (isVideo) {
        await (prisma as any).siteContent.upsert({
          where: { key: 'hero_video' },
          update: { valueFr: trimmed, valueEn: trimmed, valueEs: trimmed },
          create: { key: 'hero_video', section: 'media', valueFr: trimmed, valueEn: trimmed, valueEs: trimmed },
        });
      } else if (isUrl && key === 'hero_image') {
        // Si l'utilisateur remet une photo sur le Hero, on vide le fond vidéo
        await (prisma as any).siteContent.upsert({
          where: { key: 'hero_video' },
          update: { valueFr: '', valueEn: '', valueEs: '' },
          create: { key: 'hero_video', section: 'media', valueFr: '', valueEn: '', valueEs: '' },
        });
      }
    }

    // Revalidation instantanée du cache pour affichage direct dans la boutique
    try {
      revalidatePath('/', 'layout');
      revalidatePath('/');
      revalidatePath('/(shop)', 'layout');
      revalidatePath('/admin/cms');
      revalidatePath('/admin/contenido');
    } catch (_) {}

    return {
      success: true,
      key: saved.key,
      value: trimmed,
    };
  } catch (error: any) {
    console.error('[CMS INLINE UPDATE ERROR]:', error);
    return {
      success: false,
      key,
      value,
      error: error?.message || 'Erreur lors de l’enregistrement.',
    };
  }
}

/**
 * Met à jour le filtre Noir & Blanc (Grayscale) pour une image ou vidéo du CMS
 */
export async function updateImageGrayscale(key: string, isGrayscale: boolean) {
  try {
    // Sauvegarde de l'état dans la clé miroir_grayscale
    const grayKey = `${key}_grayscale`;
    const grayVal = isGrayscale ? 'true' : 'false';
    await (prisma as any).siteContent.upsert({
      where: { key: grayKey },
      update: { valueFr: grayVal, valueEn: grayVal, valueEs: grayVal },
      create: {
        key: grayKey,
        section: 'media_filter',
        valueFr: grayVal,
        valueEn: grayVal,
        valueEs: grayVal,
      },
    });

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/');
      revalidatePath('/admin/cms');
      revalidatePath('/admin/contenido');
    } catch (_) {}

    return { success: true, key, isGrayscale };
  } catch (error: any) {
    console.error('[CMS GRAYSCALE UPDATE ERROR]:', error);
    return { success: false, key, error: error?.message || 'Erreur de filtre' };
  }
}

/**
 * Action globale de publication en direct
 */
export async function publishAllCmsAction() {
  try {
    revalidatePath('/', 'layout');
    revalidatePath('/');
    revalidatePath('/(shop)', 'layout');
    revalidatePath('/admin/cms');
    revalidatePath('/admin/contenido');
    return { success: true };
  } catch (err: any) {
    console.error('[CMS PUBLISH ALL ERROR]:', err);
    return { success: false, error: err?.message };
  }
}
