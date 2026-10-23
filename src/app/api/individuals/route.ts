import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';
import { individualRegistrationSchema } from '@/lib/validations';

// GET /api/individuals - List all individual registrants
export async function GET() {
  try {
    const individuals = await prisma.individualRegistration.findMany({
      orderBy: { registeredAt: 'asc' }
    });

    const totalCount = individuals.length;
    const assignedCount = individuals.filter((i) => !!i.assignedTeamId).length;
    const waitingCount = totalCount - assignedCount;

    return NextResponse.json({
      success: true,
      totalCount,
      assignedCount,
      waitingCount,
      individuals: individuals.map((i) => ({
        id: i.id,
        userId: i.userId,
        name: i.name,
        email: i.email,
        phone: i.phone || '',
        assignedTeamId: i.assignedTeamId,
        assignedSlot: i.assignedSlot,
        assignedAt: i.assignedAt ? i.assignedAt.toISOString().replace('T', ' ').substring(0, 16) : null,
        registeredAt: i.registeredAt.toISOString().replace('T', ' ').substring(0, 16)
      }))
    });
  } catch (error) {
    console.error('Error fetching individuals:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi máy chủ khi tải danh sách cá nhân' },
      { status: 500 }
    );
  }
}

// POST /api/individuals - Register as an individual
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(req);
    const body = await req.json();

    const parseResult = individualRegistrationSchema.safeParse(body);
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

    const { name, email, phone } = parseResult.data;
    const cleanEmail = email.toLowerCase().trim();

    // Check if user already registered individually
    const existingInd = await prisma.individualRegistration.findFirst({
      where: {
        OR: [
          { email: cleanEmail },
          ...(session?.user?.id ? [{ userId: session.user.id }] : [])
        ]
      }
    });

    if (existingInd) {
      return NextResponse.json(
        {
          success: false,
          error: `Email "${cleanEmail}" đã được đăng ký trong danh sách cá nhân trước đó.`
        },
        { status: 409 }
      );
    }

    // Check if user already owns a team
    if (session?.user?.id) {
      const ownedTeam = await prisma.team.findUnique({
        where: { ownerId: session.user.id }
      });
      if (ownedTeam) {
        return NextResponse.json(
          {
            success: false,
            error: `Tài khoản của bạn đã là người đăng ký ${ownedTeam.name} (Slot #${ownedTeam.slotNumber}). Không thể đăng ký thêm vào diện cá nhân.`
          },
          { status: 409 }
        );
      }
    }

    const newInd = await prisma.individualRegistration.create({
      data: {
        userId: session?.user?.id || null,
        name: name.trim(),
        email: cleanEmail,
        phone: phone?.trim() || null
      }
    });

    return NextResponse.json(
      {
        success: true,
        message: `Đăng ký cá nhân thành công cho ${newInd.name}! Bạn đang trong danh sách chờ ghép đội ngẫu nhiên.`,
        individual: {
          id: newInd.id,
          name: newInd.name,
          email: newInd.email,
          phone: newInd.phone,
          assignedSlot: null,
          registeredAt: newInd.registeredAt.toISOString().replace('T', ' ').substring(0, 16)
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in individual registration:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi máy chủ khi đăng ký cá nhân' },
      { status: 500 }
    );
  }
}
