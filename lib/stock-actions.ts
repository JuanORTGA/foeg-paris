'use server';

import { prisma } from '@/lib/db';

export async function createStockAlert(email: string, productName: string, size?: string) {
  try {
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Veuillez saisir une adresse courriel valide.' };
    }

    // Enregistrer une notification dans la table Notification
    await prisma.notification.create({
      data: {
        title: `Demande de réassort : ${productName}`,
        message: `Le client ${email} souhaite être prévenu du retour en stock (${size ? `Taille ${size}` : 'Toutes tailles'}).`,
        type: 'product',
        link: '/admin/productos',
      },
    });

    return {
      success: true,
      message: 'Merci. Votre demande de réassort a été enregistrée à la Conciergerie de l’Atelier.',
    };
  } catch (err: any) {
    console.error('[STOCK ALERT ERROR]:', err);
    return {
      success: false,
      error: 'Erreur lors de l’enregistrement de votre alerte de stock.',
    };
  }
}
