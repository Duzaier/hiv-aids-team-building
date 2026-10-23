import { Team, Persona } from '@/types';

export const SLOT_METADATA = [
  {
    slotNumber: 1,
    nameDefault: 'Chiến Binh Đỏ',
    accentColor: 'from-red-600 to-rose-700',
    borderColor: 'border-red-500/40 hover:border-red-500',
    glowColor: 'shadow-red-500/10',
    badgeTitle: 'Crimson Vanguard',
    motto: 'Ngọn lửa tiên phong vì nhận thức cộng đồng'
  },
  {
    slotNumber: 2,
    nameDefault: 'Ruy Băng Kết Nối',
    accentColor: 'from-rose-600 to-pink-700',
    borderColor: 'border-rose-500/40 hover:border-rose-500',
    glowColor: 'shadow-rose-500/10',
    badgeTitle: 'Red Ribbon Force',
    motto: 'Lan tỏa yêu thương, xóa nhòa khoảng cách'
  },
  {
    slotNumber: 3,
    nameDefault: 'Trái Tim Dũng Cảm',
    accentColor: 'from-red-700 to-amber-700',
    borderColor: 'border-amber-600/40 hover:border-amber-500',
    glowColor: 'shadow-amber-500/10',
    badgeTitle: 'Heart of Courage',
    motto: 'Không phán xét, luôn sẻ chia và thấu hiểu'
  },
  {
    slotNumber: 4,
    nameDefault: 'Khát Vọng Vươn Lên',
    accentColor: 'from-orange-600 to-red-700',
    borderColor: 'border-orange-500/40 hover:border-orange-500',
    glowColor: 'shadow-orange-500/10',
    badgeTitle: 'Vitality Pulse',
    motto: 'Chung sức đồng lòng vì một tương lai khỏe mạnh'
  },
  {
    slotNumber: 5,
    nameDefault: 'Ánh Dương Hy Vọng',
    accentColor: 'from-pink-600 to-red-800',
    borderColor: 'border-pink-500/40 hover:border-pink-500',
    glowColor: 'shadow-pink-500/10',
    badgeTitle: 'Aurora Hope',
    motto: 'Bước tiếp cùng nhau, vững tin ngày mai'
  },
  {
    slotNumber: 6,
    nameDefault: 'Vòng Tay Đồng Đội',
    accentColor: 'from-red-800 to-rose-950',
    borderColor: 'border-rose-700/40 hover:border-rose-600',
    glowColor: 'shadow-rose-700/10',
    badgeTitle: 'United Victory',
    motto: 'Gắn kết bền chặt, vươn tầm chiến thắng'
  }
];

export const INITIAL_TEAMS: Team[] = [
  {
    id: 'team-1',
    slotNumber: 1,
    name: 'Chiến Binh Đỏ',
    ownerId: 'user-owner-1',
    ownerName: 'Nguyễn Văn An',
    ownerEmail: 'an.nguyen@example.com',
    registeredAt: '2026-10-23 08:15',
    accentColor: 'from-red-600 to-rose-700',
    badgeTitle: 'Crimson Vanguard',
    members: [
      { id: 'm-1-1', name: 'Nguyễn Văn An (Đội trưởng)' },
      { id: 'm-1-2', name: 'Trần Thị Thảo' },
      { id: 'm-1-3', name: 'Lê Minh Tuấn' },
      { id: 'm-1-4', name: 'Phạm Thu Hằng' }
    ]
  },
  {
    id: 'team-2',
    slotNumber: 2,
    name: 'Ruy Băng Kết Nối',
    ownerId: 'user-owner-2',
    ownerName: 'Phạm Hồng Đức',
    ownerEmail: 'duc.pham@example.com',
    registeredAt: '2026-10-23 08:30',
    accentColor: 'from-rose-600 to-pink-700',
    badgeTitle: 'Red Ribbon Force',
    members: [
      { id: 'm-2-1', name: 'Phạm Hồng Đức (Đội trưởng)' },
      { id: 'm-2-2', name: 'Vũ Ngọc Lan' },
      { id: 'm-2-3', name: 'Đỗ Quốc Bảo' }
    ]
  },
  {
    id: 'team-3',
    slotNumber: 3,
    name: 'Trái Tim Dũng Cảm',
    ownerId: 'user-owner-3',
    ownerName: 'Hoàng Hải Yến',
    ownerEmail: 'yen.hoang@example.com',
    registeredAt: '2026-10-23 08:45',
    accentColor: 'from-red-700 to-amber-700',
    badgeTitle: 'Heart of Courage',
    members: [
      { id: 'm-3-1', name: 'Hoàng Hải Yến (Đội trưởng)' },
      { id: 'm-3-2', name: 'Ngô Thanh Tùng' },
      { id: 'm-3-3', name: 'Bùi Phương Linh' },
      { id: 'm-3-4', name: 'Đinh Trọng Nghĩa' },
      { id: 'm-3-5', name: 'Hồ Quỳnh Mai' }
    ]
  },
  {
    id: 'team-4',
    slotNumber: 4,
    name: 'Khát Vọng Vươn Lên',
    ownerId: 'user-owner-4',
    ownerName: 'Võ Minh Quân',
    ownerEmail: 'quan.vo@example.com',
    registeredAt: '2026-10-23 09:05',
    accentColor: 'from-orange-600 to-red-700',
    badgeTitle: 'Vitality Pulse',
    members: [
      { id: 'm-4-1', name: 'Võ Minh Quân (Đội trưởng)' },
      { id: 'm-4-2', name: 'Lý Hoàng Nam' },
      { id: 'm-4-3', name: 'Dương Mỹ Tiên' },
      { id: 'm-4-4', name: 'Đoàn Gia Bảo' }
    ]
  }
];

export const MOCK_PERSONAS: Persona[] = [
  {
    id: 'persona-guest',
    label: 'Khách vãng lai',
    role: 'GUEST',
    user: null,
    description: 'Chưa đăng nhập. Có thể xem 6 thẻ đội và tên thành viên công khai.'
  },
  {
    id: 'persona-new-user',
    label: 'Tài khoản Google mới',
    role: 'USER',
    user: {
      id: 'user-new-5',
      name: 'Trần Mai Anh',
      email: 'maianh.tran@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
      role: 'USER'
    },
    description: 'Đã xác thực Google, chưa có đội. Đủ điều kiện đăng ký vào Slot trống.'
  },
  {
    id: 'persona-owner-1',
    label: 'Chủ Đội 1 (Nguyễn Văn An)',
    role: 'OWNER',
    ownedTeamId: 'team-1',
    user: {
      id: 'user-owner-1',
      name: 'Nguyễn Văn An',
      email: 'an.nguyen@example.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      role: 'USER'
    },
    description: 'Chủ sở hữu Đội 1. Được quyền chỉnh sửa tên đội và thành viên của mình.'
  },
  {
    id: 'persona-admin',
    label: 'Quản trị viên (Admin)',
    role: 'ADMIN',
    user: {
      id: 'user-admin',
      name: 'Lê Hoàng Admin',
      email: 'admin.lehoang@organizer.org',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
      role: 'ADMIN'
    },
    description: 'Quyền quản trị toàn diện: Xem, sửa, xóa bất kỳ đội nào và kiểm soát slot.'
  }
];
