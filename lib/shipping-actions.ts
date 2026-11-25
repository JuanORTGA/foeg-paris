'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { DEFAULT_SHIPPING_SETTINGS, type ShippingSettings } from './shipping';

const SHIPPING_STORAGE_KEY = 'site_shipping_settings';

export async function getShippingSettings(): Promise<ShippingSettings> {
  try {
    const record = await prisma.siteContent.findUnique({
      where: { key: SHIPPING_STORAGE_KEY },
    });

    if (record?.valueFr) {
      const parsedFr = JSON.parse(record.valueFr);
      let parsedEn: any = {};
      let parsedEs: any = {};
      try {
        if (record.valueEn) parsedEn = JSON.parse(record.valueEn);
      } catch (_) {}
      try {
        if (record.valueEs) parsedEs = JSON.parse(record.valueEs);
      } catch (_) {}

      return {
        ...DEFAULT_SHIPPING_SETTINGS,
        ...parsedFr,
        euDeliveryEstimate_fr:
          parsedFr.euDeliveryEstimate ||
          parsedFr.euDeliveryEstimate_fr ||
          DEFAULT_SHIPPING_SETTINGS.euDeliveryEstimate_fr,
        intlDeliveryEstimate_fr:
          parsedFr.intlDeliveryEstimate ||
          parsedFr.intlDeliveryEstimate_fr ||
          DEFAULT_SHIPPING_SETTINGS.intlDeliveryEstimate_fr,
        customsNoticeText_fr:
          parsedFr.customsNoticeText ||
          parsedFr.customsNoticeText_fr ||
          DEFAULT_SHIPPING_SETTINGS.customsNoticeText_fr,
        pickupEstimate_fr:
          parsedFr.pickupEstimate ||
          parsedFr.pickupEstimate_fr ||
          DEFAULT_SHIPPING_SETTINGS.pickupEstimate_fr,

        euDeliveryEstimate_en:
          parsedEn.euDeliveryEstimate ||
          parsedFr.euDeliveryEstimate_en ||
          DEFAULT_SHIPPING_SETTINGS.euDeliveryEstimate_en,
        intlDeliveryEstimate_en:
          parsedEn.intlDeliveryEstimate ||
          parsedFr.intlDeliveryEstimate_en ||
          DEFAULT_SHIPPING_SETTINGS.intlDeliveryEstimate_en,
        customsNoticeText_en:
          parsedEn.customsNoticeText ||
          parsedFr.customsNoticeText_en ||
          DEFAULT_SHIPPING_SETTINGS.customsNoticeText_en,
        pickupEstimate_en:
          parsedEn.pickupEstimate ||
          parsedFr.pickupEstimate_en ||
          DEFAULT_SHIPPING_SETTINGS.pickupEstimate_en,

        euDeliveryEstimate_es:
          parsedEs.euDeliveryEstimate ||
          parsedFr.euDeliveryEstimate_es ||
          DEFAULT_SHIPPING_SETTINGS.euDeliveryEstimate_es,
        intlDeliveryEstimate_es:
          parsedEs.intlDeliveryEstimate ||
          parsedFr.intlDeliveryEstimate_es ||
          DEFAULT_SHIPPING_SETTINGS.intlDeliveryEstimate_es,
        customsNoticeText_es:
          parsedEs.customsNoticeText ||
          parsedFr.customsNoticeText_es ||
          DEFAULT_SHIPPING_SETTINGS.customsNoticeText_es,
        pickupEstimate_es:
          parsedEs.pickupEstimate ||
          parsedFr.pickupEstimate_es ||
          DEFAULT_SHIPPING_SETTINGS.pickupEstimate_es,
        countries:
          parsedFr.countries && Array.isArray(parsedFr.countries)
            ? parsedFr.countries
            : undefined,
      };
    }
  } catch (err) {
    // Si la DB tarda, repliegue instantáneo a las tarifas por defecto
  }

  return DEFAULT_SHIPPING_SETTINGS;
}

