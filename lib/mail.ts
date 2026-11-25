/**
 * FOEG Paris — Moteur d'expédition des correspondances électroniques (Emails)
 * Prise en charge native de l'API Resend et mode simulation haute couture.
 */

export interface EmailPayload {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const DEFAULT_FROM = process.env.EMAIL_FROM || 'FOEG Paris <concierge@foeg-paris.com>';

/**
 * Envoie un courriel via Resend (si la clé API est fournie) ou consigne la correspondance officielle
 */
export async function sendEmail({ to, subject, html, text }: EmailPayload): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  const recipients = Array.isArray(to) ? to : [to];
  const apiKey = process.env.RESEND_API_KEY;

  // 1. Envoi réel via l'API REST officielle de Resend
  if (apiKey && !apiKey.includes('placeholder') && apiKey.startsWith('re_')) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: DEFAULT_FROM,
          to: recipients,
          subject,
          html: html || undefined,
          text: text || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.id) {
        console.log(`[RESEND SUCCESS] Courriel transmis avec succès (ID: ${data.id}) à ${recipients.join(', ')}`);
        return {
          success: true,
          messageId: data.id,
        };
      } else {
        console.warn(`[RESEND API WARNING]:`, data);
      }
    } catch (resendErr: any) {
      console.error('[RESEND API ERROR]:', resendErr?.message || resendErr);
    }
  }

  // 2. Mode Simulation & Journal Officiel de la Maison FOEG
  const timestamp = new Date().toISOString();
  const simulatedId = `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  console.log(`\n================== [FOEG PARIS — COURRIER OFFICIEL] ==================`);
  console.log(`⏰ HORODATAGE : ${timestamp}`);
  console.log(`✉️ DESTINATAIRES: ${recipients.join(', ')}`);
  console.log(`📜 OBJET      : ${subject}`);
  if (text) {
    console.log(`📝 MESSAGE    :\n${text}`);
  }
  if (html) {
    console.log(`✨ APERÇU HTML : ${html.slice(0, 160)}... [${html.length} octets]`);
  }
  console.log(`======================================================================\n`);

  return {
    success: true,
    messageId: simulatedId,
  };
}

/**
 * Modèle 1: Confirmation de Commande Haute Couture
 */
export function getOrderConfirmationEmailHtml(
  order: {
    orderNumber: string;
    firstName: string;
    total: number;
    currency: string;
    shippingMethod: string;
  },
  orderLang: 'fr' | 'es' | 'en' = 'fr'
) {
  const invoiceUrl = `${APP_URL}/factura/${order.orderNumber}`;

  const texts = {
    fr: {
      tag: 'Maison de Confection · Atelier 48 Rue Lucien Sampaix',
      title: `Confirmation de votre Commande #${order.orderNumber}`,
      greeting: `Cher(e) ${order.firstName},`,
      body: `Nous avons l'honneur de vous confirmer l'enregistrement de votre commande. Nos maîtres artisans au sein de l'Atelier parisien confectionnent et préparent vos pièces selon les règles de l'art tailleur français.`,
      pickupLabel: 'Mode de réception :',
      pickupStore: 'Retrait Privé en Boutique (48 Rue Lucien Sampaix, Paris 10e)',
      shippingHome: 'Livraison Sécurisée à Domicile',
      totalLabel: 'Montant total :',
      statusLabel: 'Statut :',
      statusVal: 'En préparation à l’Atelier',
      btn: 'Consulter ma Facture Officielle',
      secondNotice:
        'Un second courrier électronique vous sera transmis dès la remise de votre écrin au transporteur postal avec votre numéro de suivi scellé.',
      footer: 'MAISON FOEG PARIS · 75010 PARIS · TOUS DROITS RÉSERVÉS',
    },
    es: {
      tag: 'Maison de Confection · Atelier 48 Rue Lucien Sampaix París',
      title: `Confirmación de su Pedido #${order.orderNumber}`,
      greeting: `Estimado(a) ${order.firstName},`,
      body: `Tenemos el honor de confirmar el registro de su pedido. Nuestros maestros artesanos en el Atelier parisino confeccionan y preparan sus piezas según las reglas del arte sastre francés.`,
      pickupLabel: 'Modalidad de entrega :',
      pickupStore: 'Retiro Privado en Boutique (48 Rue Lucien Sampaix, París 10e)',
      shippingHome: 'Envío Seguro a Domicilio',
      totalLabel: 'Importe total :',
      statusLabel: 'Estado :',
      statusVal: 'En preparación en el Atelier',
      btn: 'Consultar mi Factura Oficial',
      secondNotice:
        'Un segundo correo electrónico le será enviado tan pronto como su paquete sea entregado al transportista con su número de seguimiento sellado.',
      footer: 'MAISON FOEG PARIS · 75010 PARÍS · TODOS LOS DERECHOS RESERVADOS',
    },
    en: {
      tag: 'Maison de Confection · Atelier 48 Rue Lucien Sampaix Paris',
      title: `Order Confirmation #${order.orderNumber}`,
      greeting: `Dear ${order.firstName},`,
      body: `We have the honor to confirm the registration of your order. Our master artisans in our Parisian Atelier are tailoring and preparing your garments according to the finest French sartorial tradition.`,
      pickupLabel: 'Delivery method :',
      pickupStore: 'Private In-Store Pickup (48 Rue Lucien Sampaix, Paris 10th)',
      shippingHome: 'Secured Home Delivery',
      totalLabel: 'Total amount :',
      statusLabel: 'Status :',
      statusVal: 'In preparation at the Atelier',
      btn: 'View Official Invoice',
      secondNotice:
        'A second email will be transmitted as soon as your parcel is handed over to the courier with your sealed tracking number.',
      footer: 'MAISON FOEG PARIS · 75010 PARIS · ALL RIGHTS RESERVED',
    },
  }[orderLang] || {
    tag: 'Maison de Confection · Atelier 48 Rue Lucien Sampaix',
    title: `Confirmation de votre Commande #${order.orderNumber}`,
    greeting: `Cher(e) ${order.firstName},`,
    body: `Nous avons l'honneur de vous confirmer l'enregistrement de votre commande. Nos maîtres artisans au sein de l'Atelier parisien confectionnent et préparent vos pièces selon les règles de l'art tailleur français.`,
    pickupLabel: 'Mode de réception :',
    pickupStore: 'Retrait Privé en Boutique (48 Rue Lucien Sampaix, Paris 10e)',
    shippingHome: 'Livraison Sécurisée à Domicile',
    totalLabel: 'Montant total :',
    statusLabel: 'Statut :',
    statusVal: 'En préparation à l’Atelier',
    btn: 'Consulter ma Facture Officielle',
    secondNotice:
      'Un second courrier électronique vous sera transmis dès la remise de votre écrin au transporteur postal avec votre numéro de suivi scellé.',
    footer: 'MAISON FOEG PARIS · 75010 PARIS · TOUS DROITS RÉSERVÉS',
  };

  return `
    <div style="font-family: 'Cormorant Garamond', Georgia, serif; background-color: #F8F7F4; color: #11141A; padding: 40px 20px; max-width: 620px; margin: 0 auto; border: 1px solid #E6E4DF;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="font-size: 26px; letter-spacing: 0.28em; text-transform: uppercase; margin: 0; font-weight: 300; color: #1B2A4A;">FOEG PARIS</h1>
        <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 9px; letter-spacing: 0.25em; text-transform: uppercase; color: #8A8D93; margin-top: 6px;">${texts.tag}</p>
      </div>
      <div style="background-color: #FFFFFF; padding: 36px; border: 1px solid #ECEAE5; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
        <h2 style="font-size: 21px; font-weight: 400; margin-top: 0; color: #1B2A4A;">${texts.title}</h2>
        <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; line-height: 1.65; color: #4B4D54;">
          ${texts.greeting}<br><br>
          ${texts.body}
        </p>
        <div style="margin: 28px 0; padding: 18px; background-color: #F9F8F6; border-left: 2px solid #1B2A4A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; line-height: 1.8;">
          <div><strong style="color: #1B2A4A;">${texts.pickupLabel}</strong> ${order.shippingMethod === 'PICKUP' ? texts.pickupStore : texts.shippingHome}</div>
          <div><strong style="color: #1B2A4A;">${texts.totalLabel}</strong> ${order.total.toFixed(2)} ${order.currency}</div>
          <div><strong style="color: #1B2A4A;">${texts.statusLabel}</strong> ${texts.statusVal}</div>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${invoiceUrl}" style="display: inline-block; background-color: #1B2A4A; color: #FFFFFF; text-decoration: none; padding: 14px 28px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; font-weight: 500;">
            ${texts.btn}
          </a>
        </div>
        <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; color: #8A8D93; line-height: 1.6; border-top: 1px solid #ECEAE5; pt: 16px; margin-top: 24px;">
          ${texts.secondNotice}
        </p>
      </div>
      <div style="text-align: center; margin-top: 28px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 10px; color: #8A8D93; letter-spacing: 0.15em;">
        ${texts.footer}
      </div>
    </div>
  `;
}

/**
 * Modèle 2: Notification d'Expédition avec Numéro de Suivi
 */
export function getOrderShippedEmailHtml(
  order: {
    orderNumber: string;
    firstName: string;
    trackingNumber: string;
    shippingAddress?: string;
  },
  orderLang: 'fr' | 'es' | 'en' = 'fr'
) {
  const texts = {
    fr: {
      tag: "Expédition Atelier · Haute Confection",
      title: "Vos créations sont en chemin",
      greeting: `Cher(e) ${order.firstName},`,
      body: `Nous vous informons que votre commande <strong>#${order.orderNumber}</strong> a été minutieusement inspectée, repassée et scellée par notre Atelier. Votre colis a été remis aux services d'acheminement prioritaire.`,
      trackingLabel: "Numéro de suivi officiel :",
      destLabel: "Destination :",
      footerNote: "Vous pouvez suivre la progression de votre envoi à tout moment depuis votre espace client ou via le réseau postal Colissimo / DHL Express.",
      footer: "MAISON FOEG PARIS · 75010 PARIS · TOUS DROITS RÉSERVÉS",
    },
    es: {
      tag: "Envío Atelier · Alta Confección",
      title: "Sus creaciones están en camino",
      greeting: `Estimado(a) ${order.firstName},`,
      body: `Le informamos que su pedido <strong>#${order.orderNumber}</strong> ha sido minuciosamente inspeccionado, planchado y sellado por nuestro Atelier. Su paquete ha sido entregado a los servicios de transporte prioritario.`,
      trackingLabel: "Número de seguimiento oficial :",
      destLabel: "Destino :",
      footerNote: "Puede seguir el progreso de su envío en cualquier momento desde su espacio de cliente o a través de la red postal Colissimo / DHL Express.",
      footer: "MAISON FOEG PARIS · 75010 PARÍS · TODOS LOS DERECHOS RESERVADOS",
    },
    en: {
      tag: "Atelier Dispatch · Haute Confection",
      title: "Your creations are on their way",
      greeting: `Dear ${order.firstName},`,
      body: `We inform you that your order <strong>#${order.orderNumber}</strong> has been meticulously inspected, pressed, and sealed by our Atelier. Your parcel has been dispatched with priority courier services.`,
      trackingLabel: "Official tracking number :",
      destLabel: "Destination :",
      footerNote: "You can track the progress of your shipment at any time from your account or through the Colissimo / DHL Express postal network.",
      footer: "MAISON FOEG PARIS · 75010 PARIS · ALL RIGHTS RESERVED",
    },
  }[orderLang] || {
    tag: "Expédition Atelier · Haute Confection",
    title: "Vos créations sont en chemin",
    greeting: `Cher(e) ${order.firstName},`,
    body: `Nous vous informons que votre commande <strong>#${order.orderNumber}</strong> a été minutieusement inspectée, repassée et scellée par notre Atelier. Votre colis a été remis aux services d'acheminement prioritaire.`,
    trackingLabel: "Numéro de suivi officiel :",
    destLabel: "Destination :",
    footerNote: "Vous pouvez suivre la progression de votre envoi à tout moment depuis votre espace client ou via le réseau postal Colissimo / DHL Express.",
    footer: "MAISON FOEG PARIS · 75010 PARIS · TOUS DROITS RÉSERVÉS",
  };

  return `
    <div style="font-family: 'Cormorant Garamond', Georgia, serif; background-color: #F8F7F4; color: #11141A; padding: 40px 20px; max-width: 620px; margin: 0 auto; border: 1px solid #E6E4DF;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="font-size: 26px; letter-spacing: 0.28em; text-transform: uppercase; margin: 0; font-weight: 300; color: #1B2A4A;">FOEG PARIS</h1>
        <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 9px; letter-spacing: 0.25em; text-transform: uppercase; color: #8A8D93; margin-top: 6px;">${texts.tag}</p>
      </div>
      <div style="background-color: #FFFFFF; padding: 36px; border: 1px solid #ECEAE5;">
        <h2 style="font-size: 21px; font-weight: 400; margin-top: 0; color: #1B2A4A;">${texts.title}</h2>
        <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; line-height: 1.65; color: #4B4D54;">
          ${texts.greeting}<br><br>
          ${texts.body}
        </p>
        <div style="margin: 28px 0; padding: 20px; background-color: #F9F8F6; border-left: 2px solid #1B2A4A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; line-height: 1.8;">
          <div><strong style="color: #1B2A4A;">${texts.trackingLabel}</strong></div>
          <div style="font-size: 16px; font-weight: 600; letter-spacing: 0.1em; color: #1B2A4A; margin: 6px 0;">${order.trackingNumber}</div>
          ${order.shippingAddress ? `<div style="margin-top: 6px; color: #6E7179;"><strong>${texts.destLabel}</strong> ${order.shippingAddress}</div>` : ''}
        </div>
        <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; color: #6E7179; line-height: 1.6;">
          ${texts.footerNote}
        </p>
      </div>
      <div style="text-align: center; margin-top: 28px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 10px; color: #8A8D93; letter-spacing: 0.15em;">
        ${texts.footer}
      </div>
    </div>
  `;
}

/**
 * Modèle 3: Bienvenue au Círculo Privado / Espace Privé FOEG
 */
export function getWelcomeEmailHtml(name: string, lang: 'fr' | 'es' | 'en' = 'fr') {
  const texts = {
    fr: {
      tag: 'Maison de Confection Française',
      title: 'Bienvenue dans le Cercle Privé',
      greeting: `Cher(e) ${name},`,
      p1: "C’est un privilège de vous accueillir au sein de la Maison FOEG Paris. Votre compte client est désormais actif et vous ouvre l'accès à vos commandes, adresses de livraison et à votre sélection de pièces favorites.",
      p2: "En tant que membre, vous bénéficiez également d'un accès privilégié à nos présentations de collections capsules et à notre service de conciergerie pour toute demande de retouche ou conseil de coupe.",
      btn: 'Découvrir les Collections',
      footer: 'MAISON FOEG PARIS · 75010 PARIS · TOUS DROITS RÉSERVÉS',
    },
    es: {
      tag: 'Maison de Confection Francesa',
      title: 'Bienvenido(a) al Círculo Privado',
      greeting: `Estimado(a) ${name},`,
      p1: 'Es un privilegio darle la bienvenida a Maison FOEG Paris. Su cuenta de cliente ya está activa y le brinda acceso a sus pedidos, direcciones y prendas favoritas.',
      p2: 'Como miembro, disfruta también de un acceso privilegiado a nuestras colecciones cápsula y a nuestro servicio de conserjería para asesoramiento de calce.',
      btn: 'Descubrir las Colecciones',
      footer: 'MAISON FOEG PARIS · 75010 PARÍS · TODOS LOS DERECHOS RESERVADOS',
    },
    en: {
      tag: 'French Fashion House',
      title: 'Welcome to the Private Circle',
      greeting: `Dear ${name},`,
      p1: 'It is a privilege to welcome you to Maison FOEG Paris. Your customer account is now active and gives you access to your orders, addresses, and wishlist.',
      p2: 'As a member, you also enjoy priority access to our capsule collections and our concierge service for tailoring advice.',
      btn: 'Discover the Collections',
      footer: 'MAISON FOEG PARIS · 75010 PARIS · ALL RIGHTS RESERVED',
    },
  }[lang] || {
    tag: 'Maison de Confection Française',
    title: 'Bienvenue dans le Cercle Privé',
    greeting: `Cher(e) ${name},`,
    p1: "C’est un privilège de vous accueillir au sein de la Maison FOEG Paris. Votre compte client est désormais actif et vous ouvre l'accès à vos commandes, adresses de livraison et à votre sélection de pièces favorites.",
    p2: "En tant que membre, vous bénéficiez également d'un accès privilégié à nos présentations de collections capsules et à notre service de conciergerie pour toute demande de retouche ou conseil de coupe.",
    btn: 'Découvrir les Collections',
    footer: 'MAISON FOEG PARIS · 75010 PARIS · TOUS DROITS RÉSERVÉS',
  };

  return `
    <div style="font-family: 'Cormorant Garamond', Georgia, serif; background-color: #F8F7F4; color: #11141A; padding: 40px 20px; max-width: 620px; margin: 0 auto; border: 1px solid #E6E4DF;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="font-size: 26px; letter-spacing: 0.28em; text-transform: uppercase; margin: 0; font-weight: 300; color: #1B2A4A;">FOEG PARIS</h1>
        <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 9px; letter-spacing: 0.25em; text-transform: uppercase; color: #8A8D93; margin-top: 6px;">${texts.tag}</p>
      </div>
      <div style="background-color: #FFFFFF; padding: 36px; border: 1px solid #ECEAE5;">
        <h2 style="font-size: 22px; font-weight: 400; margin-top: 0; color: #1B2A4A;">${texts.title}</h2>
        <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; line-height: 1.7; color: #4B4D54;">
          ${texts.greeting}<br><br>
          ${texts.p1}
        </p>
        <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; line-height: 1.7; color: #4B4D54;">
          ${texts.p2}
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${APP_URL}/colecciones" style="display: inline-block; background-color: #1B2A4A; color: #FFFFFF; text-decoration: none; padding: 14px 28px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; font-weight: 500;">
            ${texts.btn}
          </a>
        </div>
      </div>
      <div style="text-align: center; margin-top: 28px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 10px; color: #8A8D93; letter-spacing: 0.15em;">
        ${texts.footer}
      </div>
    </div>
  `;
}

