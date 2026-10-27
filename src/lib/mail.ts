import nodemailer from 'nodemailer';
import { getAdminEmails as getAllAdminEmails } from './roles';
import { getAdminEmails as getRolesAdminEmails } from './roles';

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
  return getAllAdminEmails();
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

function renderMembersListHtml(members: TeamMemberInfo[]): string {
  return members
    .map((m, idx) => {
      const isCaptain = m.isCaptain || idx === 0;
      const captainBadge = isCaptain
        ? '<span style="background: #78350f; color: #fde68a; padding: 2px 7px; border-radius: 4px; font-size: 11px; font-weight: 600; margin-left: 6px;">Đội trưởng</span>'
        : '';
      const mssvBadge = m.studentId
        ? ` — MSSV: <code style="background: #272832; color: #93c5fd; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${m.studentId}</code>`
        : '';
      const phoneBadge = m.phone ? ` — SĐT: ${m.phone}` : '';

      return `<li style="margin-bottom: 8px;"><strong>#${idx + 1} ${m.name}</strong>${captainBadge}${mssvBadge}${phoneBadge}</li>`;
    })
    .join('');
}

interface DarkShellOptions {
  title: string;
  titleColor?: string;
  recipientGreeting: string;
  introText: string;
  detailsHtml: string;
  membersHtml?: string;
  ctaText: string;
  ctaUrl: string;
  ctaBg?: string;
}

