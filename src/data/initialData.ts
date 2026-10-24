import { Team, Persona } from '@/types';

export const SLOT_METADATA = [
  {
    slotNumber: 1,
    nameEn: 'Team 1',
    accentColor: 'bg-red-600',
    borderColor: 'border-red-500/50',
    badgeTitle: 'Đội 1',
    motto: 'Hiểu đúng để sẻ chia'
  },
  {
    slotNumber: 2,
    nameEn: 'Team 2',
    accentColor: 'bg-rose-600',
    borderColor: 'border-rose-500/50',
    badgeTitle: 'Đội 2',
    motto: 'Chủ động bảo vệ sức khỏe cộng đồng'
  },
  {
    slotNumber: 3,
    nameEn: 'Team 3',
    accentColor: 'bg-orange-600',
    borderColor: 'border-orange-500/50',
    badgeTitle: 'Đội 3',
    motto: 'Không kỳ thị, cùng đồng hành'
  },
  {
    slotNumber: 4,
    nameEn: 'Team 4',
    accentColor: 'bg-amber-600',
    borderColor: 'border-amber-500/50',
    badgeTitle: 'Đội 4',
    motto: 'Đồng đội gắn kết, thi đấu hết mình'
  },
  {
    slotNumber: 5,
    nameEn: 'Team 5',
    accentColor: 'bg-purple-600',
    borderColor: 'border-purple-500/50',
    badgeTitle: 'Đội 5',
    motto: 'Đoàn kết là sức mạnh'
  },
  {
    slotNumber: 6,
    nameEn: 'Team 6',
    accentColor: 'bg-sky-600',
    borderColor: 'border-sky-500/50',
    badgeTitle: 'Đội 6',
    motto: 'Hết mình vì tập thể'
  }
];

export const INITIAL_TEAMS: Team[] = [
  {
    id: 'team-1',
    slotNumber: 1,
    name: 'Đội 1',
    captainName: 'Nguyễn Văn An',
    ownerId: 'user-an',
    ownerName: 'Nguyễn Văn An',
    ownerEmail: 'nguyenvanan.test@gmail.com',
    registeredAt: '2026-10-23 03:11',
    accentColor: 'bg-red-600',
    badgeTitle: 'Đội 1',
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
    name: 'Đội 2',
    captainName: 'Vũ Ngọc Lan',
    ownerId: 'user-duc',
    ownerName: 'Phạm Hồng Đức',
    ownerEmail: 'hongduc.test@gmail.com',
    registeredAt: '2026-10-23 03:11',
    accentColor: 'bg-rose-600',
    badgeTitle: 'Đội 2',
    members: [
      { id: 'm2-1', name: 'Phạm Hồng Đức', isCaptain: false },
      { id: 'm2-2', name: 'Vũ Ngọc Lan', isCaptain: true },
      { id: 'm2-3', name: 'Đỗ Quốc Bảo', isCaptain: false }
    ]
  },
  {
    id: 'team-3',
    slotNumber: 3,
    name: 'Đội 3',
    captainName: 'Hoàng Hải Yến',
    ownerId: 'user-yen',
    ownerName: 'Hoàng Hải Yến',
    ownerEmail: 'haiyen.test@gmail.com',
    registeredAt: '2026-10-23 03:11',
    accentColor: 'bg-orange-600',
    badgeTitle: 'Đội 3',
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
    name: 'Đội 4',
    captainName: 'Lý Hoàng Nam',
    ownerId: 'user-quan',
    ownerName: 'Võ Minh Quân',
    ownerEmail: 'minhquan.test@gmail.com',
    registeredAt: '2026-10-23 03:11',
    accentColor: 'bg-amber-600',
    badgeTitle: 'Đội 4',
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
    description: 'Sở hữu Đội 1 (quyền chỉnh sửa riêng)',
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
    description: 'Toàn quyền quản lý, sửa đội và giải phóng slot'
  }
];