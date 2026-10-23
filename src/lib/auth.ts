import { prisma } from './prisma';

export interface AuthSession {
  user: {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    role: 'USER' | 'ADMIN';
  } | null;
}

export async function getServerSession(req?: Request): Promise<AuthSession> {
  // 1. Check for request header override (useful for testing & development persona switching)
  if (req) {
    const overrideUserId = req.headers.get('x-user-id');
    const overrideEmail = req.headers.get('x-user-email');

    if (overrideUserId) {
      let user = await prisma.user.findUnique({
        where: { id: overrideUserId }
      });

      if (!user && overrideEmail) {
        user = await prisma.user.upsert({
          where: { email: overrideEmail },
          update: {},
          create: {
            id: overrideUserId,
            email: overrideEmail,
            name: req.headers.get('x-user-name') ? decodeURIComponent(req.headers.get('x-user-name')!) : overrideEmail.split('@')[0],
            role: isAdminEmail(overrideEmail) ? 'ADMIN' : 'USER'
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
            role: user.role as 'USER' | 'ADMIN'
          }
        };
      }
    }
  }

  // 2. Default: Unauthenticated
  return { user: null };
}

export function isAdminEmail(email: string): boolean {
  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return adminEmails.includes(email.toLowerCase());
}

export async function requireAdmin(req?: Request) {
  const session = await getServerSession(req);
  if (!session.user || session.user.role !== 'ADMIN') {
    throw new Error('UNAUTHORIZED_ADMIN');
  }
  return session.user;
}
