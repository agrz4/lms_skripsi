require('dotenv').config();
const prisma = require('../src/config/db');

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true }
  });
  console.log('--- USER IDs ---');
  console.log(users);
  
  const mk = await prisma.mataKuliah.findMany({
    select: { id: true, kode: true }
  });
  console.log('--- MK IDs ---');
  console.log(mk);
}

main().finally(() => prisma.$disconnect());
