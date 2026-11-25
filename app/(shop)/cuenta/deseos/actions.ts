'use server';

import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

/**
 * Ajoute ou retire un produit de la liste de désirs (Wishlist)
 */
export async function toggleWishlistAction(productId: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      // Utilisateur non connecté : la persistance locale (localStorage) prend le relais
      return { success: true, isGuest: true };
    }

    // Vérifier si la pièce est déjà dans la liste
    const existing = await (prisma as any).wishlist?.findFirst({
      where: {
        userId,
        productId,
      },
    });

    if (existing) {
      await (prisma as any).wishlist?.delete({
        where: { id: existing.id },
      });
      revalidatePath('/cuenta/deseos');
      return { success: true, inWishlist: false };
    } else {
      await (prisma as any).wishlist?.create({
        data: {
          userId,
          productId,
        },
      });
      revalidatePath('/cuenta/deseos');
      return { success: true, inWishlist: true };
    }
  } catch (error: any) {
    console.warn('[TOGGLE WISHLIST ACTION NOTE]:', error?.message || error);
    return { success: false, error: 'Impossible de synchroniser avec la base de données.' };
  }
}

/**
 * Récupère les IDs des produits enregistrés par l'utilisateur connecté
 */
export async function getWishlistProductIdsAction(): Promise<string[]> {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return [];

    const items = await (prisma as any).wishlist?.findMany({
      where: { userId },
      select: { productId: true },
    });

    return (items || []).map((it: any) => it.productId);
  } catch (err) {
    console.warn('[GET WISHLIST IDS NOTE]:', err);
    return [];
  }
}

/**
 * Récupère les fiches produits complètes des pièces en liste de désirs
 */
export async function getWishlistProductsAction(ids?: string[]) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    let targetIds: string[] = ids || [];

    if (userId && (!ids || ids.length === 0)) {
      const items = await (prisma as any).wishlist?.findMany({
        where: { userId },
        select: { productId: true },
      });
      targetIds = (items || []).map((it: any) => it.productId);
    }

    if (targetIds.length === 0) return [];

    const products = await prisma.product.findMany({
      where: {
        OR: [
          { id: { in: targetIds } },
          { slug: { in: targetIds } },
        ],
      },
      include: {
        variants: true,
      },
    });

    return products.map((p) => ({
      ...p,
      price: Number(p.price),
    }));
  } catch (err) {
    console.error('[GET WISHLIST PRODUCTS ERROR]:', err);
    return [];
  }
}
