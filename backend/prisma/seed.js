const prisma = require('../src/config/db');
const bcrypt = require('bcryptjs');

async function main() {
  const password = await bcrypt.hash('password123', 10);
  const adminPassword = await bcrypt.hash('admin123', 10);

  console.log('Sedang membersihkan database...');
  // Opsional: Hapus data lama jika ingin benar-benar bersih
  // await prisma.user.deleteMany();
  // await prisma.mataKuliah.deleteMany();

  console.log('Sedang memasukkan data seed...');

  // 1. Seed Mata Kuliah
  const mk1 = await prisma.mataKuliah.upsert({
    where: { kode: 'MK001' },
    update: {},
    create: { nama: 'Dasar Pemrograman Web', kode: 'MK001' },
  });

  const mk2 = await prisma.mataKuliah.upsert({
    where: { kode: 'MK002' },
    update: {},
    create: { nama: 'UI/UX Design', kode: 'MK002' },
  });

  // 2. Seed Users untuk setiap Role
  // Admin
  await prisma.user.upsert({
    where: { email: 'admin@lms.com' },
    update: {},
    create: {
      email: 'admin@lms.com',
      nama: 'Super Admin',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  // Pengajar (Dosen)
  await prisma.user.upsert({
    where: { email: 'dosen@lms.com' },
    update: {},
    create: {
      email: 'dosen@lms.com',
      nama: 'Dr. Ahmad Dosen',
      password: password,
      role: 'DOSEN',
    },
  });

  // Asisten (Role baru)
  await prisma.user.upsert({
    where: { email: 'asisten@lms.com' },
    update: {},
    create: {
      email: 'asisten@lms.com',
      nama: 'Budi Asisten',
      password: password,
      role: 'ASISTEN',
    },
  });

  // Mahasiswa
  await prisma.user.upsert({
    where: { email: 'mhs@lms.com' },
    update: {},
    create: {
      email: 'mhs@lms.com',
      nama: 'Rizky Mahasiswa',
      password: password,
      role: 'MAHASISWA',
    },
  });

  console.log('Seed data berhasil dimasukkan!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
