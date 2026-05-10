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

  // 1. Seed Users untuk setiap Role
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
  const dosen = await prisma.user.upsert({
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
  const mhs = await prisma.user.upsert({
    where: { email: 'mhs@lms.com' },
    update: {},
    create: {
      email: 'mhs@lms.com',
      nama: 'Rizky Mahasiswa',
      password: password,
      role: 'MAHASISWA',
    },
  });

  // 2. Seed Mata Kuliah
  const mk1 = await prisma.mataKuliah.upsert({
    where: { kode: 'MK001' },
    update: {},
    create: { 
      nama: 'Dasar Pemrograman Web', 
      kode: 'MK001',
      published: true,
      deskripsi: 'Mempelajari dasar-dasar HTML, CSS, dan Javascript.',
      kapasitas: 30,
      kategori: 'Programming',
      statusPendaftaran: 'Aktif',
      tipeKursus: 'ONLINE',
      pengajarId: dosen.id
    },
  });

  const mk2 = await prisma.mataKuliah.upsert({
    where: { kode: 'MK002' },
    update: {},
    create: { 
      nama: 'UI/UX Design', 
      kode: 'MK002',
      published: true,
      deskripsi: 'Mempelajari prinsip dasar desain antarmuka dan pengalaman pengguna.',
      kapasitas: 25,
      kategori: 'Design',
      statusPendaftaran: 'Segera',
      tipeKursus: 'HYBRID',
      pengajarId: dosen.id
    },
  });

  // 3. Seed Pendaftaran
  await prisma.pendaftaran.upsert({
    where: { 
      userId_mataKuliahId: { userId: mhs.id, mataKuliahId: mk1.id }
    },
    update: {},
    create: { userId: mhs.id, mataKuliahId: mk1.id },
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
