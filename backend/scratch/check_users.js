require('dotenv').config();
const prisma = require('../src/config/db');

async function main() {
  try {
    const users = await prisma.user.findMany({
      select: {
        email: true,
        nama: true,
        role: true
      }
    });
    console.log('--- DAFTAR PENGGUNA DI DATABASE ---');
    console.table(users);
    console.log('------------------------------------');
  } catch (error) {
    console.error('Gagal mengambil data user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
