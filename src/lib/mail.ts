import nodemailer from 'nodemailer';

export interface TeamMemberInfo {
  id: string;
  name: string;
  studentId?: string | null;
  email?: string | null;
  phone?: string | null;
  isCaptain?: boolean;
}

export interface TeamInfo {
  id: string;
  name: string;
  slotNumber: number;
  owner: {
    id: string;
    name?: string | null;
    email: string;
  };
  members: TeamMemberInfo[];
}

export interface MatchRequestEmailParams {
  fromTeam: TeamInfo;
  toTeam: TeamInfo;
  requesterName: string;
  requesterEmail: string;
}

export interface MatchRequestAcceptedEmailParams {
  fromTeam: TeamInfo;
  toTeam: TeamInfo;
  totalMembers: number;
  responderName: string;
}

export interface MatchRequestRejectedEmailParams {
  fromTeam: TeamInfo;
  toTeam: TeamInfo;
  responderName: string;
}

function getTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465;
  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass }
  });
}

const DEFAULT_ADMIN_EMAIL = 'phudt.ce192043@gmail.com';

function getSender(): { name: string; address: string } {
  const defaultAddress = process.env.SMTP_USER || process.env.GMAIL_USER || DEFAULT_ADMIN_EMAIL;
  const rawFrom = process.env.SMTP_FROM;

  if (rawFrom) {
    const cleaned = rawFrom.replace(/\"/g, '').replace(/\'/g, '').replace(/"/g, '').trim();
    const match = cleaned.match(/^(?:([^<>]+)\s+)?<?([^<\s]+@[^<\s>]+)>?$/);
    if (match) {
      return {
        name: (match[1] || 'HIV/AIDS Team Building').trim(),
        address: match[2].trim()
      };
    }
  }

  return {
    name: 'HIV/AIDS Team Building',
    address: defaultAddress
  };
}

function getAdminEmails(): string[] {
  const emailSet = new Set<string>();
  const adminEmailsRaw = process.env.ADMIN_EMAILS || DEFAULT_ADMIN_EMAIL;
  adminEmailsRaw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
    .forEach((e) => emailSet.add(e));

  emailSet.add(DEFAULT_ADMIN_EMAIL.toLowerCase());
  emailSet.add('phudt.dev@gmail.com');

  return Array.from(emailSet);
}

function getTeamCaptainRecipient(team: TeamInfo): { name: string; emails: string[] } {
  const captainMember = team.members.find((m) => m.isCaptain) || team.members[0];
  const name = captainMember?.name?.trim() || team.owner?.name?.trim() || `Đội trưởng ${team.name}`;

  const emails = new Set<string>();
  if (captainMember?.email?.trim()) {
    emails.add(captainMember.email.trim().toLowerCase());
  }
  if (team.owner?.email?.trim()) {
    emails.add(team.owner.email.trim().toLowerCase());
  }

  return { name, emails: Array.from(emails) };
}

function getVietnamTimestamp(): string {
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(new Date());
  } catch {
    return new Date().toLocaleString('vi-VN');
  }
}

