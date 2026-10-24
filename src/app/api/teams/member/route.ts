import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';
import { z } from 'zod';

const updateMemberSchema = z.object({
  memberId: z.string().optional(),
  individualId: z.string().optional(),
  name: z.string().min(2, 'Họ và tên tối thiểu 2 ký tự').max(50),
  studentId: z.string().min(3, 'MSSV không hợp lệ').max(20),
  phone: z.string().min(8, 'Số điện thoại không hợp lệ').max(20),
  email: z.string().email('Gmail không đúng định dạng')
});

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(req);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng đăng nhập để thực hiện' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parseResult = updateMemberSchema.safeParse(body);
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

    const { memberId, individualId, name, studentId, phone, email } = parseResult.data;
    const cleanName = name.trim();
    const cleanStudentId = studentId.trim();
    const cleanPhone = phone.trim();
    const cleanEmail = email.trim().toLowerCase();

    // Find the target TeamMember
    let targetMember = null;
    if (memberId) {
      targetMember = await prisma.teamMember.findUnique({
        where: { id: memberId },
        include: { team: true }
      });
    } else if (individualId) {
      targetMember = await prisma.teamMember.findFirst({
        where: { individualId },
        include: { team: true }
      });
    } else {
      // Find by session email
      targetMember = await prisma.teamMember.findFirst({
        where: { email: session.user.email?.toLowerCase() },
        include: { team: true }
      });
    }

    if (!targetMember) {
      // If no TeamMember found, check if it's an IndividualRegistration only
      const ind = await prisma.individualRegistration.findFirst({
        where: {
          OR: [
            ...(individualId ? [{ id: individualId }] : []),
            ...(session.user.id ? [{ userId: session.user.id }] : []),
            ...(session.user.email ? [{ email: session.user.email.toLowerCase() }] : [])
          ]
        }
      });

      if (ind) {
        // Update individual record
        const updatedInd = await prisma.individualRegistration.update({
          where: { id: ind.id },
          data: {
            name: cleanName,
            studentId: cleanStudentId,
            phone: cleanPhone,
            email: cleanEmail
          }
        });

        // Also check if teamMember was created with their individualId
        await prisma.teamMember.updateMany({
          where: {
            OR: [
              { individualId: ind.id },
              { email: ind.email }
            ]
          },
          data: {
            name: cleanName,
            studentId: cleanStudentId,
            phone: cleanPhone,
            email: cleanEmail
          }
        });

        return NextResponse.json({
          success: true,
          message: 'Đã cập nhật thông tin cá nhân thành công!',
          data: {
            name: updatedInd.name,
            studentId: updatedInd.studentId,
            phone: updatedInd.phone,
            email: updatedInd.email
          }
        });
      }

      return NextResponse.json(
        { success: false, error: 'Không tìm thấy thông tin thành viên' },
        { status: 404 }
      );
    }

    // Permission check:
    const isAdmin = session.user.role === 'ADMIN';
    const isTeamOwner = targetMember.team?.ownerId === session.user.id;
    const isSelfMember =
      (session.user.email && targetMember.email?.toLowerCase() === session.user.email.toLowerCase()) ||
      (targetMember.individualId && individualId && targetMember.individualId === individualId);

    // Also check if user owns the individual registration
    let isIndOwner = false;
    if (targetMember.individualId) {
      const ind = await prisma.individualRegistration.findUnique({
        where: { id: targetMember.individualId }
      });
      if (ind && (ind.userId === session.user.id || (session.user.email && ind.email.toLowerCase() === session.user.email.toLowerCase()))) {
        isIndOwner = true;
      }
    }

    if (!isAdmin && !isTeamOwner && !isSelfMember && !isIndOwner) {
      return NextResponse.json(
        { success: false, error: 'Bạn chỉ có quyền sửa thông tin của chính mình' },
        { status: 403 }
      );
    }

    // Update in transaction
    await prisma.$transaction(async (tx) => {
      await tx.teamMember.update({
        where: { id: targetMember.id },
        data: {
          name: cleanName,
          studentId: cleanStudentId,
          phone: cleanPhone,
          email: cleanEmail
        }
      });

      // Synchronize IndividualRegistration if linked
      if (targetMember.individualId) {
        await tx.individualRegistration.updateMany({
          where: { id: targetMember.individualId },
          data: {
            name: cleanName,
            studentId: cleanStudentId,
            phone: cleanPhone,
            email: cleanEmail
          }
        });
      } else {
        // Also sync by email if exists
        await tx.individualRegistration.updateMany({
          where: { email: targetMember.email?.toLowerCase() },
          data: {
            name: cleanName,
            studentId: cleanStudentId,
            phone: cleanPhone,
            email: cleanEmail
          }
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Đã cập nhật thông tin thành viên thành công!',
      data: {
        memberId: targetMember.id,
        name: cleanName,
        studentId: cleanStudentId,
        phone: cleanPhone,
        email: cleanEmail
      }
    });
  } catch (error: any) {
    console.error('Error updating team member:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi máy chủ khi cập nhật thông tin thành viên' },
      { status: 500 }
    );
  }
}
