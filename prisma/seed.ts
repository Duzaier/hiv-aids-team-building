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
      name: 'LÃª HoÃ ng Admin',
      email: 'admin.lehoang@organizer.org',
      role: 'ADMIN',
      image: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80'
    }
  });

  console.log('--- Creating 4 initial teams with 3-5 members ---');
  const initialTeamsData = [
    {
      slot: 1,
      name: 'Chiáº¿n Binh Äá»',
      ownerName: 'Nguyá»…n VÄƒn An',
      ownerEmail: 'an.nguyen@example.com',
      ownerId: 'user-owner-1',
      members: ['Nguyá»…n VÄƒn An (Äá»™i trÆ°á»Ÿng)', 'Tráº§n Thá»‹ Tháº£o', 'LÃª Minh Tuáº¥n', 'Pháº¡m Thu Háº±ng']
    },
    {
      slot: 2,
      name: 'Ruy BÄƒng Káº¿t Ná»‘i',
      ownerName: 'Pháº¡m Há»“ng Äá»©c',
      ownerEmail: 'duc.pham@example.com',
      ownerId: 'user-owner-2',
      members: ['Pháº¡m Há»“ng Äá»©c (Äá»™i trÆ°á»Ÿng)', 'VÅ© Ngá»c Lan', 'Äá»— Quá»‘c Báº£o']
    },
    {
      slot: 3,
      name: 'TrÃ¡i Tim DÅ©ng Cáº£m',
      ownerName: 'HoÃ ng Háº£i Yáº¿n',
      ownerEmail: 'yen.hoang@example.com',
      ownerId: 'user-owner-3',
      members: ['HoÃ ng Háº£i Yáº¿n (Äá»™i trÆ°á»Ÿng)', 'NgÃ´ Thanh TÃ¹ng', 'BÃ¹i PhÆ°Æ¡ng Linh', 'Äinh Trá»ng NghÄ©a', 'Há»“ Quá»³nh Mai']
    },
    {
      slot: 4,
      name: 'KhÃ¡t Vá»ng VÆ°Æ¡n LÃªn',
      ownerName: 'VÃµ Minh QuÃ¢n',
      ownerEmail: 'quan.vo@example.com',
      ownerId: 'user-owner-4',
      members: ['VÃµ Minh QuÃ¢n (Äá»™i trÆ°á»Ÿng)', 'LÃ½ HoÃ ng Nam', 'DÆ°Æ¡ng Má»¹ TiÃªn', 'ÄoÃ n Gia Báº£o']
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
      details: JSON.stringify({ message: 'Khá»Ÿi táº¡o dá»¯ liá»‡u máº«u 4 Ä‘á»™i ban Ä‘áº§u, 2 slot cÃ²n trá»‘ng' })
    }
  });

  console.log('--- Database seeding completed successfully! ---');
}

main()
  .catch((e) => {
    console.error('Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });