'use server';

import { prisma } from '@/lib/db';
import { createNotification } from '@/lib/notifications';
import { sendEmail } from '@/lib/mail';
import { getGlobalSettings } from '@/lib/settings-actions';

export interface ConciergeTicketPayload {
  name: string;
  email: string;
  phone?: string;
  topic: 'SIZING' | 'FABRICS' | 'APPOINTMENT' | 'ORDER_TRACKING' | 'OTHER';
  message: string;
}

const TOPIC_LABELS: Record<string, { fr: string; es: string; en: string }> = {
  SIZING: {
    fr: 'Conseil de coupe & tailles',
    es: 'Asesoría de tallas y medidas',
    en: 'Fit & sizing advice',
  },
  FABRICS: {
    fr: 'Matières nobles & entretien',
    es: 'Tejidos nobles y cuidados',
    en: 'Noble fabrics & garment care',
  },
  APPOINTMENT: {
    fr: 'Rendez-vous à l’Atelier Paris',
    es: 'Cita privada en el Taller de París',
    en: 'Private appointment at Paris Atelier',
  },
  ORDER_TRACKING: {
    fr: 'Suivi de commande en cours',
    es: 'Seguimiento de pedido en curso',
    en: 'Order tracking & concierge',
  },
  OTHER: {
    fr: 'Demande sur-mesure / Autre',
    es: 'Consulta a medida / Otra',
    en: 'Bespoke request / Other',
  },
};

/**
 * Enregistre une demande de conciergerie et avertit immédiatement l'Atelier
 */
export async function submitConciergeTicket(payload: ConciergeTicketPayload) {
  try {
    const name = payload.name.trim();
    const email = payload.email.trim().toLowerCase();
    const message = payload.message.trim();

    if (!name || !email || !message) {
      return { success: false, error: 'Veuillez renseigner votre nom, email et votre message.' };
    }

    const topicLabel = TOPIC_LABELS[payload.topic]?.fr || 'Demande générale';
    const settings = await getGlobalSettings();
    const conciergeEmail = settings.contact_email || 'concierge@foeg-paris.com';

    // 1. Notification en temps réel dans le panneau d'administration
    try {
      await createNotification({
        title: 'Nouvelle Demande de Conciergerie',
        message: `${name} (${email}) sollicite l'Atelier pour : "${topicLabel}".`,
        type: 'info',
        link: '/admin/ajustes',
      });
    } catch (notifErr) {
      console.warn('[CONCIERGE NOTIF ERROR]:', notifErr);
    }

    // 2. Envoi du courriel officiel à la boîte de réception de la Conciergerie
    try {
      await sendEmail({
        to: conciergeEmail,
        subject: `[CONCIERGERIE FOEG] Demande de ${name} (${topicLabel})`,
        text: `Nouvelle demande d'assistance privée reçue depuis la boutique en ligne :\n\nClient : ${name}\nCourriel : ${email}\nTéléphone : ${payload.phone || 'Non renseigné'}\nSujet : ${topicLabel}\n\nMessage :\n${message}`,
      });
    } catch (emailErr) {
      console.warn('[CONCIERGE EMAIL ERROR]:', emailErr);
    }

    return {
      success: true,
      message: 'Votre message a été transmis à la Conciergerie privée. Un conseiller de l’Atelier vous répondra sous 24h.',
    };
  } catch (error: any) {
    console.error('[SUBMIT CONCIERGE TICKET ERROR]:', error);
    return { success: false, error: error?.message || 'Erreur lors de la transmission de votre message.' };
  }
}
