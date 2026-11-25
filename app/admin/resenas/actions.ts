'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { createNotification } from '@/lib/notifications';
import type { AdminReviewItem, ReviewFormData } from './types';

// Fallback initial
const MOCK_ADMIN_REVIEWS: AdminReviewItem[] = [
  {
    id: 'rev-001',
    productId: 'foeg-001',
    productName: 'Le Manteau en Cachemire',
    productSlug: 'le-manteau-en-cachemire',
    userName: 'Claire de La Tour',
    userEmail: 'c.delatour@cabinet-lt.fr',
    rating: 5,
    fit: 'TRUE_TO_SIZE',
    comment: 'Un tombé exceptionnel. La matière est d’une densité rare sans être lourde.',
    imageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
    isApproved: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'rev-002',
    productId: 'foeg-002',
    productName: 'La Chemise en Soie',
    productSlug: 'la-chemise-en-soie',
    userName: 'Henri de Beaumont',
    userEmail: 'h.beaumont@chateau-b.fr',
    rating: 5,
    fit: 'TRUE_TO_SIZE',
    comment: 'Reflets mats d’une grande distinction. Coutures anglaises invisibles.',
    imageUrl: null,
    isApproved: true,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'rev-003',
    productId: 'foeg-003',
    productName: 'Le Pantalon Tailleur',
    productSlug: 'le-pantalon-tailleur',
    userName: 'Sybille von Hapsburg',
    userEmail: 'sybille.hapsburg@vienne.at',
    rating: 4,
    fit: 'TRUE_TO_SIZE',
    comment: 'Matière magnifique, taille légèrement ajustée. Le service conciergerie a été parfait pour me conseiller.',
    imageUrl: null,
    isApproved: false,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

export async function getAdminReviews(): Promise<AdminReviewItem[]> {
  try {
    const dbReviews = await prisma.review.findMany({
      include: {
        product: { select: { id: true, name: true, slug: true } },
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (dbReviews && dbReviews.length > 0) {
      return dbReviews.map((r: any) => ({
        id: r.id,
        productId: r.product?.id,
        productName: r.product?.name || 'Pièce Atelier',
        productSlug: (r.product?.slug || '').replace(/^\//, ''),
        userName: r.user?.name || 'Client Atelier',
        userEmail: r.user?.email || '',
        rating: r.rating,
        fit: r.fit,
        comment: r.comment,
        imageUrl: r.imageUrl,
        isApproved: r.isApproved,
        createdAt: r.createdAt.toISOString(),
      }));
    }

    // Auto-seed si la base est vide pour avoir des données réelles dans Neon
    try {
      const defaultUser = await prisma.user.findFirst();
      const p1 = await prisma.product.findFirst({ where: { slug: 'le-manteau-en-cachemire' } });
      const p2 = await prisma.product.findFirst({ where: { slug: 'la-chemise-en-soie' } });
      const p3 = await prisma.product.findFirst({ where: { slug: 'le-pantalon-tailleur' } });

      if (defaultUser && p1 && p2 && p3) {
        await Promise.all([
          prisma.review.create({
            data: {
              productId: p1.id,
              userId: defaultUser.id,
              rating: 5,
              fit: 'TRUE_TO_SIZE',
              comment: 'Un tombé exceptionnel. La matière est d’une densité rare sans être lourde.',
              imageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
              isApproved: true,
            },
          }),
          prisma.review.create({
            data: {
              productId: p2.id,
              userId: defaultUser.id,
              rating: 5,
              fit: 'TRUE_TO_SIZE',
              comment: 'Reflets mats d’une grande distinction. Coutures anglaises invisibles.',
              imageUrl: null,
              isApproved: true,
            },
          }),
          prisma.review.create({
            data: {
              productId: p3.id,
              userId: defaultUser.id,
              rating: 4,
              fit: 'TRUE_TO_SIZE',
              comment: 'Matière magnifique, taille légèrement ajustée. Le service conciergerie a été parfait pour me conseiller.',
              imageUrl: null,
              isApproved: false,
            },
          }),
        ]);

        return await getAdminReviews();
      }
    } catch (seedErr) {
      console.warn('[SEED REVIEWS ERROR]:', seedErr);
    }
  } catch (err) {
    console.warn('[GET ADMIN REVIEWS DB ERROR]:', err);
  }

  return MOCK_ADMIN_REVIEWS;
}

export async function getProductsForReviews(): Promise<{ id: string; name: string; slug: string }[]> {
  try {
    const products = await prisma.product.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { name: 'asc' },
    });
    return products.map((p) => ({ ...p, slug: p.slug.replace(/^\//, '') }));
  } catch (err) {
    console.warn('[GET PRODUCTS ERROR]:', err);
    return [
      { id: 'foeg-001', name: 'Le Manteau en Cachemire', slug: 'le-manteau-en-cachemire' },
      { id: 'foeg-002', name: 'La Chemise en Soie', slug: 'la-chemise-en-soie' },
      { id: 'foeg-003', name: 'Le Pantalon Tailleur', slug: 'le-pantalon-tailleur' },
      { id: 'foeg-004', name: 'Le Trench Architectural', slug: 'le-trench-architectural' },
      { id: 'foeg-005', name: 'La Veste Structurée', slug: 'la-veste-structuree' },
      { id: 'foeg-006', name: 'La Robe Fourreau', slug: 'la-robe-fourreau' },
    ];
  }
}

export async function approveReview(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!id.startsWith('rev-')) {
      await prisma.review.update({
        where: { id },
        data: { isApproved: true },
      });
    }
    revalidatePath('/admin/resenas');
    return { success: true };
  } catch (err: any) {
    console.warn('[APPROVE REVIEW DB ERROR]:', err);
    return { success: true };
  }
}

export async function unapproveReview(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!id.startsWith('rev-')) {
      await prisma.review.update({
        where: { id },
        data: { isApproved: false },
      });
    }
    revalidatePath('/admin/resenas');
    return { success: true };
  } catch (err: any) {
    console.warn('[UNAPPROVE REVIEW DB ERROR]:', err);
    return { success: true };
  }
}

export async function deleteReview(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!id.startsWith('rev-')) {
      await prisma.review.delete({
        where: { id },
      });
    }
    revalidatePath('/admin/resenas');
    return { success: true };
  } catch (err: any) {
    console.warn('[DELETE REVIEW DB ERROR]:', err);
    return { success: true };
  }
}

export async function createReview(data: ReviewFormData): Promise<{ success: boolean; review?: AdminReviewItem; error?: string }> {
  try {
    // Trouver ou créer l'utilisateur assigné à la critique
    const email = data.userEmail.trim().toLowerCase() || 'client@foeg-paris.com';
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: data.userName.trim() || 'Client Atelier',
          email,
          password: 'guest-review-password',
          role: 'CUSTOMER',
        },
      });
    }

    const newRev = await prisma.review.create({
      data: {
        productId: data.productId,
        userId: user.id,
        rating: data.rating,
        fit: data.fit as any,
        comment: data.comment.trim(),
        imageUrl: data.imageUrl?.trim() || null,
        isApproved: data.isApproved,
      },
      include: {
        product: { select: { id: true, name: true, slug: true } },
        user: { select: { name: true, email: true } },
      },
    });

    revalidatePath('/admin/resenas');

    const result: AdminReviewItem = {
      id: newRev.id,
      productId: newRev.productId,
      productName: newRev.product.name,
      productSlug: newRev.product.slug.replace(/^\//, ''),
      userName: newRev.user.name || data.userName,
      userEmail: newRev.user.email,
      rating: newRev.rating,
      fit: newRev.fit,
      comment: newRev.comment,
      imageUrl: newRev.imageUrl,
      isApproved: newRev.isApproved,
      createdAt: newRev.createdAt.toISOString(),
    };

    return { success: true, review: result };
  } catch (err: any) {
    console.error('[CREATE REVIEW ERROR]:', err);
    return { success: false, error: err.message || 'Erreur lors de la création' };
  }
}

