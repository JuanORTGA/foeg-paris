'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { createNotification } from '@/lib/notifications';
import { sendEmail, getOrderConfirmationEmailHtml, getOrderShippedEmailHtml } from '@/lib/mail';

export async function updateOrderStatus(orderId: string, newStatus: string) {
  try {
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
      include: { items: true },
    });

    // Notification à l'Atelier
    await createNotification({
      title: 'Statut de Commande Mis à Jour',
      message: `La commande #${updatedOrder.orderNumber} est désormais "${newStatus}".`,
      type: 'order',
      link: '/admin/pedidos',
    });

    // Notification client si l'acheteur a un compte ou s'il est retrouvé par email
    try {
      let clientUserId = updatedOrder.userId;
      if (!clientUserId && updatedOrder.email) {
        const u = await prisma.user.findUnique({
          where: { email: updatedOrder.email.toLowerCase().trim() },
          select: { id: true },
        });
        if (u) clientUserId = u.id;
      }
      if (clientUserId) {
        await createNotification({
          userId: clientUserId,
          title: 'Mise à jour de commande',
          message: `Votre commande #${updatedOrder.orderNumber} a été mise à jour : ${newStatus}`,
          type: 'order',
          link: '/cuenta/pedidos',
        });
      }
    } catch (notifErr) {
      console.warn('[CLIENT NOTIFICATION WARNING]:', notifErr);
    }

    // Envoi de courriel au client si le statut passe à Expédié
    if (newStatus.toLowerCase().includes('expédi') || newStatus.toLowerCase().includes('enviad')) {
      try {
        const trackingCode = updatedOrder.trackingNumber || `FOEG-FR-${Math.floor(10000 + Math.random() * 90000)}-EXP`;
        const html = getOrderShippedEmailHtml({
          orderNumber: updatedOrder.orderNumber,
          firstName: updatedOrder.firstName,
          trackingNumber: trackingCode,
          shippingAddress: updatedOrder.address ? `${updatedOrder.address}, ${updatedOrder.postalCode} ${updatedOrder.city}` : undefined,
        });

        await sendEmail({
          to: updatedOrder.email,
          subject: `FOEG Paris — Expédition de votre Commande #${updatedOrder.orderNumber}`,
          html,
          text: `Cher(e) ${updatedOrder.firstName}, votre commande #${updatedOrder.orderNumber} a été scellée et expédiée. Numéro de suivi: ${trackingCode}.`,
        });
      } catch (mailErr) {
        console.warn('[ORDER SHIPPED EMAIL WARNING]:', mailErr);
      }
    }

    try {
      revalidatePath('/admin/pedidos');
      revalidatePath('/admin');
    } catch (_) {}

    return {
      success: true,
      order: {
        ...updatedOrder,
        total: Number(updatedOrder.total),
      },
    };
  } catch (error: any) {
    console.error('[UPDATE ORDER STATUS ERROR]:', error);
    return {
      success: false,
      error: `Erreur lors de la mise à jour: ${error?.message || 'Erreur inconnue'}`,
    };
  }
}

/**
 * Validation manuelle des paiements locaux (Zelle, Binance, Zinli, Pago Móvil)
 * Action déclenchée par l'administrateur depuis la table des commandes
 */
export async function approveLocalPayment(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        transactions: true,
      },
    });

    if (!order) {
      return { success: false, error: 'Commande introuvable.' };
    }

    // Mise à jour de la commande et de la transaction
    const updatedOrder = await prisma.$transaction(async (tx) => {
      const ord = await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'En préparation à l’Atelier',
        },
        include: { items: true },
      });

      if (order.transactions && order.transactions.length > 0) {
        await tx.transaction.update({
          where: { id: order.transactions[0].id },
          data: { status: 'PAID' },
        });
      } else {
        await (tx as any).transaction.create({
          data: {
            orderId: order.id,
            amount: order.total,
            currency: order.currency,
            status: 'PAID',
            paymentMethod: (order as any).paymentMethod || 'MANUAL_VALIDATION',
            transactionRef: `MANUAL-${Date.now()}`,
          },
        });
      }

      return ord;
    });

    // Notification Atelier
    await createNotification({
      title: 'Paiement Local Approuvé',
      message: `Le virement pour la commande #${order.orderNumber} a été validé avec succès par l'administrateur.`,
      type: 'order',
      link: '/admin/pedidos',
    });

    // Notification client pour débloquer la facture
    try {
      let clientUserId = order.userId;
      if (!clientUserId && order.email) {
        const u = await prisma.user.findUnique({
          where: { email: order.email.toLowerCase().trim() },
          select: { id: true },
        });
        if (u) clientUserId = u.id;
      }
      if (clientUserId) {
        await createNotification({
          userId: clientUserId,
          title: 'Paiement Validé · Atelier FOEG',
          message: `Votre commande #${order.orderNumber} a été validée. Votre facture officielle est désormais disponible.`,
          type: 'order',
          link: '/cuenta/pedidos',
        });
      }
    } catch (notifErr) {
      console.warn('[CLIENT NOTIFICATION WARNING]:', notifErr);
    }

    // Courriel officiel au client
    const emailHtml = getOrderConfirmationEmailHtml({
      orderNumber: order.orderNumber,
      firstName: order.firstName,
      total: order.total,
      currency: order.currency,
      shippingMethod: (order as any).shippingMethod || 'SHIPPING',
    });

    await sendEmail({
      to: order.email,
      subject: `FOEG Paris — Virement Validé · Commande #${order.orderNumber}`,
      html: emailHtml,
      text: `Cher(e) ${order.firstName}, nous vous confirmons la bonne réception de votre virement pour la commande #${order.orderNumber}. Nos maîtres tailleurs préparent vos pièces avec le plus grand soin.`,
    });

    revalidatePath('/admin/pedidos');
    revalidatePath('/cuenta/pedidos');

    return {
      success: true,
      order: {
        ...updatedOrder,
        total: Number(updatedOrder.total),
      },
    };
  } catch (error: any) {
    console.error('[APPROVE LOCAL PAYMENT ERROR]:', error);
    return {
      success: false,
      error: error?.message || 'Erreur lors de la validation du paiement.',
    };
  }
}

/**
 * Suppression sécurisée d'une commande par l'administrateur
 * Nettoie la commande, ses lignes d'articles et ses transactions associées en cascade
 */
export async function deleteOrder(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return { success: false, error: 'Commande introuvable.' };
    }

    // Suppression en cascade dans Neon
    await prisma.order.delete({
      where: { id: orderId },
    });

    // Notification Atelier
    await createNotification({
      title: 'Commande Supprimée',
      message: `La commande #${order.orderNumber} (${order.firstName} ${order.lastName}) a été supprimée de Neon.`,
      type: 'order',
      link: '/admin/pedidos',
    });

    revalidatePath('/admin/pedidos');
    revalidatePath('/admin');
    revalidatePath('/cuenta/pedidos');

    return {
      success: true,
      message: `Commande #${order.orderNumber} supprimée avec succès.`,
    };
  } catch (error: any) {
    console.error('[DELETE ORDER ERROR]:', error);
    return {
      success: false,
      error: error?.message || 'Erreur lors de la suppression de la commande.',
    };
  }
}

