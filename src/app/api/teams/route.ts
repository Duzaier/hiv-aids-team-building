import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';
import { teamRegistrationSchema } from '@/lib/validations';

// GET /api/teams — Return overview of 6 teams with captain information
export async function GET() {
  try {
    const teams = await prisma.team.findMany({
      orderBy: { slotNumber: 'asc' },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        members: {
          orderBy: { orderIndex: 'asc' },
          select: {
            id: true,
            name: true,
            orderIndex: true,
            isCaptain: true
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
      teams: teams.map((t) => {
        const designatedCaptain =
          t.captainName ||
          t.members.find((m) => m.isCaptain)?.name ||
          t.owner.name ||
          'Chưa chỉ định';

        return {
          id: t.id,
          slotNumber: t.slotNumber,
          name: t.name,
          captainName: designatedCaptain,
          ownerId: t.ownerId,
          ownerName: t.owner.name || 'Người dùng',
          ownerEmail: t.owner.email || '',
          registeredAt: t.registeredAt.toISOString().replace('T', ' ').substring(0, 16),
          members: t.members.map((m) => ({
            id: m.id,
            name: m.name,
            isCaptain: m.isCaptain || m.name.toLowerCase().trim() === designatedCaptain.toLowerCase().trim()
          }))
        };
      })
    });
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi máy chủ khi tải danh sách đội' },
      { status: 500 }
    );
  }
}

// POST /api/teams — Concurrency-safe atomic registration with customizable captain selection
export async function POST(req: NextRequest) {
  try {
    // 1. Check Authentication
    const session = await getServerSession(req);
    if (!session.user) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng đăng nhập Google để đăng ký đội' },
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
          error: parseResult.error.issues?.[0]?.message || 'Dữ liệu không hợp lệ',
          validationErrors: parseResult.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const { teamName, captainName, members } = parseResult.data;

    // 3. Check if user already owns an active team (1 team per user rule)
    const existingUserTeam = await prisma.team.findUnique({
      where: { ownerId: userId }
    });
    if (existingUserTeam) {
      return NextResponse.json(
        {
          success: false,
          error: `Tài khoản của bạn đã sở hữu "${existingUserTeam.name}" (Slot #${existingUserTeam.slotNumber}). Mỗi tài khoản chỉ được đăng ký tối đa 1 đội.`
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

      const trimmedCaptain = captainName.trim().toLowerCase();

      // Create team and members atomically
      const createdTeam = await tx.team.create({
        data: {
          slotNumber: assignedSlot,
          name: teamName,
          captainName: captainName.trim(),
          ownerId: userId,
          members: {
            create: members.map((name, idx) => ({
              name: name.trim(),
              orderIndex: idx + 1,
              isCaptain: name.trim().toLowerCase() === trimmedCaptain
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
        message: `Đăng ký thành công Đội "${newTeam.name}" vào Vị trí Slot #${newTeam.slotNumber}`,
        team: {
          id: newTeam.id,
          slotNumber: newTeam.slotNumber,
          name: newTeam.name,
          captainName: newTeam.captainName,
          ownerId: newTeam.ownerId,
          ownerName: newTeam.owner.name,
          ownerEmail: newTeam.owner.email,
          registeredAt: newTeam.registeredAt.toISOString().replace('T', ' ').substring(0, 16),
          members: newTeam.members
        }
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.message === 'CAPACITY_FULL') {
      return NextResponse.json(
        { success: false, error: 'Đã đạt giới hạn tối đa 6 đội. Đăng ký hiện đã tạm đóng.' },
        { status: 409 }
      );
    }

    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi máy chủ trong quá trình phân bổ slot đăng ký' },
      { status: 500 }
    );
  }
}
