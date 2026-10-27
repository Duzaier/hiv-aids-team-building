// Danh sách các tài khoản có vai trò Quản Trị Viên (Admin)
export const ADMIN_EMAILS: string[] = [
  'phudt.ce192043@gmail.com',
  'linhtnpcs200336@gmail.com',
  'phulvcs201672@gmail.com',
  'daoptacs200395@gmail.com',
  'huynhthaongancs200296@gmail.com',
  'huongqn.cs200159@gmail.com',
  'adaoad412@gmail.com'
];

export const ADMIN_EMAIL = ADMIN_EMAILS[0];
export const DEFAULT_ADMIN_EMAILS = ADMIN_EMAILS;

export function getAdminEmails(): string[] {
  const envAdminEmails = process.env.ADMIN_EMAILS
    ? process.env.ADMIN_EMAILS.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)
    : [];
  const set = new Set<string>([...ADMIN_EMAILS.map((e) => e.toLowerCase()), ...envAdminEmails]);
  return Array.from(set);
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  const allAdmins = getAdminEmails();
  return allAdmins.includes(clean);
}
