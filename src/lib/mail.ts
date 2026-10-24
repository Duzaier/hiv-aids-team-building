import nodemailer from 'nodemailer';

interface TeamMemberInfo {
  id: string;
  name: string;
  studentId?: string | null;
  email?: string | null;
  phone?: string | null;
  isCaptain?: boolean;
}

interface TeamInfo {
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

interface MatchRequestEmailParams {
  fromTeam: TeamInfo;
  toTeam: TeamInfo;
  requesterName: string;
  requesterEmail: string;
}

// Create reusable transporter
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
    auth: {
      user,
      pass
    }
  });
}

const DEFAULT_ADMIN_EMAIL = 'phudt.ce192043@gmail.com';

export async function sendTeamMatchRequestEmails({
  fromTeam,
  toTeam,
  requesterName,
  requesterEmail
}: MatchRequestEmailParams) {
  const transporter = getTransporter();

  const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const fromSender = process.env.SMTP_FROM || `"HIV/AIDS Team Building" <${process.env.SMTP_USER || DEFAULT_ADMIN_EMAIL}>`;

  // 1. Identify target captain / owner recipient
  const targetCaptain = toTeam.members.find((m) => m.isCaptain);
  const targetRecipientEmail = targetCaptain?.email || toTeam.owner.email;
  const targetRecipientName = targetCaptain?.name || toTeam.owner.name || 'Đội trưởng';

  // 2. Identify admin recipients
  const adminEmailsRaw = process.env.ADMIN_EMAILS || DEFAULT_ADMIN_EMAIL;
  const adminEmails = adminEmailsRaw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const totalMembersAfter = fromTeam.members.length + toTeam.members.length;

  // Members list HTML for fromTeam
  const fromMembersHtml = fromTeam.members
    .map(
      (m, idx) => `
        <li style="margin-bottom: 6px; color: #334155;">
          <strong>#${idx + 1} ${m.name}</strong> 
          ${m.isCaptain ? '<span style="background: #fef3c7; color: #b45309; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: bold;">Đội trưởng</span>' : ''}
          ${m.studentId ? ` — MSSV: <code style="background: #f1f5f9; padding: 2px 4px; border-radius: 4px;">${m.studentId}</code>` : ''}
          ${m.phone ? ` — SĐT: ${m.phone}` : ''}
        </li>
      `
    )
    .join('');

  // Email content for target captain
  const captainSubject = `[HIV/AIDS Team Building] Yêu cầu gộp đội: ${fromTeam.name} muốn gộp vào ${toTeam.name}`;
  const captainHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 24px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #ffffff; padding: 28px 24px; text-align: center; }
        .content { padding: 24px; }
        .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 16px 0; }
        .button { display: inline-block; background: #7c3aed; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: bold; font-size: 14px; margin-top: 16px; text-align: center; }
        .footer { padding: 16px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; background: #f8fafc; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0; font-size: 20px;">Yêu Cầu Gộp Đội Mới</h2>
          <p style="margin: 6px 0 0; opacity: 0.9; font-size: 14px;">Cuộc Thi Tìm Hiểu HIV/AIDS &amp; Hòa Nhập Cộng Đồng</p>
        </div>
        <div class="content">
          <p>Xin chào <strong>${targetRecipientName}</strong> (Đại diện <strong>${toTeam.name}</strong>),</p>
          <p>Đội <strong>${fromTeam.name}</strong> (Slot #${fromTeam.slotNumber}) do <strong>${requesterName}</strong> đại diện vừa gửi yêu cầu gộp đội vào <strong>${toTeam.name}</strong> (Slot #${toTeam.slotNumber}) của bạn.</p>
          
          <div class="card">
            <h4 style="margin: 0 0 10px; color: #4338ca;">Thông tin tóm tắt:</h4>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Đội yêu cầu: <strong>${fromTeam.name}</strong> (${fromTeam.members.length} thành viên)</li>
              <li>Đội của bạn: <strong>${toTeam.name}</strong> (Hiện có ${toTeam.members.length}/5 thành viên)</li>
              <li>Sĩ số sau khi gộp: <strong style="color: #16a34a;">${totalMembersAfter}/5 người</strong> (Đủ điều kiện &le; 5 người)</li>
            </ul>
          </div>

          <h4 style="margin: 16px 0 8px; color: #334155;">Danh sách thành viên từ ${fromTeam.name} sẽ tham gia:</h4>
          <ul style="margin: 0 0 16px; padding-left: 20px;">
            ${fromMembersHtml}
          </ul>

          <p>Nếu bạn đồng ý, toàn bộ thành viên của ${fromTeam.name} sẽ được chuyển vào đội ${toTeam.name} của bạn, và vị trí Slot #${fromTeam.slotNumber} sẽ được mở lại cho các đội khác.</p>

          <div style="text-align: center;">
            <a href="${appUrl}" class="button" target="_blank">Đăng Nhập Để Xem &amp; Phê Duyệt</a>
          </div>
        </div>
        <div class="footer">
          Email này được gửi tự động từ Hệ thống Đăng ký &amp; Quản lý Đội thi HIV/AIDS.
        </div>
      </div>
    </body>
    </html>
  `;

  // Email content for Admin
  const adminSubject = `[Admin Thông Báo] Yêu cầu gộp đội mới: ${fromTeam.name} ➔ ${toTeam.name}`;
  const adminHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 24px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #0f172a, #334155); color: #ffffff; padding: 24px; text-align: center; }
        .content { padding: 24px; }
        .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 16px 0; }
        .button { display: inline-block; background: #4f46e5; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: bold; font-size: 14px; margin-top: 16px; text-align: center; }
        .footer { padding: 16px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; background: #f8fafc; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0; font-size: 20px;">Thông Báo Quản Trị Viên</h2>
          <p style="margin: 6px 0 0; opacity: 0.9; font-size: 14px;">Có một yêu cầu gộp đội mới vừa được gửi</p>
        </div>
        <div class="content">
          <p>Kính gửi <strong>Ban Quản Trị</strong>,</p>
          <p>Người dùng <strong>${requesterName}</strong> (<em>${requesterEmail}</em>) đã gửi yêu cầu gộp đội thi đấu:</p>

          <div class="card">
            <h4 style="margin: 0 0 10px; color: #334155;">Chi tiết yêu cầu:</h4>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Đội nguồn: <strong>${fromTeam.name}</strong> (Slot #${fromTeam.slotNumber} — ${fromTeam.members.length} người)</li>
              <li>Đội đích: <strong>${toTeam.name}</strong> (Slot #${toTeam.slotNumber} — ${toTeam.members.length} người)</li>
              <li>Người đại diện đội đích: <strong>${targetRecipientName}</strong> (<em>${targetRecipientEmail}</em>)</li>
              <li>Tổng quân số dự kiến: <strong style="color: #16a34a;">${totalMembersAfter}/5 người</strong></li>
              <li>Giải phóng slot: <strong>Slot #${fromTeam.slotNumber}</strong> sẽ được mở lại nếu được duyệt.</li>
            </ul>
          </div>

          <h4 style="margin: 16px 0 8px; color: #334155;">Danh sách thành viên ${fromTeam.name}:</h4>
          <ul style="margin: 0 0 16px; padding-left: 20px;">
            ${fromMembersHtml}
          </ul>

          <p>Admin có thể duyệt yêu cầu này trực tiếp trong Bảng Quản Lý hoặc người đại diện của ${toTeam.name} có thể tự duyệt.</p>

          <div style="text-align: center;">
            <a href="${appUrl}" class="button" target="_blank">Mở Bảng Điều Khiển Admin</a>
          </div>
        </div>
        <div class="footer">
          Hệ thống Quản lý Đội thi — HIV/AIDS Team Building Platform
        </div>
      </div>
    </body>
    </html>
  `;

  if (!transporter) {
    console.log(
      `[Mail Service: Simulated] SMTP credentials not set in .env. Email would be sent to:\n- Target Captain: ${targetRecipientEmail} (${targetRecipientName})\n- Admin: ${adminEmails.join(', ')}`
    );
    return {
      success: true,
      simulated: true,
      targetRecipientEmail,
      adminEmails
    };
  }

  // Send concurrently to target captain and admin
  try {
    const promises = [
      transporter.sendMail({
        from: fromSender,
        to: targetRecipientEmail,
        subject: captainSubject,
        html: captainHtml
      }),
      transporter.sendMail({
        from: fromSender,
        to: adminEmails.join(', '),
        subject: adminSubject,
        html: adminHtml
      })
    ];

    await Promise.all(promises);
    console.log(`[Mail Service] Sent match request notifications to captain (${targetRecipientEmail}) and admin (${adminEmails.join(', ')})`);

    return {
      success: true,
      simulated: false,
      targetRecipientEmail,
      adminEmails
    };
  } catch (err) {
    console.error('[Mail Service Error] Failed to send email via SMTP:', err);
    return {
      success: false,
      error: err,
      targetRecipientEmail,
      adminEmails
    };
  }
}
