require('dotenv').config();
const prisma = require('../src/config/db');

async function main() {
  const published = await prisma.mataKuliah.findMany({
    where: { published: true }
  });
  console.log('--- PUBLISHED COURSES ---');
  console.log(published);
}

main().finally(() => prisma.$disconnect());
