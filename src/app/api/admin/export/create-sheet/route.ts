import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';
import { isAdminEmail } from '@/lib/roles';

const APPS_SCRIPT_WEBAPP_URL =
  'https://script.google.com/macros/s/AKfycbxVTTqfQqYQeO5jONWmXu_HGEawjpyC6j6wPMM5Cr6TGODMBfsE4GGLirPKaTyTfs0Jew/exec';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(req);
    const currentUser = session?.user;

    const isAdmin =
      currentUser &&
      (currentUser.role === 'ADMIN' || isAdminEmail(currentUser.email));

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Chỉ Quản trị viên (Admin) mới có quyền tạo Google Sheet.' },
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

    const headers = [
      'STT',
      'Họ và tên',
      'MSSV',
      'Email (Gmail)',
      'Số điện thoại (Zalo)',
      'Đội tham gia',
      'Vai trò',
      'Hình thức đăng ký',
      'Thời gian ghi danh'
    ];

    const dataRows: (string | number)[][] = [];
    let counter = 1;

    // A. Team members
    for (const team of teams) {
      team.members.forEach((member, index) => {
        let role = 'Thành viên đội';
        if (member.isCaptain || index === 0) {
          role = 'Đại diện / Đội trưởng';
        }

        const registrationType = member.isFromIndividual
          ? 'Cá nhân ghép vào đội'
          : 'Đăng ký theo đội';

        dataRows.push([
          counter++,
          member.name || '',
          member.studentId || '—',
          member.email || '',
          member.phone || '—',
          team.name,
          role,
          registrationType,
          new Date(team.registeredAt).toLocaleString('vi-VN', {
            timeZone: 'Asia/Ho_Chi_Minh'
          })
        ]);
      });
    }

    // B. Waiting individuals
    const waitingIndividuals = individuals.filter((ind) => !ind.assignedTeamId);
    for (const ind of waitingIndividuals) {
      dataRows.push([
        counter++,
        ind.name || '',
        ind.studentId || '—',
        ind.email || '',
        ind.phone || '—',
        'Chờ ghép đội',
        'Cá nhân tự do',
        'Hàng chờ cá nhân',
        new Date(ind.registeredAt).toLocaleString('vi-VN', {
          timeZone: 'Asia/Ho_Chi_Minh'
        })
      ]);
    }

    // Combined rows starting with headers
    const allRows = [headers, ...dataRows];

    // 3. Call Apps Script to create spreadsheet and fill rows
    const res = await fetch(APPS_SCRIPT_WEBAPP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ rows: allRows }),
      redirect: 'follow'
    });

    const responseText = await res.text();
    const cleanText = responseText.split('\\/').join('/');
    const match = cleanText.match(/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);

    if (!match || !match[1]) {
      throw new Error('Không thể trích xuất liên kết Google Sheet mới từ dịch vụ Google Apps Script.');
    }

    const newSpreadsheetUrl = `https://docs.google.com/spreadsheets/d/${match[1]}/edit`;

    return NextResponse.json({
      success: true,
      url: newSpreadsheetUrl,
      rowCount: dataRows.length
    });
  } catch (err: any) {
    console.error('[Create Google Sheet Error]:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Có lỗi khi tạo và điền dữ liệu vào Google Sheet mới.' },
      { status: 500 }
    );
  }
}
