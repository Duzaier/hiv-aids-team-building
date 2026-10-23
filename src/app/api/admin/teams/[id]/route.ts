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

      const saved = await tx.team.update({
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

      // Audit Log
      await tx.auditLog.create({
        data: {
          adminId: adminUser.id,
          action: 'TEAM_UPDATED',
          targetSlot: saved.slotNumber,
          targetTeamName: saved.name,
          details: `Admin ${adminUser.email} đã cập nhật thông tin thành viên Đội ${saved.slotNumber}`
        }
      });

      return saved;
    });

    return NextResponse.json({
      success: true,
      message: 'Cập nhật thông tin đội thành công',
      team: {
        id: updatedTeam.id,
        slotNumber: updatedTeam.slotNumber,
        name: updatedTeam.name,
        captainName: '',
        ownerName: updatedTeam.owner.name,
        ownerEmail: updatedTeam.owner.email,
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
  } catch (error: any) {
    console.error('Admin Edit Team Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi máy chủ khi cập nhật đội' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/teams/[id] — Free team slot
export async function DELETE(
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
        { success: false, error: 'Không tìm thấy đội để giải phóng' },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.team.delete({
        where: { id: existingTeam.id }
      });

      await tx.auditLog.create({
        data: {
          adminId: adminUser.id,
          action: 'SLOT_FREED',
          targetSlot: existingTeam.slotNumber,
          targetTeamName: existingTeam.name,
          details: `Admin đã giải phóng Slot #${existingTeam.slotNumber} (trước đó là ${existingTeam.name})`
        }
      });
    });

    return NextResponse.json({
      success: true,
      message: `Đã xóa Đội "${existingTeam.name}" và giải phóng Vị trí Slot #${existingTeam.slotNumber}`,
      freedSlotNumber: existingTeam.slotNumber
    });
  } catch (error: any) {
    console.error('Admin Free Slot Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi máy chủ khi giải phóng slot' },
      { status: 500 }
    );
  }
}