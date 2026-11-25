'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { createNotification } from '@/lib/notifications';
import { sendEmail, getNewsletterBroadcastEmailHtml, getWelcomeEmailHtml } from '@/lib/mail';

export interface NewsletterSubscriberItem {
  id: string;
  email: string;
  source: string;
  status: 'ACTIVE' | 'PAUSED' | 'UNSUBSCRIBED';
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface NewsletterCampaignItem {
  id: string;
  subject: string;
  targetAudience: 'ALL' | 'VIP' | 'WEB' | 'BOUTIQUE';
  previewText?: string;
  content: string;
  ctaText?: string;
  ctaUrl?: string;
  sentAt: string;
  recipientCount: number;
  status: 'SENT' | 'DRAFT';
}

const NEWSLETTER_STORAGE_KEY = 'site_newsletter_subscribers';
const NEWSLETTER_CAMPAIGNS_KEY = 'site_newsletter_campaigns';

const INITIAL_DEMO_SUBSCRIBERS: NewsletterSubscriberItem[] = [
  {
    id: 'sub-001',
    email: 'claire.delatour@paris.fr',
    source: 'Cercle Privé VIP',
    status: 'ACTIVE',
    notes: 'Cliente VIP invitada a la presentación privada de invierno.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'sub-002',
    email: 'alexandre.rochefort@art-paris.com',
    source: 'Pied de page (Footer)',
    status: 'ACTIVE',
    notes: 'Suscrito desde la tienda online.',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'sub-003',
    email: 'sybille.hapsburg@vienne.at',
    source: 'Hero Accueil',
    status: 'ACTIVE',
    notes: 'Interesada en piezas exclusivas de cashmere.',
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
  },
];

const INITIAL_DEMO_CAMPAIGNS: NewsletterCampaignItem[] = [
  {
    id: 'camp-001',
    subject: 'Aperçu Exclusif · Nouvelle Collection Automne-Hiver Maison FOEG',
    targetAudience: 'VIP',
    previewText: 'Invitation privée pour les membres du Cercle FOEG...',
    content: `Chers membres du Cercle Privé FOEG,\n\nNous avons l’insigne honneur de vous dévoiler les premières pièces de notre nouvelle garde-robe capsule façonnée au cœur de notre Atelier parisien.\n\nChaque silhouette a été pensée pour allier la rigueur architecturale des coupes tailleur à la douceur intemporelle des soies et cachemires les plus nobles.\n\nVotre accès privilégié est ouvert dès aujourd’hui avant le lancement public officiel.`,
    ctaText: 'Découvrir la Collection Privée',
    ctaUrl: '/colecciones',
    sentAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    recipientCount: 1,
    status: 'SENT',
  },
];

/**
 * Récupère tous les abonnés newsletter enregistrés dans Neon
 */
export async function getNewsletterSubscribers(): Promise<NewsletterSubscriberItem[]> {
  try {
    const record = await prisma.siteContent.findUnique({
      where: { key: NEWSLETTER_STORAGE_KEY },
    });

    if (record?.valueFr) {
      const parsed = JSON.parse(record.valueFr);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item: any) => ({
          id: item.id || `sub_${Math.random()}`,
          email: item.email || '',
          source: item.source || 'Pied de page',
          status: item.status || 'ACTIVE',
          notes: item.notes || '',
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt,
        }));
      }
    }
  } catch (err) {
    console.warn('[GET NEWSLETTER SUBSCRIBERS ERROR]:', err);
  }

  return INITIAL_DEMO_SUBSCRIBERS;
}

/**
 * Inscription client depuis la boutique publique (Footer / Hero / Modal)
 */
