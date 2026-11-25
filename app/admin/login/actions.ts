'use server';

import { signIn } from '@/auth';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { AuthError } from 'next-auth';

export interface AdminLoginResult {
  success: boolean;
  error?: string;
}

export async function loginAdminAction(formData: {
  email: string;
  password: string;
}): Promise<AdminLoginResult> {
  try {
    const email = String(formData.email || '').toLowerCase().trim();
    const rawPassword = String(formData.password || '');

    if (!email || !rawPassword) {
      return { success: false, error: 'Veuillez saisir votre identifiant et votre mot de passe.' };
    }

    // 1. Vérification directe dans la base de données
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { email },
      });
    } catch (dbErr: any) {
      console.error('[ADMIN LOGIN DB ERROR]', dbErr);
      return {
        success: false,
        error: `Impossible de contacter la base de données Neon (${dbErr?.code || 'Erreur réseau'}). Assurez-vous que le serveur a bien été redémarré.`,
      };
    }

    // Auto-initialisation si l'administrateur par défaut n'a pas encore été seedé
    if (!user && email === 'admin@foeg-paris.com' && rawPassword.trim() === 'foeg2026') {
      try {
        console.log('[AUTO-INIT] Initialisation automatique du compte administrateur FOEG...');
        const hashedPassword = await bcrypt.hash('foeg2026', 10);
        user = await prisma.user.create({
          data: {
            email: 'admin@foeg-paris.com',
            password: hashedPassword,
            name: 'Direction FOEG Paris',
            role: 'ADMIN',
          },
        });
        console.log('[AUTO-INIT] ✓ Compte administrateur créé avec succès dans Neon.');
      } catch (createErr: any) {
        console.error('[AUTO-INIT ERROR]', createErr);
      }
    }

    if (!user || !user.password) {
      return { success: false, error: 'Identifiants administrateur incorrects.' };
    }

    // 2. Vérification du rôle Administrateur
    if (user.role !== 'ADMIN') {
      return { success: false, error: 'Accès réservé aux administrateurs de la Maison.' };
    }

    // 3. Validation du mot de passe avec bcrypt
    const isPasswordValid =
      (await bcrypt.compare(rawPassword, user.password)) ||
      (await bcrypt.compare(rawPassword.trim(), user.password));

    if (!isPasswordValid) {
      return { success: false, error: 'Identifiants administrateur incorrects.' };
    }

    // 4. Initialisation de la session sécurisée NextAuth
    await signIn('credentials', {
      email,
      password: rawPassword.trim(),
      redirectTo: '/admin',
    });

    return { success: true };
  } catch (error: any) {
    // Si c'est l'erreur interne de redirection Next.js, on doit la relancer pour que le navigateur change de page
    if (error?.message === 'NEXT_REDIRECT' || error?.digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }

    if (error instanceof AuthError) {
      return { success: false, error: 'Identifiants administrateur incorrects.' };
    }

    console.error('[ADMIN LOGIN ERROR]:', error);
    return {
      success: false,
      error: 'Erreur de connexion à la base de données. Veuillez réessayer dans quelques instants.',
    };
  }
}
