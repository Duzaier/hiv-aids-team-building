import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const adminUser = await requireAdmin(req);
    const body = await req.json();
    const { fromTeamId, toTeamId, memberIds } = body;

    if (!fromTeamId || !toTeamId) {
      return NextResponse.json(
        { success: false, error: 'Thiếu thông tin đội nguồn hoặc đội đích để gộp/chuyển.' },
        { status: 400 }
      );
    }

    if (fromTeamId === toTeamId) {
      return NextResponse.json(
        { success: false, error: 'Không thể chuyển thành viên vào chính đội của họ.' },
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

      // Filter members to move: either specific IDs or all members
      let membersToMove = fromTeam.members;
      if (Array.isArray(memberIds) && memberIds.length > 0) {
        const selectedSet = new Set(memberIds);
        membersToMove = fromTeam.members.filter((m) => selectedSet.has(m.id));
      }

      if (membersToMove.length === 0) {
        throw new Error('Vui lòng chọn ít nhất 1 thành viên để chuyển.');
      }

      const availableSlotsInToTeam = 5 - toTeam.members.length;
      if (membersToMove.length > availableSlotsInToTeam) {
        throw new Error(
          `Không thể chuyển: Đội ${toTeam.name} hiện có ${toTeam.members.length} người, chỉ có thể nhận thêm tối đa ${availableSlotsInToTeam} người (bạn đã chọn ${membersToMove.length} người).`
        );
      }

      const fromSlotNumber = fromTeam.slotNumber;
      const fromName = fromTeam.name;
      const toName = toTeam.name;
      const isFullMerge = membersToMove.length === fromTeam.members.length;

      // Base order for target team
      const baseOrder = toTeam.members.length;

      // Move selected members to toTeam
      for (let i = 0; i < membersToMove.length; i++) {
        const m = membersToMove[i];
        await tx.teamMember.update({
          where: { id: m.id },
          data: {
            teamId: toTeam.id,
            orderIndex: baseOrder + i + 1,
            isCaptain: false,
            isFromIndividual: true
          }
        });

        // Update corresponding individual registration if exists
        if (m.individualId) {
          await tx.individualRegistration.updateMany({
            where: { id: m.individualId },
            data: {
              assignedTeamId: toTeam.id,
              assignedSlot: toTeam.slotNumber
            }
          });
        }
      }

      let remainingCount = 0;

      if (isFullMerge) {
        // All members moved -> delete fromTeam and completely release slot
        // Update any remaining individual registrations linked to fromTeam
        await tx.individualRegistration.updateMany({
          where: { assignedTeamId: fromTeam.id },
          data: {
            assignedTeamId: toTeam.id,
            assignedSlot: toTeam.slotNumber
          }
        });

        // Cancel any pending match requests involving fromTeam
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

        // Delete fromTeam
        await tx.team.delete({
          where: { id: fromTeam.id }
        });
      } else {
        // Partial move: remaining members stay in fromTeam
        const movedIdSet = new Set(membersToMove.map((m) => m.id));
        const remainingMembers = fromTeam.members.filter((m) => !movedIdSet.has(m.id));
        remainingCount = remainingMembers.length;

        // Ensure at least one remaining member is Captain
        let hasCaptain = remainingMembers.some((m) => m.isCaptain);
        for (let i = 0; i < remainingMembers.length; i++) {
          const m = remainingMembers[i];
          const shouldBeCaptain = !hasCaptain && i === 0 ? true : m.isCaptain;
          if (shouldBeCaptain) hasCaptain = true;

          await tx.teamMember.update({
            where: { id: m.id },
            data: {
              orderIndex: i + 1,
              isCaptain: shouldBeCaptain
            }
          });
        }

        // Update fromTeam captainName if captain changed
        const newCaptain = remainingMembers.find((m) => m.isCaptain) || remainingMembers[0];
        await tx.team.update({
          where: { id: fromTeam.id },
          data: {
            captainName: newCaptain?.name || '',
            version: { increment: 1 }
          }
        });
      }

      // Increment version of toTeam
      await tx.team.update({
        where: { id: toTeam.id },
        data: { version: { increment: 1 } }
      });

      // Audit Log
      if (adminUser?.id) {
        try {
          const userExists = await tx.user.findUnique({ where: { id: adminUser.id } });
          if (userExists) {
            const detailText = isFullMerge
              ? `Admin đã gộp toàn bộ ${membersToMove.length} người từ ${fromName} sang ${toName} (đạt ${toTeam.members.length + membersToMove.length}/5 người). Slot #${fromSlotNumber} đã được giải phóng.`
              : `Admin đã chuyển ${membersToMove.length} người từ ${fromName} sang ${toName} (đạt ${toTeam.members.length + membersToMove.length}/5 người). ${fromName} còn lại ${remainingCount} người.`;

            await tx.auditLog.create({
              data: {
                adminId: adminUser.id,
                action: isFullMerge ? 'ADMIN_DIRECT_MERGE_FULL' : 'ADMIN_DIRECT_MEMBER_TRANSFER',
                targetSlot: fromSlotNumber,
                targetTeamName: fromName,
                details: detailText
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
        movedCount: membersToMove.length,
        remainingCount,
        toTotalMembers: toTeam.members.length + membersToMove.length,
        isFullMerge,
        slotReleased: isFullMerge
      };
    });

    const msg = result.isFullMerge
      ? `Admin đã gộp thành công toàn bộ ${result.movedCount} người từ ${result.fromName} sang ${result.toName} (tổng ${result.toTotalMembers}/5 người). Slot #${result.fromSlotNumber} đã được giải phóng thành công!`
      : `Admin đã chuyển thành công ${result.movedCount} người từ ${result.fromName} sang ${result.toName} (tổng ${result.toTotalMembers}/5 người). Đội ${result.fromName} hiện còn lại ${result.remainingCount} người.`;

    return NextResponse.json({
      success: true,
      message: msg,
      result
    });
  } catch (error: any) {
    console.error('Admin direct merge error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Lỗi máy chủ khi gộp/chuyển thành viên trực tiếp' },
      { status: error?.message === 'UNAUTHORIZED_ADMIN' ? 403 : 500 }
    );
  }
}
