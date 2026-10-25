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

function getAdminEmails(): string[] {
  const adminEmailsRaw = process.env.ADMIN_EMAILS || DEFAULT_ADMIN_EMAIL;
  return adminEmailsRaw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

// Helper to resolve Captain info and recipient emails (captain's entered email and owner's Google login email)
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

  return {
    name,
    emails: Array.from(emails)
  };
}

// 1. Khi bên A xin tham gia vào đội B:
// -> Đội trưởng đội B nhận được mail thông báo
// -> Admin nhận được mail thông báo
export async function sendTeamMatchRequestEmails({
  fromTeam,
  toTeam,
  requesterName,
  requesterEmail
}: MatchRequestEmailParams) {
  const transporter = getTransporter();
  const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const fromSender = process.env.SMTP_FROM || `"HIV/AIDS Team Building" <${process.env.SMTP_USER || DEFAULT_ADMIN_EMAIL}>`;

  const toCaptain = getTeamCaptainRecipient(toTeam);
  const adminEmails = getAdminEmails();

  const totalMembersAfter = fromTeam.members.length + toTeam.members.length;

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

  // Email content for Captain of Team B
  const captainSubject = `[Yêu Cầu Mới] Đội ${fromTeam.name} xin tham gia gộp vào đội ${toTeam.name} của bạn`;
  const captainHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 24px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; }
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
          <h2 style="margin: 0; font-size: 20px;">Yêu Cầu Xin Tham Gia Mới</h2>
          <p style="margin: 6px 0 0; opacity: 0.9; font-size: 14px;">Cuộc Thi Tìm Hiểu HIV/AIDS &amp; Hòa Nhập Cộng Đồng</p>
        </div>
        <div class="content">
          <p>Xin chào <strong>${toCaptain.name}</strong> (Đại diện <strong>${toTeam.name}</strong>),</p>
          <p>Đội <strong>${fromTeam.name}</strong> (Slot #${fromTeam.slotNumber}) do <strong>${requesterName}</strong> đại diện vừa gửi yêu cầu xin tham gia gộp vào đội <strong>${toTeam.name}</strong> (Slot #${toTeam.slotNumber}) của bạn.</p>
          
          <div class="card">
            <h4 style="margin: 0 0 10px; color: #4338ca;">Thông tin tóm tắt:</h4>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Đội xin gia nhập: <strong>${fromTeam.name}</strong> (${fromTeam.members.length} thành viên)</li>
              <li>Đội của bạn: <strong>${toTeam.name}</strong> (Hiện có ${toTeam.members.length}/5 thành viên)</li>
              <li>Sĩ số sau khi gộp: <strong style="color: #16a34a;">${totalMembersAfter}/5 người</strong> (Hợp lệ &le; 5 người)</li>
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
          Email này được gửi tự động tới Đội trưởng đội ${toTeam.name}.
        </div>
      </div>
    </body>
    </html>
  `;

  // Email content for Admin
  const adminSubject = `[Admin Thông Báo] Yêu cầu xin tham gia mới: ${fromTeam.name} ➔ ${toTeam.name}`;
  const adminHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 24px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; }
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
          <p style="margin: 6px 0 0; opacity: 0.9; font-size: 14px;">Có một yêu cầu xin tham gia mới vừa được gửi</p>
        </div>
        <div class="content">
          <p>Kính gửi <strong>Ban Quản Trị</strong>,</p>
          <p>Người dùng <strong>${requesterName}</strong> (<em>${requesterEmail}</em>) đã gửi yêu cầu xin tham gia gộp đội:</p>

          <div class="card">
            <h4 style="margin: 0 0 10px; color: #334155;">Chi tiết yêu cầu:</h4>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Đội xin gia nhập: <strong>${fromTeam.name}</strong> (Slot #${fromTeam.slotNumber} — ${fromTeam.members.length} người)</li>
              <li>Đội nhận: <strong>${toTeam.name}</strong> (Slot #${toTeam.slotNumber} — ${toTeam.members.length} người)</li>
              <li>Đội trưởng đội nhận: <strong>${toCaptain.name}</strong> (<em>${toCaptain.emails.join(', ')}</em>)</li>
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
      `[Mail Service: Simulated] SMTP credentials not set in .env. Email would be sent to:\n- Captain Team B: ${toCaptain.emails.join(', ')}\n- Admin: ${adminEmails.join(', ')}`
    );
    return {
      success: true,
      simulated: true,
      toCaptainEmails: toCaptain.emails,
      adminEmails
    };
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
    console.log(`[Mail Service] Sent match request notifications to Captain Team B (${toCaptain.emails.join(', ')}) and Admin (${adminEmails.join(', ')})`);

    return {
      success: true,
      simulated: false,
      toCaptainEmails: toCaptain.emails,
      adminEmails
    };
  } catch (err) {
    console.error('[Mail Service Error] Failed to send email via SMTP:', err);
    return {
      success: false,
      error: err,
      toCaptainEmails: toCaptain.emails,
      adminEmails
    };
  }
}

// 2. Khi yêu cầu được CHẤP THUẬN (ACCEPTED):
// -> Đội trưởng đội A nhận được mail thông báo kết quả
// -> Admin nhận được mail thông báo xác nhận
export async function sendMatchRequestAcceptedEmails({
  fromTeam,
  toTeam,
  totalMembers,
  responderName
}: MatchRequestAcceptedEmailParams) {
  const transporter = getTransporter();
  const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const fromSender = process.env.SMTP_FROM || `"HIV/AIDS Team Building" <${process.env.SMTP_USER || DEFAULT_ADMIN_EMAIL}>`;

  const fromCaptain = getTeamCaptainRecipient(fromTeam);
  const adminEmails = getAdminEmails();

  // Email content for Captain of Team A
  const captainASubject = `🎉 [Chúc Mừng] Yêu cầu xin tham gia vào đội ${toTeam.name} đã được CHẤP THUẬN!`;
  const captainAHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 24px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #16a34a, #059669); color: #ffffff; padding: 28px 24px; text-align: center; }
        .content { padding: 24px; }
        .card { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin: 16px 0; }
        .button { display: inline-block; background: #16a34a; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: bold; font-size: 14px; margin-top: 16px; text-align: center; }
        .footer { padding: 16px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; background: #f8fafc; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0; font-size: 20px;">Yêu Cầu Đã Được Chấp Nhận!</h2>
          <p style="margin: 6px 0 0; opacity: 0.9; font-size: 14px;">Chúc mừng bạn và các thành viên đã gia nhập đội mới</p>
        </div>
        <div class="content">
          <p>Xin chào <strong>${fromCaptain.name}</strong> (Đại diện <strong>${fromTeam.name}</strong>),</p>
          <p>Chúng tôi xin vui mừng thông báo: Yêu cầu xin tham gia gộp vào đội <strong>${toTeam.name}</strong> (Slot #${toTeam.slotNumber}) của bạn đã được <strong>CHẤP NHẬN</strong> bởi <strong>${responderName}</strong>!</p>
          
          <div class="card">
            <h4 style="margin: 0 0 10px; color: #15803d;">Chi tiết cập nhật:</h4>
            <ul style="margin: 0; padding-left: 20px; color: #166534;">
              <li>Đội mới của các bạn: <strong>${toTeam.name}</strong> (Slot #${toTeam.slotNumber})</li>
              <li>Tổng sĩ số hiện tại của đội: <strong>${totalMembers}/5 thành viên</strong></li>
              <li>Trạng thái: Toàn bộ thành viên của ${fromTeam.name} đã được chuyển sang danh sách đội ${toTeam.name}.</li>
              <li>Vị trí Slot #${fromTeam.slotNumber} cũ đã được giải phóng trên hệ thống.</li>
            </ul>
          </div>

          <p>Hãy liên hệ với đội trưởng và các thành viên đội ${toTeam.name} để chuẩn bị thật tốt cho các hoạt động sắp tới nhé!</p>

          <div style="text-align: center;">
            <a href="${appUrl}" class="button" target="_blank">Xem Danh Sách Đội Mới</a>
          </div>
        </div>
        <div class="footer">
          Hệ thống Quản lý Đội thi — Cuộc Thi Tìm Hiểu HIV/AIDS &amp; Hòa Nhập Cộng Đồng
        </div>
      </div>
    </body>
    </html>
  `;

  // Email content for Admin
  const adminSubject = `[Admin Xác Nhận] Gộp đội thành công: ${fromTeam.name} ➔ ${toTeam.name}`;
  const adminHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 24px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #0f172a, #334155); color: #ffffff; padding: 24px; text-align: center; }
        .content { padding: 24px; }
        .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 16px 0; }
        .footer { padding: 16px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; background: #f8fafc; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0; font-size: 20px;">Gộp Đội Thành Công (Admin Log)</h2>
          <p style="margin: 6px 0 0; opacity: 0.9; font-size: 14px;">Yêu cầu xin tham gia đã được phê duyệt</p>
        </div>
        <div class="content">
          <p>Kính gửi <strong>Ban Quản Trị</strong>,</p>
          <p>Yêu cầu gộp từ <strong>${fromTeam.name}</strong> vào <strong>${toTeam.name}</strong> đã được thực thi thành công bởi <strong>${responderName}</strong>.</p>
          <div class="card">
            <ul style="margin: 0; padding-left: 20px;">
              <li>Đội nguồn đã giải phóng: <strong>${fromTeam.name}</strong> (Slot #${fromTeam.slotNumber})</li>
              <li>Đội đích nhận thành viên: <strong>${toTeam.name}</strong> (Slot #${toTeam.slotNumber})</li>
              <li>Đã gửi email thông báo kết quả tới Đội trưởng đội A: <em>${fromCaptain.emails.join(', ')}</em></li>
              <li>Sĩ số mới: <strong>${totalMembers}/5 người</strong></li>
            </ul>
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
      `[Mail Service: Simulated] SMTP credentials not set in .env. Acceptance emails would be sent to:\n- Captain Team A: ${fromCaptain.emails.join(', ')}\n- Admin: ${adminEmails.join(', ')}`
    );
    return {
      success: true,
      simulated: true,
      fromCaptainEmails: fromCaptain.emails,
      adminEmails
    };
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
    console.log(`[Mail Service] Sent acceptance emails to Captain Team A (${fromCaptain.emails.join(', ')}) and Admin (${adminEmails.join(', ')})`);

    return {
      success: true,
      simulated: false,
      fromCaptainEmails: fromCaptain.emails,
      adminEmails
    };
  } catch (err) {
    console.error('[Mail Service Error] Failed to send acceptance emails:', err);
    return {
      success: false,
      error: err,
      fromCaptainEmails: fromCaptain.emails,
      adminEmails
    };
  }
}