function renderMemberRoster(members: TeamMemberInfo[]): string {
  return members
    .map((m, idx) => {
      const isCaptain = m.isCaptain || idx === 0;
      const roleBadge = isCaptain
        ? `<span style="background-color: #fef3c7; color: #b45309; border: 1px solid #fde68a; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase;">⭐ Đội trưởng</span>`
        : `<span style="background-color: #f1f5f9; color: #475569; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 600;">Thành viên</span>`;

      return `
        <tr style="border-bottom: 1px solid #e2e8f0; ${idx % 2 === 1 ? 'background-color: #fafbfc;' : ''}">
          <td style="padding: 12px 14px; font-size: 13px; font-weight: 700; color: #64748b; text-align: center;">#${idx + 1}</td>
          <td style="padding: 12px 14px; font-size: 14px; font-weight: 600; color: #1e293b;">
            ${m.name}
            ${m.email ? `<div style="font-size: 12px; font-weight: 400; color: #64748b; margin-top: 2px;">✉️ ${m.email}</div>` : ''}
          </td>
          <td style="padding: 12px 14px; font-size: 13px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; color: #0284c7; font-weight: 600;">
            ${m.studentId ? `<span style="background: #e0f2fe; padding: 2px 6px; border-radius: 4px;">${m.studentId}</span>` : '<span style="color:#94a3b8;">--</span>'}
          </td>
          <td style="padding: 12px 14px; font-size: 13px; color: #334155;">
            ${m.phone ? `📞 ${m.phone}` : '<span style="color:#94a3b8;">--</span>'}
          </td>
          <td style="padding: 12px 14px; text-align: right;">
            ${roleBadge}
          </td>
        </tr>
      `;
    })
    .join('');
}

interface MasterEmailOptions {
  badgeText: string;
  badgeBg: string;
  badgeColor: string;
  headerGradient: string;
  headerIcon: string;
  title: string;
  subtitle: string;
  mainHtml: string;
  ctaText?: string;
  ctaUrl?: string;
  ctaBg?: string;
}

