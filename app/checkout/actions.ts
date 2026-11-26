'use server';

import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { createNotification } from '@/lib/notifications';
import { sendEmail, getOrderConfirmationEmailHtml } from '@/lib/mail';
import { getPaymentGateway, PaymentMethod } from '@/lib/payments';

export interface CheckoutItemPayload {
  productId?: string;
  slug?: string;
  name: string;
  size: string;
  color?: string;
  quantity: number;
  price: number;
}

export interface ProcessPaymentPayload {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  country?: string;
  shippingMethod?: 'SHIPPING' | 'PICKUP';
  shippingCost?: number;
  shippingTitle?: string;
  paymentMethod?: PaymentMethod;
  couponCode?: string;
  discountAmount?: number;
  total: number;
  currency: string;
  items: CheckoutItemPayload[];
  language?: 'fr' | 'es' | 'en';
}

export type CreateOrderPayload = ProcessPaymentPayload;

export interface CouponValidationResult {
  valid: boolean;
  code?: string;
  discountType?: 'PERCENTAGE' | 'FIXED';
  discountValue?: number;
  message?: string;
}

/**
 * Valide un code promotionnel auprès de la table Coupon ou des codes permanents de la Maison
 */
export async function validateCoupon(
  rawCode: string,
  lang: 'fr' | 'es' | 'en' = 'fr'
): Promise<CouponValidationResult> {
  const code = (rawCode || '').trim().toUpperCase();
  if (!code) {
    return {
      valid: false,
      message:
        lang === 'es'
          ? 'Por favor ingrese un código de privilegio.'
          : lang === 'en'
          ? 'Please enter a privilege code.'
          : 'Veuillez saisir un code privilège.',
    };
  }

  try {
    const dbCoupon = await (prisma as any).coupon?.findUnique({
      where: { code },
    });

    if (dbCoupon) {
      if (!dbCoupon.isActive) {
        return {
          valid: false,
          message:
            lang === 'es'
              ? 'Este código de privilegio ya no está activo.'
              : lang === 'en'
              ? 'This privilege code is no longer active.'
              : 'Ce code privilège n’est plus actif.',
        };
      }
      if (dbCoupon.expiresAt && new Date(dbCoupon.expiresAt) < new Date()) {
        return {
          valid: false,
          message:
            lang === 'es'
              ? 'Este código de privilegio ha caducado.'
              : lang === 'en'
              ? 'This privilege code has expired.'
              : 'Ce code privilège a expiré.',
        };
      }

      return {
        valid: true,
        code: dbCoupon.code,
        discountType: dbCoupon.discountType as 'PERCENTAGE' | 'FIXED',
        discountValue: Number(dbCoupon.discountValue),
        message:
          dbCoupon.discountType === 'PERCENTAGE'
            ? lang === 'es'
              ? `Descuento del ${dbCoupon.discountValue}% aplicado.`
              : lang === 'en'
              ? `${dbCoupon.discountValue}% discount applied.`
              : `Remise de ${dbCoupon.discountValue}% appliquée.`
            : lang === 'es'
            ? `Descuento de ${dbCoupon.discountValue}€ aplicado.`
            : lang === 'en'
            ? `€${dbCoupon.discountValue} discount applied.`
            : `Remise de ${dbCoupon.discountValue}€ appliquée.`,
      };
    }
  } catch (err) {
    console.warn('[COUPON DB LOOKUP NOTE - USING FALLBACK]:', err);
  }

  const PRESET_COUPONS: Record<
    string,
    {
      type: 'PERCENTAGE' | 'FIXED';
      value: number;
      msg: Record<'fr' | 'es' | 'en', string>;
    }
  > = {
    VIP20: {
      type: 'PERCENTAGE',
      value: 20,
      msg: {
        fr: 'Code VIP Privilège : -20% appliqué.',
        es: 'Código VIP Privilegio: -20% aplicado.',
        en: 'VIP Privilege Code: -20% applied.',
      },
    },
    CERCLE10: {
      type: 'PERCENTAGE',
      value: 10,
      msg: {
        fr: 'Code Cercle Privilège : -10% appliqué.',
        es: 'Código Círculo Privilegio: -10% aplicado.',
        en: 'Privilege Circle Code: -10% applied.',
      },
    },
    FOEGVIP: {
      type: 'PERCENTAGE',
      value: 15,
      msg: {
        fr: 'Accès VIP FOEG : -15% appliqué.',
        es: 'Acceso VIP FOEG: -15% aplicado.',
        en: 'FOEG VIP Access: -15% applied.',
      },
    },
    PARIS50: {
      type: 'FIXED',
      value: 50,
      msg: {
        fr: 'Privilège Atelier Paris : -50€ appliqués.',
        es: 'Privilegio Atelier París: -50€ aplicados.',
        en: 'Paris Atelier Privilege: -€50 applied.',
      },
    },
  };

  if (PRESET_COUPONS[code]) {
    const preset = PRESET_COUPONS[code];
    return {
      valid: true,
      code,
      discountType: preset.type,
      discountValue: preset.value,
      message: preset.msg[lang] || preset.msg.fr,
    };
  }

  return {
    valid: false,
    message:
      lang === 'es'
        ? 'Código de privilegio no reconocido o caducado.'
        : lang === 'en'
        ? 'Unrecognized or expired privilege code.'
        : 'Code privilège non reconnu ou expiré.',
  };
}