export async function subscribeNewsletter(
  email: string,
  source: string = 'Pied de page'
): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const trimmed = (email || '').toLowerCase().trim();
    if (!trimmed || !trimmed.includes('@')) {
      return { success: false, error: 'Veuillez saisir une adresse courriel valide.' };
    }

    const current = await getNewsletterSubscribers();
    const existingIndex = current.findIndex((s) => s.email.toLowerCase() === trimmed);

    if (existingIndex >= 0) {
      // Si ya estaba en la lista pero pausado o desuscrito, reactivar
      if (current[existingIndex].status !== 'ACTIVE') {
        current[existingIndex].status = 'ACTIVE';
        current[existingIndex].updatedAt = new Date().toISOString();
        await saveSubscribersToDb(current);
      }
      return {
        success: true,
        message: 'Vous êtes déjà inscrit(e) aux communications exclusives de la Maison FOEG.',
      };
    }

    const newSub: NewsletterSubscriberItem = {
      id: `sub_${Date.now()}`,
      email: trimmed,
      source: source || 'Pied de page',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };

    const updated = [newSub, ...current];
    await saveSubscribersToDb(updated);

    // Insertion dans la table Prisma NewsletterSubscriber
    try {
      await (prisma as any).newsletterSubscriber.upsert({
        where: { email: trimmed },
        create: {
          email: trimmed,
          source: source || 'Cercle Privé VIP',
          status: 'ACTIVE',
        },
        update: {
          source: source || 'Cercle Privé VIP',
          status: 'ACTIVE',
        },
      });
    } catch (dbErr) {
      console.warn('[NEWSLETTER PRISMA TABLE UPSERT NOTE]:', dbErr);
    }

    // Envoi de confirmation d'abonnement au nouveau membre
    try {
      await sendEmail({
        to: trimmed,
        subject: 'Maison FOEG Paris — Confirmation de votre adhésion aux correspondances',
        html: getWelcomeEmailHtml('Membre Privilège'),
        text: `Nous vous remercions pour votre inscription aux correspondances exclusives de la Maison FOEG Paris.`,
      });
    } catch (_) {}

    // Déclencher notification en temps réel pour l'administrateur
    try {
      await createNotification({
        title: 'Nouvelle Inscription Newsletter',
        message: `${trimmed} s'est inscrit(e) aux communications exclusives FOEG (${source}).`,
        type: 'info',
        link: '/admin/newsletter',
      });
    } catch (notifErr) {
      console.warn('[NOTIF NEWSLETTER ERROR]:', notifErr);
    }

    try {
      revalidatePath('/admin/newsletter');
    } catch {}
    return {
      success: true,
      message: 'Bienvenue au Cercle Privé FOEG. Votre inscription a été enregistrée.',
    };
  } catch (err: any) {
    console.error('[SUBSCRIBE NEWSLETTER ERROR]:', err);
    return { success: false, error: 'Une erreur est survenue lors de l’inscription.' };
  }
}

/**
 * Ajout manuel d'un abonné par l'administrateur (CREATE)
 */
export async function addAdminSubscriber(data: {
  email: string;
  source: string;
  status?: 'ACTIVE' | 'PAUSED' | 'UNSUBSCRIBED';
  notes?: string;
}): Promise<{ success: boolean; error?: string; subscriber?: NewsletterSubscriberItem }> {
  try {
    const trimmed = (data.email || '').toLowerCase().trim();
    if (!trimmed || !trimmed.includes('@')) {
      return { success: false, error: 'Veuillez renseigner un email valide.' };
    }

    const current = await getNewsletterSubscribers();
    if (current.some((s) => s.email.toLowerCase() === trimmed)) {
      return { success: false, error: 'Cette adresse courriel est déjà inscrite.' };
    }

    const newSub: NewsletterSubscriberItem = {
      id: `sub_${Date.now()}`,
      email: trimmed,
      source: data.source || 'Atelier Privé',
      status: data.status || 'ACTIVE',
      notes: data.notes?.trim() || '',
      createdAt: new Date().toISOString(),
    };

    const updated = [newSub, ...current];
    await saveSubscribersToDb(updated);

    try {
      revalidatePath('/admin/newsletter');
    } catch {}
    return { success: true, subscriber: newSub };
  } catch (err: any) {
    console.error('[ADD ADMIN SUBSCRIBER ERROR]:', err);
    return { success: false, error: err.message || 'Erreur lors de la création de l’abonné.' };
  }
}

/**
 * Modification d'un abonné par l'administrateur (UPDATE)
 */
