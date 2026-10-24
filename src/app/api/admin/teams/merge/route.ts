import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const adminUser = await requireAdmin(req);
    const body = await req.json();
    const { fromTeamId, toTeamId } = body;

    if (!fromTeamId || !toTeamId) {
      return NextResponse.json(
        { success: false, error: 'Thiếu thông tin đội nguồn hoặc đội đích để gộp.' },
        { status: 400 }
      );
    }

    if (fromTeamId === toTeamId) {
      return NextResponse.json(
        { success: false, error: 'Không thể gộp một đội vào chính nó.' },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const fromTeam = await tx.team.findUnique({
        where: { id: fromTeamId },
        include: { members: { orderBy: { orderIndex: 'asc' } }, owner: true }
      });

      const toTeam = await tx.team.findUnique({
        where: { id: toTeamId },
        include: { members: { orderBy: { orderIndex: 'asc' } }, owner: true }
      });

      if (!fromTeam) {
        throw new Error('Không tìm thấy đội nguồn cần chuyển đi.');
      }
      if (!toTeam) {
        throw new Error('Không tìm thấy đội đích nhận thành viên.');
      }

      const totalMembers = fromTeam.members.length + toTeam.members.length;
      if (totalMembers > 5) {
        throw new Error(
          `Không thể gộp: Tổng số thành viên (${totalMembers}) vượt quá 5 người. Đội ${toTeam.name} hiện có ${toTeam.members.length} người, chỉ có thể nhận thêm tối đa ${5 - toTeam.members.length} người.`
        );
      }

      const fromSlotNumber = fromTeam.slotNumber;
      const fromName = fromTeam.name;
      const toName = toTeam.name;

      // Move all members from fromTeam to toTeam
      const baseOrder = toTeam.members.length;
      for (let i = 0; i < fromTeam.members.length; i++) {
        const m = fromTeam.members[i];
        await tx.teamMember.update({
          where: { id: m.id },
          data: {
            teamId: toTeam.id,
            orderIndex: baseOrder + i + 1,
            isCaptain: false,
            isFromIndividual: true
          }
        });
      }

      // If any individual registration records were assigned to fromTeam, update them to toTeam
      await tx.individualRegistration.updateMany({
        where: { assignedTeamId: fromTeam.id },
        data: {
          assignedTeamId: toTeam.id,
          assignedSlot: toTeam.slotNumber
        }
      });

      // Cancel any pending match requests involving either team
      await tx.teamMatchRequest.updateMany({
        where: {
          OR: [
            { fromTeamId: fromTeam.id },
            { toTeamId: fromTeam.id }
          ],
          status: 'PENDING'
        },
        data: { status: 'CANCELLED' }
      });

      // Delete fromTeam to completely release the slot
      await tx.team.delete({
        where: { id: fromTeam.id }
      });

      // Log admin audit action
      if (adminUser?.id) {
        try {
          const userExists = await tx.user.findUnique({ where: { id: adminUser.id } });
          if (userExists) {
            await tx.auditLog.create({
              data: {
                adminId: adminUser.id,
                action: 'ADMIN_DIRECT_MERGE',
                targetSlot: fromSlotNumber,
                targetTeamName: fromName,
                details: `Admin đã gộp trực tiếp ${fromName} (${fromTeam.members.length} người) vào ${toName} (đạt ${totalMembers}/5 người). Slot #${fromSlotNumber} đã được giải phóng thành công.`
              }
            });
          }
        } catch (logErr) {
          console.warn('Could not create audit log:', logErr);
        }
      }

      return {
        fromSlotNumber,
        fromName,
        toName,
        totalMembers,
        movedCount: fromTeam.members.length
      };
    });

    return NextResponse.json({
      success: true,
      message: `Admin đã gộp thành công ${result.fromName} vào ${result.toName} (tổng ${result.totalMembers}/5 thành viên). Vị trí Slot #${result.fromSlotNumber} đã được giải phóng!`,
      result
    });
  } catch (error: any) {
    console.error('Admin direct merge error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Lỗi máy chủ khi gộp đội trực tiếp' },
      { status: error?.message === 'UNAUTHORIZED_ADMIN' ? 403 : 500 }
    );
  }
}
