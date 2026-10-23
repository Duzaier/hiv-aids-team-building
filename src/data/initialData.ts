import { Team, Persona } from '@/types';

export const SLOT_METADATA = [
  {
    slotNumber: 1,
    nameEn: 'Crimson Vanguard',
    accentColor: 'from-red-600 to-rose-700',
    badgeTitle: 'Crimson Vanguard',
    motto: 'Tiên phong thấu hiểu, dẫn lối yêu thương'
  },
  {
    slotNumber: 2,
    nameEn: 'Red Ribbon Force',
    accentColor: 'from-rose-600 to-pink-700',
    badgeTitle: 'Red Ribbon Force',
    motto: 'Dải băng đỏ gắn kết triệu tấm lòng'
  },
  {
    slotNumber: 3,
    nameEn: 'Heart of Courage',
    accentColor: 'from-orange-600 to-red-600',
    badgeTitle: 'Heart of Courage',
    motto: 'Trái tim quả cảm, vượt mọi rào cản'
  },
  {
    slotNumber: 4,
    nameEn: 'Vitality Pulse',
    accentColor: 'from-amber-600 to-rose-600',
    badgeTitle: 'Vitality Pulse',
    motto: 'Khát vọng vươn lên, sức sống bền bỉ'
  },
  {
    slotNumber: 5,
    nameEn: 'Aurora Hope',
    accentColor: 'from-pink-600 to-purple-700',
    badgeTitle: 'Aurora Hope',
    motto: 'Bước tiếp cùng nhau, vững tin ngày mai'
  },
  {
    slotNumber: 6,
    nameEn: 'United Victory',
    accentColor: 'from-red-700 to-slate-900',
    badgeTitle: 'United Victory',
    motto: 'Gắn kết bền chặt, vươn tầm chiến thắng'
  }
];

export const INITIAL_TEAMS: Team[] = [
  {
    id: 'team-1',
    slotNumber: 1,
    name: 'Chiến Binh Đỏ',
    captainName: 'Nguyễn Văn An',
    ownerId: 'user-an',
    ownerName: 'Nguyễn Văn An',
    ownerEmail: 'nguyenvanan.test@gmail.com',
    registeredAt: '2026-10-23 03:11',
    accentColor: 'from-red-600 to-rose-700',
    badgeTitle: 'Crimson Vanguard',
    members: [
      { id: 'm1-1', name: 'Nguyễn Văn An', isCaptain: true },
      { id: 'm1-2', name: 'Trần Thị Thảo', isCaptain: false },
      { id: 'm1-3', name: 'Lê Minh Tuấn', isCaptain: false },
      { id: 'm1-4', name: 'Phạm Thu Hằng', isCaptain: false }
    ]
  },
  {
    id: 'team-2',
    slotNumber: 2,
    name: 'Ruy Băng Kết Nối',
    captainName: 'Vũ Ngọc Lan',
    ownerId: 'user-duc',
    ownerName: 'Phạm Hồng Đức',
    ownerEmail: 'hongduc.test@gmail.com',
    registeredAt: '2026-10-23 03:11',
    accentColor: 'from-rose-600 to-pink-700',
    badgeTitle: 'Red Ribbon Force',
    members: [
      { id: 'm2-1', name: 'Phạm Hồng Đức', isCaptain: false },
      { id: 'm2-2', name: 'Vũ Ngọc Lan', isCaptain: true },
      { id: 'm2-3', name: 'Đỗ Quốc Bảo', isCaptain: false }
    ]
  },
  {
    id: 'team-3',
    slotNumber: 3,
    name: 'Trái Tim Dũng Cảm',
    captainName: 'Hoàng Hải Yến',
    ownerId: 'user-yen',
    ownerName: 'Hoàng Hải Yến',
    ownerEmail: 'haiyen.test@gmail.com',
    registeredAt: '2026-10-23 03:11',
    accentColor: 'from-orange-600 to-red-600',
    badgeTitle: 'Heart of Courage',
    members: [
      { id: 'm3-1', name: 'Hoàng Hải Yến', isCaptain: true },
      { id: 'm3-2', name: 'Ngô Thanh Tùng', isCaptain: false },
      { id: 'm3-3', name: 'Bùi Phương Linh', isCaptain: false },
      { id: 'm3-4', name: 'Đinh Trọng Nghĩa', isCaptain: false },
      { id: 'm3-5', name: 'Hồ Quỳnh Mai', isCaptain: false }
    ]
  },
  {
    id: 'team-4',
    slotNumber: 4,
    name: 'Khát Vọng Vươn Lên',
    captainName: 'Lý Hoàng Nam',
    ownerId: 'user-quan',
    ownerName: 'Võ Minh Quân',
    ownerEmail: 'minhquan.test@gmail.com',
    registeredAt: '2026-10-23 03:11',
    accentColor: 'from-amber-600 to-rose-600',
    badgeTitle: 'Vitality Pulse',
    members: [
      { id: 'm4-1', name: 'Võ Minh Quân', isCaptain: false },
      { id: 'm4-2', name: 'Lý Hoàng Nam', isCaptain: true },
      { id: 'm4-3', name: 'Dương Mỹ Tiên', isCaptain: false },
      { id: 'm4-4', name: 'Đoàn Gia Bảo', isCaptain: false }
    ]
  }
];

export const MOCK_PERSONAS: Persona[] = [
  {
    id: 'guest',
    label: 'Khách vãng lai',
    role: 'GUEST',
    user: null,
    description: 'Chưa đăng nhập Google, chỉ xem danh sách 6 đội'
  },
  {
    id: 'user-new',
    label: 'Tài khoản Google mới',
    role: 'USER',
    user: {
      id: 'user-tran-hoa',
      name: 'Trần Thanh Hòa',
      email: 'thanhhoa.google@gmail.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hoa',
      role: 'USER'
    },
    description: 'Đã xác thực Google, chưa đăng ký đội, đủ điều kiện chiếm slot trống'
  },
  {
    id: 'user-owner',
    label: 'Chủ Đội 1 (Nguyễn Văn An)',
    role: 'OWNER',
    user: {
      id: 'user-an',
      name: 'Nguyễn Văn An',
      email: 'nguyenvanan.test@gmail.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=An',
      role: 'USER'
    },
    description: 'Sở hữu Đội 1 - Chiến Binh Đỏ (quyền chỉnh sửa riêng)',
    ownedTeamId: 'team-1'
  },
  {
    id: 'admin',
    label: 'Quản trị viên (Admin)',
    role: 'ADMIN',
    user: {
      id: 'admin-hiv-central',
      name: 'Ban Tổ Chức HIV/AIDS',
      email: 'admin.teambuilding@central.org',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
      role: 'ADMIN'
    },
    description: 'Toàn quyền quản lý, sửa đổi và giải phóng slot'
  }
];
