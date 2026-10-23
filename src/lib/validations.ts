import { z } from 'zod';

export const teamRegistrationSchema = z
  .object({
    teamName: z
      .string()
      .trim()
      .min(2, 'Tên đội phải có ít nhất 2 ký tự')
      .max(50, 'Tên đội không được vượt quá 50 ký tự'),
    captainName: z
      .string()
      .trim()
      .min(2, 'Vui lòng chọn hoặc nhập tên đội trưởng')
      .max(50, 'Tên đội trưởng không được vượt quá 50 ký tự'),
    members: z
      .array(
        z
          .string()
          .trim()
          .min(2, 'Họ tên thành viên phải có ít nhất 2 ký tự')
          .max(50, 'Họ tên không được vượt quá 50 ký tự')
      )
      .min(3, 'Đội thi đấu phải có tối thiểu 3 thành viên')
      .max(5, 'Đội thi đấu tối đa 5 thành viên')
      .refine(
        (items) => {
          const lower = items.map((i) => i.toLowerCase().trim());
          return new Set(lower).size === lower.length;
        },
        { message: 'Danh sách thành viên không được chứa tên trùng lặp' }
      )
  })
  .refine(
    (data) => {
      const lowerCap = data.captainName.toLowerCase().trim();
      return data.members.some((m) => m.toLowerCase().trim() === lowerCap);
    },
    {
      message: 'Đội trưởng được chọn phải là một trong các thành viên trong danh sách',
      path: ['captainName']
    }
  );

export const teamUpdateSchema = z
  .object({
    teamName: z
      .string()
      .trim()
      .min(2, 'Tên đội phải có ít nhất 2 ký tự')
      .max(50, 'Tên đội không được vượt quá 50 ký tự')
      .optional(),
    captainName: z
      .string()
      .trim()
      .min(2, 'Vui lòng chọn hoặc nhập tên đội trưởng')
      .max(50, 'Tên đội trưởng không được vượt quá 50 ký tự')
      .optional(),
    members: z
      .array(
        z
          .string()
          .trim()
          .min(2, 'Họ tên thành viên phải có ít nhất 2 ký tự')
          .max(50, 'Họ tên không được vượt quá 50 ký tự')
      )
      .min(3, 'Đội thi đấu phải có tối thiểu 3 thành viên')
      .max(5, 'Đội thi đấu tối đa 5 thành viên')
      .refine(
        (items) => {
          const lower = items.map((i) => i.toLowerCase().trim());
          return new Set(lower).size === lower.length;
        },
        { message: 'Danh sách thành viên không được chứa tên trùng lặp' }
      )
      .optional()
  })
  .refine(
    (data) => {
      if (data.captainName && data.members) {
        const lowerCap = data.captainName.toLowerCase().trim();
        return data.members.some((m) => m.toLowerCase().trim() === lowerCap);
      }
      return true;
    },
    {
      message: 'Đội trưởng được chọn phải là một trong các thành viên trong danh sách',
      path: ['captainName']
    }
  );
