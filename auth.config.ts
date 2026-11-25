import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  trustHost: true,
  pages: {
    signIn: '/cuenta',
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
      }
      return session;
    },
  },
  providers: [], // Configurados con Prisma y bcrypt en auth.ts
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'foeg_paris_secret_key_luxury_2026',
} satisfies NextAuthConfig;

export default authConfig;
