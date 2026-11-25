'use server';

import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { sendEmail, getWelcomeEmailHtml } from '@/lib/mail';

export interface RegisterResult {
  success: boolean;
  error?: string;
}

export async function registerUser(formData: {
  name: string;
  email: string;
  password: string;
}): Promise<RegisterResult> {
  try {
    const { name, email, password } = formData;

    if (!email || !password) {
      return { success: false, error: 'Veuillez renseigner votre adresse courriel et votre mot de passe.' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Le mot de passe doit comporter au moins 6 caractères.' };
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Vérifier si un compte existe déjà
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return { success: false, error: 'Un compte existe déjà avec cette adresse courriel.' };
    }

    // Hasher le mot de passe de manière sécurisée
    const hashedPassword = await bcrypt.hash(password, 10);

    // Enregistrer le nouveau client avec le rôle CUSTOMER par défaut
    await prisma.user.create({
      data: {
        name: name.trim() || undefined,
        email: normalizedEmail,
        password: hashedPassword,
        role: 'CUSTOMER',
      },
    });

    // Envoi du courriel de bienvenue officiel Haute Couture
    try {
      await sendEmail({
        to: normalizedEmail,
        subject: 'Maison FOEG Paris — Bienvenue dans votre Espace Privé',
        html: getWelcomeEmailHtml(name.trim() || 'Cher(e) Membre'),
        text: `C'est un honneur de vous accueillir au sein de la Maison FOEG Paris. Votre compte client est désormais actif.`,
      });
    } catch (_) {}

    return { success: true };
  } catch (error: any) {
    console.error('Erreur lors de l’inscription:', error);
    return { success: false, error: 'Une erreur est survenue lors de la création de votre compte. Veuillez réessayer.' };
  }
}

// -------------------------------------------------------------
// TAREA 3: MI PERFIL (Actualizar nombre y contraseña)
// -------------------------------------------------------------
export async function updateUserProfile(data: {
  name?: string;
  currentPassword?: string;
  newPassword?: string;
}): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id && !session?.user?.email) {
      return { success: false, error: 'Session non authentifiée. Veuillez vous reconnecter.' };
    }

    const userEmail = session.user.email?.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return { success: false, error: 'Utilisateur introuvable.' };
    }

    const updateData: any = {};

    if (data.name && data.name.trim()) {
      updateData.name = data.name.trim();
    }

    if (data.newPassword && data.newPassword.trim()) {
      if (data.newPassword.length < 6) {
        return { success: false, error: 'Le nouveau mot de passe doit comporter au moins 6 caractères.' };
      }

      if (!data.currentPassword) {
        return { success: false, error: 'Veuillez renseigner votre mot de passe actuel.' };
      }

      const isCurrentValid = await bcrypt.compare(data.currentPassword, user.password);
      if (!isCurrentValid) {
        return { success: false, error: 'Le mot de passe actuel est incorrect.' };
      }

      updateData.password = await bcrypt.hash(data.newPassword, 10);
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });
    }

    revalidatePath('/cuenta');
    return { success: true, message: 'Vos informations personnelles ont été mises à jour avec succès.' };
  } catch (error: any) {
    console.error('[UPDATE PROFILE ERROR]:', error);
    return { success: false, error: 'Erreur lors de la mise à jour du profil.' };
  }
}

// -------------------------------------------------------------
// TAREA 5: FOTO DE PERFIL DEL CLIENTE
// -------------------------------------------------------------
export async function updateUserAvatar(avatarUrl: string): Promise<{ success: boolean; error?: string; url?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.email && !session?.user?.id) {
      return { success: false, error: 'Session non authentifiée.' };
    }
    const email = session.user.email?.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { success: false, error: 'Utilisateur introuvable.' };

    await prisma.setting.upsert({
      where: { key: `user_avatar_${user.id}` },
      update: { value: avatarUrl },
      create: { key: `user_avatar_${user.id}`, value: avatarUrl },
    });

    revalidatePath('/cuenta');
    revalidatePath('/cuenta/perfil');
    return { success: true, url: avatarUrl };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Erreur avatar' };
  }
}

export async function getUserAvatar(userId?: string): Promise<string | null> {
  if (!userId) return null;
  try {
    const s = await prisma.setting.findUnique({
      where: { key: `user_avatar_${userId}` },
    });
    return s?.value || null;
  } catch (_) {
    return null;
  }
}

// -------------------------------------------------------------
// TAREA 3: MIS DIRECCIONES (CRUD de direcciones de envío)
// -------------------------------------------------------------
export interface CustomerAddress {
  id: string;
  title: string;
  recipient: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
}

export async function getUserAddresses(): Promise<CustomerAddress[]> {
  try {
    const session = await auth();
    if (!session?.user?.id && !session?.user?.email) return [];

    const userId = session.user.id;

    // 1. Intento preferente con la tabla relacional Address
    if (userId) {
      try {
        const dbAddrs = await (prisma as any).address?.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
        });

        if (Array.isArray(dbAddrs) && dbAddrs.length > 0) {
          return dbAddrs.map((a: any) => ({
            id: a.id,
            title: a.isDefault ? 'Domicile (Défaut)' : 'Domicile',
            recipient: `${a.firstName || ''} ${a.lastName || ''}`.trim() || 'Client FOEG',
            street: a.address,
            city: a.city,
            postalCode: a.postalCode,
            country: a.country || 'France',
            isDefault: a.isDefault || false,
            createdAt: a.createdAt?.toISOString?.() || new Date().toISOString(),
          }));
        }
      } catch (_) {}
    }

    // 2. Fallback de compatibilité immédiate
    const key = `user_addresses_${session.user.id || session.user.email}`;
    const record = await prisma.siteContent.findUnique({
      where: { key },
    });

    if (record?.valueFr) {
      return JSON.parse(record.valueFr);
    }

    return [];
  } catch (err) {
    console.warn('[GET USER ADDRESSES ERROR]:', err);
    return [];
  }
}