function renderDarkEmail(opts: DarkShellOptions): string {
  const tColor = opts.titleColor || '#c084fc';
  const btnBg = opts.ctaBg || '#a78bfa';

  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0c0d12; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9; line-height: 1.6;">
  <div style="background-color: #0c0d12; padding: 24px 12px;">
    <div style="max-width: 520px; margin: 0 auto; background-color: #16171d; border-radius: 16px; padding: 28px 24px; border: 1px solid #262730;">
      
      <div style="margin-bottom: 16px;">
        <img src="https://hiv-aids-team-building.vercel.app/logo.png" width="44" height="44" style="border-radius: 10px; display: block;" alt="HIV/AIDS Team Building Logo" />
      </div>

      <h2 style="margin: 0 0 18px; font-size: 22px; font-weight: 700; color: ${tColor}; letter-spacing: -0.3px;">
        ${opts.title}
      </h2>

      <p style="margin: 0 0 14px; font-size: 15px; color: #e2e8f0; line-height: 1.6;">
        ${opts.recipientGreeting}
      </p>

      <p style="margin: 0 0 20px; font-size: 15px; color: #cbd5e1; line-height: 1.6;">
        ${opts.introText}
      </p>

      <div style="background-color: #22232b; border: 1px solid #2e303b; border-radius: 12px; padding: 18px 20px; margin-bottom: 22px;">
        ${opts.detailsHtml}
      </div>

      ${opts.membersHtml ? `
        <h4 style="margin: 0 0 12px; font-size: 15px; font-weight: 600; color: #f8fafc;">
          Danh sách thành viên:
        </h4>
        <ul style="margin: 0 0 24px; padding-left: 20px; color: #e2e8f0; font-size: 14px; line-height: 1.8;">
          ${opts.membersHtml}
        </ul>
      ` : ''}

      <div style="margin-top: 24px;">
        <a href="${opts.ctaUrl}" target="_blank" style="display: block; background: ${btnBg}; color: #0f0f17 !important; text-decoration: none; padding: 14px 20px; border-radius: 10px; font-weight: 700; font-size: 15px; text-align: center;">
          ${opts.ctaText}
        </a>
      </div>

    </div>
  </div>
</body>
</html>
  `;
}

// 1. KHI ĐỘI A XIN THAM GIA VÀO ĐỘI B:
// -> Đội trưởng Đội B nhận 1 mail báo có Đội A xin tham gia vào
// -> Admin được báo qua mail rằng có Đội A xin tham gia vào Đội B
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

  const membersHtml = renderMembersListHtml(fromTeam.members);

  // 1A. Gửi Đội trưởng Đội B
  const captainSubject = `Yêu Cầu Xin Tham Gia Ghép Đội: ${fromTeam.name} xin vào ${toTeam.name}`;
  const captainHtml = renderDarkEmail({
    title: 'Yêu Cầu Xin Tham Gia Ghép Đội',
    titleColor: '#c084fc',
    recipientGreeting: `Xin chào <strong>${toCaptain.name}</strong> (Đại diện <strong>${toTeam.name}</strong>),`,
    introText: `Đội <strong>${fromTeam.name}</strong> (Slot #${fromTeam.slotNumber}) vừa gửi yêu cầu xin tham gia ghép vào đội <strong>${toTeam.name}</strong> (Slot #${toTeam.slotNumber}) của bạn.`,
    detailsHtml: `
      <div style="margin-bottom: 10px; font-size: 15px; color: #e2e8f0;"><strong>Đội xin vào:</strong> ${fromTeam.name} (${fromCount} người)</div>
      <div style="margin-bottom: 10px; font-size: 15px; color: #e2e8f0;"><strong>Đội của bạn:</strong> ${toTeam.name} (${toCount}/5 người)</div>
      <div style="font-size: 15px; color: #e2e8f0;"><strong>Tổng thành viên sau ghép:</strong> <span style="color: #4ade80; font-weight: 700;">${totalCount}/5 người</span></div>
    `,
    membersHtml,
    ctaText: 'Xem & Phê Duyệt Tại Website',
    ctaUrl: appUrl,
    ctaBg: '#a78bfa'
  });

  // 1B. Gửi Admin
  const adminSubject = `[Admin Thông Báo] Đội ${fromTeam.name} xin tham gia vào Đội ${toTeam.name}`;
  const adminHtml = renderDarkEmail({
    title: 'Thông Báo Ghép Đội (Admin)',
    titleColor: '#c084fc',
    recipientGreeting: `Kính gửi <strong>Ban Quản Trị</strong>,`,
    introText: `Hệ thống ghi nhận đội <strong>${fromTeam.name}</strong> (Slot #${fromTeam.slotNumber}) vừa gửi yêu cầu xin tham gia ghép vào đội <strong>${toTeam.name}</strong> (Slot #${toTeam.slotNumber}).`,
    detailsHtml: `
      <div style="margin-bottom: 8px; font-size: 14px; color: #e2e8f0;"><strong>Người gửi yêu cầu:</strong> ${requesterName} (${requesterEmail})</div>
      <div style="margin-bottom: 8px; font-size: 14px; color: #e2e8f0;"><strong>Đội xin vào (A):</strong> ${fromTeam.name} (${fromCount} người - Slot #${fromTeam.slotNumber})</div>
      <div style="margin-bottom: 8px; font-size: 14px; color: #e2e8f0;"><strong>Đội nhận (B):</strong> ${toTeam.name} (${toCount}/5 người - Slot #${toTeam.slotNumber})</div>
      <div style="margin-bottom: 8px; font-size: 14px; color: #e2e8f0;"><strong>Đội trưởng Đội B:</strong> ${toCaptain.name} (${toCaptain.emails.join(', ')})</div>
      <div style="font-size: 14px; color: #e2e8f0;"><strong>Tổng thành viên sau ghép:</strong> <span style="color: #4ade80; font-weight: 700;">${totalCount}/5 người</span></div>
    `,
    membersHtml,
    ctaText: 'Truy Cập Quản Trị Admin',
    ctaUrl: appUrl,
    ctaBg: '#a78bfa'
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
          replyTo: requesterEmail,
          subject: adminSubject,
          html: adminHtml
        })
      );
    }

    await Promise.all(promises);
    return { success: true, simulated: false, toCaptainEmails: toCaptain.emails, adminEmails };
  } catch (err) {
    console.error('[Mail Service Error] Failed to send match request emails:', err);
    return { success: false, error: err, toCaptainEmails: toCaptain.emails, adminEmails };
  }
}

