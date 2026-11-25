'use server';

import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export interface AdminProfileData {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

/**
 * Récupérer les informations du profil administrateur
 */
export async function getAdminProfile(): Promise<AdminProfileData> {
  try {
    const session = await auth();
    let email = session?.user?.email?.toLowerCase().trim() || 'admin@foeg-paris.com';

    let user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      user = await prisma.user.findFirst({
        where: { role: 'ADMIN' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });
    }

    if (!user) {
      return {
        id: 'admin-default',
        name: session?.user?.name || 'Direction FOEG Paris',
        email: email,
        role: 'ADMIN',
        createdAt: new Date().toISOString(),
      };
    }

    return {
      id: user.id,
      name: user.name || 'Direction FOEG Paris',
      email: user.email,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
    };
  } catch (err: any) {
    if (err?.digest === 'DYNAMIC_SERVER_USAGE' || err?.message?.includes('Dynamic server usage')) {
      throw err;
    }
    console.error('[GET ADMIN PROFILE ERROR]:', err);
    return {
      id: 'admin-fallback',
      name: 'Direction FOEG Paris',
      email: 'direction@foeg-paris.com',
      role: 'ADMIN',
      createdAt: new Date().toISOString(),
    };
  }
}

/**
 * Mettre à jour les informations de contact de l'administrateur
 */
export async function updateAdminProfile(data: { name: string; email: string }) {
  try {
    const session = await auth();
    const currentEmail = session?.user?.email?.toLowerCase().trim() || 'admin@foeg-paris.com';

    let user = await prisma.user.findUnique({
      where: { email: currentEmail },
    });

    if (!user) {
      user = await prisma.user.findFirst({
        where: { role: 'ADMIN' },
      });
    }

    if (!user) {
      return { success: false, error: 'Compte administrateur introuvable.' };
    }

    const newEmail = data.email.toLowerCase().trim();
    if (newEmail !== user.email) {
      const existing = await prisma.user.findUnique({
        where: { email: newEmail },
      });
      if (existing && existing.id !== user.id) {
        return { success: false, error: 'Cette adresse courriel est déjà utilisée par un autre compte.' };
      }
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: data.name.trim(),
        email: newEmail,
      },
    });

    revalidatePath('/admin/perfil');
    revalidatePath('/admin');

    return { success: true, message: 'Profil administrateur mis à jour avec succès.' };
  } catch (err: any) {
    console.error('[UPDATE ADMIN PROFILE ERROR]:', err);
    return { success: false, error: err?.message || 'Erreur lors de la mise à jour du profil.' };
  }
}

/**
 * Modifier le mot de passe de la Direction
 */
export async function changeAdminPassword(data: {
  currentPassword?: string;
  newPassword: string;
}) {
  try {
    if (!data.newPassword || data.newPassword.length < 6) {
      return { success: false, error: 'Le nouveau mot de passe doit comporter au moins 6 caractères.' };
    }

    const session = await auth();
    const currentEmail = session?.user?.email?.toLowerCase().trim() || 'admin@foeg-paris.com';

    let user = await prisma.user.findUnique({
      where: { email: currentEmail },
    });

    if (!user) {
      user = await prisma.user.findFirst({
        where: { role: 'ADMIN' },
      });
    }

    if (!user) {
      return { success: false, error: 'Compte administrateur introuvable.' };
    }

    if (user.password && data.currentPassword) {
      const isMatch = await bcrypt.compare(data.currentPassword, user.password);
      if (!isMatch) {
        return { success: false, error: 'Le mot de passe actuel est incorrect.' };
      }
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    revalidatePath('/admin/perfil');

    return { success: true, message: 'Mot de passe administrateur modifié avec succès.' };
  } catch (err: any) {
    console.error('[CHANGE ADMIN PASSWORD ERROR]:', err);
    return { success: false, error: err?.message || 'Erreur lors du changement de mot de passe.' };
  }
}