/**
 * Server Action Unifiée pour le traitement de paiement et création de commande
 */
export async function processPayment(payload: ProcessPaymentPayload) {
  try {
    let session = null;
    try {
      session = await auth();
    } catch (_) {}
    const userId = session?.user?.id || null;

    const email = String(payload.email || '').trim().toLowerCase();
    const firstName = String(payload.firstName || '').trim();
    const lastName = String(payload.lastName || '').trim();
    const shippingMethod = payload.shippingMethod === 'PICKUP' ? 'PICKUP' : 'SHIPPING';
    const rawMethod = String(payload.paymentMethod || 'STRIPE').toUpperCase().trim();
    const paymentMethod: PaymentMethod =
      rawMethod === 'VIREMENT BANCAIRE' || rawMethod === 'VIREMENT_BANCAIRE'
        ? 'VIREMENT'
        : (payload.paymentMethod || 'STRIPE');

    const exactPaymentMethodName =
      rawMethod === 'VIREMENT' || rawMethod === 'VIREMENT_BANCAIRE' || rawMethod === 'VIREMENT BANCAIRE'
        ? 'VIREMENT BANCAIRE'
        : rawMethod;

    const isInstantPayment = paymentMethod === 'STRIPE' || paymentMethod === 'PAYPAL';
    const initialStatus = isInstantPayment
      ? 'En préparation à l’Atelier'
      : 'PENDING_VERIFICATION';

    const address =
      shippingMethod === 'PICKUP'
        ? 'Boutique Atelier FOEG — 48 Rue Lucien Sampaix'
        : String(payload.address || '').trim();
    const city = shippingMethod === 'PICKUP' ? 'Paris (10e)' : String(payload.city || '').trim();
    const postalCode = shippingMethod === 'PICKUP' ? '75010' : String(payload.postalCode || '').trim();

    // 1. Validation des champs
    if (!email || !firstName || !lastName || (!address && shippingMethod === 'SHIPPING')) {
      return { success: false, error: 'Veuillez renseigner toutes vos coordonnées de livraison.' };
    }

    if (!payload.items || payload.items.length === 0) {
      return { success: false, error: 'Votre panier est vide.' };
    }

    // 2. Transaction atomique Prisma
    const orderData = await prisma.$transaction(async (tx) => {
      // Étape A: Vérification du stock
      for (const item of payload.items) {
        if (item.productId) {
          const variant = await tx.variant.findFirst({
            where: {
              productId: item.productId,
              size: item.size,
            },
          });

          if (variant && variant.stock < item.quantity) {
            throw new Error(
              `Stock insuffisant pour « ${item.name} » (Taille ${item.size}). Il ne reste que ${variant.stock} unité(s) en atelier.`
            );
          }
        }
      }

      // Étape B: Génération du numéro de commande
      const count = await tx.order.count();
      const orderNumber = `CMD-2026-${String(count + 892).padStart(4, '0')}`;
      const trackingNumber =
        shippingMethod === 'PICKUP'
          ? `RETRAIT-SAMPAIX-75010`
          : `FOEG-FR-${Math.floor(10000 + Math.random() * 90000)}-EXP`;

      const totalEur = Number(payload.total);
      const chosenCurrency = payload.currency === 'USD' ? 'USD' : 'EUR';

      // Statut initial selon le moyen de paiement (TAREA 2)
      const orderPayload: any = {
        orderNumber,
        email,
        firstName,
        lastName,
        address,
        city,
        postalCode,
        total: totalEur,
        currency: chosenCurrency,
        status: shippingMethod === 'PICKUP' && isInstantPayment ? 'Prêt pour retrait à l’Atelier' : initialStatus,
        trackingNumber,
        items: {
          create: payload.items.map((it) => ({
            productId: it.productId || null,
            productName: it.name,
            size: it.color ? `${it.size} · ${it.color}` : it.size,
            quantity: Number(it.quantity),
            price: Number(it.price),
          })),
        },
      };

      if (userId) {
        orderPayload.userId = userId;
      }

      try {
        orderPayload.shippingMethod = shippingMethod;
        orderPayload.addressString = `${address}, ${postalCode} ${city}`;
        orderPayload.paymentMethod = exactPaymentMethodName;
      } catch (_) { }

      const newOrder = await tx.order.create({
        data: orderPayload,
      });

      // Étape C: Décrémentation du stock
      for (const item of payload.items) {
        if (item.productId) {
          const variant = await tx.variant.findFirst({
            where: {
              productId: item.productId,
              size: item.size,
              ...(item.color ? { color: item.color } : {}),
            },
          });

          if (variant) {
            await tx.variant.update({
              where: { id: variant.id },
              data: {
                stock: {
                  decrement: item.quantity,
                },
              },
            });
          }
        }
      }

      return newOrder;
    });

    // 3. Appel de la passerelle unifiée (Stripe / PayPal / Cobrix)
    const gatewayHandler = getPaymentGateway(paymentMethod);
    const sessionResult = await gatewayHandler({
      orderId: orderData.id,
      orderNumber: orderData.orderNumber,
      amount: payload.total,
      currency: payload.currency,
      customerEmail: email,
      customerName: `${firstName} ${lastName}`,
      paymentMethod,
      shippingCost: payload.shippingCost,
      shippingTitle: payload.shippingTitle,
      isInternational: payload.country ? payload.country !== 'FR' : false,
      items: payload.items.map((it) => ({
        name: it.name,
        quantity: it.quantity,
        price: it.price,
      })),
    });

    // 4. Enregistrement de la transaction sécurisée
    try {
      const chosenCurrency = payload.currency === 'USD' ? 'USD' : 'EUR';
      const transactionAmount =
        chosenCurrency === 'USD'
          ? Number((Number(payload.total) * 1.08).toFixed(2))
          : Number(payload.total);

      await (prisma as any).transaction.create({
        data: {
          orderId: orderData.id,
          amount: transactionAmount,
          currency: chosenCurrency,
          status: sessionResult.status,
          paymentMethod,
          transactionRef: sessionResult.paymentRef,
        },
      });
    } catch (txErr) {
      console.warn('[TRANSACTION REGISTER NOTE]:', txErr);
    }

    // 5. Notification atelier (ADMIN)
    await createNotification({
      title: 'Nouvelle Commande Reçue',
      message: `Commande #${orderData.orderNumber} enregistrée via ${paymentMethod} (${Number(payload.total).toFixed(2)} ${payload.currency}).`,
      type: 'order',
      link: '/admin/pedidos',
      userId: null,
    });

    // 5.1 Notification automatique si le client atteint ou dépasse le seuil VIP (≥ 1.000 €)
    try {
      const customerEmail = (payload.email || orderData.email || '').toLowerCase().trim();
      if (customerEmail) {
        const paidOrders = await prisma.order.findMany({
          where: {
            OR: [
              { email: { equals: customerEmail, mode: 'insensitive' } },
              orderData.userId ? { userId: orderData.userId } : {},
            ],
            status: { not: 'CANCELLED' },
          },
          select: { total: true },
        });
        const cumulativeSpent = paidOrders.reduce((acc, curr) => acc + Number(curr.total || 0), 0);
        const previousSpent = cumulativeSpent - Number(payload.total);

        // Si vient de franchir le seuil VIP de 1.000 €
        if (cumulativeSpent >= 1000 && previousSpent < 1000) {
          await createNotification({
            title: '👑 Nouveau Membre VIP Cercle Privé Débloqué',
            message: `Le client ${customerEmail} a franchi le seuil VIP (${cumulativeSpent.toFixed(2)} € cumulés). Accès Cercle Privé Haute Confection débloqué !`,
            type: 'order',
            link: '/admin/newsletter',
            userId: null,
          });

          if (orderData.userId) {
            await createNotification({
              userId: orderData.userId,
              title: '👑 Félicitations · Statut VIP Cercle Privé Débloqué',
              message: `Vos acquisitions ont atteint le rang d'Exception Maison FOEG Paris. Vos livraisons signature sont désormais gratuites en permanence.`,
              type: 'order',
              link: '/cuenta/perfil',
            });
          }
        }
      }
    } catch (vipNotifErr) {
      console.warn('[VIP THRESHOLD NOTIFICATION NOTE]:', vipNotifErr);
    }

    // Notification client si l'acheteur est un membre enregistré
    try {
      if (orderData.userId) {
        await createNotification({
          userId: orderData.userId,
          title: 'Commande Confirmée · FOEG Paris',
          message: `Votre commande #${orderData.orderNumber} a bien été enregistrée à l'Atelier.`,
          type: 'order',
          link: '/cuenta/pedidos',
        });
      }
    } catch (clientNotifErr) {
      console.warn('[CLIENT ORDER NOTIFICATION NOTE]:', clientNotifErr);
    }

    // 6. Courriels
    const clientLang = payload.language || 'fr';
    const emailHtml = getOrderConfirmationEmailHtml(
      {
        orderNumber: orderData.orderNumber,
        firstName,
        total: Number(payload.total),
        currency: payload.currency || 'EUR',
        shippingMethod,
      },
      clientLang
    );

    // Message personnalisé pour l'acheteur
    const clientEmailText =
      clientLang === 'es'
        ? isInstantPayment
          ? `Estimado(a) ${firstName}, su pedido #${orderData.orderNumber} por un importe de ${payload.total} ${payload.currency} ha sido confirmado con éxito. Sus prendas están en proceso de confección.`
          : `Estimado(a) ${firstName}, su pedido #${orderData.orderNumber} ha sido reservado en el Atelier. Por favor transmita su comprobante de transferencia (${paymentMethod}) a concierge@foeg-paris.com o a través de su página de confirmación para activar el despacho.`
        : clientLang === 'en'
        ? isInstantPayment
          ? `Dear ${firstName}, your order #${orderData.orderNumber} in the amount of ${payload.total} ${payload.currency} has been successfully confirmed. Your creations are currently being tailored.`
          : `Dear ${firstName}, your order #${orderData.orderNumber} is reserved at the Atelier. Please submit your transfer receipt (${paymentMethod}) to concierge@foeg-paris.com or via your confirmation page to dispatch shipment.`
        : isInstantPayment
        ? `Cher(e) ${firstName}, votre commande #${orderData.orderNumber} d'un montant de ${payload.total} ${payload.currency} a été validée avec succès. Vos pièces sont en cours de confection.`
        : `Cher(e) ${firstName}, votre commande #${orderData.orderNumber} est réservée en Atelier. Veuillez transmettre votre justificatif de virement (${paymentMethod}) à concierge@foeg-paris.com ou via votre page de confirmation pour déclencher l'expédition.`;

    const clientSubject =
      clientLang === 'es'
        ? isInstantPayment
          ? `FOEG Paris — Confirmación de su Pedido #${orderData.orderNumber}`
          : `FOEG Paris — Pedido #${orderData.orderNumber} Reservado (En espera de comprobante)`
        : clientLang === 'en'
        ? isInstantPayment
          ? `FOEG Paris — Order Confirmation #${orderData.orderNumber}`
          : `FOEG Paris — Order #${orderData.orderNumber} Reserved (Awaiting receipt)`
        : isInstantPayment
        ? `FOEG Paris — Confirmation de votre Commande #${orderData.orderNumber}`
        : `FOEG Paris — Commande #${orderData.orderNumber} Réservée (Attente Justificatif)`;

    await Promise.all([
      sendEmail({
        to: email,
        subject: clientSubject,
        html: emailHtml,
        text: clientEmailText,
      }),
      sendEmail({
        to: 'concierge@foeg-paris.com',
        subject: `[ATELIER ALERTE] Commande #${orderData.orderNumber} via ${paymentMethod} (${isInstantPayment ? 'PAYÉ' : 'À VÉRIFIER'})`,
        text: `Commande de ${firstName} ${lastName} (${email}) via ${paymentMethod}. Statut: ${initialStatus}. Total: ${payload.total} ${payload.currency}.`,
      }),
    ]);

    // 7. Revalidations
    try {
      try {
      revalidatePath('/admin/pedidos');
    } catch (_) {}
      revalidatePath('/admin/productos');
      revalidatePath('/cuenta/pedidos');
    } catch (_) {}

    return {
      success: true,
      orderId: orderData.id,
      orderNumber: orderData.orderNumber,
      redirectUrl: sessionResult.redirectUrl,
      paymentMethod,
      instructions: sessionResult.instructions,
    };
  } catch (error: any) {
    console.error('[PROCESS PAYMENT ERROR]:', error);
    return {
      success: false,
      error: error?.message || 'Une erreur est survenue lors du traitement du paiement.',
    };
  }
}