function renderMasterEmail(opts: MasterEmailOptions): string {
  const timeStr = getVietnamTimestamp();

  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${opts.title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; line-height: 1.6; color: #1e293b;">
  <div style="background-color: #f1f5f9; padding: 32px 16px;">
    <div style="max-width: 640px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04); border: 1px solid #e2e8f0;">
      
      <div style="background: #0f172a; color: #94a3b8; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; padding: 10px 24px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.08);">
        🎗️ CUỘC THI TÌM HIỂU KIẾN THỨC PHÒNG CHỐNG HIV/AIDS &amp; HÒA NHẬP CỘNG ĐỒNG 🎗️
      </div>

      <div style="background: ${opts.headerGradient}; padding: 36px 32px 32px; color: #ffffff; text-align: center;">
        <div style="display: inline-block; background-color: ${opts.badgeBg}; color: ${opts.badgeColor}; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; padding: 5px 14px; border-radius: 9999px; margin-bottom: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          ${opts.headerIcon} ${opts.badgeText}
        </div>
        <h1 style="margin: 0; font-size: 24px; font-weight: 800; line-height: 1.3; color: #ffffff; letter-spacing: -0.5px;">
          ${opts.title}
        </h1>
        <p style="margin: 10px 0 0; font-size: 14px; color: rgba(255, 255, 255, 0.9); font-weight: 400; max-width: 480px; margin-left: auto; margin-right: auto;">
          ${opts.subtitle}
        </p>
      </div>

      <div style="padding: 32px 28px;">
        ${opts.mainHtml}

        ${opts.ctaText && opts.ctaUrl ? `
          <div style="margin: 32px 0 16px; text-align: center;">
            <a href="${opts.ctaUrl}" target="_blank" style="display: inline-block; background: ${opts.ctaBg || '#4f46e5'}; color: #ffffff !important; font-size: 15px; font-weight: 700; text-decoration: none; padding: 15px 36px; border-radius: 12px; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35); text-align: center;">
              ${opts.ctaText}
            </a>
            <div style="margin-top: 10px; font-size: 12px; color: #94a3b8;">
              (Liên kết mở trực tiếp trang web quản trị và danh sách đội thi)
            </div>
          </div>
        ` : ''}
      </div>

      <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 28px; text-align: center;">
        <p style="margin: 0; font-size: 13px; font-weight: 700; color: #334155;">
          BAN TỔ CHỨC CUỘC THI TÌM HIỂU KIẾN THỨC HIV/AIDS
        </p>
        <p style="margin: 4px 0 0; font-size: 12px; color: #64748b;">
          Cổng thông tin ghép đội và thi đấu trực tuyến chính thức
        </p>
        <div style="margin: 16px 0; height: 1px; background: #e2e8f0;"></div>
        <p style="margin: 0; font-size: 11px; color: #94a3b8; line-height: 1.5;">
          ⏰ Thời gian ghi nhận: <strong>${timeStr} (Giờ Việt Nam)</strong><br>
          📧 Email này được gửi tự động từ hệ thống thông báo ghép đội thi đấu. Vui lòng không phản hồi trực tiếp qua địa chỉ này.
        </p>
      </div>

    </div>
  </div>
</body>
</html>
  `;
}

// 1. KHI ĐỘI A XIN THAM GIA VÀO ĐỘI B
export async function sendTeamMatchRequestEmails({
  fromTeam,
  toTeam,
  requesterName,
  requesterEmail
}: MatchRequestEmailParams) {
  const transporter = getTransporter();
  const appUrl = process.env.NEXTAUTH_URL || 'https://hiv-aids-team-building.vercel.app';
  const fromSender = getSender();

  const toCaptain = getTeamCaptainRecipient(toTeam);
  const adminEmails = getAdminEmails();

  const fromCount = fromTeam.members.length;
  const toCount = toTeam.members.length;
  const totalCount = fromCount + toCount;
  const remainingSlots = 5 - totalCount;

  const rosterHtml = renderMemberRoster(fromTeam.members);

  // Email cho Đội trưởng Đội B
  const captainSubject = `🔔 [Yêu Cầu Mới] Đội ${fromTeam.name} xin gia nhập vào Đội ${toTeam.name} của bạn`;
  const captainBody = `
    <p style="font-size: 15px; margin-top: 0;">
      Kính gửi Đội trưởng <strong>${toCaptain.name}</strong> (Đại diện <strong>${toTeam.name}</strong>),
    </p>
    <p style="font-size: 14px; color: #475569; margin-bottom: 24px;">
      Đội <strong>${fromTeam.name}</strong> (Hiện tại đang giữ <strong>Slot #${fromTeam.slotNumber}</strong>) do <strong>${requesterName}</strong> đại diện vừa chính thức gửi yêu cầu xin ghép toàn bộ thành viên vào <strong>${toTeam.name}</strong> (Slot #${toTeam.slotNumber}) của bạn.
    </p>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px; margin-bottom: 24px;">
      <h3 style="margin: 0 0 14px; font-size: 14px; font-weight: 700; color: #334155; text-transform: uppercase; letter-spacing: 0.5px;">
        📊 Bảng Tóm Tắt Tình Trạng Ghép Đội
      </h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <tr>
          <td style="padding: 8px 0; color: #64748b; width: 45%;">Đội xin gia nhập:</td>
          <td style="padding: 8px 0; font-weight: 700; color: #0284c7;">
            ${fromTeam.name} (Slot #${fromTeam.slotNumber} • ${fromCount} thành viên)
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b;">Đội của bạn hiện tại:</td>
          <td style="padding: 8px 0; font-weight: 700; color: #4f46e5;">
            ${toTeam.name} (Slot #${toTeam.slotNumber} • ${toCount}/5 thành viên)
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b;">Dự kiến sau khi ghép:</td>
          <td style="padding: 8px 0; font-weight: 800; color: #16a34a; font-size: 15px;">
            ${totalCount}/5 thành viên ${remainingSlots === 0 ? '(Đủ đội hoàn hảo - 100%)' : `(Còn trống ${remainingSlots} slot)`}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b;">Quy định giải phóng slot:</td>
          <td style="padding: 8px 0; color: #059669; font-weight: 600;">
            Khi chấp thuận, Slot #${fromTeam.slotNumber} sẽ được tự động mở lại cho các đội khác.
          </td>
        </tr>
      </table>
    </div>

    <h3 style="margin: 24px 0 12px; font-size: 15px; font-weight: 700; color: #1e293b;">
      👥 Danh Sách ${fromCount} Thành Viên Từ ${fromTeam.name} Xin Gia Nhập:
    </h3>
    <div style="border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
      <table style="width: 100%; border-collapse: collapse; text-align: left;">
        <thead>
          <tr style="background: #f1f5f9; color: #475569; font-size: 12px; text-transform: uppercase;">
            <th style="padding: 10px 14px; text-align: center;">STT</th>
            <th style="padding: 10px 14px;">Họ Và Tên</th>
            <th style="padding: 10px 14px;">MSSV</th>
            <th style="padding: 10px 14px;">Số Điện Thoại</th>
            <th style="padding: 10px 14px; text-align: right;">Vai Trò</th>
          </tr>
        </thead>
        <tbody>
          ${rosterHtml}
        </tbody>
      </table>
    </div>

    <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 14px 18px; border-radius: 0 10px 10px 0; margin-bottom: 20px;">
      <p style="margin: 0; font-size: 13px; color: #1e40af; line-height: 1.5;">
        💡 <strong>Hướng dẫn:</strong> Vui lòng đăng nhập vào hệ thống để bấm <strong>"Chấp Thuận"</strong> hoặc <strong>"Từ Chối"</strong>. Kết quả sẽ được tự động gửi về email của Đội trưởng ${fromTeam.name} và Ban Quản Trị.
      </p>
    </div>
  `;

  const captainHtml = renderMasterEmail({
    badgeText: 'Yêu Cầu Ghép Đội Mới',
    badgeBg: '#fef3c7',
    badgeColor: '#b45309',
    headerGradient: 'linear-gradient(135deg, #4338ca 0%, #6366f1 50%, #8b5cf6 100%)',
    headerIcon: '📩',
    title: `Đội ${fromTeam.name} Xin Ghép Vào Đội Bạn`,
    subtitle: `Vui lòng xem thông tin thành viên và quyết định phê duyệt yêu cầu tham gia`,
    mainHtml: captainBody,
    ctaText: '👉 Đăng Nhập & Phê Duyệt Yêu Cầu',
    ctaUrl: appUrl,
    ctaBg: '#4f46e5'
  });

  // Email cho Admin
  const adminSubject = `🛡️ [Admin Alert] Yêu cầu xin ghép đội mới: ${fromTeam.name} ➔ ${toTeam.name}`;
  const adminBody = `
    <p style="font-size: 15px; margin-top: 0;">
      Kính gửi <strong>Ban Quản Trị Cuộc Thi</strong>,
    </p>
    <p style="font-size: 14px; color: #475569; margin-bottom: 20px;">
      Hệ thống vừa ghi nhận một yêu cầu xin ghép đội mới giữa hai đội thi với thông tin chi tiết như sau:
    </p>

    <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 14px; padding: 20px; margin-bottom: 24px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <tr>
          <td style="padding: 8px 0; color: #64748b; width: 38%;">Người gửi yêu cầu:</td>
          <td style="padding: 8px 0; font-weight: 700; color: #0f172a;">
            ${requesterName} (<em>${requesterEmail}</em>)
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b;">Đội xin ghép (Bên A):</td>
          <td style="padding: 8px 0; font-weight: 700; color: #0284c7;">
            ${fromTeam.name} • Slot #${fromTeam.slotNumber} (${fromCount} thành viên)
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b;">Đội nhận ghép (Bên B):</td>
          <td style="padding: 8px 0; font-weight: 700; color: #4f46e5;">
            ${toTeam.name} • Slot #${toTeam.slotNumber} (${toCount}/5 thành viên)
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b;">Đội trưởng Đội B (Người nhận):</td>
          <td style="padding: 8px 0; font-weight: 600; color: #334155;">
            ${toCaptain.name} (${toCaptain.emails.join(', ')})
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b;">Tổng quân số sau ghép:</td>
          <td style="padding: 8px 0; font-weight: 800; color: #16a34a; font-size: 15px;">
            ${totalCount}/5 người ${totalCount <= 5 ? '✅ (Hợp lệ)' : '❌ (Quá tải)'}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b;">Trạng thái giải phóng:</td>
          <td style="padding: 8px 0; color: #d97706; font-weight: 600;">
            Slot #${fromTeam.slotNumber} sẽ được thu hồi và mở lại thành 5 chỗ trống khi duyệt.
          </td>
        </tr>
      </table>
    </div>

    <h3 style="margin: 20px 0 10px; font-size: 14px; font-weight: 700; color: #1e293b;">
      👥 Danh Sách Thành Viên Đội Xin Ghép (${fromTeam.name}):
    </h3>
    <div style="border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
      <table style="width: 100%; border-collapse: collapse; text-align: left;">
        <thead>
          <tr style="background: #f1f5f9; color: #475569; font-size: 12px; text-transform: uppercase;">
            <th style="padding: 10px 14px; text-align: center;">STT</th>
            <th style="padding: 10px 14px;">Họ Và Tên</th>
            <th style="padding: 10px 14px;">MSSV</th>
            <th style="padding: 10px 14px;">Số Điện Thoại</th>
            <th style="padding: 10px 14px; text-align: right;">Vai Trò</th>
          </tr>
        </thead>
        <tbody>
          ${rosterHtml}
        </tbody>
      </table>
    </div>
  `;

  const adminHtml = renderMasterEmail({
    badgeText: 'Admin Notification • Match Request',
    badgeBg: '#e0e7ff',
    badgeColor: '#3730a3',
    headerGradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
    headerIcon: '🛡️',
    title: `Thông Báo Ghép Đội: ${fromTeam.name} ➔ ${toTeam.name}`,
    subtitle: `Ghi nhận yêu cầu xin ghép đội mới trên hệ thống HIV/AIDS Team Building`,
    mainHtml: adminBody,
    ctaText: '🛡️ Mở Bảng Điều Khiển Quản Trị (Admin)',
    ctaUrl: appUrl,
    ctaBg: '#0f172a'
  });

  if (!transporter) {
    return { success: true, simulated: true, toCaptainEmails: toCaptain.emails, adminEmails };
  }

  try {
    const promises: Promise<any>[] = [];

    if (toCaptain.emails.length > 0) {
      promises.push(
        transporter.sendMail({
          from: fromSender,
          to: toCaptain.emails.join(', '),
          subject: captainSubject,
          html: captainHtml
        })
      );
    }

    if (adminEmails.length > 0) {
      promises.push(
        transporter.sendMail({
          from: fromSender,
          to: adminEmails.join(', '),
          subject: adminSubject,
          html: adminHtml
        })
      );
    }

    await Promise.all(promises);
    return { success: true, simulated: false, toCaptainEmails: toCaptain.emails, adminEmails };
  } catch (err) {
    console.error('[Mail Service Error] Failed to send email via SMTP:', err);
    return { success: false, error: err, toCaptainEmails: toCaptain.emails, adminEmails };
  }
}

// 2. KHI YÊU CẦU ĐƯỢC CHẤP THUẬN (ACCEPTED)
export async function sendMatchRequestAcceptedEmails({
  fromTeam,
  toTeam,
  totalMembers,
  responderName
}: MatchRequestAcceptedEmailParams) {
  const transporter = getTransporter();
  const appUrl = process.env.NEXTAUTH_URL || 'https://hiv-aids-team-building.vercel.app';
  const fromSender = getSender();

  const fromCaptain = getTeamCaptainRecipient(fromTeam);
  const toCaptain = getTeamCaptainRecipient(toTeam);
  const adminEmails = getAdminEmails();

  const captainASubject = `🎉 [Chúc Mừng] Yêu cầu xin gia nhập Đội ${toTeam.name} đã được CHẤP THUẬN!`;
  const captainABody = `
    <p style="font-size: 15px; margin-top: 0;">
      Xin chúc mừng <strong>${fromCaptain.name}</strong> và toàn thể thành viên <strong>${fromTeam.name}</strong>,
    </p>
    <p style="font-size: 14px; color: #475569; margin-bottom: 24px;">
      Yêu cầu xin ghép đội vào <strong>${toTeam.name}</strong> (Slot #${toTeam.slotNumber}) của các bạn đã chính thức được <strong>${responderName}</strong> <strong>PHÊ DUYỆT THÀNH CÔNG</strong>!
    </p>

    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 14px; padding: 20px; margin-bottom: 24px;">
      <h3 style="margin: 0 0 12px; font-size: 14px; font-weight: 700; color: #166534; text-transform: uppercase;">
        🏆 Thông Tin Đội Thi Mới Chính Thức
      </h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <tr>
          <td style="padding: 6px 0; color: #4b5563; width: 40%;">Tên đội chính thức:</td>
          <td style="padding: 6px 0; font-weight: 800; color: #15803d; font-size: 15px;">${toTeam.name}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #4b5563;">Vị trí thi đấu:</td>
          <td style="padding: 6px 0; font-weight: 700; color: #0f172a;">Slot #${toTeam.slotNumber}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #4b5563;">Tổng quân số hiện tại:</td>
          <td style="padding: 6px 0; font-weight: 700; color: #16a34a;">${totalMembers}/5 thành viên</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #4b5563;">Trạng thái Slot cũ:</td>
          <td style="padding: 6px 0; color: #0284c7; font-weight: 600;">Slot #${fromTeam.slotNumber} đã được giải phóng trên hệ thống.</td>
        </tr>
      </table>
    </div>

    <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 14px 18px; border-radius: 0 10px 10px 0; margin-bottom: 24px;">
      <p style="margin: 0; font-size: 13px; color: #1e40af; line-height: 1.5;">
        🤝 <strong>Bước tiếp theo:</strong> Hãy liên hệ với Đội trưởng ${toTeam.name} (<strong>${toCaptain.name}</strong> - <em>${toCaptain.emails.join(', ')}</em>) để cùng chuẩn bị thật tốt cho các phần thi sắp tới nhé!
      </p>
    </div>
  `;

  const captainAHtml = renderMasterEmail({
    badgeText: 'Ghép Đội Thành Công',
    badgeBg: '#dcfce7',
    badgeColor: '#15803d',
    headerGradient: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)',
    headerIcon: '✅',
    title: `Chào Mừng Bạn Đến Với ${toTeam.name}!`,
    subtitle: `Yêu cầu xin gia nhập đội đã được chấp thuận hoàn tất`,
    mainHtml: captainABody,
    ctaText: '🎉 Xem Danh Sách Đội Thi Mới',
    ctaUrl: appUrl,
    ctaBg: '#059669'
  });

  const adminSubject = `✅ [Admin Confirm] Ghép đội thành công: ${fromTeam.name} ➔ ${toTeam.name}`;
  const adminBody = `
    <p style="font-size: 15px; margin-top: 0;">
      Kính gửi <strong>Ban Quản Trị Cuộc Thi</strong>,
    </p>
    <p style="font-size: 14px; color: #475569; margin-bottom: 20px;">
      Hệ thống xác nhận giao dịch ghép đội đã được thực thi thành công bởi <strong>${responderName}</strong>:
    </p>

    <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 14px; padding: 20px; margin-bottom: 24px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <tr>
          <td style="padding: 6px 0; color: #64748b; width: 40%;">Đội nguồn (Đã giải phóng):</td>
          <td style="padding: 6px 0; font-weight: 700; color: #0284c7;">${fromTeam.name} (Slot #${fromTeam.slotNumber})</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Đội đích tiếp nhận:</td>
          <td style="padding: 6px 0; font-weight: 700; color: #15803d;">${toTeam.name} (Slot #${toTeam.slotNumber})</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Tổng quân số sau ghép:</td>
          <td style="padding: 6px 0; font-weight: 800; color: #16a34a; font-size: 14px;">${totalMembers}/5 người</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Người phê duyệt:</td>
          <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${responderName}</td>
        </tr>
      </table>
    </div>
  `;

  const adminHtml = renderMasterEmail({
    badgeText: 'Admin Log • Team Merged',
    badgeBg: '#dcfce7',
    badgeColor: '#166534',
    headerGradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
    headerIcon: '🛡️',
    title: `Giao Dịch Ghép Đội Hoàn Tất`,
    subtitle: `${fromTeam.name} đã nhập vào ${toTeam.name} (Tổng ${totalMembers}/5 người)`,
    mainHtml: adminBody,
    ctaText: '🛡️ Kiểm Tra Bảng Quản Trị',
    ctaUrl: appUrl,
    ctaBg: '#0f172a'
  });

  if (!transporter) {
    return { success: true, simulated: true, fromCaptainEmails: fromCaptain.emails, adminEmails };
  }

  try {
    const promises: Promise<any>[] = [];
    if (fromCaptain.emails.length > 0) {
      promises.push(
        transporter.sendMail({
          from: fromSender,
          to: fromCaptain.emails.join(', '),
          subject: captainASubject,
          html: captainAHtml
        })
      );
    }
    if (adminEmails.length > 0) {
      promises.push(
        transporter.sendMail({
          from: fromSender,
          to: adminEmails.join(', '),
          subject: adminSubject,
          html: adminHtml
        })
      );
    }

    await Promise.all(promises);
    return { success: true, simulated: false, fromCaptainEmails: fromCaptain.emails, adminEmails };
  } catch (err) {
    console.error('[Mail Service Error] Failed to send acceptance emails:', err);
    return { success: false, error: err, fromCaptainEmails: fromCaptain.emails, adminEmails };
  }
}

// 3. KHI YÊU CẦU BỊ TỪ CHỐI (REJECTED)
export async function sendMatchRequestRejectedEmails({
  fromTeam,
  toTeam,
  responderName
}: MatchRequestRejectedEmailParams) {
  const transporter = getTransporter();
  const appUrl = process.env.NEXTAUTH_URL || 'https://hiv-aids-team-building.vercel.app';
  const fromSender = getSender();

  const fromCaptain = getTeamCaptainRecipient(fromTeam);
  const adminEmails = getAdminEmails();

  const captainASubject = `📋 [Thông Báo] Kết quả yêu cầu xin ghép vào Đội ${toTeam.name}`;
  const captainABody = `
    <p style="font-size: 15px; margin-top: 0;">
      Kính gửi Đội trưởng <strong>${fromCaptain.name}</strong> (Đại diện <strong>${fromTeam.name}</strong>),
    </p>
    <p style="font-size: 14px; color: #475569; margin-bottom: 24px;">
      Yêu cầu xin ghép vào <strong>${toTeam.name}</strong> (Slot #${toTeam.slotNumber}) của các bạn tạm thời <strong>CHƯA ĐƯỢC CHẤP THUẬN</strong> bởi <strong>${responderName}</strong>.
    </p>

    <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 14px; padding: 20px; margin-bottom: 24px;">
      <h3 style="margin: 0 0 10px; font-size: 14px; font-weight: 700; color: #991b1b; text-transform: uppercase;">
        🛡️ Trạng Thái Đội Của Bạn Vẫn Được Bảo Toàn
      </h3>
      <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #7f1d1d; line-height: 1.6;">
        <li>Đội thi: <strong>${fromTeam.name}</strong></li>
        <li>Vị trí thi đấu: Vẫn được bảo lưu trọn vẹn tại <strong>Slot #${fromTeam.slotNumber}</strong></li>
        <li>Quân số hiện tại: Giữ nguyên <strong>${fromTeam.members.length} thành viên</strong></li>
      </ul>
    </div>

    <p style="font-size: 14px; color: #334155; line-height: 1.6;">
      Đừng nản lòng nhé! Bạn và các thành viên hoàn toàn có thể:
      <br>1. <strong>Gửi yêu cầu ghép tới các đội thi khác</strong> đang còn chỗ trống trên bảng danh sách.
      <br>2. <strong>Tuyển thêm các cá nhân</strong> đang đăng ký tự do để hoàn thiện đội hình 5 người.
    </p>
  `;

  const captainAHtml = renderMasterEmail({
    badgeText: 'Kết Quả Yêu Cầu Ghép Đội',
    badgeBg: '#fee2e2',
    badgeColor: '#b91c1c',
    headerGradient: 'linear-gradient(135deg, #e11d48 0%, #f43f5e 50%, #fb7185 100%)',
    headerIcon: '📋',
    title: `Thông Báo Kết Quả Ghép Đội`,
    subtitle: `Yêu cầu tham gia vào ${toTeam.name} chưa được chấp thuận`,
    mainHtml: captainABody,
    ctaText: '🔍 Tìm Kiếm Các Đội Khác Đang Trống Slot',
    ctaUrl: appUrl,
    ctaBg: '#4f46e5'
  });

  const adminSubject = `📋 [Admin Log] Yêu cầu xin ghép bị từ chối: ${fromTeam.name} ➔ ${toTeam.name}`;
  const adminBody = `
    <p style="font-size: 15px; margin-top: 0;">
      Kính gửi <strong>Ban Quản Trị Cuộc Thi</strong>,
    </p>
    <p style="font-size: 14px; color: #475569; margin-bottom: 20px;">
      Yêu cầu ghép đội từ <strong>${fromTeam.name}</strong> vào <strong>${toTeam.name}</strong> đã bị <strong>${responderName}</strong> từ chối.
    </p>
    <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 14px; padding: 20px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <tr>
          <td style="padding: 6px 0; color: #64748b; width: 40%;">Đội xin vào:</td>
          <td style="padding: 6px 0; font-weight: 700; color: #0284c7;">${fromTeam.name} (Vẫn giữ Slot #${fromTeam.slotNumber})</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Đội nhận:</td>
          <td style="padding: 6px 0; font-weight: 700; color: #4f46e5;">${toTeam.name} (Slot #${toTeam.slotNumber})</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Người xử lý từ chối:</td>
          <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${responderName}</td>
        </tr>
      </table>
    </div>
  `;

  const adminHtml = renderMasterEmail({
    badgeText: 'Admin Log • Request Rejected',
    badgeBg: '#fee2e2',
    badgeColor: '#991b1b',
    headerGradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
    headerIcon: '🛡️',
    title: `Yêu Cầu Ghép Bị Từ Chối`,
    subtitle: `${fromTeam.name} không gia nhập ${toTeam.name}`,
    mainHtml: adminBody,
    ctaText: '🛡️ Xem Bảng Điều Khiển Admin',
    ctaUrl: appUrl,
    ctaBg: '#0f172a'
  });

  if (!transporter) {
    return { success: true, simulated: true, fromCaptainEmails: fromCaptain.emails, adminEmails };
  }

  try {
    const promises: Promise<any>[] = [];
    if (fromCaptain.emails.length > 0) {
      promises.push(
        transporter.sendMail({
          from: fromSender,
          to: fromCaptain.emails.join(', '),
          subject: captainASubject,
          html: captainAHtml
        })
      );
    }
    if (adminEmails.length > 0) {
      promises.push(
        transporter.sendMail({
          from: fromSender,
          to: adminEmails.join(', '),
          subject: adminSubject,
          html: adminHtml
        })
      );
    }

    await Promise.all(promises);
    return { success: true, simulated: false, fromCaptainEmails: fromCaptain.emails, adminEmails };
  } catch (err) {
    console.error('[Mail Service Error] Failed to send rejection emails:', err);
    return { success: false, error: err, fromCaptainEmails: fromCaptain.emails, adminEmails };
  }
}