export async function updateAdminSubscriber(
  id: string,
  data: {
    email: string;
    source: string;
    status: 'ACTIVE' | 'PAUSED' | 'UNSUBSCRIBED';
    notes?: string;
  }
): Promise<{ success: boolean; error?: string; subscriber?: NewsletterSubscriberItem }> {
  try {
    const trimmed = (data.email || '').toLowerCase().trim();
    if (!trimmed || !trimmed.includes('@')) {
      return { success: false, error: 'Veuillez renseigner un email valide.' };
    }

    const current = await getNewsletterSubscribers();
    const index = current.findIndex((s) => s.id === id);

    if (index === 0 && current[index].email.toLowerCase() !== trimmed) {
      if (current.some((s, idx) => idx !== index && s.email.toLowerCase() === trimmed)) {
        return { success: false, error: 'Cet email est déjà attribué à un autre abonné.' };
      }
    }

    if (index === -1) {
      return { success: false, error: 'Abonné introuvable.' };
    }

    const updatedSub: NewsletterSubscriberItem = {
      ...current[index],
      email: trimmed,
      source: data.source,
      status: data.status,
      notes: data.notes?.trim() || '',
      updatedAt: new Date().toISOString(),
    };

    current[index] = updatedSub;
    await saveSubscribersToDb(current);

    try {
      revalidatePath('/admin/newsletter');
    } catch {}
    return { success: true, subscriber: updatedSub };
  } catch (err: any) {
    console.error('[UPDATE ADMIN SUBSCRIBER ERROR]:', err);
    return { success: false, error: err.message || 'Erreur lors de la mise à jour.' };
  }
}

/**
 * Suppression d'un abonné (DELETE)
 */
export async function deleteNewsletterSubscriber(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const current = await getNewsletterSubscribers();
    const filtered = current.filter((s) => s.id !== id);
    await saveSubscribersToDb(filtered);

    try {
      revalidatePath('/admin/newsletter');
    } catch {}
    return { success: true };
  } catch (err: any) {
    console.error('[DELETE NEWSLETTER SUBSCRIBER ERROR]:', err);
    return { success: false, error: 'Impossible de supprimer cet abonné.' };
  }
}

/**
 * Récupère l'historique des campagnes envoyées
 */
