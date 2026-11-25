import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import authConfig from './auth.config';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'foeg_paris_secret_key_luxury_2026',
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user?.email) {
        try {
          const email = user.email.toLowerCase().trim();
          let dbUser = await prisma.user.findUnique({
            where: { email },
          });

          if (!dbUser) {
            const randomPassword = await bcrypt.hash(Math.random().toString(36), 10);
            dbUser = await prisma.user.create({
              data: {
                email,
                name: user.name || 'Client FOEG',
                password: randomPassword,
                role: 'CUSTOMER',
              },
            });
            console.log(`[GOOGLE AUTH] Nouveau client créé dans Neon: "${email}"`);
          }

          if (user.image && dbUser) {
            try {
              await prisma.setting.upsert({
                where: { key: `user_avatar_${dbUser.id}` },
                update: { value: user.image },
                create: { key: `user_avatar_${dbUser.id}`, value: user.image },
              });
            } catch (_) {}
          }

          (user as any).id = dbUser.id;
          (user as any).role = dbUser.role;
          (user as any).image = user.image;
          return true;
        } catch (err) {
          console.error('[GOOGLE AUTH DB SYNC ERROR]:', err);
          return true;
        }
      }
      return true;
    },
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID || 'foeg_google_client_id_placeholder',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET || 'foeg_google_client_secret_placeholder',
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.warn('[AUTH] Tentative de connexion sans identifiants.');
            return null;
          }

          const email = String(credentials.email).toLowerCase().trim();
          const rawPassword = String(credentials.password);

          let user = await prisma.user.findUnique({
            where: { email },
          });

          // Auto-initialisation si l'administrateur par défaut n'a pas encore été seedé
          if (!user && email === 'admin@foeg-paris.com' && rawPassword.trim() === 'foeg2026') {
            try {
              console.log('[AUTH] Création automatique du compte administrateur...');
              const hashedPassword = await bcrypt.hash('foeg2026', 10);
              user = await prisma.user.create({
                data: {
                  email: 'admin@foeg-paris.com',
                  password: hashedPassword,
                  name: 'Direction FOEG Paris',
                  role: 'ADMIN',
                },
              });
            } catch (initErr) {
              console.error('[AUTH AUTO-INIT ERROR]:', initErr);
            }
          }

          if (!user || !user.password) {
            console.warn(`[AUTH] Aucun compte trouvé pour l'adresse: "${email}"`);
            return null;
          }

          // Comparaison sécurisée avec et sans trim pour éviter les espaces accidentels
          const isPasswordValid =
            (await bcrypt.compare(rawPassword, user.password)) ||
            (await bcrypt.compare(rawPassword.trim(), user.password));

          if (!isPasswordValid) {
            console.warn(`[AUTH] Mot de passe invalide pour le compte: "${email}"`);
            return null;
          }

          console.log(`[AUTH] Authentification réussie pour: "${user.email}" (Rôle: ${user.role})`);

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error: any) {
          console.error('[AUTH ERROR] Erreur lors de authorize():', error?.message || error);
          return null;
        }
      },
    }),
  ],
});
