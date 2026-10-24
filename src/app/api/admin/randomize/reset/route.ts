import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

// POST /api/admin/randomize/reset - Reset all random individual allocations
export async function POST(req: NextRequest) {
  try {
    const adminUser = await requireAdmin(req);

    const resetResult = await prisma.$transaction(async (tx) => {
      // 1. Delete all team members that came from individual registrations
      const deletedMembers = await tx.teamMember.deleteMany({
        where: { isFromIndividual: true }
      });

      // 2. Clear assignedTeamId on individual registrations
      const updatedIndividuals = await tx.individualRegistration.updateMany({
        where: { assignedTeamId: { not: null } },
        data: {
          assignedTeamId: null,
          assignedSlot: null,
          assignedAt: null
        }
      });

      // 3. Clean up any team that now has 0 members (e.g. auto-created teams with no remaining members)
      const emptyTeams = await tx.team.findMany({
        where: {
          members: { none: {} }
        }
      });
      if (emptyTeams.length > 0) {
        await tx.team.deleteMany({
          where: {
            id: { in: emptyTeams.map((t) => t.id) }
          }
        });
      }

      // 4. Audit Log
      await tx.auditLog.create({
        data: {
          adminId: adminUser.id,
          action: 'RESET_RANDOM_ALLOCATION',
          targetSlot: 0,
          targetTeamName: 'Hệ thống Random',
          details: `Đã hoàn tác phân bổ của ${updatedIndividuals.count} cá nhân và dọn dẹp ${emptyTeams.length} slot trống`
        }
      });

      return {
        deletedMembersCount: deletedMembers.count,
        resetIndividualsCount: updatedIndividuals.count,
        cleanedEmptyTeamsCount: emptyTeams.length
      };
    });

    return NextResponse.json({
      success: true,
      message: `Đã hoàn tác và chuyển ${resetResult.resetIndividualsCount} cá nhân về danh sách chờ.`,
      result: resetResult
    });
  } catch (error: any) {
    console.error('Error in reset random allocation:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Lỗi máy chủ khi hoàn tác phân bổ' },
      { status: 500 }
    );
  }
}
