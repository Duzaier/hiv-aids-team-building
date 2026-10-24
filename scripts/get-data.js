const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const teams = await prisma.team.findMany({
    include: { members: { orderBy: { orderIndex: 'asc' } }, owner: true },
    orderBy: { slotNumber: 'asc' }
  });
  const individuals = await prisma.individualRegistration.findMany({
    orderBy: { registeredAt: 'asc' }
  });

  console.log('=== TEAMS ===');
  teams.forEach(t => {
    console.log(`Team: ${t.name} (Slot ${t.slotNumber}), Owner: ${t.owner.name} (${t.owner.email})`);
    t.members.forEach((m, idx) => {
      console.log(`  - #${idx+1} ${m.name} | MSSV: ${m.studentId || 'Chưa có'} | Email: ${m.email} | SĐT: ${m.phone || 'Chưa có'} | Từ cá nhân: ${m.isFromIndividual}`);
    });
  });

  console.log('=== INDIVIDUALS ===');
  individuals.forEach(i => {
    console.log(`  - ${i.name} | MSSV: ${i.studentId} | Email: ${i.email} | SĐT: ${i.phone} | Assigned: ${i.assignedSlot ? 'Đội ' + i.assignedSlot : 'Chờ ghép'}`);
  });
}

run().finally(() => prisma.$disconnect());
