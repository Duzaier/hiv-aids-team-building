import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';
import { isAdminEmail } from '@/lib/roles';


export async function GET(req: Request) {
  try {
    const session = await getServerSession(req);
    const currentUser = session?.user;

    const isAdmin =
      currentUser &&
      (currentUser.role === 'ADMIN' || isAdminEmail(currentUser.email));

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Chỉ Quản trị viên (Admin) mới có quyền xuất dữ liệu.' },
        { status: 403 }
      );
    }

    // 1. Fetch all teams and members
    const teams = await prisma.team.findMany({
      include: {
        owner: true,
        members: {
          orderBy: { orderIndex: 'asc' }
        }
      },
      orderBy: { slotNumber: 'asc' }
    });

    // 2. Fetch all individual registrations
    const individuals = await prisma.individualRegistration.findMany({
      orderBy: { registeredAt: 'asc' }
    });

    const rows: Array<{
      stt: number;
      name: string;
      studentId: string;
      email: string;
      phone: string;
      teamName: string;
      slotNumber: number | string;
      role: string;
      registrationType: string;
      registeredAt: string;
    }> = [];

    let counter = 1;

    // A. Add team members
    for (const team of teams) {
      team.members.forEach((member, index) => {
        let role = 'Thành viên đội';
        if (member.isCaptain || index === 0) {
          role = 'Đại diện / Đội trưởng';
        }

        const registrationType = member.isFromIndividual
          ? 'Cá nhân ghép vào đội'
          : 'Đăng ký theo đội';

        rows.push({
          stt: counter++,
          name: member.name || '',
          studentId: member.studentId || '',
          email: member.email || '',
          phone: member.phone || '',
          teamName: team.name,
          slotNumber: team.slotNumber,
          role,
          registrationType,
          registeredAt: new Date(team.registeredAt).toLocaleString('vi-VN', {
            timeZone: 'Asia/Ho_Chi_Minh'
          })
        });
      });
    }

    // B. Add waiting individuals who are not yet assigned to any team
    const waitingIndividuals = individuals.filter((ind) => !ind.assignedTeamId);
    for (const ind of waitingIndividuals) {
      rows.push({
        stt: counter++,
        name: ind.name || '',
        studentId: ind.studentId || '',
        email: ind.email || '',
        phone: ind.phone || '',
        teamName: 'Chờ ghép đội',
        slotNumber: '—',
        role: 'Cá nhân tự do',
        registrationType: 'Hàng chờ cá nhân',
        registeredAt: new Date(ind.registeredAt).toLocaleString('vi-VN', {
          timeZone: 'Asia/Ho_Chi_Minh'
        })
      });
    }

    const assignedIndividualsCount = individuals.filter((ind) => ind.assignedTeamId).length;

    return NextResponse.json({
      success: true,
      newSheetUrl: 'https://sheets.new',
      exportedAt: new Date().toISOString(),
      stats: {
        totalRows: rows.length,
        teamCount: teams.length,
        teamMembersCount: rows.length - waitingIndividuals.length,
        waitingIndividualsCount: waitingIndividuals.length,
        assignedIndividualsCount
      },
      rows
    });
  } catch (error: any) {
    console.error('[API Admin Export Error]:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Có lỗi xảy ra khi trích xuất dữ liệu.' },
      { status: 500 }
    );
  }
}
