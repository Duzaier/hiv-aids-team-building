import { z } from 'zod';

export const teamRegistrationSchema = z.object({
  teamName: z
    .string()
    .trim()
    .min(2, 'TÃªn Ä‘á»™i pháº£i cÃ³ Ã­t nháº¥t 2 kÃ½ tá»±')
    .max(50, 'TÃªn Ä‘á»™i khÃ´ng Ä‘Æ°á»£c vÆ°á»£t quÃ¡ 50 kÃ½ tá»±'),
  members: z
    .array(
      z
        .string()
        .trim()
        .min(2, 'Há» tÃªn thÃ nh viÃªn pháº£i cÃ³ Ã­t nháº¥t 2 kÃ½ tá»±')
        .max(50, 'Há» tÃªn khÃ´ng Ä‘Æ°á»£c vÆ°á»£t quÃ¡ 50 kÃ½ tá»±')
    )
    .min(3, 'Äá»™i thi Ä‘áº¥u pháº£i cÃ³ tá»‘i thiá»ƒu 3 thÃ nh viÃªn')
    .max(5, 'Äá»™i thi Ä‘áº¥u tá»‘i Ä‘a 5 thÃ nh viÃªn')
    .refine(
      (items) => {
        const lower = items.map((i) => i.toLowerCase());
        return new Set(lower).size === lower.length;
      },
      { message: 'Danh sÃ¡ch thÃ nh viÃªn khÃ´ng Ä‘Æ°á»£c chá»©a tÃªn trÃ¹ng láº·p' }
    )
});

export const teamUpdateSchema = z.object({
  teamName: z
    .string()
    .trim()
    .min(2, 'TÃªn Ä‘á»™i pháº£i cÃ³ Ã­t nháº¥t 2 kÃ½ tá»±')
    .max(50, 'TÃªn Ä‘á»™i khÃ´ng Ä‘Æ°á»£c vÆ°á»£t quÃ¡ 50 kÃ½ tá»±')
    .optional(),
  members: z
    .array(
      z
        .string()
        .trim()
        .min(2, 'Há» tÃªn thÃ nh viÃªn pháº£i cÃ³ Ã­t nháº¥t 2 kÃ½ tá»±')
        .max(50, 'Há» tÃªn khÃ´ng Ä‘Æ°á»£c vÆ°á»£t quÃ¡ 50 kÃ½ tá»±')
    )
    .min(3, 'Äá»™i thi Ä‘áº¥u pháº£i cÃ³ tá»‘i thiá»ƒu 3 thÃ nh viÃªn')
    .max(5, 'Äá»™i thi Ä‘áº¥u tá»‘i Ä‘a 5 thÃ nh viÃªn')
    .refine(
      (items) => {
        const lower = items.map((i) => i.toLowerCase());
        return new Set(lower).size === lower.length;
      },
      { message: 'Danh sÃ¡ch thÃ nh viÃªn khÃ´ng Ä‘Æ°á»£c chá»©a tÃªn trÃ¹ng láº·p' }
    )
    .optional()
});