import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';
import { teamRegistrationSchema } from '@/lib/validations';

// GET /api/teams â€” Return overview of 6 teams (public-safe with member list as configured)
export async function GET() {
  try {
    const teams = await prisma.team.findMany({
      orderBy: { slotNumber: 'asc' },
      include: {
        owner: {
          select: {
            id: true,
            name: true
          }
        },
        members: {
          orderBy: { orderIndex: 'asc' },
          select: {
            id: true,
            name: true,
            orderIndex: true
          }
        }
      }
    });

    const occupiedCount = teams.length;
    const availableSlots = [1, 2, 3, 4, 5, 6].filter(
      (slot) => !teams.some((t) => t.slotNumber === slot)
    );

    return NextResponse.json({
      success: true,
      totalSlots: 6,
      occupiedCount,
      isFull: occupiedCount >= 6,
      availableSlots,
      teams: teams.map((t) => ({
        id: t.id,
        slotNumber: t.slotNumber,
        name: t.name,
        ownerId: t.ownerId,
        ownerName: t.owner.name || 'NgÆ°á»i dÃ¹ng',
        registeredAt: t.registeredAt.toISOString().replace('T', ' ').substring(0, 16),
        members: t.members
      }))
    });
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { success: false, error: 'Lá»—i mÃ¡y chá»§ khi táº£i danh sÃ¡ch Ä‘á»™i' },
      { status: 500 }
    );
  }
}

// POST /api/teams â€” Concurrency-safe atomic registration
export async function POST(req: NextRequest) {
  try {
    // 1. Check Authentication
    const session = await getServerSession(req);
    if (!session.user) {
      return NextResponse.json(
        { success: false, error: 'Vui lÃ²ng Ä‘Äƒng nháº­p Google Ä‘á»ƒ Ä‘Äƒng kÃ½ Ä‘á»™i' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 2. Validate Input Payload with Zod
    const body = await req.json();
    const parseResult = teamRegistrationSchema.safeParse(body);
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

    // 3. Check if user already owns an active team (1 team per user rule)
    const existingUserTeam = await prisma.team.findUnique({
      where: { ownerId: userId }
    });
    if (existingUserTeam) {
      return NextResponse.json(
        {
          success: false,
          error: `TÃ i khoáº£n cá»§a báº¡n Ä‘Ã£ sá»Ÿ há»¯u "${existingUserTeam.name}" (Slot #${existingUserTeam.slotNumber}). Má»—i tÃ i khoáº£n chá»‰ Ä‘Æ°á»£c Ä‘Äƒng kÃ½ tá»‘i Ä‘a 1 Ä‘á»™i.`
        },
        { status: 409 }
      );
    }

    // 4. Atomic Transaction for Concurrency-Safe Slot Allocation
    const newTeam = await prisma.$transaction(async (tx) => {
      // Re-check count within transaction
      const currentTeamCount = await tx.team.count();
      if (currentTeamCount >= 6) {
        throw new Error('CAPACITY_FULL');
      }

      // Find lowest available slot (1 to 6)
      const existingTeams = await tx.team.findMany({
        select: { slotNumber: true }
      });
      const occupiedSlots = new Set(existingTeams.map((t) => t.slotNumber));

      let assignedSlot = -1;
      for (let s = 1; s <= 6; s++) {
        if (!occupiedSlots.has(s)) {
          assignedSlot = s;
          break;
        }
      }

      if (assignedSlot === -1) {
        throw new Error('CAPACITY_FULL');
      }

      // Create team and members atomically
      const createdTeam = await tx.team.create({
        data: {
          slotNumber: assignedSlot,
          name: teamName,
          ownerId: userId,
          members: {
            create: members.map((name, idx) => ({
              name,
              orderIndex: idx + 1
            }))
          }
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

      return createdTeam;
    });

    return NextResponse.json(
      {
        success: true,
        message: `ÄÄƒng kÃ½ thÃ nh cÃ´ng Äá»™i "${newTeam.name}" vÃ o Vá»‹ trÃ­ Slot #${newTeam.slotNumber}`,
        team: {
          id: newTeam.id,
          slotNumber: newTeam.slotNumber,
          name: newTeam.name,
          ownerId: newTeam.ownerId,
          ownerName: newTeam.owner.name,
          registeredAt: newTeam.registeredAt.toISOString().replace('T', ' ').substring(0, 16),
          members: newTeam.members
        }
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.message === 'CAPACITY_FULL') {
      return NextResponse.json(
        { success: false, error: 'ÄÃ£ Ä‘áº¡t giá»›i háº¡n tá»‘i Ä‘a 6 Ä‘á»™i. ÄÄƒng kÃ½ hiá»‡n Ä‘Ã£ táº¡m Ä‘Ã³ng.' },
        { status: 409 }
      );
    }

    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Lá»—i mÃ¡y chá»§ trong quÃ¡ trÃ¬nh phÃ¢n bá»• slot Ä‘Äƒng kÃ½' },
      { status: 500 }
    );
  }
}