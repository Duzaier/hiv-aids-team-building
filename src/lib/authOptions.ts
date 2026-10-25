import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from './prisma';
import { isAdminEmail } from './roles';

export const authOptions: NextAuthOptions = {
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
          })
        ]
      : [])
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      if (token.email) {
        token.role = isAdminEmail(token.email) ? 'ADMIN' : 'USER';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.email) {
        const email = token.email.toLowerCase();
        const role = isAdminEmail(email) ? 'ADMIN' : 'USER';

        const existing = await prisma.user.findUnique({ where: { email } });
        const dbUser = await prisma.user.upsert({
          where: { email },
          update: {
            name: (existing?.name && existing.name !== email.split('@')[0]) ? existing.name : (session.user.name || undefined),
            image: session.user.image || undefined,
            role
          },
          create: {
            email,
            name: session.user.name || email.split('@')[0],
            image: session.user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
            role
          }
        });

        (session.user as any).id = dbUser.id;
        (session.user as any).role = role;
      }
      return session;
    }
  },
  pages: {
    signIn: '/',
    error: '/'
  },
  secret: process.env.NEXTAUTH_SECRET || 'hiv-team-building-super-secret-key-2026',
  session: {
    strategy: 'jwt'
  }
};
