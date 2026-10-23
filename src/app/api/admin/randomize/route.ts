import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

// POST /api/admin/randomize - Randomly allocate unassigned individuals to teams with < 5 members
export async function POST(req: NextRequest) {
  try {
    const adminUser = await requireAdmin(req);

    // Run within atomic transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch all registered teams with current members
      const teams = await tx.team.findMany({
        include: {
          members: {
            orderBy: { orderIndex: 'asc' }
          }
        },
        orderBy: { slotNumber: 'asc' }
      });

      if (teams.length === 0) {
        throw new Error('NO_TEAMS');
      }

      // Teams that have fewer than 5 members
      const needyTeams = teams.filter((t) => t.members.length < 5);
      if (needyTeams.length === 0) {
        throw new Error('ALL_TEAMS_FULL');
      }

      // 2. Fetch all unassigned individuals
      const waitingIndividuals = await tx.individualRegistration.findMany({
        where: { assignedTeamId: null }
      });

      if (waitingIndividuals.length === 0) {
        throw new Error('NO_WAITING_INDIVIDUALS');
      }

      // 3. Shuffle individuals array randomly (Fisher-Yates)
      const shuffled = [...waitingIndividuals];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      // 4. Distribute individuals into needy teams until full or out of individuals
      const assignments: Array<{
        individualId: string;
        individualName: string;
        teamId: string;
        teamName: string;
        slotNumber: number;
      }> = [];

      let individualIndex = 0;

      // Round-robin or sequential fill up to 5 members per team
      for (const team of needyTeams) {
        let currentCount = team.members.length;

        while (currentCount < 5 && individualIndex < shuffled.length) {
          const person = shuffled[individualIndex];
          individualIndex++;
          currentCount++;

          // Create TeamMember with MSSV, email, phone
          await tx.teamMember.create({
            data: {
              teamId: team.id,
              name: person.name,
              studentId: person.studentId || '',
              email: person.email || '',
              phone: person.phone || '',
              orderIndex: currentCount,
              isCaptain: false,
              isFromIndividual: true,
              individualId: person.id
            }
          });

          // Update IndividualRegistration record
          await tx.individualRegistration.update({
            where: { id: person.id },
            data: {
              assignedTeamId: team.id,
              assignedSlot: team.slotNumber,
              assignedAt: new Date()
            }
          });

          assignments.push({
            individualId: person.id,
            individualName: person.name,
            teamId: team.id,
            teamName: team.name,
            slotNumber: team.slotNumber
          });
        }

        if (individualIndex >= shuffled.length) {
          break;
        }
      }

      // Audit Log
      await tx.auditLog.create({
        data: {
          adminId: adminUser.id,
          action: 'RANDOM_ALLOCATION',
          targetSlot: 0,
          targetTeamName: 'Hệ thống Random',
          details: `Đã phân bổ ngẫu nhiên ${assignments.length} cá nhân vào các đội còn thiếu slot`
        }
      });

      return {
        assignedCount: assignments.length,
        assignments
      };
    });

    return NextResponse.json({
      success: true,
      message: `Đã phân bổ ngẫu nhiên thành công ${result.assignedCount} cá nhân vào các đội còn thiếu thành viên!`,
      assignedCount: result.assignedCount,
      assignments: result.assignments
    });
  } catch (error: any) {
    if (error?.message === 'NO_TEAMS') {
      return NextResponse.json(
        { success: false, error: 'Chưa có đội nào đăng ký thi đấu. Cần có ít nhất 1 đội để tiến hành ghép thành viên!' },
        { status: 400 }
      );
    }
    if (error?.message === 'ALL_TEAMS_FULL') {
      return NextResponse.json(
        { success: false, error: 'Tất cả các đội thi đấu hiện tại đều đã đủ tối đa 5 thành viên!' },
        { status: 400 }
      );
    }
    if (error?.message === 'NO_WAITING_INDIVIDUALS') {
      return NextResponse.json(
        { success: false, error: 'Hiện không có cá nhân nào trong danh sách chờ ghép đội!' },
        { status: 400 }
      );
    }

    console.error('Error in random allocation:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Lỗi máy chủ khi phân bổ ngẫu nhiên' },
      { status: 500 }
    );
  }
}
