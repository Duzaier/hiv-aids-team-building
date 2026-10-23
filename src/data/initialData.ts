import { Team, Persona, User } from '@/types';

export const SLOT_METADATA = [
  {
    slotNumber: 1,
    nameDefault: 'Chiáº¿n Binh Äá»',
    accentColor: 'from-red-600 to-rose-700',
    borderColor: 'border-red-500/40 hover:border-red-500',
    glowColor: 'shadow-red-500/10',
    badgeTitle: 'Crimson Vanguard',
    motto: 'Ngá»n lá»­a tiÃªn phong vÃ¬ nháº­n thá»©c cá»™ng Ä‘á»“ng'
  },
  {
    slotNumber: 2,
    nameDefault: 'Ruy BÄƒng Káº¿t Ná»‘i',
    accentColor: 'from-rose-600 to-pink-700',
    borderColor: 'border-rose-500/40 hover:border-rose-500',
    glowColor: 'shadow-rose-500/10',
    badgeTitle: 'Red Ribbon Force',
    motto: 'Lan tá»a yÃªu thÆ°Æ¡ng, xÃ³a nhÃ²a khoáº£ng cÃ¡ch'
  },
  {
    slotNumber: 3,
    nameDefault: 'TrÃ¡i Tim DÅ©ng Cáº£m',
    accentColor: 'from-red-700 to-amber-700',
    borderColor: 'border-amber-600/40 hover:border-amber-500',
    glowColor: 'shadow-amber-500/10',
    badgeTitle: 'Heart of Courage',
    motto: 'KhÃ´ng phÃ¡n xÃ©t, luÃ´n sáº» chia vÃ  tháº¥u hiá»ƒu'
  },
  {
    slotNumber: 4,
    nameDefault: 'KhÃ¡t Vá»ng VÆ°Æ¡n LÃªn',
    accentColor: 'from-orange-600 to-red-700',
    borderColor: 'border-orange-500/40 hover:border-orange-500',
    glowColor: 'shadow-orange-500/10',
    badgeTitle: 'Vitality Pulse',
    motto: 'Chung sá»©c Ä‘á»“ng lÃ²ng vÃ¬ má»™t tÆ°Æ¡ng lai khá»e máº¡nh'
  },
  {
    slotNumber: 5,
    nameDefault: 'Ãnh DÆ°Æ¡ng Hy Vá»ng',
    accentColor: 'from-pink-600 to-red-800',
    borderColor: 'border-pink-500/40 hover:border-pink-500',
    glowColor: 'shadow-pink-500/10',
    badgeTitle: 'Aurora Hope',
    motto: 'BÆ°á»›c tiáº¿p cÃ¹ng nhau, vá»¯ng tin ngÃ y mai'
  },
  {
    slotNumber: 6,
    nameDefault: 'VÃ²ng Tay Äá»“ng Äá»™i',
    accentColor: 'from-red-800 to-rose-950',
    borderColor: 'border-rose-700/40 hover:border-rose-600',
    glowColor: 'shadow-rose-700/10',
    badgeTitle: 'United Victory',
    motto: 'Gáº¯n káº¿t bá»n cháº·t, vÆ°Æ¡n táº§m chiáº¿n tháº¯ng'
  }
];

