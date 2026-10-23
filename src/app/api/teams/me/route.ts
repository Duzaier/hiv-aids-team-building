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

    return NextResponse.json({
      success: true,
      team: {
        id: team.id,
        slotNumber: team.slotNumber,
        name: team.name,
        captainName: team.captainName || team.members.find(m => m.isCaptain)?.name || team.owner.name,
        ownerId: team.ownerId,
        ownerName: team.owner.name,
        ownerEmail: team.owner.email,
        version: team.version,
        registeredAt: team.registeredAt.toISOString().replace('T', ' ').substring(0, 16),
        members: team.members
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

// PATCH /api/teams/me — Edit team name, captain, or member list
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

    const { teamName, captainName, members } = parseResult.data;

    const updatedTeam = await prisma.$transaction(async (tx) => {
      if (members && members.length > 0) {
        await tx.teamMember.deleteMany({
          where: { teamId: existingTeam.id }
        });

        const activeCaptain = (captainName || existingTeam.captainName || members[0]).trim().toLowerCase();

        await tx.teamMember.createMany({
          data: members.map((name, idx) => ({
            teamId: existingTeam.id,
            name: name.trim(),
            orderIndex: idx + 1,
            isCaptain: name.trim().toLowerCase() === activeCaptain
          }))
        });
      }

      const newCapName = captainName ? captainName.trim() : (members ? members[0] : existingTeam.captainName);

      return tx.team.update({
        where: { id: existingTeam.id },
        data: {
          name: teamName || existingTeam.name,
          captainName: newCapName,
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
        captainName: updatedTeam.captainName,
        ownerId: updatedTeam.ownerId,
        ownerName: updatedTeam.owner.name,
        version: updatedTeam.version,
        members: updatedTeam.members
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
