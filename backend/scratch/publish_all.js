require('dotenv').config();
const prisma = require('../src/config/db');

async function main() {
  const updated = await prisma.mataKuliah.updateMany({
    data: { published: true }
  });
  console.log('--- UPDATED COURSES ---');
  console.log(updated);
}

main().finally(() => prisma.$disconnect());
