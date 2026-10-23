import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(req);
    if (!session.user || !session.user.email) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng đăng nhập để xử lý yêu cầu' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { action } = body; // 'ACCEPT' | 'REJECT' | 'CANCEL'

    if (!['ACCEPT', 'REJECT', 'CANCEL'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Hành động không hợp lệ' },
        { status: 400 }
      );
    }

    const email = session.user.email.toLowerCase().trim();
    const dbUser = await prisma.user.findUnique({
      where: { email }
    });

    if (!dbUser) {
      return NextResponse.json(
        { success: false, error: 'Tài khoản không tồn tại' },
        { status: 404 }
      );
    }

    const isAdmin = session.user.role === 'ADMIN' || dbUser.role === 'ADMIN';

    // Fetch match request with fromTeam and toTeam
    const match = await prisma.teamMatchRequest.findUnique({
      where: { id },
      include: {
        fromTeam: {
          include: { members: { orderBy: { orderIndex: 'asc' } }, owner: true }
        },
        toTeam: {
          include: { members: { orderBy: { orderIndex: 'asc' } }, owner: true }
        }
      }
    });

    if (!match || match.status !== 'PENDING') {
      return NextResponse.json(
        { success: false, error: 'Yêu cầu gộp đội này không tồn tại hoặc đã được xử lý trước đó' },
        { status: 404 }
      );
    }

    // 1. CANCEL ACTION: Initiated by fromTeam owner or Admin
    if (action === 'CANCEL') {
      const isFromOwner = match.fromTeam.ownerId === dbUser.id;
      if (!isFromOwner && !isAdmin) {
        return NextResponse.json(
          { success: false, error: 'Chỉ người gửi yêu cầu hoặc Admin mới có quyền hủy yêu cầu này' },
          { status: 403 }
        );
      }

      await prisma.teamMatchRequest.update({
        where: { id },
        data: { status: 'CANCELLED' }
      });

      return NextResponse.json({
        success: true,
        message: `Đã hủy yêu cầu gộp ${match.fromTeam.name} vào ${match.toTeam.name}`
      });
    }

    // 2. REJECT ACTION: Initiated by toTeam owner or Admin
    if (action === 'REJECT') {
      const isToOwner = match.toTeam.ownerId === dbUser.id;
      if (!isToOwner && !isAdmin) {
        return NextResponse.json(
          { success: false, error: 'Chỉ người đại diện đội nhận hoặc Admin mới có quyền từ chối yêu cầu này' },
          { status: 403 }
        );
      }

      await prisma.teamMatchRequest.update({
        where: { id },
        data: { status: 'REJECTED' }
      });

      return NextResponse.json({
        success: true,
        message: `Đã từ chối yêu cầu gộp từ ${match.fromTeam.name}`
      });
    }

    // 3. ACCEPT ACTION: Initiated by toTeam owner or Admin
    if (action === 'ACCEPT') {
      const isToOwner = match.toTeam.ownerId === dbUser.id;
      if (!isToOwner && !isAdmin) {
        return NextResponse.json(
          { success: false, error: 'Chỉ người đại diện đội nhận hoặc Admin mới có quyền chấp nhận yêu cầu này' },
          { status: 403 }
        );
      }

      // Execute Merge Transaction atomically
      const result = await prisma.$transaction(async (tx) => {
        // Re-verify both teams exist in current transaction
        const currentFrom = await tx.team.findUnique({
          where: { id: match.fromTeamId },
          include: { members: true }
        });

        const currentTo = await tx.team.findUnique({
          where: { id: match.toTeamId },
          include: { members: true }
        });

        if (!currentFrom || !currentTo) {
          throw new Error('Một trong hai đội không còn tồn tại để thực hiện gộp.');
        }

        const totalMembers = currentFrom.members.length + currentTo.members.length;
        if (totalMembers > 5) {
          throw new Error(
            `Không thể gộp: Tổng số thành viên (${totalMembers}) vượt quá 5 người. Đội ${currentTo.name} chỉ còn trống ${5 - currentTo.members.length} slot.`
          );
        }

        const fromSlotNumber = currentFrom.slotNumber;
        const fromName = currentFrom.name;
        const toName = currentTo.name;

        // Move all members from fromTeam to toTeam
        const baseOrder = currentTo.members.length;
        for (let i = 0; i < currentFrom.members.length; i++) {
          const m = currentFrom.members[i];
          await tx.teamMember.update({
            where: { id: m.id },
            data: {
              teamId: currentTo.id,
              orderIndex: baseOrder + i + 1,
              isCaptain: false,
              isFromIndividual: true // Mark as merged
            }
          });
        }

        // Delete fromTeam to completely release the slot
        await tx.team.delete({
          where: { id: currentFrom.id }
        });

        // Mark this match request as ACCEPTED
        await tx.teamMatchRequest.update({
          where: { id },
          data: { status: 'ACCEPTED' }
        });

        // Cancel other pending requests related to fromTeam
        await tx.teamMatchRequest.updateMany({
          where: {
            OR: [
              { fromTeamId: currentFrom.id },
              { toTeamId: currentFrom.id }
            ],
            status: 'PENDING'
          },
          data: { status: 'CANCELLED' }
        });

        // Audit Log
        await tx.auditLog.create({
          data: {
            adminId: dbUser.id,
            action: 'TEAM_MERGED',
            targetSlot: fromSlotNumber,
            targetTeamName: fromName,
            details: `Gộp ${fromName} (${currentFrom.members.length} người) vào ${toName} (đạt tổng ${totalMembers}/5 người). Slot #${fromSlotNumber} đã được giải phóng thành 5 slot trống.`
          }
        });

        return {
          fromSlotNumber,
          fromName,
          toName,
          totalMembers
        };
      });

      return NextResponse.json({
        success: true,
        message: `Gộp đội thành công! ${result.fromName} đã gia nhập ${result.toName} (tổng ${result.totalMembers}/5 thành viên). Vị trí Slot #${result.fromSlotNumber} đã được giải phóng trở thành 5 slot trống!`
      });
    }

    return NextResponse.json(
      { success: false, error: 'Hành động không xác định' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error handling match response:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi máy chủ khi xử lý yêu cầu gộp đội' },
      { status: 500 }
    );
  }
}