import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with updated Captain Pick support...');

  // 1. Clean existing records
  await prisma.auditLog.deleteMany({});
  await prisma.teamMember.deleteMany({});
  await prisma.team.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create Users
  const adminUser = await prisma.user.create({
    data: {
      id: 'admin-hiv-central',
      email: 'admin.teambuilding@central.org',
      name: 'Ban Tổ Chức HIV/AIDS',
      role: 'ADMIN',
      googleId: 'google-admin-central'
    }
  });

  const userAn = await prisma.user.create({
    data: {
      id: 'user-an',
      email: 'nguyenvanan.test@gmail.com',
      name: 'Nguyễn Văn An',
      role: 'USER',
      googleId: 'google-user-an'
    }
  });

  const userDuc = await prisma.user.create({
    data: {
      id: 'user-duc',
      email: 'hongduc.test@gmail.com',
      name: 'Phạm Hồng Đức',
      role: 'USER',
      googleId: 'google-user-duc'
    }
  });

  const userYen = await prisma.user.create({
    data: {
      id: 'user-yen',
      email: 'haiyen.test@gmail.com',
      name: 'Hoàng Hải Yến',
      role: 'USER',
      googleId: 'google-user-yen'
    }
  });

  const userQuan = await prisma.user.create({
    data: {
      id: 'user-quan',
      email: 'minhquan.test@gmail.com',
      name: 'Võ Minh Quân',
      role: 'USER',
      googleId: 'google-user-quan'
    }
  });

  // 3. Create Teams with Captain distinction
  await prisma.team.create({
    data: {
      id: 'team-1',
      slotNumber: 1,
      name: 'Chiến Binh Đỏ',
      captainName: 'Nguyễn Văn An',
      ownerId: userAn.id,
      members: {
        create: [
          { name: 'Nguyễn Văn An', orderIndex: 1, isCaptain: true },
          { name: 'Trần Thị Thảo', orderIndex: 2, isCaptain: false },
          { name: 'Lê Minh Tuấn', orderIndex: 3, isCaptain: false },
          { name: 'Phạm Thu Hằng', orderIndex: 4, isCaptain: false }
        ]
      }
    }
  });

  await prisma.team.create({
    data: {
      id: 'team-2',
      slotNumber: 2,
      name: 'Ruy Băng Kết Nối',
      captainName: 'Vũ Ngọc Lan',
      ownerId: userDuc.id,
      members: {
        create: [
          { name: 'Phạm Hồng Đức', orderIndex: 1, isCaptain: false },
          { name: 'Vũ Ngọc Lan', orderIndex: 2, isCaptain: true },
          { name: 'Đỗ Quốc Bảo', orderIndex: 3, isCaptain: false }
        ]
      }
    }
  });

  await prisma.team.create({
    data: {
      id: 'team-3',
      slotNumber: 3,
      name: 'Trái Tim Dũng Cảm',
      captainName: 'Hoàng Hải Yến',
      ownerId: userYen.id,
      members: {
        create: [
          { name: 'Hoàng Hải Yến', orderIndex: 1, isCaptain: true },
          { name: 'Ngô Thanh Tùng', orderIndex: 2, isCaptain: false },
          { name: 'Bùi Phương Linh', orderIndex: 3, isCaptain: false },
          { name: 'Đinh Trọng Nghĩa', orderIndex: 4, isCaptain: false },
          { name: 'Hồ Quỳnh Mai', orderIndex: 5, isCaptain: false }
        ]
      }
    }
  });

  await prisma.team.create({
    data: {
      id: 'team-4',
      slotNumber: 4,
      name: 'Khát Vọng Vươn Lên',
      captainName: 'Lý Hoàng Nam',
      ownerId: userQuan.id,
      members: {
        create: [
          { name: 'Võ Minh Quân', orderIndex: 1, isCaptain: false },
          { name: 'Lý Hoàng Nam', orderIndex: 2, isCaptain: true },
          { name: 'Dương Mỹ Tiên', orderIndex: 3, isCaptain: false },
          { name: 'Đoàn Gia Bảo', orderIndex: 4, isCaptain: false }
        ]
      }
    }
  });

  console.log('[OK] Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
