import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

// POST /api/admin/randomize - Fair balanced distribution of unassigned individuals across teams
export async function POST(req: NextRequest) {
  try {
    const adminUser = await requireAdmin(req);

    // 1. Fetch all unassigned individuals
    const waitingIndividuals = await prisma.individualRegistration.findMany({
      where: { assignedTeamId: null }
    });

    if (waitingIndividuals.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Hiện không có cá nhân nào trong danh sách chờ ghép đội!' },
        { status: 400 }
      );
    }

    // 2. Fetch existing registered teams with current members
    const existingTeams = await prisma.team.findMany({
      include: {
        members: {
          orderBy: { orderIndex: 'asc' }
        }
      },
      orderBy: { slotNumber: 'asc' }
    });

    // 3. Check overall capacity (up to 6 teams, max 5 members each = 30 max capacity)
    const totalCurrentMembers = existingTeams.reduce((sum, t) => sum + t.members.length, 0);
    const maxOverallCapacity = 6 * 5; // 30
    if (totalCurrentMembers >= maxOverallCapacity) {
      return NextResponse.json(
        { success: false, error: 'Tất cả 6 đội thi đấu hiện tại đều đã đủ tối đa 5/5 thành viên!' },
        { status: 400 }
      );
    }

    // 4. Shuffle individuals array randomly (Fisher-Yates)
    const shuffled = [...waitingIndividuals];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // 5. Build dynamic Slot State tracking in memory
    interface SlotCandidate {
      slotNumber: number;
      teamId: string | null;
      name: string;
      currentCount: number;
      isPreExisting: boolean;
    }

    const slots: SlotCandidate[] = [];
    for (let s = 1; s <= 6; s++) {
      const found = existingTeams.find((t) => t.slotNumber === s);
      slots.push({
        slotNumber: s,
        teamId: found ? found.id : null,
        name: found ? found.name : `Đội ${s}`,
        currentCount: found ? found.members.length : 0,
        isPreExisting: !!found
      });
    }

    // 6. Pre-calculate all assignments in memory using fair balanced distribution
    const plannedAssignments: Array<{
      person: typeof shuffled[0];
      slot: SlotCandidate;
      orderIndex: number;
    }> = [];

    for (const person of shuffled) {
      // Prioritize pre-existing teams with room first if any exist
      const preExistingWithRoom = slots.filter((s) => s.isPreExisting && s.currentCount < 5);
      let candidatePool: SlotCandidate[];
      if (preExistingWithRoom.length > 0) {
        candidatePool = preExistingWithRoom;
      } else {
        candidatePool = slots.filter((s) => s.currentCount < 5);
      }

      if (candidatePool.length === 0) {
        break; // All reached 5/5
      }

      // Find minimum currentCount for perfectly balanced distribution
      const minCount = Math.min(...candidatePool.map((s) => s.currentCount));
      const minCandidates = candidatePool.filter((s) => s.currentCount === minCount);
      const chosenSlot = minCandidates[Math.floor(Math.random() * minCandidates.length)];

      chosenSlot.currentCount++;
      plannedAssignments.push({
        person,
        slot: chosenSlot,
        orderIndex: chosenSlot.currentCount
      });
    }

    // 7. Ensure Team records exist for all needed slots
    const slotsNeedingCreation = Array.from(
      new Set(plannedAssignments.filter((p) => !p.slot.teamId).map((p) => p.slot.slotNumber))
    );

    for (const slotNum of slotsNeedingCreation) {
      const slotOwner = await prisma.user.upsert({
        where: { email: `admin.slot${slotNum}@central.org` },
        update: {},
        create: {
          email: `admin.slot${slotNum}@central.org`,
          name: `Ban Tổ Chức (Đội ${slotNum})`,
          role: 'ADMIN'
        }
      });

      const firstPerson = plannedAssignments.find((p) => p.slot.slotNumber === slotNum)?.person;

      const createdTeam = await prisma.team.create({
        data: {
          slotNumber: slotNum,
          name: `Đội ${slotNum}`,
          captainName: firstPerson ? firstPerson.name : '',
          ownerId: slotOwner.id,
          version: 1
        }
      });

      // Update slot teamId in memory
      for (const p of plannedAssignments) {
        if (p.slot.slotNumber === slotNum) {
          p.slot.teamId = createdTeam.id;
        }
      }
    }

    // 8. Execute Member creation and Individual status update
    const finalAssignments: Array<{
      individualId: string;
      individualName: string;
      teamId: string;
      teamName: string;
      slotNumber: number;
    }> = [];

    for (const plan of plannedAssignments) {
      const targetTeamId = plan.slot.teamId!;
      await prisma.teamMember.create({
        data: {
          teamId: targetTeamId,
          name: plan.person.name,
          studentId: plan.person.studentId || '',
          email: plan.person.email || '',
          phone: plan.person.phone || '',
          orderIndex: plan.orderIndex,
          isCaptain: plan.orderIndex === 1,
          isFromIndividual: true,
          individualId: plan.person.id
        }
      });

      await prisma.individualRegistration.update({
        where: { id: plan.person.id },
        data: {
          assignedTeamId: targetTeamId,
          assignedSlot: plan.slot.slotNumber,
          assignedAt: new Date()
        }
      });

      finalAssignments.push({
        individualId: plan.person.id,
        individualName: plan.person.name,
        teamId: targetTeamId,
        teamName: plan.slot.name,
        slotNumber: plan.slot.slotNumber
      });
    }

    // 9. Audit Log
    await prisma.auditLog.create({
      data: {
        adminId: adminUser.id,
        action: 'RANDOM_ALLOCATION',
        targetSlot: 0,
        targetTeamName: 'Hệ thống Chia Đều',
        details: `Đã phân bổ ngẫu nhiên chia đều ${finalAssignments.length} cá nhân vào các đội`
      }
    });

    return NextResponse.json({
      success: true,
      message: `Đã chia đều ${finalAssignments.length} cá nhân vào các đội.`,
      assignedCount: finalAssignments.length,
      assignments: finalAssignments
    });
  } catch (error: any) {
    console.error('Error in random allocation:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Lỗi máy chủ khi phân bổ ngẫu nhiên' },
      { status: 500 }
    );
  }
}