// 3. Khi yêu cầu bị TỪ CHỐI (REJECTED):
// -> Đội trưởng đội A nhận được mail thông báo kết quả
// -> Admin nhận được mail thông báo
export async function sendMatchRequestRejectedEmails({
  fromTeam,
  toTeam,
  responderName
}: MatchRequestRejectedEmailParams) {
  const transporter = getTransporter();
  const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const fromSender = process.env.SMTP_FROM || `"HIV/AIDS Team Building" <${process.env.SMTP_USER || DEFAULT_ADMIN_EMAIL}>`;

  const fromCaptain = getTeamCaptainRecipient(fromTeam);
  const adminEmails = getAdminEmails();

  // Email content for Captain of Team A
  const captainASubject = `[Thông Báo Kết Quả] Yêu cầu xin tham gia vào đội ${toTeam.name} đã bị TỪ CHỐI`;
  const captainAHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 24px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #dc2626, #b91c1c); color: #ffffff; padding: 28px 24px; text-align: center; }
        .content { padding: 24px; }
        .card { background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 16px; margin: 16px 0; }
        .button { display: inline-block; background: #4f46e5; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: bold; font-size: 14px; margin-top: 16px; text-align: center; }
        .footer { padding: 16px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; background: #f8fafc; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0; font-size: 20px;">Thông Báo Kết Quả Yêu Cầu</h2>
          <p style="margin: 6px 0 0; opacity: 0.9; font-size: 14px;">Yêu cầu xin tham gia gộp đội</p>
        </div>
        <div class="content">
          <p>Kính gửi <strong>${fromCaptain.name}</strong> (Đại diện <strong>${fromTeam.name}</strong>),</p>
          <p>Yêu cầu xin tham gia gộp vào đội <strong>${toTeam.name}</strong> (Slot #${toTeam.slotNumber}) của bạn đã bị <strong>TỪ CHỐI</strong> bởi <strong>${responderName}</strong>.</p>
          
          <div class="card">
            <h4 style="margin: 0 0 10px; color: #991b1b;">Tình trạng đội hiện tại:</h4>
            <ul style="margin: 0; padding-left: 20px; color: #7f1d1d;">
              <li>Đội của bạn: <strong>${fromTeam.name}</strong> (Slot #${fromTeam.slotNumber})</li>
              <li>Sĩ số: Vẫn giữ nguyên <strong>${fromTeam.members.length} thành viên</strong> hiện tại.</li>
              <li>Vị trí thi đấu: Vẫn được bảo lưu tại <strong>Slot #${fromTeam.slotNumber}</strong>.</li>
            </ul>
          </div>

          <p>Bạn và các thành viên hoàn toàn có thể tiếp tục tuyển thêm các thành viên cá nhân đang chờ ghép trên hệ thống hoặc gửi yêu cầu xin tham gia tới các đội thi khác còn slot trống.</p>

          <div style="text-align: center;">
            <a href="${appUrl}" class="button" target="_blank">Xem Bảng Danh Sách Đội Thi</a>
          </div>
        </div>
        <div class="footer">
          Hệ thống Quản lý Đội thi — Cuộc Thi Tìm Hiểu HIV/AIDS &amp; Hòa Nhập Cộng Đồng
        </div>
      </div>
    </body>
    </html>
  `;

  // Email content for Admin
  const adminSubject = `[Admin Thông Báo] Yêu cầu xin tham gia bị từ chối: ${fromTeam.name} ➔ ${toTeam.name}`;
  const adminHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 24px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #0f172a, #334155); color: #ffffff; padding: 24px; text-align: center; }
        .content { padding: 24px; }
        .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 16px 0; }
        .footer { padding: 16px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; background: #f8fafc; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0; font-size: 20px;">Yêu Cầu Bị Từ Chối (Admin Log)</h2>
          <p style="margin: 6px 0 0; opacity: 0.9; font-size: 14px;">Thông báo từ chối gộp đội</p>
        </div>
        <div class="content">
          <p>Kính gửi <strong>Ban Quản Trị</strong>,</p>
          <p>Yêu cầu gộp từ <strong>${fromTeam.name}</strong> vào <strong>${toTeam.name}</strong> đã bị <strong>${responderName}</strong> từ chối.</p>
          <div class="card">
            <ul style="margin: 0; padding-left: 20px;">
              <li>Đội xin gia nhập: <strong>${fromTeam.name}</strong> (Slot #${fromTeam.slotNumber} — giữ nguyên)</li>
              <li>Đội nhận: <strong>${toTeam.name}</strong> (Slot #${toTeam.slotNumber} — giữ nguyên)</li>
              <li>Đã gửi email thông báo kết quả tới Đội trưởng đội A: <em>${fromCaptain.emails.join(', ')}</em></li>
              <li>Người xử lý: <strong>${responderName}</strong></li>
            </ul>
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
      `[Mail Service: Simulated] SMTP credentials not set in .env. Rejection emails would be sent to:\n- Captain Team A: ${fromCaptain.emails.join(', ')}\n- Admin: ${adminEmails.join(', ')}`
    );
    return {
      success: true,
      simulated: true,
      fromCaptainEmails: fromCaptain.emails,
      adminEmails
    };
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
    console.log(`[Mail Service] Sent rejection emails to Captain Team A (${fromCaptain.emails.join(', ')}) and Admin (${adminEmails.join(', ')})`);

    return {
      success: true,
      simulated: false,
      fromCaptainEmails: fromCaptain.emails,
      adminEmails
    };
  } catch (err) {
    console.error('[Mail Service Error] Failed to send rejection emails:', err);
    return {
      success: false,
      error: err,
      fromCaptainEmails: fromCaptain.emails,
      adminEmails
    };
  }
}
