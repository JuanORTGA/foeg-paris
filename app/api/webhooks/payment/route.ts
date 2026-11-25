import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/db';
import { createNotification } from '@/lib/notifications';
import { sendEmail, getOrderConfirmationEmailHtml } from '@/lib/mail';

/**
 * Vérification cryptographique de la signature Stripe (HMAC-SHA256)
 */
function verifyStripeSignature(rawBody: string, signatureHeader: string, secret: string): boolean {
  try {
    const parts = signatureHeader.split(',').reduce((acc, part) => {
      const [k, v] = part.split('=');
      if (k && v) acc[k.trim()] = v.trim();
      return acc;
    }, {} as Record<string, string>);

    if (!parts.t || !parts.v1) {
      return false;
    }

    const timestamp = parts.t;
    const expectedSignature = parts.v1;
    const signedPayload = `${timestamp}.${rawBody}`;

    const computedSignature = crypto
      .createHmac('sha256', secret)
      .update(signedPayload, 'utf8')
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(computedSignature, 'hex')
    );
  } catch (err) {
    return false;
  }
}

/**
 * Vérification des entêtes de sécurité pour Cobrix
 */
function verifyCobrixSecurity(req: NextRequest, rawBody: string): boolean {
  const cobrixApiKey = process.env.COBRIX_API_KEY;
  if (!cobrixApiKey || cobrixApiKey.includes('placeholder')) {
    // Mode développement / test
    return true;
  }

  const cobrixSignature = req.headers.get('x-cobrix-signature');
  const authHeader = req.headers.get('authorization');

  if (authHeader && authHeader.includes(cobrixApiKey)) {
    return true;
  }

  if (cobrixSignature) {
    try {
      const computed = crypto
        .createHmac('sha256', cobrixApiKey)
        .update(rawBody, 'utf8')
        .digest('hex');
      return crypto.timingSafeEqual(
        Buffer.from(cobrixSignature),
        Buffer.from(computed)
      );
    } catch (_) {
      return false;
    }
  }

  return false;
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const headers = req.headers;
    const stripeSignature = headers.get('stripe-signature');
    const paypalAuth = headers.get('paypal-auth-algo');
    const cobrixHeader = headers.get('x-cobrix-signature') || headers.get('x-cobrix-event');

    let eventData: any = {};
    try {
      eventData = JSON.parse(rawBody);
    } catch (_) {
      eventData = {};
    }

    let detectedProvider: 'stripe' | 'paypal' | 'cobrix' | 'unknown' = 'unknown';
    let orderId: string | null = null;
    let orderNumber: string | null = null;
    let paymentRef: string | null = null;
    let isSuccess = false;

    // =========================================================================
    // 1. VÉRIFICATION STRIPE AVEC SÉCURITÉ CRYPTOGRAPHIQUE
    // =========================================================================
    if (stripeSignature) {
      detectedProvider = 'stripe';
      const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      // Si un secret réel est configuré, la vérification HMAC-SHA256 est obligatoire
      if (stripeWebhookSecret && !stripeWebhookSecret.includes('placeholder')) {
        const isValid = verifyStripeSignature(rawBody, stripeSignature, stripeWebhookSecret);
        if (!isValid) {
          console.error('[STRIPE WEBHOOK ERROR]: Échec de validation cryptographique de la signature.');
          return NextResponse.json({ error: 'Signature Stripe invalide' }, { status: 400 });
        }
      }

      const eventType = eventData.type;
      if (eventType === 'checkout.session.completed' || eventType === 'payment_intent.succeeded') {
        const session = eventData.data?.object || {};
        orderId = session.client_reference_id || session.metadata?.orderId || null;
        orderNumber = session.metadata?.orderNumber || null;
        paymentRef = session.payment_intent || session.id || null;
        isSuccess = true;
      }
    }
    // =========================================================================
    // 2. VÉRIFICATION PAYPAL AVEC ENTÊTES D'AUTHENTIFICATION
    // =========================================================================
    else if (paypalAuth || eventData.event_type?.startsWith('PAYMENT.') || eventData.resource_type === 'capture') {
      detectedProvider = 'paypal';

      // Validation de la présence des entêtes PayPal exigés en production
      const transmissionId = headers.get('paypal-transmission-id');
      const transmissionSig = headers.get('paypal-transmission-sig');
      const isLivePayPal = process.env.PAYPAL_CLIENT_ID && !process.env.PAYPAL_CLIENT_ID.includes('placeholder');

      if (isLivePayPal && (!transmissionId || !transmissionSig)) {
        console.error('[PAYPAL WEBHOOK ERROR]: Entêtes de transmission PayPal manquants.');
        return NextResponse.json({ error: 'Entêtes PayPal non conformes' }, { status: 400 });
      }

      const eventType = eventData.event_type;
      if (eventType === 'PAYMENT.CAPTURE.COMPLETED' || eventType === 'CHECKOUT.ORDER.APPROVED') {
        const resource = eventData.resource || {};
        orderNumber = resource.supplementary_data?.related_ids?.order_id || resource.custom_id || null;
        paymentRef = resource.id || null;
        isSuccess = true;
      }
    }
    // =========================================================================
    // 3. VÉRIFICATION COBRIX (Zelle, Zinli, Binance, Pago Móvil)
    // =========================================================================
    else if (cobrixHeader || eventData.provider === 'cobrix' || eventData.event?.startsWith('payment.')) {
      detectedProvider = 'cobrix';

      const isCobrixValid = verifyCobrixSecurity(req, rawBody);
      if (!isCobrixValid) {
        console.error('[COBRIX WEBHOOK ERROR]: Échec d’authentification de la passerelle Cobrix.');
        return NextResponse.json({ error: 'Signature Cobrix non autorisée' }, { status: 401 });
      }

      if (eventData.event === 'payment.completed' || eventData.status === 'PAID' || eventData.status === 'APPROVED') {
        orderId = eventData.orderId || null;
        orderNumber = eventData.orderNumber || null;
        paymentRef = eventData.reference || eventData.id || null;
        isSuccess = true;
      }
    } else {
      return NextResponse.json({ error: 'Fournisseur de webhook non reconnu' }, { status: 400 });
    }

    if (!isSuccess) {
      return NextResponse.json({ message: 'Événement ignoré ou paiement non complété' }, { status: 200 });
    }

    // Recherche de la commande dans la base de données
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          ...(orderId ? [{ id: orderId }] : []),
          ...(orderNumber ? [{ orderNumber }] : []),
        ],
      },
      include: {
        items: true,
        transactions: true,
      },
    });

    if (!order) {
      console.warn('[WEBHOOK WARNING]: Commande non trouvée dans la base de données', { orderId, orderNumber });
      return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
    }

    // Mise à jour de la commande et de la transaction en base
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: 'En préparation à l’Atelier',
        },
      });

      if (order.transactions && order.transactions.length > 0) {
        await tx.transaction.update({
          where: { id: order.transactions[0].id },
          data: {
            status: 'PAID',
            ...(paymentRef ? { transactionRef: paymentRef } : {}),
          },
        });
      } else {
        await (tx as any).transaction.create({
          data: {
            orderId: order.id,
            amount: order.total,
            currency: order.currency,
            status: 'PAID',
            paymentMethod: detectedProvider.toUpperCase(),
            transactionRef: paymentRef || `WH-${Date.now()}`,
          },
        });
      }
    });

    // Notification à l'Atelier
    await createNotification({
      title: 'Paiement Validé par Webhook',
      message: `Paiement vérifié avec succès via ${detectedProvider.toUpperCase()} pour la commande #${order.orderNumber} (${order.total.toFixed(2)} ${order.currency}).`,
      type: 'order',
      link: '/admin/pedidos',
    });

    // Courriel de confirmation
    const emailHtml = getOrderConfirmationEmailHtml({
      orderNumber: order.orderNumber,
      firstName: order.firstName,
      total: order.total,
      currency: order.currency,
      shippingMethod: (order as any).shippingMethod || 'SHIPPING',
    });

    await sendEmail({
      to: order.email,
      subject: `FOEG Paris — Confirmation de votre Paiement #${order.orderNumber}`,
      html: emailHtml,
      text: `Votre règlement a bien été confirmé par notre passerelle sécurisée. Nos artisans finalisent la préparation de votre commande #${order.orderNumber}.`,
    });

    return NextResponse.json({ success: true, orderNumber: order.orderNumber, provider: detectedProvider });
  } catch (error: any) {
    console.error('[WEBHOOK PAYMENT ERROR]:', error);
    return NextResponse.json({ error: error?.message || 'Erreur interne du webhook' }, { status: 500 });
  }
}
