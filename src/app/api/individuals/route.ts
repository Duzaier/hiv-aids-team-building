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
        studentId: i.studentId || '',
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

    const { name, studentId, email, phone } = parseResult.data;
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

    // Create record
    const newInd = await prisma.individualRegistration.create({
      data: {
        userId: session?.user?.id || null,
        name: name.trim(),
        studentId: studentId.trim(),
        email: cleanEmail,
        phone: phone.trim()
      }
    });

    return NextResponse.json(
      {
        success: true,
        message: `Đăng ký cá nhân thành công cho ${newInd.name}! Bạn đang trong danh sách chờ ghép đội ngẫu nhiên.`,
        individual: {
          id: newInd.id,
          name: newInd.name,
          studentId: newInd.studentId,
          email: newInd.email,
          phone: newInd.phone,
          registeredAt: newInd.registeredAt.toISOString().replace('T', ' ').substring(0, 16)
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating individual registration:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi máy chủ khi đăng ký cá nhân' },
      { status: 500 }
    );
  }
}

// PATCH /api/individuals - Update individual registration info
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(req);
    const body = await req.json();

    const { id, name, studentId, email, phone } = body;
    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { success: false, error: "Thiếu mã đăng ký cá nhân cần chỉnh sửa" },
        { status: 400 }
      );
    }

    const parseResult = individualRegistrationSchema.safeParse({ name, studentId, email, phone });
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: parseResult.error.issues?.[0]?.message || "Dữ liệu không hợp lệ",
          validationErrors: parseResult.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const existingInd = await prisma.individualRegistration.findUnique({
      where: { id }
    });

    if (!existingInd) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy thông tin đăng ký cá nhân" },
        { status: 404 }
      );
    }

    // Permission check
    const isAdmin = session?.user?.role === "ADMIN";
    const isOwner =
      (session?.user?.id && existingInd.userId === session.user.id) ||
      (session?.user?.email && existingInd.email.toLowerCase() === session.user.email.toLowerCase());

    if (existingInd.userId && session?.user?.id && existingInd.userId !== session.user.id && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "Bạn không có quyền chỉnh sửa thông tin đăng ký này" },
        { status: 403 }
      );
    }

    const cleanName = parseResult.data.name.trim();
    const cleanStudentId = parseResult.data.studentId.trim();
    const cleanEmail = parseResult.data.email.toLowerCase().trim();
    const cleanPhone = parseResult.data.phone.trim();

    // Check if new email conflicts with another registrant
    if (cleanEmail !== existingInd.email.toLowerCase()) {
      const emailConflict = await prisma.individualRegistration.findFirst({
        where: {
          email: cleanEmail,
          NOT: { id }
        }
      });
      if (emailConflict) {
        return NextResponse.json(
          {
            success: false,
            error: `Email "` + cleanEmail + `" đã được sử dụng bởi một đăng ký khác.`
          },
          { status: 409 }
        );
      }
    }

    // Atomic update both registration and matching team member
    const updated = await prisma.$transaction(async (tx) => {
      const ind = await tx.individualRegistration.update({
        where: { id },
        data: {
          name: cleanName,
          studentId: cleanStudentId,
          email: cleanEmail,
          phone: cleanPhone,
          ...(session?.user?.id && !existingInd.userId ? { userId: session.user.id } : {})
        }
      });

      // Synchronize TeamMember if already assigned to a team
      await tx.teamMember.updateMany({
        where: { individualId: id },
        data: {
          name: cleanName,
          studentId: cleanStudentId,
          email: cleanEmail,
          phone: cleanPhone
        }
      });

      return ind;
    });

    return NextResponse.json({
      success: true,
      message: `Đã cập nhật thông tin đăng ký cá nhân thành công cho ${updated.name}!`,
      individual: {
        id: updated.id,
        name: updated.name,
        studentId: updated.studentId,
        email: updated.email,
        phone: updated.phone,
        assignedTeamId: updated.assignedTeamId,
        assignedSlot: updated.assignedSlot,
        assignedAt: updated.assignedAt ? updated.assignedAt.toISOString().replace("T", " ").substring(0, 16) : null,
        registeredAt: updated.registeredAt.toISOString().replace("T", " ").substring(0, 16)
      }
    });
  } catch (error) {
    console.error("Error updating individual registration:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi máy chủ khi cập nhật thông tin cá nhân" },
      { status: 500 }
    );
  }
}
