import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';
import { isAdminEmail } from '@/lib/roles';
import { teamUpdateSchema } from '@/lib/validations';

// GET /api/teams/[id] — Fetch specific team details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const team = await prisma.team.findUnique({
      where: { id },
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
        { success: false, error: 'Không tìm thấy thông tin đội' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      team: {
        id: team.id,
        slotNumber: team.slotNumber,
        name: team.name,
        captainName: '',
        ownerId: team.ownerId,
        ownerName: team.owner.name,
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
    console.error('Error fetching team:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi máy chủ khi lấy dữ liệu đội' },
      { status: 500 }
    );
  }
}

// PATCH /api/teams/[id] — Team Captain edits their own team
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(req);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng đăng nhập Google để thực hiện' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const existingTeam = await prisma.team.findUnique({
      where: { id },
      include: {
        members: true,
        owner: true
      }
    });

    if (!existingTeam) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy đội để chỉnh sửa' },
        { status: 404 }
      );
    }

    // Authorization: only team owner (captain) or ADMIN can edit this team
    const isOwner =
      existingTeam.ownerId === session.user.id ||
      (session.user.email &&
        existingTeam.owner.email?.toLowerCase() === session.user.email.toLowerCase());

    const isAdmin =
      session.user.role === 'ADMIN' || isAdminEmail(session.user.email);

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Chỉ người đăng ký cho cả đội (đội trưởng) hoặc Admin mới có quyền chỉnh sửa đội này. Bạn chỉ có quyền xem chi tiết.'
        },
        { status: 403 }
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

    // Map old member links (like individualId or isFromIndividual) so they aren't lost
    const oldMemberMap = new Map<string, { individualId: string | null; isFromIndividual: boolean }>();
    existingTeam.members.forEach((m) => {
      if (m.email) {
        oldMemberMap.set(m.email.toLowerCase(), {
          individualId: m.individualId,
          isFromIndividual: m.isFromIndividual
        });
      }
    });

    const updatedTeam = await prisma.$transaction(async (tx) => {
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
            const cleanEmail = email.trim().toLowerCase();

            const oldInfo = cleanEmail ? oldMemberMap.get(cleanEmail) : undefined;

            return {
              teamId: existingTeam.id,
              name: name.trim(),
              studentId: studentId.trim(),
              email: email.trim(),
              phone: phone.trim(),
              orderIndex: idx + 1,
              isCaptain: false,
              individualId: oldInfo?.individualId || null,
              isFromIndividual: oldInfo?.isFromIndividual || false
            };
          })
        });
      }

      return tx.team.update({
        where: { id: existingTeam.id },
        data: {
          name: teamName || existingTeam.name,
          captainName: '',
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
        captainName: '',
        ownerId: updatedTeam.ownerId,
        ownerName: updatedTeam.owner.name,
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
