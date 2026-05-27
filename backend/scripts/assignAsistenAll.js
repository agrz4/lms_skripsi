require('dotenv').config();
const prisma = require('../src/config/db');

async function main() {
  console.log('🚀 Memulai proses pengaitan asisten ke semua pertemuan...');

  // 1. Cari asisten Budi Asisten
  const asisten = await prisma.user.findFirst({
    where: { email: 'asisten@lms.com' }
  });

  if (!asisten) {
    console.log('❌ Asisten dengan email asisten@lms.com tidak ditemukan.');
    return;
  }

  console.log(`✓ Menemukan asisten: ${asisten.nama} (ID: ${asisten.id})`);

  // 2. Update asistenId untuk semua pertemuan di database
  const result = await prisma.pertemuan.updateMany({
    data: {
      asistenId: asisten.id
    }
  });

  console.log(`✓ Berhasil mengaitkan asisten ke ${result.count} pertemuan.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
