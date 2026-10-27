import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession, isAdminEmail } from '@/lib/auth';
import {
  sendIndividualJoinAcceptedEmails,
  sendIndividualJoinRejectedEmails
} from '@/lib/mail';

// POST /api/individual-requests/[id]/respond
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(req);

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng đăng nhập để xử lý yêu cầu này' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { action } = body;

    if (!action || !['ACCEPT', 'REJECT'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Hành động không hợp lệ (chỉ chấp nhận ACCEPT hoặc REJECT)' },
        { status: 400 }
      );
    }

    const userEmail = session.user.email.toLowerCase().trim();
    let dbUser = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          email: userEmail,
          name: session.user.name || userEmail.split('@')[0],
          role: session.user.role || 'USER',
          image: session.user.image || undefined
        }
      });
    }

    const isAdmin = session.user.role === 'ADMIN' || dbUser.role === 'ADMIN' || isAdminEmail(userEmail);

    // Fetch the individual join request with target team
    const joinRequest = await prisma.individualJoinRequest.findUnique({
      where: { id },
      include: {
        team: {
          include: {
            members: { orderBy: { orderIndex: 'asc' } },
            owner: { select: { id: true, name: true, email: true } }
          }
        }
      }
    });

    if (!joinRequest || joinRequest.status !== 'PENDING') {
      return NextResponse.json(
        { success: false, error: 'Yêu cầu này không tồn tại hoặc đã được xử lý trước đó' },
        { status: 404 }
      );
    }

    // Permission check: Must be owner of the target team or Admin
    const isTeamOwner =
      joinRequest.team.ownerId === dbUser.id ||
      (joinRequest.team.owner.email && joinRequest.team.owner.email.toLowerCase().trim() === userEmail);

    if (!isTeamOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Bạn không có quyền duyệt yêu cầu gia nhập vào đội thi này' },
        { status: 403 }
      );
    }

    const responderName = dbUser.name || session.user.name || (isAdmin ? 'Ban Quản Trị' : joinRequest.team.name);

    // 1. REJECT ACTION
    if (action === 'REJECT') {
      await prisma.individualJoinRequest.update({
        where: { id },
        data: { status: 'REJECTED' }
      });

      // Send rejection notification email to individual and Admin
      try {
        await sendIndividualJoinRejectedEmails({
          team: joinRequest.team,
          individual: {
            name: joinRequest.name,
            email: joinRequest.email
          },
          responderName
        });
      } catch (mailErr) {
        console.error('[Mail Error] Failed to send rejection email to individual:', mailErr);
      }

      return NextResponse.json({
        success: true,
        message: `Đã từ chối yêu cầu tham gia của ${joinRequest.name} vào ${joinRequest.team.name}.`
      });
    }

    // 2. ACCEPT ACTION
    if (action === 'ACCEPT') {
      const result = await prisma.$transaction(async (tx) => {
        // Re-verify current team capacity inside transaction
        const currentTeam = await tx.team.findUnique({
          where: { id: joinRequest.teamId },
          include: {
            members: { orderBy: { orderIndex: 'asc' } },
            owner: { select: { id: true, name: true, email: true } }
          }
        });

        if (!currentTeam) {
          throw new Error('Đội thi không còn tồn tại.');
        }

        if (currentTeam.members.length >= 5) {
          throw new Error(`Đội ${currentTeam.name} đã đủ 5 thành viên, không thể nhận thêm.`);
        }

        const newOrderIndex = currentTeam.members.length + 1;

        // Add individual to team members
        const createdMember = await tx.teamMember.create({
          data: {
            teamId: currentTeam.id,
            name: joinRequest.name.trim(),
            studentId: joinRequest.studentId?.trim() || '',
            email: joinRequest.email.trim(),
            phone: joinRequest.phone?.trim() || '',
            orderIndex: newOrderIndex,
            isCaptain: false,
            isFromIndividual: true
          }
        });

        // Mark this join request as ACCEPTED
        await tx.individualJoinRequest.update({
          where: { id },
          data: { status: 'ACCEPTED' }
        });

        // If this person had a registration in IndividualRegistration pool, update it
        try {
          await tx.individualRegistration.updateMany({
            where: {
              email: { equals: joinRequest.email.trim(), mode: 'insensitive' }
            },
            data: {
              assignedTeamId: currentTeam.id,
              assignedSlot: currentTeam.slotNumber,
              assignedAt: new Date()
            }
          });
        } catch (e) {
          // Non-blocking
        }

        // Increment target team version
        await tx.team.update({
          where: { id: currentTeam.id },
          data: { version: { increment: 1 } }
        });

        // Create audit log
        try {
          await tx.auditLog.create({
            data: {
              adminId: dbUser.id,
              action: 'INDIVIDUAL_JOINED_TEAM',
              targetSlot: currentTeam.slotNumber,
              targetTeamName: currentTeam.name,
              details: `Chấp thuận ${joinRequest.name} (${joinRequest.email}) vào ${currentTeam.name} (Slot #${currentTeam.slotNumber}). Quân số mới: ${newOrderIndex}/5.`
            }
          });
        } catch (auditErr) {
          console.warn('Could not create audit log for individual join:', auditErr);
        }

        return {
          currentTeam,
          totalMembers: newOrderIndex
        };
      });

      // Send acceptance email to individual and Admin
      try {
        await sendIndividualJoinAcceptedEmails({
          team: result.currentTeam,
          individual: {
            name: joinRequest.name,
            email: joinRequest.email
          },
          totalMembers: result.totalMembers,
          responderName
        });
      } catch (mailErr) {
        console.error('[Mail Error] Failed to send acceptance email to individual:', mailErr);
      }

      return NextResponse.json({
        success: true,
        message: `Đã chấp thuận ${joinRequest.name} vào ${result.currentTeam.name}! Quân số hiện tại: ${result.totalMembers}/5 thành viên.`
      });
    }

    return NextResponse.json(
      { success: false, error: 'Hành động không xác định' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error responding to individual request:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi máy chủ khi xử lý yêu cầu' },
      { status: 500 }
    );
  }
}
