import { getServerSession as getNextAuthSession } from 'next-auth';
import { authOptions } from './authOptions';
import { prisma } from './prisma';
import { isAdminEmail } from './roles';

export interface AuthSession {
  user: {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    role: 'USER' | 'ADMIN';
  } | null;
}

export { isAdminEmail } from './roles';

export async function getServerSession(req?: Request): Promise<AuthSession> {
  // 1. Try real NextAuth session first
  try {
    const nextAuthSession = await getNextAuthSession(authOptions);
    if (nextAuthSession?.user) {
      const user = nextAuthSession.user as any;
      const email = (user.email || '').toLowerCase();
      const role = isAdminEmail(email) ? 'ADMIN' : 'USER';
      return {
        user: {
          id: user.id || '',
          email,
          name: user.name || null,
          image: user.image || null,
          role
        }
      };
    }
  } catch (err) {
    // NextAuth session lookup fallback
  }

  // 2. Check for request header override (useful for API testing)
  if (req) {
    let overrideUserId = req.headers.get('x-user-id');
    const overrideEmail = req.headers.get('x-user-email');

    if (overrideUserId || overrideEmail) {
      if (!overrideUserId && overrideEmail) {
        overrideUserId = 'mock-' + overrideEmail.replace(/[^a-zA-Z0-9]/g, '-');
      }

      let user = overrideUserId
        ? await prisma.user.findUnique({ where: { id: overrideUserId } })
        : null;

      if (!user && overrideEmail) {
        user = await prisma.user.upsert({
          where: { email: overrideEmail },
          update: {
            role: 'USER'
          },
          create: {
            id: overrideUserId!,
            email: overrideEmail,
            name: req.headers.get('x-user-name')
              ? decodeURIComponent(req.headers.get('x-user-name')!)
              : overrideEmail.split('@')[0],
            role: 'USER'
          }
        });
      }

      if (user) {
        return {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: 'USER' // header override không bao giờ được cấp quyền Admin
          }
        };
      }
    }
  }

  // 3. Default: Unauthenticated
  return { user: null };
}

export async function requireAdmin(req?: Request) {
  const session = await getServerSession(req);
  if (!session.user || session.user.role !== 'ADMIN') {
    throw new Error('UNAUTHORIZED_ADMIN');
  }
  return session.user;
}