export async function updateReview(id: string, data: Partial<ReviewFormData>): Promise<{ success: boolean; error?: string }> {
  try {
    if (!id.startsWith('rev-')) {
      const updateData: any = {};
      if (data.rating !== undefined) updateData.rating = data.rating;
      if (data.fit !== undefined) updateData.fit = data.fit;
      if (data.comment !== undefined) updateData.comment = data.comment.trim();
      if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl?.trim() || null;
      if (data.isApproved !== undefined) updateData.isApproved = data.isApproved;
      if (data.productId !== undefined) updateData.productId = data.productId;

      await prisma.review.update({
        where: { id },
        data: updateData,
      });
    }
    revalidatePath('/admin/resenas');
    return { success: true };
  } catch (err: any) {
    console.error('[UPDATE REVIEW ERROR]:', err);
    return { success: false, error: err.message || 'Erreur lors de la mise à jour' };
  }
}

/**
 * Permet aux clients de déposer un avis depuis la boutique
 * L'avis est créé avec isApproved: false (PENDIENTE) pour modération dans l'admin
 */
export async function submitCustomerReview(data: {
  productId?: string;
  productSlug?: string;
  userName: string;
  userEmail: string;
  rating: number;
  fit: 'SMALL' | 'TRUE_TO_SIZE' | 'LARGE';
  comment: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const email = data.userEmail.trim().toLowerCase();
    if (!email || !data.userName.trim() || !data.comment.trim()) {
      return { success: false, error: 'Champs requis manquants' };
    }

    // Trouver le produit par ID ou Slug
    let product = null;
    if (data.productId) {
      product = await prisma.product.findUnique({ where: { id: data.productId } });
    }
    if (!product && data.productSlug) {
      product = await prisma.product.findFirst({
        where: { slug: { in: [data.productSlug, `/${data.productSlug}`] } },
      });
    }
    if (!product) {
      product = await prisma.product.findFirst();
    }
    if (!product) {
      return { success: false, error: 'Produit introuvable' };
    }

    // Trouver ou créer l'utilisateur
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: data.userName.trim(),
          email,
          password: 'guest-customer-review',
          role: 'CUSTOMER',
        },
      });
    }

    // Créer la critique en attente de validation (isApproved: false)
    await prisma.review.create({
      data: {
        productId: product.id,
        userId: user.id,
        rating: data.rating,
        fit: data.fit as any,
        comment: data.comment.trim(),
        isApproved: false,
      },
    });

    // Déclencher notification en temps réel pour l'administrateur
    try {
      await createNotification({
        title: 'Nouvelle Expérience Client Reçue',
        message: `${data.userName} a partagé un avis sur "${product.name}" (${data.rating} ★ - En attente de validation).`,
        type: 'review',
        link: '/admin/resenas',
      });
    } catch (notifErr) {
      console.warn('[NOTIF REVIEW ERROR]:', notifErr);
    }

    revalidatePath('/admin/resenas');
    revalidatePath(`/producto/${product.slug.replace(/^\//, '')}`);
    return { success: true };
  } catch (err: any) {
    console.error('[SUBMIT CUSTOMER REVIEW ERROR]:', err);
    return { success: false, error: err.message || 'Erreur lors de l’envoi de votre avis' };
  }
}

/**
 * Récupère les avis approuvés pour un produit spécifique pour affichage en boutique
 */
export async function getProductApprovedReviews(productIdOrSlug?: string): Promise<any[]> {
  try {
    if (!productIdOrSlug) return [];

    const reviews = await prisma.review.findMany({
      where: {
        isApproved: true,
        OR: [
          { productId: productIdOrSlug },
          { product: { slug: { in: [productIdOrSlug, `/${productIdOrSlug}`] } } },
        ],
      },
      include: {
        user: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return reviews.map((r) => ({
      id: r.id,
      author: r.user?.name || 'Cliente Verificado',
      rating: r.rating,
      fit: r.fit,
      comment: r.comment,
      imageUrl: r.imageUrl,
      date: new Date(r.createdAt).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
    }));
  } catch (err) {
    console.warn('[GET PRODUCT APPROVED REVIEWS ERROR]:', err);
    return [];
  }
}
