// Chỉ duy nhất tài khoản này có quyền Admin. Các tài khoản khác luôn là USER.
export const ADMIN_EMAIL = 'phudt.ce192043@gmail.com';

export const DEFAULT_ADMIN_EMAILS = [ADMIN_EMAIL];

export function getAdminEmails(): string[] {
  return [ADMIN_EMAIL];
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === ADMIN_EMAIL;
}
