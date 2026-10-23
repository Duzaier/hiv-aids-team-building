import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';
import { teamUpdateSchema } from '@/lib/validations';

// GET /api/teams/me â€” Get authenticated owner's team
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(req);
    if (!session.user) {
      return NextResponse.json({ success: false, error: 'ChÆ°a Ä‘Äƒng nháº­p' }, { status: 401 });
    }

    const team = await prisma.team.findUnique({
      where: { ownerId: session.user.id },
      include: {
        members: { orderBy: { orderIndex: 'asc' } }
      }
    });

    return NextResponse.json({
      success: true,
      hasTeam: !!team,
      team: team
        ? {
            id: team.id,
            slotNumber: team.slotNumber,
            name: team.name,
            ownerId: team.ownerId,
            registeredAt: team.registeredAt.toISOString().replace('T', ' ').substring(0, 16),
            members: team.members
          }
        : null
    });
  } catch (error) {
    console.error('Error fetching my team:', error);
    return NextResponse.json({ success: false, error: 'Lá»—i mÃ¡y chá»§' }, { status: 500 });
  }
}

// PATCH /api/teams/me â€” Owner edits their own team
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(req);
    if (!session.user) {
      return NextResponse.json({ success: false, error: 'ChÆ°a Ä‘Äƒng nháº­p' }, { status: 401 });
    }

    const team = await prisma.team.findUnique({
      where: { ownerId: session.user.id },
      include: { members: true }
    });

    if (!team) {
      return NextResponse.json(
        { success: false, error: 'Báº¡n chÆ°a cÃ³ Ä‘á»™i nÃ o Ä‘Æ°á»£c ghi danh Ä‘á»ƒ chá»‰nh sá»­a' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const parseResult = teamUpdateSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: parseResult.error.issues?.[0]?.message || 'Dá»¯ liá»‡u khÃ´ng há»£p lá»‡',
          validationErrors: parseResult.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const { teamName, members } = parseResult.data;

    // Transaction to safely update team & members
    const updatedTeam = await prisma.$transaction(async (tx) => {
      // 1. Update team name if provided
      const updated = await tx.team.update({
        where: { id: team.id },
        data: {
          name: teamName || team.name,
          version: { increment: 1 }
        }
      });

      // 2. If members provided, replace members atomically
      if (members && members.length >= 3 && members.length <= 5) {
        await tx.teamMember.deleteMany({
          where: { teamId: team.id }
        });

        await tx.teamMember.createMany({
          data: members.map((name, idx) => ({
            teamId: team.id,
            name,
            orderIndex: idx + 1
          }))
        });
      }

      return tx.team.findUnique({
        where: { id: team.id },
        include: {
          members: { orderBy: { orderIndex: 'asc' } },
          owner: { select: { name: true } }
        }
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Cáº­p nháº­t thÃ´ng tin Ä‘á»™i thÃ nh cÃ´ng',
      team: updatedTeam
        ? {
            id: updatedTeam.id,
            slotNumber: updatedTeam.slotNumber,
            name: updatedTeam.name,
            ownerId: updatedTeam.ownerId,
            ownerName: updatedTeam.owner.name,
            registeredAt: updatedTeam.registeredAt.toISOString().replace('T', ' ').substring(0, 16),
            members: updatedTeam.members
          }
        : null
    });
  } catch (error) {
    console.error('Error updating team:', error);
    return NextResponse.json({ success: false, error: 'Lá»—i mÃ¡y chá»§ khi cáº­p nháº­t Ä‘á»™i' }, { status: 500 });
  }
}