export async function updateShippingSettings(
  settings: Partial<ShippingSettings>
): Promise<{ success: boolean; settings?: ShippingSettings; error?: string }> {
  try {
    const current = await getShippingSettings();
    const updated: ShippingSettings = {
      standardEuCost: Number(settings.standardEuCost ?? current.standardEuCost),
      freeShippingThreshold: Number(settings.freeShippingThreshold ?? current.freeShippingThreshold),
      expressIntlCost: Number(settings.expressIntlCost ?? current.expressIntlCost),
      pickupEnabled:
        settings.pickupEnabled !== undefined ? Boolean(settings.pickupEnabled) : current.pickupEnabled,
      pickupEstimate: settings.pickupEstimate || current.pickupEstimate,
      euDeliveryEstimate: settings.euDeliveryEstimate || current.euDeliveryEstimate,
      intlDeliveryEstimate: settings.intlDeliveryEstimate || current.intlDeliveryEstimate,
      customsNoticeText: settings.customsNoticeText || current.customsNoticeText,

      euDeliveryEstimate_fr: settings.euDeliveryEstimate_fr || current.euDeliveryEstimate_fr,
      euDeliveryEstimate_en: settings.euDeliveryEstimate_en || current.euDeliveryEstimate_en,
      euDeliveryEstimate_es: settings.euDeliveryEstimate_es || current.euDeliveryEstimate_es,

      intlDeliveryEstimate_fr: settings.intlDeliveryEstimate_fr || current.intlDeliveryEstimate_fr,
      intlDeliveryEstimate_en: settings.intlDeliveryEstimate_en || current.intlDeliveryEstimate_en,
      intlDeliveryEstimate_es: settings.intlDeliveryEstimate_es || current.intlDeliveryEstimate_es,

      customsNoticeText_fr: settings.customsNoticeText_fr || current.customsNoticeText_fr,
      customsNoticeText_en: settings.customsNoticeText_en || current.customsNoticeText_en,
      customsNoticeText_es: settings.customsNoticeText_es || current.customsNoticeText_es,

      pickupEstimate_fr: settings.pickupEstimate_fr || current.pickupEstimate_fr,
      pickupEstimate_en: settings.pickupEstimate_en || current.pickupEstimate_en,
      pickupEstimate_es: settings.pickupEstimate_es || current.pickupEstimate_es,

      countries: settings.countries !== undefined ? settings.countries : current.countries,
    };

    const frPayload = {
      ...updated,
      euDeliveryEstimate: updated.euDeliveryEstimate_fr || updated.euDeliveryEstimate,
      intlDeliveryEstimate: updated.intlDeliveryEstimate_fr || updated.intlDeliveryEstimate,
      customsNoticeText: updated.customsNoticeText_fr || updated.customsNoticeText,
      pickupEstimate: updated.pickupEstimate_fr || updated.pickupEstimate,
    };

    const enPayload = {
      ...updated,
      euDeliveryEstimate: updated.euDeliveryEstimate_en || updated.euDeliveryEstimate,
      intlDeliveryEstimate: updated.intlDeliveryEstimate_en || updated.intlDeliveryEstimate,
      customsNoticeText: updated.customsNoticeText_en || updated.customsNoticeText,
      pickupEstimate: updated.pickupEstimate_en || updated.pickupEstimate,
    };

    const esPayload = {
      ...updated,
      euDeliveryEstimate: updated.euDeliveryEstimate_es || updated.euDeliveryEstimate,
      intlDeliveryEstimate: updated.intlDeliveryEstimate_es || updated.intlDeliveryEstimate,
      customsNoticeText: updated.customsNoticeText_es || updated.customsNoticeText,
      pickupEstimate: updated.pickupEstimate_es || updated.pickupEstimate,
    };

    await prisma.siteContent.upsert({
      where: { key: SHIPPING_STORAGE_KEY },
      create: {
        key: SHIPPING_STORAGE_KEY,
        section: 'shipping',
        valueFr: JSON.stringify(frPayload),
        valueEn: JSON.stringify(enPayload),
        valueEs: JSON.stringify(esPayload),
      },
      update: {
        valueFr: JSON.stringify(frPayload),
        valueEn: JSON.stringify(enPayload),
        valueEs: JSON.stringify(esPayload),
      },
    });

    revalidatePath('/checkout');
    revalidatePath('/admin/envios');

    return { success: true, settings: updated };
  } catch (err: any) {
    console.error('[UPDATE SHIPPING SETTINGS ERROR]:', err);
    return { success: false, error: 'Erreur lors de la mise à jour des paramètres de livraison.' };
  }
}
