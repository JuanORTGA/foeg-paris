'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export interface CouponItem {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
}

export async function getCoupons(): Promise<CouponItem[]> {
  try {
    const coupons = await (prisma as any).coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return (coupons || []).map((c: any) => ({
      id: c.id,
      code: c.code,
      discountType: c.discountType,
      discountValue: Number(c.discountValue),
      isActive: Boolean(c.isActive),
      expiresAt: c.expiresAt ? new Date(c.expiresAt).toISOString() : null,
      createdAt: new Date(c.createdAt).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    }));
  } catch (err) {
    console.warn('[COUPONS FETCH NOTE]:', err);
    return [];
  }
}

export async function createCoupon(data: {
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  expiresAt?: string | null;
}) {
  try {
    const code = data.code.trim().toUpperCase();
    if (!code) {
      return { success: false, error: 'Le code privilège est obligatoire.' };
    }

    const existing = await (prisma as any).coupon.findUnique({
      where: { code },
    });
    if (existing) {
      return { success: false, error: `Le code "${code}" existe déjà.` };
    }

    await (prisma as any).coupon.create({
      data: {
        code,
        discountType: data.discountType,
        discountValue: Number(data.discountValue),
        isActive: true,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });

    revalidatePath('/admin/cupones');
    revalidatePath('/checkout');
    return { success: true };
  } catch (err: any) {
    console.error('[CREATE COUPON ERROR]:', err);
    return { success: false, error: err?.message || 'Erreur lors de la création du code privilège.' };
  }
}

export async function toggleCouponActive(id: string, isActive: boolean) {
  try {
    await (prisma as any).coupon.update({
      where: { id },
      data: { isActive },
    });
    revalidatePath('/admin/cupones');
    revalidatePath('/checkout');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Erreur' };
  }
}

export async function deleteCoupon(id: string) {
  try {
    await (prisma as any).coupon.delete({
      where: { id },
    });
    revalidatePath('/admin/cupones');
    revalidatePath('/checkout');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Erreur' };
  }
}
