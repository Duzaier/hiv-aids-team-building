import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

// GET /api/admin/teams â€” Admin lists all teams with full metadata
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(req);
    if (!session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Truy cáº­p bá»‹ tá»« chá»‘i: YÃªu cáº§u quyá»n Quáº£n trá»‹ viÃªn' },
        { status: 403 }
      );
    }

    const teams = await prisma.team.findMany({
      orderBy: { slotNumber: 'asc' },
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        },
        members: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    const auditLogs = await prisma.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        admin: { select: { name: true, email: true } }
      }
    });

    return NextResponse.json({
      success: true,
      totalSlots: 6,
      occupiedCount: teams.length,
      availableCount: 6 - teams.length,
      teams: teams.map((t) => ({
        id: t.id,
        slotNumber: t.slotNumber,
        name: t.name,
        ownerId: t.ownerId,
        ownerName: t.owner.name,
        ownerEmail: t.owner.email,
        registeredAt: t.registeredAt.toISOString().replace('T', ' ').substring(0, 16),
        members: t.members
      })),
      recentAuditLogs: auditLogs
    });
  } catch (error) {
    console.error('Admin API error:', error);
    return NextResponse.json({ success: false, error: 'Lá»—i mÃ¡y chá»§ Admin' }, { status: 500 });
  }
}