// 2. KHI ĐỘI B CHẤP THUẬN (ACCEPTED):
// -> Đội trưởng Đội A nhận được mail thông báo kết quả chấp thuận
// -> Admin được báo kết quả qua mail rằng Đội B đã chấp thuận Đội A
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

  // 2A. Gửi Đội trưởng Đội A
  const captainASubject = `[Kết Quả] Đội ${toTeam.name} đã CHẤP THUẬN yêu cầu ghép đội!`;
  const captainAHtml = renderDarkEmail({
    title: 'Yêu Cầu Ghép Đội Đã Được Chấp Thuận',
    titleColor: '#4ade80',
    recipientGreeting: `Xin chào <strong>${fromCaptain.name}</strong> (Đại diện <strong>${fromTeam.name}</strong>),`,
    introText: `Chúc mừng bạn! Yêu cầu xin tham gia ghép đội vào <strong>${toTeam.name}</strong> (Slot #${toTeam.slotNumber}) của bạn đã được <strong>${responderName}</strong> <strong>CHẤP THUẬN</strong>. Toàn bộ thành viên của ${fromTeam.name} đã được chuyển vào đội ${toTeam.name}.`,
    detailsHtml: `
      <div style="margin-bottom: 10px; font-size: 15px; color: #e2e8f0;"><strong>Đội mới của bạn:</strong> ${toTeam.name} (Slot #${toTeam.slotNumber})</div>
      <div style="margin-bottom: 10px; font-size: 15px; color: #e2e8f0;"><strong>Tổng quân số đội:</strong> <span style="color: #4ade80; font-weight: 700;">${totalMembers}/5 người</span></div>
      <div style="margin-bottom: 10px; font-size: 15px; color: #e2e8f0;"><strong>Đội trưởng đội nhận:</strong> ${toCaptain.name} (${toCaptain.emails.join(', ')})</div>
      <div style="font-size: 14px; color: #94a3b8;">* Vị trí Slot #${fromTeam.slotNumber} cũ đã được giải phóng trên hệ thống.</div>
    `,
    ctaText: 'Xem Danh Sách Đội Mới Tại Website',
    ctaUrl: appUrl,
    ctaBg: '#4ade80'
  });

  // 2B. Gửi Admin
  const adminSubject = `[Admin Kết Quả] Đội ${toTeam.name} đã CHẤP THUẬN ghép Đội ${fromTeam.name}`;
  const adminHtml = renderDarkEmail({
    title: 'Ghép Đội Thành Công (Admin Log)',
    titleColor: '#4ade80',
    recipientGreeting: `Kính gửi <strong>Ban Quản Trị</strong>,`,
    introText: `Đội <strong>${toTeam.name}</strong> đã chấp thuận yêu cầu xin tham gia từ đội <strong>${fromTeam.name}</strong>. Giao dịch ghép đội đã được thực thi thành công bởi <strong>${responderName}</strong>.`,
    detailsHtml: `
      <div style="margin-bottom: 8px; font-size: 14px; color: #e2e8f0;"><strong>Đội xin vào:</strong> ${fromTeam.name} (Slot #${fromTeam.slotNumber} - đã giải phóng)</div>
      <div style="margin-bottom: 8px; font-size: 14px; color: #e2e8f0;"><strong>Đội tiếp nhận:</strong> ${toTeam.name} (Slot #${toTeam.slotNumber})</div>
      <div style="margin-bottom: 8px; font-size: 14px; color: #e2e8f0;"><strong>Tổng quân số sau ghép:</strong> <span style="color: #4ade80; font-weight: 700;">${totalMembers}/5 người</span></div>
      <div style="font-size: 14px; color: #e2e8f0;"><strong>Người xử lý duyệt:</strong> ${responderName}</div>
    `,
    ctaText: 'Xem Bảng Quản Trị Admin',
    ctaUrl: appUrl,
    ctaBg: '#4ade80'
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

// 3. KHI ĐỘI B TỪ CHỐI (REJECTED):
// -> Đội trưởng Đội A nhận được mail thông báo kết quả từ chối
// -> Admin được báo kết quả qua mail rằng Đội B đã từ chối Đội A
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

  // 3A. Gửi Đội trưởng Đội A
  const captainASubject = `[Kết Quả] Đội ${toTeam.name} đã TỪ CHỐI yêu cầu ghép đội`;
  const captainAHtml = renderDarkEmail({
    title: 'Yêu Cầu Ghép Đội Đã Bị Từ Chối',
    titleColor: '#f87171',
    recipientGreeting: `Xin chào <strong>${fromCaptain.name}</strong> (Đại diện <strong>${fromTeam.name}</strong>),`,
    introText: `Yêu cầu xin tham gia ghép vào đội <strong>${toTeam.name}</strong> (Slot #${toTeam.slotNumber}) của bạn đã bị từ chối bởi <strong>${responderName}</strong>.`,
    detailsHtml: `
      <div style="margin-bottom: 8px; font-size: 15px; color: #e2e8f0;"><strong>Đội của bạn:</strong> ${fromTeam.name} (Vẫn bảo lưu Slot #${fromTeam.slotNumber})</div>
      <div style="margin-bottom: 8px; font-size: 15px; color: #e2e8f0;"><strong>Quân số hiện tại:</strong> ${fromTeam.members.length} người</div>
      <div style="font-size: 14px; color: #94a3b8;">Bạn có thể tiếp tục gửi yêu cầu xin ghép tới các đội thi khác còn trống slot hoặc tuyển thêm thành viên tự do.</div>
    `,
    ctaText: 'Xem Danh Sách Đội Khác Còn Chỗ Trống',
    ctaUrl: appUrl,
    ctaBg: '#a78bfa'
  });

  // 3B. Gửi Admin
  const adminSubject = `[Admin Kết Quả] Đội ${toTeam.name} đã TỪ CHỐI Đội ${fromTeam.name}`;
  const adminHtml = renderDarkEmail({
    title: 'Yêu Cầu Ghép Đội Bị Từ Chối (Admin Log)',
    titleColor: '#f87171',
    recipientGreeting: `Kính gửi <strong>Ban Quản Trị</strong>,`,
    introText: `Đội <strong>${toTeam.name}</strong> đã từ chối yêu cầu xin ghép đội từ <strong>${fromTeam.name}</strong>.`,
    detailsHtml: `
      <div style="margin-bottom: 8px; font-size: 14px; color: #e2e8f0;"><strong>Đội xin vào:</strong> ${fromTeam.name} (Slot #${fromTeam.slotNumber} - bảo lưu)</div>
      <div style="margin-bottom: 8px; font-size: 14px; color: #e2e8f0;"><strong>Đội từ chối:</strong> ${toTeam.name} (Slot #${toTeam.slotNumber})</div>
      <div style="font-size: 14px; color: #e2e8f0;"><strong>Người xử lý:</strong> ${responderName}</div>
    `,
    ctaText: 'Xem Bảng Quản Trị Admin',
    ctaUrl: appUrl,
    ctaBg: '#a78bfa'
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


// ==========================================
// INDIVIDUAL JOIN REQUEST EMAILS
// ==========================================

export interface IndividualJoinRequestEmailParams {
  team: TeamInfo;
  individual: {
    name: string;
    studentId?: string | null;
    email: string;
    phone?: string | null;
  };
}

export interface IndividualJoinAcceptedEmailParams {
  team: TeamInfo;
  individual: {
    name: string;
    email: string;
  };
  totalMembers: number;
  responderName: string;
}

export interface IndividualJoinRejectedEmailParams {
  team: TeamInfo;
  individual: {
    name: string;
    email: string;
  };
  responderName: string;
}

// 4. KHI CÁ NHÂN XIN GIA NHẬP VÀO ĐỘI CÒN TRỐNG SLOT
export async function sendIndividualJoinRequestEmails({
  team,
  individual
}: IndividualJoinRequestEmailParams) {
  const transporter = getTransporter();
  const appUrl = process.env.NEXTAUTH_URL || 'https://hiv-aids-team-building.vercel.app';
  const fromSender = getSender();

  const toCaptain = getTeamCaptainRecipient(team);
  const adminEmails = getAdminEmails();

  const remainingSlots = Math.max(0, 5 - team.members.length);

  // 4A. Gửi Đội trưởng đội đích
  const captainSubject = `Yêu Cầu Xin Gia Nhập: ${individual.name} xin vào ${team.name}`;
  const captainHtml = renderDarkEmail({
    title: 'Cá Nhân Xin Gia Nhập Đội',
    titleColor: '#c084fc',
    recipientGreeting: `Xin chào <strong>${toCaptain.name}</strong> (Đại diện <strong>${team.name}</strong>),`,
    introText: `Bạn <strong>${individual.name}</strong> vừa gửi yêu cầu xin gia nhập vào vị trí còn trống của <strong>${team.name}</strong> (Slot #${team.slotNumber}).`,
    detailsHtml: `
      <div style="margin-bottom: 8px; font-size: 15px; color: #e2e8f0;"><strong>Họ và tên ứng viên:</strong> ${individual.name}</div>
      ${individual.studentId ? `<div style="margin-bottom: 8px; font-size: 14px; color: #cbd5e1;"><strong>MSSV:</strong> <code style="background: #272832; color: #93c5fd; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${individual.studentId}</code></div>` : ''}
      <div style="margin-bottom: 8px; font-size: 14px; color: #cbd5e1;"><strong>Gmail nhận phản hồi:</strong> ${individual.email}</div>
      ${individual.phone ? `<div style="margin-bottom: 8px; font-size: 14px; color: #cbd5e1;"><strong>Số điện thoại:</strong> ${individual.phone}</div>` : ''}
      <div style="margin-top: 10px; font-size: 14px; color: #94a3b8;">Đội của bạn hiện có <strong>${team.members.length}/5</strong> thành viên (còn trống <strong>${remainingSlots}</strong> slot). Bạn hoặc Admin có thể duyệt yêu cầu này trên website.</div>
    `,
    ctaText: 'Xem Và Duyệt Yêu Cầu Trên Website',
    ctaUrl: appUrl,
    ctaBg: '#a78bfa'
  });

  // 4B. Gửi Admin
  const adminSubject = `[Admin] Cá nhân ${individual.name} xin gia nhập ${team.name}`;
  const adminHtml = renderDarkEmail({
    title: 'Cá Nhân Xin Gia Nhập Đội (Admin Log)',
    titleColor: '#c084fc',
    recipientGreeting: 'Kính gửi <strong>Ban Quản Trị</strong>,',
    introText: `Hệ thống vừa nhận được yêu cầu xin gia nhập từ cá nhân <strong>${individual.name}</strong> vào <strong>${team.name}</strong> (Slot #${team.slotNumber}).`,
    detailsHtml: `
      <div style="margin-bottom: 8px; font-size: 14px; color: #e2e8f0;"><strong>Ứng viên:</strong> ${individual.name} (${individual.studentId || 'Chưa có MSSV'})</div>
      <div style="margin-bottom: 8px; font-size: 14px; color: #cbd5e1;"><strong>Gmail:</strong> ${individual.email} - <strong>SĐT:</strong> ${individual.phone || 'N/A'}</div>
      <div style="margin-bottom: 8px; font-size: 14px; color: #e2e8f0;"><strong>Đội xin vào:</strong> ${team.name} (Slot #${team.slotNumber} - hiện có ${team.members.length}/5 người)</div>
      <div style="font-size: 13px; color: #94a3b8;">Admin hoặc Đội trưởng ${team.name} có thể duyệt chấp thuận hoặc từ chối yêu cầu này.</div>
    `,
    ctaText: 'Mở Bảng Quản Trị Website',
    ctaUrl: appUrl,
    ctaBg: '#a78bfa'
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
    console.error('[Mail Service Error] Failed to send individual join request emails:', err);
    return { success: false, error: err, toCaptainEmails: toCaptain.emails, adminEmails };
  }
}

// 5. KHI ĐỘI TRƯỞNG HOẶC ADMIN CHẤP THUẬN CÁ NHÂN VÀO ĐỘI
export async function sendIndividualJoinAcceptedEmails({
  team,
  individual,
  totalMembers,
  responderName
}: IndividualJoinAcceptedEmailParams) {
  const transporter = getTransporter();
  const appUrl = process.env.NEXTAUTH_URL || 'https://hiv-aids-team-building.vercel.app';
  const fromSender = getSender();
  const adminEmails = getAdminEmails();

  const toCaptain = getTeamCaptainRecipient(team);
  const membersHtml = renderMembersListHtml(team.members);

  // 5A. Gửi Cá nhân được nhận
  const individualSubject = `[Chúc Mừng] Bạn đã được chấp thuận gia nhập ${team.name}!`;
  const individualHtml = renderDarkEmail({
    title: 'Chúc Mừng! Bạn Đã Gia Nhập Đội Thành Công',
    titleColor: '#4ade80',
    recipientGreeting: `Xin chào <strong>${individual.name}</strong>,`,
    introText: `Yêu cầu xin gia nhập vào đội <strong>${team.name}</strong> (Slot #${team.slotNumber}) của bạn đã được <strong>${responderName}</strong> chấp thuận! Bạn chính thức là thành viên của đội.`,
    detailsHtml: `
      <div style="margin-bottom: 8px; font-size: 15px; color: #e2e8f0;"><strong>Đội thi chính thức:</strong> ${team.name} (Slot #${team.slotNumber})</div>
      <div style="margin-bottom: 8px; font-size: 15px; color: #e2e8f0;"><strong>Quân số hiện tại:</strong> ${totalMembers}/5 thành viên</div>
      <div style="margin-bottom: 8px; font-size: 14px; color: #cbd5e1;"><strong>Người đại diện/Đội trưởng:</strong> ${toCaptain.name}</div>
      <div style="font-size: 13px; color: #94a3b8;">Hãy kết nối cùng đồng đội và chuẩn bị thật tốt cho giải đấu Team Building sắp tới nhé!</div>
    `,
    membersHtml,
    ctaText: 'Xem Đội Thi Của Bạn Trên Website',
    ctaUrl: appUrl,
    ctaBg: '#a78bfa'
  });

  // 5B. Gửi Admin
  const adminSubject = `[Admin Kết Quả] Đã chấp thuận cá nhân ${individual.name} vào ${team.name}`;
  const adminHtml = renderDarkEmail({
    title: 'Cá Nhân Đã Gia Nhập Đội (Admin Log)',
    titleColor: '#4ade80',
    recipientGreeting: 'Kính gửi <strong>Ban Quản Trị</strong>,',
    introText: `Yêu cầu gia nhập của cá nhân <strong>${individual.name}</strong> vào <strong>${team.name}</strong> đã được chấp thuận bởi <strong>${responderName}</strong>.`,
    detailsHtml: `
      <div style="margin-bottom: 8px; font-size: 14px; color: #e2e8f0;"><strong>Cá nhân gia nhập:</strong> ${individual.name} (${individual.email})</div>
      <div style="margin-bottom: 8px; font-size: 14px; color: #e2e8f0;"><strong>Đội tiếp nhận:</strong> ${team.name} (Slot #${team.slotNumber} - hiện có ${totalMembers}/5 người)</div>
      <div style="font-size: 14px; color: #cbd5e1;"><strong>Người xử lý:</strong> ${responderName}</div>
    `,
    ctaText: 'Xem Bảng Quản Trị Admin',
    ctaUrl: appUrl,
    ctaBg: '#a78bfa'
  });

  if (!transporter) {
    return { success: true, simulated: true, individualEmail: individual.email, adminEmails };
  }

  try {
    const promises: Promise<any>[] = [];
    if (individual.email) {
      promises.push(
        transporter.sendMail({
          from: fromSender,
          to: individual.email,
          subject: individualSubject,
          html: individualHtml
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
    return { success: true, simulated: false, individualEmail: individual.email, adminEmails };
  } catch (err) {
    console.error('[Mail Service Error] Failed to send individual join accepted emails:', err);
    return { success: false, error: err, individualEmail: individual.email, adminEmails };
  }
}

// 6. KHI ĐỘI TRƯỞNG HOẶC ADMIN TỪ CHỐI CÁ NHÂN
export async function sendIndividualJoinRejectedEmails({
  team,
  individual,
  responderName
}: IndividualJoinRejectedEmailParams) {
  const transporter = getTransporter();
  const appUrl = process.env.NEXTAUTH_URL || 'https://hiv-aids-team-building.vercel.app';
  const fromSender = getSender();
  const adminEmails = getAdminEmails();

  // 6A. Gửi Cá nhân bị từ chối
  const individualSubject = `[Thông Báo] Kết quả yêu cầu tham gia ${team.name}`;
  const individualHtml = renderDarkEmail({
    title: 'Yêu Cầu Tham Gia Chưa Được Chấp Thuận',
    titleColor: '#f87171',
    recipientGreeting: `Xin chào <strong>${individual.name}</strong>,`,
    introText: `Rất tiếc, yêu cầu xin gia nhập vào đội <strong>${team.name}</strong> (Slot #${team.slotNumber}) của bạn chưa được <strong>${responderName}</strong> chấp thuận lần này.`,
    detailsHtml: `
      <div style="margin-bottom: 8px; font-size: 15px; color: #e2e8f0;"><strong>Đội thi:</strong> ${team.name} (Slot #${team.slotNumber})</div>
      <div style="font-size: 14px; color: #cbd5e1;">Bạn vẫn có thể tiếp tục gửi yêu cầu xin tham gia vào các đội thi khác còn trống slot hoặc đăng ký vào danh sách ghép ngẫu nhiên.</div>
    `,
    ctaText: 'Xem Danh Sách Đội Còn Chỗ Trống',
    ctaUrl: appUrl,
    ctaBg: '#a78bfa'
  });

  // 6B. Gửi Admin
  const adminSubject = `[Admin Kết Quả] Đã TỪ CHỐI cá nhân ${individual.name} vào ${team.name}`;
  const adminHtml = renderDarkEmail({
    title: 'Từ Chối Yêu Cầu Cá Nhân (Admin Log)',
    titleColor: '#f87171',
    recipientGreeting: 'Kính gửi <strong>Ban Quản Trị</strong>,',
    introText: `Yêu cầu xin gia nhập từ cá nhân <strong>${individual.name}</strong> vào <strong>${team.name}</strong> đã bị từ chối bởi <strong>${responderName}</strong>.`,
    detailsHtml: `
      <div style="margin-bottom: 8px; font-size: 14px; color: #e2e8f0;"><strong>Ứng viên:</strong> ${individual.name} (${individual.email})</div>
      <div style="margin-bottom: 8px; font-size: 14px; color: #e2e8f0;"><strong>Đội thi:</strong> ${team.name} (Slot #${team.slotNumber})</div>
      <div style="font-size: 14px; color: #cbd5e1;"><strong>Người xử lý:</strong> ${responderName}</div>
    `,
    ctaText: 'Xem Bảng Quản Trị Admin',
    ctaUrl: appUrl,
    ctaBg: '#a78bfa'
  });

  if (!transporter) {
    return { success: true, simulated: true, individualEmail: individual.email, adminEmails };
  }

  try {
    const promises: Promise<any>[] = [];
    if (individual.email) {
      promises.push(
        transporter.sendMail({
          from: fromSender,
          to: individual.email,
          subject: individualSubject,
          html: individualHtml
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
    return { success: true, simulated: false, individualEmail: individual.email, adminEmails };
  } catch (err) {
    console.error('[Mail Service Error] Failed to send individual rejection emails:', err);
    return { success: false, error: err, individualEmail: individual.email, adminEmails };
  }
}
