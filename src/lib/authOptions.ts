import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
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
      : []),
    CredentialsProvider({
      id: 'google-mock',
      name: 'Google Quick Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        name: { label: 'Họ tên', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        const email = credentials.email.trim().toLowerCase();
        const name = credentials.name?.trim() || email.split('@')[0];
        const role = isAdminEmail(email) ? 'ADMIN' : 'USER';

        const user = await prisma.user.upsert({
          where: { email },
          update: { 
            name,
            role
          },
          create: {
            email,
            name,
            role,
            image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`
          }
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role
        };
      }
    })
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

        const dbUser = await prisma.user.upsert({
          where: { email },
          update: {
            name: session.user.name || undefined,
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
