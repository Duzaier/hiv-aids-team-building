import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { teamUpdateSchema } from '@/lib/validations';

// PATCH /api/admin/teams/[id] — Admin edit team
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser = await requireAdmin(req);
    const { id } = await params;

    const existingTeam = await prisma.team.findUnique({
      where: { id },
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

      const saved = await tx.team.update({
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

      // Audit Log
      await tx.auditLog.create({
        data: {
          adminId: adminUser.id,
          action: 'ADMIN_UPDATE_TEAM',
          targetSlot: saved.slotNumber,
          targetTeamName: saved.name,
          details: `Admin cập nhật tên hoặc thành viên đội ${saved.name} (Đội trưởng: ${saved.captainName})`
        }
      });

      return saved;
    });

    return NextResponse.json({
      success: true,
      message: `Admin đã cập nhật thành công Đội "${updatedTeam.name}"`,
      team: updatedTeam
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED_ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Chỉ Quản trị viên mới có quyền thực hiện' },
        { status: 403 }
      );
    }

    console.error('Admin edit error:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi máy chủ khi admin cập nhật thông tin đội' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/teams/[id] — Admin release slot
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser = await requireAdmin(req);
    const { id } = await params;

    const existingTeam = await prisma.team.findUnique({
      where: { id }
    });

    if (!existingTeam) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy đội để giải phóng slot' },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.team.delete({
        where: { id }
      });

      await tx.auditLog.create({
        data: {
          adminId: adminUser.id,
          action: 'ADMIN_RELEASE_SLOT',
          targetSlot: existingTeam.slotNumber,
          targetTeamName: existingTeam.name,
          details: `Admin đã giải phóng Slot #${existingTeam.slotNumber} (trước đó là ${existingTeam.name})`
        }
      });
    });

    return NextResponse.json({
      success: true,
      message: `Đã xóa Đội "${existingTeam.name}" và giải phóng Vị trí Slot #${existingTeam.slotNumber}`,
      releasedSlot: existingTeam.slotNumber
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED_ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Chỉ Quản trị viên mới có quyền thực hiện' },
        { status: 403 }
      );
    }

    console.error('Admin delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi máy chủ khi giải phóng slot' },
      { status: 500 }
    );
  }
}