export interface SubmitReceiptPayload {
  orderId: string;
  referenceNumber: string;
  bankOrWallet?: string;
  notes?: string;
}

/**
 * Permet au client de soumettre son reçu de virement depuis la page de confirmation
 */
export async function submitPaymentReceipt(payload: SubmitReceiptPayload) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: payload.orderId },
      include: { transactions: true },
    });

    if (!order) {
      return { success: false, error: 'Commande introuvable.' };
    }

    if (order.transactions && order.transactions.length > 0) {
      await prisma.transaction.update({
        where: { id: order.transactions[0].id },
        data: {
          transactionRef: payload.referenceNumber,
        },
      });
    }

    // Notification interne dans le panneau admin
    await createNotification({
      title: 'Justificatif de Paiement Reçu',
      message: `Reçu soumis pour la commande #${order.orderNumber} (Réf: ${payload.referenceNumber}, ${payload.bankOrWallet || 'Banque'}).`,
      type: 'order',
      link: '/admin/pedidos',
    });

    // Courriel à la Conciergerie
    await sendEmail({
      to: 'concierge@foeg-paris.com',
      subject: `[JUSTIFICATIF CLIENT] Reçu de Virement #${order.orderNumber}`,
      text: `Le client ${order.firstName} ${order.lastName} (${order.email}) a soumis son justificatif de virement.\nRéf: ${payload.referenceNumber}\nBanque/Wallet: ${payload.bankOrWallet || 'N/A'}\nNotes: ${payload.notes || 'Aucune'}\nMontant: ${order.total} ${order.currency}.`,
    });

    try {
      revalidatePath('/admin/pedidos');
    } catch (_) {}

    return {
      success: true,
      message: 'Votre justificatif a été transmis à la Conciergerie de l’Atelier. Vos pièces sont réservées.',
    };
  } catch (err: any) {
    console.error('[SUBMIT PAYMENT RECEIPT ERROR]:', err);
    return { success: false, error: 'Erreur lors de la transmission du reçu.' };
  }
}