/**
 * Modèle 4: Diffusion de Campagne Newsletter Haute Couture
 */
export function getNewsletterBroadcastEmailHtml(campaign: {
  subject: string;
  previewText?: string;
  content: string;
  ctaText?: string;
  ctaUrl?: string;
}) {
  const ctaLink = campaign.ctaUrl ? (campaign.ctaUrl.startsWith('http') ? campaign.ctaUrl : `${APP_URL}${campaign.ctaUrl}`) : `${APP_URL}/colecciones`;
  const paragraphs = campaign.content.split('\n\n').filter((p) => p.trim());

  return `
    <div style="font-family: 'Cormorant Garamond', Georgia, serif; background-color: #F8F7F4; color: #11141A; padding: 40px 20px; max-width: 620px; margin: 0 auto; border: 1px solid #E6E4DF;">
      ${campaign.previewText ? `<div style="display: none; font-size: 1px; color: #F8F7F4; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">${campaign.previewText}</div>` : ''}
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="font-size: 26px; letter-spacing: 0.28em; text-transform: uppercase; margin: 0; font-weight: 300; color: #1B2A4A;">FOEG PARIS</h1>
        <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 9px; letter-spacing: 0.25em; text-transform: uppercase; color: #8A8D93; margin-top: 6px;">Correspondance Exclusives · Atelier Paris</p>
      </div>
      <div style="background-color: #FFFFFF; padding: 38px 34px; border: 1px solid #ECEAE5;">
        <h2 style="font-size: 22px; font-weight: 400; margin-top: 0; color: #1B2A4A; text-align: center; letter-spacing: 0.05em; line-height: 1.4;">${campaign.subject}</h2>
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; line-height: 1.8; color: #4B4D54; margin: 24px 0;">
          ${paragraphs.map((p) => `<p style="margin-bottom: 16px;">${p.replace(/\n/g, '<br>')}</p>`).join('')}
        </div>
        ${campaign.ctaText ? `
          <div style="text-align: center; margin-top: 36px;">
            <a href="${ctaLink}" style="display: inline-block; background-color: #1B2A4A; color: #FFFFFF; text-decoration: none; padding: 14px 32px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; font-weight: 500;">
              ${campaign.ctaText}
            </a>
          </div>
        ` : ''}
      </div>
      <div style="text-align: center; margin-top: 28px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 10px; color: #8A8D93; letter-spacing: 0.15em;">
        MAISON FOEG PARIS · 75010 PARIS · <a href="${APP_URL}" style="color: #8A8D93; text-decoration: underline;">Se désinscrire</a>
      </div>
    </div>
  `;
}
