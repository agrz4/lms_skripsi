require('dotenv').config();
const prisma = require('../src/config/db');

async function main() {
  try {
    const jadwal = await prisma.jadwal.create({
      data: {
        mataKuliahId: '561325f5-86fe-4e07-bc0f-d19b27ffc342',
        hari: ['Senin'],
        tglMulai: new Date('2026-05-08'),
        tglSelesai: new Date('2026-05-15'),
        dosenId: 'da56bdd5-c090-4727-98df-ec1279798f91',
        asistenId: 'd0187244-6c07-4373-b093-a2fc4d4db44d'
      }
    });
    console.log('Jadwal berhasil dibuat:', jadwal);
  } catch (error) {
    console.error('Gagal membuat jadwal:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
