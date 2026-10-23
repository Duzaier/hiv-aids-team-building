import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Cleaning existing database tables ---');
  await prisma.auditLog.deleteMany({});
  await prisma.teamMember.deleteMany({});
  await prisma.team.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('--- Creating Admin User ---');
  const adminUser = await prisma.user.create({
    data: {
      id: 'user-admin',
      name: 'Lê Hoàng Admin',
      email: 'admin.lehoang@organizer.org',
      role: 'ADMIN',
      image: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80'
    }
  });

  console.log('--- Creating 4 initial teams with pure UTF-8 Vietnamese ---');
  const initialTeamsData = [
    {
      slot: 1,
      name: 'Chiến Binh Đỏ',
      ownerName: 'Nguyễn Văn An',
      ownerEmail: 'an.nguyen@example.com',
      ownerId: 'user-owner-1',
      members: ['Nguyễn Văn An (Đội trưởng)', 'Trần Thị Thảo', 'Lê Minh Tuấn', 'Phạm Thu Hằng']
    },
    {
      slot: 2,
      name: 'Ruy Băng Kết Nối',
      ownerName: 'Phạm Hồng Đức',
      ownerEmail: 'duc.pham@example.com',
      ownerId: 'user-owner-2',
      members: ['Phạm Hồng Đức (Đội trưởng)', 'Vũ Ngọc Lan', 'Đỗ Quốc Bảo']
    },
    {
      slot: 3,
      name: 'Trái Tim Dũng Cảm',
      ownerName: 'Hoàng Hải Yến',
      ownerEmail: 'yen.hoang@example.com',
      ownerId: 'user-owner-3',
      members: ['Hoàng Hải Yến (Đội trưởng)', 'Ngô Thanh Tùng', 'Bùi Phương Linh', 'Đinh Trọng Nghĩa', 'Hồ Quỳnh Mai']
    },
    {
      slot: 4,
      name: 'Khát Vọng Vươn Lên',
      ownerName: 'Võ Minh Quân',
      ownerEmail: 'quan.vo@example.com',
      ownerId: 'user-owner-4',
      members: ['Võ Minh Quân (Đội trưởng)', 'Lý Hoàng Nam', 'Dương Mỹ Tiên', 'Đoàn Gia Bảo']
    }
  ];

  for (const t of initialTeamsData) {
    const owner = await prisma.user.create({
      data: {
        id: t.ownerId,
        name: t.ownerName,
        email: t.ownerEmail,
        role: 'USER',
        image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'
      }
    });

    const team = await prisma.team.create({
      data: {
        slotNumber: t.slot,
        name: t.name,
        ownerId: owner.id,
        members: {
          create: t.members.map((name, idx) => ({
            name,
            orderIndex: idx + 1
          }))
        }
      }
    });

    console.log(`Created Team Slot #${t.slot}: ${team.name} (${t.members.length} members)`);
  }

  await prisma.auditLog.create({
    data: {
      adminId: adminUser.id,
      action: 'SYSTEM_INIT',
      targetSlot: 0,
      targetTeamName: 'System Bootstrap',
      details: JSON.stringify({ message: 'Khởi tạo dữ liệu mẫu 4 đội ban đầu, 2 slot còn trống' })
    }
  });

  console.log('--- Database seeding completed with clean UTF-8! ---');
}

main()
  .catch((e) => {
    console.error('Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
