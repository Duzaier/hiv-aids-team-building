import { z } from 'zod';

export const memberItemSchema = z.union([
  z.object({
    name: z
      .string()
      .trim()
      .min(2, 'Họ tên thành viên phải có ít nhất 2 ký tự')
      .max(50, 'Họ tên không được vượt quá 50 ký tự'),
    studentId: z
      .string()
      .trim()
      .min(3, 'MSSV phải có ít nhất 3 ký tự')
      .max(20, 'MSSV không hợp lệ'),
    email: z
      .string()
      .trim()
      .email('Gmail không hợp lệ'),
    phone: z
      .string()
      .trim()
      .min(8, 'Số điện thoại/Zalo phải có ít nhất 8 số')
      .max(20, 'Số điện thoại không hợp lệ')
  }),
  z
    .string()
    .trim()
    .min(2, 'Họ tên thành viên phải có ít nhất 2 ký tự')
    .transform((name) => ({
      name,
      studentId: '',
      email: '',
      phone: ''
    }))
]);

export const teamRegistrationSchema = z.object({
  slotNumber: z.number().int().min(1).max(6).optional(),
  teamName: z.string().trim().optional(),
  captainName: z.string().trim().optional(),
  members: z
    .array(memberItemSchema)
    .min(2, 'Đội thi đấu phải có tối thiểu 2 thành viên')
    .max(5, 'Đội thi đấu tối đa 5 thành viên')
    .refine(
      (items) => {
        const lower = items.map((i) => i.name.toLowerCase().trim());
        return new Set(lower).size === lower.length;
      },
      { message: 'Danh sách thành viên không được chứa họ tên trùng lặp' }
    )
});

export const teamUpdateSchema = z.object({
  teamName: z.string().trim().optional(),
  captainName: z.string().trim().optional(),
  members: z
    .array(memberItemSchema)
    .min(1, 'Đội thi đấu phải có ít nhất 1 thành viên')
    .max(5, 'Đội thi đấu tối đa 5 thành viên')
    .optional()
});

export const individualRegistrationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Họ tên phải có ít nhất 2 ký tự')
    .max(50, 'Họ tên không được vượt quá 50 ký tự'),
  studentId: z
    .string()
    .trim()
    .min(3, 'MSSV phải có ít nhất 3 ký tự')
    .max(20, 'MSSV không hợp lệ'),
  email: z
    .string()
    .trim()
    .email('Địa chỉ email không hợp lệ'),
  phone: z
    .string()
    .trim()
    .min(8, 'Số điện thoại/Zalo phải có ít nhất 8 số')
    .max(20, 'Số điện thoại không hợp lệ')
});