export const INITIAL_TEAMS: Team[] = [
  {
    id: 'team-1',
    slotNumber: 1,
    name: 'Chiáº¿n Binh Äá»',
    ownerId: 'user-owner-1',
    ownerName: 'Nguyá»…n VÄƒn An',
    ownerEmail: 'an.nguyen@example.com',
    registeredAt: '2026-10-23 08:15',
    accentColor: 'from-red-600 to-rose-700',
    badgeTitle: 'Crimson Vanguard',
    members: [
      { id: 'm-1-1', name: 'Nguyá»…n VÄƒn An (Äá»™i trÆ°á»Ÿng)' },
      { id: 'm-1-2', name: 'Tráº§n Thá»‹ Tháº£o' },
      { id: 'm-1-3', name: 'LÃª Minh Tuáº¥n' },
      { id: 'm-1-4', name: 'Pháº¡m Thu Háº±ng' }
    ]
  },
  {
    id: 'team-2',
    slotNumber: 2,
    name: 'Ruy BÄƒng Káº¿t Ná»‘i',
    ownerId: 'user-owner-2',
    ownerName: 'Pháº¡m Há»“ng Äá»©c',
    ownerEmail: 'duc.pham@example.com',
    registeredAt: '2026-10-23 08:30',
    accentColor: 'from-rose-600 to-pink-700',
    badgeTitle: 'Red Ribbon Force',
    members: [
      { id: 'm-2-1', name: 'Pháº¡m Há»“ng Äá»©c (Äá»™i trÆ°á»Ÿng)' },
      { id: 'm-2-2', name: 'VÅ© Ngá»c Lan' },
      { id: 'm-2-3', name: 'Äá»— Quá»‘c Báº£o' }
    ]
  },
  {
    id: 'team-3',
    slotNumber: 3,
    name: 'TrÃ¡i Tim DÅ©ng Cáº£m',
    ownerId: 'user-owner-3',
    ownerName: 'HoÃ ng Háº£i Yáº¿n',
    ownerEmail: 'yen.hoang@example.com',
    registeredAt: '2026-10-23 08:45',
    accentColor: 'from-red-700 to-amber-700',
    badgeTitle: 'Heart of Courage',
    members: [
      { id: 'm-3-1', name: 'HoÃ ng Háº£i Yáº¿n (Äá»™i trÆ°á»Ÿng)' },
      { id: 'm-3-2', name: 'NgÃ´ Thanh TÃ¹ng' },
      { id: 'm-3-3', name: 'BÃ¹i PhÆ°Æ¡ng Linh' },
      { id: 'm-3-4', name: 'Äinh Trá»ng NghÄ©a' },
      { id: 'm-3-5', name: 'Há»“ Quá»³nh Mai' }
    ]
  },
  {
    id: 'team-4',
    slotNumber: 4,
    name: 'KhÃ¡t Vá»ng VÆ°Æ¡n LÃªn',
    ownerId: 'user-owner-4',
    ownerName: 'VÃµ Minh QuÃ¢n',
    ownerEmail: 'quan.vo@example.com',
    registeredAt: '2026-10-23 09:05',
    accentColor: 'from-orange-600 to-red-700',
    badgeTitle: 'Vitality Pulse',
    members: [
      { id: 'm-4-1', name: 'VÃµ Minh QuÃ¢n (Äá»™i trÆ°á»Ÿng)' },
      { id: 'm-4-2', name: 'LÃ½ HoÃ ng Nam' },
      { id: 'm-4-3', name: 'DÆ°Æ¡ng Má»¹ TiÃªn' },
      { id: 'm-4-4', name: 'ÄoÃ n Gia Báº£o' }
    ]
  }
];

export const MOCK_PERSONAS: Persona[] = [
  {
    id: 'persona-guest',
    label: 'KhÃ¡ch vÃ£ng lai',
    role: 'GUEST',
    user: null,
    description: 'ChÆ°a Ä‘Äƒng nháº­p. CÃ³ thá»ƒ xem 6 tháº» Ä‘á»™i vÃ  tÃªn thÃ nh viÃªn cÃ´ng khai.'
  },
  {
    id: 'persona-new-user',
    label: 'TÃ i khoáº£n Google má»›i',
    role: 'USER',
    user: {
      id: 'user-new-5',
      name: 'Tráº§n Mai Anh',
      email: 'maianh.tran@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
      role: 'USER'
    },
    description: 'ÄÃ£ xÃ¡c thá»±c Google, chÆ°a cÃ³ Ä‘á»™i. Äá»§ Ä‘iá»u kiá»‡n Ä‘Äƒng kÃ½ vÃ o Slot trá»‘ng.'
  },
  {
    id: 'persona-owner-1',
    label: 'Chá»§ Äá»™i 1 (Nguyá»…n VÄƒn An)',
    role: 'OWNER',
    ownedTeamId: 'team-1',
    user: {
      id: 'user-owner-1',
      name: 'Nguyá»…n VÄƒn An',
      email: 'an.nguyen@example.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      role: 'USER'
    },
    description: 'Chá»§ sá»Ÿ há»¯u Äá»™i 1. ÄÆ°á»£c quyá»n chá»‰nh sá»­a tÃªn Ä‘á»™i vÃ  thÃ nh viÃªn cá»§a mÃ¬nh.'
  },
  {
    id: 'persona-admin',
    label: 'Quáº£n trá»‹ viÃªn (Admin)',
    role: 'ADMIN',
    user: {
      id: 'user-admin',
      name: 'LÃª HoÃ ng Admin',
      email: 'admin.lehoang@organizer.org',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
      role: 'ADMIN'
    },
    description: 'Quyá»n quáº£n trá»‹ toÃ n diá»‡n: Xem, sá»­a, xÃ³a báº¥t ká»³ Ä‘á»™i nÃ o vÃ  kiá»ƒm soÃ¡t slot.'
  }
];
