'use server';

import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export interface ClientData {
  id?: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN';
  password?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

export async function createClient(data: ClientData) {
  try {
    const normalizedEmail = data.email.trim().toLowerCase();
    if (!normalizedEmail) {
      return { success: false, error: 'Email requis' };
    }

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return { success: false, error: 'Un compte existe déjà avec cette adresse email.' };
    }

    const rawPassword = data.password && data.password.trim() ? data.password.trim() : 'foeg2026';
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const newUser = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: data.role || 'CUSTOMER',
      },
    });

    // Enregistrer adresse si fournie
    if (data.address || data.city || data.phone || data.country) {
      await prisma.address.create({
        data: {
          userId: newUser.id,
          firstName: data.name.split(' ')[0] || data.name,
          lastName: data.name.split(' ').slice(1).join(' ') || 'FOEG',
          address: data.address?.trim() || 'Rue du Faubourg Saint-Honoré',
          city: data.city?.trim() || 'Paris',
          postalCode: data.postalCode?.trim() || '75008',
          country: data.country?.trim() || 'FR',
          phone: data.phone?.trim() || null,
          isDefault: true,
        },
      });
    }

    // Rattacher automatiquement les commandes passées sous ce même email
    await prisma.order.updateMany({
      where: { email: normalizedEmail },
      data: { userId: newUser.id },
    });

    revalidatePath('/admin/clientes');
    return { success: true, client: newUser };
  } catch (error: any) {
    console.error('[CREATE CLIENT ERROR]:', error);
    return { success: false, error: error.message || 'Erreur lors de la création du client' };
  }
}

export async function updateClient(id: string, data: Partial<ClientData>) {
  try {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      // Si c'est un client invité (non encore enregistré en User), le créer
      if (id.startsWith('guest-')) {
        return await createClient({
          name: data.name || 'Client',
          email: data.email || id.replace('guest-', ''),
          role: data.role || 'CUSTOMER',
          password: data.password,
          phone: data.phone,
          address: data.address,
          city: data.city,
          postalCode: data.postalCode,
          country: data.country,
        });
      }
      return { success: false, error: 'Client introuvable' };
    }

    const updatePayload: any = {};
    if (data.name) updatePayload.name = data.name.trim();
    if (data.email) updatePayload.email = data.email.trim().toLowerCase();
    if (data.role) updatePayload.role = data.role;
    if (data.password && data.password.trim().length >= 6) {
      updatePayload.password = await bcrypt.hash(data.password.trim(), 10);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updatePayload,
    });

    // Mettre à jour ou créer l'adresse par défaut
    if (data.phone || data.address || data.city || data.country) {
      const defaultAddr = await prisma.address.findFirst({
        where: { userId: id, isDefault: true },
      });

      if (defaultAddr) {
        await prisma.address.update({
          where: { id: defaultAddr.id },
          data: {
            phone: data.phone !== undefined ? data.phone.trim() : defaultAddr.phone,
            address: data.address !== undefined ? data.address.trim() : defaultAddr.address,
            city: data.city !== undefined ? data.city.trim() : defaultAddr.city,
            postalCode: data.postalCode !== undefined ? data.postalCode.trim() : defaultAddr.postalCode,
            country: data.country !== undefined ? data.country.trim() : defaultAddr.country,
          },
        });
      } else {
        await prisma.address.create({
          data: {
            userId: id,
            firstName: updated.name ? updated.name.split(' ')[0] : 'Client',
            lastName: updated.name ? updated.name.split(' ').slice(1).join(' ') : 'FOEG',
            address: data.address?.trim() || 'Rue du Faubourg Saint-Honoré',
            city: data.city?.trim() || 'Paris',
            postalCode: data.postalCode?.trim() || '75008',
            country: data.country?.trim() || 'FR',
            phone: data.phone?.trim() || null,
            isDefault: true,
          },
        });
      }
    }

    revalidatePath('/admin/clientes');
    return { success: true, client: updated };
  } catch (error: any) {
    console.error('[UPDATE CLIENT ERROR]:', error);
    return { success: false, error: error.message || 'Erreur lors de la mise à jour' };
  }
}

export async function deleteClient(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { orders: true },
    });

    if (!user) {
      return { success: false, error: 'Compte client introuvable' };
    }

    // Protection compte Direction FOEG
    if (user.email === 'admin@foeg-paris.com') {
      return {
        success: false,
        error: 'Impossible de supprimer le compte maître Direction FOEG Paris.',
      };
    }

    // 1. Détacher les commandes pour préserver la comptabilité et factures fiscales
    await prisma.order.updateMany({
      where: { userId: id },
      data: { userId: null },
    });

    // 2. Supprimer les adresses, avis et wishlists
    await prisma.address.deleteMany({ where: { userId: id } });
    await prisma.wishlist.deleteMany({ where: { userId: id } });
    await prisma.review.deleteMany({ where: { userId: id } });

    // 3. Supprimer l'utilisateur
    await prisma.user.delete({ where: { id } });

    revalidatePath('/admin/clientes');
    return { success: true };
  } catch (error: any) {
    console.error('[DELETE CLIENT ERROR]:', error);
    return { success: false, error: error.message || 'Erreur lors de la suppression' };
  }
}

export async function getClientDossier(emailOrUserId: string) {
  try {
    const isUserId = !emailOrUserId.includes('@') && !emailOrUserId.startsWith('guest-');
    let user = null;

    if (isUserId) {
      user = await prisma.user.findUnique({
        where: { id: emailOrUserId },
        include: {
          addresses: true,
        },
      });
    } else {
      const email = emailOrUserId.replace('guest-', '').toLowerCase().trim();
      user = await prisma.user.findUnique({
        where: { email },
        include: {
          addresses: true,
        },
      });
    }

    const email = user?.email || emailOrUserId.replace('guest-', '').toLowerCase().trim();

    // Récupérer toutes les commandes rattachées par userId ou email
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          ...(user ? [{ userId: user.id }] : []),
          { email: email },
        ],
      },
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      user,
      orders,
      defaultAddress: user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0] || null,
    };
  } catch (error: any) {
    console.error('[GET CLIENT DOSSIER ERROR]:', error);
    return { success: false, error: error.message };
  }
}
