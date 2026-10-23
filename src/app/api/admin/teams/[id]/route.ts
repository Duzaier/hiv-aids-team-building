import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';
import { teamUpdateSchema } from '@/lib/validations';

// PATCH /api/admin/teams/[id] â€” Admin updates any team
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(req);
    if (!session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Truy cáº­p bá»‹ tá»« chá»‘i: YÃªu cáº§u quyá»n Quáº£n trá»‹ viÃªn' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const team = await prisma.team.findUnique({
      where: { id },
      include: { members: true }
    });

    if (!team) {
      return NextResponse.json({ success: false, error: 'KhÃ´ng tÃ¬m tháº¥y Ä‘á»™i' }, { status: 404 });
    }

    const body = await req.json();
    const parseResult = teamUpdateSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: parseResult.error.issues?.[0]?.message,
          validationErrors: parseResult.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const { teamName, members } = parseResult.data;

    const updatedTeam = await prisma.$transaction(async (tx) => {
      const updated = await tx.team.update({
        where: { id },
        data: {
          name: teamName || team.name,
          version: { increment: 1 }
        }
      });

      if (members && members.length >= 3 && members.length <= 5) {
        await tx.teamMember.deleteMany({ where: { teamId: id } });
        await tx.teamMember.createMany({
          data: members.map((name, idx) => ({
            teamId: id,
            name,
            orderIndex: idx + 1
          }))
        });
      }

      // Record Audit Log
      await tx.auditLog.create({
        data: {
          adminId: session.user!.id,
          action: 'TEAM_UPDATED',
          targetSlot: team.slotNumber,
          targetTeamName: teamName || team.name,
          details: JSON.stringify({
            previousName: team.name,
            newName: teamName || team.name,
            membersCount: members ? members.length : team.members.length
          })
        }
      });

      return tx.team.findUnique({
        where: { id },
        include: {
          members: { orderBy: { orderIndex: 'asc' } },
          owner: { select: { name: true, email: true } }
        }
      });
    });

    return NextResponse.json({
      success: true,
      message: `Quáº£n trá»‹ viÃªn Ä‘Ã£ cáº­p nháº­t Äá»™i "${updatedTeam?.name}" thÃ nh cÃ´ng`,
      team: updatedTeam
    });
  } catch (error) {
    console.error('Admin PATCH error:', error);
    return NextResponse.json({ success: false, error: 'Lá»—i mÃ¡y chá»§ khi cáº­p nháº­t Ä‘á»™i' }, { status: 500 });
  }
}

// DELETE /api/admin/teams/[id] â€” Admin deletes team and releases slot
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(req);
    if (!session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Truy cáº­p bá»‹ tá»« chá»‘i: YÃªu cáº§u quyá»n Quáº£n trá»‹ viÃªn' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const team = await prisma.team.findUnique({
      where: { id }
    });

    if (!team) {
      return NextResponse.json({ success: false, error: 'KhÃ´ng tÃ¬m tháº¥y Ä‘á»™i Ä‘á»ƒ xÃ³a' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Delete members (or cascade)
      await tx.teamMember.deleteMany({ where: { teamId: id } });

      // 2. Delete team (releases slotNumber and ownerId)
      await tx.team.delete({ where: { id } });

      // 3. Record Audit Log
      await tx.auditLog.create({
        data: {
          adminId: session.user!.id,
          action: 'TEAM_DELETED',
          targetSlot: team.slotNumber,
          targetTeamName: team.name,
          details: JSON.stringify({
            slotReleased: team.slotNumber,
            reason: 'Quáº£n trá»‹ viÃªn xÃ³a Ä‘á»™i vÃ  giáº£i phÃ³ng slot'
          })
        }
      });
    });

    return NextResponse.json({
      success: true,
      message: `ÄÃ£ xÃ³a Ä‘á»™i "${team.name}". Vá»‹ trÃ­ Slot #${team.slotNumber} Ä‘Ã£ Ä‘Æ°á»£c giáº£i phÃ³ng thÃ nh cÃ´ng.`
    });
  } catch (error) {
    console.error('Admin DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Lá»—i mÃ¡y chá»§ khi xÃ³a Ä‘á»™i' }, { status: 500 });
  }
}