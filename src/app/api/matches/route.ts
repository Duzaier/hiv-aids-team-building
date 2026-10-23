import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

// GET /api/matches - Fetch pending match requests
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(req);
    const userEmail = session.user?.email?.toLowerCase().trim();

    // Fetch all PENDING match requests
    const matches = await prisma.teamMatchRequest.findMany({
      where: {
        status: 'PENDING'
      },
      include: {
        fromTeam: {
          include: {
            members: { orderBy: { orderIndex: 'asc' } },
            owner: { select: { id: true, name: true, email: true } }
          }
        },
        toTeam: {
          include: {
            members: { orderBy: { orderIndex: 'asc' } },
            owner: { select: { id: true, name: true, email: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedMatches = matches.map((m) => ({
      id: m.id,
      fromTeamId: m.fromTeamId,
      fromTeamName: m.fromTeam.name,
      fromSlotNumber: m.fromTeam.slotNumber,
      fromMembersCount: m.fromTeam.members.length,
      fromMembers: m.fromTeam.members.map((mem) => ({
        id: mem.id,
        name: mem.name,
        orderIndex: mem.orderIndex,
        isCaptain: mem.isCaptain,
        isFromIndividual: mem.isFromIndividual
      })),
      toTeamId: m.toTeamId,
      toTeamName: m.toTeam.name,
      toSlotNumber: m.toTeam.slotNumber,
      toMembersCount: m.toTeam.members.length,
      status: m.status,
      requestedBy: m.requestedBy,
      createdAt: m.createdAt.toISOString().replace('T', ' ').substring(0, 16)
    }));

    return NextResponse.json({
      success: true,
      matches: formattedMatches
    });
  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi máy chủ khi tải danh sách yêu cầu ghép đội' },
      { status: 500 }
    );
  }
}

// POST /api/matches - Create a match request from fromTeamId to toTeamId
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(req);
    if (!session.user || !session.user.email) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng đăng nhập để gửi yêu cầu gộp đội' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { fromTeamId, toTeamId } = body;

    if (!fromTeamId || !toTeamId) {
      return NextResponse.json(
        { success: false, error: 'Thiếu thông tin đội nguồn hoặc đội đích' },
        { status: 400 }
      );
    }

    if (fromTeamId === toTeamId) {
      return NextResponse.json(
        { success: false, error: 'Không thể gộp một đội vào chính nó' },
        { status: 400 }
      );
    }

    // Find user in DB
    const email = session.user.email.toLowerCase().trim();
    const dbUser = await prisma.user.findUnique({
      where: { email }
    });

    if (!dbUser) {
      return NextResponse.json(
        { success: false, error: 'Tài khoản người dùng không tồn tại' },
        { status: 404 }
      );
    }

    // Fetch both teams
    const [fromTeam, toTeam] = await Promise.all([
      prisma.team.findUnique({
        where: { id: fromTeamId },
        include: { members: true, owner: true }
      }),
      prisma.team.findUnique({
        where: { id: toTeamId },
        include: { members: true, owner: true }
      })
    ]);

    if (!fromTeam) {
      return NextResponse.json(
        { success: false, error: 'Đội của bạn không tồn tại hoặc đã được gộp/giải phóng' },
        { status: 404 }
      );
    }

    if (!toTeam) {
      return NextResponse.json(
        { success: false, error: 'Đội muốn gộp vào không tồn tại' },
        { status: 404 }
      );
    }

    // Check ownership or admin
    const isAdmin = session.user.role === 'ADMIN' || dbUser.role === 'ADMIN';
    const isOwner = fromTeam.ownerId === dbUser.id;

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Bạn không có quyền gửi yêu cầu gộp cho đội này' },
        { status: 403 }
      );
    }

    // Check capacity: sum of members must be <= 5
    const fromCount = fromTeam.members.length;
    const toCount = toTeam.members.length;
    const totalCount = fromCount + toCount;

    if (totalCount > 5) {
      const remainingInTarget = 5 - toCount;
      return NextResponse.json(
        {
          success: false,
          error: `${toTeam.name} chỉ còn trống ${remainingInTarget} slot, không đủ cho ${fromCount} thành viên của ${fromTeam.name} (tối đa 5 người/đội).`
        },
        { status: 400 }
      );
    }

    // Check if an existing PENDING request exists between these teams
    const existingRequest = await prisma.teamMatchRequest.findFirst({
      where: {
        fromTeamId,
        toTeamId,
        status: 'PENDING'
      }
    });

    if (existingRequest) {
      return NextResponse.json(
        { success: false, error: `Yêu cầu gộp từ ${fromTeam.name} vào ${toTeam.name} đã được gửi trước đó và đang chờ duyệt.` },
        { status: 400 }
      );
    }

    // Create match request
    const newMatch = await prisma.teamMatchRequest.create({
      data: {
        fromTeamId,
        toTeamId,
        status: 'PENDING',
        requestedBy: dbUser.id
      }
    });

    return NextResponse.json({
      success: true,
      message: `Đã gửi yêu cầu gộp ${fromTeam.name} (${fromCount} người) vào ${toTeam.name} (${toCount}/5 người)! Đang chờ người đại diện ${toTeam.name} hoặc Admin xác nhận.`,
      matchId: newMatch.id
    });
  } catch (error) {
    console.error('Error creating match request:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi máy chủ khi tạo yêu cầu gộp đội' },
      { status: 500 }
    );
  }
}