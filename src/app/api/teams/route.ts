import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';
import { teamRegistrationSchema } from '@/lib/validations';

// GET /api/teams - Public read access
export async function GET() {
  try {
    const teams = await prisma.team.findMany({
      include: {
        members: {
          orderBy: { orderIndex: 'asc' }
        },
        owner: {
          select: { id: true, name: true, email: true, image: true }
        }
      },
      orderBy: { slotNumber: 'asc' }
    });

    const occupiedSlots = new Set(teams.map((t) => t.slotNumber));
    const availableSlots = [1, 2, 3, 4, 5, 6].filter((s) => !occupiedSlots.has(s));

    return NextResponse.json({
      success: true,
      totalCapacity: 6,
      occupiedCount: teams.length,
      availableCount: availableSlots.length,
      availableSlots,
      teams: teams.map((t) => ({
        id: t.id,
        slotNumber: t.slotNumber,
        name: t.name || `Đội ${t.slotNumber}`,
        captainName: '',
        ownerId: t.ownerId,
        ownerName: t.owner.name || 'Người dùng',
        ownerEmail: t.owner.email || '',
        registeredAt: t.registeredAt.toISOString().replace('T', ' ').substring(0, 16),
        members: t.members.map((m) => ({
          id: m.id,
          name: m.name,
          studentId: m.studentId || '',
          email: m.email || '',
          phone: m.phone || '',
          orderIndex: m.orderIndex,
          isCaptain: false,
          isFromIndividual: m.isFromIndividual || false,
          individualId: m.individualId || null
        }))
      }))
    });
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi máy chủ khi tải danh sách đội' },
      { status: 500 }
    );
  }
}

// POST /api/teams - Concurrency-safe atomic registration
export async function POST(req: NextRequest) {
  try {
    // 1. Check Authentication
    const session = await getServerSession(req);
    if (!session.user || !session.user.email) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng đăng nhập Google để đăng ký đội' },
        { status: 401 }
      );
    }

    const email = session.user.email.toLowerCase().trim();
    let dbUser = await prisma.user.findUnique({
      where: { email }
    });

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          email,
          name: session.user.name || email.split('@')[0],
          role: session.user.role || 'USER',
          image: session.user.image || undefined
        }
      });
    }

    const userId = dbUser.id;

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

    const { members } = parseResult.data;

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

      const teamName = `Đội ${assignedSlot}`;

      // Create team and members atomically
      const createdTeam = await tx.team.create({
        data: {
          slotNumber: assignedSlot,
          name: teamName,
          captainName: '',
          ownerId: userId,
          members: {
            create: members.map((mem: any, idx: number) => {
              const name = typeof mem === 'string' ? mem : mem.name;
              const studentId = typeof mem === 'object' ? mem.studentId || '' : '';
              const memEmail = typeof mem === 'object' ? mem.email || '' : '';
              const phone = typeof mem === 'object' ? mem.phone || '' : '';
              return {
                name: name.trim(),
                studentId: studentId.trim(),
                email: memEmail.trim(),
                phone: phone.trim(),
                orderIndex: idx + 1,
                isCaptain: false,
                isFromIndividual: false
              };
            })
          }
        },
        include: {
          members: {
            orderBy: { orderIndex: 'asc' }
          },
          owner: {
            select: { id: true, name: true, email: true }
          }
        }
      });

      return createdTeam;
    });

    return NextResponse.json(
      {
        success: true,
        message: `Đăng ký thành công ${newTeam.name} vào Vị trí Slot #${newTeam.slotNumber}`,
        team: {
          id: newTeam.id,
          slotNumber: newTeam.slotNumber,
          name: newTeam.name,
          captainName: '',
          ownerId: newTeam.ownerId,
          ownerName: newTeam.owner.name,
          ownerEmail: newTeam.owner.email,
          registeredAt: newTeam.registeredAt.toISOString().replace('T', ' ').substring(0, 16),
          members: newTeam.members.map((m) => ({
            id: m.id,
            name: m.name,
            studentId: m.studentId || '',
            email: m.email || '',
            phone: m.phone || '',
            orderIndex: m.orderIndex,
            isCaptain: false,
            isFromIndividual: false
          }))
        }
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error?.message === 'CAPACITY_FULL') {
      return NextResponse.json(
        {
          success: false,
          error: 'Cổng đăng ký vừa hoàn tất slot cuối cùng (đủ 6/6 đội). Rất tiếc vị trí đã hết!'
        },
        { status: 409 }
      );
    }

    console.error('Registration Transaction Error:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi giao dịch máy chủ khi cấp slot' },
      { status: 500 }
    );
  }
}