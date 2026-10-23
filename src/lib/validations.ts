import { z } from 'zod';

export const teamRegistrationSchema = z.object({
  slotNumber: z.number().int().min(1).max(6).optional(),
  teamName: z.string().trim().optional(),
  captainName: z.string().trim().optional(),
  members: z
    .array(
      z
        .string()
        .trim()
        .min(2, 'Họ tên thành viên phải có ít nhất 2 ký tự')
        .max(50, 'Họ tên không được vượt quá 50 ký tự')
    )
    .min(2, 'Đội thi đấu phải có tối thiểu 2 thành viên')
    .max(5, 'Đội thi đấu tối đa 5 thành viên')
    .refine(
      (items) => {
        const lower = items.map((i) => i.toLowerCase().trim());
        return new Set(lower).size === lower.length;
      },
      { message: 'Danh sách thành viên không được chứa tên trùng lặp' }
    )
});

export const teamUpdateSchema = z.object({
  teamName: z.string().trim().optional(),
  captainName: z.string().trim().optional(),
  members: z
    .array(
      z
        .string()
        .trim()
        .min(2, 'Họ tên thành viên phải có ít nhất 2 ký tự')
        .max(50, 'Họ tên không được vượt quá 50 ký tự')
    )
    .min(1, 'Đội thi đấu phải có ít nhất 1 thành viên')
    .max(5, 'Đội thi đấu tối đa 5 thành viên')
    .refine(
      (items) => {
        const lower = items.map((i) => i.toLowerCase().trim());
        return new Set(lower).size === lower.length;
      },
      { message: 'Danh sách thành viên không được chứa tên trùng lặp' }
    )
    .optional()
});

export const individualRegistrationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Họ tên phải có ít nhất 2 ký tự')
    .max(50, 'Họ tên không được vượt quá 50 ký tự'),
  email: z
    .string()
    .trim()
    .email('Địa chỉ email không hợp lệ'),
  phone: z
    .string()
    .trim()
    .max(20, 'Số điện thoại không hợp lệ')
    .optional()
    .or(z.literal(''))
});
