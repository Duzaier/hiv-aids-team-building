import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';
import { teamUpdateSchema } from '@/lib/validations';

// GET /api/teams/me — Fetch the team owned by the authenticated user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(req);
    if (!session.user) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng đăng nhập Google' },
        { status: 401 }
      );
    }

    const team = await prisma.team.findUnique({
      where: { ownerId: session.user.id },
      include: {
        members: {
          orderBy: { orderIndex: 'asc' }
        },
        owner: {
          select: { name: true, email: true }
        }
      }
    });

    if (!team) {
      return NextResponse.json(
        { success: false, error: 'Bạn chưa có đội nào được đăng ký' },
        { status: 404 }
      );
    }

    const repMember = (team.owner?.email ? team.members.find((m) => m.email && m.email.toLowerCase() === team.owner.email.toLowerCase()) : null)
      || team.members.find((m) => m.isCaptain)
      || team.members[0];
    const repName = repMember?.name?.trim() || team.captainName?.trim() || team.owner?.name || 'Người dùng';

    return NextResponse.json({
      success: true,
      team: {
        id: team.id,
        slotNumber: team.slotNumber,
        name: team.name,
        captainName: repName,
        ownerId: team.ownerId,
        ownerName: repName,
        ownerEmail: team.owner.email,
        version: team.version,
        registeredAt: team.registeredAt.toISOString().replace('T', ' ').substring(0, 16),
        members: team.members.map((m) => ({
          id: m.id,
          name: m.name,
          studentId: m.studentId || '',
          email: m.email || '',
          phone: m.phone || '',
          orderIndex: m.orderIndex,
          isCaptain: false,
          isFromIndividual: m.isFromIndividual
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching owned team:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi máy chủ khi lấy dữ liệu đội' },
      { status: 500 }
    );
  }
}

// PATCH /api/teams/me — Edit team member list
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(req);
    if (!session.user) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng đăng nhập Google' },
        { status: 401 }
      );
    }

    const existingTeam = await prisma.team.findUnique({
      where: { ownerId: session.user.id },
      include: { members: true }
    });

    if (!existingTeam) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy đội để chỉnh sửa' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const parseResult = teamUpdateSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: parseResult.error.issues?.[0]?.message || 'Dữ liệu không hợp lệ',
          validationErrors: parseResult.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const { teamName, members } = parseResult.data;
    const userEmail = session.user.email?.toLowerCase();

    const repMember = members?.find((mem: any) => {
      const memEmail = typeof mem === 'object' ? mem.email || '' : '';
      return memEmail && userEmail && memEmail.trim().toLowerCase() === userEmail;
    }) || members?.[0];
    const repName = (typeof repMember === 'string' ? repMember : repMember?.name || '').trim();

    const updatedTeam = await prisma.$transaction(async (tx) => {
      if (repName && existingTeam.ownerId) {
        await tx.user.update({
          where: { id: existingTeam.ownerId },
          data: { name: repName }
        });
      }
      if (members && members.length > 0) {
        await tx.teamMember.deleteMany({
          where: { teamId: existingTeam.id }
        });

        await tx.teamMember.createMany({
          data: members.map((mem: any, idx: number) => {
            const name = typeof mem === 'string' ? mem : mem.name;
            const studentId = typeof mem === 'object' ? mem.studentId || '' : '';
            const email = typeof mem === 'object' ? mem.email || '' : '';
            const phone = typeof mem === 'object' ? mem.phone || '' : '';
            return {
              teamId: existingTeam.id,
              name: name.trim(),
              studentId: studentId.trim(),
              email: email.trim(),
              phone: phone.trim(),
              orderIndex: idx + 1,
              isCaptain: false
            };
          })
        });
      }

      return tx.team.update({
        where: { id: existingTeam.id },
        data: {
          name: teamName || existingTeam.name,
          captainName: repName,
          version: { increment: 1 }
        },
        include: {
          members: {
            orderBy: { orderIndex: 'asc' }
          },
          owner: {
            select: { name: true, email: true }
          }
        }
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Cập nhật thông tin đội thành công',
      team: {
        id: updatedTeam.id,
        slotNumber: updatedTeam.slotNumber,
        name: updatedTeam.name,
        captainName: repName,
        ownerId: updatedTeam.ownerId,
        ownerName: repName || updatedTeam.owner.name,
        version: updatedTeam.version,
        members: updatedTeam.members.map((m) => ({
          id: m.id,
          name: m.name,
          studentId: m.studentId || '',
          email: m.email || '',
          phone: m.phone || '',
          orderIndex: m.orderIndex,
          isCaptain: false,
          isFromIndividual: m.isFromIndividual
        }))
      }
    });
  } catch (error) {
    console.error('Error updating team:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi máy chủ khi cập nhật thông tin đội' },
      { status: 500 }
    );
  }
}