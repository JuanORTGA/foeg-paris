'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import {
  PaymentSettings,
  PublicPaymentSettings,
  DEFAULT_PAYMENT_SETTINGS,
} from './payment-settings-types';

/**
 * Obtener todos los parámetros de pago y estados de toggle (para uso del Admin)
 */
export async function getPaymentSettings(): Promise<PaymentSettings> {
  try {
    const keys = Object.keys(DEFAULT_PAYMENT_SETTINGS);
    const records = (await (prisma as any).setting.findMany({
      where: { key: { in: keys } },
    })) as any[];

    const result: PaymentSettings = { ...DEFAULT_PAYMENT_SETTINGS };
    if (Array.isArray(records)) {
      for (const rec of records) {
        if (rec.key in result) {
          if (rec.key.startsWith('enable_')) {
            (result as any)[rec.key] = rec.value === 'true';
          } else if (typeof rec.value === 'string' && rec.value.trim() !== '') {
            (result as any)[rec.key] = rec.value;
          }
        }
      }
    }
    return result;
  } catch (err) {
    console.warn('[GET PAYMENT SETTINGS - USING DEFAULTS]:', err);
    return DEFAULT_PAYMENT_SETTINGS;
  }
}

/**
 * Obtener únicamente los parámetros públicos y el estado de los toggles para el Checkout
 * NUNCA retorna stripe_secret_key, stripe_webhook_secret ni paypal_secret.
 */
export async function getPublicPaymentSettings(): Promise<PublicPaymentSettings> {
  const full = await getPaymentSettings();
  return {
    enable_stripe: full.enable_stripe,
    enable_paypal: full.enable_paypal,
    enable_virement: full.enable_virement,
    enable_virement_2: full.enable_virement_2,
    enable_virement_3: full.enable_virement_3,
    enable_zelle: full.enable_zelle,
    enable_binance: full.enable_binance,
    enable_zinli: full.enable_zinli,
    enable_pagomovil: full.enable_pagomovil,

    stripe_publishable_key: full.stripe_publishable_key,
    paypal_client_id: full.paypal_client_id,

    bank_holder_name: full.bank_holder_name,
    bank_iban: full.bank_iban,
    bank_bic: full.bank_bic,
    bank_name: full.bank_name,

    bank_holder_name_2: full.bank_holder_name_2,
    bank_iban_2: full.bank_iban_2,
    bank_bic_2: full.bank_bic_2,
    bank_name_2: full.bank_name_2,

    bank_holder_name_3: full.bank_holder_name_3,
    bank_iban_3: full.bank_iban_3,
    bank_bic_3: full.bank_bic_3,
    bank_name_3: full.bank_name_3,

    zelle_email: full.zelle_email,
    zelle_name: full.zelle_name,
    binance_pay_id: full.binance_pay_id,
    binance_network: full.binance_network,
    zinli_email: full.zinli_email,
    zinli_name: full.zinli_name,
    pagomovil_bank: full.pagomovil_bank,
    pagomovil_phone: full.pagomovil_phone,
    pagomovil_id: full.pagomovil_id,
    pagomovil_name: full.pagomovil_name,
  };
}

/**
 * Guardar la configuración de pagos y estado de toggles desde el Admin
 */
export async function updatePaymentSettings(formData: FormData) {
  try {
    const keys = Object.keys(DEFAULT_PAYMENT_SETTINGS) as (keyof PaymentSettings)[];
    const updates: { key: string; value: string }[] = [];

    for (const key of keys) {
      if (key.startsWith('enable_')) {
        const val = formData.get(key);
        updates.push({ key, value: val === 'true' ? 'true' : 'false' });
      } else {
        const val = formData.get(key);
        if (typeof val === 'string') {
          updates.push({ key, value: val.trim() });
        }
      }
    }

    for (const item of updates) {
      await (prisma as any).setting.upsert({
        where: { key: item.key },
        update: { value: item.value },
        create: { key: item.key, value: item.value },
      });
    }

    revalidatePath('/admin/pagos');
    revalidatePath('/checkout');
    revalidatePath('/checkout/merci');

    return { success: true };
  } catch (error: any) {
    console.error('[UPDATE PAYMENT SETTINGS ERROR]:', error);
    return {
      success: false,
      error: error?.message || 'Erreur lors de la sauvegarde des paramètres de paiement',
    };
  }
}