export async function getNewsletterCampaigns(): Promise<NewsletterCampaignItem[]> {
  try {
    const record = await prisma.siteContent.findUnique({
      where: { key: NEWSLETTER_CAMPAIGNS_KEY },
    });

    if (record?.valueFr) {
      const parsed = JSON.parse(record.valueFr);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[GET NEWSLETTER CAMPAIGNS ERROR]:', err);
  }

  return INITIAL_DEMO_CAMPAIGNS;
}

/**
 * Envoi d'un communiqué / campagne de newsletter
 */
export async function sendNewsletterCampaign(data: {
  subject: string;
  targetAudience: 'ALL' | 'VIP' | 'WEB' | 'BOUTIQUE';
  previewText?: string;
  content: string;
  ctaText?: string;
  ctaUrl?: string;
}): Promise<{ success: boolean; error?: string; campaign?: NewsletterCampaignItem }> {
  try {
    if (!data.subject.trim() || !data.content.trim()) {
      return { success: false, error: 'L’objet et le contenu du communiqué sont obligatoires.' };
    }

    const subscribers = await getNewsletterSubscribers();
    let eligible = subscribers.filter((s) => s.status === 'ACTIVE');

    if (data.targetAudience === 'VIP') {
      eligible = eligible.filter((s) => s.source.toLowerCase().includes('vip') || s.source.toLowerCase().includes('cercle'));
    } else if (data.targetAudience === 'WEB') {
      eligible = eligible.filter((s) => s.source.toLowerCase().includes('pied') || s.source.toLowerCase().includes('footer') || s.source.toLowerCase().includes('hero'));
    } else if (data.targetAudience === 'BOUTIQUE') {
      eligible = eligible.filter((s) => s.source.toLowerCase().includes('boutique') || s.source.toLowerCase().includes('atelier'));
    }

    const newCampaign: NewsletterCampaignItem = {
      id: `camp_${Date.now()}`,
      subject: data.subject.trim(),
      targetAudience: data.targetAudience,
      previewText: data.previewText?.trim() || '',
      content: data.content.trim(),
      ctaText: data.ctaText?.trim() || '',
      ctaUrl: data.ctaUrl?.trim() || '',
      sentAt: new Date().toISOString(),
      recipientCount: eligible.length > 0 ? eligible.length : 1,
      status: 'SENT',
    };

    const currentCampaigns = await getNewsletterCampaigns();
    const updatedCampaigns = [newCampaign, ...currentCampaigns];
    await saveCampaignsToDb(updatedCampaigns);

    // Diffusion réelle des courriels Haute Couture aux abonnés
    try {
      const emailHtml = getNewsletterBroadcastEmailHtml({
        subject: newCampaign.subject,
        previewText: newCampaign.previewText,
        content: newCampaign.content,
        ctaText: newCampaign.ctaText,
        ctaUrl: newCampaign.ctaUrl,
      });

      const recipientEmails = eligible.length > 0 ? eligible.map((s) => s.email) : ['cercle.prive@foeg-paris.com'];
      await sendEmail({
        to: recipientEmails,
        subject: `FOEG Paris — ${newCampaign.subject}`,
        html: emailHtml,
        text: `${newCampaign.subject}\n\n${newCampaign.content}`,
      });
    } catch (sendErr) {
      console.warn('[CAMPAIGN EMAIL DISPATCH WARNING]:', sendErr);
    }

    // Déclencher notification
    try {
      await createNotification({
        title: 'Campagne Newsletter Envoyée',
        message: `La campagne "${newCampaign.subject}" a été transmise avec succès à ${newCampaign.recipientCount} destinataire(s).`,
        type: 'info',
        link: '/admin/newsletter',
      });
    } catch (notifErr) {
      console.warn('[NOTIF CAMPAIGN ERROR]:', notifErr);
    }

    try {
      revalidatePath('/admin/newsletter');
    } catch {}
    return { success: true, campaign: newCampaign };
  } catch (err: any) {
    console.error('[SEND NEWSLETTER CAMPAIGN ERROR]:', err);
    return { success: false, error: err.message || 'Erreur lors de l’envoi de la campagne.' };
  }
}

/**
 * Supprime une campagne de l'historique
 */
export async function deleteNewsletterCampaign(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const current = await getNewsletterCampaigns();
    const filtered = current.filter((c) => c.id !== id);
    await saveCampaignsToDb(filtered);

    try {
      revalidatePath('/admin/newsletter');
    } catch {}
    return { success: true };
  } catch (err: any) {
    console.error('[DELETE NEWSLETTER CAMPAIGN ERROR]:', err);
    return { success: false, error: 'Impossible de supprimer cette campagne.' };
  }
}

// Helpers internes de persistance Neon
async function saveSubscribersToDb(subscribers: NewsletterSubscriberItem[]) {
  const serialized = JSON.stringify(subscribers);
  await prisma.siteContent.upsert({
    where: { key: NEWSLETTER_STORAGE_KEY },
    create: {
      key: NEWSLETTER_STORAGE_KEY,
      section: 'newsletter',
      valueFr: serialized,
      valueEn: serialized,
      valueEs: serialized,
    },
    update: {
      valueFr: serialized,
      valueEn: serialized,
      valueEs: serialized,
    },
  });
}

async function saveCampaignsToDb(campaigns: NewsletterCampaignItem[]) {
  const serialized = JSON.stringify(campaigns);
  await prisma.siteContent.upsert({
    where: { key: NEWSLETTER_CAMPAIGNS_KEY },
    create: {
      key: NEWSLETTER_CAMPAIGNS_KEY,
      section: 'newsletter',
      valueFr: serialized,
      valueEn: serialized,
      valueEs: serialized,
    },
    update: {
      valueFr: serialized,
      valueEn: serialized,
      valueEs: serialized,
    },
  });
}

// Alias officiel
export const subscribeToNewsletter = subscribeNewsletter;