export async function saveUserAddress(address: {
  id?: string;
  title: string;
  recipient: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}): Promise<{ success: boolean; error?: string; addresses?: CustomerAddress[] }> {
  try {
    const session = await auth();
    if (!session?.user?.id && !session?.user?.email) {
      return { success: false, error: 'Session non authentifiée.' };
    }

    const currentAddresses = await getUserAddresses();
    const isFirst = currentAddresses.length === 0;

    let updatedAddresses: CustomerAddress[] = [];

    if (address.id) {
      // Édition
      updatedAddresses = currentAddresses.map((addr) => {
        if (addr.id === address.id) {
          return {
            ...addr,
            title: address.title || 'Domicile',
            recipient: address.recipient,
            street: address.street,
            city: address.city,
            postalCode: address.postalCode,
            country: address.country || 'France',
            isDefault: address.isDefault ? true : addr.isDefault,
          };
        }
        return address.isDefault ? { ...addr, isDefault: false } : addr;
      });
    } else {
      // Nouvelle adresse
      const newAddr: CustomerAddress = {
        id: `addr_${Date.now()}`,
        title: address.title || 'Domicile',
        recipient: address.recipient,
        street: address.street,
        city: address.city,
        postalCode: address.postalCode,
        country: address.country || 'France',
        isDefault: address.isDefault || isFirst,
        createdAt: new Date().toISOString(),
      };

      updatedAddresses = address.isDefault
        ? currentAddresses.map((a) => ({ ...a, isDefault: false })).concat(newAddr)
        : [...currentAddresses, newAddr];
    }

    // Persistance dans la table relacional Address si disponible
    if (session.user?.id) {
      try {
        const parts = (address.recipient || '').trim().split(' ');
        const firstName = parts[0] || 'Client';
        const lastName = parts.slice(1).join(' ') || 'FOEG';

        if (address.id && !address.id.startsWith('addr_')) {
          await (prisma as any).address?.update({
            where: { id: address.id },
            data: {
              firstName,
              lastName,
              address: address.street,
              city: address.city,
              postalCode: address.postalCode,
              country: address.country || 'France',
              isDefault: !!address.isDefault,
            },
          });
        } else {
          await (prisma as any).address?.create({
            data: {
              userId: session.user.id,
              firstName,
              lastName,
              address: address.street,
              city: address.city,
              postalCode: address.postalCode,
              country: address.country || 'France',
              isDefault: !!address.isDefault,
            },
          });
        }
      } catch (_) {}
    }

    const key = `user_addresses_${session.user.id || session.user.email}`;
    const serialized = JSON.stringify(updatedAddresses);

    await prisma.siteContent.upsert({
      where: { key },
      create: {
        key,
        section: 'user_addresses',
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

    revalidatePath('/cuenta');
    return { success: true, addresses: updatedAddresses };
  } catch (err: any) {
    console.error('[SAVE ADDRESS ERROR]:', err);
    return { success: false, error: 'Impossible d’enregistrer l’adresse.' };
  }
}

export async function deleteUserAddress(addressId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id && !session?.user?.email) {
      return { success: false, error: 'Session non authentifiée.' };
    }

    if (session.user?.id && !addressId.startsWith('addr_')) {
      try {
        await (prisma as any).address?.delete({
          where: { id: addressId },
        });
      } catch (_) {}
    }

    const current = await getUserAddresses();
    const filtered = current.filter((a) => a.id !== addressId);

    // Si on supprime l'adresse par défaut, on promeut la première restante
    if (filtered.length > 0 && !filtered.some((a) => a.isDefault)) {
      filtered[0].isDefault = true;
    }

    const key = `user_addresses_${session.user.id || session.user.email}`;
    const serialized = JSON.stringify(filtered);

    await prisma.siteContent.upsert({
      where: { key },
      create: {
        key,
        section: 'user_addresses',
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

    revalidatePath('/cuenta');
    return { success: true };
  } catch (err: any) {
    console.error('[DELETE ADDRESS ERROR]:', err);
    return { success: false, error: 'Impossible de supprimer cette adresse.' };
  }
}

// -------------------------------------------------------------
// NOTIFICATIONS CLIENT (Fase 2 - Punto 3)
// -------------------------------------------------------------
export async function getClientNotifications(): Promise<{
  notifications: any[];
  unreadCount: number;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id && !session?.user?.email) {
      return { notifications: [], unreadCount: 0 };
    }

    let userId = session.user.id;
    if (!userId && session.user.email) {
      const u = await prisma.user.findUnique({
        where: { email: session.user.email.toLowerCase().trim() },
        select: { id: true },
      });
      if (u) userId = u.id;
    }

    if (!userId) {
      return { notifications: [], unreadCount: 0 };
    }

    const items = await (prisma as any).notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const unreadCount = items.filter((n: any) => !n.isRead).length;

    return {
      notifications: items.map((it: any) => ({
        id: it.id,
        title: it.title,
        message: it.message,
        type: it.type,
        isRead: it.isRead,
        link: it.link,
        createdAt: it.createdAt.toISOString(),
      })),
      unreadCount,
    };
  } catch (err) {
    console.warn('[GET CLIENT NOTIFICATIONS WARN]:', err);
    return { notifications: [], unreadCount: 0 };
  }
}

export async function markClientNotificationAsRead(id: string): Promise<{ success: boolean }> {
  try {
    const session = await auth();
    if (!session?.user) return { success: false };

    await (prisma as any).notification.update({
      where: { id },
      data: { isRead: true },
    });
    return { success: true };
  } catch {
    return { success: false };
  }
}
