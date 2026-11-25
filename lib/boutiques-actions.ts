'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { Boutique, DEFAULT_BOUTIQUES } from './boutiques-types';

const BOUTIQUES_SETTING_KEY = 'foeg_boutiques_registry';

/**
 * Récupérer l'ensemble des boutiques enregistrées (pour l'administration)
 */
export async function getBoutiques(): Promise<Boutique[]> {
  try {
    const record = (await (prisma as any).setting.findUnique({
      where: { key: BOUTIQUES_SETTING_KEY },
    })) as any;

    if (record && record.value) {
      const parsed = JSON.parse(record.value);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
      }
    }

    return DEFAULT_BOUTIQUES;
  } catch (err) {
    console.warn('[GET BOUTIQUES - USING DEFAULTS]:', err);
    return DEFAULT_BOUTIQUES;
  }
}

/**
 * Récupérer uniquement les boutiques actives (pour la page publique /boutique)
 */
export async function getActiveBoutiques(): Promise<Boutique[]> {
  const all = await getBoutiques();
  return all.filter((b) => b.isActive);
}

/**
 * Récupérer les boutiques habilitées pour le retrait de commande (Click & Collect)
 */
export async function getPickupBoutiques(): Promise<Boutique[]> {
  const all = await getBoutiques();
  return all.filter((b) => b.isActive && b.enablePickup);
}

/**
 * Créer ou mettre à jour une boutique
 */
export async function saveBoutique(boutiqueData: Partial<Boutique> & { name: string; city: string; country: string }) {
  try {
    const current = await getBoutiques();
    let updated: Boutique[];

    if (boutiqueData.id) {
      // Modification
      updated = current.map((b) => {
        if (b.id === boutiqueData.id) {
          return {
            ...b,
            ...boutiqueData,
            orderIndex: Number(boutiqueData.orderIndex) || b.orderIndex || 0,
          } as Boutique;
        }
        return b;
      });
    } else {
      // Nouvelle création
      const newBoutique: Boutique = {
        id: `boutique-${Date.now()}`,
        name: boutiqueData.name,
        tag: boutiqueData.tag || 'Boutique & Salon Privé',
        city: boutiqueData.city,
        country: boutiqueData.country,
        address: boutiqueData.address || '',
        postalCode: boutiqueData.postalCode || '',
        addressNotes: boutiqueData.addressNotes || '',
        hoursWeekday: boutiqueData.hoursWeekday || 'Du Lundi au Samedi : 10h00 — 19h00',
        hoursWeekend: boutiqueData.hoursWeekend || 'Dimanche : Sur rendez-vous privé',
        phone: boutiqueData.phone || '',
        whatsapp: boutiqueData.whatsapp || '',
        email: boutiqueData.email || 'concierge@foeg-paris.com',
        imageUrl:
          boutiqueData.imageUrl ||
          'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=85',
        googleMapsUrl: boutiqueData.googleMapsUrl || '',
        isActive: boutiqueData.isActive !== undefined ? boutiqueData.isActive : true,
        enablePickup: boutiqueData.enablePickup !== undefined ? boutiqueData.enablePickup : true,
        orderIndex: Number(boutiqueData.orderIndex) || current.length + 1,
        createdAt: new Date().toISOString(),
      };
      updated = [...current, newBoutique];
    }

    updated.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

    await (prisma as any).setting.upsert({
      where: { key: BOUTIQUES_SETTING_KEY },
      update: { value: JSON.stringify(updated) },
      create: { key: BOUTIQUES_SETTING_KEY, value: JSON.stringify(updated) },
    });

    revalidatePath('/admin/boutiques');
    revalidatePath('/boutique');
    revalidatePath('/checkout');

    return { success: true, message: 'Boutique enregistrée avec succès.' };
  } catch (err: any) {
    console.error('[SAVE BOUTIQUE ERROR]:', err);
    return { success: false, error: err?.message || 'Erreur lors de l’enregistrement de la boutique.' };
  }
}

/**
 * Supprimer une boutique
 */
export async function deleteBoutique(id: string) {
  try {
    const current = await getBoutiques();
    const filtered = current.filter((b) => b.id !== id);

    await (prisma as any).setting.upsert({
      where: { key: BOUTIQUES_SETTING_KEY },
      update: { value: JSON.stringify(filtered) },
      create: { key: BOUTIQUES_SETTING_KEY, value: JSON.stringify(filtered) },
    });

    revalidatePath('/admin/boutiques');
    revalidatePath('/boutique');
    revalidatePath('/checkout');

    return { success: true, message: 'Boutique supprimée avec succès.' };
  } catch (err: any) {
    console.error('[DELETE BOUTIQUE ERROR]:', err);
    return { success: false, error: err?.message || 'Erreur lors de la suppression.' };
  }
}

/**
 * Basculer la visibilité d'une boutique (Actif / Inactif)
 */
export async function toggleBoutiqueActive(id: string) {
  try {
    const current = await getBoutiques();
    const updated = current.map((b) => {
      if (b.id === id) {
        return { ...b, isActive: !b.isActive };
      }
      return b;
    });

    await (prisma as any).setting.upsert({
      where: { key: BOUTIQUES_SETTING_KEY },
      update: { value: JSON.stringify(updated) },
      create: { key: BOUTIQUES_SETTING_KEY, value: JSON.stringify(updated) },
    });

    revalidatePath('/admin/boutiques');
    revalidatePath('/boutique');
    revalidatePath('/checkout');

    return { success: true };
  } catch (err: any) {
    console.error('[TOGGLE BOUTIQUE ACTIVE ERROR]:', err);
    return { success: false, error: err?.message };
  }
}

/**
 * Basculer l'éligibilité au retrait (Click & Collect)
 */
export async function toggleBoutiquePickup(id: string) {
  try {
    const current = await getBoutiques();
    const updated = current.map((b) => {
      if (b.id === id) {
        return { ...b, enablePickup: !b.enablePickup };
      }
      return b;
    });

    await (prisma as any).setting.upsert({
      where: { key: BOUTIQUES_SETTING_KEY },
      update: { value: JSON.stringify(updated) },
      create: { key: BOUTIQUES_SETTING_KEY, value: JSON.stringify(updated) },
    });

    revalidatePath('/admin/boutiques');
    revalidatePath('/boutique');
    revalidatePath('/checkout');

    return { success: true };
  } catch (err: any) {
    console.error('[TOGGLE BOUTIQUE PICKUP ERROR]:', err);
    return { success: false, error: err?.message };
  }
}
