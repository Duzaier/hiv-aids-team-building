import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession, isAdminEmail } from '@/lib/auth';
import { sendIndividualJoinRequestEmails } from '@/lib/mail';

// GET /api/individual-requests - Fetch pending individual join requests
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(req);
    const userEmail = session.user?.email?.toLowerCase().trim();
    const isAdmin = session?.user?.role === 'ADMIN' || (userEmail && isAdminEmail(userEmail));

    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get('teamId');

    const whereClause: any = {
      status: 'PENDING'
    };

    if (teamId) {
      whereClause.teamId = teamId;
    }

    const requests = await prisma.individualJoinRequest.findMany({
      where: whereClause,
      include: {
        team: {
          include: {
            members: { orderBy: { orderIndex: 'asc' } },
            owner: { select: { id: true, name: true, email: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = requests.map((r) => ({
      id: r.id,
      teamId: r.teamId,
      teamName: r.team.name,
      teamSlotNumber: r.team.slotNumber,
      teamMembersCount: r.team.members.length,
      userId: r.userId,
      name: r.name,
      studentId: r.studentId || '',
      email: r.email,
      phone: r.phone || '',
      status: r.status,
      createdAt: r.createdAt.toISOString().replace('T', ' ').substring(0, 16)
    }));

    return NextResponse.json({
      success: true,
      requests: formatted
    });
  } catch (error) {
    console.error('Error fetching individual requests:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi máy chủ khi tải danh sách yêu cầu cá nhân' },
      { status: 500 }
    );
  }
}

// POST /api/individual-requests - Create a join request from an individual to a team
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(req);
    const body = await req.json();
    const { teamId, name, studentId, email, phone } = body;

    const cleanName = (name || '').trim();
    const cleanStudentId = (studentId || '').trim();
    const cleanEmail = (email || session?.user?.email || '').toLowerCase().trim();
    const cleanPhone = (phone || '').trim();

    if (!teamId) {
      return NextResponse.json(
        { success: false, error: 'Thiếu thông tin đội thi cần tham gia' },
        { status: 400 }
      );
    }

    if (!cleanName) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng nhập họ và tên của bạn' },
        { status: 400 }
      );
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng cung cấp địa chỉ Gmail hợp lệ để nhận kết quả' },
        { status: 400 }
      );
    }

    // Fetch target team with members and owner
    const targetTeam = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: { orderBy: { orderIndex: 'asc' } },
        owner: { select: { id: true, name: true, email: true } }
      }
    });

    if (!targetTeam) {
      return NextResponse.json(
        { success: false, error: 'Đội thi này không tồn tại hoặc đã bị hủy' },
        { status: 404 }
      );
    }

    // Check if team is full (5 members)
    if (targetTeam.members.length >= 5) {
      return NextResponse.json(
        {
          success: false,
          error: `${targetTeam.name} đã đủ 5/5 thành viên, không thể nhận thêm cá nhân.`
        },
        { status: 400 }
      );
    }

    // Check if individual is already a member of this team
    const isAlreadyMember = targetTeam.members.some(
      (m) => m.email && m.email.toLowerCase().trim() === cleanEmail
    );
    if (isAlreadyMember) {
      return NextResponse.json(
        { success: false, error: `Email ${cleanEmail} đã có trong danh sách thành viên của ${targetTeam.name}.` },
        { status: 400 }
      );
    }

    // Check if there is already a PENDING request for this team with this email
    const existingPending = await prisma.individualJoinRequest.findFirst({
      where: {
        teamId,
        email: cleanEmail,
        status: 'PENDING'
      }
    });

    if (existingPending) {
      return NextResponse.json(
        {
          success: false,
          error: `Bạn đã gửi yêu cầu xin gia nhập vào ${targetTeam.name} trước đó và đang chờ duyệt.`
        },
        { status: 400 }
      );
    }

    // Create the join request in DB
    const newRequest = await prisma.individualJoinRequest.create({
      data: {
        teamId,
        userId: session?.user?.id || null,
        name: cleanName,
        studentId: cleanStudentId,
        email: cleanEmail,
        phone: cleanPhone,
        status: 'PENDING'
      }
    });

    // Send email notification to target team captain and Admin
    try {
      await sendIndividualJoinRequestEmails({
        team: targetTeam,
        individual: {
          name: cleanName,
          studentId: cleanStudentId,
          email: cleanEmail,
          phone: cleanPhone
        }
      });
    } catch (mailErr) {
      console.error('[Mail Error] Failed to send individual join notification emails:', mailErr);
    }

    const remainingSlots = 5 - targetTeam.members.length;

    return NextResponse.json({
      success: true,
      message: `Đã gửi yêu cầu tham gia vào ${targetTeam.name} (còn trống ${remainingSlots} slot)! Vui lòng chờ Đội trưởng hoặc Ban Quản Trị duyệt. Bạn sẽ nhận được thông báo qua Gmail.`,
      requestId: newRequest.id
    });
  } catch (error) {
    console.error('Error creating individual join request:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi máy chủ khi gửi yêu cầu tham gia đội' },
      { status: 500 }
    );
  }
}
